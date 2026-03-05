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

export class ELearningMultipleChoiceService {
  static async create(
    interactiveId: string,
    data: {
      question: string;
      allowMultiple?: boolean;
      maxScore?: number;
      options?: {
        content: string;
        isCorrect: boolean;
        orderNumber?: number;
      }[];
    },
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        /**
         * 1️⃣ Ambil interactive + course
         */
        const interactive = await tx.eLearningTextInteractive.findUnique({
          where: { id: interactiveId },
          include: {
            multipleChoice: true,
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

        if (!interactive) {
          throw new Error("INTERACTIVE_NOT_FOUND");
        }

        /**
         * 2️⃣ Validasi tipe
         */
        if (interactive.type !== ELearningInteractiveType.MULTIPLE_CHOICE) {
          throw new Error("INTERACTIVE_NOT_MULTIPLE_CHOICE");
        }

        /**
         * 3️⃣ Cegah duplikat
         */
        if (interactive.multipleChoice) {
          throw new Error("MULTIPLE_CHOICE_ALREADY_EXISTS");
        }

        /**
         * 4️⃣ Validasi akses mentor
         */
        const course = interactive.text.subBab.subChapter.course;

        if (
          user.roles.includes("mentor") &&
          user.mentorProfileId !== course.mentorId
        ) {
          throw new Error("FORBIDDEN_CREATE_MULTIPLE_CHOICE");
        }

        /**
         * 5️⃣ Validasi options (jika ada)
         */
        if (data.options?.length) {
          const correctCount = data.options.filter((o) => o.isCorrect).length;

          if (correctCount === 0) {
            throw new Error("AT_LEAST_ONE_CORRECT_OPTION_REQUIRED");
          }

          if (!data.allowMultiple && correctCount > 1) {
            throw new Error("ONLY_ONE_CORRECT_OPTION_ALLOWED");
          }
        }

        /**
         * 6️⃣ Generate ID
         */
        const questionId = `EMultiChoiQue_${nanoid(10)}`;

        /**
         * 7️⃣ Create question
         */
        const question = await tx.eLearningMultipleChoiceQuestion.create({
          data: {
            id: questionId,
            interactiveId,
            question: data.question,
            allowMultiple: data.allowMultiple ?? false,
            maxScore: data.maxScore ?? 100,
          },
        });

        /**
         * 8️⃣ Create options (optional)
         */
        if (data.options?.length) {
          await tx.eLearningMultipleChoiceOption.createMany({
            data: data.options.map((opt, index) => ({
              id: `EMCOptions_${nanoid(10)}`,
              questionId: question.id,
              content: opt.content,
              isCorrect: opt.isCorrect,
              orderNumber: opt.orderNumber ?? index + 1,
            })),
          });
        }

        return question;
      });
    } catch (err: any) {
      if (err.code === "P2002") {
        throw new Error("MULTIPLE_CHOICE_ALREADY_EXISTS");
      }
      throw err;
    }
  }

