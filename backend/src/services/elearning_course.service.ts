import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { elearningThumbnailPath } from "../middlewares/uploadImage.js";

const prisma = new PrismaClient();

export const ELearningCourseService = {
  async getAllCourses(
    filters: any,
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    const {
      category,
      level,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = filters;

    const skip = (page - 1) * limit;

    // Base where condition
    let whereCondition: any = {
      ...(category && { category }),
      ...(level && { level }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // Filter berdasarkan role
    if (user.roles.includes("admin")) {
      // admin: lihat semua
    } else if (user.roles.includes("mentor")) {
      whereCondition.mentorId = user.mentorProfileId;
    } else if (user.roles.includes("mentee")) {
      const purchasedCourses = await prisma.eLearningPurchase.findMany({
        where: { userId: user.userId },
        select: { courseId: true },
      });
      const purchasedIds = purchasedCourses.map((p) => p.courseId);

      whereCondition.id = {
        in: purchasedIds.length > 0 ? purchasedIds : ["-"], // agar tidak kosong
      };
    }

    const [total, courses] = await Promise.all([
      prisma.eLearningCourse.count({ where: whereCondition }),
      prisma.eLearningCourse.findMany({
        where: whereCondition,
        include: {
          mentorProfile: {
            include: {
              user: { select: { fullName: true, profilePicture: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: courses,
    };
  },

  async getCourseById(
    id: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    // Ambil kursus
    const course = await prisma.eLearningCourse.findUnique({
      where: { id },
      include: {
        mentorProfile: {
          include: {
            user: { select: { fullName: true, profilePicture: true } },
          },
        },
        subChapters: {
          include: {
            subBabs: {
              include: {
                videos: true,
                texts: true,
                quiz: true,
                assignment: true,
              },
              orderBy: { orderNumber: "asc" },
            },
          },
          orderBy: { orderNumber: "asc" },
        },
        reviews: {
          include: {
            user: { select: { fullName: true, profilePicture: true } },
          },
        },
      },
    });

    if (!course) return null;

    // Role-based access control
    if (user.roles.includes("admin")) {
      return course; // Admin bisa lihat semua
    }

    if (user.roles.includes("mentor")) {
      if (course.mentorId !== user.mentorProfileId) {
        throw {
          status: 403,
          message: "Akses ditolak: bukan mentor kursus ini",
        };
      }
      return course;
    }

    if (user.roles.includes("mentee")) {
      const purchased = await prisma.eLearningPurchase.findFirst({
        where: {
          userId: user.userId,
          courseId: id,
        },
      });
      if (!purchased) {
        throw {
          status: 403,
          message: "Akses ditolak: Anda belum membeli kursus ini",
        };
      }
      return course;
    }

    throw { status: 403, message: "Akses ditolak: Role tidak valid" };
  },

  async createCourse(data: any) {
    // Pastikan mentor valid
    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: data.mentorId },
    });
    if (!mentor) throw new Error("Mentor tidak ditemukan");

    // Generate custom ID
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
    const randomId = crypto.randomBytes(3).toString("hex"); // 6 karakter hex
    const courseId = `elearn-${formattedDate}-${randomId}`;

    // Buat data kursus baru
    const newCourse = await prisma.eLearningCourse.create({
      data: {
        id: courseId,
        mentorId: data.mentorId,
        title: data.title,
        description: data.description,
        thumbnailImages: data.thumbnailImages || [],
        price: new Prisma.Decimal(data.price),
        category: data.category,
        tags: data.tags || [],
        targetAudience: data.targetAudience,
        level: data.level,
        estimatedDuration: data.estimatedDuration,
        benefits: data.benefits,
        toolsUsed: data.toolsUsed,
        isActive: data.isActive ?? true,
      },
    });

    return newCourse;
  },

  async updateCourse(
    id: string,
    data: any,
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    const course = await prisma.eLearningCourse.findUnique({
      where: { id },
    });

    if (!course) {
      throw { status: 404, message: "Kursus tidak ditemukan" };
    }

    const isAdmin = user.roles.includes("admin");
    const isMentor = user.roles.includes("mentor");

    // Role-based authorization
    if (isMentor && course.mentorId !== user.mentorProfileId) {
      throw { status: 403, message: "Akses ditolak: bukan pemilik kursus ini" };
    }

    // Jika mentor, tidak boleh ubah mentorId
    if (isMentor && data.mentorId && data.mentorId !== course.mentorId) {
      throw {
        status: 403,
        message: "Mentor tidak dapat mengubah mentorId kursus",
      };
    }

    // Jika admin mengubah mentorId, pastikan mentorId valid
    if (isAdmin && data.mentorId) {
      const mentorExists = await prisma.mentorProfile.findUnique({
        where: { id: data.mentorId },
      });
      if (!mentorExists) {
        throw { status: 400, message: "Mentor baru tidak ditemukan" };
      }
    }

    // Hapus thumbnail lama jika ada file baru diunggah
    if (data.thumbnailImages && course.thumbnailImages?.length > 0) {
      try {
        for (const oldImagePath of course.thumbnailImages) {
          const absolutePath = path.join(
            elearningThumbnailPath,
            path.basename(oldImagePath)
          );

          if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            console.log(`Deleted old thumbnail: ${absolutePath}`);
          }
        }
      } catch (err) {
        console.error("Gagal menghapus thumbnail lama:", err);
      }
    }

    // Update data kursus
    const updated = await prisma.eLearningCourse.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return updated;
  },

  async toggleCourseStatus(id: string, isActive: boolean) {
    try {
      const course = await prisma.eLearningCourse.update({
        where: { id },
        data: {
          isActive,
          updatedAt: new Date(),
        },
      });
      return course;
    } catch (err: unknown) {
      // type guard untuk Prisma error
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          // Record tidak ditemukan
          return null;
        }
      }
      throw err;
    }
  },

  async deleteCourse(id: string) {
    try {
      const course = await prisma.eLearningCourse.delete({
        where: { id },
      });
      return course;
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          // Record tidak ditemukan
          return null;
        }
      }
      throw err;
    }
  },

  async listCourses(
    filters: {
      category?: string;
      level?: string;
      mentorId?: string;
      search?: string;
    },
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (filters.category) where.category = filters.category;
    if (filters.level) where.level = filters.level;
    if (filters.mentorId) where.mentorId = filters.mentorId;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const courses = await prisma.eLearningCourse.findMany({
      where,
      include: {
        mentorProfile: {
          include: {
            user: { select: { fullName: true, profilePicture: true } },
          },
        },
        subChapters: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return courses;
  },

  async getCourseDetail(id: string) {
    const course = await prisma.eLearningCourse.findUnique({
      where: { id },
      include: {
        mentorProfile: {
          include: {
            user: { select: { fullName: true, profilePicture: true } },
          },
        },
        subChapters: {
          include: {
            subBabs: {
              include: {
                videos: true,
                texts: true,
                quiz: true,
                assignment: true,
              },
            },
          },
        },
        reviews: true,
        purchases: true,
        certificates: true,
      },
    });

    if (!course || !course.isActive) return null;

    // Statistik dasar
    const stats = {
      totalSubChapters: course.subChapters.length,
      totalSubBabs: course.subChapters.reduce(
        (acc, ch) => acc + ch.subBabs.length,
        0
      ),
      totalStudents: course.purchases.length,
      averageRating:
        course.reviews.length > 0
          ? course.reviews.reduce((sum, r) => sum + r.rating, 0) /
            course.reviews.length
          : null,
    };

    return { ...course, stats };
  },

  async getCourseStatistics(
    courseId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string }
  ) {
    // Ambil course beserta subChapters, subBabs, progresses, purchases, reviews
    const course = await prisma.eLearningCourse.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        mentorId: true,
        purchases: true,
        reviews: true,
        subChapters: {
          select: {
            subBabs: {
              select: {
                progresses: true, // di dalam progresses ada isCompleted
              },
            },
          },
        },
      },
    });

    if (!course) return null;

    if (
      user.roles.includes("mentor") &&
      course.mentorId !== user.mentorProfileId
    ) {
      return null; // mentor akses bukan kursusnya
    }

    // Total pembeli
    const totalPurchases = course.purchases.length;

    // Average rating
    const averageRating =
      course.reviews.length > 0
        ? course.reviews.reduce((sum, r) => sum + r.rating, 0) /
          course.reviews.length
        : 0;

    // Hitung average progress: setiap progress isCompleted true = 100%, false = 0%
    let allProgressValues: number[] = [];
    course.subChapters.forEach((sub) =>
      sub.subBabs.forEach((bab) =>
        bab.progresses.forEach((p) => {
          allProgressValues.push(p.isCompleted ? 100 : 0);
        })
      )
    );

    const averageProgress =
      allProgressValues.length > 0
        ? allProgressValues.reduce((sum, val) => sum + val, 0) /
          allProgressValues.length
        : 0;

    return { totalPurchases, averageRating, averageProgress };
  },

  async exportCoursesToFile(
    exportFormat: "csv" | "excel"
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const courses = await prisma.eLearningCourse.findMany({
      include: {
        mentorProfile: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        purchases: true,
        reviews: true,
      },
    });

    const rows = courses.map((course) => ({
      ID: course.id,
      Title: course.title,
      Description: course.description || "-",
      Price: course.price.toString(),
      Category: course.category || "-",
      Tags: course.tags.join(", "),
      Level: course.level || "-",
      EstimatedDuration: course.estimatedDuration || "-",
      Benefits: course.benefits || "-",
      ToolsUsed: course.toolsUsed || "-",
      TargetAudience: course.targetAudience || "-",
      IsActive: course.isActive ? "Yes" : "No",
      TotalPurchases: course.purchases.length,
      AverageRating:
        course.reviews.length > 0
          ? course.reviews.reduce((sum, r) => sum + r.rating, 0) /
            course.reviews.length
          : 0,
      MentorID: course.mentorProfile.id,
      MentorName: course.mentorProfile.user.fullName,
      MentorEmail: course.mentorProfile.user.email,
      CreatedAt: formatDate(
        course.createdAt ?? new Date(),
        "yyyy-MM-dd HH:mm:ss"
      ),
      UpdatedAt: formatDate(
        course.updatedAt ?? new Date(),
        "yyyy-MM-dd HH:mm:ss"
      ),
    }));

    function randomString(length: number) {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    if (exportFormat === "csv") {
      const csv = await parseAsync(rows);
      return {
        buffer: Buffer.from(csv, "utf-8"),
        filename: `e-learning_${Date.now()}_${randomString(6)}.csv`,
        mimetype: "text/csv",
      };
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Courses");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 30,
    }));

    rows.forEach((row) => worksheet.addRow(row));

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      filename: `e-learning_${Date.now()}_${randomString(6)}.xlsx`,
      mimetype:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  },
};
