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
exports.ExamAttempt = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("./enums");
const exam_1 = require("./exam");
const users_1 = require("./users");
const attempt_answer_1 = require("./attempt-answer");
let ExamAttempt = class ExamAttempt {
};
exports.ExamAttempt = ExamAttempt;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint" }),
    __metadata("design:type", String)
], ExamAttempt.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "exam_id", type: "bigint" }),
    __metadata("design:type", String)
], ExamAttempt.prototype, "examId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "student_id", type: "bigint" }),
    __metadata("design:type", String)
], ExamAttempt.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "attempt_no", type: "int", default: () => "1" }),
    __metadata("design:type", Number)
], ExamAttempt.prototype, "attemptNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "started_at", type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], ExamAttempt.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "submitted_at", type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], ExamAttempt.prototype, "submittedAt", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: enums_1.AttemptStatus.NOT_STARTED }),
    __metadata("design:type", String)
], ExamAttempt.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 8, scale: 2, default: () => "0.00" }),
    __metadata("design:type", String)
], ExamAttempt.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "max_score", type: "decimal", precision: 8, scale: 2, default: () => "0.00" }),
    __metadata("design:type", String)
], ExamAttempt.prototype, "maxScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "correct_count", type: "int", default: () => "0" }),
    __metadata("design:type", Number)
], ExamAttempt.prototype, "correctCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "wrong_count", type: "int", default: () => "0" }),
    __metadata("design:type", Number)
], ExamAttempt.prototype, "wrongCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "skipped_count", type: "int", default: () => "0" }),
    __metadata("design:type", Number)
], ExamAttempt.prototype, "skippedCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], ExamAttempt.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_deleted", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], ExamAttempt.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], ExamAttempt.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], ExamAttempt.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "updated_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], ExamAttempt.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "updated_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], ExamAttempt.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => exam_1.Exam, (e) => e.attempts, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "exam_id" }),
    __metadata("design:type", exam_1.Exam)
], ExamAttempt.prototype, "exam", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_1.UserAccount, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "student_id" }),
    __metadata("design:type", users_1.UserAccount)
], ExamAttempt.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => attempt_answer_1.AttemptAnswer, (a) => a.attempt, { cascade: true }),
    __metadata("design:type", Array)
], ExamAttempt.prototype, "answers", void 0);
exports.ExamAttempt = ExamAttempt = __decorate([
    (0, typeorm_1.Entity)({ name: "exam_attempt" }),
    (0, typeorm_1.Unique)(["examId", "studentId", "attemptNo"])
], ExamAttempt);
