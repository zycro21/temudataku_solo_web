import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate } from "date-fns";

const prisma = new PrismaClient();

export const createMentoringService = async (input: {
  serviceName: string;
  description?: string;
  price: number;
  serviceType:
    | "one-on-one"
    | "group"
    | "bootcamp"
    | "shortclass"
    | "live class";
  maxParticipants?: number;
  durationDays: number;
  mentorProfileIds: string[];
}) => {
  const {
    serviceName,
    description,
    price,
    serviceType,
    maxParticipants,
    durationDays,
    mentorProfileIds,
  } = input;

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const typeSlug = slugify(serviceType);

  // 1. Cek duplikasi nama + type
  const duplicate = await prisma.mentoringService.findFirst({
    where: {
      serviceName,
      serviceType,
    },
  });

  if (duplicate) {
    throw new Error(
      "Mentoring service with this name and type already exists."
    );
  }

  // 2. Validasi mentorProfileIds
  const foundMentors = await prisma.mentorProfile.findMany({
    where: {
      id: { in: mentorProfileIds },
    },
    select: { id: true },
  });

  const foundIds = foundMentors.map((m) => m.id);
  const notFound = mentorProfileIds.filter((id) => !foundIds.includes(id));

  if (notFound.length > 0) {
    throw new Error(`Invalid mentor profile ID(s): ${notFound.join(", ")}`);
  }

  // 3. Gunakan transaksi
  const newService = await prisma.$transaction(async (tx) => {
    const existingCount = await tx.mentoringService.count({
      where: { serviceType },
    });

    const paddedNumber = String(existingCount + 1).padStart(6, "0");
    const generatedId = `${typeSlug}-${paddedNumber}`;

    const createdService = await tx.mentoringService.create({
      data: {
        id: generatedId,
        serviceName,
        description,
        price,
        serviceType,
        maxParticipants,
        durationDays,
        mentors: {
          create: mentorProfileIds.map((mentorProfileId) => ({
            mentorProfile: { connect: { id: mentorProfileId } },
          })),
        },
      },
      include: {
        mentors: true,
      },
    });

    return createdService;
  });

  return newService;
};

