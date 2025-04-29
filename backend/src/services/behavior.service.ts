import { PrismaClient, Prisma } from "@prisma/client";
import { Parser as Json2CsvParser } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate, subDays } from "date-fns";
import { Buffer } from "buffer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AuthenticatedRequestPractice } from "../middlewares/authenticate";
import { uploadToGoogleDrive } from "../utils/googleDrive";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createUserBehaviorService = async ({
  userId,
  pageVisited,
  action,
  ipAddress,
  userAgent,
}: {
  userId: string;
  pageVisited: string;
  action: string;
  ipAddress: string;
  userAgent: string;
}) => {
  // Validasi tambahan di service
  if (!pageVisited || !action) {
    throw new Error("Page visited and action are required");
  }

  const behavior = await prisma.userBehavior.create({
    data: {
      userId,
      pageVisited,
      action,
      ipAddress,
      userAgent,
    },
    select: {
      id: true,
      userId: true,
      pageVisited: true,
      action: true,
      timestamp: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
    },
  });

  return behavior;
};

export const getAllAdminUserBehaviorsService = async ({
  page,
  limit,
  userId,
  pageVisited,
  action,
  startDate,
  endDate,
}: {
  page: number;
  limit: number;
  userId?: string;
  pageVisited?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  const skip = (page - 1) * limit;

  const where: Prisma.UserBehaviorWhereInput = {};

  if (userId) {
    where.userId = userId;
  }

  if (pageVisited) {
    where.pageVisited = {
      contains: pageVisited,
      mode: "insensitive",
    };
  }

  if (action) {
    where.action = {
      contains: action,
      mode: "insensitive",
    };
  }

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) {
      where.timestamp.gte = startDate; // Sudah diatur ke 00:00:00.000Z oleh validator
    }
    if (endDate) {
      where.timestamp.lte = endDate; // Sudah diatur ke 23:59:59.999Z oleh validator
    }
  }

  const [behaviors, total] = await Promise.all([
    prisma.userBehavior.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        timestamp: "desc",
      },
    }),
    prisma.userBehavior.count({
      where,
    }),
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: behaviors,
  };
};

export const getUserBehaviorByIdService = async (id: string) => {
  const behavior = await prisma.userBehavior.findUnique({
    where: {
      id,
    },
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

  return behavior;
};

export const deleteUserBehaviorByIdService = async (id: string) => {
  try {
    const behavior = await prisma.userBehavior.delete({
      where: {
        id,
      },
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

    return behavior;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null; // Behavior tidak ditemukan
    }
    throw error;
  }
};

export const exportUserBehaviorsService = async ({
  format,
  userId,
  pageVisited,
  action,
  startDate,
  endDate,
}: {
  format: "csv" | "excel";
  userId?: string;
  pageVisited?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  const where: Prisma.UserBehaviorWhereInput = {};

  if (userId) {
    where.userId = userId;
  }

  if (pageVisited) {
    where.pageVisited = {
      contains: pageVisited,
      mode: "insensitive",
    };
  }

  if (action) {
    where.action = {
      contains: action,
      mode: "insensitive",
    };
  }

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) {
      where.timestamp.gte = startDate;
    }
    if (endDate) {
      where.timestamp.lte = endDate;
    }
  }

  const behaviors = await prisma.userBehavior.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  // Format data untuk ekspor
  const exportData = behaviors.map((behavior) => ({
    id: behavior.id,
    userId: behavior.userId || "",
    userFullName: behavior.user?.fullName || "",
    userEmail: behavior.user?.email || "",
    pageVisited: behavior.pageVisited,
    action: behavior.action || "",
    timestamp: behavior.timestamp
      ? formatDate(behavior.timestamp, "yyyy-MM-dd HH:mm:ss")
      : "",
    ipAddress: behavior.ipAddress || "",
    userAgent: behavior.userAgent || "",
    createdAt: behavior.createdAt
      ? formatDate(behavior.createdAt, "yyyy-MM-dd HH:mm:ss")
      : "",
  }));

  const currentDateTime = formatDate(new Date(), "yyyyMMdd_HHmmss");
  const fileName = `user_behaviors_${currentDateTime}.${
    format === "csv" ? "csv" : "xlsx"
  }`;
  let fileBuffer: Buffer; // Tidak perlu tipe generik eksplisit

  let MIMEType: string;

  if (format === "csv") {
    const fields = [
      { label: "ID", value: "id" },
      { label: "User ID", value: "userId" },
      { label: "User Full Name", value: "userFullName" },
      { label: "User Email", value: "userEmail" },
      { label: "Page Visited", value: "pageVisited" },
      { label: "Action", value: "action" },
      { label: "Timestamp", value: "timestamp" },
      { label: "IP Address", value: "ipAddress" },
      { label: "User Agent", value: "userAgent" },
      { label: "Created At", value: "createdAt" },
    ];

    const json2csvParser = new Json2CsvParser({ fields });
    const csv = json2csvParser.parse(exportData);
    fileBuffer = Buffer.from(csv);
    MIMEType = "text/csv";
  } else {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Behaviors");

    worksheet.columns = [
      { header: "ID", key: "id", width: 30 },
      { header: "User ID", key: "userId", width: 30 },
      { header: "User Full Name", key: "userFullName", width: 20 },
      { header: "User Email", key: "userEmail", width: 30 },
      { header: "Page Visited", key: "pageVisited", width: 20 },
      { header: "Action", key: "action", width: 20 },
      { header: "Timestamp", key: "timestamp", width: 20 },
      { header: "IP Address", key: "ipAddress", width: 15 },
      { header: "User Agent", key: "userAgent", width: 50 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    exportData.forEach((data) => {
      worksheet.addRow(data);
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (rowNumber === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD3D3D3" },
          };
        }
      });
    });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    fileBuffer = Buffer.from(arrayBuffer);
    MIMEType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  return { fileBuffer, fileName, MIMEType };
};
