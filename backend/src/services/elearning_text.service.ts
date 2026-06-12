import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";
import { randomBytes } from "crypto";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";

import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

type BlockContentInput =
  | {
      type: "heading";
      level: 1 | 2 | 3 | 4 | 5 | 6;
      text: string;
      orderNumber?: number;
    }
  | { type: "paragraph"; text: string; orderNumber?: number }
  | { type: "highlight"; text: string; orderNumber?: number }
  | {
      type: "accordion";
      title: string;
      description?: string;
      orderNumber?: number;
      items: { title: string; content: string; orderNumber: number }[];
    }
  | {
      type: "carousel";
      title: string;
      description?: string;
      cardsPerSlide?: number;
      orderNumber?: number;
      items: {
        title: string;
        image?: string;
        content?: string;
        orderNumber: number;
      }[];
    }
  | {
      type: "content_card";
      title: string;
      description?: string;
      disableExpandableContent: boolean;
      orderNumber?: number;
      items: {
        title: string;
        content: string;
        expandableContent?: string;
        orderNumber: number;
      }[];
    }
  | {
      type: "tab_navigation";
      title: string;
      description?: string;
      orderNumber?: number;
      tabs: { title: string; content: string; orderNumber: number }[];
    }
  | { type: "summary"; orderNumber?: number; comments: string[] };

type AdditionalContentInput =
  | {
      type: "image_video";
      position: "BEFORE" | "AFTER" | "INLINE";
      orderNumber?: number;
      isNewUpload: boolean;
      content: {
        url?: string;
        title?: string;
        caption?: string;
        description?: string;
        mediaType: "IMAGE" | "VIDEO";
        thumbnailUrl?: string;
        durationSeconds?: number;
      };
    }
  | {
      type: "multiple_choice";
      position: "BEFORE" | "AFTER" | "INLINE";
      orderNumber?: number;
      content: {
        question: string;
        description?: string;
        allowMultiple?: boolean;
        explanation?: string;
        options: { content: string; isCorrect: boolean; orderNumber: number }[];
      };
    }
  | {
      type: "matching";
      position: "BEFORE" | "AFTER" | "INLINE";
      orderNumber?: number;
      content: {
        title?: string;
        instruction?: string;
        maxScore?: number;
        explanation?: string;
        items: {
          content: string;
          side: "LEFT" | "RIGHT";
          orderNumber: number;
          matchWithId?: string;
        }[];
      };
    }
  | {
      type: "interactive_code";
      position: "BEFORE" | "AFTER" | "INLINE";
      orderNumber?: number;
      content: {
        title?: string;
        description?: string;
        language: "PYTHON" | "JAVASCRIPT" | "CPP" | "SQL" | "R";
        initialCode: string;
        isEditable?: boolean;
        expectedResult?: string;
      };
    };

type BlockInput = {
  orderNumber: number;
  contents?: BlockContentInput[];
  additionalContents?: AdditionalContentInput[];
};

type QuizInput = {
  title: string;
  description?: string;
  timeLimitMinutes?: number;
  questions: {
    questionText: string;
    options: string[];
    correctAnswers: string[];
    explanation?: string;
    orderNumber?: number;
  }[];
};

type AssignmentInput = {
  title: string;
  description?: string;
  dueDays?: number;
  instructions: {
    instruction: string;
    orderNumber: number;
  }[];
  supportingFiles: {
    name: string;
    type: "DATASET" | "TEMPLATE" | "REFERENCE";
    isNewUpload: boolean; // ← tambah ini
    url?: string; // ← jadi opsional (wajib hanya jika isNewUpload = false)
    pageCount?: number;
    format?: string;
    sizeKB?: number;
  }[];
};

type UpdateTextInput = {
  title?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  orderNumber?: number;
  blocks?: BlockInput[];
  quiz?: QuizInput;
  assignment?: AssignmentInput;
};

export class ELearningTextService {
  static async getTextsBySubBab(
    subBabId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: "title" | "createdAt" | "orderNumber";
      sortOrder?: "asc" | "desc";
    },
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "orderNumber";
    const sortOrder = query.sortOrder || "asc";
    const search = query.search?.trim();
    const now = new Date();

    // ======================
    // Ambil sub-bab + course + videos
    // ======================
    const subBab = await prisma.eLearningSubBab.findUnique({
      where: { id: subBabId },
      include: {
        subChapter: {
          include: { course: true },
        },
      },
    });

    if (!subBab) {
      throw new Error("Sub-bab tidak ditemukan");
    }

    const course = subBab.subChapter.course;

    // ======================
    // HAK AKSES
    // ======================
    if (
      !user.roles.includes("admin") &&
      !user.roles.includes("cm") &&
      !user.roles.includes("curdev")
    ) {
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("Akses ditolak: Anda bukan mentor dari course ini");
      }

