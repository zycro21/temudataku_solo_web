import {
  PrismaClient,
  Prisma,
  ELearningInteractiveType,
  AnchorPosition,
  ELearningAnchoredContentType,
} from "@prisma/client";
import crypto from "crypto";
import { nanoid } from "nanoid";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";

import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export class ELearningMatchingQuestionService {
  static async createMatchingQuestion(
    interactiveId: string,
    data: {
      title?: string;
      instruction?: string;
      maxScore?: number;
    },
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        /**
         * 1️⃣ Ambil interactive + relasi sampai course
         */
        const interactive = await tx.eLearningTextInteractive.findUnique({
          where: { id: interactiveId },
          include: {
            matching: true,
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

        /**
         * 2️⃣ Validasi tipe interactive
         */
        if (interactive.type !== ELearningInteractiveType.MATCHING) {
          throw new Error("INTERACTIVE_NOT_MATCHING_TYPE");
        }

        /**
         * 3️⃣ Pastikan belum ada matching question (UX validation)
         */
        if (interactive.matching) {
          throw new Error("MATCHING_ALREADY_EXISTS");
        }

        /**
         * 4️⃣ Validasi akses mentor
         */
        const course = interactive.text.subBab.subChapter.course;

        if (
          user.roles.includes("mentor") &&
          user.mentorProfileId !== course.mentorId
        ) {
          throw new Error("FORBIDDEN_CREATE_MATCHING");
        }

        /**
         * 5️⃣ Generate custom ID
         */
        const matchingQuestionId = `EMQ_${nanoid(10)}`;

        /**
         * 6️⃣ Create matching question
         */
        return await tx.eLearningMatchingQuestion.create({
          data: {
            id: matchingQuestionId,
            interactiveId,
            title: data.title ?? null,
            instruction: data.instruction ?? null,
            maxScore: data.maxScore ?? 100,
          },
        });
      });
    } catch (err: any) {
      /**
       * 7️⃣ Tangkap unique constraint dari DB
       */
      if (err.code === "P2002") {
        throw new Error("MATCHING_ALREADY_EXISTS");
      }

      throw err;
    }
  }

  static async getMatchingQuestionDetail(
    interactiveId: string,
    query: { itemOrder?: "asc" | "desc" },
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    const order = query.itemOrder ?? "asc";

    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil interactive + matching + course
       */
      const interactive = await tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
        include: {
          matching: {
            include: {
              items: {
                orderBy: { orderNumber: order },
              },
            },
          },
          text: {
            include: {
              subBab: {
                include: {
                  subChapter: {
                    include: { course: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!interactive || !interactive.matching) {
        throw new Error("MATCHING_NOT_FOUND");
      }

      const course = interactive.text.subBab.subChapter.course;

      /**
       * 2️⃣ Validasi akses role
       */
      if (user.roles.includes("mentor")) {
        if (user.mentorProfileId !== course.mentorId) {
          throw new Error("FORBIDDEN_MENTOR_ACCESS");
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
       * 3️⃣ Pisahkan item LEFT & RIGHT
       */
      const leftItems = interactive.matching.items
        .filter((i) => i.side === "LEFT")
        .map((i) => ({
          id: i.id,
          content: i.content,
          orderNumber: i.orderNumber,
        }));

      const rightItems = interactive.matching.items
        .filter((i) => i.side === "RIGHT")
        .map((i) => ({
          id: i.id,
          content: i.content,
          orderNumber: i.orderNumber,
        }));

      /**
       * 4️⃣ Ambil jawaban (ROLE-AWARE)
       */
      let answers: any = null;

      // 🔹 MENTEE → hanya jawabannya sendiri
      if (user.roles.includes("mentee")) {
        answers = await tx.eLearningInteractiveAnswer.findFirst({
          where: {
            interactiveId,
            userId: user.userId,
          },
          orderBy: { submittedAt: "desc" },
          select: {
            userId: true,
            answers: true,
            score: true,
            maxScore: true,
            isCorrect: true,
            submittedAt: true,
          },
        });
      }

      // 🔹 ADMIN / MENTOR → semua jawaban mentee
      if (user.roles.includes("admin") || user.roles.includes("mentor")) {
        answers = await tx.eLearningInteractiveAnswer.findMany({
          where: {
            interactiveId,
          },
          orderBy: { submittedAt: "desc" },
          select: {
            userId: true,
            answers: true,
            score: true,
            maxScore: true,
            isCorrect: true,
            submittedAt: true,
          },
        });
      }

      /**
       * 5️⃣ Final response
       */
      return {
        id: interactive.matching.id,
        interactiveId,
        title: interactive.matching.title,
        instruction: interactive.matching.instruction,
        maxScore: interactive.matching.maxScore,
        items: {
          left: leftItems,
          right: rightItems,
        },
        answers, // 👈 role-aware result
      };
    });
  }

  static async updateMatchingQuestion(
    interactiveId: string,
    data: {
      title?: string;
      instruction?: string;
      maxScore?: number;
    },
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil interactive + matching + course
       */
      const interactive = await tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
        include: {
          matching: true,
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

      /**
       * 2️⃣ Validasi tipe interactive
       */
      if (interactive.type !== ELearningInteractiveType.MATCHING) {
        throw new Error("INTERACTIVE_NOT_MATCHING_TYPE");
      }

      /**
       * 3️⃣ Pastikan matching question ada
       */
      if (!interactive.matching) {
        throw new Error("MATCHING_NOT_FOUND");
      }

      /**
       * 4️⃣ Validasi akses mentor
       */
      const course = interactive.text.subBab.subChapter.course;

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("FORBIDDEN_UPDATE_MATCHING");
      }

      /**
       * 5️⃣ Proteksi logika penting
       * - Jika sudah ada jawaban, maxScore TIDAK boleh diubah
       */
      if (data.maxScore !== undefined) {
        const hasAnswers = await tx.eLearningInteractiveAnswer.findFirst({
          where: { interactiveId },
          select: { id: true },
        });

        if (hasAnswers) {
          throw new Error("FORBIDDEN_UPDATE_MAX_SCORE_AFTER_SUBMISSION");
        }
      }

      /**
       * 6️⃣ Update matching question
       */
      return await tx.eLearningMatchingQuestion.update({
        where: {
          interactiveId,
        },
        data: {
          title:
            data.title !== undefined ? data.title : interactive.matching.title,
          instruction:
            data.instruction !== undefined
              ? data.instruction
              : interactive.matching.instruction,
          maxScore:
            data.maxScore !== undefined
              ? data.maxScore
              : interactive.matching.maxScore,
        },
      });
    });
  }

  static async deleteMatchingQuestion(
    interactiveId: string,
    user: {
      roles: string[];
    }
  ) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Validasi role (double safety)
       */
      if (!user.roles.includes("admin")) {
        throw new Error("FORBIDDEN_DELETE_MATCHING");
      }

      /**
       * 2️⃣ Ambil interactive + matching
       */
      const interactive = await tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
        include: {
          matching: true,
        },
      });

      if (!interactive) {
        throw new Error("INTERACTIVE_NOT_FOUND");
      }

      /**
       * 3️⃣ Validasi tipe interactive
       */
      if (interactive.type !== ELearningInteractiveType.MATCHING) {
        throw new Error("INTERACTIVE_NOT_MATCHING_TYPE");
      }

      /**
       * 4️⃣ Pastikan matching question ada
       */
      if (!interactive.matching) {
        throw new Error("MATCHING_NOT_FOUND");
      }

      /**
       * 5️⃣ Proteksi penting:
       * Jika sudah ada jawaban user, sebaiknya tidak boleh dihapus
       */
      const hasAnswers = await tx.eLearningInteractiveAnswer.findFirst({
        where: { interactiveId },
        select: { id: true },
      });

      if (hasAnswers) {
        throw new Error("FORBIDDEN_DELETE_MATCHING_WITH_SUBMISSIONS");
      }

      /**
       * 6️⃣ Delete matching question
       * - Matching items akan terhapus otomatis (onDelete: Cascade)
       */
      const deleted = await tx.eLearningMatchingQuestion.delete({
        where: {
          interactiveId,
        },
      });

      return deleted;
    });
  }
  static async checkMatchingExistence(
    interactiveId: string,
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    const interactive = await prisma.eLearningTextInteractive.findUnique({
      where: { id: interactiveId },
      include: {
        matching: {
          select: { id: true },
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

    if (interactive.type !== ELearningInteractiveType.MATCHING) {
      throw new Error("INTERACTIVE_NOT_MATCHING_TYPE");
    }

    /**
     * Validasi mentor ownership
     */
    const course = interactive.text.subBab.subChapter.course;

    if (
      user.roles.includes("mentor") &&
      user.mentorProfileId !== course.mentorId
    ) {
      throw new Error("FORBIDDEN_CHECK_MATCHING");
    }

    if (!interactive.matching) {
      throw new Error("MATCHING_NOT_FOUND");
    }

    return true;
  }

  static async getMatchingMeta(
    interactiveId: string,
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    const interactive = await prisma.eLearningTextInteractive.findUnique({
      where: { id: interactiveId },
      include: {
        matching: {
          include: {
            _count: {
              select: { items: true },
            },
          },
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

    if (!interactive || !interactive.matching) {
      throw new Error("Matching question tidak ditemukan");
    }

    if (interactive.type !== ELearningInteractiveType.MATCHING) {
      throw new Error("Interactive bukan tipe MATCHING");
    }

    const course = interactive.text.subBab.subChapter.course;

    /**
     * Mentor access
     */
    if (
      user.roles.includes("mentor") &&
      user.mentorProfileId !== course.mentorId
    ) {
      throw new Error("Akses ditolak: bukan pemilik course");
    }

    /**
     * Mentee access (subscription check)
     */
    if (user.roles.includes("mentee")) {
      const now = new Date();

      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: { in: ["active", "confirmed", "completed"] },
          startAt: { lte: now },
          endAt: { gt: now },
        },
      });

      if (!activeSubscription) {
        throw new Error("Akses ditolak: subscription tidak aktif");
      }
    }

    return {
      id: interactive.matching.id,
      title: interactive.matching.title,
      instruction: interactive.matching.instruction,
      maxScore: interactive.matching.maxScore,
      itemCount: interactive.matching._count.items,
    };
  }

  static async createMatchingItem(
    questionId: string,
    data: {
      content: string;
      side: "LEFT" | "RIGHT";
      orderNumber?: number;
      matchWithId?: string;
    },
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil matching question + interactive + course
       */
      const question = await tx.eLearningMatchingQuestion.findUnique({
        where: { id: questionId },
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
        },
      });

      if (!question) {
        throw new Error("MATCHING_QUESTION_NOT_FOUND");
      }

      /**
       * 2️⃣ Validasi mentor ownership
       */
      const course = question.interactive.text.subBab.subChapter.course;

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("FORBIDDEN_CREATE_MATCHING_ITEM");
      }

      /**
       * 3️⃣ Validasi LEFT wajib punya jawaban benar
       */
      if (data.side === "LEFT" && !data.matchWithId) {
        throw new Error("INVALID_MATCHING_PAIR: LEFT harus punya matchWithId");
      }

      /**
       * 4️⃣ Validasi matchWithId (harus RIGHT & satu question)
       */
      let pairedRightOrderNumber: number | null = null;

      if (data.matchWithId) {
        const target = await tx.eLearningMatchingItem.findUnique({
          where: { id: data.matchWithId },
        });

        if (!target) {
          throw new Error("INVALID_MATCHING_PAIR: pasangan tidak ditemukan");
        }

        if (target.side !== "RIGHT") {
          throw new Error("INVALID_MATCHING_PAIR: pasangan harus RIGHT");
        }

        if (target.questionId !== questionId) {
          throw new Error("INVALID_MATCHING_PAIR: beda question");
        }

        /**
         * ❌ RIGHT tidak boleh dipakai oleh lebih dari 1 LEFT
         */
        const alreadyPaired = await tx.eLearningMatchingItem.findFirst({
          where: {
            matchWithId: data.matchWithId,
            questionId,
          },
        });

        if (alreadyPaired) {
          throw new Error(
            "INVALID_MATCHING_PAIR: RIGHT sudah dipasangkan dengan LEFT lain"
          );
        }

        pairedRightOrderNumber = target.orderNumber;
      }

      /**
       * 5️⃣ Tentukan orderNumber
       * - LEFT: ikut RIGHT
       * - RIGHT: auto increment jika tidak dikirim
       */
      let finalOrderNumber: number;

      if (data.orderNumber !== undefined) {
        finalOrderNumber = data.orderNumber;
      } else if (data.side === "LEFT" && pairedRightOrderNumber !== null) {
        finalOrderNumber = pairedRightOrderNumber;
      } else {
        const maxOrder = await tx.eLearningMatchingItem.aggregate({
          where: { questionId },
          _max: { orderNumber: true },
        });

        finalOrderNumber = (maxOrder._max.orderNumber ?? 0) + 1;
      }

      /**
       * 6️⃣ Generate ID custom
       */
      const itemId = `EMItem_${nanoid(10)}`;

      /**
       * ❌ LEFT tidak boleh match ke dirinya sendiri
       */
      if (data.matchWithId && data.matchWithId === itemId) {
        throw new Error(
          "INVALID_MATCHING_PAIR: item tidak boleh dipasangkan dengan dirinya sendiri"
        );
      }

      /**
       * 7️⃣ Create item
       */
      return await tx.eLearningMatchingItem.create({
        data: {
          id: itemId,
          questionId,
          content: data.content,
          side: data.side,
          orderNumber: finalOrderNumber,
          matchWithId: data.matchWithId ?? null,
        },
      });
    });
  }

  static async updateMatchingItem(
    itemId: string,
    data: {
      content?: string;
      orderNumber?: number;
      matchWithId?: string | null;
    },
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil item + relasi sampai course
       */
      const item = await tx.eLearningMatchingItem.findUnique({
        where: { id: itemId },
        include: {
          question: {
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
              items: true,
            },
          },
        },
      });

      if (!item) {
        throw new Error("ITEM_NOT_FOUND");
      }

      const interactive = item.question.interactive;

      /**
       * 2️⃣ Validasi tipe interactive
       */
      if (interactive.type !== ELearningInteractiveType.MATCHING) {
        throw new Error("INTERACTIVE_NOT_MATCHING");
      }

      /**
       * 3️⃣ Validasi akses mentor
       */
      const course = interactive.text.subBab.subChapter.course;

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("FORBIDDEN_UPDATE_MATCHING_ITEM");
      }

      /**
       * 4️⃣ SWAP orderNumber (TANPA ubah pasangan)
       */
      if (data.orderNumber !== undefined && data.matchWithId === undefined) {
        const conflictItem = item.question.items.find(
          (i) =>
            i.id !== item.id &&
            i.side === item.side &&
            i.orderNumber === data.orderNumber
        );

        if (conflictItem) {
          await tx.eLearningMatchingItem.update({
            where: { id: conflictItem.id },
            data: { orderNumber: item.orderNumber },
          });
        }
      }

      /**
       * 5️⃣ UPDATE matchWithId (HANYA LEFT, FULL SWAP PASANGAN)
       */
      if (data.matchWithId !== undefined) {
        if (item.side !== "LEFT") {
          throw new Error("INVALID_MATCHING_SOURCE");
        }

        if (data.matchWithId === null) {
          await tx.eLearningMatchingItem.update({
            where: { id: item.id },
            data: { matchWithId: null },
          });
        } else {
          if (data.matchWithId === item.id) {
            throw new Error("INVALID_MATCHING_PAIR");
          }

          const target = item.question.items.find(
            (i) => i.id === data.matchWithId
          );

          if (!target) {
            throw new Error("MATCH_TARGET_NOT_FOUND");
          }

          if (target.side !== "RIGHT") {
            throw new Error("INVALID_MATCH_SIDE");
          }

          const currentRight = item.matchWithId
            ? item.question.items.find((i) => i.id === item.matchWithId)
            : null;

          const targetLeft = item.question.items.find(
            (i) => i.matchWithId === target.id
          );

          // 🔁 SWAP pasangan jika dua-duanya sudah punya pasangan
          if (targetLeft && currentRight) {
            await tx.eLearningMatchingItem.update({
              where: { id: targetLeft.id },
              data: { matchWithId: currentRight.id },
            });

            await tx.eLearningMatchingItem.update({
              where: { id: currentRight.id },
              data: { orderNumber: targetLeft.orderNumber },
            });
          }

          // set pasangan baru
          await tx.eLearningMatchingItem.update({
            where: { id: item.id },
            data: { matchWithId: target.id },
          });

          await tx.eLearningMatchingItem.update({
            where: { id: target.id },
            data: { orderNumber: item.orderNumber },
          });
        }
      }

      /**
       * 6️⃣ Update field biasa
       */
      return await tx.eLearningMatchingItem.update({
        where: { id: itemId },
        data: {
          content: data.content ?? undefined,
          orderNumber: data.orderNumber ?? undefined,
        },
      });
    });
  }

  static async deleteMatchingItem(
    itemId: string,
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil item + relasi sampai course
       */
      const item = await tx.eLearningMatchingItem.findUnique({
        where: { id: itemId },
        include: {
          question: {
            include: {
              items: true,
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
          },
        },
      });

      if (!item) {
        throw new Error("ITEM_NOT_FOUND");
      }

      /**
       * 2️⃣ Validasi tipe interactive
       */
      const interactive = item.question.interactive;

      if (interactive.type !== ELearningInteractiveType.MATCHING) {
        throw new Error("INTERACTIVE_NOT_MATCHING");
      }

      /**
       * 3️⃣ Validasi akses mentor
       */
      const course = interactive.text.subBab.subChapter.course;

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("FORBIDDEN_DELETE_MATCHING_ITEM");
      }

      /**
       * 4️⃣ Jika item sedang dipasangkan → unmatch pasangan
       */
      if (item.matchWithId) {
        await tx.eLearningMatchingItem.update({
          where: { id: item.matchWithId },
          data: { matchWithId: null },
        });
      }

      /**
       * 5️⃣ Hapus item
       */
      await tx.eLearningMatchingItem.delete({
        where: { id: itemId },
      });

      /**
       * 6️⃣ Normalisasi orderNumber (BERDASARKAN PASANGAN)
       */
      const remainingItems = item.question.items.filter((i) => i.id !== itemId);

      // group berdasarkan orderNumber lama
      const pairMap = new Map<number, typeof remainingItems>();

      for (const i of remainingItems) {
        if (!pairMap.has(i.orderNumber)) {
          pairMap.set(i.orderNumber, []);
        }
        pairMap.get(i.orderNumber)!.push(i);
      }

      const sortedOrders = Array.from(pairMap.keys()).sort((a, b) => a - b);

      let newOrder = 1;
      for (const oldOrder of sortedOrders) {
        const pairItems = pairMap.get(oldOrder)!;

        for (const pairItem of pairItems) {
          if (pairItem.orderNumber !== newOrder) {
            await tx.eLearningMatchingItem.update({
              where: { id: pairItem.id },
              data: { orderNumber: newOrder },
            });
          }
        }

        newOrder++;
      }

      return true;
    });
  }

  static async reorderMatchingItems(
    questionId: string,
    payload: {
      side: "LEFT" | "RIGHT";
      orders: { itemId: string; orderNumber: number }[];
    },
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      /**
       *  Ambil matching question + relasi sampai course
       */
      const question = await tx.eLearningMatchingQuestion.findUnique({
        where: { id: questionId },
        include: {
          items: true,
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

      if (!question) {
        throw new Error("MATCHING_QUESTION_NOT_FOUND");
      }

      /**
       * 2️⃣ Validasi tipe interactive
       */
      if (question.interactive.type !== "MATCHING") {
        throw new Error("INTERACTIVE_NOT_MATCHING_TYPE");
      }

      /**
       * 3️⃣ Validasi akses mentor
       */
      const course = question.interactive.text.subBab.subChapter.course;

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("FORBIDDEN_REORDER_MATCHING_ITEM");
      }

      /**
       * 4️⃣ Bangun SLOT berdasarkan orderNumber lama
       */
      const slotMap = new Map<number, any>();

      for (const item of question.items) {
        if (item.side === "LEFT" && item.matchWithId) {
          const right = question.items.find((i) => i.id === item.matchWithId);
          if (right) {
            slotMap.set(item.orderNumber, {
              type: "PAIR",
              left: item,
              right,
            });
          }
        }
      }

      for (const item of question.items) {
        const alreadyInPair = Array.from(slotMap.values()).some(
          (s: any) => s.left?.id === item.id || s.right?.id === item.id
        );

        if (!alreadyInPair) {
          slotMap.set(item.orderNumber, {
            type: "SOLO",
            item,
          });
        }
      }

      /**
       * 5️⃣ Slot list terurut
       */
      const slots = Array.from(slotMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, v]) => v);

      /**
       * 6️⃣ Ambil slot pasangan yang dipindah
       */
      const move = payload.orders[0];
      const targetIndex = move.orderNumber - 1;

      const moveIndex = slots.findIndex((s: any) =>
        payload.side === "LEFT"
          ? s.left?.id === move.itemId
          : s.right?.id === move.itemId
      );

      if (moveIndex === -1) {
        return true;
      }

      const [movedSlot] = slots.splice(moveIndex, 1);
      slots.splice(targetIndex, 0, movedSlot);

      /**
       * 7️⃣ Assign ulang orderNumber GLOBAL (PAIR & SOLO)
       */
      let currentOrder = 1;

      for (const slot of slots) {
        if (slot.type === "PAIR") {
          await tx.eLearningMatchingItem.update({
            where: { id: slot.left.id },
            data: { orderNumber: currentOrder },
          });

          await tx.eLearningMatchingItem.update({
            where: { id: slot.right.id },
            data: { orderNumber: currentOrder },
          });
        } else {
          await tx.eLearningMatchingItem.update({
            where: { id: slot.item.id },
            data: { orderNumber: currentOrder },
          });
        }

        currentOrder++;
      }

      return true;
    });
  }

  static async setCorrectPairs(
    questionId: string,
    pairs: { leftId: string; rightId: string }[],
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil matching question + relasi sampai course
       */
      const question = await tx.eLearningMatchingQuestion.findUnique({
        where: { id: questionId },
        include: {
          items: true,
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

      if (!question) {
        throw new Error("MATCHING_QUESTION_NOT_FOUND");
      }

      /**
       * 2️⃣ Validasi tipe interactive
       */
      if (question.interactive.type !== "MATCHING") {
        throw new Error("INTERACTIVE_NOT_MATCHING_TYPE");
      }

      /**
       * 3️⃣ Validasi akses mentor
       */
      const course = question.interactive.text.subBab.subChapter.course;

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("FORBIDDEN_SET_MATCHING_ANSWER");
      }

      /**
       * 4️⃣ Validasi subscription mentee
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
          throw new Error("Akses ditolak: subscription tidak aktif");
        }
      }

      /**
       * 5️⃣ Validasi item LEFT & RIGHT
       */
      const leftItems = question.items.filter((i) => i.side === "LEFT");
      const rightItems = question.items.filter((i) => i.side === "RIGHT");

      const leftMap = new Map(leftItems.map((i) => [i.id, i]));
      const rightMap = new Map(rightItems.map((i) => [i.id, i]));

      const rightToLeft = new Map<string, string>();
      const leftToRight = new Map<string, string>();

      for (const item of leftItems) {
        if (item.matchWithId) {
          leftToRight.set(item.id, item.matchWithId);
          rightToLeft.set(item.matchWithId, item.id);
        }
      }

      const usedRightIds = new Set<string>();

      for (const pair of pairs) {
        if (!leftMap.has(pair.leftId)) {
          throw new Error("LEFT_ITEM_NOT_FOUND");
        }

        if (!rightMap.has(pair.rightId)) {
          throw new Error("RIGHT_ITEM_NOT_FOUND");
        }

        if (pair.leftId === pair.rightId) {
          throw new Error("INVALID_SELF_MATCH");
        }

        if (usedRightIds.has(pair.rightId)) {
          throw new Error("RIGHT_ITEM_DUPLICATE_PAIR");
        }

        usedRightIds.add(pair.rightId);
      }

      /**
       * 6️⃣ PROSES PAIRING + AUTO SWAP
       */
      for (const { leftId, rightId } of pairs) {
        const newLeft = leftMap.get(leftId)!;
        const newRight = rightMap.get(rightId)!;

        const oldLeftOfRight = rightToLeft.get(rightId);
        const oldRightOfLeft = leftToRight.get(leftId);

        // 🔁 Jika RIGHT sudah dipakai LEFT lain → swap
        if (oldLeftOfRight && oldLeftOfRight !== leftId) {
          const swapLeft = leftMap.get(oldLeftOfRight)!;

          // swapLeft → oldRightOfLeft
          if (oldRightOfLeft) {
            await tx.eLearningMatchingItem.update({
              where: { id: swapLeft.id },
              data: {
                matchWithId: oldRightOfLeft,
              },
            });

            await tx.eLearningMatchingItem.update({
              where: { id: oldRightOfLeft },
              data: {
                orderNumber: swapLeft.orderNumber,
              },
            });
          } else {
            await tx.eLearningMatchingItem.update({
              where: { id: swapLeft.id },
              data: { matchWithId: null },
            });
          }
        }

        // newLeft → newRight
        await tx.eLearningMatchingItem.update({
          where: { id: newLeft.id },
          data: {
            matchWithId: newRight.id,
          },
        });

        // RIGHT order mengikuti LEFT
        await tx.eLearningMatchingItem.update({
          where: { id: newRight.id },
          data: {
            orderNumber: newLeft.orderNumber,
          },
        });
      }

      return true;
    });
  }

  static async getMatchingForPlay(
    interactiveId: string,
    query: {
      sort?: string;
      order?: "asc" | "desc";
      limit?: number;
      offset?: number;
    },
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    const sortField = query.sort ?? "orderNumber";
    const sortOrder = query.order ?? "asc";

    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil interactive + matching + course
       */
      const interactive = await tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
        include: {
          matching: {
            include: {
              items: {
                orderBy: {
                  [sortField]: sortOrder,
                },
                take: query.limit,
                skip: query.offset,
              },
            },
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

      if (interactive.type !== "MATCHING") {
        throw new Error("INTERACTIVE_NOT_MATCHING_TYPE");
      }

      if (!interactive.matching) {
        throw new Error("MATCHING_QUESTION_NOT_FOUND");
      }

      /**
       * 2️⃣ Validasi akses mentor
       */
      const course = interactive.text.subBab.subChapter.course;

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("FORBIDDEN_ACCESS_MATCHING_PLAY");
      }

      /**
       * 3️⃣ Validasi subscription mentee
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
          throw new Error("FORBIDDEN_SUBSCRIPTION_INACTIVE");
        }
      }

      /**
       * 4️⃣ Pisahkan LEFT & RIGHT
       */
      const leftItems = interactive.matching.items
        .filter((i) => i.side === "LEFT")
        .map((i) => ({
          id: i.id,
          content: i.content,
          orderNumber: i.orderNumber,
          ...(user.roles.includes("mentee")
            ? {}
            : { matchWithId: i.matchWithId }),
        }));

      const rightItems = interactive.matching.items
        .filter((i) => i.side === "RIGHT")
        .map((i) => ({
          id: i.id,
          content: i.content,
          orderNumber: i.orderNumber,
        }));

      /**
       * 5️⃣ Response akhir
       */
      return {
        question: {
          id: interactive.matching.id,
          title: interactive.matching.title,
          instruction: interactive.matching.instruction,
          maxScore: interactive.matching.maxScore,
        },
        leftItems,
        rightItems,
      };
    });
  }

  static async getMatchingItemsForEditor(
    questionId: string,
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    /**
     * 1️⃣ Ambil matching question + interactive + course
     */
    const question = await prisma.eLearningMatchingQuestion.findUnique({
      where: { id: questionId },
      include: {
        items: {
          orderBy: [
            { side: "asc" }, // LEFT dulu
            { orderNumber: "asc" },
          ],
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

    if (!question) {
      throw new Error("MATCHING_QUESTION_NOT_FOUND");
    }

    /**
     * 2️⃣ Validasi tipe interactive
     */
    if (question.interactive.type !== "MATCHING") {
      throw new Error("INTERACTIVE_NOT_MATCHING");
    }

    /**
     * 3️⃣ Validasi akses mentor
     */
    const course = question.interactive.text.subBab.subChapter.course;

    if (
      user.roles.includes("mentor") &&
      user.mentorProfileId !== course.mentorId
    ) {
      throw new Error("FORBIDDEN_ACCESS_MATCHING_ITEMS");
    }

    /**
     * 4️⃣ Mapping response editor-friendly
     */
    const items = question.items.map((item) => ({
      id: item.id,
      content: item.content,
      side: item.side,
      orderNumber: item.orderNumber,
      matchWithId: item.matchWithId,
    }));

    /**
     * 5️⃣ Metadata tambahan (UX helper)
     */
    const leftItems = items.filter((i) => i.side === "LEFT");
    const rightItems = items.filter((i) => i.side === "RIGHT");

    const unpairedLeft = leftItems.filter((l) => !l.matchWithId);

    return {
      question: {
        id: question.id,
        title: question.title,
        instruction: question.instruction,
        maxScore: question.maxScore,
      },
      items,
      meta: {
        totalLeft: leftItems.length,
        totalRight: rightItems.length,
        isFullyPaired:
          unpairedLeft.length === 0 && leftItems.length === rightItems.length,
        unpairedLeftIds: unpairedLeft.map((l) => l.id),
      },
    };
  }
}
