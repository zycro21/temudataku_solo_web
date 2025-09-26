import { PrismaClient, Prisma } from "@prisma/client";
import { Parser as Json2CsvParser } from "json2csv";
import ExcelJS from "exceljs";
import { Buffer } from "buffer";

const prisma = new PrismaClient();

export const getAllWithdrawalMethods = async (
  userId: string,
  roles: string[],
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;

  if (roles.includes("admin")) {
    // Admin → semua withdrawal methods
    const [items, total] = await Promise.all([
      prisma.withdrawalMethod.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.withdrawalMethod.count(),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Affiliator → hanya miliknya sendiri
  const [items, total] = await Promise.all([
    prisma.withdrawalMethod.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.withdrawalMethod.count({ where: { userId } }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getWithdrawalMethodById = async (
  userId: string,
  roles: string[],
  id: string
) => {
  if (roles.includes("admin")) {
    // Admin bisa akses semua withdrawal method
    const method = await prisma.withdrawalMethod.findUnique({
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

    if (!method) {
      const error = new Error("Withdrawal method not found");
      (error as any).status = 404;
      throw error;
    }

    return method;
  }

  // Affiliator hanya boleh akses miliknya sendiri
  const method = await prisma.withdrawalMethod.findUnique({
    where: { id },
  });

  if (!method || method.userId !== userId) {
    const error = new Error("Withdrawal method not found or unauthorized");
    (error as any).status = 404;
    throw error;
  }

  return method;
};

export const createWithdrawalMethod = async (
  userId: string,
  data: {
    type: string;
    providerName: string;
    accountNumber: string;
    accountName?: string;
  }
) => {
  function generateWithdrawalId() {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // yyyyMMdd
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase(); // 5 char random
    return `WD-${datePart}-${randomPart}`;
  }

  return prisma.withdrawalMethod.create({
    data: {
      id: generateWithdrawalId(), // pakai custom ID
      userId,
      type: data.type,
      providerName: data.providerName,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      isActive: true,
    },
  });
};

export const updateWithdrawalMethod = async (
  userId: string,
  roles: string[],
  id: string,
  data: {
    type?: string;
    providerName?: string;
    accountNumber?: string;
    accountName?: string;
    isActive?: boolean;
  }
) => {
  // cek dulu apakah withdrawal method ada
  const existing = await prisma.withdrawalMethod.findUnique({
    where: { id },
  });

  if (!existing) {
    const error = new Error("Withdrawal method not found");
    (error as any).status = 404;
    throw error;
  }

  // kalau affiliator, pastikan hanya bisa update miliknya sendiri
  if (roles.includes("affiliator") && existing.userId !== userId) {
    const error = new Error("Not authorized to update this withdrawal method");
    (error as any).status = 403;
    throw error;
  }

  // update hanya field yang dikirim
  return prisma.withdrawalMethod.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
};

export const removeWithdrawalMethod = async (
  userId: string,
  roles: string[],
  id: string
) => {
  const existing = await prisma.withdrawalMethod.findUnique({
    where: { id },
  });

  if (!existing) {
    const error = new Error("Withdrawal method not found");
    (error as any).status = 404;
    throw error;
  }

  // jika affiliator → hanya boleh hapus miliknya
  if (roles.includes("affiliator") && existing.userId !== userId) {
    const error = new Error("Not authorized to delete this withdrawal method");
    (error as any).status = 403;
    throw error;
  }

  // admin atau affiliator pemilik method
  await prisma.withdrawalMethod.delete({
    where: { id },
  });
};

export const exportWithdrawal = async ({
  format,
}: {
  format: "csv" | "excel";
}) => {
  const data = await prisma.withdrawalMethod.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      providerName: true,
      accountNumber: true,
      accountName: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });

  const mapped = data.map((item) => ({
    ID: item.id,
    Type: item.type,
    Provider: item.providerName,
    "Account Number": item.accountNumber,
    "Account Name": item.accountName || "-",
    Status: item.isActive ? "Active" : "Inactive",
    "Created At": item.createdAt.toISOString(),
    "Updated At": item.updatedAt.toISOString(),
    "User Name": item.user.fullName,
    "User Email": item.user.email,
    "User Phone": item.user.phoneNumber || "-",
  }));

  if (format === "csv") {
    const parser = new Json2CsvParser();
    return Buffer.from(parser.parse(mapped));
  } else {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Withdrawal Methods");

    worksheet.columns = Object.keys(mapped[0] || {}).map((key) => ({
      header: key,
      key,
      width: 20,
    }));

    mapped.forEach((row) => worksheet.addRow(row));
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
};

export const toggleWithdrawalStatus = async ({
  id,
  userId,
  role,
  isActive,
}: {
  id: string;
  userId: string;
  role: "admin" | "affiliator";
  isActive: boolean;
}) => {
  // Cari withdrawal method
  const withdrawal = await prisma.withdrawalMethod.findUnique({
    where: { id },
  });

  if (!withdrawal) {
    throw new Error("Withdrawal method not found");
  }

  // Jika affiliator → hanya boleh ubah miliknya sendiri
  if (role === "affiliator" && withdrawal.userId !== userId) {
    throw new Error(
      "Forbidden: you can only manage your own withdrawal methods"
    );
  }

  // Update status
  const updated = await prisma.withdrawalMethod.update({
    where: { id },
    data: {
      isActive,
      updatedAt: new Date(),
    },
  });

  return updated;
};

export const getAdminWithdrawals = async ({
  page,
  limit,
  sortBy = "createdAt",
  order = "desc",
  providerName,
  type,
  isActive,
}: {
  page: number;
  limit: number;
  sortBy?: string;
  order?: "asc" | "desc";
  providerName?: string;
  type?: string;
  isActive?: boolean;
}) => {
  const where: any = {};

  if (providerName) {
    where.providerName = { contains: providerName, mode: "insensitive" };
  }
  if (type) {
    where.type = type;
  }
  if (typeof isActive === "boolean") {
    where.isActive = isActive;
  }

  const [data, total] = await Promise.all([
    prisma.withdrawalMethod.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: order },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    }),
    prisma.withdrawalMethod.count({ where }),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    },
  };
};
