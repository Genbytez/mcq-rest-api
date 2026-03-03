"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestion = exports.updateQuestion = exports.getQuestionById = exports.getQuestions = exports.createQuestion = void 0;
const db_1 = require("../config/db");
const enums_1 = require("../entities/enums");
const institute_1 = require("../entities/institute");
const level_1 = require("../entities/level");
const question_1 = require("../entities/question");
const question_option_1 = require("../entities/question-option");
const subject_1 = require("../entities/subject");
const chapter_1 = require("../entities/chapter");
const users_1 = require("../entities/users");
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
const normalizeOptions = (options = []) => options.map((option) => ({
    optionKey: option.optionKey,
    optionText: option.optionText ?? null,
    optionImageBase64: option.optionImageBase64 ?? null,
    optionImageMime: option.optionImageMime ?? null,
    isCorrect: toBoolean(option.isCorrect, false),
}));
const verifyReferences = async (instituteId, levelId, subjectId, chapterId, createdBy) => {
    const instituteRepo = db_1.AppDataSource.getRepository(institute_1.Institute);
    const levelRepo = db_1.AppDataSource.getRepository(level_1.Level);
    const subjectRepo = db_1.AppDataSource.getRepository(subject_1.Subject);
    const chapterRepo = db_1.AppDataSource.getRepository(chapter_1.Chapter);
    const userRepo = db_1.AppDataSource.getRepository(users_1.UserAccount);
    const institute = await instituteRepo.findOne({ where: { id: instituteId } });
    if (!institute)
        return "Invalid instituteId";
    const level = await levelRepo.findOne({ where: { id: levelId } });
    if (!level)
        return "Invalid levelId";
    if (level.instituteId !== instituteId) {
        return "Level does not belong to institute";
    }
    const subject = await subjectRepo.findOne({ where: { id: subjectId } });
    if (!subject)
        return "Invalid subjectId";
    if (subject.instituteId !== instituteId || subject.levelId !== levelId) {
        return "Subject does not belong to selected institute/level";
    }
    if (chapterId) {
        const chapter = await chapterRepo.findOne({ where: { id: chapterId } });
        if (!chapter)
            return "Invalid chapterId";
        if (chapter.instituteId !== instituteId || chapter.subjectId !== subjectId) {
            return "Chapter does not belong to selected institute/subject";
        }
    }
    if (createdBy) {
        const creator = await userRepo.findOne({ where: { id: createdBy } });
        if (!creator)
            return "Invalid createdBy";
        if (creator.instituteId !== instituteId) {
            return "Creator does not belong to selected institute";
        }
    }
    return null;
};
const createQuestion = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const questionRepo = db_1.AppDataSource.getRepository(question_1.Question);
        const body = req.body;
        const instituteId = body.instituteId;
        const levelId = body.levelId;
        const subjectId = body.subjectId;
        const refError = await verifyReferences(instituteId, levelId, subjectId, body.chapterId, actorId);
        if (refError) {
            return res.status(400).json({ success: false, error: refError });
        }
        const question = questionRepo.create({
            instituteId,
            levelId,
            subjectId,
            chapterId: body.chapterId ?? null,
            questionType: body.questionType ?? enums_1.QuestionType.MCQ,
            difficulty: body.difficulty ?? enums_1.Difficulty.MEDIUM,
            questionText: body.questionText ?? null,
            questionImageBase64: body.questionImageBase64 ?? null,
            questionImageMime: body.questionImageMime ?? null,
            marks: body.marks ?? "1.00",
            negativeMarks: body.negativeMarks ?? "0.00",
            explanationText: body.explanationText ?? null,
            explanationImageBase64: body.explanationImageBase64 ?? null,
            explanationImageMime: body.explanationImageMime ?? null,
            isActive: toBoolean(body.isActive, true),
            createdBy: actorId,
            updatedBy: actorId,
            options: normalizeOptions(body.options),
        });
        const saved = await questionRepo.save(question);
        const withRelations = await questionRepo.findOne({
            where: { id: saved.id },
            relations: {
                institute: true,
                level: true,
                subject: true,
                chapter: true,
                creator: true,
                options: true,
            },
        });
        return res.status(201).json({ success: true, data: withRelations });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to create question" });
    }
};
exports.createQuestion = createQuestion;
const getQuestions = async (req, res) => {
    try {
        const { page, limit, skip, q } = (0, pagination_1.parsePaginationQuery)(req);
        const instituteId = (0, pagination_1.parseIdQuery)(req.query.instituteId);
        const levelId = (0, pagination_1.parseIdQuery)(req.query.levelId);
        const subjectId = (0, pagination_1.parseIdQuery)(req.query.subjectId);
        const chapterId = (0, pagination_1.parseIdQuery)(req.query.chapterId);
        const createdBy = (0, pagination_1.parseIdQuery)(req.query.createdBy);
        const questionType = typeof req.query.questionType === "string" ? req.query.questionType : undefined;
        const difficulty = typeof req.query.difficulty === "string" ? req.query.difficulty : undefined;
        const isActive = (0, pagination_1.parseBooleanQuery)(req.query.isActive);
        const questionRepo = db_1.AppDataSource.getRepository(question_1.Question);
        const questions = await questionRepo.find({
            relations: {
                institute: true,
                level: true,
                subject: true,
                chapter: true,
                creator: true,
                options: true,
            },
            order: { id: "ASC", options: { id: "ASC" } },
        });
        const search = q?.toLowerCase();
        const filtered = questions.filter((question) => {
            if (question.isDeleted)
                return false;
            if (instituteId && question.instituteId !== instituteId)
                return false;
            if (levelId && question.levelId !== levelId)
                return false;
            if (subjectId && question.subjectId !== subjectId)
                return false;
            if (chapterId && question.chapterId !== chapterId)
                return false;
            if (createdBy && question.createdBy !== createdBy)
                return false;
            if (questionType && question.questionType !== questionType)
                return false;
            if (difficulty && question.difficulty !== difficulty)
                return false;
            if (isActive !== undefined && question.isActive !== isActive)
                return false;
            if (search) {
                return ((question.questionText ?? "").toLowerCase().includes(search) ||
                    (question.explanationText ?? "").toLowerCase().includes(search));
            }
            return true;
        });
        const total = filtered.length;
        const data = (0, pagination_1.paginateArray)(filtered, skip, limit);
        return res.json({ success: true, data, pagination: (0, pagination_1.buildPagination)(page, limit, total) });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch questions" });
    }
};
exports.getQuestions = getQuestions;
const getQuestionById = async (req, res) => {
    try {
        const questionRepo = db_1.AppDataSource.getRepository(question_1.Question);
        const question = await questionRepo.findOne({
            where: { id: req.params.id },
            relations: {
                institute: true,
                level: true,
                subject: true,
                chapter: true,
                creator: true,
                options: true,
            },
            order: { options: { id: "ASC" } },
        });
        if (!question) {
            return res.status(404).json({ success: false, error: "Question not found" });
        }
        return res.json({ success: true, data: question });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch question" });
    }
};
exports.getQuestionById = getQuestionById;
const updateQuestion = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const questionRepo = db_1.AppDataSource.getRepository(question_1.Question);
        const optionRepo = db_1.AppDataSource.getRepository(question_option_1.QuestionOption);
        const question = await questionRepo.findOne({ where: { id: req.params.id } });
        if (!question) {
            return res.status(404).json({ success: false, error: "Question not found" });
        }
        const body = req.body;
        const nextInstituteId = body.instituteId ?? question.instituteId;
        const nextLevelId = body.levelId ?? question.levelId;
        const nextSubjectId = body.subjectId ?? question.subjectId;
        const nextChapterId = body.chapterId !== undefined ? body.chapterId : question.chapterId;
        const nextCreatedBy = question.createdBy;
        const refError = await verifyReferences(nextInstituteId, nextLevelId, nextSubjectId, nextChapterId, nextCreatedBy);
        if (refError) {
            return res.status(400).json({ success: false, error: refError });
        }
        question.instituteId = nextInstituteId;
        question.levelId = nextLevelId;
        question.subjectId = nextSubjectId;
        if (body.chapterId !== undefined)
            question.chapterId = body.chapterId ?? null;
        if (body.questionType !== undefined)
            question.questionType = body.questionType;
        if (body.difficulty !== undefined)
            question.difficulty = body.difficulty;
        if (body.questionText !== undefined)
            question.questionText = body.questionText ?? null;
        if (body.questionImageBase64 !== undefined) {
            question.questionImageBase64 = body.questionImageBase64 ?? null;
        }
        if (body.questionImageMime !== undefined)
            question.questionImageMime = body.questionImageMime ?? null;
        if (body.marks !== undefined)
            question.marks = body.marks;
        if (body.negativeMarks !== undefined)
            question.negativeMarks = body.negativeMarks;
        if (body.explanationText !== undefined)
            question.explanationText = body.explanationText ?? null;
        if (body.explanationImageBase64 !== undefined) {
            question.explanationImageBase64 = body.explanationImageBase64 ?? null;
        }
        if (body.explanationImageMime !== undefined) {
            question.explanationImageMime = body.explanationImageMime ?? null;
        }
        if (body.isActive !== undefined)
            question.isActive = toBoolean(body.isActive, question.isActive);
        question.updatedBy = actorId;
        await questionRepo.save(question);
        if (body.options !== undefined) {
            await optionRepo.delete({ questionId: question.id });
            if (body.options.length > 0) {
                const options = normalizeOptions(body.options).map((option) => optionRepo.create({ ...option, questionId: question.id }));
                await optionRepo.save(options);
            }
        }
        const withRelations = await questionRepo.findOne({
            where: { id: question.id },
            relations: {
                institute: true,
                level: true,
                subject: true,
                chapter: true,
                creator: true,
                options: true,
            },
            order: { options: { id: "ASC" } },
        });
        return res.json({ success: true, data: withRelations });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to update question" });
    }
};
exports.updateQuestion = updateQuestion;
const deleteQuestion = async (req, res) => {
    try {
        const actorId = req.decoded?.userId ?? null;
        const questionRepo = db_1.AppDataSource.getRepository(question_1.Question);
        const question = await questionRepo.findOne({ where: { id: req.params.id } });
        if (!question) {
            return res.status(404).json({ success: false, error: "Question not found" });
        }
        question.isDeleted = true;
        question.isActive = false;
        question.updatedBy = actorId;
        await questionRepo.save(question);
        return res.json({ success: true, message: "Question deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: "Failed to delete question" });
    }
};
exports.deleteQuestion = deleteQuestion;
