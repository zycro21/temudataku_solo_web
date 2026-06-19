import { Response, NextFunction } from "express";
import { AuthenticatedRequestAssignment } from "../middlewares/authenticate.js";
import { ELearningAssignmentService } from "../services/elearning_assignment.service.js";

export class ELearningAssignmentController {
  static async createAssignment(
    req: AuthenticatedRequestAssignment,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (
        !user ||
        !validatedParams?.id ||
        !validatedBody?.title ||
        !validatedBody?.dueDays
      ) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const { title, description, dueDays } = validatedBody;

      const assignment = await ELearningAssignmentService.createAssignment(
        validatedParams.id, // sekarang textId
        {
          title,
          description,
          dueDays,
        },
        user,
      );

      res.status(201).json({
        success: true,
        message: "Assignment berhasil dibuat",
        data: assignment,
      });
      return;
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (
        err.message.includes("sudah memiliki") ||
        err.message.includes("izin") ||
        err.message.includes("tidak valid")
      ) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async getAssignment(
    req: AuthenticatedRequestAssignment,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { user, validatedParams, validatedQuery } = req;

      if (!user || !validatedParams?.id) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const textId = validatedParams.id;

      const result = await ELearningAssignmentService.getAssignment(
        textId,
        user,
        validatedQuery ?? {},
      );

      if (!result) {
        res
          .status(404)
          .json({ success: false, message: "Assignment tidak ditemukan" });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
      return;
    } catch (err: any) {
      if (err.message?.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (
        err.message?.includes("tidak memiliki izin") ||
        err.message?.includes("akses ditolak")
      ) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async updateAssignment(
    req: AuthenticatedRequestAssignment,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!user || !validatedParams?.id) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const assignment = await ELearningAssignmentService.updateAssignment(
        validatedParams.id,
        validatedBody ?? {},
        user,
      );

      res.status(200).json({
        success: true,
        message: "Assignment berhasil diperbarui",
        data: assignment,
      });
      return;
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message.includes("izin")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      if (err.message.includes("tidak valid")) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async deleteAssignment(
    req: AuthenticatedRequestAssignment,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      // Pastikan user dan ID tersedia
      if (!user || !validatedParams?.id) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      // Hanya admin yang boleh menghapus
      if (!user.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          message: "Hanya admin yang dapat menghapus assignment",
        });
        return;
      }

      // Lanjutkan ke service
      const deleted = await ELearningAssignmentService.deleteAssignment(
        validatedParams.id,
        {
          userId: user.userId,
          roles: user.roles,
        },
      );

      res.status(200).json({
        success: true,
        message: "Assignment berhasil dihapus",
        data: deleted,
      });
      return;
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async getAllAssignments(
    req: AuthenticatedRequestAssignment,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery, user } = req;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const assignments = await ELearningAssignmentService.getAllAssignments(
        user,
        validatedQuery ?? {},
      );

      res.status(200).json({
        success: true,
        message: "Daftar assignment berhasil diambil",
        data: assignments.data,
        pagination: assignments.pagination,
      });
      return;
    } catch (err: any) {
      next(err);
    }
  }

  static async getAssignmentDetail(
    req: AuthenticatedRequestAssignment,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      if (!user || !validatedParams?.id) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const assignment = await ELearningAssignmentService.getAssignmentDetail(
        validatedParams.id,
        user,
      );

      res.status(200).json({
        success: true,
        message: "Detail assignment berhasil diambil",
        data: assignment,
      });
      return;
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message.includes("izin")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async getAssignmentsByCourse(
    req: AuthenticatedRequestAssignment,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedQuery, user } = req;

      if (!user || !validatedParams?.courseId) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const { courseId } = validatedParams;
      const { page, limit, sortBy, order, search } = validatedQuery ?? {};

      // Konversi sortBy agar sesuai dengan tipe service
      const validSortFields = ["title", "createdAt", "updatedAt"] as const;
      const sortField = validSortFields.includes(sortBy as any)
        ? (sortBy as "title" | "createdAt" | "updatedAt")
        : "createdAt";

      const result = await ELearningAssignmentService.getAssignmentsByCourse(
        courseId,
        user,
        { page, limit, sortBy: sortField, order, search },
      );

      res.status(200).json({
        success: true,
        message: "Daftar assignment berhasil diambil",
        ...result,
      });
      return;
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message.includes("izin")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async exportAssignments(
    req: AuthenticatedRequestAssignment,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery } = req;
      const format = validatedQuery?.format;

      if (!format || (format !== "csv" && format !== "excel")) {
        res.status(400).json({
          success: false,
          message: "Invalid format. Use 'csv' or 'excel'",
        });
        return;
      }

      const file =
        await ELearningAssignmentService.exportAssignmentsToFile(format);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${file.filename}`,
      );
      res.setHeader("Content-Type", file.mimetype);

      res.send(file.buffer);
    } catch (err) {
      next(err);
    }
  }
}
