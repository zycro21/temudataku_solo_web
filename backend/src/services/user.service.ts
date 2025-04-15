import { PrismaClient } from "@prisma/client";
import { HttpError } from "../utils/httpError";
import { nanoid } from "nanoid";
import ExcelJS from "exceljs";
import { Parser } from "json2csv";

const prisma = new PrismaClient();

export const updateUserProfile = async (
  userId: string,
  newData: {
    email?: string;
    fullName?: string;
    phoneNumber?: string;
    city?: string;
    province?: string;
    profilePicture?: string;
  }
): Promise<{ updatedFields: string[]; skippedFields: string[] }> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error("User not found");
    (error as any).status = 404;
    throw error;
  }

  const dataToUpdate: typeof newData = {};
  const updatedFields: string[] = [];
  const skippedFields: string[] = [];

  for (const key in newData) {
    const typedKey = key as keyof typeof newData;
    const newValue = newData[typedKey];
    const currentValue = user[typedKey];

    if (newValue !== undefined) {
      if (newValue !== currentValue) {
        dataToUpdate[typedKey] = newValue;
        updatedFields.push(typedKey);
      } else {
        skippedFields.push(typedKey);
      }
    }
  }

  if (Object.keys(dataToUpdate).length === 0) {
    const error = new Error("No changes detected");
    (error as any).status = 400;
    throw error;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...dataToUpdate,
      updatedAt: new Date(),
    },
  });

  return { updatedFields, skippedFields };
};

export const updateUserRoles = async (
  userId: string,
  rolesToAdd: string[],
  rolesToRemove: string[]
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const addedRoles: string[] = [];
  const removedRoles: string[] = [];

  // Ambil semua role user saat ini
  const currentUserRoles = await prisma.userRole.findMany({
    where: { userId: userId },
    include: { role: true },
  });

  const currentRoleNames = currentUserRoles.map((ur) => ur.role.roleName);

  // VALIDASI: role yang ingin ditambahkan tidak boleh sudah dimiliki
  const duplicatedRoles = rolesToAdd.filter((r) =>
    currentRoleNames.includes(r)
  );
  if (duplicatedRoles.length > 0) {
    throw new Error(`User already has role(s): ${duplicatedRoles.join(", ")}`);
  }

  // VALIDASI: setelah penghapusan, user masih punya minimal 1 role
  const remainingRoles = currentRoleNames.filter(
    (r) => !rolesToRemove.includes(r)
  );
  if (remainingRoles.length === 0 && rolesToAdd.length === 0) {
    throw new Error(
      "User must have at least one role. You cannot remove all roles."
    );
  }

  // Add new roles
  for (const roleName of rolesToAdd) {
    const role = await prisma.role.findUnique({
      where: { roleName: roleName },
    });
    if (!role) continue;

    const existing = await prisma.userRole.findFirst({
      where: { userId: userId, roleId: role.id },
    });

    if (!existing) {
      // Generate ID custom
      const prefixMap: Record<string, string> = {
        mentee: "mentee",
        mentor: "mentor",
        affiliator: "aff",
        admin: "admin",
      };
      const prefix = prefixMap[roleName] || "role";
      const userRoleId = `${prefix}-${nanoid(10)}`;

      await prisma.userRole.create({
        data: {
          id: userRoleId,
          userId: userId,
          roleId: role.id,
        },
      });
      addedRoles.push(roleName);
    }
  }

  // Remove roles
  for (const roleName of rolesToRemove) {
    const role = await prisma.role.findUnique({
      where: { roleName: roleName },
    });
    if (!role) continue;

    const existing = await prisma.userRole.findFirst({
      where: { userId: userId, roleId: role.id },
    });

    if (existing) {
      await prisma.userRole.delete({ where: { id: existing.id } });
      removedRoles.push(roleName);
    }
  }

  return { addedRoles, removedRoles };
};

export const deleteUser = async (adminId: string, targetUserId: string) => {
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!targetUser) throw new Error("User not found");

  const targetRoles = targetUser.userRoles.map((ur) => ur.role.roleName);

  const isTargetAdmin = targetRoles.includes("admin");

  if (isTargetAdmin && adminId !== targetUserId) {
    throw new Error("You cannot delete another admin.");
  }

  await prisma.user.delete({
    where: { id: targetUserId },
  });

  return `User ${targetUser.email} deleted successfully`;
};

