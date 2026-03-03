import { Router } from "express";
import {
  createRole,
  deleteRole,
  getRoleById,
  getRoles,
  updateRole,
} from "../controllers/roleController";
import {
  validateIdParam,
  validateRoleCreate,
  validateRoleUpdate,
} from "../middleware/entityValidationMiddleware";
import { requireRoles } from "../middleware/roleMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const canRead = requireRoles("SUPER_ADMIN", "ADMIN", "STUDENT");
const canWrite = requireRoles("SUPER_ADMIN", "ADMIN");

router.get("/", canRead, asyncHandler(getRoles));
router.get("/:id", canRead, validateIdParam, asyncHandler(getRoleById));
router.post("/", canWrite, validateRoleCreate, asyncHandler(createRole));
router.put("/:id", canWrite, validateIdParam, validateRoleUpdate, asyncHandler(updateRole));
router.delete("/:id", canWrite, validateIdParam, asyncHandler(deleteRole));

export default router;
