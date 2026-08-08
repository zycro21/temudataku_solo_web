import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { elearningThumbnailPath } from "../middlewares/uploadImage.js";

const prisma = new PrismaClient();

export const createSubChapterReview = async ({
  userId,
  subChapterId,
  rating,
  comment,
}: {
  userId: string;
  subChapterId: string;
  rating: number;
  comment?: string;
}) => {
  /**
   * 1. Pastikan sub-chapter ada & published
   *    🔥 UBAH: Course pakai field `isActive` (boolean), tapi SubChapter
   *    pakai `status` (enum CourseStatus: DRAFT/PUBLISHED/ARCHIVED) —
   *    jadi pengecekannya beda, bukan sekadar rename `courseId` jadi
   *    `subChapterId` doang.
   */
  const subChapter = await prisma.eLearningSubChapter.findUnique({
    where: { id: subChapterId },
    select: { id: true, status: true },
  });

  if (!subChapter) {
    const err = new Error("Sub-chapter tidak ditemukan");
    (err as any).statusCode = 404;
    throw err;
  }

  if (subChapter.status !== "PUBLISHED") {
    const err = new Error("Sub-chapter tidak aktif");
    (err as any).statusCode = 400;
    throw err;
  }

  /**
   * 🔥 2. Pastikan user memiliki subscription aktif
   * (TIDAK diubah — subscription tetap general, tidak spesifik per
   * course/subChapter, persis seperti perilaku aslinya. Kalau kamu mau
   * ini dibuat spesifik ke course induk sub-chapter ini, kasih tahu,
   * itu perubahan behavior terpisah dari sekadar migrasi skema.)
   */
  const now = new Date();

  const activeSubscription = await prisma.eLearningSubscription.findFirst({
    where: {
      userId,
      status: { in: ["active", "confirmed", "completed"] },
      startAt: { lte: now },
      endAt: { gte: now },
    },
  });

  if (!activeSubscription) {
    const err = new Error("Anda belum memiliki subscription aktif");
    (err as any).statusCode = 403;
    throw err;
  }

  /**
   * 3. Pastikan belum pernah review sub-chapter ini
   *    🔥 UBAH: nama compound unique key ikut berubah karena field-nya
   *    beda — `userId_courseId` → `userId_subChapterId` (sesuai
   *    `@@unique([userId, subChapterId])` di schema baru).
   */
  const existingReview = await prisma.eLearningReview.findUnique({
    where: {
      userId_subChapterId: { userId, subChapterId },
    },
  });

  if (existingReview) {
    const err = new Error("Anda sudah memberikan review untuk sub-chapter ini");
    (err as any).statusCode = 400;
    throw err;
  }

  /**
   * 4. Create review (protected by unique constraint)
   */
  try {
    return await prisma.eLearningReview.create({
      data: {
        userId,
        subChapterId,
        rating,
        comment,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      const err = new Error("Review sudah pernah diberikan");
      (err as any).statusCode = 400;
      throw err;
    }
    throw error;
  }
};

export const getCourseReviews = async ({
  courseId,
  page = 1,
  limit = 10000,
}: {
  courseId: string;
  page?: number;
  limit?: number;
}) => {
  // 🔥 BARU: review sekarang nempel ke SubChapter, bukan langsung ke
  // Course. Jadi harus ambil dulu daftar subChapterId yang termasuk
  // course ini, baru filter review berdasarkan itu — sama pola dengan
  // "kumpulkan dulu, baru gabung" di endpoint-endpoint sebelumnya.
  const subChapters = await prisma.eLearningSubChapter.findMany({
    where: { courseId },
    select: { id: true },
  });
  const subChapterIds = subChapters.map((sc) => sc.id);

  if (subChapterIds.length === 0) {
    return { meta: { page, limit, total: 0 }, data: [] };
  }

  const where = {
    subChapterId: { in: subChapterIds },
    isPublic: true,
  };

  const total = await prisma.eLearningReview.count({ where });

  const rows = await prisma.eLearningReview.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          profilePicture: true,
        },
      },
      // 🔥 BARU: include info subChapter-nya — dulu review langsung
      // nempel ke course jadi "kelas mana" nggak relevan, sekarang perlu
      // eksplisit di-include supaya frontend tetap tau review ini dari
      // subChapter (kelas) yang mana di dalam course tersebut.
      subChapter: {
        select: { id: true, title: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  // handle anonymous review — TIDAK berubah
  const sanitizedRows = rows.map((review) => {
    if (review.isAnonymous) {
      return {
        ...review,
        user: {
          id: null,
          fullName: "Anonymous",
          profilePicture: null,
        },
      };
    }
    return review;
  });

  return {
    meta: { page, limit, total },
    data: sanitizedRows,
  };
};

export const getMyReviews = async ({
  userId,
  roles,
  page = 1,
  limit = 10,
  sort = "desc",
  subChapterId, // 🔥 BARU
}: {
  userId: string;
  roles: string[];
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
  subChapterId?: string;
}) => {
  const isAdmin = roles.includes("admin");

  // 🔥 UBAH: filter `subChapterId` digabung ke where yang sudah ada.
  // Kalau nggak diisi, behavior lama (list semua review milik user, atau
  // semua review kalau admin) tetap sama persis — nggak ada breaking
  // change buat pemanggil yang sudah ada (halaman "review saya").
  const where = {
    ...(isAdmin ? {} : { userId }),
    ...(subChapterId && { subChapterId }),
  };

  const total = await prisma.eLearningReview.count({ where });

  const rows = await prisma.eLearningReview.findMany({
    where,
    include: {
      user: { select: { id: true, fullName: true } },
      subChapter: {
        select: {
          id: true,
          title: true,
          course: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { createdAt: sort },
    skip: (page - 1) * limit,
    take: limit,
  });

  return { meta: { page, limit, total }, data: rows };
};

export const deleteReview = async ({
  reviewId,
  user,
  force = false,
}: {
  reviewId: string;
  user: { userId: string; roles: string[] };
  force?: boolean;
}) => {
  const review = await prisma.eLearningReview.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    const err = new Error("Review tidak ditemukan");
    (err as any).statusCode = 404;
    throw err;
  }

  const isAdmin = user.roles.includes("admin");
  const isOwner = review.userId === user.userId;

  // mentee hanya boleh ke review sendiri
  if (!isAdmin && !isOwner) {
    const err = new Error("Tidak memiliki izin");
    (err as any).statusCode = 403;
    throw err;
  }

  /**
   * MENTEE
   * - hanya unpublish
   */
  if (!isAdmin) {
    await prisma.eLearningReview.update({
      where: { id: reviewId },
      data: { isPublic: false },
    });

    return { action: "unpublished" };
  }

  /**
   * ADMIN
   * - force = true → delete permanen
   * - else → unpublish
   */
  if (force) {
    await prisma.eLearningReview.delete({
      where: { id: reviewId },
    });

    return { action: "deleted" };
  }

  await prisma.eLearningReview.update({
    where: { id: reviewId },
    data: { isPublic: false },
  });

  return { action: "unpublished" };
};

export const updateReview = async ({
  reviewId,
  payload,
  user,
}: {
  reviewId: string;
  payload: {
    rating?: number;
    comment?: string;
    isAnonymous?: boolean;
  };
  user: { userId: string; roles: string[] };
}) => {
  const review = await prisma.eLearningReview.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    const err = new Error("Review tidak ditemukan");
    (err as any).statusCode = 404;
    throw err;
  }

  const isAdmin = user.roles.includes("admin");
  const isOwner = review.userId === user.userId;

  if (!isAdmin) {
    if (!isOwner) {
      const err = new Error("Tidak memiliki izin");
      (err as any).statusCode = 403;
      throw err;
    }

    const createdAt = review.createdAt ?? new Date();
    const diffHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

    if (diffHours > 24) {
      const err = new Error("Review hanya dapat diedit dalam 24 jam");
      (err as any).statusCode = 403;
      throw err;
    }
  }

  return prisma.eLearningReview.update({
    where: { id: reviewId },
    data: payload,
  });
};

export const getReviewSummary = async (courseId: string) => {
  // 🔥 BARU: review sekarang nempel ke SubChapter, bukan Course
  // langsung — ambil dulu daftar subChapterId yang termasuk course ini,
  // baru query review berdasarkan itu (gabungan seluruh "kelas" di
  // course tersebut, sama pola dengan getCourseReviews).
  const subChapters = await prisma.eLearningSubChapter.findMany({
    where: { courseId },
    select: { id: true },
  });
  const subChapterIds = subChapters.map((sc) => sc.id);

  if (subChapterIds.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: {},
    };
  }

  const reviews = await prisma.eLearningReview.findMany({
    where: { subChapterId: { in: subChapterIds } },
    select: { rating: true },
  });

  const total = reviews.length;

  if (!total) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: {},
    };
  }

  const distribution: Record<number, number> = {};
  let sum = 0;

  reviews.forEach((r) => {
    const rate = Number(r.rating);
    sum += rate;
    distribution[rate] = (distribution[rate] || 0) + 1;
  });

  return {
    averageRating: Number((sum / total).toFixed(1)),
    totalReviews: total,
    distribution,
  };
};

