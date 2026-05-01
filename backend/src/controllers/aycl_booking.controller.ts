import { Response, NextFunction } from "express";
import { AyclBookingService } from "../services/aycl_booking.service.js";
import { AuthenticatedRequestAyclBooking } from "../middlewares/authenticate.js";

export class AyclBookingController {
  static async createAyclBooking(
    req: AuthenticatedRequestAyclBooking,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized. User ID not found.",
        });
        return;
      }

      if (!req.validatedBody) {
        res.status(400).json({
          success: false,
          message: "Invalid request body.",
        });
        return;
      }

      const result = await AyclBookingService.createAyclBooking(
        req.user.userId,
        req.validatedBody,
      );

      res.status(201).json(result);
      return;
    } catch (err: any) {
      const status = err.status || 500;

      res.status(status).json({
        success: false,
        message: err.message || "Terjadi kesalahan pada server",
      });
      return;
    }
  }

  static async getAyclBookingById(
    req: AuthenticatedRequestAyclBooking,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized. User ID not found.",
        });
        return;
      }

      if (!req.validatedParams?.id) {
        res.status(400).json({
          success: false,
          message: "Invalid booking id",
        });
        return;
      }

      const data = await AyclBookingService.getAyclBookingById(
        req.validatedParams.id,
        req.user.userId,
      );

      res.status(200).json({
        success: true,
        data,
      });
      return;
    } catch (err: any) {
      const status = err.status || 500;

      res.status(status).json({
        success: false,
        message: err.message || "Terjadi kesalahan pada server",
      });
      return;
    }
  }

  // Tambahkan method ini ke dalam class AyclBookingController

  static async getAllAyclBookings(
    req: AuthenticatedRequestAyclBooking,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized. User ID not found.",
        });
        return;
      }

      const query = req.validatedQuery as {
        page: number;
        limit: number;
        search?: string;
        status?: "pending" | "confirmed" | "completed" | "cancelled";
        batchId?: string;
        sortBy: "createdAt" | "status";
        sortDir: "asc" | "desc";
      };

      const result = await AyclBookingService.getAllAyclBookings(query);

      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
      return;
    } catch (err: any) {
      const status = err.status || 500;

      res.status(status).json({
        success: false,
        message: err.message || "Terjadi kesalahan pada server",
      });
      return;
    }
  }

  static async updateAyclBooking(
    req: AuthenticatedRequestAyclBooking,
    res: Response,
  ) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized. User ID not found.",
        });
        return;
      }

      const { id } = req.params;

      if (!req.validatedBody) {
        res.status(400).json({
          success: false,
          message: "Invalid request body.",
        });
        return;
      }

      const result = await AyclBookingService.updateAyclBooking(
        id,
        req.user.userId,
        req.validatedBody,
      );

      res.json(result);
    } catch (err: any) {
      res.status(err.status || 500).json({
        success: false,
        message: err.message || "Terjadi kesalahan pada server",
      });
    }
  }

  static async deleteAyclBooking(
    req: AuthenticatedRequestAyclBooking,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized. User ID not found.",
        });
        return;
      }

      if (!req.validatedParams?.id) {
        res.status(400).json({
          success: false,
          message: "Invalid booking id",
        });
        return;
      }

      await AyclBookingService.deleteAyclBooking(req.validatedParams.id);

      res.status(200).json({
        success: true,
        message: "Booking AYCL berhasil dihapus",
      });
      return;
    } catch (err: any) {
      const status = err.status || 500;

      res.status(status).json({
        success: false,
        message: err.message || "Terjadi kesalahan pada server",
      });
      return;
    }
  }

  static async getAyclBookingStats(
    req: AuthenticatedRequestAyclBooking,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized. User ID not found.",
        });
        return;
      }

      const data = await AyclBookingService.getAyclBookingStats();

      res.status(200).json({
        success: true,
        data,
      });
      return;
    } catch (err: any) {
      const status = err.status || 500;

      res.status(status).json({
        success: false,
        message: err.message || "Terjadi kesalahan pada server",
      });
      return;
    }
  }

  static async getIncompleteAyclBookings(
    req: AuthenticatedRequestAyclBooking,
    res: Response,
  ) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const data = await AyclBookingService.getIncompleteAyclBookings(
        req.user.userId,
      );

      res.status(200).json({
        success: true,
        data,
      });
      return;
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || "Server error",
      });
      return;
    }
  }
}
