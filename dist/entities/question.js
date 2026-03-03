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
exports.Question = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("./enums");
const institute_1 = require("./institute");
const subject_1 = require("./subject");
const level_1 = require("./level");
const chapter_1 = require("./chapter");
const users_1 = require("./users");
const question_option_1 = require("./question-option");
let Question = class Question {
};
exports.Question = Question;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint" }),
    __metadata("design:type", String)
], Question.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "institute_id", type: "bigint" }),
    __metadata("design:type", String)
], Question.prototype, "instituteId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "level_id", type: "bigint" }),
    __metadata("design:type", String)
], Question.prototype, "levelId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "subject_id", type: "bigint" }),
    __metadata("design:type", String)
], Question.prototype, "subjectId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "chapter_id", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], Question.prototype, "chapterId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "question_type", type: "varchar", length: 20, default: enums_1.QuestionType.MCQ }),
    __metadata("design:type", String)
], Question.prototype, "questionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: enums_1.Difficulty.MEDIUM }),
    __metadata("design:type", String)
], Question.prototype, "difficulty", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "question_text", type: "text", nullable: true }),
    __metadata("design:type", Object)
], Question.prototype, "questionText", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "question_image_base64", type: "text", nullable: true }),
    __metadata("design:type", Object)
], Question.prototype, "questionImageBase64", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "question_image_mime", type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", Object)
], Question.prototype, "questionImageMime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 6, scale: 2, default: () => "1.00" }),
    __metadata("design:type", String)
], Question.prototype, "marks", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "negative_marks", type: "decimal", precision: 6, scale: 2, default: () => "0.00" }),
    __metadata("design:type", String)
], Question.prototype, "negativeMarks", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "explanation_text", type: "text", nullable: true }),
    __metadata("design:type", Object)
], Question.prototype, "explanationText", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "explanation_image_base64", type: "text", nullable: true }),
    __metadata("design:type", Object)
], Question.prototype, "explanationImageBase64", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "explanation_image_mime", type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", Object)
], Question.prototype, "explanationImageMime", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "is_active", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Question.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_deleted", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Question.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], Question.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Question.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "updated_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], Question.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "updated_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], Question.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => institute_1.Institute, (i) => i.questions, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "institute_id" }),
    __metadata("design:type", institute_1.Institute)
], Question.prototype, "institute", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => level_1.Level, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "level_id" }),
    __metadata("design:type", level_1.Level)
], Question.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_1.Subject, (s) => s.questions, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "subject_id" }),
    __metadata("design:type", subject_1.Subject)
], Question.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chapter_1.Chapter, { onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "chapter_id" }),
    __metadata("design:type", Object)
], Question.prototype, "chapter", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_1.UserAccount, { onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "created_by" }),
    __metadata("design:type", Object)
], Question.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => question_option_1.QuestionOption, (o) => o.question, { cascade: true }),
    __metadata("design:type", Array)
], Question.prototype, "options", void 0);
exports.Question = Question = __decorate([
    (0, typeorm_1.Entity)({ name: "question" })
], Question);
