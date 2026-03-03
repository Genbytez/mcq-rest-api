import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const { method, url } = req;
  logger.info(`${method} ${url}`);
  next();
};
