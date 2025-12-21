import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { elearningThumbnailPath } from "../middlewares/uploadImage.js";

const prisma = new PrismaClient();

type CreateInput = {
  userId: string;
  courseId: string;
  referralUsageId?: string;
};

const generatePaymentId = async (): Promise<string> => {
  const datePart = formatDate(new Date(), "yyyyMMdd");

  for (let i = 0; i < 10; i++) {
    const random = Math.floor(1000000000 + Math.random() * 9000000000);
    const id = `PAY-EL-${datePart}-${random}`;

    const exists = await prisma.payment.findUnique({ where: { id } });
    if (!exists) return id;
  }

  throw { status: 500, message: "Gagal generate payment id" };
};

const generatePurchaseId = async (): Promise<string> => {
  for (let i = 0; i < 10; i++) {
    const random = Math.floor(1000000000 + Math.random() * 9000000000);
    const id = `ELEARN-${random}`;

    const exists = await prisma.eLearningPurchase.findUnique({
      where: { id },
    });

    if (!exists) return id;
  }

  throw { status: 500, message: "Gagal generate purchase id" };
};

export const createELearningPurchase = async (input: CreateInput) => {
  const { userId, courseId, referralUsageId } = input;

  // cek course
  const course = await prisma.eLearningCourse.findUnique({
    where: { id: courseId },
    select: { id: true, price: true, isActive: true },
  });

  if (!course || !course.isActive)
    throw { status: 404, message: "Course tidak ditemukan atau tidak aktif" };

  // cek user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) throw { status: 404, message: "User tidak ditemukan" };

  // cek duplikat purchase
  const existingPurchase = await prisma.eLearningPurchase.findFirst({
    where: { userId, courseId },
  });

  if (existingPurchase)
    throw { status: 400, message: "Anda sudah membeli course ini" };

  // referral
  let discount = 0;
  let commission = 0;
  let referralCodeId: string | null = null;

  const originalPrice = course.price.toNumber();
  let finalPrice = originalPrice;

  if (referralUsageId) {
    const ru = await prisma.referralUsage.findUnique({
      where: { id: referralUsageId },
      include: {
        referralCode: true,
        eLearningPurchase: true,
        booking: true,
        practicePurchase: true,
      },
    });

    if (!ru) throw { status: 404, message: "Referral usage tidak ditemukan" };
    if (ru.eLearningPurchase || ru.booking || ru.practicePurchase)
      throw { status: 400, message: "Referral usage sudah digunakan" };

    discount = ru.referralCode.discountPercentage.toNumber();
    commission = ru.referralCode.commissionPercentage.toNumber();
    referralCodeId = ru.referralCode.id;

    finalPrice = originalPrice * (1 - discount / 100);
  }

  // Transaction
  const createdPurchase = await prisma.$transaction(async (tx) => {
    const purchaseId = await generatePurchaseId();

    const purchase = await tx.eLearningPurchase.create({
      data: {
        id: purchaseId,
        userId,
        courseId,
        referralUsageId,
        status: "pending",
      },
      include: {
        payment: true,
      },
    });

    const paymentId = await generatePaymentId();

    const payment = await tx.payment.create({
      data: {
        id: paymentId,
        eLearningPurchaseId: purchase.id,
        amount: finalPrice,
        status: "pending",
      },
    });

    // commission
    if (referralUsageId && referralCodeId) {
      const amount = finalPrice * (commission / 100);

      await tx.referralCommisions?.create({
        data: {
          referralCodeId,
          transactionId: payment.id,
          amount,
          created_at: new Date(),
        },
      });
    }

    return {
      ...purchase,
      payment,
      originalPrice,
      finalPrice,
    };
  });

  return createdPurchase;
};

export const getMyPurchases = async (opts: {
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const { userId, page = 1, limit = 10, search, status } = opts;

  const where: any = { userId };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { id: { contains: search } },
      { course: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  const total = await prisma.eLearningPurchase.count({ where });
  const purchases = await prisma.eLearningPurchase.findMany({
    where,
    include: {
      course: { select: { id: true, title: true, mentorId: true } },
      payment: true,
    },
    orderBy: { purchaseDate: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return { meta: { page, limit, total }, data: purchases };
};

export const getPurchaseDetail = async (purchaseId: string, user: any) => {
  const purchase = await prisma.eLearningPurchase.findUnique({
    where: { id: purchaseId },
    include: {
      course: { include: { mentorProfile: true } },
      user: true,
      payment: true,
      referralUsage: true,
    },
  });

  if (!purchase) throw { status: 404, message: "Purchase tidak ditemukan" };

  // RBAC:
  if (user.roles.includes("admin")) {
    // ok
  } else if (user.roles.includes("mentor")) {
    // check mentor owns course
    const mentorProfileId = user.mentorProfileId;
    if (!mentorProfileId || purchase.course.mentorId !== mentorProfileId) {
      throw {
        status: 403,
        message: "Mentor tidak berwenang mengakses purchase ini",
      };
    }
  } else if (user.roles.includes("mentee")) {
    if (purchase.userId !== user.userId) {
      throw {
        status: 403,
        message: "Anda tidak berwenang mengakses purchase ini",
      };
    }
  } else {
    throw { status: 403, message: "Role tidak berwenang" };
  }

  return purchase;
};

export const cancelPurchase = async (purchaseId: string, userId: string) => {
  const purchase = await prisma.eLearningPurchase.findUnique({
    where: { id: purchaseId },
    include: { payment: true },
  });

  if (!purchase) throw { status: 404, message: "Purchase tidak ditemukan" };
  if (purchase.userId !== userId)
    throw { status: 403, message: "Bukan owner purchase" };

  // hanya dapat batalkan jika status pending
  if (purchase.status !== "pending")
    throw {
      status: 400,
      message: "Hanya purchase dengan status 'pending' dapat dibatalkan",
    };

  const result = await prisma.$transaction(async (tx) => {
    // jika payment exist dan pending -> hapus payment atau ubah status cancelled
    if (purchase.payment) {
      if (purchase.payment.status === "pending") {
        await tx.payment.delete({ where: { id: purchase.payment.id } });
      } else {
        // jika sudah paid, tidak bisa cancel via endpoint ini
        throw {
          status: 400,
          message:
            "Payment sudah diproses, tidak bisa dibatalkan lewat endpoint ini",
        };
      }
    }

    const updated = await tx.eLearningPurchase.update({
      where: { id: purchaseId },
      data: { status: "cancelled", updatedAt: new Date() },
    });

    return updated;
  });

  return result;
};

export const getAllPurchases = async (opts: {
  user: any;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const {
    user,
    page = 1,
    limit = 20,
    search,
    status,
    sortBy,
    sortOrder = "desc",
  } = opts;

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { id: { contains: search } },
      { course: { title: { contains: search, mode: "insensitive" } } },
      { user: { fullName: { contains: search, mode: "insensitive" } } },
    ];
  }

  // If mentor -> restrict to their courses
  if (user.roles.includes("mentor")) {
    where.course = { mentorId: user.mentorProfileId };
  }

  const total = await prisma.eLearningPurchase.count({ where });

  const orderBy: any = sortBy
    ? { [sortBy]: sortOrder }
    : { purchaseDate: "desc" };

  const rows = await prisma.eLearningPurchase.findMany({
    where,
    include: {
      course: { select: { id: true, title: true, mentorId: true } },
      user: { select: { id: true, fullName: true, email: true } },
      payment: true,
    },
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
  });

  return { meta: { page, limit, total }, data: rows };
};
