import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../middlewares/authenticate";
import { HttpError } from "../utils/httpError";
import * as AuthService from "../services/auth.service";
import * as UserService from "../services/user.service";
import { uploadPath } from "../middlewares/uploadImage";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authUserId = req.user?.userId;
    const roles = req.user?.roles || [];

    if (!authUserId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const targetUserId = (req.query.user_id as string) || authUserId;

    const isAdmin = roles.includes("admin");
    if (!isAdmin && targetUserId !== authUserId) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You can only update your own profile",
      });
      return;
    }

    const data = req.body;
    if (req.file) {
      data.profilePicture = req.file.filename;
    }

    const { updatedFields, skippedFields } =
      await UserService.updateUserProfile(targetUserId, data);

    res.status(200).json({
      success: true,
      message: `Profile updated successfully`,
      updatedFields,
      skippedFields,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRoles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = req.user?.userId;
    const { userId, roles_to_add = [], roles_to_remove = [] } = req.body;

    if (adminId === userId) {
      res.status(403).json({ message: "You cannot change your own roles" });
      return;
    }

    const result = await UserService.updateUserRoles(
      userId,
      roles_to_add,
      roles_to_remove
    );

    res.status(200).json({
      success: true,
      message: "User roles updated successfully",
      ...result,
    });
    return;
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = req.user?.userId;
    const { userId } = req.params;

    if (!adminId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await UserService.deleteUser(adminId, userId);

    res.status(200).json({
      success: true,
      message: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ambil dari validatedQuery jika ada, fallback ke req.query
    const query = req.validatedQuery ?? req.query;

    // Panggil service dengan query yang sudah tervalidasi
    const users = await UserService.getAllUsers(query);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await UserService.updateUsersStatus();
    res.status(200).json({
      success: true,
      message: "User statuses updated successfully.",
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

export const exportUsers = async (req: AuthenticatedRequest, res: Response) => {
  const query = req.validatedQuery ?? req.query;
  const { fileBuffer, filename, contentType } =
    await UserService.exportUsersToFile(query);

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", contentType);
  res.send(fileBuffer);
};

export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams ?? req.params;

    const user = await AuthService.getUserById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
};
