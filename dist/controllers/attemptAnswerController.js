"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttemptAnswer = exports.updateAttemptAnswer = exports.getAttemptAnswerById = exports.getAttemptAnswers = exports.createAttemptAnswer = void 0;
const db_1 = require("../config/db");
const attempt_answer_1 = require("../entities/attempt-answer");
const exam_attempt_1 = require("../entities/exam-attempt");
const exam_question_1 = require("../entities/exam-question");
const question_1 = require("../entities/question");
const pagination_1 = require("../utils/pagination");
const toBooleanOrNull = (value, fallback) => {
    if (value === null)
        return null;
    if (typeof value === "boolean")
        return value;
    if (value === "true" || value === "1" || value === 1)
        return true;
    if (value === "false" || value === "0" || value === 0)
        return false;
    return fallback;
};
const toBoolean = (value, fallback) => {
    if (typeof value === "boolean")
        return value;
    if (value === "true" || value === "1" || value === 1)
        return true;
    if (value === "false" || value === "0" || value === 0)
        return false;
    return fallback;
};
const toDecimalString = (value, fallback) => {
    if (typeof value === "number")
        return value.toString();
    if (typeof value === "string" && value.trim().length > 0)
        return value;
    return fallback;
};
const toDateOrNull = (value, fallback) => {
    if (value === undefined)
        return fallback;
    if (value === null)
        return null;
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? fallback : date;
};
const ensureRefs = async (attemptId, questionId) => {
    const attemptRepo = db_1.AppDataSource.getRepository(exam_attempt_1.ExamAttempt);
    const questionRepo = db_1.AppDataSource.getRepository(question_1.Question);
    const examQuestionRepo = db_1.AppDataSource.getRepository(exam_question_1.ExamQuestion);
    const attempt = await attemptRepo.findOne({ where: { id: attemptId } });
    if (!attempt)
        return "Invalid attemptId";
    const question = await questionRepo.findOne({ where: { id: questionId } });
    if (!question)
        return "Invalid questionId";
    const existsInExam = await examQuestionRepo.findOne({ where: { examId: attempt.examId, questionId } });
    if (!existsInExam)
        return "Question is not part of this attempt's exam";
    return null;
};
const createAttemptAnswer = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(attempt_answer_1.AttemptAnswer);
        const { attemptId, questionId, selectedOptionKey, isMarkedForReview, isCorrect, marksAwarded, answeredAt, } = req.body;
        const aId = String(attemptId);
        const qId = String(questionId);
        const refError = await ensureRefs(aId, qId);
        if (refError)
            return res.status(400).json({ success: false, error: refError });
        const existing = await repo.findOne({ where: { attemptId: aId, questionId: qId } });
        if (existing)
            return res.status(409).json({ success: false, error: "Answer already exists for this question in attempt" });
        const item = repo.create({
            attemptId: aId,
            questionId: qId,
            selectedOptionKey: selectedOptionKey ?? null,
            isMarkedForReview: toBoolean(isMarkedForReview, false),
            isCorrect: toBooleanOrNull(isCorrect, null),
            marksAwarded: toDecimalString(marksAwarded, "0.00"),
            answeredAt: toDateOrNull(answeredAt, null),
            createdBy: actorId,
            updatedBy: actorId,
        });
        const saved = await repo.save(item);
        return res.status(201).json({ success: true, data: saved });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to create attempt answer" });
    }
};
exports.createAttemptAnswer = createAttemptAnswer;
const getAttemptAnswers = async (req, res) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePaginationQuery)(req);
        const attemptId = (0, pagination_1.parseIdQuery)(req.query.attemptId);
        const questionId = (0, pagination_1.parseIdQuery)(req.query.questionId);
        const selectedOptionKey = typeof req.query.selectedOptionKey === "string" ? req.query.selectedOptionKey : undefined;
        const isMarkedForReview = (0, pagination_1.parseBooleanQuery)(req.query.isMarkedForReview);
        const isCorrect = (0, pagination_1.parseBooleanQuery)(req.query.isCorrect);
        const repo = db_1.AppDataSource.getRepository(attempt_answer_1.AttemptAnswer);
        const items = await repo.find({ relations: { attempt: true, question: true }, order: { id: "ASC" } });
        const filtered = items.filter((item) => {
            if (item.isDeleted)
                return false;
            if (attemptId && item.attemptId !== attemptId)
                return false;
            if (questionId && item.questionId !== questionId)
                return false;
            if (selectedOptionKey && item.selectedOptionKey !== selectedOptionKey)
                return false;
            if (isMarkedForReview !== undefined && item.isMarkedForReview !== isMarkedForReview)
                return false;
            if (isCorrect !== undefined && item.isCorrect !== isCorrect)
                return false;
            return true;
        });
        const total = filtered.length;
        const data = (0, pagination_1.paginateArray)(filtered, skip, limit);
        return res.json({ success: true, data, pagination: (0, pagination_1.buildPagination)(page, limit, total) });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch attempt answers" });
    }
};
exports.getAttemptAnswers = getAttemptAnswers;
const getAttemptAnswerById = async (req, res) => {
    try {
        const repo = db_1.AppDataSource.getRepository(attempt_answer_1.AttemptAnswer);
        const item = await repo.findOne({ where: { id: req.params.id }, relations: { attempt: true, question: true } });
        if (!item)
            return res.status(404).json({ success: false, error: "Attempt answer not found" });
        return res.json({ success: true, data: item });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch attempt answer" });
    }
};
exports.getAttemptAnswerById = getAttemptAnswerById;
const updateAttemptAnswer = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(attempt_answer_1.AttemptAnswer);
        const item = await repo.findOne({ where: { id: req.params.id } });
        if (!item)
            return res.status(404).json({ success: false, error: "Attempt answer not found" });
        const body = req.body;
        const nextAttemptId = body.attemptId !== undefined ? String(body.attemptId) : item.attemptId;
        const nextQuestionId = body.questionId !== undefined ? String(body.questionId) : item.questionId;
        const refError = await ensureRefs(nextAttemptId, nextQuestionId);
        if (refError)
            return res.status(400).json({ success: false, error: refError });
        const conflict = await repo.findOne({ where: { attemptId: nextAttemptId, questionId: nextQuestionId } });
        if (conflict && conflict.id !== item.id) {
            return res.status(409).json({ success: false, error: "Answer already exists for this question in attempt" });
        }
        item.attemptId = nextAttemptId;
        item.questionId = nextQuestionId;
        if (body.selectedOptionKey !== undefined)
            item.selectedOptionKey = body.selectedOptionKey ?? null;
        if (body.isMarkedForReview !== undefined)
            item.isMarkedForReview = toBoolean(body.isMarkedForReview, item.isMarkedForReview);
        if (body.isCorrect !== undefined)
            item.isCorrect = toBooleanOrNull(body.isCorrect, item.isCorrect);
        if (body.marksAwarded !== undefined)
            item.marksAwarded = toDecimalString(body.marksAwarded, item.marksAwarded);
        if (body.answeredAt !== undefined)
            item.answeredAt = toDateOrNull(body.answeredAt, item.answeredAt);
        item.updatedBy = actorId;
        const saved = await repo.save(item);
        return res.json({ success: true, data: saved });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to update attempt answer" });
    }
};
exports.updateAttemptAnswer = updateAttemptAnswer;
const deleteAttemptAnswer = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const repo = db_1.AppDataSource.getRepository(attempt_answer_1.AttemptAnswer);
        const item = await repo.findOne({ where: { id: req.params.id } });
        if (!item)
            return res.status(404).json({ success: false, error: "Attempt answer not found" });
        item.isDeleted = true;
        item.isActive = false;
        item.updatedBy = actorId;
        await repo.save(item);
        return res.json({ success: true, message: "Attempt answer deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to delete attempt answer" });
    }
};
exports.deleteAttemptAnswer = deleteAttemptAnswer;
