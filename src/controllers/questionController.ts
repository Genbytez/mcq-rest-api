import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Difficulty, QuestionType } from "../entities/enums";
import { Institute } from "../entities/institute";
import { Level } from "../entities/level";
import { Question } from "../entities/question";
import { QuestionOption } from "../entities/question-option";
import { Subject } from "../entities/subject";
import { Chapter } from "../entities/chapter";
import { UserAccount } from "../entities/users";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  buildPagination,
  paginateArray,
  parseBooleanQuery,
  parseIdQuery,
  parsePaginationQuery,
} from "../utils/pagination";

type OptionPayload = {
  optionKey: "A" | "B" | "C" | "D";
  optionText?: string | null;
  optionImageBase64?: string | null;
  optionImageMime?: string | null;
  isCorrect: boolean;
};

type QuestionPayload = {
  instituteId?: string;
  levelId?: string;
  subjectId?: string;
  chapterId?: string | null;
  questionType?: QuestionType;
  difficulty?: Difficulty;
  questionText?: string | null;
  questionImageBase64?: string | null;
  questionImageMime?: string | null;
  marks?: string;
  negativeMarks?: string;
  explanationText?: string | null;
  explanationImageBase64?: string | null;
  explanationImageMime?: string | null;
  isActive?: boolean;
  createdBy?: string | null;
  options?: OptionPayload[];
};

const toBoolean = (value: unknown, fallback: boolean) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;
  return fallback;
};

const normalizeOptions = (options: OptionPayload[] = []): OptionPayload[] =>
  options.map((option) => ({
    optionKey: option.optionKey,
    optionText: option.optionText ?? null,
    optionImageBase64: option.optionImageBase64 ?? null,
    optionImageMime: option.optionImageMime ?? null,
    isCorrect: toBoolean(option.isCorrect, false),
  }));

const verifyReferences = async (
  instituteId: string,
  levelId: string,
  subjectId: string,
  chapterId?: string | null,
  createdBy?: string | null
): Promise<string | null> => {
  const instituteRepo = AppDataSource.getRepository(Institute);
  const levelRepo = AppDataSource.getRepository(Level);
  const subjectRepo = AppDataSource.getRepository(Subject);
  const chapterRepo = AppDataSource.getRepository(Chapter);
  const userRepo = AppDataSource.getRepository(UserAccount);

  const institute = await instituteRepo.findOne({ where: { id: instituteId } });
  if (!institute) return "Invalid instituteId";

  const level = await levelRepo.findOne({ where: { id: levelId } });
  if (!level) return "Invalid levelId";

  if (level.instituteId !== instituteId) {
    return "Level does not belong to institute";
  }

  const subject = await subjectRepo.findOne({ where: { id: subjectId } });
  if (!subject) return "Invalid subjectId";

  if (subject.instituteId !== instituteId || subject.levelId !== levelId) {
    return "Subject does not belong to selected institute/level";
  }

  if (chapterId) {
    const chapter = await chapterRepo.findOne({ where: { id: chapterId } });
    if (!chapter) return "Invalid chapterId";
    if (chapter.instituteId !== instituteId || chapter.subjectId !== subjectId) {
      return "Chapter does not belong to selected institute/subject";
    }
  }

  if (createdBy) {
    const creator = await userRepo.findOne({ where: { id: createdBy } });
    if (!creator) return "Invalid createdBy";
    if (creator.instituteId !== instituteId) {
      return "Creator does not belong to selected institute";
    }
  }

  return null;
};

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const questionRepo = AppDataSource.getRepository(Question);

    const body = req.body as QuestionPayload;
    const instituteId = body.instituteId as string;
    const levelId = body.levelId as string;
    const subjectId = body.subjectId as string;

    const refError = await verifyReferences(instituteId, levelId, subjectId, body.chapterId, actorId);

    if (refError) {
      return res.status(400).json({ success: false, error: refError });
    }

    const question = questionRepo.create({
      instituteId,
      levelId,
      subjectId,
      chapterId: body.chapterId ?? null,
      questionType: body.questionType ?? QuestionType.MCQ,
      difficulty: body.difficulty ?? Difficulty.MEDIUM,
      questionText: body.questionText ?? null,
      questionImageBase64: body.questionImageBase64 ?? null,
      questionImageMime: body.questionImageMime ?? null,
      marks: body.marks ?? "1.00",
      negativeMarks: body.negativeMarks ?? "0.00",
      explanationText: body.explanationText ?? null,
      explanationImageBase64: body.explanationImageBase64 ?? null,
      explanationImageMime: body.explanationImageMime ?? null,
      isActive: toBoolean(body.isActive, true),
      createdBy: actorId,
      updatedBy: actorId,
      options: normalizeOptions(body.options),
    });

    const saved = await questionRepo.save(question);

    const withRelations = await questionRepo.findOne({
      where: { id: saved.id },
      relations: {
        institute: true,
        level: true,
        subject: true,
        chapter: true,
        creator: true,
        options: true,
      },
    });

    return res.status(201).json({ success: true, data: withRelations });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to create question" });
  }
};

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip, q } = parsePaginationQuery(req);
    const instituteId = parseIdQuery(req.query.instituteId);
    const levelId = parseIdQuery(req.query.levelId);
    const subjectId = parseIdQuery(req.query.subjectId);
    const chapterId = parseIdQuery(req.query.chapterId);
    const createdBy = parseIdQuery(req.query.createdBy);
    const questionType = typeof req.query.questionType === "string" ? req.query.questionType : undefined;
    const difficulty = typeof req.query.difficulty === "string" ? req.query.difficulty : undefined;
    const isActive = parseBooleanQuery(req.query.isActive);

    const questionRepo = AppDataSource.getRepository(Question);
    const questions = await questionRepo.find({
      relations: {
        institute: true,
        level: true,
        subject: true,
        chapter: true,
        creator: true,
        options: true,
      },
      order: { id: "ASC", options: { id: "ASC" } },
    });
    const search = q?.toLowerCase();
    const filtered = questions.filter((question) => {
      if (question.isDeleted) return false;
      if (instituteId && question.instituteId !== instituteId) return false;
      if (levelId && question.levelId !== levelId) return false;
      if (subjectId && question.subjectId !== subjectId) return false;
      if (chapterId && question.chapterId !== chapterId) return false;
      if (createdBy && question.createdBy !== createdBy) return false;
      if (questionType && question.questionType !== questionType) return false;
      if (difficulty && question.difficulty !== difficulty) return false;
      if (isActive !== undefined && question.isActive !== isActive) return false;

      if (search) {
        return (
          (question.questionText ?? "").toLowerCase().includes(search) ||
          (question.explanationText ?? "").toLowerCase().includes(search)
        );
      }

      return true;
    });

    const total = filtered.length;
    const data = paginateArray(filtered, skip, limit);
    return res.json({ success: true, data, pagination: buildPagination(page, limit, total) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch questions" });
  }
};

