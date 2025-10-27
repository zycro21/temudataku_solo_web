import { Response, NextFunction } from "express";
import { AuthenticatedRequestShortLink } from "../middlewares/authenticate.js";
import * as ShortLinkService from "../services/short_link.service.js";

export const createShortLinkController = async (
  req: AuthenticatedRequestShortLink,
  res: Response,
  next: NextFunction
) => {
  try {
    const { originalUrl, shortCode, expiresAt, isActive } = req.validatedBody!;

    if (!originalUrl) {
      // antisipasi edge case, walau harusnya tidak terjadi
      res.status(400).json({
        success: false,
        message: "originalUrl is required",
      });
      return;
    }

    const user = req.user;

    const created = await ShortLinkService.createShortLinkService({
      originalUrl, // sekarang pasti string
      shortCode,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isActive,
      createdById: user?.userId,
    });

    res.status(201).json({
      success: true,
      message: "Short link created successfully",
      data: created,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllShortLinksController = async (
  req: AuthenticatedRequestShortLink,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, sort_by, order } = req.validatedQuery!;

    const result = await ShortLinkService.getAllShortLinksService({
      search,
      sort_by,
      order,
    });

    res.status(200).json({
      success: true,
      message: "Short links retrieved successfully",
      total: result.length,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyShortLinksController = async (
  req: AuthenticatedRequestShortLink,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      sort_by = "createdAt",
      order = "desc",
    } = req.validatedQuery || {};

    const user = req.user!;

    const result = await ShortLinkService.getMyShortLinksService({
      userId: user.userId,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      sort_by,
      order,
    });

    res.json({
      success: true,
      message: "My short links retrieved",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getShortLinkByIdController = async (
  req: AuthenticatedRequestShortLink,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams || {};
    const user = req.user;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Missing short link ID",
      });
      return;
    }

    const result = await ShortLinkService.getShortLinkByIdService({
      id,
      requester: user,
    });

    res.status(200).json({
      success: true,
      message: "Short link retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    if (err.message === "Short link not found") {
      res.status(404).json({
        success: false,
        message: "Short link not found",
      });
      return;
    }
    if (err.message === "Unauthorized to view this short link") {
      res.status(401).json({
        success: false,
        message: "You are not authorized to view this short link",
      });
      return;
    }
    next(err);
  }
};

export const updateShortLinkController = async (
  req: AuthenticatedRequestShortLink,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams!;
    if (!id) throw new Error("Missing short link ID");

    const payload = req.validatedBody!;
    const user = req.user!;

    const updated = await ShortLinkService.updateShortLinkService({
      id,
      requesterUserId: user.userId,
      requesterRoles: user.roles,
      shortCode: payload.shortCode,
      expiresAt: payload.expiresAt,
      isActive: payload.isActive,
    });

    res.json({ success: true, message: "Short link updated", data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteShortLinkController = async (
  req: AuthenticatedRequestShortLink,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams || {};
    if (!id) throw new Error("Missing short link ID");

    const user = req.user!;
    await ShortLinkService.deleteShortLinkService({
      id,
      requesterUserId: user.userId,
      requesterRoles: user.roles,
    });

    res.json({
      success: true,
      message: "Short link deleted",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Public redirect controller: /s/:shortCode
 * - will increment clickCount (atomic)
 * - redirect to originalUrl or return 404/410
 */
export const redirectShortCodeController = async (
  req: AuthenticatedRequestShortLink,
  res: Response
) => {
  try {
    const { shortCode } = req.params;
    const url = await ShortLinkService.redirectShortCodeService(shortCode);

    // Redirect (301 for SEO-friendly permanent redirect)
    return res.redirect(301, url);
  } catch (err: any) {
    const msg = err.message || "Not found";

    if (msg.toLowerCase().includes("expired")) {
      res.status(410).send("Short link expired");
      return;
    }
    if (msg.toLowerCase().includes("disabled")) {
      res.status(404).send("Short link is disabled");
      return;
    }
    if (msg.toLowerCase().includes("not found")) {
      res.status(404).send("Short link not found");
      return;
    }

    res.status(500).send("Internal server error");
    return;
  }
};
