import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { AttemptStatus } from "../entities/enums";
import { Exam } from "../entities/exam";
import { ExamAttempt } from "../entities/exam-attempt";
import { UserAccount } from "../entities/users";
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

const toDecimalString = (value: unknown, fallback: string) => {
  if (typeof value === "number") return value.toString();
  if (typeof value === "string" && value.trim().length > 0) return value;
  return fallback;
};

const ensureRefs = async (examId: string, studentId: string): Promise<string | null> => {
  const examRepo = AppDataSource.getRepository(Exam);
  const userRepo = AppDataSource.getRepository(UserAccount);

  const exam = await examRepo.findOne({ where: { id: examId } });
  if (!exam) return "Invalid examId";

  const student = await userRepo.findOne({ where: { id: studentId } });
  if (!student) return "Invalid studentId";

  if (student.instituteId !== exam.instituteId) return "Student institute does not match exam institute";

  return null;
};

const toDateOrNull = (value: unknown, fallback: Date | null): Date | null => {
  if (value === undefined) return fallback;
  if (value === null) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? fallback : date;
};

export const createExamAttempt = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(ExamAttempt);
    const {
      examId,
      studentId,
      attemptNo,
      startedAt,
      submittedAt,
      status,
      score,
      maxScore,
      correctCount,
      wrongCount,
      skippedCount,
    } = req.body as Record<string, unknown>;

    const eId = String(examId);
    const sId = String(studentId);

    const refError = await ensureRefs(eId, sId);
    if (refError) return res.status(400).json({ success: false, error: refError });

    const no = toInt(attemptNo, 1);
    const existing = await repo.findOne({ where: { examId: eId, studentId: sId, attemptNo: no } });
    if (existing) return res.status(409).json({ success: false, error: "Attempt number already exists for exam/student" });

    const item = repo.create({
      examId: eId,
      studentId: sId,
      attemptNo: no,
      startedAt: toDateOrNull(startedAt, null),
      submittedAt: toDateOrNull(submittedAt, null),
      status: (status as AttemptStatus) ?? AttemptStatus.NOT_STARTED,
      score: toDecimalString(score, "0.00"),
      maxScore: toDecimalString(maxScore, "0.00"),
      correctCount: toInt(correctCount, 0),
      wrongCount: toInt(wrongCount, 0),
      skippedCount: toInt(skippedCount, 0),
      createdBy: actorId,
      updatedBy: actorId,
    });

    const saved = await repo.save(item);
    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to create exam attempt" });
  }
};

export const getExamAttempts = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePaginationQuery(req);
    const examId = parseIdQuery(req.query.examId);
    const studentId = parseIdQuery(req.query.studentId);
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const attemptNo = typeof req.query.attemptNo === "string" ? Number(req.query.attemptNo) : undefined;

    const repo = AppDataSource.getRepository(ExamAttempt);
    const items = await repo.find({ relations: { exam: true, student: true, answers: true }, order: { id: "ASC" } });
    const filtered = items.filter((item) => {
      if (item.isDeleted) return false;
      if (examId && item.examId !== examId) return false;
      if (studentId && item.studentId !== studentId) return false;
      if (status && item.status !== status) return false;
      if (attemptNo !== undefined && Number.isFinite(attemptNo) && item.attemptNo !== attemptNo) return false;
      return true;
    });

    const total = filtered.length;
    const data = paginateArray(filtered, skip, limit);
    return res.json({ success: true, data, pagination: buildPagination(page, limit, total) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch exam attempts" });
  }
};

export const getExamAttemptById = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(ExamAttempt);
    const item = await repo.findOne({
      where: { id: req.params.id },
      relations: { exam: true, student: true, answers: true },
    });
    if (!item) return res.status(404).json({ success: false, error: "Exam attempt not found" });
    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch exam attempt" });
  }
};

export const updateExamAttempt = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(ExamAttempt);
    const item = await repo.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: "Exam attempt not found" });

    const body = req.body as Record<string, unknown>;

    const nextExamId = body.examId !== undefined ? String(body.examId) : item.examId;
    const nextStudentId = body.studentId !== undefined ? String(body.studentId) : item.studentId;
    const nextAttemptNo = body.attemptNo !== undefined ? toInt(body.attemptNo, item.attemptNo) : item.attemptNo;

    const refError = await ensureRefs(nextExamId, nextStudentId);
    if (refError) return res.status(400).json({ success: false, error: refError });

    const conflict = await repo.findOne({ where: { examId: nextExamId, studentId: nextStudentId, attemptNo: nextAttemptNo } });
    if (conflict && conflict.id !== item.id) {
      return res.status(409).json({ success: false, error: "Attempt number already exists for exam/student" });
    }

    item.examId = nextExamId;
    item.studentId = nextStudentId;
    item.attemptNo = nextAttemptNo;

    if (body.startedAt !== undefined) item.startedAt = toDateOrNull(body.startedAt, item.startedAt);
    if (body.submittedAt !== undefined) item.submittedAt = toDateOrNull(body.submittedAt, item.submittedAt);
    if (body.status !== undefined) item.status = body.status as AttemptStatus;
    if (body.score !== undefined) item.score = toDecimalString(body.score, item.score);
    if (body.maxScore !== undefined) item.maxScore = toDecimalString(body.maxScore, item.maxScore);
    if (body.correctCount !== undefined) item.correctCount = toInt(body.correctCount, item.correctCount);
    if (body.wrongCount !== undefined) item.wrongCount = toInt(body.wrongCount, item.wrongCount);
    if (body.skippedCount !== undefined) item.skippedCount = toInt(body.skippedCount, item.skippedCount);
    item.updatedBy = actorId;

    const saved = await repo.save(item);
    return res.json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update exam attempt" });
  }
};

export const deleteExamAttempt = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(ExamAttempt);
    const item = await repo.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: "Exam attempt not found" });

    item.isDeleted = true;
    item.isActive = false;
    item.updatedBy = actorId;
    await repo.save(item);
    return res.json({ success: true, message: "Exam attempt deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete exam attempt" });
  }
};
