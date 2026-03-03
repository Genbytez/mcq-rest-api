import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Chapter } from "../entities/chapter";
import { Institute } from "../entities/institute";
import { Subject } from "../entities/subject";
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

const ensureLinks = async (instituteId: string, subjectId: string): Promise<string | null> => {
  const instituteRepo = AppDataSource.getRepository(Institute);
  const subjectRepo = AppDataSource.getRepository(Subject);

  const institute = await instituteRepo.findOne({ where: { id: instituteId } });
  if (!institute) return "Invalid instituteId";

  const subject = await subjectRepo.findOne({ where: { id: subjectId } });
  if (!subject) return "Invalid subjectId";
  if (subject.instituteId !== instituteId) return "Subject does not belong to institute";

  return null;
};

export const createChapter = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(Chapter);
    const { instituteId, subjectId, name, sortOrder, isActive } = req.body as {
      instituteId: string;
      subjectId: string;
      name: string;
      sortOrder?: unknown;
      isActive?: unknown;
    };

    const error = await ensureLinks(instituteId, subjectId);
    if (error) return res.status(400).json({ success: false, error });

    const chapter = repo.create({
      instituteId,
      subjectId,
      name,
      sortOrder: toInt(sortOrder, 0),
      isActive: toBoolean(isActive, true),
      createdBy: actorId,
      updatedBy: actorId,
    });

    const saved = await repo.save(chapter);
    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to create chapter" });
  }
};

export const getChapters = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip, q } = parsePaginationQuery(req);
    const instituteId = parseIdQuery(req.query.instituteId);
    const subjectId = parseIdQuery(req.query.subjectId);
    const isActive = parseBooleanQuery(req.query.isActive);

    const repo = AppDataSource.getRepository(Chapter);
    const items = await repo.find({
      relations: { institute: true, subject: true },
      order: { id: "ASC" },
    });
    const search = q?.toLowerCase();
    const filtered = items.filter((item) => {
      if (item.isDeleted) return false;
      if (instituteId && item.instituteId !== instituteId) return false;
      if (subjectId && item.subjectId !== subjectId) return false;
      if (isActive !== undefined && item.isActive !== isActive) return false;

      if (search) {
        return item.name.toLowerCase().includes(search);
      }

      return true;
    });

    const total = filtered.length;
    const data = paginateArray(filtered, skip, limit);
    return res.json({ success: true, data, pagination: buildPagination(page, limit, total) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch chapters" });
  }
};

export const getChapterById = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Chapter);
    const item = await repo.findOne({
      where: { id: req.params.id },
      relations: { institute: true, subject: true },
    });
    if (!item) return res.status(404).json({ success: false, error: "Chapter not found" });
    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch chapter" });
  }
};

export const updateChapter = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(Chapter);
    const item = await repo.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: "Chapter not found" });

    const { instituteId, subjectId, name, sortOrder, isActive } = req.body as {
      instituteId?: string;
      subjectId?: string;
      name?: string;
      sortOrder?: unknown;
      isActive?: unknown;
    };

    const nextInstituteId = instituteId ?? item.instituteId;
    const nextSubjectId = subjectId ?? item.subjectId;

    const error = await ensureLinks(nextInstituteId, nextSubjectId);
    if (error) return res.status(400).json({ success: false, error });

    item.instituteId = nextInstituteId;
    item.subjectId = nextSubjectId;
    if (name !== undefined) item.name = name;
    if (sortOrder !== undefined) item.sortOrder = toInt(sortOrder, item.sortOrder);
    if (isActive !== undefined) item.isActive = toBoolean(isActive, item.isActive);
    item.updatedBy = actorId;

    const saved = await repo.save(item);
    return res.json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update chapter" });
  }
};

export const deleteChapter = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(Chapter);
    const item = await repo.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: "Chapter not found" });

    item.isDeleted = true;
    item.isActive = false;
    item.updatedBy = actorId;
    await repo.save(item);
    return res.json({ success: true, message: "Chapter deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete chapter" });
  }
};
