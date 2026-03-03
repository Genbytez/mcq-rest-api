import { Router } from "express";
import {
  createQuestion,
  deleteQuestion,
  getQuestionById,
  getQuestions,
  updateQuestion,
} from "../controllers/questionController";
import {
  validateIdParam,
  validateQuestionCreate,
  validateQuestionUpdate,
} from "../middleware/entityValidationMiddleware";
import { requireRoles } from "../middleware/roleMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const canRead = requireRoles("SUPER_ADMIN", "ADMIN", "STUDENT");
const canWrite = requireRoles("SUPER_ADMIN", "ADMIN");

router.get("/", canRead, asyncHandler(getQuestions));
router.get("/:id", canRead, validateIdParam, asyncHandler(getQuestionById));
router.post("/", canWrite, validateQuestionCreate, asyncHandler(createQuestion));
router.put("/:id", canWrite, validateIdParam, validateQuestionUpdate, asyncHandler(updateQuestion));
router.delete("/:id", canWrite, validateIdParam, asyncHandler(deleteQuestion));

export default router;
