import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestForMentoringSession } from "../middlewares/authenticate";
import { format } from "date-fns";
import { HttpError } from "../utils/httpError";
import * as MentoringSessionService from "../services/mentoring_session.service";
import { uploadPath } from "../middlewares/uploadImage";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createMentoringSessionController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.validatedBody!;

    if (!data) {
      res.status(400).json({ message: "Body tidak valid" });
      return;
    }

    const session = await MentoringSessionService.createMentoringSession(data);

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
  next: NextFunction
) => {
  try {
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
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams!;
    const data = req.validatedBody!;

    const updatedSession = await MentoringSessionService.updateMentoringSession(
      id,
      data
    );

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
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams!;
    const { status } = req.validatedBody!;

    const updated = await MentoringSessionService.updateMentoringSessionStatus(
      id,
      status
    );

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
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams!;
    const { mentorProfileIds } = req.validatedBody!;

    const updated = await MentoringSessionService.updateMentoringSessionMentors(
      id,
      mentorProfileIds
    );

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
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams!;

    await MentoringSessionService.deleteMentoringSession(id);

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
  next: NextFunction
) => {
  try {
    const formatQuery = req.query.format === "csv" ? "csv" : "xlsx";
    const { buffer, mimeType, fileExtension } =
      await MentoringSessionService.exportMentoringSessions(formatQuery);

    // Gunakan timestamp lengkap agar filename unik setiap kali download
    const timestamp = format(new Date(), "yyyyMMdd-HHmmss");
    const filename = `mentoring-sessions-${timestamp}.${fileExtension}`;

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
  next: NextFunction
) => {
  try {
    const mentorId = req.user?.mentorProfileId;
    if (!mentorId) {
      res.status(403).json({ message: "Mentor profile not found" });
      return;
    }

    const sessions = await MentoringSessionService.getOwnMentorSessions(
      mentorId
    );
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

export const getMentorSessionDetailController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction
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
      mentorId
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
  next: NextFunction
) => {
  try {
    const mentorProfileId = req.user?.mentorProfileId;
    const sessionId = req.validatedParams?.id;
    const { status, meetingLink } = req.validatedBody as {
      status?: "scheduled" | "ongoing" | "completed" | "cancelled";
      meetingLink?: string;
    };

    // Cek apakah mentorProfileId dan sessionId ada
    if (!mentorProfileId || !sessionId) {
      res.status(400).json({
        message: "Mentor atau sesi tidak valid",
        status: "failed",
      });
      return;
    }

    // Coba untuk memperbarui sesi mentoring
    const updatedSession = await MentoringSessionService.updateByMentor({
      sessionId,
      mentorProfileId,
      updates: { status, meetingLink },
    });

    // Kirim respons sukses
    res.status(200).json({
      message: "Sesi mentoring berhasil diperbarui",
      status: "success",
      data: updatedSession,
    });
    return;
  } catch (error) {
    // Tangani kesalahan dan kirim respons kegagalan
    next(error);
  }
};

export const publicMentoringSessionController = async (
  req: AuthenticatedRequestForMentoringSession,
  res: Response,
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams!;

    const session = await MentoringSessionService.getPublicMentoringSessionById(id);

    res.status(200).json({
      message: "Berhasil mengambil detail sesi mentoring",
      data: session,
    });
    return;
  } catch (error) {
    next(error);
  }
};
