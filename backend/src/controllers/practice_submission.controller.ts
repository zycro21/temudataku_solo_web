import { Response, NextFunction } from "express";
import { AuthenticatedRequestPractice } from "../middlewares/authenticate.js";
import * as PracticeSubmissionService from "../services/practice_submission.service.js";
import { logActivity } from "../utils/logActivtiy.js";

export const createPracticeSubmissionController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;
    if (!user || !user.roles.includes("mentee")) {
      res.status(403).json({
        success: false,
        message: "Unauthorized: Only mentees can submit practice.",
      });
      return;
    }

    // Ambil data dari req.files (hasil upload multer)
    const uploadedFiles =
      Array.isArray(req.files) && req.files.length > 0
        ? (req.files as Express.Multer.File[]).map((f) => f.filename)
        : [];

    // Ambil body
    const { practiceId, notes } = req.body;

    if (!practiceId) {
      res.status(400).json({
        success: false,
        message: "Practice ID is required.",
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      res.status(400).json({
        success: false,
        message: "At least one file must be uploaded.",
      });
      return;
    }

    const submission =
      await PracticeSubmissionService.createPracticeSubmissionService({
        userId: user.userId,
        practiceId,
        notes,
        files: uploadedFiles,
      });

    res.status(201).json({
      success: true,
      message: "Practice submission created successfully.",
      data: submission,
    });
    return;
  } catch (err) {
    next(err);
  }
};

export const getAllPracticeSubmissionsController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, sort_by, order, status } = req.validatedQuery!;

    const result =
      await PracticeSubmissionService.getAllPracticeSubmissionsService({
        user: req.user!,
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sort_by,
        order,
        status,
      });

    res.json({
      success: true,
      message: "Practice submissions retrieved successfully.",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getOwnPracticeSubmissionsController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, status, sort_by, order } = req.validatedQuery!;

    const result =
      await PracticeSubmissionService.getOwnPracticeSubmissionsService({
        user: req.user!,
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        sort_by,
        order,
      });

    res.json({
      success: true,
      message: "Practice submissions retrieved successfully.",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getPracticeSubmissionByIdController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const submission =
      await PracticeSubmissionService.getPracticeSubmissionByIdService({
        id: req.validatedParams!.id,
        user: req.user!,
      });

    res.json({
      success: true,
      data: submission,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Failed to retrieve practice submission",
    });
  }
};

export const reviewPracticeSubmissionController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const adminId = req.user.userId;
    const rolesLog = req.user?.roles || [];

    const { user } = req;
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
      return;
    }

    const submission =
      await PracticeSubmissionService.reviewPracticeSubmissionService({
        id: req.params.id,
        userId: user.userId,
        roles: user.roles || [],
        mentorProfileId: user.mentorProfileId,
        ...req.validatedBody,
      });

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: adminId,
        action: "Review Practice Submission",
        type: "UPDATE",
        description: `User ${user.userId} reviewed submission ${req.params.id}`,
        req,
      });
    }

    res.json({
      success: true,
      message: "Submission reviewed successfully.",
      data: submission,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Failed to review submission",
    });
  }
};

export const deletePracticeSubmissionController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const adminId = req.user.userId;
    const rolesLog = req.user?.roles || [];

    await PracticeSubmissionService.deletePracticeSubmissionService(
      req.params.id,
      { userId: req.user!.userId, roles: req.user!.roles || [] }
    );

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: req.user!.userId,
        action: "Delete Practice Submission",
        type: "DELETE",
        description: `User ${req.user!.userId} deleted submission ${
          req.params.id
        }`,
        req,
      });
    }

    res.json({ success: true, message: "Submission deleted successfully." });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Failed to delete submission",
    });
  }
};
