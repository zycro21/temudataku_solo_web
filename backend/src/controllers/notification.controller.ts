import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestNotification } from "../middlewares/authenticate";
import { format } from "date-fns";
import { HttpError } from "../utils/httpError";
import * as NotificationService from "../services/notification.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createNotificationController = async (
  req: AuthenticatedRequestNotification,
  res: Response,
  next: NextFunction
) => {
  try {
    const notification = await NotificationService.createNotification(
      req.validatedBody
    );
    res.status(201).json({
      message: "Notifikasi berhasil dibuat",
      data: notification,
    });
  } catch (error) {
    next(error); // biar masuk ke global error handler
  }
};

export const saveFcmTokenController = async (
  req: AuthenticatedRequestNotification,
  res: Response,
  next: NextFunction
) => {
  const { fcmToken } = req.body;
  const userId = req.user?.userId; // Ambil userId dari JWT token atau sesi

  if (!fcmToken) {
    res.status(400).json({ message: "FCM Token is required" });
    return;
  }

  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
    return;
  }

  try {
    const user = await NotificationService.saveFcmToken(userId, fcmToken); // Panggil service
    res.status(200).json({
      message: "FCM Token saved successfully",
      data: user,
    });
    return;
  } catch (error) {
    next(error); // Passing error ke global error handler
  }
};

export const getAdminNotificationsController = async (
  req: AuthenticatedRequestNotification,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.validatedQuery;
    const result = await NotificationService.getAdminNotifications(query);

    res.status(200).json({
      message: "Berhasil mengambil daftar notifikasi",
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminNotificationDetailController = async (
  req: AuthenticatedRequestNotification,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;

    const notification = await NotificationService.getNotificationDetailById(
      id
    );

    if (!notification) {
      res.status(404).json({ message: "Notifikasi tidak ditemukan" });
      return;
    }

    res.status(200).json({
      message: "Berhasil mengambil detail notifikasi",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationRecipientsController = async (
  req: AuthenticatedRequestNotification,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;

    const recipients = await NotificationService.getRecipientsByNotificationId(
      id
    );

    if (!recipients || recipients.length === 0) {
      res.status(404).json({ message: "Penerima notifikasi tidak ditemukan" });
      return;
    }

    res.status(200).json({
      message: "Berhasil mengambil data penerima notifikasi",
      data: recipients,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const resendNotificationController = async (
  req: AuthenticatedRequestNotification,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;
    const { userIds } = req.validatedBody;

    const result = await NotificationService.resendNotification(id, userIds);

    if (!result.success) {
      res.status(result.statusCode).json({ message: result.message });
      return;
    }

    res.status(200).json({
      message: "Notifikasi berhasil dikirim ulang",
      data: result.data,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const exportNotifications = async (
  req: AuthenticatedRequestNotification,
  res: Response,
  next: NextFunction
) => {
  try {
    const { format } = req.validatedQuery;

    const { fileBuffer, fileName, mimeType } =
      await NotificationService.exportNotifications(format);

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", mimeType);
    res.send(fileBuffer);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: AuthenticatedRequestNotification,
  res: Response,
  next: NextFunction
) => {
  try {
    const notificationId = req.validatedParams.id;
    const userId = req.user?.userId!;

    await NotificationService.markNotificationAsRead(notificationId, userId);

    res.status(200).json({ message: "Notification marked as read" });
    return;
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: AuthenticatedRequestNotification,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    await NotificationService.markAllNotificationsAsRead(userId);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  req: AuthenticatedRequestNotification,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const { page, limit, sortBy, sortOrder, isRead, type, search } =
      req.validatedQuery;

    const result = await NotificationService.getAllNotificationsByUser({
      userId,
      page,
      limit,
      sortBy,
      sortOrder,
      isRead: isRead ? isRead === "true" : undefined,
      type,
      search,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (
  req: AuthenticatedRequestNotification, // sudah include `user`
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const count = await NotificationService.getUnreadNotificationCount(userId);
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
};
