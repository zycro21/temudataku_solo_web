import { PrismaClient, Prisma } from "@prisma/client";
import {
  applyReferralToAyclBookingService,
  applyReferralToBookingService,
  applyReferralToELearningService,
} from "./referral.service.js";
const prisma = new PrismaClient();
import crypto from "crypto";

export const VoucherService = {
  async getAllVouchers(filters: any) {
    const {
      search,
      productScope,
      discountType, // ✅ tambahan
      isActive,
      page = 1,
      limit = 10, // ✅ fix: was 100
      sortBy = "createdAt",
      order = "desc",
    } = filters;

    const skip = (page - 1) * limit;

    const whereCondition: any = {
      ...(productScope && { productScope }),
      ...(discountType && { discountType }), // ✅ tambahan
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [total, vouchers] = await Promise.all([
      prisma.voucher.count({ where: whereCondition }),
      prisma.voucher.findMany({
        where: whereCondition,
        include: {
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
          _count: {
            select: { usages: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      data: vouchers,
    };
  },

  async getVoucherById(id: string) {
    const voucher = await prisma.voucher.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
        _count: {
          select: { usages: true },
        },
        usages: {
          orderBy: { usedAt: "desc" },
          take: 5,
          select: {
            id: true,
            status: true,
            originalAmount: true,
            discountAmount: true,
            finalAmount: true,
            usedAt: true,
            user: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
    });

    if (!voucher) {
      throw { status: 404, message: "Voucher tidak ditemukan" };
    }

    return voucher;
  },

  async createVoucher(data: any, createdById: string) {
    const normalizedCode = data.code.toUpperCase().trim();

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
    const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
    const voucherId = `VCH-${formattedDate}-${randomPart}`;

    const voucher = await prisma.$transaction(async (tx) => {
      // Cek di tabel voucher
      const existing = await tx.voucher.findUnique({
        where: { code: normalizedCode },
      });
      if (existing) {
        throw {
          status: 409,
          message: `Kode voucher "${normalizedCode}" sudah digunakan`,
        };
      }

      // ✅ Cek cross-table: tidak boleh sama dengan kode referral
      const existingReferral = await tx.referralCode.findUnique({
        where: { code: normalizedCode },
      });
      if (existingReferral) {
        throw {
          status: 409,
          message: `Kode "${normalizedCode}" sudah digunakan sebagai kode referral affiliator`,
        };
      }

      return tx.voucher.create({
        data: {
          id: voucherId,
          code: normalizedCode,
          name: data.name,
          description: data.description ?? null,
          discountType: data.discountType,
          discountValue: data.discountValue,
          maxDiscountAmount:
            data.discountType === "PERCENTAGE"
              ? (data.maxDiscountAmount ?? null)
              : null,
          minimumPurchase: data.minimumPurchase ?? null,
          productScope: data.productScope ?? "GLOBAL",
          usageLimit: data.usageLimit ?? null,
          usageLimitPerUser: data.usageLimitPerUser ?? 1,
          startDate: data.startDate ?? null,
          expiryDate: data.expiryDate ?? null,
          isActive: data.isActive ?? true,
          createdById,
        },
        include: {
          createdBy: { select: { id: true, fullName: true, email: true } },
        },
      });
    });

    return voucher;
  },

  async updateVoucher(
    id: string,
    data: any,
    user: { userId: string; roles: string[] },
  ) {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Pastikan voucher ada
      const voucher = await tx.voucher.findUnique({
        where: { id },
        include: {
          _count: { select: { usages: true } },
        },
      });

      if (!voucher) {
        throw { status: 404, message: "Voucher tidak ditemukan" };
      }

      // 2. Normalisasi code jika diubah + cek unique (dalam transaksi)
      // Di dalam blok: if (data.code !== undefined)
      if (data.code !== undefined) {
        const normalizedCode = data.code.toUpperCase().trim();

        if (normalizedCode !== voucher.code) {
          const existing = await tx.voucher.findUnique({
            where: { code: normalizedCode },
          });
          if (existing) {
            throw {
              status: 409,
              message: `Kode voucher "${normalizedCode}" sudah digunakan`,
            };
          }

          // ✅ Cek cross-table
          const existingReferral = await tx.referralCode.findUnique({
            where: { code: normalizedCode },
          });
          if (existingReferral) {
            throw {
              status: 409,
              message: `Kode "${normalizedCode}" sudah digunakan sebagai kode referral affiliator`,
            };
          }
        }

        data.code = normalizedCode;
      }

      // 3. Tentukan discountType efektif (bisa dari payload atau dari existing)
      const effectiveDiscountType = data.discountType ?? voucher.discountType;

      // 4. Validasi discountValue terhadap discountType efektif
      //    (kasus: ubah discountValue tanpa ubah discountType)
      if (
        data.discountValue !== undefined &&
        effectiveDiscountType === "PERCENTAGE"
      ) {
        if (data.discountValue > 100) {
          throw {
            status: 400,
            message: "Nilai diskon persentase tidak boleh lebih dari 100",
          };
        }
      }

      // 5. Validasi maxDiscountAmount terhadap discountType efektif
      //    (kasus: ubah maxDiscountAmount tanpa ubah discountType, atau
      //     ubah discountType ke FLAT tanpa hapus maxDiscountAmount)
      if (
        data.maxDiscountAmount !== undefined &&
        effectiveDiscountType === "FLAT"
      ) {
        throw {
          status: 400,
          message:
            "maxDiscountAmount hanya relevan untuk discountType PERCENTAGE",
        };
      }

      // 6. Kalau discountType diubah dari PERCENTAGE ke FLAT,
      //    null-kan maxDiscountAmount secara otomatis
      const shouldNullifyMaxDiscount =
        data.discountType === "FLAT" &&
        voucher.discountType === "PERCENTAGE" &&
        data.maxDiscountAmount === undefined;

      // 7. Validasi startDate vs expiryDate dengan mempertimbangkan data existing
      //    (kasus: hanya salah satu yang dikirim)
      const effectiveStartDate = data.startDate ?? voucher.startDate;
      const effectiveExpiryDate = data.expiryDate ?? voucher.expiryDate;

      if (
        effectiveStartDate &&
        effectiveExpiryDate &&
        effectiveExpiryDate <= effectiveStartDate
      ) {
        throw {
          status: 400,
          message: "Tanggal kedaluwarsa harus setelah tanggal mulai",
        };
      }

      // 8. Guard: usageLimit tidak boleh dikurangi di bawah jumlah yang sudah terpakai
      if (data.usageLimit !== undefined) {
        const currentUsageCount = voucher.usageCount;
        if (data.usageLimit < currentUsageCount) {
          throw {
            status: 400,
            message: `usageLimit tidak boleh kurang dari jumlah pemakaian saat ini (${currentUsageCount})`,
          };
        }
      }

      // 9. Lakukan update
      return tx.voucher.update({
        where: { id },
        data: {
          ...(data.code !== undefined && { code: data.code }),
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.discountType !== undefined && {
            discountType: data.discountType,
          }),
          ...(data.discountValue !== undefined && {
            discountValue: data.discountValue,
          }),
          ...(data.maxDiscountAmount !== undefined
            ? { maxDiscountAmount: data.maxDiscountAmount }
            : shouldNullifyMaxDiscount
              ? { maxDiscountAmount: null }
              : {}),
          ...(data.minimumPurchase !== undefined && {
            minimumPurchase: data.minimumPurchase,
          }),
          ...(data.productScope !== undefined && {
            productScope: data.productScope,
          }),
          ...(data.usageLimit !== undefined && { usageLimit: data.usageLimit }),
          ...(data.usageLimitPerUser !== undefined && {
            usageLimitPerUser: data.usageLimitPerUser,
          }),
          ...(data.startDate !== undefined && { startDate: data.startDate }),
          ...(data.expiryDate !== undefined && { expiryDate: data.expiryDate }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
        include: {
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
          _count: {
            select: { usages: true },
          },
        },
      });
    });

    return updated;
  },

  async toggleVoucherActive(
    id: string,
    user: { userId: string; roles: string[] },
  ) {
    const voucher = await prisma.voucher.findUnique({ where: { id } });

    if (!voucher) {
      throw { status: 404, message: "Voucher tidak ditemukan" };
    }

    const updated = await prisma.voucher.update({
      where: { id },
      data: {
        isActive: !voucher.isActive,
        updatedAt: new Date(),
      },
    });

    return updated;
  },

  async deleteVoucher(id: string) {
    const voucher = await prisma.voucher.findUnique({
      where: { id },
      include: { _count: { select: { usages: true } } },
    });

    if (!voucher) {
      throw { status: 404, message: "Voucher tidak ditemukan" };
    }

    if (voucher._count.usages > 0) {
      throw {
        status: 400,
        message:
          "Voucher tidak bisa dihapus karena sudah pernah digunakan. Gunakan toggle-active untuk menonaktifkannya.",
      };
    }

    await prisma.voucher.delete({ where: { id } });

    return { deletedId: id };
  },

  async validateVoucher(
    code: string,
    productScope: string,
    amount: number,
    userId: string,
  ) {
    const normalizedCode = code.toUpperCase().trim();
    const now = new Date();

    const voucher = await prisma.voucher.findUnique({
      where: { code: normalizedCode },
    });

    if (!voucher) {
      throw { status: 404, message: "Kode voucher tidak ditemukan" };
    }

    if (!voucher.isActive) {
      throw { status: 400, message: "Voucher tidak aktif" };
    }

    if (voucher.startDate && voucher.startDate > now) {
      throw { status: 400, message: "Voucher belum dapat digunakan" };
    }

    if (voucher.expiryDate && voucher.expiryDate < now) {
      throw { status: 400, message: "Voucher sudah kedaluwarsa" };
    }

    // productScope harus cocok, kecuali voucher-nya GLOBAL (berlaku untuk semua produk)
    if (
      voucher.productScope !== "GLOBAL" &&
      voucher.productScope !== productScope
    ) {
      throw {
        status: 400,
        message: `Voucher ini hanya berlaku untuk produk ${voucher.productScope}`,
      };
    }

    if (voucher.minimumPurchase && amount < Number(voucher.minimumPurchase)) {
      throw {
        status: 400,
        message: `Minimal pembelian untuk voucher ini adalah Rp${Number(voucher.minimumPurchase).toLocaleString("id-ID")}`,
      };
    }

    // Cek kuota total
    if (
      voucher.usageLimit !== null &&
      voucher.usageCount >= voucher.usageLimit
    ) {
      throw { status: 400, message: "Kuota voucher sudah habis" };
    }

    // Cek kuota per-user (hanya hitung usage yang berstatus USED, RESERVED dianggap masih pending)
    const userUsageCount = await prisma.voucherUsage.count({
      where: {
        voucherId: voucher.id,
        userId,
        status: { in: ["USED", "RESERVED"] },
      },
    });

    if (userUsageCount >= voucher.usageLimitPerUser) {
      throw {
        status: 400,
        message: "Anda sudah mencapai batas penggunaan voucher ini",
      };
    }

    // Hitung estimasi diskon
    let discountAmount = 0;

    if (voucher.discountType === "PERCENTAGE") {
      discountAmount = (amount * Number(voucher.discountValue)) / 100;
      if (voucher.maxDiscountAmount) {
        discountAmount = Math.min(
          discountAmount,
          Number(voucher.maxDiscountAmount),
        );
      }
    } else {
      discountAmount = Number(voucher.discountValue);
    }

    // Diskon tidak boleh melebihi amount
    discountAmount = Math.min(discountAmount, amount);

    const finalAmount = amount - discountAmount;

    return {
      voucher: {
        id: voucher.id,
        code: voucher.code,
        name: voucher.name,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
      },
      originalAmount: amount,
      discountAmount,
      finalAmount,
    };
  },

  // 1. Service apply voucher ke AYCL
  async applyVoucherToAyclService({
    userId,
    bookingId,
    code,
  }: {
    userId: string;
    bookingId: string;
    code: string;
  }) {
    const normalizedCode = code.toUpperCase().trim();

    return await prisma.$transaction(async (tx) => {
      const booking = await tx.aYCLBooking.findUnique({
        where: { id: bookingId },
        include: { batch: true, payment: true },
      });

      if (!booking) throw { status: 404, message: "Booking tidak ditemukan." };
      if (booking.userId !== userId)
        throw { status: 403, message: "Bukan booking milik anda." };
      if (booking.status !== "pending")
        throw {
          status: 400,
          message: "Voucher hanya bisa diterapkan saat status pending.",
        };
      if (!booking.payment)
        throw { status: 400, message: "Payment tidak ditemukan." };

      const existingVoucherUsage = await tx.voucherUsage.findUnique({
        where: { ayclBookingId: bookingId },
      });
      if (existingVoucherUsage)
        throw {
          status: 400,
          message: "Voucher sudah diterapkan pada booking ini.",
        };

      const originalAmount = booking.batch.price.toNumber();

      const voucher = await tx.voucher.findUnique({
        where: { code: normalizedCode },
      }); // ✅ pakai normalizedCode

      if (!voucher)
        throw { status: 404, message: "Kode voucher tidak ditemukan." };
      if (!voucher.isActive)
        throw { status: 400, message: "Voucher tidak aktif." };

      const now = new Date();
      if (voucher.startDate && voucher.startDate > now)
        throw { status: 400, message: "Voucher belum berlaku." };
      if (voucher.expiryDate && voucher.expiryDate < now)
        throw { status: 400, message: "Voucher sudah kedaluwarsa." };

      if (voucher.productScope !== "GLOBAL" && voucher.productScope !== "AYCL")
        throw {
          status: 400,
          message: "Voucher ini tidak berlaku untuk produk AYCL.",
        };

      if (
        voucher.minimumPurchase &&
        originalAmount < voucher.minimumPurchase.toNumber()
      )
        throw {
          status: 400,
          message: `Minimum pembelian untuk voucher ini adalah Rp${voucher.minimumPurchase.toNumber().toLocaleString("id-ID")}.`,
        };

      if (
        voucher.usageLimit !== null &&
        voucher.usageCount >= voucher.usageLimit
      )
        throw { status: 400, message: "Kuota voucher sudah habis." };

      const userUsageCount = await tx.voucherUsage.count({
        where: {
          voucherId: voucher.id,
          userId,
          status: { in: ["RESERVED", "USED"] },
        },
      });
      if (userUsageCount >= voucher.usageLimitPerUser)
        throw {
          status: 400,
          message: "Anda sudah mencapai batas pemakaian voucher ini.",
        };

      // Hitung diskon
      let discountAmount = 0;
      const discountValue = voucher.discountValue.toNumber();

      if (voucher.discountType === "PERCENTAGE") {
        discountAmount = Math.round(originalAmount * (discountValue / 100));
        if (voucher.maxDiscountAmount) {
          discountAmount = Math.min(
            discountAmount,
            voucher.maxDiscountAmount.toNumber(),
          );
        }
      } else {
        discountAmount = Math.min(discountValue, originalAmount);
      }

      const finalAmount = originalAmount - discountAmount;

      await tx.voucherUsage.create({
        data: {
          voucherId: voucher.id,
          userId,
          status: "RESERVED",
          originalAmount,
          discountAmount,
          finalAmount,
          ayclBookingId: bookingId,
        },
      });

      await tx.voucher.update({
        where: { id: voucher.id },
        data: { usageCount: { increment: 1 } },
      });

      await tx.payment.update({
        where: { ayclBookingId: bookingId },
        data: { amount: finalAmount, updatedAt: new Date() },
      });

      return {
        type: "voucher" as const,
        voucherCode: voucher.code,
        voucherName: voucher.name,
        discountType: voucher.discountType,
        discountValue,
        originalAmount,
        discountAmount,
        finalAmount,
      };
    });
  },

  // 2. Gateway: detect voucher vs referral
  async applyCodeToAyclService({
    userId,
    bookingId,
    code,
  }: {
    userId: string;
    bookingId: string;
    code: string;
  }) {
    const normalizedCode = code.toUpperCase().trim();

    const [voucher, referral] = await Promise.all([
      prisma.voucher.findUnique({ where: { code: normalizedCode } }),
      prisma.referralCode.findUnique({ where: { code: normalizedCode } }),
    ]);

    if (!voucher && !referral) {
      throw { status: 404, message: "Kode tidak ditemukan." };
    }

    if (voucher) {
      return await VoucherService.applyVoucherToAyclService({
        userId,
        bookingId,
        code: normalizedCode,
      });
    } else {
      // Import dari referral service
      return await applyReferralToAyclBookingService({
        userId,
        bookingId,
        code: normalizedCode,
      });
    }
  },

  // 1. Service apply voucher ke Booking mentoring
  async applyVoucherToBookingService({
    userId,
    bookingId,
    code,
  }: {
    userId: string;
    bookingId: string;
    code: string;
  }) {
    const normalizedCode = code.toUpperCase().trim();

    return await prisma.$transaction(async (tx) => {
      // Ambil booking + invoice + payments
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          mentoringService: true,
          invoice: {
            include: {
              payments: { orderBy: { installmentNumber: "asc" } },
            },
          },
        },
      });

      if (!booking) throw { status: 404, message: "Booking tidak ditemukan." };
      if (booking.menteeId !== userId)
        throw { status: 403, message: "Bukan booking milik anda." };
      if (booking.status !== "pending")
        throw {
          status: 400,
          message: "Voucher hanya bisa diterapkan saat status pending.",
        };
      if (!booking.invoice)
        throw { status: 400, message: "Invoice tidak ditemukan." };

      // Cek apakah sudah ada payment yang confirmed
      const hasPaidPayment = booking.invoice.payments.some(
        (p) => p.status === "confirmed",
      );
      if (hasPaidPayment)
        throw {
          status: 400,
          message:
            "Voucher tidak bisa diterapkan setelah pembayaran dilakukan.",
        };

      // Cek apakah sudah ada voucherUsage untuk booking ini
      const existingVoucherUsage = await tx.voucherUsage.findUnique({
        where: { bookingId },
      });
      if (existingVoucherUsage)
        throw {
          status: 400,
          message: "Voucher sudah diterapkan pada booking ini.",
        };

      const originalAmount = booking.mentoringService.price.toNumber();

      // Cari voucher
      const voucher = await tx.voucher.findUnique({
        where: { code: normalizedCode },
      });

      if (!voucher)
        throw { status: 404, message: "Kode voucher tidak ditemukan." };
      if (!voucher.isActive)
        throw { status: 400, message: "Voucher tidak aktif." };

      const now = new Date();
      if (voucher.startDate && voucher.startDate > now)
        throw { status: 400, message: "Voucher belum berlaku." };
      if (voucher.expiryDate && voucher.expiryDate < now)
        throw { status: 400, message: "Voucher sudah kedaluwarsa." };

      if (
        voucher.productScope !== "GLOBAL" &&
        voucher.productScope !== "MENTORING"
      )
        throw {
          status: 400,
          message: "Voucher ini tidak berlaku untuk produk Mentoring.",
        };

      if (
        voucher.minimumPurchase &&
        originalAmount < voucher.minimumPurchase.toNumber()
      )
        throw {
          status: 400,
          message: `Minimum pembelian untuk voucher ini adalah Rp${voucher.minimumPurchase.toNumber().toLocaleString("id-ID")}.`,
        };

      if (
        voucher.usageLimit !== null &&
        voucher.usageCount >= voucher.usageLimit
      )
        throw { status: 400, message: "Kuota voucher sudah habis." };

      const userUsageCount = await tx.voucherUsage.count({
        where: {
          voucherId: voucher.id,
          userId,
          status: { in: ["RESERVED", "USED"] },
        },
      });
      if (userUsageCount >= voucher.usageLimitPerUser)
        throw {
          status: 400,
          message: "Anda sudah mencapai batas pemakaian voucher ini.",
        };

      // Hitung diskon
      let discountAmount = 0;
      const discountValue = voucher.discountValue.toNumber();

      if (voucher.discountType === "PERCENTAGE") {
        discountAmount = Math.round(originalAmount * (discountValue / 100));
        if (voucher.maxDiscountAmount) {
          discountAmount = Math.min(
            discountAmount,
            voucher.maxDiscountAmount.toNumber(),
          );
        }
      } else {
        discountAmount = Math.min(discountValue, originalAmount);
      }

      const finalAmount = originalAmount - discountAmount;

      // Buat VoucherUsage
      await tx.voucherUsage.create({
        data: {
          voucherId: voucher.id,
          userId,
          status: "RESERVED",
          originalAmount,
          discountAmount,
          finalAmount,
          bookingId,
        },
      });

      // Increment usageCount
      await tx.voucher.update({
        where: { id: voucher.id },
        data: { usageCount: { increment: 1 } },
      });

      // Update invoice
      await tx.bookingInvoice.update({
        where: { id: booking.invoice.id },
        data: {
          totalAmount: finalAmount,
          remainingAmount: finalAmount,
          updatedAt: new Date(),
        },
      });

      // Recalculate payments (ikut pola referral)
      const invoice = booking.invoice;
      const installmentCount = invoice.installmentCount || 1;
      let recalculatedAmounts: number[] = [];

      if (invoice.paymentType === "FULL" || installmentCount === 1) {
        recalculatedAmounts = [finalAmount];
      } else if (installmentCount === 2) {
        recalculatedAmounts = [
          Math.round(finalAmount * 0.6),
          finalAmount - Math.round(finalAmount * 0.6),
        ];
      } else if (installmentCount === 3) {
        const first = Math.round(finalAmount * 0.5);
        const second = Math.round(finalAmount * 0.3);
        recalculatedAmounts = [first, second, finalAmount - first - second];
      } else {
        const perInstallment = Math.floor(finalAmount / installmentCount);
        recalculatedAmounts = Array(installmentCount).fill(perInstallment);
        recalculatedAmounts[recalculatedAmounts.length - 1] +=
          finalAmount - perInstallment * installmentCount;
      }

      // Update payments
      for (let i = 0; i < invoice.payments.length; i++) {
        await tx.payment.update({
          where: { id: invoice.payments[i].id },
          data: { amount: recalculatedAmounts[i] || 0, updatedAt: new Date() },
        });
      }

      return {
        type: "voucher" as const,
        voucherCode: voucher.code,
        voucherName: voucher.name,
        discountType: voucher.discountType,
        discountValue,
        originalAmount,
        discountAmount,
        finalAmount,
        paymentType: invoice.paymentType,
        installmentCount,
        recalculatedPayments: recalculatedAmounts,
      };
    });
  },

  // 2. Gateway: detect voucher vs referral untuk booking mentoring
  async applyCodeToBookingService({
    userId,
    bookingId,
    code,
  }: {
    userId: string;
    bookingId: string;
    code: string;
  }) {
    const normalizedCode = code.toUpperCase().trim();

    const [voucher, referral] = await Promise.all([
      prisma.voucher.findUnique({ where: { code: normalizedCode } }),
      prisma.referralCode.findUnique({ where: { code: normalizedCode } }),
    ]);

    if (!voucher && !referral) {
      throw { status: 404, message: "Kode tidak ditemukan." };
    }

    if (voucher) {
      return await VoucherService.applyVoucherToBookingService({
        userId,
        bookingId,
        code: normalizedCode,
      });
    } else {
      return await applyReferralToBookingService({
        userId,
        bookingId,
        code: normalizedCode,
      });
    }
  },

  // 1. Service apply voucher ke ELearning Subscription
  async applyVoucherToELearningService({
    userId,
    subscriptionId,
    code,
  }: {
    userId: string;
    subscriptionId: string;
    code: string;
  }) {
    const normalizedCode = code.toUpperCase().trim();

    return await prisma.$transaction(async (tx) => {
      const subscription = await tx.eLearningSubscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true, payment: true },
      });

      if (!subscription)
        throw { status: 404, message: "Subscription tidak ditemukan." };
      if (subscription.userId !== userId)
        throw { status: 403, message: "Bukan subscription milik anda." };
      if (subscription.status !== "pending")
        throw {
          status: 400,
          message: "Voucher hanya bisa diterapkan saat status pending.",
        };
      if (!subscription.payment)
        throw { status: 400, message: "Payment tidak ditemukan." };

      const existingVoucherUsage = await tx.voucherUsage.findUnique({
        where: { eLearningSubscriptionId: subscriptionId },
      });
      if (existingVoucherUsage)
        throw {
          status: 400,
          message: "Voucher sudah diterapkan pada subscription ini.",
        };

      const originalAmount = subscription.plan.price.toNumber();

      const voucher = await tx.voucher.findUnique({
        where: { code: normalizedCode },
      });

      if (!voucher)
        throw { status: 404, message: "Kode voucher tidak ditemukan." };
      if (!voucher.isActive)
        throw { status: 400, message: "Voucher tidak aktif." };

      const now = new Date();
      if (voucher.startDate && voucher.startDate > now)
        throw { status: 400, message: "Voucher belum berlaku." };
      if (voucher.expiryDate && voucher.expiryDate < now)
        throw { status: 400, message: "Voucher sudah kedaluwarsa." };

      if (
        voucher.productScope !== "GLOBAL" &&
        voucher.productScope !== "ELEARNING"
      )
        throw {
          status: 400,
          message: "Voucher ini tidak berlaku untuk produk E-Learning.",
        };

      if (
        voucher.minimumPurchase &&
        originalAmount < voucher.minimumPurchase.toNumber()
      )
        throw {
          status: 400,
          message: `Minimum pembelian untuk voucher ini adalah Rp${voucher.minimumPurchase.toNumber().toLocaleString("id-ID")}.`,
        };

      if (
        voucher.usageLimit !== null &&
        voucher.usageCount >= voucher.usageLimit
      )
        throw { status: 400, message: "Kuota voucher sudah habis." };

      const userUsageCount = await tx.voucherUsage.count({
        where: {
          voucherId: voucher.id,
          userId,
          status: { in: ["RESERVED", "USED"] },
        },
      });
      if (userUsageCount >= voucher.usageLimitPerUser)
        throw {
          status: 400,
          message: "Anda sudah mencapai batas pemakaian voucher ini.",
        };

      // Hitung diskon
      let discountAmount = 0;
      const discountValue = voucher.discountValue.toNumber();

      if (voucher.discountType === "PERCENTAGE") {
        discountAmount = Math.round(originalAmount * (discountValue / 100));
        if (voucher.maxDiscountAmount) {
          discountAmount = Math.min(
            discountAmount,
            voucher.maxDiscountAmount.toNumber(),
          );
        }
      } else {
        discountAmount = Math.min(discountValue, originalAmount);
      }

      const finalAmount = originalAmount - discountAmount;

      await tx.voucherUsage.create({
        data: {
          voucherId: voucher.id,
          userId,
          status: "RESERVED",
          originalAmount,
          discountAmount,
          finalAmount,
          eLearningSubscriptionId: subscriptionId,
        },
      });

      await tx.voucher.update({
        where: { id: voucher.id },
        data: { usageCount: { increment: 1 } },
      });

      await tx.payment.update({
        where: { eLearningSubscriptionId: subscriptionId },
        data: { amount: finalAmount, updatedAt: new Date() },
      });

      return {
        type: "voucher" as const,
        voucherCode: voucher.code,
        voucherName: voucher.name,
        discountType: voucher.discountType,
        discountValue,
        originalAmount,
        discountAmount,
        finalAmount,
      };
    });
  },

  // 2. Gateway: detect voucher vs referral untuk elearning subscription
  async applyCodeToELearningService({
    userId,
    subscriptionId,
    code,
  }: {
    userId: string;
    subscriptionId: string;
    code: string;
  }) {
    const normalizedCode = code.toUpperCase().trim();

    const [voucher, referral] = await Promise.all([
      prisma.voucher.findUnique({ where: { code: normalizedCode } }),
      prisma.referralCode.findUnique({ where: { code: normalizedCode } }),
    ]);

    if (!voucher && !referral) {
      throw { status: 404, message: "Kode tidak ditemukan." };
    }

    if (voucher) {
      return await VoucherService.applyVoucherToELearningService({
        userId,
        subscriptionId,
        code: normalizedCode,
      });
    } else {
      return await applyReferralToELearningService({
        userId,
        subscriptionId,
        code: normalizedCode,
      });
    }
  },
};
