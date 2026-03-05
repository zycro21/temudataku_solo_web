import { Response, NextFunction } from "express";
import {
  createCourseReview,
  getCourseReviews,
  getMyReviews,
  deleteReview,
  updateReview,
  getReviewSummary,
   getAllReviewStats
} from "../services/elearning_review.service.js";
import { AuthenticatedRequestELearningReview } from "../middlewares/authenticate.js";

export const createReviewController = async (
  req: AuthenticatedRequestELearningReview,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const courseId = req.validatedParams.id;
    const { rating, comment } = req.validatedBody;

    const result = await createCourseReview({
      userId,
      courseId,
      rating,
      comment,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getCourseReviewsController = async (
  req: AuthenticatedRequestELearningReview,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = req.validatedParams.id;
    const q = req.validatedQuery || {};

    const result = await getCourseReviews({
      courseId,
      page: q.page,
      limit: q.limit,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getMyReviewsController = async (
  req: AuthenticatedRequestELearningReview,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const q = req.validatedQuery || {};

    const result = await getMyReviews({
      userId,
      roles,
      page: q.page,
      limit: q.limit,
      sort: q.sort,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const deleteReviewController = async (
  req: AuthenticatedRequestELearningReview,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviewId = req.validatedParams.id;
    const force = req.validatedQuery?.force;

    const result = await deleteReview({
      reviewId,
      user: req.user!,
      force,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const updateReviewController = async (
  req: AuthenticatedRequestELearningReview,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviewId = req.validatedParams.id;
    const payload = req.validatedBody;

    const result = await updateReview({
      reviewId,
      payload,
      user: req.user!,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getReviewSummaryController = async (
  req: AuthenticatedRequestELearningReview,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = req.validatedParams.id;

    const result = await getReviewSummary(courseId);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getAllReviewStatsController = async (
  req: AuthenticatedRequestELearningReview,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getAllReviewStats();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

