import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export class ELearningAssignmentService {
  static async createAssignment(
    subBabId: string,
    body: { title: string; description?: string; dueDays: number },
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    return await prisma.$transaction(async (tx) => {
      // ====== Cek apakah SubBab ada ======
      const subBab = await tx.eLearningSubBab.findUnique({
        where: { id: subBabId },
        include: {
          subChapter: {
            include: { course: true },
          },
        },
      });

      if (!subBab) throw new Error("SubBab tidak ditemukan");

      // ====== Cek apakah sudah ada assignment ======
      const existing = await tx.eLearningAssignment.findUnique({
        where: { subBabId },
      });
      if (existing) throw new Error("SubBab ini sudah memiliki assignment");

      // ====== Validasi Mentor hanya bisa di course miliknya ======
      if (user.roles.includes("mentor")) {
        const mentorCourseId = subBab.subChapter.course.mentorId;
        if (!mentorCourseId || mentorCourseId !== user.userId) {
          throw new Error(
            "Mentor tidak memiliki izin membuat assignment di course ini"
          );
        }
      }

      // ====== Generate ID custom ======
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
      const randomHex = crypto.randomBytes(6).toString("hex");
      const assignmentId = `assignment-${formattedDate}-${randomHex}`;

      // ====== Simpan ke database ======
      const assignment = await tx.eLearningAssignment.create({
        data: {
          id: assignmentId,
          subBabId,
          title: body.title,
          description: body.description ?? null,
          dueDays: body.dueDays,
        },
        include: {
          subBab: {
            select: {
              id: true,
              title: true,
              subChapter: {
                select: {
                  title: true,
                  course: { select: { id: true, title: true } },
                },
              },
            },
          },
        },
      });

      return assignment;
    });
  }

  static async getAssignment(
    subBabId: string,
    user: { userId: string; roles: string[] },
    opts: {
      includeSubmissions?: boolean;
      page?: number;
      limit?: number;
      sortBy?: "createdAt" | "updatedAt" | "score" | "submittedAt";
      order?: "asc" | "desc";
      search?: string;
      minScore?: number;
      maxScore?: number;
    }
  ) {
    // Ambil assignment + relasi course untuk cek izin
    const assignment = await prisma.eLearningAssignment.findUnique({
      where: { subBabId },
      include: {
        subBab: {
          select: {
            id: true,
            title: true,
            subChapter: {
              select: {
                id: true,
                title: true,
                course: { select: { id: true, title: true, mentorId: true } },
              },
            },
          },
        },
      },
    });

    if (!assignment) throw new Error("Assignment tidak ditemukan");

    const isAdmin = user.roles.includes("admin");
    const isMentor = user.roles.includes("mentor");
    const isMentee = user.roles.includes("mentee");

    const course = assignment.subBab.subChapter.course;
    const courseId = course?.id;

    // Akses kontrol
    if (isAdmin) {
      // ok
    } else if (isMentor) {
      if (!course || course.mentorId !== user.userId) {
        throw new Error("Mentor tidak memiliki izin mengakses assignment ini");
      }
    } else if (isMentee) {
      // cek apakah mentee membeli course
      const purchased = await prisma.eLearningPurchase.findFirst({
        where: { userId: user.userId, courseId },
      });
      if (!purchased) throw new Error("Mentee belum membeli course ini");
    } else {
      throw new Error("Akses ditolak");
    }

    // Jika tidak minta submissions, cukup kembalikan assignment
    const includeSubs = opts.includeSubmissions ?? false;
    if (!includeSubs) {
      return {
        id: assignment.id,
        subBabId: assignment.subBabId,
        title: assignment.title,
        description: assignment.description,
        dueDays: assignment.dueDays,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
        subBab: assignment.subBab,
      };
    }

    // Jika includeSubmissions = true -> ambil submissions dengan pagination/sort/filter/search
    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const limit = opts.limit && opts.limit > 0 ? opts.limit : 10;
    const skip = (page - 1) * limit;

    // Build where clause for submissions
    const subWhere: any = { assignmentId: assignment.id }; // assuming submission has assignmentId
    // Score filter
    if (
      typeof opts.minScore === "number" ||
      typeof opts.maxScore === "number"
    ) {
      subWhere.score = {};
      if (typeof opts.minScore === "number") subWhere.score.gte = opts.minScore;
      if (typeof opts.maxScore === "number") subWhere.score.lte = opts.maxScore;
    }
    // Search (try search on user fullName or fileName or answer text)
    if (opts.search) {
      subWhere.OR = [
        { fileName: { contains: opts.search, mode: "insensitive" } },
        { notes: { contains: opts.search, mode: "insensitive" } },
        { user: { fullName: { contains: opts.search, mode: "insensitive" } } },
      ];
    }

    // Sort mapping
    const sortField = opts.sortBy ?? "submittedAt";
    const order: "asc" | "desc" = opts.order ?? "desc";

    // Count
    const total = await prisma.eLearningSubmission.count({ where: subWhere });

    const submissions = await prisma.eLearningSubmission.findMany({
      where: subWhere,
      orderBy: { [sortField]: order },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        // include other fields as needed
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      id: assignment.id,
      subBabId: assignment.subBabId,
      title: assignment.title,
      description: assignment.description,
      dueDays: assignment.dueDays,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      subBab: assignment.subBab,
      submissions: {
        data: submissions,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    };
  }

  static async updateAssignment(
    assignmentId: string,
    data: { title?: string; description?: string; dueDays?: number },
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    return await prisma.$transaction(async (tx) => {
      // Cek apakah assignment ada
      const assignment = await tx.eLearningAssignment.findUnique({
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

      // Jika user adalah mentor, pastikan assignment dari course yang dia ampu
      if (user.roles.includes("mentor")) {
        const courseMentorId = assignment.subBab.subChapter.course.mentorId;
        if (courseMentorId !== user.userId) {
          throw new Error(
            "Mentor tidak memiliki izin memperbarui assignment ini"
          );
        }
      }

      // Update assignment (partial update)
      const updated = await tx.eLearningAssignment.update({
        where: { id: assignmentId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          subBab: {
            select: {
              id: true,
              title: true,
              subChapter: {
                select: {
                  title: true,
                  course: { select: { id: true, title: true } },
                },
              },
            },
          },
        },
      });

      return updated;
    });
  }

  static async deleteAssignment(assignmentId: string) {
    return await prisma.$transaction(async (tx) => {
      // Cek apakah assignment ada
      const existing = await tx.eLearningAssignment.findUnique({
        where: { id: assignmentId },
        include: {
          subBab: {
            select: {
              id: true,
              title: true,
              subChapter: {
                select: {
                  title: true,
                  course: { select: { id: true, title: true } },
                },
              },
            },
          },
        },
      });

      if (!existing) throw new Error("Assignment tidak ditemukan");

      // Hapus assignment (otomatis hapus submissions lewat onDelete: Cascade jika diatur)
      await tx.eLearningAssignment.delete({
        where: { id: assignmentId },
      });

      return {
        id: existing.id,
        title: existing.title,
        subBab: existing.subBab,
      };
    });
  }

  static async getAllAssignments(
    user: { userId: string; roles: string[]; mentorProfileId?: string },
    query: {
      search?: string;
      page?: number;
      limit?: number;
      sortBy?: "createdAt" | "updatedAt" | "score" | "submittedAt";
      order?: "asc" | "desc";
      minScore?: number;
      maxScore?: number;
    }
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // Search (title / description)
    if (query.search) {
      whereClause.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // Filtering by mentor (if not admin)
    if (user.roles.includes("mentor")) {
      whereClause.subBab = {
        subChapter: {
          course: {
            mentorProfile: {
              userId: user.userId,
            },
          },
        },
      };
    }

    // 🔹 Filtering by score range (optional, if needed)
    if (query.minScore || query.maxScore) {
      whereClause.submissions = {
        some: {
          score: {
            gte: query.minScore ?? undefined,
            lte: query.maxScore ?? undefined,
          },
        },
      };
    }

    // Sorting
    const orderBy: any = {};
    orderBy[query.sortBy ?? "createdAt"] = query.order ?? "desc";

    // Fetch data with pagination
    const [data, total] = await Promise.all([
      prisma.eLearningAssignment.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy,
        include: {
          subBab: {
            select: {
              id: true,
              title: true,
              subChapter: {
                select: {
                  id: true,
                  title: true,
                  course: {
                    select: {
                      id: true,
                      title: true,
                      mentorProfile: {
                        select: { id: true, userId: true },
                      },
                    },
                  },
                },
              },
            },
          },
          submissions: {
            select: {
              id: true,
              userId: true,
              score: true,
              submittedAt: true,
            },
          },
        },
      }),
      prisma.eLearningAssignment.count({ where: whereClause }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getAssignmentDetail(
    assignmentId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    // 🔹 Ambil data assignment lengkap
    const assignment = await prisma.eLearningAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        subBab: {
          include: {
            subChapter: {
              include: {
                course: {
                  include: {
                    mentorProfile: true,
                    purchases: true,
                  },
                },
              },
            },
          },
        },
        submissions: {
          select: {
            id: true,
            userId: true,
            score: true,
            status: true,
            submittedAt: true,
            reviewedAt: true,
          },
        },
      },
    });

    if (!assignment) throw new Error("Assignment tidak ditemukan");

    const course = assignment.subBab.subChapter.course;
    const courseId = course.id;

    // 🔹 Validasi Akses
    if (user.roles.includes("admin")) {
      // Admin boleh semua
    } else if (user.roles.includes("mentor")) {
      if (course.mentorProfile.userId !== user.userId) {
        throw new Error("Mentor tidak memiliki izin mengakses assignment ini");
      }
    } else if (user.roles.includes("mentee")) {
      // Cek apakah mentee membeli course ini
      const purchased = await prisma.eLearningPurchase.findFirst({
        where: {
          userId: user.userId,
          courseId: courseId,
        },
      });

      if (!purchased) {
        throw new Error(
          "Mentee tidak memiliki akses karena belum membeli course ini"
        );
      }
    } else {
      throw new Error("Role tidak dikenali");
    }

    // 🔹 Format response
    return {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDays: assignment.dueDays,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      subBab: {
        id: assignment.subBab.id,
        title: assignment.subBab.title,
        subChapter: {
          id: assignment.subBab.subChapter.id,
          title: assignment.subBab.subChapter.title,
          course: {
            id: course.id,
            title: course.title,
            mentor: {
              id: course.mentorProfile.id,
              userId: course.mentorProfile.userId,
            },
          },
        },
      },
      submissions: assignment.submissions ?? [],
    };
  }

  static async getAssignmentsByCourse(
    courseId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
    options: {
      page?: number;
      limit?: number;
      sortBy?: "createdAt" | "updatedAt" | "title";
      order?: "asc" | "desc";
      search?: string;
    }
  ) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      search,
    } = options;

    return await prisma.$transaction(async (tx) => {
      // ====== Cek apakah course ada ======
      const course = await tx.eLearningCourse.findUnique({
        where: { id: courseId },
        include: { mentorProfile: true },
      });

      if (!course) throw new Error("Course tidak ditemukan");

      // ====== Validasi role mentor ======
      if (user.roles.includes("mentor")) {
        if (course.mentorProfile.userId !== user.userId) {
          throw new Error("Mentor tidak memiliki izin melihat assignment ini");
        }
      }

      // ====== Query dasar ======
      const whereCondition: any = {
        subBab: {
          subChapter: {
            courseId: courseId,
          },
        },
      };

      // ====== Search (judul/deskripsi) ======
      if (search) {
        whereCondition.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      // ====== Hitung total ======
      const total = await tx.eLearningAssignment.count({
        where: whereCondition,
      });

      // ====== Ambil data ======
      const assignments = await tx.eLearningAssignment.findMany({
        where: whereCondition,
        include: {
          subBab: {
            select: {
              id: true,
              title: true,
              subChapter: {
                select: {
                  id: true,
                  title: true,
                  course: { select: { id: true, title: true } },
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        data: assignments,
      };
    });
  }

  static async exportAssignmentsToFile(
    exportFormat: "csv" | "excel"
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const assignments = await prisma.eLearningAssignment.findMany({
      include: {
        subBab: {
          include: {
            subChapter: {
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        submissions: true,
      },
    });

    const rows = assignments.map((assignment) => ({
      ID: assignment.id,
      Title: assignment.title,
      Description: assignment.description || "-",
      DueDays: assignment.dueDays ?? "-",
      SubBabID: assignment.subBabId,
      SubBabTitle: assignment.subBab.title,
      SubChapterTitle: assignment.subBab.subChapter.title,
      CourseID: assignment.subBab.subChapter.course.id,
      CourseTitle: assignment.subBab.subChapter.course.title,
      TotalSubmissions: assignment.submissions.length,
      CreatedAt: formatDate(
        assignment.createdAt ?? new Date(),
        "yyyy-MM-dd HH:mm:ss"
      ),
      UpdatedAt: formatDate(
        assignment.updatedAt ?? new Date(),
        "yyyy-MM-dd HH:mm:ss"
      ),
    }));

    // fungsi kecil buat generate nama file random
    function randomString(length: number) {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join("");
    }

    if (exportFormat === "csv") {
      const csv = await parseAsync(rows);
      return {
        buffer: Buffer.from(csv, "utf-8"),
        filename: `assignments_${Date.now()}_${randomString(6)}.csv`,
        mimetype: "text/csv",
      };
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Assignments");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 30,
    }));

    rows.forEach((row) => worksheet.addRow(row));

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      filename: `assignments_${Date.now()}_${randomString(6)}.xlsx`,
      mimetype:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }
}
