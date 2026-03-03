import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { ExamStatus } from "../entities/enums";
import { Exam } from "../entities/exam";
import { Institute } from "../entities/institute";
import { Level } from "../entities/level";
import { Subject } from "../entities/subject";
import { UserAccount } from "../entities/users";
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

const ensureRefs = async (
  instituteId: string,
  levelId: string,
  subjectId: string,
  createdBy?: string | null
): Promise<string | null> => {
  const instituteRepo = AppDataSource.getRepository(Institute);
  const levelRepo = AppDataSource.getRepository(Level);
  const subjectRepo = AppDataSource.getRepository(Subject);
  const userRepo = AppDataSource.getRepository(UserAccount);

  const institute = await instituteRepo.findOne({ where: { id: instituteId } });
  if (!institute) return "Invalid instituteId";

  const level = await levelRepo.findOne({ where: { id: levelId } });
  if (!level) return "Invalid levelId";
  if (level.instituteId !== instituteId) return "Level does not belong to institute";

  const subject = await subjectRepo.findOne({ where: { id: subjectId } });
  if (!subject) return "Invalid subjectId";
  if (subject.instituteId !== instituteId || subject.levelId !== levelId) {
    return "Subject does not belong to institute/level";
  }

  if (createdBy) {
    const creator = await userRepo.findOne({ where: { id: createdBy } });
    if (!creator) return "Invalid createdBy";
    if (creator.instituteId !== instituteId) return "Creator does not belong to institute";
  }

  return null;
};

export const createExam = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(Exam);
    const body = req.body as Record<string, unknown>;

    const instituteId = String(body.instituteId);
    const levelId = String(body.levelId);
    const subjectId = String(body.subjectId);
    const createdBy = actorId;

    const refError = await ensureRefs(instituteId, levelId, subjectId, createdBy);
    if (refError) return res.status(400).json({ success: false, error: refError });

    const startAt = new Date(String(body.startAt));
    const endAt = new Date(String(body.endAt));
    if (startAt.getTime() >= endAt.getTime()) {
      return res.status(400).json({ success: false, error: "startAt must be before endAt" });
    }

    const exam = repo.create({
      instituteId,
      title: String(body.title),
      description: body.description === undefined ? null : (body.description as string | null),
      subjectId,
      levelId,
      noOfQuestions: toInt(body.noOfQuestions, 0),
      durationMinutes: toInt(body.durationMinutes, 60),
      attemptsEnabled: toBoolean(body.attemptsEnabled, true),
      maxAttempts: toInt(body.maxAttempts, 1),
      negativeMark: toDecimalString(body.negativeMark, "0.00"),
      practiceWarningOnSubmit:
        body.practiceWarningOnSubmit === undefined ? null : (body.practiceWarningOnSubmit as string | null),
      amount: toDecimalString(body.amount, "0.00"),
      isPaid: toBoolean(body.isPaid, false),
      startAt,
      endAt,
      status: (body.status as ExamStatus) ?? ExamStatus.DRAFT,
      shuffleQuestions: toBoolean(body.shuffleQuestions, true),
      shuffleOptions: toBoolean(body.shuffleOptions, true),
      createdBy,
      updatedBy: actorId,
    });

    const saved = await repo.save(exam);
    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to create exam" });
  }
};

export const getExams = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip, q } = parsePaginationQuery(req);
    const instituteId = parseIdQuery(req.query.instituteId);
    const levelId = parseIdQuery(req.query.levelId);
    const subjectId = parseIdQuery(req.query.subjectId);
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const isPaid = parseBooleanQuery(req.query.isPaid);
    const attemptsEnabled = parseBooleanQuery(req.query.attemptsEnabled);

    const repo = AppDataSource.getRepository(Exam);
    const items = await repo.find({
      relations: { institute: true, level: true, subject: true, creator: true, examQuestions: true, attempts: true },
      order: { id: "ASC" },
    });
    const search = q?.toLowerCase();
    const filtered = items.filter((item) => {
      if (item.isDeleted) return false;
      if (instituteId && item.instituteId !== instituteId) return false;
      if (levelId && item.levelId !== levelId) return false;
      if (subjectId && item.subjectId !== subjectId) return false;
      if (status && item.status !== status) return false;
      if (isPaid !== undefined && item.isPaid !== isPaid) return false;
      if (attemptsEnabled !== undefined && item.attemptsEnabled !== attemptsEnabled) return false;

      if (search) {
        return (
          item.title.toLowerCase().includes(search) ||
          (item.description ?? "").toLowerCase().includes(search)
        );
      }

      return true;
    });

    const total = filtered.length;
    const data = paginateArray(filtered, skip, limit);
    return res.json({ success: true, data, pagination: buildPagination(page, limit, total) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch exams" });
  }
};

