import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export class ELearningAssignmentService {
  static async createAssignment(
    textId: string,
    body: {
      title: string;
      description?: string;
      dueDays: number;
    },
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    },
  ) {
    return await prisma.$transaction(async (tx) => {
      // ====== Cek Text ======
      const text = await tx.eLearningText.findUnique({
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
        throw new Error("Text tidak ditemukan");
      }

      // ====== Cek assignment existing ======
      const existing = await tx.eLearningAssignment.findUnique({
        where: {
          textId,
        },
      });

      if (existing) {
        throw new Error("Text ini sudah memiliki assignment");
      }

      // ====== Validasi mentor ======
      if (user.roles.includes("mentor")) {
        const mentorId = text.subBab.subChapter.course.mentorId;

        if (mentorId !== user.mentorProfileId) {
          throw new Error(
            "Mentor tidak memiliki izin membuat assignment di course ini",
          );
        }
      }

      // ====== Generate custom ID ======
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");

      const randomHex = crypto.randomBytes(6).toString("hex");

      const assignmentId = `assignment-${formattedDate}-${randomHex}`;

      // ====== Create assignment ======
      const assignment = await tx.eLearningAssignment.create({
        data: {
          id: assignmentId,
          textId,
          title: body.title,
          description: body.description ?? null,
          dueDays: body.dueDays,
        },
        include: {
          text: {
            select: {
              id: true,
              title: true,
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
          },
        },
      });

      return assignment;
    });
  }

  static async getAssignment(
    textId: string,
    user: {
      userId: string;
      roles: string[];
    },
    opts: {
      includeSubmissions?: boolean;
      page?: number;
      limit?: number;
      sortBy?: "createdAt" | "updatedAt" | "score" | "submittedAt";
      order?: "asc" | "desc";
      search?: string;
      minScore?: number;
      maxScore?: number;
    },
  ) {
    const assignment = await prisma.eLearningAssignment.findUnique({
      where: {
        textId,
      },
      include: {
        text: {
          select: {
            id: true,
            title: true,
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
                        mentorId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new Error("Assignment tidak ditemukan");
    }

    const isAdmin = user.roles.includes("admin");
    const isMentor = user.roles.includes("mentor");
    const isMentee = user.roles.includes("mentee");

    const course = assignment.text.subBab.subChapter.course;

    // ======================
    // ACCESS CONTROL
    // ======================

    if (isAdmin) {
      // allow
    } else if (isMentor) {
      if (course.mentorId !== user.userId) {
        throw new Error("Mentor tidak memiliki izin mengakses assignment ini");
      }
    } else if (isMentee) {
      const now = new Date();

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
            gte: now,
          },
        },
      });

      if (!activeSubscription) {
        throw new Error("Mentee tidak memiliki subscription aktif");
      }
    } else {
      throw new Error("Akses ditolak");
    }

    const includeSubs = opts.includeSubmissions ?? false;

    if (!includeSubs) {
      return {
        id: assignment.id,
        textId: assignment.textId,
        title: assignment.title,
        description: assignment.description,
        dueDays: assignment.dueDays,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,

        text: assignment.text,
      };
    }

    // ======================
    // SUBMISSIONS
    // ======================

    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const limit = opts.limit && opts.limit > 0 ? opts.limit : 10;
    const skip = (page - 1) * limit;

    const subWhere: any = {
      assignmentId: assignment.id,
    };

    if (
      typeof opts.minScore === "number" ||
      typeof opts.maxScore === "number"
    ) {
      subWhere.score = {};

      if (typeof opts.minScore === "number") {
        subWhere.score.gte = opts.minScore;
      }

      if (typeof opts.maxScore === "number") {
        subWhere.score.lte = opts.maxScore;
      }
    }

    if (opts.search) {
      subWhere.OR = [
        {
          fileName: {
            contains: opts.search,
            mode: "insensitive",
          },
        },
        {
          notes: {
            contains: opts.search,
            mode: "insensitive",
          },
        },
        {
          user: {
            fullName: {
              contains: opts.search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const sortField = opts.sortBy ?? "submittedAt";
    const order = opts.order ?? "desc";

    const total = await prisma.eLearningSubmission.count({
      where: subWhere,
    });

    const submissions = await prisma.eLearningSubmission.findMany({
      where: subWhere,
      orderBy: {
        [sortField]: order,
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return {
      id: assignment.id,
      textId: assignment.textId,
      title: assignment.title,
      description: assignment.description,
      dueDays: assignment.dueDays,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,

      text: assignment.text,

      submissions: {
        data: submissions,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  static async updateAssignment(
    assignmentId: string,
    data: {
      title?: string;
      description?: string;
      dueDays?: number;
    },
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    },
  ) {
    return await prisma.$transaction(async (tx) => {
      // ======================
      // Cek assignment
      // ======================

      const assignment = await tx.eLearningAssignment.findUnique({
        where: {
          id: assignmentId,
        },
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

      if (!assignment) {
        throw new Error("Assignment tidak ditemukan");
      }

      // ======================
      // Validasi mentor
      // ======================

      if (user.roles.includes("mentor")) {
        const courseMentorId =
          assignment.text.subBab.subChapter.course.mentorId;

        if (courseMentorId !== user.userId) {
          throw new Error(
            "Mentor tidak memiliki izin memperbarui assignment ini",
          );
        }
      }

      // ======================
      // Update
      // ======================

      const updated = await tx.eLearningAssignment.update({
        where: {
          id: assignmentId,
        },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          text: {
            select: {
              id: true,
              title: true,

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
          },
        },
      });

      return updated;
    });
  }

  static async deleteAssignment(
    assignmentId: string,
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    },
  ) {
    return await prisma.$transaction(async (tx) => {
      const assignment = await tx.eLearningAssignment.findUnique({
        where: { id: assignmentId },
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

      if (!assignment) {
        throw new Error("Assignment tidak ditemukan");
      }

      // Validasi mentor
      if (user.roles.includes("mentor")) {
        const mentorId = assignment.text.subBab.subChapter.course.mentorId;

        if (mentorId !== user.mentorProfileId) {
          throw new Error(
            "Mentor tidak memiliki izin menghapus assignment ini",
          );
        }
      }

      await tx.eLearningAssignment.delete({
        where: {
          id: assignmentId,
        },
      });

      return {
        id: assignment.id,
        title: assignment.title,
        text: {
          id: assignment.text.id,
          title: assignment.text.title,
          subBab: {
            id: assignment.text.subBab.id,
            title: assignment.text.subBab.title,
            subChapter: {
              id: assignment.text.subBab.subChapter.id,
              title: assignment.text.subBab.subChapter.title,
              course: {
                id: assignment.text.subBab.subChapter.course.id,
                title: assignment.text.subBab.subChapter.course.title,
              },
            },
          },
        },
      };
    });
  }

  static async getAllAssignments(
    user: { userId: string; roles: string[]; mentorProfileId?: string },
    query: {
      search?: string;
      page?: number;
      limit?: number;
      sortBy?: "createdAt" | "updatedAt" | "score" | "submittedAt";
      order?: "asc" | "desc";
      minScore?: number;
      maxScore?: number;
    },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // Search (title / description)
    if (query.search) {
      whereClause.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // Filtering by mentor (if not admin)
    if (user.roles.includes("mentor")) {
      whereClause.text = {
        subBab: {
          subChapter: {
            course: {
              mentorProfile: {
                userId: user.userId,
              },
            },
          },
        },
      };
    }

    // 🔹 Filtering by score range (optional, if needed)
    if (query.minScore || query.maxScore) {
      whereClause.submissions = {
        some: {
          score: {
            gte: query.minScore ?? undefined,
            lte: query.maxScore ?? undefined,
          },
        },
      };
    }

    // Sorting
    const orderBy: any = {};
    orderBy[query.sortBy ?? "createdAt"] = query.order ?? "desc";

    // Fetch data with pagination
    const [data, total] = await Promise.all([
      prisma.eLearningAssignment.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy,
        include: {
          text: {
            select: {
              id: true,
              title: true,
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
                          mentorProfile: {
                            select: {
                              id: true,
                              userId: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },

          submissions: {
            select: {
              id: true,
              userId: true,
              score: true,
              submittedAt: true,
            },
          },
        },
      }),
      prisma.eLearningAssignment.count({ where: whereClause }),
    ]);

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

  static async getAssignmentDetail(
    assignmentId: string,
    user: {
      userId: string;
      roles: string[];
      mentorProfileId?: string;
    },
  ) {
    const assignment = await prisma.eLearningAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        text: {
          include: {
            subBab: {
              include: {
                subChapter: {
                  include: {
                    course: {
                      include: {
                        mentorProfile: {
                          select: {
                            id: true,
                            userId: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },

        instructions: {
          orderBy: {
            orderNumber: "asc",
          },
        },

        supportingFiles: true,

        submissions: {
          select: {
            id: true,
            userId: true,
            score: true,
            status: true,
            submittedAt: true,
            reviewedAt: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new Error("Assignment tidak ditemukan");
    }

    const course = assignment.text.subBab.subChapter.course;

    // ===== VALIDASI AKSES =====

    if (user.roles.includes("admin")) {
      // boleh akses semua
    } else if (user.roles.includes("mentor")) {
      if (course.mentorProfile.userId !== user.userId) {
        throw new Error("Mentor tidak memiliki izin mengakses assignment ini");
      }
    } else if (user.roles.includes("mentee")) {
      const now = new Date();

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
            gte: now,
          },

          // tambahkan jika ada field courseId
          // courseId: course.id,
        },
      });

      if (!activeSubscription) {
        throw new Error(
          "Mentee tidak memiliki akses karena tidak ada subscription aktif",
        );
      }
    } else {
      throw new Error("Role tidak dikenali");
    }

    return {
      id: assignment.id,
      textId: assignment.textId,

      title: assignment.title,
      description: assignment.description,
      dueDays: assignment.dueDays,

      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,

      text: {
        id: assignment.text.id,
        title: assignment.text.title,
      },

      subBab: {
        id: assignment.text.subBab.id,
        title: assignment.text.subBab.title,
      },

      subChapter: {
        id: assignment.text.subBab.subChapter.id,
        title: assignment.text.subBab.subChapter.title,
      },

      course: {
        id: course.id,
        title: course.title,
        mentor: {
          id: course.mentorProfile.id,
          userId: course.mentorProfile.userId,
        },
      },

      instructions: assignment.instructions,

      supportingFiles: assignment.supportingFiles,

      submissions: assignment.submissions,
    };
  }

  static async getAssignmentsByCourse(
    courseId: string,
    user: { userId: string; roles: string[]; mentorProfileId?: string },
    options: {
      page?: number;
      limit?: number;
      sortBy?: "createdAt" | "updatedAt" | "title";
      order?: "asc" | "desc";
      search?: string;
    },
  ) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      search,
    } = options;

    return await prisma.$transaction(async (tx) => {
      // ====== Cek course ======
      const course = await tx.eLearningCourse.findUnique({
        where: { id: courseId },
        include: {
          mentorProfile: true,
        },
      });

      if (!course) {
        throw new Error("Course tidak ditemukan");
      }

      // ====== Validasi mentor ======
      if (
        user.roles.includes("mentor") &&
        course.mentorProfile.userId !== user.userId
      ) {
        throw new Error(
          "Mentor tidak memiliki izin melihat assignment course ini",
        );
      }

      // ====== Filter ======
      const whereCondition: Prisma.ELearningAssignmentWhereInput = {
        text: {
          subBab: {
            subChapter: {
              courseId,
            },
          },
        },
      };

      if (search) {
        whereCondition.OR = [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      // ====== Total ======
      const total = await tx.eLearningAssignment.count({
        where: whereCondition,
      });

      // ====== Data ======
      const assignments = await tx.eLearningAssignment.findMany({
        where: whereCondition,
        include: {
          text: {
            select: {
              id: true,
              title: true,

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
          },

          _count: {
            select: {
              submissions: true,
            },
          },
        },

        orderBy: {
          [sortBy]: order,
        },

        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        data: assignments,
      };
    });
  }

  static async exportAssignmentsToFile(
    exportFormat: "csv" | "excel",
  ): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const assignments = await prisma.eLearningAssignment.findMany({
      include: {
        text: {
          include: {
            subBab: {
              include: {
                subChapter: {
                  include: {
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
        },

        submissions: true,
      },
    });

    const rows = assignments.map((assignment) => ({
      ID: assignment.id,

      TextID: assignment.text.id,
      TextTitle: assignment.text.title ?? "-",

      Title: assignment.title,
      Description: assignment.description || "-",
      DueDays: assignment.dueDays ?? "-",

      SubBabID: assignment.text.subBab.id,
      SubBabTitle: assignment.text.subBab.title,

      SubChapterID: assignment.text.subBab.subChapter.id,
      SubChapterTitle: assignment.text.subBab.subChapter.title,

      CourseID: assignment.text.subBab.subChapter.course.id,
      CourseTitle: assignment.text.subBab.subChapter.course.title,

      TotalSubmissions: assignment.submissions.length,

      CreatedAt: formatDate(
        assignment.createdAt ?? new Date(),
        "yyyy-MM-dd HH:mm:ss",
      ),

      UpdatedAt: formatDate(
        assignment.updatedAt ?? new Date(),
        "yyyy-MM-dd HH:mm:ss",
      ),
    }));

    // fungsi kecil buat generate nama file random
    function randomString(length: number) {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join("");
    }

    if (exportFormat === "csv") {
      const csv = await parseAsync(rows);
      return {
        buffer: Buffer.from(csv, "utf-8"),
        filename: `assignments_${Date.now()}_${randomString(6)}.csv`,
        mimetype: "text/csv",
      };
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Assignments");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 30,
    }));

    rows.forEach((row) => worksheet.addRow(row));

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      filename: `assignments_${Date.now()}_${randomString(6)}.xlsx`,
      mimetype:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }
}
