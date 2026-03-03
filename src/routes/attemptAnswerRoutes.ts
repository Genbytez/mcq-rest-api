import { Router } from "express";
import {
  createAttemptAnswer,
  deleteAttemptAnswer,
  getAttemptAnswerById,
  getAttemptAnswers,
  updateAttemptAnswer,
} from "../controllers/attemptAnswerController";
import { validateIdParam } from "../middleware/entityValidationMiddleware";
import { validateAttemptAnswerCreate, validateAttemptAnswerUpdate } from "../middleware/entityValidationExtraMiddleware";
import { requireRoles } from "../middleware/roleMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const canRead = requireRoles("SUPER_ADMIN", "ADMIN", "STUDENT");
const canWrite = requireRoles("SUPER_ADMIN", "ADMIN");

router.get("/", canRead, asyncHandler(getAttemptAnswers));
router.get("/:id", canRead, validateIdParam, asyncHandler(getAttemptAnswerById));
router.post("/", canWrite, validateAttemptAnswerCreate, asyncHandler(createAttemptAnswer));
router.put("/:id", canWrite, validateIdParam, validateAttemptAnswerUpdate, asyncHandler(updateAttemptAnswer));
router.delete("/:id", canWrite, validateIdParam, asyncHandler(deleteAttemptAnswer));

export default router;
