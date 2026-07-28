import { PrismaClient, Prisma } from "@prisma/client";
import { Parser as Json2CsvParser } from "json2csv";
import ExcelJS from "exceljs";
import {
  format as formatDate,
  subDays,
  addDays,
  isAfter,
  differenceInCalendarDays,
} from "date-fns";
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

export const generateELearningSubscriptionId = async () => {
  return `SUB-EL-${Date.now()}-${Math.floor(
    1000000000 + Math.random() * 9000000000,
  )}`;
};

export const generateELearningPaymentId = async () => {
  const prefix = "PAY-EL";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000000000 + Math.random() * 9000000000);
  return `${prefix}-${date}-${random}`;
};

export const createSubscription = async (input: {
  userId: string;
  planId: string;
  referralUsageId?: string;
}) => {
  const { userId, planId, referralUsageId } = input;

  /* ===== 1. VALIDATE USER ===== */
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw { status: 404, message: "User tidak ditemukan." };
  }

  /* ===== 2. VALIDATE PLAN ===== */
  const plan = await prisma.eLearningSubscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan || !plan.isActive) {
    throw {
      status: 404,
      message: "Subscription plan tidak ditemukan atau tidak aktif.",
    };
  }

  /* ===== 3. CEK SUBSCRIPTION TERAKHIR ===== */

  /**
   * 3a️⃣ Cari subscription PAID terlebih dulu
   * (ini yang PALING PRIORITAS untuk penumpukan)
   */
  const lastPaidSubscription = await prisma.eLearningSubscription.findFirst({
    where: {
      userId,
      status: { in: ["confirmed", "active", "completed"] },
    },
    orderBy: {
      endAt: "desc",
    },
  });

  /**
   * 3b️⃣ Kalau BELUM ADA yang paid, baru cek pending
   */
  const lastPendingSubscription = await prisma.eLearningSubscription.findFirst({
    where: {
      userId,
      status: "pending",
    },
    orderBy: {
      endAt: "desc",
    },
  });

  const now = new Date();

  /**
   * 3c️⃣ Tentukan startAt
   * PRIORITAS:
   * 1. paid
   * 2. pending
   * 3. now
   */
  let startAt: Date;

  if (lastPaidSubscription && isAfter(lastPaidSubscription.endAt, now)) {
    // ✅ kalau sudah ada yang PAID, ini yang jadi patokan
    startAt = lastPaidSubscription.endAt;
  } else if (
    !lastPaidSubscription &&
    lastPendingSubscription &&
    isAfter(lastPendingSubscription.endAt, now)
  ) {
    // 🕓 belum ada yang paid → pending boleh ditumpuk
    startAt = lastPendingSubscription.endAt;
  } else {
    startAt = now;
  }

  const endAt = addDays(startAt, plan.durationDay);

  /* ===== 4. REFERRAL LOGIC ===== */
  let finalPrice = plan.price.toNumber();
  let referralCodeId: string | null = null;
  let commissionAmount = 0;
  let discountAmount = 0;
  let tierAtTransaction: string | null = null;
  let pointsAwarded = 0;
  let activeSeasonId: string | null = null;

  // Tentukan productType berdasarkan durationDay plan
  const durationToProductType: Record<number, string> = {
    30: "ELEARNING_1M",
    90: "ELEARNING_3M",
    180: "ELEARNING_6M",
  };
  const elearningProductType =
    durationToProductType[plan.durationDay] ?? "ELEARNING_1M";

  if (referralUsageId) {
    const referralUsage = await prisma.referralUsage.findUnique({
      where: { id: referralUsageId },
      select: {
        id: true,
        referralCodeId: true,
        eLearningSubscription: { select: { id: true } },
        referralCode: {
          select: {
            id: true,
            ownerId: true,
            isActive: true,
          },
        },
      },
    });

    if (!referralUsage) {
      throw { status: 404, message: "Referral usage tidak ditemukan." };
    }

    if (referralUsage.eLearningSubscription) {
      throw { status: 400, message: "Referral usage sudah digunakan." };
    }

    if (!referralUsage.referralCode.isActive) {
      throw { status: 400, message: "Referral code sudah tidak aktif." };
    }

    // Ambil tier affiliator saat ini
    const affiliatorProfile = await prisma.affiliatorProfile.findUnique({
      where: { userId: referralUsage.referralCode.ownerId },
      select: { currentTier: true },
    });

    const currentTier = affiliatorProfile?.currentTier ?? "BRONZE";
    tierAtTransaction = currentTier;

    // Ambil config komisi & diskon untuk E-Learning berdasarkan productType + tier
    const productConfig = await prisma.affiliatorProductConfig.findUnique({
      where: {
        productType_tier: {
          productType: elearningProductType,
          tier: currentTier,
        },
      },
    });

    if (productConfig?.isActive) {
      // E-Learning pakai flat amount (harga fixed)
      discountAmount = productConfig.discountAmount?.toNumber() ?? 0;
      commissionAmount = productConfig.commissionAmount?.toNumber() ?? 0;
      pointsAwarded = productConfig.pointsAwarded;

      finalPrice = Math.max(0, finalPrice - discountAmount);
    }

    referralCodeId = referralUsage.referralCode.id;

    // Ambil season aktif
    const activeSeason = await prisma.affiliatorSeason.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    activeSeasonId = activeSeason?.id ?? null;
  }

  /* ===== 5. TRANSACTION ===== */
  const result = await prisma.$transaction(async (tx) => {
    const subscriptionId = await generateELearningSubscriptionId();
    const paymentId = await generateELearningPaymentId();

    const subscription = await tx.eLearningSubscription.create({
      data: {
        id: subscriptionId,
        userId,
        planId,
        referralUsageId,
        startAt,
        endAt,
        status: "pending",
      },
    });

    const payment = await tx.payment.create({
      data: {
        id: paymentId,
        eLearningSubscriptionId: subscription.id,
        amount: finalPrice,
        status: "pending",
      },
    });

    if (referralUsageId && referralCodeId) {
      await tx.referralCommisions.create({
        data: {
          referralCodeId,
          transactionId: payment.id,
          amount: commissionAmount,
          tierAtTransaction,
          productType: elearningProductType,
          pointsAwarded,
          seasonId: activeSeasonId,
          created_at: new Date(),
        },
      });

      // Update totalPoints + tier affiliator
      if (pointsAwarded > 0) {
        const owner = await tx.affiliatorProfile.findFirst({
          where: {
            user: {
              referralCodes: { some: { id: referralCodeId } },
            },
          },
          select: { id: true, totalPoints: true, currentTier: true },
        });

        if (owner) {
          const newTotalPoints = owner.totalPoints + pointsAwarded;

          let newTier = owner.currentTier;
          if (newTotalPoints >= 120) newTier = "GOLD";
          else if (newTotalPoints >= 40) newTier = "SILVER";
          else newTier = "BRONZE";

          await tx.affiliatorProfile.update({
            where: { id: owner.id },
            data: {
              totalPoints: newTotalPoints,
              currentTier: newTier,
              updatedAt: new Date(),
            },
          });

          if (activeSeasonId) {
            await tx.affiliatorSeasonPoint.upsert({
              where: {
                affiliatorProfileId_seasonId: {
                  affiliatorProfileId: owner.id,
                  seasonId: activeSeasonId,
                },
              },
              update: {
                points: { increment: pointsAwarded },
                updatedAt: new Date(),
              },
              create: {
                affiliatorProfileId: owner.id,
                seasonId: activeSeasonId,
                points: pointsAwarded,
                tierAtSeasonStart: owner.currentTier,
              },
            });
          }
        }
      }
    }

    return {
      subscription,
      payment,
      originalPrice: plan.price,
      finalPrice,
    };
  });

  return result;
};

