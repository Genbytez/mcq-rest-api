"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const appProperties_1 = __importDefault(require("../config/appProperties"));
const users_1 = require("../entities/users");
const { JWT_SECRET } = appProperties_1.default;
const loginUsers = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, error: "email and password are required" });
    }
    try {
        const repo = db_1.AppDataSource.getRepository(users_1.UserAccount);
        const user = await repo.findOne({
            where: { email },
            relations: { role: true },
        });
        if (!user) {
            return res.status(400).json({ success: false, error: "User does not exist" });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, error: "Invalid password" });
        }
        const payload = {
            userId: user.id,
            instituteId: user.instituteId,
            roleId: user.roleId,
            roleCode: user.role?.code,
            email: user.email,
            fullName: user.fullName,
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "24h" });
        user.lastLoginAt = new Date();
        await repo.save(user);
        return res.json({
            success: true,
            message: "Login successful",
            token,
            userContext: {
                id: user.id,
                instituteId: user.instituteId,
                roleId: user.roleId,
                roleCode: user.role?.code,
                regNo: user.regNo,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                status: user.status,
                lastLoginAt: user.lastLoginAt,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
};
exports.loginUsers = loginUsers;
