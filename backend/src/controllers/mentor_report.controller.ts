import { Response, NextFunction } from "express";
import { AuthenticatedRequestMentorReport } from "../middlewares/authenticate.js";
import * as MentorReportService from "../services/mentor_report.service.js";
import { logActivity } from "../utils/logActivtiy.js";

export const createMentorReport = async (
  req: AuthenticatedRequestMentorReport,
  res: Response,
  next: NextFunction,
) => {
  try {
    // hanya role mentor yang bisa
    if (!req.user?.roles.includes("mentor")) {
      res
        .status(403)
        .json({ message: "Hanya mentor yang dapat membuat laporan" });
      return;
    }

    const userId = req.user.userId;

    // validasi body wajib
    const {
      sessionId,
      understanding,
      participation,
      challenges,
      commonQuestions,
      nextFocus,
      additionalNotes,
    } = req.validatedBody || {};

    if (!sessionId || !understanding || !participation) {
      res.status(400).json({
        message: "sessionId, understanding, dan participation wajib diisi",
      });
      return;
    }

    const result = await MentorReportService.createMentorReport(userId, {
      sessionId,
      understanding,
      participation,
      challenges,
      commonQuestions,
      nextFocus,
      additionalNotes,
    });

    res.status(201).json({
      message: "Laporan mentor berhasil dibuat",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getMentorReports = async (
  req: AuthenticatedRequestMentorReport,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.userId;
    const roles = req.user.roles;

    const {
      page = "1",
      limit = "10000",
      sessionId,
      search,
      sortField,
      sortOrder,
    } = req.validatedQuery || {};

    const currentPage = parseInt(page, 10);
    const perPage = parseInt(limit, 10);

    const result = await MentorReportService.getMentorReports(
      userId,
      roles,
      currentPage,
      perPage,
      { sessionId, search },
      { field: sortField as any, order: sortOrder as any },
    );

    res.status(200).json({
      message: "Daftar laporan mentor berhasil diambil",
      ...result,
    });
    return;
  } catch (err) {
    next(err);
  }
};

export const getMentorReportById = async (
  req: AuthenticatedRequestMentorReport,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.userId;
    const roles = req.user.roles;
    const { id } = req.validatedParams || {};

    if (!id) {
      res.status(400).json({ message: "Parameter id wajib diisi" });
      return;
    }

    const result = await MentorReportService.getMentorReportById(
      userId,
      roles,
      id,
    );

    res.status(200).json({
      message: "Detail laporan mentor berhasil diambil",
      data: result,
    });
    return;
  } catch (err) {
    next(err);
  }
};

export const updateMentorReport = async (
  req: AuthenticatedRequestMentorReport,
  res: Response,
  next: NextFunction,
) => {
  try {
    // hanya mentor yang boleh
    if (!req.user?.roles.includes("mentor")) {
      res
        .status(403)
        .json({ message: "Hanya mentor yang dapat memperbarui laporan" });
      return;
    }

    const userId = req.user.userId;
    const { id } = req.validatedParams || {};

    if (!id) {
      res.status(400).json({ message: "Parameter id wajib diisi" });
      return;
    }

    if (!req.validatedBody || Object.keys(req.validatedBody).length === 0) {
      res.status(400).json({ message: "Tidak ada data yang diperbarui" });
      return;
    }

    const result = await MentorReportService.updateMentorReport(
      userId,
      id,
      req.validatedBody,
    );

    res.status(200).json({
      message: "Laporan mentor berhasil diperbarui",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMentorReport = async (
  req: AuthenticatedRequestMentorReport,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const adminId = req.user.userId;
    const rolesLog = req.user?.roles || [];

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.userId;
    const roles = req.user.roles;
    const { id } = req.validatedParams || {};

    if (!id) {
      res.status(400).json({ message: "Parameter id wajib diisi" });
      return;
    }

    const result = await MentorReportService.deleteMentorReport(
      userId,
      roles,
      id,
    );

    const adminRoles = ["admin", "cm", "curdev"];

    const isAdminLevel = rolesLog.some((role) =>
      adminRoles.includes(role.toLowerCase()),
    );

    if (isAdminLevel && adminId) {
      await logActivity({
        userId: req.user.userId,
        action: "DELETE_MENTOR_REPORT",
        type: "DELETE",
        description: `Admin-level (${rolesLog.join(", ")}) menghapus laporan mentor dengan ID: ${id}`,
        req,
      });
    }

    res.status(200).json(result);
    return;
  } catch (err) {
    next(err);
  }
};

export const exportMentorReports = async (
  req: AuthenticatedRequestMentorReport,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }

    const adminId = req.user.userId;
    const rolesLog = req.user?.roles || [];

    const adminRoles = ["admin", "cm", "curdev"];

    const isAdminLevel = rolesLog.some((role) =>
      adminRoles.includes(role.toLowerCase())
    );

    const format = req.validatedQuery?.format === "excel" ? "excel" : "csv";

    const { buffer, fileName, mimeType } =
      await MentorReportService.exportMentorReportsToFile(format);

    // log untuk semua admin-level roles
    if (isAdminLevel && adminId) {
      await logActivity({
        userId: adminId,
        action: "EXPORT_MENTOR_REPORTS",
        type: "EXPORT",
        description: `Admin-level (${rolesLog.join(
          ", "
        )}) melakukan export laporan mentor dalam format: ${format}`,
        req,
      });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", mimeType);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

export const getMentorReportsBySessionId = async (
  req: AuthenticatedRequestMentorReport,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.userId;
    const roles = req.user.roles;
    const { sessionId } = req.validatedParams || {};

    if (!sessionId) {
      res.status(400).json({ message: "Parameter sessionId wajib diisi" });
      return;
    }

    const reports = await MentorReportService.getMentorReportsBySessionId(
      userId,
      roles,
      sessionId,
    );

    res.status(200).json({
      message: "Laporan mentor berhasil diambil",
      data: reports,
    });
    return;
  } catch (err) {
    next(err);
  }
};

export const getMentorReportsByMentorProfileId = async (
  req: AuthenticatedRequestMentorReport,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const roles = req.user.roles;
    const { mentorProfileId } = req.validatedParams || {};

    if (!mentorProfileId) {
      res
        .status(400)
        .json({ message: "Parameter mentorProfileId wajib diisi" });
      return;
    }

    const reports = await MentorReportService.getMentorReportsByMentorProfileId(
      roles,
      mentorProfileId,
    );

    res.status(200).json({
      message: "Laporan mentor berhasil diambil",
      data: reports,
    });
  } catch (err) {
    next(err);
  }
};

export const getMentorReportStats = async (
  req: AuthenticatedRequestMentorReport,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { userId, roles } = req.user;

    const stats = await MentorReportService.getMentorReportStats(userId, roles);

    res.status(200).json({
      message: "Statistik laporan mentor berhasil diambil",
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};
