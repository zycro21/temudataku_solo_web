import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestPayment } from "../middlewares/authenticate.js";
import { format } from "date-fns";
import { HttpError } from "../utils/httpError";
import * as PaymentService from "../services/payment.service.js";
import { PrismaClient, Prisma } from "@prisma/client";
import path from "path";
import fs from "fs";
import { logActivity } from "../utils/logActivtiy.js";

const prisma = new PrismaClient();

export const createPayment = async (
  req: AuthenticatedRequestPayment,
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

    const { referenceId, paymentMethod } = req.body;

    const userEmail = req.user?.email || "test@example.com";
    const userPhone = req.user?.phoneNumber || "08123456789";
    const customerVaName = req.user?.fullName || req.user?.email || "Customer";

    const result = await PaymentService.createDuitkuPayment({
      referenceId,
      paymentMethod,
      email: userEmail,
      phoneNumber: userPhone,
      customerVaName,
    });

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: req.user!.userId,
        action: "CREATE_PAYMENT",
        type: "CREATE",
        description: `Admin created a payment manually. RefID: ${referenceId}, Method: ${paymentMethod}`,
        req,
      });
    }

    res.status(201).json({
      success: true,
      message: "Payment created successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to create payment.",
    });
  }
};

export const getPaymentStatus = async (
  req: AuthenticatedRequestPayment,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { merchantOrderId } = req.params;

    const result = await PaymentService.getPaymentStatus(
      merchantOrderId,
      req.user!.userId,
    );

    res.status(200).json({
      success: true,
      message: "Payment status retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to retrieve payment status.",
    });
  }
};

export const handleCallback = async (
  req: AuthenticatedRequestPayment,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("🔥 CALLBACK MASUK DARI DUITKU");
    console.log("Callback received from Duitku:", req.body);

    if (!req.body?.signature) {
      res.status(400).send("Missing signature");
      return;
    }

    await PaymentService.processDuitkuCallback(req.body);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Callback error:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const getAllPayments = async (
  req: AuthenticatedRequestPayment,
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

    const { page, limit, status } = req.validatedQuery;

    const result = await PaymentService.getPayments({
      page,
      limit,
      status,
    });

    res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDetailIdPayments = async (
  req: AuthenticatedRequestPayment,
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

    const { id } = req.params;

    const paymentDetail = await PaymentService.getPaymentDetailById(id);

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: req.user!.userId,
        action: "GET_PAYMENT_DETAIL",
        type: "READ",
        description: `Admin viewed payment detail. PaymentID: ${id}`,
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment detail retrieved successfully.",
      data: paymentDetail,
    });
  } catch (error) {
    next(error);
  }
};

export const exportPayments = async (
  req: AuthenticatedRequestPayment,
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

    const { format: exportFormat, status } = req.query as {
      format: "csv" | "excel";
      status?: string;
    };

    const fileBuffer = await PaymentService.exportPaymentsToFile(
      exportFormat,
      status,
    );

    const fileName = `payments_${format(new Date(), "yyyyMMdd_HHmmss")}.${
      exportFormat === "excel" ? "xlsx" : "csv"
    }`;

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: req.user!.userId,
        action: "EXPORT_PAYMENTS",
        type: "EXPORT",
        description: `Admin exported payments to ${exportFormat} (status filter: ${
          status || "none"
        })`,
        req,
      });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader(
      "Content-Type",
      exportFormat === "excel"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "text/csv",
    );

    res.send(fileBuffer);
  } catch (error) {
    next(error);
  }
};

export const getMyPayments = async (
  req: AuthenticatedRequestPayment,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found.",
      });
      return;
    }
    const { page, limit, status } = req.validatedQuery;

    const result = await PaymentService.getPaymentsByUser({
      userId,
      page,
      limit,
      status,
    });

    res.status(200).json({
      success: true,
      message: "User payments fetched successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (
  req: AuthenticatedRequestPayment,
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

    const { id } = req.validatedParams;
    const { status } = req.validatedBody;

    const updated = await PaymentService.updatePaymentStatus({ id, status });

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: req.user!.userId,
        action: "UPDATE_PAYMENT_STATUS",
        type: "UPDATE",
        description: `Admin updated payment status. PaymentID: ${id}, NewStatus: ${status}`,
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: updated,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getMyPaymentDetail = async (
  req: AuthenticatedRequestPayment,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.validatedParams;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found.",
      });
      return;
    }

    const payment = await PaymentService.getUserPaymentDetail({ id, userId });

    res.status(200).json({
      success: true,
      message: "Payment detail fetched successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};
