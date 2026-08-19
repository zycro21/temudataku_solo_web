import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate, addDays, isAfter } from "date-fns";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { elearningThumbnailPath } from "../middlewares/uploadImage.js";
import { sendRedeemCodeSuccessEmail } from "../utils/sendRedeemCodeSuccessEmail.js";

const prisma = new PrismaClient();

const adminLikeRoles = ["admin", "cm", "curdev"];

// 🔥 Rate limit redeem: maksimal 6 percobaan GAGAL dalam sliding window 24
// jam per user. "Sliding" artinya bukan reset jam 00:00, tapi window
// bergerak — percobaan gagal tertua yang keluar dari window 24 jam
// terakhir itu yang bikin kuota nambah lagi.
const MAX_FAILED_ATTEMPTS = 6;
const ATTEMPT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 jam

// Karakter yang gampang ketuker dibuang (0/O, 1/I/L) biar kode gampang
// dibaca & diketik ulang manual kalau perlu (mis. dibagiin lewat DM/print).
const CODE_CHARSET = "ABCDEFGHJKILMNOPQRSTUVWXYZ0123456789";

function randomCodeSegment(length: number) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CODE_CHARSET[crypto.randomInt(0, CODE_CHARSET.length)];
  }
  return result;
}

// Format: XXXX-XXXX-XXXX
function generateCodeCandidate() {
  return `${randomCodeSegment(4)}-${randomCodeSegment(4)}-${randomCodeSegment(4)}`;
}

