import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";
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
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "orderNumber";
    const sortOrder = query.sortOrder || "asc";
    const search = query.search?.trim();

    // 🔹 Ambil sub-bab dan relasi course
    const subBab = await prisma.eLearningSubBab.findUnique({
      where: { id: subBabId },
      include: { subChapter: { include: { course: true } } },
    });

    if (!subBab) throw new Error("Sub-bab tidak ditemukan");

    const courseId = subBab.subChapter.course.id;

    // 🔸 Role: Admin bebas
    if (!user.roles.includes("admin")) {
      // 🔸 Role: Mentor → harus pemilik course
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== subBab.subChapter.course.mentorId
      ) {
        throw new Error("Akses ditolak: Anda bukan mentor dari course ini");
      }

      // 🔸 Role: Mentee → harus sudah beli course ini
      if (user.roles.includes("mentee")) {
        const purchase = await prisma.eLearningPurchase.findFirst({
          where: {
            userId: user.userId,
            courseId,
          },
        });
        if (!purchase) {
          throw new Error("Akses ditolak: Anda belum membeli course ini");
        }
      }
    }

    // 🔹 Query teks berdasarkan filter/search
    const whereCondition: any = {
      subBabId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { textContent: { contains: search, mode: "insensitive" } },
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

    const totalPages = Math.ceil(total / limit);

    return {
      data: texts,
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
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    // 🔹 Ambil teks dan relasi lengkap sampai ke course
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

    // 🔸 Admin bebas akses
    if (!user.roles.includes("admin")) {
      // 🔸 Mentor: hanya boleh akses course yang dia ampu
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("Akses ditolak: Anda bukan mentor dari course ini");
      }

      // 🔸 Mentee: hanya boleh akses course yang sudah dibeli
      if (user.roles.includes("mentee")) {
        const purchased = await prisma.eLearningPurchase.findFirst({
          where: {
            userId: user.userId,
            courseId: course.id,
          },
        });

        if (!purchased) {
          throw new Error("Akses ditolak: Anda belum membeli course ini");
        }
      }
    }

    return {
      id: text.id,
      title: text.title,
      textContent: text.textContent,
      orderNumber: text.orderNumber,
      createdAt: text.createdAt,
      updatedAt: text.updatedAt,
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
    data: { title?: string; textContent?: string },
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    return await prisma.$transaction(async (tx) => {
      // 🔹 Validasi wajib: pastikan textContent diisi
      if (!data.textContent || data.textContent.trim() === "") {
        throw new Error("Isi teks (textContent) wajib diisi");
      }

      // 🔹 Cek sub-bab dan relasi ke course
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
          "Akses ditolak: hanya mentor dari course ini yang bisa menambah teks"
        );
      }

      // 🔹 Dapatkan urutan terakhir
      const lastText = await tx.eLearningText.findFirst({
        where: { subBabId },
        orderBy: { orderNumber: "desc" },
      });
      const newOrder = (lastText?.orderNumber || 0) + 1;

      // 🔹 Generate ID custom: text-YYYYMMDD-xxxxxx
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
      const randomHex = crypto.randomBytes(6).toString("hex");
      const textId = `sbjct-${formattedDate}-${randomHex}`;

      // 🔹 Simpan teks baru
      const newText = await tx.eLearningText.create({
        data: {
          id: textId,
          subBabId,
          title: data.title || null,
          textContent: data.textContent,
          orderNumber: newOrder,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return newText;
    });
  }

  static async updateText(
    id: string,
    data: { title?: string; textContent?: string; orderNumber?: number },
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    // Cek apakah teks ada
    const existing = await prisma.eLearningText.findUnique({
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

    // Role: hanya admin atau mentor pemilik course
    if (!user.roles.includes("admin")) {
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error("Akses ditolak: Anda bukan mentor dari course ini");
      }
    }

    // Cek duplikasi orderNumber (jika diberikan)
    if (data.orderNumber !== undefined) {
      const duplicate = await prisma.eLearningText.findFirst({
        where: {
          subBabId: existing.subBabId,
          orderNumber: data.orderNumber,
          NOT: { id }, // abaikan dirinya sendiri
        },
      });
      if (duplicate) {
        throw new Error("orderNumber duplikat dalam sub-bab ini");
      }
    }

    // Update data
    const updated = await prisma.eLearningText.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  static async deleteText(id: string) {
    return prisma.$transaction(async (tx) => {
      // Cek apakah teks ada
      const text = await tx.eLearningText.findUnique({
        where: { id },
      });

      if (!text) throw new Error("Teks tidak ditemukan");

      // Hapus teks
      await tx.eLearningText.delete({ where: { id } });

      // Ambil semua teks sisa pada sub-bab yang sama dan urutkan ulang
      const remainingTexts = await tx.eLearningText.findMany({
        where: { subBabId: text.subBabId },
        orderBy: { orderNumber: "asc" },
      });

      // Reassign orderNumber agar kembali berurutan (1, 2, 3, ...)
      for (let i = 0; i < remainingTexts.length; i++) {
        await tx.eLearningText.update({
          where: { id: remainingTexts[i].id },
          data: { orderNumber: i + 1, updatedAt: new Date() },
        });
      }

      return {
        deletedTextId: id,
        reordered: remainingTexts.length,
        remainingTexts,
      };
    });
  }

  static async reorderTexts(
    subBabId: string,
    orders: { id: string; orderNumber: number }[],
    user: { userId: string; roles: string[] }
  ) {
    // Hanya admin yang boleh reorder
    if (!user.roles.includes("admin")) {
      throw new Error(
        "Akses ditolak: hanya admin yang dapat melakukan reorder teks"
      );
    }

    // Pastikan subBab ada
    const subBab = await prisma.eLearningSubBab.findUnique({
      where: { id: subBabId },
      include: { texts: true },
    });
    if (!subBab) throw new Error("Sub-bab tidak ditemukan");

    const allTexts = subBab.texts.sort(
      (a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)
    );
    const allIds = allTexts.map((t) => t.id);

    // Pastikan semua teks yang dikirim valid
    const invalid = orders.find((o) => !allIds.includes(o.id));
    if (invalid)
      throw new Error(
        `Teks dengan ID ${invalid.id} tidak termasuk dalam sub-bab ini`
      );

    // Cek duplikasi orderNumber dalam payload
    const uniqueOrders = new Set(orders.map((o) => o.orderNumber));
    if (uniqueOrders.size !== orders.length)
      throw new Error("Terdapat duplikat orderNumber dalam data yang dikirim");

    // ======= 🔹 REORDER LOGIC =======
    // Step 1. Buat map untuk teks yang dikirim
    const reorderMap = new Map(orders.map((o) => [o.orderNumber, o.id]));

    // Step 2. Urutkan berdasarkan orderNumber yang dikirim
    const newOrder: { id: string; orderNumber: number }[] = [];

    // Step 3. Loop semua posisi yang mungkin (1..jumlah teks)
    let nextIndex = 1;
    for (let i = 1; i <= allTexts.length; i++) {
      const found = orders.find((o) => o.orderNumber === i);
      if (found) {
        // Jika posisi ini diisi oleh teks yang dikirim → gunakan itu
        newOrder.push({ id: found.id, orderNumber: i });
      } else {
        // Jika tidak, cari teks lain yang belum diatur
        const remaining = allTexts.find(
          (t) =>
            !orders.some((o) => o.id === t.id) &&
            !newOrder.some((n) => n.id === t.id)
        );
        if (remaining) {
          newOrder.push({ id: remaining.id, orderNumber: i });
        }
      }
    }

    // Step 4. Pastikan tidak ada duplikat orderNumber
    const checkSet = new Set(newOrder.map((n) => n.orderNumber));
    if (checkSet.size !== newOrder.length)
      throw new Error(
        "Terjadi konflik orderNumber setelah penyesuaian otomatis"
      );

    // Step 5. Update semua teks dalam transaksi
    const updates = newOrder.map((o) =>
      prisma.eLearningText.update({
        where: { id: o.id },
        data: { orderNumber: o.orderNumber, updatedAt: new Date() },
      })
    );

    await prisma.$transaction(updates);

    // Step 6. Kembalikan hasil urutan terbaru
    const updated = await prisma.eLearningText.findMany({
      where: { subBabId },
      orderBy: { orderNumber: "asc" },
    });

    return updated;
  }

  static async searchTexts(query: any) {
    const {
      search,
      subBabId,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;

    // Build kondisi pencarian
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { textContent: { contains: search, mode: "insensitive" } },
      ];
    }

    if (subBabId) {
      whereClause.subBabId = subBabId;
    }

    // Ambil total data
    const total = await prisma.eLearningText.count({
      where: whereClause,
    });

    // Ambil data dengan pagination & sorting
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
      orderBy: { [sortBy]: sortOrder },
    });

    // Format pagination info
    const totalPages = Math.ceil(total / limit);

    return {
      data: texts,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  static async exportTextsToFile(
    exportFormat: "csv" | "excel"
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
    });

    const rows = texts.map((t) => ({
      ID: t.id,
      SubBabID: t.subBabId,
      SubBabTitle: t.subBab?.title || "-",
      SubChapterID: t.subBab?.subChapter?.id || "-",
      SubChapterTitle: t.subBab?.subChapter?.title || "-",
      CourseID: t.subBab?.subChapter?.course?.id || "-",
      CourseTitle: t.subBab?.subChapter?.course?.title || "-",
      Title: t.title || "-",
      TextContent: t.textContent.substring(0, 200) + "...", // truncate isi text biar gak kepanjangan
      OrderNumber: t.orderNumber || "-",
      CreatedAt: format(t.createdAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
      UpdatedAt: format(t.updatedAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
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
        filename: `elearning_materi_${Date.now()}_${randomString(6)}.csv`,
        mimetype: "text/csv",
      };
    }

    // Excel Export
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("ELearningTexts");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 25,
    }));

    rows.forEach((row) => worksheet.addRow(row));

    const arrayBuffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(arrayBuffer),
      filename: `elearning_materi_${Date.now()}_${randomString(6)}.xlsx`,
      mimetype:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }
}
