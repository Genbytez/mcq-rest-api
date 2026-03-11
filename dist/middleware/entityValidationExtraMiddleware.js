"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAttemptAnswerUpdate = exports.validateAttemptAnswerCreate = exports.validateExamAttemptUpdate = exports.validateExamAttemptCreate = exports.validateExamQuestionUpdate = exports.validateExamQuestionCreate = exports.validateExamUpdate = exports.validateExamCreate = exports.validateQuestionOptionUpdate = exports.validateQuestionOptionCreate = exports.validateChapterUpdate = exports.validateChapterCreate = exports.validateInstituteUpdate = exports.validateInstituteCreate = void 0;
const enums_1 = require("../entities/enums");
const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const isValidId = (value) => {
    if (typeof value === "number")
        return Number.isInteger(value) && value > 0;
    if (typeof value === "string")
        return /^\d+$/.test(value) && Number(value) > 0;
    return false;
};
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const isOptionalString = (value) => value === undefined || value === null || typeof value === "string";
const isBooleanLike = (value) => typeof value === "boolean" || value === "true" || value === "false" || value === 1 || value === 0 || value === "1" || value === "0";
const isNumberLike = (value) => {
    if (typeof value === "number")
        return Number.isFinite(value);
    if (typeof value === "string")
        return value.trim().length > 0 && !Number.isNaN(Number(value));
    return false;
};
const isEnumValue = (value, enumType) => typeof value === "string" && Object.values(enumType).includes(value);
const requireBody = (req, res) => {
    if (!isObject(req.body)) {
        res.status(400).json({ success: false, errors: ["Request body must be an object"] });
        return false;
    }
    return true;
};
const sendErrors = (res, errors) => res.status(400).json({ success: false, errors });
const hasAny = (body, fields) => fields.some((field) => body[field] !== undefined);
const isDateLike = (value) => (typeof value === "string" || value instanceof Date) && !Number.isNaN(new Date(value).getTime());
const validateInstituteCreate = (req, res, next) => {
    if (!requireBody(req, res))
        return;
    const errors = [];
    if (!isNonEmptyString(req.body.code))
        errors.push("code is required");
    if (!isNonEmptyString(req.body.name))
        errors.push("name is required");
    if (!isOptionalString(req.body.address))
        errors.push("address must be string or null");
    if (req.body.phoneNumber !== undefined && !isOptionalString(req.body.phoneNumber))
        errors.push("phoneNumber must be string or null");
    if (req.body.isActive !== undefined && !isBooleanLike(req.body.isActive))
        errors.push("isActive must be boolean");
    if (errors.length > 0)
        return sendErrors(res, errors);
    next();
};
exports.validateInstituteCreate = validateInstituteCreate;
const validateInstituteUpdate = (req, res, next) => {
    if (!requireBody(req, res))
        return;
    if (!hasAny(req.body, ["code", "name", "address", "isActive", "phoneNumber"])) {
        return sendErrors(res, ["At least one updatable field is required"]);
    }
    const errors = [];
    if (req.body.code !== undefined && !isNonEmptyString(req.body.code))
        errors.push("code must be non-empty string");
    if (req.body.name !== undefined && !isNonEmptyString(req.body.name))
        errors.push("name must be non-empty string");
    if (req.body.address !== undefined && !isOptionalString(req.body.address))
        errors.push("address must be string or null");
    if (req.body.phoneNumber !== undefined && !isOptionalString(req.body.phoneNumber))
        errors.push("phoneNumber must be string or null");
    if (req.body.isActive !== undefined && !isBooleanLike(req.body.isActive))
        errors.push("isActive must be boolean");
    if (errors.length > 0)
        return sendErrors(res, errors);
    next();
};
exports.validateInstituteUpdate = validateInstituteUpdate;
const validateChapterCreate = (req, res, next) => {
    if (!requireBody(req, res))
        return;
    const errors = [];
    if (!isValidId(req.body.instituteId))
        errors.push("instituteId is required and must be valid id");
    if (!isValidId(req.body.subjectId))
        errors.push("subjectId is required and must be valid id");
    if (!isNonEmptyString(req.body.name))
        errors.push("name is required");
    if (req.body.sortOrder !== undefined && !isNumberLike(req.body.sortOrder))
        errors.push("sortOrder must be numeric");
    if (req.body.isActive !== undefined && !isBooleanLike(req.body.isActive))
        errors.push("isActive must be boolean");
    if (errors.length > 0)
        return sendErrors(res, errors);
    next();
};
exports.validateChapterCreate = validateChapterCreate;
const validateChapterUpdate = (req, res, next) => {
    if (!requireBody(req, res))
        return;
    if (!hasAny(req.body, ["instituteId", "subjectId", "name", "sortOrder", "isActive"])) {
        return sendErrors(res, ["At least one updatable field is required"]);
    }
    const errors = [];
    if (req.body.instituteId !== undefined && !isValidId(req.body.instituteId))
        errors.push("instituteId must be valid id");
    if (req.body.subjectId !== undefined && !isValidId(req.body.subjectId))
        errors.push("subjectId must be valid id");
    if (req.body.name !== undefined && !isNonEmptyString(req.body.name))
        errors.push("name must be non-empty string");
    if (req.body.sortOrder !== undefined && !isNumberLike(req.body.sortOrder))
        errors.push("sortOrder must be numeric");
    if (req.body.isActive !== undefined && !isBooleanLike(req.body.isActive))
        errors.push("isActive must be boolean");
    if (errors.length > 0)
        return sendErrors(res, errors);
    next();
};
exports.validateChapterUpdate = validateChapterUpdate;
const validateQuestionOptionCreate = (req, res, next) => {
    if (!requireBody(req, res))
        return;
    const errors = [];
    if (!isValidId(req.body.questionId))
        errors.push("questionId is required and must be valid id");
    if (!["A", "B", "C", "D"].includes(String(req.body.optionKey)))
        errors.push("optionKey must be one of A/B/C/D");
    if (!isOptionalString(req.body.optionText))
        errors.push("optionText must be string or null");
    if (!isOptionalString(req.body.optionImageBase64))
        errors.push("optionImageBase64 must be string or null");
    if (!isOptionalString(req.body.optionImageMime))
        errors.push("optionImageMime must be string or null");
    if (req.body.isCorrect !== undefined && !isBooleanLike(req.body.isCorrect))
        errors.push("isCorrect must be boolean");
    const hasText = isNonEmptyString(req.body.optionText);
    const hasImage = isNonEmptyString(req.body.optionImageBase64);
    if (!hasText && !hasImage)
        errors.push("optionText or optionImageBase64 is required");
    if (errors.length > 0)
        return sendErrors(res, errors);
    next();
};
exports.validateQuestionOptionCreate = validateQuestionOptionCreate;
const validateQuestionOptionUpdate = (req, res, next) => {
    if (!requireBody(req, res))
        return;
    if (!hasAny(req.body, ["questionId", "optionKey", "optionText", "optionImageBase64", "optionImageMime", "isCorrect"])) {
        return sendErrors(res, ["At least one updatable field is required"]);
    }
    const errors = [];
    if (req.body.questionId !== undefined && !isValidId(req.body.questionId))
        errors.push("questionId must be valid id");
    if (req.body.optionKey !== undefined && !["A", "B", "C", "D"].includes(String(req.body.optionKey))) {
        errors.push("optionKey must be one of A/B/C/D");
    }
    if (req.body.optionText !== undefined && !isOptionalString(req.body.optionText))
        errors.push("optionText must be string or null");
    if (req.body.optionImageBase64 !== undefined && !isOptionalString(req.body.optionImageBase64))
        errors.push("optionImageBase64 must be string or null");
    if (req.body.optionImageMime !== undefined && !isOptionalString(req.body.optionImageMime))
        errors.push("optionImageMime must be string or null");
    if (req.body.isCorrect !== undefined && !isBooleanLike(req.body.isCorrect))
        errors.push("isCorrect must be boolean");
    if (errors.length > 0)
        return sendErrors(res, errors);
    next();
};
exports.validateQuestionOptionUpdate = validateQuestionOptionUpdate;
const validateExamCreate = (req, res, next) => {
    if (!requireBody(req, res))
        return;
    const errors = [];
    if (!isValidId(req.body.instituteId))
        errors.push("instituteId is required and must be valid id");
    if (!isValidId(req.body.subjectId))
        errors.push("subjectId is required and must be valid id");
    if (!isValidId(req.body.levelId))
        errors.push("levelId is required and must be valid id");
    if (!isNonEmptyString(req.body.title))
        errors.push("title is required");
    if (req.body.description !== undefined && !isOptionalString(req.body.description))
        errors.push("description must be string or null");
    if (req.body.noOfQuestions === undefined || !isNumberLike(req.body.noOfQuestions))
        errors.push("noOfQuestions is required and must be numeric");
    if (req.body.durationMinutes !== undefined && !isNumberLike(req.body.durationMinutes))
        errors.push("durationMinutes must be numeric");
    if (req.body.attemptsEnabled !== undefined && !isBooleanLike(req.body.attemptsEnabled))
        errors.push("attemptsEnabled must be boolean");
    if (req.body.maxAttempts !== undefined && !isNumberLike(req.body.maxAttempts))
        errors.push("maxAttempts must be numeric");
    if (req.body.negativeMark !== undefined && !isNumberLike(req.body.negativeMark))
        errors.push("negativeMark must be numeric");
    if (req.body.practiceWarningOnSubmit !== undefined && !isOptionalString(req.body.practiceWarningOnSubmit))
        errors.push("practiceWarningOnSubmit must be string or null");
    if (req.body.amount !== undefined && !isNumberLike(req.body.amount))
        errors.push("amount must be numeric");
    if (req.body.isPaid !== undefined && !isBooleanLike(req.body.isPaid))
        errors.push("isPaid must be boolean");
    if (!isDateLike(req.body.startAt))
        errors.push("startAt is required and must be a valid date");
    if (!isDateLike(req.body.endAt))
        errors.push("endAt is required and must be a valid date");
    if (isDateLike(req.body.startAt) && isDateLike(req.body.endAt) && new Date(req.body.startAt).getTime() >= new Date(req.body.endAt).getTime()) {
        errors.push("startAt must be before endAt");
    }
    if (req.body.status !== undefined && !isEnumValue(req.body.status, enums_1.ExamStatus)) {
        errors.push(`status must be one of ${Object.values(enums_1.ExamStatus).join(", ")}`);
    }
    if (req.body.shuffleQuestions !== undefined && !isBooleanLike(req.body.shuffleQuestions))
        errors.push("shuffleQuestions must be boolean");
    if (req.body.shuffleOptions !== undefined && !isBooleanLike(req.body.shuffleOptions))
        errors.push("shuffleOptions must be boolean");
    if (req.body.createdBy !== undefined && req.body.createdBy !== null && !isValidId(req.body.createdBy))
        errors.push("createdBy must be valid id or null");
    if (errors.length > 0)
        return sendErrors(res, errors);
    next();
};
exports.validateExamCreate = validateExamCreate;
const validateExamUpdate = (req, res, next) => {
    if (!requireBody(req, res))
        return;
    const fields = ["instituteId", "title", "description", "subjectId", "levelId", "noOfQuestions", "durationMinutes", "attemptsEnabled", "maxAttempts", "negativeMark", "practiceWarningOnSubmit", "amount", "isPaid", "startAt", "endAt", "status", "shuffleQuestions", "shuffleOptions", "createdBy"];
    if (!hasAny(req.body, fields))
        return sendErrors(res, ["At least one updatable field is required"]);
    const errors = [];
    if (req.body.instituteId !== undefined && !isValidId(req.body.instituteId))
        errors.push("instituteId must be valid id");
    if (req.body.subjectId !== undefined && !isValidId(req.body.subjectId))
        errors.push("subjectId must be valid id");
    if (req.body.levelId !== undefined && !isValidId(req.body.levelId))
        errors.push("levelId must be valid id");
    if (req.body.title !== undefined && !isNonEmptyString(req.body.title))
        errors.push("title must be non-empty string");
    if (req.body.description !== undefined && !isOptionalString(req.body.description))
        errors.push("description must be string or null");
    if (req.body.noOfQuestions !== undefined && !isNumberLike(req.body.noOfQuestions))
        errors.push("noOfQuestions must be numeric");
    if (req.body.durationMinutes !== undefined && !isNumberLike(req.body.durationMinutes))
        errors.push("durationMinutes must be numeric");
    if (req.body.attemptsEnabled !== undefined && !isBooleanLike(req.body.attemptsEnabled))
        errors.push("attemptsEnabled must be boolean");
    if (req.body.maxAttempts !== undefined && !isNumberLike(req.body.maxAttempts))
        errors.push("maxAttempts must be numeric");
    if (req.body.negativeMark !== undefined && !isNumberLike(req.body.negativeMark))
        errors.push("negativeMark must be numeric");
    if (req.body.practiceWarningOnSubmit !== undefined && !isOptionalString(req.body.practiceWarningOnSubmit))
        errors.push("practiceWarningOnSubmit must be string or null");
    if (req.body.amount !== undefined && !isNumberLike(req.body.amount))
        errors.push("amount must be numeric");
    if (req.body.isPaid !== undefined && !isBooleanLike(req.body.isPaid))
        errors.push("isPaid must be boolean");
    if (req.body.startAt !== undefined && !isDateLike(req.body.startAt))
        errors.push("startAt must be valid date");
    if (req.body.endAt !== undefined && !isDateLike(req.body.endAt))
        errors.push("endAt must be valid date");
    if (req.body.status !== undefined && !isEnumValue(req.body.status, enums_1.ExamStatus))
        errors.push(`status must be one of ${Object.values(enums_1.ExamStatus).join(", ")}`);
    if (req.body.shuffleQuestions !== undefined && !isBooleanLike(req.body.shuffleQuestions))
        errors.push("shuffleQuestions must be boolean");
    if (req.body.shuffleOptions !== undefined && !isBooleanLike(req.body.shuffleOptions))
        errors.push("shuffleOptions must be boolean");
    if (req.body.createdBy !== undefined && req.body.createdBy !== null && !isValidId(req.body.createdBy))
        errors.push("createdBy must be valid id or null");
    if (errors.length > 0)
        return sendErrors(res, errors);
    next();
};
exports.validateExamUpdate = validateExamUpdate;
const validateExamQuestionCreate = (req, res, next) => {
    if (!requireBody(req, res))
        return;
    const errors = [];
    if (!isValidId(req.body.examId))
        errors.push("examId is required and must be valid id");
    if (!isValidId(req.body.questionId))
        errors.push("questionId is required and must be valid id");
    if (req.body.sortOrder !== undefined && !isNumberLike(req.body.sortOrder))
        errors.push("sortOrder must be numeric");
    if (errors.length > 0)
        return sendErrors(res, errors);
    next();
};
exports.validateExamQuestionCreate = validateExamQuestionCreate;
const validateExamQuestionUpdate = (req, res, next) => {
    if (!requireBody(req, res))
        return;
    if (!hasAny(req.body, ["examId", "questionId", "sortOrder"]))
        return sendErrors(res, ["At least one updatable field is required"]);
    const errors = [];
    if (req.body.examId !== undefined && !isValidId(req.body.examId))
        errors.push("examId must be valid id");
    if (req.body.questionId !== undefined && !isValidId(req.body.questionId))
        errors.push("questionId must be valid id");
    if (req.body.sortOrder !== undefined && !isNumberLike(req.body.sortOrder))
        errors.push("sortOrder must be numeric");
    if (errors.length > 0)
        return sendErrors(res, errors);
    next();
};
exports.validateExamQuestionUpdate = validateExamQuestionUpdate;
const validateExamAttemptCreate = (req, res, next) => {
    if (!requireBody(req, res))
        return;
    const errors = [];
    if (!isValidId(req.body.examId))
        errors.push("examId is required and must be valid id");
    if (!isValidId(req.body.studentId))
        errors.push("studentId is required and must be valid id");
    if (req.body.attemptNo !== undefined && !isNumberLike(req.body.attemptNo))
        errors.push("attemptNo must be numeric");
    if (req.body.startedAt !== undefined && req.body.startedAt !== null && !isDateLike(req.body.startedAt))
        errors.push("startedAt must be valid date or null");
    if (req.body.submittedAt !== undefined && req.body.submittedAt !== null && !isDateLike(req.body.submittedAt))
        errors.push("submittedAt must be valid date or null");
    if (req.body.status !== undefined && !isEnumValue(req.body.status, enums_1.AttemptStatus))
        errors.push(`status must be one of ${Object.values(enums_1.AttemptStatus).join(", ")}`);
    if (req.body.score !== undefined && !isNumberLike(req.body.score))
        errors.push("score must be numeric");
    if (req.body.maxScore !== undefined && !isNumberLike(req.body.maxScore))
        errors.push("maxScore must be numeric");
    if (req.body.correctCount !== undefined && !isNumberLike(req.body.correctCount))
        errors.push("correctCount must be numeric");
    if (req.body.wrongCount !== undefined && !isNumberLike(req.body.wrongCount))
        errors.push("wrongCount must be numeric");
    if (req.body.skippedCount !== undefined && !isNumberLike(req.body.skippedCount))
        errors.push("skippedCount must be numeric");
    if (errors.length > 0)
        return sendErrors(res, errors);
    next();
};
exports.validateExamAttemptCreate = validateExamAttemptCreate;
const validateExamAttemptUpdate = (req, res, next) => {
    if (!requireBody(req, res))
        return;
    const fields = ["examId", "studentId", "attemptNo", "startedAt", "submittedAt", "status", "score", "maxScore", "correctCount", "wrongCount", "skippedCount"];
    if (!hasAny(req.body, fields))
        return sendErrors(res, ["At least one updatable field is required"]);
    const errors = [];
    if (req.body.examId !== undefined && !isValidId(req.body.examId))
        errors.push("examId must be valid id");
    if (req.body.studentId !== undefined && !isValidId(req.body.studentId))
        errors.push("studentId must be valid id");
    if (req.body.attemptNo !== undefined && !isNumberLike(req.body.attemptNo))
        errors.push("attemptNo must be numeric");
    if (req.body.startedAt !== undefined && req.body.startedAt !== null && !isDateLike(req.body.startedAt))
        errors.push("startedAt must be valid date or null");
    if (req.body.submittedAt !== undefined && req.body.submittedAt !== null && !isDateLike(req.body.submittedAt))
        errors.push("submittedAt must be valid date or null");
    if (req.body.status !== undefined && !isEnumValue(req.body.status, enums_1.AttemptStatus))
        errors.push(`status must be one of ${Object.values(enums_1.AttemptStatus).join(", ")}`);
    if (req.body.score !== undefined && !isNumberLike(req.body.score))
        errors.push("score must be numeric");
    if (req.body.maxScore !== undefined && !isNumberLike(req.body.maxScore))
        errors.push("maxScore must be numeric");
    if (req.body.correctCount !== undefined && !isNumberLike(req.body.correctCount))
        errors.push("correctCount must be numeric");
    if (req.body.wrongCount !== undefined && !isNumberLike(req.body.wrongCount))
        errors.push("wrongCount must be numeric");
    if (req.body.skippedCount !== undefined && !isNumberLike(req.body.skippedCount))
        errors.push("skippedCount must be numeric");
    if (errors.length > 0)
        return sendErrors(res, errors);
    next();
};
exports.validateExamAttemptUpdate = validateExamAttemptUpdate;
const validateAttemptAnswerCreate = (req, res, next) => {
    if (!requireBody(req, res))
        return;
    const errors = [];
    if (!isValidId(req.body.attemptId))
        errors.push("attemptId is required and must be valid id");
    if (!isValidId(req.body.questionId))
        errors.push("questionId is required and must be valid id");
    if (req.body.selectedOptionKey !== undefined && req.body.selectedOptionKey !== null && !["A", "B", "C", "D"].includes(String(req.body.selectedOptionKey))) {
        errors.push("selectedOptionKey must be one of A/B/C/D or null");
    }
    if (req.body.isMarkedForReview !== undefined && !isBooleanLike(req.body.isMarkedForReview))
        errors.push("isMarkedForReview must be boolean");
    if (req.body.isCorrect !== undefined && req.body.isCorrect !== null && !isBooleanLike(req.body.isCorrect))
        errors.push("isCorrect must be boolean or null");
    if (req.body.marksAwarded !== undefined && !isNumberLike(req.body.marksAwarded))
        errors.push("marksAwarded must be numeric");
    if (req.body.answeredAt !== undefined && req.body.answeredAt !== null && !isDateLike(req.body.answeredAt))
        errors.push("answeredAt must be valid date or null");
    if (errors.length > 0)
        return sendErrors(res, errors);
    next();
};
exports.validateAttemptAnswerCreate = validateAttemptAnswerCreate;
const validateAttemptAnswerUpdate = (req, res, next) => {
    if (!requireBody(req, res))
        return;
    const fields = ["attemptId", "questionId", "selectedOptionKey", "isMarkedForReview", "isCorrect", "marksAwarded", "answeredAt"];
    if (!hasAny(req.body, fields))
        return sendErrors(res, ["At least one updatable field is required"]);
    const errors = [];
    if (req.body.attemptId !== undefined && !isValidId(req.body.attemptId))
        errors.push("attemptId must be valid id");
    if (req.body.questionId !== undefined && !isValidId(req.body.questionId))
        errors.push("questionId must be valid id");
    if (req.body.selectedOptionKey !== undefined && req.body.selectedOptionKey !== null && !["A", "B", "C", "D"].includes(String(req.body.selectedOptionKey))) {
        errors.push("selectedOptionKey must be one of A/B/C/D or null");
    }
    if (req.body.isMarkedForReview !== undefined && !isBooleanLike(req.body.isMarkedForReview))
        errors.push("isMarkedForReview must be boolean");
    if (req.body.isCorrect !== undefined && req.body.isCorrect !== null && !isBooleanLike(req.body.isCorrect))
        errors.push("isCorrect must be boolean or null");
    if (req.body.marksAwarded !== undefined && !isNumberLike(req.body.marksAwarded))
        errors.push("marksAwarded must be numeric");
    if (req.body.answeredAt !== undefined && req.body.answeredAt !== null && !isDateLike(req.body.answeredAt))
        errors.push("answeredAt must be valid date or null");
    if (errors.length > 0)
        return sendErrors(res, errors);
    next();
};
exports.validateAttemptAnswerUpdate = validateAttemptAnswerUpdate;
