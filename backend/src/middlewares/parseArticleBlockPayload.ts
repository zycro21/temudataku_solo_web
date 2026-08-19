import { Request, Response, NextFunction } from "express";

export const parseArticleBlockPayload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (
      typeof req.body.contents === "string" &&
      req.body.contents.trim() !== ""
    ) {
      req.body.contents = JSON.parse(req.body.contents);
    }

    if (
      typeof req.body.additionalContents === "string" &&
      req.body.additionalContents.trim() !== ""
    ) {
      req.body.additionalContents = JSON.parse(req.body.additionalContents);
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
