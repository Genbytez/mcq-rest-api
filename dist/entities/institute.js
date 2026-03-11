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
exports.Institute = void 0;
const typeorm_1 = require("typeorm");
const users_1 = require("./users");
const level_1 = require("./level");
const subject_1 = require("./subject");
const chapter_1 = require("./chapter");
const question_1 = require("./question");
const exam_1 = require("./exam");
const department_1 = require("./department");
let Institute = class Institute {
};
exports.Institute = Institute;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint" }),
    __metadata("design:type", String)
], Institute.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], Institute.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 200 }),
    __metadata("design:type", String)
], Institute.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 500, nullable: true }),
    __metadata("design:type", Object)
], Institute.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", Object)
], Institute.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "phone_number", type: "varchar", length: 20, nullable: true }),
    __metadata("design:type", Object)
], Institute.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", Object)
], Institute.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Institute.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_deleted", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Institute.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], Institute.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Institute.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "updated_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], Institute.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "updated_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], Institute.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => users_1.UserAccount, (u) => u.institute),
    __metadata("design:type", Array)
], Institute.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => level_1.Level, (l) => l.institute),
    __metadata("design:type", Array)
], Institute.prototype, "levels", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subject_1.Subject, (s) => s.institute),
    __metadata("design:type", Array)
], Institute.prototype, "subjects", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chapter_1.Chapter, (c) => c.institute),
    __metadata("design:type", Array)
], Institute.prototype, "chapters", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => question_1.Question, (q) => q.institute),
    __metadata("design:type", Array)
], Institute.prototype, "questions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => exam_1.Exam, (e) => e.institute),
    __metadata("design:type", Array)
], Institute.prototype, "exams", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => department_1.Department, (d) => d.institute),
    __metadata("design:type", Array)
], Institute.prototype, "departments", void 0);
exports.Institute = Institute = __decorate([
    (0, typeorm_1.Entity)({ name: "institute" })
], Institute);