export const getAllReviewStats = async () => {
  const reviews = await prisma.eLearningReview.findMany({
    select: {
      rating: true,
      isPublic: true,
      isAnonymous: true,
    },
  });

  const totalReviews = reviews.length;

  if (!totalReviews) {
    return {
      totalReviews: 0,
      averageRating: 0,
      publicReviews: 0,
      anonymousReviews: 0,
    };
  }

  const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);

  return {
    totalReviews,
    averageRating: Number((sum / totalReviews).toFixed(1)),
    publicReviews: reviews.filter((r) => r.isPublic).length,
    anonymousReviews: reviews.filter((r) => r.isAnonymous).length,
  };
};

export const getReviewById = async ({
  reviewId,
  userId,
  roles,
}: {
  reviewId: string;
  userId: string;
  roles: string[];
}) => {
  const review = await prisma.eLearningReview.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
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
  });

  if (!review) {
    const err = new Error("Review tidak ditemukan");
    (err as any).statusCode = 404;
    throw err;
  }

  // Admin & curdev bebas akses review siapa pun. Mentee cuma boleh
  // akses review miliknya sendiri.
  const hasFullAccess = roles.includes("admin") || roles.includes("curdev");
  const isOwner = review.userId === userId;

  if (!hasFullAccess && !isOwner) {
    const err = new Error("Tidak memiliki izin untuk mengakses review ini");
    (err as any).statusCode = 403;
    throw err;
  }

  return review;
};
