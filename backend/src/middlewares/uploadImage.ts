import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import crypto from "crypto";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// === Untuk Upload Profile Picture ===
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const imageUploadPath = path.join(__dirname, "../../images");
const normalizedImagePath = path.normalize(imageUploadPath);
const correctPath = normalizedImagePath.replace(/^\\/, "");

if (!fs.existsSync(correctPath)) {
  try {
    fs.mkdirSync(correctPath, { recursive: true });
    console.log("[UPLOAD] Created images directory:", correctPath);
  } catch (err) {
    console.error("[UPLOAD] Failed to create directory:", err);
  }
} else {
  console.log("[UPLOAD] Images directory exists:", correctPath);
}

export const handleUpload = (
  field: string,
  isMultiple: boolean = false,
  max: number = 5,
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
            "0",
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

// === Untuk Upload Project Submission Files ===
const submissionUploadPath = path.join(__dirname, "../../uploads/submissions");
const normalizedSubmissionPath = path.normalize(submissionUploadPath);
const finalSubmissionPath = normalizedSubmissionPath.replace(/^\\/, "");

if (!fs.existsSync(finalSubmissionPath)) {
  fs.mkdirSync(finalSubmissionPath, { recursive: true });
}

const submissionStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, finalSubmissionPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-") // ganti spasi dengan -
      .replace(/[^a-zA-Z0-9-_]/g, ""); // hapus karakter aneh

    const now = new Date();
    const formattedTime = `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now
      .getHours()
      .toString()
      .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    const filename = `Submission-${name}-${formattedTime}${ext}`;
    cb(null, filename);
  },
});

const submissionUploader = multer({ storage: submissionStorage });

export const handleSubmissionUpload = (
  field: string,
  isMultiple: boolean = false,
  max: number = 5,
) => {
  return isMultiple
    ? submissionUploader.array(field, max)
    : submissionUploader.single(field);
};

export { finalSubmissionPath as submissionUploadPath };

// Untuk Upload Thumbnail Practice
const thumbnailUploadPath = path.join(
  __dirname,
  "../../images/thumbnailPractice",
);
const normalizedThumbnailPath = path.normalize(thumbnailUploadPath);
const correctThumbnailPath = normalizedThumbnailPath.replace(/^\\/, "");

if (!fs.existsSync(correctThumbnailPath)) {
  fs.mkdirSync(correctThumbnailPath, { recursive: true });
}

export const handleThumbnailUpload = (
  field: string,
  isMultiple: boolean = true, // Ubah ke true agar mendukung multiple file
  max: number = 5, // Sesuaikan maksimal jumlah file yang diizinkan
) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, correctThumbnailPath),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);

      // Ambil title dari req.practiceTitle, fallback ke "untitled"
      const rawTitle =
        (req as any).practiceTitle || (req as any).body?.title || "untitled";

      // Sanitasi title: ganti spasi dengan -, lowercase, hapus karakter aneh
      const title = rawTitle
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      // Ambil tanggal saat ini
      const now = new Date();
      const dateString = `${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

      // Generate string acak
      const randomString = Math.random().toString(36).substring(2, 7); // 5 karakter acak

      // Gabungkan semuanya dalam format yang diinginkan
      const fileName = `thumbnail-${title}-${dateString}-${randomString}${ext}`;

      cb(null, fileName);
    },
  });

  const upload = multer({ storage });
  return isMultiple ? upload.array(field, max) : upload.single(field);
};

export { correctThumbnailPath as thumbnailUploadPath };

// Tentukan folder uploads/practiceFile
const practiceFileUploadPath = path.join(
  __dirname,
  "../../uploads/practiceFile",
);
const normalizedPracticeFilePath = path.normalize(practiceFileUploadPath);
const finalPracticeFilePath = normalizedPracticeFilePath.replace(/^\\/, "");

