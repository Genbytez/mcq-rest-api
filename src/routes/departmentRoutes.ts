import { Router } from "express";
import {
    createDepartment,
    deleteDepartment,
    getDepartmentById,
    getDepartments,
    updateDepartment,
} from "../controllers/departmentController";
import {
    validateIdParam,
    validateDepartmentCreate,
    validateDepartmentUpdate,
} from "../middleware/entityValidationMiddleware";
import { requireRoles } from "../middleware/roleMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const canRead = requireRoles("SUPER_ADMIN", "ADMIN", "STUDENT");
const canWrite = requireRoles("SUPER_ADMIN", "ADMIN");

router.get("/", canRead, asyncHandler(getDepartments));
router.get("/:id", canRead, validateIdParam, asyncHandler(getDepartmentById));
router.post("/", canWrite, validateDepartmentCreate, asyncHandler(createDepartment));
router.put("/:id", canWrite, validateIdParam, validateDepartmentUpdate, asyncHandler(updateDepartment));
router.delete("/:id", canWrite, validateIdParam, asyncHandler(deleteDepartment));

export default router;
