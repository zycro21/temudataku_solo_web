import type { Request } from "express";
import { PrismaClient, LoginMethod, LoginPortal } from "@prisma/client";
import { customAlphabet } from "nanoid";
import { formatWibCompact } from "./dateRange.js";

const prisma = new PrismaClient();

const randomSuffix = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6);

/**
 * ID riwayat login: LGN-<tanggal WIB>-<jam WIB>-<6 karakter acak>
 * contoh: LGN-20261110-143005-K3M9ZQ
 * Urut berdasarkan waktu kalau diurutkan sebagai teks. Ubah format di sini saja.
 */
export const generateLoginHistoryId = (at: Date = new Date()): string =>
  `LGN-${formatWibCompact(at)}-${randomSuffix()}`;

/** IP client. Di belakang nginx pastikan nginx menimpa X-Forwarded-For. */
export const getClientIp = (req: Request): string | null => {
  const xff = req.headers["x-forwarded-for"];
  const first = (Array.isArray(xff) ? xff[0] : xff)?.split(",")[0]?.trim();
  const ip = first || req.ip || req.socket?.remoteAddress || null;
  return ip ? ip.slice(0, 64) : null;
};

/**
 * Portal asal login. Frontend affiliator mengirim `portal: "affiliator"`
 * (login manual) dan `role: "affiliator"` (Google). Selain itu dianggap WEB.
 * Sifatnya informasi saja, bukan untuk keputusan keamanan.
 */
export const detectPortal = (req: Request): LoginPortal => {
  const body = (req.body ?? {}) as { portal?: unknown; role?: unknown };
  return body.portal === "affiliator" || body.role === "affiliator"
    ? LoginPortal.AFFILIATOR
    : LoginPortal.WEB;
};

/**
 * Panggil SEKALI setiap kali login berhasil (cookie/token sudah dibuat):
 *   - menambah baris riwayat di login_history
 *   - meng-update users.last_login
 *
 * Tidak pernah melempar error: kegagalan mencatat tidak boleh membuat
 * login gagal.
 */
export const recordLogin = async (params: {
  req: Request;
  userId: string;
  method: LoginMethod | "PASSWORD" | "GOOGLE";
  roles?: string[]; // opsional; kalau kosong diambil dari DB
}): Promise<void> => {
  const { req, userId, method } = params;

  // Satu waktu yang sama untuk lastLogin, loggedInAt, dan ID
  const now = new Date();

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: now },
    });
  } catch (err) {
    console.error("[recordLogin] gagal update lastLogin:", err);
  }

  try {
    const roles =
      params.roles ??
      (
        await prisma.userRole.findMany({
          where: { userId },
          select: { role: { select: { roleName: true } } },
        })
      ).map((ur) => ur.role.roleName);

    await prisma.loginHistory.create({
      data: {
        id: generateLoginHistoryId(now),
        loggedInAt: now,
        userId,
        method: method as LoginMethod,
        portal: detectPortal(req),
        roles,
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"]?.slice(0, 512) ?? null,
      },
    });
  } catch (err) {
    console.error("[recordLogin] gagal menulis login_history:", err);
  }
};
