import { Request, Response, NextFunction } from "express";
// 🔥 Sesuaikan path import ini dengan struktur folder project kamu
import { AuthenticatedRequestRedeemCode } from "../middlewares/authenticate.js";
import RedeemCodeService from "../services/redeemCode.service.js";

const adminLikeRoles = ["admin", "cm", "curdev"];

function isAdminLike(user?: { roles: string[] }) {
  return !!user?.roles?.some((role) => adminLikeRoles.includes(role));
}

// Satu tempat buat mapping pesan error dari service ke status HTTP.
function handleRedeemCodeError(err: any, res: Response, next: NextFunction) {
  if (
    err.message === "Kode redeem tidak ditemukan" ||
    err.message === "Plan tidak ditemukan"
  ) {
    res.status(404).json({ success: false, message: err.message });
    return;
  }

  if (
    err.message === "Kode sudah dipakai, pilih kode lain" ||
    err.message === "Kamu sudah pernah redeem kode ini"
  ) {
    res.status(409).json({ success: false, message: err.message });
    return;
  }

  // 🔥 Rate limit — 429 Too Many Requests, bukan 400, biar semantiknya
  // jelas ini soal frekuensi request, bukan data yang salah.
  if (err.message.startsWith("Terlalu banyak percobaan gagal")) {
    res.status(429).json({ success: false, message: err.message });
    return;
  }

  if (
    err.message === "Kode redeem tidak aktif" ||
    err.message === "Kode redeem sudah kadaluarsa" ||
    err.message === "Kode redeem sudah mencapai batas penggunaan" ||
    err.message === "Kode redeem sudah tidak bisa dipakai lagi" ||
    err.message === "Tanggal kadaluarsa harus di masa depan" ||
    err.message.startsWith("maxUses tidak boleh kurang dari") ||
    err.message.includes("sudah pernah dipakai, tidak bisa dihapus")
  ) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  next(err);
}

export default {
  // ═══════════════ ADMIN-ONLY ═══════════════

  // POST /codes — generate kode baru
  async createRedeemCode(
    req: AuthenticatedRequestRedeemCode,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedBody, user } = req;

      if (!validatedBody?.planId || !validatedBody?.expiresAt || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      if (!isAdminLike(user)) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat membuat kode redeem",
        });
        return;
      }

      const result = await RedeemCodeService.createRedeemCode(
        {
          planId: validatedBody.planId,
          code: validatedBody.code,
          maxUses: validatedBody.maxUses ?? 1,
          expiresAt: new Date(validatedBody.expiresAt),
          note: validatedBody.note,
        },
        user.userId,
      );

      res.status(201).json({
        success: true,
        message: "Kode redeem berhasil dibuat",
        data: result,
      });
    } catch (err: any) {
      handleRedeemCodeError(err, res, next);
    }
  },

  // GET /codes — list semua kode
  async getRedeemCodes(
    req: AuthenticatedRequestRedeemCode,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery, user } = req;

      if (!user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      if (!isAdminLike(user)) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat mengakses endpoint ini",
        });
        return;
      }

      const result = await RedeemCodeService.getRedeemCodes({
        page: validatedQuery?.page ?? 1,
        limit: validatedQuery?.limit ?? 10,
        search: validatedQuery?.search,
        planId: validatedQuery?.planId,
        isActive: validatedQuery?.isActive,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      handleRedeemCodeError(err, res, next);
    }
  },

  // GET /codes/:id — detail 1 kode + riwayat pemakaian
  async getRedeemCodeById(
    req: AuthenticatedRequestRedeemCode,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams?.id || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      if (!isAdminLike(user)) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat mengakses endpoint ini",
        });
        return;
      }

      const result = await RedeemCodeService.getRedeemCodeById(
        validatedParams.id,
      );

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      handleRedeemCodeError(err, res, next);
    }
  },

  // PATCH /codes/:id — update kode
  async updateRedeemCode(
    req: AuthenticatedRequestRedeemCode,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams?.id || !validatedBody || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      if (!isAdminLike(user)) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat mengubah kode redeem",
        });
        return;
      }

      const result = await RedeemCodeService.updateRedeemCode(
        validatedParams.id,
        {
          maxUses: validatedBody.maxUses,
          expiresAt: validatedBody.expiresAt
            ? new Date(validatedBody.expiresAt)
            : undefined,
          isActive: validatedBody.isActive,
          note: validatedBody.note,
        },
      );

      res.status(200).json({
        success: true,
        message: "Kode redeem berhasil diperbarui",
        data: result,
      });
    } catch (err: any) {
      handleRedeemCodeError(err, res, next);
    }
  },

  // DELETE /codes/:id — hapus kode
  async deleteRedeemCode(
    req: AuthenticatedRequestRedeemCode,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams?.id || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      if (!isAdminLike(user)) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat menghapus kode redeem",
        });
        return;
      }

      await RedeemCodeService.deleteRedeemCode(validatedParams.id);

      res.status(200).json({
        success: true,
        message: "Kode redeem berhasil dihapus",
      });
    } catch (err: any) {
      handleRedeemCodeError(err, res, next);
    }
  },

  // ═══════════════ USER (semua role yang login) ═══════════════

  // GET /redeem/status — cek sisa kuota percobaan sebelum submit
  async getRedeemAttemptStatus(
    req: AuthenticatedRequestRedeemCode,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { user } = req;

      if (!user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await RedeemCodeService.getRedeemAttemptStatus(
        user.userId,
      );

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      handleRedeemCodeError(err, res, next);
    }
  },

  // POST /redeem — redeem kode
  async redeemCode(
    req: AuthenticatedRequestRedeemCode,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedBody, user } = req;

      if (!validatedBody?.code || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await RedeemCodeService.redeemCode(
        validatedBody.code,
        user.userId,
      );

      res.status(200).json({
        success: true,
        message: "Kode redeem berhasil dipakai — subscription kamu sudah aktif",
        data: result,
      });
    } catch (err: any) {
      handleRedeemCodeError(err, res, next);
    }
  },

  // ═══════════════ DUAL-ROLE (admin lihat semua, user lihat punya sendiri) ═══

  // GET /usages
  async getRedeemUsages(
    req: AuthenticatedRequestRedeemCode,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery, user } = req;

      if (!user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await RedeemCodeService.getRedeemUsages(
        {
          page: validatedQuery?.page ?? 1,
          limit: validatedQuery?.limit ?? 10,
          userId: validatedQuery?.userId,
          redeemCodeId: validatedQuery?.redeemCodeId,
        },
        user,
      );

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      handleRedeemCodeError(err, res, next);
    }
  },
};
