import { Router } from "express";
import {
  createExamQuestion,
  deleteExamQuestion,
  getExamQuestionById,
  getExamQuestions,
  updateExamQuestion,
} from "../controllers/examQuestionController";
import { validateIdParam } from "../middleware/entityValidationMiddleware";
import { validateExamQuestionCreate, validateExamQuestionUpdate } from "../middleware/entityValidationExtraMiddleware";
import { requireRoles } from "../middleware/roleMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const canRead = requireRoles("SUPER_ADMIN", "ADMIN", "STUDENT");
const canWrite = requireRoles("SUPER_ADMIN", "ADMIN");

router.get("/", canRead, asyncHandler(getExamQuestions));
router.get("/:id", canRead, validateIdParam, asyncHandler(getExamQuestionById));
router.post("/", canWrite, validateExamQuestionCreate, asyncHandler(createExamQuestion));
router.put("/:id", canWrite, validateIdParam, validateExamQuestionUpdate, asyncHandler(updateExamQuestion));
router.delete("/:id", canWrite, validateIdParam, asyncHandler(deleteExamQuestion));

export default router;
