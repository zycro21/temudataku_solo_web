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
import {
  renderCertificatePage,
  renderAssessmentPage,
} from "../utils/certificateDesign.js";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚠️ Ganti ini pakai domain frontend production kamu, atau (lebih baik)
// taruh di .env sebagai FRONTEND_URL supaya gampang beda-beda per
// environment (dev/staging/prod) tanpa perlu redeploy code.
const FRONTEND_URL = process.env.FRONTEND_URL ?? "https://temudataku.com";

// ID internal, dipakai buat nama file PDF & path di URL verifikasi QR.
// SENGAJA dibikin aman-URL/aman-filesystem (nggak ada karakter "/"),
// beda sama `displayNumber` yang formatnya ada "/" dan cuma buat
// DITAMPILKAN di sertifikat, bukan buat jadi bagian URL/nama file.
const generateCertificateNumber = () =>
  `ELCERT-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

// 🔥 BARU: generator nomor "cantik" yang ditampilkan di sertifikat,
// formatnya: "01/ABCDEFG/TemuDataku"
//   - "01"      → 2 digit nomor batch, urut. Naik +1 tiap kali total
//                 sertifikat yang sudah pernah dibuat (di seluruh sistem)
//                 sudah mencapai kelipatan 10.000.
//   - "ABCDEFG" → 7 huruf acak (A-Z), DICEK UNIK ke database (bukan cuma
//                 unik dalam batch, tapi unik keseluruhan), retry kalau
//                 ternyata bentrok.
//   - "TemuDataku" → suffix tetap.
const RANDOM_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateRandomLetters(length = 7) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += RANDOM_LETTERS[Math.floor(Math.random() * RANDOM_LETTERS.length)];
  }
  return result;
}

async function generateDisplayCertificateNumber(): Promise<string> {
  // Batch number: total sertifikat yang SUDAH ADA di DB dibagi 10.000.
  // Sertifikat ke-1 s/d 10.000 → batch "01", ke-10.001 s/d 20.000 →
  // batch "02", dst.
  const totalIssued = await prisma.eLearningCertificate.count();
  const batchNumber = Math.floor(totalIssued / 10000) + 1;
  const batchLabel = String(batchNumber).padStart(2, "0");

  const MAX_ATTEMPTS = 25;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const randomLetters = generateRandomLetters(7);
    const displayNumber = `${batchLabel}/${randomLetters}/TemuDataku`;

    // Cek unik ke DB. Field `displayNumber` perlu ditambah dulu di
    // schema Prisma (lihat catatan migrasi di bawah kode ini).
    const existing = await prisma.eLearningCertificate.findUnique({
      where: { displayNumber },
    });

    if (!existing) {
      return displayNumber;
    }
  }

  // Kalau 25x percobaan tetap bentrok terus (kemungkinan sangat kecil,
  // 26^7 = ±8 miliar kombinasi), lempar error daripada nyimpen data yang
  // nggak konsisten.
  throw new Error(
    "Gagal generate nomor sertifikat unik setelah beberapa kali percobaan. Silakan coba lagi.",
  );
}

async function generateQRCodeBuffer(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: "png",
    width: 250,
    margin: 1,
  });
}

/* ==============================
   PDF GENERATOR
   (drawTable, renderCertificatePage, renderAssessmentPage sudah
   PINDAH ke ../utils/certificateDesign.ts — jangan didefinisikan lagi
   di sini biar nggak dobel/konflik nama)
================================ */

// 🔥 BARU: mapping Final Score → Remarks, per rentang 20 poin.
// Mau ganti label/rentangnya? tinggal ubah di sini.
function getFinalScoreRemark(score: number): string {
  if (score <= 20) return "Poor";
  if (score <= 40) return "Fair";
  if (score <= 60) return "Good";
  if (score <= 80) return "Very Good";
  return "Excellent";
}

// PAGE 2 — TIDAK BERUBAH
function buildAssessmentRows(data: {
  quizScore?: number;
  assignmentScore?: number;
  progressScore?: number;
}) {
  // 🔥 FIX: dulu Final Score SELALU dibagi 3 (quiz + assignment + progress) / 3.
  // Masalahnya, kalau quiz/assignment belum ada (`undefined`, ditampilkan "-"),
  // itu ikut kehitung sebagai 0 di pembagian — jadi Final Score-nya jadi
  // kekecilan nggak adil (mis. cuma progress 100 tapi hasilnya 33).
  // Sekarang: cuma komponen yang BENERAN ADA (bukan `undefined`) yang ikut
  // dijumlah, dan pembaginya pun cuma sejumlah komponen yang ada itu.
  const components = [
    data.quizScore,
    data.assignmentScore,
    data.progressScore,
  ].filter((score): score is number => typeof score === "number");

  const finalScore =
    components.length > 0
      ? Math.round(
          components.reduce((sum, score) => sum + score, 0) / components.length,
        )
      : 0;

  return [
    ["Component", "Score", "Max Score", "Remarks"],
    ["Quiz", `${data.quizScore ?? "-"}`, "100", "Reviewed"],
    ["Assignment", `${data.assignmentScore ?? "-"}`, "100", "Reviewed"],
    ["Practice Progress", `${data.progressScore ?? "-"}`, "100", "Completed"],
    // 🔥 UBAH: Remarks-nya dulu di-hardcode "Very Good" terus, sekarang
    // dinamis lewat `getFinalScoreRemark(finalScore)` sesuai rentang di atas.
    ["Final Score", `${finalScore}`, "100", getFinalScoreRemark(finalScore)],
  ];
}

async function generateCertificatePDF({
  certificateNumber,
  displayNumber,
  userName,
  subChapterTitle,
  issueDate,
  pdfPath,
  userId,
  subChapterId,
  verifyUrl,
}: {
  certificateNumber: string;
  displayNumber: string; // 🔥 BARU
  userName: string;
  subChapterTitle: string;
  issueDate: Date;
  pdfPath: string;
  userId: string;
  subChapterId: string;
  verifyUrl: string; // 🔥 BARU: URL detail sertifikat di frontend, sumber QR
}) {
  /* ========= GET ASSESSMENT DATA ========= */

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

  // 🔥 UBAH: QR sekarang mengarah ke `verifyUrl` yang dikirim dari
  // `generateCertificate`/`generateOrRegenerateCertificate` (halaman
  // detail sertifikat di frontend), bukan di-generate ulang di sini.
  const qrBuffer = await generateQRCodeBuffer(verifyUrl);

  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape", // ✅ Page 1 horizontal
      margin: 0,
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    /* ========= PAGE 1 ========= */
    renderCertificatePage({
      doc,
      certificateNumber,
      displayNumber,
      userName,
      subChapterTitle,
      issueDate,
      qrBuffer,
      logoImagePath: path.join(__dirname, "../../assets/logo-clean.png"), // 🔥 aktifkan
      signatureImagePath: path.join(
        __dirname,
        "../../assets/signature-fathur.png",
      ), // 🔥 aktifkan
      // signerName: "Mohammad Fathur Rozi",
      // signerTitle: "CEO TemuDataku",
    });

    /* ========= PAGE 2 ========= */
    doc.addPage({
      size: "A4",
      layout: "landscape", // ✅ Page 2 horizontal juga
      margin: 0,
    });

    renderAssessmentPage(doc, subChapterTitle, assessmentRows, {
      logoImagePath: path.join(__dirname, "../../assets/logo-clean.png"),
    });

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

// 🔥 DIHAPUS (dulu ada di sini): QUIZ_PASSING_SCORE, MAX_QUIZ_ATTEMPTS,
// ASSIGNMENT_PASSING_SCORE, MAX_ASSIGNMENT_ATTEMPTS, class
// CertificateNotEligibleError, isQuizAssessmentPassed(),
// isProjectAssessmentPassed(), buildNotEligibleMessage(),
// checkAssessmentEligibility(). Semua logic "syarat skor quiz/assignment
// sebelum boleh cetak sertifikat" itu SUDAH TIDAK ADA — sertifikat
// sekarang dicetak MANUAL oleh mentee, syaratnya cukup progress
// SubChapter = 100% (progress itu sendiri sudah mensyaratkan quiz pernah
// disubmit / assignment sudah direview & tidak revisi — logic itu ada di
// service progress, bukan di file ini).

// 🔥 BARU: error khusus buat "belum boleh cetak ULANG karena masih dalam
// masa cooldown" — dibedakan dari error generik lewat `.code`, supaya
// controller bisa balikin status yang sesuai (422, bukan 500) dan FE
// bisa nampilin pesan yang pas (tanpa menghilangkan sertifikat lama yang
// masih berlaku).
class CertificateCooldownError extends Error {
  code = "CERTIFICATE_COOLDOWN" as const;
  nextAllowedAt: Date;
  constructor(message: string, nextAllowedAt: Date) {
    super(message);
    this.name = "CertificateCooldownError";
    this.nextAllowedAt = nextAllowedAt;
  }
}

// 🔥 BARU: cetak ulang dibatasi 1x per 30 hari, dihitung dari `issuedAt`
// sertifikat yang lagi aktif. ⚠️ SAMAKAN dengan PRINT_COOLDOWN_DAYS di FE
// (useElearningSubChapterCertificate.ts).
const CERTIFICATE_PRINT_COOLDOWN_DAYS = 30;

/* ==============================
   MAIN SERVICE
================================ */

// TIDAK DIUBAH — tetap dipakai eksklusif oleh endpoint admin manual
// (`POST /subchapters/:id/certificate`), TETAP throw kalau sertifikat
// sudah ada. Alur cetak-manual MENTEE pakai fungsi terpisah di bawah
// (`generateOrRegenerateCertificate` via `generateCertificateAuto`),
// supaya perilaku admin tidak ikut berubah.
export const generateCertificate = async ({
  subChapterId,
  userId,
  verifiedBy,
  note,
}: {
  subChapterId: string;
  userId: string;
  verifiedBy?: string;
  note?: string;
}) => {
  /* === 1. CEK DUPLIKASI === */
  const existing = await prisma.eLearningCertificate.findUnique({
    where: {
      userId_subChapterId: { userId, subChapterId },
    },
  });

  if (existing) {
    throw new Error("Certificate already exists for this sub-chapter");
  }

  /* === 2. AMBIL DATA USER & SUB-CHAPTER === */
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

  /* === 3. PREPARE FILE PATH & NOMOR SERTIFIKAT === */
  const certificateNumber = generateCertificateNumber(); // ID internal (aman utk file/URL)
  const displayNumber = await generateDisplayCertificateNumber(); // 🔥 BARU: nomor cantik "01/ABCDEFG/TemuDataku"

  const uploadDir = path.join(__dirname, "../../uploads/elearning_certificate");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${certificateNumber}.pdf`;
  const pdfPath = path.join(uploadDir, fileName);

  // 🔥 BARU: URL halaman detail sertifikat di FE — ini yang jadi tujuan
  // QR code kalau di-scan. Pakai `certificateNumber` (bukan
  // `displayNumber`) sebagai slug karena aman dipakai di URL (nggak ada
  // karakter "/"). Sesuaikan path route-nya kalau di FE beda.
  const verifyUrl = `${FRONTEND_URL}/certificates/${certificateNumber}`;

  /* === 4. GENERATE PDF === */
  await generateCertificatePDF({
    certificateNumber,
    displayNumber,
    userName: user.fullName,
    subChapterTitle: subChapter.title,
    issueDate: new Date(),
    pdfPath,
    userId,
    subChapterId,
    verifyUrl,
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

  /* === 5. SIMPAN KE DATABASE === */
  const certificate = await prisma.eLearningCertificate.create({
    data: {
      subChapterId,
      userId,
      certificateNumber,
      displayNumber, // 🔥 BARU — perlu kolom baru di schema, lihat catatan di bawah
      certificateUrl: uploadedFile.webViewLink,
      certificatePath: `/uploads/elearning_certificate/${fileName}`,
      issuedAt: new Date(),
      status: "generated",
      verifiedBy,
      note,
    },
    select: {
      certificateNumber: true,
      displayNumber: true,
      certificateUrl: true,
      issuedAt: true,
      status: true,
      certificatePath: true,
      user: {
        select: {
          fullName: true,
        },
      },
      subChapter: {
        select: {
          title: true,
          course: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  return certificate;
};

// 🔥 BARU: dipakai KHUSUS oleh alur cetak-manual mentee. Beda dari
// `generateCertificate` (admin) yang throw kalau sertifikat sudah ada —
// fungsi ini UPSERT: kalau belum ada, buat baru (nomor sertifikat baru).
// Kalau SUDAH ada (mentee cetak ULANG), update record YANG SAMA
// (certificateNumber & displayNumber dipertahankan — dianggap sertifikat
// yang sama, cuma direvisi datanya/skornya, BUKAN sertifikat baru yang
// terpisah), cuma PDF + issuedAt + certificateUrl yang diperbarui.
const generateOrRegenerateCertificate = async ({
  subChapterId,
  userId,
  isReprint,
}: {
  subChapterId: string;
  userId: string;
  isReprint: boolean;
}) => {
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

  const existing = await prisma.eLearningCertificate.findUnique({
    where: { userId_subChapterId: { userId, subChapterId } },
  });

  const certificateNumber =
    existing?.certificateNumber ?? generateCertificateNumber();
  const displayNumber =
    existing?.displayNumber ?? (await generateDisplayCertificateNumber());

  const uploadDir = path.join(__dirname, "../../uploads/elearning_certificate");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${certificateNumber}.pdf`;
  const pdfPath = path.join(uploadDir, fileName);
  const verifyUrl = `${FRONTEND_URL}/certificates/${certificateNumber}`;

  // Skor yang dipakai SELALU dari attempt/submission PALING TERAKHIR —
  // ini sudah jadi perilaku generateCertificatePDF() (orderBy
  // attemptNumber "desc") — TIDAK PERLU diubah, otomatis ambil nilai
  // terbaru tiap kali fungsi ini dipanggil (baik cetak pertama maupun
  // cetak ulang).
  await generateCertificatePDF({
    certificateNumber,
    displayNumber,
    userName: user.fullName,
    subChapterTitle: subChapter.title,
    issueDate: new Date(),
    pdfPath,
    userId,
    subChapterId,
    verifyUrl,
  });

  const uploadedFile = await uploadToGoogleDrive(
    pdfPath,
    fileName,
    "16dqTiqyEhFhrfzfoX5upUkgkNoUGNnI9",
  );

  console.log("Uploaded to Google Drive:", uploadedFile.webViewLink);

  if (!uploadedFile?.webViewLink) {
    throw new Error("Failed to upload certificate to Google Drive");
  }

  const now = new Date();
  const note = isReprint ? "Dicetak ulang oleh mentee" : undefined;

  const certificate = await prisma.eLearningCertificate.upsert({
    where: { userId_subChapterId: { userId, subChapterId } },
    create: {
      subChapterId,
      userId,
      certificateNumber,
      displayNumber,
      certificateUrl: uploadedFile.webViewLink,
      certificatePath: `/uploads/elearning_certificate/${fileName}`,
      issuedAt: now,
      status: "generated",
      note,
    },
    update: {
      certificateUrl: uploadedFile.webViewLink,
      certificatePath: `/uploads/elearning_certificate/${fileName}`,
      issuedAt: now,
      status: "generated",
      note,
    },
    select: {
      certificateNumber: true,
      displayNumber: true,
      certificateUrl: true,
      issuedAt: true,
      status: true,
      certificatePath: true,
      subChapter: {
        select: {
          title: true,
          course: { select: { title: true } },
        },
      },
    },
  });

  return certificate;
};

// 🔥 DIUBAH TOTAL: dulu auto-generate berdasarkan progress 100% +
// checkAssessmentEligibility() (syarat skor quiz/assignment). Sekarang
// ini adalah endpoint "CETAK MANUAL" yang dipicu klik tombol mentee —
// syaratnya cukup progress 100%, TIDAK ADA LAGI pengecekan skor. Kalau
// sertifikat sudah pernah ada sebelumnya, ini jadi permintaan CETAK
// ULANG yang dibatasi cooldown 30 hari.
export const generateCertificateAuto = async ({
  subChapterId,
  userId,
}: {
  subChapterId: string;
  userId: string;
}) => {
  const progress = await prisma.eLearningSubChapterProgress.findUnique({
    where: {
      userId_subChapterId: { userId, subChapterId },
    },
    select: { progressPercent: true },
  });

  if (!progress || progress.progressPercent < 100) {
    throw new Error("Progress belum 100%");
  }

  const existing = await prisma.eLearningCertificate.findUnique({
    where: { userId_subChapterId: { userId, subChapterId } },
  });

  // 🔥 BARU: kalau sudah pernah cetak sebelumnya, ini dianggap
  // permintaan CETAK ULANG — dibatasi cooldown 30 hari dari `issuedAt`
  // terakhir. Sertifikat LAMA tetap valid & tetap bisa dilihat/diunduh
  // selama masa cooldown ini (tidak dihapus/diubah apa pun).
  if (existing?.issuedAt) {
    const nextAllowedAt = new Date(existing.issuedAt);
    nextAllowedAt.setDate(
      nextAllowedAt.getDate() + CERTIFICATE_PRINT_COOLDOWN_DAYS,
    );

    if (new Date() < nextAllowedAt) {
      throw new CertificateCooldownError(
        `Kamu baru bisa cetak ulang sertifikat pada ${nextAllowedAt.toLocaleDateString(
          "id-ID",
          { day: "2-digit", month: "long", year: "numeric" },
        )}.`,
        nextAllowedAt,
      );
    }
  }

  return generateOrRegenerateCertificate({
    subChapterId,
    userId,
    isReprint: !!existing,
  });
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
  /* === 1. AMBIL CERTIFICATE LAMA === */
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

  /* === 3. GENERATE CERTIFICATE NUMBER + DISPLAY NUMBER BARU ===
     🔥 UBAH: dulu cuma `newCertificateNumber`. Sekarang
     `generateCertificatePDF` juga butuh `displayNumber` (nomor cantik
     "01/ABCDEFG/TemuDataku" yang dicetak di PDF) dan `verifyUrl`
     (tujuan QR). Jadi keduanya juga harus di-generate ulang di sini,
     sama persis polanya kayak di `generateCertificate`. */
  const newCertificateNumber = generateCertificateNumber();
  const newDisplayNumber = await generateDisplayCertificateNumber();
  const newVerifyUrl = `${FRONTEND_URL}/certificates/${newCertificateNumber}`;

  /* === 4. PREPARE FILE BARU === (tidak berubah) */
  const uploadDir = path.join(__dirname, "../../uploads/elearning_certificate");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${newCertificateNumber}.pdf`;
  const pdfPath = path.join(uploadDir, fileName);

  /* === 5. GENERATE ULANG PDF (PAKAI NOMOR BARU) ===
     🔥 UBAH: nambahin `displayNumber` & `verifyUrl` supaya match sama
     signature `generateCertificatePDF` yang sekarang (kalau nggak
     dikirim, TypeScript bakal error — kedua field itu wajib/required,
     bukan optional, di signature-nya). */
  await generateCertificatePDF({
    certificateNumber: newCertificateNumber,
    displayNumber: newDisplayNumber,
    userName: certificate.user.fullName,
    subChapterTitle: certificate.subChapter.title,
    issueDate: new Date(),
    pdfPath,
    userId: certificate.userId,
    subChapterId: certificate.subChapterId,
    verifyUrl: newVerifyUrl,
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
     🔥 UBAH: simpan juga `displayNumber` yang baru — kalau nggak
     di-update, kolom `displayNumber` di DB bakal nggak sinkron sama
     yang tercetak di PDF hasil regenerate ini. */
  const updated = await prisma.eLearningCertificate.update({
    where: { id: certificateId },
    data: {
      certificateNumber: newCertificateNumber,
      displayNumber: newDisplayNumber,
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

export const verifyCertificateByNumber = async (certificateNumber: string) => {
  const cert = await prisma.eLearningCertificate.findUnique({
    where: { certificateNumber },
    select: {
      certificateNumber: true,
      displayNumber: true,
      certificateUrl: true,
      issuedAt: true,
      status: true,
      // 🔒 SENGAJA TIDAK di-select: id, verifiedBy, note, certificatePath
      // — nggak perlu & nggak aman ditampilkan ke publik.
      user: {
        select: { fullName: true }, // 🔒 email SENGAJA tidak di-select
      },
      subChapter: {
        select: {
          title: true,
          course: {
            select: { title: true },
          },
        },
      },
    },
  });

  // null di sini artinya "tidak ditemukan" — controller yang translate
  // ini jadi response 404.
  return cert;
};

export const getMyCertificateForSubChapter = async ({
  subChapterId,
  userId,
}: {
  subChapterId: string;
  userId: string;
}) => {
  const cert = await prisma.eLearningCertificate.findUnique({
    where: {
      userId_subChapterId: { userId, subChapterId },
    },
    select: {
      certificateNumber: true,
      displayNumber: true,
      certificateUrl: true,
      issuedAt: true,
      status: true,
      // 🔒 id, verifiedBy, note SENGAJA tidak di-select — mentee cuma
      // butuh info buat ditampilkan + link download, bukan data
      // administratif.
      subChapter: {
        select: {
          title: true,
          course: { select: { title: true } },
        },
      },
    },
  });

  return cert; // null kalau belum ada — itu valid, BUKAN error
};
