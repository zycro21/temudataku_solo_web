import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as AuthService from "../services/auth.service";
import { HttpError } from "../utils/httpError";
import { sendResetPasswordEmail } from "../utils/sendEmailVerification";
import { AuthenticatedRequest } from "../middlewares/authenticate";
import path from "path";
import fs from "fs";
import { uploadPath } from "../middlewares/uploadImage";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);

    const { email, password, fullName, role, phoneNumber, city, province } =
      req.body;

    // [3] Handle default image jika file tidak diupload
    const uploadedFileName = req.file?.filename ?? "default.jpg";

    const { user, token } = await AuthService.registerUser({
      email,
      password,
      fullName,
      role,
      phoneNumber,
      city,
      province,
      profilePicture: uploadedFileName,
    });

    // [2] Rename file dengan fs.promises.rename + try-catch
    if (req.file && user.id) {
      const oldPath = path.join(uploadPath, uploadedFileName);
      const ext = path.extname(uploadedFileName);
      const newFileName = `${role ?? "mentee"}-PP-${user.id}${ext}`;
      const newPath = path.join(uploadPath, newFileName);

      try {
        await fs.promises.rename(oldPath, newPath);

        // Update DB setelah rename berhasil
        await prisma.user.update({
          where: { id: user.id },
          data: {
            profilePicture: newFileName,
          },
        });
      } catch (renameError) {
        console.error("Error renaming profile picture:", renameError);
      }
    }

    // [4] Hide token in production
    const isDev = process.env.NODE_ENV === "development";

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        role: role ?? "mentee",
        profile_picture: user.profilePicture,
      },
      ...(isDev && { verification_token: token }),
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await AuthService.loginUser(email, password);

    // Ambil semua roles yang dimiliki user
    const roles = user.userRoles.map((ur) => ({
      role_id: ur.roleId,
      role_name: ur.role.roleName,
    }));

    const mentorProfileId = user.mentorProfile?.id ?? undefined;

    // Generate access token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        roles: roles.map((r) => r.role_name),
        mentorProfileId,
        email: user.email,
        phoneNumber: user.phoneNumber, // tambahkan ini
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        roles: roles.map((r) => r.role_name),
        mentorProfileId,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      process.env.JWT_REFRESH_SECRET!, // Tambahkan ini ke file .env kamu
      { expiresIn: "7d" }
    );

    // Set kedua token di cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 hari
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 hari
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        full_name: user.fullName,
        profile_picture: user.profilePicture,
        roles,
        mentorProfileId,
      },
      token: accessToken,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      throw new HttpError("Invalid verification token", 400);
    }

    await AuthService.verifyUser(token);
    res.status(200).json({ message: "Account verified successfully" });
  } catch (err) {
    next(err);
  }
};

export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      throw new HttpError("Email is required", 400);
    }

    await AuthService.resendVerificationEmail(email);

    res.status(200).json({ message: "Verification email resent successfully" });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    if (!refresh_token) {
      res
        .status(401)
        .json({ success: false, message: "No refresh token provided" });
      return;
    }

    const decoded = jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_SECRET!
    ) as {
      userId: string;
      roles: string[];
    };

    // Buat access token baru
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, roles: decoded.roles },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // Kirim token baru
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 hari
    });

    res.status(200).json({
      success: true,
      message: "Access token refreshed",
      token: newAccessToken,
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user!;

    const user = await AuthService.getUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // Cari user berdasarkan email
    const user = await AuthService.getUserByEmail(email);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Email not found",
      });
      return;
    }

    // Generate token untuk reset password
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_RESET_PASSWORD_SECRET!,
      { expiresIn: "1h" } // Token berlaku 1 jam
    );

    // Kirim email dengan token reset password
    await sendResetPasswordEmail(email, resetToken);

    // Response sukses
    res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  } catch (err) {
    next(err); // Passing error ke error handler
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password } = req.body;
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_RESET_PASSWORD_SECRET!) as {
        userId: string;
      };
    } catch (err) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
      return;
    }

    try {
      await AuthService.updatePassword(decoded.userId, password);
      res.status(200).json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reset password";
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    await AuthService.changePassword(userId, oldPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    next(err);
  }
};
