import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppProperties from "../config/appProperties";

export interface AuthRequest extends Request {
  decoded?: {
    userId: string;
    [key: string]: unknown;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    console.log(token ,'---------------------------------Test')
    const decoded = jwt.verify(token, AppProperties.JWT_SECRET) as JwtPayload;

    req.decoded = {
      userId: String(decoded.userId),
      ...decoded,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
