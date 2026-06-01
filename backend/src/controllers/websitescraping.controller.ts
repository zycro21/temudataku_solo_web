import { Request, Response, NextFunction } from "express";
import * as JobService from "../services/websitescraping.service.js";

export const getJobs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      page = 1,
      limit = 30,
      jobTitle,
      country,
      level,
      workType,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = (req as any).validatedQuery;

    const result = await JobService.getJobs({
      page,
      limit,
      jobTitle,
      country,
      level,
      workType,
      sortBy,
      sortOrder,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
