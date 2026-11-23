import { Request, Response, NextFunction } from "express";
import * as DataExportService from "../services/dataExport.service.js";

export const getAllData = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await DataExportService.getAllData();

    res.status(200).json({
      success: true,
      message: "All data retrieved successfully",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};