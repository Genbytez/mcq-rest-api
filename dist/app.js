"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const loggerMiddleware_1 = require("./middleware/loggerMiddleware");
const db_1 = require("./config/db");
const appProperties_1 = __importDefault(require("./config/appProperties"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const roleRoutes_1 = __importDefault(require("./routes/roleRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const levelRoutes_1 = __importDefault(require("./routes/levelRoutes"));
const subjectRoutes_1 = __importDefault(require("./routes/subjectRoutes"));
const questionRoutes_1 = __importDefault(require("./routes/questionRoutes"));
const instituteRoutes_1 = __importDefault(require("./routes/instituteRoutes"));
const chapterRoutes_1 = __importDefault(require("./routes/chapterRoutes"));
const questionOptionRoutes_1 = __importDefault(require("./routes/questionOptionRoutes"));
const examRoutes_1 = __importDefault(require("./routes/examRoutes"));
const examQuestionRoutes_1 = __importDefault(require("./routes/examQuestionRoutes"));
const examAttemptRoutes_1 = __importDefault(require("./routes/examAttemptRoutes"));
const attemptAnswerRoutes_1 = __importDefault(require("./routes/attemptAnswerRoutes"));
const departmentRoutes_1 = __importDefault(require("./routes/departmentRoutes"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const app = (0, express_1.default)();
/* -------------------- MIDDLEWARE -------------------- */
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(loggerMiddleware_1.requestLogger);
/* -------------------- STATIC FILES (IMPORTANT FOR IMAGES) -------------------- */
/* Serve assets folder (logos, avatars etc.) */
app.use("/assets", express_1.default.static(path_1.default.join(process.cwd(), "assets")));
/* -------------------- ROUTES -------------------- */
app.use("/api/login", authRoutes_1.default);
app.use("/api/roles", authMiddleware_1.authMiddleware, roleRoutes_1.default);
app.use("/api/users", authMiddleware_1.authMiddleware, userRoutes_1.default);
app.use("/api/institutes", authMiddleware_1.authMiddleware, instituteRoutes_1.default);
app.use("/api/levels", authMiddleware_1.authMiddleware, levelRoutes_1.default);
app.use("/api/subjects", authMiddleware_1.authMiddleware, subjectRoutes_1.default);
app.use("/api/chapters", authMiddleware_1.authMiddleware, chapterRoutes_1.default);
app.use("/api/questions", authMiddleware_1.authMiddleware, questionRoutes_1.default);
app.use("/api/question-options", authMiddleware_1.authMiddleware, questionOptionRoutes_1.default);
app.use("/api/exams", authMiddleware_1.authMiddleware, examRoutes_1.default);
app.use("/api/exam-questions", authMiddleware_1.authMiddleware, examQuestionRoutes_1.default);
app.use("/api/exam-attempts", authMiddleware_1.authMiddleware, examAttemptRoutes_1.default);
app.use("/api/attempt-answers", authMiddleware_1.authMiddleware, attemptAnswerRoutes_1.default);
app.use("/api/departments", authMiddleware_1.authMiddleware, departmentRoutes_1.default);
/* -------------------- 404 API HANDLER -------------------- */
app.use("/api", errorMiddleware_1.notFoundHandler);
/* -------------------- ERROR HANDLER -------------------- */
app.use(errorMiddleware_1.errorHandler);
/* -------------------- DATABASE + SERVER -------------------- */
db_1.AppDataSource.initialize()
    .then(() => {
    console.log("Database connected");
    app.listen(appProperties_1.default.PORT, () => {
        console.log(`🚀 Server running on port ${appProperties_1.default.PORT}`);
        console.log(`📁 Assets available at: http://localhost:${appProperties_1.default.PORT}/assets`);
    });
})
    .catch((err) => {
    console.error("DB Connection Error:", err);
});
