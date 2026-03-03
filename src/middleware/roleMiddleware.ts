import { NextFunction, Response } from "express";
import { AuthRequest } from "./authMiddleware";

export const requireRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const roleCode = typeof req.decoded?.roleCode === "string" ? req.decoded.roleCode : undefined;

    if (!roleCode) {
      return res.status(403).json({ success: false, error: "Role not found in token" });
    }

    if (!roles.includes(roleCode)) {
      return res.status(403).json({ success: false, error: "Insufficient permissions" });
    }

    next();
  };
};
