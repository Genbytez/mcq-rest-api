import { NextFunction, Request, Response } from "express";
import { Difficulty, QuestionType, UserStatus } from "../entities/enums";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isValidId = (value: unknown): boolean => {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0;
  }

  if (typeof value === "string") {
    return /^\d+$/.test(value) && Number(value) > 0;
  }

  return false;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isOptionalString = (value: unknown): boolean =>
  value === undefined || value === null || typeof value === "string";

const isBooleanLike = (value: unknown): boolean =>
  typeof value === "boolean" || value === "true" || value === "false" || value === 1 || value === 0 || value === "1" || value === "0";

const isEnumValue = <T extends Record<string, string>>(value: unknown, enumType: T): boolean =>
  typeof value === "string" && Object.values(enumType).includes(value);

const isNumberLike = (value: unknown): boolean => {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.trim().length > 0 && !Number.isNaN(Number(value));
  return false;
};

const requireBody = (req: Request, res: Response): req is Request & { body: Record<string, unknown> } => {
  if (!isObject(req.body)) {
    res.status(400).json({ success: false, errors: ["Request body must be an object"] });
    return false;
  }
  return true;
};

const sendErrors = (res: Response, errors: string[]) =>
  res.status(400).json({ success: false, errors });

const hasAny = (body: Record<string, unknown>, fields: string[]): boolean =>
  fields.some((field) => body[field] !== undefined);

const validateOptions = (options: unknown, required: boolean): string[] => {
  const errors: string[] = [];

  if (options === undefined) {
    if (required) {
      errors.push("options is required");
    }
    return errors;
  }

  if (!Array.isArray(options)) {
    errors.push("options must be an array");
    return errors;
  }

  if (options.length < 2 || options.length > 4) {
    errors.push("options must contain 2 to 4 entries");
  }

  const keySet = new Set<string>();
  let correctCount = 0;

  options.forEach((item, index) => {
    if (!isObject(item)) {
      errors.push(`options[${index}] must be an object`);
      return;
    }

    const key = item.optionKey;
    if (!["A", "B", "C", "D"].includes(String(key))) {
      errors.push(`options[${index}].optionKey must be one of A/B/C/D`);
    } else {
      if (keySet.has(String(key))) {
        errors.push(`Duplicate optionKey '${String(key)}'`);
      }
      keySet.add(String(key));
    }

    if (!isOptionalString(item.optionText)) {
      errors.push(`options[${index}].optionText must be string or null`);
    }

    if (!isOptionalString(item.optionImageBase64)) {
      errors.push(`options[${index}].optionImageBase64 must be string or null`);
    }

    if (!isOptionalString(item.optionImageMime)) {
      errors.push(`options[${index}].optionImageMime must be string or null`);
    }

    if (!isBooleanLike(item.isCorrect)) {
      errors.push(`options[${index}].isCorrect must be boolean`);
    } else if (item.isCorrect === true || item.isCorrect === "true" || item.isCorrect === 1 || item.isCorrect === "1") {
      correctCount += 1;
    }

    const hasText = isNonEmptyString(item.optionText);
    const hasImage = isNonEmptyString(item.optionImageBase64);
    if (!hasText && !hasImage) {
      errors.push(`options[${index}] needs optionText or optionImageBase64`);
    }
  });

  if (options.length > 0 && correctCount !== 1) {
    errors.push("Exactly one option must have isCorrect = true");
  }

  return errors;
};

export const validateIdParam = (req: Request, res: Response, next: NextFunction) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, error: "Invalid id parameter" });
  }
  next();
};

export const validateRoleCreate = (req: Request, res: Response, next: NextFunction) => {
  if (!requireBody(req, res)) return;

  const errors: string[] = [];
  if (!isNonEmptyString(req.body.code)) errors.push("code is required");
  if (!isNonEmptyString(req.body.name)) errors.push("name is required");

  if (errors.length > 0) return sendErrors(res, errors);
  next();
};

