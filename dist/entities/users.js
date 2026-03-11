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
exports.UserAccount = void 0;
const typeorm_1 = require("typeorm");
const institute_1 = require("./institute");
const role_1 = require("./role");
const enums_1 = require("./enums");
let UserAccount = class UserAccount {
};
exports.UserAccount = UserAccount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint" }),
    __metadata("design:type", String)
], UserAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "institute_id", type: "bigint" }),
    __metadata("design:type", String)
], UserAccount.prototype, "instituteId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "role_id", type: "bigint" }),
    __metadata("design:type", String)
], UserAccount.prototype, "roleId", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ name: "reg_no", type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", Object)
], UserAccount.prototype, "regNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "full_name", type: "varchar", length: 200 }),
    __metadata("design:type", String)
], UserAccount.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 200, nullable: true }),
    __metadata("design:type", Object)
], UserAccount.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 30, nullable: true }),
    __metadata("design:type", Object)
], UserAccount.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "password_hash", type: "varchar", length: 255 }),
    __metadata("design:type", String)
], UserAccount.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 20, default: enums_1.UserStatus.ACTIVE }),
    __metadata("design:type", String)
], UserAccount.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "last_login_at", type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], UserAccount.prototype, "lastLoginAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_active", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], UserAccount.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_deleted", type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], UserAccount.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "batch_from", type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], UserAccount.prototype, "batchFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "batch_to", type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], UserAccount.prototype, "batchTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], UserAccount.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], UserAccount.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "updated_by", type: "bigint", nullable: true }),
    __metadata("design:type", Object)
], UserAccount.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "updated_at",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], UserAccount.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => institute_1.Institute, (i) => i.users, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "institute_id" }),
    __metadata("design:type", institute_1.Institute)
], UserAccount.prototype, "institute", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_1.Role, (r) => r.users, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "role_id" }),
    __metadata("design:type", role_1.Role)
], UserAccount.prototype, "role", void 0);
exports.UserAccount = UserAccount = __decorate([
    (0, typeorm_1.Entity)({ name: "user_account" })
], UserAccount);
