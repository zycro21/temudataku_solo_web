import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestReferralCode } from "../middlewares/authenticate.js";
import { format } from "date-fns";
// import { HttpError } from "../utils/httpError";
import * as ReferralService from "../services/referral.service.js";
import { PrismaClient, Prisma } from "@prisma/client";
import path from "path";
import fs from "fs";
import { format as formatDate, subDays } from "date-fns";
import { logActivity } from "../utils/logActivtiy.js";

const prisma = new PrismaClient();

export const createReferralCodeController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const adminId = req.user.userId;
    const rolesLog = req.user?.roles || [];

    if (!req.user!.roles.includes("admin")) {
      throw new Error("Unauthorized: Only admins can create referral codes");
    }

    const { ownerId, code, expiryDate, isActive } = req.validatedBody as {
      ownerId: string;
      code: string;
      expiryDate?: Date;
      isActive?: boolean;
    };

    const referralCode = await ReferralService.createReferralCodeService({
      ownerId,
      code,
      expiryDate,
      isActive,
    });

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: req.user!.userId,
        action: "CREATE_REFERRAL",
        type: "CREATE",
        description: `Admin membuat referral code: ${code}`,
        req,
      });
    }

    res.status(201).json({
      success: true,
      message: "Referral code created successfully.",
      data: referralCode,
    });
  } catch (err) {
    next(err);
  }
};

export const getReferralCodesController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Pastikan pengguna adalah admin
    if (!req.user!.roles.includes("admin")) {
      throw new Error("Unauthorized: Only admins can view referral codes");
    }

    const { page, limit, isActive, ownerId } = req.validatedQuery as {
      page?: number;
      limit?: number;
      isActive?: boolean;
      ownerId?: string;
    };

    const result = await ReferralService.getReferralCodesService({
      page: page || 1,
      limit: limit || 10,
      isActive,
      ownerId,
    });

    res.status(200).json({
      success: true,
      message: "Referral codes retrieved successfully.",
      data: result.referralCodes,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
};

export const getReferralCodeByIdController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Pastikan pengguna adalah admin
    if (!req.user!.roles.includes("admin")) {
      throw new Error(
        "Unauthorized: Only admins can view referral code details",
      );
    }

    const { id } = req.validatedParams as { id: string };

    const referralCode = await ReferralService.getReferralCodeByIdService(id);

    if (!referralCode) {
      throw new Error("Referral code not found");
    }

    res.status(200).json({
      success: true,
      message: "Referral code retrieved successfully.",
      data: referralCode,
    });
  } catch (err) {
    next(err);
  }
};

export const updateReferralCodeController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const adminId = req.user.userId;
    const rolesLog = req.user?.roles || [];

    if (!req.user!.roles.includes("admin")) {
      throw new Error("Unauthorized: Only admins can update referral codes");
    }

    const { id } = req.validatedParams as { id: string };
    const { expiryDate, isActive } = req.validatedBody as {
      expiryDate?: Date;
      isActive?: boolean;
      // HAPUS: discountPercentage, commissionPercentage
    };

    const referralCode = await ReferralService.updateReferralCodeService(id, {
      expiryDate,
      isActive,
    });

    if (!referralCode) {
      throw new Error("Referral code not found");
    }

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: req.user!.userId,
        action: "UPDATE_REFERRAL",
        type: "UPDATE",
        description: `Admin mengupdate referral code ID: ${id}`,
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: "Referral code updated successfully.",
      data: referralCode,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteReferralCodeController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const adminId = req.user.userId;
    const rolesLog = req.user?.roles || [];

    // Pastikan pengguna adalah admin
    if (!req.user!.roles.includes("admin")) {
      throw new Error("Unauthorized: Only admins can delete referral codes");
    }

    const { id } = req.validatedParams as { id: string };

    const deleted = await ReferralService.deleteReferralCodeService(id);

    if (!deleted) {
      throw new Error("Referral code not found");
    }

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: req.user!.userId,
        action: "DELETE_REFERRAL",
        type: "DELETE",
        description: `Admin menghapus referral code ID: ${id}`,
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: "Referral code deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

