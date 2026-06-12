import { Response, NextFunction } from "express";
import { ELearningTextService } from "../services/elearning_text.service.js";
import {
  AuthenticatedRequestText,
  ReorderTextRequest,
  AuthenticatedRequestTextBlock,
} from "../middlewares/authenticate.js";

export class ELearningTextController {
  static async getTextsBySubBab(
    req: AuthenticatedRequestText,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedQuery, user } = req;

      if (!validatedParams?.subBabId || !user) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const { subBabId } = validatedParams;
      const query = validatedQuery;

      const result = await ELearningTextService.getTextsBySubBab(
        subBabId,
        query,
        user,
      );

      res.status(200).json({
        success: true,
        message: "Daftar teks berhasil diambil",
        ...result, // berisi data, pagination info
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
  }

  static async getTextById(
    req: AuthenticatedRequestText,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams?.id || !user) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const { id } = validatedParams;

      const result = await ELearningTextService.getTextById(id, user);

      res.status(200).json({
        success: true,
        message: "Detail teks berhasil diambil",
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
  }

  static async createText(
    req: AuthenticatedRequestText,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams?.subBabId || !validatedBody || !user) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const newText = await ELearningTextService.createText(
        validatedParams.subBabId,
        validatedBody,
        user,
      );

      res.status(201).json({
        success: true,
        message: "Teks berhasil ditambahkan",
        data: newText,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async updateText(
    req: AuthenticatedRequestText,
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

      const files =
        (req.files as {
          supportingFiles?: Express.Multer.File[];
          mediaFiles?: Express.Multer.File[];
        }) ?? {};

      const assignmentFiles = files.supportingFiles ?? [];

      const mediaFiles = files.mediaFiles ?? [];

      const updated = await ELearningTextService.updateText(
        validatedParams.id,
        validatedBody,
        assignmentFiles,
        mediaFiles,
        user,
      );

      res.status(200).json({
        success: true,
        message: "Teks berhasil diupdate",
        data: updated,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({
          success: false,
          message: err.message,
        });
      } else if (err.message.includes("Akses ditolak")) {
        res.status(403).json({
          success: false,
          message: err.message,
        });
      } else if (err.message.includes("duplikat")) {
        res.status(409).json({
          success: false,
          message: err.message,
        });
      } else {
        next(err);
      }
    }
  }

  static async deleteText(
    req: AuthenticatedRequestText,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const params = req.validatedParams;

      if (!params?.id) {
        res.status(400).json({
          success: false,
          message: "ID teks tidak valid",
        });
        return;
      }

      const textId: string = params.id;

      const result = await ELearningTextService.deleteText(textId);

      res.status(200).json({
        success: true,
        message: "Teks berhasil dihapus dan urutan diperbarui",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async reorderTexts(
    req: ReorderTextRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { subBabId } = req.validatedParams!;
      const { orders } = req.validatedBody!;

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const user = {
        userId: req.user.userId,
        roles: req.user.roles,
      };

      const result = await ELearningTextService.reorderTexts(
        subBabId,
        orders,
        user,
      );

      res.status(200).json({
        success: true,
        message: "Urutan teks berhasil diperbarui",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async searchTexts(
    req: AuthenticatedRequestText,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user || !req.user.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          message: "Akses ditolak: hanya admin",
        });
        return;
      }

      const result = await ELearningTextService.searchTexts(req.validatedQuery);

      res.status(200).json({
        success: true,
        message: "Hasil pencarian teks berhasil diambil",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async exportTexts(
    req: AuthenticatedRequestText,
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

      const file = await ELearningTextService.exportTextsToFile(format);

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
