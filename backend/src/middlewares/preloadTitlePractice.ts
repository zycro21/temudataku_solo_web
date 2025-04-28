import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export const preloadPracticeTitle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const practice = await prisma.practice.findUnique({ where: { id } });

    if (!practice) {
      res.status(404).json({
        success: false,
        message: "Practice tidak ditemukan",
      });
      return;
    }

    // simpan title ke request object (bukan ke req.body)
    (req as any).practiceTitle = practice.title || "untitled";
    next();
  } catch (err) {
    next(err);
  }
};
