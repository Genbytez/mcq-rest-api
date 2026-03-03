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
exports.ExamQuestion = void 0;
const typeorm_1 = require("typeorm");
const exam_1 = require("./exam");
const question_1 = require("./question");
let ExamQuestion = class ExamQuestion {
};
exports.ExamQuestion = ExamQuestion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint" }),
    __metadata("design:type", String)
], ExamQuestion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "exam_id", type: "bigint" }),
    __metadata("design:type", String)
], ExamQuestion.prototype, "examId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "question_id", type: "bigint" }),
    __metadata("design:type", String)
], ExamQuestion.prototype, "questionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "sort_order", type: "int", default: () => "0" }),
    __metadata("design:type", Number)
], ExamQuestion.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], ExamQuestion.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_deleted", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], ExamQuestion.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], ExamQuestion.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], ExamQuestion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "updated_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], ExamQuestion.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "updated_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], ExamQuestion.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => exam_1.Exam, (e) => e.examQuestions, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "exam_id" }),
    __metadata("design:type", exam_1.Exam)
], ExamQuestion.prototype, "exam", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => question_1.Question, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "question_id" }),
    __metadata("design:type", question_1.Question)
], ExamQuestion.prototype, "question", void 0);
exports.ExamQuestion = ExamQuestion = __decorate([
    (0, typeorm_1.Entity)({ name: "exam_question" }),
    (0, typeorm_1.Unique)(["examId", "questionId"])
], ExamQuestion);
