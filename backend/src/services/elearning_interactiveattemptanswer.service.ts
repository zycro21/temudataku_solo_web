import {
  PrismaClient,
  Prisma,
  ELearningInteractiveType,
  AnchorPosition,
  ELearningAnchoredContentType,
} from "@prisma/client";
import crypto from "crypto";
import { nanoid } from "nanoid";
import { Parser as Json2CsvParser } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";

import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export class ELearningInteractiveAttemptService {
  static async startAndSubmitAttempt(
    interactiveId: string,
    answers: any,
    user: { userId: string; roles: string[] }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil interactive + last attempt
       */
      const interactive = await tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
        include: {
          matching: { include: { items: true } },
          multipleChoice: { include: { options: true } },
          attempts: {
            where: { userId: user.userId },
            orderBy: { attemptNumber: "desc" },
            take: 1,
          },
        },
      });

      if (!interactive) {
        throw new Error("INTERACTIVE_NOT_FOUND");
      }

      /**
       * 2️⃣ Subscription aktif
       */
      const now = new Date();
      const activeSubscription = await tx.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: { in: ["active", "confirmed", "completed"] },
          startAt: { lte: now },
          endAt: { gt: now },
        },
      });

      if (!activeSubscription) {
        throw new Error("FORBIDDEN_SUBSCRIPTION_REQUIRED");
      }

      /**
       * 3️⃣ Cegah retry jika sudah passed
       */
      const lastAttempt = interactive.attempts[0];
      if (lastAttempt?.isPassed) {
        throw new Error("ATTEMPT_ALREADY_PASSED");
      }

      /**
       * 4️⃣ Tentukan attemptNumber BARU
       */
      const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

      /**
       * 5️⃣ Auto-correct
       */
      let score = 0;
      let maxScore = 100;
      let isCorrect = false;

      /**
       * =========================
       * MULTIPLE CHOICE
       * =========================
       */
      if (interactive.type === "MULTIPLE_CHOICE") {
        const question = interactive.multipleChoice!;
        maxScore = question.maxScore ?? 100;

        // 🔒 VALIDASI FORMAT
        if (!Array.isArray(answers)) {
          throw new Error("INVALID_ANSWER_FORMAT");
        }

        // 🔒 VALIDASI allowMultiple
        if (!question.allowMultiple && answers.length !== 1) {
          throw new Error("ONLY_ONE_ANSWER_ALLOWED");
        }

        if (question.allowMultiple && answers.length === 0) {
          throw new Error("AT_LEAST_ONE_ANSWER_REQUIRED");
        }

        const correctIds = question.options
          .filter((o) => o.isCorrect)
          .map((o) => o.id);

        const userIds = [...new Set(answers)];

        // 🔢 Hitung benar & salah
        const correctSet = new Set(correctIds);
        let correctCount = 0;

        for (const id of userIds) {
          if (correctSet.has(id)) {
            correctCount++;
          }
        }

        const totalCorrect = correctIds.length;

        // 🧮 PARTIAL SCORING
        if (totalCorrect > 0) {
          score = (correctCount / totalCorrect) * maxScore;
        } else {
          score = 0;
        }

        // ✅ Passed hanya jika SEMUA benar & tidak ada salah
        isCorrect =
          correctCount === totalCorrect && userIds.length === totalCorrect;
      }

      /**
       * =========================
       * MATCHING
       * =========================
       */
      if (interactive.type === "MATCHING") {
        const items = interactive.matching!.items;
        maxScore = interactive.matching!.maxScore ?? 100;

        const leftItems = items.filter((i) => i.side === "LEFT");
        const totalPairs = leftItems.length;

        let correctCount = 0;

        for (const item of leftItems) {
          if (answers?.[item.id] === item.matchWithId) {
            correctCount++;
          }
        }

        if (totalPairs > 0) {
          score = (correctCount / totalPairs) * maxScore;
        } else {
          score = 0;
        }

        isCorrect = correctCount === totalPairs;
      }

      /**
       * 6️⃣ Create attempt BARU
       */
      const attempt = await tx.eLearningTextInteractiveAttempt.create({
        data: {
          id: `EIntAttempt_${nanoid(12)}`,
          interactiveId,
          userId: user.userId,
          attemptNumber,
          totalScore: score,
          maxScore,
          isPassed: isCorrect,
          submittedAt: new Date(),
        },
      });

      /**
       * 7️⃣ Create answer BARU (history immutable)
       */
      await tx.eLearningInteractiveAnswer.create({
        data: {
          id: `EIntAnswer_${nanoid(12)}`,
          attemptId: attempt.id,
          interactiveId,
          userId: user.userId,
          answers,
          score,
          maxScore,
          isCorrect,
        },
      });

      return {
        attemptId: attempt.id,
        attemptNumber,
        score,
        maxScore,
        isPassed: isCorrect,
      };
    });
  }

  static async getAttempts(
    interactiveId: string,
    query: any,
    user: { userId: string; roles: string[] }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil interactive + relasi course
       */
      const interactive = await tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
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

      if (!interactive) {
        throw new Error("INTERACTIVE_NOT_FOUND");
      }

      const course = interactive.text.subBab.subChapter.course;

      /**
       * 2️⃣ Role-based access
       */
      if (user.roles.includes("mentor")) {
        if (course.mentorId !== user.userId) {
          throw new Error("FORBIDDEN_NOT_COURSE_OWNER");
        }
      }

      if (user.roles.includes("mentee")) {
        const now = new Date();
        const activeSubscription = await tx.eLearningSubscription.findFirst({
          where: {
            userId: user.userId,
            status: { in: ["active", "confirmed", "completed"] },
            startAt: { lte: now },
            endAt: { gt: now },
          },
        });

        if (!activeSubscription) {
          throw new Error("FORBIDDEN_SUBSCRIPTION_REQUIRED");
        }
      }

      /**
       * 3️⃣ Pagination & filter
       */
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const skip = (page - 1) * limit;

      const where: any = {
        interactiveId,
      };

      if (query.isPassed !== undefined) {
        where.isPassed = query.isPassed;
      }

      // mentee hanya boleh lihat miliknya
      if (user.roles.includes("mentee")) {
        where.userId = user.userId;
      }

      // admin / mentor bisa filter userId
      if (!user.roles.includes("mentee") && query.userId) {
        where.userId = query.userId;
      }

      const orderBy = {
        [query.sortBy ?? "startedAt"]: query.order ?? "desc",
      };

      /**
       * 4️⃣ Query data
       */
      const [total, attempts] = await Promise.all([
        tx.eLearningTextInteractiveAttempt.count({ where }),
        tx.eLearningTextInteractiveAttempt.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            answers: {
              select: {
                id: true,
                score: true,
                maxScore: true,
                isCorrect: true,
                submittedAt: true,
              },
            },
          },
        }),
      ]);

      return {
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        items: attempts,
      };
    });
  }

  static async getAttemptDetail(
    attemptId: string,
    user: { userId: string; roles: string[] }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil attempt + interactive + course
       */
      const attempt = await tx.eLearningTextInteractiveAttempt.findUnique({
        where: { id: attemptId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          answers: true,
          interactive: {
            include: {
              matching: { include: { items: true } },
              multipleChoice: { include: { options: true } },
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

      if (!attempt) {
        throw new Error("ATTEMPT_NOT_FOUND");
      }

      const course = attempt.interactive.text.subBab.subChapter.course;

      /**
       * 2️⃣ Role-based authorization
       */

      // mentor hanya boleh lihat course miliknya
      if (user.roles.includes("mentor")) {
        if (course.mentorId !== user.userId) {
          throw new Error("FORBIDDEN_NOT_COURSE_OWNER");
        }
      }

      // mentee hanya boleh lihat attempt sendiri + subscription aktif
      if (user.roles.includes("mentee")) {
        if (attempt.userId !== user.userId) {
          throw new Error("FORBIDDEN_ATTEMPT_NOT_OWNED");
        }

        const now = new Date();
        const activeSubscription = await tx.eLearningSubscription.findFirst({
          where: {
            userId: user.userId,
            status: { in: ["active", "confirmed", "completed"] },
            startAt: { lte: now },
            endAt: { gt: now },
          },
        });

        if (!activeSubscription) {
          throw new Error("FORBIDDEN_SUBSCRIPTION_REQUIRED");
        }
      }

      /**
       * 3️⃣ Optional masking (future-proof)
       * - Bisa disesuaikan jika mau sembunyikan jawaban benar
       *   saat belum passed, dll
       */

      return {
        attempt: {
          id: attempt.id,
          attemptNumber: attempt.attemptNumber,
          totalScore: attempt.totalScore,
          maxScore: attempt.maxScore,
          isPassed: attempt.isPassed,
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt,
        },
        user: attempt.user,
        interactive: {
          id: attempt.interactive.id,
          type: attempt.interactive.type,
        },
        answers: attempt.answers.map((a) => ({
          id: a.id,
          answers: a.answers,
          score: a.score,
          maxScore: a.maxScore,
          isCorrect: a.isCorrect,
          submittedAt: a.submittedAt,
        })),
        course: {
          id: course.id,
          title: course.title,
          mentorId: course.mentorId,
        },
      };
    });
  }

  static async getLatestAttempt(
    interactiveId: string,
    user: { userId: string; roles: string[] }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil interactive + course
       */
      const interactive = await tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
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

      if (!interactive) {
        throw new Error("INTERACTIVE_NOT_FOUND");
      }

      const course = interactive.text.subBab.subChapter.course;

      /**
       * 2️⃣ Authorization
       */
      if (user.roles.includes("mentor")) {
        if (course.mentorId !== user.userId) {
          throw new Error("FORBIDDEN_NOT_COURSE_OWNER");
        }
      }

      if (user.roles.includes("mentee")) {
        const now = new Date();

        const activeSubscription = await tx.eLearningSubscription.findFirst({
          where: {
            userId: user.userId,
            status: { in: ["active", "confirmed", "completed"] },
            startAt: { lte: now },
            endAt: { gt: now },
          },
        });

        if (!activeSubscription) {
          throw new Error("FORBIDDEN_SUBSCRIPTION_REQUIRED");
        }
      }

      /**
       * 3️⃣ Ambil latest attempt
       * 🔥 INCLUDE USER SELALU (TYPE SAFE)
       */
      const latestAttempt = await tx.eLearningTextInteractiveAttempt.findFirst({
        where: {
          interactiveId,
          ...(user.roles.includes("mentee") ? { userId: user.userId } : {}),
        },
        orderBy: { attemptNumber: "desc" },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          answers: true,
        },
      });

      if (!latestAttempt) {
        throw new Error("ATTEMPT_NOT_FOUND");
      }

      /**
       * 4️⃣ Response shaping (AMAN)
       */
      return {
        attempt: {
          id: latestAttempt.id,
          attemptNumber: latestAttempt.attemptNumber,
          totalScore: latestAttempt.totalScore,
          maxScore: latestAttempt.maxScore,
          isPassed: latestAttempt.isPassed,
          startedAt: latestAttempt.startedAt,
          submittedAt: latestAttempt.submittedAt,
        },

        // ⬇️ mentee TIDAK DAPAT data user
        user: user.roles.includes("mentee") ? undefined : latestAttempt.user,

        answers: latestAttempt.answers.map((a) => ({
          id: a.id,
          answers: a.answers,
          score: a.score,
          maxScore: a.maxScore,
          isCorrect: a.isCorrect,
          submittedAt: a.submittedAt,
        })),

        course: {
          id: course.id,
          title: course.title,
          mentorId: course.mentorId,
        },
      };
    });
  }

  static async saveAttemptAnswers(
    attemptId: string,
    answers: any,
    user: { userId: string; roles: string[] }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil attempt + interactive
       */
      const attempt = await tx.eLearningTextInteractiveAttempt.findUnique({
        where: { id: attemptId },
        include: {
          interactive: {
            include: {
              matching: { include: { items: true } },
              multipleChoice: { include: { options: true } },
            },
          },
        },
      });

      if (!attempt) {
        throw new Error("ATTEMPT_NOT_FOUND");
      }

      /**
       * 2️⃣ Ownership check
       */
      if (attempt.userId !== user.userId) {
        throw new Error("FORBIDDEN_NOT_OWNER");
      }

      /**
       * 3️⃣ Subscription aktif
       */
      const now = new Date();
      const activeSubscription = await tx.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: { in: ["active", "confirmed", "completed"] },
          startAt: { lte: now },
          endAt: { gt: now },
        },
      });

      if (!activeSubscription) {
        throw new Error("FORBIDDEN_SUBSCRIPTION_REQUIRED");
      }

      /**
       * 4️⃣ Cegah jika sudah submit
       */
      if (attempt.submittedAt) {
        throw new Error("ATTEMPT_ALREADY_SUBMITTED");
      }

      /**
       * 5️⃣ Auto-correct (PREVIEW)
       */
      let score = 0;
      let maxScore = 100;
      let isCorrect = false;

      const interactive = attempt.interactive;

      if (interactive.type === "MULTIPLE_CHOICE") {
        const question = interactive.multipleChoice!;
        maxScore = question.maxScore ?? 100;

        const correctIds = question.options
          .filter((o) => o.isCorrect)
          .map((o) => o.id)
          .sort();

        const userIds = Array.isArray(answers) ? [...answers].sort() : [];

        isCorrect = JSON.stringify(correctIds) === JSON.stringify(userIds);
        score = isCorrect ? maxScore : 0;
      }

      if (interactive.type === "MATCHING") {
        const items = interactive.matching!.items;
        maxScore = interactive.matching!.maxScore ?? 100;

        const totalPairs = items.filter((i) => i.side === "LEFT").length;
        let correctCount = 0;

        for (const item of items.filter((i) => i.side === "LEFT")) {
          if (answers?.[item.id] === item.matchWithId) {
            correctCount++;
          }
        }

        score = (correctCount / totalPairs) * maxScore;
        isCorrect = correctCount === totalPairs;
      }

      /**
       * 6️⃣ Cari existing answer (1 attempt = 1 answer)
       */
      const existingAnswer = await tx.eLearningInteractiveAnswer.findFirst({
        where: {
          attemptId: attempt.id,
          interactiveId: attempt.interactiveId,
          userId: user.userId,
        },
      });

      /**
       * 7️⃣ Update atau Create
       */
      if (existingAnswer) {
        await tx.eLearningInteractiveAnswer.update({
          where: { id: existingAnswer.id },
          data: {
            answers,
            score,
            maxScore,
            isCorrect,
            submittedAt: new Date(),
          },
        });
      } else {
        await tx.eLearningInteractiveAnswer.create({
          data: {
            id: `EIntAnswer_${nanoid(12)}`,
            attemptId: attempt.id,
            interactiveId: attempt.interactiveId,
            userId: user.userId,
            answers,
            score,
            maxScore,
            isCorrect,
          },
        });
      }

      return {
        attemptId: attempt.id,
        attemptNumber: attempt.attemptNumber,
        score,
        maxScore,
        isCorrect,
      };
    });
  }

  static async submitAttempt(
    attemptId: string,
    answers: any,
    user: { userId: string; roles: string[] }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil attempt + interactive
       */
      const attempt = await tx.eLearningTextInteractiveAttempt.findUnique({
        where: { id: attemptId },
        include: {
          interactive: {
            include: {
              matching: { include: { items: true } },
              multipleChoice: { include: { options: true } },
            },
          },
        },
      });

      if (!attempt) {
        throw new Error("ATTEMPT_NOT_FOUND");
      }

      /**
       * 2️⃣ Ownership check
       */
      if (attempt.userId !== user.userId) {
        throw new Error("FORBIDDEN_NOT_OWNER");
      }

      /**
       * 3️⃣ Subscription aktif (khusus mentee)
       */
      if (user.roles.includes("mentee")) {
        const now = new Date();
        const activeSubscription = await tx.eLearningSubscription.findFirst({
          where: {
            userId: user.userId,
            status: { in: ["active", "confirmed", "completed"] },
            startAt: { lte: now },
            endAt: { gt: now },
          },
        });

        if (!activeSubscription) {
          throw new Error("FORBIDDEN_SUBSCRIPTION_REQUIRED");
        }
      }

      /**
       * 4️⃣ Cegah submit ulang
       */
      if (attempt.submittedAt) {
        throw new Error("ATTEMPT_ALREADY_SUBMITTED");
      }

      /**
       * 5️⃣ Auto-correct
       */
      let score = 0;
      let maxScore = 100;
      let isCorrect = false;

      const interactive = attempt.interactive;

      if (interactive.type === "MULTIPLE_CHOICE") {
        const question = interactive.multipleChoice!;
        maxScore = question.maxScore ?? 100;

        const correctIds = question.options
          .filter((o) => o.isCorrect)
          .map((o) => o.id)
          .sort();

        const userIds = Array.isArray(answers) ? answers.sort() : [];

        isCorrect = JSON.stringify(correctIds) === JSON.stringify(userIds);
        score = isCorrect ? maxScore : 0;
      }

      if (interactive.type === "MATCHING") {
        const items = interactive.matching!.items;
        maxScore = interactive.matching!.maxScore ?? 100;

        const totalPairs = items.filter((i) => i.side === "LEFT").length;
        let correctCount = 0;

        for (const item of items.filter((i) => i.side === "LEFT")) {
          if (answers[item.id] === item.matchWithId) {
            correctCount++;
          }
        }

        score = (correctCount / totalPairs) * maxScore;
        isCorrect = correctCount === totalPairs;
      }

      /**
       * 6️⃣ Simpan answer (1 attempt = 1 answer)
       */
      await tx.eLearningInteractiveAnswer.create({
        data: {
          id: `EIntAnswer_${nanoid(12)}`,
          attemptId: attempt.id,
          interactiveId: attempt.interactiveId,
          userId: user.userId,
          answers,
          score,
          maxScore,
          isCorrect,
        },
      });

      /**
       * 7️⃣ Update attempt
       */
      await tx.eLearningTextInteractiveAttempt.update({
        where: { id: attempt.id },
        data: {
          totalScore: score,
          maxScore,
          isPassed: isCorrect,
          submittedAt: new Date(),
        },
      });

      return {
        attemptId: attempt.id,
        attemptNumber: attempt.attemptNumber,
        score,
        maxScore,
        isPassed: isCorrect,
      };
    });
  }

  static async getAttemptAnswers(
    attemptId: string,
    user: { userId: string; roles: string[] }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil attempt + relasi lengkap
       */
      const attempt = await tx.eLearningTextInteractiveAttempt.findUnique({
        where: { id: attemptId },
        include: {
          answers: {
            orderBy: { submittedAt: "asc" },
          },
          interactive: {
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

      if (!attempt) {
        throw new Error("ATTEMPT_NOT_FOUND");
      }

      const course = attempt.interactive.text.subBab.subChapter.course;

      /**
       * 2️⃣ ROLE-BASED ACCESS CONTROL
       */

      // 🔐 ADMIN → FULL ACCESS
      if (user.roles.includes("admin")) {
        return attempt;
      }

      // 🔐 MENTOR → HARUS PEMILIK COURSE
      if (user.roles.includes("mentor")) {
        if (course.mentorId !== user.userId) {
          throw new Error("FORBIDDEN_NOT_COURSE_MENTOR");
        }

        return attempt;
      }

      // 🔐 MENTEE → ATTEMPT MILIK SENDIRI + SUBSCRIPTION AKTIF
      if (user.roles.includes("mentee")) {
        if (attempt.userId !== user.userId) {
          throw new Error("FORBIDDEN_NOT_OWNER");
        }

        const now = new Date();
        const activeSubscription = await tx.eLearningSubscription.findFirst({
          where: {
            userId: user.userId,
            status: { in: ["active", "confirmed", "completed"] },
            startAt: { lte: now },
            endAt: { gt: now },
          },
        });

        if (!activeSubscription) {
          throw new Error("FORBIDDEN_SUBSCRIPTION_REQUIRED");
        }

        return attempt;
      }

      /**
       * 3️⃣ DEFAULT DENY
       */
      throw new Error("FORBIDDEN");
    });
  }

  static async canAttemptInteractive(
    interactiveId: string,
    user: { userId: string; roles: string[] }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil interactive + relasi course + last attempt
       */
      const interactive = await tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
        include: {
          attempts: {
            where: { userId: user.userId },
            orderBy: { attemptNumber: "desc" },
            take: 1,
          },
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

      if (!interactive) {
        throw new Error("INTERACTIVE_NOT_FOUND");
      }

      const course = interactive.text.subBab.subChapter.course;

      const lastAttempt = interactive.attempts[0] ?? null;

      /**
       * 2️⃣ ADMIN → selalu boleh
       */
      if (user.roles.includes("admin")) {
        return {
          canAttempt: true,
          lastAttempt,
        };
      }

      /**
       * 3️⃣ MENTOR → harus mentor course
       */
      if (user.roles.includes("mentor")) {
        if (course.mentorId !== user.userId) {
          throw new Error("FORBIDDEN_NOT_COURSE_MENTOR");
        }

        return {
          canAttempt: true,
          lastAttempt,
        };
      }

      /**
       * 4️⃣ MENTEE → subscription aktif + belum passed
       */
      if (user.roles.includes("mentee")) {
        const now = new Date();

        const activeSubscription = await tx.eLearningSubscription.findFirst({
          where: {
            userId: user.userId,
            status: { in: ["active", "confirmed", "completed"] },
            startAt: { lte: now },
            endAt: { gt: now },
          },
        });

        if (!activeSubscription) {
          return {
            canAttempt: false,
            reason: "SUBSCRIPTION_REQUIRED",
            lastAttempt,
          };
        }

        if (lastAttempt?.isPassed) {
          return {
            canAttempt: false,
            reason: "INTERACTIVE_ALREADY_PASSED",
            lastAttempt,
          };
        }

        return {
          canAttempt: true,
          lastAttempt,
        };
      }

      /**
       * 5️⃣ DEFAULT DENY
       */
      throw new Error("FORBIDDEN");
    });
  }

  static async exportAttemptsToFile(formatType: "csv" | "excel") {
    const formatDate = (date: Date, pattern = "yyyy-MM-dd HH:mm:ss") =>
      format(date, pattern);

    const attempts = await prisma.eLearningTextInteractiveAttempt.findMany({
      include: {
        interactive: {
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
            email: true,
            fullName: true,
          },
        },
        answers: {
          orderBy: { submittedAt: "desc" },
          take: 1, // ambil jawaban terakhir (immutable history)
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    const rows = attempts.map((a) => ({
      AttemptID: a.id,
      InteractiveID: a.interactiveId,
      InteractiveType: a.interactive.type,

      AttemptNumber: a.attemptNumber,
      Score: a.totalScore ?? 0,
      MaxScore: a.maxScore ?? 0,
      IsPassed: a.isPassed ?? false,
      SubmittedAt: a.submittedAt ? formatDate(a.submittedAt) : "",

      UserID: a.user.id,
      UserEmail: a.user.email,
      UserFullName: a.user.fullName,

      CourseID: a.interactive.text.subBab.subChapter.course.id,
      CourseTitle: a.interactive.text.subBab.subChapter.course.title,

      SubChapterTitle: a.interactive.text.subBab.subChapter.title,
      SubBabTitle: a.interactive.text.subBab.title,

      Answers: a.answers[0] ? JSON.stringify(a.answers[0].answers) : "",
    }));

    const dateStr = formatDate(new Date(), "yyyyMMdd-HHmmss");
    const baseFileName = `interactive-attempts-${dateStr}`;

    /* ===== EXCEL ===== */
    if (formatType === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Interactive Attempts");

      worksheet.columns = Object.keys(rows[0] || {}).map((key) => ({
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
  }
}
