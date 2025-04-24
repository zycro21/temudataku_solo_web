import { PrismaClient, Prisma } from "@prisma/client";


const prisma = new PrismaClient();

export const createMentorProfile = async (data: {
  userId: string;
  expertise?: string;
  bio?: string;
  experience?: string;
  availabilitySchedule?: any;
  hourlyRate?: number;
}) => {
  const { userId, ...profileData } = data;

  // 1. Cek apakah user ada
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 2. Cek apakah user punya role mentor
  const isMentor = user.userRoles.some((ur) => ur.role.roleName === "mentor");

  if (!isMentor) {
    throw new Error("User does not have 'mentor' role");
  }

  // 3. Cek apakah mentor profile sudah ada
  const existing = await prisma.mentorProfile.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new Error("Mentor profile already exists");
  }

  // 4. Generate custom ID
  const customId = `Mentor-${userId}`;

  // 5. Tambahkan default value manual jika field tidak dikirim
  const {
    expertise = "",
    bio = "",
    experience = "",
    availabilitySchedule = {},
    hourlyRate = 0,
  } = profileData;

  // 6. Create mentor profile
  const newProfile = await prisma.mentorProfile.create({
    data: {
      id: customId,
      userId,
      expertise,
      bio,
      experience,
      availabilitySchedule,
      hourlyRate,
    },
  });

  return newProfile;
};

export const getOwnMentorProfile = async (userId: string) => {
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          profilePicture: true,
          city: true,
          province: true,
        },
      },
    },
  });

  if (!profile) {
    throw new Error("Mentor profile not found");
  }

  return profile;
};

export const updateMentorProfile = async (data: {
  userId: string;
  expertise?: string;
  bio?: string;
  experience?: string;
  availabilitySchedule?: any;
  hourlyRate?: number;
}) => {
  const { userId, ...updateData } = data;

  // 1. Cek user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 2. Cek apakah role mentor
  const isMentor = user.userRoles.some((ur) => ur.role.roleName === "mentor");
  if (!isMentor) {
    throw new Error("User does not have 'mentor' role");
  }

  // 3. Ambil profile lama
  const existingProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });

  if (!existingProfile) {
    throw new Error("Mentor profile not found");
  }

  // 4. Deteksi perubahan
  const changedData: Record<string, any> = {};
  const changedFields: string[] = [];
  const unchangedFields: string[] = [];

  for (const key in updateData) {
    const newValue = updateData[key as keyof typeof updateData];
    const oldValue = existingProfile[key as keyof typeof existingProfile];

    const isDifferent =
      typeof newValue === "object"
        ? JSON.stringify(newValue) !== JSON.stringify(oldValue)
        : newValue !== oldValue;

    if (newValue !== undefined && isDifferent) {
      changedData[key] = newValue;
      changedFields.push(key);
    } else if (newValue !== undefined) {
      unchangedFields.push(key);
    }
  }

  // Kalau tidak ada perubahan
  if (changedFields.length === 0) {
    return {
      message: `No changes detected${
        unchangedFields.length ? `: ${unchangedFields.join(", ")}` : ""
      }`,
      data: existingProfile,
    };
  }

  changedData.updatedAt = new Date();

  // 5. Update hanya field yang berubah
  const updatedProfile = await prisma.mentorProfile.update({
    where: { userId },
    data: changedData,
  });

  const messageParts: string[] = [];
  if (changedFields.length) {
    messageParts.push(`${changedFields.join(", ")} updated`);
  }
  if (unchangedFields.length) {
    messageParts.push(`no changes on ${unchangedFields.join(", ")}`);
  }

  return {
    message: messageParts.join(" and "),
    data: updatedProfile,
  };
};

