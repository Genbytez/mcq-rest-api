"use strict";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLogo = exports.uploadRoom = exports.uploadAvatar = void 0;
// const uploadDir = path.join(process.cwd(), "assets", "avatar"); 
// // always resolves from project-root
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }
// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => cb(null, uploadDir),
//   filename: (_req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const baseName = path.basename(file.originalname, ext);
//     cb(null, `${baseName}-${Date.now()}${ext}`);
//   },
// });
// export const upload = multer({ storage });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Generic storage factory
const makeStorage = (folder) => {
    const uploadDir = path_1.default.join(process.cwd(), "assets", folder);
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
    return multer_1.default.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
            const ext = path_1.default.extname(file.originalname);
            const baseName = path_1.default.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, "_").toLowerCase();
            cb(null, `${baseName}-${Date.now()}${ext}`);
        },
    });
};
// Middlewares
exports.uploadAvatar = (0, multer_1.default)({ storage: makeStorage("avatar") });
exports.uploadRoom = (0, multer_1.default)({ storage: makeStorage("rooms") });
exports.uploadLogo = (0, multer_1.default)({ storage: makeStorage("logos") });
