import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestFeedback } from "../middlewares/authenticate";
import { format } from "date-fns";
import { HttpError } from "../utils/httpError";
import * as FeedbackService from "../services/feedback.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createFeedbackController = async (
  req: AuthenticatedRequestFeedback,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { sessionId, rating, comment, isAnonymous } = req.validatedBody;

    // Panggil service untuk membuat feedback
    const feedback = await FeedbackService.createFeedback({
      userId,
      sessionId,
      rating,
      comment,
      isAnonymous,
    });

    // Berikan response sukses
    res.status(201).json({
      message: "Feedback berhasil dikirim.",
      data: feedback,
    });
  } catch (error) {
    // Serahkan error ke error handler
    next(error);
  }
};

export const updateFeedbackController = async (
  req: AuthenticatedRequestFeedback,
  res: Response,
  next: NextFunction
) => {
  try {
    const feedbackId = req.validatedParams.id;
    const userId = req.user!.userId;
    const { comment } = req.validatedBody;

    const updatedFeedback = await FeedbackService.updateFeedback({
      feedbackId,
      userId,
      comment,
    });

    res.status(200).json({
      message: "Feedback berhasil diperbarui.",
      data: updatedFeedback,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFeedbackController = async (
  req: AuthenticatedRequestFeedback,
  res: Response,
  next: NextFunction
) => {
  try {
    const feedbackId = req.validatedParams.id;
    const userId = req.user!.userId;
    const isAdmin = req.user!.roles.includes("admin");

    await FeedbackService.deleteFeedback({
      feedbackId,
      userId,
      isAdmin,
    });

    res.status(200).json({
      message: isAdmin
        ? "Feedback berhasil dihapus permanen oleh admin."
        : "Feedback berhasil dihapus (tidak terlihat di publik).",
    });
  } catch (error) {
    next(error);
  }
};

export const getMyFeedbacksController = async (
  req: AuthenticatedRequestFeedback,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate req.user existence
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        message: "Unauthorized: User not authenticated",
      });
      return;
    }

    const userId = req.user.userId;
    const query = req.validatedQuery;

    const result = await FeedbackService.getMyFeedbacks({ userId, query });

    res.status(200).json({
      message: "Berhasil mengambil feedback",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicFeedbacksByServiceId = async (
  req: AuthenticatedRequestFeedback,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: serviceId } = req.validatedParams;
    const { sortBy, sortOrder, limit } = req.validatedQuery;

    const result = await FeedbackService.getPublicFeedbacksByService({
      serviceId,
      sortBy,
      sortOrder,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    res.status(200).json({
      message: "Berhasil mengambil feedback publik berdasarkan service",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMentorFeedbacks = async (
  req: AuthenticatedRequestFeedback,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rating, sessionId, sortBy, sortOrder, limit } = req.validatedQuery;
    const mentorProfileId = req.user?.mentorProfileId;

    if (!mentorProfileId) {
      res.status(403).json({ message: "Mentor profile tidak ditemukan" });
      return;
    }

    const result = await FeedbackService.getMentorFeedbacks({
      mentorProfileId,
      rating,
      sessionId,
      sortBy,
      sortOrder,
      limit,
    });

    if (result.length === 0) {
      res.status(200).json({
        message: "Belum ada feedback yang diterima dari sesi yang Anda ajar",
        data: [],
      });
      return;
    }

    res.status(200).json({
      message: "Berhasil mengambil feedback untuk mentor",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFeedbacksForAdmin = async (
  req: AuthenticatedRequestFeedback,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      sessionId,
      userId,
      isVisible,
      minRating,
      maxRating,
      search,
      sortBy,
      sortOrder,
      limit = 10,
      page = 1,
    } = req.validatedQuery;

    const result = await FeedbackService.getAllFeedbacksForAdmin({
      sessionId,
      userId,
      isVisible,
      minRating,
      maxRating,
      search,
      sortBy,
      sortOrder,
      limit,
      page,
    });

    res.status(200).json({
      message: "Berhasil mengambil semua feedback",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFeedbackVisibility = async (
  req: AuthenticatedRequestFeedback,
  res: Response,
  next: NextFunction
) => {
  try {
    const feedbackId = req.validatedParams.id;
    const { isVisible } = req.validatedBody;

    const result = await FeedbackService.updateFeedbackVisibility(
      feedbackId,
      isVisible
    );

    const responseData: any = {
      id: result.id,
      isVisible: result.isVisible,
      message: result.message,
    };

    if (result.updated && "updatedAt" in result) {
      responseData.updatedAt = result.updatedAt;
    }

    res.status(200).json({
      message: result.message,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

export const exportFeedbacks = async (
  req: AuthenticatedRequestFeedback,
  res: Response,
  next: NextFunction
) => {
  try {
    const format = req.validatedQuery?.format === "excel" ? "excel" : "csv";

    const { buffer, fileName, mimeType } =
      await FeedbackService.exportFeedbacksToFile(format);

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", mimeType);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

export const getFeedbackStatistics = async (
  req: AuthenticatedRequestFeedback,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.validatedQuery;

    const statistics = await FeedbackService.getFeedbackStatistics({
      startDate,
      endDate,
    });

    res.json({
      success: true,
      data: statistics,
    });
    return;
  } catch (err) {
    next(err);
  }
};
