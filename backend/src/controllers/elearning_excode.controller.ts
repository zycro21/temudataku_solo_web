import { Response, NextFunction } from "express";
import { ELearningExecutableCodeService } from "../services/elearning_excode.service.js";
import {
  AuthenticatedRequest,
  AuthenticatedRequestELearningExCode,
} from "../middlewares/authenticate.js";

export class ELearningExecutableCodeController {
  static async createExecutableCode(
    req: AuthenticatedRequestELearningExCode,
    res: Response,
    next: NextFunction,
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

      const executableCode =
        await ELearningExecutableCodeService.createExecutableCode(
          validatedParams.textId,
          validatedBody,
          user,
        );

      res.status(201).json({
        success: true,
        message: "Executable code berhasil dibuat",
        data: executableCode,
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

  static async getExecutableCodeById(
    req: AuthenticatedRequestELearningExCode,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const executableCode =
        await ELearningExecutableCodeService.getExecutableCodeById(
          validatedParams.id,
          user,
        );

      res.status(200).json({
        success: true,
        message: "Executable code berhasil diambil",
        data: executableCode,
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

  static async getExecutableCodesByText(
    req: AuthenticatedRequestELearningExCode,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedQuery, user } = req;

      if (!validatedParams || !validatedQuery || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result =
        await ELearningExecutableCodeService.getExecutableCodesByText(
          validatedParams.textId,
          validatedQuery,
          user,
        );

      res.status(200).json({
        success: true,
        message: "Daftar executable code berhasil diambil",
        ...result,
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

  static async updateExecutableCode(
    req: AuthenticatedRequestELearningExCode,
    res: Response,
    next: NextFunction,
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

      const result = await ELearningExecutableCodeService.updateExecutableCode(
        validatedParams.id,
        validatedBody,
        user,
      );

      res.status(200).json({
        success: true,
        message: "Executable code berhasil diupdate",
        data: result,
      });
    } catch (err: any) {
      if (
        err.message.includes("Akses") ||
        err.message.includes("tidak ditemukan")
      ) {
        res
          .status(err.message.includes("Akses") ? 403 : 404)
          .json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async deleteExecutableCode(
    req: AuthenticatedRequestELearningExCode,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      await ELearningExecutableCodeService.deleteExecutableCode(
        validatedParams.id,
      );

      res.status(200).json({
        success: true,
        message: "Executable code berhasil dihapus",
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({
          success: false,
          message: err.message,
        });
        return;
      }

      next(err);
    }
  }

  static async toggleEditable(
    req: AuthenticatedRequestELearningExCode,
    res: Response,
    next: NextFunction,
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

      const result = await ELearningExecutableCodeService.toggleEditable(
        validatedParams.id,
        validatedBody.isEditable,
        user,
      );

      res.status(200).json({
        success: true,
        message: `Executable code berhasil ${
          validatedBody.isEditable ? "dibuka" : "dikunci"
        }`,
        data: result,
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

  static async getByBlock(
    req: AuthenticatedRequestELearningExCode,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const data =
        await ELearningExecutableCodeService.getExecutableCodesByBlock(
          validatedParams.blockId,
          user,
        );

      res.status(200).json({
        success: true,
        data,
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

  static async duplicateExecutableCode(
    req: AuthenticatedRequestELearningExCode,
    res: Response,
    next: NextFunction,
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

      const result =
        await ELearningExecutableCodeService.duplicateExecutableCode(
          validatedParams.id,
          validatedBody,
          user,
        );

      res.status(201).json({
        success: true,
        message: "Executable code berhasil diduplikasi",
        data: result,
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

  static async runExecutableCode(
    req: AuthenticatedRequestELearningExCode,
    res: Response,
    next: NextFunction,
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

      const result = await ELearningExecutableCodeService.runExecutableCode(
        validatedParams.id,
        validatedBody,
        user,
      );

      res.status(200).json({
        success: true,
        message: "Code berhasil dijalankan",
        data: result,
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

  static async getRunHistory(
    req: AuthenticatedRequestELearningExCode,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedQuery, user } = req;

      if (!validatedParams || !validatedQuery || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await ELearningExecutableCodeService.getRunHistory(
        validatedParams.id,
        validatedQuery,
        user,
      );

      res.status(200).json({
        success: true,
        message: "Run history berhasil diambil",
        ...result,
      });
    } catch (err: any) {
      if (
        err.message.includes("Akses ditolak") ||
        err.message.includes("subscription")
      ) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async getRunDetail(
    req: AuthenticatedRequestELearningExCode,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const runDetail = await ELearningExecutableCodeService.getRunDetail(
        validatedParams.runId,
        user,
      );

      res.status(200).json({
        success: true,
        message: "Detail run berhasil diambil",
        data: runDetail,
      });
    } catch (err: any) {
      if (
        err.message.includes("Akses ditolak") ||
        err.message.includes("subscription")
      ) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async getMyCodeRuns(
    req: AuthenticatedRequestELearningExCode,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery, user } = req;

      if (!validatedQuery || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await ELearningExecutableCodeService.getMyCodeRuns(
        {
          page: validatedQuery.page,
          limit: validatedQuery.limit,
        },
        user,
      );

      res.status(200).json({
        success: true,
        message: "Riwayat code run berhasil diambil",
        ...result,
      });
    } catch (err: any) {
      if (err.message.includes("Akses ditolak")) {
        res.status(403).json({
          success: false,
          message: err.message,
        });
        return;
      }

      next(err);
    }
  }
}
