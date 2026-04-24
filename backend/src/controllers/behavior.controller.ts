import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestBehavior } from "../middlewares/authenticate.js";
import { format } from "date-fns";
import * as BehaviorService from "../services/behavior.service.js";
import { PrismaClient, Prisma } from "@prisma/client";
import path from "path";
import fs from "fs";
import { logActivity } from "../utils/logActivtiy.js";

const prisma = new PrismaClient();

export const createUserBehaviorController = async (
  req: AuthenticatedRequestBehavior,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pageVisited, action } = req.validatedBody as {
      pageVisited: string;
      action: string;
    };
    const ipAddress =
      req.ip || req.headers["x-forwarded-for"]?.toString() || "";
    const userAgent = req.headers["user-agent"] || "";

    const behavior = await BehaviorService.createUserBehaviorService({
      userId: req.user!.userId,
      pageVisited,
      action,
      ipAddress,
      userAgent,
    });

    res.status(201).json({
      success: true,
      message: "User behavior recorded successfully.",
      data: behavior,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllAdminUserBehaviorsController = async (
  req: AuthenticatedRequestBehavior,
  res: Response,
  next: NextFunction
) => {
  try {
    // Pastikan pengguna adalah admin
    if (!req.user!.roles.includes("admin")) {
      throw new Error("Unauthorized: Only admins can view user behaviors");
    }

    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const adminId = req.user.userId;

    const { page, limit, userId, pageVisited, action, startDate, endDate } =
      req.validatedQuery as {
        page: number;
        limit: number;
        userId?: string;
        pageVisited?: string;
        action?: string;
        startDate?: Date;
        endDate?: Date;
      };

    const result = await BehaviorService.getAllAdminUserBehaviorsService({
      page,
      limit,
      userId,
      pageVisited,
      action,
      startDate,
      endDate,
    });

    await logActivity({
      userId: adminId,
      action: "ADMIN_VIEW_USER_BEHAVIORS",
      type: "READ",
      description: "Admin melihat daftar user behaviors",
      req,
    });

    res.status(200).json({
      success: true,
      message: "User behaviors retrieved successfully.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserBehaviorByIdController = async (
  req: AuthenticatedRequestBehavior,
  res: Response,
  next: NextFunction
) => {
  try {
    // Pastikan pengguna adalah admin (redundan dengan authorizeRoles, untuk konsistensi)
    if (!req.user!.roles.includes("admin")) {
      throw new Error(
        "Unauthorized: Only admins can view user behavior details"
      );
    }

    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const adminId = req.user.userId;

    const { id } = req.validatedParams as { id: string };

    const behavior = await BehaviorService.getUserBehaviorByIdService(id);

    if (!behavior) {
      throw new Error("User behavior not found");
    }

    await logActivity({
      userId: adminId,
      action: "ADMIN_VIEW_USER_BEHAVIOR_DETAIL",
      type: "READ",
      description: `Admin melihat detail user behavior ${id}`,
      req,
    });

    res.status(200).json({
      success: true,
      message: "User behavior retrieved successfully.",
      data: behavior,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUserBehaviorByIdController = async (
  req: AuthenticatedRequestBehavior,
  res: Response,
  next: NextFunction
) => {
  try {
    // Pastikan pengguna adalah admin (redundan dengan authorizeRoles, untuk konsistensi)
    if (!req.user!.roles.includes("admin")) {
      throw new Error("Unauthorized: Only admins can delete user behavior");
    }

    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const adminId = req.user.userId;

    const { id } = req.validatedParams as { id: string };

    const deletedBehavior = await BehaviorService.deleteUserBehaviorByIdService(
      id
    );

    if (!deletedBehavior) {
      throw new Error("User behavior not found");
    }

    // 📝 Log aktivitas admin
    await logActivity({
      userId: adminId,
      action: "ADMIN_DELETE_USER_BEHAVIOR",
      type: "DELETE",
      description: `Admin menghapus user behavior ${id}`,
      req,
    });

    res.status(200).json({
      success: true,
      message: "User behavior deleted successfully.",
      data: deletedBehavior,
    });
  } catch (err) {
    next(err);
  }
};

export const exportUserBehaviorsController = async (
  req: AuthenticatedRequestBehavior,
  res: Response,
  next: NextFunction
) => {
  try {
    // Pastikan pengguna adalah admin
    if (!req.user!.roles.includes("admin")) {
      throw new Error("Unauthorized: Only admins can export user behaviors");
    }

    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const adminId = req.user.userId;

    const { format, userId, pageVisited, action, startDate, endDate } =
      req.validatedQuery as {
        format: "csv" | "excel";
        userId?: string;
        pageVisited?: string;
        action?: string;
        startDate?: Date;
        endDate?: Date;
      };

    const { fileBuffer, fileName, MIMEType } =
      await BehaviorService.exportUserBehaviorsService({
        format,
        userId,
        pageVisited,
        action,
        startDate,
        endDate,
      });

    await logActivity({
      userId: adminId,
      action: "ADMIN_EXPORT_USER_BEHAVIORS",
      type: "EXPORT",
      description: `Admin export data user behaviors dalam format ${format}`,
      req,
    });

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", MIMEType);
    res.send(fileBuffer);
  } catch (err) {
    next(err);
  }
};
