"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = void 0;
const requireRoles = (...roles) => {
    return (req, res, next) => {
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
exports.requireRoles = requireRoles;
