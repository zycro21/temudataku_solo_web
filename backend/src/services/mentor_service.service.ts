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
  benefits?: string;
  mechanism?: string;
  syllabusPath?: string;
  toolsUsed?: string;
  targetAudience?: string;
  schedule?: string;
  alumniPortfolio?: any;
  category?: string;
  level?: string;
  isActive?: boolean;
  testimonials?: any;
}) => {
  const {
    serviceName,
    description,
    price,
    serviceType,
    maxParticipants,
    durationDays,
    mentorProfileIds,
    benefits,
    mechanism,
    syllabusPath,
    toolsUsed,
    targetAudience,
    schedule,
    alumniPortfolio,
    category,
    level,
    isActive,
    testimonials,
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
      "Mentoring service with this name and type already exists.",
    );
  }

  const typesRequireMentor = ["bootcamp", "shortclass", "live class"] as const;

  if (typesRequireMentor.includes(serviceType as any)) {
    if (!mentorProfileIds || mentorProfileIds.length === 0) {
      throw new Error(`${serviceType} service must include at least 1 mentor.`);
    }
  }

  // 2. Validasi mentorProfileIds
  if (mentorProfileIds && mentorProfileIds.length > 0) {
    const foundMentors = await prisma.mentorProfile.findMany({
      where: { id: { in: mentorProfileIds } },
      select: { id: true },
    });

    const foundIds = foundMentors.map((m) => m.id);
    const notFound = mentorProfileIds.filter((id) => !foundIds.includes(id));

    if (notFound.length > 0) {
      throw new Error(`Invalid mentor profile ID(s): ${notFound.join(", ")}`);
    }
  }

  // 3. Gunakan transaksi
  const newService = await prisma.$transaction(async (tx) => {
    const lastService = await tx.mentoringService.findFirst({
      where: { serviceType },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    let nextNumber = 1;

    if (lastService) {
      const lastNumber = parseInt(lastService.id.split("-").pop() || "0", 10);
      nextNumber = lastNumber + 1;
    }

    const paddedNumber = String(nextNumber).padStart(6, "0");
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
        benefits,
        mechanism,
        syllabusPath,
        toolsUsed,
        targetAudience,
        schedule,
        category,
        level,
        isActive,
        alumniPortfolio,
        testimonials,

        ...(mentorProfileIds && mentorProfileIds.length > 0
          ? {
              mentors: {
                create: mentorProfileIds.map((mentorProfileId) => ({
                  mentorProfile: { connect: { id: mentorProfileId } },
                })),
              },
            }
          : {}),
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
            date: true,
            startTime: true,
            endTime: true,
            durationMinutes: true,
            status: true,
            notes: true,
          },
          take: 10,
        },
        bookings: {
          select: {
            id: true,
            menteeId: true,
            status: true,
            bookingDate: true,
            specialRequests: true,
            mentee: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          take: 50,
        },
      },
    });

    if (!service) {
      console.error(`Mentoring service with id ${id} not found.`);
      return null;
    }

    // 🔥 Helper untuk parsing date-time lebih aman
    const parseDateTime = (date: string, time: string) => {
      const [day, month, year] = date.split("-");
      if (!day || !month || !year) return null;
      return new Date(`${year}-${month}-${day}T${time}`);
    };

    const totalBookings = service.bookings.filter(
      (booking) => booking.status === "confirmed",
    ).length;

    const remainingSlots = service.maxParticipants
      ? Math.max(0, service.maxParticipants - totalBookings)
      : null;

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

      // Tambahan kolom dari tabel baru
      benefits: service.benefits,
      mechanism: service.mechanism,
      syllabusPath: service.syllabusPath,
      toolsUsed: service.toolsUsed,
      targetAudience: service.targetAudience,
      schedule: service.schedule,
      category: service.category,
      level: service.level,
      alumniPortfolio: service.alumniPortfolio ?? [],
      testimonials: service.testimonials ?? [],

      totalBookings,
      remainingSlots,
      mentors: service.mentors.map((m) => ({
        mentorProfileId: m.mentorProfile.id,
        expertise: m.mentorProfile.expertise,
        isVerified: m.mentorProfile.isVerified,
        hourlyRate: m.mentorProfile.hourlyRate,
        availabilitySchedule: m.mentorProfile.availabilitySchedule,
        user: m.mentorProfile.user,
      })),
      sessions: service.mentoringSessions.map((session) => {
        const startDateTime = parseDateTime(session.date, session.startTime);
        const endDateTime = parseDateTime(session.date, session.endTime);

        return {
          sessionId: session.id,
          sessionDate: startDateTime?.toISOString() ?? null,
          endTime: endDateTime?.toISOString() ?? null,
          durationMinutes: session.durationMinutes,
          status: session.status,
          notes: session.notes,
        };
      }),
      certificates: service.certificates || [],
      bookings: service.bookings.map((booking) => ({
        id: booking.id,
        menteeId: booking.menteeId,
        status: booking.status,
        bookingDate: booking.bookingDate,
        specialRequests: booking.specialRequests,
        mentee: {
          id: booking.mentee.id,
          fullName: booking.mentee.fullName,
          email: booking.mentee.email,
        },
      })),
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
    serviceType?:
      | "one-on-one"
      | "group"
      | "bootcamp"
      | "shortclass"
      | "live class";
    benefits?: string | null;
    mechanism?: string | null;
    syllabusPath?: string | null;
    toolsUsed?: string | null;
    targetAudience?: string | null;
    schedule?: string | null;
    category?: string;
    level?: string;
    alumniPortfolio?: any;
    testimonials?: any;
  },
) => {
  const {
    serviceName,
    description,
    price,
    maxParticipants,
    durationDays,
    isActive,
    mentorProfileIds,
    serviceType,
    benefits,
    mechanism,
    syllabusPath,
    toolsUsed,
    targetAudience,
    schedule,
    category,
    level,
    alumniPortfolio,
    testimonials,
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
    serviceType,
    benefits,
    mechanism,
    syllabusPath,
    toolsUsed,
    targetAudience,
    schedule,
    category,
    level,
    alumniPortfolio,
    testimonials,
    updatedAt: new Date(),
  };

  // Hapus key undefined agar tidak ditulis ulang
  Object.keys(updatePayload).forEach(
    (key) => updatePayload[key] === undefined && delete updatePayload[key],
  );

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

      // Cek apakah mentor berubah
      const oldMentorIds = existingService.mentors.map(
        (m) => m.mentorProfileId,
      );
      const isMentorChanged =
        mentorProfileIds.length !== oldMentorIds.length ||
        !mentorProfileIds.every((id) => oldMentorIds.includes(id));

      if (isMentorChanged) {
        updatedFields.push("mentorProfileIds");

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
          date: true,
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

  // Helper khusus MentoringSession (format dd-mm-yyyy)
  const parseDateTime = (date: string, time: string) => {
    if (!date || !time) return null;

    const [day, month, year] = date.split("-");
    if (!day || !month || !year) return null;

    return new Date(`${year}-${month}-${day}T${time}`);
  };

  const formattedSessions =
    updatedService?.mentoringSessions.map((session) => {
      const start = parseDateTime(session.date, session.startTime);
      const end = parseDateTime(session.date, session.endTime);

      return {
        id: session.id,
        sessionDate: start?.toISOString() ?? null,
        endTime: end?.toISOString() ?? null,
        durationMinutes: session.durationMinutes,
        status: session.status,
        notes: session.notes,
      };
    }) ?? [];

  return {
    updatedFields,
    ...updatedService,
    mentoringSessions: formattedSessions,
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
  exportFormat: "csv" | "excel",
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
      Price: service.price?.toString() ?? "0",
      "Service Type": service.serviceType || "-",
      Category: service.category || "-",
      Level: service.level || "-",
      "Max Participants": service.maxParticipants ?? "-",
      "Duration (Days)": service.durationDays,
      Benefits: service.benefits || "-",
      Mechanism: service.mechanism || "-",
      "Syllabus Path": service.syllabusPath || "-",
      "Tools Used": service.toolsUsed || "-",
      "Target Audience": service.targetAudience || "-",
      Schedule: service.schedule || "-",

      // JSON → stringify supaya tidak jadi [object Object]
      "Alumni Portfolio": service.alumniPortfolio
        ? JSON.stringify(service.alumniPortfolio)
        : "-",

      Testimonials: service.testimonials
        ? JSON.stringify(service.testimonials)
        : "-",

      "Is Active": service.isActive ? "Yes" : "No",

      "Created At": formatDate(
        service.createdAt ?? new Date(),
        "yyyy-MM-dd HH:mm:ss",
      ),
      "Updated At": formatDate(
        service.updatedAt ?? new Date(),
        "yyyy-MM-dd HH:mm:ss",
      ),

      "Mentor IDs": mentorIds || "-",
      "Mentor Names": mentorNames || "-",
      "Mentor Emails": mentorEmails || "-",
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

  if (rows.length === 0) {
    return {
      buffer: Buffer.from("No mentoring services found", "utf-8"),
      filename: `mentoring_services_${Date.now()}.txt`,
      mimetype: "text/plain",
    };
  }

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
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: mentorId },
      include: {
        mentoringServices: {
          include: {
            mentoringService: {
              include: {
                mentoringSessions: true, // ⬅ include sessions
                mentors: {
                  include: {
                    mentorProfile: {
                      include: {
                        user: true,
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

    if (!mentorProfile) return [];

    const today = new Date();
    const todayFormatted = `${String(today.getDate()).padStart(2, "0")}-${String(
      today.getMonth() + 1,
    ).padStart(2, "0")}-${today.getFullYear()}`;

    const services = mentorProfile.mentoringServices
      .map((link) => link.mentoringService)

      // ✅ FILTER: hanya yang punya session
      .filter((service) => service.mentoringSessions.length > 0)

      // ✅ FILTER: hanya yang punya session >= hari ini
      .filter((service) =>
        service.mentoringSessions.some((session) => {
          const [day, month, year] = session.date.split("-");
          const sessionDate = new Date(`${year}-${month}-${day}`);
          return (
            sessionDate >=
            new Date(todayFormatted.split("-").reverse().join("-"))
          );
        }),
      );

    return services.map((service) => ({
      id: service.id,
      serviceName: service.serviceName,
      description: service.description,
      price: Number(service.price), // ✅ Decimal → number
      serviceType: service.serviceType,
      maxParticipants: service.maxParticipants,
      durationDays: service.durationDays,
      benefits: service.benefits,
      mechanism: service.mechanism,
      syllabusPath: service.syllabusPath,
      toolsUsed: service.toolsUsed,
      targetAudience: service.targetAudience,
      schedule: service.schedule,
      alumniPortfolio: service.alumniPortfolio,
      category: service.category, // ✅ tambahan
      level: service.level, // ✅ tambahan
      testimonials: service.testimonials, // ✅ tambahan
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,

      mentoringSessions: service.mentoringSessions, // optional kalau mau kirim ke frontend

      mentors: service.mentors.map((mentorLink) => ({
        mentorProfileId: mentorLink.mentorProfile.id,
        expertise: mentorLink.mentorProfile.expertise,
        isVerified: mentorLink.mentorProfile.isVerified,
        hourlyRate: mentorLink.mentorProfile.hourlyRate,
        availabilitySchedule: mentorLink.mentorProfile.availabilitySchedule,
        user: {
          id: mentorLink.mentorProfile.user.id,
          fullName: mentorLink.mentorProfile.user.fullName,
          email: mentorLink.mentorProfile.user.email,
          profilePicture: mentorLink.mentorProfile.user.profilePicture,
        },
      })),
    }));
  } catch (error) {
    console.error("Error fetching mentoring services:", error);
    throw new Error("Something went wrong while fetching the data");
  }
};

export const getMentoringServiceDetailForMentor = async (
  serviceId: string,
  userId: string,
) => {
  try {
    // 1️⃣ Ambil mentor profile
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });

    if (!mentorProfile) return null;

    // 2️⃣ Pastikan dia bagian dari service
    const isOwner = await prisma.mentoringServiceMentor.findFirst({
      where: {
        mentoringServiceId: serviceId,
        mentorProfileId: mentorProfile.id,
      },
    });

    if (!isOwner) return null;

    // 3️⃣ Fetch service lengkap
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
        mentoringSessions: true,
      },
    });

    if (!service) return null;

    // 🔥 FILTER SESSION >= TODAY
    const today = new Date();
    const upcomingSessions = service.mentoringSessions
      .map((session) => {
        const [day, month, year] = session.date.split("-");
        const formattedDate = `${year}-${month}-${day}`;
        const startDateTime = new Date(`${formattedDate}T${session.startTime}`);
        const endDateTime = new Date(`${formattedDate}T${session.endTime}`);

        return {
          raw: session,
          startDateTime,
          endDateTime,
        };
      })
      .filter((session) => session.startDateTime >= today)

      // 🔥 SORT by real datetime
      .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());

    // OPTIONAL: kalau mau detail hanya muncul kalau ada upcoming session
    if (upcomingSessions.length === 0) {
      return null;
    }

    return {
      id: service.id,
      serviceName: service.serviceName,
      description: service.description,
      price: Number(service.price), // ✅ Decimal fix
      serviceType: service.serviceType,
      maxParticipants: service.maxParticipants,
      durationDays: service.durationDays,
      benefits: service.benefits,
      mechanism: service.mechanism,
      syllabusPath: service.syllabusPath,
      toolsUsed: service.toolsUsed,
      targetAudience: service.targetAudience,
      schedule: service.schedule,
      alumniPortfolio: service.alumniPortfolio,
      category: service.category, // ✅ tambahan
      level: service.level, // ✅ tambahan
      testimonials: service.testimonials, // ✅ tambahan
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,

      mentors: service.mentors.map((m) => ({
        mentorProfileId: m.mentorProfile.id,
        expertise: m.mentorProfile.expertise,
        user: m.mentorProfile.user,
      })),

      sessions: upcomingSessions.map((session) => ({
        id: session.raw.id,
        sessionDate: session.startDateTime.toISOString(),
        endTime: session.endDateTime.toISOString(),
        durationMinutes: session.raw.durationMinutes,
        status: session.raw.status,
        notes: session.raw.notes,
      })),
    };
  } catch (error) {
    console.error("Error fetching mentoring service detail:", error);
    throw new Error("Something went wrong while fetching service detail");
  }
};

export const getPublicMentoringServices = async (
  page: number,
  limit: number,
  search?: string,
  expertise?: string,
  serviceType?: string,
) => {
  try {
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    const typesRequireVerifiedMentor = ["bootcamp", "live class", "shortclass"];

    if (serviceType && typesRequireVerifiedMentor.includes(serviceType)) {
      where.mentors = {
        some: {
          mentorProfile: {
            isVerified: true,
            ...(expertise && {
              expertise: {
                contains: expertise,
                mode: "insensitive",
              },
            }),
          },
        },
      };
    } else if (expertise) {
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

    if (search) {
      where.serviceName = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (serviceType) {
      where.serviceType = serviceType;
    }

    let finalLimit = limit;
    let orderBy: any = {
      createdAt: "desc", // default tetap terbaru
    };
    let additionalWhere: any = {};

    if (serviceType === "one-on-one" || serviceType === "group") {
      additionalWhere.bookings = {
        none: {}, // belum pernah dibooking
      };

      finalLimit = 1; // paksa 1
    }

    const totalData = await prisma.mentoringService.count({
      where: {
        ...where,
        ...additionalWhere,
      },
    });

    const totalPage = Math.ceil(totalData / limit);

    const services = await prisma.mentoringService.findMany({
      where: {
        ...where,
        ...additionalWhere,
      },
      skip,
      take: finalLimit,
      orderBy,
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
      price: Number(service.price),
      serviceType: service.serviceType,
      maxParticipants: service.maxParticipants,
      durationDays: service.durationDays,
      benefits: service.benefits,
      mechanism: service.mechanism,
      syllabusPath: service.syllabusPath,
      toolsUsed: service.toolsUsed,
      targetAudience: service.targetAudience,
      schedule: service.schedule,
      alumniPortfolio: service.alumniPortfolio,

      // ✅ TAMBAHAN
      category: service.category,
      level: service.level,
      testimonials: service.testimonials,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,

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
      "Something went wrong while fetching public mentoring services.",
    );
  }
};

export const getPublicBootcamps = async (
  page: number,
  limit: number,
  search?: string,
  category?: string,
  level?: string,
  expertise?: string,
) => {
  try {
    const skip = (page - 1) * limit;

    const today = new Date();
    const fiveDaysLater = new Date();
    fiveDaysLater.setDate(today.getDate() + 1);

    const parseDDMMYYYY = (dateString: string) => {
      const [day, month, year] = dateString.split("-");
      return new Date(Number(year), Number(month) - 1, Number(day));
    };

    const where: any = {
      isActive: true,
      serviceType: "bootcamp",
      mentors: {
        some: {
          mentorProfile: {
            isVerified: true,
            ...(expertise && {
              expertise: {
                contains: expertise,
                mode: "insensitive",
              },
            }),
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

    if (category) {
      where.category = {
        equals: category,
        mode: "insensitive",
      };
    }

    if (level) {
      where.level = {
        equals: level,
        mode: "insensitive",
      };
    }

    const services = await prisma.mentoringService.findMany({
      where,
      include: {
        bookings: {
          where: {
            status: {
              in: ["confirmed"],
            },
          },
        },
        mentoringSessions: true,
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

    // 🔥 FILTER LOGIC FIXED
    const filtered = services.filter((service) => {
      // 1️⃣ CEK KUOTA
      if (
        service.maxParticipants &&
        service.bookings.length >= service.maxParticipants
      ) {
        return false;
      }

      // 2️⃣ HARUS PUNYA SESSION
      if (
        !service.mentoringSessions ||
        service.mentoringSessions.length === 0
      ) {
        return false;
      }

      // 🔥 SORT SEMUA SESSION (BUKAN HANYA FUTURE)
      const sortedSessions = [...service.mentoringSessions].sort(
        (a, b) =>
          parseDDMMYYYY(a.date).getTime() - parseDDMMYYYY(b.date).getTime(),
      );

      const firstSessionDate = parseDDMMYYYY(sortedSessions[0].date);

      // NORMALISASI TODAY KE JAM 00:00
      const normalizedToday = new Date();
      normalizedToday.setHours(0, 0, 0, 0);

      // 🔥 H-1 DARI TANGGAL SESSION PERTAMA
      const hMinusOneDate = new Date(firstSessionDate);
      hMinusOneDate.setDate(firstSessionDate.getDate() - 1);

      // 🔥 JIKA SUDAH MASUK H-1 ATAU LEWAT → HILANGKAN
      if (normalizedToday >= hMinusOneDate) {
        return false;
      }
      return true;
    });

    const totalData = filtered.length;
    const totalPage = Math.ceil(totalData / limit);

    const paginated = filtered.slice(skip, skip + limit);

    const formatted = paginated.map((service) => {
      // let nextSessionDate: string | null = null;
      // if (service.mentoringSessions.length > 0) {
      //   const sortedSessions = [...service.mentoringSessions].sort(
      //     (a, b) =>
      //       parseDDMMYYYY(a.date).getTime() - parseDDMMYYYY(b.date).getTime(),
      //   );

      //   nextSessionDate = sortedSessions[0].date;
      // }

      let sessionDateRange: string | null = null;
      if (service.mentoringSessions.length > 0) {
        const sortedSessions = [...service.mentoringSessions].sort(
          (a, b) =>
            parseDDMMYYYY(a.date).getTime() - parseDDMMYYYY(b.date).getTime(),
        );

        const firstDate = sortedSessions[0].date;
        const lastDate = sortedSessions[sortedSessions.length - 1].date;

        sessionDateRange =
          firstDate === lastDate ? firstDate : `${firstDate} - ${lastDate}`;
      }

      return {
        id: service.id,
        serviceName: service.serviceName,
        description: service.description,
        price: service.price,
        category: service.category,
        level: service.level,
        durationDays: service.durationDays,
        maxParticipants: service.maxParticipants,
        benefits: service.benefits,
        mechanism: service.mechanism,
        syllabusPath: service.syllabusPath,
        toolsUsed: service.toolsUsed,
        targetAudience: service.targetAudience,
        schedule: service.schedule,
        alumniPortfolio: service.alumniPortfolio,
        testimonials: service.testimonials,
        availableSlots: service.maxParticipants
          ? service.maxParticipants - service.bookings.length
          : null,
        // nextSessionDate,
        sessionDateRange,
        mentors: service.mentors.map((m) => ({
          mentorProfileId: m.mentorProfile.id,
          expertise: m.mentorProfile.expertise,
          user: {
            id: m.mentorProfile.user.id,
            fullName: m.mentorProfile.user.fullName,
            profilePicture: m.mentorProfile.user.profilePicture,
          },
        })),
      };
    });

    return {
      data: formatted,
      totalData,
      totalPage,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching public bootcamps:", error);
    throw new Error("Something went wrong while fetching public bootcamps.");
  }
};

export const getRecommendedBootcamps = async (
  menteeId: string,
  currentServiceId: string,
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minAllowedDate = new Date(today);
    minAllowedDate.setDate(today.getDate() + 1);

    const parseDDMMYYYY = (dateString: string) => {
      const [day, month, year] = dateString.split("-");
      return new Date(Number(year), Number(month) - 1, Number(day));
    };

    const services = await prisma.mentoringService.findMany({
      where: {
        isActive: true,
        serviceType: "bootcamp",
        id: {
          not: currentServiceId,
        },
      },
      include: {
        bookings: true,
        mentoringSessions: true,
      },
    });

    const filtered = services.filter((service) => {
      // ❌ User sudah booking confirmed
      const userConfirmedBooking = service.bookings.find(
        (b) =>
          b.menteeId === menteeId && b.status?.toLowerCase() === "confirmed",
      );
      if (userConfirmedBooking) return false;

      // ❌ Kuota penuh
      const confirmedCount = service.bookings.filter(
        (b) => b.status?.toLowerCase() === "confirmed",
      ).length;

      if (
        service.maxParticipants &&
        confirmedCount >= service.maxParticipants
      ) {
        return false;
      }

      // Ambil semua session dan urutkan dari paling awal
      const allSessionDates = service.mentoringSessions
        .map((s) => parseDDMMYYYY(s.date))
        .sort((a, b) => a.getTime() - b.getTime());

      if (allSessionDates.length === 0) return false;

      // Ambil session pertama
      const firstSessionDate = allSessionDates[0];

      // ❌ Kalau session pertama sudah hari ini atau sudah lewat → jangan tampilkan
      if (firstSessionDate <= today) {
        return false;
      }

      // ❌ H-1 rule (minimal daftar H-1 sebelum session pertama)
      if (firstSessionDate < minAllowedDate) {
        return false;
      }

      return true;
    });

    return filtered.map((service) => {
      const confirmedCount = service.bookings.filter(
        (b) => b.status?.toLowerCase() === "confirmed",
      ).length;

      return {
        id: service.id,
        serviceName: service.serviceName,
        price: service.price,
        category: service.category,
        level: service.level,
        toolsUsed: service.toolsUsed,
        availableSlots: service.maxParticipants
          ? service.maxParticipants - confirmedCount
          : null,
      };
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch recommended bootcamps");
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
      mentoringSessions: {
        orderBy: {
          date: "asc",
        },
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          durationMinutes: true,
          status: true,
          notes: true,
        },
      },
    },
  });

  if (!service) return null;

  const parseDDMMYYYY = (dateString: string) => {
    const [day, month, year] = dateString.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  let sessionDateRange: string | null = null;

  if (service.mentoringSessions.length > 0) {
    const sortedSessions = [...service.mentoringSessions].sort(
      (a, b) =>
        parseDDMMYYYY(a.date).getTime() - parseDDMMYYYY(b.date).getTime(),
    );

    const firstDate = sortedSessions[0].date;
    const lastDate = sortedSessions[sortedSessions.length - 1].date;

    sessionDateRange =
      firstDate === lastDate ? firstDate : `${firstDate} - ${lastDate}`;
  }

  let totalWeeks = 0;
  let totalProjects = 0;

  if (service.mentoringSessions.length > 0) {
    const sortedSessions = [...service.mentoringSessions].sort(
      (a, b) =>
        parseDDMMYYYY(a.date).getTime() - parseDDMMYYYY(b.date).getTime(),
    );

    const firstDate = parseDDMMYYYY(sortedSessions[0].date);
    const lastDate = parseDDMMYYYY(
      sortedSessions[sortedSessions.length - 1].date,
    );

    const diffTime = lastDate.getTime() - firstDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    totalWeeks = Math.ceil(diffDays / 7);
    totalProjects = Math.ceil(totalWeeks / 3);
  }

  return {
    id: service.id,
    serviceName: service.serviceName,
    description: service.description,
    price: service.price,
    serviceType: service.serviceType,
    maxParticipants: service.maxParticipants,
    durationDays: service.durationDays,
    benefits: service.benefits,
    mechanism: service.mechanism,
    syllabusPath: service.syllabusPath,
    toolsUsed: service.toolsUsed,
    targetAudience: service.targetAudience,
    schedule: service.schedule,
    alumniPortfolio: service.alumniPortfolio,
    category: service.category,
    level: service.level,
    testimonials: service.testimonials,
    isActive: service.isActive,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    sessionDateRange,
    totalWeeks,
    totalProjects,
    mentoringSessions: service.mentoringSessions,
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

function parseSessionDate(dateStr: string) {
  const clean = dateStr.trim();
  const [day, month, year] = clean.split("-").map(Number);

  const d = new Date(year, month - 1, day);
  d.setHours(0, 0, 0, 0);

  return d;
}

export const getNewServices = async (
  userId: string,
  {
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search?: string;
  },
) => {
  const skip = (page - 1) * limit;

  // 🔹 Ambil semua practiceId & mentoringServiceId yang sudah dibeli/dibooking

  // const purchasedPractices = await prisma.practicePurchase.findMany({
  //   where: { userId },
  //   select: { practiceId: true },
  // });

  const bookedServices = await prisma.booking.findMany({
    where: {
      menteeId: userId,
      status: "confirmed",
    },
    select: { mentoringServiceId: true },
  });

  // const purchasedPracticeIds = purchasedPractices.map((p) => p.practiceId);
  const bookedServiceIds = bookedServices.map((b) => b.mentoringServiceId);

  // ======================================================
  // 🔹 Ambil MentoringService
  // ======================================================

  const mentoringWhere: Prisma.MentoringServiceWhereInput = {
    isActive: true,
    id: { notIn: bookedServiceIds },
    serviceType: { in: ["bootcamp"] },
    ...(search && {
      serviceName: { contains: search, mode: "insensitive" },
    }),
  };

  const mentoringServices = await prisma.mentoringService.findMany({
    where: mentoringWhere,
    select: {
      id: true,
      serviceName: true,
      description: true,
      price: true,
      durationDays: true,
      benefits: true,
      serviceType: true,
      createdAt: true,
      mentoringSessions: {
        select: { date: true },
        orderBy: { date: "asc" },
      },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validMentoringServices = mentoringServices.filter((m) => {
    if (!m.mentoringSessions.length) return false;

    const sortedSessions = [...m.mentoringSessions].sort((a, b) => {
      return (
        parseSessionDate(a.date).getTime() - parseSessionDate(b.date).getTime()
      );
    });

    const firstSession = parseSessionDate(sortedSessions[0].date);

    return firstSession.getTime() >= today.getTime();
  });

  // ======================================================
  // 🔹 Ambil Practice (TIDAK DIPAKAI LAGI)
  // ======================================================

  // const practiceWhere: Prisma.PracticeWhereInput = {
  //   isActive: true,
  //   id: { notIn: purchasedPracticeIds },
  //   ...(search && {
  //     title: { contains: search, mode: "insensitive" },
  //   }),
  // };

  // const practices = await prisma.practice.findMany({
  //   where: practiceWhere,
  //   select: {
  //     id: true,
  //     title: true,
  //     description: true,
  //     price: true,
  //     category: true,
  //     mentorId: true,
  //     createdAt: true,
  //   },
  // });

  // ======================================================
  // 🔹 Mapping hasil
  // ======================================================

  const mentoringMapped = validMentoringServices.map((m) => {
    const sortedSessions = [...m.mentoringSessions].sort((a, b) => {
      return (
        parseSessionDate(a.date).getTime() - parseSessionDate(b.date).getTime()
      );
    });

    let dateStart: string | null = null;
    let dateEnd: string | null = null;

    if (sortedSessions.length > 0) {
      dateStart = sortedSessions[0].date;
      dateEnd = sortedSessions[sortedSessions.length - 1].date;
    }

    return {
      type: "mentoring",
      id: m.id,
      title: m.serviceName,
      description: m.description ?? "-",
      price: m.price,
      durationDays: m.durationDays,
      benefits: m.benefits,
      serviceType: m.serviceType,
      dateStart,
      dateEnd,
      schedule: "Online",
      createdAt: m.createdAt,
    };
  });

  // const practiceMapped = practices.map((p) => ({
  //   type: "practice",
  //   id: p.id,
  //   title: p.title,
  //   description: p.description ?? "-",
  //   price: p.price,
  //   category: p.category,
  //   mentorId: p.mentorId,
  //   dateStart: p.createdAt?.toISOString() ?? null,
  //   dateEnd: p.createdAt?.toISOString() ?? null,
  //   schedule: "Tugas Online",
  //   createdAt: p.createdAt,
  // }));

  // ======================================================
  // 🔹 Sorting
  // ======================================================

  const combined = mentoringMapped.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const total = combined.length;
  const paginated = combined.slice(skip, skip + limit);

  return {
    data: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
