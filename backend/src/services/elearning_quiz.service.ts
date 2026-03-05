import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";

import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export class ELearningQuizService {
  static async createQuiz(
    subBabId: string,
    data: { title: string; description?: string; timeLimitMinutes?: number },
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    return await prisma.$transaction(async (tx) => {
      // 🔹 Cek apakah sub-bab valid
      const subBab = await tx.eLearningSubBab.findUnique({
        where: { id: subBabId },
        include: { subChapter: { include: { course: true } } },
      });

      if (!subBab) throw new Error("Sub-bab tidak ditemukan");

      // 🔹 Cek akses mentor
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== subBab.subChapter.course.mentorId
      ) {
        throw new Error(
          "Akses ditolak: hanya mentor dari course ini yang bisa membuat quiz"
        );
      }

      // Cek apakah sub-bab sudah punya quiz
      const existingQuiz = await tx.eLearningQuiz.findUnique({
        where: { subBabId },
      });
      if (existingQuiz) throw new Error("Sub-bab ini sudah memiliki quiz");

      // Generate ID: quiz-YYYYMMDD-xxxxxx
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
      const randomHex = crypto.randomBytes(6).toString("hex");
      const quizId = `quiz-${formattedDate}-${randomHex}`;

      // Buat quiz baru
      const newQuiz = await tx.eLearningQuiz.create({
        data: {
          id: quizId,
          subBabId,
          title: data.title,
          description: data.description || null,
          totalQuestions: 0, // default
          timeLimitMinutes: data.timeLimitMinutes || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return newQuiz;
    });
  }

  static async getQuizBySubBab(
    subBabId: string,
    query: {
      search?: string;
      sortBy?: string;
      sortOrder?: string;
      page?: number;
      limit?: number;
    },
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    const {
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10000,
    } = query;
    const skip = (page - 1) * limit;

    return await prisma.$transaction(async (tx) => {
      const subBab = await tx.eLearningSubBab.findUnique({
        where: { id: subBabId },
        include: {
          subChapter: {
            include: { course: { select: { id: true, mentorId: true } } },
          },
        },
      });

      if (!subBab) throw new Error("Sub-bab tidak ditemukan");

      const courseId = subBab.subChapter.course.id;
      const mentorId = subBab.subChapter.course.mentorId;

      // 🔹 Cek akses berdasarkan role
      if (user.roles.includes("mentor")) {
        if (user.mentorProfileId !== mentorId) {
          throw new Error(
            "Akses ditolak: hanya mentor dari course ini yang bisa melihat quiz"
          );
        }
      } else if (user.roles.includes("mentee")) {
        const now = new Date();

        const activeSubscription = await tx.eLearningSubscription.findFirst({
          where: {
            userId: user.userId,
            status: {
              in: ["active", "confirmed", "completed"],
            },
            startAt: { lte: now },
            endAt: { gte: now },
          },
        });

        if (!activeSubscription) {
          throw new Error(
            "Akses ditolak: Anda tidak memiliki subscription aktif"
          );
        }
      }

      // 🔹 Filter & search
      const whereClause: any = { subBabId };
      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [total, quizzes] = await Promise.all([
        tx.eLearningQuiz.count({ where: whereClause }),
        tx.eLearningQuiz.findMany({
          where: whereClause,
          include: { questions: true },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
      ]);

      return {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        data: quizzes,
      };
    });
  }

  static async getQuizById(
    quizId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    return await prisma.$transaction(async (tx) => {
      // Cek apakah quiz ada
      const quiz = await tx.eLearningQuiz.findUnique({
        where: { id: quizId },
        include: {
          questions: true,
          subBab: {
            include: {
              subChapter: {
                include: {
                  course: { select: { id: true, mentorId: true } },
                },
              },
            },
          },
        },
      });

      if (!quiz) throw new Error("Quiz tidak ditemukan");

      const mentorId = quiz.subBab.subChapter.course.mentorId;

      // 🔹 Admin bebas akses
      if (user.roles.includes("admin")) {
        return quiz;
      }

      // 🔹 Cek akses mentor
      if (user.roles.includes("mentor")) {
        if (user.mentorProfileId !== mentorId) {
          throw new Error(
            "Akses ditolak: hanya mentor dari course ini yang bisa mengakses quiz"
          );
        }
        return quiz;
      }

      // 🔹 Cek akses mentee (BERBASIS SUBSCRIPTION)
      if (user.roles.includes("mentee")) {
        const now = new Date();

        const activeSubscription = await tx.eLearningSubscription.findFirst({
          where: {
            userId: user.userId,
            status: {
              in: ["active", "confirmed", "completed"],
            },
            startAt: { lte: now },
            endAt: { gte: now },
          },
        });

        if (!activeSubscription) {
          throw new Error(
            "Akses ditolak: Anda tidak memiliki subscription aktif"
          );
        }

        return quiz;
      }

      throw new Error("Akses ditolak");
    });
  }

  static async updateQuiz(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      timeLimitMinutes: number;
    }>,
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    return await prisma.$transaction(async (tx) => {
      // Cek apakah quiz ada dan ambil relasi course-nya
      const quiz = await tx.eLearningQuiz.findUnique({
        where: { id },
        include: {
          subBab: {
            include: {
              subChapter: {
                include: { course: { select: { id: true, mentorId: true } } },
              },
            },
          },
        },
      });
      if (!quiz) throw new Error("Quiz tidak ditemukan");

      const courseId = quiz.subBab.subChapter.course.id;
      const mentorId = quiz.subBab.subChapter.course.mentorId;

      // Akses: Admin boleh semua
      if (!user.roles.includes("admin")) {
        // Akses: Mentor hanya jika course-nya sendiri
        if (user.roles.includes("mentor")) {
          if (user.mentorProfileId !== mentorId) {
            throw new Error("Akses ditolak: bukan mentor dari course ini");
          }
        } else {
          throw new Error("Akses ditolak");
        }
      }

      // Larang update totalQuestions
      if ((data as any).totalQuestions !== undefined) {
        throw new Error("Kolom totalQuestions tidak dapat diubah manual");
      }

      // Update quiz (partial)
      const updatedQuiz = await tx.eLearningQuiz.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description && { description: data.description }),
          ...(data.timeLimitMinutes && {
            timeLimitMinutes: data.timeLimitMinutes,
          }),
          updatedAt: new Date(),
        },
      });

      return updatedQuiz;
    });
  }

  static async deleteQuiz(id: string) {
    return await prisma.$transaction(async (tx) => {
      // Cek apakah quiz ada
      const quiz = await tx.eLearningQuiz.findUnique({
        where: { id },
        include: {
          subBab: {
            include: {
              subChapter: {
                include: {
                  course: { select: { title: true, id: true } },
                },
              },
            },
          },
        },
      });
      if (!quiz) throw new Error("Quiz tidak ditemukan");

      // Hapus semua relasi terkait (cascade di Prisma sudah aktif)
      await tx.eLearningQuiz.delete({ where: { id } });

      return true;
    });
  }

  static async getAllQuizzes(params: {
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page: number;
    limit: number;
    courseId?: string;
    mentorId?: string;
  }) {
    const {
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page,
      limit,
      courseId,
      mentorId,
    } = params;

    const skip = (page - 1) * limit;

    // 🔍 Filter dasar
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (courseId) {
      whereClause.subBab = {
        subChapter: {
          courseId,
        },
      };
    }

    if (mentorId) {
      whereClause.subBab = {
        subChapter: {
          course: {
            mentorId,
          },
        },
      };
    }

    // 🔹 Ambil data
    const [data, total] = await Promise.all([
      prisma.eLearningQuiz.findMany({
        where: whereClause,
        include: {
          subBab: {
            include: {
              subChapter: {
                include: {
                  course: {
                    select: {
                      id: true,
                      title: true,
                      mentorProfile: { select: { id: true } },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.eLearningQuiz.count({ where: whereClause }),
    ]);

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      data,
    };
  }

  static async getQuizzesByCourse(
    courseId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
    options: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      order?: "asc" | "desc";
    }
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = options;

    // 🔹 Cek apakah course valid
    const course = await prisma.eLearningCourse.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new Error("Course tidak ditemukan");

    // 🔹 Cek akses mentor
    if (
      user.roles.includes("mentor") &&
      user.mentorProfileId !== course.mentorId
    ) {
      throw new Error(
        "Akses ditolak: hanya mentor pemilik course yang bisa melihat quiz ini"
      );
    }

    // 🔹 Ambil semua quiz dari subbab yang terkait course ini
    const skip = (page - 1) * limit;
    const whereClause: any = {
      subBab: {
        subChapter: {
          courseId,
        },
      },
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, quizzes] = await Promise.all([
      prisma.eLearningQuiz.count({ where: whereClause }),
      prisma.eLearningQuiz.findMany({
        where: whereClause,
        include: {
          subBab: {
            include: {
              subChapter: {
                include: { course: true },
              },
            },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
    ]);

    return {
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: quizzes,
    };
  }

  static async exportQuizzesToFile(
    exportFormat: "csv" | "excel"
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const quizzes = await prisma.eLearningQuiz.findMany({
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
                  },
                },
              },
            },
          },
        },
        questions: {
          select: {
            id: true,
            questionText: true,
            options: true,
            correctAnswer: true,
            explanation: true,
            orderNumber: true,
          },
        },
      },
    });

    const rows = quizzes.map((q) => ({
      QuizID: q.id,
      SubBabID: q.subBabId,
      SubBabTitle: q.subBab?.title || "-",
      SubChapterID: q.subBab?.subChapter?.id || "-",
      SubChapterTitle: q.subBab?.subChapter?.title || "-",
      CourseID: q.subBab?.subChapter?.course?.id || "-",
      CourseTitle: q.subBab?.subChapter?.course?.title || "-",
      QuizTitle: q.title,
      Description: q.description || "-",
      TotalQuestions: q.totalQuestions ?? q.questions.length,
      TimeLimitMinutes: q.timeLimitMinutes || "-",
      CreatedAt: format(q.createdAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
      UpdatedAt: format(q.updatedAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
      QuestionList: q.questions
        .map(
          (qu, idx) =>
            `${idx + 1}. ${qu.questionText} [Correct: ${qu.correctAnswer}]`
        )
        .join(" | "),
    }));

    function randomString(length: number) {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");
    }

    // CSV Export
    if (exportFormat === "csv") {
      const csv = await parseAsync(rows);
      return {
        buffer: Buffer.from(csv, "utf-8"),
        filename: `elearning_quizzes_${Date.now()}_${randomString(6)}.csv`,
        mimetype: "text/csv",
      };
    }

    // Excel Export
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("ELearningQuizzes");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 25,
    }));

    rows.forEach((row) => worksheet.addRow(row));

    const arrayBuffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(arrayBuffer),
      filename: `elearning_quizzes_${Date.now()}_${randomString(6)}.xlsx`,
      mimetype:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }
}
