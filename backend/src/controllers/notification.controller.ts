import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestFeedback } from "../middlewares/authenticate";
import { format } from "date-fns";
import { HttpError } from "../utils/httpError";
import * as NotificationService from "../services/notification.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createNotificationController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const notification = await NotificationService.createNotification(
    req.validatedBody
  );
  res
    .status(201)
    .json({ message: "Notifikasi berhasil dibuat", data: notification });
};