export const getMyActiveSubscription = async (userId: string) => {
  const now = new Date();

  /**
   * Ambil subscription terbaru yang:
   * - status aktif secara bisnis (active / confirmed / completed)
   * - endAt masih > sekarang
   */
  const activeSubscription = await prisma.eLearningSubscription.findFirst({
    where: {
      userId,
      status: {
        in: ["active", "confirmed", "completed"],
      },
      startAt: {
        lte: now, // 🔥 HARUS SUDAH DIMULAI
      },
      endAt: {
        gt: now, // 🔥 BELUM BERAKHIR
      },
    },
    orderBy: {
      endAt: "asc", // opsional tapi lebih logis
    },
    include: {
      plan: {
        select: {
          id: true,
          name: true,
          durationDay: true,
        },
      },
    },
  });

  if (!activeSubscription) {
    return {
      isActive: false,
      message: "Tidak ada subscription aktif.",
    };
  }

  const remainingDays = Math.max(
    differenceInCalendarDays(activeSubscription.endAt, now),
    0,
  );

  return {
    isActive: true,
    subscriptionId: activeSubscription.id,
    plan: activeSubscription.plan,
    startAt: activeSubscription.startAt,
    endAt: activeSubscription.endAt,
    remainingDays,
  };
};

export const getMySubscriptionHistory = async (input: {
  userId: string;
  page: number;
  limit: number;
  status?: "pending" | "confirmed" | "expired" | "cancelled";
}) => {
  const { userId, page, limit, status } = input;

  const skip = (page - 1) * limit;

  /* ===== WHERE CONDITION ===== */
  const whereCondition: any = {
    userId,
  };

  if (status) {
    whereCondition.status = status;
  }

  /* ===== QUERY DATA ===== */
  const [total, subscriptions] = await prisma.$transaction([
    prisma.eLearningSubscription.count({
      where: whereCondition,
    }),
    prisma.eLearningSubscription.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            durationDay: true,
            price: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            transactionId: true,
            paymentDate: true,
          },
        },
        referralUsage: {
          include: {
            referralCode: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    }),
  ]);

  /* ===== LOGIC TAMBAHAN: AUTO-EXPIRE ===== */
  /**
   * Reason:
   * - Subscription lama yang endAt < now tapi status masih confirmed
   *   tetap ditampilkan, tapi secara UI kita tandai expired
   * - Tidak mutate DB di endpoint read
   */
  const now = new Date();

  const mappedSubscriptions = subscriptions.map((sub) => {
    const isExpired =
      sub.endAt < now && ["confirmed", "active"].includes(sub.status);

    return {
      ...sub,
      computedStatus: isExpired ? "expired" : sub.status,
    };
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    subscriptions: mappedSubscriptions,
  };
};

