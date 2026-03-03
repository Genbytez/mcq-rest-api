import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Level } from "../entities/level";
import { Institute } from "../entities/institute";
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

export const createLevel = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const levelRepo = AppDataSource.getRepository(Level);
    const instituteRepo = AppDataSource.getRepository(Institute);

    const { instituteId, name, description, isActive } = req.body as {
      instituteId: string;
      name: string;
      description?: string | null;
      isActive?: unknown;
    };

    const institute = await instituteRepo.findOne({ where: { id: instituteId } });
    if (!institute) {
      return res.status(400).json({ success: false, error: "Invalid instituteId" });
    }

    const level = levelRepo.create({
      instituteId,
      name,
      description: description ?? null,
      isActive: toBoolean(isActive, true),
      createdBy: actorId,
      updatedBy: actorId,
    });

    const saved = await levelRepo.save(level);
    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to create level" });
  }
};

export const getLevels = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip, q } = parsePaginationQuery(req);
    const instituteId = parseIdQuery(req.query.instituteId);
    const isActive = parseBooleanQuery(req.query.isActive);
    const levelRepo = AppDataSource.getRepository(Level);
    const levels = await levelRepo.find({ relations: { institute: true }, order: { id: "ASC" } });
    const search = q?.toLowerCase();

    const filtered = levels.filter((level) => {
      if (level.isDeleted) return false;
      if (instituteId && level.instituteId !== instituteId) return false;
      if (isActive !== undefined && level.isActive !== isActive) return false;

      if (search) {
        return (
          level.name.toLowerCase().includes(search) ||
          (level.description ?? "").toLowerCase().includes(search)
        );
      }

      return true;
    });

    const total = filtered.length;
    const data = paginateArray(filtered, skip, limit);
    return res.json({ success: true, data, pagination: buildPagination(page, limit, total) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch levels" });
  }
};

export const getLevelById = async (req: Request, res: Response) => {
  try {
    const levelRepo = AppDataSource.getRepository(Level);
    const level = await levelRepo.findOne({
      where: { id: req.params.id },
      relations: { institute: true },
    });

    if (!level) {
      return res.status(404).json({ success: false, error: "Level not found" });
    }

    return res.json({ success: true, data: level });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch level" });
  }
};

export const updateLevel = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const levelRepo = AppDataSource.getRepository(Level);
    const instituteRepo = AppDataSource.getRepository(Institute);

    const level = await levelRepo.findOne({ where: { id: req.params.id } });
    if (!level) {
      return res.status(404).json({ success: false, error: "Level not found" });
    }

    const { instituteId, name, description, isActive } = req.body as {
      instituteId?: string;
      name?: string;
      description?: string | null;
      isActive?: unknown;
    };

    if (instituteId !== undefined) {
      const institute = await instituteRepo.findOne({ where: { id: instituteId } });
      if (!institute) {
        return res.status(400).json({ success: false, error: "Invalid instituteId" });
      }
      level.instituteId = instituteId;
    }

    if (name !== undefined) {
      level.name = name;
    }

    if (description !== undefined) {
      level.description = description ?? null;
    }

    if (isActive !== undefined) {
      level.isActive = toBoolean(isActive, level.isActive);
    }
    level.updatedBy = actorId;

    const saved = await levelRepo.save(level);
    return res.json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update level" });
  }
};

export const deleteLevel = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const levelRepo = AppDataSource.getRepository(Level);
    const level = await levelRepo.findOne({ where: { id: req.params.id } });

    if (!level) {
      return res.status(404).json({ success: false, error: "Level not found" });
    }

    level.isDeleted = true;
    level.isActive = false;
    level.updatedBy = actorId;
    await levelRepo.save(level);
    return res.json({ success: true, message: "Level deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete level" });
  }
};
