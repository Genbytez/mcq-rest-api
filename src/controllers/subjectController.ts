import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Subject } from "../entities/subject";
import { Institute } from "../entities/institute";
import { Department } from "../entities/department";
import { Level } from "../entities/level";
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

export const createSubject = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const subjectRepo = AppDataSource.getRepository(Subject);
    const instituteRepo = AppDataSource.getRepository(Institute);
    const departmentRepo = AppDataSource.getRepository(Department);
    const levelRepo = AppDataSource.getRepository(Level);

    const { instituteId, departmentId, levelId, name, description, isActive } = req.body as {
      instituteId: string;
      departmentId: string;
      levelId: string;
      name: string;
      description?: string | null;
      isActive?: unknown;
    };

    const institute = await instituteRepo.findOne({ where: { id: instituteId } });
    if (!institute) {
      return res.status(400).json({ success: false, error: "Invalid instituteId" });
    }

    const department = await departmentRepo.findOne({ where: { id: departmentId } });
    if (!department) {
      return res.status(400).json({ success: false, error: "Invalid departmentId" });
    }

    if (department.instituteId !== instituteId) {
      return res.status(400).json({ success: false, error: "Department does not belong to institute" });
    }

    const level = await levelRepo.findOne({ where: { id: levelId } });
    if (!level) {
      return res.status(400).json({ success: false, error: "Invalid levelId" });
    }

    if (level.instituteId !== instituteId) {
      return res.status(400).json({ success: false, error: "Level does not belong to institute" });
    }

    const subject = subjectRepo.create({
      instituteId,
      departmentId,
      levelId,
      name,
      description: description ?? null,
      isActive: toBoolean(isActive, true),
      createdBy: actorId,
      updatedBy: actorId,
    });

    const saved = await subjectRepo.save(subject);
    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to create subject" });
  }
};

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip, q } = parsePaginationQuery(req);
    const instituteId = parseIdQuery(req.query.instituteId);
    const departmentId = parseIdQuery(req.query.departmentId);
    const levelId = parseIdQuery(req.query.levelId);
    const isActive = parseBooleanQuery(req.query.isActive);
    const subjectRepo = AppDataSource.getRepository(Subject);
    const subjects = await subjectRepo.find({
      relations: { institute: true, department: true, level: true },
      order: { id: "ASC" },
    });
    const search = q?.toLowerCase();

    const filtered = subjects.filter((subject) => {
      if (subject.isDeleted) return false;
      if (instituteId && subject.instituteId !== instituteId) return false;
      if (departmentId && subject.departmentId !== departmentId) return false;
      if (levelId && subject.levelId !== levelId) return false;
      if (isActive !== undefined && subject.isActive !== isActive) return false;

      if (search) {
        return (
          subject.name.toLowerCase().includes(search) ||
          (subject.description ?? "").toLowerCase().includes(search)
        );
      }

      return true;
    });

    const total = filtered.length;
    const data = paginateArray(filtered, skip, limit);
    return res.json({ success: true, data, pagination: buildPagination(page, limit, total) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch subjects" });
  }
};

export const getSubjectById = async (req: Request, res: Response) => {
  try {
    const subjectRepo = AppDataSource.getRepository(Subject);
    const subject = await subjectRepo.findOne({
      where: { id: req.params.id },
      relations: { institute: true, department: true, level: true },
    });

    if (!subject) {
      return res.status(404).json({ success: false, error: "Subject not found" });
    }

    return res.json({ success: true, data: subject });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch subject" });
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const subjectRepo = AppDataSource.getRepository(Subject);
    const instituteRepo = AppDataSource.getRepository(Institute);
    const departmentRepo = AppDataSource.getRepository(Department);
    const levelRepo = AppDataSource.getRepository(Level);

    const subject = await subjectRepo.findOne({ where: { id: req.params.id } });
    if (!subject) {
      return res.status(404).json({ success: false, error: "Subject not found" });
    }

    const { instituteId, departmentId, levelId, name, description, isActive } = req.body as {
      instituteId?: string;
      departmentId?: string;
      levelId?: string;
      name?: string;
      description?: string | null;
      isActive?: unknown;
    };

    const nextInstituteId = instituteId ?? subject.instituteId;
    const nextDepartmentId = departmentId ?? subject.departmentId;
    const nextLevelId = levelId ?? subject.levelId;

    if (instituteId !== undefined) {
      const institute = await instituteRepo.findOne({ where: { id: instituteId } });
      if (!institute) {
        return res.status(400).json({ success: false, error: "Invalid instituteId" });
      }
      subject.instituteId = instituteId;
    }

    if (departmentId !== undefined) {
      const department = await departmentRepo.findOne({ where: { id: departmentId } });
      if (!department) {
        return res.status(400).json({ success: false, error: "Invalid departmentId" });
      }
      subject.departmentId = departmentId;
    }

    if (levelId !== undefined) {
      const level = await levelRepo.findOne({ where: { id: levelId } });
      if (!level) {
        return res.status(400).json({ success: false, error: "Invalid levelId" });
      }
      subject.levelId = levelId;
    }

    if (nextDepartmentId) {
      const department = await departmentRepo.findOne({ where: { id: nextDepartmentId } });
      if (!department || department.instituteId !== nextInstituteId) {
        return res.status(400).json({ success: false, error: "Department does not belong to institute" });
      }
    }

    const level = await levelRepo.findOne({ where: { id: nextLevelId } });
    if (!level || level.instituteId !== nextInstituteId) {
      return res.status(400).json({ success: false, error: "Level does not belong to institute" });
    }

    if (name !== undefined) {
      subject.name = name;
    }

    if (description !== undefined) {
      subject.description = description ?? null;
    }

    if (isActive !== undefined) {
      subject.isActive = toBoolean(isActive, subject.isActive);
    }
    subject.updatedBy = actorId;

    const saved = await subjectRepo.save(subject);
    return res.json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update subject" });
  }
};

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const subjectRepo = AppDataSource.getRepository(Subject);
    const subject = await subjectRepo.findOne({ where: { id: req.params.id } });

    if (!subject) {
      return res.status(404).json({ success: false, error: "Subject not found" });
    }

    subject.isDeleted = true;
    subject.isActive = false;
    subject.updatedBy = actorId;
    await subjectRepo.save(subject);
    return res.json({ success: true, message: "Subject deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete subject" });
  }
};
