import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Institute } from "../entities/institute";
import { AuthRequest } from "../middleware/authMiddleware";
import AppProperties from "../config/appProperties";
import {
  buildPagination,
  paginateArray,
  parseBooleanQuery,
  parsePaginationQuery,
} from "../utils/pagination";

const toBoolean = (value: unknown, fallback: boolean) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;
  return fallback;
};

const formatLogoPath = (logo: string | null) => {
  if (!logo) return null;
  // If it's already a full URL, return as is
  if (logo.startsWith("http")) return logo;

  const baseUrl = `http://localhost:${AppProperties.PORT}`;

  // If it starts with /assets/, prepend the baseUrl
  if (logo.startsWith("/assets/")) return `${baseUrl}${logo}`;
  // If it starts with assets/, prepend baseUrl and a slash
  if (logo.startsWith("assets/")) return `${baseUrl}/${logo}`;
  // Otherwise, prepend /assets/
  return `${baseUrl}/assets/${logo}`;
};

export const createInstitute = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(Institute);
    const { code, name, address, isActive, phoneNumber } = req.body as {
      code: string;
      name: string;
      address?: string | null;
      isActive?: unknown;
      phoneNumber?: string | null;
      email?: string | null;
    };
    const logo = req.file ? `/assets/logos/${req.file.filename}` : null;

    const existing = await repo.findOne({ where: { code } });
    if (existing) {
      return res.status(409).json({ success: false, error: "Institute code already exists" });
    }

    const institute = repo.create({
      code,
      name,
      address: address ?? null,
      phoneNumber: phoneNumber ?? null,
      logo,
      isActive: toBoolean(isActive, true),
      createdBy: actorId,
      updatedBy: actorId,
    });

    const saved = await repo.save(institute);
    return res.status(201).json({ success: true, data: { ...saved, logo: formatLogoPath(saved.logo) } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to create institute" });
  }
};

export const getInstitutes = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip, q } = parsePaginationQuery(req);
    const isActive = parseBooleanQuery(req.query.isActive);
    const repo = AppDataSource.getRepository(Institute);
    const items = await repo.find({ order: { id: "ASC" } });
    const search = q?.toLowerCase();

    const filtered = items.filter((item) => {
      if (item.isDeleted) return false;
      if (isActive !== undefined && item.isActive !== isActive) return false;

      if (search) {
        return (
          item.code.toLowerCase().includes(search) ||
          item.name.toLowerCase().includes(search) ||
          (item.address ?? "").toLowerCase().includes(search)
        );
      }

      return true;
    });

    const total = filtered.length;
    const data = paginateArray(filtered, skip, limit).map((item) => ({
      ...item,
      logo: formatLogoPath(item.logo),
    }));
    return res.json({ success: true, data, pagination: buildPagination(page, limit, total) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch institutes" });
  }
};

export const getInstituteById = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Institute);
    const item = await repo.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: "Institute not found" });
    return res.json({ success: true, data: { ...item, logo: formatLogoPath(item.logo) } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch institute" });
  }
};

export const updateInstitute = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(Institute);
    const item = await repo.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: "Institute not found" });

    const { code, name, address, isActive, email, phoneNumber } = req.body as {
      code?: string;
      name?: string;
      address?: string | null;
      isActive?: unknown;
      email?: string | null;
      phoneNumber?: string | null;
    };

    if (req.file) {
      item.logo = `/assets/logos/${req.file.filename}`;
    }

    if (code !== undefined && code !== item.code) {
      const existing = await repo.findOne({ where: { code } });
      if (existing) {
        return res.status(409).json({ success: false, error: "Institute code already exists" });
      }
      item.code = code;
    }

    if (name !== undefined) item.name = name;
    if (address !== undefined) item.address = address ?? null;
    if (phoneNumber !== undefined) item.phoneNumber = phoneNumber ?? null;
    if (isActive !== undefined) item.isActive = toBoolean(isActive, item.isActive);
    item.updatedBy = actorId;

    const saved = await repo.save(item);
    return res.json({ success: true, data: { ...saved, logo: formatLogoPath(saved.logo) } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update institute" });
  }
};

export const deleteInstitute = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const repo = AppDataSource.getRepository(Institute);
    const item = await repo.findOne({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: "Institute not found" });

    item.isDeleted = true;
    item.isActive = false;
    item.updatedBy = actorId;
    await repo.save(item);
    return res.json({ success: true, message: "Institute deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete institute" });
  }
};
