import express from "express";
import cors from "cors";
import path from "path";
import { requestLogger } from "./middleware/loggerMiddleware";
import { AppDataSource } from "./config/db";
import AppProperties from "./config/appProperties";
import authRoutes from "./routes/authRoutes";
import roleRoutes from "./routes/roleRoutes";
import userRoutes from "./routes/userRoutes";
import levelRoutes from "./routes/levelRoutes";
import subjectRoutes from "./routes/subjectRoutes";
import questionRoutes from "./routes/questionRoutes";
import instituteRoutes from "./routes/instituteRoutes";
import chapterRoutes from "./routes/chapterRoutes";
import questionOptionRoutes from "./routes/questionOptionRoutes";
import examRoutes from "./routes/examRoutes";
import examQuestionRoutes from "./routes/examQuestionRoutes";
import examAttemptRoutes from "./routes/examAttemptRoutes";
import attemptAnswerRoutes from "./routes/attemptAnswerRoutes";
import { authMiddleware } from "./middleware/authMiddleware";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/assets", express.static(path.join(process.cwd(), "assets")));

const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));

app.use("/api/login", authRoutes);
app.use("/api/roles", authMiddleware, roleRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/institutes", authMiddleware, instituteRoutes);
app.use("/api/levels", authMiddleware, levelRoutes);
app.use("/api/subjects", authMiddleware, subjectRoutes);
app.use("/api/chapters", authMiddleware, chapterRoutes);
app.use("/api/questions", authMiddleware, questionRoutes);
app.use("/api/question-options", authMiddleware, questionOptionRoutes);
app.use("/api/exams", authMiddleware, examRoutes);
app.use("/api/exam-questions", authMiddleware, examQuestionRoutes);
app.use("/api/exam-attempts", authMiddleware, examAttemptRoutes);
app.use("/api/attempt-answers", authMiddleware, attemptAnswerRoutes);

app.use("/api", notFoundHandler);

app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(AppProperties.PORT, () =>
      console.log(`Server running on port ${AppProperties.PORT}`)
    );
  })
  .catch((err) => console.error("DB Connection Error:", err));