export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const questionRepo = AppDataSource.getRepository(Question);
    const question = await questionRepo.findOne({
      where: { id: req.params.id },
      relations: {
        institute: true,
        level: true,
        subject: true,
        chapter: true,
        creator: true,
        options: true,
      },
      order: { options: { id: "ASC" } },
    });

    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found" });
    }

    return res.json({ success: true, data: question });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch question" });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const questionRepo = AppDataSource.getRepository(Question);
    const optionRepo = AppDataSource.getRepository(QuestionOption);

    const question = await questionRepo.findOne({ where: { id: req.params.id } });
    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found" });
    }

    const body = req.body as QuestionPayload;

    const nextInstituteId = body.instituteId ?? question.instituteId;
    const nextLevelId = body.levelId ?? question.levelId;
    const nextSubjectId = body.subjectId ?? question.subjectId;
    const nextChapterId = body.chapterId !== undefined ? body.chapterId : question.chapterId;
    const nextCreatedBy = question.createdBy;

    const refError = await verifyReferences(
      nextInstituteId,
      nextLevelId,
      nextSubjectId,
      nextChapterId,
      nextCreatedBy
    );

    if (refError) {
      return res.status(400).json({ success: false, error: refError });
    }

    question.instituteId = nextInstituteId;
    question.levelId = nextLevelId;
    question.subjectId = nextSubjectId;

    if (body.chapterId !== undefined) question.chapterId = body.chapterId ?? null;
    if (body.questionType !== undefined) question.questionType = body.questionType;
    if (body.difficulty !== undefined) question.difficulty = body.difficulty;
    if (body.questionText !== undefined) question.questionText = body.questionText ?? null;
    if (body.questionImageBase64 !== undefined) {
      question.questionImageBase64 = body.questionImageBase64 ?? null;
    }
    if (body.questionImageMime !== undefined) question.questionImageMime = body.questionImageMime ?? null;
    if (body.marks !== undefined) question.marks = body.marks;
    if (body.negativeMarks !== undefined) question.negativeMarks = body.negativeMarks;
    if (body.explanationText !== undefined) question.explanationText = body.explanationText ?? null;
    if (body.explanationImageBase64 !== undefined) {
      question.explanationImageBase64 = body.explanationImageBase64 ?? null;
    }
    if (body.explanationImageMime !== undefined) {
      question.explanationImageMime = body.explanationImageMime ?? null;
    }
    if (body.isActive !== undefined) question.isActive = toBoolean(body.isActive, question.isActive);
    question.updatedBy = actorId;

    await questionRepo.save(question);

    if (body.options !== undefined) {
      await optionRepo.delete({ questionId: question.id });
      if (body.options.length > 0) {
        const options = normalizeOptions(body.options).map((option) =>
          optionRepo.create({ ...option, questionId: question.id })
        );
        await optionRepo.save(options);
      }
    }

    const withRelations = await questionRepo.findOne({
      where: { id: question.id },
      relations: {
        institute: true,
        level: true,
        subject: true,
        chapter: true,
        creator: true,
        options: true,
      },
      order: { options: { id: "ASC" } },
    });

    return res.json({ success: true, data: withRelations });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update question" });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const actorId = (req as AuthRequest).decoded?.userId ?? null;
    const questionRepo = AppDataSource.getRepository(Question);
    const question = await questionRepo.findOne({ where: { id: req.params.id } });

    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found" });
    }

    question.isDeleted = true;
    question.isActive = false;
    question.updatedBy = actorId;
    await questionRepo.save(question);
    return res.json({ success: true, message: "Question deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to delete question" });
  }
};
