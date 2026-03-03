import { Router } from "express";
import {
  createQuestionOption,
  deleteQuestionOption,
  getQuestionOptionById,
  getQuestionOptions,
  updateQuestionOption,
} from "../controllers/questionOptionController";
import { validateIdParam } from "../middleware/entityValidationMiddleware";
import { validateQuestionOptionCreate, validateQuestionOptionUpdate } from "../middleware/entityValidationExtraMiddleware";
import { requireRoles } from "../middleware/roleMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const canRead = requireRoles("SUPER_ADMIN", "ADMIN", "STUDENT");
const canWrite = requireRoles("SUPER_ADMIN", "ADMIN");

router.get("/", canRead, asyncHandler(getQuestionOptions));
router.get("/:id", canRead, validateIdParam, asyncHandler(getQuestionOptionById));
router.post("/", canWrite, validateQuestionOptionCreate, asyncHandler(createQuestionOption));
router.put("/:id", canWrite, validateIdParam, validateQuestionOptionUpdate, asyncHandler(updateQuestionOption));
router.delete("/:id", canWrite, validateIdParam, asyncHandler(deleteQuestionOption));

export default router;
