import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { AttemptAnswer } from "../entities/attempt-answer";
import { ExamAttempt } from "../entities/exam-attempt";
import { ExamQuestion } from "../entities/exam-question";
import { Question } from "../entities/question";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  buildPagination,
  paginateArray,
  parseBooleanQuery,
  parseIdQuery,
  parsePaginationQuery,
} from "../utils/pagination";

const toBooleanOrNull = (value: unknown, fallback: boolean | null) => {
  if (value === null) return null;
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;
  return fallback;
};

const toBoolean = (value: unknown, fallback: boolean) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;
  return fallback;
};

const toDecimalString = (value: unknown, fallback: string) => {
  if (typeof value === "number") return value.toString();
  if (typeof value === "string" && value.trim().length > 0) return value;
  return fallback;
};

const toDateOrNull = (value: unknown, fallback: Date | null): Date | null => {
  if (value === undefined) return fallback;
  if (value === null) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? fallback : date;
};

const ensureRefs = async (attemptId: string, questionId: string): Promise<string | null> => {
  const attemptRepo = AppDataSource.getRepository(ExamAttempt);
  const questionRepo = AppDataSource.getRepository(Question);
  const examQuestionRepo = AppDataSource.getRepository(ExamQuestion);

  const attempt = await attemptRepo.findOne({ where: { id: attemptId } });
  if (!attempt) return "Invalid attemptId";

  const question = await questionRepo.findOne({ where: { id: questionId } });
  if (!question) return "Invalid questionId";

  const existsInExam = await examQuestionRepo.findOne({ where: { examId: attempt.examId, questionId } });
  if (!existsInExam) return "Question is not part of this attempt's exam";

  return null;
};

export const createAttemptAnswer = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(AttemptAnswer);
    const {
      attemptId,
      questionId,
      selectedOptionKey,
      isMarkedForReview,
      isCorrect,
      marksAwarded,
      answeredAt,
    } = req.body as Record<string, unknown>;

    const aId = String(attemptId);
    const qId = String(questionId);

    const refError = await ensureRefs(aId, qId);
    if (refError) return res.status(400).json({ success: false, error: refError });

    const existing = await repo.findOne({ where: { attemptId: aId, questionId: qId } });
    if (existing) return res.status(409).json({ success: false, error: "Answer already exists for this question in attempt" });

    const item = repo.create({
      attemptId: aId,
      questionId: qId,
      selectedOptionKey: (selectedOptionKey as "A" | "B" | "C" | "D" | null) ?? null,
      isMarkedForReview: toBoolean(isMarkedForReview, false),
      isCorrect: toBooleanOrNull(isCorrect, null),
      marksAwarded: toDecimalString(marksAwarded, "0.00"),
      answeredAt: toDateOrNull(answeredAt, null),
      createdBy: actorId,
      updatedBy: actorId,
    });

    const saved = await repo.save(item);
    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to create attempt answer" });
  }
};

export const getAttemptAnswers = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePaginationQuery(req);
    const attemptId = parseIdQuery(req.query.attemptId);
    const questionId = parseIdQuery(req.query.questionId);
    const selectedOptionKey = typeof req.query.selectedOptionKey === "string" ? req.query.selectedOptionKey : undefined;
    const isMarkedForReview = parseBooleanQuery(req.query.isMarkedForReview);
    const isCorrect = parseBooleanQuery(req.query.isCorrect);

    const repo = AppDataSource.getRepository(AttemptAnswer);
    const items = await repo.find({ relations: { attempt: true, question: true }, order: { id: "ASC" } });
    const filtered = items.filter((item) => {
      if (item.isDeleted) return false;
      if (attemptId && item.attemptId !== attemptId) return false;
      if (questionId && item.questionId !== questionId) return false;
      if (selectedOptionKey && item.selectedOptionKey !== selectedOptionKey) return false;
      if (isMarkedForReview !== undefined && item.isMarkedForReview !== isMarkedForReview) return false;
      if (isCorrect !== undefined && item.isCorrect !== isCorrect) return false;
      return true;
    });

    const total = filtered.length;
    const data = paginateArray(filtered, skip, limit);
    return res.json({ success: true, data, pagination: buildPagination(page, limit, total) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch attempt answers" });
  }
};

export const getAttemptAnswerById = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(AttemptAnswer);
    const item = await repo.findOne({ where: { id: req.params.id }, relations: { attempt: true, question: true } });
    if (!item) return res.status(404).json({ success: false, error: "Attempt answer not found" });
    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch attempt answer" });
  }
};

export const updateAttemptAnswer = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(AttemptAnswer);
    const item = await repo.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: "Attempt answer not found" });

    const body = req.body as Record<string, unknown>;

    const nextAttemptId = body.attemptId !== undefined ? String(body.attemptId) : item.attemptId;
    const nextQuestionId = body.questionId !== undefined ? String(body.questionId) : item.questionId;

    const refError = await ensureRefs(nextAttemptId, nextQuestionId);
    if (refError) return res.status(400).json({ success: false, error: refError });

    const conflict = await repo.findOne({ where: { attemptId: nextAttemptId, questionId: nextQuestionId } });
    if (conflict && conflict.id !== item.id) {
      return res.status(409).json({ success: false, error: "Answer already exists for this question in attempt" });
    }

    item.attemptId = nextAttemptId;
    item.questionId = nextQuestionId;

    if (body.selectedOptionKey !== undefined) item.selectedOptionKey = (body.selectedOptionKey as "A" | "B" | "C" | "D" | null) ?? null;
    if (body.isMarkedForReview !== undefined) item.isMarkedForReview = toBoolean(body.isMarkedForReview, item.isMarkedForReview);
    if (body.isCorrect !== undefined) item.isCorrect = toBooleanOrNull(body.isCorrect, item.isCorrect);
    if (body.marksAwarded !== undefined) item.marksAwarded = toDecimalString(body.marksAwarded, item.marksAwarded);
    if (body.answeredAt !== undefined) item.answeredAt = toDateOrNull(body.answeredAt, item.answeredAt);
    item.updatedBy = actorId;

    const saved = await repo.save(item);
    return res.json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update attempt answer" });
  }
};

export const deleteAttemptAnswer = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(AttemptAnswer);
    const item = await repo.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: "Attempt answer not found" });

    item.isDeleted = true;
    item.isActive = false;
    item.updatedBy = actorId;
    await repo.save(item);
    return res.json({ success: true, message: "Attempt answer deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete attempt answer" });
  }
};
