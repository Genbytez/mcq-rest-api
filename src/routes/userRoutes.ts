import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/userController";
import {
  validateIdParam,
  validateUserCreate,
  validateUserUpdate,
} from "../middleware/entityValidationMiddleware";
import { requireRoles } from "../middleware/roleMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const canRead = requireRoles("SUPER_ADMIN", "ADMIN", "STUDENT");
const canWrite = requireRoles("SUPER_ADMIN", "ADMIN");

router.get("/", canRead, asyncHandler(getUsers));
router.get("/:id", canRead, validateIdParam, asyncHandler(getUserById));
router.post("/", canWrite, validateUserCreate, asyncHandler(createUser));
router.put("/:id", canWrite, validateIdParam, validateUserUpdate, asyncHandler(updateUser));
router.delete("/:id", canWrite, validateIdParam, asyncHandler(deleteUser));

export default router;