// Buat folder kalau belum ada
if (!fs.existsSync(finalPracticeFilePath)) {
  fs.mkdirSync(finalPracticeFilePath, { recursive: true });
}

// Storage multer untuk PracticeFile
const practiceFileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, finalPracticeFilePath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    const now = new Date();
    const formattedTime = `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now
      .getHours()
      .toString()
      .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    const filename = `PracticeFile-${name}-${formattedTime}${ext}`;
    cb(null, filename);
  },
});

// Multer uploader
const practiceFileUploader = multer({ storage: practiceFileStorage });

// Fungsi untuk handle upload
export const handlePracticeFileUpload = (
  field: string,
  isMultiple: boolean = false,
  max: number = 5,
) => {
  return isMultiple
    ? practiceFileUploader.array(field, max)
    : practiceFileUploader.single(field);
};

export { finalPracticeFilePath as practiceFileUploadPath };

// === Untuk Upload Support Document Files ===
const supportDocumentUploadPath = path.join(
  __dirname,
  "../../uploads/supportDocument",
);
const normalizedSupportDocPath = path.normalize(supportDocumentUploadPath);
const finalSupportDocPath = normalizedSupportDocPath.replace(/^\\/, "");

// Buat folder kalau belum ada
if (!fs.existsSync(finalSupportDocPath)) {
  fs.mkdirSync(finalSupportDocPath, { recursive: true });
}

const supportDocStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, finalSupportDocPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-") // ganti spasi dengan -
      .replace(/[^a-zA-Z0-9-_]/g, ""); // hapus karakter aneh

    const now = new Date();
    const formattedTime = `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now
      .getHours()
      .toString()
      .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    const filename = `SupportDoc-${name}-${formattedTime}${ext}`;
    cb(null, filename);
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const supportDocUploader = multer({
  storage: supportDocStorage,
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, Word, and PowerPoint files are allowed"));
    }
  },
});

export const handleSupportDocumentUpload = (
  field: string,
  isMultiple: boolean = false,
  max: number = 5,
) => {
  return isMultiple
    ? supportDocUploader.array(field, max)
    : supportDocUploader.single(field);
};

export { finalSupportDocPath as supportDocumentUploadPath };

// === Untuk Upload Practice Submission Files ===
const practiceSubmissionPath = path.join(
  __dirname,
  "../../uploads/practice/submissions",
);
const normalizedPracticePath = path.normalize(practiceSubmissionPath);
const finalPracticePath = normalizedPracticePath.replace(/^\\/, "");

// Pastikan foldernya ada
if (!fs.existsSync(finalPracticePath)) {
  fs.mkdirSync(finalPracticePath, { recursive: true });
}

const practiceSubmissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, finalPracticePath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-") // Ganti spasi dengan "-"
      .replace(/[^a-zA-Z0-9-_]/g, ""); // Hapus karakter aneh

    const now = new Date();
    const formattedTime = `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now
      .getHours()
      .toString()
      .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    const filename = `PracticeSubmission-${baseName}-${formattedTime}${ext}`;
    cb(null, filename);
  },
});

const practiceSubmissionUploader = multer({
  storage: practiceSubmissionStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // Maksimal 20 MB per file
  },
});

export const handlePracticeSubmissionUpload = (
  field: string,
  isMultiple: boolean = false,
  max: number = 5,
) => {
  return isMultiple
    ? practiceSubmissionUploader.array(field, max)
    : practiceSubmissionUploader.single(field);
};

// Export path final agar bisa dipakai di tempat lain (misal untuk static serve)
export { finalPracticePath as practiceSubmissionUploadPath };

// === Buat folder penyimpanan untuk thumbnail e-learning ===
const elearningThumbnailPath = path.join(
  __dirname,
  "../../images/elearningThumbnail",
);
const normalizedElearningPath = path.normalize(elearningThumbnailPath);
const correctElearningPath = normalizedElearningPath.replace(/^\\/, "");

if (!fs.existsSync(correctElearningPath)) {
  fs.mkdirSync(correctElearningPath, { recursive: true });
}

// === Middleware Upload Thumbnail untuk E-Learning ===
export const handleElearningThumbnailUpload = (
  field: string,
  isMultiple: boolean = true,
  max: number = 5,
) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, correctElearningPath),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);

      // Ambil title dari req, fallback ke "untitled"
      const rawTitle =
        (req as any).elearningTitle || (req as any).body?.title || "untitled";

      // Sanitasi title agar jadi slug bersih
      const title = rawTitle
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      // Ambil tanggal sekarang (format yyyymmdd)
      const now = new Date();
      const dateString = `${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

      // Generate random string 5 karakter
      const randomString = Math.random().toString(36).substring(2, 7);

      // Format nama file: thumbnail-elearn-[title]-[date]-[random]
      const fileName = `thumbnail-elearn-${title}-${dateString}-${randomString}${ext}`;

      cb(null, fileName);
    },
  });

  const upload = multer({ storage });
  return isMultiple ? upload.array(field, max) : upload.single(field);
};

