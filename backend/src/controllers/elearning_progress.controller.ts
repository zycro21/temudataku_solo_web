import { Response, NextFunction } from "express";
import {
  getMyProgress,
  getSubBabProgress,
  completeSubBab,
  updateSubBabProgress,
  getCourseProgress,
  getSubChapterProgress,
  getCourseRoadmap,
  resetSubBabProgress,
  exportElearningProgressToFile,
} from "../services/elearning_progress.service.js";
import { AuthenticatedRequestELearningProgress } from "../middlewares/authenticate.js";

export const getMyProgressController = async (
  req: AuthenticatedRequestELearningProgress,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const q = req.validatedQuery || {};

    const page = q.page ?? 1;
    const limit = q.limit ?? 20;

    const result = await getMyProgress({
      userId,
      page,
      limit,
      courseId: q.courseId,
      isCompleted: q.isCompleted,
      sortBy: q.sortBy,
      sortOrder: q.sortOrder,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getSubBabProgressController = async (
  req: AuthenticatedRequestELearningProgress,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const subBabId = req.validatedParams.id;

    const result = await getSubBabProgress({ userId, subBabId });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const completeSubBabController = async (
  req: AuthenticatedRequestELearningProgress,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const subBabId = req.validatedParams.id;

    const result = await completeSubBab({
      userId,
      subBabId,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSubBabProgressController = async (
  req: AuthenticatedRequestELearningProgress,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const subBabId = req.validatedParams.id;
    const payload = req.validatedBody;

    const result = await updateSubBabProgress({
      userId,
      subBabId,
      payload,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getCourseProgressController = async (
  req: AuthenticatedRequestELearningProgress,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const courseId = req.validatedParams.id;

    const result = await getCourseProgress({ userId, courseId });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getSubChapterProgressController = async (
  req: AuthenticatedRequestELearningProgress,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const subChapterId = req.validatedParams.id;

    const result = await getSubChapterProgress({ userId, subChapterId });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getCourseRoadmapController = async (
  req: AuthenticatedRequestELearningProgress,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const courseId = req.validatedParams.id;

    const result = await getCourseRoadmap({ userId, courseId });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const resetSubBabProgressController = async (
  req: AuthenticatedRequestELearningProgress,
  res: Response,
  next: NextFunction
) => {
  try {
    const requesterId = req.user!.userId;
    const roles = req.user!.roles;
    const subBabId = req.validatedParams.id;

    // admin boleh reset user lain
    const targetUserId =
      roles.includes("admin") && req.body.userId
        ? req.body.userId
        : requesterId;

    const result = await resetSubBabProgress({
      userId: targetUserId, // ⬅️ PENTING
      subBabId,
      roles,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};


export const exportElearningProgressController = async (
  req: AuthenticatedRequestELearningProgress,
  res: Response,
  next: NextFunction
) => {
  try {
    const { validatedQuery, user } = req;

    if (!user || !user.roles.some((r) => ["admin", "mentor"].includes(r))) {
      const err = new Error("Akses ditolak. Hanya admin atau mentor.");
      (err as any).statusCode = 403;
      throw err;
    }

    const { format, courseId } = validatedQuery;

    const file = await exportElearningProgressToFile({
      format,
      courseId, // bisa undefined
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${file.filename}`
    );
    res.setHeader("Content-Type", file.mimetype);

    res.send(file.buffer);
  } catch (err) {
    next(err);
  }
};

