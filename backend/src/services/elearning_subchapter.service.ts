import { PrismaClient, Prisma, CourseStatus } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { elearningThumbnailPath } from "../middlewares/uploadImage.js";

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
    },
  ) {
    const { page = 1, limit = 10, search, orderNumber } = options;

    // =========================
    // CEK COURSE
    // =========================
    const course = await prisma.eLearningCourse.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error("Course tidak ditemukan");
    }

    // =========================
    // ROLE: MENTOR
    // =========================
    if (
      user.roles.includes("mentor") &&
      course.mentorId !== user.mentorProfileId
    ) {
      throw new Error(
        "Mentor hanya bisa melihat sub-chapter dari course yang dia ampu",
      );
    }

    // =========================
    // ROLE: MENTEE (SUBSCRIPTION CHECK)
    // =========================
    if (user.roles.includes("mentee")) {
      const now = new Date();

      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: {
            in: ["active", "confirmed"],
          },
          startAt: {
            lte: now,
          },
          endAt: {
            gt: now,
          },
        },
      });

      if (!activeSubscription) {
        throw new Error(
          "Mentee hanya bisa mengakses course jika memiliki subscription aktif",
        );
      }
    }

    // =========================
    // BUILD FILTER
    // =========================
    const where: any = { courseId };

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (orderNumber !== undefined) {
      where.orderNumber = orderNumber;
    }

    // =========================
    // QUERY DATA
    // =========================
    const subChapters = await prisma.eLearningSubChapter.findMany({
      where,
      include: {
        subBabs: {
          include: {
            texts: {
              include: {
                quiz: true,
                assignment: true,
              },
            },
          },
        },
      },
      orderBy: {
        orderNumber: "asc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

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
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    // =========================
    // FETCH SUB-CHAPTER + COURSE
    // =========================
    const subChapter = await prisma.eLearningSubChapter.findUnique({
      where: { id },
      include: {
        subBabs: {
          include: {
            texts: {
              include: {
                quiz: true,
                assignment: true,
              },
            },
          },
        },
        course: true,
      },
    });

    if (!subChapter) {
      throw new Error("Sub-chapter tidak ditemukan");
    }

    const course = subChapter.course;

    // =========================
    // ROLE: ADMIN
    // =========================
    if (user.roles.includes("admin")) {
      return subChapter;
    }

    // =========================
    // ROLE: MENTOR
    // =========================
    if (user.roles.includes("mentor")) {
      if (user.mentorProfileId !== course.mentorId) {
        throw new Error("Akses ditolak: Anda bukan mentor course ini");
      }
      return subChapter;
    }

    // =========================
    // ROLE: MENTEE (SUBSCRIPTION CHECK)
    // =========================
    if (user.roles.includes("mentee")) {
      const now = new Date();

      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: {
            in: ["active", "confirmed"],
          },
          startAt: {
            lte: now,
          },
          endAt: {
            gt: now,
          },
        },
      });

      if (!activeSubscription) {
        throw new Error(
          "Akses ditolak: Anda harus memiliki subscription aktif",
        );
      }

      return subChapter;
    }

    throw new Error("Akses ditolak");
  },

  async createSubChapter(
    courseId: string,
    data: any,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    return await prisma.$transaction(async (prismaTx) => {
      const course = await prismaTx.eLearningCourse.findUnique({
        where: { id: courseId },
      });

      if (!course) throw new Error("Course tidak ditemukan");

      // ✅ ROLE HANDLING (UPDATED)
      const roles = user.roles || [];

      const adminLikeRoles = ["admin", "cm", "curdev"];
      const isAdminLike = roles.some((role) => adminLikeRoles.includes(role));
      const isMentor = roles.includes("mentor");

      // Mentor bukan pemilik
      if (
        isMentor &&
        !isAdminLike &&
        course.mentorId !== user.mentorProfileId
      ) {
        throw new Error(
          "Mentor hanya bisa menambahkan sub-chapter ke course yang dia ampu",
        );
      }

      // Role lain ditolak
      if (!isAdminLike && !isMentor) {
        throw new Error("Akses ditolak");
      }

      // Generate ID
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
      const randomId = crypto.randomBytes(6).toString("hex");
      const subChapterId = `subc-${formattedDate}-${randomId}`;

      let orderNumber = data.orderNumber || 1;

      const existingSubChapters = await prismaTx.eLearningSubChapter.findMany({
        where: { courseId },
        orderBy: { orderNumber: "asc" },
      });

      // FIXED (no async forEach)
      for (const sub of existingSubChapters) {
        if (sub.orderNumber >= orderNumber) {
          await prismaTx.eLearningSubChapter.update({
            where: { id: sub.id },
            data: { orderNumber: sub.orderNumber + 1 },
          });
        }
      }

      const newSubChapter = await prismaTx.eLearningSubChapter.create({
        data: {
          id: subChapterId,
          courseId,
          title: data.title,
          description: data.description || "",
          coverImage: data.coverImage || null,
          orderNumber,
          estimatedTime: data.estimatedTime || "",
          status: data.status || "DRAFT",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // ✅ AUDIT LOG
      const creator = await prismaTx.user.findUnique({
        where: { id: user.userId },
        select: { email: true },
      });

      await prismaTx.eLearningAuditLog.create({
        data: {
          userId: user.userId,
          entityType: "SUB_CHAPTER",
          entityId: newSubChapter.id,
          action: "CREATE",
          description: `${creator?.email ?? user.userId} membuat course ${newSubChapter.title}`,
          newValue: {
            id: newSubChapter.id,
            courseId: newSubChapter.courseId,
            title: newSubChapter.title,
            description: newSubChapter.description,
            coverImage: newSubChapter.coverImage,
            orderNumber: newSubChapter.orderNumber,
            estimatedTime: newSubChapter.estimatedTime,
            status: newSubChapter.status,
          },
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
      coverImage?: string;
      status?: CourseStatus; // ✅ tambahan agar status ikut bisa diaudit
    }>,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    const subChapter = await prisma.eLearningSubChapter.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!subChapter) {
      throw new Error("Sub-chapter tidak ditemukan");
    }

    const course = subChapter.course;

    // VALIDASI ORDER NUMBER
    if (data.orderNumber !== undefined) {
      const existing = await prisma.eLearningSubChapter.findFirst({
        where: {
          courseId: course.id,
          orderNumber: data.orderNumber,
          NOT: { id },
        },
      });

      if (existing) {
        throw new Error(
          "Nomor urutan (orderNumber) sudah digunakan di sub-chapter lain",
        );
      }
    }

    // ROLE HANDLING (UPDATED)
    const roles = user.roles || [];

    const adminLikeRoles = ["admin", "cm", "curdev"];
    const isAdminLike = roles.some((role) => adminLikeRoles.includes(role));
    const isMentor = roles.includes("mentor");

    // Mentor bukan pemilik
    if (isMentor && !isAdminLike && course.mentorId !== user.mentorProfileId) {
      throw new Error("Akses ditolak: Anda bukan mentor course ini");
    }

    // Role lain ditolak
    if (!isAdminLike && !isMentor) {
      throw new Error("Akses ditolak");
    }

    // HAPUS IMAGE LAMA (INI POSISINYA DI SINI 🔥)
    if (data.coverImage && subChapter.coverImage) {
      try {
        const absolutePath = path.join(
          elearningThumbnailPath,
          path.basename(subChapter.coverImage),
        );

        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
          console.log(`Deleted old subchapter image: ${absolutePath}`);
        }
      } catch (err) {
        console.error("Gagal menghapus cover lama:", err);
      }
    }

    // UPDATE (SATU PINTU, TIDAK DUPLIKASI)
    const updated = await prisma.eLearningSubChapter.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: { subBabs: true },
    });

    // ── Audit log ─────────────────────────────────────────────────────────────
    // Ambil email updater
    const updater = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { email: true },
    });

    // Field-field yang bisa diubah beserta label human-readable-nya
    const auditableFields: { key: string; label: string }[] = [
      { key: "title", label: "judul" },
      { key: "description", label: "deskripsi" },
      { key: "coverImage", label: "cover image" },
      { key: "orderNumber", label: "urutan" },
      { key: "estimatedTime", label: "estimasi waktu" },
      { key: "status", label: "status publikasi" },
    ];

    // Kumpulkan field yang benar-benar berubah
    const changedFields: string[] = [];
    const oldValue: Record<string, any> = {};
    const newValue: Record<string, any> = {};
    for (const { key, label } of auditableFields) {
      if (!(key in data)) continue;
      const before = (subChapter as any)[key];
      const after = (updated as any)[key];
      const isDifferent = JSON.stringify(before) !== JSON.stringify(after);
      if (isDifferent) {
        changedFields.push(label);
        oldValue[key] = before;
        newValue[key] = after;
      }
    }

    // Hanya catat jika ada yang benar-benar berubah
    if (changedFields.length > 0) {
      const email = updater?.email ?? user.userId;
      const fieldList = changedFields.join(", ");
      await prisma.eLearningAuditLog.create({
        data: {
          userId: user.userId,
          entityType: "SUB_CHAPTER",
          entityId: updated.id,
          action: "UPDATE",
          description: `${email} mengubah ${fieldList} dari course ${updated.title}`,
          oldValue,
          newValue,
        },
      });
    }

    return updated;
  },

  async deleteSubChapter(
    id: string,
    user: { userId: string; roles: string[] },
  ) {
    // Admin, CM, dan Curdev boleh menghapus
    const allowedRoles = ["admin", "cm", "curdev"];
    const isAllowed = user.roles.some((role) => allowedRoles.includes(role));

    if (!isAllowed) {
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
        }),
      );

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    return { deletedId: id };
  },

  async reorderSubChapters(
    courseId: string,
    newOrder: string[],
    user: { userId: string; roles: string[] },
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
      (a, b) => a.orderNumber - b.orderNumber,
    );

    const existingIds = existingSubChapters.map((sc) => sc.id);

    // Validasi: semua ID di newOrder harus milik course
    const invalidIds = newOrder.filter((id) => !existingIds.includes(id));
    if (invalidIds.length > 0) {
      throw new Error(
        `Beberapa sub-chapter tidak valid atau tidak milik course ini: ${invalidIds.join(
          ", ",
        )}`,
      );
    }

    // Sub-chapter yang tidak diubah
    const untouched = existingSubChapters.filter(
      (sc) => !newOrder.includes(sc.id),
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
      }),
    );

    await prisma.$transaction(updates);

    return {
      courseId,
      updatedCount: updates.length,
      newOrder: finalOrder,
    };
  },

  async duplicateSubChapter(
    id: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    const subChapter = await prisma.eLearningSubChapter.findUnique({
      where: { id },
      include: {
        course: true,
        subBabs: {
          include: {
            texts: {
              include: {
                quiz: true,
                assignment: true,
              },
            },
          },
        },
      },
    });

    if (!subChapter) {
      throw new Error("Sub-chapter tidak ditemukan");
    }

    const course = subChapter.course;

    // ROLE VALIDATION
    const roles = user.roles || [];
    const adminLikeRoles = ["admin", "cm", "curdev"];
    const isAdminLike = roles.some((r) => adminLikeRoles.includes(r));
    const isMentor = roles.includes("mentor");

    if (isMentor && !isAdminLike && course.mentorId !== user.mentorProfileId) {
      throw new Error("Akses ditolak: Anda bukan mentor course ini");
    }

    if (!isAdminLike && !isMentor) {
      throw new Error("Akses ditolak");
    }

    // 🔢 GET NEXT ORDER NUMBER
    const lastOrder = await prisma.eLearningSubChapter.findFirst({
      where: { courseId: course.id },
      orderBy: { orderNumber: "desc" },
    });

    const newOrder = (lastOrder?.orderNumber || 0) + 1;

    // 🔁 HITUNG COPY KE BERAPA
    const existingCopies = await prisma.eLearningSubChapter.findMany({
      where: {
        courseId: course.id,
        title: {
          startsWith: subChapter.title,
        },
      },
    });

    const copyIndex = existingCopies.length;

    const newTitle = `${subChapter.title} - copy ${copyIndex}`;

    // 🔥 TRANSACTION (WAJIB)
    return await prisma.$transaction(async (tx) => {
      // 1. CREATE SUBCHAPTER
      // Generate ID (SAMA SEPERTI CREATE)
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
      const randomId = crypto.randomBytes(6).toString("hex");
      const subChapterId = `subc-${formattedDate}-${randomId}`;

      const newSubChapter = await tx.eLearningSubChapter.create({
        data: {
          id: subChapterId, // ✅ TAMBAHKAN INI
          courseId: subChapter.courseId,
          title: newTitle,
          description: subChapter.description,
          coverImage: subChapter.coverImage,
          estimatedTime: subChapter.estimatedTime,
          orderNumber: newOrder,
          status: "ARCHIVED",
        },
      });

      // 2. DUPLICATE SUBBABS + TEXTS
      for (const subBab of subChapter.subBabs) {
        const newSubBab = await tx.eLearningSubBab.create({
          data: {
            subChapterId: newSubChapter.id,
            title: subBab.title,
            orderNumber: subBab.orderNumber,
            estimatedTime: subBab.estimatedTime,
            status: "ARCHIVED",
          },
        });

        for (const text of subBab.texts) {
          await tx.eLearningText.create({
            data: {
              subBabId: newSubBab.id,
              title: text.title,
              orderNumber: text.orderNumber,
              status: "ARCHIVED",
            },
          });
        }
      }

      return newSubChapter;
    });
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
    exportFormat: "csv" | "excel",
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
        chars.charAt(Math.floor(Math.random() * chars.length)),
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

  async getSubChapterHistory(
    id: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
    page: number = 1,
    limit: number = 50,
  ) {
    /* ===== 1. PASTIKAN SUB-CHAPTER ADA (sekalian ambil mentorId course induknya) ===== */
    const subChapter = await prisma.eLearningSubChapter.findUnique({
      where: { id },
      select: {
        id: true,
        courseId: true,
        course: {
          select: { id: true, mentorId: true },
        },
      },
    });

    if (!subChapter) {
      throw { status: 404, message: "Sub-chapter tidak ditemukan" };
    }

    /* ===== 2. ROLE-BASED ACCESS (sama seperti getSubChapterById) ===== */
    const isPrivileged =
      user.roles.includes("admin") ||
      user.roles.includes("cm") ||
      user.roles.includes("curdev");

    if (!isPrivileged) {
      if (user.roles.includes("mentor")) {
        if (subChapter.course.mentorId !== user.mentorProfileId) {
          throw {
            status: 403,
            message: "Akses ditolak: bukan mentor Course ini",
          };
        }
      } else if (user.roles.includes("mentee")) {
        const subscription = await prisma.eLearningSubscription.findFirst({
          where: { userId: user.userId, courseId: subChapter.courseId },
        });
        if (!subscription) {
          throw {
            status: 403,
            message: "Akses ditolak: belum berlangganan",
          };
        }
      } else {
        throw { status: 403, message: "Akses ditolak: role tidak valid" };
      }
    }

    /* ===== 3. AMBIL AUDIT LOG ===== */
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.eLearningAuditLog.findMany({
        where: {
          entityType: "SUB_CHAPTER",
          entityId: id,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.eLearningAuditLog.count({
        where: {
          entityType: "SUB_CHAPTER",
          entityId: id,
        },
      }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },
};
