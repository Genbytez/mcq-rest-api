import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Department } from "../entities/department";
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

export const createDepartment = async (req: Request, res: Response) => {
    try {
        const actorId = (req as AuthRequest).decoded?.userId ?? null;
        const departmentRepo = AppDataSource.getRepository(Department);
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

        const department = departmentRepo.create({
            instituteId,
            name,
            description: description ?? null,
            isActive: toBoolean(isActive, true),
            createdBy: actorId,
            updatedBy: actorId,
        });

        const saved = await departmentRepo.save(department);
        return res.status(201).json({ success: true, data: saved });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to create department" });
    }
};

export const getDepartments = async (req: Request, res: Response) => {
    try {
        const { page, limit, skip, q } = parsePaginationQuery(req);
        const instituteId = parseIdQuery(req.query.instituteId);
        const isActive = parseBooleanQuery(req.query.isActive);
        const departmentRepo = AppDataSource.getRepository(Department);
        const departments = await departmentRepo.find({ relations: { institute: true }, order: { id: "ASC" } });
        const search = q?.toLowerCase();

        const filtered = departments.filter((department) => {
            if (department.isDeleted) return false;
            if (instituteId && department.instituteId !== instituteId) return false;
            if (isActive !== undefined && department.isActive !== isActive) return false;

            if (search) {
                return (
                    department.name.toLowerCase().includes(search) ||
                    (department.description ?? "").toLowerCase().includes(search)
                );
            }

            return true;
        });

        const total = filtered.length;
        const data = paginateArray(filtered, skip, limit);
        return res.json({ success: true, data, pagination: buildPagination(page, limit, total) });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch departments" });
    }
};

export const getDepartmentById = async (req: Request, res: Response) => {
    try {
        const departmentRepo = AppDataSource.getRepository(Department);
        const department = await departmentRepo.findOne({
            where: { id: req.params.id },
            relations: { institute: true },
        });

        if (!department) {
            return res.status(404).json({ success: false, error: "Department not found" });
        }

        return res.json({ success: true, data: department });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch department" });
    }
};

export const updateDepartment = async (req: Request, res: Response) => {
    try {
        const actorId = (req as AuthRequest).decoded?.userId ?? null;
        const departmentRepo = AppDataSource.getRepository(Department);
        const instituteRepo = AppDataSource.getRepository(Institute);

        const department = await departmentRepo.findOne({ where: { id: req.params.id } });
        if (!department) {
            return res.status(404).json({ success: false, error: "Department not found" });
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
            department.instituteId = instituteId;
        }

        if (name !== undefined) {
            department.name = name;
        }

        if (description !== undefined) {
            department.description = description ?? null;
        }

        if (isActive !== undefined) {
            department.isActive = toBoolean(isActive, department.isActive);
        }
        department.updatedBy = actorId;

        const saved = await departmentRepo.save(department);
        return res.json({ success: true, data: saved });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to update department" });
    }
};

export const deleteDepartment = async (req: Request, res: Response) => {
    try {
        const actorId = (req as AuthRequest).decoded?.userId ?? null;
        const departmentRepo = AppDataSource.getRepository(Department);
        const department = await departmentRepo.findOne({ where: { id: req.params.id } });

        if (!department) {
            return res.status(404).json({ success: false, error: "Department not found" });
        }

        department.isDeleted = true;
        department.isActive = false;
        department.updatedBy = actorId;
        await departmentRepo.save(department);
        return res.json({ success: true, message: "Department deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to delete department" });
    }
};
