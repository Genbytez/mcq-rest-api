import { Router } from "express";
import {
  createLevel,
  deleteLevel,
  getLevelById,
  getLevels,
  updateLevel,
} from "../controllers/levelController";
import {
  validateIdParam,
  validateLevelCreate,
  validateLevelUpdate,
} from "../middleware/entityValidationMiddleware";
import { requireRoles } from "../middleware/roleMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const canRead = requireRoles("SUPER_ADMIN", "ADMIN", "STUDENT");
const canWrite = requireRoles("SUPER_ADMIN", "ADMIN");

router.get("/", canRead, asyncHandler(getLevels));
router.get("/:id", canRead, validateIdParam, asyncHandler(getLevelById));
router.post("/", canWrite, validateLevelCreate, asyncHandler(createLevel));
router.put("/:id", canWrite, validateIdParam, validateLevelUpdate, asyncHandler(updateLevel));
router.delete("/:id", canWrite, validateIdParam, asyncHandler(deleteLevel));

export default router;