export const validateRoleUpdate = (req: Request, res: Response, next: NextFunction) => {
  if (!requireBody(req, res)) return;

  if (!hasAny(req.body, ["code", "name"])) {
    return sendErrors(res, ["At least one updatable field is required"]);
  }

  const errors: string[] = [];
  if (req.body.code !== undefined && !isNonEmptyString(req.body.code)) errors.push("code must be non-empty string");
  if (req.body.name !== undefined && !isNonEmptyString(req.body.name)) errors.push("name must be non-empty string");

  if (errors.length > 0) return sendErrors(res, errors);
  next();
};

export const validateUserCreate = (req: Request, res: Response, next: NextFunction) => {
  if (!requireBody(req, res)) return;

  const errors: string[] = [];
  if (!isValidId(req.body.instituteId)) errors.push("instituteId is required and must be a valid id");
  if (!isValidId(req.body.roleId)) errors.push("roleId is required and must be a valid id");
  if (!isNonEmptyString(req.body.fullName)) errors.push("fullName is required");
  if (!isNonEmptyString(req.body.password) || req.body.password.trim().length < 6) {
    errors.push("password is required and must be at least 6 characters");
  }
  if (!isOptionalString(req.body.regNo)) errors.push("regNo must be string or null");
  if (!isOptionalString(req.body.email)) errors.push("email must be string or null");
  if (!isOptionalString(req.body.mobile)) errors.push("mobile must be string or null");
  if (req.body.status !== undefined && !isEnumValue(req.body.status, UserStatus)) {
    errors.push(`status must be one of ${Object.values(UserStatus).join(", ")}`);
  }

  if (errors.length > 0) return sendErrors(res, errors);
  next();
};

export const validateUserUpdate = (req: Request, res: Response, next: NextFunction) => {
  if (!requireBody(req, res)) return;

  const fields = [
    "instituteId",
    "roleId",
    "regNo",
    "fullName",
    "email",
    "mobile",
    "password",
    "status",
  ];

  if (!hasAny(req.body, fields)) {
    return sendErrors(res, ["At least one updatable field is required"]);
  }

  const errors: string[] = [];
  if (req.body.instituteId !== undefined && !isValidId(req.body.instituteId)) errors.push("instituteId must be valid id");
  if (req.body.roleId !== undefined && !isValidId(req.body.roleId)) errors.push("roleId must be valid id");
  if (req.body.regNo !== undefined && !isOptionalString(req.body.regNo)) errors.push("regNo must be string or null");
  if (req.body.fullName !== undefined && !isNonEmptyString(req.body.fullName)) errors.push("fullName must be non-empty string");
  if (req.body.email !== undefined && !isOptionalString(req.body.email)) errors.push("email must be string or null");
  if (req.body.mobile !== undefined && !isOptionalString(req.body.mobile)) errors.push("mobile must be string or null");
  if (req.body.password !== undefined && (!isNonEmptyString(req.body.password) || req.body.password.trim().length < 6)) {
    errors.push("password must be at least 6 characters");
  }
  if (req.body.status !== undefined && !isEnumValue(req.body.status, UserStatus)) {
    errors.push(`status must be one of ${Object.values(UserStatus).join(", ")}`);
  }

  if (errors.length > 0) return sendErrors(res, errors);
  next();
};

export const validateLevelCreate = (req: Request, res: Response, next: NextFunction) => {
  if (!requireBody(req, res)) return;

  const errors: string[] = [];
  if (!isValidId(req.body.instituteId)) errors.push("instituteId is required and must be valid id");
  if (!isNonEmptyString(req.body.name)) errors.push("name is required");
  if (!isOptionalString(req.body.description)) errors.push("description must be string or null");
  if (req.body.isActive !== undefined && !isBooleanLike(req.body.isActive)) errors.push("isActive must be boolean");

  if (errors.length > 0) return sendErrors(res, errors);
  next();
};

