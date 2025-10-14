import { Request, Response, NextFunction } from "express";
import * as UserActivityService from "../services/userActivityLog.service.js";
import { AuthenticatedRequestLog } from "../middlewares/authenticate.js";

export const createUserActivity = async (
  req: AuthenticatedRequestLog,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { page, durationSec } = req.validatedBody;

    const activity = await UserActivityService.createUserActivityService({
      userId,
      page,
      durationSec,
    });

    res.status(201).json({
      success: true,
      message: "User activity log created successfully",
      data: activity,
    });
  } catch (err) {
    console.error("Error creating user activity log:", err);
    next(err);
  }
};

export const getUserActivities = async (
  req: AuthenticatedRequestLog,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { page, limit, search, sortBy, sortOrder } = req.validatedQuery;

    const result = await UserActivityService.getUserActivitiesService({
      userId,
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching user activities:", err);
    next(err);
  }
};

export const getUserActivityById = async (
  req: AuthenticatedRequestLog,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;

    const log = await UserActivityService.getUserActivityByIdService(id);

    res.status(200).json({
      success: true,
      message: "User activity log retrieved successfully",
      data: log,
    });
  } catch (err: any) {
    if (err.statusCode === 404) {
      res.status(404).json({
        success: false,
        message: err.message || "Activity log not found",
      });
      return;
    }
    next(err);
  }
};

export const updateUserActivity = async (
  req: AuthenticatedRequestLog,
  res: Response,
  next: NextFunction
) => {
  try {
    const actor = req.user;
    if (!actor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.validatedParams as { id: string };
    const data = req.validatedBody as Partial<{
      page: string;
      durationSec: number;
    }>;

    // Ambil log dulu untuk cek ownership
    const existing = await UserActivityService.getUserActivityByIdService(id);

    // Hanya pemilik atau admin yang boleh update
    const isOwner = existing.userId === actor.userId;
    const isAdmin = actor.roles?.includes?.("admin");
    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You can only update your own activity logs",
      });
      return;
    }

    const updated = await UserActivityService.updateUserActivityService(
      id,
      data
    );

    res.status(200).json({
      success: true,
      message: "User activity log updated successfully",
      data: updated,
    });
    return;
  } catch (err: any) {
    if (err.statusCode === 404) {
      res
        .status(404)
        .json({ success: false, message: err.message || "Not found" });
      return;
    }
    next(err);
  }
};

export const deleteUserActivity = async (
  req: AuthenticatedRequestLog,
  res: Response,
  next: NextFunction
) => {
  try {
    const actor = req.user;
    if (!actor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.validatedParams as { id: string };
    const result = await UserActivityService.deleteUserActivityService(
      id,
      actor
    );

    res.status(200).json({
      success: true,
      message: result.message,
      deletedLog: result.deletedLog,
    });
    return;
  } catch (err: any) {
    if (err.statusCode === 403) {
      res.status(403).json({ success: false, message: err.message });
      return;
    }
    if (err.statusCode === 404) {
      res.status(404).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};

export const getAllUserActivities = async (
  req: AuthenticatedRequestLog,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, sortBy, sortOrder } = req.validatedQuery;

    const result = await UserActivityService.getAllUserActivitiesService({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      message: "All user activity logs retrieved successfully",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getRecentUserActivities = async (
  req: AuthenticatedRequestLog,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { limit } = req.validatedQuery;

    const result = await UserActivityService.getRecentUserActivitiesService({
      userId,
      limit,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching recent user activities:", err);
    next(err);
  }
};
