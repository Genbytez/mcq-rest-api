import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Question } from "../entities/question";
import { QuestionOption } from "../entities/question-option";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  buildPagination,
  paginateArray,
  parseBooleanQuery,
  parseIdQuery,
  parsePaginationQuery,
} from "../utils/pagination";

const toBoolean = (value: unknown, fallback: boolean) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;
  return fallback;
};

const checkQuestion = async (questionId: string): Promise<boolean> => {
  const questionRepo = AppDataSource.getRepository(Question);
  const question = await questionRepo.findOne({ where: { id: questionId } });
  return !!question;
};

export const createQuestionOption = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(QuestionOption);
    const { questionId, optionKey, optionText, optionImageBase64, optionImageMime, isCorrect } = req.body as {
      questionId: string;
      optionKey: "A" | "B" | "C" | "D";
      optionText?: string | null;
      optionImageBase64?: string | null;
      optionImageMime?: string | null;
      isCorrect?: unknown;
    };

    const questionExists = await checkQuestion(questionId);
    if (!questionExists) return res.status(400).json({ success: false, error: "Invalid questionId" });

    const existing = await repo.findOne({ where: { questionId, optionKey } });
    if (existing) return res.status(409).json({ success: false, error: "Option key already exists for this question" });

    const item = repo.create({
      questionId,
      optionKey,
      optionText: optionText ?? null,
      optionImageBase64: optionImageBase64 ?? null,
      optionImageMime: optionImageMime ?? null,
      isCorrect: toBoolean(isCorrect, false),
      createdBy: actorId,
      updatedBy: actorId,
    });

    const saved = await repo.save(item);
    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to create question option" });
  }
};

export const getQuestionOptions = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip, q } = parsePaginationQuery(req);
    const questionId = parseIdQuery(req.query.questionId);
    const optionKey = typeof req.query.optionKey === "string" ? req.query.optionKey : undefined;
    const isCorrect = parseBooleanQuery(req.query.isCorrect);

    const repo = AppDataSource.getRepository(QuestionOption);
    const items = await repo.find({ relations: { question: true }, order: { id: "ASC" } });
    const search = q?.toLowerCase();

    const filtered = items.filter((item) => {
      if (item.isDeleted) return false;
      if (questionId && item.questionId !== questionId) return false;
      if (optionKey && item.optionKey !== optionKey) return false;
      if (isCorrect !== undefined && item.isCorrect !== isCorrect) return false;

      if (search) {
        return (item.optionText ?? "").toLowerCase().includes(search);
      }

      return true;
    });

    const total = filtered.length;
    const data = paginateArray(filtered, skip, limit);
    return res.json({ success: true, data, pagination: buildPagination(page, limit, total) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch question options" });
  }
};

export const getQuestionOptionById = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(QuestionOption);
    const item = await repo.findOne({ where: { id: req.params.id }, relations: { question: true } });
    if (!item) return res.status(404).json({ success: false, error: "Question option not found" });
    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch question option" });
  }
};

export const updateQuestionOption = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(QuestionOption);
    const item = await repo.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: "Question option not found" });

    const { questionId, optionKey, optionText, optionImageBase64, optionImageMime, isCorrect } = req.body as {
      questionId?: string;
      optionKey?: "A" | "B" | "C" | "D";
      optionText?: string | null;
      optionImageBase64?: string | null;
      optionImageMime?: string | null;
      isCorrect?: unknown;
    };

    const nextQuestionId = questionId ?? item.questionId;
    const nextOptionKey = optionKey ?? item.optionKey;

    const questionExists = await checkQuestion(nextQuestionId);
    if (!questionExists) return res.status(400).json({ success: false, error: "Invalid questionId" });

    const conflict = await repo.findOne({ where: { questionId: nextQuestionId, optionKey: nextOptionKey } });
    if (conflict && conflict.id !== item.id) {
      return res.status(409).json({ success: false, error: "Option key already exists for this question" });
    }

    item.questionId = nextQuestionId;
    item.optionKey = nextOptionKey;
    if (optionText !== undefined) item.optionText = optionText ?? null;
    if (optionImageBase64 !== undefined) item.optionImageBase64 = optionImageBase64 ?? null;
    if (optionImageMime !== undefined) item.optionImageMime = optionImageMime ?? null;
    if (isCorrect !== undefined) item.isCorrect = toBoolean(isCorrect, item.isCorrect);
    item.updatedBy = actorId;

    const saved = await repo.save(item);
    return res.json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update question option" });
  }
};

export const deleteQuestionOption = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(QuestionOption);
    const item = await repo.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: "Question option not found" });

    item.isDeleted = true;
    item.isActive = false;
    item.updatedBy = actorId;
    await repo.save(item);
    return res.json({ success: true, message: "Question option deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete question option" });
  }
};
