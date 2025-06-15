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

const generateRandomSuffix = (length: number): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < length; i++) {
    suffix += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return suffix;
};

const generateReferralCodeId = async (): Promise<string> => {
  const datePart = formatDate(new Date(), "yyyyMMdd");
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const suffix = generateRandomSuffix(4);
    const id = `REF-${datePart}-${suffix}`;
    const existingId = await prisma.referralCode.findUnique({
      where: { id },
    });
    if (!existingId) {
      return id;
    }
  }

  throw new Error(
    "Failed to generate unique referral code ID after multiple attempts"
  );
};

export const createReferralCodeService = async ({
  ownerId,
  code,
  discountPercentage,
  commissionPercentage,
  expiryDate,
  isActive,
}: {
  ownerId: string;
  code: string;
  discountPercentage: number;
  commissionPercentage: number;
  expiryDate?: Date;
  isActive?: boolean;
}) => {
  // Validasi ownerId dan role affiliator
  const user = await prisma.user.findUnique({
    where: { id: ownerId },
    select: {
      id: true,
      userRoles: {
        select: {
          role: {
            select: {
              roleName: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const hasAffiliatorRole = user.userRoles.some(
    (userRole) => userRole.role.roleName === "affiliator"
  );
  if (!hasAffiliatorRole) {
    throw new Error(
      "User must have the 'affiliator' role to own a referral code"
    );
  }

  // Validasi keunikan kode
  const existingCode = await prisma.referralCode.findUnique({
    where: { code },
  });

  if (existingCode) {
    throw new Error("Referral code already exists");
  }

  // Generate ID dengan format REF-YYYYMMDD-XXXX
  const id = await generateReferralCodeId();

  // Buat kode referral
  const referralCode = await prisma.referralCode.create({
    data: {
      id,
      ownerId,
      code,
      discountPercentage,
      commissionPercentage,
      expiryDate,
      isActive,
    },
    select: {
      id: true,
      ownerId: true,
      code: true,
      discountPercentage: true,
      commissionPercentage: true,
      createdDate: true,
      expiryDate: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return referralCode;
};

export const getReferralCodesService = async ({
  page,
  limit,
  isActive,
  ownerId,
}: {
  page: number;
  limit: number;
  isActive?: boolean;
  ownerId?: string;
}) => {
  const skip = (page - 1) * limit;

  // Bangun kondisi where untuk filter
  const where: Prisma.ReferralCodeWhereInput = {};
  if (isActive !== undefined) {
    where.isActive = isActive;
  }
  if (ownerId) {
    where.ownerId = ownerId;
  }

  // Ambil kode referral dengan paginasi
  const referralCodes = await prisma.referralCode.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      ownerId: true,
      code: true,
      discountPercentage: true,
      commissionPercentage: true,
      createdDate: true,
      expiryDate: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  // Hitung total kode referral
  const total = await prisma.referralCode.count({ where });

  // Hitung total halaman
  const totalPages = Math.ceil(total / limit);

  return {
    referralCodes,
    total,
    page,
    limit,
    totalPages,
  };
};

export const getReferralCodeByIdService = async (id: string) => {
  const referralCode = await prisma.referralCode.findUnique({
    where: { id },
    select: {
      id: true,
      ownerId: true,
      code: true,
      discountPercentage: true,
      commissionPercentage: true,
      createdDate: true,
      expiryDate: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return referralCode;
};

export const updateReferralCodeService = async (
  id: string,
  data: {
    expiryDate?: Date;
    isActive?: boolean;
    discountPercentage?: number;
    commissionPercentage?: number;
  }
) => {
  const referralCode = await prisma.referralCode.update({
    where: { id },
    data: {
      expiryDate: data.expiryDate,
      isActive: data.isActive,
      discountPercentage: data.discountPercentage,
      commissionPercentage: data.commissionPercentage,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      ownerId: true,
      code: true,
      discountPercentage: true,
      commissionPercentage: true,
      createdDate: true,
      expiryDate: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return referralCode;
};

export const deleteReferralCodeService = async (id: string) => {
  try {
    await prisma.referralCode.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return false;
    }
    throw error;
  }
};

export const useReferralCodeService = async ({
  userId,
  code,
  context,
}: {
  userId: string;
  code: string;
  context: "booking" | "practice_purchase";
}) => {
  // Validasi kode referral
  const referralCode = await prisma.referralCode.findUnique({
    where: { code },
    select: {
      id: true,
      discountPercentage: true,
      isActive: true,
      expiryDate: true,
    },
  });

  if (!referralCode) {
    throw new Error("Referral code not found");
  }

  if (!referralCode.isActive) {
    throw new Error("Referral code is not active");
  }

  if (referralCode.expiryDate && referralCode.expiryDate < new Date()) {
    throw new Error("Referral code has expired");
  }

  // Cek apakah pengguna sudah pernah menggunakan kode ini
  const existingUsage = await prisma.referralUsage.findUnique({
    where: {
      userId_referralCodeId: {
        userId,
        referralCodeId: referralCode.id,
      },
    },
  });

  if (existingUsage) {
    throw new Error("Referral code has already been used by this user");
  }

  // Buat record ReferralUsage
  const referralUsage = await prisma.referralUsage.create({
    data: {
      userId,
      referralCodeId: referralCode.id,
      context,
    },
    select: {
      id: true,
    },
  });

  return {
    referralUsageId: referralUsage.id,
    discountPercentage: referralCode.discountPercentage,
  };
};

export const getReferralCommissions = async (input: {
  referralCodeId?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}) => {
  const { referralCodeId, startDate, endDate, page, limit } = input;

  // Validasi page dan limit
  if (page < 1 || limit < 1) {
    throw {
      status: 400,
      message: "Page dan limit harus berupa angka positif.",
    };
  }

  // Validasi format tanggal
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (startDate && !dateRegex.test(startDate)) {
    throw {
      status: 400,
      message: "Format startDate tidak valid (yyyy-mm-dd).",
    };
  }
  if (endDate && !dateRegex.test(endDate)) {
    throw {
      status: 400,
      message: "Format endDate tidak valid (yyyy-mm-dd).",
    };
  }

  // Validasi startDate <= endDate
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw {
      status: 400,
      message: "startDate harus sebelum atau sama dengan endDate.",
    };
  }

  // Hitung offset untuk pagination
  const skip = (page - 1) * limit;

  // Bangun where clause untuk filter
  const where: any = {};

  if (referralCodeId) {
    where.referralCodeId = referralCodeId;
  }

  if (startDate) {
    where.created_at = { gte: new Date(startDate) };
  }

  if (endDate) {
    where.created_at = {
      ...where.created_at,
      lte: new Date(`${endDate}T23:59:59.999Z`),
    };
  }

  // Ambil data komisi
  const commissions = await prisma.referralCommisions.findMany({
    where,
    skip,
    take: limit,
    orderBy: { created_at: "desc" },
    include: {
      referral_code: {
        select: {
          code: true,
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // Ambil data payment untuk setiap komisi
  const commissionsWithPayment = await Promise.all(
    commissions.map(async (commission) => {
      const payment = await prisma.payment.findUnique({
        where: { id: commission.transactionId },
        select: {
          bookingId: true,
          practicePurchaseId: true,
          status: true,
        },
      });
      return {
        ...commission,
        payment: payment || null,
      };
    })
  );

  // Hitung total komisi untuk pagination
  const total = await prisma.referralCommisions.count({ where });

  return {
    commissions: commissionsWithPayment,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAffiliatorReferralCodes = async (input: {
  ownerId: string;
  isActive?: boolean;
  page: number;
  limit: number;
}) => {
  const { ownerId, isActive, page, limit } = input;

  // Validasi page dan limit
  if (page < 1 || limit < 1) {
    throw {
      status: 400,
      message: "Page dan limit harus berupa angka positif.",
    };
  }

  // Hitung offset untuk pagination
  const skip = (page - 1) * limit;

  // Bangun where clause untuk filter
  const where: any = {
    ownerId,
  };

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  // Ambil data kode referral
  const referralCodes = await prisma.referralCode.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      discountPercentage: true,
      commissionPercentage: true,
      createdDate: true,
      expiryDate: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  // Hitung total kode referral untuk pagination
  const total = await prisma.referralCode.count({ where });

  return {
    referralCodes,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getReferralUsages = async (input: {
  referralCodeId: string;
  ownerId: string;
  context?: "booking" | "practice_purchase";
  page: number;
  limit: number;
}) => {
  const { referralCodeId, ownerId, context, page, limit } = input;

  // Validasi page dan limit
  if (page < 1 || limit < 1) {
    throw {
      status: 400,
      message: "Page dan limit harus berupa angka positif.",
    };
  }

  // Cek apakah kode referral ada dan milik pengguna
  const referralCode = await prisma.referralCode.findFirst({
    where: {
      id: referralCodeId,
      ownerId,
    },
  });

  if (!referralCode) {
    throw {
      status: 404,
      message: "Referral code not found or you do not have access.",
    };
  }

  // Hitung offset untuk pagination
  const skip = (page - 1) * limit;

  // Bangun where clause untuk filter
  const where: any = {
    referralCodeId,
  };

  if (context) {
    where.context = context;
  }

  // Ambil data penggunaan kode referral
  const usages = await prisma.referralUsage.findMany({
    where,
    skip,
    take: limit,
    orderBy: { usedAt: "desc" },
    select: {
      id: true,
      userId: true,
      referralCodeId: true,
      usedAt: true,
      context: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      booking: {
        select: {
          id: true,
          bookingDate: true,
          status: true,
        },
      },
      practicePurchase: {
        select: {
          id: true,
          purchaseDate: true,
          status: true,
        },
      },
    },
  });

  // Hitung total penggunaan untuk pagination
  const total = await prisma.referralUsage.count({ where });

  return {
    usages,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getReferralCommissionsByCode = async (input: {
  referralCodeId: string;
  ownerId: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}) => {
  const { referralCodeId, ownerId, startDate, endDate, page, limit } = input;

  if (page < 1 || limit < 1) {
    throw {
      status: 400,
      message: "Page dan limit harus berupa angka positif.",
    };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (startDate && !dateRegex.test(startDate)) {
    throw {
      status: 400,
      message: "Format startDate tidak valid (yyyy-mm-dd).",
    };
  }
  if (endDate && !dateRegex.test(endDate)) {
    throw {
      status: 400,
      message: "Format endDate tidak valid (yyyy-mm-dd).",
    };
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw {
      status: 400,
      message: "startDate harus sebelum atau sama dengan endDate.",
    };
  }

  const referralCode = await prisma.referralCode.findFirst({
    where: {
      id: referralCodeId,
      ownerId,
    },
  });

  if (!referralCode) {
    throw {
      status: 404,
      message: "Referral code not found or you do not have access.",
    };
  }

  const skip = (page - 1) * limit;

  const where: any = {
    referralCodeId,
  };

  if (startDate) {
    where.created_at = { gte: new Date(startDate) };
  }

  if (endDate) {
    where.created_at = {
      ...where.created_at,
      lte: new Date(`${endDate}T23:59:59.999Z`),
    };
  }

  const commissions = await prisma.referralCommisions.findMany({
    where,
    skip,
    take: limit,
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      referralCodeId: true,
      transactionId: true,
      amount: true,
      created_at: true,
      referral_code: {
        select: {
          code: true,
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const commissionsWithPayment = await Promise.all(
    commissions.map(async (commission) => {
      const payment = await prisma.payment.findUnique({
        where: { id: commission.transactionId },
        select: {
          id: true,
          bookingId: true,
          practicePurchaseId: true,
          status: true,
          amount: true,
          createdAt: true,
        },
      });
      return {
        ...commission,
        payment: payment || null,
      };
    })
  );

  const total = await prisma.referralCommisions.count({ where });

  return {
    commissions: commissionsWithPayment,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const requestCommissionPayment = async (input: {
  referralCodeId: string;
  ownerId: string;
  amount: number;
}) => {
  const { referralCodeId, ownerId, amount } = input;

  // Cek apakah kode referral ada dan milik pengguna
  const referralCode = await prisma.referralCode.findFirst({
    where: {
      id: referralCodeId,
      ownerId,
    },
  });

  if (!referralCode) {
    throw {
      status: 404,
      message: "Referral code not found or you do not have access.",
    };
  }

  // Hitung total komisi yang tersedia (belum ditarik)
  const totalCommissions = await prisma.referralCommisions.aggregate({
    where: {
      referralCodeId,
    },
    _sum: {
      amount: true,
    },
  });

  const totalPaid = await prisma.commissionPayments.aggregate({
    where: {
      referralCodeId,
      status: { in: ["pending", "paid"] },
    },
    _sum: {
      amount: true,
    },
  });

  const availableBalance =
    (totalCommissions._sum.amount?.toNumber() || 0) -
    (totalPaid._sum.amount?.toNumber() || 0);

  if (availableBalance < amount) {
    throw {
      status: 400,
      message: `Insufficient commission balance. Available: ${availableBalance}, Requested: ${amount}`,
    };
  }

  // Buat permintaan penarikan
  const paymentRequest = await prisma.commissionPayments.create({
    data: {
      referralCodeId,
      amount,
      status: "pending",
      created_at: new Date(),
    },
    select: {
      id: true,
      referralCodeId: true,
      amount: true,
      status: true,
      created_at: true,
      referralCode: {
        select: {
          code: true,
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return paymentRequest;
};

export const getCommissionPayments = async (filter: {
  ownerId: string;
  page: number;
  limit: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  const { ownerId, page, limit, status, startDate, endDate } = filter;

  const where = {
    referralCode: {
      ownerId,
    },
    ...(status && { status }),
    ...(startDate &&
      endDate && {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      }),
  };

  const [total, payments] = await Promise.all([
    prisma.commissionPayments.count({ where }),
    prisma.commissionPayments.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        amount: true,
        status: true,
        transactionId: true,
        paid_at: true,
        notes: true,
        created_at: true,
        referralCode: {
          select: {
            code: true,
            owner: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount.toNumber(),
      status: payment.status,
      transactionId: payment.transactionId,
      paidAt: payment.paid_at,
      notes: payment.notes,
      createdAt: payment.created_at,
      referralCode: payment.referralCode.code,
      owner: {
        id: payment.referralCode.owner.id,
        fullName: payment.referralCode.owner.fullName,
        email: payment.referralCode.owner.email,
      },
    })),
  };
};

export const getAllCommissionPayments = async (filter: {
  page: number;
  limit: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  referralCodeId?: string;
  ownerId?: string;
}) => {
  const { page, limit, status, startDate, endDate, referralCodeId, ownerId } =
    filter;

  const where = {
    ...(status && { status }),
    ...(startDate &&
      endDate && {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      }),
    ...(referralCodeId && { referralCodeId }),
    ...(ownerId && {
      referralCode: {
        ownerId,
      },
    }),
  };

  const [total, payments] = await Promise.all([
    prisma.commissionPayments.count({ where }),
    prisma.commissionPayments.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        amount: true,
        status: true,
        transactionId: true,
        paid_at: true,
        notes: true,
        created_at: true,
        referralCode: {
          select: {
            id: true,
            code: true,
            owner: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount.toNumber(),
      status: payment.status,
      transactionId: payment.transactionId,
      paidAt: payment.paid_at,
      notes: payment.notes,
      createdAt: payment.created_at,
      referralCode: {
        id: payment.referralCode.id,
        code: payment.referralCode.code,
      },
      owner: {
        id: payment.referralCode.owner.id,
        fullName: payment.referralCode.owner.fullName,
        email: payment.referralCode.owner.email,
        phoneNumber: payment.referralCode.owner.phoneNumber,
      },
    })),
  };
};

export const updateCommissionPaymentStatus = async (input: {
  paymentId: string;
  status: "pending" | "paid" | "failed";
  notes?: string;
  transactionId?: string;
  adminId: string;
}) => {
  const { paymentId, status, notes, transactionId, adminId } = input;

  // Check if the commission payment exists
  const payment = await prisma.commissionPayments.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw {
      status: 404,
      message: "Commission payment not found.",
    };
  }

  // Prepare update data
  const updateData: any = {
    status,
    notes,
  };

  // Set transactionId if provided and status is 'paid'
  if (transactionId && status === "paid") {
    updateData.transactionId = transactionId;
  }

  // Set paid_at if status is 'paid', clear it if status is 'pending' or 'failed'
  if (status === "paid") {
    updateData.paid_at = new Date();
  } else {
    updateData.paid_at = null;
  }

  // Update the commission payment
  const updatedPayment = await prisma.commissionPayments.update({
    where: { id: paymentId },
    data: updateData,
    select: {
      id: true,
      amount: true,
      status: true,
      transactionId: true,
      paid_at: true,
      notes: true,
      created_at: true,
      referralCode: {
        select: {
          id: true,
          code: true,
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      },
    },
  });

  return {
    id: updatedPayment.id,
    amount: updatedPayment.amount.toNumber(),
    status: updatedPayment.status,
    transactionId: updatedPayment.transactionId,
    paidAt: updatedPayment.paid_at,
    notes: updatedPayment.notes,
    createdAt: updatedPayment.created_at,
    referralCode: {
      id: updatedPayment.referralCode.id,
      code: updatedPayment.referralCode.code,
    },
    owner: {
      id: updatedPayment.referralCode.owner.id,
      fullName: updatedPayment.referralCode.owner.fullName,
      email: updatedPayment.referralCode.owner.email,
      phoneNumber: updatedPayment.referralCode.owner.phoneNumber,
    },
  };
};

export const exportCommissionPayments = async ({
  format,
}: {
  format: "csv" | "excel";
}) => {
  const data = await prisma.commissionPayments.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      amount: true,
      transactionId: true,
      status: true,
      paid_at: true,
      created_at: true,
      notes: true,
      referralCode: {
        select: {
          code: true,
          owner: {
            select: {
              fullName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      },
    },
  });

  const mapped = data.map((item) => ({
    ID: item.id,
    "Referral Code": item.referralCode.code,
    "Owner Name": item.referralCode.owner.fullName,
    "Owner Email": item.referralCode.owner.email,
    "Phone Number": item.referralCode.owner.phoneNumber,
    Amount: item.amount.toNumber(),
    Status: item.status,
    "Transaction ID": item.transactionId || "-",
    "Paid At": item.paid_at?.toISOString() || "-",
    Notes: item.notes || "-",
    "Created At": item.created_at.toISOString(),
  }));

  if (format === "csv") {
    const parser = new Json2CsvParser();
    return Buffer.from(parser.parse(mapped));
  } else {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Commission Payments");

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
