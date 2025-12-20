import { PrismaClient, Prisma } from "@prisma/client";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import { format, parseISO, subDays } from "date-fns";
import { Buffer } from "buffer";
import { format as formatDate } from "date-fns";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path folder uploads utama
const uploadsRoot = path.join(__dirname, "../../uploads");

const prisma = new PrismaClient();

export const getActivityLogs = async (params: any) => {
  const { userId, action, type, page, limit, sortBy, sortOrder } = params;

  const where: any = {};

  if (userId) where.userId = userId;
  if (action) where.action = { contains: action, mode: "insensitive" };
  if (type) where.type = type;

  const logs = await prisma.adminActivityLog.findMany({
    where,
    include: {
      user: { select: { id: true, fullName: true, email: true } },
    },
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.adminActivityLog.count({ where });

  return {
    data: logs,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getActivityLogById = async (id: string) => {
  try {
    const log = await prisma.adminActivityLog.findUnique({
      where: { id },
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

    if (!log) {
      throw new Error("NOT_FOUND");
    }

    return log;
  } catch (err: any) {
    if (err.message === "NOT_FOUND") throw err;
    console.error("Error fetching activity log:", err);
    throw new Error("INTERNAL_ERROR");
  }
};

export const deleteActivityLog = async (id: string) => {
  // 1. Cek apakah log ada
  const log = await prisma.adminActivityLog.findUnique({
    where: { id },
    select: {
      id: true,
      type: true, // login_admin, system_action, critical_error, dsb
    },
  });

  if (!log) {
    const err: any = new Error("Activity log tidak ditemukan.");
    err.status = 404;
    throw err;
  }

  // 2. Cegah penghapusan log kritikal
  const protectedTypes = ["CRITICAL", "SECURITY", "SYSTEM"];
  const isProtected = protectedTypes.some((t) =>
    (log.type || "").toUpperCase().includes(t)
  );

  if (isProtected) {
    const err: any = new Error(
      "Log tipe kritikal tidak boleh dihapus demi keamanan sistem."
    );
    err.status = 403;
    throw err;
  }

  // 3. Hapus log
  await prisma.adminActivityLog.delete({
    where: { id },
  });

  return { success: true };
};

export const clearActivityLogs = async () => {
  // Cegah penghapusan log kritikal demi keamanan
  const protectedTypes = ["CRITICAL", "SECURITY", "SYSTEM"];

  // Hanya hapus log yang tidak terkategorikan sebagai critical
  const result = await prisma.adminActivityLog.deleteMany({
    where: {
      NOT: protectedTypes.map((t) => ({
        type: { contains: t, mode: "insensitive" },
      })),
    },
  });

  if (result.count === 0) {
    throw new Error(
      "Tidak ada activity log yang bisa dihapus (log kritikal dilindungi)."
    );
  }

  return { deleted: result.count };
};
