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
import axios from "axios";
import crypto from "crypto";
import moment from "moment-timezone";

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
}: {
  referenceId: string;
  paymentMethod: string;
  email: string;
  phoneNumber: string;
}) => {
  console.log("MC:", MERCHANT_CODE);
  console.log("API:", API_KEY);

  // 1. Cari payment existing
  const payment = await prisma.payment.findUnique({
    where: { id: referenceId },
  });

  if (!payment) {
    throw new Error("Payment not found.");
  }

  const amount = payment.amount.toNumber();
  const invoiceNumber = `INV-${Date.now()}`;
  const type = payment.bookingId ? "booking" : "practice";
  const timestamp = moment().tz("Asia/Jakarta").valueOf();

  const signatureRaw = `${MERCHANT_CODE}${invoiceNumber}${amount}${API_KEY}`;
  const signature = crypto.createHash("md5").update(signatureRaw).digest("hex");

  const payload: any = {
    merchantCode: MERCHANT_CODE,
    paymentAmount: amount,
    merchantOrderId: invoiceNumber,
    productDetails: `Pembayaran ${type}`,
    email,
    customerVaName: "Nama Customer",
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
    merchantCode: MERCHANT_CODE,
    timestamp,
    signatureRaw,
    signature,
    payload,
  });

  try {
    const response = await axios.post(DUITKU_URL, payload, { headers });

    await prisma.payment.update({
      where: { id: referenceId },
      data: {
        ...(paymentMethod && { paymentMethod }),
        transactionId: response.data.reference,
        status: "pending",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error response:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to create payment."
    );
  }
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
  const prisma = new PrismaClient();

  const ourSignatureRaw = `${merchantCode}${amount}${merchantOrderId}${API_KEY}`;
  const ourSignature = crypto
    .createHash("md5")
    .update(ourSignatureRaw)
    .digest("hex");

  if (signature !== ourSignature) {
    throw new Error("Invalid signature");
  }

  const isSuccess = resultCode === "00";
  const status = isSuccess ? "confirmed" : "failed";
  const now = new Date();

  await prisma.payment.updateMany({
    where: { transactionId: reference },
    data: {
      status,
      paymentDate: now,
      updatedAt: now,
    },
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

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
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
    }),
    prisma.payment.count({ where }),
  ]);

  const formatted = payments.map((payment) => {
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
      user: {
        id: user?.id,
        fullName: user?.fullName,
        email: user?.email,
      },
      type: isBooking ? "booking" : "practice",
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
  status?: string
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
      {
        booking: {
          menteeId: userId,
        },
      },
      {
        practicePurchase: {
          userId: userId,
        },
      },
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
            mentoringService: true, // ambil semua kolom, atau bisa select { title: true } nanti jika perlu
          },
        },
        practicePurchase: {
          include: {
            practice: true,
          },
        },
      },
    }) as Promise<
      {
        id: string;
        amount: any;
        status: string | null;
        paymentMethod: string | null;
        paymentDate: Date | null;
        transactionId: string | null;
        createdAt: Date | null;
        booking?: {
          mentoringService?: {
            title?: string;
          } | null;
        } | null;
        practicePurchase?: {
          practice?: {
            title?: string;
          } | null;
        } | null;
      }[]
    >,
    prisma.payment.count({ where }),
  ]);

  const formatted = payments.map((p) => {
    const isBooking = !!p.booking;

    return {
      id: p.id,
      type: isBooking ? "booking" : "practice",
      title: isBooking
        ? p.booking?.mentoringService?.title
        : p.practicePurchase?.practice?.title,
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
  status: "pending" | "confirmed" | "failed";
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
      ? payment.booking?.mentoringService?.serviceName ?? "-"
      : payment.practicePurchase?.practice?.title ?? "-",
    amount: payment.amount,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    paymentDate: payment.paymentDate,
    transactionId: payment.transactionId,
    createdAt: payment.createdAt,
  };
};
