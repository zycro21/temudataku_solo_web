import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import {
  upsertTextProgress,
  recalculateSubChapterProgress,
} from "./elearning_progress.service.js";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ELearningSubmissionService {
  static async createSubmission(
    userId: string,
    assignmentId: string,
    data: any,
  ) {
    const assignment = await prisma.eLearningAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        text: {
          include: {
            subBab: { include: { subChapter: { include: { course: true } } } },
          },
        },
      },
    });
    if (!assignment) throw new Error("Assignment tidak ditemukan");

    const now = new Date();
    const activeSubscription = await prisma.eLearningSubscription.findFirst({
      where: {
        userId,
        status: { in: ["active", "confirmed", "completed"] },
        startAt: { lte: now },
        endAt: { gte: now },
      },
    });
    if (!activeSubscription) {
      throw new Error("Anda belum memiliki subscription aktif");
    }

    // 🔥 BARU: ganti cek duplikasi jadi berbasis attempt count (max 2) +
    // status submission TERAKHIR — bukan sekadar "sudah ada row atau belum".
    const MAX_ATTEMPTS = 2;
    const previousSubmissions = await prisma.eLearningSubmission.findMany({
      where: { assignmentId, userId },
      orderBy: { attemptNumber: "desc" },
    });
    const attemptCount = previousSubmissions.length;
    const latestPrevious = previousSubmissions[0];

    if (attemptCount >= MAX_ATTEMPTS) {
      throw new Error(
        "Kamu sudah mencapai batas maksimal 2 kali pengumpulan tugas ini",
      );
    }

    if (latestPrevious) {
      if (latestPrevious.status === "PENDING") {
        throw new Error(
          "Submission sebelumnya masih menunggu penilaian, tunggu hasil review dulu",
        );
      }
      if (latestPrevious.status === "APPROVED") {
        throw new Error("Tugas ini sudah lolos, tidak perlu dikumpulkan ulang");
      }
      if (!latestPrevious.isRevisionRequired) {
        throw new Error(
          "Submission sebelumnya sudah final dan tidak memerlukan revisi",
        );
      }
    }

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
    const randomHex = crypto.randomBytes(6).toString("hex");
    const submissionId = `elearnsub-${formattedDate}-${randomHex}`;

    const submission = await prisma.eLearningSubmission.create({
      data: {
        id: submissionId,
        assignmentId,
        userId,
        attemptNumber: attemptCount + 1, // 🔥 BARU
        notes: data.notes,
        files: data.files || [],
        status: "PENDING",
        submittedAt: new Date(),
      },
    });

    // 🔥 BARU: ikut balikin attemptsRemaining biar FE nggak perlu fetch ulang.
    return {
      ...submission,
      attemptsUsed: attemptCount + 1,
      attemptsRemaining: Math.max(MAX_ATTEMPTS - (attemptCount + 1), 0),
    };
  }

  static async getMySubmission(userId: string, assignmentId: string) {
    // 1. cek apakah assignment EXIST
    const assignment = await prisma.eLearningAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        text: {
          include: {
            subBab: {
              include: {
                subChapter: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!assignment) throw new Error("Assignment tidak ditemukan");

    const courseId = assignment.text.subBab.subChapter.course.id;

    // 🔥 DIGANTI: cek apakah user memiliki subscription aktif
    const now = new Date();

    const activeSubscription = await prisma.eLearningSubscription.findFirst({
      where: {
        userId,
        status: {
          in: ["active", "confirmed", "completed"],
        },
        startAt: {
          lte: now,
        },
        endAt: {
          gte: now,
        },
      },
    });

    if (!activeSubscription) {
      throw new Error("Anda belum memiliki subscription aktif");
    }

    // 3. ambil submission user
    const MAX_ATTEMPTS = 2;
    const submissions = await prisma.eLearningSubmission.findMany({
      where: { assignmentId, userId },
      orderBy: { attemptNumber: "desc" },
      include: { assignment: true },
    });

    if (submissions.length === 0) return null; // controller tetap 404

    const latest = submissions[0];
    return {
      ...latest,
      attemptsUsed: submissions.length,
      attemptsRemaining: Math.max(MAX_ATTEMPTS - submissions.length, 0),
    };
  }

  static async getAllSubmissions({
    user,
    assignmentId,
    query,
  }: {
    user: { userId: string; roles: string[]; mentorProfileId?: string };
    assignmentId: string;
    query: any;
  }) {
    // 1. cek apakah assignment exist + ambil course id
    const assignment = await prisma.eLearningAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        text: {
          include: {
            subBab: {
              include: {
                subChapter: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new Error("Assignment tidak ditemukan");
    }

    const courseId = assignment.text.subBab.subChapter.course.id;

    // 2. 🔥 Admin dan curdev bisa akses semua
    const isAdmin = user.roles.includes("admin");
    const isCurdev = user.roles.includes("curdev");
    const isMentor = user.roles.includes("mentor");

    const hasFullAccess = isAdmin || isCurdev;

    // 3. Jika mentor (dan bukan admin/curdev) → cek apakah dia pemilik course
    if (isMentor && !hasFullAccess) {
      const isMentorCourse = await prisma.eLearningCourse.findFirst({
        where: {
          id: courseId,
          mentorId: user.mentorProfileId,
        },
      });

      if (!isMentorCourse) {
        throw new Error("Anda tidak memiliki akses ke assignment ini");
      }
    }

    // 4. Pagination
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const skip = (page - 1) * limit;

    // 5. Sorting
    const sortBy = query.sortBy || "submittedAt";
    const sortOrder = query.sortOrder || "desc";

    // 6. Filter + Search
    const whereFilter: any = {
      assignmentId,
    };

    if (query.status) {
      whereFilter.status = query.status;
    }

    if (query.search) {
      whereFilter.OR = [
        { notes: { contains: query.search, mode: "insensitive" } },
        {
          user: {
            fullName: { contains: query.search, mode: "insensitive" },
          },
        },
      ];
    }

    // 7. Query prisma
    const [total, submissions] = await Promise.all([
      prisma.eLearningSubmission.count({
        where: whereFilter,
      }),
      prisma.eLearningSubmission.findMany({
        where: whereFilter,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      data: submissions,
    };
  }

  static async reviewSubmission(
    submissionId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
    data: any,
  ) {
    const { userId, roles, mentorProfileId } = user;

    // ====== 1. CEK SUBMISSION EXIST ======
    const submission = await prisma.eLearningSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            text: {
              include: {
                subBab: {
                  include: {
                    subChapter: {
                      include: {
                        course: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!submission) throw new Error("Submission tidak ditemukan");

    const course = submission.assignment.text.subBab.subChapter.course;

    // ====== 2. 🔥 ADMIN & CURDEV BOLEH AKSES SEMUA ======
    const isAdmin = roles.includes("admin");
    const isCurdev = roles.includes("curdev");
    const isMentor = roles.includes("mentor");

    const hasFullAccess = isAdmin || isCurdev;

    if (!hasFullAccess && !isMentor) {
      throw new Error("Anda tidak memiliki akses untuk melakukan review");
    }

    // ====== 3. MENTOR HANYA BOLEH REVIEW COURSE YANG DIA AMPU ======
    if (isMentor && !hasFullAccess) {
      if (!mentorProfileId) {
        throw new Error("Mentor profile tidak ditemukan");
      }

      if (course.mentorId !== mentorProfileId) {
        throw new Error(
          "Anda tidak memiliki akses untuk mereview submission pada course ini",
        );
      }
    }

    // ====== 4. VALIDASI REVISION DEADLINE ======
    let revisionDeadline: Date | undefined = undefined;

    if (data.isRevisionRequired === true) {
      if (!data.revisionDeadline)
        throw new Error("revisionDeadline wajib diisi jika revisi diperlukan");

      const deadline = new Date(data.revisionDeadline);
      const now = new Date();

      if (deadline <= now) {
        throw new Error("revisionDeadline harus setelah hari ini");
      }

      revisionDeadline = deadline;
    }

    // ====== 5. TENTUKAN STATUS BARU ======
    const newStatus =
      data.isRevisionRequired === true ? "REVISION_REQUIRED" : "REVIEWED";

    // ====== 6. UPDATE SUBMISSION ======
    const updated = await prisma.eLearningSubmission.update({
      where: { id: submissionId },
      data: {
        feedback: data.feedback,
        score: data.score,
        gradeBreakdown: data.gradeBreakdown || undefined,
        isRevisionRequired: data.isRevisionRequired || false,
        revisionDeadline,
        status: newStatus,
        reviewedById: userId,
        reviewedAt: new Date(),
      },
    });

    // 🔥 BARU: status FINAL "REVIEWED" (lolos atau tidak lolos — bukan
    // REVISION_REQUIRED, karena mentee masih ada kerjaan lanjutan) →
    // langsung tandai Text assignment ini selesai & hitung ulang progress
    // SubChapter DI BACKEND. Ini yang bikin progress bar mentee ke-update
    // otomatis begitu admin/curdev/mentor submit penilaian, tanpa perlu
    // mentee balik buka halaman assignment-nya dulu (beda dari deteksi di
    // AssignmentRenderer.tsx sisi mentee, yang tetap saya biarkan jalan
    // sebagai fallback/safety net kalau baris ini somehow belum ke-hit,
    // mis. submission lama sebelum fitur ini ada).
    if (newStatus === "REVIEWED") {
      const textId = submission.assignment.textId;
      const subChapterId = submission.assignment.text.subBab.subChapterId;

      await upsertTextProgress({ userId: submission.userId, textId });
      await recalculateSubChapterProgress({
        userId: submission.userId,
        subChapterId,
      });
    }

    return updated;
  }

  static async submitRevision(
    userId: string,
    submissionId: string,
    data: { notes?: string; files?: string[] },
  ) {
    const submission = await prisma.eLearningSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) throw new Error("Submission tidak ditemukan");
    if (submission.userId !== userId)
      throw new Error("Tidak dapat merevisi submission orang lain");

    // hanya bisa revisi jika status masih REVISION_REQUIRED
    if (submission.status !== "REVISION_REQUIRED") {
      throw new Error("Submission ini tidak membutuhkan revisi");
    }

    // ==== HAPUS FILE LAMA JIKA ADA FILE BARU ====
    if (data.files && data.files.length > 0) {
      for (const oldFile of submission.files) {
        const filePath = path.join(
          __dirname,
          "../../uploads/elearning/submissions",
          oldFile.replace("/uploads/elearning/submissions/", ""),
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // ==== UPDATE SUBMISSION ====
    const updated = await prisma.eLearningSubmission.update({
      where: { id: submissionId },
      data: {
        notes: data.notes ?? submission.notes,
        files:
          data.files && data.files.length > 0 ? data.files : submission.files, // kalau tidak upload file → pakai file lama
        submittedAt: new Date(),
        status: "PENDING",
        isRevisionRequired: false,
      },
    });

    return updated;
  }

  static async getSubmissionDetail(submissionId: string, user: any) {
    const submission = await prisma.eLearningSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            text: {
              include: {
                subBab: {
                  include: {
                    subChapter: {
                      include: {
                        course: true,
                      },
                    },
                  },
                },
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
        reviewer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!submission) {
      throw new Error("Submission tidak ditemukan");
    }

    // ===== ADMIN & CURDEV (hak akses sama) =====
    if (user.roles.includes("admin") || user.roles.includes("curdev")) {
      return submission;
    }

    const course = submission.assignment.text.subBab.subChapter.course;

    // ===== MENTOR =====
    if (user.roles.includes("mentor")) {
      if (!user.mentorProfileId) {
        throw new Error("Mentor profile tidak ditemukan");
      }

      if (course.mentorId !== user.mentorProfileId) {
        throw new Error("Mentor tidak memiliki akses ke submission ini");
      }

      return submission;
    }

    // ===== MENTEE =====
    if (user.roles.includes("mentee")) {
      if (submission.userId !== user.userId) {
        throw new Error("Mentee tidak dapat mengakses submission orang lain");
      }

      return submission;
    }

    throw new Error("Role tidak memiliki akses");
  }

  static async getSubmissionHistory(submissionId: string, user: any) {
    const submission = await prisma.eLearningSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            text: {
              include: {
                subBab: {
                  include: {
                    subChapter: {
                      include: {
                        course: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        user: true,
        reviewer: true,
      },
    });

    if (!submission) {
      throw new Error("Submission tidak ditemukan");
    }

    const course = submission.assignment.text.subBab.subChapter.course;

    const courseId = course.id;
    const courseMentorId = course.mentorId;

    // ===== ADMIN =====
    if (user.roles.includes("admin")) {
      // akses penuh
    }

    // ===== MENTOR =====
    else if (user.roles.includes("mentor")) {
      if (!user.mentorProfileId) {
        throw new Error("Mentor profile tidak ditemukan");
      }

      if (user.mentorProfileId !== courseMentorId) {
        throw new Error("Mentor tidak memiliki akses ke submission ini");
      }
    }

    // ===== MENTEE =====
    else if (user.roles.includes("mentee")) {
      const now = new Date();

      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: {
            in: ["active", "confirmed", "completed"],
          },
          startAt: {
            lte: now,
          },
          endAt: {
            gte: now,
          },
        },
      });

      if (submission.userId !== user.userId && !activeSubscription) {
        throw new Error("Mentee tidak memiliki akses ke submission ini");
      }
    }

    // ===== ROLE TIDAK VALID =====
    else {
      throw new Error("Role tidak memiliki akses");
    }

    const history: any[] = [];

    // Submit pertama
    if (submission.submittedAt) {
      history.push({
        event: "SUBMITTED",
        status: submission.status,
        timestamp: submission.submittedAt,
        notes: submission.notes ?? null,
        files: submission.files,
      });
    }

    // Revisi diminta
    if (submission.isRevisionRequired && submission.reviewedAt) {
      history.push({
        event: "REVISION_REQUESTED",
        status: "REVISION_REQUIRED",
        timestamp: submission.reviewedAt,
        reviewerId: submission.reviewedById,
        feedback: submission.feedback ?? null,
        revisionDeadline: submission.revisionDeadline ?? null,
      });
    }

    // Revisi dikirim
    if (
      !submission.isRevisionRequired &&
      submission.status === "PENDING" &&
      submission.reviewedAt === null
    ) {
      history.push({
        event: "REVISION_SUBMITTED",
        status: "PENDING",
        timestamp: submission.submittedAt,
        notes: submission.notes ?? null,
        files: submission.files,
      });
    }

    // Direview
    if (submission.reviewedAt) {
      history.push({
        event: "REVIEWED",
        status: submission.status,
        timestamp: submission.reviewedAt,
        reviewerId: submission.reviewedById,
        feedback: submission.feedback ?? null,
        score: submission.score ?? null,
        gradeBreakdown: submission.gradeBreakdown ?? null,
      });
    }

    // Approved / Rejected
    if (["APPROVED", "REJECTED"].includes(submission.status)) {
      history.push({
        event: submission.status,
        status: submission.status,
        timestamp: submission.reviewedAt,
        reviewerId: submission.reviewedById,
      });
    }

    history.sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;

      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;

      return ta - tb;
    });

    return {
      submissionId: submission.id,
      assignmentId: submission.assignmentId,
      courseId,
      userId: submission.userId,
      currentStatus: submission.status,
      history,
    };
  }

  static async exportSubmissionsToFile(
    exportFormat: "csv" | "excel",
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const submissions = await prisma.eLearningSubmission.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },

        assignment: {
          include: {
            text: {
              include: {
                subBab: {
                  include: {
                    subChapter: {
                      include: {
                        course: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },

        reviewer: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    // 🔹 Format rows untuk export
    const rows = submissions.map((sub) => ({
      SubmissionID: sub.id,

      MenteeName: sub.user?.fullName || "-",
      MenteeEmail: sub.user?.email || "-",

      Course: sub.assignment.text.subBab.subChapter.course.title,

      SubChapter: sub.assignment.text.subBab.subChapter.title,

      SubBab: sub.assignment.text.subBab.title,

      AssignmentTitle: sub.assignment.title,

      Status: sub.status,
      Score: sub.score ?? "-",
      Feedback: sub.feedback ?? "-",

      SubmittedAt: sub.submittedAt
        ? format(sub.submittedAt, "yyyy-MM-dd HH:mm:ss")
        : "-",

      ReviewedAt: sub.reviewedAt
        ? format(sub.reviewedAt, "yyyy-MM-dd HH:mm:ss")
        : "-",

      ReviewerName: sub.reviewer?.fullName ?? "-",
    }));

    // helper random filename
    function randomString(length: number) {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join("");
    }

    // 🔹 CSV Export
    if (exportFormat === "csv") {
      const csv = await parseAsync(rows);
      return {
        buffer: Buffer.from(csv, "utf-8"),
        filename: `submissions_${Date.now()}_${randomString(6)}.csv`,
        mimetype: "text/csv",
      };
    }

    // 🔹 Excel Export
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Submissions");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 25,
    }));

    rows.forEach((row) => worksheet.addRow(row));

    const arrayBuffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(arrayBuffer),
      filename: `submissions_${Date.now()}_${randomString(6)}.xlsx`,
      mimetype:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  static async deleteSubmissionById(submissionId: string) {
    const submission = await prisma.eLearningSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new Error("Submission tidak ditemukan");
    }

    // HAPUS SEMUA FILE DI FOLDER
    if (submission.files && submission.files.length > 0) {
      for (const file of submission.files) {
        // file yang tersimpan = "/uploads/elearning/submissions/<filename>"
        const filename = file.replace("/uploads/elearning/submissions/", "");

        const filePath = path.join(
          __dirname,
          "../../uploads/elearning/submissions",
          filename,
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // HAPUS RECORD DATABASE
    await prisma.eLearningSubmission.delete({
      where: { id: submissionId },
    });

    return { id: submissionId };
  }
}
