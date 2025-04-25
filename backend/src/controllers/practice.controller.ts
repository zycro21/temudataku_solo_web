import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestPractice } from "../middlewares/authenticate";
import { format } from "date-fns";
import { HttpError } from "../utils/httpError";
import * as PracticeService from "../services/practice.service";
import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient();

export const createPractice = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await PracticeService.createPractice(req.validatedBody!);

    res.status(201).json({
      success: true,
      message: "Practice berhasil dibuat",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