export const getAllMentoringServices = async ({
  page,
  limit,
  search,
  sortBy,
  order,
}: {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}) => {
  const skip = (page - 1) * limit;

  let whereClause: Prisma.MentoringServiceWhereInput = {};

  if (search) {
    whereClause = {
      OR: [
        {
          serviceName: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          serviceType: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
    };
  }

  const [total, data] = await prisma.$transaction([
    prisma.mentoringService.count({ where: whereClause }),
    prisma.mentoringService.findMany({
      where: whereClause,
      orderBy: {
        [sortBy || "createdAt"]: order || "desc",
      },
      skip,
      take: limit,
      include: {
        mentors: {
          include: {
            mentorProfile: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    total,
    page,
    limit,
    data: data.map((svc) => ({
      ...svc,
      mentors: svc.mentors.map((m) => ({
        mentorProfileId: m.mentorProfile.id,
        userId: m.mentorProfile.user.id,
        fullName: m.mentorProfile.user.fullName,
      })),
    })),
  };
};

export const getMentoringServiceDetailById = async (id: string) => {
  try {
    const service = await prisma.mentoringService.findUnique({
      where: { id },
      include: {
        certificates: true,
        mentors: {
          include: {
            mentorProfile: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profilePicture: true,
                  },
                },
              },
            },
          },
        },
        mentoringSessions: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            durationMinutes: true,
            status: true,
            notes: true,
          },
          take: 10, // Pagination: Ambil 10 sesi pertama
        },
      },
    });

    if (!service) {
      console.error(`Mentoring service with id ${id} not found.`);
      return null;
    }

    return {
      id: service.id,
      serviceName: service.serviceName,
      description: service.description,
      price: service.price,
      serviceType: service.serviceType,
      maxParticipants: service.maxParticipants,
      durationDays: service.durationDays,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      mentors: service.mentors.map((m) => ({
        mentorProfileId: m.mentorProfile.id,
        expertise: m.mentorProfile.expertise,
        isVerified: m.mentorProfile.isVerified,
        hourlyRate: m.mentorProfile.hourlyRate,
        availabilitySchedule: m.mentorProfile.availabilitySchedule,
        user: m.mentorProfile.user,
      })),
      sessions: service.mentoringSessions.length
        ? service.mentoringSessions.map((session) => ({
            sessionDate: session.startTime.toISOString(), // Format tanggal
            endTime: session.endTime.toISOString(),
            durationMinutes: session.durationMinutes,
            status: session.status,
            notes: session.notes,
          }))
        : [],
      certificates: service.certificates || [], // Jika tidak ada, return array kosong
    };
  } catch (error) {
    console.error("Error fetching mentoring service detail:", error);
    throw new Error("Something went wrong while fetching the data");
  }
};

export const updateMentoringServiceById = async (
  id: string,
  data: {
    serviceName?: string;
    description?: string | null;
    price?: number;
    maxParticipants?: number;
    durationDays?: number;
    isActive?: boolean;
    mentorProfileIds?: string[];
  }
) => {
  const {
    serviceName,
    description,
    price,
    maxParticipants,
    durationDays,
    isActive,
    mentorProfileIds,
  } = data;

  const existingService = await prisma.mentoringService.findUnique({
    where: { id },
    include: {
      mentors: {
        select: { mentorProfileId: true },
      },
    },
  });

  if (!existingService) {
    throw new Error("Mentoring service not found");
  }

  const updatePayload: any = {
    serviceName,
    description,
    price,
    maxParticipants,
    durationDays,
    isActive,
    updatedAt: new Date(),
  };

  // Hapus field yang undefined
  Object.keys(updatePayload).forEach(
    (key) => updatePayload[key] === undefined && delete updatePayload[key]
  );

  // Simpan field yang berubah
  const updatedFields: string[] = [];

  for (const key of Object.keys(updatePayload)) {
    const oldVal = (existingService as any)[key];
    const newVal = updatePayload[key];
    const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);
    if (isChanged) {
      updatedFields.push(key);
    }
  }

  // Jalankan transaksi
  await prisma.$transaction(async (tx) => {
    await tx.mentoringService.update({
      where: { id },
      data: updatePayload,
    });

    if (mentorProfileIds) {
      const existingMentors = await tx.mentorProfile.findMany({
        where: { id: { in: mentorProfileIds } },
        select: { id: true },
      });

      const existingIds = new Set(existingMentors.map((m) => m.id));
      const invalidIds = mentorProfileIds.filter((id) => !existingIds.has(id));

      if (invalidIds.length > 0) {
        throw new Error(`Invalid mentorProfileIds: ${invalidIds.join(", ")}`);
      }

      // Dapatkan mentor sebelumnya
      const oldMentorIds = existingService.mentors.map(
        (m) => m.mentorProfileId
      );
      const isMentorChanged =
        mentorProfileIds.length !== oldMentorIds.length ||
        !mentorProfileIds.every((id) => oldMentorIds.includes(id));

      if (isMentorChanged) {
        updatedFields.push("mentorProfileIds");
      }

      await tx.mentoringServiceMentor.deleteMany({
        where: { mentoringServiceId: id },
      });

      await tx.mentoringServiceMentor.createMany({
        data: mentorProfileIds.map((mentorProfileId) => ({
          mentoringServiceId: id,
          mentorProfileId,
        })),
        skipDuplicates: true,
      });
    }
  });

  const updatedService = await prisma.mentoringService.findUnique({
    where: { id },
    include: {
      certificates: true,
      mentors: {
        include: {
          mentorProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  profilePicture: true,
                },
              },
            },
          },
        },
      },
      mentoringSessions: {
        select: {
          id: true,
          startTime: true,
          endTime: true,
          durationMinutes: true,
          status: true,
          notes: true,
        },
        take: 10,
      },
    },
  });

  return {
    updatedFields,
    ...updatedService,
  };
};

export const deleteMentoringServiceById = async (id: string) => {
  const existingService = await prisma.mentoringService.findUnique({
    where: { id },
  });

  if (!existingService) {
    throw new Error("Mentoring service not found");
  }

  // Cek apakah ada sesi yang masih aktif
  const hasActiveSessions = await prisma.mentoringSession.findFirst({
    where: {
      serviceId: id, // ← gunakan nama field FK yang benar
      status: {
        in: ["scheduled", "ongoing"],
      },
    },
  });

  if (hasActiveSessions) {
    throw new Error("Cannot delete service with scheduled or ongoing sessions");
  }

  // Langsung hapus service (relasi lain akan ikut terhapus karena onDelete: Cascade)
  await prisma.$transaction(async (tx) => {
    await tx.mentoringService.delete({
      where: { id },
    });
  });
};

