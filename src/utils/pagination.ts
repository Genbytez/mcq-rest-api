import { Request } from "express";

export type PaginationQuery = {
  page: number;
  limit: number;
  skip: number;
  q?: string;
};

export const parsePaginationQuery = (req: Request): PaginationQuery => {
  const pageRaw = Number(req.query.page ?? 1);
  const limitRaw = Number(req.query.limit ?? 20);

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const limitUncapped = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 20;
  const limit = Math.min(limitUncapped, 100);
  const skip = (page - 1) * limit;
  const q = typeof req.query.q === "string" && req.query.q.trim().length > 0 ? req.query.q.trim() : undefined;

  return { page, limit, skip, q };
};

export const parseBooleanQuery = (value: unknown): boolean | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;
  return undefined;
};

export const parseIdQuery = (value: unknown): string | undefined => {
  if (typeof value === "string" && /^\d+$/.test(value) && Number(value) > 0) return value;
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return String(value);
  return undefined;
};

export const buildPagination = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

export const paginateArray = <T>(
  items: T[],
  skip: number,
  limit: number
) => items.slice(skip, skip + limit);
