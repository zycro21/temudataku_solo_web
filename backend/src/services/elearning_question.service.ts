import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";

import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export class ELearningQuestionService {
  static async createQuestion(
    quizId: string,
    data: {
      questionText: string;
      options: string[];
      correctAnswer: string;
      explanation?: string;
    },
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    return await prisma.$transaction(async (tx) => {
      const quiz = await tx.eLearningQuiz.findUnique({
        where: { id: quizId },
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

      if (!quiz) {
        throw new Error("Quiz tidak ditemukan");
      }

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== quiz.text.subBab.subChapter.course.mentorId
      ) {
        throw new Error(
          "Akses ditolak: hanya mentor dari course ini yang bisa menambah pertanyaan",
        );
      }

      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");

      const randomHex = crypto.randomBytes(6).toString("hex");

      const questionId = `question-${formattedDate}-${randomHex}`;

      const lastQuestion = await tx.eLearningQuestion.findFirst({
        where: { quizId },
        orderBy: { orderNumber: "desc" },
      });

      const nextOrder = (lastQuestion?.orderNumber || 0) + 1;

      const newQuestion = await tx.eLearningQuestion.create({
        data: {
          id: questionId,
          quizId,
          questionText: data.questionText,
          options: data.options,
          correctAnswers: [data.correctAnswer],
          explanation: data.explanation || null,
          orderNumber: nextOrder,
          createdAt: new Date(),
        },
      });

      await tx.eLearningQuiz.update({
        where: { id: quizId },
        data: {
          totalQuestions: (quiz.totalQuestions ?? 0) + 1,
        },
      });

      return newQuestion;
    });
  }

  static async getQuestionsByQuiz(
    quizId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
    options: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      order?: "asc" | "desc";
    },
  ) {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    const sortField = options.sortBy || "orderNumber";
    const sortOrder = options.order || "asc";

    // ambil quiz + relasi sampai course
    const quiz = await prisma.eLearningQuiz.findUnique({
      where: { id: quizId },
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

    if (!quiz) {
      throw new Error("Quiz tidak ditemukan");
    }

    const course = quiz.text.subBab.subChapter.course;

    // role-based access
    const isAdmin = user.roles.includes("admin");
    const isMentor = user.roles.includes("mentor");

    if (isMentor && user.mentorProfileId !== course.mentorId) {
      throw new Error("Akses ditolak: quiz ini bukan milik Anda");
    }

    // ⚠️ DIHAPUS karena model tidak ada di schema kamu
    // (kalau kamu memang punya subscription model, baru bisa dipakai lagi)

    const whereCondition: any = {
      quizId,
    };

    if (options.search) {
      whereCondition.questionText = {
        contains: options.search,
        mode: "insensitive",
      };
    }

    const [questions, total] = await prisma.$transaction([
      prisma.eLearningQuestion.findMany({
        where: whereCondition,
        orderBy: {
          [sortField]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.eLearningQuestion.count({
        where: whereCondition,
      }),
    ]);

    return {
      data: questions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getQuestionById(
    questionId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    const question = await prisma.eLearningQuestion.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
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

    if (!question) {
      throw new Error("Pertanyaan tidak ditemukan");
    }

    const course = question.quiz?.text?.subBab?.subChapter?.course;

    if (!course) {
      throw new Error("Relasi course tidak valid");
    }

    const isAdmin = user.roles.includes("admin");
    const isMentor = user.roles.includes("mentor");
    const isMentee = user.roles.includes("mentee");

    // 🔹 Mentor access control
    if (!isAdmin && isMentor) {
      if (user.mentorProfileId !== course.mentorId) {
        throw new Error("Akses ditolak: pertanyaan ini bukan dari course Anda");
      }
    }

    // 🔹 Mentee subscription check
    if (!isAdmin && isMentee) {
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
            gt: now,
          },
        },
        orderBy: {
          endAt: "desc",
        },
      });

      if (!activeSubscription) {
        throw new Error(
          "Akses ditolak: Anda tidak memiliki subscription aktif",
        );
      }
    }

    return {
      id: question.id,
      questionText: question.questionText,
      options: question.options,
      correctAnswers: question.correctAnswers, // ✅ FIX: schema kamu pakai plural
      explanation: question.explanation,
      orderNumber: question.orderNumber,
      quizId: question.quizId,

      quizTitle: question.quiz.title,
      courseTitle: course.title,

      createdAt: question.createdAt,
    };
  }

  static async updateQuestion(
    id: string,
    data: {
      questionText?: string;
      options?: string[];
      correctAnswers?: string[];
      explanation?: string;
      orderNumber?: number;
    },
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    return await prisma.$transaction(async (tx) => {
      // ambil question + hierarchy
      const existing = await tx.eLearningQuestion.findUnique({
        where: { id },
        include: {
          quiz: {
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

      if (!existing) throw new Error("Pertanyaan tidak ditemukan");

      const course = existing.quiz.text.subBab.subChapter.course;

      // role check
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error(
          "Akses ditolak: hanya mentor dari course ini yang bisa mengedit pertanyaan",
        );
      }

      const newOptions = data.options ?? existing.options;
      const newCorrectAnswers = data.correctAnswers ?? existing.correctAnswers;

      // validasi correctAnswers harus ada di options
      if (
        data.correctAnswers &&
        !data.correctAnswers.every((ans) => newOptions.includes(ans))
      ) {
        throw new Error("Semua correctAnswers harus ada di dalam options");
      }

      // update tanpa reorder
      if (typeof data.orderNumber !== "number") {
        const updated = await tx.eLearningQuestion.update({
          where: { id },
          data: {
            questionText: data.questionText ?? existing.questionText,
            options: newOptions,
            correctAnswers: newCorrectAnswers,
            explanation: data.explanation ?? existing.explanation,
          },
        });

        return updated;
      }

      // reorder logic
      const quizId = existing.quizId;

      const allQuestions = await tx.eLearningQuestion.findMany({
        where: { quizId },
        orderBy: { orderNumber: "asc" },
      });

      const normalized = allQuestions
        .map((q) => ({
          id: q.id,
          order: q.orderNumber ?? Number.MAX_SAFE_INTEGER,
        }))
        .sort((a, b) => a.order - b.order);

      const total = normalized.length;

      let targetPos = Math.max(1, Math.floor(data.orderNumber));
      if (targetPos > total) targetPos = total;

      const idsWithoutCurrent = normalized
        .map((n) => n.id)
        .filter((qid) => qid !== id);

      const newOrderIds = [...idsWithoutCurrent];
      newOrderIds.splice(targetPos - 1, 0, id);

      const updates: any[] = [];

      for (let i = 0; i < newOrderIds.length; i++) {
        const qid = newOrderIds[i];
        const desiredOrder = i + 1;

        const original = allQuestions.find((q) => q.id === qid);

        if (qid === id) {
          updates.push(
            tx.eLearningQuestion.update({
              where: { id: qid },
              data: {
                questionText: data.questionText ?? existing.questionText,
                options: newOptions,
                correctAnswers: newCorrectAnswers,
                explanation: data.explanation ?? existing.explanation,
                orderNumber: desiredOrder,
              },
            }),
          );
        } else if (original?.orderNumber !== desiredOrder) {
          updates.push(
            tx.eLearningQuestion.update({
              where: { id: qid },
              data: { orderNumber: desiredOrder },
            }),
          );
        }
      }

      await Promise.all(updates);

      return await tx.eLearningQuestion.findUnique({
        where: { id },
      });
    });
  }

  static async deleteQuestion(id: string, user: { roles: string[] }) {
    return await prisma.$transaction(async (tx) => {
      // Cek apakah pertanyaan ada
      const existing = await tx.eLearningQuestion.findUnique({
        where: { id },
        include: {
          quiz: true,
        },
      });
      if (!existing) throw new Error("Pertanyaan tidak ditemukan");

      // Cek role user
      if (!user.roles.includes("admin")) {
        throw new Error(
          "Akses ditolak: hanya admin yang bisa menghapus pertanyaan",
        );
      }

      const quizId = existing.quizId;

      // Hapus pertanyaan
      await tx.eLearningQuestion.delete({ where: { id } });

      // Kurangi totalQuestions di quiz
      await tx.eLearningQuiz.update({
        where: { id: quizId },
        data: { totalQuestions: { decrement: 1 } },
      });

      // Ambil semua pertanyaan quiz yang tersisa, urutkan ulang orderNumber
      const remainingQuestions = await tx.eLearningQuestion.findMany({
        where: { quizId },
        orderBy: { orderNumber: "asc" },
      });

      // Perbaiki urutan jika ada yang lompat
      for (let i = 0; i < remainingQuestions.length; i++) {
        const q = remainingQuestions[i];
        const desiredOrder = i + 1;
        if (q.orderNumber !== desiredOrder) {
          await tx.eLearningQuestion.update({
            where: { id: q.id },
            data: { orderNumber: desiredOrder },
          });
        }
      }

      return true;
    });
  }

  static async duplicateQuestion(
    sourceQuestionId: string,
    targetQuizId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    return await prisma.$transaction(async (tx) => {
      // hanya admin
      if (!user.roles.includes("admin")) {
        throw new Error(
          "Akses ditolak: hanya admin yang dapat menyalin pertanyaan",
        );
      }

      // source question
      const sourceQuestion = await tx.eLearningQuestion.findUnique({
        where: { id: sourceQuestionId },
      });

      if (!sourceQuestion) {
        throw new Error("Pertanyaan sumber tidak ditemukan");
      }

      // target quiz
      const targetQuiz = await tx.eLearningQuiz.findUnique({
        where: { id: targetQuizId },
        include: { questions: true },
      });

      if (!targetQuiz) {
        throw new Error("Quiz tujuan tidak ditemukan");
      }

      // next order number
      const nextOrder =
        (targetQuiz.questions
          .map((q) => q.orderNumber ?? 0)
          .sort((a, b) => b - a)[0] ?? 0) + 1;

      // create duplicate (PAKAI CUID, jangan custom id)
      const newQuestion = await tx.eLearningQuestion.create({
        data: {
          quizId: targetQuizId,
          questionText: sourceQuestion.questionText,
          options: sourceQuestion.options,
          correctAnswers: sourceQuestion.correctAnswers,
          explanation: sourceQuestion.explanation,
          orderNumber: nextOrder,
        },
      });

      // update totalQuestions (kalau masih dipakai)
      await tx.eLearningQuiz.update({
        where: { id: targetQuizId },
        data: {
          totalQuestions: (targetQuiz.totalQuestions ?? 0) + 1,
        },
      });

      return newQuestion;
    });
  }

  static async globalViewQuestions(query: any) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      quizId,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    // search lebih fleksibel
    if (search) {
      where.OR = [
        {
          questionText: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          quiz: {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    if (quizId) {
      where.quizId = quizId;
    }

    // whitelist sorting biar aman
    const allowedSortFields = ["createdAt", "orderNumber", "questionText"];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const orderBy: any = {
      [safeSortBy]: sortOrder === "asc" ? "asc" : "desc",
    };

    const [data, total] = await Promise.all([
      prisma.eLearningQuestion.findMany({
        where,
        orderBy,
        skip,
        take: Number(limit),
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              text: {
                select: {
                  id: true,
                  title: true,
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
                },
              },
            },
          },
        },
      }),

      prisma.eLearningQuestion.count({ where }),
    ]);

    return {
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
      questions: data,
    };
  }

  static async exportQuestionsToFile(
    exportFormat: "csv" | "excel",
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const questions = await prisma.eLearningQuestion.findMany({
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            text: {
              select: {
                id: true,
                title: true,
                subBab: {
                  select: {
                    id: true,
                    title: true,
                    subChapter: {
                      select: {
                        id: true,
                        title: true,
                        course: {
                          select: { id: true, title: true },
                        },
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

    const rows = questions.map((q) => ({
      QuestionID: q.id,
      QuizID: q.quizId,
      QuizTitle: q.quiz?.title || "-",

      TextID: q.quiz?.text?.id || "-",
      TextTitle: q.quiz?.text?.title || "-",

      SubBabID: q.quiz?.text?.subBab?.id || "-",
      SubBabTitle: q.quiz?.text?.subBab?.title || "-",

      SubChapterID: q.quiz?.text?.subBab?.subChapter?.id || "-",
      SubChapterTitle: q.quiz?.text?.subBab?.subChapter?.title || "-",

      CourseID: q.quiz?.text?.subBab?.subChapter?.course?.id || "-",
      CourseTitle: q.quiz?.text?.subBab?.subChapter?.course?.title || "-",

      QuestionText: q.questionText,

      Options: q.options?.join(" | ") || "-",
      CorrectAnswers: q.correctAnswers?.join(" | ") || "-",

      Explanation: q.explanation || "-",
      OrderNumber: q.orderNumber ?? "-",

      CreatedAt: format(q.createdAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
    }));

    function randomString(length: number) {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join("");
    }

    // CSV Export
    if (exportFormat === "csv") {
      const csv = await parseAsync(rows);
      return {
        buffer: Buffer.from(csv, "utf-8"),
        filename: `elearning_questions_${Date.now()}_${randomString(6)}.csv`,
        mimetype: "text/csv",
      };
    }

    // Excel Export
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("ELearningQuestions");

    worksheet.columns = Object.keys(rows[0] || {}).map((key) => ({
      header: key,
      key,
      width: 25,
    }));

    rows.forEach((row) => worksheet.addRow(row));

    const arrayBuffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(arrayBuffer),
      filename: `elearning_questions_${Date.now()}_${randomString(6)}.xlsx`,
      mimetype:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }
}
