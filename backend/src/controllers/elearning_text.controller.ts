import { Response, NextFunction } from "express";
import { ELearningTextService } from "../services/elearning_text.service.js";
import { AuthenticatedRequestText } from "../middlewares/authenticate.js";

export class ELearningTextController {
  static async getTextsBySubBab(
    req: AuthenticatedRequestText,
    res: Response,
    next: NextFunction
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
        user
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
    next: NextFunction
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
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams?.subBabId || !validatedBody || !user) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const { subBabId } = validatedParams;
      const data = validatedBody;

      const newText = await ELearningTextService.createText(
        subBabId,
        data,
        user
      );

      res.status(201).json({
        success: true,
        message: "Teks berhasil ditambahkan",
        data: newText,
      });
      return;
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      } else if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      } else {
        next(err);
      }
    }
  }

  static async updateText(
    req: AuthenticatedRequestText,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams?.id || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const { id } = validatedParams;
      const data = validatedBody!;

      const updated = await ELearningTextService.updateText(id, data, user);

      res.status(200).json({
        success: true,
        message: "Teks berhasil diupdate",
        data: updated,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
      } else if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
      } else if (err.message.includes("duplikat")) {
        res.status(409).json({ success: false, message: err.message });
      } else {
        next(err);
      }
    }
  }

  static async deleteText(
    req: AuthenticatedRequestText,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams } = req;
      if (!validatedParams?.id) {
        res.status(400).json({
          success: false,
          message: "ID teks tidak valid",
        });
        return;
      }

      const { id } = validatedParams;
      const result = await ELearningTextService.deleteText(id);

      res.status(200).json({
        success: true,
        message: "Teks berhasil dihapus dan urutan diperbarui",
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

  static async reorderTexts(
    req: AuthenticatedRequestText,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;
      if (!validatedParams?.subBabId || !validatedBody?.orders || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await ELearningTextService.reorderTexts(
        validatedParams.subBabId,
        validatedBody.orders,
        user
      );

      res.status(200).json({
        success: true,
        message: "Urutan teks berhasil diperbarui",
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
      } else if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
      } else if (err.message.includes("duplikat")) {
        res.status(409).json({ success: false, message: err.message });
      } else {
        next(err);
      }
    }
  }

  static async searchTexts(
    req: AuthenticatedRequestText,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedQuery, user } = req;

      if (!user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      if (!user.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          message:
            "Akses ditolak: hanya admin yang dapat melakukan pencarian global",
        });
        return;
      }

      const result = await ELearningTextService.searchTexts(validatedQuery);

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

      const file = await ELearningTextService.exportTextsToFile(format);

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
}
