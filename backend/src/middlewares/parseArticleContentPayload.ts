import { Request, Response, NextFunction } from "express";

export const parseArticleContentPayload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (typeof req.body.blocks === "string" && req.body.blocks.trim() !== "") {
      req.body.blocks = JSON.parse(req.body.blocks);
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Format JSON tidak valid",
    });
  }
};
