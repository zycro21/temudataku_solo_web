import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestELearningSubscription } from "../middlewares/authenticate.js";
import { format } from "date-fns";
// import { HttpError } from "../utils/httpError";
import * as ElearningSubscriptionService from "../services/elearning_subscription.service.js";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { logActivity } from "../utils/logActivtiy.js";

export const createSubscription = async (
  req: AuthenticatedRequestELearningSubscription,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const { planId, referralUsageId } = req.validatedBody;

    const result = await ElearningSubscriptionService.createSubscription({
      userId,
      planId,
      referralUsageId,
    });

    res.status(201).json({
      success: true,
      message: "E-Learning subscription created successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyActiveSubscription = async (
  req: AuthenticatedRequestELearningSubscription,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;

    const result = await ElearningSubscriptionService.getMyActiveSubscription(
      userId
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getMySubscriptionHistory = async (
  req: AuthenticatedRequestELearningSubscription,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const { page, limit, status } = req.validatedQuery;

    const result = await ElearningSubscriptionService.getMySubscriptionHistory({
      userId,
      page,
      limit,
      status,
    });

    res.status(200).json({
      success: true,
      message: "Subscription history fetched successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const cancelSubscription = async (
  req: AuthenticatedRequestELearningSubscription,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const subscriptionId = req.validatedParams.id;

    const result = await ElearningSubscriptionService.cancelSubscription({
      userId,
      subscriptionId,
    });

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllSubscriptions = async (
  req: AuthenticatedRequestELearningSubscription,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.validatedQuery;

    const result = await ElearningSubscriptionService.getAllSubscriptions(
      query
    );

    res.status(200).json({
      success: true,
      message: "E-Learning subscriptions retrieved successfully",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getSubscriptionDetail = async (
  req: AuthenticatedRequestELearningSubscription,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await ElearningSubscriptionService.getSubscriptionDetail(id);

    res.status(200).json({
      success: true,
      message: "Subscription detail retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (
  req: AuthenticatedRequestELearningSubscription,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.validatedBody;

    const result =
      await ElearningSubscriptionService.updateSubscriptionStatus({
        subscriptionId: id,
        newStatus: status,
        reason,
      });

    res.status(200).json({
      success: true,
      message: "Subscription status updated successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const exportSubscriptions = async (
  req: AuthenticatedRequestELearningSubscription,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const format = req.validatedQuery?.format === "excel" ? "excel" : "csv";

    const { buffer, fileName, mimeType } =
      await ElearningSubscriptionService.exportSubscriptionsToFile(format);

    // optional activity log
    await logActivity({
      userId: req.user.userId,
      action: "ADMIN_EXPORT_ELEARNING_SUBSCRIPTIONS",
      type: "EXPORT",
      description: `Admin mengekspor subscription e-learning (${format})`,
      req,
    });

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", mimeType);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

export const deleteSubscription = async (
  req: AuthenticatedRequestELearningSubscription,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.validatedParams;

    const result =
      await ElearningSubscriptionService.deleteSubscriptionByAdmin(id);

    // optional activity log
    await logActivity({
      userId: req.user.userId,
      action: "ADMIN_DELETE_ELEARNING_SUBSCRIPTION",
      type: "DELETE",
      description: `Admin menghapus subscription e-learning ${id}`,
      req,
    });

    res.status(200).json({
      success: true,
      message: "E-Learning subscription berhasil dihapus",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};