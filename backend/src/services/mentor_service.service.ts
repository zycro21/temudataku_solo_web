import { PrismaClient, Prisma } from "@prisma/client";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate } from "date-fns";
import fs from "fs";
import path from "path";
import { mentoringThumbnailPath } from "../middlewares/uploadImage.js";

const prisma = new PrismaClient();

export const createMentoringService = async (input: any) => {
  const {
    serviceName,
    description,
    price,
    strikePrice,
    durationDays,
    startDate,
    endDate,
    maxParticipants,
    mentorProfileIds,

    thumbnail,

    programAbout,
    totalWeeks,
    totalProjects,
    whatsappGroup,
    slug,
    isFeatured,

    category,
    level,
    isActive,

    sections,
    tools,
    schedules,
    portfolios,
    testimonials,
  } = input;

  const serviceType = input.serviceType || "bootcamp";

  if (serviceType === "bootcamp" && startDate && endDate) {
    if (new Date(endDate) < new Date(startDate)) {
      throw new Error("End date must be after start date");
    }
  }

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

  const finalSlug = slug || slugify(serviceName);

  // cek duplicate
  const duplicate = await prisma.mentoringService.findFirst({
    where: { serviceName, serviceType },
  });

  if (duplicate) {
    throw new Error("Mentoring service already exists.");
  }

  return await prisma.$transaction(async (tx) => {
    // generate ID
    const last = await tx.mentoringService.findFirst({
      where: { serviceType },
      orderBy: { createdAt: "desc" },
    });

    let next = 1;
    if (last) {
      next = parseInt(last.id.split("-").pop() || "0") + 1;
    }

    const id = `bootcamp-${String(next).padStart(6, "0")}`;

    // const generateId = async (tx: any, table: any, prefix: string) => {
    //   const last = await tx[table].findFirst({
    //     orderBy: { id: "desc" },
    //   });

    //   let next = 1;

    //   if (last?.id) {
    //     next = parseInt(last.id.split("-").pop() || "0") + 1;
    //   }

    //   return `${prefix}-${String(next).padStart(6, "0")}`;
    // };

    let finalDurationDays: number = 1;
    let finalStartDate: Date | null = null;
    let finalEndDate: Date | null = null;

    if (serviceType === "bootcamp") {
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
          throw new Error("End date must be after start date");
        }

        const diff = end.getTime() - start.getTime();

        finalDurationDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
        finalStartDate = start;
        finalEndDate = end;
      }
    } else {
      finalDurationDays = 1;
    }

    const created = await tx.mentoringService.create({
      data: {
        id,
        serviceName,
        description,
        thumbnail,
        price,
        strikePrice,
        serviceType,

        durationDays: finalDurationDays ?? undefined,
        startDate: finalStartDate ?? undefined,
        endDate: finalEndDate ?? undefined,
        maxParticipants,

        programAbout,
        totalWeeks,
        totalProjects,

        whatsappGroup,

        slug: finalSlug,
        isFeatured: isFeatured ?? false,

        category,
        level,
        isActive,

        // 🔥 SECTION
        sections: sections
          ? {
              create: await Promise.all(
                sections.map(async (s: any, i: number) => ({
                  // id: await generateId(tx, "mentoringSection", "section"),
                  type: s.type,
                  title: s.title,
                  content: {
                    title: s.title,
                    description: s.description,
                  },
                  order: i + 1,
                })),
              ),
            }
          : undefined,

        // 🔥 TOOLS
        tools: tools
          ? {
              create: await Promise.all(
                tools.map(async (t: string) => ({
                  // id: await generateId(tx, "mentoringTool", "tool"),
                  name: t,
                })),
              ),
            }
          : undefined,

        // 🔥 SCHEDULE
        schedules: schedules
          ? {
              create: await Promise.all(
                schedules.map(async (d: string) => ({
                  // id: await generateId(tx, "mentoringSchedule", "schedule"),
                  date: new Date(d),
                })),
              ),
            }
          : undefined,

        // 🔥 PORTFOLIO
        portfolios: portfolios
          ? {
              create: await Promise.all(
                portfolios.map(async (p: any) => ({
                  // id: await generateId(tx, "mentoringPortfolio", "portfolio"),
                  ...p,
                })),
              ),
            }
          : undefined,

        // 🔥 TESTIMONIAL
        testimonials: testimonials
          ? {
              create: await Promise.all(
                testimonials.map(async (t: any) => ({
                  // id: await generateId(
                  //   tx,
                  //   "mentoringTestimonial",
                  //   "testimonial",
                  // ),
                  ...t,
                })),
              ),
            }
          : undefined,

        // 🔥 MENTOR RELATION
        ...(mentorProfileIds?.length
          ? {
              mentors: {
                create: mentorProfileIds.map((id: string) => ({
                  mentorProfile: { connect: { id } },
                })),
              },
            }
          : {}),
      },
      include: {
        sections: true,
        tools: true,
        schedules: true,
        portfolios: true,
        testimonials: true,
        mentors: true,
      },
    });

    return created;
  });
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
        {
          category: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          level: {
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

        // ✅ TAMBAHAN BARU
        sections: {
          orderBy: { order: "asc" },
        },
        tools: true,
        schedules: true,
        portfolios: true,
        testimonials: true,
      },
    }),
  ]);

  return {
    total,
    page,
    limit,
    data: data.map((svc) => ({
      id: svc.id,
      serviceName: svc.serviceName,
      description: svc.description,
      whatsappGroup: svc.whatsappGroup,
      thumbnail: svc.thumbnail,
      serviceType: svc.serviceType,
      price: Number(svc.price),
      strikePrice: svc.strikePrice ? Number(svc.strikePrice) : null,
      maxParticipants: svc.maxParticipants,
      durationDays: svc.durationDays,
      startDate: svc.startDate?.toISOString() ?? null,
      endDate: svc.endDate?.toISOString() ?? null,

      isActive: svc.isActive,
      category: svc.category,
      level: svc.level,
      createdAt: svc.createdAt,

      // ✅ mentors
      mentors: svc.mentors.map((m) => ({
        mentorProfileId: m.mentorProfile.id,
        userId: m.mentorProfile.user.id,
        fullName: m.mentorProfile.user.fullName,
      })),

      // ✅ sections
      sections: svc.sections.map((s) => ({
        id: s.id,
        type: s.type,
        title: s.title,
        description: (s.content as any)?.description,
        order: s.order,
      })),

      // ✅ tools
      tools: svc.tools.map((t) => ({
        id: t.id,
        name: t.name,
      })),

      // ✅ schedules
      schedules: svc.schedules.map((s) => ({
        id: s.id,
        date: s.date,
      })),

      // ✅ portfolios
      portfolios: svc.portfolios.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        menteeName: p.menteeName,
        projectLink: p.projectLink,
        thumbnail: p.thumbnail,
      })),

      // ✅ testimonials
      testimonials: svc.testimonials.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        comment: t.comment,
        rating: t.rating,
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

        // ✅ TAMBAHAN BARU (WAJIB)
        sections: {
          orderBy: { order: "asc" },
        },
        tools: true,
        schedules: true,
        portfolios: true,
        testimonials: true,
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
      thumbnail: service.thumbnail,

      price: Number(service.price),
      strikePrice: service.strikePrice ? Number(service.strikePrice) : null,

      serviceType: service.serviceType,
      maxParticipants: service.maxParticipants,
      durationDays: service.durationDays,
      startDate: service.startDate?.toISOString() ?? null,
      endDate: service.endDate?.toISOString() ?? null,

      // ✅ NEW FIELDS (WAJIB DARI SCHEMA BARU)
      programAbout: service.programAbout,
      totalWeeks: service.totalWeeks,
      totalProjects: service.totalProjects,
      whatsappGroup: service.whatsappGroup,

      slug: service.slug,
      isFeatured: service.isFeatured,
      difficultyOrder: service.difficultyOrder,

      category: service.category,
      level: service.level,

      isActive: service.isActive,

      createdAt: service.createdAt,
      updatedAt: service.updatedAt,

      // Tambahan kolom dari tabel baru
      // ✅ SECTIONS (GROUP BY TYPE)
      sections: service.sections.map((s) => ({
        id: s.id,
        type: s.type,
        title: s.title,
        description: (s.content as any)?.description,
        order: s.order,
      })),

      // ✅ TOOLS
      tools: service.tools.map((t) => ({
        id: t.id,
        name: t.name,
      })),

      // ✅ SCHEDULES
      schedules: service.schedules.map((s) => ({
        id: s.id,
        date: s.date,
      })),

      // ✅ PORTFOLIOS
      portfolios: service.portfolios.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        menteeName: p.menteeName,
        projectLink: p.projectLink,
        thumbnail: p.thumbnail,
      })),

      // ✅ TESTIMONIALS
      testimonials: service.testimonials.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        comment: t.comment,
        rating: t.rating,
      })),

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
    strikePrice?: number;

    maxParticipants?: number;
    // durationDays?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;

    mentorProfileIds?: string[];
    thumbnail?: string;
    serviceType?:
      | "one-on-one"
      | "group"
      | "bootcamp"
      | "shortclass"
      | "live class";

    programAbout?: string;
    totalWeeks?: number;
    totalProjects?: number;

    whatsappGroup?: string;

    slug?: string;
    isFeatured?: boolean;

    category?: string;
    level?: string;

    sections?: {
      id?: string;
      type: "BENEFIT" | "MECHANISM" | "SYLLABUS" | "TARGET";
      title: string;
      description: string;
    }[];

    tools?: {
      id?: string;
      name: string;
    }[];

    schedules?: {
      id?: string;
      date: string;
    }[];

    portfolios?: {
      id?: string;
      title: string;
      description?: string;
      menteeName: string;
      projectLink: string;
      thumbnail?: string;
    }[];

    testimonials?: {
      id?: string;
      name: string;
      role?: string;
      comment: string;
      rating: number;
    }[];
  },
) => {
  const {
    serviceName,
    description,
    price,
    strikePrice,
    maxParticipants,
    // durationDays,
    startDate, // ✅ TAMBAHAN
    endDate, // ✅ TAMBAHAN
    isActive,
    mentorProfileIds,
    thumbnail,
    serviceType,

    programAbout,
    totalWeeks,
    totalProjects,
    whatsappGroup,
    slug,
    isFeatured,

    category,
    level,

    sections,
    tools,
    schedules,
    portfolios,
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

  if (thumbnail && existingService.thumbnail) {
    try {
      const oldPath = path.join(
        mentoringThumbnailPath,
        path.basename(existingService.thumbnail),
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log("Deleted old thumbnail:", oldPath);
      }
    } catch (err) {
      console.error("Gagal hapus thumbnail lama:", err);
    }
  }

  let finalDurationDays: number | undefined;
  let finalStartDate: Date | null | undefined;
  let finalEndDate: Date | null | undefined;

  // fallback ke existing kalau tidak dikirim
  const effectiveServiceType = serviceType ?? existingService.serviceType;
  const incomingStartDate = data.startDate;
  const incomingEndDate = data.endDate;

  if (effectiveServiceType === "bootcamp") {
    const start = incomingStartDate
      ? new Date(incomingStartDate)
      : existingService.startDate;

    const end = incomingEndDate
      ? new Date(incomingEndDate)
      : existingService.endDate;

    if (start && end) {
      if (end < start) {
        throw new Error("End date must be after start date");
      }

      const diff = end.getTime() - start.getTime();
      finalDurationDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      finalStartDate = start;
      finalEndDate = end;
    } else {
      // kalau salah satu kosong → null semua
      finalDurationDays = undefined;
      finalStartDate = null;
      finalEndDate = null;
    }
  } else {
    // selain bootcamp
    finalDurationDays = 1;
    finalStartDate = null;
    finalEndDate = null;
  }

  const updatePayload: any = {
    serviceName,
    description,
    price,
    strikePrice,
    maxParticipants,
    isActive,
    serviceType,

    durationDays: finalDurationDays,
    startDate: finalStartDate,
    endDate: finalEndDate,

    programAbout,
    totalWeeks,
    totalProjects,
    whatsappGroup,
    slug,
    isFeatured,

    category,
    level,

    thumbnail,

    updatedAt: new Date(),
  };

  // const generateId = async (tx: any, table: any, prefix: string) => {
  //   const last = await tx[table].findFirst({
  //     orderBy: { id: "desc" },
  //   });

  //   let next = 1;

  //   if (last?.id) {
  //     next = parseInt(last.id.split("-").pop() || "0") + 1;
  //   }

  //   return `${prefix}-${String(next).padStart(6, "0")}`;
  // };

  // remove undefined
  Object.keys(updatePayload).forEach(
    (key) => updatePayload[key] === undefined && delete updatePayload[key],
  );

  const updatedFields: string[] = [];

  for (const key of Object.keys(updatePayload)) {
    const oldVal = (existingService as any)[key];
    const newVal = updatePayload[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      updatedFields.push(key);
    }
  }

  await prisma.$transaction(async (tx) => {
    // ================= UPDATE MAIN =================
    await tx.mentoringService.update({
      where: { id },
      data: updatePayload,
    });

    // ================= MENTOR =================
    if (mentorProfileIds) {
      await tx.mentoringServiceMentor.deleteMany({
        where: { mentoringServiceId: id },
      });

      await tx.mentoringServiceMentor.createMany({
        data: mentorProfileIds.map((mentorProfileId) => ({
          mentoringServiceId: id,
          mentorProfileId,
        })),
      });

      updatedFields.push("mentorProfileIds");
    }

    // ================= SECTIONS =================
    if (sections) {
      const existing = await tx.mentoringSection.findMany({
        where: { serviceId: id },
      });

      const existingMap = new Map(existing.map((s) => [s.id, s]));

      const incomingIds = sections
        .filter((s): s is typeof s & { id: string } => !!s.id)
        .map((s) => s.id);

      // ================= DELETE =================
      const toDelete = existing.filter((s) => !incomingIds.includes(s.id));

      if (toDelete.length) {
        await tx.mentoringSection.deleteMany({
          where: { id: { in: toDelete.map((s) => s.id) } },
        });
      }

      // ================= UPDATE & CREATE =================
      for (let i = 0; i < sections.length; i++) {
        const s = sections[i];

        if (s.id && existingMap.has(s.id)) {
          // UPDATE
          await tx.mentoringSection.update({
            where: { id: s.id },
            data: {
              type: s.type,
              title: s.title,
              content: {
                title: s.title,
                description: s.description,
              },
              order: i + 1,
            },
          });
        } else {
          // CREATE
          await tx.mentoringSection.create({
            data: {
              // id: await generateId(tx, "mentoringSection", "section"),
              serviceId: id,
              type: s.type,
              title: s.title,
              content: {
                title: s.title,
                description: s.description,
              },
              order: i + 1,
            },
          });
        }
      }

      updatedFields.push("sections");
    }

    // ================= TOOLS =================
    if (tools) {
      const existing = await tx.mentoringTool.findMany({
        where: { serviceId: id },
      });

      const existingMap = new Map(existing.map((t) => [t.id, t]));

      const incomingIds = tools
        .filter((t): t is typeof t & { id: string } => !!t.id)
        .map((t) => t.id);

      // DELETE
      const toDelete = existing.filter((t) => !incomingIds.includes(t.id));

      if (toDelete.length) {
        await tx.mentoringTool.deleteMany({
          where: { id: { in: toDelete.map((t) => t.id) } },
        });
      }

      // UPDATE & CREATE
      for (const t of tools) {
        if (t.id && existingMap.has(t.id)) {
          await tx.mentoringTool.update({
            where: { id: t.id },
            data: { name: t.name },
          });
        } else {
          await tx.mentoringTool.create({
            data: {
              // id: await generateId(tx, "mentoringTool", "tool"),
              serviceId: id,
              name: t.name,
            },
          });
        }
      }

      updatedFields.push("tools");
    }

    // ================= SCHEDULE =================
    if (schedules) {
      const existing = await tx.mentoringSchedule.findMany({
        where: { serviceId: id },
      });

      const existingMap = new Map(existing.map((s) => [s.id, s]));

      const incomingIds = schedules
        .filter((s): s is typeof s & { id: string } => !!s.id)
        .map((s) => s.id);

      const toDelete = existing.filter((s) => !incomingIds.includes(s.id));

      if (toDelete.length) {
        await tx.mentoringSchedule.deleteMany({
          where: { id: { in: toDelete.map((s) => s.id) } },
        });
      }

      for (const s of schedules) {
        if (s.id && existingMap.has(s.id)) {
          await tx.mentoringSchedule.update({
            where: { id: s.id },
            data: { date: new Date(s.date) },
          });
        } else {
          await tx.mentoringSchedule.create({
            data: {
              // id: await generateId(tx, "mentoringSchedule", "schedule"),
              serviceId: id,
              date: new Date(s.date),
            },
          });
        }
      }

      updatedFields.push("schedules");
    }

    // ================= PORTFOLIO =================
    if (portfolios) {
      const existing = await tx.mentoringPortfolio.findMany({
        where: { serviceId: id },
      });

      const existingMap = new Map(existing.map((p) => [p.id, p]));

      const incomingIds = portfolios
        .filter((p): p is typeof p & { id: string } => !!p.id)
        .map((p) => p.id);

      const toDelete = existing.filter((p) => !incomingIds.includes(p.id));

      if (toDelete.length) {
        await tx.mentoringPortfolio.deleteMany({
          where: { id: { in: toDelete.map((p) => p.id) } },
        });
      }

      for (const p of portfolios) {
        if (p.id && existingMap.has(p.id)) {
          await tx.mentoringPortfolio.update({
            where: { id: p.id },
            data: {
              title: p.title,
              description: p.description,
              menteeName: p.menteeName,
              projectLink: p.projectLink,
              thumbnail: p.thumbnail,
            },
          });
        } else {
          await tx.mentoringPortfolio.create({
            data: {
              // id: await generateId(tx, "mentoringPortfolio", "portfolio"),
              serviceId: id,
              ...p,
            },
          });
        }
      }

      updatedFields.push("portfolios");
    }

    // ================= TESTIMONIAL =================
    if (testimonials) {
      const existing = await tx.mentoringTestimonial.findMany({
        where: { serviceId: id },
      });

      const existingMap = new Map(existing.map((t) => [t.id, t]));

      const incomingIds = testimonials
        .filter((t): t is typeof t & { id: string } => !!t.id)
        .map((t) => t.id);

      const toDelete = existing.filter((t) => !incomingIds.includes(t.id));

      if (toDelete.length) {
        await tx.mentoringTestimonial.deleteMany({
          where: { id: { in: toDelete.map((t) => t.id) } },
        });
      }

      for (const t of testimonials) {
        if (t.id && existingMap.has(t.id)) {
          await tx.mentoringTestimonial.update({
            where: { id: t.id },
            data: {
              name: t.name,
              role: t.role,
              comment: t.comment,
              rating: t.rating,
            },
          });
        } else {
          await tx.mentoringTestimonial.create({
            data: {
              // id: await generateId(tx, "mentoringTestimonial", "testimonial"),
              serviceId: id,
              ...t,
            },
          });
        }
      }

      updatedFields.push("testimonials");
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

  // ❗ JANGAN DIUBAH (sesuai request kamu)
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

      // ✅ TAMBAHAN BARU (WAJIB)
      sections: true,
      tools: true,
      schedules: true,
      portfolios: true,
      testimonials: true,
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
      Thumbnail: service.thumbnail
        ? `${process.env.BACKEND_URL}${service.thumbnail}`
        : "-",
      Description: service.description || "-",

      Price: service.price?.toString() ?? "0",
      "Strike Price": service.strikePrice?.toString() ?? "-",

      "Service Type": service.serviceType || "-",

      Category: service.category || "-",
      Level: service.level || "-",

      "Program About": service.programAbout || "-",
      "Total Weeks": service.totalWeeks ?? "-",
      "Total Projects": service.totalProjects ?? "-",
      "Whatsapp Group": service.whatsappGroup,

      Slug: service.slug || "-",
      "Is Featured": service.isFeatured ? "Yes" : "No",
      "Difficulty Order": service.difficultyOrder ?? "-",

      "Max Participants": service.maxParticipants ?? "-",
      "Duration (Days)": service.durationDays,

      "Start Date": service.startDate
        ? formatDate(service.startDate, "yyyy-MM-dd HH:mm:ss")
        : "-",

      "End Date": service.endDate
        ? formatDate(service.endDate, "yyyy-MM-dd HH:mm:ss")
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

      // ✅ RELATIONS (DI-STRINGIFY)
      Sections: service.sections.length
        ? JSON.stringify(
            service.sections.map((s) => ({
              type: s.type,
              title: s.title,
              description: (s.content as any)?.description,
            })),
          )
        : "-",

      Tools: service.tools.length
        ? service.tools.map((t) => t.name).join(", ")
        : "-",

      Schedules: service.schedules.length
        ? service.schedules.map((s) => s.date.toISOString()).join(", ")
        : "-",

      Portfolios: service.portfolios.length
        ? JSON.stringify(service.portfolios)
        : "-",

      Testimonials: service.testimonials.length
        ? JSON.stringify(service.testimonials)
        : "-",

      // ✅ MENTORS
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
                mentoringSessions: true,

                mentors: {
                  include: {
                    mentorProfile: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },

                // ✅ TAMBAHAN BARU
                sections: {
                  orderBy: { order: "asc" },
                },
                tools: true,
                schedules: true,
                portfolios: true,
                testimonials: true,
              },
            },
          },
        },
      },
    });

    if (!mentorProfile) return [];

    const today = new Date();

    const services = mentorProfile.mentoringServices
      .map((link) => link.mentoringService)

      // punya session
      .filter((service) => service.mentoringSessions.length > 0)

      // session >= hari ini
      .filter((service) =>
        service.mentoringSessions.some((session) => {
          const [day, month, year] = session.date.split("-");
          const sessionDate = new Date(`${year}-${month}-${day}`);

          return sessionDate >= today;
        }),
      );

    return services.map((service) => ({
      id: service.id,
      serviceName: service.serviceName,
      thumbnail: service.thumbnail,
      description: service.description,

      price: Number(service.price),
      strikePrice: service.strikePrice ? Number(service.strikePrice) : null,

      serviceType: service.serviceType,
      maxParticipants: service.maxParticipants,
      durationDays: service.durationDays,

      startDate: service.startDate?.toISOString() ?? null,
      endDate: service.endDate?.toISOString() ?? null,

      // ✅ NEW FIELDS
      programAbout: service.programAbout,
      totalWeeks: service.totalWeeks,
      totalProjects: service.totalProjects,
      whatsappGroup: service.whatsappGroup,

      slug: service.slug,
      isFeatured: service.isFeatured,
      difficultyOrder: service.difficultyOrder,

      category: service.category,
      level: service.level,

      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,

      // ✅ SECTIONS
      sections: service.sections.map((s) => ({
        id: s.id,
        type: s.type,
        title: s.title,
        description: (s.content as any)?.description,
        order: s.order,
      })),

      // ✅ TOOLS
      tools: service.tools.map((t) => ({
        id: t.id,
        name: t.name,
      })),

      // ✅ SCHEDULES
      schedules: service.schedules.map((s) => ({
        id: s.id,
        date: s.date,
      })),

      // ✅ PORTFOLIOS
      portfolios: service.portfolios.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        menteeName: p.menteeName,
        projectLink: p.projectLink,
        thumbnail: p.thumbnail,
      })),

      // ✅ TESTIMONIALS
      testimonials: service.testimonials.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        comment: t.comment,
        rating: t.rating,
      })),

      mentoringSessions: service.mentoringSessions,

      // ✅ MENTORS
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

        // ✅ NEW RELATIONS
        sections: {
          orderBy: { order: "asc" },
        },
        tools: true,
        schedules: true,
        portfolios: true,
        testimonials: true,
      },
    });

    if (!service) return null;

    // 🔥 FILTER SESSION >= TODAY
    const today = new Date();
    const upcomingSessions = service.mentoringSessions
      .map((session) => {
        const [day, month, year] = session.date.split("-");

        // pad biar selalu 2 digit
        const dd = day.padStart(2, "0");
        const mm = month.padStart(2, "0");

        // pastikan format ISO valid
        const isoDate = `${year}-${mm}-${dd}`;

        const startDateTime = new Date(`${isoDate}T${session.startTime}:00`);
        const endDateTime = new Date(`${isoDate}T${session.endTime}:00`);

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
      thumbnail: service.thumbnail,
      price: Number(service.price),
      strikePrice: service.strikePrice ? Number(service.strikePrice) : null,

      serviceType: service.serviceType,
      maxParticipants: service.maxParticipants,
      durationDays: service.durationDays,
      startDate: service.startDate?.toISOString() ?? null,
      endDate: service.endDate?.toISOString() ?? null,

      // ✅ NEW SIMPLE FIELDS
      programAbout: service.programAbout,
      totalWeeks: service.totalWeeks,
      totalProjects: service.totalProjects,
      whatsappGroup: service.whatsappGroup,

      slug: service.slug,
      isFeatured: service.isFeatured,
      difficultyOrder: service.difficultyOrder,

      category: service.category,
      level: service.level,

      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,

      // ✅ SECTIONS (replace benefits, dll)
      sections: service.sections.map((s) => ({
        id: s.id,
        type: s.type,
        title: s.title,
        content: s.content,
        order: s.order,
      })),

      // ✅ TOOLS
      tools: service.tools.map((t) => ({
        id: t.id,
        name: t.name,
      })),

      // ✅ SCHEDULES
      schedules: service.schedules.map((s) => ({
        id: s.id,
        date: s.date,
      })),

      // ✅ PORTFOLIOS
      portfolios: service.portfolios.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        menteeName: p.menteeName,
        projectLink: p.projectLink,
        thumbnail: p.thumbnail,
      })),

      // ✅ TESTIMONIALS
      testimonials: service.testimonials.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        comment: t.comment,
        rating: t.rating,
      })),

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

    const totalPage = Math.ceil(totalData / finalLimit);

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

        // ✅ NEW RELATIONS
        sections: {
          orderBy: { order: "asc" },
        },
        tools: true,
        schedules: true,
        portfolios: true,
        testimonials: true,
      },
    });

    const formatted = services.map((service) => ({
      id: service.id,
      serviceName: service.serviceName,
      description: service.description,
      thumbnail: service.thumbnail,
      price: Number(service.price),
      strikePrice: service.strikePrice ? Number(service.strikePrice) : null,

      serviceType: service.serviceType,
      maxParticipants: service.maxParticipants,
      durationDays: service.durationDays,
      startDate: service.startDate?.toISOString() ?? null,
      endDate: service.endDate?.toISOString() ?? null,

      // ✅ NEW FIELDS
      programAbout: service.programAbout,
      totalWeeks: service.totalWeeks,
      totalProjects: service.totalProjects,
      whatsappGroup: service.whatsappGroup,

      slug: service.slug,
      isFeatured: service.isFeatured,
      difficultyOrder: service.difficultyOrder,

      category: service.category,
      level: service.level,

      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,

      // ✅ SECTIONS
      sections: service.sections.map((s) => ({
        id: s.id,
        type: s.type,
        title: s.title,
        content: s.content,
        order: s.order,
      })),

      // ✅ TOOLS
      tools: service.tools.map((t) => ({
        id: t.id,
        name: t.name,
      })),

      // ✅ SCHEDULES
      schedules: service.schedules.map((s) => ({
        id: s.id,
        date: s.date,
      })),

      // ✅ PORTFOLIOS
      portfolios: service.portfolios.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        menteeName: p.menteeName,
        projectLink: p.projectLink,
        thumbnail: p.thumbnail,
      })),

      // ✅ TESTIMONIALS
      testimonials: service.testimonials.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        comment: t.comment,
        rating: t.rating,
      })),

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
        // mentoringSessions: true,
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

        // ✅ NEW RELATIONS
        sections: {
          orderBy: { order: "asc" },
        },
        tools: true,
        schedules: true,
        portfolios: true,
        testimonials: true,
      },
    });

    // 🔥 FILTER LOGIC FIXED
    // 🔥 FILTER BERDASARKAN:
    // 1. isActive = true
    // 2. masih dalam rentang startDate - endDate
    // 3. kuota belum penuh

    const normalizedToday = new Date();
    normalizedToday.setHours(0, 0, 0, 0);

    const filtered = services.filter((service) => {
      // ✅ HARUS ACTIVE
      if (!service.isActive) {
        return false;
      }

      // ✅ HARUS PUNYA START & END DATE
      if (!service.startDate || !service.endDate) {
        return false;
      }

      const startDate = new Date(service.startDate);
      const endDate = new Date(service.endDate);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      // ✅ BELUM MASUK RENTANG
      if (normalizedToday < startDate) {
        return false;
      }

      // ✅ SUDAH LEWAT
      if (normalizedToday > endDate) {
        return false;
      }

      // ✅ KUOTA PENUH
      if (
        service.maxParticipants &&
        service.bookings.length >= service.maxParticipants
      ) {
        return false;
      }

      return true;
    });

    const totalData = filtered.length;
    const totalPage = Math.ceil(totalData / limit);

    const paginated = filtered.slice(skip, skip + limit);

    const formatted = paginated.map((service) => {
      return {
        id: service.id,
        serviceName: service.serviceName,
        description: service.description,
        thumbnail: service.thumbnail,

        price: Number(service.price),
        strikePrice: service.strikePrice ? Number(service.strikePrice) : null,

        category: service.category,
        level: service.level,

        durationDays: service.durationDays,
        maxParticipants: service.maxParticipants,

        startDate: service.startDate?.toISOString() ?? null,
        endDate: service.endDate?.toISOString() ?? null,

        // ✅ NEW FIELDS
        programAbout: service.programAbout,
        totalWeeks: service.totalWeeks,
        totalProjects: service.totalProjects,
        whatsappGroup: service.whatsappGroup,

        slug: service.slug,
        isFeatured: service.isFeatured,
        difficultyOrder: service.difficultyOrder,

        isActive: service.isActive,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,

        // ✅ RELATIONS
        sections: service.sections.map((s) => ({
          id: s.id,
          type: s.type,
          title: s.title,
          content: s.content,
          order: s.order,
        })),

        tools: service.tools.map((t) => ({
          id: t.id,
          name: t.name,
        })),

        schedules: service.schedules.map((s) => ({
          id: s.id,
          date: s.date,
        })),

        portfolios: service.portfolios.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          menteeName: p.menteeName,
          projectLink: p.projectLink,
          thumbnail: p.thumbnail,
        })),

        testimonials: service.testimonials.map((t) => ({
          id: t.id,
          name: t.name,
          role: t.role,
          comment: t.comment,
          rating: t.rating,
        })),

        availableSlots: service.maxParticipants
          ? service.maxParticipants - service.bookings.length
          : null,

        // sessionDateRange,

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

        // ✅ TAMBAHAN
        tools: true,
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
        thumbnail: service.thumbnail,
        price: Number(service.price),
        strikePrice: service.strikePrice ? Number(service.strikePrice) : null,
        category: service.category,
        level: service.level,
        startDate: service.startDate?.toISOString() ?? null,
        endDate: service.endDate?.toISOString() ?? null,
        toolsUsed: service.tools.map((t) => t.name).join(", "),
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

