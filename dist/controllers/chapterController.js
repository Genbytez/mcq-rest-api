"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChapter = exports.updateChapter = exports.getChapterById = exports.getChapters = exports.createChapter = void 0;
const db_1 = require("../config/db");
const chapter_1 = require("../entities/chapter");
const institute_1 = require("../entities/institute");
const subject_1 = require("../entities/subject");
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
const toInt = (value, fallback) => {
    if (typeof value === "number")
        return Math.trunc(value);
    if (typeof value === "string" && value.trim().length > 0)
        return Math.trunc(Number(value));
    return fallback;
};
const ensureLinks = async (instituteId, subjectId) => {
    const instituteRepo = db_1.AppDataSource.getRepository(institute_1.Institute);
    const subjectRepo = db_1.AppDataSource.getRepository(subject_1.Subject);
    const institute = await instituteRepo.findOne({ where: { id: instituteId } });
    if (!institute)
        return "Invalid instituteId";
    const subject = await subjectRepo.findOne({ where: { id: subjectId } });
    if (!subject)
        return "Invalid subjectId";
    if (subject.instituteId !== instituteId)
        return "Subject does not belong to institute";
    return null;
};
const createChapter = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(chapter_1.Chapter);
        const { instituteId, subjectId, name, sortOrder, isActive } = req.body;
        const error = await ensureLinks(instituteId, subjectId);
        if (error)
            return res.status(400).json({ success: false, error });
        const chapter = repo.create({
            instituteId,
            subjectId,
            name,
            sortOrder: toInt(sortOrder, 0),
            isActive: toBoolean(isActive, true),
            createdBy: actorId,
            updatedBy: actorId,
        });
        const saved = await repo.save(chapter);
        return res.status(201).json({ success: true, data: saved });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to create chapter" });
    }
};
exports.createChapter = createChapter;
const getChapters = async (req, res) => {
    try {
        const { page, limit, skip, q } = (0, pagination_1.parsePaginationQuery)(req);
        const instituteId = (0, pagination_1.parseIdQuery)(req.query.instituteId);
        const subjectId = (0, pagination_1.parseIdQuery)(req.query.subjectId);
        const isActive = (0, pagination_1.parseBooleanQuery)(req.query.isActive);
        const repo = db_1.AppDataSource.getRepository(chapter_1.Chapter);
        const items = await repo.find({
            relations: { institute: true, subject: true },
            order: { id: "ASC" },
        });
        const search = q?.toLowerCase();
        const filtered = items.filter((item) => {
            if (item.isDeleted)
                return false;
            if (instituteId && item.instituteId !== instituteId)
                return false;
            if (subjectId && item.subjectId !== subjectId)
                return false;
            if (isActive !== undefined && item.isActive !== isActive)
                return false;
            if (search) {
                return item.name.toLowerCase().includes(search);
            }
            return true;
        });
        const total = filtered.length;
        const data = (0, pagination_1.paginateArray)(filtered, skip, limit);
        return res.json({ success: true, data, pagination: (0, pagination_1.buildPagination)(page, limit, total) });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch chapters" });
    }
};
exports.getChapters = getChapters;
const getChapterById = async (req, res) => {
    try {
        const repo = db_1.AppDataSource.getRepository(chapter_1.Chapter);
        const item = await repo.findOne({
            where: { id: req.params.id },
            relations: { institute: true, subject: true },
        });
        if (!item)
            return res.status(404).json({ success: false, error: "Chapter not found" });
        return res.json({ success: true, data: item });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch chapter" });
    }
};
exports.getChapterById = getChapterById;
const updateChapter = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(chapter_1.Chapter);
        const item = await repo.findOne({ where: { id: req.params.id } });
        if (!item)
            return res.status(404).json({ success: false, error: "Chapter not found" });
        const { instituteId, subjectId, name, sortOrder, isActive } = req.body;
        const nextInstituteId = instituteId ?? item.instituteId;
        const nextSubjectId = subjectId ?? item.subjectId;
        const error = await ensureLinks(nextInstituteId, nextSubjectId);
        if (error)
            return res.status(400).json({ success: false, error });
        item.instituteId = nextInstituteId;
        item.subjectId = nextSubjectId;
        if (name !== undefined)
            item.name = name;
        if (sortOrder !== undefined)
            item.sortOrder = toInt(sortOrder, item.sortOrder);
        if (isActive !== undefined)
            item.isActive = toBoolean(isActive, item.isActive);
        item.updatedBy = actorId;
        const saved = await repo.save(item);
        return res.json({ success: true, data: saved });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to update chapter" });
    }
};
exports.updateChapter = updateChapter;
const deleteChapter = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(chapter_1.Chapter);
        const item = await repo.findOne({ where: { id: req.params.id } });
        if (!item)
            return res.status(404).json({ success: false, error: "Chapter not found" });
        item.isDeleted = true;
        item.isActive = false;
        item.updatedBy = actorId;
        await repo.save(item);
        return res.json({ success: true, message: "Chapter deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to delete chapter" });
    }
};
exports.deleteChapter = deleteChapter;
