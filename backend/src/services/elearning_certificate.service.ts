import { PrismaClient, Prisma } from "@prisma/client";
import { Parser as Json2CsvParser } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate, subDays } from "date-fns";
import { Buffer } from "buffer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { uploadToGoogleDrive } from "../utils/googleDrive.js";
import QRCode from "qrcode";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateCertificateNumber = () =>
  `ELCERT-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

const formatIssueDate = (date: Date) =>
  date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

async function generateQRCodeBuffer(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: "png",
    width: 250,
    margin: 1,
  });
}

/* ==============================
   PDF GENERATOR
================================ */

// UTILS DRAW TABLE — TIDAK BERUBAH
function drawTable({
  doc,
  startX,
  startY,
  rowHeight,
  columnWidths,
  rows,
}: {
  doc: PDFKit.PDFDocument;
  startX: number;
  startY: number;
  rowHeight: number;
  columnWidths: number[];
  rows: string[][];
}) {
  let y = startY;

  rows.forEach((row, rowIndex) => {
    let x = startX;

    row.forEach((cell, i) => {
      doc.rect(x, y, columnWidths[i], rowHeight).stroke();

      doc
        .fontSize(rowIndex === 0 ? 12 : 11)
        .fillColor(rowIndex === 0 ? "#0A2A66" : "#000000")
        .text(cell, x + 8, y + 8, {
          width: columnWidths[i] - 16,
          align: "left",
        });

      x += columnWidths[i];
    });

    y += rowHeight;
  });
}

// PAGE 1 — 🔥 UBAH: courseTitle → subChapterTitle (nama parameter saja,
// isi/urutan tampilannya di PDF tidak berubah)
function renderCertificatePage({
  doc,
  certificateNumber,
  userName,
  subChapterTitle,
  issueDate,
  qrBuffer,
}: {
  doc: PDFKit.PDFDocument;
  certificateNumber: string;
  userName: string;
  subChapterTitle: string;
  issueDate: Date;
  qrBuffer: Buffer;
}) {
  /* BACKGROUND */
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#FFFFFF");

  /* HEADER */
  doc
    .fontSize(30)
    .fillColor("#0A2A66")
    .text("CERTIFICATE OF COMPLETION", 0, 80, { align: "center" });

  /* BODY */
  doc
    .moveDown(2)
    .fontSize(14)
    .fillColor("#333")
    .text("This certificate is proudly presented to", { align: "center" });

  doc.moveDown(1).fontSize(28).fillColor("#000").text(userName, {
    align: "center",
  });

  doc
    .moveDown(1)
    .fontSize(14)
    .fillColor("#333")
    .text("For successfully completing the class", { align: "center" });

  doc.moveDown(1).fontSize(22).fillColor("#00A859").text(subChapterTitle, {
    align: "center",
  });

  /* FOOTER */
  doc
    .fontSize(12)
    .fillColor("#666")
    .text(`Issued on ${formatIssueDate(issueDate)}`, 80, doc.page.height - 120);

  doc
    .fontSize(10)
    .fillColor("#666")
    .text(certificateNumber, 80, doc.page.height - 95);

  /* QR */
  doc.image(qrBuffer, doc.page.width - 200, doc.page.height - 200, {
    width: 120,
  });
}

// PAGE 2 — TIDAK BERUBAH
function buildAssessmentRows(data: {
  quizScore?: number;
  assignmentScore?: number;
  progressScore?: number;
}) {
  const finalScore = Math.round(
    ((data.quizScore ?? 0) +
      (data.assignmentScore ?? 0) +
      (data.progressScore ?? 0)) /
      3,
  );

  return [
    ["Component", "Score", "Max Score", "Remarks"],
    ["Quiz", `${data.quizScore ?? "-"}`, "100", "Passed"],
    ["Assignment", `${data.assignmentScore ?? "-"}`, "100", "Reviewed"],
    ["Practice Progress", `${data.progressScore ?? "-"}`, "100", "Completed"],
    ["Final Score", `${finalScore}`, "100", "Very Good"],
  ];
}

function renderAssessmentPage(doc: PDFKit.PDFDocument, rows: string[][]) {
  doc
    .fontSize(22)
    .fillColor("#0A2A66")
    .text("Assessment Summary", 0, 50, { align: "center" });

  drawTable({
    doc,
    startX: 80,
    startY: 120,
    rowHeight: 40,
    columnWidths: [220, 100, 120, 200],
    rows,
  });

  doc
    .fontSize(10)
    .fillColor("#666")
    .text(
      "This page provides a detailed breakdown of participant assessment results.",
      80,
      doc.page.height - 80,
    );
}

async function generateCertificatePDF({
  certificateNumber,
  userName,
  subChapterTitle,
  issueDate,
  pdfPath,
  userId,
  subChapterId,
}: {
  certificateNumber: string;
  userName: string;
  subChapterTitle: string;
  issueDate: Date;
  pdfPath: string;
  userId: string;
  subChapterId: string; // 🔥 UBAH: dulu courseId
}) {
  /* ========= GET ASSESSMENT DATA ========= */

  // 🔥 UBAH (quiz):
  // 1. Filter: dulu naik sampai ke `subChapter.courseId` (via Course),
  //    sekarang cukup `subBab.subChapterId` langsung — subChapterId
  //    memang sudah scalar field di ELearningSubBab, nggak perlu lompat
  //    lewat Course lagi.
  // 2. orderBy: dulu `score: "desc"` (ambil skor TERTINGGI, salah — bisa
  //    ambil attempt lama yang kebetulan skornya lebih bagus). Sekarang
  //    `attemptNumber: "desc"` → ambil attempt PALING TERAKHIR sesuai
  //    permintaan, apa pun skornya.
  // 3. Satu subChapter cuma boleh ada 1 quiz (task per subChapter),
  //    jadi findFirst di sini aman tanpa perlu group by quizId.
  const quizAttempt = await prisma.eLearningQuizAttempt.findFirst({
    where: {
      userId,
      quiz: {
        text: {
          subBab: {
            subChapterId,
          },
        },
      },
    },
    orderBy: {
      attemptNumber: "desc",
    },
  });

  // 🔥 UBAH (assignment/submission): sama persis polanya seperti quiz di
  // atas — filter langsung ke `subBab.subChapterId`, orderBy diganti
  // jadi `attemptNumber: "desc"` (attempt terakhir, bukan skor
  // tertinggi).
  const assignment = await prisma.eLearningSubmission.findFirst({
    where: {
      userId,
      assignment: {
        text: {
          subBab: {
            subChapterId,
          },
        },
      },
    },
    orderBy: {
      attemptNumber: "desc",
    },
  });

  // 🔥 UBAH (progress): dulu manual hitung dari ELearningProgress
  // (per-subBab isCompleted, di-scope ke seluruh course). Sekarang
  // tinggal baca LANGSUNG dari ELearningSubChapterProgress.progressPercent
  // — itu sudah sumber kebenaran progress yang benar (yang juga dipakai
  // sidebar mentee), jadi nggak perlu hitung ulang manual lagi di sini.
  const subChapterProgress =
    await prisma.eLearningSubChapterProgress.findUnique({
      where: {
        userId_subChapterId: { userId, subChapterId },
      },
      select: { progressPercent: true },
    });

  const progressScore = Math.round(subChapterProgress?.progressPercent ?? 0);

  const quizScore =
    typeof quizAttempt?.score === "number" ? quizAttempt.score : undefined;

  const assignmentScore =
    typeof assignment?.score === "number" ? assignment.score : undefined;

  const assessmentRows = buildAssessmentRows({
    quizScore,
    assignmentScore,
    progressScore,
  });

  const verifyUrl = `https://frontend-domain.com/certificates/${certificateNumber}`;
  const qrBuffer = await generateQRCodeBuffer(verifyUrl);

  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 40,
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    /* ========= PAGE 1 ========= */
    renderCertificatePage({
      doc,
      certificateNumber,
      userName,
      subChapterTitle,
      issueDate,
      qrBuffer,
    });

    /* ========= PAGE 2 ========= */
    doc.addPage({
      size: "A4",
      layout: "landscape",
      margin: 40,
    });

    renderAssessmentPage(doc, assessmentRows);

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

