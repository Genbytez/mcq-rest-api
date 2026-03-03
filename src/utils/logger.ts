import { createLogger, format, transports } from "winston";
import path from "path";

import fs from "fs";
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [
    new transports.Console(), // log to console
    new transports.File({ filename: path.join(logDir, "error.log"), level: "error" }), // errors only
    new transports.File({ filename: path.join(logDir, "combined.log") }) // all logs
  ],
});

export default logger;