export const validateLevelUpdate = (req: Request, res: Response, next: NextFunction) => {
  if (!requireBody(req, res)) return;

  if (!hasAny(req.body, ["instituteId", "name", "description", "isActive"])) {
    return sendErrors(res, ["At least one updatable field is required"]);
  }

  const errors: string[] = [];
  if (req.body.instituteId !== undefined && !isValidId(req.body.instituteId)) errors.push("instituteId must be valid id");
  if (req.body.name !== undefined && !isNonEmptyString(req.body.name)) errors.push("name must be non-empty string");
  if (req.body.description !== undefined && !isOptionalString(req.body.description)) errors.push("description must be string or null");
  if (req.body.isActive !== undefined && !isBooleanLike(req.body.isActive)) errors.push("isActive must be boolean");

  if (errors.length > 0) return sendErrors(res, errors);
  next();
};

export const validateSubjectCreate = (req: Request, res: Response, next: NextFunction) => {
  if (!requireBody(req, res)) return;

  const errors: string[] = [];
  if (!isValidId(req.body.instituteId)) errors.push("instituteId is required and must be valid id");
  if (!isValidId(req.body.levelId)) errors.push("levelId is required and must be valid id");
  if (!isNonEmptyString(req.body.name)) errors.push("name is required");
  if (!isOptionalString(req.body.description)) errors.push("description must be string or null");
  if (req.body.isActive !== undefined && !isBooleanLike(req.body.isActive)) errors.push("isActive must be boolean");

  if (errors.length > 0) return sendErrors(res, errors);
  next();
};

export const validateSubjectUpdate = (req: Request, res: Response, next: NextFunction) => {
  if (!requireBody(req, res)) return;

  if (!hasAny(req.body, ["instituteId", "levelId", "name", "description", "isActive"])) {
    return sendErrors(res, ["At least one updatable field is required"]);
  }

  const errors: string[] = [];
  if (req.body.instituteId !== undefined && !isValidId(req.body.instituteId)) errors.push("instituteId must be valid id");
  if (req.body.levelId !== undefined && !isValidId(req.body.levelId)) errors.push("levelId must be valid id");
  if (req.body.name !== undefined && !isNonEmptyString(req.body.name)) errors.push("name must be non-empty string");
  if (req.body.description !== undefined && !isOptionalString(req.body.description)) errors.push("description must be string or null");
  if (req.body.isActive !== undefined && !isBooleanLike(req.body.isActive)) errors.push("isActive must be boolean");

  if (errors.length > 0) return sendErrors(res, errors);
  next();
};

export const validateQuestionCreate = (req: Request, res: Response, next: NextFunction) => {
  if (!requireBody(req, res)) return;

  const errors: string[] = [];

  if (!isValidId(req.body.instituteId)) errors.push("instituteId is required and must be valid id");
  if (!isValidId(req.body.levelId)) errors.push("levelId is required and must be valid id");
  if (!isValidId(req.body.subjectId)) errors.push("subjectId is required and must be valid id");

  if (req.body.chapterId !== undefined && req.body.chapterId !== null && !isValidId(req.body.chapterId)) {
    errors.push("chapterId must be valid id or null");
  }

  if (req.body.createdBy !== undefined && req.body.createdBy !== null && !isValidId(req.body.createdBy)) {
    errors.push("createdBy must be valid id or null");
  }

  if (req.body.questionType !== undefined && !isEnumValue(req.body.questionType, QuestionType)) {
    errors.push(`questionType must be one of ${Object.values(QuestionType).join(", ")}`);
  }

  if (req.body.difficulty !== undefined && !isEnumValue(req.body.difficulty, Difficulty)) {
    errors.push(`difficulty must be one of ${Object.values(Difficulty).join(", ")}`);
  }

  if (!isOptionalString(req.body.questionText)) errors.push("questionText must be string or null");
  if (!isOptionalString(req.body.questionImageBase64)) errors.push("questionImageBase64 must be string or null");
  if (!isOptionalString(req.body.questionImageMime)) errors.push("questionImageMime must be string or null");
  if (!isOptionalString(req.body.explanationText)) errors.push("explanationText must be string or null");
  if (!isOptionalString(req.body.explanationImageBase64)) errors.push("explanationImageBase64 must be string or null");
  if (!isOptionalString(req.body.explanationImageMime)) errors.push("explanationImageMime must be string or null");

  if (req.body.marks !== undefined && !isNumberLike(req.body.marks)) errors.push("marks must be numeric");
  if (req.body.negativeMarks !== undefined && !isNumberLike(req.body.negativeMarks)) errors.push("negativeMarks must be numeric");
  if (req.body.isActive !== undefined && !isBooleanLike(req.body.isActive)) errors.push("isActive must be boolean");

  errors.push(...validateOptions(req.body.options, true));

  if (errors.length > 0) return sendErrors(res, errors);
  next();
};

