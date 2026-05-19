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
import axios from "axios";
import crypto from "crypto";
import moment from "moment-timezone";
import { sendAyclPaymentSuccessEmail } from "../utils/sendAyclPaymentSuccess.js";
import { sendBookingPaymentSuccessEmail } from "../utils/sendBookingPaymentSuccessEmail.js";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from "dotenv";
dotenv.config();

const MERCHANT_CODE = process.env.DUITKU_MERCHANT_CODE!;
const API_KEY = process.env.DUITKU_API_KEY!;
const DUITKU_URL = "https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry";
const DUITKU_URL_PRODUCTION =
  "https://passport.duitku.com/webapi/api/merchant/v2/inquiry";

export const createDuitkuPayment = async ({
  referenceId,
  paymentMethod,
  email,
  phoneNumber,
  customerVaName,
  material,
  expectedOutput,
  supportDocument,
}: {
  referenceId: string;
  paymentMethod?: string;
  email: string;
  phoneNumber: string;
  customerVaName: string;
  material?: string;
  expectedOutput?: string;
  supportDocument?: string;
}) => {
  console.log("MC:", MERCHANT_CODE);
  console.log("API:", API_KEY);

  /**
   * 1️⃣ Ambil payment
   */
  const payment = await prisma.payment.findUnique({
    where: { id: referenceId },
  });

  /**
   * 2️⃣ VALIDASI STATE PAYMENT (WAJIB)
   */
  if (!payment) {
    throw { status: 404, message: "Payment not found." };
  }

  if (payment.status === "confirmed") {
    throw { status: 400, message: "Payment already completed." };
  }

  if (payment.merchantOrderId && payment.status === "pending") {
    const paymentUrl =
      process.env.NODE_ENV === "production"
        ? `https://passport.duitku.com/topup/v2/inquiry/${payment.merchantOrderId}`
        : `https://sandbox.duitku.com/topup/v2/inquiry/${payment.merchantOrderId}`;

    return {
      paymentUrl,
      reference: payment.transactionId,
    };
  }

  /**
   * 3️⃣ Tentukan tipe payment
   */
  let type = "payment";
  if (payment.bookingId) type = "booking";
  else if (payment.practicePurchaseId) type = "practice";
  else if (payment.eLearningSubscriptionId) type = "elearning";
  else if (payment.ayclBookingId) type = "aycl";

  /**
   * 4️⃣ Generate invoice (merchantOrderId)
   */
  const amount = payment.amount.toNumber();
  const invoiceNumber = `INV-${referenceId}`;

  /**
   * 5️⃣ Generate signature Duitku
   */
  const signatureRaw = `${MERCHANT_CODE}${invoiceNumber}${amount}${API_KEY}`;
  const signature = crypto.createHash("md5").update(signatureRaw).digest("hex");

  /**
   * 6️⃣ Payload ke Duitku
   */
  const payload: any = {
    merchantCode: MERCHANT_CODE,
    paymentAmount: amount,
    merchantOrderId: invoiceNumber,
    productDetails: `Pembayaran ${type}`,
    email,
    customerVaName,
    phoneNumber,
    ...(paymentMethod && { paymentMethod }),
    returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
    callbackUrl: `${process.env.BACKEND_URL}/api/payment/duitku/callback`,
    signature,
    expiryPeriod: 60,
  };

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-duitku-merchantcode": MERCHANT_CODE,
    "x-duitku-signature": signature,
  };

  console.log({
    invoiceNumber,
    signatureRaw,
    signature,
    payload,
  });

  /**
   * 7️⃣ Call API Duitku
   */
  try {
    const duitkuUrl =
      process.env.NODE_ENV === "production"
        ? DUITKU_URL_PRODUCTION
        : DUITKU_URL;

    const response = await axios.post(duitkuUrl, payload, { headers });

    /**
     * 8️⃣ Update payment (WAJIB SIMPAN merchantOrderId)
     */
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: referenceId },
        data: {
          merchantOrderId: invoiceNumber,
          ...(paymentMethod && { paymentMethod }),
          transactionId: response.data.reference,
          status: "pending",
        },
      });
    });

    return response.data;
  } catch (error: any) {
    console.error("Error response:", error.response?.data || error.message);
    throw {
      status: 500,
      message: error.response?.data?.message || "Failed to create payment.",
    };
  }
};

