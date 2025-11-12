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
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    return await prisma.$transaction(async (tx) => {
      // cek quiz valid
      const quiz = await tx.eLearningQuiz.findUnique({
        where: { id: quizId },
        include: {
          subBab: {
            include: {
              subChapter: {
                include: { course: true },
              },
            },
          },
        },
      });
      if (!quiz) throw new Error("Quiz tidak ditemukan");

      // cek akses mentor
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== quiz.subBab.subChapter.course.mentorId
      ) {
        throw new Error(
          "Akses ditolak: hanya mentor dari course ini yang bisa menambah pertanyaan"
        );
      }

      // generate custom ID
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
      const randomHex = crypto.randomBytes(6).toString("hex");
      const questionId = `question-${formattedDate}-${randomHex}`;

      // hitung orderNumber berikutnya (auto increment manual)
      const lastQuestion = await tx.eLearningQuestion.findFirst({
        where: { quizId },
        orderBy: { orderNumber: "desc" },
      });
      const nextOrder = (lastQuestion?.orderNumber || 0) + 1;

      // simpan pertanyaan baru
      const newQuestion = await tx.eLearningQuestion.create({
        data: {
          id: questionId,
          quizId,
          questionText: data.questionText,
          options: data.options,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation || null,
          orderNumber: nextOrder,
          createdAt: new Date(),
        },
      });

      // update total pertanyaan
      await tx.eLearningQuiz.update({
        where: { id: quizId },
        data: { totalQuestions: (quiz.totalQuestions ?? 0) + 1 },
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
    }
  ) {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;
    const sortField = options.sortBy || "orderNumber";
    const sortOrder = options.order || "asc";

    // Cek quiz valid
    const quiz = await prisma.eLearningQuiz.findUnique({
      where: { id: quizId },
      include: {
        subBab: {
          include: {
            subChapter: {
              include: { course: { include: { purchases: true } } },
            },
          },
        },
      },
    });
    if (!quiz) throw new Error("Quiz tidak ditemukan");

    const course = quiz.subBab.subChapter.course;

    // Role-based access
    const isAdmin = user.roles.includes("admin");
    const isMentor = user.roles.includes("mentor");
    const isMentee = user.roles.includes("mentee");

    if (isMentor && user.mentorProfileId !== course.mentorId) {
      throw new Error("Akses ditolak: quiz ini bukan milik Anda");
    }

    if (isMentee) {
      const hasPurchased = course.purchases.some(
        (p) => p.userId === user.userId
      );
      if (!hasPurchased) {
        throw new Error(
          "Akses ditolak: Anda belum membeli course yang berisi quiz ini"
        );
      }
    }

    // Filter dan query pertanyaan
    const whereCondition: any = { quizId };
    if (options.search) {
      whereCondition.questionText = {
        contains: options.search,
        mode: "insensitive",
      };
    }

    const [questions, total] = await prisma.$transaction([
      prisma.eLearningQuestion.findMany({
        where: whereCondition,
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.eLearningQuestion.count({ where: whereCondition }),
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
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    // 🔹 Ambil pertanyaan + quiz + course hierarchy
    const question = await prisma.eLearningQuestion.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            subBab: {
              include: {
                subChapter: {
                  include: {
                    course: {
                      include: { purchases: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!question) throw new Error("Pertanyaan tidak ditemukan");

    const course = question.quiz.subBab.subChapter.course;

    const isAdmin = user.roles.includes("admin");
    const isMentor = user.roles.includes("mentor");
    const isMentee = user.roles.includes("mentee");

    // 🔹 Mentor hanya boleh akses question dari course yang dia ampu
    if (isMentor && user.mentorProfileId !== course.mentorId) {
      throw new Error("Akses ditolak: pertanyaan ini bukan dari course Anda");
    }

    // 🔹 Mentee hanya boleh akses jika sudah beli course terkait
    if (isMentee) {
      const hasPurchased = course.purchases.some(
        (p) => p.userId === user.userId
      );
      if (!hasPurchased) {
        throw new Error(
          "Akses ditolak: Anda belum membeli course yang berisi pertanyaan ini"
        );
      }
    }

    return {
      id: question.id,
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      orderNumber: question.orderNumber,
      quizId: question.quizId,
      createdAt: question.createdAt,
      quizTitle: question.quiz.title,
      courseTitle: course.title,
    };
  }

  static async updateQuestion(
    id: string,
    data: {
      questionText?: string;
      options?: string[];
      correctAnswer?: string;
      explanation?: string;
      orderNumber?: number;
    },
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    return await prisma.$transaction(async (tx) => {
      // ambil pertanyaan beserta quiz -> subBab -> subChapter -> course
      const existing = await tx.eLearningQuestion.findUnique({
        where: { id },
        include: {
          quiz: {
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

      if (!existing) throw new Error("Pertanyaan tidak ditemukan");

      // akses control: mentor hanya pemilik course
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== existing.quiz.subBab.subChapter.course.mentorId
      ) {
        throw new Error(
          "Akses ditolak: hanya mentor dari course ini yang bisa mengedit pertanyaan"
        );
      }

      // jika options diubah, pastikan correctAnswer (baru atau lama) valid
      if (data.options) {
        // jika correctAnswer baru diberikan -> must be in new options
        if (data.correctAnswer) {
          if (!data.options.includes(data.correctAnswer)) {
            throw new Error(
              "Jawaban benar harus salah satu dari opsi yang tersedia"
            );
          }
        } else {
          // correctAnswer tidak diberikan => gunakan existing.correctAnswer, harus tetap ada di new options
          if (!data.options.includes(existing.correctAnswer)) {
            throw new Error(
              "Perubahan opsi akan menghapus jawaban benar yang ada — sertakan correctAnswer yang valid"
            );
          }
        }
      } else {
        // options tidak diubah, tapi correctAnswer diubah -> make sure it's still valid compared to existing.options
        if (
          data.correctAnswer &&
          !existing.options.includes(data.correctAnswer)
        ) {
          throw new Error(
            "Jawaban benar harus salah satu dari opsi yang tersedia"
          );
        }
      }

      // handle orderNumber logic
      // jika orderNumber tidak disediakan: hanya update fields lain
      const newOrderRequested =
        typeof data.orderNumber === "number" ? data.orderNumber : null;

      if (newOrderRequested === null) {
        // simple update
        const updated = await tx.eLearningQuestion.update({
          where: { id },
          data: {
            questionText: data.questionText ?? existing.questionText,
            options: data.options ?? existing.options,
            correctAnswer: data.correctAnswer ?? existing.correctAnswer,
            explanation: data.explanation ?? existing.explanation,
            // don't touch orderNumber
          },
        });
        return updated;
      }

      // Jika orderNumber diberikan -> harus merapikan semua order dalam quiz
      const quizId = existing.quizId;

      // Ambil semua pertanyaan quiz ini ordered asc
      const allQuestions = await tx.eLearningQuestion.findMany({
        where: { quizId },
        orderBy: { orderNumber: "asc" },
      });

      // Kalau belum ada orderNumber pada beberapa pertanyaan, kita treat them as last by createdAt
      // Normalisasi: buat array urut berdasarkan existing.orderNumber (fallback big number)
      const normalized = allQuestions
        .map((q) => ({
          id: q.id,
          order:
            typeof q.orderNumber === "number"
              ? q.orderNumber
              : Number.MAX_SAFE_INTEGER,
        }))
        .sort((a, b) => a.order - b.order);

      // Hitung total existing (sebelum update). Note: existing is included in normalized.
      const total = normalized.length;

      // target position (1-based). Jika user request lebih dari total -> place at last (position = total)
      let targetPos = Math.max(1, Math.floor(newOrderRequested));
      if (targetPos > total) targetPos = total;

      // Build new ordering: remove the existing id from list then insert at targetPos-1
      const idsWithoutExisting = normalized
        .map((n) => n.id)
        .filter((qid) => qid !== id);
      // Insert id at index targetPos - 1 (0-based)
      const newOrderIds = [...idsWithoutExisting];
      newOrderIds.splice(targetPos - 1, 0, id);

      // Now assign sequential orderNumbers starting from 1
      const updates: Array<Promise<any>> = [];
      for (let i = 0; i < newOrderIds.length; i++) {
        const qid = newOrderIds[i];
        const desiredOrder = i + 1;
        // update only if order changed or if it's the one we're updating fields for
        const originalQuestion = allQuestions.find((aq) => aq.id === qid);
        const origOrder = originalQuestion?.orderNumber ?? null;
        const shouldUpdateOrder = origOrder !== desiredOrder;

        // For the question being updated, we also need to update other fields (text/options/etc)
        if (qid === id) {
          updates.push(
            tx.eLearningQuestion.update({
              where: { id: qid },
              data: {
                questionText: data.questionText ?? existing.questionText,
                options: data.options ?? existing.options,
                correctAnswer: data.correctAnswer ?? existing.correctAnswer,
                explanation: data.explanation ?? existing.explanation,
                orderNumber: desiredOrder,
              },
            })
          );
        } else if (shouldUpdateOrder) {
          updates.push(
            tx.eLearningQuestion.update({
              where: { id: qid },
              data: { orderNumber: desiredOrder },
            })
          );
        }
      }

      // run updates in transaction
      await Promise.all(updates);

      // Return updated question (fresh)
      const updatedQuestion = await tx.eLearningQuestion.findUnique({
        where: { id },
      });

      return updatedQuestion;
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
          "Akses ditolak: hanya admin yang bisa menghapus pertanyaan"
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
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    return await prisma.$transaction(async (tx) => {
      // hanya admin
      if (!user.roles.includes("admin")) {
        throw new Error(
          "Akses ditolak: hanya admin yang dapat menyalin pertanyaan"
        );
      }

      // cek pertanyaan sumber
      const sourceQuestion = await tx.eLearningQuestion.findUnique({
        where: { id: sourceQuestionId },
        include: { quiz: true },
      });
      if (!sourceQuestion) {
        throw new Error("Pertanyaan sumber tidak ditemukan");
      }

      // cek quiz tujuan
      const targetQuiz = await tx.eLearningQuiz.findUnique({
        where: { id: targetQuizId },
        include: { questions: true },
      });
      if (!targetQuiz) {
        throw new Error("Quiz tujuan tidak ditemukan");
      }

      // hitung orderNumber baru
      const existingQuestions = targetQuiz.questions.sort(
        (a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)
      );
      const nextOrder = existingQuestions.length + 1;

      // buat ID baru dengan format custom
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
      const randomHex = crypto.randomBytes(6).toString("hex");
      const newQuestionId = `question-${formattedDate}-${randomHex}`;

      // buat pertanyaan baru
      const newQuestion = await tx.eLearningQuestion.create({
        data: {
          id: newQuestionId,
          quizId: targetQuizId,
          questionText: sourceQuestion.questionText,
          options: sourceQuestion.options,
          correctAnswer: sourceQuestion.correctAnswer,
          explanation: sourceQuestion.explanation,
          orderNumber: nextOrder,
        },
      });

      // update totalQuestions di quiz tujuan
      const newTotal = (targetQuiz.totalQuestions ?? 0) + 1;
      await tx.eLearningQuiz.update({
        where: { id: targetQuizId },
        data: { totalQuestions: newTotal },
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

    if (search) {
      where.questionText = { contains: search, mode: "insensitive" };
    }

    if (quizId) {
      where.quizId = quizId;
    }

    const [data, total] = await Promise.all([
      prisma.eLearningQuestion.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          quiz: {
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
      }),
      prisma.eLearningQuestion.count({ where }),
    ]);

    return {
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      questions: data,
    };
  }

  static async exportQuestionsToFile(
    exportFormat: "csv" | "excel"
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const questions = await prisma.eLearningQuestion.findMany({
      include: {
        quiz: {
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
    });

    const rows = questions.map((q) => ({
      QuestionID: q.id,
      QuizID: q.quizId,
      QuizTitle: q.quiz?.title || "-",
      SubBabID: q.quiz?.subBab?.id || "-",
      SubBabTitle: q.quiz?.subBab?.title || "-",
      SubChapterID: q.quiz?.subBab?.subChapter?.id || "-",
      SubChapterTitle: q.quiz?.subBab?.subChapter?.title || "-",
      CourseID: q.quiz?.subBab?.subChapter?.course?.id || "-",
      CourseTitle: q.quiz?.subBab?.subChapter?.course?.title || "-",
      QuestionText: q.questionText,
      Options: q.options.join(" | "),
      CorrectAnswer: q.correctAnswer,
      Explanation: q.explanation || "-",
      OrderNumber: q.orderNumber || "-",
      CreatedAt: format(q.createdAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
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
        filename: `elearning_questions_${Date.now()}_${randomString(6)}.csv`,
        mimetype: "text/csv",
      };
    }

    // Excel Export
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("ELearningQuestions");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
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