export const getAllUsers = async (query: any) => {
  const {
    page = "1",
    limit = "10",
    email,
    fullName,
    city,
    province,
    isActive,
    sort_by = "createdAt",
    order = "desc",
  } = query;

  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;

  const where: any = {};

  if (email) where.email = { contains: email, mode: "insensitive" };
  if (fullName) where.fullName = { contains: fullName, mode: "insensitive" };
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (province) where.province = { contains: province, mode: "insensitive" };
  if (isActive !== undefined) where.isActive = isActive === "true";

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sort_by]: order,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    }),
  ]);

  return {
    total,
    page: parseInt(page),
    total_pages: Math.ceil(total / take),
    users,
  };
};

export const updateUsersStatus = async () => {
  // Mendapatkan tanggal 30 hari yang lalu
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setMonth(thirtyDaysAgo.getMonth() - 1); // Mengurangi satu bulan dari tanggal sekarang

  // Mengambil semua pengguna yang belum login dalam 30 hari terakhir
  const usersToUpdate = await prisma.user.findMany({
    where: {
      lastLogin: {
        lt: thirtyDaysAgo, // Mengecek pengguna yang terakhir login sebelum 30 hari
      },
    },
  });

  // Perbarui status is_active menjadi false untuk pengguna yang belum login
  const updatedUsers = await prisma.user.updateMany({
    where: {
      id: {
        in: usersToUpdate.map((user) => user.id),
      },
    },
    data: {
      isActive: false,
    },
  });

  // Mengubah status is_active menjadi true untuk pengguna yang login dalam 30 hari terakhir
  await prisma.user.updateMany({
    where: {
      lastLogin: {
        gte: thirtyDaysAgo, // Pengguna yang terakhir login dalam 30 hari terakhir
      },
    },
    data: {
      isActive: true,
    },
  });

  return updatedUsers; // Mengembalikan data yang diperbarui
};

export const exportUsersToFile = async (query: any) => {
  const { email, fullName, city, province, isActive, format = "csv" } = query;

  const where: any = {};

  if (email) where.email = { contains: email, mode: "insensitive" };
  if (fullName) where.fullName = { contains: fullName, mode: "insensitive" };
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (province) where.province = { contains: province, mode: "insensitive" };
  if (isActive !== undefined) where.isActive = isActive === "true";

  // Tentukan tipe export berdasarkan ada/tidaknya filter
  const type =
    email || fullName || city || province || isActive !== undefined
      ? "filter"
      : "all";

  // Simpan log export dan hitung total sebelumnya
  const entity = "users";
  await prisma.exportLog.create({ data: { entity, type } });

  const count = await prisma.exportLog.count({ where: { entity, type } });
  const paddedCount = String(count).padStart(5, "0");

  const extension = format === "excel" ? "xlsx" : "csv";
  const filename = `${entity}${
    type === "filter" ? "-filter" : ""
  }-${paddedCount}.${extension}`;

  const users = await prisma.user.findMany({
    where,
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  const formatted = users.map((user) => ({
    ID: user.id,
    Email: user.email,
    FullName: user.fullName,
    PhoneNumber: user.phoneNumber,
    City: user.city,
    Province: user.province,
    IsEmailVerified: user.isEmailVerified,
    RegistrationDate: user.registrationDate,
    LastLogin: user.lastLogin,
    IsActive: user.isActive,
    Roles: user.userRoles.map((ur) => ur.role.roleName).join(", "),
  }));

  if (format === "excel") {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    worksheet.columns = Object.keys(formatted[0] || {}).map((key) => ({
      header: key,
      key,
    }));

    worksheet.addRows(formatted);

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      fileBuffer: buffer,
      filename,
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  } else {
    const parser = new Parser();
    const csv = parser.parse(formatted);

    return {
      fileBuffer: Buffer.from(csv, "utf-8"),
      filename,
      contentType: "text/csv",
    };
  }
};
