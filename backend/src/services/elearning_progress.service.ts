import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { elearningThumbnailPath } from "../middlewares/uploadImage.js";

const prisma = new PrismaClient();

export const getMyProgress = async (opts: {
  userId: string;
  page?: number;
  limit?: number;
  courseId?: string;
  isCompleted?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const {
    userId,
    page = 1,
    limit = 20,
    courseId,
    isCompleted,
    sortBy,
    sortOrder = "desc",
  } = opts;

  /**
   * WHERE clause (SECURE: selalu pakai userId)
   */
  const where: Prisma.ELearningProgressWhereInput = {
    userId,
  };

  // Filter by completion
  if (typeof isCompleted === "boolean") {
    where.isCompleted = isCompleted;
  }

  // Filter by course
  if (courseId) {
    where.subBab = {
      subChapter: {
        courseId,
      },
    };
  }

  /**
   * Total count
   */
  const total = await prisma.eLearningProgress.count({ where });

  /**
   * Sorting whitelist
   */
  const sortableFields: Array<
    keyof Prisma.ELearningProgressOrderByWithRelationInput
  > = ["lastAccessed", "timeSpent"];

  const orderBy: Prisma.ELearningProgressOrderByWithRelationInput =
    sortBy && sortableFields.includes(sortBy as any)
      ? { [sortBy]: sortOrder }
      : { lastAccessed: "desc" };

  /**
   * Fetch data
   */
  const rows = await prisma.eLearningProgress.findMany({
    where,
    include: {
      subBab: {
        select: {
          id: true,
          title: true,
          orderNumber: true,
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
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: rows,
  };
};

export const getSubBabProgress = async ({
  userId,
  subBabId,
}: {
  userId: string;
  subBabId: string;
}) => {
  /**
   * 1. Ambil SubBab + relasi Course
   */
  const subBab = await prisma.eLearningSubBab.findUnique({
    where: { id: subBabId },
    include: {
      subChapter: {
        select: {
          courseId: true,
        },
      },
      videos: true,
      texts: true,
      quiz: true,
      assignment: true,
    },
  });

  if (!subBab) {
    throw new Error("Sub-bab tidak ditemukan");
  }

  const courseId = subBab.subChapter.courseId;

  /**
   * 2. Pastikan user memiliki subscription aktif
   */
  const now = new Date();

  const activeSubscription = await prisma.eLearningSubscription.findFirst({
    where: {
      userId,
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
    throw new Error("Anda belum memiliki subscription aktif");
  }

  /**
   * 3. Ambil progress (boleh null)
   */
  const progress = await prisma.eLearningProgress.findUnique({
    where: {
      userId_subBabId: {
        userId,
        subBabId,
      },
    },
  });

  /**
   * 4. Normalized response
   */
  return {
    subBab: {
      id: subBab.id,
      title: subBab.title,
      estimatedTime: subBab.estimatedTime,
      videos: subBab.videos,
      texts: subBab.texts,
      quiz: subBab.quiz,
      assignment: subBab.assignment,
    },
    progress: {
      exists: !!progress,
      isCompleted: progress?.isCompleted ?? false,
      lastAccessed: progress?.lastAccessed ?? null,
      timeSpent: progress?.timeSpent ?? 0,
    },
  };
};

export const completeSubBab = async ({
  userId,
  subBabId,
}: {
  userId: string;
  subBabId: string;
}) => {
  const subBab = await prisma.eLearningSubBab.findUnique({
    where: { id: subBabId },
    select: {
      id: true,
      subChapter: {
        select: {
          courseId: true,
        },
      },
    },
  });

  if (!subBab) {
    const err = new Error("Sub-bab tidak ditemukan");
    (err as any).statusCode = 404;
    throw err;
  }

  const courseId = subBab.subChapter.courseId;

  /**
   * 🔥 GANTI: cek subscription aktif (bukan purchase)
   */
  const now = new Date();

  const activeSubscription = await prisma.eLearningSubscription.findFirst({
    where: {
      userId,
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
    const err = new Error("Anda belum memiliki subscription aktif");
    (err as any).statusCode = 403;
    throw err;
  }

  const progress = await prisma.eLearningProgress.upsert({
    where: {
      userId_subBabId: {
        userId,
        subBabId,
      },
    },
    update: {
      isCompleted: true,
      lastAccessed: new Date(),
    },
    create: {
      userId,
      subBabId,
      isCompleted: true,
      lastAccessed: new Date(),
      timeSpent: 0,
    },
  });

  return progress;
};

export const updateSubBabProgress = async ({
  userId,
  subBabId,
  payload,
}: {
  userId: string;
  subBabId: string;
  payload: {
    timeSpent?: number;
    isCompleted?: boolean;
  };
}) => {
  /**
   * 1. Ambil SubBab + Course
   */
  const subBab = await prisma.eLearningSubBab.findUnique({
    where: { id: subBabId },
    select: {
      subChapter: {
        select: { courseId: true },
      },
    },
  });

  if (!subBab) {
    const err = new Error("Sub-bab tidak ditemukan");
    (err as any).statusCode = 404;
    throw err;
  }

  const courseId = subBab.subChapter.courseId;

  /**
   * 2. Pastikan user memiliki subscription aktif
   */
  const now = new Date();

  const activeSubscription = await prisma.eLearningSubscription.findFirst({
    where: {
      userId,
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
    throw new Error("Anda belum memiliki subscription aktif");
  }

  /**
   * 3. Ambil progress lama
   */
  const existing = await prisma.eLearningProgress.findUnique({
    where: {
      userId_subBabId: { userId, subBabId },
    },
  });

  /**
   * 4. Batasi timeSpent per request
   */
  const MAX_TIME_SPENT_PER_REQUEST = 300;
  const safeTimeSpent = Math.min(
    payload.timeSpent ?? 0,
    MAX_TIME_SPENT_PER_REQUEST
  );

  const newTimeSpent = (existing?.timeSpent ?? 0) + safeTimeSpent;

  const isCompleted =
    payload.isCompleted === true ? true : existing?.isCompleted ?? false;

  /**
   * 5. Generate ID custom (hanya kalau create)
   */
  let progressId: string | undefined;
  if (!existing) {
    progressId = `PROGRESS-${userId}-${subBabId}-${crypto
      .randomBytes(4)
      .toString("hex")}`;
  }

  /**
   * 6. Upsert progress
   */
  return prisma.eLearningProgress.upsert({
    where: {
      userId_subBabId: { userId, subBabId },
    },
    update: {
      timeSpent: newTimeSpent,
      isCompleted,
      lastAccessed: new Date(),
    },
    create: {
      id: progressId,
      userId,
      subBabId,
      timeSpent: safeTimeSpent,
      isCompleted,
      lastAccessed: new Date(),
    },
  });
};

export const getCourseProgress = async ({
  userId,
  courseId,
}: {
  userId: string;
  courseId: string;
}) => {
  /**
   * 1. Validasi course
   */
  const course = await prisma.eLearningCourse.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    const err = new Error("Course tidak ditemukan");
    (err as any).statusCode = 404;
    throw err;
  }

  /**
   * 2. Pastikan user memiliki subscription aktif
   */
  const now = new Date();

  const activeSubscription = await prisma.eLearningSubscription.findFirst({
    where: {
      userId,
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
    throw new Error("Anda belum memiliki subscription aktif");
  }

  /**
   * 3. Hitung total SubBab
   */
  const totalSubBab = await prisma.eLearningSubBab.count({
    where: {
      subChapter: { courseId },
    },
  });

  /**
   * 4. Ambil semua progress user untuk course ini
   */
  const progresses = await prisma.eLearningProgress.findMany({
    where: {
      userId,
      subBab: {
        subChapter: { courseId },
      },
    },
  });

  const completedSubBab = progresses.filter(
    (p) => p.isCompleted === true
  ).length;

  const totalTimeSpent = progresses.reduce(
    (sum, p) => sum + (p.timeSpent ?? 0),
    0
  );

  const progressPercent =
    totalSubBab === 0 ? 0 : Math.round((completedSubBab / totalSubBab) * 100);

  return {
    courseId,
    totalSubBab,
    completedSubBab,
    remainingSubBab: Math.max(totalSubBab - completedSubBab, 0),
    progressPercent,
    totalTimeSpent, // ⏱️ detik
    hasStarted: progresses.length > 0,
    isEligibleCertificate: totalSubBab > 0 && completedSubBab === totalSubBab,
  };
};

export const getSubChapterProgress = async ({
  userId,
  subChapterId,
}: {
  userId: string;
  subChapterId: string;
}) => {
  /**
   * 1. Ambil SubChapter + Course
   */
  const subChapter = await prisma.eLearningSubChapter.findUnique({
    where: { id: subChapterId },
    include: {
      course: {
        select: { id: true },
      },
      subBabs: {
        orderBy: { orderNumber: "asc" },
        include: {
          progresses: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!subChapter) {
    const err = new Error("Sub-chapter tidak ditemukan");
    (err as any).statusCode = 404;
    throw err;
  }

  /**
   * 2. Pastikan user memiliki subscription aktif
   */
  const now = new Date();

  const activeSubscription = await prisma.eLearningSubscription.findFirst({
    where: {
      userId,
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
    throw new Error("Anda belum memiliki subscription aktif");
  }

  /**
   * 3. Hitung progress
   */
  const totalSubBab = subChapter.subBabs.length;

  const completedSubBab = subChapter.subBabs.filter((sb) =>
    sb.progresses.some((p) => p.isCompleted === true)
  ).length;

  const progressPercent =
    totalSubBab === 0 ? 0 : Math.round((completedSubBab / totalSubBab) * 100);

  /**
   * 4. Mapping SubBab (untuk checklist UI)
   */
  const subBabs = subChapter.subBabs.map((sb) => {
    const progress = sb.progresses[0];

    return {
      id: sb.id,
      title: sb.title,
      isCompleted: progress?.isCompleted ?? false,
      timeSpent: progress?.timeSpent ?? 0,
      lastAccessed: progress?.lastAccessed ?? null,
    };
  });

  return {
    subChapterId,
    title: subChapter.title,
    totalSubBab,
    completedSubBab,
    progressPercent,
    hasStarted: subBabs.some((sb) => sb.timeSpent > 0),
    subBabs,
  };
};

export const getCourseRoadmap = async ({
  userId,
  courseId,
}: {
  userId: string;
  courseId: string;
}) => {
  /**
   * 1. Ambil course + sub-structure
   */
  const course = await prisma.eLearningCourse.findUnique({
    where: { id: courseId },
    include: {
      subChapters: {
        orderBy: { orderNumber: "asc" },
        include: {
          subBabs: {
            orderBy: { orderNumber: "asc" },
            include: {
              progresses: {
                where: { userId },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    const err = new Error("Course tidak ditemukan");
    (err as any).statusCode = 404;
    throw err;
  }

  /**
   * 2. 🔥 Validasi subscription aktif (GANTI dari purchase)
   */
  const now = new Date();

  const activeSubscription = await prisma.eLearningSubscription.findFirst({
    where: {
      userId,
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
    const err = new Error("Anda belum memiliki subscription aktif");
    (err as any).statusCode = 403;
    throw err;
  }

  /**
   * 3. Flatten semua SubBab (untuk hitung course progress)
   */
  const allSubBabs = course.subChapters.flatMap((sc) => sc.subBabs);

  const totalSubBab = allSubBabs.length;

  const completedSubBab = allSubBabs.filter((sb) =>
    sb.progresses.some((p) => p.isCompleted === true)
  ).length;

  const progressPercent =
    totalSubBab === 0 ? 0 : Math.round((completedSubBab / totalSubBab) * 100);

  /**
   * 4. Mapping roadmap per Sub-Chapter
   */
  const roadmap = course.subChapters.map((sc) => {
    const total = sc.subBabs.length;
    const completed = sc.subBabs.filter((sb) =>
      sb.progresses.some((p) => p.isCompleted === true)
    ).length;

    return {
      subChapterId: sc.id,
      title: sc.title,
      totalSubBab: total,
      completedSubBab: completed,
      progressPercent: total === 0 ? 0 : Math.round((completed / total) * 100),
      subBabs: sc.subBabs.map((sb) => {
        const progress = sb.progresses[0];
        return {
          id: sb.id,
          title: sb.title,
          isCompleted: progress?.isCompleted ?? false,
          timeSpent: progress?.timeSpent ?? 0,
          lastAccessed: progress?.lastAccessed ?? null,
        };
      }),
    };
  });

  return {
    courseId,
    title: course.title,
    totalSubBab,
    completedSubBab,
    progressPercent,
    isEligibleCertificate: totalSubBab > 0 && completedSubBab === totalSubBab,
    hasStarted: allSubBabs.some(
      (sb) => sb.progresses[0]?.timeSpent && sb.progresses[0].timeSpent > 0
    ),
    roadmap,
  };
};

export const resetSubBabProgress = async ({
  userId,
  subBabId,
  roles,
}: {
  userId: string;
  subBabId: string;
  roles: string[];
}) => {
  /**
   * 1. Ambil SubBab + Course
   */
  const subBab = await prisma.eLearningSubBab.findUnique({
    where: { id: subBabId },
    select: {
      id: true,
      subChapter: {
        select: { courseId: true },
      },
    },
  });

  if (!subBab) {
    const err = new Error("Sub-bab tidak ditemukan");
    (err as any).statusCode = 404;
    throw err;
  }

  const courseId = subBab.subChapter.courseId;

  /**
   * 2. 🔥 Validasi subscription aktif
   *    - WAJIB jika mentee
   *    - SKIP jika admin
   */
  const isAdmin = roles.includes("admin");

  if (!isAdmin) {
    const now = new Date();

    const activeSubscription = await prisma.eLearningSubscription.findFirst({
      where: {
        userId,
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
      const err = new Error("Anda belum memiliki subscription aktif");
      (err as any).statusCode = 403;
      throw err;
    }
  }

  /**
   * 3. Ambil progress
   */
  const progress = await prisma.eLearningProgress.findUnique({
    where: {
      userId_subBabId: {
        userId, // ini sudah target user
        subBabId,
      },
    },
  });

  if (!progress) {
    const err = new Error("Progress SubBab belum ada");
    (err as any).statusCode = 404;
    throw err;
  }

  /**
   * 4. Reset progress
   */
  return prisma.eLearningProgress.update({
    where: { userId_subBabId: { userId, subBabId } },
    data: {
      isCompleted: false,
      timeSpent: 0,
      lastAccessed: null,
    },
  });
};

export const exportElearningProgressToFile = async ({
  format,
  courseId,
}: {
  format: "csv" | "excel";
  courseId?: string;
}): Promise<{ buffer: Buffer; filename: string; mimetype: string }> => {
  const progresses = await prisma.eLearningProgress.findMany({
    where: courseId
      ? {
          subBab: {
            subChapter: {
              courseId,
            },
          },
        }
      : undefined,
    include: {
      user: {
        select: { id: true, fullName: true, email: true },
      },
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
    orderBy: {
      lastAccessed: "desc",
    },
  });

  if (progresses.length === 0) {
    const err = new Error("Data progress tidak ditemukan");
    (err as any).statusCode = 404;
    throw err;
  }

  const rows = progresses.map((p) => ({
    ProgressID: p.id,
    UserName: p.user.fullName,
    UserEmail: p.user.email,
    Course: p.subBab.subChapter.course.title,
    SubChapter: p.subBab.subChapter.title,
    SubBab: p.subBab.title,
    IsCompleted: p.isCompleted ? "Yes" : "No",
    TimeSpentMinutes: p.timeSpent ?? 0,
    LastAccessed: p.lastAccessed
      ? formatDate(p.lastAccessed, "yyyy-MM-dd HH:mm:ss")
      : "-",
  }));

  const randomString = (length: number) => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  // 🔹 CSV
  if (format === "csv") {
    const csv = await parseAsync(rows);
    return {
      buffer: Buffer.from(csv, "utf-8"),
      filename: `elearning_progress_${Date.now()}_${randomString(6)}.csv`,
      mimetype: "text/csv",
    };
  }

  // 🔹 Excel
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("E-Learning Progress");

  worksheet.columns = Object.keys(rows[0]).map((key) => ({
    header: key,
    key,
    width: 25,
  }));

  rows.forEach((row) => worksheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer: Buffer.from(buffer),
    filename: `elearning_progress_${Date.now()}_${randomString(6)}.xlsx`,
    mimetype:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
};
