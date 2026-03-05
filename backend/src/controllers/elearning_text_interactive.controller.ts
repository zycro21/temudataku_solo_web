import { Response, NextFunction } from "express";
import { ELearningTextInteractiveService } from "../services/elearning_text_interactive.service.js";
import { AuthenticatedRequestELearningTextInteractive } from "../middlewares/authenticate.js";

export class ELearningTextInteractiveController {
  static async getInteractivesByText(
    req: AuthenticatedRequestELearningTextInteractive,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedQuery, user } = req;

      if (!validatedParams || !validatedQuery || !user) {
        res.status(400).json({
          success: false,
          message: "Request tidak valid",
        });
        return;
      }

      const result = await ELearningTextInteractiveService.getByTextId(
        validatedParams.textId,
        validatedQuery,
        user
      );

      res.json({
        success: true,
        ...result,
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

  static async createInteractive(
    req: AuthenticatedRequestELearningTextInteractive,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !validatedBody || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const interactive =
        await ELearningTextInteractiveService.createInteractive(
          validatedParams.textId,
          validatedBody,
          user
        );

      res.status(201).json({
        success: true,
        message: "Interactive berhasil ditambahkan",
        data: interactive,
      });
    } catch (err: any) {
      if (
        err.message.includes("tidak ditemukan") ||
        err.message.includes("Akses ditolak")
      ) {
        res
          .status(err.message.includes("Akses") ? 403 : 404)
          .json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async updateInteractive(
    req: AuthenticatedRequestELearningTextInteractive,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.validatedParams!;
      const body = req.validatedBody!;
      const user = req.user!;

      const result = await ELearningTextInteractiveService.updateInteractive(
        id,
        body,
        user
      );

      res.json({
        success: true,
        data: result,
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

  static async deleteInteractive(
    req: AuthenticatedRequestELearningTextInteractive,
    res: Response,
    next: NextFunction
  ) {
    try {
      await ELearningTextInteractiveService.deleteInteractive(
        req.params.id,
        req.user!
      );

      res.json({
        success: true,
        message: "Interactive berhasil dihapus",
      });
    } catch (err) {
      next(err);
    }
  }

  static async reorderInteractives(
    req: AuthenticatedRequestELearningTextInteractive,
    res: Response,
    next: NextFunction
  ) {
    try {
      await ELearningTextInteractiveService.reorderInteractives(
        req.validatedParams.textId,
        req.validatedBody.blockId,
        req.validatedBody.orders,
        req.user!
      );

      res.json({
        success: true,
        message: "Urutan interactive berhasil diperbarui",
      });
    } catch (err) {
      next(err);
    }
  }

  static async getInteractiveDetail(
    req: AuthenticatedRequestELearningTextInteractive,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({
          success: false,
          message: "Request tidak valid",
        });
        return;
      }

      const result = await ELearningTextInteractiveService.getDetailById(
        validatedParams.id,
        user
      );

      res.json({
        success: true,
        data: result,
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

  static async moveInteractive(
    req: AuthenticatedRequestELearningTextInteractive,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !validatedBody || !user) {
        res.status(400).json({
          success: false,
          message: "Request tidak valid",
        });
        return;
      }

      await ELearningTextInteractiveService.moveInteractive(
        validatedParams.id,
        validatedBody,
        user
      );

      res.json({
        success: true,
        message: "Interactive berhasil dipindahkan",
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

  static async getInteractivesByBlock(
    req: AuthenticatedRequestELearningTextInteractive,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({
          success: false,
          message: "Request tidak valid",
        });
        return;
      }

      const data = await ELearningTextInteractiveService.getByBlockId(
        validatedParams.blockId,
        user
      );

      res.json({
        success: true,
        data,
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

  static async exportInteractives(
    req: AuthenticatedRequestELearningTextInteractive,
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

      if (!format || !["csv", "excel"].includes(format)) {
        res.status(400).json({
          success: false,
          message: "Invalid format. Use 'csv' or 'excel'",
        });
        return;
      }

      const file =
        await ELearningTextInteractiveService.exportInteractivesToFile(format);

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