export const exportMentoringServicesToFile = async (
  exportFormat: "csv" | "excel"
): Promise<{ buffer: Buffer; filename: string; mimetype: string }> => {
  const services = await prisma.mentoringService.findMany({
    include: {
      mentors: {
        include: {
          mentorProfile: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const rows = services.map((service) => {
    // Mengambil data mentor dan memisahkan kolom berdasarkan koma
    const mentorIds = service.mentors.map((m) => m.mentorProfile.id).join(", ");
    const mentorNames = service.mentors
      .map((m) => m.mentorProfile.user.fullName)
      .join(", ");
    const mentorEmails = service.mentors
      .map((m) => m.mentorProfile.user.email)
      .join(", ");

    return {
      ID: service.id,
      "Service Name": service.serviceName,
      Description: service.description || "-",
      Price: service.price.toString(),
      "Max Participants": service.maxParticipants ?? "-",
      "Duration (Days)": service.durationDays,
      "Service Type": service.serviceType || "-",
      "Is Active": service.isActive ? "Yes" : "No",
      "Created At": formatDate(
        service.createdAt ?? new Date(),
        "yyyy-MM-dd HH:mm:ss"
      ),
      "Updated At": formatDate(
        service.updatedAt ?? new Date(),
        "yyyy-MM-dd HH:mm:ss"
      ),
      "Mentor IDs": mentorIds,
      "Mentor Names": mentorNames,
      "Mentor Emails": mentorEmails,
    };
  });

  if (exportFormat === "csv") {
    const csv = await parseAsync(rows);
    return {
      buffer: Buffer.from(csv, "utf-8"),
      filename: `mentoring_services_${Date.now()}.csv`,
      mimetype: "text/csv",
    };
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Mentoring Services");
  worksheet.columns = Object.keys(rows[0]).map((key) => ({
    header: key,
    key,
    width: 30,
  }));

  rows.forEach((row) => worksheet.addRow(row));

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return {
    buffer,
    filename: `mentoring_services_${Date.now()}.xlsx`,
    mimetype:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
};

export const getMentoringServicesByMentor = async (mentorId: string) => {
  try {
    // Ambil mentor profile berdasarkan userId
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: mentorId },
      include: {
        mentoringServices: {
          include: {
            mentoringService: {
              include: {
                mentors: {
                  include: {
                    mentorProfile: {
                      include: {
                        user: true, // Pastikan relasi 'user' juga disertakan
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!mentorProfile) {
      console.error(`Mentor profile with userId ${mentorId} not found.`);
      return null;
    }

    // Mengambil semua mentoring services yang terhubung dengan mentor
    const services = mentorProfile.mentoringServices.map(
      (serviceLink) => serviceLink.mentoringService
    );

    return services.map((service) => ({
      id: service.id,
      serviceName: service.serviceName,
      description: service.description,
      price: service.price,
      serviceType: service.serviceType,
      maxParticipants: service.maxParticipants,
      durationDays: service.durationDays,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      mentors: service.mentors.map((mentorLink) => ({
        mentorProfileId: mentorLink.mentorProfile.id,
        expertise: mentorLink.mentorProfile.expertise,
        isVerified: mentorLink.mentorProfile.isVerified,
        hourlyRate: mentorLink.mentorProfile.hourlyRate,
        availabilitySchedule: mentorLink.mentorProfile.availabilitySchedule,
        user: mentorLink.mentorProfile.user,
      })),
    }));
  } catch (error) {
    console.error("Error fetching mentoring services:", error);
    throw new Error("Something went wrong while fetching the data");
  }
};

export const getMentoringServiceDetailForMentor = async (
  serviceId: string,
  userId: string
) => {
  try {
    // 1. Ambil mentor profile berdasarkan userId
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });

    if (!mentorProfile) return null;

    // 2. Cek apakah dia bagian dari service tersebut
    const serviceLink = await prisma.mentoringServiceMentor.findFirst({
      where: {
        mentoringServiceId: serviceId,
        mentorProfileId: mentorProfile.id,
      },
    });

    if (!serviceLink) return null;

    // 3. Fetch detail service dengan relasi yang dibutuhkan
    const service = await prisma.mentoringService.findUnique({
      where: { id: serviceId },
      include: {
        mentors: {
          include: {
            mentorProfile: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profilePicture: true,
                  },
                },
              },
            },
          },
        },
        mentoringSessions: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            durationMinutes: true,
            status: true,
            notes: true,
          },
          orderBy: { startTime: "desc" },
        },
      },
    });

    if (!service) return null;

    // 4. Tipe eksplisit agar TS tidak error
    const detailedService = service as Prisma.MentoringServiceGetPayload<{
      include: {
        mentors: {
          include: {
            mentorProfile: {
              include: {
                user: true;
              };
            };
          };
        };
        mentoringSessions: true;
      };
    }>;

    return {
      id: detailedService.id,
      serviceName: detailedService.serviceName,
      description: detailedService.description,
      price: detailedService.price,
      serviceType: detailedService.serviceType,
      maxParticipants: detailedService.maxParticipants,
      durationDays: detailedService.durationDays,
      mentors: detailedService.mentors.map((m) => ({
        mentorProfileId: m.mentorProfile.id,
        expertise: m.mentorProfile.expertise,
        user: m.mentorProfile.user,
      })),
      sessions: detailedService.mentoringSessions.map((session) => ({
        id: session.id,
        sessionDate: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
        durationMinutes: session.durationMinutes,
        status: session.status,
        notes: session.notes,
      })),
    };
  } catch (error) {
    console.error("Error fetching mentoring service detail for mentor:", error);
    throw new Error("Something went wrong while fetching service detail");
  }
};

export const getPublicMentoringServices = async (
  page: number,
  limit: number,
  search?: string,
  expertise?: string
) => {
  try {
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      mentors: {
        some: {
          mentorProfile: {
            isVerified: true,
          },
        },
      },
    };

    if (search) {
      where.serviceName = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (expertise) {
      where.mentors = {
        some: {
          mentorProfile: {
            expertise: {
              contains: expertise,
              mode: "insensitive",
            },
          },
        },
      };
    }

    // total data untuk pagination
    const totalData = await prisma.mentoringService.count({ where });
    const totalPage = Math.ceil(totalData / limit);

    const services = await prisma.mentoringService.findMany({
      where,
      skip,
      take: limit,
      include: {
        mentors: {
          include: {
            mentorProfile: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    profilePicture: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const formatted = services.map((service) => ({
      id: service.id,
      serviceName: service.serviceName,
      description: service.description,
      price: service.price,
      serviceType: service.serviceType,
      maxParticipants: service.maxParticipants,
      mentors: service.mentors.map((m) => ({
        mentorProfileId: m.mentorProfile.id,
        expertise: m.mentorProfile.expertise,
        user: {
          id: m.mentorProfile.user.id,
          fullName: m.mentorProfile.user.fullName,
          profilePicture: m.mentorProfile.user.profilePicture,
        },
      })),
    }));

    return {
      data: formatted,
      totalData,
      totalPage,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching public mentoring services:", error);
    throw new Error(
      "Something went wrong while fetching public mentoring services."
    );
  }
};

export const getPublicMentoringServiceDetail = async (id: string) => {
  const service = await prisma.mentoringService.findFirst({
    where: {
      id,
      isActive: true,
      mentors: {
        some: {
          mentorProfile: {
            isVerified: true,
          },
        },
      },
    },
    include: {
      mentors: {
        include: {
          mentorProfile: {
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
          },
        },
      },
    },
  });

  if (!service) return null;

  return {
    id: service.id,
    serviceName: service.serviceName,
    description: service.description,
    price: service.price,
    serviceType: service.serviceType,
    maxParticipants: service.maxParticipants,
    durationDays: service.durationDays,
    mentors: service.mentors
      .filter((m) => m.mentorProfile?.isVerified)
      .map((m) => ({
        mentorProfileId: m.mentorProfile.id,
        expertise: m.mentorProfile.expertise,
        bio: m.mentorProfile.bio,
        experience: m.mentorProfile.experience,
        availabilitySchedule: m.mentorProfile.availabilitySchedule,
        hourlyRate: m.mentorProfile.hourlyRate,
        user: {
          id: m.mentorProfile.user.id,
          fullName: m.mentorProfile.user.fullName,
          profilePicture: m.mentorProfile.user.profilePicture,
          city: m.mentorProfile.user.city,
          province: m.mentorProfile.user.province,
        },
      })),
  };
};
