import { Response, NextFunction } from "express";
import { AuthenticatedRequestLog } from "../middlewares/authenticate.js";
import * as LoginHistoryService from "../services/loginHistory.service.js";

export const getLoginHistory = async (
  req: AuthenticatedRequestLog,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = req.validatedQuery ?? req.query;
    const result = await LoginHistoryService.getLoginHistory(query);

    res.status(200).json({
      success: true,
      message: "Login history retrieved successfully",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getLoginHistorySummary = async (
  req: AuthenticatedRequestLog,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = req.validatedQuery ?? req.query;
    const result = await LoginHistoryService.getLoginHistorySummary(query);

    res.status(200).json({
      success: true,
      message: "Login history summary retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyLoginHistory = async (
  req: AuthenticatedRequestLog,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { page, limit } = req.validatedQuery ?? req.query;
    const result = await LoginHistoryService.getMyLoginHistory({
      userId,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      message: "Your login history retrieved successfully",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getPurchases = async (
  req: AuthenticatedRequestLog,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = req.validatedQuery ?? req.query;
    const result = await LoginHistoryService.getPurchases(query);

    res.status(200).json({
      success: true,
      message: "Purchases retrieved successfully",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getFormResponses = async (
  req: AuthenticatedRequestLog,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = req.validatedQuery ?? req.query;
    const result = await LoginHistoryService.getFormResponses(query);

    res.status(200).json({
      success: true,
      message: "Form responses retrieved successfully",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};