export const getPaymentStatus = async (
  merchantOrderId: string,
  userId: string,
) => {
  const payment = await prisma.payment.findFirst({
    where: {
      merchantOrderId,
    },
    include: {
      booking: true,
      practicePurchase: true,
      eLearningSubscription: true,
      ayclBooking: true, // 🔥 tambah
    },
  });

  if (!payment) {
    throw { status: 404, message: "Payment not found." };
  }

  /**
   * 🔥 SECURITY CHECK
   * Pastikan user hanya bisa cek payment miliknya
   */
  const ownerId =
    payment.booking?.menteeId ||
    payment.practicePurchase?.userId ||
    payment.eLearningSubscription?.userId ||
    payment.ayclBooking?.userId; // 🔥 tambah

  if (ownerId !== userId) {
    throw { status: 403, message: "Forbidden." };
  }

  return {
    id: payment.id,
    merchantOrderId: payment.merchantOrderId,
    status: payment.status,
    amount: payment.amount.toNumber(),
    paymentDate: payment.paymentDate,
    type: payment.booking
      ? "booking"
      : payment.practicePurchase
        ? "practice"
        : payment.eLearningSubscription
          ? "elearning"
          : payment.ayclBooking // 🔥 tambah
            ? "aycl"
            : "unknown",
  };
};

export const processDuitkuCallback = async ({
  merchantCode,
  amount,
  merchantOrderId,
  resultCode,
  reference,
  signature,
}: {
  merchantCode: string;
  amount: string;
  merchantOrderId: string;
  resultCode: string;
  reference: string;
  signature: string;
}) => {
  const API_KEY = process.env.DUITKU_API_KEY!;

  /* 1️⃣ VALIDATE SIGNATURE */
  const raw = `${merchantCode}${amount}${merchantOrderId}${API_KEY}`;
  const expectedSignature = crypto.createHash("md5").update(raw).digest("hex");

  if (signature !== expectedSignature) {
    throw new Error("Invalid signature");
  }

  /* 2️⃣ GET PAYMENT */
  const payment = await prisma.payment.findFirst({
    where: { merchantOrderId },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  /* 🔥 IDEMPOTENCY */
  if (payment.status === "confirmed") {
    return;
  }

  const isSuccess = resultCode === "00";
  const now = new Date();

  /* 3️⃣ TRANSACTION */
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: isSuccess ? "confirmed" : "failed",
        paymentDate: isSuccess ? now : null,
        updatedAt: now,
      },
    });

    if (!isSuccess) return;

    if (payment.bookingId) {
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: "confirmed", updatedAt: now },
      });

      // 🔥 Fetch data lengkap untuk email
      const booking = await tx.booking.findUnique({
        where: { id: payment.bookingId },
        include: {
          mentee: true,
          mentoringService: true,
        },
      });

      if (booking) {
        // 🔥 Kirim email — tidak await agar tidak block callback response
        sendBookingPaymentSuccessEmail({
          email: booking.mentee.email,
          fullName: booking.mentee.fullName,
          serviceName: booking.mentoringService.serviceName,
          merchantOrderId: payment.merchantOrderId ?? "-",
          paymentMethod: payment.paymentMethod,
          amount: payment.amount.toNumber(),
          paymentDate: now,
          whatsappGroup: booking.mentoringService.whatsappGroup ?? null,
        }).catch((err) => {
          console.error("Gagal mengirim email konfirmasi booking:", err);
        });
      }
    }

    if (payment.practicePurchaseId) {
      await tx.practicePurchase.update({
        where: { id: payment.practicePurchaseId },
        data: { status: "confirmed", updatedAt: now },
      });
    }

    if (payment.eLearningSubscriptionId) {
      const subscription = await tx.eLearningSubscription.findUnique({
        where: { id: payment.eLearningSubscriptionId },
        include: {
          plan: true,
        },
      });

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      const lastActiveSubscription = await tx.eLearningSubscription.findFirst({
        where: {
          userId: subscription.userId,
          status: "confirmed",
        },
        orderBy: { endAt: "desc" },
      });

      const startAt = lastActiveSubscription
        ? lastActiveSubscription.endAt!
        : now;

      const endAt = new Date(startAt);
      endAt.setDate(endAt.getDate() + subscription.plan.durationDay);

      await tx.eLearningSubscription.update({
        where: { id: subscription.id },
        data: {
          status: "confirmed",
          startAt,
          endAt,
          updatedAt: now,
        },
      });
    }

    // 🔥 AYCL
    if (payment.ayclBookingId) {
      // 🔥 Update status booking
      await tx.aYCLBooking.update({
        where: { id: payment.ayclBookingId },
        data: { status: "confirmed" },
      });

      // 🔥 Fetch data lengkap untuk email (di luar transaction agar tidak block)
      const ayclBooking = await tx.aYCLBooking.findUnique({
        where: { id: payment.ayclBookingId },
        include: {
          user: true,
          batch: true,
        },
      });

      if (ayclBooking) {
        // 🔥 Kirim email - tidak await agar tidak block callback response
        sendAyclPaymentSuccessEmail({
          email: ayclBooking.user.email,
          fullName: ayclBooking.user.fullName,
          batchTitle: ayclBooking.batch.title,
          merchantOrderId: payment.merchantOrderId ?? "-",
          paymentMethod: payment.paymentMethod,
          amount: payment.amount.toNumber(),
          paymentDate: now,
          whatsappGroupLink: ayclBooking.batch.whatsappGroupLink,
        }).catch((err) => {
          console.error("Gagal mengirim email konfirmasi AYCL:", err);
        });
      }
    }
  });
};

