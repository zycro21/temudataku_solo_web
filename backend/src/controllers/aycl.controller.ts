import { Response, NextFunction } from "express";
import { AyclService } from "../services/aycl.service.js";
import { AuthenticatedRequestAycl } from "../middlewares/authenticate.js";

export class AyclController {
  static async createAycl(
    req: AuthenticatedRequestAycl,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedBody, user } = req;

      if (!validatedBody || !user) {
        res.status(400).json({
          success: false,
          message: "Data tidak valid",
        });
        return;
      }

      const result = await AyclService.createAycl(validatedBody);

      res.status(201).json({
        success: true,
        message: "AYCL berhasil dibuat",
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("slug")) {
        res.status(400).json({
          success: false,
          message: err.message,
        });
        return;
      }
      next(err);
    }
  }

  static async getAllAycl(
    req: AuthenticatedRequestAycl,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery } = req;

      const result = await AyclService.getAllAycl(validatedQuery);

      res.status(200).json({
        success: true,
        message: "Berhasil mengambil data AYCL",
        data: result.data,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAycl(
    req: AuthenticatedRequestAycl,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams } = req;

      if (!validatedParams?.id) {
        res.status(400).json({
          success: false,
          message: "ID tidak valid",
        });
        return;
      }

      await AyclService.deleteAycl(validatedParams.id);

      res.status(200).json({
        success: true,
        message: "AYCL berhasil dihapus",
      });
    } catch (err: any) {
      if (err.message.includes("booking")) {
        res.status(400).json({
          success: false,
          message: err.message,
        });
        return;
      }
      next(err);
    }
  }

  static async updateAycl(
    req: AuthenticatedRequestAycl,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedBody } = req;
      const { id } = req.params;

      const result = await AyclService.updateAycl(id, validatedBody);

      res.status(200).json({
        success: true,
        message: "AYCL berhasil diperbarui",
        data: result,
      });
    } catch (err: any) {
      next(err);
    }
  }

  static async getAyclDetail(
    req: AuthenticatedRequestAycl,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { params } = req;

      const result = await AyclService.getAyclDetail(params.id);

      res.status(200).json({
        success: true,
        message: "Detail AYCL berhasil diambil",
        data: result,
      });
    } catch (err: any) {
      if (err.message === "NOT_FOUND") {
        res.status(404).json({
          success: false,
          message: "AYCL tidak ditemukan",
        });
        return;
      }
      next(err);
    }
  }

  static async getPublicAycl(
    req: AuthenticatedRequestAycl,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await AyclService.getPublicAycl();

      res.status(200).json({
        success: true,
        message: "AYCL public berhasil diambil",
        data: result,
      });
    } catch (err: any) {
      if (err.message === "NOT_FOUND") {
        res.status(404).json({
          success: false,
          message: "AYCL aktif tidak ditemukan",
        });
        return;
      }
      next(err);
    }
  }
}
