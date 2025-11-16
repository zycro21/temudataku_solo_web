import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ELearningSubmissionService {
  static async createSubmission(
    userId: string,
    assignmentId: string,
    data: any
  ) {
    // cek apakah assignment valid
    const assignment = await prisma.eLearningAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        subBab: {
          include: {
            subChapter: { include: { course: true } },
          },
        },
      },
    });
    if (!assignment) throw new Error("Assignment tidak ditemukan");

    const courseId = assignment.subBab.subChapter.course.id;

    // pastikan user sudah membeli course
    const purchase = await prisma.eLearningPurchase.findFirst({
      where: {
        userId,
        courseId,
      },
    });
    if (!purchase) {
      throw new Error("Anda belum membeli course ini");
    }

    // cek duplikasi submission
    const existing = await prisma.eLearningSubmission.findUnique({
      where: {
        assignmentId_userId: { assignmentId, userId },
      },
    });
    if (existing) throw new Error("Anda sudah mengumpulkan tugas ini");

    // generate custom id
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
    const randomHex = crypto.randomBytes(6).toString("hex");
    const submissionId = `elearnsub-${formattedDate}-${randomHex}`;

    // simpan ke DB
    const submission = await prisma.eLearningSubmission.create({
      data: {
        id: submissionId,
        assignmentId,
        userId,
        notes: data.notes,
        files: data.files || [],
        status: "PENDING",
        submittedAt: new Date(),
      },
    });

    return submission;
  }

  static async getMySubmission(userId: string, assignmentId: string) {
    // 1. cek apakah assignment EXIST
    const assignment = await prisma.eLearningAssignment.findUnique({
      where: { id: assignmentId },
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
    });

    if (!assignment) throw new Error("Assignment tidak ditemukan");

    const courseId = assignment.subBab.subChapter.course.id;

    // 2. cek apakah user sudah membeli course
    const purchase = await prisma.eLearningPurchase.findFirst({
      where: { userId, courseId },
    });

    if (!purchase) {
      throw new Error("Anda belum membeli course ini");
    }

    // 3. ambil submission user
    const submission = await prisma.eLearningSubmission.findUnique({
      where: { assignmentId_userId: { assignmentId, userId } },
      include: {
        assignment: true,
      },
    });

    if (!submission) {
      return null; // controller akan handle jadi 404
    }

    return submission;
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
    });

    if (!assignment) {
      throw new Error("Assignment tidak ditemukan");
    }

    const courseId = assignment.subBab.subChapter.course.id;

    // 2. Jika mentor → cek apakah dia pemilik course
    const isAdmin = user.roles.includes("admin");
    const isMentor = user.roles.includes("mentor");

    if (isMentor && !isAdmin) {
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

    // 3. Pagination
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");
    const skip = (page - 1) * limit;

    // 4. Sorting
    const sortBy = query.sortBy || "submittedAt";
    const sortOrder = query.sortOrder || "desc";

    // 5. Filter + Search
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

    // 6. Query prisma
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
    data: any
  ) {
    const { userId, roles, mentorProfileId } = user;

    // ====== 1. CEK SUBMISSION EXIST ======
    const submission = await prisma.eLearningSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
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

    if (!submission) throw new Error("Submission tidak ditemukan");

    const course = submission.assignment.subBab.subChapter.course;

    // ====== 2. ADMIN BOLEH AKSES SEMUA ======
    const isAdmin = roles.includes("admin");
    const isMentor = roles.includes("mentor");

    if (!isAdmin && !isMentor) {
      throw new Error("Anda tidak memiliki akses untuk melakukan review");
    }

    // ====== 3. MENTOR HANYA BOLEH REVIEW COURSE YANG DIA AMPU ======
    if (isMentor) {
      if (!mentorProfileId) {
        throw new Error("Mentor profile tidak ditemukan");
      }

      if (course.mentorId !== mentorProfileId) {
        throw new Error(
          "Anda tidak memiliki akses untuk mereview submission pada course ini"
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

    return updated;
  }

  static async submitRevision(
    userId: string,
    submissionId: string,
    data: { notes?: string; files?: string[] }
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
          oldFile.replace("/uploads/elearning/submissions/", "")
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
        user: true, // pemilik submission
        reviewer: true, // mentor yang review
      },
    });

    if (!submission) throw new Error("Submission tidak ditemukan");

    // Admin -> boleh lihat semua
    if (user.roles.includes("admin")) {
      return submission;
    }

    //  Mentor -> boleh lihat submission pada course yang dia ampu
    if (user.roles.includes("mentor")) {
      const courseMentorId =
        submission.assignment.subBab.subChapter.course.mentorId;

      if (courseMentorId !== user.mentorProfileId) {
        throw new Error("Mentor tidak memiliki akses ke submission ini");
      }

      return submission;
    }

    // Mentee -> hanya boleh lihat submission miliknya sendiri
    if (user.roles.includes("mentee")) {
      if (submission.userId !== user.userId) {
        throw new Error("Mentee tidak dapat mengakses submission orang lain");
      }

      return submission;
    }

    // jika role tidak dikenal
    throw new Error("Role tidak memiliki akses");
  }

  static async getSubmissionHistory(submissionId: string, user: any) {
    const submission = await prisma.eLearningSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
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
        user: true, // pemilik submission
        reviewer: true, // mentor reviewer
      },
    });

    if (!submission) throw new Error("Submission tidak ditemukan");

    const courseId = submission.assignment.subBab.subChapter.course.id;
    const courseMentorId =
      submission.assignment.subBab.subChapter.course.mentorId;

    // Admin → akses semua submission
    if (user.roles.includes("admin")) {
      // continue
    }

    // Mentor → hanya course yang dia ampu
    else if (user.roles.includes("mentor")) {
      if (user.mentorProfileId !== courseMentorId) {
        throw new Error("Mentor tidak memiliki akses ke submission ini");
      }
    }

    // Mentee → hanya submission miliknya ATAU course yang dia beli
    else if (user.roles.includes("mentee")) {
      const purchase = await prisma.eLearningPurchase.findFirst({
        where: {
          userId: user.userId,
          courseId,
        },
      });

      if (submission.userId !== user.userId && !purchase) {
        throw new Error("Mentee tidak memiliki akses ke submission ini");
      }
    } else {
      throw new Error("Role tidak memiliki akses");
    }
    const history = [];

    // Pertama kali submit
    if (submission.submittedAt) {
      history.push({
        event: "SUBMITTED",
        status: submission.status,
        timestamp: submission.submittedAt,
        notes: submission.notes ?? null,
        files: submission.files,
      });
    }

    // Diminta revisi
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

    // Dikirim revisi
    if (
      !submission.isRevisionRequired &&
      submission.status === "PENDING" &&
      submission.reviewedAt === null
    ) {
      history.push({
        event: "REVISION_SUBMITTED",
        status: "PENDING",
        timestamp: submission.submittedAt, // revisi selalu reset submittedAt
        notes: submission.notes ?? null,
        files: submission.files,
      });
    }

    // Direview oleh mentor
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

    // Disetujui atau ditolak (optional)
    if (["APPROVED", "REJECTED"].includes(submission.status)) {
      history.push({
        event: submission.status,
        status: submission.status,
        timestamp: submission.reviewedAt,
        reviewerId: submission.reviewedById,
      });
    }

    // Sort berdasarkan waktu
    history.sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return ta - tb;
    });

    return {
      submissionId: submission.id,
      userId: submission.userId,
      currentStatus: submission.status,
      history,
    };
  }

  static async exportSubmissionsToFile(
    exportFormat: "csv" | "excel"
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const submissions = await prisma.eLearningSubmission.findMany({
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        assignment: {
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
        reviewer: {
          select: { id: true, fullName: true },
        },
      },
    });

    // 🔹 Format rows untuk export
    const rows = submissions.map((sub) => ({
      SubmissionID: sub.id,
      MenteeName: sub.user?.fullName || "-",
      MenteeEmail: sub.user?.email || "-",
      Course: sub.assignment.subBab.subChapter.course.title,
      SubChapter: sub.assignment.subBab.subChapter.title,
      SubBab: sub.assignment.subBab.title,
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
        chars.charAt(Math.floor(Math.random() * chars.length))
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
          filename
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
