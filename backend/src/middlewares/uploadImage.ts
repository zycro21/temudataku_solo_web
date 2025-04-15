import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Dapatkan path folder images
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const uploadPath = path.join(__dirname, "../../images");
const normalizedPath = path.normalize(uploadPath);
const correctPath = normalizedPath.replace(/^\\/, "");

// Buat folder jika belum ada
if (!fs.existsSync(correctPath)) {
  fs.mkdirSync(correctPath, { recursive: true });
}

export const handleUpload = (
  field: string,
  isMultiple: boolean = false,
  max: number = 5
) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, correctPath),
    filename: async (req: Request & { user?: any }, file, cb) => {
      try {
        const ext = path.extname(file.originalname);
        let role = "mentee"; // default
        let fileName = "";

        if (req.user) {
          // === UPDATE PROFILE ===
          const userId = req.user.userId;
          const roles = req.user.roles || [];
          role = roles.includes("admin") ? "admin" : roles[0] || "user";

          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
          });
          if (!dbUser) return cb(new Error("User not found"), "");

          const prevFile = dbUser.profilePicture || "";
          const prevMatch = prevFile.match(/update-(\d+)-/);
          const prevCount = prevMatch ? parseInt(prevMatch[1]) : 0;
          const nextCount = prevCount + 1;

          const idTail = dbUser.id.slice(-6);
          fileName = `${role}-PP-update-${String(nextCount).padStart(
            4,
            "0"
          )}-${idTail}${ext}`;
        } else {
          // === REGISTER ===
          role = req.body.role || "mentee";

          const lastUser = await prisma.user.findFirst({
            orderBy: { id: "desc" },
            select: { id: true },
          });

          let newIdNumber = 1;
          if (lastUser && /^\d+$/.test(lastUser.id)) {
            newIdNumber = parseInt(lastUser.id, 10) + 1;
          }

          const userId = String(newIdNumber).padStart(6, "0");
          fileName = `${role}-PP-${userId}${ext}`;
        }

        cb(null, fileName);
      } catch (err) {
        cb(err as Error, "");
      }
    },
  });

  const upload = multer({ storage });
  return isMultiple ? upload.array(field, max) : upload.single(field);
};

export { correctPath as uploadPath };
