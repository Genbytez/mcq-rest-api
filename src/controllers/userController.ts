import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/db";
import { UserAccount } from "../entities/users";
import { Institute } from "../entities/institute";
import { Role } from "../entities/role";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  buildPagination,
  paginateArray,
  parseBooleanQuery,
  parseIdQuery,
  parsePaginationQuery,
} from "../utils/pagination";

const sanitizeUser = (user: UserAccount) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const userRepo = AppDataSource.getRepository(UserAccount);
    const instituteRepo = AppDataSource.getRepository(Institute);
    const roleRepo = AppDataSource.getRepository(Role);

    const {
      instituteId,
      roleId,
      regNo,
      fullName,
      email,
      mobile,
      password,
      status,
      batchFrom,
      batchTo,
    } = req.body as {
      instituteId: string;
      roleId: string;
      regNo?: string | null;
      fullName: string;
      email?: string | null;
      mobile?: string | null;
      password: string;
      status?: UserAccount["status"];
      batchFrom?: Date | null;
      batchTo?: Date | null;
    };

    const institute = await instituteRepo.findOne({ where: { id: instituteId } });
    if (!institute) {
      return res.status(400).json({ success: false, error: "Invalid instituteId" });
    }

    const role = await roleRepo.findOne({ where: { id: roleId } });
    if (!role) {
      return res.status(400).json({ success: false, error: "Invalid roleId" });
    }

    if (regNo) {
      const regNoExists = await userRepo.findOne({ where: { regNo } });
      if (regNoExists) {
        return res.status(409).json({ success: false, error: "Registration number already exists" });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = userRepo.create({
      instituteId,
      roleId,
      regNo: regNo ?? null,
      fullName,
      email: email ?? null,
      mobile: mobile ?? null,
      passwordHash,
      status,
      batchFrom: batchFrom ?? null,
      batchTo: batchTo ?? null,
      createdBy: actorId,
      updatedBy: actorId,
    });

    const saved = await userRepo.save(user);
    const withRelations = await userRepo.findOne({
      where: { id: saved.id },
      relations: { institute: true, role: true },
    });

    return res.status(201).json({ success: true, data: withRelations ? sanitizeUser(withRelations) : null });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to create user" });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip, q } = parsePaginationQuery(req);
    const instituteId = parseIdQuery(req.query.instituteId);
    const roleId = parseIdQuery(req.query.roleId);
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    const userRepo = AppDataSource.getRepository(UserAccount);
    const users = await userRepo.find({
      relations: { institute: true, role: true },
      order: { id: "ASC" },
    });
    const search = q?.toLowerCase();

    const filtered = users.filter((user) => {
      if (user.isDeleted) return false;
      if (instituteId && user.instituteId !== instituteId) return false;
      if (roleId && user.roleId !== roleId) return false;
      if (status && user.status !== status) return false;

      if (search) {
        const haystack = [user.fullName, user.email, user.mobile, user.regNo]
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.toLowerCase());
        return haystack.some((value) => value.includes(search));
      }

      return true;
    });

    const total = filtered.length;
    const data = paginateArray(filtered.map(sanitizeUser), skip, limit);
    return res.json({ success: true, data, pagination: buildPagination(page, limit, total) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(UserAccount);
    const user = await userRepo.findOne({
      where: { id: req.params.id },
      relations: { institute: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const userRepo = AppDataSource.getRepository(UserAccount);
    const instituteRepo = AppDataSource.getRepository(Institute);
    const roleRepo = AppDataSource.getRepository(Role);

    const user = await userRepo.findOne({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const {
      instituteId,
      roleId,
      regNo,
      fullName,
      email,
      mobile,
      password,
      status,
      batchFrom,
      batchTo,
    } = req.body as {
      instituteId?: string;
      roleId?: string;
      regNo?: string | null;
      fullName?: string;
      email?: string | null;
      mobile?: string | null;
      password?: string;
      status?: UserAccount["status"];
      batchFrom?: Date | null;
      batchTo?: Date | null;
    };

    if (instituteId !== undefined) {
      const institute = await instituteRepo.findOne({ where: { id: instituteId } });
      if (!institute) {
        return res.status(400).json({ success: false, error: "Invalid instituteId" });
      }
      user.instituteId = instituteId;
    }

    if (roleId !== undefined) {
      const role = await roleRepo.findOne({ where: { id: roleId } });
      if (!role) {
        return res.status(400).json({ success: false, error: "Invalid roleId" });
      }
      user.roleId = roleId;
    }

    if (regNo !== undefined) {
      if (regNo) {
        const existing = await userRepo.findOne({ where: { regNo } });
        if (existing && existing.id !== user.id) {
          return res.status(409).json({ success: false, error: "Registration number already exists" });
        }
      }
      user.regNo = regNo ?? null;
    }

    if (fullName !== undefined) {
      user.fullName = fullName;
    }

    if (email !== undefined) {
      user.email = email ?? null;
    }

    if (mobile !== undefined) {
      user.mobile = mobile ?? null;
    }

    if (status !== undefined) {
      user.status = status;
    }

    if (batchFrom !== undefined) {
      user.batchFrom = batchFrom ?? null;
    }

    if (batchTo !== undefined) {
      user.batchTo = batchTo ?? null;
    }

    if (password !== undefined) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }
    user.updatedBy = actorId;

    await userRepo.save(user);

    const withRelations = await userRepo.findOne({
      where: { id: user.id },
      relations: { institute: true, role: true },
    });

    return res.json({ success: true, data: withRelations ? sanitizeUser(withRelations) : null });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const userRepo = AppDataSource.getRepository(UserAccount);
    const user = await userRepo.findOne({ where: { id: req.params.id } });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.isDeleted = true;
    user.isActive = false;
    user.updatedBy = actorId;
    await userRepo.save(user);
    return res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete user" });
  }
};
