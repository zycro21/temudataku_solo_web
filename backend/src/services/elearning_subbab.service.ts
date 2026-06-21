import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import crypto from "crypto";
import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";
import { CourseStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const ELearningSubBabService = {
  async getSubBabsBySubChapter(
    subChapterId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
    options: {
      page?: number;
      limit?: number;
      search?: string;
      sort?: "asc" | "desc";
    },
  ) {
    const { page = 1, limit = 10, search, sort = "asc" } = options;

    // =========================
    // FETCH SUB-CHAPTER + COURSE
    // =========================
    const subChapter = await prisma.eLearningSubChapter.findUnique({
      where: { id: subChapterId },
      include: { course: true },
    });

    if (!subChapter) {
      throw new Error("Sub-chapter tidak ditemukan");
    }

    const course = subChapter.course;

    // =========================
    // ROLE HANDLING (UPDATED)
    // =========================
    const roles = user.roles || [];

    const adminLikeRoles = ["admin", "cm", "curdev"];
    const isAdminLike = roles.some((role) => adminLikeRoles.includes(role));
    const isMentor = roles.includes("mentor");
    const isMentee = roles.includes("mentee");

    // =========================
    // ADMIN / CM / CURDEV
    // =========================
    if (isAdminLike) {
      // bebas akses
    }

    // =========================
    // MENTOR
    // =========================
    else if (isMentor) {
      if (user.mentorProfileId !== course.mentorId) {
        throw new Error(
          "Mentor hanya bisa melihat sub-bab dari course yang dia ampu",
        );
      }
    }

    // =========================
    // MENTEE (SUBSCRIPTION)
    // =========================
    else if (isMentee) {
      const now = new Date();

      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: {
            in: ["active", "confirmed"],
          },
          startAt: { lte: now },
          endAt: { gt: now },
        },
      });

      if (!activeSubscription) {
        throw new Error(
          "Mentee hanya bisa melihat sub-bab jika memiliki subscription aktif",
        );
      }
    }

    // =========================
    // ROLE LAIN DITOLAK
    // =========================
    else {
      throw new Error("Akses ditolak");
    }

    // =========================
    // FILTER
    // =========================
    const where: any = { subChapterId };
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    // =========================
    // QUERY + PAGINATION
    // =========================
    const subBabs = await prisma.eLearningSubBab.findMany({
      where,
      include: {
        texts: {
          include: {
            quiz: true,
            assignment: true,
          },
          orderBy: {
            orderNumber: "asc",
          },
        },
      },
      orderBy: {
        orderNumber: sort,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.eLearningSubBab.count({ where });

    return {
      page,
      limit,
      total,
      subBabs,
    };
  },

  async getSubBabById(
    id: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    const now = new Date();

    // Ambil sub-bab beserta relasi
    const subBab = await prisma.eLearningSubBab.findUnique({
      where: { id },
      include: {
        subChapter: {
          include: {
            course: true,
          },
        },

        texts: {
          include: {
            quiz: {
              include: {
                questions: true,
              },
            },

            assignment: {
              include: {
                instructions: true,
                supportingFiles: true,
              },
            },
          },

          orderBy: {
            orderNumber: "asc",
          },
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

    // Mentor
    if (user.roles.includes("mentor")) {
      if (user.mentorProfileId !== course.mentorId) {
        throw new Error(
          "Mentor hanya bisa melihat sub-bab dari course yang dia ampu",
        );
      }
    }

    // Mentee (PAKAI SUBSCRIPTION)
    if (user.roles.includes("mentee")) {
      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: {
            in: ["active", "confirmed", "completed"],
          },
          startAt: {
            lte: now,
          },
          endAt: {
            gt: now,
          },
        },
        orderBy: {
          endAt: "desc",
        },
      });

      if (!activeSubscription) {
        throw new Error(
          "Akses ditolak. Anda tidak memiliki subscription aktif.",
        );
      }
    }

    // ======================
    // RESPONSE
    // ======================
    const quiz = subBab.texts.find((t) => t.quiz)?.quiz ?? null;

    const assignment =
      subBab.texts.find((t) => t.assignment)?.assignment ?? null;

    return {
      id: subBab.id,
      title: subBab.title,
      orderNumber: subBab.orderNumber,
      estimatedTime: subBab.estimatedTime,
      subChapter: {
        id: subBab.subChapter.id,
        title: subBab.subChapter.title,
        courseId: subBab.subChapter.courseId,
        courseTitle: course.title,
      },

      texts: subBab.texts,
      createdAt: subBab.createdAt,
      updatedAt: subBab.updatedAt,
    };
  },

  async createSubBab(
    subChapterId: string,
    data: { title: string; estimatedTime?: string; status?: string },
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    return await prisma.$transaction(async (prismaTx) => {
      // Cek sub-chapter
      const subChapter = await prismaTx.eLearningSubChapter.findUnique({
        where: { id: subChapterId },
        include: { course: true },
      });
      if (!subChapter) throw new Error("Sub-chapter tidak ditemukan");

      // ── Role check ──────────────────────────────────────────────────────────
      const roles = user.roles || [];
      const adminLikeRoles = ["admin", "cm", "curdev"];
      const isAdminLike = roles.some((role) => adminLikeRoles.includes(role));
      const isMentor = roles.includes("mentor");

      // Mentor bukan pemilik course → tolak
      if (
        isMentor &&
        !isAdminLike &&
        subChapter.course.mentorId !== user.mentorProfileId
      ) {
        throw new Error(
          "Akses ditolak: Mentor hanya bisa menambahkan sub-bab ke course yang dia ampu",
        );
      }

      // Bukan admin-like dan bukan mentor → tolak
      if (!isAdminLike && !isMentor) {
        throw new Error("Akses ditolak");
      }
      // ────────────────────────────────────────────────────────────────────────

      // Generate custom ID: subbab-YYYYMMDD-xxxxxx
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
      const randomId = crypto.randomBytes(6).toString("hex");
      const subBabId = `subbab-${formattedDate}-${randomId}`;

      // ── orderNumber: pakai aggregate max agar tidak lompat setelah delete ──
      const agg = await prismaTx.eLearningSubBab.aggregate({
        where: { subChapterId },
        _max: { orderNumber: true },
      });
      const newOrder = (agg._max.orderNumber ?? 0) + 1;
      // ────────────────────────────────────────────────────────────────────────

      // Tentukan status: gunakan nilai dari data jika ada, default DRAFT
      const status =
        data.status === "PUBLISHED"
          ? "PUBLISHED"
          : data.status === "ARCHIVED"
            ? "ARCHIVED"
            : "DRAFT";

      // Buat sub-bab baru
      const newSubBab = await prismaTx.eLearningSubBab.create({
        data: {
          id: subBabId,
          subChapterId,
          title: data.title,
          estimatedTime: data.estimatedTime || "",
          orderNumber: newOrder,
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // ── Audit log ────────────────────────────────────────────────────────────
      // Ambil email user untuk description audit log
      const creator = await prismaTx.user.findUnique({
        where: { id: user.userId },
        select: { email: true },
      });

      await prismaTx.eLearningAuditLog.create({
        data: {
          userId: user.userId,
          entityType: "SUB_BAB",
          entityId: newSubBab.id,
          action: "CREATE",
          description: `${creator?.email ?? user.userId} membuat module ${newSubBab.title}`,
          newValue: {
            id: newSubBab.id,
            subChapterId: newSubBab.subChapterId,
            title: newSubBab.title,
            estimatedTime: newSubBab.estimatedTime,
            orderNumber: newSubBab.orderNumber,
            status: newSubBab.status,
          },
        },
      });
      // ────────────────────────────────────────────────────────────────────────

      return newSubBab;
    });
  },

  async updateSubBab(
    id: string,
    data: {
      title?: string;
      estimatedTime?: string;
      orderNumber?: number;
      status?: CourseStatus;
    },
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    return await prisma.$transaction(async (prismaTx) => {
      // 🔹 Cek apakah sub-bab ada
      const subBab = await prismaTx.eLearningSubBab.findUnique({
        where: { id },
        include: {
          subChapter: {
            include: { course: true },
          },
        },
      });

      if (!subBab) throw new Error("Sub-bab tidak ditemukan");

      const course = subBab.subChapter.course;

      const adminLikeRoles = ["admin", "cm", "curdev"];
      const isAdminLike = user.roles.some((r) => adminLikeRoles.includes(r));

      if (!isAdminLike && user.roles.includes("mentor")) {
        if (user.mentorProfileId !== course.mentorId) {
          throw new Error("Akses ditolak...");
        }
      }

      if (!isAdminLike && !user.roles.includes("mentor")) {
        throw new Error("Akses ditolak");
      }

      // 🔹 Jika orderNumber diubah, pastikan tidak duplikat dalam subChapter yang sama
      if (data.orderNumber && data.orderNumber !== subBab.orderNumber) {
        const duplicate = await prismaTx.eLearningSubBab.findFirst({
          where: {
            subChapterId: subBab.subChapterId,
            orderNumber: data.orderNumber,
            NOT: { id },
          },
        });
        if (duplicate) {
          throw new Error(
            `Order number ${data.orderNumber} sudah digunakan oleh sub-bab lain`,
          );
        }
      }

      // 🔹 Lakukan update parsial
      const updatedSubBab = await prismaTx.eLearningSubBab.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.estimatedTime && { estimatedTime: data.estimatedTime }),
          ...(data.orderNumber && { orderNumber: data.orderNumber }),
          ...(data.status && { status: data.status }),
          updatedAt: new Date(),
        },
        include: {
          subChapter: {
            include: { course: true },
          },
        },
      });

      // ── Audit log ─────────────────────────────────────────────────────────────

      // Ambil email updater
      const updater = await prismaTx.user.findUnique({
        where: { id: user.userId },
        select: { email: true },
      });

      // Field-field yang bisa diubah beserta label human-readablenya
      const auditableFields: { key: string; label: string }[] = [
        { key: "title", label: "judul" },
        { key: "estimatedTime", label: "estimasi waktu" },
        { key: "orderNumber", label: "urutan" },
        { key: "status", label: "status publikasi" },
      ];

      // Kumpulkan field yang benar-benar berubah
      const changedFields: string[] = [];
      const oldValue: Record<string, any> = {};
      const newValue: Record<string, any> = {};

      for (const { key, label } of auditableFields) {
        if (!(key in data)) continue;

        const before = (subBab as any)[key];
        const after = (updatedSubBab as any)[key];

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

        await prismaTx.eLearningAuditLog.create({
          data: {
            userId: user.userId,
            entityType: "SUB_BAB",
            entityId: updatedSubBab.id,
            action: "UPDATE",
            description: `${email} mengubah ${fieldList} dari module ${updatedSubBab.title}`,
            oldValue,
            newValue,
          },
        });
      }
      // ────────────────────────────────────────────────────────────────────────

      return {
        id: updatedSubBab.id,
        title: updatedSubBab.title,
        orderNumber: updatedSubBab.orderNumber,
        estimatedTime: updatedSubBab.estimatedTime,
        subChapterId: updatedSubBab.subChapterId,
        courseTitle: updatedSubBab.subChapter.course.title,
        updatedAt: updatedSubBab.updatedAt,
      };
    });
  },

  async deleteSubBab(id: string, user: { userId: string; roles: string[] }) {
    return await prisma.$transaction(async (prismaTx) => {
      // 🔹 Admin, CM, dan Curdev boleh menghapus
      const allowedRoles = ["admin", "cm", "curdev"];
      const isAllowed = user.roles.some((role) => allowedRoles.includes(role));

      if (!isAllowed) {
        throw new Error("Akses ditolak");
      }

      // 🔹 Cek apakah sub-bab ada
      const subBab = await prismaTx.eLearningSubBab.findUnique({
        where: { id },
      });

      if (!subBab) {
        throw new Error("Sub-bab tidak ditemukan");
      }

      // 🔹 Ambil semua sub-bab dalam sub-chapter terkait (diurutkan)
      const allSubBabs = await prismaTx.eLearningSubBab.findMany({
        where: { subChapterId: subBab.subChapterId },
        orderBy: { orderNumber: "asc" },
      });

      // 🔹 Hapus sub-bab target
      await prismaTx.eLearningSubBab.delete({ where: { id } });

      // 🔹 Hitung urutan baru untuk sub-bab lain (jika urutannya jadi lompat)
      const filtered = allSubBabs
        .filter((b) => b.id !== id) // sisakan selain yang dihapus
        .map((b, index) => ({
          id: b.id,
          newOrderNumber: index + 1, // reindex dari 1 lagi
        }));

      // Update orderNumber tiap sub-bab yang tersisa
      for (const item of filtered) {
        await prismaTx.eLearningSubBab.update({
          where: { id: item.id },
          data: { orderNumber: item.newOrderNumber, updatedAt: new Date() },
        });
      }

      // Return hasil ringkas
      return {
        deletedId: id,
        adjustedCount: filtered.length,
      };
    });
  },

  async duplicateSubBab(
    id: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    return await prisma.$transaction(async (prismaTx) => {
      const subBab = await prismaTx.eLearningSubBab.findUnique({
        where: { id },
        include: {
          texts: true,
          subChapter: {
            include: { course: true },
          },
        },
      });

      if (!subBab) throw new Error("Sub-bab tidak ditemukan");

      const course = subBab.subChapter.course;

      const adminLikeRoles = ["admin", "cm", "curdev"];
      const isAdminLike = user.roles.some((r) => adminLikeRoles.includes(r));

      if (!isAdminLike && user.roles.includes("mentor")) {
        if (user.mentorProfileId !== course.mentorId) {
          throw new Error("Akses ditolak...");
        }
      }

      if (!isAdminLike && !user.roles.includes("mentor")) {
        throw new Error("Akses ditolak");
      }

      // 🔹 Generate title copy
      const existingCopies = await prismaTx.eLearningSubBab.count({
        where: {
          subChapterId: subBab.subChapterId,
          title: {
            startsWith: `${subBab.title}-copy`,
          },
        },
      });

      const newTitle = `${subBab.title}-copy (${existingCopies + 1})`;

      // 🔹 Cari orderNumber terakhir
      const lastOrder = await prismaTx.eLearningSubBab.findFirst({
        where: { subChapterId: subBab.subChapterId },
        orderBy: { orderNumber: "desc" },
      });

      const newOrder = (lastOrder?.orderNumber ?? 0) + 1;

      // ======================
      // 🔹 Generate custom ID SubBab
      // ======================
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
      const randomId = crypto.randomBytes(6).toString("hex");
      const subBabId = `subbab-${formattedDate}-${randomId}`;

      // 🔹 Create subBab baru
      const newSubBab = await prismaTx.eLearningSubBab.create({
        data: {
          id: subBabId, // 🔥 CUSTOM ID
          subChapterId: subBab.subChapterId,
          title: newTitle,
          orderNumber: newOrder,
          estimatedTime: subBab.estimatedTime,
          status: subBab.status,
        },
      });

      for (const text of subBab.texts) {
        // ======================
        // 🔹 Generate ID Text
        // ======================
        const textId = `ETXT-${Date.now()}-${randomBytes(3)
          .toString("hex")
          .toUpperCase()}`;

        await prismaTx.eLearningText.create({
          data: {
            id: textId, // 🔥 CUSTOM ID
            subBabId: newSubBab.id,
            title: text.title,
            orderNumber: text.orderNumber,
            status: text.status,
          },
        });
      }

      return newSubBab;
    });
  },

  async reorderSubBabs(
    subChapterId: string,
    updates: { subBabId: string; newOrderNumber: number }[],
    user: { userId: string; roles: string[] },
  ) {
    if (!user.roles.includes("admin")) {
      throw new Error("Akses ditolak: hanya admin yang dapat mengubah urutan");
    }

    return await prisma.$transaction(async (prismaTx) => {
      const subChapter = await prismaTx.eLearningSubChapter.findUnique({
        where: { id: subChapterId },
        include: { subBabs: { orderBy: { orderNumber: "asc" } } },
      });

      if (!subChapter) throw new Error("Sub-chapter tidak ditemukan");

      let reordered = [...subChapter.subBabs];

      for (const { subBabId, newOrderNumber } of updates) {
        const index = reordered.findIndex((s) => s.id === subBabId);
        if (index === -1) {
          throw new Error(`Sub-bab ${subBabId} tidak ditemukan`);
        }

        // Ambil item yang akan dipindah
        const [movedItem] = reordered.splice(index, 1);

        // Sisipkan ke posisi baru
        const targetIndex = Math.max(
          0,
          Math.min(newOrderNumber - 1, reordered.length),
        );
        reordered.splice(targetIndex, 0, movedItem);
      }

      // Reindex ulang setelah semua perubahan
      const reorderedResult = reordered.map((s, i) => ({
        id: s.id,
        orderNumber: i + 1,
      }));

      // Simpan perubahan ke DB
      for (const s of reorderedResult) {
        await prismaTx.eLearningSubBab.update({
          where: { id: s.id },
          data: { orderNumber: s.orderNumber, updatedAt: new Date() },
        });
      }

      return reorderedResult;
    });
  },

  async getAllSubBabs({
    page = 1,
    limit = 10,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  }: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "title" | "createdAt" | "orderNumber";
    sortOrder?: "asc" | "desc";
  }) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    const [data, total] = await Promise.all([
      prisma.eLearningSubBab.findMany({
        where,
        include: {
          subChapter: {
            include: {
              course: {
                select: { id: true, title: true },
              },
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.eLearningSubBab.count({ where }),
    ]);

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      data,
    };
  },

  async exportSubBabsToFile(
    exportFormat: "csv" | "excel",
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const subBabs = await prisma.eLearningSubBab.findMany({
      include: {
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

        texts: {
          include: {
            quiz: {
              select: {
                id: true,
              },
            },
            assignment: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const rows = subBabs.map((s) => ({
      ID: s.id,
      SubChapterID: s.subChapterId,
      SubChapterTitle: s.subChapter?.title || "-",
      CourseID: s.subChapter?.course?.id || "-",
      CourseTitle: s.subChapter?.course?.title || "-",
      Title: s.title,
      OrderNumber: s.orderNumber || "-",
      EstimatedTime: s.estimatedTime || "-",
      TotalTexts: s.texts.length,
      HasQuiz: s.texts.some((t) => t.quiz) ? "Yes" : "No",
      HasAssignment: s.texts.some((t) => t.assignment) ? "Yes" : "No",
      CreatedAt: format(s.createdAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
      UpdatedAt: format(s.updatedAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
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
        filename: `subbabs_${Date.now()}_${randomString(6)}.csv`,
        mimetype: "text/csv",
      };
    }

    // 🔹 Excel Export
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("SubBabs");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 25,
    }));

    rows.forEach((row) => worksheet.addRow(row));

    const arrayBuffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(arrayBuffer),
      filename: `subbabs_${Date.now()}_${randomString(6)}.xlsx`,
      mimetype:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  },

  async getSubBabHistory(
    id: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
    page: number = 1,
    limit: number = 50,
  ) {
    const now = new Date();

    /* ===== 1. PASTIKAN SUB-BAB ADA (sekalian ambil mentorId course induknya) ===== */
    const subBab = await prisma.eLearningSubBab.findUnique({
      where: { id },
      select: {
        id: true,
        subChapterId: true,
        subChapter: {
          select: {
            course: {
              select: { id: true, mentorId: true },
            },
          },
        },
      },
    });

    if (!subBab) {
      throw new Error("Sub-bab tidak ditemukan");
    }

    const course = subBab.subChapter.course;

    /* ===== 2. ROLE-BASED ACCESS (sama seperti getSubBabById) ===== */
    if (user.roles.includes("mentor")) {
      if (user.mentorProfileId !== course.mentorId) {
        throw new Error(
          "Mentor hanya bisa melihat riwayat sub-bab dari course yang dia ampu",
        );
      }
    } else if (user.roles.includes("mentee")) {
      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: {
            in: ["active", "confirmed", "completed"],
          },
          startAt: {
            lte: now,
          },
          endAt: {
            gt: now,
          },
        },
        orderBy: {
          endAt: "desc",
        },
      });

      if (!activeSubscription) {
        throw new Error(
          "Akses ditolak. Anda tidak memiliki subscription aktif.",
        );
      }
    } else if (
      !user.roles.includes("admin") &&
      !user.roles.includes("cm") &&
      !user.roles.includes("curdev")
    ) {
      throw new Error("Akses ditolak: role tidak valid");
    }

    /* ===== 3. AMBIL AUDIT LOG ===== */
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.eLearningAuditLog.findMany({
        where: {
          entityType: "SUB_BAB",
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
          entityType: "SUB_BAB",
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
