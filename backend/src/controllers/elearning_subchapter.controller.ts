import { Request, Response, NextFunction } from "express";
import {
  AuthenticatedRequestSubChapter,
  AuthenticatedRequestReorderSubChapter,
  AuthenticatedRequestDuplicateSubChapter,
} from "../middlewares/authenticate.js";
import { ELearningSubChapterService } from "../services/elearning_subchapter.service.js";

export const ELearningSubChapterController = {
  async getSubChaptersByCourse(
    req: AuthenticatedRequestSubChapter,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { user, validatedParams, validatedQuery } = req;

      if (!user || !validatedParams || !validatedParams.courseId) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const courseId = validatedParams.courseId;

      const {
        page = 1,
        limit = 10,
        search,
        orderNumber,
      } = validatedQuery || {};

      const result = await ELearningSubChapterService.getSubChaptersByCourse(
        courseId,
        user,
        { page, limit, search, orderNumber },
      );

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async getSubChapterById(
    req: AuthenticatedRequestSubChapter,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { user, validatedParams } = req;

      if (!user || !validatedParams || !validatedParams.id) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const id = validatedParams.id;

      const subChapter = await ELearningSubChapterService.getSubChapterById(
        id,
        user,
      );

      res.status(200).json({
        success: true,
        data: subChapter,
      });
    } catch (err) {
      next(err);
    }
  },

  async createSubChapter(
    req: AuthenticatedRequestSubChapter,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedBody, validatedParams, user } = req;

      if (!validatedBody || !validatedParams?.courseId || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const thumbnail = req.file
        ? `/images/elearningThumbnail/${req.file.filename}`
        : null;

      const newSubChapter = await ELearningSubChapterService.createSubChapter(
        validatedParams.courseId,
        {
          ...validatedBody,
          coverImage: thumbnail,
        },
        user,
      );

      res.status(201).json({
        success: true,
        message: "Sub-chapter berhasil dibuat",
        data: newSubChapter,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateSubChapter(
    req: AuthenticatedRequestSubChapter,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams?.id || !validatedBody || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const thumbnail = req.file
        ? `/images/elearningThumbnail/${req.file.filename}`
        : null;

      const updatedData = {
        ...validatedBody,
        ...(thumbnail && { coverImage: thumbnail }), // ✅ hanya kalau upload baru
      };

      const updatedSubChapter =
        await ELearningSubChapterService.updateSubChapter(
          validatedParams.id,
          updatedData,
          user,
        );

      res.status(200).json({
        success: true,
        message: "Sub-chapter berhasil diperbarui",
        data: updatedSubChapter,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
      } else if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
      } else {
        next(err);
      }
    }
  },

  async deleteSubChapter(
    req: AuthenticatedRequestSubChapter,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams?.id || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await ELearningSubChapterService.deleteSubChapter(
        validatedParams.id,
        user,
      );

      res.status(200).json({
        success: true,
        message: "Sub-chapter berhasil dihapus dan urutan diperbarui",
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
      } else if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
      } else {
        next(err);
      }
    }
  },

  async reorderSubChapters(
    req: AuthenticatedRequestReorderSubChapter,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!user || !validatedParams?.courseId || !validatedBody?.newOrder) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await ELearningSubChapterService.reorderSubChapters(
        validatedParams.courseId,
        validatedBody.newOrder,
        user,
      );

      res.status(200).json({
        success: true,
        message: "Urutan sub-chapter berhasil diperbarui",
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
      } else if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
      } else {
        next(err);
      }
    }
  },

  async duplicateSubChapter(
    req: AuthenticatedRequestSubChapter,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams?.id || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const duplicated = await ELearningSubChapterService.duplicateSubChapter(
        validatedParams.id,
        user,
      );

      res.status(201).json({
        success: true,
        message: "Sub-chapter berhasil diduplikasi",
        data: duplicated,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
      } else if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
      } else {
        next(err);
      }
    }
  },

  async listSubChapters(
    req: AuthenticatedRequestSubChapter,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery, user } = req;

      if (!user || !user.roles.includes("admin")) {
        res.status(403).json({ success: false, message: "Akses ditolak" });
        return;
      }

      const { page, limit, search, courseId, sortBy, sortOrder } =
        validatedQuery || {};

      const result = await ELearningSubChapterService.listSubChapters({
        page,
        limit,
        search,
        courseId,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: "Daftar sub-chapter berhasil diambil",
        pagination: result.pagination,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  },

  async exportSubChapters(
    req: AuthenticatedRequestSubChapter,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery, user } = req;
      const format = validatedQuery?.format;

      if (!user || !user.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          message: "Akses ditolak. Hanya admin yang dapat mengekspor data.",
        });
        return;
      }

      if (!format || (format !== "csv" && format !== "excel")) {
        res.status(400).json({
          success: false,
          message: "Invalid format. Use 'csv' or 'excel'",
        });
        return;
      }

      const file =
        await ELearningSubChapterService.exportSubChaptersToFile(format);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${file.filename}`,
      );
      res.setHeader("Content-Type", file.mimetype);

      res.send(file.buffer);
    } catch (err) {
      next(err);
    }
  },

  async getSubChapterHistory(
    req: AuthenticatedRequestSubChapter,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { user, validatedParams, validatedQuery } = req;

      if (!user || !validatedParams || !validatedParams.id) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const id = validatedParams.id;
      const page = validatedQuery?.page ?? 1;
      const limit = validatedQuery?.limit ?? 10;

      const result = await ELearningSubChapterService.getSubChapterHistory(
        id,
        user,
        page,
        limit,
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  },
};
