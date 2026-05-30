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
import { sendMentorBookingNotificationEmail } from "../utils/sendMentorBookingNotificationEmail.js";
import { sendAdminBookingNotificationEmail } from "../utils/sendAdminBookingNotificationEmail.js";

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
    include: {
      bookingInvoice: {
        include: {
          booking: {
            include: {
              mentoringService: true,
            },
          },
        },
      },
    },
  });

  /**
   * 2️⃣ VALIDASI PAYMENT
   */
  if (!payment) {
    throw {
      status: 404,
      message: "Payment not found.",
    };
  }

  if (
    payment.status === "confirmed" ||
    payment.status === "paid" ||
    payment.status === "settlement"
  ) {
    throw {
      status: 400,
      message: "Payment already completed.",
    };
  }

  /**
   * Jika payment pending & sudah punya Duitku invoice
   */
  if (payment.merchantOrderId && payment.status === "pending") {
    const paymentUrl =
      process.env.NODE_ENV === "production"
        ? `https://passport.duitku.com/topup/v2/inquiry/${payment.merchantOrderId}`
        : `https://sandbox.duitku.com/topup/v2/inquiry/${payment.merchantOrderId}`;

    return {
      paymentUrl,
      reference: payment.transactionId,
      merchantOrderId: payment.merchantOrderId,
    };
  }

  /**
   * 3️⃣ Tentukan tipe payment
   */
  let type = "payment";

  if (payment.bookingInvoiceId) {
    type = "booking";
  } else if (payment.practicePurchaseId) {
    type = "practice";
  } else if (payment.eLearningSubscriptionId) {
    type = "elearning";
  } else if (payment.ayclBookingId) {
    type = "aycl";
  }

  /**
   * 4️⃣ Generate merchant order id
   * WAJIB unik per cicilan/payment
   */
  const amount = payment.amount.toNumber();

  const invoiceNumber = `INV-${referenceId}-${Date.now()}`;

  /**
   * 5️⃣ Generate signature
   */
  const signatureRaw = `${MERCHANT_CODE}${invoiceNumber}${amount}${API_KEY}`;

  const signature = crypto.createHash("md5").update(signatureRaw).digest("hex");

  /**
   * 6️⃣ Product detail
   */
  let productDetails = `Pembayaran ${type}`;

  if (payment.bookingInvoice?.booking) {
    const booking = payment.bookingInvoice.booking;

    productDetails = `Pembayaran booking ${booking.mentoringService.serviceName}`;

    if (payment.installmentNumber) {
      productDetails += ` - Cicilan ke-${payment.installmentNumber}`;
    }
  }

  /**
   * 7️⃣ Payload Duitku
   */
  const payload: any = {
    merchantCode: MERCHANT_CODE,
    paymentAmount: amount,
    merchantOrderId: invoiceNumber,
    productDetails,
    email,
    customerVaName,
    phoneNumber,
    signature,
    expiryPeriod: 60,

    ...(paymentMethod && { paymentMethod }),

    returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
    callbackUrl: `${process.env.BACKEND_URL}/api/payment/duitku/callback`,
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
   * 8️⃣ Hit Duitku API
   */
  try {
    const duitkuUrl =
      process.env.NODE_ENV === "production"
        ? DUITKU_URL_PRODUCTION
        : DUITKU_URL;

    const response = await axios.post(duitkuUrl, payload, {
      headers,
    });

    /**
     * 9️⃣ Update payment
     */
    await prisma.payment.update({
      where: { id: referenceId },
      data: {
        merchantOrderId: invoiceNumber,
        ...(paymentMethod && { paymentMethod }),
        transactionId: response.data.reference,
        status: "pending",
        updatedAt: new Date(),
      },
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
      bookingInvoice: {
        include: {
          booking: {
            include: {
              mentoringService: true,
            },
          },
        },
      },

      practicePurchase: true,
      eLearningSubscription: true,
      ayclBooking: true,
    },
  });

  if (!payment) {
    throw {
      status: 404,
      message: "Payment not found.",
    };
  }

  /**
   * SECURITY CHECK
   * User hanya boleh cek payment miliknya
   */
  const ownerId =
    payment.bookingInvoice?.booking?.menteeId ||
    payment.practicePurchase?.userId ||
    payment.eLearningSubscription?.userId ||
    payment.ayclBooking?.userId;

  if (ownerId !== userId) {
    throw {
      status: 403,
      message: "Forbidden.",
    };
  }

  return {
    id: payment.id,
    merchantOrderId: payment.merchantOrderId,

    status: payment.status,

    amount: payment.amount.toNumber(),

    paymentDate: payment.paymentDate,

    installmentNumber: payment.installmentNumber,

    invoiceStatus: payment.bookingInvoice?.status,

    type: payment.bookingInvoice
      ? "booking"
      : payment.practicePurchase
        ? "practice"
        : payment.eLearningSubscription
          ? "elearning"
          : payment.ayclBooking
            ? "aycl"
            : "unknown",

    booking: payment.bookingInvoice?.booking
      ? {
          id: payment.bookingInvoice.booking.id,

          mentoringService:
            payment.bookingInvoice.booking.mentoringService.serviceName,
        }
      : null,
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

  /**
   * 1️⃣ VALIDATE SIGNATURE
   */
  const raw = `${merchantCode}${amount}${merchantOrderId}${API_KEY}`;

  const expectedSignature = crypto.createHash("md5").update(raw).digest("hex");

  if (signature !== expectedSignature) {
    throw new Error("Invalid signature");
  }

  /**
   * 2️⃣ GET PAYMENT
   */
  const payment = await prisma.payment.findFirst({
    where: { merchantOrderId },
    include: {
      bookingInvoice: {
        include: {
          booking: {
            include: {
              mentee: true,

              mentoringService: {
                include: {
                  mentors: {
                    include: {
                      mentorProfile: {
                        include: {
                          user: true,
                        },
                      },
                    },
                  },

                  // Ambil semua field sesi (date, startTime, endTime,
                  // durationMinutes, meetingLink) untuk email mentor & admin
                  mentoringSessions: {
                    include: {
                      mentors: {
                        include: {
                          mentorProfile: {
                            include: {
                              user: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },

              referralUsage: {
                include: {
                  referralCode: true,
                },
              },
            },
          },
          payments: true,
        },
      },

      practicePurchase: true,

      eLearningSubscription: {
        include: {
          plan: true,

          referralUsage: {
            include: {
              referralCode: true,
            },
          },

          user: true,
        },
      },

      ayclBooking: {
        include: {
          user: true,
          batch: true,

          referralUsage: {
            include: {
              referralCode: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  /**
   * 🔥 IDEMPOTENCY
   */
  if (
    payment.status === "confirmed" ||
    payment.status === "paid" ||
    payment.status === "settlement"
  ) {
    return;
  }

  const isSuccess = resultCode === "00";
  const now = new Date();

  // =========================================================================
  // Payload email dikumpulkan di sini, diisi di dalam transaction,
  // lalu dikirim di LUAR transaction supaya tidak menahan DB connection.
  // =========================================================================
  let bookingEmailPayload:
    | Parameters<typeof sendBookingPaymentSuccessEmail>[0]
    | null = null;
  let mentorEmailPayloads: Parameters<
    typeof sendMentorBookingNotificationEmail
  >[0][] = [];
  let adminEmailPayload:
    | Parameters<typeof sendAdminBookingNotificationEmail>[0]
    | null = null;
  let ayclEmailPayload:
    | Parameters<typeof sendAyclPaymentSuccessEmail>[0]
    | null = null;

  /**
   * 3️⃣ TRANSACTION — hanya DB, tidak ada email di sini
   */
  await prisma.$transaction(async (tx) => {
    /**
     * UPDATE PAYMENT
     */
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: isSuccess ? "confirmed" : "failed",
        paymentDate: isSuccess ? now : null,
        transactionId: reference,
        updatedAt: now,
      },
    });

    if (!isSuccess) return;

    // =====================================================
    // BOOKING PAYMENT
    // =====================================================

    if (payment.bookingInvoice) {
      const invoice = payment.bookingInvoice;
      const booking = invoice.booking;

      /**
       * 🔥 HITUNG TOTAL PAID
       */
      const allPayments = await tx.payment.findMany({
        where: {
          bookingInvoiceId: invoice.id,
          status: "confirmed",
        },
      });

      const paidAmount = allPayments.reduce(
        (acc, item) => acc + item.amount.toNumber(),
        0,
      );

      const totalAmount = invoice.totalAmount.toNumber();

      const remainingAmount = Math.max(totalAmount - paidAmount, 0);

      /**
       * 🔥 DETERMINE INVOICE STATUS
       */
      let invoiceStatus = "HAVENT_PAID";

      if (paidAmount <= 0) {
        invoiceStatus = "HAVENT_PAID";
      } else if (remainingAmount > 0) {
        invoiceStatus = "PARTIALLY_PAID";
      } else {
        invoiceStatus = "PAID_DONE";
      }

      /**
       * 🔥 UPDATE INVOICE
       */
      await tx.bookingInvoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount,
          remainingAmount,
          status: invoiceStatus,
          updatedAt: now,
        },
      });

      /**
       * 🔥 BOOKING STATUS
       *
       * langsung confirmed saat:
       * - FULL payment
       * - atau cicilan pertama berhasil
       */
      if (invoice.paymentType === "FULL" || payment.installmentNumber === 1) {
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: "confirmed",
            updatedAt: now,
          },
        });

        /* ===============================
         CREATE REFERRAL COMMISSION
        =============================== */
        if (booking.referralUsage?.referralCode) {
          const referralCode = booking.referralUsage.referralCode;

          const commissionPercentage =
            referralCode.commissionPercentage.toNumber();

          const originalPrice = booking.mentoringService.price.toNumber();

          const commissionAmount = Math.round(
            originalPrice * (commissionPercentage / 100),
          );

          const existingCommission = await tx.referralCommisions.findFirst({
            where: {
              transactionId: payment.id,
            },
          });

          if (!existingCommission) {
            await tx.referralCommisions.create({
              data: {
                referralCodeId: referralCode.id,
                transactionId: payment.id,
                amount: commissionAmount,
                created_at: now,
              },
            });
          }
        }
      }

      // -----------------------------------------------------------------------
      // KUMPULKAN PAYLOAD EMAIL — tidak ada sendMail di sini
      // -----------------------------------------------------------------------

      const shouldSendWhatsappGroup =
        invoice.paymentType === "FULL" || payment.installmentNumber === 1;

      let serviceName = booking.mentoringService.serviceName;
      const programName = booking.mentoringService.serviceName;

      if (invoice.paymentType === "INSTALLMENT" && payment.installmentNumber) {
        serviceName = `Pembayaran Cicilan ke-${payment.installmentNumber} - ${booking.mentoringService.serviceName}`;
      }

      const nextPayment = await tx.payment.findFirst({
        where: {
          bookingInvoiceId: invoice.id,
          status: { not: "confirmed" },
          installmentNumber: { gt: payment.installmentNumber || 0 },
        },
        orderBy: { installmentNumber: "asc" },
      });

      // Payload email ke mentee (semua tipe booking)
      bookingEmailPayload = {
        email: booking.mentee.email,
        fullName: booking.mentee.fullName,
        serviceName,
        programName,
        merchantOrderId: payment.merchantOrderId ?? "-",
        paymentMethod: payment.paymentMethod,
        amount: payment.amount.toNumber(),
        paymentDate: now,
        whatsappGroup: shouldSendWhatsappGroup
          ? (booking.mentoringService.whatsappGroup ?? null)
          : null,
        paymentType: invoice.paymentType as "FULL" | "INSTALLMENT",
        invoiceStatus,
        remainingAmount,
        nextDueDate: nextPayment?.dueDate ?? null,
        installmentNumber: payment.installmentNumber,
        installmentCount: invoice.installmentCount,
      };

      // -----------------------------------------------------------------------
      // Payload email mentor + admin — khusus one-on-one & group
      // -----------------------------------------------------------------------
      const serviceType = booking.mentoringService.serviceType ?? "-";

      if (serviceType === "one-on-one" || serviceType === "group") {
        // Ambil sesi pertama (untuk one-on-one & group hanya ada 1 sesi)
        const mentoringSession =
          booking.mentoringService.mentoringSessions?.[0] ?? null;

        const mentorUsers = (mentoringSession?.mentors ?? [])
          .map((m) => m.mentorProfile?.user)
          .filter(Boolean) as { email: string; fullName: string }[];

        // Data sesi dari MentoringSession
        const sessionDate = mentoringSession?.date ?? null;
        const startTime = mentoringSession?.startTime ?? null;
        const endTime = mentoringSession?.endTime ?? null;
        const durationMinutes = mentoringSession?.durationMinutes ?? null;
        const meetingLink = mentoringSession?.meetingLink ?? null;

        // Payload per mentor — tanpa payment info, dengan session info
        mentorEmailPayloads = mentorUsers.map((mentor) => ({
          mentorEmail: mentor.email,
          mentorName: mentor.fullName,
          menteeName: booking.mentee.fullName,
          menteeEmail: booking.mentee.email,
          serviceName: booking.mentoringService.serviceName,
          serviceType,
          specialRequests: booking.specialRequests,
          material: booking.material,
          expectedOutput: booking.expectedOutput,
          sessionDate,
          startTime,
          endTime,
          durationMinutes,
          meetingLink,
        }));

        // Payload admin — payment info lengkap + session info
        adminEmailPayload = {
          menteeName: booking.mentee.fullName,
          menteeEmail: booking.mentee.email,
          mentorNames: mentorUsers.map((m) => m.fullName),
          serviceName: booking.mentoringService.serviceName,
          serviceType,
          merchantOrderId: payment.merchantOrderId ?? "-",
          paymentMethod: payment.paymentMethod,
          amount: payment.amount.toNumber(),
          paymentDate: now,
          invoiceStatus,
          sessionDate,
          startTime,
          endTime,
          durationMinutes,
          meetingLink,
        };
      }
    }

    // =====================================================
    // PRACTICE PURCHASE
    // =====================================================

    if (payment.practicePurchaseId) {
      await tx.practicePurchase.update({
        where: { id: payment.practicePurchaseId },
        data: {
          status: "confirmed",
          updatedAt: now,
        },
      });
    }

    // =====================================================
    // ELEARNING
    // =====================================================

    if (payment.eLearningSubscription) {
      const subscription = payment.eLearningSubscription;

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

      if (subscription.referralUsage?.referralCode) {
        const referralCode = subscription.referralUsage.referralCode;
        const commissionPercentage =
          referralCode.commissionPercentage.toNumber();
        const originalPrice = subscription.plan.price.toNumber();
        const commissionAmount = Math.round(
          originalPrice * (commissionPercentage / 100),
        );

        const existingCommission = await tx.referralCommisions.findFirst({
          where: { transactionId: payment.id },
        });

        if (!existingCommission) {
          await tx.referralCommisions.create({
            data: {
              referralCodeId: referralCode.id,
              transactionId: payment.id,
              amount: commissionAmount,
              created_at: now,
            },
          });
        }
      }
    }

    // =====================================================
    // AYCL
    // =====================================================

    if (payment.ayclBooking) {
      const ayclBooking = payment.ayclBooking;

      await tx.aYCLBooking.update({
        where: { id: ayclBooking.id },
        data: { status: "confirmed" },
      });

      if (ayclBooking.referralUsage?.referralCode) {
        const referralCode = ayclBooking.referralUsage.referralCode;
        const commissionPercentage =
          referralCode.commissionPercentage.toNumber();
        const originalPrice = ayclBooking.batch.price.toNumber();
        const commissionAmount = Math.round(
          originalPrice * (commissionPercentage / 100),
        );

        const existingCommission = await tx.referralCommisions.findFirst({
          where: { transactionId: payment.id },
        });

        if (!existingCommission) {
          await tx.referralCommisions.create({
            data: {
              referralCodeId: referralCode.id,
              transactionId: payment.id,
              amount: commissionAmount,
              created_at: now,
            },
          });
        }
      }

      ayclEmailPayload = {
        email: ayclBooking.user.email,
        fullName: ayclBooking.user.fullName,
        batchTitle: ayclBooking.batch.title,
        merchantOrderId: payment.merchantOrderId ?? "-",
        paymentMethod: payment.paymentMethod,
        amount: payment.amount.toNumber(),
        paymentDate: now,
        whatsappGroupLink: ayclBooking.batch.whatsappGroupLink,
      };
    }
  });

  // ===========================================================================
  // 4️⃣ KIRIM EMAIL — di luar transaction, paralel, tidak menahan DB connection
  // ===========================================================================

  const emailJobs: Promise<void>[] = [];

  if (bookingEmailPayload) {
    emailJobs.push(sendBookingPaymentSuccessEmail(bookingEmailPayload));
  }

  for (const mentorPayload of mentorEmailPayloads) {
    emailJobs.push(sendMentorBookingNotificationEmail(mentorPayload));
  }

  if (adminEmailPayload) {
    emailJobs.push(sendAdminBookingNotificationEmail(adminEmailPayload));
  }

  if (ayclEmailPayload) {
    emailJobs.push(sendAyclPaymentSuccessEmail(ayclEmailPayload));
  }

  if (emailJobs.length > 0) {
    Promise.allSettled(emailJobs).then((results) => {
      results.forEach((result, i) => {
        if (result.status === "rejected") {
          console.error(`[Email] Job ke-${i + 1} gagal:`, result.reason);
        }
      });
    });
  }
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

  if (status) {
    where.status = status;
  }

  const [payments, total, statusCounts] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },

      include: {
        /**
         * 🔥 BOOKING INSTALLMENT
         */
        bookingInvoice: {
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

                mentoringService: {
                  include: {
                    mentors: {
                      include: {
                        mentorProfile: {
                          include: {
                            user: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },

        /**
         * 🔥 ELEARNING
         */
        eLearningSubscription: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            plan: true,
          },
        },

        /**
         * 🔥 AYCL
         */
        ayclBooking: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            batch: true,
          },
        },

        /**
         * 🔥 PRACTICE
         */
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

    prisma.payment.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
  ]);

  const formatted = payments.map((payment) => {
    /**
     * 🔥 BOOKING DATA
     */
    const booking = payment.bookingInvoice?.booking;

    /**
     * 🔥 OWNER
     */
    const user =
      booking?.mentee ??
      payment.practicePurchase?.user ??
      payment.eLearningSubscription?.user ??
      payment.ayclBooking?.user;

    /**
     * 🔥 TYPE
     */
    const type = booking
      ? "booking"
      : payment.practicePurchase
        ? "practice"
        : payment.eLearningSubscription
          ? "elearning"
          : payment.ayclBooking
            ? "aycl"
            : "unknown";

    /**
     * 🔥 SERVICE NAME
     */
    let serviceName: string | null = null;
    if (booking?.mentoringService?.serviceName) {
      serviceName = booking.mentoringService.serviceName;
      if (payment.installmentNumber) {
        serviceName = `Pembayaran Cicilan ke-${payment.installmentNumber} - ${serviceName}`;
      }
    }

    return {
      id: payment.id,
      merchantOrderId: payment.merchantOrderId,
      transactionId: payment.transactionId,
      amount: payment.amount.toNumber(),
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      paymentDate: payment.paymentDate,
      installmentNumber: payment.installmentNumber,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      type,
      /**
       * 🔥 USER
       */
      user: {
        id: user?.id,
        fullName: user?.fullName,
        email: user?.email,
      },

      /**
       * 🔥 BOOKING INSTALLMENT INFO
       */
      bookingInvoice: payment.bookingInvoice
        ? {
            id: payment.bookingInvoice.id,
            paymentType: payment.bookingInvoice.paymentType,
            installmentCount: payment.bookingInvoice.installmentCount,
            totalAmount: payment.bookingInvoice.totalAmount.toNumber(),
            paidAmount: payment.bookingInvoice.paidAmount.toNumber(),
            remainingAmount: payment.bookingInvoice.remainingAmount.toNumber(),
            status: payment.bookingInvoice.status,
          }
        : null,

      /**
       * 🔥 BOOKING
       */
      booking: booking
        ? {
            id: booking.id,
            status: booking.status,
            serviceName,
            serviceType: booking.mentoringService.serviceType,
            whatsappGroup: booking.mentoringService.whatsappGroup,
            bookingDate: booking.bookingDate,
            mentoringService: booking.mentoringService,
          }
        : null,

      /**
       * 🔥 ELEARNING
       */
      eLearningSubscription: payment.eLearningSubscription,

      /**
       * 🔥 AYCL
       */
      ayclBooking: payment.ayclBooking,

      /**
       * 🔥 PRACTICE
       */
      practicePurchase: payment.practicePurchase,
    };
  });

  /**
   * 🔥 STATS
   */
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
      case "paid":
      case "settlement":
        stats.success += s._count._all;
        break;

      case "pending":
        stats.process += s._count._all;
        break;

      case "failed":
      case "expire":
      case "cancel":
        stats.failed += s._count._all;
        break;

      case "refunded":
        stats.refunded += s._count._all;
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
      // 🔥 BOOKING (NEW FLOW)
      bookingInvoice: {
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
              mentoringService: true,
              referralUsage: {
                include: {
                  referralCode: true,
                },
              },
              participants: {
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
          },
          payments: {
            orderBy: {
              installmentNumber: "asc",
            },
            select: {
              id: true,
              merchantOrderId: true,
              amount: true,
              installmentNumber: true,
              status: true,
              paymentMethod: true,
              paymentDate: true,
              createdAt: true,
            },
          },
        },
      },

      // 🔥 PRACTICE
      practicePurchase: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          referralUsage: {
            include: {
              referralCode: true,
            },
          },
        },
      },

      // 🔥 ELEARNING
      eLearningSubscription: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          plan: true,
          referralUsage: {
            include: {
              referralCode: true,
            },
          },
        },
      },

      // 🔥 AYCL
      ayclBooking: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          batch: true,
          referralUsage: {
            include: {
              referralCode: true,
            },
          },
          participants: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  // 🔥 DETECT TYPE
  const isBooking = !!payment.bookingInvoice;
  const isPractice = !!payment.practicePurchase;
  const isELearning = !!payment.eLearningSubscription;
  const isAYCL = !!payment.ayclBooking;

  const booking = payment.bookingInvoice?.booking;

  // 🔥 USER
  const user =
    booking?.mentee ??
    payment.practicePurchase?.user ??
    payment.eLearningSubscription?.user ??
    payment.ayclBooking?.user;

  // 🔥 TYPE
  let type = "unknown";

  if (isBooking) type = "booking";
  else if (isPractice) type = "practice";
  else if (isELearning) type = "elearning";
  else if (isAYCL) type = "aycl";

  // 🔥 DETAIL
  let detail: any = null;

  if (isBooking) {
    detail = {
      booking: booking,

      invoice: {
        id: payment.bookingInvoice?.id,
        totalAmount: payment.bookingInvoice?.totalAmount,
        paidAmount: payment.bookingInvoice?.paidAmount,
        remainingAmount: payment.bookingInvoice?.remainingAmount,
        paymentType: payment.bookingInvoice?.paymentType,
        installmentCount: payment.bookingInvoice?.installmentCount,
        status: payment.bookingInvoice?.status,
        createdAt: payment.bookingInvoice?.createdAt,
        updatedAt: payment.bookingInvoice?.updatedAt,
      },

      paymentHistory: payment.bookingInvoice?.payments ?? [],
    };
  } else if (isPractice) {
    detail = payment.practicePurchase;
  } else if (isELearning) {
    detail = payment.eLearningSubscription;
  } else if (isAYCL) {
    detail = payment.ayclBooking;
  }

  return {
    id: payment.id,
    merchantOrderId: payment.merchantOrderId,

    amount: payment.amount,
    installmentNumber: payment.installmentNumber,

    status: payment.status,
    paymentMethod: payment.paymentMethod,

    paymentDate: payment.paymentDate,
    transactionId: payment.transactionId,

    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,

    type,

    user: {
      id: user?.id,
      fullName: user?.fullName,
      email: user?.email,
    },

    detail,
  };
};

export const exportPaymentsToFile = async (
  format: "csv" | "excel",
  status?: string,
) => {
  const where: Prisma.PaymentWhereInput = {};

  if (status) {
    where.status = status;
  }

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },

    include: {
      // 🔥 BOOKING (NEW FLOW)
      bookingInvoice: {
        include: {
          booking: {
            include: {
              mentee: {
                select: {
                  fullName: true,
                  email: true,
                },
              },

              mentoringService: {
                select: {
                  serviceName: true,
                  serviceType: true,
                },
              },
            },
          },
        },
      },

      // 🔥 PRACTICE
      practicePurchase: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },

          practice: {
            select: {
              title: true,
            },
          },
        },
      },

      // 🔥 ELEARNING
      eLearningSubscription: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },

          plan: {
            select: {
              name: true,
            },
          },
        },
      },

      // 🔥 AYCL
      ayclBooking: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },

          batch: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  const rows = payments.map((p) => {
    // 🔥 BOOKING
    const booking = p.bookingInvoice?.booking;

    const isBooking = !!booking;
    const isPractice = !!p.practicePurchase;
    const isELearning = !!p.eLearningSubscription;
    const isAYCL = !!p.ayclBooking;

    // 🔥 TYPE
    let type = "unknown";

    if (isBooking) type = "booking";
    else if (isPractice) type = "practice";
    else if (isELearning) type = "elearning";
    else if (isAYCL) type = "aycl";

    // 🔥 USER
    const user =
      booking?.mentee ??
      p.practicePurchase?.user ??
      p.eLearningSubscription?.user ??
      p.ayclBooking?.user;

    // 🔥 PRODUCT / SERVICE NAME
    let itemName = "-";

    if (isBooking) {
      itemName = booking?.mentoringService?.serviceName ?? "-";
    } else if (isPractice) {
      itemName = p.practicePurchase?.practice?.title ?? "-";
    } else if (isELearning) {
      itemName = p.eLearningSubscription?.plan?.name ?? "-";
    } else if (isAYCL) {
      itemName = p.ayclBooking?.batch?.title ?? "-";
    }

    return {
      ID: p.id,

      MerchantOrderId: p.merchantOrderId ?? "-",

      Type: type,

      ItemName: itemName,

      FullName: user?.fullName ?? "-",

      Email: user?.email ?? "-",

      Amount: p.amount.toString(),

      Status: p.status ?? "-",

      PaymentMethod: p.paymentMethod ?? "-",

      TransactionID: p.transactionId ?? "-",

      // 🔥 INSTALLMENT INFO
      InstallmentNumber: p.installmentNumber ?? "-",

      InvoicePaymentType: p.bookingInvoice?.paymentType ?? "-",

      InvoiceStatus: p.bookingInvoice?.status ?? "-",

      TotalInvoiceAmount: p.bookingInvoice?.totalAmount?.toString() ?? "-",

      PaidAmount: p.bookingInvoice?.paidAmount?.toString() ?? "-",

      RemainingAmount: p.bookingInvoice?.remainingAmount?.toString() ?? "-",

      PaymentDate: p.paymentDate
        ? formatDate(p.paymentDate, "yyyy-MM-dd HH:mm:ss")
        : "-",

      CreatedAt: formatDate(p.createdAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
    };
  });

  // 🔥 HANDLE EMPTY DATA
  if (rows.length === 0) {
    rows.push({
      ID: "-",
      MerchantOrderId: "-",
      Type: "-",
      ItemName: "-",
      FullName: "-",
      Email: "-",
      Amount: "-",
      Status: "-",
      PaymentMethod: "-",
      TransactionID: "-",
      InstallmentNumber: "-",
      InvoicePaymentType: "-",
      InvoiceStatus: "-",
      TotalInvoiceAmount: "-",
      PaidAmount: "-",
      RemainingAmount: "-",
      PaymentDate: "-",
      CreatedAt: "-",
    });
  }

  // 🔥 CSV
  if (format === "csv") {
    const parser = new Json2CsvParser();

    return Buffer.from(parser.parse(rows), "utf-8");
  }

  // 🔥 EXCEL
  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("Payments");

  worksheet.columns = Object.keys(rows[0]).map((key) => ({
    header: key,
    key,
    width: 25,
  }));

  rows.forEach((row) => {
    worksheet.addRow(row);
  });

  // 🔥 HEADER STYLE
  worksheet.getRow(1).font = {
    bold: true,
  };

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
        bookingInvoice: {
          booking: {
            menteeId: userId,
          },
        },
      },
      {
        eLearningSubscription: {
          userId: userId,
        },
      },
      {
        ayclBooking: {
          userId: userId,
        },
      },
    ],
  };

  if (status) {
    where.status = status;
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        bookingInvoice: {
          include: {
            booking: {
              include: {
                mentoringService: true,
              },
            },
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

    if (p.bookingInvoice) {
      type = "booking";

      const service = p.bookingInvoice.booking?.mentoringService;

      const serviceName = service?.serviceName ?? "-";

      const serviceType = service?.serviceType;

      const paymentType = p.bookingInvoice.paymentType;

      /**
       * 🔥 Hanya bootcamp + installment
       * tampilkan:
       * Cicilan ke-1 - AI Implementation
       */
      if (
        serviceType === "bootcamp" &&
        paymentType === "INSTALLMENT" &&
        p.installmentNumber
      ) {
        title = `Cicilan ke-${p.installmentNumber} - ${serviceName}`;
      } else {
        /**
         * selain itu tampil normal
         */
        title = serviceName;
      }
    } else if (p.ayclBooking) {
      type = "aycl";

      title = p.ayclBooking.batch?.title ?? "-";
    } else if (p.eLearningSubscription) {
      type = "elearning";

      const durationDays = p.eLearningSubscription.plan?.durationDay ?? 0;

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

      // NEW
      installmentNumber: p.installmentNumber,

      // NEW
      invoice: p.bookingInvoice
        ? {
            id: p.bookingInvoice.id,
            paymentType: p.bookingInvoice.paymentType,
            installmentCount: p.bookingInvoice.installmentCount,
            invoiceStatus: p.bookingInvoice.status,
            totalAmount: p.bookingInvoice.totalAmount,
            paidAmount: p.bookingInvoice.paidAmount,
            remainingAmount: p.bookingInvoice.remainingAmount,
          }
        : null,
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
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      bookingInvoice: true,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  const previousStatus = payment.status;

  const updated = await prisma.$transaction(async (tx) => {
    // update payment dulu
    const updatedPayment = await tx.payment.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
        paymentDate:
          status === "confirmed" && !payment.paymentDate
            ? new Date()
            : payment.paymentDate,
      },
    });

    /**
     * HANDLE BOOKING INSTALLMENT / FULL PAYMENT
     */
    if (payment.bookingInvoice) {
      const invoice = payment.bookingInvoice;

      let paidAmount = Number(invoice.paidAmount);

      /**
       * confirmed pertama kali
       */
      if (previousStatus !== "confirmed" && status === "confirmed") {
        paidAmount += Number(payment.amount);
      }

      /**
       * rollback confirmed -> failed/refunded/pending
       */
      if (
        previousStatus === "confirmed" &&
        ["failed", "refunded", "pending"].includes(status)
      ) {
        paidAmount -= Number(payment.amount);
      }

      // prevent minus
      if (paidAmount < 0) {
        paidAmount = 0;
      }

      const totalAmount = Number(invoice.totalAmount);
      const remainingAmount = totalAmount - paidAmount;

      let invoiceStatus: string = "HAVENT_PAID";

      if (paidAmount <= 0) {
        invoiceStatus = "HAVENT_PAID";
      } else if (paidAmount < totalAmount) {
        invoiceStatus = "PARTIALLY_PAID";
      } else {
        invoiceStatus = "PAID_DONE";
      }

      await tx.bookingInvoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          paidAmount,
          remainingAmount,
          status: invoiceStatus,
          updatedAt: new Date(),
        },
      });
    }

    return updatedPayment;
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

      OR: [
        {
          bookingInvoice: {
            booking: {
              menteeId: userId,
            },
          },
        },

        {
          practicePurchase: {
            userId,
          },
        },

        {
          eLearningSubscription: {
            userId,
          },
        },

        {
          ayclBooking: {
            userId,
          },
        },
      ],
    },

    include: {
      bookingInvoice: {
        include: {
          booking: {
            include: {
              mentoringService: true,
            },
          },

          payments: {
            orderBy: {
              installmentNumber: "asc",
            },
          },
        },
      },

      practicePurchase: {
        include: {
          practice: true,
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
  });

  if (!payment) {
    throw new Error("Payment not found or unauthorized access");
  }

  const booking = payment.bookingInvoice?.booking;

  let type = "other";
  let title = "-";

  if (booking) {
    type = "booking";

    title = booking.mentoringService?.serviceName ?? "-";
  } else if (payment.practicePurchase) {
    type = "practice";

    title = payment.practicePurchase.practice?.title ?? "-";
  } else if (payment.eLearningSubscription) {
    type = "elearning";

    const durationDays = payment.eLearningSubscription.plan?.durationDay ?? 0;

    const durationMonths =
      durationDays >= 30 ? Math.round(durationDays / 30) : 0;

    title =
      durationMonths > 0
        ? `Subscription ${durationMonths} Bulan eLearning`
        : "Subscription eLearning";
  } else if (payment.ayclBooking) {
    type = "aycl";

    title = payment.ayclBooking.batch?.title ?? "-";
  }

  /**
   * NEXT INSTALLMENT
   *
   * hanya ambil installment pending berikutnya
   * dan hanya muncul jika payment sekarang sudah confirmed
   */
  let nextPendingInstallment = null;

  if (payment.bookingInvoice && payment.status === "confirmed") {
    const nextInstallment = payment.bookingInvoice.payments.find(
      (item) =>
        item.status === "pending" &&
        (item.installmentNumber ?? 0) > (payment.installmentNumber ?? 0),
    );

    if (nextInstallment) {
      nextPendingInstallment = {
        id: nextInstallment.id,

        installmentNumber: nextInstallment.installmentNumber,

        amount: Number(nextInstallment.amount),

        dueDate: nextInstallment.dueDate,

        status: nextInstallment.status,
      };
    }
  }

  return {
    id: payment.id,

    merchantOrderId: payment.merchantOrderId,

    type,

    title,

    amount: Number(payment.amount),

    installmentNumber: payment.installmentNumber,

    dueDate: payment.dueDate,

    status: payment.status, // pending | confirmed | failed | refunded

    paymentMethod: payment.paymentMethod,

    paymentDate: payment.paymentDate,

    transactionId: payment.transactionId,

    createdAt: payment.createdAt,

    updatedAt: payment.updatedAt,

    /**
     * BOOKING INFO
     */
    booking: booking
      ? {
          id: booking.id,

          status: booking.status,

          bookingDate: booking.bookingDate,

          mentoringService: {
            id: booking.mentoringService.id,

            serviceName: booking.mentoringService.serviceName,

            serviceType: booking.mentoringService.serviceType,

            whatsappGroup: booking.mentoringService.whatsappGroup,

            thumbnail: booking.mentoringService.thumbnail,
          },
        }
      : null,

    /**
     * INVOICE
     */
    invoice: payment.bookingInvoice
      ? {
          id: payment.bookingInvoice.id,

          paymentType: payment.bookingInvoice.paymentType,

          installmentCount: payment.bookingInvoice.installmentCount,

          totalAmount: Number(payment.bookingInvoice.totalAmount),

          paidAmount: Number(payment.bookingInvoice.paidAmount),

          remainingAmount: Number(payment.bookingInvoice.remainingAmount),

          status: payment.bookingInvoice.status,

          payments: payment.bookingInvoice.payments.map((item) => ({
            id: item.id,

            installmentNumber: item.installmentNumber,

            amount: Number(item.amount),

            dueDate: item.dueDate,

            paymentDate: item.paymentDate,

            status: item.status,
          })),
        }
      : null,

    /**
     * NEXT INSTALLMENT
     */
    nextPendingInstallment,
  };
};
