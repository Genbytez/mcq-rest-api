import { Router } from "express";
import {
  createInstitute,
  deleteInstitute,
  getInstituteById,
  getInstitutes,
  updateInstitute,
} from "../controllers/instituteController";
import { validateIdParam } from "../middleware/entityValidationMiddleware";
import { validateInstituteCreate, validateInstituteUpdate } from "../middleware/entityValidationExtraMiddleware";
import { requireRoles } from "../middleware/roleMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const canRead = requireRoles("SUPER_ADMIN", "ADMIN", "STUDENT");
const canWrite = requireRoles("SUPER_ADMIN", "ADMIN");

router.get("/", canRead, asyncHandler(getInstitutes));
router.get("/:id", canRead, validateIdParam, asyncHandler(getInstituteById));
router.post("/", canWrite, validateInstituteCreate, asyncHandler(createInstitute));
router.put("/:id", canWrite, validateIdParam, validateInstituteUpdate, asyncHandler(updateInstitute));
router.delete("/:id", canWrite, validateIdParam, asyncHandler(deleteInstitute));

export default router;
