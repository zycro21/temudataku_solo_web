import { PrismaClient, Prisma } from "@prisma/client";
import { Parser as Json2CsvParser } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate, subDays } from "date-fns";
import { Buffer } from "buffer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// import { AuthenticatedRequestPractice } from "../middlewares/authenticate";
// import { uploadToGoogleDrive } from "../utils/googleDrive";
import {
  resolveProductConfig,
  resolveMentoringProductType,
  resolveElearningProductType,
} from "../utils/referral.helper.js";
import { sendCommissionWithdrawalRequestEmail } from "../utils/commissionWithdrawalRequestEmail.js";

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
    "Failed to generate unique referral code ID after multiple attempts",
  );
};

export const createReferralCodeService = async ({
  ownerId,
  code,
  expiryDate,
  isActive,
}: {
  ownerId: string;
  code: string;
  expiryDate?: Date;
  isActive?: boolean;
}) => {
  // Validasi user + role affiliator
  const user = await prisma.user.findUnique({
    where: { id: ownerId },
    select: {
      id: true,
      fullName: true,
      email: true,
      userRoles: {
        select: {
          role: { select: { roleName: true } },
        },
      },
      affiliatorProfile: {
        select: { id: true },
      },
    },
  });

  if (!user) throw new Error("User not found");

  const hasAffiliatorRole = user.userRoles.some(
    (ur) => ur.role.roleName === "affiliator",
  );
  if (!hasAffiliatorRole) {
    throw new Error(
      "User must have the 'affiliator' role to own a referral code",
    );
  }

  // Validasi keunikan kode
  const existingCode = await prisma.referralCode.findUnique({
    where: { code },
  });
  if (existingCode) throw new Error("Referral code already exists");

  // Generate ID
  const id = await generateReferralCodeId();

  // Jalankan dalam transaction: buat referral code + auto-create AffiliatorProfile jika belum ada
  const referralCode = await prisma.$transaction(async (tx) => {
    // Auto-create AffiliatorProfile jika belum ada
    if (!user.affiliatorProfile) {
      await tx.affiliatorProfile.create({
        data: {
          userId: ownerId,
          currentTier: "BRONZE",
          totalPoints: 0,
          isActive: true,
        },
      });
    }

    return tx.referralCode.create({
      data: {
        id,
        ownerId,
        code,
        expiryDate,
        isActive,
      },
      select: {
        id: true,
        ownerId: true,
        code: true,
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
            affiliatorProfile: {
              select: {
                currentTier: true,
                totalPoints: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
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

  const where: Prisma.ReferralCodeWhereInput = {};
  if (isActive !== undefined) where.isActive = isActive;
  if (ownerId) where.ownerId = ownerId;

  const referralCodes = await prisma.referralCode.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      ownerId: true,
      code: true,
      // HAPUS: discountPercentage, commissionPercentage
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
          affiliatorProfile: {
            select: {
              currentTier: true,
              totalPoints: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.referralCode.count({ where });

  return {
    referralCodes,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getReferralCodeByIdService = async (id: string) => {
  const referralCode = await prisma.referralCode.findUnique({
    where: { id },
    select: {
      id: true,
      ownerId: true,
      code: true,
      // HAPUS: discountPercentage, commissionPercentage
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
          affiliatorProfile: {
            select: {
              currentTier: true,
              totalPoints: true,
              isActive: true,
              seasonPoints: {
                where: {
                  season: { isActive: true },
                },
                select: {
                  points: true,
                  tierAtSeasonStart: true,
                  season: {
                    select: {
                      seasonName: true,
                      startDate: true,
                      endDate: true,
                    },
                  },
                },
                take: 1,
              },
            },
          },
        },
      },
      _count: {
        select: {
          usages: true,
          referralCommisions: true,
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
    // HAPUS: discountPercentage, commissionPercentage
  },
) => {
  const referralCode = await prisma.referralCode.update({
    where: { id },
    data: {
      expiryDate: data.expiryDate,
      isActive: data.isActive,
      // HAPUS: discountPercentage, commissionPercentage
      updatedAt: new Date(),
    },
    select: {
      id: true,
      ownerId: true,
      code: true,
      // HAPUS: discountPercentage, commissionPercentage
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
          affiliatorProfile: {
            select: {
              currentTier: true,
              totalPoints: true,
              isActive: true,
            },
          },
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
  context:
    | "booking"
    | "practice_purchase"
    | "elearning_subscription"
    | "ayclpurchase";
}) => {
  /* ================================
   * 1. VALIDASI REFERRAL CODE
   * ================================ */
  const referralCode = await prisma.referralCode.findUnique({
    where: { code },
    select: {
      id: true,
      isActive: true,
      expiryDate: true,
      owner: {
        select: {
          affiliatorProfile: {
            select: {
              isActive: true,
            },
          },
        },
      },
    },
  });

  if (!referralCode) throw new Error("Referral code not found");
  if (!referralCode.isActive) throw new Error("Referral code is not active");
  if (referralCode.expiryDate && referralCode.expiryDate < new Date()) {
    throw new Error("Referral code has expired");
  }

  // Validasi affiliator profile aktif
  if (!referralCode.owner.affiliatorProfile) {
    throw new Error("Referral code owner is not an active affiliator");
  }
  if (!referralCode.owner.affiliatorProfile.isActive) {
    throw new Error("Referral code owner affiliator is inactive");
  }

  /* ================================
   * 2. CEK USER SUDAH PERNAH PAKAI
   * ================================ */
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

  /* ================================
   * 3. CREATE REFERRAL USAGE
   * ================================ */
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

  /* ================================
   * 4. RESPONSE
   * Tidak return diskon di sini —
   * kalkulasi dilakukan di applyReferralTo[Produk]Service
   * yang sudah tahu productType spesifiknya
   * ================================ */
  return {
    referralUsageId: referralUsage.id,
    referralCodeId: referralCode.id,
  };
};

export const applyReferralToBookingService = async ({
  userId,
  bookingId,
  code,
}: {
  userId: string;
  bookingId: string;
  code: string;
}) => {
  let referralUsageId: string | null = null;

  try {
    return await prisma.$transaction(async (tx) => {
      /* ===============================
         1️⃣ Ambil booking + invoice + payments
      =============================== */
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          mentoringService: true,
          invoice: {
            include: {
              payments: {
                orderBy: { installmentNumber: "asc" },
              },
            },
          },
        },
      });

      if (!booking) throw { status: 404, message: "Booking tidak ditemukan." };
      if (booking.menteeId !== userId)
        throw { status: 403, message: "Bukan booking milik anda." };
      if (booking.status !== "pending")
        throw { status: 400, message: "Referral hanya bisa saat pending." };
      if (!booking.invoice)
        throw { status: 400, message: "Invoice tidak ditemukan." };
      if (booking.referralUsageId)
        throw { status: 400, message: "Referral sudah digunakan." };

      const hasPaidPayment = booking.invoice.payments.some(
        (p) => p.status === "confirmed",
      );
      if (hasPaidPayment) {
        throw {
          status: 400,
          message:
            "Referral tidak bisa diterapkan setelah pembayaran dilakukan.",
        };
      }

      /* ===============================
         2️⃣ Ambil tier affiliator dari referral code
      =============================== */
      const referral = await tx.referralCode.findUnique({
        where: { code },
        select: {
          id: true,
          owner: {
            select: {
              affiliatorProfile: {
                select: { currentTier: true, isActive: true },
              },
            },
          },
        },
      });

      if (!referral)
        throw { status: 404, message: "Referral tidak ditemukan." };

      const tier = referral.owner.affiliatorProfile?.currentTier ?? "BRONZE";

      /* ===============================
         3️⃣ Resolve productType + config
      =============================== */
      const serviceType = booking.mentoringService.serviceType;
      if (!serviceType) {
        throw { status: 400, message: "Service type tidak ditemukan." };
      }

      const productType = resolveMentoringProductType(serviceType);
      const config = await resolveProductConfig(productType, tier);

      const discountPercent = config.discountPercent?.toNumber() ?? 0;
      const commissionPercent = config.commissionPercent?.toNumber() ?? 0;
      const originalPrice = booking.mentoringService.price.toNumber();
      const discountAmount = Math.round(
        originalPrice * (discountPercent / 100),
      );
      const finalPrice = originalPrice - discountAmount;

      /* ===============================
         4️⃣ Buat ReferralUsage (di luar tx)
         Disimpan ke variable supaya bisa di-cleanup jika tx gagal
      =============================== */
      const referralResult = await useReferralCodeService({
        userId,
        code,
        context: "booking",
      });

      referralUsageId = referralResult.referralUsageId; // simpan untuk cleanup

      /* ===============================
         5️⃣ Update booking
      =============================== */
      await tx.booking.update({
        where: { id: bookingId },
        data: { referralUsageId },
      });

      /* ===============================
         6️⃣ Update invoice
      =============================== */
      await tx.bookingInvoice.update({
        where: { id: booking.invoice.id },
        data: {
          totalAmount: finalPrice,
          remainingAmount: finalPrice,
          updatedAt: new Date(),
        },
      });

      /* ===============================
         7️⃣ Recalculate payments
      =============================== */
      const invoice = booking.invoice;
      const installmentCount = invoice.installmentCount || 1;
      let recalculatedAmounts: number[] = [];

      if (invoice.paymentType === "FULL" || installmentCount === 1) {
        recalculatedAmounts = [finalPrice];
      } else if (installmentCount === 2) {
        recalculatedAmounts = [
          Math.round(finalPrice * 0.6),
          finalPrice - Math.round(finalPrice * 0.6),
        ];
      } else if (installmentCount === 3) {
        const first = Math.round(finalPrice * 0.5);
        const second = Math.round(finalPrice * 0.3);
        recalculatedAmounts = [first, second, finalPrice - first - second];
      } else {
        const perInstallment = Math.floor(finalPrice / installmentCount);
        recalculatedAmounts = Array(installmentCount).fill(perInstallment);
        recalculatedAmounts[recalculatedAmounts.length - 1] +=
          finalPrice - perInstallment * installmentCount;
      }

      for (let i = 0; i < invoice.payments.length; i++) {
        await tx.payment.update({
          where: { id: invoice.payments[i].id },
          data: { amount: recalculatedAmounts[i] || 0, updatedAt: new Date() },
        });
      }

      /* ===============================
         8️⃣ Komisi dicatat di payment callback
      =============================== */

      return {
        originalPrice,
        discountPercent,
        discountAmount,
        finalPrice,
        tier,
        productType,
        commissionPercent,
        paymentType: invoice.paymentType,
        installmentCount,
        recalculatedPayments: recalculatedAmounts,
      };
    });
  } catch (err) {
    /* ===============================
       🧹 CLEANUP: hapus ReferralUsage jika tx gagal
       setelah useReferralCodeService berhasil dipanggil
    =============================== */
    if (referralUsageId) {
      await prisma.referralUsage
        .delete({
          where: { id: referralUsageId },
        })
        .catch((cleanupErr) => {
          // Log saja, jangan throw — error aslinya tetap harus dilempar
          console.error(
            `[CLEANUP] Gagal menghapus ReferralUsage ${referralUsageId}:`,
            cleanupErr,
          );
        });
    }

    throw err; // lempar error asli ke controller
  }
};

export const applyReferralToELearningService = async ({
  userId,
  subscriptionId,
  code,
}: {
  userId: string;
  subscriptionId: string;
  code: string;
}) => {
  let referralUsageId: string | null = null;

  try {
    return await prisma.$transaction(async (tx) => {
      /* ===============================
         1️⃣ Ambil subscription + plan + payment
      =============================== */
      const subscription = await tx.eLearningSubscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true, payment: true },
      });

      if (!subscription)
        throw { status: 404, message: "Subscription tidak ditemukan." };
      if (subscription.userId !== userId)
        throw { status: 403, message: "Bukan subscription milik anda." };
      if (subscription.status !== "pending")
        throw { status: 400, message: "Referral hanya bisa saat pending." };
      if (!subscription.payment)
        throw { status: 400, message: "Payment tidak ditemukan." };
      if (subscription.referralUsageId)
        throw { status: 400, message: "Referral sudah digunakan." };

      /* ===============================
         2️⃣ Ambil tier affiliator dari referral code
      =============================== */
      const referral = await tx.referralCode.findUnique({
        where: { code },
        select: {
          id: true,
          owner: {
            select: {
              affiliatorProfile: {
                select: { currentTier: true, isActive: true },
              },
            },
          },
        },
      });

      if (!referral)
        throw { status: 404, message: "Referral tidak ditemukan." };

      const tier = referral.owner.affiliatorProfile?.currentTier ?? "BRONZE";

      /* ===============================
         3️⃣ Resolve productType dari durationDay plan
      =============================== */
      const productType = resolveElearningProductType(
        subscription.plan.durationDay,
      );

      /* ===============================
         4️⃣ Ambil config diskon + komisi (E-Learning = fixed amount)
      =============================== */
      const config = await resolveProductConfig(productType, tier);

      const discountAmount = config.discountAmount
        ? config.discountAmount.toNumber()
        : 0;
      const commissionAmount = config.commissionAmount
        ? config.commissionAmount.toNumber()
        : 0;

      const originalPrice = subscription.plan.price.toNumber();
      const finalPrice = Math.max(0, originalPrice - discountAmount);

      /* ===============================
         5️⃣ Buat ReferralUsage (di luar tx)
      =============================== */
      const referralResult = await useReferralCodeService({
        userId,
        code,
        context: "elearning_subscription",
      });

      referralUsageId = referralResult.referralUsageId;

      /* ===============================
         6️⃣ Update subscription
      =============================== */
      await tx.eLearningSubscription.update({
        where: { id: subscriptionId },
        data: { referralUsageId },
      });

      /* ===============================
         7️⃣ Update payment
      =============================== */
      await tx.payment.update({
        where: { eLearningSubscriptionId: subscriptionId },
        data: { amount: finalPrice, updatedAt: new Date() },
      });

      /* ===============================
         8️⃣ Komisi dicatat di payment callback
      =============================== */

      return {
        originalPrice,
        discountAmount,
        finalPrice,
        tier,
        productType,
        commissionAmount, // info saja, belum dicatat
      };
    });
  } catch (err) {
    /* ===============================
       🧹 CLEANUP: hapus ReferralUsage jika tx gagal
    =============================== */
    if (referralUsageId) {
      await prisma.referralUsage
        .delete({ where: { id: referralUsageId } })
        .catch((cleanupErr) => {
          console.error(
            `[CLEANUP] Gagal menghapus ReferralUsage ${referralUsageId}:`,
            cleanupErr,
          );
        });
    }

    throw err;
  }
};

export const applyReferralToAyclBookingService = async ({
  userId,
  bookingId,
  code,
}: {
  userId: string;
  bookingId: string;
  code: string;
}) => {
  let referralUsageId: string | null = null;

  try {
    return await prisma.$transaction(async (tx) => {
      /* ===============================
         1️⃣ Ambil booking + batch + payment
      =============================== */
      const booking = await tx.aYCLBooking.findUnique({
        where: { id: bookingId },
        include: { batch: true, payment: true },
      });

      if (!booking) throw { status: 404, message: "Booking tidak ditemukan." };
      if (booking.userId !== userId)
        throw { status: 403, message: "Bukan booking milik anda." };
      if (booking.status !== "pending")
        throw { status: 400, message: "Referral hanya bisa saat pending." };
      if (!booking.payment)
        throw { status: 400, message: "Payment tidak ditemukan." };
      if (booking.referralUsageId)
        throw { status: 400, message: "Referral sudah digunakan." };

      /* ===============================
         2️⃣ Ambil tier affiliator dari referral code
      =============================== */
      const referral = await tx.referralCode.findUnique({
        where: { code },
        select: {
          id: true,
          owner: {
            select: {
              affiliatorProfile: {
                select: { currentTier: true, isActive: true },
              },
            },
          },
        },
      });

      if (!referral)
        throw { status: 404, message: "Referral tidak ditemukan." };

      const tier = referral.owner.affiliatorProfile?.currentTier ?? "BRONZE";

      /* ===============================
         3️⃣ Resolve config — AYCL saat ini isActive: false
         akan otomatis melempar error di sini
      =============================== */
      const config = await resolveProductConfig("AYCL", tier);

      const discountPercent = config.discountPercent?.toNumber() ?? 0;
      const commissionPercent = config.commissionPercent?.toNumber() ?? 0;

      const originalPrice = booking.batch.price.toNumber();
      const discountAmount = Math.round(
        originalPrice * (discountPercent / 100),
      );
      const finalPrice = originalPrice - discountAmount;

      /* ===============================
         4️⃣ Buat ReferralUsage (di luar tx)
      =============================== */
      const referralResult = await useReferralCodeService({
        userId,
        code,
        context: "ayclpurchase",
      });

      referralUsageId = referralResult.referralUsageId;

      /* ===============================
         5️⃣ Update booking
      =============================== */
      await tx.aYCLBooking.update({
        where: { id: bookingId },
        data: { referralUsageId },
      });

      /* ===============================
         6️⃣ Update payment
      =============================== */
      await tx.payment.update({
        where: { ayclBookingId: bookingId },
        data: { amount: finalPrice, updatedAt: new Date() },
      });

      /* ===============================
         7️⃣ Komisi dicatat di payment callback
      =============================== */

      return {
        originalPrice,
        discountPercent,
        discountAmount,
        finalPrice,
        tier,
        productType: "AYCL",
        commissionPercent,
      };
    });
  } catch (err) {
    /* ===============================
       🧹 CLEANUP
    =============================== */
    if (referralUsageId) {
      await prisma.referralUsage
        .delete({ where: { id: referralUsageId } })
        .catch((cleanupErr) => {
          console.error(
            `[CLEANUP] Gagal menghapus ReferralUsage ${referralUsageId}:`,
            cleanupErr,
          );
        });
    }

    throw err;
  }
};

export const getReferralCommissions = async (input: {
  referralCodeId?: string;
  productType?: string;
  tier?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}) => {
  const { referralCodeId, productType, tier, startDate, endDate, page, limit } =
    input;

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
    throw { status: 400, message: "Format endDate tidak valid (yyyy-mm-dd)." };
  }
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw {
      status: 400,
      message: "startDate harus sebelum atau sama dengan endDate.",
    };
  }

  const skip = (page - 1) * limit;

  const where: Prisma.ReferralCommisionsWhereInput = {};

  if (referralCodeId) where.referralCodeId = referralCodeId;
  if (productType) where.productType = productType;
  if (tier) where.tierAtTransaction = tier;

  if (startDate) {
    where.created_at = { gte: new Date(startDate) };
  }
  if (endDate) {
    where.created_at = {
      ...(typeof where.created_at === "object" ? where.created_at : {}),
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
      tierAtTransaction: true,
      productType: true,
      pointsAwarded: true,
      seasonId: true,
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
      season: {
        select: {
          seasonName: true,
          startDate: true,
          endDate: true,
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
          practicePurchaseId: true,
          eLearningSubscriptionId: true,
          ayclBookingId: true,
          status: true,
          bookingInvoice: {
            select: { bookingId: true },
          },
        },
      });

      return {
        ...commission,
        payment: payment
          ? {
              bookingId: payment.bookingInvoice?.bookingId ?? null,
              practicePurchaseId: payment.practicePurchaseId,
              eLearningSubscriptionId: payment.eLearningSubscriptionId,
              ayclBookingId: payment.ayclBookingId,
              status: payment.status,
            }
          : null,
      };
    }),
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

export const getAffiliatorReferralCodes = async (input: {
  ownerId: string;
  isActive?: boolean;
  page: number;
  limit: number;
}) => {
  const { ownerId, isActive, page, limit } = input;

  if (page < 1 || limit < 1) {
    throw {
      status: 400,
      message: "Page dan limit harus berupa angka positif.",
    };
  }

  const skip = (page - 1) * limit;

  const where: Prisma.ReferralCodeWhereInput = { ownerId };
  if (isActive !== undefined) where.isActive = isActive;

  const referralCodes = await prisma.referralCode.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      // HAPUS: discountPercentage, commissionPercentage
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
          affiliatorProfile: {
            select: {
              currentTier: true,
              totalPoints: true,
              isActive: true,
              seasonPoints: {
                where: { season: { isActive: true } },
                select: {
                  points: true,
                  tierAtSeasonStart: true,
                  season: {
                    select: {
                      seasonName: true,
                      startDate: true,
                      endDate: true,
                    },
                  },
                },
                take: 1,
              },
            },
          },
        },
      },
      _count: {
        select: {
          usages: true,
          referralCommisions: true,
        },
      },
    },
  });

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
  context?:
    | "booking"
    | "practice_purchase"
    | "elearning_subscription"
    | "ayclpurchase"; // sudah ada, pastikan konsisten
  page: number;
  limit: number;
}) => {
  const { referralCodeId, ownerId, context, page, limit } = input;

  if (page < 1 || limit < 1) {
    throw {
      status: 400,
      message: "Page dan limit harus berupa angka positif.",
    };
  }

  const referralCode = await prisma.referralCode.findFirst({
    where: { id: referralCodeId, ownerId },
  });

  if (!referralCode) {
    throw {
      status: 404,
      message: "Referral code not found or you do not have access.",
    };
  }

  const skip = (page - 1) * limit;

  const where: Prisma.ReferralUsageWhereInput = { referralCodeId };
  if (context) where.context = context;

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
      eLearningSubscription: {
        select: {
          id: true,
          startAt: true,
          endAt: true,
          status: true,
        },
      },
      ayclBooking: {
        // tambah
        select: {
          id: true,
          createdAt: true,
          status: true,
          batch: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

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
    throw { status: 400, message: "Format endDate tidak valid (yyyy-mm-dd)." };
  }
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw {
      status: 400,
      message: "startDate harus sebelum atau sama dengan endDate.",
    };
  }

  const referralCode = await prisma.referralCode.findFirst({
    where: { id: referralCodeId, ownerId },
  });

  if (!referralCode) {
    throw {
      status: 404,
      message: "Referral code not found or you do not have access.",
    };
  }

  const skip = (page - 1) * limit;

  const where: Prisma.ReferralCommisionsWhereInput = { referralCodeId };

  if (startDate) {
    where.created_at = { gte: new Date(startDate) };
  }
  if (endDate) {
    where.created_at = {
      ...(typeof where.created_at === "object" ? where.created_at : {}),
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
      // field baru
      tierAtTransaction: true,
      productType: true,
      pointsAwarded: true,
      seasonId: true,
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
      season: {
        select: {
          seasonName: true,
          startDate: true,
          endDate: true,
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
          practicePurchaseId: true,
          eLearningSubscriptionId: true,
          ayclBookingId: true,
          status: true,
          amount: true,
          createdAt: true,
          bookingInvoice: {
            select: {
              booking: { select: { id: true } },
            },
          },
        },
      });

      if (!payment) {
        return { ...commission, payment: null };
      }

      const { bookingInvoice, ...paymentData } = payment;

      return {
        ...commission,
        payment: {
          ...paymentData,
          bookingId: bookingInvoice?.booking?.id ?? null,
        },
      };
    }),
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
  withdrawalMethodId: string;
}) => {
  const { referralCodeId, ownerId, amount, withdrawalMethodId } = input;

  const referralCode = await prisma.referralCode.findFirst({
    where: { id: referralCodeId, ownerId },
    include: {
      owner: {
        select: {
          fullName: true,
          email: true,
          affiliatorProfile: {
            select: { id: true, currentTier: true, isActive: true },
          },
        },
      },
    },
  });

  if (!referralCode) {
    throw {
      status: 404,
      message: "Referral code not found or you do not have access.",
    };
  }

  if (!referralCode.owner.affiliatorProfile?.isActive) {
    throw { status: 403, message: "Affiliator profile tidak aktif." };
  }

  // ⭐ BARU — pastikan withdrawal method beneran milik user ini
  const withdrawalMethod = await prisma.withdrawalMethod.findFirst({
    where: { id: withdrawalMethodId, userId: ownerId, isActive: true },
  });

  if (!withdrawalMethod) {
    throw {
      status: 404,
      message: "Metode penarikan tidak ditemukan atau tidak aktif.",
    };
  }

  // H+3: hanya komisi yang dicatat lebih dari 3 hari lalu yang bisa ditarik
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const totalEligible = await prisma.referralCommisions.aggregate({
    where: { referralCodeId, created_at: { lte: threeDaysAgo } },
    _sum: { amount: true },
  });

  const totalPaid = await prisma.commissionPayments.aggregate({
    where: { referralCodeId, status: { in: ["pending", "paid"] } },
    _sum: { amount: true },
  });

  const availableBalance =
    (totalEligible._sum.amount?.toNumber() ?? 0) -
    (totalPaid._sum.amount?.toNumber() ?? 0);

  if (availableBalance < amount) {
    throw {
      status: 400,
      message: `Saldo komisi tidak mencukupi. Tersedia: Rp ${availableBalance.toLocaleString("id-ID")} (komisi H+3), Diminta: Rp ${amount.toLocaleString("id-ID")}`,
    };
  }

  const paymentRequest = await prisma.commissionPayments.create({
    data: {
      referralCodeId,
      amount,
      withdrawalMethodId, // ⭐ BARU — disimpan buat audit & referensi admin
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
              affiliatorProfile: {
                select: { currentTier: true, isActive: true },
              },
            },
          },
        },
      },
    },
  });

  // ⭐ BARU — kirim notifikasi email ke admin (gak menggagalkan request kalau gagal kirim)
  sendCommissionWithdrawalRequestEmail({
    affiliatorName: referralCode.owner.fullName,
    affiliatorEmail: referralCode.owner.email,
    referralCode: referralCode.code,
    amount,
    requestId: paymentRequest.id,
    requestDate: paymentRequest.created_at,
    withdrawalMethod: {
      type: withdrawalMethod.type as "bank" | "eWallet",
      providerName: withdrawalMethod.providerName,
      accountNumber: withdrawalMethod.accountNumber,
      accountName: withdrawalMethod.accountName ?? "-",
    },
    remainingBalance: availableBalance - amount, // ⭐ BARU — sisa saldo affiliator setelah request ini diproses
  }).catch((err) =>
    console.error("[requestCommissionPayment] Gagal kirim email admin:", err),
  );

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

  const where: Prisma.CommissionPaymentsWhereInput = {
    referralCode: { ownerId },
    ...(status && { status }),
    ...(startDate &&
      endDate && {
        created_at: { gte: startDate, lte: endDate },
      }),
  };

  const [total, payments] = await Promise.all([
    prisma.commissionPayments.count({ where }),
    prisma.commissionPayments.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
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
                affiliatorProfile: {
                  // tambah
                  select: {
                    currentTier: true,
                    totalPoints: true,
                    isActive: true,
                  },
                },
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
        affiliatorProfile: payment.referralCode.owner.affiliatorProfile, // tambah
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

  const where: Prisma.CommissionPaymentsWhereInput = {
    ...(status && { status }),
    ...(startDate &&
      endDate && {
        created_at: { gte: startDate, lte: endDate },
      }),
    ...(referralCodeId && { referralCodeId }),
    ...(ownerId && { referralCode: { ownerId } }),
  };

  const [total, payments] = await Promise.all([
    prisma.commissionPayments.count({ where }),
    prisma.commissionPayments.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
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
                affiliatorProfile: {
                  // tambah
                  select: {
                    currentTier: true,
                    totalPoints: true,
                    isActive: true,
                  },
                },
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
        affiliatorProfile: payment.referralCode.owner.affiliatorProfile, // tambah
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

// ============================================================
// GET /affiliator/profile
// ============================================================

// Helper: hitung poin yang dibutuhkan untuk naik tier
function resolveNextTierProgress(
  currentTier: string,
  totalPoints: number,
): {
  nextTier: string | null;
  pointsToNext: number | null;
  maintenanceQuota: number | null;
} {
  if (currentTier === "BRONZE") {
    return {
      nextTier: "SILVER",
      pointsToNext: Math.max(0, 40 - totalPoints),
      maintenanceQuota: null, // BRONZE tidak punya kuota maintenance
    };
  }
  if (currentTier === "SILVER") {
    return {
      nextTier: "GOLD",
      pointsToNext: Math.max(0, 120 - totalPoints),
      maintenanceQuota: 15,
    };
  }
  // GOLD — sudah tier tertinggi
  return {
    nextTier: null,
    pointsToNext: null,
    maintenanceQuota: 40,
  };
}

export const getAffiliatorProfileService = async (userId: string) => {
  // Ambil profile + season aktif + riwayat 3 season terakhir
  const profile = await prisma.affiliatorProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      currentTier: true,
      totalPoints: true,
      isActive: true,
      joinedAt: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          profilePicture: true,
        },
      },
      seasonPoints: {
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          points: true,
          tierAtSeasonStart: true,
          tierAtSeasonEnd: true,
          maintenanceQuotaMet: true,
          createdAt: true,
          season: {
            select: {
              id: true,
              seasonName: true,
              startDate: true,
              endDate: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  if (!profile) {
    throw { status: 404, message: "Affiliator profile tidak ditemukan." };
  }

  // Pisahkan season aktif dari riwayat
  const currentSeasonPoint =
    profile.seasonPoints.find((sp) => sp.season.isActive) ?? null;

  const seasonHistory = profile.seasonPoints.filter(
    (sp) => !sp.season.isActive,
  );

  // Progress tier
  const tierProgress = resolveNextTierProgress(
    profile.currentTier,
    profile.totalPoints,
  );

  // Hitung total komisi all-time dari referral codes milik user ini
  const referralCodes = await prisma.referralCode.findMany({
    where: { ownerId: userId },
    select: { id: true, code: true, isActive: true },
  });

  const referralCodeIds = referralCodes.map((rc) => rc.id);

  const totalCommissionResult = await prisma.referralCommisions.aggregate({
    where: { referralCodeId: { in: referralCodeIds } },
    _sum: { amount: true },
  });

  const totalCommissionEarned =
    totalCommissionResult._sum.amount?.toNumber() ?? 0;

  // Hitung saldo yang sudah cair (paid)
  const paidCommissionResult = await prisma.commissionPayments.aggregate({
    where: {
      referralCodeId: { in: referralCodeIds },
      status: "paid",
    },
    _sum: { amount: true },
  });

  const totalCommissionPaid = paidCommissionResult._sum.amount?.toNumber() ?? 0;

  // Saldo pending (sudah request, belum dibayar)
  const pendingCommissionResult = await prisma.commissionPayments.aggregate({
    where: {
      referralCodeId: { in: referralCodeIds },
      status: "pending",
    },
    _sum: { amount: true },
  });

  const totalCommissionPending =
    pendingCommissionResult._sum.amount?.toNumber() ?? 0;

  // Saldo yang bisa ditarik (H+3, belum diminta)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const eligibleCommissionResult = await prisma.referralCommisions.aggregate({
    where: {
      referralCodeId: { in: referralCodeIds },
      created_at: { lte: threeDaysAgo },
    },
    _sum: { amount: true },
  });

  const totalEligible = eligibleCommissionResult._sum.amount?.toNumber() ?? 0;

  const availableBalance =
    totalEligible - totalCommissionPaid - totalCommissionPending;

  return {
    // Info user
    user: profile.user,
    // Info affiliator profile
    profile: {
      id: profile.id,
      currentTier: profile.currentTier,
      totalPoints: profile.totalPoints,
      isActive: profile.isActive,
      joinedAt: profile.joinedAt,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    },
    // Progress tier
    tierProgress: {
      currentTier: profile.currentTier,
      nextTier: tierProgress.nextTier,
      totalPoints: profile.totalPoints,
      pointsToNextTier: tierProgress.pointsToNext,
      maintenanceQuota: tierProgress.maintenanceQuota,
    },
    // Season saat ini
    currentSeason: currentSeasonPoint
      ? {
          seasonName: currentSeasonPoint.season.seasonName,
          startDate: currentSeasonPoint.season.startDate,
          endDate: currentSeasonPoint.season.endDate,
          pointsThisSeason: currentSeasonPoint.points,
          tierAtSeasonStart: currentSeasonPoint.tierAtSeasonStart,
          maintenanceQuota: tierProgress.maintenanceQuota,
          maintenanceProgress: tierProgress.maintenanceQuota
            ? Math.min(
                100,
                Math.round(
                  (currentSeasonPoint.points / tierProgress.maintenanceQuota) *
                    100,
                ),
              )
            : null, // null = BRONZE, tidak ada kuota
        }
      : null,
    // Riwayat season (maks 2 season terakhir yang sudah selesai)
    seasonHistory: seasonHistory.map((sp) => ({
      seasonName: sp.season.seasonName,
      startDate: sp.season.startDate,
      endDate: sp.season.endDate,
      points: sp.points,
      tierAtSeasonStart: sp.tierAtSeasonStart,
      tierAtSeasonEnd: sp.tierAtSeasonEnd,
      maintenanceQuotaMet: sp.maintenanceQuotaMet,
    })),
    // Referral codes summary
    referralCodes: referralCodes.map((rc) => ({
      id: rc.id,
      code: rc.code,
      isActive: rc.isActive,
    })),
    // Saldo komisi
    commissionSummary: {
      totalEarned: totalCommissionEarned,
      totalPaid: totalCommissionPaid,
      pendingWithdrawal: totalCommissionPending,
      availableBalance: Math.max(0, availableBalance),
    },
  };
};

// ============================================================
// Admin: GET /admin/product-configs
// ============================================================

export const getProductConfigsService = async (filter: {
  productType?: string;
  tier?: string;
  isActive?: boolean;
}) => {
  const { productType, tier, isActive } = filter;

  const where: Prisma.AffiliatorProductConfigWhereInput = {};
  if (productType) where.productType = productType;
  if (tier) where.tier = tier;
  if (isActive !== undefined) where.isActive = isActive;

  const configs = await prisma.affiliatorProductConfig.findMany({
    where,
    orderBy: [{ productType: "asc" }, { tier: "asc" }],
    select: {
      id: true,
      productType: true,
      tier: true,
      commissionAmount: true,
      discountAmount: true,
      commissionPercent: true,
      discountPercent: true,
      pointsAwarded: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return configs.map((c) => ({
    id: c.id,
    productType: c.productType,
    tier: c.tier,
    commissionAmount: c.commissionAmount?.toNumber() ?? null,
    discountAmount: c.discountAmount?.toNumber() ?? null,
    commissionPercent: c.commissionPercent?.toNumber() ?? null,
    discountPercent: c.discountPercent?.toNumber() ?? null,
    pointsAwarded: c.pointsAwarded,
    isActive: c.isActive,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
};

// ============================================================
// Admin: PATCH /admin/product-configs/:id
// ============================================================

export const updateProductConfigService = async (
  id: string,
  data: {
    commissionAmount?: number;
    discountAmount?: number;
    commissionPercent?: number;
    discountPercent?: number;
    pointsAwarded?: number;
    isActive?: boolean;
  },
) => {
  const existing = await prisma.affiliatorProductConfig.findUnique({
    where: { id },
  });

  if (!existing) {
    throw { status: 404, message: "Product config tidak ditemukan." };
  }

  const updated = await prisma.affiliatorProductConfig.update({
    where: { id },
    data: {
      ...(data.commissionAmount !== undefined && {
        commissionAmount: data.commissionAmount,
      }),
      ...(data.discountAmount !== undefined && {
        discountAmount: data.discountAmount,
      }),
      ...(data.commissionPercent !== undefined && {
        commissionPercent: data.commissionPercent,
      }),
      ...(data.discountPercent !== undefined && {
        discountPercent: data.discountPercent,
      }),
      ...(data.pointsAwarded !== undefined && {
        pointsAwarded: data.pointsAwarded,
      }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: new Date(),
    },
    select: {
      id: true,
      productType: true,
      tier: true,
      commissionAmount: true,
      discountAmount: true,
      commissionPercent: true,
      discountPercent: true,
      pointsAwarded: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    id: updated.id,
    productType: updated.productType,
    tier: updated.tier,
    commissionAmount: updated.commissionAmount?.toNumber() ?? null,
    discountAmount: updated.discountAmount?.toNumber() ?? null,
    commissionPercent: updated.commissionPercent?.toNumber() ?? null,
    discountPercent: updated.discountPercent?.toNumber() ?? null,
    pointsAwarded: updated.pointsAwarded,
    isActive: updated.isActive,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
};

// ============================================================
// Admin: GET /admin/affiliator-profiles
// ============================================================

export const getAdminAffiliatorProfilesService = async (filter: {
  page: number;
  limit: number;
  tier?: string;
  isActive?: boolean;
  search?: string;
}) => {
  const { page, limit, tier, isActive, search } = filter;

  const skip = (page - 1) * limit;

  const where: Prisma.AffiliatorProfileWhereInput = {};

  if (tier) where.currentTier = tier;
  if (isActive !== undefined) where.isActive = isActive;

  // Filter by nama atau email user
  if (search) {
    where.user = {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [total, profiles] = await Promise.all([
    prisma.affiliatorProfile.count({ where }),
    prisma.affiliatorProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { joinedAt: "desc" },
      select: {
        id: true,
        currentTier: true,
        totalPoints: true,
        isActive: true,
        joinedAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profilePicture: true,
          },
        },
        // Season aktif saja untuk monitoring cepat
        seasonPoints: {
          where: { season: { isActive: true } },
          select: {
            points: true,
            tierAtSeasonStart: true,
            season: {
              select: {
                seasonName: true,
                startDate: true,
                endDate: true,
              },
            },
          },
          take: 1,
        },
        // Hitung total referral codes
        _count: {
          select: {
            // AffiliatorProfile tidak punya relasi langsung ke ReferralCode,
            // jadi kita ambil lewat user di bawah
          },
        },
      },
    }),
  ]);

  // Ambil stat komisi per affiliator (referralCodeIds dari ownerId = user.id)
  const profilesWithStats = await Promise.all(
    profiles.map(async (profile) => {
      // Ambil referral codes milik user ini
      const referralCodes = await prisma.referralCode.findMany({
        where: { ownerId: profile.user.id },
        select: { id: true },
      });

      const referralCodeIds = referralCodes.map((rc) => rc.id);

      const [totalCommission, totalUsages] = await Promise.all([
        // Total komisi yang sudah diterima
        prisma.referralCommisions.aggregate({
          where: { referralCodeId: { in: referralCodeIds } },
          _sum: { amount: true },
          _count: { id: true },
        }),
        // Total referral code yang sudah digunakan
        prisma.referralUsage.count({
          where: { referralCodeId: { in: referralCodeIds } },
        }),
      ]);

      const currentSeasonPoint = profile.seasonPoints[0] ?? null;

      return {
        id: profile.id,
        currentTier: profile.currentTier,
        totalPoints: profile.totalPoints,
        isActive: profile.isActive,
        joinedAt: profile.joinedAt,
        updatedAt: profile.updatedAt,
        user: profile.user,
        currentSeason: currentSeasonPoint
          ? {
              seasonName: currentSeasonPoint.season.seasonName,
              startDate: currentSeasonPoint.season.startDate,
              endDate: currentSeasonPoint.season.endDate,
              pointsThisSeason: currentSeasonPoint.points,
              tierAtSeasonStart: currentSeasonPoint.tierAtSeasonStart,
            }
          : null,
        stats: {
          totalReferralCodes: referralCodeIds.length,
          totalUsages,
          totalCommissionEarned: totalCommission._sum.amount?.toNumber() ?? 0,
          totalCommissionTransactions: totalCommission._count.id,
        },
      };
    }),
  );

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: profilesWithStats,
  };
};

// ============================================================
// Admin: GET /admin/seasons
// ============================================================

export const getAdminSeasonsService = async (filter: {
  isActive?: boolean;
}) => {
  const { isActive } = filter;

  const where: Prisma.AffiliatorSeasonWhereInput = {};
  if (isActive !== undefined) where.isActive = isActive;

  const seasons = await prisma.affiliatorSeason.findMany({
    where,
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      seasonName: true,
      startDate: true,
      endDate: true,
      isActive: true,
      createdAt: true,
      // Jumlah affiliator yang terdaftar di season ini
      _count: {
        select: { seasonPoints: true },
      },
    },
  });

  // Untuk season aktif, hitung distribusi tier saat ini
  const seasonsWithStats = await Promise.all(
    seasons.map(async (season) => {
      // Hitung total poin yang dihasilkan di season ini
      const pointsAggregate = await prisma.affiliatorSeasonPoint.aggregate({
        where: { seasonId: season.id },
        _sum: { points: true },
        _avg: { points: true },
        _max: { points: true },
      });

      // Hitung distribusi tier saat season ini berjalan/selesai
      const tierDistribution = await prisma.affiliatorSeasonPoint.groupBy({
        by: ["tierAtSeasonStart"],
        where: { seasonId: season.id },
        _count: { tierAtSeasonStart: true },
      });

      // Hitung yang berhasil / gagal maintenance quota (season yang sudah selesai)
      const evaluationResult = season.isActive
        ? null
        : await prisma.affiliatorSeasonPoint.groupBy({
            by: ["maintenanceQuotaMet"],
            where: { seasonId: season.id },
            _count: { maintenanceQuotaMet: true },
          });

      return {
        id: season.id,
        seasonName: season.seasonName,
        startDate: season.startDate,
        endDate: season.endDate,
        isActive: season.isActive,
        createdAt: season.createdAt,
        stats: {
          totalAffiliators: season._count.seasonPoints,
          totalPointsGenerated: pointsAggregate._sum.points ?? 0,
          averagePoints: Math.round(pointsAggregate._avg.points ?? 0),
          highestPoints: pointsAggregate._max.points ?? 0,
          // Distribusi tier di awal season
          tierDistribution: tierDistribution.reduce(
            (acc, item) => {
              acc[item.tierAtSeasonStart] = item._count.tierAtSeasonStart;
              return acc;
            },
            {} as Record<string, number>,
          ),
          // Hasil evaluasi (null jika season masih aktif)
          evaluationResult: evaluationResult
            ? evaluationResult.reduce(
                (acc, item) => {
                  const key =
                    item.maintenanceQuotaMet === true
                      ? "passed"
                      : item.maintenanceQuotaMet === false
                        ? "failed"
                        : "notEvaluated";
                  acc[key] = item._count.maintenanceQuotaMet;
                  return acc;
                },
                {} as Record<string, number>,
              )
            : null,
        },
      };
    }),
  );

  return seasonsWithStats;
};
