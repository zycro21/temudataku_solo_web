import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";

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
    }
  ) {
    const { page = 1, limit = 10, search, sort = "asc" } = options;

    // Cek sub-chapter
    const subChapter = await prisma.eLearningSubChapter.findUnique({
      where: { id: subChapterId },
      include: { course: true },
    });
    if (!subChapter) throw new Error("Sub-chapter tidak ditemukan");

    const courseId = subChapter.courseId;

    // Hak akses
    if (
      user.roles.includes("mentor") &&
      user.mentorProfileId !== subChapter.course.mentorId
    ) {
      throw new Error(
        "Mentor hanya bisa melihat sub-bab dari course yang dia ampu"
      );
    }

    if (user.roles.includes("mentee")) {
      const purchase = await prisma.eLearningPurchase.findFirst({
        where: { courseId, userId: user.userId },
      });
      if (!purchase)
        throw new Error(
          "Mentee hanya bisa melihat sub-bab dari course yang sudah dibeli"
        );
    }

    // Filter pencarian
    const where: any = { subChapterId };
    if (search) where.title = { contains: search, mode: "insensitive" };

    // Ambil data dengan pagination
    const subBabs = await prisma.eLearningSubBab.findMany({
      where,
      include: {
        texts: true,
        videos: true,
        quiz: true,
        assignment: true,
      },
      orderBy: { orderNumber: sort },
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
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    // Ambil sub-bab beserta relasi
    const subBab = await prisma.eLearningSubBab.findUnique({
      where: { id },
      include: {
        subChapter: {
          include: {
            course: true,
          },
        },
        videos: true,
        texts: true,
        quiz: { include: { questions: true } },
        assignment: true,
      },
    });

    if (!subBab) throw new Error("Sub-bab tidak ditemukan");

    const course = subBab.subChapter.course;

    // --- Hak akses ---
    if (user.roles.includes("mentor")) {
      if (user.mentorProfileId !== course.mentorId) {
        throw new Error(
          "Mentor hanya bisa melihat sub-bab dari course yang dia ampu"
        );
      }
    }

    if (user.roles.includes("mentee")) {
      const purchase = await prisma.eLearningPurchase.findFirst({
        where: { courseId: course.id, userId: user.userId },
      });
      if (!purchase) {
        throw new Error(
          "Mentee hanya bisa melihat sub-bab dari course yang sudah dibeli"
        );
      }
    }

    // --- Return detail lengkap ---
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
      videos: subBab.videos,
      texts: subBab.texts,
      quiz: subBab.quiz,
      assignment: subBab.assignment,
      createdAt: subBab.createdAt,
      updatedAt: subBab.updatedAt,
    };
  },

  async createSubBab(
    subChapterId: string,
    data: { title: string; estimatedTime?: string },
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    return await prisma.$transaction(async (prismaTx) => {
      // Cek sub-chapter
      const subChapter = await prismaTx.eLearningSubChapter.findUnique({
        where: { id: subChapterId },
        include: { course: true },
      });
      if (!subChapter) throw new Error("Sub-chapter tidak ditemukan");

      // Role check: mentor hanya boleh menambah ke course miliknya
      if (
        user.roles.includes("mentor") &&
        user.mentorProfileId !== subChapter.course.mentorId
      ) {
        throw new Error(
          "Akses ditolak: Mentor hanya bisa menambahkan sub-bab ke course yang dia ampu"
        );
      }

      // Generate custom ID: subb-YYYYMMDD-xxxxxx
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
      const randomId = crypto.randomBytes(6).toString("hex");
      const subBabId = `subbab-${formattedDate}-${randomId}`;

      // Dapatkan orderNumber terakhir
      const lastSubBab = await prismaTx.eLearningSubBab.findFirst({
        where: { subChapterId },
        orderBy: { orderNumber: "desc" },
      });
      const newOrder = (lastSubBab?.orderNumber || 0) + 1;

      // Buat sub-bab baru
      const newSubBab = await prismaTx.eLearningSubBab.create({
        data: {
          id: subBabId,
          subChapterId,
          title: data.title,
          estimatedTime: data.estimatedTime || "",
          orderNumber: newOrder,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return newSubBab;
    });
  },

  async updateSubBab(
    id: string,
    data: { title?: string; estimatedTime?: string; orderNumber?: number },
    user: { userId: string; roles: string[]; mentorProfileId?: string }
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

      // 🔹 Cek hak akses
      if (user.roles.includes("mentor")) {
        if (user.mentorProfileId !== course.mentorId) {
          throw new Error(
            "Akses ditolak: Mentor hanya bisa mengedit sub-bab dari course yang dia ampu"
          );
        }
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
            `Order number ${data.orderNumber} sudah digunakan oleh sub-bab lain`
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
          updatedAt: new Date(),
        },
        include: {
          subChapter: {
            include: { course: true },
          },
        },
      });

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

  async deleteSubBab(id: string) {
    return await prisma.$transaction(async (prismaTx) => {
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
    sourceSubBabId: string,
    targetSubChapterId: string,
    newTitle: string | undefined,
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    return await prisma.$transaction(async (prismaTx) => {
      // 🔹 Ambil subbab sumber beserta relasi lengkap
      const source = await prismaTx.eLearningSubBab.findUnique({
        where: { id: sourceSubBabId },
        include: {
          subChapter: {
            include: { course: true },
          },
          videos: true,
          texts: true,
          quiz: { include: { questions: true } },
          assignment: true,
        },
      });

      if (!source) throw new Error("Sub-bab tidak ditemukan");

      // 🔹 Ambil sub-chapter tujuan beserta course-nya
      const targetSubChapter = await prismaTx.eLearningSubChapter.findUnique({
        where: { id: targetSubChapterId },
        include: { course: true },
      });

      if (!targetSubChapter)
        throw new Error("Sub-chapter tujuan tidak ditemukan");

      // 🔹 Cek hak akses (mentor hanya boleh pada course-nya sendiri)
      if (user.roles.includes("mentor")) {
        if (user.mentorProfileId !== source.subChapter.course.mentorId) {
          throw new Error(
            "Akses ditolak: Anda bukan mentor dari course sumber"
          );
        }
        if (user.mentorProfileId !== targetSubChapter.course.mentorId) {
          throw new Error(
            "Akses ditolak: Anda bukan mentor dari course tujuan"
          );
        }
      }

      // 🔹 Tentukan orderNumber baru (increment dari terbesar di targetSubChapter)
      const lastSubBab = await prismaTx.eLearningSubBab.findFirst({
        where: { subChapterId: targetSubChapterId },
        orderBy: { orderNumber: "desc" },
      });
      const newOrderNumber = (lastSubBab?.orderNumber || 0) + 1;

      // 🔹 Buat ID baru dengan format konsisten
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
      const randomId = crypto.randomBytes(6).toString("hex");
      const subBabId = `subbab-${formattedDate}-${randomId}`;

      // 🔹 Buat subbab baru
      const newSubBab = await prismaTx.eLearningSubBab.create({
        data: {
          id: subBabId,
          subChapterId: targetSubChapterId,
          title: newTitle || `${source.title} (Copy)`,
          orderNumber: newOrderNumber,
          estimatedTime: source.estimatedTime,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // 🔹 Duplikasi konten: video, text, quiz, assignment
      // Video
      for (const video of source.videos) {
        await prismaTx.eLearningVideo.create({
          data: {
            subBabId: newSubBab.id,
            title: video.title,
            videoUrl: video.videoUrl,
            durationSeconds: video.durationSeconds,
            orderNumber: video.orderNumber,
            isPreview: video.isPreview,
          },
        });
      }

      // Text
      for (const text of source.texts) {
        await prismaTx.eLearningText.create({
          data: {
            subBabId: newSubBab.id,
            title: text.title,
            textContent: text.textContent,
            orderNumber: text.orderNumber,
          },
        });
      }

      // Quiz
      if (source.quiz) {
        const newQuiz = await prismaTx.eLearningQuiz.create({
          data: {
            subBabId: newSubBab.id,
            title: source.quiz.title,
            description: source.quiz.description,
            totalQuestions: source.quiz.totalQuestions,
            timeLimitMinutes: source.quiz.timeLimitMinutes,
          },
        });

        for (const q of source.quiz.questions) {
          await prismaTx.eLearningQuestion.create({
            data: {
              quizId: newQuiz.id,
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
            },
          });
        }
      }

      // Assignment
      if (source.assignment) {
        await prismaTx.eLearningAssignment.create({
          data: {
            subBabId: newSubBab.id,
            title: source.assignment.title,
            description: source.assignment.description,
            dueDays: source.assignment.dueDays,
          },
        });
      }

      return {
        id: newSubBab.id,
        title: newSubBab.title,
        orderNumber: newSubBab.orderNumber,
        subChapterId: newSubBab.subChapterId,
        message: "Sub-bab berhasil diduplikasi ke sub-chapter lain",
      };
    });
  },

  async reorderSubBabs(
    subChapterId: string,
    updates: { subBabId: string; newOrderNumber: number }[],
    user: { userId: string; roles: string[] }
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
          Math.min(newOrderNumber - 1, reordered.length)
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
    exportFormat: "csv" | "excel"
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
        videos: true,
        texts: true,
        quiz: true,
        assignment: true,
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
      TotalVideos: s.videos.length,
      TotalTexts: s.texts.length,
      HasQuiz: s.quiz ? "Yes" : "No",
      HasAssignment: s.assignment ? "Yes" : "No",
      CreatedAt: format(s.createdAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
      UpdatedAt: format(s.updatedAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
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
};
