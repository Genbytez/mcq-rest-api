import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Role } from "../entities/role";
import { buildPagination, paginateArray, parsePaginationQuery } from "../utils/pagination";
import { AuthRequest } from "../middleware/authMiddleware";

export const createRole = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(Role);
    const { code, name } = req.body as { code: string; name: string };

    const existing = await repo.findOne({ where: { code } });
    if (existing) {
      return res.status(409).json({ success: false, error: "Role code already exists" });
    }

    const role = repo.create({ code, name, createdBy: actorId, updatedBy: actorId });
    const saved = await repo.save(role);

    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to create role" });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Role);
    const { page, limit, skip, q } = parsePaginationQuery(req);
    const roles = await repo.find({ order: { id: "ASC" } });

    const search = q?.toLowerCase();
    const filtered = roles.filter((role) => {
      if (role.isDeleted) return false;
      if (!search) return true;
      return (
        role.code.toLowerCase().includes(search) ||
        role.name.toLowerCase().includes(search)
      );
    });

    const total = filtered.length;
    const data = paginateArray(filtered, skip, limit);

    return res.json({ success: true, data, pagination: buildPagination(page, limit, total) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch roles" });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Role);
    const role = await repo.findOne({ where: { id: req.params.id } });

    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    return res.json({ success: true, data: role });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch role" });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(Role);
    const role = await repo.findOne({ where: { id: req.params.id } });

    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    const { code, name } = req.body as { code?: string; name?: string };

    if (code && code !== role.code) {
      const existing = await repo.findOne({ where: { code } });
      if (existing) {
        return res.status(409).json({ success: false, error: "Role code already exists" });
      }
      role.code = code;
    }

    if (name !== undefined) {
      role.name = name;
    }
    role.updatedBy = actorId;

    const saved = await repo.save(role);
    return res.json({ success: true, data: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update role" });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(Role);
    const role = await repo.findOne({ where: { id: req.params.id } });

    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    role.isDeleted = true;
    role.isActive = false;
    role.updatedBy = actorId;
    await repo.save(role);
    return res.json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete role" });
  }
};
