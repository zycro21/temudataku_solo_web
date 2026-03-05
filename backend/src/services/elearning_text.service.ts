import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";
import { randomBytes } from "crypto";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";

import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

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
        videos: true,
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
    if (!user.roles.includes("admin")) {
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
        include: {
          blocks: {
            orderBy: { order: "asc" },
            include: {
              anchors: {
                orderBy: { orderNumber: "asc" },
              },
            },
          },
          interactives: {
            include: {
              matching: {
                include: {
                  items: { orderBy: { orderNumber: "asc" } },
                },
              },
              multipleChoice: {
                include: {
                  options: { orderBy: { orderNumber: "asc" } },
                },
              },
            },
          },
          executableCodes: true,
        },
      }),
    ]);

    // ======================
    // BUILD CONTENT TREE
    // ======================
    const formattedTexts = texts.map((text) => {
      const contents: any[] = [];

      for (const block of text.blocks) {
        // 1️⃣ BLOCK TEXT
        contents.push({
          type: "TEXT",
          order: block.order * 1000,
          data: block,
        });

        // 2️⃣ ANCHOR CONTENT (INTERACTIVE / VIDEO / CODE)
        for (const anchor of block.anchors) {
          let data: any = null;

          if (anchor.contentType === "INTERACTIVE") {
            data = text.interactives.find((i) => i.id === anchor.contentId);
          }

          if (anchor.contentType === "CODE") {
            data = text.executableCodes.find((c) => c.id === anchor.contentId);
          }

          if (anchor.contentType === "VIDEO") {
            data = subBab.videos.find((v) => v.id === anchor.contentId);
          }

          if (!data) continue;

          contents.push({
            type: anchor.contentType,
            position: anchor.position,
            order: block.order * 1000 + (anchor.orderNumber ?? 0),
            data,
          });
        }
      }

      // 3️⃣ SORT FINAL
      contents.sort((a, b) => a.order - b.order);

      return {
        id: text.id,
        title: text.title,
        orderNumber: text.orderNumber,
        contents,
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
        blocks: {
          orderBy: { order: "asc" },
          include: {
            anchors: {
              orderBy: { orderNumber: "asc" },
            },
          },
        },
        interactives: {
          include: {
            matching: {
              include: {
                items: { orderBy: { orderNumber: "asc" } },
              },
            },
            multipleChoice: {
              include: {
                options: { orderBy: { orderNumber: "asc" } },
              },
            },
          },
        },
        executableCodes: true,
        subBab: {
          include: {
            videos: true,
            subChapter: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!text) throw new Error("Teks tidak ditemukan");

    const course = text.subBab.subChapter.course;

    // ======================
    // AKSES KONTROL
    // ======================
    if (!user.roles.includes("admin")) {
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

    // ======================
    // BUILD CONTENT TREE
    // ======================
    const contents: any[] = [];

    for (const block of text.blocks) {
      // 1️⃣ TEXT BLOCK SELALU MASUK
      contents.push({
        type: "TEXT",
        order: block.order * 1000,
        data: block, // masih mengandung anchors (aman)
      });

      // 2️⃣ RESOLVE ANCHOR
      for (const anchor of block.anchors) {
        let data: any = null;

        if (anchor.contentType === "INTERACTIVE") {
          data = text.interactives.find((i) => i.id === anchor.contentId);
        }

        if (anchor.contentType === "CODE") {
          data = text.executableCodes.find((c) => c.id === anchor.contentId);
        }

        if (anchor.contentType === "VIDEO") {
          data = text.subBab.videos.find((v) => v.id === anchor.contentId);
        }

        if (!data) continue;

        contents.push({
          type: anchor.contentType,
          position: anchor.position,
          order: block.order * 1000 + (anchor.orderNumber ?? 0),
          data,
        });
      }
    }

    // 3️⃣ SORT FINAL
    contents.sort((a, b) => a.order - b.order);

    // ======================
    // RESPONSE
    // ======================
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
        id: course.id,
        title: course.title,
      },
    };
  }

  static async createText(
    subBabId: string,
    data: { title?: string; blocks: { content: string; order: number }[] },
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    return prisma.$transaction(async (tx) => {
      // ======================
      // 1. Validasi blocks
      // ======================
      if (!data.blocks || data.blocks.length === 0) {
        throw new Error("Minimal harus ada 1 block teks");
      }

      const orders = data.blocks.map((b) => b.order);
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // ======================
      // 7. Buat blocks
      // ======================
      await tx.eLearningTextBlock.createMany({
        data: data.blocks.map((b) => ({
          textId: text.id,
          content: b.content,
          order: b.order,
          createdAt: new Date(),
        })),
      });

      // ======================
      // 8. Return lengkap
      // ======================
      return tx.eLearningText.findUnique({
        where: { id: text.id },
        include: {
          blocks: {
            orderBy: { order: "asc" },
          },
        },
      });
    });
  }

  static async updateText(
    id: string,
    data: { title?: string; orderNumber?: number },
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    return prisma.$transaction(async (tx) => {
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

      // 🔐 Akses
      if (!user.roles.includes("admin")) {
        if (
          user.roles.includes("mentor") &&
          user.mentorProfileId !== course.mentorId
        ) {
          throw new Error("Akses ditolak: Anda bukan mentor dari course ini");
        }
      }

      // ======================
      // 🔁 SHIFT ORDER NUMBER
      // ======================
      if (
        data.orderNumber !== undefined &&
        data.orderNumber !== existing.orderNumber
      ) {
        const oldOrder = existing.orderNumber!;
        const newOrder = data.orderNumber;

        // Ambil total text dalam subBab
        const totalTexts = await tx.eLearningText.count({
          where: { subBabId: existing.subBabId },
        });

        if (newOrder < 1 || newOrder > totalTexts) {
          throw new Error("orderNumber tidak valid");
        }

        if (newOrder < oldOrder) {
          // Geser turun (+1)
          await tx.eLearningText.updateMany({
            where: {
              subBabId: existing.subBabId,
              orderNumber: {
                gte: newOrder,
                lt: oldOrder,
              },
            },
            data: {
              orderNumber: { increment: 1 },
            },
          });
        } else {
          // Geser naik (-1)
          await tx.eLearningText.updateMany({
            where: {
              subBabId: existing.subBabId,
              orderNumber: {
                gt: oldOrder,
                lte: newOrder,
              },
            },
            data: {
              orderNumber: { decrement: 1 },
            },
          });
        }
      }

      // ======================
      // UPDATE TEXT UTAMA
      // ======================
      return tx.eLearningText.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
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
        blocks: {
          orderBy: { order: "asc" },
          include: {
            anchors: true,
          },
        },
        interactives: {
          include: {
            matching: {
              include: { items: true },
            },
            multipleChoice: {
              include: { options: true },
            },
          },
        },
        executableCodes: true,
        subBab: {
          include: {
            videos: true,
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

      /**
       * 1️⃣ TEXT BLOCKS
       */
      for (const block of text.blocks) {
        contents.push({
          type: "TEXT",
          order: block.order * 1000,
          data: {
            id: block.id,
            content: block.content,
            order: block.order,
            anchors: block.anchors,
          },
        });

        /**
         * 2️⃣ ANCHOR CONTENT
         */
        for (const anchor of block.anchors) {
          const baseOrder = block.order * 1000 + (anchor.orderNumber ?? 0);

          // =========================
          // INTERACTIVE
          // =========================
          if (anchor.contentType === "INTERACTIVE") {
            const interactive = text.interactives.find(
              (i) => i.id === anchor.contentId,
            );

            if (interactive) {
              contents.push({
                type: "INTERACTIVE",
                position: anchor.position,
                order: baseOrder,
                data: {
                  id: interactive.id,
                  type: interactive.type,
                  matching: interactive.matching
                    ? {
                        title: interactive.matching.title,
                        instruction: interactive.matching.instruction,
                        maxScore: interactive.matching.maxScore,
                        items: interactive.matching.items
                          .sort((a, b) => a.orderNumber - b.orderNumber)
                          .map((item) => ({
                            id: item.id,
                            content: item.content,
                            side: item.side,
                            matchWithId: item.matchWithId,
                            orderNumber: item.orderNumber,
                          })),
                      }
                    : null,
                  multipleChoice: interactive.multipleChoice
                    ? {
                        question: interactive.multipleChoice.question,
                        allowMultiple: interactive.multipleChoice.allowMultiple,
                        maxScore: interactive.multipleChoice.maxScore,
                        options: interactive.multipleChoice.options
                          .sort((a, b) => a.orderNumber - b.orderNumber)
                          .map((opt) => ({
                            id: opt.id,
                            content: opt.content,
                            isCorrect: opt.isCorrect,
                            orderNumber: opt.orderNumber,
                          })),
                      }
                    : null,
                },
              });
            }
          }

          // =========================
          // VIDEO
          // =========================
          if (anchor.contentType === "VIDEO") {
            const video = text.subBab.videos.find(
              (v) => v.id === anchor.contentId,
            );

            if (video) {
              contents.push({
                type: "VIDEO",
                position: anchor.position,
                order: baseOrder,
                data: {
                  id: video.id,
                  title: video.title,
                  videoUrl: video.videoUrl,
                  durationSeconds: video.durationSeconds,
                  isPreview: video.isPreview,
                },
              });
            }
          }

          // =========================
          // EXECUTABLE CODE
          // =========================
          if (anchor.contentType === "CODE") {
            const code = text.executableCodes.find(
              (c) => c.id === anchor.contentId,
            );

            if (code) {
              contents.push({
                type: "CODE",
                position: anchor.position,
                order: baseOrder,
                data: {
                  id: code.id,
                  title: code.title,
                  description: code.description,
                  language: code.language,
                  initialCode: code.initialCode,
                  isEditable: code.isEditable,
                },
              });
            }
          }
        }
      }

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
        blocks: {
          orderBy: { order: "asc" },
          select: { content: true },
        },
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
      const fullContent =
        t.blocks.length > 0 ? t.blocks.map((b) => b.content).join("\n\n") : "-";

      return {
        ID: t.id,
        SubBabID: t.subBabId,
        SubBabTitle: t.subBab?.title ?? "-",
        SubChapterID: t.subBab?.subChapter?.id ?? "-",
        SubChapterTitle: t.subBab?.subChapter?.title ?? "-",
        CourseID: t.subBab?.subChapter?.course?.id ?? "-",
        CourseTitle: t.subBab?.subChapter?.course?.title ?? "-",
        Title: t.title ?? "-",
        TextContent: fullContent,
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

  static async getBlocksByText(
    textId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    const now = new Date();

    // ======================
    // Ambil text + relasi course
    // ======================
    const text = await prisma.eLearningText.findUnique({
      where: { id: textId },
      include: {
        subBab: {
          include: {
            videos: true,
            subChapter: {
              include: {
                course: true,
              },
            },
          },
        },
        blocks: {
          orderBy: { order: "asc" },
          include: {
            anchors: true,
          },
        },
        interactives: {
          include: {
            matching: {
              include: { items: true },
            },
            multipleChoice: {
              include: { options: true },
            },
          },
        },
        executableCodes: true,
      },
    });

    if (!text) {
      throw new Error("Teks tidak ditemukan");
    }

    const course = text.subBab.subChapter.course;

    // ======================
    // HAK AKSES
    // ======================
    if (!user.roles.includes("admin")) {
      // Mentor
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("Akses ditolak: Anda bukan mentor dari course ini");
      }

      // Mentee → subscription aktif
      if (user.roles.includes("mentee")) {
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

    // ======================
    // BUILD BLOCK + CONTENT
    // ======================
    const result = text.blocks.map((block) => {
      const contents: any[] = [];

      for (const anchor of block.anchors) {
        const order = block.order * 1000 + (anchor.orderNumber ?? 0);

        // ======================
        // INTERACTIVE
        // ======================
        if (anchor.contentType === "INTERACTIVE") {
          const interactive = text.interactives.find(
            (i) => i.id === anchor.contentId,
          );

          if (interactive) {
            contents.push({
              type: "INTERACTIVE",
              position: anchor.position,
              order,
              data: {
                id: interactive.id,
                type: interactive.type,
                matching: interactive.matching
                  ? {
                      title: interactive.matching.title,
                      instruction: interactive.matching.instruction,
                      maxScore: interactive.matching.maxScore,
                      items: interactive.matching.items
                        .sort((a, b) => a.orderNumber - b.orderNumber)
                        .map((item) => ({
                          id: item.id,
                          content: item.content,
                          side: item.side,
                          matchWithId: item.matchWithId,
                          orderNumber: item.orderNumber,
                        })),
                    }
                  : null,
                multipleChoice: interactive.multipleChoice
                  ? {
                      question: interactive.multipleChoice.question,
                      allowMultiple: interactive.multipleChoice.allowMultiple,
                      maxScore: interactive.multipleChoice.maxScore,
                      options: interactive.multipleChoice.options
                        .sort((a, b) => a.orderNumber - b.orderNumber)
                        .map((opt) => ({
                          id: opt.id,
                          content: opt.content,
                          isCorrect: opt.isCorrect,
                          orderNumber: opt.orderNumber,
                        })),
                    }
                  : null,
              },
            });
          }
        }

        // ======================
        // VIDEO
        // ======================
        if (anchor.contentType === "VIDEO") {
          const video = text.subBab.videos.find(
            (v) => v.id === anchor.contentId,
          );

          if (video) {
            contents.push({
              type: "VIDEO",
              position: anchor.position,
              order,
              data: {
                id: video.id,
                title: video.title,
                videoUrl: video.videoUrl,
                durationSeconds: video.durationSeconds,
                isPreview: video.isPreview,
              },
            });
          }
        }

        // ======================
        // EXECUTABLE CODE
        // ======================
        if (anchor.contentType === "CODE") {
          const code = text.executableCodes.find(
            (c) => c.id === anchor.contentId,
          );

          if (code) {
            contents.push({
              type: "CODE",
              position: anchor.position,
              order,
              data: {
                id: code.id,
                title: code.title,
                description: code.description,
                language: code.language,
                initialCode: code.initialCode,
                isEditable: code.isEditable,
              },
            });
          }
        }
      }

      contents.sort((a, b) => a.order - b.order);

      return {
        id: block.id,
        order: block.order,
        content: block.content,
        createdAt: block.createdAt,
        contents,
      };
    });

    return result;
  }

  static async createBlock(
    textId: string,
    content: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    // ======================
    // Ambil text + relasi course
    // ======================
    const text = await prisma.eLearningText.findUnique({
      where: { id: textId },
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

    if (!text) {
      throw new Error("Teks tidak ditemukan");
    }

    const course = text.subBab.subChapter.course;

    // ======================
    // HAK AKSES
    // ======================
    if (!user.roles.includes("admin")) {
      if (
        !user.roles.includes("mentor") ||
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("Akses ditolak: Anda bukan mentor dari course ini");
      }
    }

    // ======================
    // Tentukan order selanjutnya
    // ======================
    const lastBlock = await prisma.eLearningTextBlock.findFirst({
      where: { textId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = lastBlock ? lastBlock.order + 1 : 1;

    // ======================
    // Simpan block
    // ======================
    const newBlock = await prisma.eLearningTextBlock.create({
      data: {
        textId,
        content,
        order: nextOrder,
      },
    });

    return newBlock;
  }

  static async updateBlock(
    blockId: string,
    content: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    // ======================
    // Ambil block + relasi course
    // ======================
    const block = await prisma.eLearningTextBlock.findUnique({
      where: { id: blockId },
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

    if (!block) {
      throw new Error("Block tidak ditemukan");
    }

    const course = block.text.subBab.subChapter.course;

    // ======================
    // HAK AKSES
    // ======================
    if (!user.roles.includes("admin")) {
      // Mentor hanya boleh edit course sendiri
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("Akses ditolak: Anda bukan mentor dari course ini");
      }
    }

    // ======================
    // Update block
    // ======================
    const updatedBlock = await prisma.eLearningTextBlock.update({
      where: { id: blockId },
      data: {
        content,
      },
    });

    return updatedBlock;
  }

  static async deleteBlock(
    blockId: string,
    user: { userId: string; roles: string[] },
  ) {
    // ======================
    // ADMIN ONLY (double safety)
    // ======================
    if (!user.roles.includes("admin")) {
      throw new Error("Akses ditolak: Hanya admin yang dapat menghapus block");
    }

    // ======================
    // Ambil block
    // ======================
    const block = await prisma.eLearningTextBlock.findUnique({
      where: { id: blockId },
    });

    if (!block) {
      throw new Error("Block tidak ditemukan");
    }

    const { textId, order: deletedOrder } = block;

    // ======================
    // TRANSACTION: delete + reorder
    // ======================
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Hapus block
      await tx.eLearningTextBlock.delete({
        where: { id: blockId },
      });

      // 2️⃣ Ambil block setelahnya
      const blocksToReorder = await tx.eLearningTextBlock.findMany({
        where: {
          textId,
          order: { gt: deletedOrder },
        },
        orderBy: { order: "asc" },
      });

      // 3️⃣ Turunkan order satu per satu
      for (const b of blocksToReorder) {
        await tx.eLearningTextBlock.update({
          where: { id: b.id },
          data: {
            order: b.order - 1,
          },
        });
      }
    });

    return {
      deletedBlockId: blockId,
      textId,
    };
  }

  static async reorderBlocks(
    textId: string,
    orders: { blockId: string; order: number }[],
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    // ======================
    // Ambil text + relasi course + blocks
    // ======================
    const text = await prisma.eLearningText.findUnique({
      where: { id: textId },
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
        blocks: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!text) {
      throw new Error("Teks tidak ditemukan");
    }

    const course = text.subBab.subChapter.course;

    // ======================
    // HAK AKSES
    // ======================
    if (!user.roles.includes("admin")) {
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("Akses ditolak: Anda bukan mentor dari course ini");
      }
    }

    if (!orders.length) {
      throw new Error("Order tidak boleh kosong");
    }

    // ======================
    // VALIDASI BLOCK
    // ======================
    const blockMap = new Map(text.blocks.map((b) => [b.id, b]));

    for (const o of orders) {
      if (!blockMap.has(o.blockId)) {
        throw new Error("Block tidak ditemukan atau tidak milik teks ini");
      }
    }

    // ======================
    // SMART REORDER LOGIC
    // ======================
    let orderedBlocks = [...text.blocks];

    for (const { blockId, order } of orders) {
      if (order < 1) {
        throw new Error("Order harus >= 1");
      }

      const currentIndex = orderedBlocks.findIndex((b) => b.id === blockId);

      if (currentIndex === -1) continue;

      // Ambil block
      const [movedBlock] = orderedBlocks.splice(currentIndex, 1);

      // Tentukan target index (clamp)
      const targetIndex = Math.min(
        Math.max(order - 1, 0),
        orderedBlocks.length,
      );

      // Sisipkan
      orderedBlocks.splice(targetIndex, 0, movedBlock);
    }

    // ======================
    // NORMALIZE ORDER (1..n)
    // ======================
    const updates = orderedBlocks.map((block, index) => ({
      id: block.id,
      order: index + 1,
    }));

    // ======================
    // TRANSACTION UPDATE (SAFE)
    // ======================
    await prisma.$transaction(async (tx) => {
      // PHASE 1: set temporary order (negatif)
      for (const block of orderedBlocks) {
        await tx.eLearningTextBlock.update({
          where: { id: block.id },
          data: { order: -block.order }, // TEMP
        });
      }

      // PHASE 2: set final normalized order
      for (let i = 0; i < orderedBlocks.length; i++) {
        await tx.eLearningTextBlock.update({
          where: { id: orderedBlocks[i].id },
          data: { order: i + 1 },
        });
      }
    });

    // ======================
    // RETURN RESULT
    // ======================
    return prisma.eLearningTextBlock.findMany({
      where: { textId },
      orderBy: { order: "asc" },
    });
  }

  static async getSingleBlock(
    blockId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    const now = new Date();

    // ======================
    // Ambil block + relasi lengkap
    // ======================
    const block = await prisma.eLearningTextBlock.findUnique({
      where: { id: blockId },
      include: {
        anchors: true,
        text: {
          include: {
            interactives: {
              include: {
                matching: {
                  include: { items: true },
                },
                multipleChoice: {
                  include: { options: true },
                },
              },
            },
            executableCodes: true,
            subBab: {
              include: {
                videos: true,
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

    if (!block) {
      throw new Error("Block tidak ditemukan");
    }

    const course = block.text.subBab.subChapter.course;

    // ======================
    // HAK AKSES
    // ======================
    if (!user.roles.includes("admin")) {
      // Mentor
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("Akses ditolak: Anda bukan mentor dari course ini");
      }

      // Mentee → subscription aktif
      if (user.roles.includes("mentee")) {
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

    // ======================
    // BUILD CONTENTS BY ANCHOR
    // ======================
    const contents: any[] = [];

    for (const anchor of block.anchors) {
      const order = block.order * 1000 + (anchor.orderNumber ?? 0);

      // ======================
      // INTERACTIVE
      // ======================
      if (anchor.contentType === "INTERACTIVE") {
        const interactive = block.text.interactives.find(
          (i) => i.id === anchor.contentId,
        );

        if (interactive) {
          contents.push({
            type: "INTERACTIVE",
            position: anchor.position,
            order,
            data: {
              id: interactive.id,
              type: interactive.type,
              matching: interactive.matching
                ? {
                    title: interactive.matching.title,
                    instruction: interactive.matching.instruction,
                    maxScore: interactive.matching.maxScore,
                    items: interactive.matching.items
                      .sort((a, b) => a.orderNumber - b.orderNumber)
                      .map((item) => ({
                        id: item.id,
                        content: item.content,
                        side: item.side,
                        matchWithId: item.matchWithId,
                        orderNumber: item.orderNumber,
                      })),
                  }
                : null,
              multipleChoice: interactive.multipleChoice
                ? {
                    question: interactive.multipleChoice.question,
                    allowMultiple: interactive.multipleChoice.allowMultiple,
                    maxScore: interactive.multipleChoice.maxScore,
                    options: interactive.multipleChoice.options
                      .sort((a, b) => a.orderNumber - b.orderNumber)
                      .map((opt) => ({
                        id: opt.id,
                        content: opt.content,
                        isCorrect: opt.isCorrect,
                        orderNumber: opt.orderNumber,
                      })),
                  }
                : null,
            },
          });
        }
      }

      // ======================
      // VIDEO
      // ======================
      if (anchor.contentType === "VIDEO") {
        const video = block.text.subBab.videos.find(
          (v) => v.id === anchor.contentId,
        );

        if (video) {
          contents.push({
            type: "VIDEO",
            position: anchor.position,
            order,
            data: {
              id: video.id,
              title: video.title,
              videoUrl: video.videoUrl,
              durationSeconds: video.durationSeconds,
              isPreview: video.isPreview,
            },
          });
        }
      }

      // ======================
      // EXECUTABLE CODE
      // ======================
      if (anchor.contentType === "CODE") {
        const code = block.text.executableCodes.find(
          (c) => c.id === anchor.contentId,
        );

        if (code) {
          contents.push({
            type: "CODE",
            position: anchor.position,
            order,
            data: {
              id: code.id,
              title: code.title,
              description: code.description,
              language: code.language,
              initialCode: code.initialCode,
              isEditable: code.isEditable,
            },
          });
        }
      }
    }

    contents.sort((a, b) => a.order - b.order);

    // ======================
    // RETURN BLOCK DETAIL
    // ======================
    return {
      id: block.id,
      textId: block.textId,
      content: block.content,
      order: block.order,
      createdAt: block.createdAt,
      contents,
    };
  }

  static async exportBlocksToFile(format: "csv" | "excel") {
    const blocks = await prisma.eLearningTextBlock.findMany({
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
      orderBy: {
        order: "asc",
      },
    });

    const rows = blocks.map((b) => ({
      courseId: b.text.subBab.subChapter.course.id,
      courseTitle: b.text.subBab.subChapter.course.title,

      subChapterId: b.text.subBab.subChapter.id,
      subChapterTitle: b.text.subBab.subChapter.title,

      subBabId: b.text.subBab.id,
      subBabTitle: b.text.subBab.title,

      textId: b.text.id,
      textTitle: b.text.title,

      blockId: b.id,
      blockOrder: b.order,
      blockContent: b.content,

      createdAt: b.createdAt,
    }));

    // ======================
    // CSV EXPORT
    // ======================
    const randomString = (length: number) =>
      Array.from({ length }, () =>
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(
          Math.floor(Math.random() * 62),
        ),
      ).join("");

    if (format === "csv") {
      const csv = await parseAsync(rows);

      return {
        buffer: Buffer.from(csv, "utf-8"),
        filename: `e-learning-text-blocks_${Date.now()}_${randomString(6)}.csv`,
        mimetype: "text/csv",
      };
    }

    // ======================
    // EXCEL EXPORT
    // ======================
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Text Blocks");

    sheet.columns = [
      { header: "Course ID", key: "courseId", width: 20 },
      { header: "Course Title", key: "courseTitle", width: 30 },

      { header: "SubChapter ID", key: "subChapterId", width: 20 },
      { header: "SubChapter Title", key: "subChapterTitle", width: 30 },

      { header: "SubBab ID", key: "subBabId", width: 20 },
      { header: "SubBab Title", key: "subBabTitle", width: 30 },

      { header: "Text ID", key: "textId", width: 20 },
      { header: "Text Title", key: "textTitle", width: 30 },

      { header: "Block ID", key: "blockId", width: 20 },
      { header: "Block Order", key: "blockOrder", width: 15 },
      { header: "Block Content", key: "blockContent", width: 60 },

      { header: "Created At", key: "createdAt", width: 20 },
    ];

    rows.forEach((row) => sheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(buffer),
      filename: `e-learning-text-blocks-${Date.now()}.xlsx`,
      mimetype:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  static async getFullTextContent(
    textId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    const now = new Date();

    // ======================
    // Ambil text + course
    // ======================
    const text = await prisma.eLearningText.findUnique({
      where: { id: textId },
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

    if (!text) throw new Error("Teks tidak ditemukan");

    const course = text.subBab.subChapter.course;

    // ======================
    // HAK AKSES
    // ======================
    if (!user.roles.includes("admin")) {
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("Akses ditolak");
      }

      if (user.roles.includes("mentee")) {
        const active = await prisma.eLearningSubscription.findFirst({
          where: {
            userId: user.userId,
            status: { in: ["active", "confirmed", "completed"] },
            startAt: { lte: now },
            endAt: { gt: now },
          },
        });
        if (!active) throw new Error("Subscription tidak aktif");
      }
    }

    // ======================
    // Ambil semua data
    // ======================
    const blocks = await prisma.eLearningTextBlock.findMany({
      where: { textId },
      orderBy: { order: "asc" },
      include: {
        anchors: { orderBy: { orderNumber: "asc" } },
      },
    });

    const interactives = await prisma.eLearningTextInteractive.findMany({
      where: { textId },
      include: {
        matching: { include: { items: true } },
        multipleChoice: { include: { options: true } },
      },
    });

    const videos = await prisma.eLearningVideo.findMany({
      where: { subBabId: text.subBabId },
    });

    const codes = await prisma.eLearningExecutableCode.findMany({
      where: { textId },
    });

    // ======================
    // Helper map
    // ======================
    const interactiveMap = new Map(interactives.map((i) => [i.id, i]));
    const videoMap = new Map(videos.map((v) => [v.id, v]));
    const codeMap = new Map(codes.map((c) => [c.id, c]));

    // ======================
    // Resolver anchor
    // ======================
    const resolveAnchorContent = (anchor: any) => {
      // -------- INTERACTIVE --------
      if (anchor.contentType === "INTERACTIVE") {
        const i = interactiveMap.get(anchor.contentId);
        if (!i) return null;

        // MULTIPLE CHOICE
        if (i.multipleChoice) {
          return {
            type: "interactive",
            interactiveType: "multiple_choice",
            id: i.id,
            allowMultiple: i.multipleChoice.allowMultiple,
            maxScore: i.multipleChoice.maxScore,
            question: i.multipleChoice.question,
            options: i.multipleChoice.options
              .sort((a, b) => a.orderNumber - b.orderNumber)
              .map((o) => ({
                id: o.id,
                content: o.content,
                orderNumber: o.orderNumber,
              })),
          };
        }

        // MATCHING
        if (i.matching) {
          return {
            type: "interactive",
            interactiveType: "matching",
            id: i.id,
            title: i.matching.title,
            instruction: i.matching.instruction,
            maxScore: i.matching.maxScore,
            items: i.matching.items
              .sort((a, b) => a.orderNumber - b.orderNumber)
              .map((item) => ({
                id: item.id,
                content: item.content,
                side: item.side,
                matchWithId: item.matchWithId,
                orderNumber: item.orderNumber,
              })),
          };
        }

        // ✅ DEFAULT (BELUM ADA CABANG)
        return {
          type: "interactive",
          interactiveType: i.type, // enum asli
          id: i.id,
          isConfigured: false,
        };
      }

      // -------- VIDEO --------
      if (anchor.contentType === "VIDEO") {
        const v = videoMap.get(anchor.contentId);
        if (!v) return null;

        return {
          type: "video",
          id: v.id,
          title: v.title,
          url: v.videoUrl,
          durationSeconds: v.durationSeconds,
          isPreview: v.isPreview,
        };
      }

      // -------- EXECUTABLE CODE --------
      if (anchor.contentType === "CODE") {
        const c = codeMap.get(anchor.contentId);
        if (!c) return null;

        return {
          type: "code",
          id: c.id,
          title: c.title,
          description: c.description,
          language: c.language,
          initialCode: c.initialCode,
          isEditable: c.isEditable,
        };
      }

      return null;
    };

    // ======================
    // BUILD FINAL CONTENT
    // ======================
    const content = blocks.map((block) => {
      const before: any[] = [];
      const inline: any[] = [];
      const after: any[] = [];

      for (const anchor of block.anchors) {
        const resolved = resolveAnchorContent(anchor);
        if (!resolved) continue;

        if (anchor.position === "BEFORE") before.push(resolved);
        if (anchor.position === "INLINE") inline.push(resolved);
        if (anchor.position === "AFTER") after.push(resolved);
      }

      return {
        type: "block",
        id: block.id,
        order: block.order,
        content: block.content,
        before,
        inline,
        after,
      };
    });

    // ======================
    // FINAL RESPONSE
    // ======================
    return {
      text: {
        id: text.id,
        title: text.title,
        orderNumber: text.orderNumber,
      },
      content,
    };
  }
}