export const getPublicMentoringServiceDetail = async (slug: string) => {
  const service = await prisma.mentoringService.findFirst({
    where: {
      slug,
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

      // ✅ NEW RELATIONS
      sections: {
        orderBy: { order: "asc" },
      },
      tools: true,
      schedules: true,
      portfolios: true,
      testimonials: true,
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
    thumbnail: service.thumbnail,

    price: Number(service.price),
    strikePrice: service.strikePrice ? Number(service.strikePrice) : null,

    serviceType: service.serviceType,
    maxParticipants: service.maxParticipants,
    durationDays: service.durationDays,

    startDate: service.startDate?.toISOString() ?? null,
    endDate: service.endDate?.toISOString() ?? null,

    // ✅ NEW SIMPLE FIELDS
    programAbout: service.programAbout,
    totalWeeks: service.totalWeeks ?? totalWeeks,
    totalProjects: service.totalProjects ?? totalProjects,
    whatsappGroup: service.whatsappGroup,

    slug: service.slug,
    isFeatured: service.isFeatured,
    difficultyOrder: service.difficultyOrder,

    category: service.category,
    level: service.level,

    isActive: service.isActive,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,

    sessionDateRange,

    // ✅ SECTIONS (replace benefits dll)
    sections: service.sections.map((s) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      content: s.content,
      order: s.order,
    })),

    // ✅ TOOLS (replace toolsUsed)
    tools: service.tools.map((t) => ({
      id: t.id,
      name: t.name,
    })),

    // ✅ SCHEDULES
    schedules: service.schedules.map((s) => ({
      id: s.id,
      date: s.date,
    })),

    // ✅ PORTFOLIOS
    portfolios: service.portfolios.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      menteeName: p.menteeName,
      projectLink: p.projectLink,
      thumbnail: p.thumbnail,
    })),

    // ✅ TESTIMONIALS
    testimonials: service.testimonials.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      comment: t.comment,
      rating: t.rating,
    })),

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
    include: {
      mentoringSessions: {
        select: { date: true },
        orderBy: { date: "asc" },
      },

      // ✅ NEW RELATIONS
      tools: true,
      sections: true,
      testimonials: true,
      portfolios: true,
      schedules: true,
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
  // 🔹 Mapping hasil
  // ======================================================

  const mentoringMapped = validMentoringServices.map((m) => {
    const sortedSessions = [...m.mentoringSessions].sort((a, b) => {
      return (
        parseSessionDate(a.date).getTime() - parseSessionDate(b.date).getTime()
      );
    });

    // let dateStart: string | null = null;
    // let dateEnd: string | null = null;

    // if (sortedSessions.length > 0) {
    //   dateStart = sortedSessions[0].date;
    //   dateEnd = sortedSessions[sortedSessions.length - 1].date;
    // }

    return {
      type: "mentoring",
      id: m.id,
      title: m.serviceName,
      description: m.description ?? "-",
      thumbnail: m.thumbnail,
      price: Number(m.price),
      strikePrice: m.strikePrice ? Number(m.strikePrice) : null,

      serviceType: m.serviceType,
      durationDays: m.durationDays,

      startDate: m.startDate?.toISOString() ?? null,
      endDate: m.endDate?.toISOString() ?? null,

      // ✅ NEW FIELDS
      programAbout: m.programAbout,
      totalWeeks: m.totalWeeks,
      totalProjects: m.totalProjects,
      whatsappGroup: m.whatsappGroup,
      slug: m.slug,
      isFeatured: m.isFeatured,
      difficultyOrder: m.difficultyOrder,
      category: m.category,
      level: m.level,

      // ✅ REPLACEMENT benefits
      sections: m.sections.map((s) => ({
        id: s.id,
        type: s.type,
        title: s.title,
        content: s.content,
        order: s.order,
      })),

      // ✅ REPLACEMENT toolsUsed
      tools: m.tools.map((t) => ({
        id: t.id,
        name: t.name,
      })),

      // Tambahan saja
      testimonials: m.testimonials,
      portfolios: m.portfolios,
      schedules: m.schedules,

      // dateStart,
      // dateEnd,
      schedule: "Online",
      createdAt: m.createdAt,
    };
  });
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
