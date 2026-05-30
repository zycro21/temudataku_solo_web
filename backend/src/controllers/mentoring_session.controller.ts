import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestForMentoringSession } from "../middlewares/authenticate.js";
import { format } from "date-fns";
// import { HttpError } from "../utils/httpError";
import * as MentoringSessionService from "../services/mentoring_session.service.js";
// import { uploadPath } from "../middlewares/uploadImage";
import { PrismaClient } from "@prisma/client";
import { logActivity } from "../utils/logActivtiy.js";

const prisma = new PrismaClient();

export const createMentoringSessionController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.validatedBody!;
    const userId = req.user?.userId!;

    if (!data) {
      res.status(400).json({ message: "Body tidak valid" });
      return;
    }

    const session = await MentoringSessionService.createMentoringSession(data);

    await logActivity({
      userId,
      action: "CREATE_MENTORING_SESSION",
      type: "CREATE",
      description: `Admin membuat sesi mentoring baru untuk serviceId=${data.serviceId} pada tanggal ${data.date}`,
      req,
    });

    res.status(201).json({
      message: "Sesi mentoring berhasil dibuat",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const getMentoringSessionsController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.userId;
    const roles = req.user.roles || [];

    // role yang diperlakukan seperti admin
    const adminLikeRoles = ["admin", "cm", "curdev"];
    const isAdminLike = roles.some((role) => adminLikeRoles.includes(role));

    if (!isAdminLike) {
      res.status(403).json({
        message: "Forbidden. Admin/CM/Curdev only.",
      });
      return;
    }

    const query = req.validatedQuery!;

    const sessions = await MentoringSessionService.getMentoringSessions({
      serviceId: query.serviceId,
      mentorProfileId: query.mentorProfileId,
      status: query.status,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit,
    });

    res.status(200).json({
      message: "Berhasil mengambil daftar sesi mentoring",
      data: sessions.data,
      pagination: sessions.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getMentoringSessionByIdController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validatedParams!;

    const session = await MentoringSessionService.getMentoringSessionById(id);

    res.status(200).json({
      message: "Berhasil mengambil detail sesi mentoring",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMentoringSessionController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validatedParams!;
    const data = req.validatedBody!;
    const userId = req.user?.userId!;
    const roles = req.user?.roles || [];

    const adminRoles = ["admin", "cm", "curdev"];
    const normalizedRoles = roles.map((r) => r.toLowerCase());

    const isAdminLike = normalizedRoles.some((role) =>
      adminRoles.includes(role),
    );

    const updatedSession = await MentoringSessionService.updateMentoringSession(
      id,
      data,
    );

    await logActivity({
      userId,
      action: "UPDATE MENTORING SESSION",
      type: "UPDATE",
      description: `${
        isAdminLike ? "Admin/CM/CurDev" : "User"
      } mengupdate sesi mentoring id=${id}`,
      req,
    });

    res.status(200).json({
      message: "Berhasil mengupdate sesi mentoring",
      data: updatedSession,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatusController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validatedParams!;
    const { status } = req.validatedBody!;
    const userId = req.user?.userId!;
    const roles = req.user?.roles || [];

    const adminRoles = ["admin", "cm", "curdev"];
    const isAdminLevel = roles.some((role) =>
      adminRoles.includes(role.toLowerCase()),
    );

    const updated = await MentoringSessionService.updateMentoringSessionStatus(
      id,
      status,
    );

    await logActivity({
      userId,
      action: "UPDATE MENTORING SESSION STATUS",
      type: "UPDATE",
      description: `${
        isAdminLevel ? "Admin-level user" : "User"
      } mengubah status sesi mentoring id=${id} menjadi "${status}"`,
      req,
    });

    res.status(200).json({
      message: "Status sesi berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSessionMentorsController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validatedParams!;
    const { mentorProfileIds } = req.validatedBody!;
    const userId = req.user?.userId!;
    const roles = req.user?.roles || [];

    const adminRoles = ["admin", "cm", "curdev"];
    const isAdminLevel = roles.some((role) =>
      adminRoles.includes(role.toLowerCase()),
    );

    const updated = await MentoringSessionService.updateMentoringSessionMentors(
      id,
      mentorProfileIds,
    );

    await logActivity({
      userId,
      action: "UPDATE_MENTORING_SESSION_MENTORS",
      type: "UPDATE",
      description: `${
        isAdminLevel ? "Admin-level user" : "User"
      } memperbarui daftar mentor pada sesi mentoring id=${id} menjadi [${mentorProfileIds.join(
        ", ",
      )}]`,
      req,
    });

    res.status(200).json({
      message: "Daftar mentor dalam sesi berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSessionController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validatedParams!;
    const userId = req.user?.userId!;
    const roles = req.user?.roles || [];

    await MentoringSessionService.deleteMentoringSession(id);

    const privilegedRoles = ["admin", "cm", "curdev"];
    const hasPrivilege = roles.some((role) => privilegedRoles.includes(role));

    if (hasPrivilege) {
      await logActivity({
        userId,
        action: "DELETE_MENTORING_SESSION",
        type: "DELETE",
        description: `User dengan role ${roles.join(
          ", ",
        )} menghapus sesi mentoring id=${id}`,
        req,
      });
    }

    res.status(200).json({
      message: "Sesi mentoring berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
};

export const exportSessionsController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.userId;
    const roles = req.user.roles || [];

    const adminLikeRoles = ["admin", "cm", "curdev"];
    const isAdminLike = roles.some((role) => adminLikeRoles.includes(role));

    if (!isAdminLike) {
      res.status(403).json({
        success: false,
        message: "Forbidden. Admin/CM/Curdev only.",
      });
      return;
    }

    const formatQuery = req.query.format === "csv" ? "csv" : "xlsx";

    const { buffer, mimeType, fileExtension } =
      await MentoringSessionService.exportMentoringSessions(formatQuery);

    const timestamp = format(new Date(), "yyyyMMdd-HHmmss");
    const filename = `mentoring-sessions-${timestamp}.${fileExtension}`;

    // optional logging
    await logActivity({
      userId,
      action: "ADMIN_EXPORT_MENTORING_SESSIONS",
      type: "EXPORT",
      description: `User export mentoring sessions dalam format ${formatQuery}`,
      req,
    });

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", mimeType);
    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

export const getMentorSessionsController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction,
) => {
  try {
    const mentorId = req.user?.mentorProfileId;
    if (!mentorId) {
      res.status(403).json({ message: "Mentor profile not found" });
      return;
    }

    const sessions =
      await MentoringSessionService.getOwnMentorSessions(mentorId);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

export const getMentorSessionDetailController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction,
) => {
  try {
    const mentorId = req.user?.mentorProfileId;
    const sessionId = req.validatedParams?.id;

    if (!mentorId) {
      res.status(403).json({ message: "Mentor profile not found" });
      return;
    }

    if (typeof sessionId !== "string") {
      res.status(400).json({ message: "Invalid session ID" });
      return;
    }

    const session = await MentoringSessionService.getMentorSessionDetail(
      sessionId,
      mentorId,
    );

    if (!session) {
      res.status(404).json({
        message: "Session not found or Access to this Session is Denied",
      });
      return;
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const updateMentorSessionController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction,
) => {
  try {
    const mentorProfileId = req.user?.mentorProfileId;
    const sessionId = req.validatedParams?.id;
    const { status, meetingLink, meetingId, passcode, pptLink, recordingLink } =
      req.validatedBody as {
        status?: "scheduled" | "ongoing" | "completed" | "cancelled";
        meetingLink?: string;
        meetingId?: string;
        passcode?: string;
        pptLink?: string;
        recordingLink?: string;
      };

    if (!mentorProfileId || !sessionId) {
      res.status(400).json({
        message: "Mentor atau sesi tidak valid",
        status: "failed",
      });
      return;
    }

    const updatedSession = await MentoringSessionService.updateByMentor({
      sessionId,
      mentorProfileId,
      updates: {
        status,
        meetingLink,
        meetingId,
        passcode,
        pptLink,
        recordingLink,
      },
    });

    res.status(200).json({
      message: "Sesi mentoring berhasil diperbarui",
      status: "success",
      data: updatedSession,
    });
  } catch (error) {
    next(error);
  }
};

export const publicMentoringSessionController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction,
) => {
  try {
    const serviceId = req.validatedParams?.serviceId!;

    console.log("Received serviceId:", serviceId);

    const {
      page = 1,
      limit = 10,
      sortBy = "date",
      sortOrder = "asc",
      search,
    } = req.validatedQuery || {};

    // Mapping sortBy dari query ke dalam daftar yang valid di service
    const validSortByOptions: ("date" | "rating")[] = ["date", "rating"];

    // Memastikan sortBy ada dalam valid options, jika tidak maka fallback ke "date"
    const mappedSortBy = validSortByOptions.includes(sortBy as any)
      ? (sortBy as "date" | "rating")
      : "date";

    // Mengirimkan request ke service dengan sortBy yang sudah di-mapping
    const result = await MentoringSessionService.getSessionsByServiceId({
      serviceId,
      page,
      limit,
      sortBy: mappedSortBy,
      sortOrder,
      search,
    });

    console.log("Sessions returned:", result.data);

    // Tentukan pesan berdasarkan apakah ada sesi atau tidak
    const message =
      result.data.length > 0
        ? "Berhasil mengambil daftar sesi mentoring berdasarkan service ID"
        : "Tidak ada sesi mentoring yang tersedia untuk service ini";

    res.status(200).json({
      message,
      data: result.data,
      pagination: result.pagination,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const publicGetMentoringSessionByIdController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validatedParams!;

    const session =
      await MentoringSessionService.getPublicMentoringSessionById(id);

    res.status(200).json({
      message: "Berhasil mengambil detail sesi mentoring",
      data: session,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getMentoringAvailabilityController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction
) => {
  try {
    const { mentorId, date } = req.validatedQuery!;

    const result =
      await MentoringSessionService.getMentoringAvailability({
        mentorId: mentorId!,
        date: date!,
      });

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil booked slot mentoring",
      data: result,
    });

    return;
  } catch (error) {
    next(error);
  }
};
