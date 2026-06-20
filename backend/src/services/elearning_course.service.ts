import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { elearningThumbnailPath } from "../middlewares/uploadImage.js";

const prisma = new PrismaClient();

function generateCourseId() {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
  const randomId = crypto.randomBytes(3).toString("hex");
  return `elearn-${formattedDate}-${randomId}`;
}

function generateSubChapterId() {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
  const randomId = crypto.randomBytes(6).toString("hex");
  return `subc-${formattedDate}-${randomId}`;
}

function generateSubBabId() {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
  const randomId = crypto.randomBytes(6).toString("hex");
  return `subbab-${formattedDate}-${randomId}`;
}

function generateTextId() {
  return `ETXT-${Date.now()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;
}

export const ELearningCourseService = {
  async getAllCourses(
    filters: any,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    const {
      category,
      level,
      search,
      page = 1,
      limit = 1000,
      sortBy = "createdAt",
      order = "desc",
    } = filters;

    const skip = (page - 1) * limit;

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

    /* ===== ROLE-BASED ACCESS ===== */

    const roles = user.roles || [];

    // admin-like roles
    const adminLikeRoles = ["admin", "cm", "curdev"];
    const isAdminLike = roles.some((role) => adminLikeRoles.includes(role));

    const isMentor = roles.includes("mentor");
    const isMentee = roles.includes("mentee");

    if (isAdminLike) {
      // admin / cm / curdev bebas melihat semua course
    } else if (isMentor) {
      // mentor hanya melihat course miliknya
      whereCondition.mentorId = user.mentorProfileId;
    } else if (isMentee) {
      const now = new Date();

      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: "confirmed",
          startAt: { lte: now },
          endAt: { gte: now },
        },
      });

      if (!activeSubscription) {
        throw {
          status: 403,
          message: "Akses ditolak. Anda tidak memiliki subscription aktif.",
        };
      }

      // mentee bisa melihat semua course jika subscription aktif
    }

    const [total, courses] = await Promise.all([
      prisma.eLearningCourse.count({ where: whereCondition }),
      prisma.eLearningCourse.findMany({
        where: whereCondition,
        include: {
          mentorProfile: {
            include: {
              user: {
                select: {
                  fullName: true,
                  profilePicture: true,
                },
              },
            },
          },
          // TAMBAHAN: include relasi untuk hitung courses, modules, materials
          subChapters: {
            include: {
              subBabs: {
                include: {
                  texts: true, // untuk hitung materials (ELearningText)
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
    ]);

    // TAMBAHAN: hitung courses, modules, materials per course
    const dataWithCounts = courses.map((course) => {
      const coursesCount = course.subChapters.length;

      const modulesCount = course.subChapters.reduce(
        (acc, subChapter) => acc + subChapter.subBabs.length,
        0,
      );

      const materialsCount = course.subChapters.reduce(
        (acc, subChapter) =>
          acc +
          subChapter.subBabs.reduce(
            (acc2, subBab) => acc2 + subBab.texts.length,
            0,
          ),
        0,
      );
      // =====================================================================
      // CATATAN:
      // - coursesCount  = jumlah ELearningSubChapter milik course
      // - modulesCount  = jumlah semua ELearningSubBab di bawah subChapters tsb
      // - materialsCount = jumlah semua ELearningText di bawah subBabs tsb
      // =====================================================================

      return {
        ...course,
        coursesCount,
        modulesCount,
        materialsCount,
      };
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: dataWithCounts,
    };
  },

  async getCourseById(
    id: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    /* ===== 1. AMBIL COURSE ===== */
    const course = await prisma.eLearningCourse.findUnique({
      where: { id },
      include: {
        mentorProfile: {
          include: {
            user: {
              select: { fullName: true, profilePicture: true },
            },
          },
        },
        subChapters: {
          include: {
            subBabs: {
              include: {
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
              orderBy: {
                orderNumber: "asc",
              },
            },
          },
          orderBy: { orderNumber: "asc" },
        },
        reviews: {
          include: {
            user: {
              select: { fullName: true, profilePicture: true },
            },
          },
        },
      },
    });

    if (!course) {
      throw { status: 404, message: "Kursus tidak ditemukan" };
    }

    /* ===== 2. ROLE-BASED ACCESS ===== */

    // ADMIN / CM / CURDEV → bebas
    if (
      user.roles.includes("admin") ||
      user.roles.includes("cm") ||
      user.roles.includes("curdev")
    ) {
      return course;
    }

    // MENTOR → hanya course miliknya
    if (user.roles.includes("mentor")) {
      if (course.mentorId !== user.mentorProfileId) {
        throw {
          status: 403,
          message: "Akses ditolak: bukan mentor kursus ini",
        };
      }
      return course;
    }

    // MENTEE → HARUS ADA SUBSCRIPTION AKTIF
    if (user.roles.includes("mentee")) {
      const now = new Date();

      const activeSubscription = await prisma.eLearningSubscription.findFirst({
        where: {
          userId: user.userId,
          status: "confirmed",
          startAt: { lte: now },
          endAt: { gte: now },
        },
      });

      if (!activeSubscription) {
        throw {
          status: 403,
          message: "Akses ditolak: Anda tidak memiliki subscription aktif",
        };
      }

      return course;
    }

    throw { status: 403, message: "Akses ditolak: role tidak valid" };
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
        category: data.category,
        tags: data.tags || [],
        targetAudience: data.targetAudience,
        level: data.level,
        estimatedDuration: data.estimatedDuration,
        benefits: data.benefits,
        toolsUsed: data.toolsUsed,
        isActive: data.isActive ?? true,
        status: data.status ?? "DRAFT",
      },
    });

    return newCourse;
  },

  async updateCourse(
    id: string,
    data: any,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    const course = await prisma.eLearningCourse.findUnique({
      where: { id },
    });

    if (!course) {
      throw { status: 404, message: "Kursus tidak ditemukan" };
    }

    const roles = user.roles || [];

    // Role yang diperlakukan seperti admin
    const adminLikeRoles = ["admin", "cm", "curdev"];
    const isAdminLike = roles.some((role) => adminLikeRoles.includes(role));
    const isMentor = roles.includes("mentor");

    // Jika mentor tapi bukan pemilik kursus
    if (isMentor && !isAdminLike && course.mentorId !== user.mentorProfileId) {
      throw { status: 403, message: "Akses ditolak: bukan pemilik kursus ini" };
    }

    // Mentor tidak boleh ubah mentorId
    if (
      isMentor &&
      !isAdminLike &&
      data.mentorId &&
      data.mentorId !== course.mentorId
    ) {
      throw {
        status: 403,
        message: "Mentor tidak dapat mengubah mentorId kursus",
      };
    }

    // Admin / CM / Curdev boleh mengubah mentorId tapi harus valid
    if (isAdminLike && data.mentorId) {
      const mentorExists = await prisma.mentorProfile.findUnique({
        where: { id: data.mentorId },
      });

      if (!mentorExists) {
        throw { status: 400, message: "Mentor baru tidak ditemukan" };
      }
    }

    // Hapus thumbnail lama jika upload baru
    if (data.thumbnailImages && course.thumbnailImages?.length > 0) {
      try {
        for (const oldImagePath of course.thumbnailImages) {
          const absolutePath = path.join(
            elearningThumbnailPath,
            path.basename(oldImagePath),
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
    limit = 10,
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
            user: {
              select: {
                fullName: true,
                profilePicture: true,
              },
            },
          },
        },
        subChapters: {
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
        },
        reviews: true,
        certificates: true,
      },
    });

    if (!course || !course.isActive) {
      return null;
    }

    /* ===== STATISTIK DASAR (TANPA PURCHASE) ===== */
    const totalSubChapters = course.subChapters.length;
    const totalSubBabs = course.subChapters.reduce(
      (acc, ch) => acc + ch.subBabs.length,
      0,
    );

    const averageRating =
      course.reviews.length > 0
        ? course.reviews.reduce((sum, r) => sum + r.rating.toNumber(), 0) /
          course.reviews.length
        : null;

    const stats = {
      totalSubChapters,
      totalSubBabs,
      averageRating,
    };

    return {
      ...course,
      stats,
    };
  },

  async getCourseStatistics(
    courseId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
  ) {
    const course = await prisma.eLearningCourse.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        mentorId: true,
        reviews: {
          select: {
            rating: true,
          },
        },
        subChapters: {
          select: {
            subBabs: {
              select: {
                progresses: {
                  select: {
                    userId: true,
                    isCompleted: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) return null;

    /* ===== ROLE CHECK ===== */
    if (
      user.roles.includes("mentor") &&
      course.mentorId !== user.mentorProfileId
    ) {
      throw { status: 403, message: "Akses ditolak" };
    }

    /* ===== TOTAL STUDENTS (UNIQUE USER PROGRESS) ===== */
    const studentSet = new Set<string>();

    course.subChapters.forEach((sub) =>
      sub.subBabs.forEach((bab) =>
        bab.progresses.forEach((p) => {
          studentSet.add(p.userId);
        }),
      ),
    );

    const totalStudents = studentSet.size;

    /* ===== AVERAGE RATING ===== */
    const averageRating =
      course.reviews.length > 0
        ? course.reviews.reduce((sum, r) => sum + r.rating.toNumber(), 0) /
          course.reviews.length
        : 0;

    /* ===== AVERAGE PROGRESS ===== */
    const progressValues: number[] = [];

    course.subChapters.forEach((sub) =>
      sub.subBabs.forEach((bab) =>
        bab.progresses.forEach((p) => {
          progressValues.push(p.isCompleted ? 100 : 0);
        }),
      ),
    );

    const averageProgress =
      progressValues.length > 0
        ? progressValues.reduce((sum, val) => sum + val, 0) /
          progressValues.length
        : 0;

    return {
      totalStudents,
      averageRating,
      averageProgress,
    };
  },

  async exportCoursesToFile(
    exportFormat: "csv" | "excel",
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
        reviews: true,
      },
    });

    const rows = courses.map((course) => ({
      ID: course.id,
      Title: course.title,
      Description: course.description || "-",
      Category: course.category || "-",
      Tags: course.tags.join(", "),
      Level: course.level || "-",
      EstimatedDuration: course.estimatedDuration || "-",
      Benefits: course.benefits || "-",
      ToolsUsed: course.toolsUsed || "-",
      TargetAudience: course.targetAudience || "-",
      IsActive: course.isActive ? "Yes" : "No",
      AverageRating:
        course.reviews.length > 0
          ? course.reviews.reduce((sum, r) => sum + r.rating.toNumber(), 0) /
            course.reviews.length
          : 0,
      MentorID: course.mentorProfile.id,
      MentorName: course.mentorProfile.user.fullName,
      MentorEmail: course.mentorProfile.user.email,
      CreatedAt: formatDate(
        course.createdAt ?? new Date(),
        "yyyy-MM-dd HH:mm:ss",
      ),
      UpdatedAt: formatDate(
        course.updatedAt ?? new Date(),
        "yyyy-MM-dd HH:mm:ss",
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

  async exportProductEventToFile(
    format: "csv" | "excel",
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    // =========================
    // FETCH MENTORING
    // =========================
    const mentoringServices = await prisma.mentoringService.findMany({
      include: {
        mentors: {
          include: {
            mentorProfile: {
              include: {
                user: true,
              },
            },
          },
        },
        sections: true,
        tools: true,
        schedules: true,
        portfolios: true,
        testimonials: true,
      },
    });

    const getSectionByType = (sections: any[], type: string) => {
      return sections
        .filter((s) => s.type === type)
        .map((s) => (s.content as any)?.description || "-")
        .join(" | ");
    };

    const mentoringRows = mentoringServices.map((m) => ({
      TYPE: "MENTORING",
      ID: m.id,
      Name: m.serviceName,
      Description: m.description || "-",

      Thumbnail: m.thumbnail || "-",
      ServiceType: m.serviceType || "-",
      Price: m.price.toString(),
      StrikePrice: m.strikePrice?.toString() || "-",

      MaxParticipants: m.maxParticipants ?? "-",
      DurationDays: m.durationDays,

      // ✅ NEW FIELDS
      ProgramAbout: m.programAbout || "-",
      TotalWeeks: m.totalWeeks ?? "-",
      TotalProjects: m.totalProjects ?? "-",

      Category: m.category || "-",
      Level: m.level || "-",
      IsFeatured: m.isFeatured ? "Yes" : "No",

      // ✅ FROM RELATIONS
      Benefits: getSectionByType(m.sections, "BENEFIT"),
      TargetAudience: getSectionByType(m.sections, "TARGET"),
      Mechanism: getSectionByType(m.sections, "MECHANISM"),
      Syllabus: getSectionByType(m.sections, "SYLLABUS"),

      ToolsUsed: m.tools.map((t) => t.name).join(", ") || "-",

      TotalSchedules: m.schedules.length,
      TotalPortfolios: m.portfolios.length,
      TotalTestimonials: m.testimonials.length,

      IsActive: m.isActive ? "Yes" : "No",

      Mentors: m.mentors.map((x) => x.mentorProfile.user.fullName).join(", "),

      CreatedAt: formatDate(m.createdAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
      UpdatedAt: formatDate(m.updatedAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
    }));

    // =========================
    // FETCH E-LEARNING (SUBSCRIPTION BASED)
    // =========================
    const courses = await prisma.eLearningCourse.findMany({
      include: {
        mentorProfile: {
          include: {
            user: true,
          },
        },
        reviews: true,
      },
    });

    const elearningRows = courses.map((c) => {
      const avgRating =
        c.reviews.length > 0
          ? (
              c.reviews.reduce((sum, r) => sum + r.rating.toNumber(), 0) /
              c.reviews.length
            ).toFixed(2)
          : "0";

      return {
        TYPE: "E-LEARNING",
        ID: c.id,
        Name: c.title,
        Description: c.description || "-",
        ServiceType: "course",
        MaxParticipants: "-",
        DurationDays: c.estimatedDuration || "-",
        Benefits: c.benefits || "-",
        ToolsUsed: c.toolsUsed || "-",
        TargetAudience: c.targetAudience || "-",
        IsActive: c.isActive ? "Yes" : "No",
        Mentors: c.mentorProfile.user.fullName,
        AverageRating: avgRating,
        CreatedAt: formatDate(c.createdAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
        UpdatedAt: formatDate(c.updatedAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
      };
    });

    // =========================
    // GABUNG DATA
    // =========================
    const rows = [...mentoringRows, ...elearningRows];

    if (rows.length === 0) {
      throw new Error("No data to export");
    }

    // =========================
    // EXPORT
    // =========================
    const random = () => Math.random().toString(36).substring(2, 8);

    if (format === "csv") {
      const csv = await parseAsync(rows);
      return {
        buffer: Buffer.from(csv),
        filename: `product-event_${Date.now()}_${random()}.csv`,
        mimetype: "text/csv",
      };
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Product & Event");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 30,
    }));

    rows.forEach((row) => worksheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(buffer),
      filename: `product-event_${Date.now()}_${random()}.xlsx`,
      mimetype:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  },

  async duplicateCourse(id: string, user: any) {
    const course = await prisma.eLearningCourse.findUnique({
      where: { id },
      include: {
        subChapters: {
          include: {
            subBabs: {
              include: {
                texts: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw { status: 404, message: "Course tidak ditemukan" };
    }

    /* ===== ROLE-BASED ACCESS ===== */
    const roles: string[] = Array.isArray(user?.roles)
      ? user.roles.map((r: unknown) =>
          typeof r === "string" ? r : (r as { role: string }).role,
        )
      : [];

    const adminLikeRoles = ["admin", "cm", "curdev"];
    const isAdminLike = roles.some((role) => adminLikeRoles.includes(role));

    const isMentor = roles.includes("mentor");

    if (isAdminLike) {
      // bebas
    } else if (isMentor) {
      if (!user.mentorProfileId) {
        throw {
          status: 403,
          message: "Mentor profile tidak ditemukan",
        };
      }

      if (course.mentorId !== user.mentorProfileId) {
        throw {
          status: 403,
          message: "Akses ditolak: bukan pemilik course ini",
        };
      }
    } else {
      throw {
        status: 403,
        message: "Akses ditolak",
      };
    }

    // 🔢 HITUNG COPY KE BERAPA
    const existingCopies = await prisma.eLearningCourse.count({
      where: {
        title: {
          startsWith: `${course.title}-copy`,
        },
      },
    });

    const copyNumber = existingCopies + 1;
    const newTitle = `${course.title}-copy ${copyNumber}`;

    // ======================
    // 1. CREATE COURSE
    // ======================
    const newCourse = await prisma.eLearningCourse.create({
      data: {
        id: generateCourseId(),
        mentorId: course.mentorId,
        title: newTitle,
        description: course.description,
        thumbnailImages: course.thumbnailImages,
        category: course.category,
        tags: course.tags,
        targetAudience: course.targetAudience,
        level: course.level,
        estimatedDuration: course.estimatedDuration,
        benefits: course.benefits,
        toolsUsed: course.toolsUsed,
        isActive: false,
        status: "ARCHIVED",
      },
    });

    // ======================
    // 2. DUPLICATE SUBCHAPTER
    // ======================
    for (const subChapter of course.subChapters) {
      const newSubChapter = await prisma.eLearningSubChapter.create({
        data: {
          id: generateSubChapterId(),
          courseId: newCourse.id,
          title: `${subChapter.title}-copy ${copyNumber}`,
          coverImage: subChapter.coverImage,
          description: subChapter.description,
          orderNumber: subChapter.orderNumber,
          estimatedTime: subChapter.estimatedTime,
          taskType: subChapter.taskType,
          status: "ARCHIVED",
        },
      });

      // ======================
      // 3. DUPLICATE SUBBAB
      // ======================
      for (const subBab of subChapter.subBabs) {
        const newSubBab = await prisma.eLearningSubBab.create({
          data: {
            id: generateSubBabId(),
            subChapterId: newSubChapter.id,
            title: `${subBab.title}-copy ${copyNumber}`,
            orderNumber: subBab.orderNumber,
            estimatedTime: subBab.estimatedTime,
            status: "ARCHIVED",
          },
        });

        // ======================
        // 4. DUPLICATE TEXT
        // ======================
        for (const text of subBab.texts) {
          await prisma.eLearningText.create({
            data: {
              id: generateTextId(),
              subBabId: newSubBab.id,
              title: text.title ? `${text.title}-copy ${copyNumber}` : null,
              orderNumber: text.orderNumber,
              status: "ARCHIVED",
            },
          });
        }
      }
    }

    return newCourse;
  },
};
