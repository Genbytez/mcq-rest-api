"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubject = exports.updateSubject = exports.getSubjectById = exports.getSubjects = exports.createSubject = void 0;
const db_1 = require("../config/db");
const subject_1 = require("../entities/subject");
const institute_1 = require("../entities/institute");
const level_1 = require("../entities/level");
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
const createSubject = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const subjectRepo = db_1.AppDataSource.getRepository(subject_1.Subject);
        const instituteRepo = db_1.AppDataSource.getRepository(institute_1.Institute);
        const levelRepo = db_1.AppDataSource.getRepository(level_1.Level);
        const { instituteId, levelId, name, description, isActive } = req.body;
        const institute = await instituteRepo.findOne({ where: { id: instituteId } });
        if (!institute) {
            return res.status(400).json({ success: false, error: "Invalid instituteId" });
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
            levelId,
            name,
            description: description ?? null,
            isActive: toBoolean(isActive, true),
            createdBy: actorId,
            updatedBy: actorId,
        });
        const saved = await subjectRepo.save(subject);
        return res.status(201).json({ success: true, data: saved });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to create subject" });
    }
};
exports.createSubject = createSubject;
const getSubjects = async (req, res) => {
    try {
        const { page, limit, skip, q } = (0, pagination_1.parsePaginationQuery)(req);
        const instituteId = (0, pagination_1.parseIdQuery)(req.query.instituteId);
        const levelId = (0, pagination_1.parseIdQuery)(req.query.levelId);
        const isActive = (0, pagination_1.parseBooleanQuery)(req.query.isActive);
        const subjectRepo = db_1.AppDataSource.getRepository(subject_1.Subject);
        const subjects = await subjectRepo.find({
            relations: { institute: true, level: true },
            order: { id: "ASC" },
        });
        const search = q?.toLowerCase();
        const filtered = subjects.filter((subject) => {
            if (subject.isDeleted)
                return false;
            if (instituteId && subject.instituteId !== instituteId)
                return false;
            if (levelId && subject.levelId !== levelId)
                return false;
            if (isActive !== undefined && subject.isActive !== isActive)
                return false;
            if (search) {
                return (subject.name.toLowerCase().includes(search) ||
                    (subject.description ?? "").toLowerCase().includes(search));
            }
            return true;
        });
        const total = filtered.length;
        const data = (0, pagination_1.paginateArray)(filtered, skip, limit);
        return res.json({ success: true, data, pagination: (0, pagination_1.buildPagination)(page, limit, total) });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch subjects" });
    }
};
exports.getSubjects = getSubjects;
const getSubjectById = async (req, res) => {
    try {
        const subjectRepo = db_1.AppDataSource.getRepository(subject_1.Subject);
        const subject = await subjectRepo.findOne({
            where: { id: req.params.id },
            relations: { institute: true, level: true },
        });
        if (!subject) {
            return res.status(404).json({ success: false, error: "Subject not found" });
        }
        return res.json({ success: true, data: subject });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch subject" });
    }
};
exports.getSubjectById = getSubjectById;
const updateSubject = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const subjectRepo = db_1.AppDataSource.getRepository(subject_1.Subject);
        const instituteRepo = db_1.AppDataSource.getRepository(institute_1.Institute);
        const levelRepo = db_1.AppDataSource.getRepository(level_1.Level);
        const subject = await subjectRepo.findOne({ where: { id: req.params.id } });
        if (!subject) {
            return res.status(404).json({ success: false, error: "Subject not found" });
        }
        const { instituteId, levelId, name, description, isActive } = req.body;
        const nextInstituteId = instituteId ?? subject.instituteId;
        const nextLevelId = levelId ?? subject.levelId;
        if (instituteId !== undefined) {
            const institute = await instituteRepo.findOne({ where: { id: instituteId } });
            if (!institute) {
                return res.status(400).json({ success: false, error: "Invalid instituteId" });
            }
            subject.instituteId = instituteId;
        }
        if (levelId !== undefined) {
            const level = await levelRepo.findOne({ where: { id: levelId } });
            if (!level) {
                return res.status(400).json({ success: false, error: "Invalid levelId" });
            }
            subject.levelId = levelId;
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
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to update subject" });
    }
};
exports.updateSubject = updateSubject;
const deleteSubject = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const subjectRepo = db_1.AppDataSource.getRepository(subject_1.Subject);
        const subject = await subjectRepo.findOne({ where: { id: req.params.id } });
        if (!subject) {
            return res.status(404).json({ success: false, error: "Subject not found" });
        }
        subject.isDeleted = true;
        subject.isActive = false;
        subject.updatedBy = actorId;
        await subjectRepo.save(subject);
        return res.json({ success: true, message: "Subject deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to delete subject" });
    }
};
exports.deleteSubject = deleteSubject;
