import { Router } from "express";
import {
  createExamAttempt,
  deleteExamAttempt,
  getExamAttemptById,
  getExamAttempts,
  updateExamAttempt,
} from "../controllers/examAttemptController";
import { validateIdParam } from "../middleware/entityValidationMiddleware";
import { validateExamAttemptCreate, validateExamAttemptUpdate } from "../middleware/entityValidationExtraMiddleware";
import { requireRoles } from "../middleware/roleMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const canRead = requireRoles("SUPER_ADMIN", "ADMIN", "STUDENT");
const canWrite = requireRoles("SUPER_ADMIN", "ADMIN");

router.get("/", canRead, asyncHandler(getExamAttempts));
router.get("/:id", canRead, validateIdParam, asyncHandler(getExamAttemptById));
router.post("/", canWrite, validateExamAttemptCreate, asyncHandler(createExamAttempt));
router.put("/:id", canWrite, validateIdParam, validateExamAttemptUpdate, asyncHandler(updateExamAttempt));
router.delete("/:id", canWrite, validateIdParam, asyncHandler(deleteExamAttempt));

export default router;