      if (user.roles.includes("mentee")) {
        const activeSubscription = await prisma.eLearningSubscription.findFirst(
          {
            where: {
              userId: user.userId,
              status: { in: ["active", "confirmed", "completed"] },
              startAt: { lte: now },
              endAt: { gt: now },
            },
          },
        );

        if (!activeSubscription) {
          throw new Error(
            "Akses ditolak: Anda tidak memiliki subscription aktif",
          );
        }
      }
    }

    // ======================
    // QUERY TEXT
    // ======================
    const whereCondition: any = {
      subBabId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          {
            blocks: {
              some: {
                content: { contains: search, mode: "insensitive" },
              },
            },
          },
        ],
      }),
    };

    const [total, texts] = await Promise.all([
      prisma.eLearningText.count({ where: whereCondition }),
      prisma.eLearningText.findMany({
        where: whereCondition,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    // ======================
    // BUILD CONTENT TREE
    // ======================
    const formattedTexts = texts.map((text) => {
      const contents: any[] = [];

      // 3️⃣ SORT FINAL
      contents.sort((a, b) => a.order - b.order);

      return {
        id: text.id,
        title: text.title,
        orderNumber: text.orderNumber,
        status: text.status,
        contents,
        updatedAt: text.updatedAt, // ← tambah ini
        createdAt: text.createdAt, // ← opsional, tapi konsisten
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: formattedTexts,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  static async getTextById(
    id: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    const text = await prisma.eLearningText.findUnique({
      where: { id },
      include: {
        subBab: {
          include: {
            subChapter: {
              include: { course: true },
            },
            // ✅ Tambah quiz dan assignment
            quiz: {
              include: {
                questions: { orderBy: { orderNumber: "asc" } },
              },
            },
            assignment: {
              include: {
                instructions: { orderBy: { orderNumber: "asc" } },
                supportingFiles: true,
              },
            },
          },
        },
        // ✅ Tambah blocks dengan semua relasinya
        blocks: {
          orderBy: { orderNumber: "asc" },
          include: {
            contentBlocks: {
              orderBy: { orderNumber: "asc" },
              include: {
                headingContent: true,
                paragraphContent: true,
                highlightContent: true,
                accordionContent: {
                  include: { items: { orderBy: { orderNumber: "asc" } } },
                },
                carouselContent: {
                  include: { items: { orderBy: { orderNumber: "asc" } } },
                },
                contentCardContent: {
                  include: { items: { orderBy: { orderNumber: "asc" } } },
                },
                tabContent: {
                  include: { tabs: { orderBy: { orderNumber: "asc" } } },
                },
                summaryContent: {
                  include: { comments: { orderBy: { orderNumber: "asc" } } },
                },
              },
            },
            additionalContents: {
              orderBy: { orderNumber: "asc" },
              include: {
                video: true,
                multipleChoice: {
                  include: { options: { orderBy: { orderNumber: "asc" } } },
                },
                matching: {
                  include: { items: { orderBy: { orderNumber: "asc" } } },
                },
                code: true,
              },
            },
          },
        },
      },
    });

    if (!text) throw new Error("Teks tidak ditemukan");

    const course = text.subBab.subChapter.course;

    // ── Akses kontrol (tidak diubah) ────────────────────────────────────────
    const isAdminLike = ["admin", "cm", "curdev"].some((role) =>
      user.roles.includes(role),
    );

    if (!isAdminLike) {
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("Akses ditolak: Anda bukan mentor dari course ini");
      }

      if (user.roles.includes("mentee")) {
        const now = new Date();
        const activeSubscription = await prisma.eLearningSubscription.findFirst(
          {
            where: {
              userId: user.userId,
              status: { in: ["active", "confirmed", "completed"] },
              startAt: { lte: now },
              endAt: { gt: now },
            },
            orderBy: { endAt: "desc" },
          },
        );

        if (!activeSubscription) {
          throw new Error(
            "Akses ditolak: Anda tidak memiliki subscription aktif",
          );
        }
      }
    }

    // ── Build blocks untuk frontend ─────────────────────────────────────────
    const blocks = (text.blocks ?? []).map((block) => ({
      orderNumber: block.orderNumber,
      contents: (block.contentBlocks ?? []).map((cb) => {
        const base = { orderNumber: cb.orderNumber };
        switch (cb.type) {
          case "HEADING":
            return {
              ...base,
              type: "heading",
              level: cb.headingContent?.level,
              text: cb.headingContent?.text ?? "",
            };
          case "PARAGRAPH":
            return {
              ...base,
              type: "paragraph",
              text: cb.paragraphContent?.text ?? "",
            };
          case "HIGHLIGHT":
            return {
              ...base,
              type: "highlight",
              text: cb.highlightContent?.text ?? "",
            };
          case "ACCORDION":
            return {
              ...base,
              type: "accordion",
              title: cb.accordionContent?.title ?? "",
              description: cb.accordionContent?.description,
              items: (cb.accordionContent?.items ?? []).map((i) => ({
                title: i.title,
                content: i.content,
                orderNumber: i.orderNumber,
              })),
            };
          case "CAROUSEL":
            return {
              ...base,
              type: "carousel",
              title: cb.carouselContent?.title ?? "",
              description: cb.carouselContent?.description,
              cardsPerSlide: cb.carouselContent?.cardsPerSlide,
              items: (cb.carouselContent?.items ?? []).map((i) => ({
                title: i.title,
                image: i.image,
                content: i.content,
                orderNumber: i.orderNumber,
              })),
            };
          case "CONTENT_CARD":
            return {
              ...base,
              type: "content_card",
              title: cb.contentCardContent?.title ?? "",
              description: cb.contentCardContent?.description,
              disableExpandableContent:
                cb.contentCardContent?.disableExpandableContent ?? false,
              items: (cb.contentCardContent?.items ?? []).map((i) => ({
                title: i.title,
                content: i.content,
                expandableContent: i.expandableContent,
                orderNumber: i.orderNumber,
              })),
            };
          case "TAB_NAVIGATION":
            return {
              ...base,
              type: "tab_navigation",
              title: cb.tabContent?.title ?? "",
              description: cb.tabContent?.description,
              tabs: (cb.tabContent?.tabs ?? []).map((t) => ({
                title: t.title,
                content: t.content,
                orderNumber: t.orderNumber,
              })),
            };
          case "SUMMARY":
            return {
              ...base,
              type: "summary",
              comments: (cb.summaryContent?.comments ?? []).map(
                (c) => c.comment,
              ),
            };
          default:
            return { ...base, type: (cb.type as string).toLowerCase() };
        }
      }),
      additionalContents: (block.additionalContents ?? []).map((ac) => {
        const base = { orderNumber: ac.orderNumber, position: ac.position };
        switch (ac.type) {
          case "IMAGE_VIDEO":
            return {
              ...base,
              type: "image_video",
              isNewUpload: false,
              content: {
                url: ac.video?.url,
                title: ac.video?.title,
                caption: ac.video?.caption,
                description: ac.video?.description,
                mediaType: ac.video?.mediaType,
                thumbnailUrl: ac.video?.thumbnailUrl,
                durationSeconds: ac.video?.durationSeconds,
              },
            };
          case "MULTIPLE_CHOICE":
            return {
              ...base,
              type: "multiple_choice",
              content: {
                question: ac.multipleChoice?.question ?? "",
                description: ac.multipleChoice?.description,
                allowMultiple: ac.multipleChoice?.allowMultiple,
                explanation: ac.multipleChoice?.explanation,
                options: (ac.multipleChoice?.options ?? []).map((o) => ({
                  content: o.content,
                  isCorrect: o.isCorrect,
                  orderNumber: o.orderNumber,
                })),
              },
            };
          case "MATCHING":
            return {
              ...base,
              type: "matching",
              content: {
                title: ac.matching?.title,
                instruction: ac.matching?.instruction,
                maxScore: ac.matching?.maxScore,
                explanation: ac.matching?.explanation,
                items: (ac.matching?.items ?? []).map((i) => ({
                  content: i.content,
                  side: i.side,
                  orderNumber: i.orderNumber,
                  matchWithId: i.matchWithId,
                })),
              },
            };
          case "INTERACTIVE_CODE":
            return {
              ...base,
              type: "interactive_code",
              content: {
                title: ac.code?.title,
                description: ac.code?.description,
                language: ac.code?.language,
                initialCode: ac.code?.initialCode ?? "",
                isEditable: ac.code?.isEditable,
                expectedResult: ac.code?.expectedResult,
              },
            };
          default:
            return { ...base, type: (ac.type as string).toLowerCase() };
        }
      }),
    }));

    return {
      id: text.id,
      title: text.title,
      status: text.status,
      orderNumber: text.orderNumber,
      createdAt: text.createdAt,
      updatedAt: text.updatedAt,
      // ✅ blocks terstruktur untuk dikonsumsi mapMaterialToCanvasItems
      blocks,
      subBab: {
        id: text.subBab.id,
        title: text.subBab.title,
        // ✅ quiz dan assignment untuk canvas restore
        quiz: text.subBab.quiz,
        assignment: text.subBab.assignment,
      },
      course: {
        id: course.id,
        title: course.title,
      },
    };
  }

  static async createText(
    subBabId: string,
    data: {
      title?: string;
      status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
      blocks?: BlockInput[]; // ← pakai BlockInput yang sudah ada, optional
    },
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    return prisma.$transaction(async (tx) => {
      // ======================
      // 1. Validasi blocks
      // ======================
      if (data.blocks && data.blocks.length > 0) {
        const orders = data.blocks.map((b) => b.orderNumber); // ← b.order → b.orderNumber
        const uniqueOrders = new Set(orders);
        if (uniqueOrders.size !== orders.length) {
          throw new Error("Order block harus unik");
        }

        const sortedOrders = [...orders].sort((a, b) => a - b);
        for (let i = 0; i < sortedOrders.length; i++) {
          if (sortedOrders[i] !== i + 1) {
            throw new Error("Order block harus berurutan mulai dari 1");
          }
        }
      }

      // ======================
      // 2. Ambil SubBab + Course
      // ======================
      const subBab = await tx.eLearningSubBab.findUnique({
        where: { id: subBabId },
        include: { subChapter: { include: { course: true } } },
      });

      if (!subBab) {
        throw new Error("Sub-bab tidak ditemukan");
      }

      // ======================
      // 3. Cek akses mentor
      // ======================
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== subBab.subChapter.course.mentorId
      ) {
        throw new Error(
          "Akses ditolak: hanya mentor dari course ini yang bisa menambah teks",
        );
      }

      // ======================
      // 4. Tentukan orderNumber TEXT (AMAN)
      // ======================
      const maxOrder = await tx.eLearningText.aggregate({
        where: { subBabId },
        _max: { orderNumber: true },
      });

      const nextOrder = (maxOrder._max.orderNumber ?? 0) + 1;

      // ======================
      // 5. Generate ID Text (CUSTOM & UNIQUE)
      // ======================
      const textId = `ETXT-${Date.now()}-${randomBytes(3)
        .toString("hex")
        .toUpperCase()}`;

      // ======================
      // 6. Buat text (container)
      // ======================
      const text = await tx.eLearningText.create({
        data: {
          id: textId,
          subBabId,
          title: data.title || null,
          orderNumber: nextOrder,
          status: data.status ?? "PUBLISHED",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // ======================
      // 7. Buat blocks
      // ======================
      await tx.eLearningTextBlock.createMany({
        data: (data.blocks ?? []).map((b) => ({
          textId: text.id,
          orderNumber: b.orderNumber, // ← b.order → b.orderNumber
          createdAt: new Date(),
        })),
      });

      // ======================
      // 8. Return lengkap
      // ======================
      return tx.eLearningText.findUnique({
        where: { id: text.id },
      });
    });
  }

  static async updateText(
    id: string,
    data: UpdateTextInput,
    assignmentFiles: Express.Multer.File[],
    mediaFiles: Express.Multer.File[],
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      // ── 1. Cek keberadaan teks & akses ──────────────────────────────────
      const existing = await tx.eLearningText.findUnique({
        where: { id },
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

      if (!existing) throw new Error("Teks tidak ditemukan");

      const course = existing.subBab.subChapter.course;

      const hasFullAccess =
        user.roles.includes("admin") ||
        user.roles.includes("cm") ||
        user.roles.includes("curdev");

      if (!hasFullAccess) {
        if (
          user.roles.includes("mentor") &&
          user.mentorProfileId !== course.mentorId
        ) {
          throw new Error("Akses ditolak: Anda bukan mentor dari course ini");
        }
      }

      // ── 2. Shift orderNumber (logika lama, tidak diubah) ────────────────
      if (
        data.orderNumber !== undefined &&
        data.orderNumber !== existing.orderNumber
      ) {
        const oldOrder = existing.orderNumber!;
        const newOrder = data.orderNumber;

        const totalTexts = await tx.eLearningText.count({
          where: { subBabId: existing.subBabId },
        });

        if (newOrder < 1 || newOrder > totalTexts) {
          throw new Error("orderNumber tidak valid");
        }

        if (newOrder < oldOrder) {
          await tx.eLearningText.updateMany({
            where: {
              subBabId: existing.subBabId,
              orderNumber: { gte: newOrder, lt: oldOrder },
            },
            data: { orderNumber: { increment: 1 } },
          });
        } else {
          await tx.eLearningText.updateMany({
            where: {
              subBabId: existing.subBabId,
              orderNumber: { gt: oldOrder, lte: newOrder },
            },
            data: { orderNumber: { decrement: 1 } },
          });
        }
      }

      // ── 3. Update field text utama ───────────────────────────────────────
      const { blocks, quiz, assignment, ...scalarData } = data;

      await tx.eLearningText.update({
        where: { id },
        data: { ...scalarData, updatedAt: new Date() },
      });

      // ── 4. Jika blocks dikirim → delete all lama, recreate ──────────────
      if (blocks !== undefined) {
        // Cascade delete: TextBlock → ContentBlock → *Content
        //                          → AdditionalContent → *Content
        await tx.eLearningTextBlock.deleteMany({ where: { textId: id } });

        // Validasi jumlah media yang diupload
        const imageVideoCount = blocks.reduce((total, block) => {
          return (
            total +
            (block.additionalContents ?? []).filter(
              (item) =>
                item.type === "image_video" && item.isNewUpload === true,
            ).length
          );
        }, 0);

        if (mediaFiles.length !== imageVideoCount) {
          throw new Error(
            `Jumlah mediaFiles (${mediaFiles.length}) tidak sesuai jumlah image_video (${imageVideoCount})`,
          );
        }

        let mediaFileIndex = 0;

        for (const block of blocks) {
          const textBlock = await tx.eLearningTextBlock.create({
            data: {
              textId: id,
              orderNumber: block.orderNumber,
            },
          });

          // ── contents ────────────────────────────────────────────────────
          for (const content of block.contents ?? []) {
            const contentBlock = await tx.eLearningContentBlock.create({
              data: {
                blockId: textBlock.id,
                type: content.type.toUpperCase() as any,
                orderNumber: content.orderNumber,
              },
            });

            switch (content.type) {
              case "heading":
                await tx.eLearningHeadingContent.create({
                  data: {
                    contentId: contentBlock.id,
                    level: content.level,
                    text: content.text,
                  },
                });
                break;

              case "paragraph":
                await tx.eLearningParagraphContent.create({
                  data: { contentId: contentBlock.id, text: content.text },
                });
                break;

              case "highlight":
                await tx.eLearningHighlightContent.create({
                  data: { contentId: contentBlock.id, text: content.text },
                });
                break;

              case "accordion": {
                const acc = await tx.eLearningAccordionContent.create({
                  data: {
                    contentId: contentBlock.id,
                    title: content.title,
                    description: content.description,
                  },
                });
                for (const item of content.items) {
                  await tx.eLearningAccordionItem.create({
                    data: {
                      accordionId: acc.id,
                      title: item.title,
                      content: item.content,
                      orderNumber: item.orderNumber,
                    },
                  });
                }
                break;
              }

              case "carousel": {
                const car = await tx.eLearningCarouselContent.create({
                  data: {
                    contentId: contentBlock.id,
                    title: content.title,
                    description: content.description,
                    cardsPerSlide: content.cardsPerSlide,
                  },
                });
                for (const item of content.items) {
                  await tx.eLearningCarouselItem.create({
                    data: {
                      carouselId: car.id,
                      title: item.title,
                      image: item.image,
                      content: item.content,
                      orderNumber: item.orderNumber,
                    },
                  });
                }
                break;
              }

              case "content_card": {
                const card = await tx.eLearningContentCardContent.create({
                  data: {
                    contentId: contentBlock.id,
                    title: content.title,
                    description: content.description,
                    disableExpandableContent: content.disableExpandableContent,
                  },
                });
                for (const item of content.items) {
                  await tx.eLearningContentCardItem.create({
                    data: {
                      cardId: card.id,
                      title: item.title,
                      content: item.content,
                      expandableContent: item.expandableContent,
                      orderNumber: item.orderNumber,
                    },
                  });
                }
                break;
              }

              case "tab_navigation": {
                const tab = await tx.eLearningTabNavigationContent.create({
                  data: {
                    contentId: contentBlock.id,
                    title: content.title,
                    description: content.description,
                  },
                });
                for (const item of content.tabs) {
                  await tx.eLearningTabItem.create({
                    data: {
                      tabId: tab.id,
                      title: item.title,
                      content: item.content,
                      orderNumber: item.orderNumber,
                    },
                  });
                }
                break;
              }

              case "summary": {
                const summary = await tx.eLearningSummaryContent.create({
                  data: { contentId: contentBlock.id },
                });
                for (let i = 0; i < content.comments.length; i++) {
                  await tx.eLearningSummaryComment.create({
                    data: {
                      summaryId: summary.id,
                      comment: content.comments[i],
                      orderNumber: i + 1,
                    },
                  });
                }
                break;
              }
            }
          }

          // ── additionalContents ───────────────────────────────────────────
          for (const additional of block.additionalContents ?? []) {
            const additionalContent =
              await tx.eLearningAdditionalContent.create({
                data: {
                  blockId: textBlock.id,
                  type: additional.type.toUpperCase() as any,
                  position: additional.position,
                  orderNumber: additional.orderNumber,
                },
              });

            switch (additional.type) {
              case "image_video": {
                let finalUrl: string;

                if (additional.isNewUpload) {
                  const uploadedMedia = mediaFiles[mediaFileIndex++];
                  if (!uploadedMedia) {
                    throw new Error(
                      `File media untuk "${additional.content.title}" tidak ditemukan`,
                    );
                  }
                  finalUrl = `/uploads/elearningMediaContents/${uploadedMedia.filename}`;
                } else {
                  if (!additional.content.url) {
                    throw new Error(
                      `url wajib diisi untuk media "${additional.content.title}" yang tidak diupload ulang`,
                    );
                  }
                  finalUrl = additional.content.url;
                }

                await tx.eLearningImageVideoContent.create({
                  data: {
                    additionalContentId: additionalContent.id,
                    url: finalUrl,
                    title: additional.content.title,
                    caption: additional.content.caption,
                    description: additional.content.description,
                    mediaType: additional.content.mediaType,
                    thumbnailUrl: additional.content.thumbnailUrl,
                    durationSeconds: additional.content.durationSeconds,
                  },
                });
                break;
              }

              case "multiple_choice": {
                const mcq = await tx.eLearningMultipleChoiceQuestion.create({
                  data: {
                    additionalContentId: additionalContent.id,
                    question: additional.content.question,
                    description: additional.content.description,
                    allowMultiple: additional.content.allowMultiple ?? false,
                    explanation: additional.content.explanation,
                  },
                });
                for (const opt of additional.content.options) {
                  await tx.eLearningMultipleChoiceOption.create({
                    data: {
                      questionId: mcq.id,
                      content: opt.content,
                      isCorrect: opt.isCorrect,
                      orderNumber: opt.orderNumber,
                    },
                  });
                }
                break;
              }

              case "matching": {
                const matching = await tx.eLearningMatchingQuestion.create({
                  data: {
                    additionalContentId: additionalContent.id,
                    title: additional.content.title,
                    instruction: additional.content.instruction,
                    maxScore: additional.content.maxScore,
                    explanation: additional.content.explanation,
                  },
                });
                // Matching items: matchWithId dari frontend adalah temp ID (string),
                // disimpan apa adanya karena tidak ada relasi FK ke row lain.
                for (const item of additional.content.items) {
                  await tx.eLearningMatchingItem.create({
                    data: {
                      questionId: matching.id,
                      content: item.content,
                      side: item.side,
                      orderNumber: item.orderNumber,
                      matchWithId: item.matchWithId ?? null,
                    },
                  });
                }
                break;
              }

              case "interactive_code":
                await tx.eLearningExecutableCode.create({
                  data: {
                    additionalContentId: additionalContent.id,
                    title: additional.content.title,
                    description: additional.content.description,
                    language: additional.content.language,
                    initialCode: additional.content.initialCode,
                    isEditable: additional.content.isEditable ?? true,
                    expectedResult: additional.content.expectedResult,
                  },
                });
                break;
            }
          }
        }
      }

      if (quiz) {
        const existingQuiz = await tx.eLearningQuiz.findUnique({
          where: {
            subBabId: existing.subBabId,
          },
        });

        if (existingQuiz) {
          await tx.eLearningQuestion.deleteMany({
            where: {
              quizId: existingQuiz.id,
            },
          });

          await tx.eLearningQuiz.update({
            where: {
              id: existingQuiz.id,
            },
            data: {
              title: quiz.title,
              description: quiz.description,
              timeLimitMinutes: quiz.timeLimitMinutes,
              totalQuestions: quiz.questions.length,
              updatedAt: new Date(),
            },
          });

          for (const question of quiz.questions) {
            await tx.eLearningQuestion.create({
              data: {
                quizId: existingQuiz.id,

                questionText: question.questionText,

                options: question.options,

                correctAnswers: question.correctAnswers,

                explanation: question.explanation,

                orderNumber: question.orderNumber,
              },
            });
          }
        } else {
          const newQuiz = await tx.eLearningQuiz.create({
            data: {
              subBabId: existing.subBabId,

              title: quiz.title,

              description: quiz.description,

              totalQuestions: quiz.questions.length,

              timeLimitMinutes: quiz.timeLimitMinutes,
            },
          });

          for (const question of quiz.questions) {
            await tx.eLearningQuestion.create({
              data: {
                quizId: newQuiz.id,

                questionText: question.questionText,

                options: question.options,

                correctAnswers: question.correctAnswers,

                explanation: question.explanation,

                orderNumber: question.orderNumber,
              },
            });
          }
        }
      }

      if (assignment) {
        const assignmentFilesNeeded = (assignment.supportingFiles ?? []).filter(
          (f) => f.isNewUpload,
        ).length;

        if (assignmentFiles.length !== assignmentFilesNeeded) {
          throw new Error(
            `Jumlah assignmentFiles (${assignmentFiles.length}) tidak sesuai jumlah supportingFiles baru (${assignmentFilesNeeded})`,
          );
        }

        // Deklarasi index counter di sini, dipakai di kedua loop (existingAssignment & newAssignment)
        let newFileIndex = 0;

        const existingAssignment = await tx.eLearningAssignment.findUnique({
          where: {
            subBabId: existing.subBabId,
          },
        });

        if (existingAssignment) {
          await tx.eLearningAssignmentInstruction.deleteMany({
            where: {
              assignmentId: existingAssignment.id,
            },
          });

          await tx.eLearningAssignmentSupportingFile.deleteMany({
            where: {
              assignmentId: existingAssignment.id,
            },
          });

          await tx.eLearningAssignment.update({
            where: {
              id: existingAssignment.id,
            },
            data: {
              title: assignment.title,
              description: assignment.description,
              dueDays: assignment.dueDays,
              updatedAt: new Date(),
            },
          });

          for (const instruction of assignment.instructions) {
            await tx.eLearningAssignmentInstruction.create({
              data: {
                assignmentId: existingAssignment.id,

                instruction: instruction.instruction,

                orderNumber: instruction.orderNumber,
              },
            });
          }

          for (const meta of assignment.supportingFiles) {
            let finalUrl: string;
            let finalFormat: string | undefined;
            let finalSizeKB: number | undefined;

            if (meta.isNewUpload) {
              const uploaded = assignmentFiles[newFileIndex++];
              if (!uploaded) {
                throw new Error(
                  `File upload untuk "${meta.name}" tidak ditemukan`,
                );
              }
              finalUrl = `/uploads/elearningAssignments/${uploaded.filename}`;
              finalFormat = path.extname(uploaded.originalname);
              finalSizeKB = Math.ceil(uploaded.size / 1024);
            } else {
              if (!meta.url) {
                throw new Error(
                  `url wajib diisi untuk file "${meta.name}" yang tidak diupload ulang`,
                );
              }
              finalUrl = meta.url;
              finalFormat = meta.format;
              finalSizeKB = meta.sizeKB;
            }

            await tx.eLearningAssignmentSupportingFile.create({
              data: {
                assignmentId: existingAssignment.id, // ← blok existing: pakai ini
                // assignmentId: newAssignment.id,   // ← blok new: pakai ini
                name: meta.name,
                type: meta.type,
                url: finalUrl,
                format: finalFormat,
                sizeKB: finalSizeKB,
                pageCount: meta.pageCount,
              },
            });
          }
        } else {
          const newAssignment = await tx.eLearningAssignment.create({
            data: {
              subBabId: existing.subBabId,

              title: assignment.title,

              description: assignment.description,

              dueDays: assignment.dueDays,
            },
          });

          for (const instruction of assignment.instructions) {
            await tx.eLearningAssignmentInstruction.create({
              data: {
                assignmentId: newAssignment.id,

                instruction: instruction.instruction,

                orderNumber: instruction.orderNumber,
              },
            });
          }

          for (const meta of assignment.supportingFiles) {
            let finalUrl: string;
            let finalFormat: string | undefined;
            let finalSizeKB: number | undefined;

            if (meta.isNewUpload) {
              const uploaded = assignmentFiles[newFileIndex++];
              if (!uploaded) {
                throw new Error(
                  `File upload untuk "${meta.name}" tidak ditemukan`,
                );
              }
              finalUrl = `/uploads/elearningAssignments/${uploaded.filename}`;
              finalFormat = path.extname(uploaded.originalname);
              finalSizeKB = Math.ceil(uploaded.size / 1024);
            } else {
              if (!meta.url) {
                throw new Error(
                  `url wajib diisi untuk file "${meta.name}" yang tidak diupload ulang`,
                );
              }
              finalUrl = meta.url;
              finalFormat = meta.format;
              finalSizeKB = meta.sizeKB;
            }

            await tx.eLearningAssignmentSupportingFile.create({
              data: {
                // assignmentId: existingAssignment.id, // ← blok existing: pakai ini
                assignmentId: newAssignment.id, // ← blok new: pakai ini
                name: meta.name,
                type: meta.type,
                url: finalUrl,
                format: finalFormat,
                sizeKB: finalSizeKB,
                pageCount: meta.pageCount,
              },
            });
          }
        }
      }

      // ── 5. Return text terbaru dengan semua relasinya ───────────────────
      return tx.eLearningText.findUnique({
        where: { id },

        include: {
          subBab: {
            include: {
              quiz: {
                include: {
                  questions: {
                    orderBy: {
                      orderNumber: "asc",
                    },
                  },
                },
              },

              assignment: {
                include: {
                  instructions: {
                    orderBy: {
                      orderNumber: "asc",
                    },
                  },

                  supportingFiles: true,
                },
              },
            },
          },
          blocks: {
            orderBy: { orderNumber: "asc" },
            include: {
              contentBlocks: {
                orderBy: { orderNumber: "asc" },
                include: {
                  headingContent: true,
                  paragraphContent: true,
                  highlightContent: true,
                  accordionContent: {
                    include: { items: { orderBy: { orderNumber: "asc" } } },
                  },
                  carouselContent: {
                    include: { items: { orderBy: { orderNumber: "asc" } } },
                  },
                  contentCardContent: {
                    include: { items: { orderBy: { orderNumber: "asc" } } },
                  },
                  tabContent: {
                    include: { tabs: { orderBy: { orderNumber: "asc" } } },
                  },
                  // highlightContent: true,
                  summaryContent: {
                    include: { comments: { orderBy: { orderNumber: "asc" } } },
                  },
                },
              },
              additionalContents: {
                orderBy: { orderNumber: "asc" },
                include: {
                  video: true,
                  multipleChoice: {
                    include: { options: { orderBy: { orderNumber: "asc" } } },
                  },
                  matching: {
                    include: { items: { orderBy: { orderNumber: "asc" } } },
                  },
                  code: true,
                },
              },
            },
          },
        },
      });
    });
  }

  static async deleteText(textId: string) {
    return prisma.$transaction(async (tx) => {
      const text = await tx.eLearningText.findUnique({
        where: { id: textId },
        select: {
          id: true,
          subBabId: true,
        },
      });

      if (!text) {
        throw new Error("TEXT_NOT_FOUND");
      }

      // Delete text
      // blocks & interactives auto-cascade
      await tx.eLearningText.delete({
        where: { id: textId },
      });

      // Ambil teks lain di subBab yang sama
      const remainingTexts = await tx.eLearningText.findMany({
        where: {
          subBabId: text.subBabId,
          orderNumber: { not: null },
        },
        orderBy: { orderNumber: "asc" },
        select: {
          id: true,
        },
      });

      // Reorder ulang
      for (let i = 0; i < remainingTexts.length; i++) {
        await tx.eLearningText.update({
          where: { id: remainingTexts[i].id },
          data: {
            orderNumber: i + 1,
            updatedAt: new Date(),
          },
        });
      }

      return {
        deletedTextId: textId,
        reorderedCount: remainingTexts.length,
      };
    });
  }

  static async reorderTexts(
    subBabId: string,
    orders: { id: string; orderNumber: number }[],
    user: { userId: string; roles: string[] },
  ) {
    if (!user.roles.includes("admin")) {
      throw new Error("FORBIDDEN");
    }

    return prisma.$transaction(async (tx) => {
      // 1️⃣ Pastikan subBab ada
      const subBab = await tx.eLearningSubBab.findUnique({
        where: { id: subBabId },
        select: { id: true },
      });

      if (!subBab) throw new Error("SUB_BAB_NOT_FOUND");

      // 2️⃣ Ambil semua text di subBab
      const texts = await tx.eLearningText.findMany({
        where: { subBabId },
        select: { id: true },
      });

      if (texts.length !== orders.length) {
        throw new Error("ORDER_COUNT_MISMATCH");
      }

      const validIds = new Set(texts.map((t) => t.id));

      // 3️⃣ Validasi semua id valid
      for (const o of orders) {
        if (!validIds.has(o.id)) {
          throw new Error(`INVALID_TEXT_ID: ${o.id}`);
        }
      }

      // 4️⃣ Validasi duplikasi orderNumber
      const orderSet = new Set(orders.map((o) => o.orderNumber));
      if (orderSet.size !== orders.length) {
        throw new Error("DUPLICATE_ORDER_NUMBER");
      }

      // 5️⃣ Update semua
      await Promise.all(
        orders.map((o) =>
          tx.eLearningText.update({
            where: { id: o.id },
            data: {
              orderNumber: o.orderNumber,
              updatedAt: new Date(),
            },
          }),
        ),
      );

      // 6️⃣ Return hasil terbaru
      return tx.eLearningText.findMany({
        where: { subBabId },
        orderBy: { orderNumber: "asc" },
      });
    });
  }

  static async searchTexts(query: {
    search?: string;
    subBabId?: string;
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "updatedAt" | "title" | "orderNumber";
    sortOrder?: "asc" | "desc";
  }) {
    const {
      search,
      subBabId,
      page = 1,
      limit = 10000,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          blocks: {
            some: {
              content: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    if (subBabId) {
      whereClause.subBabId = subBabId;
    }

    const total = await prisma.eLearningText.count({
      where: whereClause,
    });

    const texts = await prisma.eLearningText.findMany({
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
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const data = texts.map((text) => {
      const contents: any[] = [];

      contents.sort((a, b) => a.order - b.order);

      return {
        id: text.id,
        title: text.title,
        orderNumber: text.orderNumber,
        createdAt: text.createdAt,
        updatedAt: text.updatedAt,
        contents,
        subBab: {
          id: text.subBab.id,
          title: text.subBab.title,
        },
        course: {
          id: text.subBab.subChapter.course.id,
          title: text.subBab.subChapter.course.title,
        },
      };
    });

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

  static async exportTextsToFile(
    exportFormat: "csv" | "excel",
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const texts = await prisma.eLearningText.findMany({
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
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const rows = texts.map((t) => {
      return {
        ID: t.id,
        SubBabID: t.subBabId,
        SubBabTitle: t.subBab?.title ?? "-",
        SubChapterID: t.subBab?.subChapter?.id ?? "-",
        SubChapterTitle: t.subBab?.subChapter?.title ?? "-",
        CourseID: t.subBab?.subChapter?.course?.id ?? "-",
        CourseTitle: t.subBab?.subChapter?.course?.title ?? "-",
        Title: t.title ?? "-",
        OrderNumber: t.orderNumber ?? "-",
        CreatedAt: format(t.createdAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
        UpdatedAt: format(t.updatedAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
      };
    });

    const randomString = (length: number) =>
      Array.from({ length }, () =>
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(
          Math.floor(Math.random() * 62),
        ),
      ).join("");

    if (exportFormat === "csv") {
      const csv = await parseAsync(rows);
      return {
        buffer: Buffer.from(csv, "utf-8"),
        filename: `elearning_texts_${Date.now()}_${randomString(6)}.csv`,
        mimetype: "text/csv",
      };
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("ELearningTexts");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 30,
    }));

    rows.forEach((row) => worksheet.addRow(row));

    const arrayBuffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(arrayBuffer),
      filename: `elearning_texts_${Date.now()}_${randomString(6)}.xlsx`,
      mimetype:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }
}