export const getAllMentorProfiles = async ({
  page,
  limit,
  isVerified,
  name,
  sortBy,
  sortOrder,
}: {
  page: number;
  limit: number;
  isVerified?: boolean;
  name?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) => {
  const skip = (page - 1) * limit;

  const where: any = {
    ...(isVerified !== undefined && { isVerified }),
    ...(name && {
      user: {
        fullName: {
          contains: name,
          mode: "insensitive",
        },
      },
    }),
  };

  const [total, data] = await Promise.all([
    prisma.mentorProfile.count({ where }),
    prisma.mentorProfile.findMany({
      where,
      skip,
      take: limit, // ✅ sudah bertipe number, tidak error
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
            city: true,
            province: true,
            isEmailVerified: true,
            userRoles: {
              select: {
                role: {
                  select: { roleName: true },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
};

export const toggleVerificationStatus = async (
  userId: string,
  isVerified: boolean
) => {
  const mentor = await prisma.mentorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!mentor) {
    const error = new Error("Mentor profile not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (mentor.isVerified === isVerified) {
    const error = new Error(
      `Mentor profile is already ${isVerified ? "verified" : "unverified"}`
    );
    (error as any).statusCode = 400;
    throw error;
  }

  const updated = await prisma.mentorProfile.update({
    where: { userId },
    data: {
      isVerified,
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return updated;
};

export const getPublicMentors = async ({
  page,
  limit,
  search,
  province,
  city,
  expertise,
  availabilityDay,
  sortBy = "registrationDate",
  order = "desc",
}: {
  page: number;
  limit: number;
  search?: string;
  province?: string;
  city?: string;
  expertise?: string;
  availabilityDay?: string;
  sortBy?: "fullName" | "registrationDate" | "hourlyRate";
  order?: "asc" | "desc";
}) => {
  const skipCount = (page - 1) * limit;

  // Handle sort field map
  const sortFieldMap: Record<string, string> = {
    hourlyRate: "mp.hourly_rate",
    fullName: "u.full_name",
    registrationDate: "u.registration_date",
  };

  const sortField = sortFieldMap[sortBy] || "u.registration_date";
  const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

  // Fetch data
  const mentorsQuery = Prisma.sql`
    SELECT
      mp.id,
      mp.expertise,
      mp.bio,
      mp.experience,
      mp.hourly_rate,
      mp.availability_schedule,
      u.id AS user_id,
      u.full_name,
      u.profile_picture,
      u.city,
      u.province,
      u.registration_date
    FROM mentor_profiles mp
    JOIN users u ON mp.user_id = u.id
    WHERE mp.is_verified = true AND u.is_active = true
    ${province ? Prisma.sql`AND u.province ILIKE ${province}` : Prisma.empty}
    ${city ? Prisma.sql`AND u.city ILIKE ${city}` : Prisma.empty}
    ${
      search
        ? Prisma.sql`AND (u.full_name ILIKE ${`%${search}%`} OR u.city ILIKE ${`%${search}%`})`
        : Prisma.empty
    }
    ${
      expertise
        ? Prisma.sql`AND mp.expertise ILIKE ${`%${expertise}%`}`
        : Prisma.empty
    }
    ${
      availabilityDay
        ? Prisma.sql`AND mp.availability_schedule ? ${availabilityDay}`
        : Prisma.empty
    }
    ORDER BY ${Prisma.raw(sortField)} ${Prisma.raw(sortOrder)}
    LIMIT ${limit}
    OFFSET ${skipCount}
  `;
  const mentors = await prisma.$queryRaw<
    {
      id: string;
      expertise: string | null;
      bio: string | null;
      experience: string | null;
      hourly_rate: number | null;
      availability_schedule: any;
      full_name: string;
      profile_picture: string | null;
      city: string | null;
      province: string | null;
      registration_date: string;
      user_id: string;
    }[]
  >(mentorsQuery);

  // Fetch total count
  const countQuery = Prisma.sql`
    SELECT COUNT(*)::bigint AS count
    FROM mentor_profiles mp
    JOIN users u ON mp.user_id = u.id
    WHERE mp.is_verified = true AND u.is_active = true
    ${province ? Prisma.sql`AND u.province ILIKE ${province}` : Prisma.empty}
    ${city ? Prisma.sql`AND u.city ILIKE ${city}` : Prisma.empty}
    ${
      search
        ? Prisma.sql`AND (u.full_name ILIKE ${`%${search}%`} OR u.city ILIKE ${`%${search}%`})`
        : Prisma.empty
    }
    ${
      expertise
        ? Prisma.sql`AND mp.expertise ILIKE ${`%${expertise}%`}`
        : Prisma.empty
    }
    ${
      availabilityDay
        ? Prisma.sql`AND mp.availability_schedule ? ${availabilityDay}`
        : Prisma.empty
    }
  `;
  const totalResult = await prisma.$queryRaw<{ count: bigint }[]>(countQuery);

  const total = Number(totalResult[0]?.count || 0);

  // Format result
  const formatted = mentors.map((m) => ({
    id: m.id,
    expertise: m.expertise,
    bio: m.bio,
    experience: m.experience,
    hourlyRate: m.hourly_rate,
    availabilitySchedule: m.availability_schedule,
    user: {
      id: m.user_id,
      fullName: m.full_name,
      profilePicture: m.profile_picture,
      city: m.city,
      province: m.province,
      registrationDate: m.registration_date,
    },
  }));

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    mentors: formatted,
  };
};

export const getMentorProfileById = async (id: string) => {
  const result = await prisma.mentorProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          profilePicture: true,
          city: true,
          province: true,
          registrationDate: true,
          lastLogin: true,
          isEmailVerified: true,
          isActive: true,
          userRoles: {
            select: {
              role: {
                select: {
                  roleName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!result) return null;

  return {
    id: result.id,
    expertise: result.expertise,
    bio: result.bio,
    experience: result.experience,
    hourlyRate: result.hourlyRate,
    availabilitySchedule: result.availabilitySchedule,
    isVerified: result.isVerified,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    user: {
      id: result.user.id,
      email: result.user.email,
      fullName: result.user.fullName,
      phoneNumber: result.user.phoneNumber,
      profilePicture: result.user.profilePicture,
      city: result.user.city,
      province: result.user.province,
      registrationDate: result.user.registrationDate,
      lastLogin: result.user.lastLogin,
      isEmailVerified: result.user.isEmailVerified,
      isActive: result.user.isActive,
      roles: result.user.userRoles.map((ur) => ur.role.roleName),
    },
  };
};

export const getPublicMentorProfileById = async (id: string) => {
  const result = await prisma.mentorProfile.findFirst({
    where: {
      id,
      isVerified: true,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          profilePicture: true,
          city: true,
          province: true,
        },
      },
    },
  });

  if (!result) return null;

  return {
    id: result.id,
    expertise: result.expertise,
    bio: result.bio,
    experience: result.experience,
    hourlyRate: result.hourlyRate,
    availabilitySchedule: result.availabilitySchedule,
    user: {
      id: result.user.id,
      fullName: result.user.fullName,
      profilePicture: result.user.profilePicture,
      city: result.user.city,
      province: result.user.province,
    },
  };
};

export const deleteMentorProfile = async (id: string) => {
  const existingProfile = await prisma.mentorProfile.findUnique({
    where: { id },
  });

  if (!existingProfile) {
    return null;
  }

  await prisma.mentorProfile.delete({
    where: { id },
  });

  return true;
};
