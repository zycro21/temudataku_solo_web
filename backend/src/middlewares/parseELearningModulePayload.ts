// middlewares/parseELearningModulePayload.ts

import { Request, Response, NextFunction } from "express";

export const parseELearningModulePayload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (typeof req.body.blocks === "string" && req.body.blocks.trim() !== "") {
      req.body.blocks = JSON.parse(req.body.blocks);
    }

    if (typeof req.body.quiz === "string" && req.body.quiz.trim() !== "") {
      req.body.quiz = JSON.parse(req.body.quiz);
    }

    if (
      typeof req.body.assignment === "string" &&
      req.body.assignment.trim() !== ""
    ) {
      req.body.assignment = JSON.parse(req.body.assignment);
    }

    if (typeof req.body.orderNumber === "string") {
      req.body.orderNumber = Number(req.body.orderNumber);
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Format JSON tidak valid",
    });
  }
};
