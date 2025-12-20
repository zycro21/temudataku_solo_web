import { Response, NextFunction } from "express";
import * as ActivityLogService from "../services/adminActivityLog.service.js";
import { AuthenticatedRequestAdminActivityLog } from "../middlewares/authenticate.js";

export const getActivityLogs = async (
  req: AuthenticatedRequestAdminActivityLog,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await ActivityLogService.getActivityLogs(req.validatedQuery);

    res.json({
      message: "Berhasil mengambil activity logs.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityLogById = async (
  req: AuthenticatedRequestAdminActivityLog,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.validatedParams.id;
    const result = await ActivityLogService.getActivityLogById(id);

    res.json({
      message: "Berhasil mengambil activity log.",
      data: result,
    });
  } catch (error: any) {
    if (error.message === "NOT_FOUND") {
      res.status(404).json({
        message: "Activity log tidak ditemukan.",
      });
      return;
    }

    next(error);
  }
};

export const deleteActivityLog = async (
  req: AuthenticatedRequestAdminActivityLog,
  res: Response,
  next: NextFunction
) => {
  try {
    await ActivityLogService.deleteActivityLog(req.params.id);

    res.json({ message: "Activity log berhasil dihapus." });
  } catch (error) {
    next(error);
  }
};

export const clearActivityLogs = async (
  req: AuthenticatedRequestAdminActivityLog,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await ActivityLogService.clearActivityLogs();

    res.json({
      message: "Activity logs berhasil dihapus.",
      deleted: result.deleted,
    });
  } catch (error) {
    next(error);
  }
};