export const getPayments = async ({
  page,
  limit,
  status,
}: {
  page: number;
  limit: number;
  status?: string;
}) => {
  const skip = (page - 1) * limit;

  const where: Prisma.PaymentWhereInput = {};
  if (status) where.status = status;

  const [payments, total, statusCounts] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          include: {
            mentee: { select: { id: true, fullName: true, email: true } },
            mentoringService: {
              include: {
                mentors: {
                  include: { mentorProfile: { include: { user: true } } },
                },
              },
            },
          },
        },
        eLearningSubscription: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            plan: true,
          },
        },
        ayclBooking: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            batch: true,
          },
        },
      },
    }),
    prisma.payment.count({ where }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const formatted = payments.map((payment) => {
    const user =
      payment.booking?.mentee ??
      payment.eLearningSubscription?.user ??
      payment.ayclBooking?.user;

    return {
      id: payment.id,
      merchantOrderId: payment.merchantOrderId,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      user: {
        id: user?.id,
        fullName: user?.fullName,
        email: user?.email,
      },
      bookingId: payment.bookingId,
      eLearningSubscriptionId: payment.eLearningSubscriptionId,
      ayclBookingId: payment.ayclBookingId,
      booking: payment.booking,
      eLearningSubscription: payment.eLearningSubscription,
      ayclBooking: payment.ayclBooking,
    };
  });

  const stats = {
    total,
    success: 0,
    process: 0,
    failed: 0,
    refunded: 0,
  };

  statusCounts.forEach((s) => {
    switch (s.status) {
      case "confirmed":
        stats.success = s._count._all;
        break;
      case "pending":
        stats.process = s._count._all;
        break;
      case "failed":
        stats.failed += s._count._all;
        break;
      case "refunded":
        stats.refunded = s._count._all;
        break;
    }
  });

  return {
    data: formatted,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    stats,
  };
};