export const useReferralCodeController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      throw new Error("Unauthorized: User ID not found");
    }

    const { code, context } = req.validatedBody as {
      code: string;
      context:
        | "booking"
        | "practice_purchase"
        | "elearning_subscription"
        | "ayclpurchase";
    };

    const result = await ReferralService.useReferralCodeService({
      userId: req.user.userId,
      code,
      context,
    });

    res.status(201).json({
      success: true,
      message: "Referral code applied successfully.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const applyReferralToBookingController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      throw { status: 401, message: "Unauthorized" };
    }

    const bookingId = req.validatedParams?.id;
    const body = req.validatedBody as { code: string };

    if (!bookingId) {
      throw { status: 400, message: "Booking ID tidak valid." };
    }

    if (!body?.code) {
      throw { status: 400, message: "Kode referral wajib diisi." };
    }

    const result = await ReferralService.applyReferralToBookingService({
      userId: req.user.userId,
      bookingId,
      code: body.code,
    });

    res.status(200).json({
      success: true,
      message: "Referral berhasil diterapkan ke booking.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const applyReferralToELearningController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      throw { status: 401, message: "Unauthorized" };
    }

    const subscriptionId = req.validatedParams?.id;
    const body = req.validatedBody as { code: string };

    if (!subscriptionId) {
      throw { status: 400, message: "Subscription ID tidak valid." };
    }

    if (!body?.code) {
      throw { status: 400, message: "Kode referral wajib diisi." };
    }

    const result = await ReferralService.applyReferralToELearningService({
      userId: req.user.userId,
      subscriptionId,
      code: body.code,
    });

    res.status(200).json({
      success: true,
      message: "Referral berhasil diterapkan ke subscription.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const applyReferralToAyclBookingController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      throw { status: 401, message: "Unauthorized" };
    }

    const bookingId = req.validatedParams?.id;
    const body = req.validatedBody as { code: string };

    if (!bookingId) {
      throw { status: 400, message: "Booking ID tidak valid." };
    }

    if (!body?.code) {
      throw { status: 400, message: "Kode referral wajib diisi." };
    }

    const result = await ReferralService.applyReferralToAyclBookingService({
      userId: req.user.userId,
      bookingId,
      code: body.code,
    });

    res.status(200).json({
      success: true,
      message: "Referral berhasil diterapkan ke AYCL booking.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getReferralCommissionsController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.validatedQuery) {
      res
        .status(400)
        .json({ success: false, message: "Invalid query parameters." });
      return;
    }

    const {
      referralCodeId,
      productType,
      tier,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.validatedQuery;

    const commissions = await ReferralService.getReferralCommissions({
      referralCodeId,
      productType,
      tier,
      startDate,
      endDate,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      message: "Referral commissions retrieved successfully.",
      data: commissions,
    });
    return;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
    return;
  }
};

export const getAffiliatorReferralCodesController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    if (!req.validatedQuery) {
      res
        .status(400)
        .json({ success: false, message: "Invalid query parameters." });
      return;
    }

    const { isActive, page = 1, limit = 10 } = req.validatedQuery;
    const ownerId = req.user.userId;

    const referralCodes = await ReferralService.getAffiliatorReferralCodes({
      ownerId,
      isActive,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      message: "Referral codes retrieved successfully.",
      data: referralCodes,
    });
    return;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
    return;
  }
};

export const getReferralUsagesController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    if (!req.validatedParams || !req.validatedQuery) {
      res
        .status(400)
        .json({ success: false, message: "Invalid parameters or query." });
      return;
    }

    const { id } = req.validatedParams;
    const { context, page = 1, limit = 10 } = req.validatedQuery;
    const ownerId = req.user.userId;

    // Pengecekan eksplisit untuk memastikan id ada (meskipun validasi Zod sudah menjaminnya)
    if (!id) {
      res
        .status(400)
        .json({ success: false, message: "Referral code ID is required." });
      return;
    }

    const usages = await ReferralService.getReferralUsages({
      referralCodeId: id,
      ownerId,
      context,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      message: "Referral usages retrieved successfully.",
      data: usages,
    });
    return;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
    return;
  }
};

export const getReferralCommissionsByCodeController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    if (!req.validatedParams || !req.validatedQuery) {
      res
        .status(400)
        .json({ success: false, message: "Invalid parameters or query." });
      return;
    }

    const { id } = req.validatedParams;
    const { startDate, endDate, page = 1, limit = 10 } = req.validatedQuery;
    const ownerId = req.user.userId;

    if (!id) {
      res
        .status(400)
        .json({ success: false, message: "Referral code ID is required." });
      return;
    }

    const commissions = await ReferralService.getReferralCommissionsByCode({
      referralCodeId: id,
      ownerId,
      startDate,
      endDate,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      message: "Referral commissions retrieved successfully.",
      data: commissions,
    });
    return;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
    return;
  }
};

export const requestCommissionPaymentController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    if (!req.validatedBody) {
      res
        .status(400)
        .json({ success: false, message: "Invalid request body." });
      return;
    }

    // Type assertion untuk memastikan validatedBody memiliki referralCodeId dan amount
    const { referralCodeId, amount, withdrawalMethodId } =
      req.validatedBody as {
        referralCodeId: string;
        amount: number;
        withdrawalMethodId: string;
      };
    const ownerId = req.user.userId;

    const paymentRequest = await ReferralService.requestCommissionPayment({
      referralCodeId,
      ownerId,
      amount,
      withdrawalMethodId,
    });

    res.status(201).json({
      success: true,
      message: "Commission payment request submitted successfully.",
      data: paymentRequest,
    });
    return;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
    return;
  }
};

export const getCommissionPaymentsController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    // FIX: baca dari req.validatedQuery, bukan req.query langsung
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
    } = req.validatedQuery ?? {};

    const payments = await ReferralService.getCommissionPayments({
      ownerId: req.user.userId,
      page: page ?? 1,
      limit: limit ?? 10,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    res.status(200).json({
      success: true,
      message: "Commission payments retrieved successfully.",
      data: payments,
    });
    return;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
    return;
  }
};