export { correctElearningPath as elearningThumbnailPath };

// === Untuk Upload File Submission E-Learning ===
const eLearningSubmissionUploadDir = path.join(
  __dirname,
  "../../uploads/elearning/submissions",
);
const eLearningSubmissionNormalizedPath = path.normalize(
  eLearningSubmissionUploadDir,
);
const eLearningSubmissionResolvedPath =
  eLearningSubmissionNormalizedPath.replace(/^\\/, "");

// Pastikan foldernya ada
if (!fs.existsSync(eLearningSubmissionResolvedPath)) {
  fs.mkdirSync(eLearningSubmissionResolvedPath, { recursive: true });
}

// Konfigurasi penyimpanan
const eLearningSubmissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, eLearningSubmissionResolvedPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    const now = new Date();
    const formattedTime = `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now
      .getHours()
      .toString()
      .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    const filename = `ELearningSubmission-${baseName}-${formattedTime}${ext}`;
    cb(null, filename);
  },
});

// Inisialisasi multer
const eLearningSubmissionUploader = multer({
  storage: eLearningSubmissionStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});

// Middleware helper
export const handleELearningSubmissionUpload = (
  field: string,
  isMultiple: boolean = false,
  max: number = 5,
) => {
  return isMultiple
    ? eLearningSubmissionUploader.array(field, max)
    : eLearningSubmissionUploader.single(field);
};

// Export path untuk static serve
export { eLearningSubmissionResolvedPath as eLearningSubmissionUploadPath };

// === Upload Video / Image Sub-Bab E-Learning ===
const eLearningVideoUploadDir = path.join(
  __dirname,
  "../../uploads/elearning/videos",
);
const normalizedPath = path.normalize(eLearningVideoUploadDir);
const resolvedPath = normalizedPath.replace(/^\\/, "");

// pastikan folder ada
if (!fs.existsSync(resolvedPath)) {
  fs.mkdirSync(resolvedPath, { recursive: true });
}

const eLearningVideoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resolvedPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now
      .getHours()
      .toString()
      .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    cb(null, `ELearningMedia-${baseName}-${timestamp}${ext}`);
  },
});

const uploader = multer({
  storage: eLearningVideoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("video/") ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("File harus berupa video atau gambar"));
    }
  },
});

export const handleELearningVideoUpload = () => uploader.single("video");

export { resolvedPath as eLearningVideoUploadPath };

// === Untuk Thumnail Mentoring Service ===
const mentoringThumbnailPath = path.join(
  __dirname,
  "../../images/mentoringThumbnail",
);

// 🔥 lebih jelas
const normalizedMentoringThumbnailPath = path.normalize(mentoringThumbnailPath);

const cleanMentoringThumbnailPath = normalizedMentoringThumbnailPath.replace(
  /^\\/,
  "",
);

// ensure folder exists
if (!fs.existsSync(cleanMentoringThumbnailPath)) {
  fs.mkdirSync(cleanMentoringThumbnailPath, { recursive: true });
}

// === Middleware ===
export const handleMentoringThumbnailUpload = (
  field: string,
  isMultiple: boolean = false,
) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, cleanMentoringThumbnailPath),

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);

      const rawTitle =
        (req as any).mentoringTitle ||
        (req as any).body?.serviceName ||
        "mentoring";

      const title = rawTitle
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      const now = new Date();
      const dateString = `${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

      const random = Math.random().toString(36).substring(2, 7);

      const fileName = `thumbnail-mentoring-${title}-${dateString}-${random}${ext}`;

      cb(null, fileName);
    },
  });

  const upload = multer({ storage });

  return isMultiple ? upload.array(field, 3) : upload.single(field);
};