export const cancelSubscription = async (input: {
  userId: string;
  subscriptionId: string;
}) => {
  const { userId, subscriptionId } = input;

  /* ===== 1. AMBIL SUBSCRIPTION ===== */
  const subscription = await prisma.eLearningSubscription.findUnique({
    where: { id: subscriptionId },
    include: {
      payment: true,
      referralUsage: true,
    },
  });

  if (!subscription) {
    throw { status: 404, message: "Subscription tidak ditemukan." };
  }

  /* ===== 2. CEK KEPEMILIKAN ===== */
  if (subscription.userId !== userId) {
    throw { status: 403, message: "Tidak memiliki akses ke subscription ini." };
  }

  /* ===== 3. VALIDASI STATUS ===== */
  /**
   * Reason:
   * - confirmed / active artinya sudah dibayar
   * - expired / cancelled tidak perlu diproses lagi
   */
  if (["confirmed", "active"].includes(subscription.status)) {
    throw {
      status: 400,
      message: "Subscription sudah aktif dan tidak dapat dibatalkan.",
    };
  }

  if (subscription.status === "cancelled") {
    throw {
      status: 400,
      message: "Subscription sudah dibatalkan sebelumnya.",
    };
  }

  /* ===== 4. VALIDASI PAYMENT ===== */
  if (subscription.payment) {
    if (subscription.payment.status === "confirmed") {
      throw {
        status: 400,
        message: "Pembayaran sudah dikonfirmasi, tidak dapat dibatalkan.",
      };
    }
  }

  /* ===== 5. TRANSACTION ===== */
  const result = await prisma.$transaction(async (tx) => {
    /* update subscription */
    const updatedSubscription = await tx.eLearningSubscription.update({
      where: { id: subscription.id },
      data: {
        status: "cancelled",
        updatedAt: new Date(),
      },
    });

    /* update payment jika ada */
    if (subscription.payment) {
      await tx.payment.update({
        where: { id: subscription.payment.id },
        data: {
          status: "failed",
          updatedAt: new Date(),
        },
      });
    }

    /**
     * Referral logic:
     * - ReferralUsage tetap disimpan (audit trail)
     * - Tidak dihapus supaya tidak bisa dipakai ulang
     */
    return {
      subscription: updatedSubscription,
    };
  });

  return result;
};

