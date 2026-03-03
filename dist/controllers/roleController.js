"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.getRoleById = exports.getRoles = exports.createRole = void 0;
const db_1 = require("../config/db");
const role_1 = require("../entities/role");
const pagination_1 = require("../utils/pagination");
const createRole = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(role_1.Role);
        const { code, name } = req.body;
        const existing = await repo.findOne({ where: { code } });
        if (existing) {
            return res.status(409).json({ success: false, error: "Role code already exists" });
        }
        const role = repo.create({ code, name, createdBy: actorId, updatedBy: actorId });
        const saved = await repo.save(role);
        return res.status(201).json({ success: true, data: saved });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to create role" });
    }
};
exports.createRole = createRole;
const getRoles = async (req, res) => {
    try {
        const repo = db_1.AppDataSource.getRepository(role_1.Role);
        const { page, limit, skip, q } = (0, pagination_1.parsePaginationQuery)(req);
        const roles = await repo.find({ order: { id: "ASC" } });
        const search = q?.toLowerCase();
        const filtered = roles.filter((role) => {
            if (role.isDeleted)
                return false;
            if (!search)
                return true;
            return (role.code.toLowerCase().includes(search) ||
                role.name.toLowerCase().includes(search));
        });
        const total = filtered.length;
        const data = (0, pagination_1.paginateArray)(filtered, skip, limit);
        return res.json({ success: true, data, pagination: (0, pagination_1.buildPagination)(page, limit, total) });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch roles" });
    }
};
exports.getRoles = getRoles;
const getRoleById = async (req, res) => {
    try {
        const repo = db_1.AppDataSource.getRepository(role_1.Role);
        const role = await repo.findOne({ where: { id: req.params.id } });
        if (!role) {
            return res.status(404).json({ success: false, error: "Role not found" });
        }
        return res.json({ success: true, data: role });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch role" });
    }
};
exports.getRoleById = getRoleById;
const updateRole = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(role_1.Role);
        const role = await repo.findOne({ where: { id: req.params.id } });
        if (!role) {
            return res.status(404).json({ success: false, error: "Role not found" });
        }
        const { code, name } = req.body;
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
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to update role" });
    }
};
exports.updateRole = updateRole;
const deleteRole = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(role_1.Role);
        const role = await repo.findOne({ where: { id: req.params.id } });
        if (!role) {
            return res.status(404).json({ success: false, error: "Role not found" });
        }
        role.isDeleted = true;
        role.isActive = false;
        role.updatedBy = actorId;
        await repo.save(role);
        return res.json({ success: true, message: "Role deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to delete role" });
    }
};
exports.deleteRole = deleteRole;