// export path
export { cleanMentoringThumbnailPath as mentoringThumbnailPath };

// === Untuk File Assignment Dari Admin ===
const assignmentFilesPath = path.join(
  __dirname,
  "../../uploads/elearningAssignments",
);

const normalizedAssignmentFilesPath = path.normalize(assignmentFilesPath);

const cleanAssignmentFilesPath = normalizedAssignmentFilesPath.replace(
  /^\\/,
  "",
);

if (!fs.existsSync(cleanAssignmentFilesPath)) {
  fs.mkdirSync(cleanAssignmentFilesPath, {
    recursive: true,
  });
}

export const handleAssignmentSupportingFilesUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, cleanAssignmentFilesPath);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);

      const now = new Date();

      const dateString = `${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

      const random = Math.random().toString(36).substring(2, 8);

      const safeName = file.originalname
        .replace(ext, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      cb(null, `assignment-${safeName}-${dateString}-${random}${ext}`);
    },
  }),

  limits: {
    files: 20,
    fileSize: 20 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowed = [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".csv",
      ".zip",
      ".rar",
      ".txt",
      ".ppt",
      ".pptx",
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
    ];

    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowed.includes(ext)) {
      return cb(new Error("Format file assignment tidak didukung"));
    }

    cb(null, true);
  },
}).array("supportingFiles", 20);

export { cleanAssignmentFilesPath as assignmentFilesPath };

// === Untuk Image/Video Assignment Additional Content Elearning Dari Admin ===
const imageVideoPath = path.join(
  __dirname,
  "../../uploads/elearningMediaContents",
);

const normalizedImageVideoPath = path.normalize(imageVideoPath);

const cleanImageVideoPath = normalizedImageVideoPath.replace(/^\\/, "");

if (!fs.existsSync(cleanImageVideoPath)) {
  fs.mkdirSync(cleanImageVideoPath, {
    recursive: true,
  });
}

export const handleELearningMediaUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, cleanImageVideoPath);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);

      const now = new Date();

      const dateString = `${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

      const random = Math.random().toString(36).substring(2, 8);

      const safeName = file.originalname
        .replace(ext, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      cb(null, `media-${safeName}-${dateString}-${random}${ext}`);
    },
  }),

  limits: {
    files: 50,
    fileSize: 100 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowed = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".mp4",
      ".mov",
      ".avi",
      ".mkv",
      ".webm",
    ];

    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowed.includes(ext)) {
      return cb(new Error("Format image/video tidak didukung"));
    }

    cb(null, true);
  },
});

const eLearningStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "supportingFiles") {
      cb(null, cleanAssignmentFilesPath);
      return;
    }

    if (file.fieldname === "mediaFiles") {
      cb(null, cleanImageVideoPath);
      return;
    }

    cb(new Error("Field file tidak dikenali"), "");
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const now = new Date();

    const dateString = `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

    const random = Math.random().toString(36).substring(2, 8);

    const safeName = file.originalname
      .replace(ext, "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const prefix =
      file.fieldname === "supportingFiles" ? "assignment" : "media";

    cb(null, `${prefix}-${safeName}-${dateString}-${random}${ext}`);
  },
});

const assignmentExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".zip",
  ".rar",
  ".txt",
  ".ppt",
  ".pptx",
  // ← tambah format gambar agar supporting file bisa berupa gambar
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
];

const mediaExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".mp4",
  ".mov",
  ".avi",
  ".mkv",
  ".webm",
];

const eLearningFileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "supportingFiles") {
    if (!assignmentExtensions.includes(ext)) {
      return cb(new Error("Format file assignment tidak didukung"));
    }

    return cb(null, true);
  }

  if (file.fieldname === "mediaFiles") {
    if (!mediaExtensions.includes(ext)) {
      return cb(new Error("Format image/video tidak didukung"));
    }

    return cb(null, true);
  }

  return cb(new Error("Field file tidak dikenali"));
};

export const handleELearningTextFilesUpload = multer({
  storage: eLearningStorage,

  limits: {
    files: 70,
    fileSize: 100 * 1024 * 1024,
  },

  fileFilter: eLearningFileFilter,
}).fields([
  {
    name: "supportingFiles",
    maxCount: 20,
  },
  {
    name: "mediaFiles",
    maxCount: 50,
  },
]);

// === Buat folder penyimpanan untuk cover artikel ===
const articleCoverBasePath = path.join(__dirname, "../../images/articleCover");
const normalizedArticleCoverPath = path.normalize(articleCoverBasePath);
const correctArticleCoverPath = normalizedArticleCoverPath.replace(/^\\/, "");

if (!fs.existsSync(correctArticleCoverPath)) {
  fs.mkdirSync(correctArticleCoverPath, { recursive: true });
}

// === Middleware Upload Cover untuk Article (single file) ===
export const handleArticleCoverUpload = (field: string = "coverImage") => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, correctArticleCoverPath),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);

      const rawTitle = (req as any).body?.title || "untitled";

      const title = rawTitle
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      const now = new Date();
      const dateString = `${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

      const randomString = Math.random().toString(36).substring(2, 7);

      // Format nama file: cover-article-[title]-[date]-[random]
      const fileName = `cover-article-${title}-${dateString}-${randomString}${ext}`;

      cb(null, fileName);
    },
  });

  return multer({ storage }).single(field);
};

export { correctArticleCoverPath as articleCoverPath };

// === Untuk Image/Video di konten artikel (additionalContents: image_video) ===
const articleMediaPath = path.join(
  __dirname,
  "../../uploads/articleMediaContents",
);

const normalizedArticleMediaPath = path.normalize(articleMediaPath);
const cleanArticleMediaPath = normalizedArticleMediaPath.replace(/^\\/, "");

if (!fs.existsSync(cleanArticleMediaPath)) {
  fs.mkdirSync(cleanArticleMediaPath, { recursive: true });
}

const mediaExtensions2 = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".mp4",
  ".mov",
  ".avi",
  ".mkv",
  ".webm",
];

export const handleArticleContentFilesUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, cleanArticleMediaPath);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);

      const now = new Date();

      const dateString = `${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

      const random = Math.random().toString(36).substring(2, 8);

      const safeName = file.originalname
        .replace(ext, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      cb(null, `media-article-${safeName}-${dateString}-${random}${ext}`);
    },
  }),

  limits: {
    files: 50,
    fileSize: 100 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!mediaExtensions2.includes(ext)) {
      return cb(new Error("Format image/video tidak didukung"));
    }

    cb(null, true);
  },
}).array("mediaFiles", 50);

export { cleanArticleMediaPath as articleMediaPath };

function ensureDir(dir: string) {
  const clean = path.normalize(dir).replace(/^\\/, ""); // buang "\" di depan "D:\"
  if (!fs.existsSync(clean)) fs.mkdirSync(clean, { recursive: true });
  return clean;
}

function dateStamp() {
  const now = new Date();
  return `${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;
}

