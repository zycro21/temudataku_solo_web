import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";
import { randomBytes } from "crypto";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";

import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export class AyclBookingService {
  // 🔥 Generate Payment ID (PAY-AYCL)
  private static async generatePaymentId(): Promise<string> {
    const datePart = format(new Date(), "yyyyMMdd");
    const maxAttempts = 10;

    for (let i = 0; i < maxAttempts; i++) {
      const rand = Math.floor(1000000000 + Math.random() * 9000000000);
      const id = `PAY-AYCL-${datePart}-${rand}`;

      const exist = await prisma.payment.findUnique({ where: { id } });
      if (!exist) return id;
    }

    throw {
      status: 500,
      message: "Gagal generate payment id",
    };
  }

  // 🔥 Generate Booking ID
  private static async generateAyclBookingId(): Promise<string> {
    const datePart = format(new Date(), "yyyyMMdd");

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 10; i++) {
      const random = Array.from({ length: 6 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join("");

      const id = `AYCLBook-${datePart}-${random}`;

      const exist = await prisma.aYCLBooking.findUnique({
        where: { id },
      });

      if (!exist) return id;
    }

    throw {
      status: 500,
      message: "Gagal generate booking id",
    };
  }

  // 🔥 MAIN SERVICE
  static async createAyclBooking(
    userId: string,
    {
      batchId,
      referralUsageId,
      currentStatus,
      institution,
      studyProgram,
      semester,
      age,
      reason,
      familiarity,
    }: {
      batchId: string;
      referralUsageId?: string;
      currentStatus?: string;
      institution?: string;
      studyProgram?: string;
      semester?: string;
      age?: number;
      reason?: string;
      familiarity?: string;
    },
  ) {
    // 🔥 VALIDASI BATCH
    const batch = await prisma.aYCLBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch || !batch.isActive) {
      throw {
        status: 404,
        message: "Batch tidak ditemukan atau tidak aktif",
      };
    }

    // 🔥 CEK DUPLIKAT (SUDAH BELI)
    const existing = await prisma.aYCLBooking.findFirst({
      where: {
        userId,
        batchId,
        status: {
          in: ["confirmed", "completed"],
        },
      },
    });

    if (existing) {
      throw {
        status: 400,
        message: "Kamu sudah membeli batch ini",
      };
    }

    let finalPrice = Number(batch.price);
    let referralCodeId: string | null = null;
    let commissionPercentage = 0;

    // 🔥 REFERRAL
    if (referralUsageId) {
      const referral = await prisma.referralUsage.findUnique({
        where: { id: referralUsageId },
        include: {
          ayclBooking: true,
          referralCode: true,
        },
      });

      if (!referral) {
        throw {
          status: 404,
          message: "Referral tidak ditemukan",
        };
      }

      if (referral.ayclBooking) {
        throw {
          status: 400,
          message: "Referral sudah digunakan",
        };
      }

      const discount = referral.referralCode.discountPercentage.toNumber();

      commissionPercentage =
        referral.referralCode.commissionPercentage.toNumber();

      finalPrice = finalPrice * (1 - discount / 100);
      referralCodeId = referral.referralCode.id;
    }

    // 🔥 TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      const bookingId = await this.generateAyclBookingId();

      const booking = await tx.aYCLBooking.create({
        data: {
          id: bookingId,
          userId,
          batchId,
          referralUsageId,
          status: "pending",

          currentStatus,
          institution,
          studyProgram,
          semester,
          age,
          reason,
          familiarity,
        },
      });

      const paymentId = await this.generatePaymentId();

      const payment = await tx.payment.create({
        data: {
          id: paymentId,
          ayclBookingId: booking.id,
          amount: finalPrice,
          status: "pending",
        },
      });

      // 🔥 Referral Commission
      if (referralUsageId && referralCodeId) {
        const commissionAmount = finalPrice * (commissionPercentage / 100);

        await tx.referralCommisions.create({
          data: {
            referralCodeId,
            transactionId: paymentId,
            amount: commissionAmount,
            created_at: new Date(),
          },
        });
      }

      return {
        ...booking,
        payment,
        originalPrice: Number(batch.price),
        finalPrice,
      };
    });

    return {
      success: true,
      message: "Booking AYCL berhasil dibuat",
      data: result,
    };
  }

  static async getAyclBookingById(id: string, userId: string) {
    const booking = await prisma.aYCLBooking.findUnique({
      where: { id },
      include: {
        // 🔥 USER (biar bisa validasi ownership + tampil data)
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },

        // 🔥 BATCH (FULL DETAIL)
        batch: {
          include: {
            schedules: {
              orderBy: { date: "asc" },
            },
            materials: true,
            sections: {
              orderBy: { order: "asc" },
            },
          },
        },

        // 🔥 PAYMENT
        payment: true,

        // 🔥 SELECTED CLASSES
        participants: {
          include: {
            schedule: true,
          },
        },

        // 🔥 REFERRAL
        referralUsage: {
          include: {
            referralCode: true,
          },
        },
      },
    });

    if (!booking) {
      throw {
        status: 404,
        message: "Booking tidak ditemukan",
      };
    }

    // 🔥 SECURITY: pastikan user hanya akses booking dia sendiri
    if (booking.userId !== userId) {
      throw {
        status: 403,
        message: "Kamu tidak punya akses ke booking ini",
      };
    }

    return {
      ...booking,

      // 🔥 NORMALIZE PRICE BIAR FRONTEND ENAK
      batch: {
        ...booking.batch,
        price: Number(booking.batch.price),
      },

      payment: booking.payment
        ? {
            ...booking.payment,
            amount: Number(booking.payment.amount),
          }
        : null,
    };
  }

  static async getAllAyclBookings({
    page,
    limit,
    search,
    status,
    batchId,
    sortBy,
    sortDir,
  }: {
    page: number;
    limit: number;
    search?: string;
    status?: "pending" | "confirmed" | "completed" | "cancelled";
    batchId?: string;
    sortBy: "createdAt" | "status";
    sortDir: "asc" | "desc";
  }) {
    // ── WHERE clause ──────────────────────────────────────────────────────────
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (batchId) {
      where.batchId = batchId;
    }

    if (search) {
      where.OR = [
        {
          user: {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          batch: {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // ── ORDER BY ──────────────────────────────────────────────────────────────
    const orderBy: any =
      sortBy === "status" ? { status: sortDir } : { createdAt: sortDir };

    // ── COUNT (untuk meta pagination) ─────────────────────────────────────────
    const total = await prisma.aYCLBooking.count({ where });

    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // ── FETCH ─────────────────────────────────────────────────────────────────
    const bookings = await prisma.aYCLBooking.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        // USER
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },

        // BATCH (cukup field yang dibutuhkan tabel & detail)
        batch: {
          select: {
            id: true,
            title: true,
            price: true,
            whatsappGroupLink: true,
            startDate: true,
            endDate: true,
            schedules: {
              orderBy: { date: "asc" },
              select: {
                id: true,
                title: true,
                date: true,
                startTime: true,
                endTime: true,
                googleMeetLink: true,
                quota: true,
              },
            },
          },
        },

        // PAYMENT
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            merchantOrderId: true,
            paymentDate: true,
            transactionId: true,
          },
        },

        // AYCL PARTICIPANTS (kelas yang dipilih)
        participants: {
          include: {
            schedule: {
              select: {
                id: true,
                title: true,
                date: true,
                startTime: true,
                endTime: true,
                googleMeetLink: true,
              },
            },
          },
        },

        // REFERRAL USAGE
        referralUsage: {
          include: {
            referralCode: {
              select: {
                id: true,
                code: true,
                discountPercentage: true,
                commissionPercentage: true,
              },
            },
          },
        },
      },
    });

    // ── NORMALIZE ─────────────────────────────────────────────────────────────
    const data = bookings.map((b) => ({
      ...b,
      batch: {
        ...b.batch,
        price: Number(b.batch.price),
      },
      payment: b.payment
        ? {
            ...b.payment,
            amount: Number(b.payment.amount),
          }
        : null,
      referralUsage: b.referralUsage
        ? {
            ...b.referralUsage,
            referralCode: {
              ...b.referralUsage.referralCode,
              discountPercentage: Number(
                b.referralUsage.referralCode.discountPercentage,
              ),
              commissionPercentage: Number(
                b.referralUsage.referralCode.commissionPercentage,
              ),
            },
          }
        : null,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  static async updateAyclBooking(
    bookingId: string,
    userId: string,
    {
      currentStatus,
      institution,
      studyProgram,
      semester,
      age,
      reason,
      familiarity,
      selectedSchedules,
    }: {
      currentStatus?: string;
      institution?: string;
      studyProgram?: string;
      semester?: string;
      age?: number;
      reason?: string;
      familiarity?: string;
      selectedSchedules?: string[];
    },
  ) {
    // 🔥 CEK BOOKING
    const booking = await prisma.aYCLBooking.findUnique({
      where: { id: bookingId },
      include: { batch: true },
    });

    if (!booking) {
      throw {
        status: 404,
        message: "Booking tidak ditemukan",
      };
    }

    // 🔥 OPTIONAL: pastikan user hanya update miliknya sendiri
    if (booking.userId !== userId) {
      throw {
        status: 403,
        message: "Tidak memiliki akses ke booking ini",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      // 🔥 UPDATE DATA BOOKING (PARTIAL)
      const updatedBooking = await tx.aYCLBooking.update({
        where: { id: bookingId },
        data: {
          ...(currentStatus !== undefined && { currentStatus }),
          ...(institution !== undefined && { institution }),
          ...(studyProgram !== undefined && { studyProgram }),
          ...(semester !== undefined && { semester }),
          ...(age !== undefined && { age }),
          ...(reason !== undefined && { reason }),
          ...(familiarity !== undefined && { familiarity }),
        },
      });

      // 🔥 HANDLE SCHEDULE (PARTICIPANTS)
      if (selectedSchedules) {
        // 🔥 VALIDASI schedule harus milik batch ini
        const validSchedules = await tx.aYCLSchedule.findMany({
          where: {
            id: { in: selectedSchedules },
            batchId: booking.batchId,
          },
          select: { id: true },
        });

        if (validSchedules.length !== selectedSchedules.length) {
          throw {
            status: 400,
            message: "Ada schedule yang tidak valid",
          };
        }

        // 🔥 HAPUS PARTICIPANT LAMA
        await tx.aYCLParticipant.deleteMany({
          where: { bookingId },
        });

        // 🔥 INSERT BARU
        await tx.aYCLParticipant.createMany({
          data: selectedSchedules.map((scheduleId) => ({
            bookingId,
            scheduleId,
          })),
        });
      }

      // 🔥 RETURN FULL DATA
      const fullData = await tx.aYCLBooking.findUnique({
        where: { id: bookingId },
        include: {
          batch: {
            include: {
              schedules: true,
              sections: true,
              materials: true,
            },
          },
          payment: true,
          participants: {
            include: {
              schedule: true,
            },
          },
          referralUsage: true,
          user: true,
        },
      });

      return fullData;
    });

    return {
      success: true,
      message: "Booking berhasil diupdate",
      data: result,
    };
  }

  static async deleteAyclBooking(bookingId: string) {
    // 🔥 CEK BOOKING ADA
    const booking = await prisma.aYCLBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        referralUsageId: true,
      },
    });

    if (!booking) {
      throw {
        status: 404,
        message: "Booking tidak ditemukan",
      };
    }

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Hapus AYCLParticipant
      await tx.aYCLParticipant.deleteMany({
        where: { bookingId },
      });

      // 2️⃣ Putuskan referralUsageId di booking (ReferralUsage TIDAK dihapus)
      if (booking.referralUsageId) {
        await tx.aYCLBooking.update({
          where: { id: bookingId },
          data: { referralUsageId: null },
        });
      }

      // 3️⃣ Putuskan relasi payment → booking (payment TIDAK dihapus)
      await tx.payment.updateMany({
        where: { ayclBookingId: bookingId },
        data: { ayclBookingId: null },
      });

      // 4️⃣ Hapus AYCLBooking
      await tx.aYCLBooking.delete({
        where: { id: bookingId },
      });
    });
  }

  static async getAyclBookingStats() {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // 🔥 Jalankan semua count secara paralel agar efisien
    const [totalPendaftar, totalKonfirmasi, totalMingguIni] = await Promise.all(
      [
        // Total semua pendaftar
        prisma.aYCLBooking.count(),

        // Total yang sudah confirmed
        prisma.aYCLBooking.count({
          where: { status: "confirmed" },
        }),

        // Total pendaftar dalam 7 hari terakhir
        prisma.aYCLBooking.count({
          where: {
            createdAt: {
              gte: sevenDaysAgo,
              lte: now,
            },
          },
        }),
      ],
    );

    return {
      totalPendaftar,
      totalKonfirmasi,
      totalMingguIni,
    };
  }

  static async getIncompleteAyclBookings(userId: string) {
    const bookings = await prisma.aYCLBooking.findMany({
      where: {
        userId,
        status: "confirmed",

        // 🔥 FILTER FIELD YANG MASIH KOSONG
        OR: [
          { currentStatus: null },
          { institution: null },
          { studyProgram: null },
          { semester: null },
          { age: null },
          { reason: null },
          { familiarity: null },
        ],
      },
      include: {
        batch: {
          select: {
            title: true,
          },
        },
        payment: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return bookings;
  }
}
