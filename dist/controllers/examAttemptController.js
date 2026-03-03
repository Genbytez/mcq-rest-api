"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExamAttempt = exports.updateExamAttempt = exports.getExamAttemptById = exports.getExamAttempts = exports.createExamAttempt = void 0;
const db_1 = require("../config/db");
const enums_1 = require("../entities/enums");
const exam_1 = require("../entities/exam");
const exam_attempt_1 = require("../entities/exam-attempt");
const users_1 = require("../entities/users");
const pagination_1 = require("../utils/pagination");
const toInt = (value, fallback) => {
    if (typeof value === "number")
        return Math.trunc(value);
    if (typeof value === "string" && value.trim().length > 0)
        return Math.trunc(Number(value));
    return fallback;
};
const toDecimalString = (value, fallback) => {
    if (typeof value === "number")
        return value.toString();
    if (typeof value === "string" && value.trim().length > 0)
        return value;
    return fallback;
};
const ensureRefs = async (examId, studentId) => {
    const examRepo = db_1.AppDataSource.getRepository(exam_1.Exam);
    const userRepo = db_1.AppDataSource.getRepository(users_1.UserAccount);
    const exam = await examRepo.findOne({ where: { id: examId } });
    if (!exam)
        return "Invalid examId";
    const student = await userRepo.findOne({ where: { id: studentId } });
    if (!student)
        return "Invalid studentId";
    if (student.instituteId !== exam.instituteId)
        return "Student institute does not match exam institute";
    return null;
};
const toDateOrNull = (value, fallback) => {
    if (value === undefined)
        return fallback;
    if (value === null)
        return null;
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? fallback : date;
};
const createExamAttempt = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(exam_attempt_1.ExamAttempt);
        const { examId, studentId, attemptNo, startedAt, submittedAt, status, score, maxScore, correctCount, wrongCount, skippedCount, } = req.body;
        const eId = String(examId);
        const sId = String(studentId);
        const refError = await ensureRefs(eId, sId);
        if (refError)
            return res.status(400).json({ success: false, error: refError });
        const no = toInt(attemptNo, 1);
        const existing = await repo.findOne({ where: { examId: eId, studentId: sId, attemptNo: no } });
        if (existing)
            return res.status(409).json({ success: false, error: "Attempt number already exists for exam/student" });
        const item = repo.create({
            examId: eId,
            studentId: sId,
            attemptNo: no,
            startedAt: toDateOrNull(startedAt, null),
            submittedAt: toDateOrNull(submittedAt, null),
            status: status ?? enums_1.AttemptStatus.NOT_STARTED,
            score: toDecimalString(score, "0.00"),
            maxScore: toDecimalString(maxScore, "0.00"),
            correctCount: toInt(correctCount, 0),
            wrongCount: toInt(wrongCount, 0),
            skippedCount: toInt(skippedCount, 0),
            createdBy: actorId,
            updatedBy: actorId,
        });
        const saved = await repo.save(item);
        return res.status(201).json({ success: true, data: saved });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to create exam attempt" });
    }
};
exports.createExamAttempt = createExamAttempt;
const getExamAttempts = async (req, res) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePaginationQuery)(req);
        const examId = (0, pagination_1.parseIdQuery)(req.query.examId);
        const studentId = (0, pagination_1.parseIdQuery)(req.query.studentId);
        const status = typeof req.query.status === "string" ? req.query.status : undefined;
        const attemptNo = typeof req.query.attemptNo === "string" ? Number(req.query.attemptNo) : undefined;
        const repo = db_1.AppDataSource.getRepository(exam_attempt_1.ExamAttempt);
        const items = await repo.find({ relations: { exam: true, student: true, answers: true }, order: { id: "ASC" } });
        const filtered = items.filter((item) => {
            if (item.isDeleted)
                return false;
            if (examId && item.examId !== examId)
                return false;
            if (studentId && item.studentId !== studentId)
                return false;
            if (status && item.status !== status)
                return false;
            if (attemptNo !== undefined && Number.isFinite(attemptNo) && item.attemptNo !== attemptNo)
                return false;
            return true;
        });
        const total = filtered.length;
        const data = (0, pagination_1.paginateArray)(filtered, skip, limit);
        return res.json({ success: true, data, pagination: (0, pagination_1.buildPagination)(page, limit, total) });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch exam attempts" });
    }
};
exports.getExamAttempts = getExamAttempts;
const getExamAttemptById = async (req, res) => {
    try {
        const repo = db_1.AppDataSource.getRepository(exam_attempt_1.ExamAttempt);
        const item = await repo.findOne({
            where: { id: req.params.id },
            relations: { exam: true, student: true, answers: true },
        });
        if (!item)
            return res.status(404).json({ success: false, error: "Exam attempt not found" });
        return res.json({ success: true, data: item });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch exam attempt" });
    }
};
exports.getExamAttemptById = getExamAttemptById;
const updateExamAttempt = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(exam_attempt_1.ExamAttempt);
        const item = await repo.findOne({ where: { id: req.params.id } });
        if (!item)
            return res.status(404).json({ success: false, error: "Exam attempt not found" });
        const body = req.body;
        const nextExamId = body.examId !== undefined ? String(body.examId) : item.examId;
        const nextStudentId = body.studentId !== undefined ? String(body.studentId) : item.studentId;
        const nextAttemptNo = body.attemptNo !== undefined ? toInt(body.attemptNo, item.attemptNo) : item.attemptNo;
        const refError = await ensureRefs(nextExamId, nextStudentId);
        if (refError)
            return res.status(400).json({ success: false, error: refError });
        const conflict = await repo.findOne({ where: { examId: nextExamId, studentId: nextStudentId, attemptNo: nextAttemptNo } });
        if (conflict && conflict.id !== item.id) {
            return res.status(409).json({ success: false, error: "Attempt number already exists for exam/student" });
        }
        item.examId = nextExamId;
        item.studentId = nextStudentId;
        item.attemptNo = nextAttemptNo;
        if (body.startedAt !== undefined)
            item.startedAt = toDateOrNull(body.startedAt, item.startedAt);
        if (body.submittedAt !== undefined)
            item.submittedAt = toDateOrNull(body.submittedAt, item.submittedAt);
        if (body.status !== undefined)
            item.status = body.status;
        if (body.score !== undefined)
            item.score = toDecimalString(body.score, item.score);
        if (body.maxScore !== undefined)
            item.maxScore = toDecimalString(body.maxScore, item.maxScore);
        if (body.correctCount !== undefined)
            item.correctCount = toInt(body.correctCount, item.correctCount);
        if (body.wrongCount !== undefined)
            item.wrongCount = toInt(body.wrongCount, item.wrongCount);
        if (body.skippedCount !== undefined)
            item.skippedCount = toInt(body.skippedCount, item.skippedCount);
        item.updatedBy = actorId;
        const saved = await repo.save(item);
        return res.json({ success: true, data: saved });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to update exam attempt" });
    }
};
exports.updateExamAttempt = updateExamAttempt;
const deleteExamAttempt = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(exam_attempt_1.ExamAttempt);
        const item = await repo.findOne({ where: { id: req.params.id } });
        if (!item)
            return res.status(404).json({ success: false, error: "Exam attempt not found" });
        item.isDeleted = true;
        item.isActive = false;
        item.updatedBy = actorId;
        await repo.save(item);
        return res.json({ success: true, message: "Exam attempt deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to delete exam attempt" });
    }
};
exports.deleteExamAttempt = deleteExamAttempt;
