import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { elearningThumbnailPath } from "../middlewares/uploadImage.js";

const prisma = new PrismaClient();

export const createCourseReview = async ({
  userId,
  courseId,
  rating,
  comment,
}: {
  userId: string;
  courseId: string;
  rating: number;
  comment?: string;
}) => {
  /**
   * 1. Pastikan course ada & aktif
   */
  const course = await prisma.eLearningCourse.findUnique({
    where: { id: courseId },
    select: { id: true, isActive: true },
  });

  if (!course) {
    const err = new Error("Course tidak ditemukan");
    (err as any).statusCode = 404;
    throw err;
  }

  if (!course.isActive) {
    const err = new Error("Course tidak aktif");
    (err as any).statusCode = 400;
    throw err;
  }

  /**
   * 🔥 2. Pastikan user memiliki subscription aktif
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
   * 3. Pastikan belum pernah review
   */
  const existingReview = await prisma.eLearningReview.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  if (existingReview) {
    const err = new Error("Anda sudah memberikan review untuk course ini");
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
        courseId,
        rating,
        comment,
      },
    });
  } catch (error: any) {
    // Handle race condition (double submit)
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
  const where = {
    courseId,
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
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  // handle anonymous review
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
}: {
  userId: string;
  roles: string[];
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
}) => {
  const isAdmin = roles.includes("admin");

  const where = isAdmin ? {} : { userId };

  const total = await prisma.eLearningReview.count({ where });

  const rows = await prisma.eLearningReview.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: sort },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    meta: { page, limit, total },
    data: rows,
  };
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
  const reviews = await prisma.eLearningReview.findMany({
    where: { courseId },
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
