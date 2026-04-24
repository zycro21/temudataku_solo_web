import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestELearningSubscriptionPlan } from "../middlewares/authenticate.js";
import { format } from "date-fns";
// import { HttpError } from "../utils/httpError";
import * as ElearningSubscriptionPlanService from "../services/elearning_subscription_plan.service.js";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { logActivity } from "../utils/logActivtiy.js";

export const createSubscriptionPlan = async (
  req: AuthenticatedRequestELearningSubscriptionPlan,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.validatedBody;

    const result =
      await ElearningSubscriptionPlanService.createSubscriptionPlan(payload);

    res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getSubscriptionPlans = async (
  req: AuthenticatedRequestELearningSubscriptionPlan,
  res: Response,
  next: NextFunction
) => {
  try {
    const q = req.validatedQuery || {};

    const result = await ElearningSubscriptionPlanService.getSubscriptionPlans({
      page: q.page,
      limit: q.limit,
      sortBy: q.sortBy,
      sortOrder: q.sortOrder,
      isActive: q.isActive,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSubscriptionPlan = async (
  req: AuthenticatedRequestELearningSubscriptionPlan,
  res: Response,
  next: NextFunction
) => {
  try {
    const planId = req.validatedParams.id;
    const payload = req.validatedBody;

    const result =
      await ElearningSubscriptionPlanService.updateSubscriptionPlan(
        planId,
        payload
      );

    res.json({
      success: true,
      message: "Subscription plan updated successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSubscriptionPlanStatus = async (
  req: AuthenticatedRequestELearningSubscriptionPlan,
  res: Response,
  next: NextFunction
) => {
  try {
    const planId = req.validatedParams.id;
    const { isActive } = req.validatedBody;

    const result =
      await ElearningSubscriptionPlanService.updateSubscriptionPlanStatus(
        planId,
        isActive
      );

    res.json({
      success: true,
      message: `Subscription plan ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllSubscriptionPlans = async (
  req: AuthenticatedRequestELearningSubscriptionPlan,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.validatedQuery;

    const result =
      await ElearningSubscriptionPlanService.getAllSubscriptionPlans(query);

    res.status(200).json({
      success: true,
      message: "Subscription plans fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

export const getSubscriptionPlanDetail = async (
  req: AuthenticatedRequestELearningSubscriptionPlan,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;

    const result =
      await ElearningSubscriptionPlanService.getSubscriptionPlanDetail(id);

    res.status(200).json({
      success: true,
      message: "Subscription plan detail fetched successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getSubscriptionPlanDetailAdmin = async (
  req: AuthenticatedRequestELearningSubscriptionPlan,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;

    const result =
      await ElearningSubscriptionPlanService.getSubscriptionPlanDetailAdmin(id);

    res.status(200).json({
      success: true,
      message: "Subscription plan detail fetched successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteSubscriptionPlan = async (
  req: AuthenticatedRequestELearningSubscriptionPlan,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;

    const result =
      await ElearningSubscriptionPlanService.deleteSubscriptionPlan(id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

export const exportSubscriptionPlans = async (
  req: AuthenticatedRequestELearningSubscriptionPlan,
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
      await ElearningSubscriptionPlanService.exportSubscriptionPlansToFile(
        format
      );

    // Optional: activity log
    await logActivity({
      userId: req.user.userId,
      action: "ADMIN_EXPORT_ELEARNING_SUBSCRIPTION_PLANS",
      type: "EXPORT",
      description: `Admin mengekspor subscription plan dalam format ${format}`,
      req,
    });

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", mimeType);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