/* ==============================
   MAIN SERVICE
================================ */

export const generateCertificate = async ({
  subChapterId,
  userId,
  verifiedBy,
  note,
}: {
  subChapterId: string; // 🔥 UBAH: dulu courseId
  userId: string;
  verifiedBy?: string;
  note?: string;
}) => {
  /* === 1. CEK DUPLIKASI ===
     🔥 UBAH: compound unique key `userId_courseId` → `userId_subChapterId`
     (sesuai `@@unique([userId, subChapterId])` di schema baru) */
  const existing = await prisma.eLearningCertificate.findUnique({
    where: {
      userId_subChapterId: { userId, subChapterId },
    },
  });

  if (existing) {
    throw new Error("Certificate already exists for this sub-chapter");
  }

  /* === 2. AMBIL DATA USER & SUB-CHAPTER ===
     🔥 UBAH: query course → query subChapter */
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fullName: true },
  });

  const subChapter = await prisma.eLearningSubChapter.findUnique({
    where: { id: subChapterId },
    select: { title: true },
  });

  if (!user || !subChapter) {
    throw new Error("User or sub-chapter not found");
  }

  /* === 3. PREPARE FILE PATH === (tidak berubah) */
  const certificateNumber = generateCertificateNumber();

  const uploadDir = path.join(__dirname, "../../uploads/elearning_certificate");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${certificateNumber}.pdf`;
  const pdfPath = path.join(uploadDir, fileName);

  /* === 4. GENERATE PDF === */
  await generateCertificatePDF({
    certificateNumber,
    userName: user.fullName,
    subChapterTitle: subChapter.title, // 🔥 UBAH: courseTitle → subChapterTitle
    issueDate: new Date(),
    pdfPath,
    userId,
    subChapterId, // 🔥 UBAH
  });

  /* === 4.1 UPLOAD KE GOOGLE DRIVE === (tidak berubah) */
  const uploadedFile = await uploadToGoogleDrive(
    pdfPath,
    fileName,
    "16dqTiqyEhFhrfzfoX5upUkgkNoUGNnI9",
  );

  console.log("Uploaded to Google Drive:", uploadedFile.webViewLink);

  if (!uploadedFile?.webViewLink) {
    throw new Error("Failed to upload certificate to Google Drive");
  }

  /* === 5. SIMPAN KE DATABASE ===
     🔥 UBAH: `courseId` → `subChapterId` di data create, dan
     `include: { course }` → `include: { subChapter }` */
  const certificate = await prisma.eLearningCertificate.create({
    data: {
      subChapterId,
      userId,
      certificateNumber,
      certificateUrl: uploadedFile.webViewLink,
      certificatePath: `/uploads/elearning_certificate/${fileName}`,
      issuedAt: new Date(),
      status: "generated",
      verifiedBy,
      note,
    },
    include: {
      user: { select: { fullName: true } },
      subChapter: { select: { title: true } },
    },
  });

  return certificate;
};

export const generateCertificateAuto = async ({
  subChapterId,
  userId,
}: {
  subChapterId: string;
  userId: string;
}) => {
  // 🔥 UBAH TOTAL: dulu ngitung manual (subBabCount vs completedCount
  // dari ELearningProgress, di-scope lewat courseId). Sekarang tinggal
  // baca LANGSUNG dari ELearningSubChapterProgress.progressPercent —
  // itu satu-satunya sumber kebenaran progress yang sudah kita bangun
  // (dan yang juga ditampilkan ke mentee di sidebar), jadi trigger
  // sertifikat ini otomatis konsisten dengan apa yang mentee lihat
  // sendiri. Nggak perlu hitung ulang dari ELearningProgress lagi (itu
  // model lama yang sudah nggak jadi sumber progress yang aktif).
  const progress = await prisma.eLearningSubChapterProgress.findUnique({
    where: {
      userId_subChapterId: { userId, subChapterId },
    },
    select: { progressPercent: true },
  });

  if (!progress || progress.progressPercent < 100) {
    throw new Error("Progress belum 100%");
  }

  return generateCertificate({ subChapterId, userId });
};

export const getCertificatesByUser = async ({
  userId,
  query,
}: {
  userId: string;
  query?: {
    page?: number;
    limit?: number;
    sortBy?: "issuedAt" | "createdAt";
    sortOrder?: "asc" | "desc";
    status?: string;
    search?: string;
  };
}) => {
  const {
    page = 1,
    limit = 10000,
    sortBy = "issuedAt",
    sortOrder = "desc",
    status,
    search,
  } = query || {};

  const where: any = {
    userId,
    ...(status && { status }),
    // 🔥 UBAH: `course: { title: {...} }` → `subChapter: { title: {...} }`
    // — search sekarang mencari berdasarkan judul sub-chapter (kelas),
    // bukan judul course lagi, karena sertifikat nempel ke SubChapter.
    ...(search && {
      subChapter: {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
    }),
  };

  const total = await prisma.eLearningCertificate.count({ where });

  const rows = await prisma.eLearningCertificate.findMany({
    where,
    include: {
      // 🔥 UBAH: `course: {...}` → `subChapter: {...}`, plus disertakan
      // nested `course` di dalamnya biar mentee tetap bisa lihat course
      // induknya di daftar sertifikat (dulu itu langsung ada di
      // `course.title`, sekarang lewat `subChapter.course.title`).
      subChapter: {
        select: {
          title: true,
          course: { select: { title: true } },
        },
      },
    },
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: rows,
  };
};

export const getCertificateDetail = async ({
  certificateId,
  userId,
  isAdmin,
}: {
  certificateId: string;
  userId: string;
  isAdmin: boolean;
}) => {
  const cert = await prisma.eLearningCertificate.findUnique({
    where: { id: certificateId },
    include: {
      // 🔥 UBAH: `course: {...}` → `subChapter: {...}`, plus disertakan
      // nested `course` di dalamnya biar detail sertifikat tetap bisa
      // nampilin course induknya juga (dulu langsung `course.title`,
      // sekarang lewat `subChapter.course.title`).
      subChapter: {
        select: {
          id: true,
          title: true,
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!cert) {
    throw new Error("Certificate not found");
  }

  // Authorization rule — TIDAK berubah, tetap pakai cert.userId
  if (!isAdmin && cert.userId !== userId) {
    throw new Error("Forbidden");
  }

  return cert;
};

export const deleteCertificate = async (id: string) => {
  // 1. Ambil data certificate dulu
  const certificate = await prisma.eLearningCertificate.findUnique({
    where: { id },
    select: {
      id: true,
      certificatePath: true,
    },
  });

  if (!certificate) {
    throw new Error("Certificate not found");
  }

  // 2. Hapus file PDF di local (jika ada)
  if (certificate.certificatePath) {
    const absolutePath = path.join(
      __dirname,
      "../../",
      certificate.certificatePath,
    );

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  // 3. Hapus data dari database
  await prisma.eLearningCertificate.delete({
    where: { id },
  });
};

export const getAllCertificates = async ({
  page = 1,
  limit = 10000,
  sortBy = "issuedAt",
  sortOrder = "desc",
  status,
}: {
  page?: number;
  limit?: number;
  sortBy?: "issuedAt" | "createdAt" | "certificateNumber";
  sortOrder?: "asc" | "desc";
  status?: string;
}) => {
  const where: any = {};

  if (status) {
    where.status = status;
  }

  const total = await prisma.eLearningCertificate.count({ where });

  const rows = await prisma.eLearningCertificate.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      // 🔥 UBAH: `course: {...}` → `subChapter: {...}`, plus disertakan
      // nested `course` di dalamnya biar admin tetap bisa lihat course
      // induknya (dulu langsung `course.title`, sekarang lewat
      // `subChapter.course.title`).
      subChapter: {
        select: {
          id: true,
          title: true,
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: rows,
  };
};

export const updateCertificate = async (
  certificateId: string,
  data: {
    status?: "generated" | "sent" | "viewed";
    note?: string;
    verifiedBy?: string;
  },
) => {
  const certificate = await prisma.eLearningCertificate.findUnique({
    where: { id: certificateId },
  });

  if (!certificate) {
    throw new Error("Certificate not found");
  }

  const updated = await prisma.eLearningCertificate.update({
    where: { id: certificateId },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.note && { note: data.note }),
      ...(data.verifiedBy && { verifiedBy: data.verifiedBy }),
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      // 🔥 UBAH: `course: {...}` → `subChapter: {...}`, plus disertakan
      // nested `course` di dalamnya biar admin tetap bisa lihat course
      // induknya di response update.
      subChapter: {
        select: {
          id: true,
          title: true,
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  return updated;
};

export const markCertificateAsViewed = async (
  certificateId: string,
  userId: string,
) => {
  const certificate = await prisma.eLearningCertificate.findUnique({
    where: { id: certificateId },
  });

  if (!certificate) {
    throw new Error("Certificate not found");
  }

  // 🔐 Ownership check — TIDAK berubah
  if (certificate.userId !== userId) {
    throw new Error("You are not allowed to view this certificate");
  }

  // ⛔ TIDAK berubah
  if (certificate.status === "viewed") {
    return certificate;
  }

  const updated = await prisma.eLearningCertificate.update({
    where: { id: certificateId },
    data: {
      status: "viewed",
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      // 🔥 UBAH: `course: {...}` → `subChapter: {...}`, plus disertakan
      // nested `course` di dalamnya.
      subChapter: {
        select: {
          id: true,
          title: true,
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  return updated;
};

export const regenerateCertificate = async (
  certificateId: string,
  adminId: string,
) => {
  /* === 1. AMBIL CERTIFICATE LAMA ===
     🔥 UBAH: `course: {...}` → `subChapter: {...}` */
  const certificate = await prisma.eLearningCertificate.findUnique({
    where: { id: certificateId },
    include: {
      user: { select: { id: true, fullName: true } },
      subChapter: { select: { id: true, title: true } },
    },
  });

  if (!certificate) {
    throw new Error("Certificate not found");
  }

  /* === 2. HAPUS FILE PDF LAMA (JIKA ADA) === (tidak berubah) */
  if (certificate.certificatePath) {
    const oldPath = path.join(__dirname, "../../", certificate.certificatePath);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  /* === 3. GENERATE CERTIFICATE NUMBER BARU === (tidak berubah) */
  const newCertificateNumber = generateCertificateNumber();

  /* === 4. PREPARE FILE BARU === (tidak berubah) */
  const uploadDir = path.join(__dirname, "../../uploads/elearning_certificate");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${newCertificateNumber}.pdf`;
  const pdfPath = path.join(uploadDir, fileName);

  /* === 5. GENERATE ULANG PDF (PAKAI NOMOR BARU) ===
     🔥 UBAH: `courseTitle`/`courseId` → `subChapterTitle`/`subChapterId`
     — mengikuti signature `generateCertificatePDF` yang sudah kita
     ubah di endpoint generate manual sebelumnya. Kalau ini nggak
     disesuaikan, TypeScript bakal error karena parameter yang dikirim
     nggak match dengan yang diminta fungsinya. */
  await generateCertificatePDF({
    certificateNumber: newCertificateNumber,
    userName: certificate.user.fullName,
    subChapterTitle: certificate.subChapter.title,
    issueDate: new Date(),
    pdfPath,
    userId: certificate.userId,
    subChapterId: certificate.subChapterId,
  });

  /* === 6. UPLOAD ULANG KE GOOGLE DRIVE === (tidak berubah) */
  const uploadedFile = await uploadToGoogleDrive(
    pdfPath,
    fileName,
    "16dqTiqyEhFhrfzfoX5upUkgkNoUGNnI9",
  );

  if (!uploadedFile?.webViewLink) {
    throw new Error("Failed to upload regenerated certificate");
  }

  /* === 7. UPDATE DATABASE (CERTIFICATE BARU) ===
     🔥 UBAH: `include.course` → `include.subChapter` */
  const updated = await prisma.eLearningCertificate.update({
    where: { id: certificateId },
    data: {
      certificateNumber: newCertificateNumber,
      certificateUrl: uploadedFile.webViewLink,
      certificatePath: `/uploads/elearning_certificate/${fileName}`,
      issuedAt: new Date(),
      status: "generated",
      verifiedBy: adminId,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      subChapter: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return updated;
};

export const exportCertificatesToFile = async (formatType: string) => {
  const certificates = await prisma.eLearningCertificate.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
      // 🔥 UBAH: `course: {...}` → `subChapter: {...}`. `level` diambil
      // dari SubChapter sendiri (lebih akurat, karena sertifikat memang
      // levelnya sekarang per sub-chapter/kelas). `category` tetap
      // cuma ada di Course, jadi diambil lewat nested `course` di
      // dalamnya. `course.title` juga disertakan biar kolom export
      // tetap bisa nunjukin course induknya.
      subChapter: {
        select: {
          id: true,
          title: true,
          level: true,
          course: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      issuedAt: "desc",
    },
  });

  const rows = certificates.map((c) => ({
    CertificateID: c.id,
    CertificateNumber: c.certificateNumber,
    Status: c.status || "generated",
    IssuedAt: c.issuedAt ? formatDate(c.issuedAt, "yyyy-MM-dd HH:mm:ss") : "",

    UserID: c.user.id,
    UserEmail: c.user.email,
    UserFullName: c.user.fullName,

    // 🔥 UBAH: kolom Course* → SubChapter* + CourseTitle terpisah,
    // supaya tetap jelas ini sertifikat kelas (sub-chapter) yang mana,
    // sekaligus course induknya apa.
    SubChapterID: c.subChapter.id,
    SubChapterTitle: c.subChapter.title,
    SubChapterLevel: c.subChapter.level || "",
    CourseID: c.subChapter.course.id,
    CourseTitle: c.subChapter.course.title,
    CourseCategory: c.subChapter.course.category || "",

    VerifiedBy: c.verifiedBy || "",
    Note: c.note || "",
    CertificateURL: c.certificateUrl,
    CertificatePath: c.certificatePath || "",
  }));

  const dateStr = formatDate(new Date(), "yyyyMMdd-HHmmss");
  const baseFileName = `elearning-certificates-${dateStr}`;

  /* ===== EXCEL ===== (tidak berubah) */
  if (formatType === "excel") {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("E-Learning Certificates");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
    }));

    rows.forEach((row) => worksheet.addRow(row));
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      buffer,
      fileName: `${baseFileName}.xlsx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  /* ===== CSV ===== (tidak berubah) */
  const parser = new Json2CsvParser();
  const csv = parser.parse(rows);

  return {
    buffer: Buffer.from(csv, "utf-8"),
    fileName: `${baseFileName}.csv`,
    mimeType: "text/csv",
  };
};