export const getPaymentDetailById = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          mentee: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
      practicePurchase: {
        include: {
          user: {
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

  if (!payment) {
    throw new Error("Payment not found");
  }

  const isBooking = !!payment.booking;
  const user = isBooking
    ? payment.booking?.mentee
    : payment.practicePurchase?.user;

  return {
    id: payment.id,
    amount: payment.amount,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    paymentDate: payment.paymentDate,
    transactionId: payment.transactionId,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    type: isBooking ? "booking" : "practice",
    user: {
      id: user?.id,
      fullName: user?.fullName,
      email: user?.email,
    },
    detail: isBooking ? payment.booking : payment.practicePurchase,
  };
};

export const exportPaymentsToFile = async (
  format: "csv" | "excel",
  status?: string,
) => {
  const where = status ? { status } : {};

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      booking: {
        include: {
          mentee: { select: { fullName: true, email: true } },
        },
      },
      practicePurchase: {
        include: {
          user: { select: { fullName: true, email: true } },
        },
      },
    },
  });

  const rows = payments.map((p) => {
    const isBooking = !!p.booking;
    const user = isBooking ? p.booking?.mentee : p.practicePurchase?.user;

    return {
      ID: p.id,
      Type: isBooking ? "booking" : "practice",
      FullName: user?.fullName ?? "-",
      Email: user?.email ?? "-",
      Amount: p.amount.toString(),
      Status: p.status,
      PaymentMethod: p.paymentMethod,
      TransactionID: p.transactionId,
      PaymentDate: p.paymentDate
        ? formatDate(p.paymentDate, "yyyy-MM-dd HH:mm:ss")
        : "-",
      CreatedAt: formatDate(p.createdAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
    };
  });

  if (format === "csv") {
    const parser = new Json2CsvParser();
    return Buffer.from(parser.parse(rows), "utf-8");
  }

  // Excel
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Payments");

  worksheet.columns = Object.keys(rows[0] ?? {}).map((key) => ({
    header: key,
    key,
    width: 20,
  }));

  rows.forEach((row) => worksheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

export const getPaymentsByUser = async ({
  userId,
  page,
  limit,
  status,
}: {
  userId: string;
  page: number;
  limit: number;
  status?: string;
}) => {
  const skip = (page - 1) * limit;

  const where: Prisma.PaymentWhereInput = {
    OR: [
      { booking: { menteeId: userId } },
      { eLearningSubscription: { userId: userId } },
      { ayclBooking: { userId: userId } },
    ],
  };

  if (status) where.status = status;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          include: {
            mentoringService: true,
          },
        },
        eLearningSubscription: {
          include: {
            plan: true,
          },
        },
        ayclBooking: {
          include: {
            batch: true,
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  const formatted = payments.map((p) => {
    let type: string;
    let title: string;

    if (p.booking) {
      type = "booking";
      title = p.booking.mentoringService?.serviceName ?? "-";
    } else if (p.ayclBooking) {
      type = "aycl";
      title = p.ayclBooking.batch?.title ?? "-";
    } else if (p.eLearningSubscription) {
      type = "elearning";
      const durationDays = p.eLearningSubscription.plan?.durationDay ?? 0;
      // konversi hari ke bulan (approx)
      const durationMonths =
        durationDays >= 30 ? Math.round(durationDays / 30) : 0;
      title =
        durationMonths > 0
          ? `Subscription ${durationMonths} Bulan eLearning`
          : `Subscription eLearning`;
    } else {
      type = "other";
      title = "-";
    }

    return {
      id: p.id,
      merchantOrderId: p.merchantOrderId,
      type,
      title,
      amount: p.amount,
      status: p.status,
      paymentMethod: p.paymentMethod,
      paymentDate: p.paymentDate,
      transactionId: p.transactionId,
      createdAt: p.createdAt,
    };
  });

  return {
    data: formatted,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const updatePaymentStatus = async ({
  id,
  status,
}: {
  id: string;
  status: "pending" | "confirmed" | "failed" | "refunded";
}) => {
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) {
    throw new Error("Payment not found");
  }

  const updated = await prisma.payment.update({
    where: { id },
    data: {
      status,
      updatedAt: new Date(),
    },
  });

  return updated;
};

export const getUserPaymentDetail = async ({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) => {
  const payment = await prisma.payment.findFirst({
    where: {
      id,
      OR: [{ booking: { menteeId: userId } }, { practicePurchase: { userId } }],
    },
    include: {
      booking: {
        include: {
          mentoringService: true, // supaya bisa akses serviceName
        },
      },
      practicePurchase: {
        include: {
          practice: true, // supaya bisa akses title
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found or unauthorized access");
  }

  const isBooking = !!payment.booking;

  return {
    id: payment.id,
    type: isBooking ? "booking" : "practice",
    title: isBooking
      ? (payment.booking?.mentoringService?.serviceName ?? "-")
      : (payment.practicePurchase?.practice?.title ?? "-"),
    amount: payment.amount,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    paymentDate: payment.paymentDate,
    transactionId: payment.transactionId,
    createdAt: payment.createdAt,
  };
};