function randomString(bytes = 6) {
  return crypto.randomBytes(bytes).toString("hex");
}

// ─── Lokasi penyimpanan ─────────────────────────────────────────────────────
// header image  -> images/formHeaders        (publik via /images)
// media konten  -> uploads/formMediaContents (publik via /uploads)
// file jawaban  -> private/formAnswerFiles   (PRIVATE, jangan di-serve static!
//                  akses lewat endpoint ber-permission, lihat PRD FR-52)
const formHeaderPath = ensureDir(
  path.join(__dirname, "../../images/formHeaders"),
);
const formMediaPath = ensureDir(
  path.join(__dirname, "../../uploads/formMediaContents"),
);
const formAnswerFilesPath = ensureDir(
  path.join(__dirname, "../../private/formAnswerFiles"),
);

// ─── 1. Header image form (single file) ─────────────────────────────────────
const headerImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

export const handleFormHeaderImageUpload = (field: string = "headerImage") =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, formHeaderPath),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `form-header-${dateStamp()}-${randomString()}${ext}`);
      },
    }),
    limits: { files: 1, fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!headerImageExtensions.includes(ext)) {
        return cb(
          new Error("Format header image harus jpg, jpeg, png, atau webp"),
        );
      }
      cb(null, true);
    },
  }).single(field);

// ─── 2. Media konten form: elemen Image / Video (single file) ───────────────
const formMediaExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".mp4",
  ".mov",
  ".avi",
  ".mkv",
  ".webm",
];

export const handleFormMediaUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, formMediaPath),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = path
        .basename(file.originalname, ext)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 40);
      cb(null, `form-media-${safeName}-${dateStamp()}-${randomString()}${ext}`);
    },
  }),
  limits: { files: 1, fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!formMediaExtensions.includes(ext)) {
      return cb(new Error("Format image/video tidak didukung"));
    }
    cb(null, true);
  },
}).single("mediaFile");

// ─── 3. File jawaban responder (pertanyaan bertipe File Upload) ─────────────
// Field name WAJIB "file:<itemId>" supaya service tahu file milik pertanyaan
// mana. Contoh: formData.append(`file:${itemId}`, file)
// Grup tipe di bawah dipakai juga oleh service buat cek config.allowedTypes
// per pertanyaan; filter di sini cuma gerbang kasar (gabungan semua grup).
export const formAnswerFileTypeGroups: Record<string, string[]> = {
  image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  pdf: [".pdf"],
  document: [".doc", ".docx", ".txt"],
  spreadsheet: [".xls", ".xlsx", ".csv"],
  presentation: [".ppt", ".pptx"],
  video: [".mp4", ".mov", ".webm"],
  audio: [".mp3", ".wav"],
  archive: [".zip"],
};

const allAnswerExtensions = Object.values(formAnswerFileTypeGroups).flat();

export const FORM_ANSWER_MAX_FILES_PER_REQUEST = 20;
export const FORM_ANSWER_MAX_FILE_SIZE_MB = 50;

export const handleFormAnswerFilesUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, formAnswerFilesPath),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      // Nama asli TIDAK dipakai di disk (hindari karakter aneh / traversal).
      // Nama asli disimpan di DB (form_answer_files.original_name).
      cb(null, `ans-${dateStamp()}-${randomString(12)}${ext}`);
    },
  }),
  limits: {
    files: FORM_ANSWER_MAX_FILES_PER_REQUEST,
    fileSize: FORM_ANSWER_MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.fieldname.startsWith("file:")) {
      return cb(new Error('Nama field file harus diawali "file:<itemId>"'));
    }
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allAnswerExtensions.includes(ext)) {
      return cb(new Error("Format file tidak didukung"));
    }
    cb(null, true);
  },
}).any();

export { formHeaderPath, formMediaPath, formAnswerFilesPath };
