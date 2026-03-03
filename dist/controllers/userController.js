"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const users_1 = require("../entities/users");
const institute_1 = require("../entities/institute");
const role_1 = require("../entities/role");
const pagination_1 = require("../utils/pagination");
const sanitizeUser = (user) => {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
};
const createUser = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const userRepo = db_1.AppDataSource.getRepository(users_1.UserAccount);
        const instituteRepo = db_1.AppDataSource.getRepository(institute_1.Institute);
        const roleRepo = db_1.AppDataSource.getRepository(role_1.Role);
        const { instituteId, roleId, regNo, fullName, email, mobile, password, status, } = req.body;
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
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = userRepo.create({
            instituteId,
            roleId,
            regNo: regNo ?? null,
            fullName,
            email: email ?? null,
            mobile: mobile ?? null,
            passwordHash,
            status,
            createdBy: actorId,
            updatedBy: actorId,
        });
        const saved = await userRepo.save(user);
        const withRelations = await userRepo.findOne({
            where: { id: saved.id },
            relations: { institute: true, role: true },
        });
        return res.status(201).json({ success: true, data: withRelations ? sanitizeUser(withRelations) : null });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to create user" });
    }
};
exports.createUser = createUser;
const getUsers = async (req, res) => {
    try {
        const { page, limit, skip, q } = (0, pagination_1.parsePaginationQuery)(req);
        const instituteId = (0, pagination_1.parseIdQuery)(req.query.instituteId);
        const roleId = (0, pagination_1.parseIdQuery)(req.query.roleId);
        const status = typeof req.query.status === "string" ? req.query.status : undefined;
        const userRepo = db_1.AppDataSource.getRepository(users_1.UserAccount);
        const users = await userRepo.find({
            relations: { institute: true, role: true },
            order: { id: "ASC" },
        });
        const search = q?.toLowerCase();
        const filtered = users.filter((user) => {
            if (user.isDeleted)
                return false;
            if (instituteId && user.instituteId !== instituteId)
                return false;
            if (roleId && user.roleId !== roleId)
                return false;
            if (status && user.status !== status)
                return false;
            if (search) {
                const haystack = [user.fullName, user.email, user.mobile, user.regNo]
                    .filter((value) => typeof value === "string")
                    .map((value) => value.toLowerCase());
                return haystack.some((value) => value.includes(search));
            }
            return true;
        });
        const total = filtered.length;
        const data = (0, pagination_1.paginateArray)(filtered.map(sanitizeUser), skip, limit);
        return res.json({ success: true, data, pagination: (0, pagination_1.buildPagination)(page, limit, total) });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch users" });
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res) => {
    try {
        const userRepo = db_1.AppDataSource.getRepository(users_1.UserAccount);
        const user = await userRepo.findOne({
            where: { id: req.params.id },
            relations: { institute: true, role: true },
        });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        return res.json({ success: true, data: sanitizeUser(user) });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch user" });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const userRepo = db_1.AppDataSource.getRepository(users_1.UserAccount);
        const instituteRepo = db_1.AppDataSource.getRepository(institute_1.Institute);
        const roleRepo = db_1.AppDataSource.getRepository(role_1.Role);
        const user = await userRepo.findOne({ where: { id: req.params.id } });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        const { instituteId, roleId, regNo, fullName, email, mobile, password, status, } = req.body;
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
        if (password !== undefined) {
            user.passwordHash = await bcryptjs_1.default.hash(password, 10);
        }
        user.updatedBy = actorId;
        await userRepo.save(user);
        const withRelations = await userRepo.findOne({
            where: { id: user.id },
            relations: { institute: true, role: true },
        });
        return res.json({ success: true, data: withRelations ? sanitizeUser(withRelations) : null });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to update user" });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const userRepo = db_1.AppDataSource.getRepository(users_1.UserAccount);
        const user = await userRepo.findOne({ where: { id: req.params.id } });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        user.isDeleted = true;
        user.isActive = false;
        user.updatedBy = actorId;
        await userRepo.save(user);
        return res.json({ success: true, message: "User deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to delete user" });
    }
};
exports.deleteUser = deleteUser;