  static async getByInteractive(
    interactiveId: string,
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil interactive + question + options + course
       */
      const interactive = await tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
        include: {
          multipleChoice: {
            include: {
              options: {
                orderBy: { orderNumber: "asc" },
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

      /**
       * 2️⃣ Validasi tipe
       */
      if (interactive.type !== ELearningInteractiveType.MULTIPLE_CHOICE) {
        throw new Error("INTERACTIVE_NOT_MULTIPLE_CHOICE");
      }

      /**
       * 3️⃣ Pastikan question ada
       */
      if (!interactive.multipleChoice) {
        throw new Error("MULTIPLE_CHOICE_NOT_FOUND");
      }

      const course = interactive.text.subBab.subChapter.course;

      /**
       * 4️⃣ Validasi akses
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
       * 5️⃣ Sanitasi response untuk mentee
       */
      if (user.roles.includes("mentee")) {
        return {
          ...interactive.multipleChoice,
          options: interactive.multipleChoice.options.map(
            ({ isCorrect, ...opt }) => opt
          ),
        };
      }

      /**
       * 6️⃣ Admin & Mentor → full data
       */
      return interactive.multipleChoice;
    });
  }

  static async update(
    interactiveId: string,
    data: {
      question?: string;
      allowMultiple?: boolean;
      maxScore?: number;
    },
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil interactive + question + course + attempts
       */
      const interactive = await tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
        include: {
          multipleChoice: {
            include: {
              options: true,
            },
          },
          attempts: {
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

      /**
       * 2️⃣ Validasi tipe
       */
      if (interactive.type !== ELearningInteractiveType.MULTIPLE_CHOICE) {
        throw new Error("INTERACTIVE_NOT_MULTIPLE_CHOICE");
      }

      /**
       * 3️⃣ Pastikan question ada
       */
      if (!interactive.multipleChoice) {
        throw new Error("MULTIPLE_CHOICE_NOT_FOUND");
      }

      /**
       * 4️⃣ Validasi akses mentor
       */
      const course = interactive.text.subBab.subChapter.course;

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("FORBIDDEN_UPDATE_MULTIPLE_CHOICE");
      }

      /**
       * 5️⃣ Cegah perubahan allowMultiple jika sudah ada attempt
       */
      if (
        data.allowMultiple !== undefined &&
        interactive.attempts.length > 0 &&
        data.allowMultiple !== interactive.multipleChoice.allowMultiple
      ) {
        throw new Error("CONFLICT_CANNOT_CHANGE_ALLOW_MULTIPLE_AFTER_ATTEMPT");
      }

      /**
       * 6️⃣ RAPALKAN OPTION JIKA allowMultiple TRUE → FALSE
       */
      if (
        data.allowMultiple === false &&
        interactive.multipleChoice.allowMultiple === true
      ) {
        const correctOptions = interactive.multipleChoice.options.filter(
          (opt) => opt.isCorrect
        );

        if (correctOptions.length > 1) {
          // pilih option dengan orderNumber terkecil
          const optionToKeep = correctOptions.sort(
            (a, b) => a.orderNumber - b.orderNumber
          )[0];

          // set semua option lain jadi false
          await tx.eLearningMultipleChoiceOption.updateMany({
            where: {
              questionId: interactive.multipleChoice.id,
              id: { not: optionToKeep.id },
            },
            data: {
              isCorrect: false,
            },
          });
        }
      }

      /**
       * 7️⃣ Update question
       */
      const updatedQuestion = await tx.eLearningMultipleChoiceQuestion.update({
        where: {
          interactiveId,
        },
        data: {
          question: data.question,
          allowMultiple: data.allowMultiple,
          maxScore: data.maxScore,
        },
      });

      return updatedQuestion;
    });
  }

  static async delete(interactiveId: string) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil interactive + question + attempt + answers
       */
      const interactive = await tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
        include: {
          multipleChoice: true,
          attempts: {
            take: 1, // cukup tahu ada attempt atau tidak
          },
          answers: {
            take: 1, // cek jawaban user
          },
        },
      });

      if (!interactive) {
        throw new Error("INTERACTIVE_NOT_FOUND");
      }

      /**
       * 2️⃣ Validasi tipe
       */
      if (interactive.type !== ELearningInteractiveType.MULTIPLE_CHOICE) {
        throw new Error("INTERACTIVE_NOT_MULTIPLE_CHOICE");
      }

      /**
       * 3️⃣ Pastikan question ada
       */
      if (!interactive.multipleChoice) {
        throw new Error("MULTIPLE_CHOICE_NOT_FOUND");
      }

      /**
       * 4️⃣ Cegah penghapusan jika sudah ada attempt / answer
       */
      if (interactive.attempts.length > 0 || interactive.answers.length > 0) {
        throw new Error("CONFLICT_CANNOT_DELETE_MULTIPLE_CHOICE_WITH_ATTEMPTS");
      }

      /**
       * 5️⃣ Delete question
       * - options akan terhapus otomatis (cascade)
       */
      await tx.eLearningMultipleChoiceQuestion.delete({
        where: {
          interactiveId,
        },
      });

      return true;
    });
  }

  static async head(
    interactiveId: string,
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil interactive + MC + course
       */
      const interactive = await tx.eLearningTextInteractive.findUnique({
        where: { id: interactiveId },
        include: {
          multipleChoice: true,
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
      if (interactive.type !== ELearningInteractiveType.MULTIPLE_CHOICE) {
        throw new Error("INTERACTIVE_NOT_MULTIPLE_CHOICE");
      }

      /**
       * 3️⃣ Validasi akses mentor
       */
      const course = interactive.text.subBab.subChapter.course;

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("FORBIDDEN_HEAD_MULTIPLE_CHOICE");
      }

      /**
       * 4️⃣ Cek keberadaan question
       */
      if (!interactive.multipleChoice) {
        throw new Error("MULTIPLE_CHOICE_NOT_FOUND");
      }

      /**
       * 5️⃣ Jika lolos semua → return true
       */
      return true;
    });
  }

  static async createOptionForQuestion(
    questionId: string,
    data: {
      content: string;
      isCorrect: boolean;
      orderNumber?: number;
    },
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil question + interactive + course + existing options
       */
      const question = await tx.eLearningMultipleChoiceQuestion.findUnique({
        where: { id: questionId },
        include: {
          options: { orderBy: { orderNumber: "asc" } },
          interactive: {
            include: {
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
          },
        },
      });

      if (!question) {
        throw new Error("QUESTION_NOT_FOUND");
      }

      /**
       * 2️⃣ Validasi akses mentor
       */
      const course = question.interactive.text.subBab.subChapter.course;

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("FORBIDDEN_CREATE_OPTION");
      }

      /**
       * 3️⃣ Validasi jawaban benar
       */
      const existingCorrectCount = question.options.filter(
        (opt) => opt.isCorrect
      ).length;

      if (
        !question.allowMultiple &&
        data.isCorrect &&
        existingCorrectCount >= 1
      ) {
        throw new Error("ONLY_ONE_CORRECT_OPTION_ALLOWED");
      }

      /**
       * 4️⃣ Tentukan orderNumber
       */
      const existingOrderNumbers = question.options.map(
        (opt) => opt.orderNumber
      );

      let finalOrderNumber: number;

      if (data.orderNumber) {
        if (existingOrderNumbers.includes(data.orderNumber)) {
          throw new Error("ORDER_NUMBER_CONFLICT");
        }

        const expectedNext =
          existingOrderNumbers.length === 0
            ? 1
            : Math.max(...existingOrderNumbers) + 1;

        if (data.orderNumber !== expectedNext) {
          throw new Error("ORDER_NUMBER_MUST_BE_SEQUENTIAL");
        }

        finalOrderNumber = data.orderNumber;
      } else {
        finalOrderNumber =
          existingOrderNumbers.length === 0
            ? 1
            : Math.max(...existingOrderNumbers) + 1;
      }

      /**
       * 5️⃣ Generate ID option
       */
      const optionId = `EMCOptions_${nanoid(10)}`;

      /**
       * 6️⃣ Create option
       */
      const createdOption = await tx.eLearningMultipleChoiceOption.create({
        data: {
          id: optionId,
          questionId: question.id,
          content: data.content,
          isCorrect: data.isCorrect,
          orderNumber: finalOrderNumber,
        },
      });

      return createdOption;
    });
  }

  static async updateOption(
    optionId: string,
    data: {
      content?: string;
      isCorrect?: boolean;
      orderNumber?: number;
    },
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil option + relasi sampai course
       */
      const existingOption = await tx.eLearningMultipleChoiceOption.findUnique({
        where: { id: optionId },
        include: {
          question: {
            include: {
              options: true,
              interactive: {
                include: {
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
              },
            },
          },
        },
      });

      if (!existingOption) {
        throw new Error("OPTION_NOT_FOUND");
      }

      /**
       * 2️⃣ Validasi akses mentor
       */
      const course =
        existingOption.question.interactive.text.subBab.subChapter.course;

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("FORBIDDEN_UPDATE_OPTION");
      }

      const question = existingOption.question;
      const allOptions = [...question.options];

      /**
       * 3️⃣ Validasi isCorrect
       */
      if (data.isCorrect === true && !question.allowMultiple) {
        const anotherCorrectExists = allOptions.some(
          (opt) => opt.id !== optionId && opt.isCorrect
        );

        if (anotherCorrectExists) {
          throw new Error("ONLY_ONE_CORRECT_OPTION_ALLOWED");
        }
      }

      /**
       * 4️⃣ Handle orderNumber rapi
       */
      if (data.orderNumber && data.orderNumber !== existingOption.orderNumber) {
        const maxOrder = allOptions.length;

        if (data.orderNumber < 1 || data.orderNumber > maxOrder) {
          throw new Error("INVALID_ORDER_NUMBER");
        }

        const reorderedOptions = allOptions
          .filter((opt) => opt.id !== optionId)
          .sort((a, b) => a.orderNumber - b.orderNumber);

        reorderedOptions.splice(data.orderNumber - 1, 0, existingOption);

        for (let i = 0; i < reorderedOptions.length; i++) {
          await tx.eLearningMultipleChoiceOption.update({
            where: { id: reorderedOptions[i].id },
            data: { orderNumber: i + 1 },
          });
        }
      }

      /**
       * 5️⃣ Update option
       */
      const updatedOption = await tx.eLearningMultipleChoiceOption.update({
        where: { id: optionId },
        data: {
          content: data.content ?? undefined,
          isCorrect: data.isCorrect ?? undefined,
        },
      });

      return updatedOption;
    });
  }

  static async deleteOption(
    optionId: string,
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil option + question + interactive + course
       */
      const option = await tx.eLearningMultipleChoiceOption.findUnique({
        where: { id: optionId },
        include: {
          question: {
            include: {
              options: true,
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

      if (!option) {
        throw new Error("OPTION_NOT_FOUND");
      }

      const question = option.question;
      const interactive = question.interactive;
      const course = interactive.text.subBab.subChapter.course;

      /**
       * 2️⃣ Validasi akses mentor
       */
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("FORBIDDEN_DELETE_OPTION");
      }

      /**
       * 3️⃣ Validasi tipe interactive
       */
      if (interactive.type !== ELearningInteractiveType.MULTIPLE_CHOICE) {
        throw new Error("INTERACTIVE_NOT_MULTIPLE_CHOICE");
      }

      const remainingOptions = question.options.filter(
        (o) => o.id !== option.id
      );

      /**
       * 4️⃣ Jaga minimal 1 option
       */
      if (remainingOptions.length === 0) {
        throw new Error("CANNOT_DELETE_LAST_OPTION");
      }

      /**
       * 5️⃣ LOGIKA isCorrect
       */
      if (option.isCorrect) {
        const stillHasCorrect = remainingOptions.some((o) => o.isCorrect);

        if (!stillHasCorrect) {
          // pilih option orderNumber terkecil
          const optionToCorrect = remainingOptions.sort(
            (a, b) => a.orderNumber - b.orderNumber
          )[0];

          await tx.eLearningMultipleChoiceOption.update({
            where: { id: optionToCorrect.id },
            data: { isCorrect: true },
          });
        }
      }

      /**
       * 6️⃣ Hapus option
       */
      await tx.eLearningMultipleChoiceOption.delete({
        where: { id: optionId },
      });

      /**
       * 7️⃣ Rapikan orderNumber
       */
      const updatedOptions = await tx.eLearningMultipleChoiceOption.findMany({
        where: { questionId: question.id },
        orderBy: { orderNumber: "asc" },
      });

      for (let i = 0; i < updatedOptions.length; i++) {
        await tx.eLearningMultipleChoiceOption.update({
          where: { id: updatedOptions[i].id },
          data: { orderNumber: i + 1 },
        });
      }

      return {
        deletedOptionId: optionId,
      };
    });
  }

  static async reorderOptions(
    questionId: string,
    orders: {
      optionId: string;
      orderNumber: number;
    }[],
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil question + options + interactive + course
       */
      const question = await tx.eLearningMultipleChoiceQuestion.findUnique({
        where: { id: questionId },
        include: {
          options: true,
          interactive: {
            include: {
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
          },
        },
      });

      if (!question) {
        throw new Error("QUESTION_NOT_FOUND");
      }

      /**
       * 2️⃣ Validasi tipe interactive
       */
      if (
        question.interactive.type !== ELearningInteractiveType.MULTIPLE_CHOICE
      ) {
        throw new Error("INTERACTIVE_NOT_MULTIPLE_CHOICE");
      }

      /**
       * 3️⃣ Validasi akses mentor
       */
      const course = question.interactive.text.subBab.subChapter.course;

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("FORBIDDEN_REORDER_OPTIONS");
      }

      /**
       * 4️⃣ Validasi payload optionId milik question
       */
      const optionIds = question.options.map((o) => o.id);

      for (const o of orders) {
        if (!optionIds.includes(o.optionId)) {
          throw new Error("INVALID_OPTION_ID");
        }
      }

      /**
       * 5️⃣ Cegah orderNumber duplikat di payload
       */
      const orderNumbers = orders.map((o) => o.orderNumber);
      if (new Set(orderNumbers).size !== orderNumbers.length) {
        throw new Error("DUPLICATE_ORDER_NUMBER");
      }

      /**
       * 6️⃣ Update sementara orderNumber sesuai payload
       */
      for (const o of orders) {
        await tx.eLearningMultipleChoiceOption.update({
          where: { id: o.optionId },
          data: { orderNumber: o.orderNumber },
        });
      }

      /**
       * 7️⃣ Normalisasi orderNumber (1..N)
       */
      const normalized = await tx.eLearningMultipleChoiceOption.findMany({
        where: { questionId },
        orderBy: { orderNumber: "asc" },
      });

      for (let i = 0; i < normalized.length; i++) {
        await tx.eLearningMultipleChoiceOption.update({
          where: { id: normalized[i].id },
          data: { orderNumber: i + 1 },
        });
      }

      return {
        questionId,
        totalOptions: normalized.length,
      };
    });
  }

  static async updateAnswerKey(
    questionId: string,
    correctOptionIds: string[],
    user: {
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil question + options + interactive + course
       */
      const question = await tx.eLearningMultipleChoiceQuestion.findUnique({
        where: { id: questionId },
        include: {
          options: true,
          interactive: {
            include: {
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
          },
        },
      });

      if (!question) {
        throw new Error("QUESTION_NOT_FOUND");
      }

      /**
       * 2️⃣ Validasi tipe interactive
       */
      if (
        question.interactive.type !== ELearningInteractiveType.MULTIPLE_CHOICE
      ) {
        throw new Error("INTERACTIVE_NOT_MULTIPLE_CHOICE");
      }

      /**
       * 3️⃣ Validasi akses mentor
       */
      const course = question.interactive.text.subBab.subChapter.course;

      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("FORBIDDEN_UPDATE_ANSWER_KEY");
      }

      /**
       * 4️⃣ Validasi optionId milik question
       */
      const optionIds = question.options.map((o) => o.id);

      for (const id of correctOptionIds) {
        if (!optionIds.includes(id)) {
          throw new Error("INVALID_OPTION_ID");
        }
      }

      /**
       * 5️⃣ Validasi allowMultiple
       */
      if (!question.allowMultiple && correctOptionIds.length !== 1) {
        throw new Error("ONLY_ONE_CORRECT_OPTION_ALLOWED");
      }

      /**
       * 6️⃣ Reset semua isCorrect → false
       */
      await tx.eLearningMultipleChoiceOption.updateMany({
        where: { questionId },
        data: { isCorrect: false },
      });

      /**
       * 7️⃣ Set jawaban benar sesuai payload
       */
      await tx.eLearningMultipleChoiceOption.updateMany({
        where: {
          id: { in: correctOptionIds },
        },
        data: { isCorrect: true },
      });

      return {
        questionId,
        allowMultiple: question.allowMultiple,
        correctOptionIds,
      };
    });
  }

  static async getByQuestionId(
    questionId: string,
    user: {
      userId?: string;
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil question + options + interactive + course
       */
      const question = await tx.eLearningMultipleChoiceQuestion.findUnique({
        where: { id: questionId },
        include: {
          options: {
            orderBy: { orderNumber: "asc" },
          },
          interactive: {
            include: {
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
          },
        },
      });

      if (!question) {
        throw new Error("MULTIPLE_CHOICE_QUESTION_NOT_FOUND");
      }

      /**
       * 2️⃣ Validasi tipe interactive
       */
      if (
        question.interactive.type !== ELearningInteractiveType.MULTIPLE_CHOICE
      ) {
        throw new Error("INTERACTIVE_NOT_MULTIPLE_CHOICE");
      }

      const course = question.interactive.text.subBab.subChapter.course;

      /**
       * 3️⃣ Validasi akses berdasarkan role
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
       * 4️⃣ Mapping response berdasarkan role
       */
      const isAdminOrMentor =
        user.roles.includes("admin") || user.roles.includes("mentor");

      const options = question.options.map((option) => {
        const baseOption = {
          optionId: option.id,
          optionContent: option.content,
          optionOrderNumber: option.orderNumber,
        };

        if (isAdminOrMentor) {
          return {
            ...baseOption,
            optionIsCorrect: option.isCorrect,
          };
        }

        return baseOption;
      });

      return {
        questionId: question.id,
        questionText: question.question,
        allowMultiple: question.allowMultiple,
        options,
      };
    });
  }

  static async getDetail(
    optionId: string,
    user: {
      userId?: string;
      roles: string[];
      mentorProfileId?: string;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      /**
       * 1️⃣ Ambil option + question + interactive + course
       */
      const option = await tx.eLearningMultipleChoiceOption.findUnique({
        where: { id: optionId },
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
                            include: { course: true },
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

      if (!option) {
        throw new Error("MULTIPLE_CHOICE_OPTION_NOT_FOUND");
      }

      /**
       * 2️⃣ Validasi tipe interactive
       */
      if (
        option.question.interactive.type !==
        ELearningInteractiveType.MULTIPLE_CHOICE
      ) {
        throw new Error("INTERACTIVE_NOT_MULTIPLE_CHOICE");
      }

      const course = option.question.interactive.text.subBab.subChapter.course;

      /**
       * 3️⃣ Validasi akses mentor
       */
      if (user.roles.includes("mentor")) {
        if (user.mentorProfileId !== course.mentorId) {
          throw new Error("FORBIDDEN_MENTOR_ACCESS");
        }
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
          throw new Error("FORBIDDEN_SUBSCRIPTION_REQUIRED");
        }
      }

      /**
       * 5️⃣ Mapping response berdasarkan role
       */
      const isAdminOrMentor =
        user.roles.includes("admin") || user.roles.includes("mentor");

      const baseResponse = {
        optionId: option.id,
        optionContent: option.content,
        optionOrderNumber: option.orderNumber,
        questionId: option.questionId,
      };

      if (isAdminOrMentor) {
        return {
          ...baseResponse,
          optionIsCorrect: option.isCorrect,
        };
      }

      return baseResponse;
    });
  }
}
