import { PrismaClient, Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

export const createUserActivityService = async ({
  userId,
  page,
  durationSec,
}: {
  userId: string;
  page: string;
  durationSec?: number;
}) => {
  // Cek apakah user sudah punya log untuk page tersebut
  const existingLog = await prisma.userActivityLog.findFirst({
    where: { userId, page },
  });

  // Kalau sudah ada, update durasi dan waktu akses
  if (existingLog) {
    const updated = await prisma.userActivityLog.update({
      where: { id: existingLog.id },
      data: {
        durationSec: (existingLog.durationSec ?? 0) + (durationSec ?? 0),
        accessedAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        page: true,
        durationSec: true,
        accessedAt: true,
      },
    });

    return updated;
  }

  // Kalau belum ada, buat baru
  const uniqueId = `log_${Date.now()}_${nanoid(6)}`;

  const created = await prisma.userActivityLog.create({
    data: {
      id: uniqueId,
      userId,
      page,
      durationSec: durationSec ?? 0,
    },
    select: {
      id: true,
      userId: true,
      page: true,
      durationSec: true,
      accessedAt: true,
    },
  });

  return created;
};

export const getUserActivitiesService = async ({
  userId,
  page,
  limit,
  search,
  sortBy,
  sortOrder,
}: {
  userId?: string;
  page: number;
  limit: number;
  search?: string;
  sortBy?: "accessedAt" | "durationSec" | "page";
  sortOrder?: "asc" | "desc";
}) => {
  const where: Prisma.UserActivityLogWhereInput = {
    ...(userId ? { userId } : {}),
    ...(search
      ? {
          page: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {}),
  };

  const total = await prisma.userActivityLog.count({ where });

  const logs = await prisma.userActivityLog.findMany({
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
      [sortBy ?? "accessedAt"]: sortOrder ?? "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    success: true,
    total,
    page,
    totalPage: Math.ceil(total / limit),
    data: logs,
  };
};

export const getUserActivityByIdService = async (id: string) => {
  const log = await prisma.userActivityLog.findUnique({
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
    const error: any = new Error("User activity log not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: log.id,
    userId: log.userId,
    page: log.page,
    durationSec: log.durationSec,
    accessedAt: log.accessedAt,
    user: log.user,
  };
};

export const updateUserActivityService = async (
  id: string,
  data: Partial<{ page: string; durationSec: number }>
) => {
  // Pastikan ada
  const existing = await prisma.userActivityLog.findUnique({ where: { id } });
  if (!existing) {
    const err: any = new Error("Activity log not found");
    err.statusCode = 404;
    throw err;
  }

  // Bila durationSec diupdate, kita juga perbarui accessedAt agar timestamp relevan
  const updatePayload: any = {
    ...(data.page !== undefined ? { page: data.page } : {}),
    ...(data.durationSec !== undefined
      ? { durationSec: data.durationSec }
      : {}),
  };

  if (data.durationSec !== undefined) {
    updatePayload.accessedAt = new Date();
  }

  const updated = await prisma.userActivityLog.update({
    where: { id },
    data: updatePayload,
    include: { user: { select: { id: true, fullName: true, email: true } } },
  });

  return updated;
};

export const deleteUserActivityService = async (
  id: string,
  actor: { userId: string; roles: string[] }
) => {
  // Cek apakah user yang mengakses memiliki role admin
  const isAdmin = actor.roles?.includes("admin");
  if (!isAdmin) {
    const err: any = new Error(
      "Forbidden: Only admin can delete activity logs"
    );
    err.statusCode = 403;
    throw err;
  }

  // Cek apakah log ada di database
  const existing = await prisma.userActivityLog.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
    },
  });

  if (!existing) {
    const err: any = new Error("Activity log not found");
    err.statusCode = 404;
    throw err;
  }

  // Lakukan penghapusan
  await prisma.userActivityLog.delete({ where: { id } });

  // Kembalikan response standar
  return {
    message: "Activity log deleted successfully",
    deletedLog: existing, // opsional, bisa dihilangkan kalau tidak ingin tampilkan data log lama
  };
};

export const getAllUserActivitiesService = async ({
  page,
  limit,
  search,
  sortBy,
  sortOrder,
}: {
  page: number;
  limit: number;
  search?: string;
  sortBy: "accessedAt" | "durationSec" | "page";
  sortOrder: "asc" | "desc";
}) => {
  const skip = (page - 1) * limit;

  // Filter berdasarkan page atau nama user
  const whereClause: Prisma.UserActivityLogWhereInput = search
    ? {
        OR: [
          { page: { contains: search, mode: "insensitive" } },
          { user: { fullName: { contains: search, mode: "insensitive" } } },
        ],
      }
    : {};

  const [total, activities] = await Promise.all([
    prisma.userActivityLog.count({ where: whereClause }),
    prisma.userActivityLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    totalPages,
    data: activities,
  };
};

export const getRecentUserActivitiesService = async ({
  userId,
  limit,
}: {
  userId: string;
  limit: number;
}) => {
  const logs = await prisma.userActivityLog.findMany({
    where: { userId },
    orderBy: { accessedAt: "desc" },
    take: limit,
    select: {
      id: true,
      page: true,
      durationSec: true,
      accessedAt: true,
    },
  });

  return {
    success: true,
    total: logs.length,
    data: logs,
  };
};
