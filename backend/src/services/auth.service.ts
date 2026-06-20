import { Prisma, PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { generateVerificationToken } from "../utils/tokenRegister.js";
import { HttpError } from "../utils/httpError.js";
import { sendEmailVerification } from "../utils/sendEmailVerification.js";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Generate referral code unik
async function generateUniqueReferralCode(email: string): Promise<string> {
  const username = email.split("@")[0];

  // Ambil hanya huruf A-Z (case-insensitive)
  const lettersOnly = username.replace(/[^a-zA-Z]/g, "");

  // Convert array huruf
  let letters = lettersOnly.toUpperCase().split("");

  // Jika huruf kurang dari 4 → tambahkan huruf random sampai 4
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  while (letters.length < 4) {
    const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
    letters.push(randomChar);
  }

  // Acak urutan huruf lalu ambil 4 pertama
  const picked = letters
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
    .join("");

  // 3 angka random
  const numbers = String(Math.floor(Math.random() * 1000)).padStart(3, "0");

  const finalCode = `${picked}-${numbers}`;

  // Cek duplikasi
  const existing = await prisma.referralCode.findUnique({
    where: { code: finalCode },
  });

  if (existing) {
    return generateUniqueReferralCode(email); // regenerate
  }

  return finalCode;
}

export const registerUser = async (data: {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  city?: string;
  province?: string;
  role?: string;
  profilePicture?: string;
  createdByAdmin?: boolean;
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
    createdByAdmin = false,
  } = data;

  const isAdminCreate = createdByAdmin === true;

  // ───────────────────────────────────────────────────────────────
  // 1️⃣ CEK APAKAH USER SUDAH ADA
  // ───────────────────────────────────────────────────────────────

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { userRoles: true },
  });

  if (existingUser) {
    // Jika user tidak punya password (Google account)
    if (!existingUser.passwordHash) {
      throw new HttpError(
        "This account was registered using Google. Please login with Google.",
        400,
      );
    }

    const isMatch = await comparePassword(password, existingUser.passwordHash);

    if (!isMatch) {
      throw new HttpError("Incorrect password for existing account", 401);
    }

    // Ambil semua role user
    const existingRoleNames = await prisma.userRole.findMany({
      where: { userId: existingUser.id },
      include: { role: true },
    });

    const currentRoles = existingRoleNames.map((r) => r.role.roleName);

    // 1️⃣ Jika role SUDAH ADA
    if (currentRoles.includes(role)) {
      return {
        user: existingUser,
        token: existingUser.verificationToken ?? null,
        status: "role_exists",
      };
    }

    // 2️⃣ Tambahkan role baru
    const roleData = await prisma.role.findUnique({
      where: { roleName: role },
    });

    if (!roleData) throw new HttpError("Role not found", 400);

    await prisma.userRole.create({
      data: {
        id: `${role}-${nanoid(10)}`,
        userId: existingUser.id,
        roleId: roleData.id,
      },
    });

    // ️⃣ Jika role adalah affiliator → buat referral code otomatis (jika belum ada)
    if (role === "affiliator") {
      const existingReferral = await prisma.referralCode.findFirst({
        where: { ownerId: existingUser.id },
      });

      if (!existingReferral) {
        const newCode = await generateUniqueReferralCode(email);

        await prisma.referralCode.create({
          data: {
            ownerId: existingUser.id,
            code: newCode,
            discountPercentage: new Prisma.Decimal(0),
            commissionPercentage: new Prisma.Decimal(0),
          },
        });
      }
    }

    return {
      user: existingUser,
      token: existingUser.verificationToken ?? null,
      status: "role_added",
    };
  }

  // ───────────────────────────────────────────────────────────────
  // 2️⃣ USER BARU → BUAT USER BARU
  // ───────────────────────────────────────────────────────────────

  const roleData = await prisma.role.findUnique({
    where: { roleName: role },
  });

  if (!roleData) throw new HttpError("Role not found", 400);

  // Limit admin
  if (role === "admin") {
    const totalAdmins = await prisma.userRole.count({
      where: { roleId: roleData.id },
    });
    if (totalAdmins >= 10) {
      throw new HttpError("Maximum number of admins reached", 400);
    }
  }

  // Password hash
  const hashed = await hashPassword(password);

  const token = generateVerificationToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  // Generate ID custom
  const lastUser = await prisma.user.findFirst({
    orderBy: { id: "desc" },
  });

  let newIdNumber = 1;
  if (lastUser && /^\d+$/.test(lastUser.id)) {
    newIdNumber = parseInt(lastUser.id) + 1;
  }

  const userId = String(newIdNumber).padStart(6, "0");

  const prefix = {
    mentee: "mentee",
    mentor: "mentor",
    affiliator: "aff",
    admin: "admin",
    cm: "cm",
    curdev: "curdev",
  }[role];

  const userRoleId = `${prefix}-${nanoid(10)}`;

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
      verificationToken: isAdminCreate ? null : token,
      verificationTokenExpires: isAdminCreate ? null : expires,
      isEmailVerified: isAdminCreate ? true : false,
      userRoles: {
        create: {
          id: userRoleId,
          roleId: roleData.id,
        },
      },
    },
    include: { userRoles: true },
  });

  // ️⃣ Jika user baru berperan sebagai affiliator → buat referral code otomatis
  if (role === "affiliator") {
    const newCode = await generateUniqueReferralCode(email);

    await prisma.referralCode.create({
      data: {
        ownerId: user.id,
        code: newCode,
        discountPercentage: new Prisma.Decimal(0),
        commissionPercentage: new Prisma.Decimal(0),
      },
    });
  }

  if (!isAdminCreate) {
    await sendEmailVerification(email, token);
  }

  return {
    user,
    token: isAdminCreate ? null : token,
    status: "new_user",
  };
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
      mentorProfile: {
        select: { id: true },
      },
    },
  });

  if (!user) {
    throw new HttpError("User not found", 404);
  }

  // Jika akun dibuat via Google (tidak punya password)
  if (!user.passwordHash) {
    throw new HttpError(
      "This account was registered using Google. Please login with Google.",
      400,
    );
  }

  const isMatch = await comparePassword(password, user.passwordHash);

  if (!isMatch) {
    throw new HttpError("Invalid credentials", 401);
  }

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
    include: {
      userRoles: {
        include: {
          role: true,
        },
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

  // ambil semua role user
  const roles = user.userRoles.map((ur) => ur.role.roleName);

  return roles;
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
      process.env.JWT_REFRESH_SECRET!,
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
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
    return user;
  } catch (err) {
    throw new Error("Error fetching user by email");
  }
};

