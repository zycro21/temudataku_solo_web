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
          },
        },
      },
    });

    if (!text) throw new Error("Teks tidak ditemukan");

    const course = text.subBab.subChapter.course;

    // ======================
    // AKSES KONTROL
    // ======================
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

    // ======================
    // BUILD CONTENT TREE
    // ======================
    const contents: any[] = [];

    // 3️⃣ SORT FINAL
    contents.sort((a, b) => a.order - b.order);

    // ======================
    // RESPONSE
    // ======================
    return {
      id: text.id,
      title: text.title,
      status: text.status,
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
    data: {
      title?: string;
      status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
      blocks: { content: string; order: number }[];
    },
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    return prisma.$transaction(async (tx) => {
      // ======================
      // 1. Validasi blocks
      // ======================
      if (data.blocks && data.blocks.length > 0) {
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
          orderNumber: b.order, // 🔥 fix di sini
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
    data: {
      title?: string;
      orderNumber?: number;
      status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    },
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
