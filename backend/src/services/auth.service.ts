import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import { generateVerificationToken } from "../utils/tokenRegister";
import { HttpError } from "../utils/httpError";
import { sendEmailVerification } from "../utils/sendEmailVerification";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const registerUser = async (data: {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  city?: string;
  province?: string;
  role?: string;
  profilePicture?: string;
}) => {
  const {
    email,
    password,
    fullName,
    role = "mentee",
    phoneNumber,
    city,
    province,
    profilePicture,
  } = data;

  // Cek apakah email sudah terdaftar
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new HttpError("Email is already registered", 409);
  }

  // Cek apakah role valid
  const roleData = await prisma.role.findUnique({
    where: { roleName: role },
  });

  if (!roleData) {
    throw new HttpError("Role not found", 400);
  }

  // Batas maksimal admin
  if (role === "admin") {
    const totalAdmins = await prisma.userRole.count({
      where: { roleId: roleData.id },
    });
    if (totalAdmins >= 10) {
      throw new HttpError("Maximum number of admins reached", 400);
    }
  }

  // Hash password
  const hashed = await hashPassword(password);
  const token = generateVerificationToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 jam

  // Generate Custom ID berdasarkan Role
  const prefix = {
    mentee: "mentee",
    mentor: "mentor",
    affiliator: "aff",
    admin: "admin",
  }[role];

  // Ambil angka terbesar ID yang ada untuk user
  const lastUser = await prisma.user.findFirst({
    orderBy: {
      id: "desc", // Urutkan berdasarkan ID terbesar
    },
    select: {
      id: true,
    },
  });

  // Ambil angka terakhir dari ID dan increment
  let newIdNumber = 1;
  if (lastUser && /^\d+$/.test(lastUser.id)) {
    // Mengonversi ID menjadi string dan mengincrement angka terakhir
    newIdNumber = parseInt(lastUser.id, 10) + 1;
  }

  // Format ID sesuai dengan format yang diinginkan (6 digit string)
  const userId = String(newIdNumber).padStart(6, "0");

  // Generate ID untuk user_roles dengan prefix dan angka acak
  const userRoleId = `${prefix}-${nanoid(10)}`;

  // Buat user + assign role
  const user = await prisma.user.create({
    data: {
      id: userId,
      email,
      passwordHash: hashed,
      fullName,
      phoneNumber,
      city,
      province,
      profilePicture,
      verificationToken: token,
      verificationTokenExpires: expires,
      isEmailVerified: false,
      userRoles: {
        create: {
          id: userRoleId,
          roleId: roleData.id,
        },
      },
    },
    include: {
      userRoles: true,
    },
  });

  await sendEmailVerification(email, token);
  return {
    user,
    token,
  } as const;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) throw new HttpError("User not found", 404);

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) throw new HttpError("Invalid credentials", 401);

  if (!user.isEmailVerified) {
    throw new HttpError("Please verify your email before logging in", 403);
  }

  return user;
};

export const verifyUser = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpires: {
        gte: new Date(),
      },
    },
  });

  if (!user) {
    throw new HttpError("Invalid or expired token", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  return true;
};

export const resendVerificationEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new HttpError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new HttpError("Email is already verified", 400);
  }

  const token = generateVerificationToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 jam dari sekarang

  // Simpan token dan expired baru
  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationToken: token,
      verificationTokenExpires: expires,
    },
  });

  await sendEmailVerification(email, token);
};

export const verifyRefreshToken = async (refreshToken: string) => {
  try {
    // Verifikasi refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as {
      userId: string;
      roles: string[];
    };

    // Cek apakah user ada di database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpError("User not found", 404);
    }

    return {
      userId: user.id,
      roles: user.userRoles.map((ur) => ur.role.roleName),
    };
  } catch (err) {
    throw new HttpError("Invalid or expired refresh token", 401);
  }
};

export const generateAccessToken = (userId: string, roles: string[]) => {
  return jwt.sign({ userId, roles }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
};

export const getUserById = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        profilePicture: true,
        city: true,
        province: true,
        isEmailVerified: true,
        registrationDate: true,
        lastLogin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                roleName: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return user;
  } catch (err) {
    throw new Error("Error fetching user data");
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (err) {
    throw new Error("Error fetching user by email");
  }
};

export const updatePassword = async (userId: string, plainPassword: string) => {
  try {
    // Ambil password lama
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Cek apakah password baru sama dengan yang lama
    const isSame = await comparePassword(plainPassword, user.passwordHash);
    if (isSame) {
      throw new Error("New password must be different from the old password");
    }

    // Hash password baru
    const hashedPassword = await hashPassword(plainPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Failed to update password");
    }
  }
};

export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    const error = new Error("User not found");
    (error as any).status = 404;
    throw error;
  }

  const isMatch = await comparePassword(oldPassword, user.passwordHash);
  if (!isMatch) {
    const error = new Error("Old password is incorrect");
    (error as any).status = 400;
    throw error;
  }

  const isSame = await comparePassword(newPassword, user.passwordHash);
  if (isSame) {
    const error = new Error("New password must be different from the old one");
    (error as any).status = 400;
    throw error;
  }

  const newHashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newHashed,
      updatedAt: new Date(),
    },
  });
};
