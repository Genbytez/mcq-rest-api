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
exports.Subject = void 0;
const typeorm_1 = require("typeorm");
const institute_1 = require("./institute");
const level_1 = require("./level");
const chapter_1 = require("./chapter");
const question_1 = require("./question");
const exam_1 = require("./exam");
let Subject = class Subject {
};
exports.Subject = Subject;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint" }),
    __metadata("design:type", String)
], Subject.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "institute_id", type: "bigint" }),
    __metadata("design:type", String)
], Subject.prototype, "instituteId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "level_id", type: "bigint" }),
    __metadata("design:type", String)
], Subject.prototype, "levelId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Subject.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 500, nullable: true }),
    __metadata("design:type", Object)
], Subject.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Subject.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_deleted", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Subject.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], Subject.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Subject.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "updated_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], Subject.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "updated_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], Subject.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => institute_1.Institute, (i) => i.subjects, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "institute_id" }),
    __metadata("design:type", institute_1.Institute)
], Subject.prototype, "institute", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => level_1.Level, (l) => l.subjects, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "level_id" }),
    __metadata("design:type", level_1.Level)
], Subject.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chapter_1.Chapter, (c) => c.subject),
    __metadata("design:type", Array)
], Subject.prototype, "chapters", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => question_1.Question, (q) => q.subject),
    __metadata("design:type", Array)
], Subject.prototype, "questions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => exam_1.Exam, (e) => e.subject),
    __metadata("design:type", Array)
], Subject.prototype, "exams", void 0);
exports.Subject = Subject = __decorate([
    (0, typeorm_1.Entity)({ name: "subject" })
], Subject);