async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateCodeCandidate();
    const existing = await prisma.redeemCode.findUnique({
      where: { code: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  // Extremely unlikely, tapi jaga-jaga daripada infinite loop.
  throw new Error("Gagal generate kode unik, coba lagi");
}

// 🔥 State ini nggak disimpan di DB — dihitung on-the-fly tiap kali dibaca,
// karena "expired" bisa berubah dari waktu ke waktu tanpa ada write apa pun.
type RedeemCodeState = "ACTIVE" | "EXPIRED" | "EXHAUSTED" | "DISABLED";

function computeState(code: {
  isActive: boolean;
  expiresAt: Date;
  usedCount: number;
  maxUses: number;
}): RedeemCodeState {
  if (!code.isActive) return "DISABLED";
  if (code.expiresAt.getTime() < Date.now()) return "EXPIRED";
  if (code.usedCount >= code.maxUses) return "EXHAUSTED";
  return "ACTIVE";
}

function withState<T extends Parameters<typeof computeState>[0]>(code: T) {
  return { ...code, state: computeState(code) };
}

const codeDetailInclude = {
  plan: { select: { id: true, name: true, durationDay: true, price: true } },
  createdBy: { select: { id: true, fullName: true, email: true } },
};

export const generateELearningSubscriptionId = async () => {
  return `SUB-EL-${Date.now()}-${Math.floor(
    1000000000 + Math.random() * 9000000000,
  )}`;
};

// ── Helper rate-limit — dipakai bareng oleh redeemCode() & getRedeemAttemptStatus() ──
async function computeAttemptStatus(userId: string) {
  const since = new Date(Date.now() - ATTEMPT_WINDOW_MS);

  const failedAttempts = await prisma.redeemCodeAttempt.findMany({
    where: { userId, success: false, createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  const failedCount = failedAttempts.length;
  const attemptsRemaining = Math.max(0, MAX_FAILED_ATTEMPTS - failedCount);

  // retryAfter cuma relevan kalau kuota abis — dihitung dari kapan
  // percobaan gagal PALING LAMA di window ini bakal "expired" dari window.
  let retryAfter: Date | null = null;
  if (attemptsRemaining === 0 && failedAttempts.length > 0) {
    retryAfter = new Date(
      failedAttempts[0].createdAt.getTime() + ATTEMPT_WINDOW_MS,
    );
  }

  return {
    attemptsRemaining,
    maxAttempts: MAX_FAILED_ATTEMPTS,
    retryAfter,
  };
}

export default {
  // ── POST /codes — admin generate kode baru ───────────────────────────────
  async createRedeemCode(
    data: {
      planId: string;
      code?: string;
      maxUses: number;
      expiresAt: Date;
      note?: string;
    },
    adminUserId: string,
  ) {
    const plan = await prisma.eLearningSubscriptionPlan.findUnique({
      where: { id: data.planId },
    });
    if (!plan) throw new Error("Plan tidak ditemukan");

    if (data.expiresAt.getTime() <= Date.now()) {
      throw new Error("Tanggal kadaluarsa harus di masa depan");
    }

    let code = data.code?.toUpperCase();
    if (code) {
      const taken = await prisma.redeemCode.findUnique({ where: { code } });
      if (taken) throw new Error("Kode sudah dipakai, pilih kode lain");
    } else {
      code = await generateUniqueCode();
    }

    const created = await prisma.redeemCode.create({
      data: {
        code,
        planId: data.planId,
        createdById: adminUserId,
        maxUses: data.maxUses,
        expiresAt: data.expiresAt,
        note: data.note,
      },
      include: codeDetailInclude,
    });

    return withState(created);
  },

  // ── GET /codes — admin list semua kode ────────────────────────────────────
  async getRedeemCodes(query: {
    page: number;
    limit: number;
    search?: string;
    planId?: string;
    isActive?: boolean;
  }) {
    const { page, limit, search, planId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (planId) where.planId = planId;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { note: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.redeemCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: codeDetailInclude,
      }),
      prisma.redeemCode.count({ where }),
    ]);

    return {
      data: data.map(withState),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  // ── GET /codes/:id — admin detail 1 kode + riwayat pemakaiannya ──────────
  async getRedeemCodeById(id: string) {
    const code = await prisma.redeemCode.findUnique({
      where: { id },
      include: {
        ...codeDetailInclude,
        usages: {
          orderBy: { redeemedAt: "desc" },
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    if (!code) throw new Error("Kode redeem tidak ditemukan");

    return withState(code);
  },

  // ── PATCH /codes/:id — admin update kode ─────────────────────────────────
  async updateRedeemCode(
    id: string,
    data: {
      maxUses?: number;
      expiresAt?: Date;
      isActive?: boolean;
      note?: string;
    },
  ) {
    const existing = await prisma.redeemCode.findUnique({ where: { id } });
    if (!existing) throw new Error("Kode redeem tidak ditemukan");

    // 🔥 maxUses nggak boleh diturunkan sampai di bawah usedCount yang
    // sudah terjadi — bakal bikin state jadi ambigu (usedCount > maxUses).
    if (data.maxUses !== undefined && data.maxUses < existing.usedCount) {
      throw new Error(
        `maxUses tidak boleh kurang dari ${existing.usedCount} (jumlah yang sudah redeem)`,
      );
    }

    const updated = await prisma.redeemCode.update({
      where: { id },
      data: {
        maxUses: data.maxUses ?? existing.maxUses,
        expiresAt: data.expiresAt ?? existing.expiresAt,
        isActive: data.isActive ?? existing.isActive,
        note: data.note ?? existing.note,
        updatedAt: new Date(),
      },
      include: codeDetailInclude,
    });

    return withState(updated);
  },

  // ── DELETE /codes/:id — admin hapus kode ─────────────────────────────────
  async deleteRedeemCode(id: string) {
    const existing = await prisma.redeemCode.findUnique({ where: { id } });
    if (!existing) throw new Error("Kode redeem tidak ditemukan");

    // 🔥 Kode yang sudah pernah dipakai TIDAK boleh dihapus — bakal ikut
    // ngehapus RedeemCodeUsage (cascade) yang notabene audit trail
    // subscription seseorang. Suruh nonaktifin (isActive: false) aja.
    if (existing.usedCount > 0) {
      throw new Error(
        "Kode ini sudah pernah dipakai, tidak bisa dihapus — nonaktifkan saja (isActive: false)",
      );
    }

    await prisma.redeemCode.delete({ where: { id } });

    return { id };
  },

  // ── GET /redeem/status — cek sisa kuota percobaan user saat ini ─────────
  async getRedeemAttemptStatus(userId: string) {
    return computeAttemptStatus(userId);
  },

  // ── POST /redeem — user redeem kode ──────────────────────────────────────
  async redeemCode(rawCode: string, userId: string) {
    // 🔥 Cek rate limit DULUAN, sebelum nyentuh apa pun yang lain — dan
    // kalau lagi kena limit, LANGSUNG throw di sini tanpa nyatet attempt
    // baru. Kalau attempt baru tetap dicatat pas lagi diblokir, orang yang
    // spam klik pas diblokir bakal terus nge-push mundur retryAfter-nya
    // sendiri (block time nggak akan pernah berakhir) — jadi sengaja TIDAK.
    const statusBeforeAttempt = await computeAttemptStatus(userId);
    if (statusBeforeAttempt.attemptsRemaining <= 0) {
      throw new Error(
        "Terlalu banyak percobaan gagal. Coba lagi dalam 24 jam.",
      );
    }

    const code = rawCode.trim().toUpperCase();

    try {
      const redeemCode = await prisma.redeemCode.findUnique({
        where: { code },
        include: { plan: true },
      });

      if (!redeemCode) throw new Error("Kode redeem tidak ditemukan");
      if (!redeemCode.isActive) throw new Error("Kode redeem tidak aktif");
      if (redeemCode.expiresAt.getTime() < Date.now()) {
        throw new Error("Kode redeem sudah kadaluarsa");
      }
      if (redeemCode.usedCount >= redeemCode.maxUses) {
        throw new Error("Kode redeem sudah mencapai batas penggunaan");
      }

      const alreadyUsed = await prisma.redeemCodeUsage.findUnique({
        where: {
          redeemCodeId_userId: { redeemCodeId: redeemCode.id, userId },
        },
      });
      if (alreadyUsed) throw new Error("Kamu sudah pernah redeem kode ini");

      const result = await prisma.$transaction(async (tx) => {
        // 🔥 Increment usedCount SECARA ATOMIK dengan syarat di where-nya —
        // ini yang mencegah race condition kalau 2 user redeem kode dengan
        // sisa kuota tinggal 1 di saat yang nyaris bersamaan. Kalau kuota
        // udah keburu habis duluan sama request lain, count hasilnya 0.
        const claim = await tx.redeemCode.updateMany({
          where: {
            id: redeemCode.id,
            isActive: true,
            expiresAt: { gt: new Date() },
            usedCount: { lt: redeemCode.maxUses },
          },
          data: { usedCount: { increment: 1 } },
        });

        if (claim.count === 0) {
          throw new Error("Kode redeem sudah tidak bisa dipakai lagi");
        }

        const now = new Date();

        // 🔥 CEK SUBSCRIPTION TERAKHIR — biar startAt nyambung, bukan
        // numpuk dari `now`. Cuma subscription yang statusnya udah pasti
        // (confirmed / completed) yang dianggap — status "pending" (masih
        // nunggu payment, belum tentu jadi) sengaja DIABAIKAN.
        const lastConfirmedSubscription =
          await tx.eLearningSubscription.findFirst({
            where: {
              userId,
              status: { in: ["confirmed", "completed"] },
            },
            orderBy: { endAt: "desc" },
          });

        let startAt: Date;

        if (
          lastConfirmedSubscription &&
          isAfter(lastConfirmedSubscription.endAt, now)
        ) {
          // ✅ udah ada subscription confirmed/completed & masih belum habis
          // → lanjut dari situ, bukan numpuk dari now.
          startAt = lastConfirmedSubscription.endAt;
        } else {
          startAt = now;
        }

        const endAt = addDays(startAt, redeemCode.plan.durationDay);

        const subscriptionId = await generateELearningSubscriptionId();

        const subscription = await tx.eLearningSubscription.create({
          data: {
            id: subscriptionId,
            userId,
            planId: redeemCode.planId,
            startAt,
            endAt,
            status: "confirmed",
            // payment sengaja nggak diisi — redeem code bypass payment.
          },
        });

        try {
          await tx.redeemCodeUsage.create({
            data: {
              redeemCodeId: redeemCode.id,
              userId,
              subscriptionId: subscription.id,
            },
          });
        } catch (err: any) {
          // Unique constraint [redeemCodeId, userId] — jaga-jaga race
          // condition juga di sisi ini (2 request nyaris bersamaan dari
          // user yang sama).
          if (err.code === "P2002") {
            throw new Error("Kamu sudah pernah redeem kode ini");
          }
          throw err;
        }

        // 🔥 Attempt sukses ikut dicatat di transaction yang sama — kalau
        // transaction ini di-rollback (mis. error lain di tengah), catatan
        // attempt-nya ikut nggak ke-commit juga (konsisten).
        await tx.redeemCodeAttempt.create({
          data: { userId, success: true },
        });

        // Data user buat kirim email sukses setelah transaction ini commit
        // (pengiriman email sengaja DI LUAR transaction — SMTP call nggak
        // boleh nahan koneksi DB kebuka lama-lama, dan gagal kirim email
        // nggak boleh nge-rollback subscription yang udah keburu jadi).
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { email: true, fullName: true },
        });

        return {
          subscription,
          plan: redeemCode.plan,
          redeemCode: { id: redeemCode.id, code: redeemCode.code },
          user,
        };
      });

      // 🔥 Fire-and-forget: email sukses redeem. Best-effort — kalau
      // gagal kirim (SMTP down, dsb), user TETAP dapat subscription-nya
      // dan response redeem tetap sukses. Cuma di-log, nggak di-throw.
      if (result.user?.email) {
        sendRedeemCodeSuccessEmail({
          email: result.user.email,
          fullName: result.user.fullName,
          planName: result.plan.name,
          code: result.redeemCode.code,
          durationDay: result.plan.durationDay,
          redeemedAt: new Date(),
          startAt: result.subscription.startAt,
          endAt: result.subscription.endAt,
        }).catch((emailErr) =>
          console.error("Gagal mengirim email redeem code:", emailErr),
        );
      }

      // `user` cuma dibutuhkan buat kirim email di atas — nggak perlu
      // ikut ke-expose di response API balik ke frontend.
      const { user: _user, ...publicResult } = result;
      return publicResult;
    } catch (err: any) {
      // 🔥 Apa pun yang bikin proses di atas gagal (kode nggak ada, expired,
      // kuota habis, sudah pernah redeem, dst) dicatat sebagai 1 attempt
      // gagal — inilah yang bikin sisa kuota di computeAttemptStatus() abis
      // ke depannya. Fire-and-forget dengan .catch supaya kalau LOGGING-nya
      // sendiri gagal, error asli yang tetap dilempar ke caller, bukan
      // error logging yang nutupin pesan aslinya.
      prisma.redeemCodeAttempt
        .create({ data: { userId, success: false } })
        .catch((logErr) =>
          console.error("Gagal mencatat redeem attempt:", logErr),
        );

      throw err;
    }
  },

  // ── GET /usages — dual-role: admin semua, user cuma miliknya sendiri ─────
  async getRedeemUsages(
    query: {
      page: number;
      limit: number;
      userId?: string;
      redeemCodeId?: string;
    },
    requester: { userId: string; roles: string[] },
  ) {
    const { page, limit, redeemCodeId } = query;
    const skip = (page - 1) * limit;

    const isAdminLike = requester.roles.some((r) => adminLikeRoles.includes(r));

    const where: any = {};
    if (redeemCodeId) where.redeemCodeId = redeemCodeId;

    if (isAdminLike) {
      // Admin boleh filter ke user tertentu; kalau nggak diisi, lihat semua.
      if (query.userId) where.userId = query.userId;
    } else {
      // Non-admin DIPAKSA cuma lihat punya sendiri — query.userId dari
      // luar diabaikan total, bukan sekadar default.
      where.userId = requester.userId;
    }

    const [data, total] = await Promise.all([
      prisma.redeemCodeUsage.findMany({
        where,
        orderBy: { redeemedAt: "desc" },
        skip,
        take: limit,
        include: {
          redeemCode: {
            select: {
              id: true,
              code: true,
              plan: { select: { id: true, name: true, durationDay: true } },
            },
          },
          // Info user cuma relevan buat admin — non-admin toh where-nya
          // udah dikunci ke dirinya sendiri, jadi harmless buat di-include
          // juga (bukan kebocoran data orang lain).
          user: { select: { id: true, fullName: true, email: true } },
          subscription: {
            select: { id: true, startAt: true, endAt: true, status: true },
          },
        },
      }),
      prisma.redeemCodeUsage.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },
};
