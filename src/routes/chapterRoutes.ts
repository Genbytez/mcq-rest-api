import { Router } from "express";
import {
  createChapter,
  deleteChapter,
  getChapterById,
  getChapters,
  updateChapter,
} from "../controllers/chapterController";
import { validateIdParam } from "../middleware/entityValidationMiddleware";
import { validateChapterCreate, validateChapterUpdate } from "../middleware/entityValidationExtraMiddleware";
import { requireRoles } from "../middleware/roleMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const canRead = requireRoles("SUPER_ADMIN", "ADMIN", "STUDENT");
const canWrite = requireRoles("SUPER_ADMIN", "ADMIN");

router.get("/", canRead, asyncHandler(getChapters));
router.get("/:id", canRead, validateIdParam, asyncHandler(getChapterById));
router.post("/", canWrite, validateChapterCreate, asyncHandler(createChapter));
router.put("/:id", canWrite, validateIdParam, validateChapterUpdate, asyncHandler(updateChapter));
router.delete("/:id", canWrite, validateIdParam, asyncHandler(deleteChapter));

export default router;
