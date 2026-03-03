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
exports.QuestionOption = void 0;
const typeorm_1 = require("typeorm");
const question_1 = require("./question");
let QuestionOption = class QuestionOption {
};
exports.QuestionOption = QuestionOption;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint" }),
    __metadata("design:type", String)
], QuestionOption.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "question_id", type: "bigint" }),
    __metadata("design:type", String)
], QuestionOption.prototype, "questionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "option_key", type: "char", length: 1 }),
    __metadata("design:type", String)
], QuestionOption.prototype, "optionKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "option_text", type: "text", nullable: true }),
    __metadata("design:type", Object)
], QuestionOption.prototype, "optionText", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "option_image_base64", type: "text", nullable: true }),
    __metadata("design:type", Object)
], QuestionOption.prototype, "optionImageBase64", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "option_image_mime", type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", Object)
], QuestionOption.prototype, "optionImageMime", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "is_correct", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], QuestionOption.prototype, "isCorrect", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], QuestionOption.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_deleted", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], QuestionOption.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], QuestionOption.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], QuestionOption.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "updated_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], QuestionOption.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "updated_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], QuestionOption.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => question_1.Question, (q) => q.options, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "question_id" }),
    __metadata("design:type", question_1.Question)
], QuestionOption.prototype, "question", void 0);
exports.QuestionOption = QuestionOption = __decorate([
    (0, typeorm_1.Entity)({ name: "question_option" }),
    (0, typeorm_1.Unique)(["questionId", "optionKey"])
], QuestionOption);