export const validateQuestionUpdate = (req: Request, res: Response, next: NextFunction) => {
  if (!requireBody(req, res)) return;

  const fields = [
    "instituteId",
    "levelId",
    "subjectId",
    "chapterId",
    "questionType",
    "difficulty",
    "questionText",
    "questionImageBase64",
    "questionImageMime",
    "marks",
    "negativeMarks",
    "explanationText",
    "explanationImageBase64",
    "explanationImageMime",
    "isActive",
    "createdBy",
    "options",
  ];

  if (!hasAny(req.body, fields)) {
    return sendErrors(res, ["At least one updatable field is required"]);
  }

  const errors: string[] = [];

  if (req.body.instituteId !== undefined && !isValidId(req.body.instituteId)) errors.push("instituteId must be valid id");
  if (req.body.levelId !== undefined && !isValidId(req.body.levelId)) errors.push("levelId must be valid id");
  if (req.body.subjectId !== undefined && !isValidId(req.body.subjectId)) errors.push("subjectId must be valid id");

  if (req.body.chapterId !== undefined && req.body.chapterId !== null && !isValidId(req.body.chapterId)) {
    errors.push("chapterId must be valid id or null");
  }

  if (req.body.createdBy !== undefined && req.body.createdBy !== null && !isValidId(req.body.createdBy)) {
    errors.push("createdBy must be valid id or null");
  }

  if (req.body.questionType !== undefined && !isEnumValue(req.body.questionType, QuestionType)) {
    errors.push(`questionType must be one of ${Object.values(QuestionType).join(", ")}`);
  }

  if (req.body.difficulty !== undefined && !isEnumValue(req.body.difficulty, Difficulty)) {
    errors.push(`difficulty must be one of ${Object.values(Difficulty).join(", ")}`);
  }

  if (req.body.questionText !== undefined && !isOptionalString(req.body.questionText)) errors.push("questionText must be string or null");
  if (req.body.questionImageBase64 !== undefined && !isOptionalString(req.body.questionImageBase64)) {
    errors.push("questionImageBase64 must be string or null");
  }
  if (req.body.questionImageMime !== undefined && !isOptionalString(req.body.questionImageMime)) {
    errors.push("questionImageMime must be string or null");
  }
  if (req.body.explanationText !== undefined && !isOptionalString(req.body.explanationText)) {
    errors.push("explanationText must be string or null");
  }
  if (req.body.explanationImageBase64 !== undefined && !isOptionalString(req.body.explanationImageBase64)) {
    errors.push("explanationImageBase64 must be string or null");
  }
  if (req.body.explanationImageMime !== undefined && !isOptionalString(req.body.explanationImageMime)) {
    errors.push("explanationImageMime must be string or null");
  }

  if (req.body.marks !== undefined && !isNumberLike(req.body.marks)) errors.push("marks must be numeric");
  if (req.body.negativeMarks !== undefined && !isNumberLike(req.body.negativeMarks)) errors.push("negativeMarks must be numeric");
  if (req.body.isActive !== undefined && !isBooleanLike(req.body.isActive)) errors.push("isActive must be boolean");

  errors.push(...validateOptions(req.body.options, false));

  if (errors.length > 0) return sendErrors(res, errors);
  next();
};
