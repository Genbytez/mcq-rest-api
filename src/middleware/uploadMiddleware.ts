// import multer from "multer";
// import path from "path";
// import fs from "fs";

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


import multer from "multer";
import path from "path";
import fs from "fs";

// Generic storage factory
const makeStorage = (folder: string) => {
  const uploadDir = path.join(process.cwd(), "assets", folder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, "_").toLowerCase();
      cb(null, `${baseName}-${Date.now()}${ext}`);
    },
  });
};

// Middlewares
export const uploadAvatar = multer({ storage: makeStorage("avatar") });
export const uploadRoom = multer({ storage: makeStorage("rooms") });
export const uploadLogo = multer({ storage: makeStorage("logos") });

