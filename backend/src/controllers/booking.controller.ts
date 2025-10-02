import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestBooking } from "../middlewares/authenticate";
import { format } from "date-fns";
import { HttpError } from "../utils/httpError";
import * as BookingService from "../services/booking.service";
import { PrismaClient } from "@prisma/client";
import path from "path";

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

    // Ambil file support document (multiple)
    let supportDocument: string[] | null = null;
    if (req.files && Array.isArray(req.files)) {
      supportDocument = (req.files as Express.Multer.File[]).map((file) =>
        path.join("supportDocuments", file.filename).replace(/\\/g, "/")
      );
    }

    const booking = await BookingService.createBooking(req.user.userId, {
      ...req.validatedBody,
      supportDocument,
    });

    res.status(201).json({
      success: true,
      message: "Booking berhasil dibuat.",
      data: booking.data,
    });
    return;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
    return;
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
    const { specialRequests, participantIds, material, expectedOutput } =
      req.validatedBody || {};

    if (!bookingId) {
      res.status(400).json({ message: "Booking ID tidak ditemukan." });
      return;
    }

    const updatedBooking = await BookingService.updateMenteeBooking(
      req.user.userId,
      bookingId,
      { specialRequests, participantIds, material, expectedOutput }
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

export const getMentorEarningsController = async (
  req: AuthenticatedRequestBooking,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.validatedQuery) throw new Error("Query belum divalidasi");

    const { page, limit } = req.validatedQuery;

    const roles = req.user?.roles || [];

    let result;

    if (roles.includes("admin")) {
      // Admin bisa lihat semua mentor earnings, dengan pagination
      result = await BookingService.getAllMentorsEarnings({
        page: page!,
        limit: limit!,
      });
    } else if (roles.includes("mentor")) {
      if (!req.user?.mentorProfileId)
        throw new Error("MentorProfileId tidak ditemukan");
      // Mentor hanya bisa lihat earnings sendiri
      result = await BookingService.getMentorEarnings({
        mentorId: req.user.mentorProfileId,
      });
    } else {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    res.status(200).json({
      message: "Berhasil mengambil earnings.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMentorBookingsController = async (
  req: AuthenticatedRequestBooking,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.validatedQuery) throw new Error("Query belum divalidasi");

    const roles = req.user?.roles || [];
    let mentorId: string | undefined;

    if (roles.includes("admin")) {
      mentorId = req.validatedQuery.mentorId;
    } else if (roles.includes("mentor")) {
      if (!req.user?.mentorProfileId) {
        throw new Error("MentorProfileId tidak ditemukan");
      }
      mentorId = req.user.mentorProfileId; // selalu ambil dari JWT untuk mentor
    } else {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const result = await BookingService.getMentorBookings({ mentorId });

    res.status(200).json({
      message: "Berhasil mengambil booking mentor.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMentorStatBookingsController = async (
  req: AuthenticatedRequestBooking,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.validatedQuery) throw new Error("Query belum divalidasi");

    const roles = req.user?.roles || [];
    let mentorId: string | undefined;

    if (roles.includes("admin")) {
      mentorId = req.validatedQuery.mentorId; // opsional
    } else if (roles.includes("mentor")) {
      if (!req.user?.mentorProfileId) {
        throw new Error("MentorProfileId tidak ditemukan");
      }
      mentorId = req.user.mentorProfileId; // selalu dari JWT
    } else {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const result = await BookingService.getMentorMenteeStats({ mentorId });

    res.status(200).json({
      message: "Berhasil mengambil rekap mentee per service.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
