import { Router } from "express";
import {
  createSubject,
  deleteSubject,
  getSubjectById,
  getSubjects,
  updateSubject,
} from "../controllers/subjectController";
import {
  validateIdParam,
  validateSubjectCreate,
  validateSubjectUpdate,
} from "../middleware/entityValidationMiddleware";
import { requireRoles } from "../middleware/roleMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const canRead = requireRoles("SUPER_ADMIN", "ADMIN", "STUDENT");
const canWrite = requireRoles("SUPER_ADMIN", "ADMIN");

router.get("/", canRead, asyncHandler(getSubjects));
router.get("/:id", canRead, validateIdParam, asyncHandler(getSubjectById));
router.post("/", canWrite, validateSubjectCreate, asyncHandler(createSubject));
router.put("/:id", canWrite, validateIdParam, validateSubjectUpdate, asyncHandler(updateSubject));
router.delete("/:id", canWrite, validateIdParam, asyncHandler(deleteSubject));

export default router;
