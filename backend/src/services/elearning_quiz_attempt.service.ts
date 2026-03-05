import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";

import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export class ELearningQuizAttemptService {
  static async startQuizAttempt(
    quizId: string,
    user: { userId: string; roles: string[] },
    answers: Record<string, string>
  ) {
    return await prisma.$transaction(async (tx) => {
      const quiz = await tx.eLearningQuiz.findUnique({
        where: { id: quizId },
        include: {
          questions: true,
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

      // ===== Validasi mentee memiliki subscription aktif =====
      if (user.roles.includes("mentee")) {
        const now = new Date();

        const activeSubscription = await tx.eLearningSubscription.findFirst({
          where: {
            userId: user.userId,
            status: {
              in: ["active", "confirmed", "completed"],
            }, // sesuaikan jika enum / value berbeda
            startAt: { lte: now },
            endAt: { gte: now },
          },
        });

        if (!activeSubscription) {
          throw new Error(
            "Akses ditolak: kamu tidak memiliki subscription aktif"
          );
        }
      }

      // ===== Cek apakah sudah pernah mengerjakan =====
      const existingAttempt = await tx.eLearningQuizAttempt.findUnique({
        where: { quizId_userId: { quizId, userId: user.userId } },
      });
      if (existingAttempt) {
        throw new Error("Kamu sudah pernah mengerjakan quiz ini");
      }

      // ===== Validasi jawaban lengkap =====
      const totalQuestions = quiz.questions.length;
      if (Object.keys(answers).length !== totalQuestions) {
        throw new Error(
          `Harus menjawab semua pertanyaan (${totalQuestions} soal)`
        );
      }

      // ===== Hitung skor =====
      let correctCount = 0;
      for (const q of quiz.questions) {
        if (answers[q.id] === q.correctAnswer) correctCount++;
      }
      const score = Math.round((correctCount / totalQuestions) * 100);

      // ===== Generate ID baru =====
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
      const randomHex = crypto.randomBytes(6).toString("hex");
      const attemptId = `attempt-${formattedDate}-${randomHex}`;

      // ===== Simpan data attempt =====
      const now = new Date();
      const attempt = await tx.eLearningQuizAttempt.create({
        data: {
          id: attemptId,
          quizId,
          userId: user.userId,
          score,
          answers,
          startedAt: now,
          completedAt: now,
          gradedAt: now,
          isAutoGraded: true,
          gradedBy: null,
          remarks: "",
        },
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              subBab: {
                select: {
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
          },
        },
      });

      return {
        attemptId: attempt.id,
        quizTitle: attempt.quiz.title,
        score,
        correctAnswers: correctCount,
        totalQuestions,
        gradedAt: attempt.gradedAt,
        course: attempt.quiz.subBab.subChapter.course,
      };
    });
  }

  static async getAttemptsByRole({
    quizId,
    user,
    page,
    limit,
    search,
    sortBy,
    order,
  }: {
    quizId: string;
    user: { userId: string; roles: string[]; mentorProfileId?: string };
    page: number;
    limit: number;
    search?: string;
    sortBy: string;
    order: "asc" | "desc";
  }) {
    const skip = (page - 1) * limit;

    // Pastikan quiz ada
    const quiz = await prisma.eLearningQuiz.findUnique({
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

    // 🔹 Role: Admin
    if (user.roles.includes("admin")) {
      const [data, total] = await prisma.$transaction([
        prisma.eLearningQuizAttempt.findMany({
          where: {
            quizId,
            user: search
              ? { fullName: { contains: search, mode: "insensitive" } }
              : undefined,
          },
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            quiz: {
              include: { questions: true },
            },
          },
          orderBy: { [sortBy]: order },
          skip,
          take: limit,
        }),
        prisma.eLearningQuizAttempt.count({ where: { quizId } }),
      ]);
      return {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data,
      };
    }

    // 🔹 Role: Mentor
    if (user.roles.includes("mentor")) {
      const mentorCourses = await prisma.eLearningCourse.findMany({
        where: { mentorId: user.mentorProfileId },
        select: { id: true },
      });
      const courseIds = mentorCourses.map((c) => c.id);

      const [data, total] = await prisma.$transaction([
        prisma.eLearningQuizAttempt.findMany({
          where: {
            quizId,
            quiz: {
              subBab: {
                subChapter: {
                  courseId: { in: courseIds },
                },
              },
            },
            user: search
              ? { fullName: { contains: search, mode: "insensitive" } }
              : undefined,
          },
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            quiz: { include: { questions: true } },
          },
          orderBy: { [sortBy]: order },
          skip,
          take: limit,
        }),
        prisma.eLearningQuizAttempt.count({
          where: {
            quizId,
            quiz: {
              subBab: {
                subChapter: {
                  courseId: { in: courseIds },
                },
              },
            },
          },
        }),
      ]);

      if (!data.length)
        throw new Error("Akses ditolak: tidak ada quiz yang diampu");
      return {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data,
      };
    }

    // 🔹 Role: Mentee
    if (user.roles.includes("mentee")) {
      const now = new Date();

      // Validasi mentee punya subscription aktif
      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: {
            in: ["active", "confirmed", "completed"],
          }, // sesuaikan jika enum / value berbeda
          startAt: { lte: now },
          endAt: { gte: now },
        },
      });

      if (!activeSubscription) {
        throw new Error(
          "Akses ditolak: kamu tidak memiliki subscription aktif"
        );
      }

      const [data, total] = await prisma.$transaction([
        prisma.eLearningQuizAttempt.findMany({
          where: { quizId, userId: user.userId },
          include: {
            quiz: { include: { questions: true } },
          },
          orderBy: { [sortBy]: order },
          skip,
          take: limit,
        }),
        prisma.eLearningQuizAttempt.count({
          where: { quizId, userId: user.userId },
        }),
      ]);

      if (!data.length) throw new Error("Belum ada attempt untuk quiz ini");
      return {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data,
      };
    }

    throw new Error("Akses ditolak");
  }

  static async gradeAttempt(
    attemptId: string,
    grader: { userId: string; roles?: string[] },
    data: { score: number; remarks?: string; isAutoGraded?: boolean }
  ) {
    // Pastikan attempt ada
    const attempt = await prisma.eLearningQuizAttempt.findUnique({
      where: { id: attemptId },
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

    if (!attempt) throw new Error("Attempt tidak ditemukan");

    // Jika mentor, pastikan dia memang mentor dari course terkait
    const isAdmin = grader.roles?.includes("admin");
    const isMentor = grader.roles?.includes("mentor");

    if (isMentor && !isAdmin) {
      const mentorCourseId = attempt.quiz.subBab.subChapter.course.mentorId;
      if (mentorCourseId !== grader.userId) {
        throw new Error("Anda tidak memiliki izin untuk menilai attempt ini");
      }
    }

    // Update data penilaian manual
    return await prisma.eLearningQuizAttempt.update({
      where: { id: attemptId },
      data: {
        score: data.score,
        remarks: data.remarks ?? null,
        isAutoGraded: data.isAutoGraded ?? false,
        gradedBy: grader.userId,
        gradedAt: new Date(),
      },
      include: {
        quiz: true,
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  static async getAllAttempts(
    user: { userId: string; roles: string[]; mentorProfileId?: string },
    query: any
  ) {
    const isAdmin = user.roles.includes("admin");
    const isMentor = user.roles.includes("mentor");

    if (!isAdmin && !isMentor) {
      throw new Error("Anda tidak memiliki izin untuk melihat data ini");
    }

    const {
      quizId,
      userId,
      isAutoGraded,
      minScore,
      maxScore,
      startDate,
      endDate,
      page = 1,
      limit = 10000,
    } = query;

    const filters: any = {};

    if (quizId) filters.quizId = quizId;
    if (userId) filters.userId = userId;
    if (typeof isAutoGraded === "boolean") filters.isAutoGraded = isAutoGraded;
    if (minScore !== undefined || maxScore !== undefined) {
      filters.score = {};
      if (minScore !== undefined) filters.score.gte = minScore;
      if (maxScore !== undefined) filters.score.lte = maxScore;
    }
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.gte = new Date(startDate);
      if (endDate) filters.createdAt.lte = new Date(endDate);
    }

    // Jika mentor, filter hanya attempt quiz dari course yang dia ampu
    if (isMentor && !isAdmin) {
      filters.quiz = {
        subBab: {
          subChapter: {
            course: {
              mentorId: user.userId,
            },
          },
        },
      };
    }

    const [total, attempts] = await Promise.all([
      prisma.eLearningQuizAttempt.count({ where: filters }),
      prisma.eLearningQuizAttempt.findMany({
        where: filters,
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              subBab: {
                select: {
                  subChapter: {
                    select: {
                      course: {
                        select: { id: true, title: true, mentorId: true },
                      },
                    },
                  },
                },
              },
            },
          },
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { completedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      attempts,
    };
  }

  static async getAttemptById(
    attemptId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    const attempt = await prisma.eLearningQuizAttempt.findUnique({
      where: { id: attemptId },
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
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!attempt) throw new Error("Attempt tidak ditemukan");

    const isAdmin = user.roles.includes("admin");
    const isMentor = user.roles.includes("mentor");
    const isMentee = user.roles.includes("mentee");

    // ===== IZIN AKSES =====
    if (isAdmin) return attempt;

    const course = attempt.quiz.subBab.subChapter.course;

    // Mentor hanya bisa lihat attempt dari course yang dia ampu
    if (isMentor && course.mentorId === user.userId) {
      return attempt;
    }

    // Mentee hanya bisa lihat attempt miliknya sendiri
    if (isMentee && attempt.userId === user.userId) {
      const now = new Date();

      // pastikan mentee memiliki subscription aktif
      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: {
            in: ["active", "confirmed", "completed"],
          }, // sesuaikan jika enum / value berbeda
          startAt: { lte: now },
          endAt: { gte: now },
        },
      });

      if (!activeSubscription)
        throw new Error(
          "Anda tidak memiliki izin untuk melihat attempt ini (tidak ada subscription aktif)"
        );

      return attempt;
    }

    throw new Error("Anda tidak memiliki izin untuk melihat attempt ini");
  }

  static async deleteAttempt(
    attemptId: string,
    user: { userId: string; roles?: string[] }
  ) {
    // Pastikan hanya admin yang bisa menghapus
    const isAdmin = user.roles?.includes("admin");
    if (!isAdmin)
      throw new Error("Anda tidak memiliki izin untuk menghapus attempt ini");

    // Cek apakah attempt ada
    const attempt = await prisma.eLearningQuizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          select: { id: true, title: true },
        },
        user: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!attempt) throw new Error("Attempt tidak ditemukan");

    // Hapus attempt
    await prisma.eLearningQuizAttempt.delete({
      where: { id: attemptId },
    });

    return {
      id: attempt.id,
      quizId: attempt.quizId,
      userId: attempt.userId,
      score: attempt.score,
    };
  }

  static async getQuizAttemptSummary(
    quizId: string,
    requester: { userId: string; roles?: string[] }
  ) {
    const quiz = await prisma.eLearningQuiz.findUnique({
      where: { id: quizId },
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

    if (!quiz) throw new Error("Quiz tidak ditemukan");

    const isAdmin = requester.roles?.includes("admin");
    const isMentor = requester.roles?.includes("mentor");

    // Jika mentor bukan admin, pastikan quiz-nya milik kursus dia
    if (isMentor && !isAdmin) {
      const mentorCourseId = quiz.subBab.subChapter.course.mentorId;
      if (mentorCourseId !== requester.userId) {
        throw new Error(
          "Anda tidak memiliki izin untuk melihat statistik quiz ini"
        );
      }
    }

    // Ambil semua attempt dari quiz ini
    const attempts = await prisma.eLearningQuizAttempt.findMany({
      where: { quizId },
      select: { score: true, isAutoGraded: true },
    });

    if (attempts.length === 0) {
      return {
        quizId,
        totalAttempt: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        autoGradedCount: 0,
        manualGradedCount: 0,
      };
    }

    const scores = attempts.map((a) => a.score ?? 0);
    const totalAttempt = attempts.length;
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / totalAttempt;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const autoGradedCount = attempts.filter(
      (a) => a.isAutoGraded === true
    ).length;
    const manualGradedCount = totalAttempt - autoGradedCount;

    return {
      quizId,
      totalAttempt,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore,
      lowestScore,
      autoGradedCount,
      manualGradedCount,
    };
  }

  static async getMyQuizHistory(
    userId: string,
    filters: {
      courseId?: string;
      minScore?: number;
      maxScore?: number;
      startDate?: string;
      endDate?: string;
    }
  ) {
    const whereClause: any = {
      userId,
    };

    // filter skor
    if (filters.minScore || filters.maxScore) {
      whereClause.score = {};
      if (filters.minScore) whereClause.score.gte = filters.minScore;
      if (filters.maxScore) whereClause.score.lte = filters.maxScore;
    }

    // filter tanggal
    if (filters.startDate || filters.endDate) {
      whereClause.completedAt = {};
      if (filters.startDate)
        whereClause.completedAt.gte = new Date(filters.startDate);
      if (filters.endDate)
        whereClause.completedAt.lte = new Date(filters.endDate);
    }

    // filter course
    if (filters.courseId) {
      whereClause.quiz = {
        subBab: {
          subChapter: {
            courseId: filters.courseId,
          },
        },
      };
    }

    const attempts = await prisma.eLearningQuizAttempt.findMany({
      where: whereClause,
      orderBy: { completedAt: "desc" },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            subBab: {
              select: {
                subChapter: {
                  select: {
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
    });

    return attempts.map((a) => ({
      attemptId: a.id,
      quizTitle: a.quiz.title,
      courseTitle: a.quiz.subBab.subChapter.course.title,
      courseId: a.quiz.subBab.subChapter.course.id,
      score: a.score,
      completedAt: a.completedAt,
      isAutoGraded: a.isAutoGraded,
    }));
  }

  static async exportQuizAttemptsToFile(
    exportFormat: "csv" | "excel"
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const attempts = await prisma.eLearningQuizAttempt.findMany({
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
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    const rows = attempts.map((a) => ({
      AttemptID: a.id,
      QuizID: a.quizId,
      QuizTitle: a.quiz?.title || "-",
      CourseID: a.quiz?.subBab?.subChapter?.course?.id || "-",
      CourseTitle: a.quiz?.subBab?.subChapter?.course?.title || "-",
      SubChapterID: a.quiz?.subBab?.subChapter?.id || "-",
      SubChapterTitle: a.quiz?.subBab?.subChapter?.title || "-",
      SubBabID: a.quiz?.subBab?.id || "-",
      SubBabTitle: a.quiz?.subBab?.title || "-",
      UserID: a.userId,
      UserName: a.user?.fullName || "-",
      UserEmail: a.user?.email || "-",
      Score: a.score ?? "-",
      IsAutoGraded: a.isAutoGraded ? "Yes" : "No",
      GradedBy: a.gradedBy || "-",
      GradedAt: a.gradedAt ? format(a.gradedAt, "yyyy-MM-dd HH:mm:ss") : "-",
      Remarks: a.remarks || "-",
      StartedAt: a.startedAt ? format(a.startedAt, "yyyy-MM-dd HH:mm:ss") : "-",
      CompletedAt: a.completedAt
        ? format(a.completedAt, "yyyy-MM-dd HH:mm:ss")
        : "-",
    }));

    function randomString(length: number) {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");
    }

    if (exportFormat === "csv") {
      const csv = await parseAsync(rows);
      return {
        buffer: Buffer.from(csv, "utf-8"),
        filename: `elearning_quiz_attempts_${Date.now()}_${randomString(
          6
        )}.csv`,
        mimetype: "text/csv",
      };
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("ELearningQuizAttempts");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 25,
    }));

    rows.forEach((row) => worksheet.addRow(row));

    const arrayBuffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(arrayBuffer),
      filename: `elearning_quiz_attempts_${Date.now()}_${randomString(6)}.xlsx`,
      mimetype:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }
}
