import { Response, NextFunction } from "express";
import { AuthenticatedRequestVoucher } from "../middlewares/authenticate.js"; // sesuaikan path
import { VoucherService } from "../services/voucher.service.js";

export const VoucherController = {
  async getAllVouchers(
    req: AuthenticatedRequestVoucher,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery } = req;

      if (!validatedQuery) {
        res.status(400).json({
          success: false,
          message: "Query tidak valid",
        });
        return;
      }

      const result = await VoucherService.getAllVouchers(validatedQuery);

      res.status(200).json({
        success: true,
        message: "Daftar voucher berhasil diambil",
        ...result,
      });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  async getVoucherById(
    req: AuthenticatedRequestVoucher,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams } = req;

      if (!validatedParams?.id) {
        res.status(400).json({
          success: false,
          message: "ID voucher tidak valid",
        });
        return;
      }

      const voucher = await VoucherService.getVoucherById(validatedParams.id);

      res.status(200).json({
        success: true,
        message: "Detail voucher berhasil diambil",
        data: voucher,
      });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  async createVoucher(
    req: AuthenticatedRequestVoucher,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedBody, user } = req;

      if (!validatedBody || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const voucher = await VoucherService.createVoucher(
        validatedBody,
        user.userId,
      );

      res.status(201).json({
        success: true,
        message: "Voucher berhasil dibuat",
        data: voucher,
      });
    } catch (err: any) {
      if (err.status === 409) {
        res.status(409).json({ success: false, message: err.message });
        return;
      }
      if (err.status) {
        res.status(err.status).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  async updateVoucher(
    req: AuthenticatedRequestVoucher,
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

      const voucher = await VoucherService.updateVoucher(
        validatedParams.id,
        validatedBody,
        user,
      );

      res.status(200).json({
        success: true,
        message: "Voucher berhasil diperbarui",
        data: voucher,
      });
    } catch (err: any) {
      if (err.status === 409) {
        res.status(409).json({ success: false, message: err.message });
        return;
      }
      if (err.status) {
        res.status(err.status).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  async toggleVoucherActive(
    req: AuthenticatedRequestVoucher,
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

      const voucher = await VoucherService.toggleVoucherActive(
        validatedParams.id,
        user,
      );

      res.status(200).json({
        success: true,
        message: `Voucher berhasil ${voucher.isActive ? "diaktifkan" : "dinonaktifkan"}`,
        data: voucher,
      });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  async deleteVoucher(
    req: AuthenticatedRequestVoucher,
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

      const result = await VoucherService.deleteVoucher(validatedParams.id);

      res.status(200).json({
        success: true,
        message: "Voucher berhasil dihapus",
        data: result,
      });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  async validateVoucher(
    req: AuthenticatedRequestVoucher,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedBody, user } = req;

      if (
        !validatedBody?.code ||
        !validatedBody.productScope ||
        !validatedBody.amount ||
        !user
      ) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await VoucherService.validateVoucher(
        validatedBody.code,
        validatedBody.productScope,
        validatedBody.amount,
        user.userId,
      );

      res.status(200).json({
        success: true,
        message: "Voucher valid",
        data: result,
      });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  async applyCodeToAycl(
    req: AuthenticatedRequestVoucher,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!user?.userId) throw { status: 401, message: "Unauthorized" };
      if (!validatedParams?.id)
        throw { status: 400, message: "Booking ID tidak valid." };
      if (!validatedBody?.code)
        throw { status: 400, message: "Kode wajib diisi." };

      const result = await VoucherService.applyCodeToAyclService({
        userId: user.userId,
        bookingId: validatedParams.id,
        code: validatedBody.code,
      });

      res.status(200).json({
        success: true,
        message: "Kode berhasil diterapkan.",
        data: result,
      });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  async applyCodeToBooking(
    req: AuthenticatedRequestVoucher,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!user?.userId) throw { status: 401, message: "Unauthorized" };
      if (!validatedParams?.id)
        throw { status: 400, message: "Booking ID tidak valid." };
      if (!validatedBody?.code)
        throw { status: 400, message: "Kode wajib diisi." };

      const result = await VoucherService.applyCodeToBookingService({
        userId: user.userId,
        bookingId: validatedParams.id,
        code: validatedBody.code,
      });

      res.status(200).json({
        success: true,
        message: "Kode berhasil diterapkan.",
        data: result,
      });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  async applyCodeToELearning(
    req: AuthenticatedRequestVoucher,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!user?.userId) throw { status: 401, message: "Unauthorized" };
      if (!validatedParams?.id)
        throw { status: 400, message: "Subscription ID tidak valid." };
      if (!validatedBody?.code)
        throw { status: 400, message: "Kode wajib diisi." };

      const result = await VoucherService.applyCodeToELearningService({
        userId: user.userId,
        subscriptionId: validatedParams.id,
        code: validatedBody.code,
      });

      res.status(200).json({
        success: true,
        message: "Kode berhasil diterapkan.",
        data: result,
      });
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },
};
