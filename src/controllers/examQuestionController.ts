import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Exam } from "../entities/exam";
import { ExamQuestion } from "../entities/exam-question";
import { Question } from "../entities/question";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  buildPagination,
  paginateArray,
  parseIdQuery,
  parsePaginationQuery,
} from "../utils/pagination";

const toInt = (value: unknown, fallback: number) => {
  if (typeof value === "number") return Math.trunc(value);
  if (typeof value === "string" && value.trim().length > 0) return Math.trunc(Number(value));
  return fallback;
};

const ensureRefs = async (examId: string, questionId: string): Promise<string | null> => {
  const examRepo = AppDataSource.getRepository(Exam);
  const questionRepo = AppDataSource.getRepository(Question);

  const exam = await examRepo.findOne({ where: { id: examId } });
  if (!exam) return "Invalid examId";

  const question = await questionRepo.findOne({ where: { id: questionId } });
  if (!question) return "Invalid questionId";

  if (question.instituteId !== exam.instituteId) return "Question institute does not match exam institute";
  if (question.levelId !== exam.levelId) return "Question level does not match exam level";
  if (question.subjectId !== exam.subjectId) return "Question subject does not match exam subject";

  return null;
};

export const createExamQuestion = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(ExamQuestion);
    const { examId, questionId, sortOrder } = req.body as {
      examId: string;
      questionId: string;
      sortOrder?: unknown;
    };

    const refError = await ensureRefs(examId, questionId);
    if (refError) return res.status(400).json({ success: false, error: refError });

    const existing = await repo.findOne({ where: { examId, questionId } });
    if (existing) return res.status(409).json({ success: false, error: "Question already attached to exam" });

    const item = repo.create({
      examId,
      questionId,
      sortOrder: toInt(sortOrder, 0),
      createdBy: actorId,
      updatedBy: actorId,
    });
    const saved = await repo.save(item);
    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to create exam question" });
  }
};

export const getExamQuestions = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePaginationQuery(req);
    const examId = parseIdQuery(req.query.examId);
    const questionId = parseIdQuery(req.query.questionId);

    const repo = AppDataSource.getRepository(ExamQuestion);
    const items = await repo.find({ relations: { exam: true, question: true }, order: { id: "ASC" } });
    const filtered = items.filter((item) => {
      if (item.isDeleted) return false;
      if (examId && item.examId !== examId) return false;
      if (questionId && item.questionId !== questionId) return false;
      return true;
    });

    const total = filtered.length;
    const data = paginateArray(filtered, skip, limit);
    return res.json({ success: true, data, pagination: buildPagination(page, limit, total) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch exam questions" });
  }
};

export const getExamQuestionById = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(ExamQuestion);
    const item = await repo.findOne({ where: { id: req.params.id }, relations: { exam: true, question: true } });
    if (!item) return res.status(404).json({ success: false, error: "Exam question not found" });
    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch exam question" });
  }
};

export const updateExamQuestion = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(ExamQuestion);
    const item = await repo.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: "Exam question not found" });

    const { examId, questionId, sortOrder } = req.body as {
      examId?: string;
      questionId?: string;
      sortOrder?: unknown;
    };

    const nextExamId = examId ?? item.examId;
    const nextQuestionId = questionId ?? item.questionId;

    const refError = await ensureRefs(nextExamId, nextQuestionId);
    if (refError) return res.status(400).json({ success: false, error: refError });

    const conflict = await repo.findOne({ where: { examId: nextExamId, questionId: nextQuestionId } });
    if (conflict && conflict.id !== item.id) {
      return res.status(409).json({ success: false, error: "Question already attached to exam" });
    }

    item.examId = nextExamId;
    item.questionId = nextQuestionId;
    if (sortOrder !== undefined) item.sortOrder = toInt(sortOrder, item.sortOrder);
    item.updatedBy = actorId;

    const saved = await repo.save(item);
    return res.json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update exam question" });
  }
};

export const deleteExamQuestion = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(ExamQuestion);
    const item = await repo.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: "Exam question not found" });

    item.isDeleted = true;
    item.isActive = false;
    item.updatedBy = actorId;
    await repo.save(item);
    return res.json({ success: true, message: "Exam question deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete exam question" });
  }
};
