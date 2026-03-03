"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exam = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("./enums");
const institute_1 = require("./institute");
const level_1 = require("./level");
const subject_1 = require("./subject");
const users_1 = require("./users");
const exam_question_1 = require("./exam-question");
const exam_attempt_1 = require("./exam-attempt");
let Exam = class Exam {
};
exports.Exam = Exam;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint" }),
    __metadata("design:type", String)
], Exam.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "institute_id", type: "bigint" }),
    __metadata("design:type", String)
], Exam.prototype, "instituteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 200 }),
    __metadata("design:type", String)
], Exam.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], Exam.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "subject_id", type: "bigint" }),
    __metadata("design:type", String)
], Exam.prototype, "subjectId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "level_id", type: "bigint" }),
    __metadata("design:type", String)
], Exam.prototype, "levelId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "no_of_questions", type: "int" }),
    __metadata("design:type", Number)
], Exam.prototype, "noOfQuestions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "duration_minutes", type: "int", default: () => "60" }),
    __metadata("design:type", Number)
], Exam.prototype, "durationMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "attempts_enabled", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Exam.prototype, "attemptsEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "max_attempts", type: "int", default: () => "1" }),
    __metadata("design:type", Number)
], Exam.prototype, "maxAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "negative_mark", type: "decimal", precision: 6, scale: 2, default: () => "0.00" }),
    __metadata("design:type", String)
], Exam.prototype, "negativeMark", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "practice_warning_on_submit", type: "varchar", length: 800, nullable: true }),
    __metadata("design:type", Object)
], Exam.prototype, "practiceWarningOnSubmit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: () => "0.00" }),
    __metadata("design:type", String)
], Exam.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_paid", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Exam.prototype, "isPaid", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "start_at", type: "timestamp" }),
    __metadata("design:type", Date)
], Exam.prototype, "startAt", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "end_at", type: "timestamp" }),
    __metadata("design:type", Date)
], Exam.prototype, "endAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: enums_1.ExamStatus.DRAFT }),
    __metadata("design:type", String)
], Exam.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "shuffle_questions", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Exam.prototype, "shuffleQuestions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "shuffle_options", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Exam.prototype, "shuffleOptions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Exam.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_deleted", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Exam.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], Exam.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Exam.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "updated_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], Exam.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "updated_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], Exam.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => institute_1.Institute, (i) => i.exams, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "institute_id" }),
    __metadata("design:type", institute_1.Institute)
], Exam.prototype, "institute", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => level_1.Level, (l) => l.exams, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "level_id" }),
    __metadata("design:type", level_1.Level)
], Exam.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_1.Subject, (s) => s.exams, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "subject_id" }),
    __metadata("design:type", subject_1.Subject)
], Exam.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_1.UserAccount, { onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "created_by" }),
    __metadata("design:type", Object)
], Exam.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => exam_question_1.ExamQuestion, (eq) => eq.exam, { cascade: true }),
    __metadata("design:type", Array)
], Exam.prototype, "examQuestions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => exam_attempt_1.ExamAttempt, (a) => a.exam),
    __metadata("design:type", Array)
], Exam.prototype, "attempts", void 0);
exports.Exam = Exam = __decorate([
    (0, typeorm_1.Entity)({ name: "exam" })
], Exam);
