import { Router } from "express";
import { loginUsers } from "../controllers/authController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/", asyncHandler(loginUsers));

export default router;
