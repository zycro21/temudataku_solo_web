import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const ELearningSubChapterService = {
  async getSubChaptersByCourse(
    courseId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
    options: {
      page?: number;
      limit?: number;
      search?: string;
      orderNumber?: number;
    }
  ) {
    const { page = 1, limit = 10, search, orderNumber } = options;

    // Cek course
    const course = await prisma.eLearningCourse.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new Error("Course tidak ditemukan");

    // Hak akses
    if (
      user.roles.includes("mentor") &&
      user.mentorProfileId !== course.mentorId
    ) {
      throw new Error(
        "Mentor hanya bisa melihat sub-chapter dari course yang dia ampu"
      );
    }

    if (user.roles.includes("mentee")) {
      const purchase = await prisma.eLearningPurchase.findFirst({
        where: { courseId, userId: user.userId },
      });
      if (!purchase)
        throw new Error("Mentee hanya bisa melihat course yang sudah dibeli");
    }

    // Build filter
    const where: any = { courseId };
    if (search) where.title = { contains: search, mode: "insensitive" };
    if (orderNumber) where.orderNumber = orderNumber;

    // Pagination
    const subChapters = await prisma.eLearningSubChapter.findMany({
      where,
      include: { subBabs: true },
      orderBy: { orderNumber: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Count total untuk frontend pagination
    const total = await prisma.eLearningSubChapter.count({ where });

    return {
      page,
      limit,
      total,
      subChapters,
    };
  },

  async getSubChapterById(
    id: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    // Cari sub-chapter beserta course dan subBab-nya
    const subChapter = await prisma.eLearningSubChapter.findUnique({
      where: { id },
      include: {
        subBabs: {
          include: {
            videos: true,
            texts: true,
            quiz: true,
            assignment: true,
          },
        },
        course: true,
      },
    });

    if (!subChapter) {
      throw new Error("Sub-chapter tidak ditemukan");
    }

    const course = subChapter.course;

    // Hak akses berdasarkan role
    // Admin bebas
    if (user.roles.includes("admin")) {
      return subChapter;
    }

    // Mentor hanya boleh lihat sub-chapter dari course yang dia ampu
    if (user.roles.includes("mentor")) {
      if (user.mentorProfileId !== course.mentorId) {
        throw new Error("Akses ditolak: Anda bukan mentor course ini");
      }
      return subChapter;
    }

    // Mentee hanya boleh lihat jika sudah membeli course
    if (user.roles.includes("mentee")) {
      const purchase = await prisma.eLearningPurchase.findFirst({
        where: { courseId: course.id, userId: user.userId },
      });
      if (!purchase) {
        throw new Error("Akses ditolak: Anda belum membeli course ini");
      }
      return subChapter;
    }

    throw new Error("Akses ditolak");
  },

  async createSubChapter(
    courseId: string,
    data: any,
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    // Mulai transaksi Prisma
    return await prisma.$transaction(async (prismaTx) => {
      // 1. Cek course
      const course = await prismaTx.eLearningCourse.findUnique({
        where: { id: courseId },
      });
      if (!course) throw new Error("Course tidak ditemukan");

      // 2. Cek role mentor: hanya bisa mengedit course sendiri
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== course.mentorId
      ) {
        throw new Error(
          "Mentor hanya bisa menambahkan sub-chapter ke course yang dia ampu"
        );
      }

      // 3. Generate ID sub-chapter custom: format subc-YYYYMMDD-xxxxxx
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
      const randomId = crypto.randomBytes(6).toString("hex");
      const subChapterId = `subc-${formattedDate}-${randomId}`;

      // 4. Cek duplikasi orderNumber
      let orderNumber = data.orderNumber || 1;
      const existingSubChapters = await prismaTx.eLearningSubChapter.findMany({
        where: { courseId },
        orderBy: { orderNumber: "asc" },
      });

      // Jika orderNumber sudah ada, geser semua yang >= orderNumber ke atas
      existingSubChapters.forEach(async (sub) => {
        if (sub.orderNumber >= orderNumber) {
          await prismaTx.eLearningSubChapter.update({
            where: { id: sub.id },
            data: { orderNumber: sub.orderNumber + 1 },
          });
        }
      });

      // 5. Create sub-chapter baru
      const newSubChapter = await prismaTx.eLearningSubChapter.create({
        data: {
          id: subChapterId,
          courseId,
          title: data.title,
          description: data.description || "",
          orderNumber,
          estimatedTime: data.estimatedTime || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return newSubChapter;
    });
  },

  async updateSubChapter(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      orderNumber: number;
      estimatedTime: string;
    }>,
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    // Cari sub-chapter beserta course-nya
    const subChapter = await prisma.eLearningSubChapter.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!subChapter) {
      throw new Error("Sub-chapter tidak ditemukan");
    }

    const course = subChapter.course;

    // Validasi: jika ada orderNumber baru, pastikan tidak duplikat di course yang sama
    if (data.orderNumber !== undefined) {
      const existing = await prisma.eLearningSubChapter.findFirst({
        where: {
          courseId: course.id,
          orderNumber: data.orderNumber,
          NOT: { id }, // abaikan diri sendiri
        },
      });

      if (existing) {
        throw new Error(
          "Nomor urutan (orderNumber) sudah digunakan di sub-chapter lain"
        );
      }
    }

    // Role admin: boleh update semua
    if (user.roles.includes("admin")) {
      return await prisma.eLearningSubChapter.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: { subBabs: true },
      });
    }

    // Role mentor: hanya boleh update course miliknya
    if (user.roles.includes("mentor")) {
      if (user.mentorProfileId !== course.mentorId) {
        throw new Error("Akses ditolak: Anda bukan mentor course ini");
      }

      return await prisma.eLearningSubChapter.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: { subBabs: true },
      });
    }

    // Role lain ditolak
    throw new Error("Akses ditolak");
  },

  async deleteSubChapter(
    id: string,
    user: { userId: string; roles: string[] }
  ) {
    // Hanya admin yang boleh
    if (!user.roles.includes("admin")) {
      throw new Error("Akses ditolak");
    }

    // Cari sub-chapter
    const subChapter = await prisma.eLearningSubChapter.findUnique({
      where: { id },
    });

    if (!subChapter) {
      throw new Error("Sub-chapter tidak ditemukan");
    }

    // Ambil semua sub-chapter dalam course yang sama, urutkan berdasarkan orderNumber
    const allSubChapters = await prisma.eLearningSubChapter.findMany({
      where: { courseId: subChapter.courseId },
      orderBy: { orderNumber: "asc" },
    });

    // Hapus sub-chapter
    await prisma.eLearningSubChapter.delete({ where: { id } });

    // Geser orderNumber sub-chapter yang setelahnya
    const updates = allSubChapters
      .filter((sc) => sc.orderNumber > subChapter.orderNumber)
      .map((sc) =>
        prisma.eLearningSubChapter.update({
          where: { id: sc.id },
          data: { orderNumber: sc.orderNumber - 1 },
        })
      );

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    return { deletedId: id };
  },

  async reorderSubChapters(
    courseId: string,
    newOrder: string[],
    user: { userId: string; roles: string[] }
  ) {
    // Hanya admin
    if (!user.roles.includes("admin")) {
      throw new Error("Akses ditolak");
    }

    // Pastikan course ada
    const course = await prisma.eLearningCourse.findUnique({
      where: { id: courseId },
      include: { subChapters: true },
    });

    if (!course) {
      throw new Error("Course tidak ditemukan");
    }

    // Urutkan sub-chapter lama
    const existingSubChapters = course.subChapters.sort(
      (a, b) => a.orderNumber - b.orderNumber
    );

    const existingIds = existingSubChapters.map((sc) => sc.id);

    // Validasi: semua ID di newOrder harus milik course
    const invalidIds = newOrder.filter((id) => !existingIds.includes(id));
    if (invalidIds.length > 0) {
      throw new Error(
        `Beberapa sub-chapter tidak valid atau tidak milik course ini: ${invalidIds.join(
          ", "
        )}`
      );
    }

    // Sub-chapter yang tidak diubah
    const untouched = existingSubChapters.filter(
      (sc) => !newOrder.includes(sc.id)
    );

    // Gabungkan urutan final
    const finalOrder = [
      // yang diubah sesuai urutan baru
      ...newOrder,
      // yang tidak diubah tetap di urutan setelahnya
      ...untouched.map((sc) => sc.id),
    ];

    // Update ulang semua orderNumber agar tidak ada duplikat
    const updates = finalOrder.map((id, index) =>
      prisma.eLearningSubChapter.update({
        where: { id },
        data: { orderNumber: index + 1, updatedAt: new Date() },
      })
    );

    await prisma.$transaction(updates);

    return {
      courseId,
      updatedCount: updates.length,
      newOrder: finalOrder,
    };
  },

  async duplicateSubChapter(
    sourceSubChapterId: string,
    targetCourseId: string,
    user: { userId: string; roles: string[] }
  ) {
    if (!user.roles.includes("admin")) {
      throw new Error("Akses ditolak");
    }

    const subChapter = await prisma.eLearningSubChapter.findUnique({
      where: { id: sourceSubChapterId },
      include: { subBabs: true },
    });

    if (!subChapter) throw new Error("Sub-chapter tidak ditemukan");

    const targetCourse = await prisma.eLearningCourse.findUnique({
      where: { id: targetCourseId },
    });

    if (!targetCourse) throw new Error("Course tujuan tidak ditemukan");

    const result = await prisma.$transaction(async (tx) => {
      const existingSubChapters = await tx.eLearningSubChapter.findMany({
        where: { courseId: targetCourseId },
        orderBy: { orderNumber: "asc" },
      });

      const nextOrder =
        existingSubChapters.length > 0
          ? existingSubChapters[existingSubChapters.length - 1].orderNumber + 1
          : 1;

      // Generate ID baru dengan format custom
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
      const randomId = crypto.randomBytes(6).toString("hex");
      const newSubChapterId = `subc-${formattedDate}-${randomId}`;

      const newSubChapter = await tx.eLearningSubChapter.create({
        data: {
          id: newSubChapterId,
          courseId: targetCourseId,
          title: subChapter.title,
          description: subChapter.description,
          orderNumber: nextOrder,
          estimatedTime: subChapter.estimatedTime,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Duplikasi sub-bab dengan ID baru juga
      for (const bab of subChapter.subBabs) {
        const babRandomId = crypto.randomBytes(6).toString("hex");
        const babId = `subbab-${formattedDate}-${babRandomId}`;

        await tx.eLearningSubBab.create({
          data: {
            id: babId,
            subChapterId: newSubChapter.id,
            title: bab.title,
            orderNumber: bab.orderNumber,
            estimatedTime: bab.estimatedTime,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      return {
        originalId: subChapter.id,
        newSubChapterId: newSubChapter.id,
        newSubBabCount: subChapter.subBabs.length,
      };
    });

    return result;
  },

  async listSubChapters({
    page = 1,
    limit = 10,
    search,
    courseId,
    sortBy = "createdAt",
    sortOrder = "desc",
  }: {
    page?: number;
    limit?: number;
    search?: string;
    courseId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (courseId) {
      whereClause.courseId = courseId;
    }

    const [data, total] = await Promise.all([
      prisma.eLearningSubChapter.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.eLearningSubChapter.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      data,
    };
  },

  async exportSubChaptersToFile(
    exportFormat: "csv" | "excel"
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const subChapters = await prisma.eLearningSubChapter.findMany({
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        subBabs: true,
      },
    });

    const rows = subChapters.map((sub) => ({
      ID: sub.id,
      CourseID: sub.courseId,
      CourseTitle: sub.course?.title || "-",
      Title: sub.title,
      Description: sub.description || "-",
      OrderNumber: sub.orderNumber,
      EstimatedTime: sub.estimatedTime || "-",
      TotalSubBabs: sub.subBabs.length,
      CreatedAt: format(sub.createdAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
      UpdatedAt: format(sub.updatedAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
    }));

    function randomString(length: number) {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");
    }

    // 🔹 CSV Export
    if (exportFormat === "csv") {
      const csv = await parseAsync(rows);
      return {
        buffer: Buffer.from(csv, "utf-8"),
        filename: `subchapters_${Date.now()}_${randomString(6)}.csv`,
        mimetype: "text/csv",
      };
    }

    // 🔹 Excel Export
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("SubChapters");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 25,
    }));

    rows.forEach((row) => worksheet.addRow(row));

    const arrayBuffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(arrayBuffer),
      filename: `subchapters_${Date.now()}_${randomString(6)}.xlsx`,
      mimetype:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  },
};
