"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logDir = path_1.default.join(__dirname, "../../logs");
if (!fs_1.default.existsSync(logDir))
    fs_1.default.mkdirSync(logDir);
const logger = (0, winston_1.createLogger)({
    level: "info",
    format: winston_1.format.combine(winston_1.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)),
    transports: [
        new winston_1.transports.Console(), // log to console
        new winston_1.transports.File({ filename: path_1.default.join(logDir, "error.log"), level: "error" }), // errors only
        new winston_1.transports.File({ filename: path_1.default.join(logDir, "combined.log") }) // all logs
    ],
});
exports.default = logger;
