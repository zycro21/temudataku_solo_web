// controllers/elearning_purchase.controller.ts
import { Response, NextFunction } from "express";
import {
  createELearningPurchase,
  getMyPurchases,
  getPurchaseDetail,
  cancelPurchase,
  getAllPurchases,
} from "../services/elearning_purchase.service.js";
import { AuthenticatedRequestELearningPurchase } from "../middlewares/authenticate.js";

export const createPurchaseController = async (
  req: AuthenticatedRequestELearningPurchase,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const courseId = req.validatedParams?.id;
    const referralUsageId = req.validatedBody?.referralUsageId;

    const result = await createELearningPurchase({
      userId,
      courseId,
      referralUsageId,
    });

    res.status(201).json({
      success: true,
      message: "Purchase berhasil dibuat",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyPurchasesController = async (
  req: AuthenticatedRequestELearningPurchase,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const q = req.validatedQuery || {};
    const page = q.page ? parseInt(q.page, 10) : 1;
    const limit = q.limit ? parseInt(q.limit, 10) : 10;
    const search = q.search;
    const status = q.status;

    const result = await getMyPurchases({
      userId,
      page,
      limit,
      search,
      status,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getPurchaseDetailController = async (
  req: AuthenticatedRequestELearningPurchase,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;
    const purchaseId = req.validatedParams?.id;
    const result = await getPurchaseDetail(purchaseId, user);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const cancelPurchaseController = async (
  req: AuthenticatedRequestELearningPurchase,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const purchaseId = req.validatedParams?.id;

    const result = await cancelPurchase(purchaseId, userId);

    res.json({
      success: true,
      message: "Pembelian berhasil dibatalkan",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllPurchasesController = async (
  req: AuthenticatedRequestELearningPurchase,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;
    const q = req.validatedQuery || {};
    const page = q.page ? parseInt(q.page, 10) : 1;
    const limit = q.limit ? parseInt(q.limit, 10) : 20;
    const search = q.search;
    const status = q.status;
    const sortBy = q.sortBy;
    const sortOrder = q.sortOrder || "desc";

    const result = await getAllPurchases({
      user,
      page,
      limit,
      search,
      status,
      sortBy,
      sortOrder,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