export const updatePassword = async (userId: string, plainPassword: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Jika user sudah punya password, cek apakah sama
    if (user.passwordHash) {
      const isSame = await comparePassword(plainPassword, user.passwordHash);

      if (isSame) {
        throw new Error("New password must be different from the old password");
      }
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
  newPassword: string,
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

  // Jika user tidak punya password (akun OAuth)
  if (!user.passwordHash) {
    const error = new Error(
      "This account does not have a password. Please set a password instead.",
    );
    (error as any).status = 400;
    throw error;
  }

  const currentHash = user.passwordHash;

  const isMatch = await comparePassword(oldPassword, currentHash);
  if (!isMatch) {
    const error = new Error("Old password is incorrect");
    (error as any).status = 400;
    throw error;
  }

  const isSame = await comparePassword(newPassword, currentHash);
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

async function generateUserId(tx: Prisma.TransactionClient): Promise<string> {
  const lastUser = await tx.user.findFirst({
    orderBy: { id: "desc" },
  });

  let newIdNumber = 1;

  if (lastUser && /^\d+$/.test(lastUser.id)) {
    newIdNumber = parseInt(lastUser.id) + 1;
  }

  return String(newIdNumber).padStart(6, "0");
}

interface GoogleLoginInput {
  email: string;
  fullName: string;
  googleId: string;
  picture?: string;
}

export const googleLogin = async ({
  email,
  fullName,
  googleId,
  picture,
}: GoogleLoginInput) => {
  let user = await prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
      mentorProfile: {
        select: { id: true },
      },
    },
  });

  if (user) {
    return user;
  }

  const role = await prisma.role.findUnique({
    where: { roleName: "mentee" },
  });

  if (!role) {
    throw new Error("Role mentee tidak ditemukan");
  }

  const MAX_RETRY = 5;

  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const userId = await generateUserId(tx);

        return await tx.user.create({
          data: {
            id: userId,
            email,
            fullName,
            googleId,
            profilePicture: picture,
            isEmailVerified: true,
            userRoles: {
              create: {
                id: `mentee-${nanoid(10)}`,
                roleId: role.id,
              },
            },
          },
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
            mentorProfile: {
              select: { id: true },
            },
          },
        });
      });

      return result;
    } catch (error: any) {
      if (error.code === "P2002") {
        if (attempt === MAX_RETRY - 1) {
          throw new Error("Gagal membuat user setelah beberapa percobaan");
        }

        continue;
      }

      throw error;
    }
  }

  throw new Error("Google login gagal");
};
