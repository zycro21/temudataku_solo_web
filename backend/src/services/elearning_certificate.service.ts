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

// UTILS DRAW TABLE
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

// PAGE 1
function renderCertificatePage({
  doc,
  certificateNumber,
  userName,
  courseTitle,
  issueDate,
  qrBuffer,
}: {
  doc: PDFKit.PDFDocument;
  certificateNumber: string;
  userName: string;
  courseTitle: string;
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
    .text("For successfully completing the course", { align: "center" });

  doc.moveDown(1).fontSize(22).fillColor("#00A859").text(courseTitle, {
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

// PAGE 2
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
  courseTitle,
  issueDate,
  pdfPath,
  userId,
  courseId,
}: {
  certificateNumber: string;
  userName: string;
  courseTitle: string;
  issueDate: Date;
  pdfPath: string;
  userId: string;
  courseId: string;
}) {
  /* ========= GET ASSESSMENT DATA ========= */

  const quizAttempt = await prisma.eLearningQuizAttempt.findFirst({
    where: {
      userId,
      quiz: {
        text: {
          subBab: {
            subChapter: {
              courseId,
            },
          },
        },
      },
    },
    orderBy: {
      score: "desc",
    },
  });

  const assignment = await prisma.eLearningSubmission.findFirst({
    where: {
      userId,
      assignment: {
        text: {
          subBab: {
            subChapter: {
              courseId,
            },
          },
        },
      },
    },
    orderBy: {
      score: "desc",
    },
  });

  const progress = await prisma.eLearningProgress.findMany({
    where: {
      userId,
      subBab: {
        subChapter: { courseId },
      },
    },
  });

  const progressScore =
    progress.length === 0
      ? 0
      : Math.round(
          (progress.filter((p) => p.isCompleted).length / progress.length) *
            100,
        );

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
      courseTitle,
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
  courseId,
  userId,
  verifiedBy,
  note,
}: {
  courseId: string;
  userId: string;
  verifiedBy?: string;
  note?: string;
}) => {
  /* === 1. CEK DUPLIKASI === */
  const existing = await prisma.eLearningCertificate.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  if (existing) {
    throw new Error("Certificate already exists for this course");
  }

  /* === 2. AMBIL DATA USER & COURSE === */
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fullName: true },
  });

  const course = await prisma.eLearningCourse.findUnique({
    where: { id: courseId },
    select: { title: true },
  });

  if (!user || !course) {
    throw new Error("User or course not found");
  }

  /* === 3. PREPARE FILE PATH === */
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
    courseTitle: course.title,
    issueDate: new Date(),
    pdfPath,
    userId,
    courseId,
  });

  /* === 4.1 UPLOAD KE GOOGLE DRIVE === */
  const uploadedFile = await uploadToGoogleDrive(
    pdfPath,
    fileName,
    "16dqTiqyEhFhrfzfoX5upUkgkNoUGNnI9", // ⬅️ ganti sesuai folder certificate e-learning
  );

  console.log("Uploaded to Google Drive:", uploadedFile.webViewLink);

  if (!uploadedFile?.webViewLink) {
    throw new Error("Failed to upload certificate to Google Drive");
  }

  /* === 5. SIMPAN KE DATABASE === */
  const certificate = await prisma.eLearningCertificate.create({
    data: {
      courseId,
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
      course: { select: { title: true } },
    },
  });

  return certificate;
};

// export const generateCertificateAuto = async ({
//   courseId,
//   userId,
// }: {
//   courseId: string;
//   userId: string;
// }) => {
//   const subBabCount = await prisma.eLearningSubBab.count({
//     where: {
//       subChapter: { courseId },
//     },
//   });

//   const completedCount = await prisma.eLearningProgress.count({
//     where: {
//       userId,
//       isCompleted: true,
//       subBab: {
//         subChapter: { courseId },
//       },
//     },
//   });

//   if (subBabCount === 0 || completedCount !== subBabCount) {
//     throw new Error("Progress belum 100%");
//   }

//   return generateCertificate({ courseId, userId });
// };

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
    ...(search && {
      course: {
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
      course: { select: { title: true } },
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
      course: {
        select: {
          id: true,
          title: true,
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

  // Authorization rule
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
      course: {
        select: {
          id: true,
          title: true,
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
      course: {
        select: {
          id: true,
          title: true,
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

  // 🔐 Ownership check (mentee only sees their own certificate)
  if (certificate.userId !== userId) {
    throw new Error("You are not allowed to view this certificate");
  }

  // ⛔ Jika sudah viewed, tidak perlu update
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
      course: {
        select: {
          id: true,
          title: true,
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
  /* === 1. AMBIL CERTIFICATE LAMA === */
  const certificate = await prisma.eLearningCertificate.findUnique({
    where: { id: certificateId },
    include: {
      user: { select: { id: true, fullName: true } },
      course: { select: { id: true, title: true } },
    },
  });

  if (!certificate) {
    throw new Error("Certificate not found");
  }

  /* === 2. HAPUS FILE PDF LAMA (JIKA ADA) === */
  if (certificate.certificatePath) {
    const oldPath = path.join(__dirname, "../../", certificate.certificatePath);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  /* === 3. GENERATE CERTIFICATE NUMBER BARU === */
  const newCertificateNumber = generateCertificateNumber();

  /* === 4. PREPARE FILE BARU === */
  const uploadDir = path.join(__dirname, "../../uploads/elearning_certificate");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${newCertificateNumber}.pdf`;
  const pdfPath = path.join(uploadDir, fileName);

  /* === 5. GENERATE ULANG PDF (PAKAI NOMOR BARU) === */
  await generateCertificatePDF({
    certificateNumber: newCertificateNumber,
    userName: certificate.user.fullName,
    courseTitle: certificate.course.title,
    issueDate: new Date(),
    pdfPath,
    userId: certificate.userId,
    courseId: certificate.courseId,
  });

  /* === 6. UPLOAD ULANG KE GOOGLE DRIVE === */
  const uploadedFile = await uploadToGoogleDrive(
    pdfPath,
    fileName,
    "16dqTiqyEhFhrfzfoX5upUkgkNoUGNnI9", // folder certificate
  );

  if (!uploadedFile?.webViewLink) {
    throw new Error("Failed to upload regenerated certificate");
  }

  /* === 7. UPDATE DATABASE (CERTIFICATE BARU) === */
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
      course: {
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
      course: {
        select: {
          id: true,
          title: true,
          category: true,
          level: true,
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

    CourseID: c.course.id,
    CourseTitle: c.course.title,
    CourseCategory: c.course.category || "",
    CourseLevel: c.course.level || "",

    VerifiedBy: c.verifiedBy || "",
    Note: c.note || "",
    CertificateURL: c.certificateUrl,
    CertificatePath: c.certificatePath || "",
  }));

  const dateStr = formatDate(new Date(), "yyyyMMdd-HHmmss");
  const baseFileName = `elearning-certificates-${dateStr}`;

  /* ===== EXCEL ===== */
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

  /* ===== CSV ===== */
  const parser = new Json2CsvParser();
  const csv = parser.parse(rows);

  return {
    buffer: Buffer.from(csv, "utf-8"),
    fileName: `${baseFileName}.csv`,
    mimeType: "text/csv",
  };
};
