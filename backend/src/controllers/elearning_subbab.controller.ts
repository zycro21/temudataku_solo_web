import { Response, NextFunction } from "express";
import { AuthenticatedRequestSubBab } from "../middlewares/authenticate.js";
import { ELearningSubBabService } from "../services/elearning_subbab.service.js";

export const ELearningSubBabController = {
  async getSubBabsBySubChapter(
    req: AuthenticatedRequestSubBab,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { user, validatedParams, validatedQuery } = req;

      if (!user || !validatedParams?.subChapterId) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const { subChapterId } = validatedParams;
      const {
        page = 1,
        limit = 10,
        search,
        sort = "asc",
      } = validatedQuery || {};

      const result = await ELearningSubBabService.getSubBabsBySubChapter(
        subChapterId,
        user,
        { page, limit, search, sort }
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async getSubBabById(
    req: AuthenticatedRequestSubBab,
    res: Response,
    next: NextFunction
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

      const result = await ELearningSubBabService.getSubBabById(
        validatedParams.id,
        user
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
      } else if (
        err.message.includes("Akses") ||
        err.message.includes("hanya bisa")
      ) {
        res.status(403).json({ success: false, message: err.message });
      } else {
        next(err);
      }
    }
  },

  async createSubBab(
    req: AuthenticatedRequestSubBab,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      // Validasi dasar
      if (!validatedParams?.subChapterId || !validatedBody || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      // Tambahkan validasi wajib title di sini
      if (!validatedBody.title) {
        res.status(400).json({
          success: false,
          message: "Title wajib diisi",
        });
        return;
      }

      // Lanjut ke service
      const newSubBab = await ELearningSubBabService.createSubBab(
        validatedParams.subChapterId,
        validatedBody as { title: string; estimatedTime?: string },
        user
      );

      res.status(201).json({
        success: true,
        message: "Sub-bab berhasil dibuat",
        data: newSubBab,
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

  async updateSubBab(
    req: AuthenticatedRequestSubBab,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!user || !validatedParams?.id || !validatedBody) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await ELearningSubBabService.updateSubBab(
        validatedParams.id,
        validatedBody,
        user
      );

      res.status(200).json({
        success: true,
        message: "Sub-bab berhasil diperbarui",
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
      } else if (
        err.message.includes("Akses ditolak") ||
        err.message.includes("hanya bisa")
      ) {
        res.status(403).json({ success: false, message: err.message });
      } else if (err.message.includes("duplikat")) {
        res.status(400).json({ success: false, message: err.message });
      } else {
        next(err);
      }
    }
  },

  async deleteSubBab(
    req: AuthenticatedRequestSubBab,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      // Validasi request
      if (!user || !validatedParams?.id) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      // Panggil service
      const result = await ELearningSubBabService.deleteSubBab(
        validatedParams.id
      );

      res.status(200).json({
        success: true,
        message: "Sub-bab berhasil dihapus",
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
      } else {
        next(err);
      }
    }
  },

  async duplicateSubBab(
    req: AuthenticatedRequestSubBab,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams?.id || !validatedBody?.targetSubChapterId || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const duplicated = await ELearningSubBabService.duplicateSubBab(
        validatedParams.id,
        validatedBody.targetSubChapterId,
        validatedBody.newTitle,
        user
      );

      res.status(201).json({
        success: true,
        message: "Sub-bab berhasil diduplikasi",
        data: duplicated,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
      } else if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
      } else if (err.message.includes("duplikat")) {
        res.status(400).json({ success: false, message: err.message });
      } else {
        next(err);
      }
    }
  },

  async reorderSubBabs(
    req: AuthenticatedRequestSubBab,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams?.subChapterId || !validatedBody?.updates || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await ELearningSubBabService.reorderSubBabs(
        validatedParams.subChapterId,
        validatedBody.updates,
        user
      );

      res.status(200).json({
        success: true,
        message: "Urutan sub-bab berhasil diperbarui",
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

  async getAllSubBabs(
    req: AuthenticatedRequestSubBab,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedQuery, user } = req;

      if (!user || !user.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          message:
            "Akses ditolak: hanya admin yang dapat melihat semua sub-bab",
        });
        return;
      }

      const { page, limit, search, sortBy, sortOrder } = validatedQuery;

      const result = await ELearningSubBabService.getAllSubBabs({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: "Daftar semua sub-bab berhasil diambil",
        ...result,
      });
    } catch (err) {
      next(err);
    }
  },

  async exportSubBabs(
    req: AuthenticatedRequestSubBab,
    res: Response,
    next: NextFunction
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

      const file = await ELearningSubBabService.exportSubBabsToFile(format);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${file.filename}`
      );
      res.setHeader("Content-Type", file.mimetype);

      res.send(file.buffer);
    } catch (err) {
      next(err);
    }
  },
};
