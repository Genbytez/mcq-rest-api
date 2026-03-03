import { Router } from "express";
import {
  createExam,
  deleteExam,
  getExamById,
  getExams,
  updateExam,
} from "../controllers/examController";
import { validateIdParam } from "../middleware/entityValidationMiddleware";
import { validateExamCreate, validateExamUpdate } from "../middleware/entityValidationExtraMiddleware";
import { requireRoles } from "../middleware/roleMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const canRead = requireRoles("SUPER_ADMIN", "ADMIN", "STUDENT");
const canWrite = requireRoles("SUPER_ADMIN", "ADMIN");

router.get("/", canRead, asyncHandler(getExams));
router.get("/:id", canRead, validateIdParam, asyncHandler(getExamById));
router.post("/", canWrite, validateExamCreate, asyncHandler(createExam));
router.put("/:id", canWrite, validateIdParam, validateExamUpdate, asyncHandler(updateExam));
router.delete("/:id", canWrite, validateIdParam, asyncHandler(deleteExam));

export default router;