export const getAllCommissionPaymentsController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    // FIX: baca dari req.validatedQuery, bukan req.query langsung
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      referralCodeId,
      ownerId,
    } = req.validatedQuery ?? {};

    const payments = await ReferralService.getAllCommissionPayments({
      page: page ?? 1,
      limit: limit ?? 10,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      referralCodeId,
      ownerId,
    });

    res.status(200).json({
      success: true,
      message: "All commission payments retrieved successfully.",
      data: payments,
    });
    return;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
    return;
  }
};

export const updateCommissionPaymentStatusController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const adminId = req.user.userId;
    const rolesLog = req.user?.roles || [];

    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    if (!req.validatedBody) {
      res
        .status(400)
        .json({ success: false, message: "Invalid request body." });
      return;
    }

    const { id } = req.params;
    const { status, notes, transactionId } = req.validatedBody as {
      status: "pending" | "paid" | "failed";
      notes?: string;
      transactionId?: string;
    };

    const updatedPayment = await ReferralService.updateCommissionPaymentStatus({
      paymentId: id,
      status,
      notes,
      transactionId,
      adminId: req.user.userId,
    });

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: req.user.userId,
        action: "UPDATE_COMMISSION_PAYMENT",
        type: "UPDATE",
        description: `Admin mengubah status payment komisi ID: ${id} menjadi ${status}`,
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: "Commission payment status updated successfully.",
      data: updatedPayment,
    });
    return;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
    return;
  }
};

export const exportCommissionPaymentsController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const adminId = req.user.userId;
    const rolesLog = req.user?.roles || [];

    const format = req.query.format as "csv" | "excel";

    const buffer = await ReferralService.exportCommissionPayments({ format });

    const timestamp = formatDate(new Date(), "yyyyMMdd-HHmmss");
    const filename = `commission-payments-${timestamp}.${
      format === "csv" ? "csv" : "xlsx"
    }`;

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: adminId,
        action: "EXPORT_COMMISSION_PAYMENTS",
        type: "EXPORT",
        description: `Admin export data commission payments dalam format: ${format}`,
        req,
      });
    }

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader(
      "Content-Type",
      format === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.send(buffer);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
  }
};

// ============================================================
// GET /affiliator/profile
// ============================================================

export const getAffiliatorProfileController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const profile = await ReferralService.getAffiliatorProfileService(
      req.user.userId,
    );

    res.status(200).json({
      success: true,
      message: "Affiliator profile retrieved successfully.",
      data: profile,
    });
    return;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
    return;
  }
};

// ============================================================
// Admin: GET /admin/product-configs
// ============================================================

export const getProductConfigsController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const { productType, tier, isActive } =
      (req.validatedQuery as {
        productType?: string;
        tier?: string;
        isActive?: boolean;
      }) ?? {};

    const configs = await ReferralService.getProductConfigsService({
      productType,
      tier,
      isActive,
    });

    res.status(200).json({
      success: true,
      message: "Product configs retrieved successfully.",
      data: configs,
    });
    return;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
    return;
  }
};

// ============================================================
// Admin: PATCH /admin/product-configs/:id
// ============================================================

export const updateProductConfigController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const adminId = req.user.userId;
    const rolesLog = req.user?.roles || [];

    if (!req.validatedParams?.id) {
      res
        .status(400)
        .json({ success: false, message: "Config ID tidak valid." });
      return;
    }

    if (!req.validatedBody) {
      res
        .status(400)
        .json({ success: false, message: "Request body tidak valid." });
      return;
    }

    const { id } = req.validatedParams;
    const updateData = req.validatedBody as {
      commissionAmount?: number;
      discountAmount?: number;
      commissionPercent?: number;
      discountPercent?: number;
      pointsAwarded?: number;
      isActive?: boolean;
    };

    const updated = await ReferralService.updateProductConfigService(
      id,
      updateData,
    );

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: adminId,
        action: "UPDATE_PRODUCT_CONFIG",
        type: "UPDATE",
        description: `Admin mengubah product config ID: ${id}`,
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: "Product config updated successfully.",
      data: updated,
    });
    return;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
    return;
  }
};

// ============================================================
// Admin: GET /admin/affiliator-profiles
// ============================================================

export const getAdminAffiliatorProfilesController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const {
      page = 1,
      limit = 10,
      tier,
      isActive,
      search,
    } = (req.validatedQuery as {
      page?: number;
      limit?: number;
      tier?: string;
      isActive?: boolean;
      search?: string;
    }) ?? {};

    const result = await ReferralService.getAdminAffiliatorProfilesService({
      page,
      limit,
      tier,
      isActive,
      search,
    });

    res.status(200).json({
      success: true,
      message: "Affiliator profiles retrieved successfully.",
      data: result,
    });
    return;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
    return;
  }
};

// ============================================================
// Admin: GET /admin/seasons
// ============================================================

export const getAdminSeasonsController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const { isActive } = (req.validatedQuery as { isActive?: boolean }) ?? {};

    const result = await ReferralService.getAdminSeasonsService({ isActive });

    res.status(200).json({
      success: true,
      message: "Seasons retrieved successfully.",
      data: result,
    });
    return;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
    return;
  }
};