export const getAllSubscriptions = async (query: {
  page: number;
  limit: number;
  status?: string;
  planId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { page, limit, status, planId, userId, startDate, endDate } = query;

  const skip = (page - 1) * limit;

  /* ===== BUILD WHERE CLAUSE ===== */
  const where: Prisma.ELearningSubscriptionWhereInput = {};

  if (status) {
    if (status === "expired") {
      where.endAt = { lt: new Date() };
      where.status = "active";
    } else {
      where.status = status;
    }
  }

  if (planId) {
    where.planId = planId;
  }

  if (userId) {
    where.userId = userId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  /* ===== QUERY DB ===== */
  const [data, total] = await prisma.$transaction([
    prisma.eLearningSubscription.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        plan: true,
        payment: true,
        referralUsage: {
          include: {
            referralCode: {
              select: {
                id: true,
                code: true,
              },
            },
          },
        },
      },
    }),

    prisma.eLearningSubscription.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getSubscriptionDetail = async (subscriptionId: string) => {
  const subscription = await prisma.eLearningSubscription.findUnique({
    where: { id: subscriptionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          isActive: true,
        },
      },
      plan: true,
      payment: true,
      referralUsage: {
        include: {
          referralCode: {
            include: {
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
      },
    },
  });

  if (!subscription) {
    throw { status: 404, message: "Subscription tidak ditemukan." };
  }

  const now = new Date();

  /* ===== STATUS & TIME CALCULATION ===== */
  const remainingDays = Math.max(
    differenceInCalendarDays(subscription.endAt, now),
    0,
  );

  const isExpired = subscription.endAt < now;

  /* ===== PAYMENT CHECK (TROUBLESHOOTING) ===== */
  const paymentStatus = subscription.payment?.status ?? "unpaid";

  const isPaymentMismatch =
    subscription.status === "active" && paymentStatus !== "paid";

  /* ===== REFERRAL SUMMARY ===== */
  let referralSummary = null;

  if (subscription.referralUsage) {
    // Ambil snapshot komisi dari ReferralCommisions
    // (disimpan saat transaksi terjadi, tidak perlu baca dari ReferralCode lagi)
    const commissionRecord = await prisma.referralCommisions.findFirst({
      where: {
        referralCodeId: subscription.referralUsage.referralCodeId,
        transactionId: subscription.payment?.id ?? "",
      },
      select: {
        amount: true,
        tierAtTransaction: true,
        productType: true,
        pointsAwarded: true,
      },
    });

    referralSummary = {
      usageId: subscription.referralUsage.id,
      usedAt: subscription.referralUsage.usedAt,
      referralCode: {
        code: subscription.referralUsage.referralCode.code,
        owner: subscription.referralUsage.referralCode.owner,
      },
      // Snapshot dari saat transaksi — lebih akurat untuk audit
      commissionSnapshot: commissionRecord
        ? {
            amount: commissionRecord.amount,
            tierAtTransaction: commissionRecord.tierAtTransaction,
            productType: commissionRecord.productType,
            pointsAwarded: commissionRecord.pointsAwarded,
          }
        : null,
    };
  }

  return {
    id: subscription.id,
    status: subscription.status,
    startAt: subscription.startAt,
    endAt: subscription.endAt,
    remainingDays,
    isExpired,

    user: subscription.user,
    plan: subscription.plan,

    payment: subscription.payment
      ? {
          id: subscription.payment.id,
          amount: subscription.payment.amount,
          status: subscription.payment.status,
          paymentMethod: subscription.payment.paymentMethod,
          transactionId: subscription.payment.transactionId,
          paymentDate: subscription.payment.paymentDate,
        }
      : null,

    referral: referralSummary,

    auditFlags: {
      isPaymentMismatch,
      isUserInactive: subscription.user.isActive === false,
    },

    metadata: {
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    },
  };
};

type UpdateSubscriptionStatusInput = {
  subscriptionId: string;
  newStatus: "pending" | "confirmed" | "cancelled" | "expired";
  reason?: string;
};

export const updateSubscriptionStatus = async (
  input: UpdateSubscriptionStatusInput,
) => {
  const { subscriptionId, newStatus, reason } = input;

  /* ===== 1. AMBIL SUBSCRIPTION ===== */
  const subscription = await prisma.eLearningSubscription.findUnique({
    where: { id: subscriptionId },
    include: {
      payment: true,
    },
  });

  if (!subscription) {
    throw { status: 404, message: "Subscription tidak ditemukan." };
  }

  const currentStatus = subscription.status;

  /* ===== 2. IDEMPOTENT CHECK ===== */
  // Penting untuk webhook / retry system
  if (currentStatus === newStatus) {
    return {
      id: subscription.id,
      previousStatus: currentStatus,
      currentStatus,
      reason,
      updatedAt: subscription.updatedAt,
    };
  }

  const now = new Date();

  /* ===== 3. TRANSACTION ===== */
  return await prisma.$transaction(async (tx) => {
    /* --- Update subscription --- */
    const updatedSubscription = await tx.eLearningSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: newStatus,
        updatedAt: now,
      },
    });

    /* ===== 4. PAYMENT SYNC (CONTEXTUAL) ===== */
    if (subscription.payment) {
      /**
       * confirmed
       * - biasanya dari webhook payment success
       */
      if (newStatus === "confirmed") {
        await tx.payment.update({
          where: { id: subscription.payment.id },
          data: {
            status: "confirmed",
            paymentDate: subscription.payment.paymentDate ?? now,
            updatedAt: now,
          },
        });
      }

      /**
       * cancelled
       * - admin cancel
       * - payment failed
       */
      if (newStatus === "cancelled") {
        await tx.payment.update({
          where: { id: subscription.payment.id },
          data: {
            status: "failed",
            updatedAt: now,
          },
        });
      }

      /**
       * expired
       * - cron job
       * - biasanya tidak mengubah payment
       */
    }

    return {
      id: updatedSubscription.id,
      previousStatus: currentStatus,
      currentStatus: newStatus,
      reason,
      updatedAt: updatedSubscription.updatedAt,
    };
  });
};

