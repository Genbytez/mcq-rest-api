"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExamQuestion = exports.updateExamQuestion = exports.getExamQuestionById = exports.getExamQuestions = exports.createExamQuestion = void 0;
const db_1 = require("../config/db");
const exam_1 = require("../entities/exam");
const exam_question_1 = require("../entities/exam-question");
const question_1 = require("../entities/question");
const pagination_1 = require("../utils/pagination");
const toInt = (value, fallback) => {
    if (typeof value === "number")
        return Math.trunc(value);
    if (typeof value === "string" && value.trim().length > 0)
        return Math.trunc(Number(value));
    return fallback;
};
const ensureRefs = async (examId, questionId) => {
    const examRepo = db_1.AppDataSource.getRepository(exam_1.Exam);
    const questionRepo = db_1.AppDataSource.getRepository(question_1.Question);
    const exam = await examRepo.findOne({ where: { id: examId } });
    if (!exam)
        return "Invalid examId";
    const question = await questionRepo.findOne({ where: { id: questionId } });
    if (!question)
        return "Invalid questionId";
    if (question.instituteId !== exam.instituteId)
        return "Question institute does not match exam institute";
    if (question.levelId !== exam.levelId)
        return "Question level does not match exam level";
    if (question.subjectId !== exam.subjectId)
        return "Question subject does not match exam subject";
    return null;
};
const createExamQuestion = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(exam_question_1.ExamQuestion);
        const { examId, questionId, sortOrder } = req.body;
        const refError = await ensureRefs(examId, questionId);
        if (refError)
            return res.status(400).json({ success: false, error: refError });
        const existing = await repo.findOne({ where: { examId, questionId } });
        if (existing)
            return res.status(409).json({ success: false, error: "Question already attached to exam" });
        const item = repo.create({
            examId,
            questionId,
            sortOrder: toInt(sortOrder, 0),
            createdBy: actorId,
            updatedBy: actorId,
        });
        const saved = await repo.save(item);
        return res.status(201).json({ success: true, data: saved });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to create exam question" });
    }
};
exports.createExamQuestion = createExamQuestion;
const getExamQuestions = async (req, res) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePaginationQuery)(req);
        const examId = (0, pagination_1.parseIdQuery)(req.query.examId);
        const questionId = (0, pagination_1.parseIdQuery)(req.query.questionId);
        const repo = db_1.AppDataSource.getRepository(exam_question_1.ExamQuestion);
        const items = await repo.find({ relations: { exam: true, question: true }, order: { id: "ASC" } });
        const filtered = items.filter((item) => {
            if (item.isDeleted)
                return false;
            if (examId && item.examId !== examId)
                return false;
            if (questionId && item.questionId !== questionId)
                return false;
            return true;
        });
        const total = filtered.length;
        const data = (0, pagination_1.paginateArray)(filtered, skip, limit);
        return res.json({ success: true, data, pagination: (0, pagination_1.buildPagination)(page, limit, total) });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch exam questions" });
    }
};
exports.getExamQuestions = getExamQuestions;
const getExamQuestionById = async (req, res) => {
    try {
        const repo = db_1.AppDataSource.getRepository(exam_question_1.ExamQuestion);
        const item = await repo.findOne({ where: { id: req.params.id }, relations: { exam: true, question: true } });
        if (!item)
            return res.status(404).json({ success: false, error: "Exam question not found" });
        return res.json({ success: true, data: item });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch exam question" });
    }
};
exports.getExamQuestionById = getExamQuestionById;
const updateExamQuestion = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(exam_question_1.ExamQuestion);
        const item = await repo.findOne({ where: { id: req.params.id } });
        if (!item)
            return res.status(404).json({ success: false, error: "Exam question not found" });
        const { examId, questionId, sortOrder } = req.body;
        const nextExamId = examId ?? item.examId;
        const nextQuestionId = questionId ?? item.questionId;
        const refError = await ensureRefs(nextExamId, nextQuestionId);
        if (refError)
            return res.status(400).json({ success: false, error: refError });
        const conflict = await repo.findOne({ where: { examId: nextExamId, questionId: nextQuestionId } });
        if (conflict && conflict.id !== item.id) {
            return res.status(409).json({ success: false, error: "Question already attached to exam" });
        }
        item.examId = nextExamId;
        item.questionId = nextQuestionId;
        if (sortOrder !== undefined)
            item.sortOrder = toInt(sortOrder, item.sortOrder);
        item.updatedBy = actorId;
        const saved = await repo.save(item);
        return res.json({ success: true, data: saved });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to update exam question" });
    }
};
exports.updateExamQuestion = updateExamQuestion;
const deleteExamQuestion = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(exam_question_1.ExamQuestion);
        const item = await repo.findOne({ where: { id: req.params.id } });
        if (!item)
            return res.status(404).json({ success: false, error: "Exam question not found" });
        item.isDeleted = true;
        item.isActive = false;
        item.updatedBy = actorId;
        await repo.save(item);
        return res.json({ success: true, message: "Exam question deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to delete exam question" });
    }
};
exports.deleteExamQuestion = deleteExamQuestion;
