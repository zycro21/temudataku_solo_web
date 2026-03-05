import { PrismaClient, Prisma } from "@prisma/client";
import { Parser as Json2CsvParser } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate, subDays } from "date-fns";
import { Buffer } from "buffer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { uploadToGoogleDrive } from "../utils/googleDrive.js";
import QRCode from "qrcode";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateSubscriptionPlanId = () =>
  `SUBPLAN-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

export const createSubscriptionPlan = async (payload: {
  name: string;
  durationDay: number;
  price: number;
  description?: string;
}) => {
  /* === 1. CEK DUPLICATE NAME (CASE INSENSITIVE) === */
  const existing = await prisma.eLearningSubscriptionPlan.findFirst({
    where: {
      name: {
        equals: payload.name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    throw new Error("Subscription plan with this name already exists");
  }

  /* === 2. CREATE PLAN === */
  const newPlan = await prisma.eLearningSubscriptionPlan.create({
    data: {
      id: generateSubscriptionPlanId(),
      name: payload.name,
      durationDay: payload.durationDay,
      price: payload.price,
      description: payload.description,
      isActive: true,
    },
  });

  return newPlan;
};

export const getSubscriptionPlans = async ({
  page = 1,
  limit = 50,
  sortBy = "createdAt",
  sortOrder = "desc",
  isActive = true,
}: {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "price" | "durationDay";
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
}) => {
  const where = {
    isActive,
  };

  /* === 1. TOTAL DATA === */
  const total = await prisma.eLearningSubscriptionPlan.count({ where });

  /* === 2. DATA LIST === */
  const rows = await prisma.eLearningSubscriptionPlan.findMany({
    where,
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      name: true,
      durationDay: true,
      price: true,
      description: true,
      isActive: true,
      createdAt: true,
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: rows,
  };
};

export const updateSubscriptionPlan = async (
  planId: string,
  payload: {
    name?: string;
    durationDay?: number;
    price?: number;
    description?: string;
    isActive?: boolean;
  }
) => {
  /* === 1. CEK PLAN EXIST === */
  const existingPlan = await prisma.eLearningSubscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!existingPlan) {
    throw new Error("Subscription plan not found");
  }

  /* === 2. CEK DUPLICATE NAME (JIKA NAME DIUBAH) === */
  if (payload.name) {
    const duplicate = await prisma.eLearningSubscriptionPlan.findFirst({
      where: {
        name: {
          equals: payload.name,
          mode: "insensitive",
        },
        NOT: {
          id: planId,
        },
      },
    });

    if (duplicate) {
      throw new Error("Subscription plan with this name already exists");
    }
  }

  /* === 3. UPDATE DATA === */
  const updatedPlan = await prisma.eLearningSubscriptionPlan.update({
    where: { id: planId },
    data: {
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.durationDay !== undefined && {
        durationDay: payload.durationDay,
      }),
      ...(payload.price !== undefined && { price: payload.price }),
      ...(payload.description !== undefined && {
        description: payload.description,
      }),
      ...(payload.isActive !== undefined && { isActive: payload.isActive }),
      updatedAt: new Date(),
    },
  });

  return updatedPlan;
};

export const updateSubscriptionPlanStatus = async (
  planId: string,
  isActive: boolean
) => {
  /* === 1. CEK PLAN EXIST === */
  const plan = await prisma.eLearningSubscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error("Subscription plan not found");
  }

  /* === 2. OPTIONAL GUARD (BEST PRACTICE) === */
  // Jika ingin mencegah plan dinonaktifkan
  // saat masih ada subscription aktif
  if (!isActive) {
    const activeSubscriptions = await prisma.eLearningSubscription.count({
      where: {
        planId,
        status: "active",
      },
    });

    if (activeSubscriptions > 0) {
      throw new Error("Cannot deactivate plan with active subscriptions");
    }
  }

  /* === 3. UPDATE STATUS === */
  const updatedPlan = await prisma.eLearningSubscriptionPlan.update({
    where: { id: planId },
    data: {
      isActive,
      updatedAt: new Date(),
    },
  });

  return updatedPlan;
};

export const getAllSubscriptionPlans = async (query: {
  page: number;
  limit: number;
  sortBy: "name" | "price" | "durationDay" | "createdAt";
  sortOrder: "asc" | "desc";
  isActive?: boolean;
  search?: string;
}) => {
  const { page, limit, sortBy, sortOrder, isActive, search } = query;

  const skip = (page - 1) * limit;

  /* === WHERE CONDITION === */
  const where: any = {};

  if (typeof isActive === "boolean") {
    where.isActive = isActive;
  }

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  /* === QUERY DATA === */
  const [data, totalData] = await Promise.all([
    prisma.eLearningSubscriptionPlan.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    }),
    prisma.eLearningSubscriptionPlan.count({ where }),
  ]);

  const totalPage = Math.ceil(totalData / limit);

  return {
    meta: {
      page,
      limit,
      totalData,
      totalPage,
    },
    data,
  };
};

export const getSubscriptionPlanDetail = async (id: string) => {
  const plan = await prisma.eLearningSubscriptionPlan.findFirst({
    where: {
      id,
      isActive: true, // ⬅️ penting untuk public
    },
  });

  if (!plan) {
    throw new Error("Subscription plan not found");
  }

  return plan;
};

export const getSubscriptionPlanDetailAdmin = async (id: string) => {
  const plan = await prisma.eLearningSubscriptionPlan.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subscriptions: true,
        },
      },
    },
  });

  if (!plan) {
    throw new Error("Subscription plan not found");
  }

  return {
    id: plan.id,
    name: plan.name,
    durationDay: plan.durationDay,
    price: plan.price,
    description: plan.description,
    isActive: plan.isActive,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    totalSubscriptions: plan._count.subscriptions,
  };
};

export const deleteSubscriptionPlan = async (id: string) => {
  /* === 1. CEK PLAN ADA ATAU TIDAK === */
  const plan = await prisma.eLearningSubscriptionPlan.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subscriptions: true,
        },
      },
    },
  });

  if (!plan) {
    throw new Error("Subscription plan not found");
  }

  /* === 2. JIKA SUDAH PERNAH DIGUNAKAN → SOFT DELETE === */
  if (plan._count.subscriptions > 0) {
    const updatedPlan = await prisma.eLearningSubscriptionPlan.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return {
      message:
        "Subscription plan has existing subscriptions and was deactivated instead",
      data: {
        id: updatedPlan.id,
        action: "SOFT_DELETE",
      },
    };
  }

  /* === 3. JIKA BELUM PERNAH DIGUNAKAN → HARD DELETE === */
  await prisma.eLearningSubscriptionPlan.delete({
    where: { id },
  });

  return {
    message: "Subscription plan deleted permanently",
    data: {
      id,
      action: "HARD_DELETE",
    },
  };
};

export const exportSubscriptionPlansToFile = async (formatType: string) => {
  const plans = await prisma.eLearningSubscriptionPlan.findMany({
    include: {
      _count: {
        select: {
          subscriptions: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const rows = plans.map((p) => ({
    ID: p.id,
    Name: p.name,
    DurationDay: p.durationDay,
    Price: Number(p.price),
    Description: p.description || "",
    IsActive: p.isActive ? "Ya" : "Tidak",
    TotalSubscriptions: p._count.subscriptions,
    CreatedAt: formatDate(p.createdAt, "yyyy-MM-dd HH:mm:ss"),
    UpdatedAt: p.updatedAt
      ? formatDate(p.updatedAt, "yyyy-MM-dd HH:mm:ss")
      : "",
  }));

  const dateStr = formatDate(new Date(), "yyyyMMdd-HHmmss");
  const baseFileName = `elearning-subscription-plans-${dateStr}`;

  /* ===== EXCEL ===== */
  if (formatType === "excel") {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Subscription Plans");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
    }));

    rows.forEach((row) => worksheet.addRow(row));
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      buffer,
      fileName: `${baseFileName}.xlsx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  /* ===== CSV ===== */
  const parser = new Json2CsvParser();
  const csv = parser.parse(rows);

  return {
    buffer: Buffer.from(csv, "utf-8"),
    fileName: `${baseFileName}.csv`,
    mimeType: "text/csv",
  };
};
