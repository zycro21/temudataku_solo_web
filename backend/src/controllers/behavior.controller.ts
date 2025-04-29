import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestBehavior } from "../middlewares/authenticate";
import { format } from "date-fns";
import { HttpError } from "../utils/httpError";
import * as BehaviorService from "../services/behavior.service";
import { PrismaClient, Prisma } from "@prisma/client";
import path from "path";
import fs from "fs";

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

    const { id } = req.validatedParams as { id: string };

    const behavior = await BehaviorService.getUserBehaviorByIdService(id);

    if (!behavior) {
      throw new Error("User behavior not found");
    }

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

    const { id } = req.validatedParams as { id: string };

    const deletedBehavior = await BehaviorService.deleteUserBehaviorByIdService(id);

    if (!deletedBehavior) {
      throw new Error("User behavior not found");
    }

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
  
      const { format, userId, pageVisited, action, startDate, endDate } = req.validatedQuery as {
        format: "csv" | "excel";
        userId?: string;
        pageVisited?: string;
        action?: string;
        startDate?: Date;
        endDate?: Date;
      };
  
      const { fileBuffer, fileName, MIMEType } = await BehaviorService.exportUserBehaviorsService({
        format,
        userId,
        pageVisited,
        action,
        startDate,
        endDate,
      });
  
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      res.setHeader("Content-Type", MIMEType);
      res.send(fileBuffer);
    } catch (err) {
      next(err);
    }
  };