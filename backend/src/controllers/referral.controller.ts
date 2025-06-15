import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestReferralCode } from "../middlewares/authenticate";
import { format } from "date-fns";
import { HttpError } from "../utils/httpError";
import * as ReferralService from "../services/referral.service";
import { PrismaClient, Prisma } from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export const createReferralCodeController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction
) => {
  try {
    // Pastikan pengguna adalah admin
    if (!req.user!.roles.includes("admin")) {
      throw new Error("Unauthorized: Only admins can create referral codes");
    }

    const {
      ownerId,
      code,
      discountPercentage,
      commissionPercentage,
      expiryDate,
      isActive,
    } = req.validatedBody as {
      ownerId: string;
      code: string;
      discountPercentage: number;
      commissionPercentage: number;
      expiryDate?: Date;
      isActive?: boolean;
    };

    const referralCode = await ReferralService.createReferralCodeService({
      ownerId,
      code,
      discountPercentage,
      commissionPercentage,
      expiryDate,
      isActive,
    });

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
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    // Pastikan pengguna adalah admin
    if (!req.user!.roles.includes("admin")) {
      throw new Error(
        "Unauthorized: Only admins can view referral code details"
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
  next: NextFunction
) => {
  try {
    // Pastikan pengguna adalah admin
    if (!req.user!.roles.includes("admin")) {
      throw new Error("Unauthorized: Only admins can update referral codes");
    }

    const { id } = req.validatedParams as { id: string };
    const { expiryDate, isActive, discountPercentage, commissionPercentage } =
      req.validatedBody as {
        expiryDate?: Date;
        isActive?: boolean;
        discountPercentage?: number;
        commissionPercentage?: number;
      };

    const referralCode = await ReferralService.updateReferralCodeService(id, {
      expiryDate,
      isActive,
      discountPercentage,
      commissionPercentage,
    });

    if (!referralCode) {
      throw new Error("Referral code not found");
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
  next: NextFunction
) => {
  try {
    // Pastikan pengguna adalah admin
    if (!req.user!.roles.includes("admin")) {
      throw new Error("Unauthorized: Only admins can delete referral codes");
    }

    const { id } = req.validatedParams as { id: string };

    const deleted = await ReferralService.deleteReferralCodeService(id);

    if (!deleted) {
      throw new Error("Referral code not found");
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
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      throw new Error("Unauthorized: User ID not found");
    }

    const { code, context } = req.validatedBody as {
      code: string;
      context: "booking" | "practice_purchase";
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

export const getReferralCommissionsController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction
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
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.validatedQuery;

    const commissions = await ReferralService.getReferralCommissions({
      referralCodeId,
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
  next: NextFunction
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
  next: NextFunction
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
  next: NextFunction
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
  next: NextFunction
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
    const { referralCodeId, amount } = req.validatedBody as {
      referralCodeId: string;
      amount: number;
    };
    const ownerId = req.user.userId;

    const paymentRequest = await ReferralService.requestCommissionPayment({
      referralCodeId,
      ownerId,
      amount,
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
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const { page, limit, status, startDate, endDate } = req.query as {
      page?: string;
      limit?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    };

    const payments = await ReferralService.getCommissionPayments({
      ownerId: req.user.userId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
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
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const { page, limit, status, startDate, endDate, referralCodeId, ownerId } =
      req.query as {
        page?: string;
        limit?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        referralCodeId?: string;
        ownerId?: string;
      };

    const payments = await ReferralService.getAllCommissionPayments({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
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
  next: NextFunction
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

import { format as formatDate, subDays } from "date-fns";

export const exportCommissionPaymentsController = async (
  req: AuthenticatedRequestReferralCode,
  res: Response,
  next: NextFunction
) => {
  try {
    const format = req.query.format as "csv" | "excel";

    const buffer = await ReferralService.exportCommissionPayments({ format });

    const timestamp = formatDate(new Date(), "yyyyMMdd-HHmmss");
    const filename = `commission-payments-${timestamp}.${
      format === "csv" ? "csv" : "xlsx"
    }`;

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader(
      "Content-Type",
      format === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
  }
};
