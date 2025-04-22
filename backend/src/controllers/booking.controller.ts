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
