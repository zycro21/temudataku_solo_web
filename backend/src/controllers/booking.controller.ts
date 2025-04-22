import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestBooking } from "../middlewares/authenticate";
import { format } from "date-fns";
import { HttpError } from "../utils/httpError";
import * as BookingService from "../services/booking.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createBookingController = async (
  req: AuthenticatedRequestBooking,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }

    if (!req.validatedBody) {
      res.status(400).json({ message: "Invalid request body." });
      return;
    }

    const booking = await BookingService.createBooking(
      req.user.userId,
      req.validatedBody
    );

    res.status(201).json({
      message: "Booking berhasil dibuat.",
      data: booking,
    });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ message });
  }
};

export const getMenteeBookingsController = async (
  req: AuthenticatedRequestBooking,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }

    const bookings = await BookingService.getMenteeBookings(
      req.user.userId,
      req.validatedQuery!
    );

    res.status(200).json({
      message: "Berhasil mengambil daftar booking.",
      data: bookings,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getMenteeBookingDetailController = async (
  req: AuthenticatedRequestBooking,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }

    const bookingId = req.validatedParams?.id;
    if (!bookingId) {
      res.status(400).json({ message: "Booking ID tidak ditemukan." });
      return;
    }

    const result = await BookingService.getMenteeBookingDetail(
      req.user.userId,
      bookingId
    );

    res.status(200).json({
      message: "Detail booking berhasil diambil.",
      data: result,
    });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ message });
  }
};

export const updateMenteeBookingController = async (
  req: AuthenticatedRequestBooking,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }

    const bookingId = req.validatedParams?.id;
    const { specialRequests, participantIds } = req.validatedBody || {};

    if (!bookingId) {
      res.status(400).json({ message: "Booking ID tidak ditemukan." });
      return;
    }

    const updatedBooking = await BookingService.updateMenteeBooking(
      req.user.userId,
      bookingId,
      { specialRequests, participantIds }
    );

    res.status(200).json({
      message: "Booking berhasil diperbarui.",
      data: updatedBooking,
    });
  } catch (error: any) {
    next(error);
  }
};

export const cancelMenteeBookingController = async (
  req: AuthenticatedRequestBooking,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }

    const bookingId = req.params.id;

    if (!bookingId) {
      res.status(400).json({ message: "Booking ID tidak ditemukan." });
      return;
    }

    const cancelledBooking = await BookingService.cancelMenteeBooking(
      req.user.userId,
      bookingId
    );

    res.status(200).json({
      message: "Booking berhasil dibatalkan.",
      data: cancelledBooking,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getAdminBookingsController = async (
  req: AuthenticatedRequestBooking,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.validatedQuery) {
      throw new Error("Query belum divalidasi");
    }

    const {
      status,
      menteeName,
      serviceName,
      usedReferral,
      startDate,
      endDate,
      page,
      limit,
      sortBy = "createdAt", // Default sortBy
      sortOrder = "desc", // Default sortOrder
    } = req.validatedQuery;

    const result = await BookingService.getAdminBookings({
      status,
      menteeName,
      serviceName,
      usedReferral,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      message: "Berhasil mengambil daftar booking.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminBookingDetailController = async (
  req: AuthenticatedRequestBooking,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.validatedParams) {
      throw new Error("Parameter belum divalidasi");
    }

    const { id } = req.validatedParams;

    const booking = await BookingService.getAdminBookingDetail(id);

    if (!booking) {
      res.status(404).json({
        message: "Booking tidak ditemukan.",
      });
      return;
    }

    res.status(200).json({
      message: "Berhasil mengambil detail booking.",
      data: booking,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateAdminBookingStatusController = async (
  req: AuthenticatedRequestBooking,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.validatedParams || !req.validatedBody) {
      throw new Error("Parameter atau body belum divalidasi.");
    }

    const { id } = req.validatedParams;
    const { status } = req.validatedBody as unknown as {
      status: "pending" | "confirmed" | "completed" | "cancelled";
    };

    const updated = await BookingService.updateAdminBookingStatus(id, status);

    if (!updated) {
      res.status(404).json({
        message: "Booking tidak ditemukan.",
      });
      return;
    }

    res.status(200).json({
      message: `Status booking berhasil diperbarui menjadi ${status}.`,
      data: updated,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const exportAdminBookings = async (
  req: AuthenticatedRequestBooking,
  res: Response,
  next: NextFunction
) => {
  try {
    const { format } = req.validatedQuery as { format: "csv" | "excel" };

    const { fileBuffer, fileName, mimeType } =
      await BookingService.exportAdminBookings(format);

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", mimeType);
    res.send(fileBuffer);
  } catch (error) {
    next(error);
  }
};

export const getBookingParticipantsController = async (
  req: AuthenticatedRequestBooking,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingId = req.validatedParams!.id;
    const menteeId = req.user!.userId;

    const participants = await BookingService.getBookingParticipants(
      bookingId,
      menteeId
    );
    res.json({ participants });
  } catch (error) {
    next(error);
  }
};
