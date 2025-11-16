import { Response, NextFunction } from "express";
import { ELearningSubmissionService } from "../services/elearning_submission.service.js";
import { AuthenticatedRequestElearningSubmission } from "../middlewares/authenticate.js";

export class ELearningSubmissionController {
  static async createSubmission(
    req: AuthenticatedRequestElearningSubmission,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { user, validatedParams, validatedBody } = req;
      if (!user?.userId) throw new Error("User tidak terautentikasi");

      // ambil file upload dari multer
      const uploadedFiles = req.files
        ? (req.files as Express.Multer.File[]).map(
            (file) => `/uploads/elearning/submissions/${file.filename}`
          )
        : [];

      const result = await ELearningSubmissionService.createSubmission(
        user.userId,
        validatedParams.id,
        {
          ...validatedBody,
          files: uploadedFiles,
        }
      );

      res.status(201).json({
        success: true,
        message: "Submission berhasil dikirim",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMySubmission(
    req: AuthenticatedRequestElearningSubmission,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { user, validatedParams } = req;
      if (!user?.userId) throw new Error("User tidak terautentikasi");

      const submission = await ELearningSubmissionService.getMySubmission(
        user.userId,
        validatedParams.id
      );

      if (!submission) {
        res.status(404).json({
          success: false,
          message: "Anda belum pernah mengirim submission untuk assignment ini",
        });
        return;
      }

      res.json({
        success: true,
        data: submission,
      });
      return;
    } catch (err) {
      next(err);
    }
  }

  static async getAllSubmissions(
    req: AuthenticatedRequestElearningSubmission,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { user, validatedParams, validatedQuery } = req;

      if (!user?.userId) throw new Error("User tidak terautentikasi");

      const result = await ELearningSubmissionService.getAllSubmissions({
        user,
        assignmentId: validatedParams.id,
        query: validatedQuery,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async reviewSubmission(
    req: AuthenticatedRequestElearningSubmission,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { user, validatedBody, validatedParams } = req;

      if (!user?.userId) throw new Error("Reviewer tidak terautentikasi");

      const result = await ELearningSubmissionService.reviewSubmission(
        validatedParams.id,
        user,
        validatedBody
      );

      res.json({
        success: true,
        message: "Review berhasil disimpan",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async reviseSubmission(
    req: AuthenticatedRequestElearningSubmission,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { user, validatedBody, validatedParams } = req;
      if (!user?.userId) throw new Error("User tidak terautentikasi");

      const uploadedFiles = req.files
        ? (req.files as Express.Multer.File[]).map(
            (file) => `/uploads/elearning/submissions/${file.filename}`
          )
        : [];

      const result = await ELearningSubmissionService.submitRevision(
        user.userId,
        validatedParams.id,
        {
          ...validatedBody,
          files: uploadedFiles,
        }
      );

      res.json({
        success: true,
        message: "Revisi berhasil dikirim",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSubmissionDetail(
    req: AuthenticatedRequestElearningSubmission,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { user, validatedParams } = req;

      if (!user?.userId) throw new Error("User tidak terautentikasi");

      const submissionId = validatedParams.id;

      const result = await ELearningSubmissionService.getSubmissionDetail(
        submissionId,
        user
      );

      res.json({
        success: true,
        message: "Detail submission berhasil diambil",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSubmissionHistory(
    req: AuthenticatedRequestElearningSubmission,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { user, validatedParams } = req;

      if (!user?.userId) throw new Error("User tidak terautentikasi");

      const submissionId = validatedParams.id;

      const history = await ELearningSubmissionService.getSubmissionHistory(
        submissionId,
        user
      );

      res.json({
        success: true,
        message: "Riwayat submission berhasil diambil",
        data: history,
      });
    } catch (err) {
      next(err);
    }
  }

  static async exportSubmissions(
    req: AuthenticatedRequestElearningSubmission,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedQuery, user } = req;
      const format = validatedQuery?.format;

      if (!user || !user.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          message: "Akses ditolak. Hanya admin yang dapat export submission.",
        });
        return;
      }

      if (!format || (format !== "csv" && format !== "excel")) {
        res.status(400).json({
          success: false,
          message: "Format tidak valid. Gunakan 'csv' atau 'excel'",
        });
        return;
      }

      const file = await ELearningSubmissionService.exportSubmissionsToFile(
        format
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${file.filename}`
      );
      res.setHeader("Content-Type", file.mimetype);

      res.send(file.buffer);
    } catch (err) {
      next(err);
    }
  }

  static async deleteSubmission(
    req: AuthenticatedRequestElearningSubmission,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!user || !user.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          message:
            "Akses ditolak. Hanya admin yang dapat menghapus submission.",
        });
        return;
      }

      const submissionId = validatedParams?.id;

      const result = await ELearningSubmissionService.deleteSubmissionById(
        submissionId
      );

      res.status(200).json({
        success: true,
        message: "Submission berhasil dihapus",
        data: result,
      });
      return;
    } catch (err) {
      next(err);
    }
  }
}
