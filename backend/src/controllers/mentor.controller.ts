import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authenticate.js";
// import { HttpError } from "../utils/httpError";
import * as MentorService from "../services/mentor.service.js";
// import { uploadPath } from "../middlewares/uploadImage";
import { PrismaClient } from "@prisma/client";
import { logActivity } from "../utils/logActivtiy.js";

const prisma = new PrismaClient();

export const createMentorProfile = async (
  req: AuthenticatedRequest,
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

    const { userId: bodyUserId, ...profileData } = req.body;
    const requester = req.user!;

    const isAdmin = requester.roles.includes("admin");
    const isMentor = requester.roles.includes("mentor");

    let targetUserId: string;

    // Hanya admin yang boleh menentukan userId di body
    if (isAdmin) {
      if (!bodyUserId) {
        res.status(400).json({ message: "userId is required for admin" });
        return;
      }
      targetUserId = bodyUserId;
    } else if (isMentor) {
      if (bodyUserId && bodyUserId !== requester.userId) {
        res
          .status(403)
          .json({ message: "Mentors cannot create profile for another user" });
        return;
      }
      targetUserId = requester.userId;
    } else {
      res.status(403).json({ message: "Unauthorized: Access denied" });
      return;
    }

    const newProfile = await MentorService.createMentorProfile({
      userId: targetUserId,
      ...profileData,
    });

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: adminId,
        action: "CREATE MENTOR PROFILE",
        type: "CREATE",
        description: `Admin membuat mentor profile untuk userId: ${targetUserId}`,
        req,
      });
    }

    res.status(201).json({ data: newProfile });
    return;
  } catch (err: any) {
    // Tangani error dari service
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
      return;
    }
    next(err);
  }
};

export const getOwnMentorProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;

    if (!roles.includes("mentor")) {
      res
        .status(403)
        .json({ message: "Access denied: only mentors can view this profile" });
      return;
    }

    const profile = await MentorService.getOwnMentorProfile(userId);

    res.json({ data: profile });
  } catch (err: any) {
    if (err instanceof Error) {
      res.status(404).json({ message: err.message });
      return;
    }
    next(err);
  }
};

export const updateMentorProfile = async (
  req: AuthenticatedRequest,
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

    const { userId: requesterId, roles } = req.user!;
    const queryUserId = req.query.userId as string | undefined;

    // Jika admin, boleh update siapa pun
    const isAdmin = roles.includes("admin");

    // Kalau mentor, hanya boleh update dirinya sendiri
    const targetUserId = isAdmin ? queryUserId || requesterId : requesterId;

    if (!isAdmin && queryUserId && queryUserId !== requesterId) {
      res.status(403).json({
        message: "Access denied: you cannot update another mentor's profile",
      });
      return;
    }

    const updatedProfile = await MentorService.updateMentorProfile({
      userId: targetUserId,
      ...req.body,
    });

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: adminId,
        action: "UPDATE MENTOR PROFILE",
        type: "UPDATE",
        description: `Admin mengupdate mentor profile userId: ${targetUserId}`,
        req,
      });
    }

    res.json({ data: updatedProfile });
  } catch (err: any) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      next(err);
    }
  }
};

export const getAllMentorProfiles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const roles = req.user.roles || [];

    // Role yang diperlakukan seperti admin
    const adminLikeRoles = ["admin", "cm", "curdev"];
    const isAdminLike = roles.some((role) => adminLikeRoles.includes(role));

    if (!isAdminLike) {
      res.status(403).json({
        message: "Forbidden. Admin, CM, atau Curdev only.",
      });
      return;
    }

    const {
      page = 1,
      limit = 10000,
      isVerified,
      name,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = (req as any).validatedQuery;

    const result = await MentorService.getAllMentorProfiles({
      page,
      limit,
      isVerified:
        isVerified === "true"
          ? true
          : isVerified === "false"
          ? false
          : undefined,
      name,
      sortBy,
      sortOrder,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const verifyMentorProfile = async (
  req: AuthenticatedRequest,
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

    const { id } = req.validatedParams!;
    const { isVerified } = req.validatedBody!;

    if (typeof isVerified !== "boolean") {
      res.status(400).json({
        success: false,
        message: "Field 'isVerified' is required and must be a boolean",
      });
      return;
    }

    const result = await MentorService.toggleVerificationStatus(id, isVerified);

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: adminId,
        action: "VERIFY_MENTOR_PROFILE",
        type: "UPDATE",
        description: `Admin ${
          isVerified ? "memverifikasi" : "membatalkan verifikasi"
        } mentor profile ID: ${id}`,
        req,
      });
    }

    res.json({
      success: true,
      message: `Mentor profile ${
        isVerified ? "verified" : "unverified"
      } successfully`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicMentors = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      page,
      limit,
      search,
      province,
      city,
      expertise,
      availabilityDay,
      sort_by,
      order,
    } = req.validatedQuery!;

    const result = await MentorService.getPublicMentors({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      province,
      city,
      expertise,
      availabilityDay,
      sortBy: sort_by as "fullName" | "registrationDate" | "hourlyRate",
      order: order as "asc" | "desc",
    });

    res.json({
      success: true,
      message: "Verified mentors retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getMentorProfileById = async (
  req: AuthenticatedRequest,
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

    const { id } = req.validatedParams!;

    const profile = await MentorService.getMentorProfileById(id);

    if (!profile) {
      res.status(404).json({
        success: false,
        message: "Mentor profile not found",
      });
      return;
    }

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: adminId,
        action: "GET_MENTOR_PROFILE_BY_ID",
        type: "READ",
        description: `Admin melihat detail mentor profile ID: ${id}`,
        req,
      });
    }

    res.json({
      success: true,
      message: "Mentor profile retrieved successfully",
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

export const getById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validatedParams!;

    const profile = await MentorService.getPublicMentorProfileById(id);

    if (!profile) {
      res.status(404).json({
        success: false,
        message: "Mentor not found or not verified",
      });
      return;
    }

    res.json({
      success: true,
      message: "Public mentor profile retrieved successfully",
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMentorProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validatedParams!;
    const result = await MentorService.deleteMentorProfile(id);

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Mentor profile not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Mentor profile deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getMentorsByService = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { serviceId } = (req as any).validatedParams;
    const roles = req.user?.roles || [];

    const result = await MentorService.getMentorsByService({
      serviceId,
      roles,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};
