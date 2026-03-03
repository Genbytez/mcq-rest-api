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
exports.AttemptAnswer = void 0;
const typeorm_1 = require("typeorm");
const exam_attempt_1 = require("./exam-attempt");
const question_1 = require("./question");
let AttemptAnswer = class AttemptAnswer {
};
exports.AttemptAnswer = AttemptAnswer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint" }),
    __metadata("design:type", String)
], AttemptAnswer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "attempt_id", type: "bigint" }),
    __metadata("design:type", String)
], AttemptAnswer.prototype, "attemptId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "question_id", type: "bigint" }),
    __metadata("design:type", String)
], AttemptAnswer.prototype, "questionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "selected_option_key", type: "char", length: 1, nullable: true }),
    __metadata("design:type", Object)
], AttemptAnswer.prototype, "selectedOptionKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_marked_for_review", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], AttemptAnswer.prototype, "isMarkedForReview", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_correct", type: "boolean", nullable: true }),
    __metadata("design:type", Object)
], AttemptAnswer.prototype, "isCorrect", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "marks_awarded", type: "decimal", precision: 6, scale: 2, default: () => "0.00" }),
    __metadata("design:type", String)
], AttemptAnswer.prototype, "marksAwarded", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "answered_at", type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], AttemptAnswer.prototype, "answeredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], AttemptAnswer.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_deleted", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], AttemptAnswer.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], AttemptAnswer.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], AttemptAnswer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "updated_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], AttemptAnswer.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "updated_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], AttemptAnswer.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => exam_attempt_1.ExamAttempt, (a) => a.answers, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "attempt_id" }),
    __metadata("design:type", exam_attempt_1.ExamAttempt)
], AttemptAnswer.prototype, "attempt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => question_1.Question, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "question_id" }),
    __metadata("design:type", question_1.Question)
], AttemptAnswer.prototype, "question", void 0);
exports.AttemptAnswer = AttemptAnswer = __decorate([
    (0, typeorm_1.Entity)({ name: "attempt_answer" }),
    (0, typeorm_1.Unique)(["attemptId", "questionId"])
], AttemptAnswer);