export const exportSubscriptionsToFile = async (formatType: string) => {
  const subscriptions = await prisma.eLearningSubscription.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
      plan: {
        select: {
          name: true,
          durationDay: true,
          price: true,
        },
      },
      payment: {
        select: {
          status: true,
          paymentMethod: true,
          paymentDate: true,
        },
      },
      referralUsage: {
        include: {
          referralCode: {
            select: {
              code: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const rows = subscriptions.map((s) => ({
    SubscriptionID: s.id,
    UserName: s.user.fullName,
    UserEmail: s.user.email,
    PlanName: s.plan.name,
    PlanDurationDay: s.plan.durationDay,
    PlanPrice: Number(s.plan.price),
    StartAt: formatDate(s.startAt, "yyyy-MM-dd"),
    EndAt: formatDate(s.endAt, "yyyy-MM-dd"),
    SubscriptionStatus: s.status,
    PaymentStatus: s.payment?.status || "-",
    PaymentMethod: s.payment?.paymentMethod || "-",
    PaymentDate: s.payment?.paymentDate
      ? formatDate(s.payment.paymentDate, "yyyy-MM-dd HH:mm:ss")
      : "",
    ReferralCode: s.referralUsage?.referralCode.code || "",
    CreatedAt: formatDate(s.createdAt, "yyyy-MM-dd HH:mm:ss"),
  }));

  const dateStr = formatDate(new Date(), "yyyyMMdd-HHmmss");
  const baseFileName = `elearning-subscriptions-${dateStr}`;

  /* ===== EXCEL ===== */
  if (formatType === "excel") {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Subscriptions");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 20,
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

export const deleteSubscriptionByAdmin = async (subscriptionId: string) => {
  /* ===== 1. CEK SUBSCRIPTION ===== */
  const subscription = await prisma.eLearningSubscription.findUnique({
    where: { id: subscriptionId },
    include: {
      payment: true,
      referralUsage: true,
    },
  });

  if (!subscription) {
    throw {
      status: 404,
      message: "Subscription tidak ditemukan.",
    };
  }

  /* ===== 2. TRANSACTION DELETE ===== */
  await prisma.$transaction(async (tx) => {
    /**
     * Catatan:
     * - Payment memiliki FK eLearningSubscriptionId dengan onDelete: Cascade
     * - Namun kita delete eksplisit agar lebih jelas & aman
     */

    if (subscription.payment) {
      await tx.payment.delete({
        where: { id: subscription.payment.id },
      });
    }

    /**
     * ReferralUsage:
     * - Tidak dihapus otomatis
     * - Tapi relasi eLearningSubscription akan null
     * - Aman untuk audit referral
     */

    await tx.eLearningSubscription.delete({
      where: { id: subscriptionId },
    });
  });

  return {
    id: subscriptionId,
    deletedAt: new Date(),
  };
};

export const getSubscriptionById = async (input: {
  userId: string;
  subscriptionId: string;
}) => {
  const { userId, subscriptionId } = input;

  /* ===== 1. AMBIL SUBSCRIPTION + RELASI YANG DIBUTUHKAN CHECKOUT ===== */
  const subscription = await prisma.eLearningSubscription.findUnique({
    where: { id: subscriptionId },
    include: {
      plan: true,
      payment: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          city: true,
          province: true,
        },
      },
    },
  });

  if (!subscription) {
    throw { status: 404, message: "Subscription tidak ditemukan." };
  }

  /* ===== 2. CEK KEPEMILIKAN ===== */
  if (subscription.userId !== userId) {
    throw {
      status: 403,
      message: "Tidak memiliki akses ke subscription ini.",
    };
  }

  return subscription;
};

export const getPublicSubscriberCount = async () => {
  const distinctSubscribers = await prisma.eLearningSubscription.findMany({
    where: {
      status: { in: ["confirmed", "active", "completed"] },
    },
    distinct: ["userId"],
    select: { userId: true },
  });

  return {
    totalSubscribers: distinctSubscribers.length,
  };
};