export const getExamById = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Exam);
    const item = await repo.findOne({
      where: { id: req.params.id },
      relations: { institute: true, level: true, subject: true, creator: true, examQuestions: true, attempts: true },
    });
    if (!item) return res.status(404).json({ success: false, error: "Exam not found" });
    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch exam" });
  }
};

export const updateExam = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(Exam);
    const item = await repo.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: "Exam not found" });

    const body = req.body as Record<string, unknown>;

    const nextInstituteId = body.instituteId !== undefined ? String(body.instituteId) : item.instituteId;
    const nextLevelId = body.levelId !== undefined ? String(body.levelId) : item.levelId;
    const nextSubjectId = body.subjectId !== undefined ? String(body.subjectId) : item.subjectId;
    const nextCreatedBy = item.createdBy;

    const refError = await ensureRefs(nextInstituteId, nextLevelId, nextSubjectId, nextCreatedBy);
    if (refError) return res.status(400).json({ success: false, error: refError });

    const nextStartAt = body.startAt !== undefined ? new Date(String(body.startAt)) : item.startAt;
    const nextEndAt = body.endAt !== undefined ? new Date(String(body.endAt)) : item.endAt;

    if (nextStartAt.getTime() >= nextEndAt.getTime()) {
      return res.status(400).json({ success: false, error: "startAt must be before endAt" });
    }

    item.instituteId = nextInstituteId;
    item.levelId = nextLevelId;
    item.subjectId = nextSubjectId;
    item.createdBy = nextCreatedBy;
    item.updatedBy = actorId;

    if (body.title !== undefined) item.title = String(body.title);
    if (body.description !== undefined) item.description = body.description as string | null;
    if (body.noOfQuestions !== undefined) item.noOfQuestions = toInt(body.noOfQuestions, item.noOfQuestions);
    if (body.durationMinutes !== undefined) item.durationMinutes = toInt(body.durationMinutes, item.durationMinutes);
    if (body.attemptsEnabled !== undefined) item.attemptsEnabled = toBoolean(body.attemptsEnabled, item.attemptsEnabled);
    if (body.maxAttempts !== undefined) item.maxAttempts = toInt(body.maxAttempts, item.maxAttempts);
    if (body.negativeMark !== undefined) item.negativeMark = toDecimalString(body.negativeMark, item.negativeMark);
    if (body.practiceWarningOnSubmit !== undefined) item.practiceWarningOnSubmit = body.practiceWarningOnSubmit as string | null;
    if (body.amount !== undefined) item.amount = toDecimalString(body.amount, item.amount);
    if (body.isPaid !== undefined) item.isPaid = toBoolean(body.isPaid, item.isPaid);
    if (body.startAt !== undefined) item.startAt = nextStartAt;
    if (body.endAt !== undefined) item.endAt = nextEndAt;
    if (body.status !== undefined) item.status = body.status as ExamStatus;
    if (body.shuffleQuestions !== undefined) item.shuffleQuestions = toBoolean(body.shuffleQuestions, item.shuffleQuestions);
    if (body.shuffleOptions !== undefined) item.shuffleOptions = toBoolean(body.shuffleOptions, item.shuffleOptions);

    const saved = await repo.save(item);
    return res.json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update exam" });
  }
};

export const deleteExam = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(Exam);
    const item = await repo.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: "Exam not found" });

    item.isDeleted = true;
    item.isActive = false;
    item.updatedBy = actorId;
    await repo.save(item);
    return res.json({ success: true, message: "Exam deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete exam" });
  }
};
