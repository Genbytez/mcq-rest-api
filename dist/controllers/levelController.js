"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLevel = exports.updateLevel = exports.getLevelById = exports.getLevels = exports.createLevel = void 0;
const db_1 = require("../config/db");
const level_1 = require("../entities/level");
const institute_1 = require("../entities/institute");
const pagination_1 = require("../utils/pagination");
const toBoolean = (value, fallback) => {
    if (typeof value === "boolean")
        return value;
    if (value === "true" || value === "1" || value === 1)
        return true;
    if (value === "false" || value === "0" || value === 0)
        return false;
    return fallback;
};
const createLevel = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const levelRepo = db_1.AppDataSource.getRepository(level_1.Level);
        const instituteRepo = db_1.AppDataSource.getRepository(institute_1.Institute);
        const { instituteId, name, description, isActive } = req.body;
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
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to create level" });
    }
};
exports.createLevel = createLevel;
const getLevels = async (req, res) => {
    try {
        const { page, limit, skip, q } = (0, pagination_1.parsePaginationQuery)(req);
        const instituteId = (0, pagination_1.parseIdQuery)(req.query.instituteId);
        const isActive = (0, pagination_1.parseBooleanQuery)(req.query.isActive);
        const levelRepo = db_1.AppDataSource.getRepository(level_1.Level);
        const levels = await levelRepo.find({ relations: { institute: true }, order: { id: "ASC" } });
        const search = q?.toLowerCase();
        const filtered = levels.filter((level) => {
            if (level.isDeleted)
                return false;
            if (instituteId && level.instituteId !== instituteId)
                return false;
            if (isActive !== undefined && level.isActive !== isActive)
                return false;
            if (search) {
                return (level.name.toLowerCase().includes(search) ||
                    (level.description ?? "").toLowerCase().includes(search));
            }
            return true;
        });
        const total = filtered.length;
        const data = (0, pagination_1.paginateArray)(filtered, skip, limit);
        return res.json({ success: true, data, pagination: (0, pagination_1.buildPagination)(page, limit, total) });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch levels" });
    }
};
exports.getLevels = getLevels;
const getLevelById = async (req, res) => {
    try {
        const levelRepo = db_1.AppDataSource.getRepository(level_1.Level);
        const level = await levelRepo.findOne({
            where: { id: req.params.id },
            relations: { institute: true },
        });
        if (!level) {
            return res.status(404).json({ success: false, error: "Level not found" });
        }
        return res.json({ success: true, data: level });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch level" });
    }
};
exports.getLevelById = getLevelById;
const updateLevel = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const levelRepo = db_1.AppDataSource.getRepository(level_1.Level);
        const instituteRepo = db_1.AppDataSource.getRepository(institute_1.Institute);
        const level = await levelRepo.findOne({ where: { id: req.params.id } });
        if (!level) {
            return res.status(404).json({ success: false, error: "Level not found" });
        }
        const { instituteId, name, description, isActive } = req.body;
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
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to update level" });
    }
};
exports.updateLevel = updateLevel;
const deleteLevel = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const levelRepo = db_1.AppDataSource.getRepository(level_1.Level);
        const level = await levelRepo.findOne({ where: { id: req.params.id } });
        if (!level) {
            return res.status(404).json({ success: false, error: "Level not found" });
        }
        level.isDeleted = true;
        level.isActive = false;
        level.updatedBy = actorId;
        await levelRepo.save(level);
        return res.json({ success: true, message: "Level deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to delete level" });
    }
};
exports.deleteLevel = deleteLevel;
