import { PrismaClient, Prisma } from "@prisma/client";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";

const prisma = new PrismaClient();

export const createMentoringSession = async (input: {
  serviceId: string;
  date: string;
  startTime: { hour: number; minute: number };
  endTime: { hour: number; minute: number };
  meetingLink?: string;
  status?: string;
  notes?: string;
  mentorProfileIds: string[];
}) => {
  const {
    serviceId,
    date,
    startTime,
    endTime,
    meetingLink,
    status,
    notes,
    mentorProfileIds,
  } = input;

  if (!date || !startTime || !endTime) {
    throw new Error("date, startTime, dan endTime wajib diisi");
  }

  // =============================
  // Konversi waktu dari WIB ke UTC
  // =============================
  const parseWIBDateTime = (
    date: string,
    time: { hour: number; minute: number }
  ): Date => {
    const [day, month, year] = date.split("-");
    const hour = time.hour.toString().padStart(2, "0");
    const minute = time.minute.toString().padStart(2, "0");
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:00+07:00`);
  };

  const startDateTime = parseWIBDateTime(date, startTime);
  const endDateTime = parseWIBDateTime(date, endTime);
  const sessionDate = date; // Menyimpan format date dalam string dd-mm-yyyy

  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    throw new Error("Format waktu tidak valid");
  }

  if (startDateTime >= endDateTime) {
    throw new Error("startTime harus lebih kecil dari endTime");
  }

  const durationMinutes = Math.floor(
    (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)
  );

  const service = await prisma.mentoringService.findUnique({
    where: { id: serviceId },
    include: { mentors: true },
  });

  if (!service) throw new Error("Mentoring service tidak ditemukan");
  if (!service.isActive) throw new Error("Mentoring service tidak aktif");

  const registeredMentorIds = service.mentors.map((m) => m.mentorProfileId);
  const unregisteredMentors = mentorProfileIds.filter(
    (id) => !registeredMentorIds.includes(id)
  );

  if (unregisteredMentors.length > 0) {
    throw new Error(
      "Terdapat mentor yang tidak terdaftar di mentoring service"
    );
  }

  const overlappingSessions = await prisma.mentoringSession.findMany({
    where: {
      serviceId,
      date: sessionDate,
      OR: [
        {
          startTime: {
            lt: endDateTime.toISOString(), // Pastikan startTime dalam bentuk string yang valid
          },
          endTime: {
            gt: startDateTime.toISOString(), // Pastikan endTime dalam bentuk string yang valid
          },
        },
      ],
    },
    include: {
      mentors: {
        include: {
          mentorProfile: true,
        },
      },
    },
  });

  const mentorProfileIdsInOverlappingSessions = overlappingSessions.flatMap(
    (session) =>
      session.mentors.map((mentorSession) => mentorSession.mentorProfileId)
  );

  const duplicateMentors = mentorProfileIds.filter((id) =>
    mentorProfileIdsInOverlappingSessions.includes(id)
  );

  if (duplicateMentors.length > 0) {
    throw new Error(
      "Terdapat mentor yang sudah terdaftar di sesi lain pada waktu tersebut"
    );
  }

  const mentorConflicts = await prisma.mentoringSessionMentor.findMany({
    where: {
      mentorProfileId: { in: mentorProfileIds },
      mentoringSession: {
        date: sessionDate,
        startTime: {
          lt: endDateTime.toISOString(),
        },
        endTime: {
          gt: startDateTime.toISOString(),
        },
      },
    },
  });

  if (mentorConflicts.length > 0) {
    throw new Error("Terdapat mentor yang sedang bertugas di sesi lain");
  }

  const generateRandomString = (length: number) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const sessionId = `Session-${generateRandomString(10)}-${serviceId}`;

  const validStatuses = ["scheduled", "ongoing", "completed", "cancelled"];
  const sessionStatus =
    status && validStatuses.includes(status) ? status : "scheduled";

  const session = await prisma.mentoringSession.create({
    data: {
      id: sessionId,
      serviceId,
      date: sessionDate, // Menggunakan string date dalam format dd-mm-yyyy
      startTime: startDateTime.toISOString(), // Menyimpan startTime sebagai string ISO
      endTime: endDateTime.toISOString(), // Menyimpan endTime sebagai string ISO
      durationMinutes,
      meetingLink,
      status: sessionStatus,
      notes,
    },
  });

  await prisma.mentoringSessionMentor.createMany({
    data: mentorProfileIds.map((mentorId) => ({
      mentoringSessionId: session.id,
      mentorProfileId: mentorId,
    })),
  });

  return await prisma.mentoringSession.findUnique({
    where: { id: session.id },
    include: {
      mentors: {
        include: { mentorProfile: true },
      },
    },
  });
};

export const getMentoringSessions = async ({
  serviceId,
  mentorProfileId,
  status,
  dateFrom,
  dateTo,
  search,
  sortBy = "createdAt",
  sortOrder = "desc",
  page = 1,
  limit = 10,
}: {
  serviceId?: string;
  mentorProfileId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}) => {
  // Build where clause for filtering
  const where: any = {};

  if (serviceId) {
    where.serviceId = serviceId;
  }

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) {
      const [day, month, year] = dateFrom.split("-");
      where.date.gte = `${day}-${month}-${year}`;
    }
    if (dateTo) {
      const [day, month, year] = dateTo.split("-");
      where.date.lte = `${day}-${month}-${year}`;
    }
  }

  if (mentorProfileId) {
    where.mentors = {
      some: {
        mentorProfileId: mentorProfileId,
      },
    };
  }

  if (search) {
    where.OR = [
      { notes: { contains: search, mode: "insensitive" } },
      { meetingLink: { contains: search, mode: "insensitive" } },
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const take = limit;

  // Build orderBy clause
  const orderBy: any = {};
  if (sortBy) {
    orderBy[sortBy] = sortOrder || "desc";
  }

  // Fetch sessions with relations
  const sessions = await prisma.mentoringSession.findMany({
    where,
    skip,
    take,
    orderBy,
    include: {
      mentoringService: {
        select: {
          id: true,
          serviceName: true,
          description: true,
          price: true,
          serviceType: true,
          maxParticipants: true,
          durationDays: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      mentors: {
        include: {
          mentorProfile: {
            select: {
              id: true,
              userId: true,
              expertise: true,
              bio: true,
              experience: true,
              availabilitySchedule: true,
              hourlyRate: true,
              isVerified: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  // Count total items for pagination
  const totalItems = await prisma.mentoringSession.count({ where });

  // Build pagination metadata
  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    limit,
  };

  return {
    data: sessions,
    pagination,
  };
};

export const getMentoringSessionById = async (id: string) => {
  const session = await prisma.mentoringSession.findUnique({
    where: { id },
    include: {
      mentoringService: {
        select: {
          id: true,
          serviceName: true,
          description: true,
          price: true,
          serviceType: true,
          maxParticipants: true,
          durationDays: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      mentors: {
        include: {
          mentorProfile: {
            select: {
              id: true,
              userId: true,
              expertise: true,
              bio: true,
              experience: true,
              availabilitySchedule: true,
              hourlyRate: true,
              isVerified: true,
              createdAt: true,
              updatedAt: true,
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
      feedbacks: {
        select: {
          id: true,
          rating: true,
          comment: true,
          submittedDate: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
      projects: {
        select: {
          id: true,
          title: true,
          description: true,
          filePath: true,
          submissionDate: true,
          plagiarismScore: true,
          nilai: true,
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
  });

  if (!session) {
    throw new Error("Sesi mentoring tidak ditemukan");
  }

  return {
    ...session,
    additionalInfo: {
      feedbacksInfo:
        session.feedbacks.length === 0
          ? "Belum ada feedback di sesi mentoring ini"
          : undefined,
      projectsInfo:
        session.projects.length === 0
          ? "Belum ada project di sesi mentoring ini"
          : undefined,
    },
  };
};

export const updateMentoringSession = async (
  id: string,
  data: {
    date?: string;
    startTime?: { hour: number; minute: number };
    endTime?: { hour: number; minute: number };
    meetingLink?: string;
    notes?: string;
  }
) => {
  const session = await prisma.mentoringSession.findUnique({ where: { id } });
  if (!session) {
    throw new Error("Sesi mentoring tidak ditemukan");
  }

  const updatePayload: any = {
    updatedAt: new Date(),
  };

  const changedFields: string[] = [];

  const parseWIBDateTime = (
    date: string,
    time: { hour: number; minute: number }
  ): Date => {
    const [day, month, year] = date.split("-");
    const hour = String(time.hour).padStart(2, "0");
    const minute = String(time.minute).padStart(2, "0");
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:00+07:00`);
  };

  if (data.date) {
    updatePayload.date = data.date;
    changedFields.push("date");
  }

  if (data.meetingLink) {
    updatePayload.meetingLink = data.meetingLink;
    changedFields.push("meetingLink");
  }

  if (data.notes) {
    updatePayload.notes = data.notes;
    changedFields.push("notes");
  }

  // Default: pakai waktu lama
  let startDateTime = new Date(session.startTime);
  let endDateTime = new Date(session.endTime);

  // Kalau user mengirim date dan time baru, kita gabungkan
  if (data.date && data.startTime) {
    startDateTime = parseWIBDateTime(data.date, data.startTime);
  }

  if (data.date && data.endTime) {
    endDateTime = parseWIBDateTime(data.date, data.endTime);
  }

  // Kalau hanya kirim time, pakai date lama dari session
  if (!data.date && data.startTime) {
    const [day, month, year] = session.date.split("-");
    startDateTime = parseWIBDateTime(`${day}-${month}-${year}`, data.startTime);
  }

  if (!data.date && data.endTime) {
    const [day, month, year] = session.date.split("-");
    endDateTime = parseWIBDateTime(`${day}-${month}-${year}`, data.endTime);
  }

  // ✅ Kalau user hanya kirim date, geser waktu ke tanggal baru dengan jam lama
  if (data.date && !data.startTime && !data.endTime) {
    const oldStart = new Date(session.startTime);
    const oldEnd = new Date(session.endTime);

    const oldStartTime = {
      hour: oldStart.getUTCHours(),
      minute: oldStart.getUTCMinutes(),
    };
    const oldEndTime = {
      hour: oldEnd.getUTCHours(),
      minute: oldEnd.getUTCMinutes(),
    };

    startDateTime = parseWIBDateTime(data.date, oldStartTime);
    endDateTime = parseWIBDateTime(data.date, oldEndTime);

    updatePayload.startTime = startDateTime.toISOString();
    updatePayload.endTime = endDateTime.toISOString();
    changedFields.push("startTime", "endTime");
  }

  // Jika user kirim startTime atau endTime, simpan
  if (data.startTime) {
    updatePayload.startTime = startDateTime.toISOString();
    changedFields.push("startTime");
  }

  if (data.endTime) {
    updatePayload.endTime = endDateTime.toISOString();
    changedFields.push("endTime");
  }

  // Validasi & hitung durasi
  if (data.startTime || data.endTime || data.date) {
    if (startDateTime >= endDateTime) {
      throw new Error("startTime harus lebih kecil dari endTime");
    }

    updatePayload.durationMinutes = Math.floor(
      (endDateTime.getTime() - startDateTime.getTime()) / 60000
    );
  }

  const updated = await prisma.mentoringSession.update({
    where: { id },
    data: updatePayload,
  });

  return {
    updated,
    changedFields,
  };
};

export const updateMentoringSessionStatus = async (
  id: string,
  status: string
) => {
  const allowedStatus = ["scheduled", "ongoing", "completed", "cancelled"];
  if (!allowedStatus.includes(status)) {
    throw new Error("Status tidak valid");
  }

  const session = await prisma.mentoringSession.findUnique({ where: { id } });
  if (!session) {
    throw new Error("Sesi mentoring tidak ditemukan");
  }

  const updated = await prisma.mentoringSession.update({
    where: { id },
    data: {
      status,
      updatedAt: new Date(),
    },
  });

  return updated;
};

export const updateMentoringSessionMentors = async (
  sessionId: string,
  mentorIds: string[]
) => {
  const session = await prisma.mentoringSession.findUnique({
    where: { id: sessionId },
    include: {
      mentoringService: true,
    },
  });

  if (!session) {
    throw new Error("Sesi mentoring tidak ditemukan");
  }

  const serviceId = session.serviceId;

  // Ambil semua mentor valid dari service & sudah verified
  const validMentors = await prisma.mentoringServiceMentor.findMany({
    where: {
      mentoringServiceId: serviceId,
      mentorProfileId: { in: mentorIds },
      mentorProfile: { isVerified: true },
    },
    select: {
      mentorProfileId: true,
    },
  });

  const validMentorIds = validMentors.map((m) => m.mentorProfileId);

  if (validMentorIds.length !== mentorIds.length) {
    throw new Error("Beberapa mentor tidak valid atau belum diverifikasi");
  }

  // Ambil semua mentor sebelumnya di sesi ini
  const existingSessionMentors = await prisma.mentoringSessionMentor.findMany({
    where: { mentoringSessionId: sessionId },
    select: { mentorProfileId: true },
  });
  const existingIds = existingSessionMentors.map((m) => m.mentorProfileId);

  // Tentukan perubahan
  const toAdd = validMentorIds.filter((id) => !existingIds.includes(id));
  const toRemove = existingIds.filter((id) => !validMentorIds.includes(id));

  // Hapus hanya yang perlu dihapus
  await prisma.mentoringSessionMentor.deleteMany({
    where: {
      mentoringSessionId: sessionId,
      mentorProfileId: { in: toRemove },
    },
  });

  // Tambahkan hanya yang baru
  const newMentors = toAdd.map((mentorId) => ({
    mentoringSessionId: sessionId,
    mentorProfileId: mentorId,
  }));

  await prisma.mentoringSessionMentor.createMany({
    data: newMentors,
  });

  return {
    sessionId,
    addedMentorIds: toAdd,
    removedMentorIds: toRemove,
    message: {
      added: toAdd.map(
        (id) => `Mentor dengan ID ${id} telah ditambahkan ke sesi.`
      ),
      removed: toRemove.map(
        (id) => `Mentor dengan ID ${id} telah dikeluarkan dari sesi.`
      ),
    },
  };
};

export const deleteMentoringSession = async (sessionId: string) => {
  // Validasi apakah sesi ada
  const existingSession = await prisma.mentoringSession.findUnique({
    where: { id: sessionId },
    include: {
      mentors: true,
      feedbacks: true,
      projects: true,
    },
  });

  if (!existingSession) {
    throw new Error("Sesi mentoring tidak ditemukan");
  }

  if (existingSession.feedbacks.length > 0) {
    throw new Error("Tidak bisa menghapus sesi yang memiliki feedback");
  }

  // Validasi status sesi (misalnya, jika sudah selesai)
  if (existingSession.status === "completed") {
    throw new Error("Sesi yang sudah selesai tidak bisa dihapus");
  }

  // Hapus sesi
  await prisma.mentoringSession.delete({
    where: { id: sessionId },
  });
};

export const exportMentoringSessions = async (format: "xlsx" | "csv") => {
  const sessions = await prisma.mentoringSession.findMany({
    include: {
      mentoringService: true,
      mentors: {
        include: {
          mentorProfile: {
            include: {
              user: true,
            },
          },
        },
      },
      feedbacks: true,
      projects: true,
    },
  });

  // Flatten data
  const flatData = sessions.map((session) => {
    const latestFeedback = session.feedbacks[session.feedbacks.length - 1];
    const averageRating = session.feedbacks.length
      ? session.feedbacks.reduce((sum, f) => sum + f.rating, 0) /
        session.feedbacks.length
      : null;

    const latestProject = session.projects[session.projects.length - 1];
    const averageScore = session.projects.length
      ? session.projects.reduce(
          (sum, p) => sum + (p.nilai ? p.nilai.toNumber() : 0),
          0
        ) / session.projects.length
      : null;

    return {
      id: session.id,
      serviceName: session.mentoringService?.serviceName,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      durationMinutes: session.durationMinutes,
      status: session.status,
      mentorNames: session.mentors
        .map((m) => m.mentorProfile.user.fullName)
        .join(", "),
      feedbackCount: session.feedbacks.length,
      averageRating,
      lastFeedbackComment: latestFeedback?.comment ?? null,
      projectCount: session.projects.length,
      lastProjectTitle: latestProject?.title ?? null,
      averageProjectScore: averageScore,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  });

  if (format === "csv") {
    const parser = new Parser();
    const csv = parser.parse(flatData);
    return {
      buffer: Buffer.from(csv),
      mimeType: "text/csv",
      fileExtension: "csv",
    };
  } else {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Mentoring Sessions");

    sheet.columns = Object.keys(flatData[0]).map((key) => ({
      header: key,
      key,
      width: 25,
    }));

    sheet.addRows(flatData);

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      buffer,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileExtension: "xlsx",
    };
  }
};

export const getOwnMentorSessions = async (mentorProfileId: string) => {
  const sessions = await prisma.mentoringSession.findMany({
    where: {
      mentors: {
        some: {
          mentorProfileId,
        },
      },
    },
    include: {
      mentoringService: {
        select: {
          serviceName: true,
          serviceType: true,
        },
      },
      feedbacks: {
        select: {
          rating: true,
        },
      },
      projects: {
        select: {
          nilai: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return sessions.map((session) => {
    const averageRating = session.feedbacks.length
      ? session.feedbacks.reduce((sum, f) => sum + f.rating, 0) /
        session.feedbacks.length
      : null;

    const averageScore = session.projects.length
      ? session.projects.reduce(
          (sum, p) => sum + (p.nilai?.toNumber() || 0),
          0
        ) / session.projects.length
      : null;

    return {
      id: session.id,
      serviceName: session.mentoringService.serviceName,
      serviceType: session.mentoringService.serviceType,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      durationMinutes: session.durationMinutes,
      meetingLink: session.meetingLink,
      status: session.status,
      averageRating,
      averageProjectScore: averageScore,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  });
};

export const getMentorSessionDetail = async (
  sessionId: string,
  mentorProfileId: string
) => {
  const session = await prisma.mentoringSession.findFirst({
    where: {
      id: sessionId,
      mentors: {
        some: {
          mentorProfileId,
        },
      },
    },
    include: {
      mentoringService: {
        select: {
          serviceName: true,
          description: true,
          serviceType: true,
          durationDays: true,
        },
      },
      mentors: {
        select: {
          mentorProfile: {
            select: {
              id: true,
              user: {
                select: {
                  fullName: true,
                  profilePicture: true,
                },
              },
            },
          },
        },
      },
      feedbacks: {
        select: {
          rating: true,
        },
      },
      projects: {
        select: {
          nilai: true,
        },
      },
    },
  });

  if (!session) return null;

  const averageRating = session.feedbacks.length
    ? session.feedbacks.reduce((sum, f) => sum + f.rating, 0) /
      session.feedbacks.length
    : null;

  const averageProjectScore = session.projects.length
    ? session.projects.reduce((sum, p) => sum + (p.nilai?.toNumber() || 0), 0) /
      session.projects.length
    : null;

  return {
    id: session.id,
    service: session.mentoringService,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    durationMinutes: session.durationMinutes,
    meetingLink: session.meetingLink,
    status: session.status,
    notes: session.notes,
    mentorList: session.mentors.map((m) => ({
      mentorProfileId: m.mentorProfile.id,
      fullName: m.mentorProfile.user.fullName,
      profilePicture: m.mentorProfile.user.profilePicture,
    })),
    averageRating,
    averageProjectScore,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
};

export const updateByMentor = async ({
  sessionId,
  mentorProfileId,
  updates,
}: {
  sessionId: string;
  mentorProfileId: string;
  updates: {
    status?: string;
    meetingLink?: string;
  };
}) => {
  // Cek apakah mentor tergabung di sesi ini
  const isAuthorized = await prisma.mentoringSessionMentor.findFirst({
    where: {
      mentoringSessionId: sessionId,
      mentorProfileId,
    },
  });

  if (!isAuthorized) {
    throw { status: 403, message: "Anda tidak tergabung dalam sesi ini" };
  }

  // Hitung jumlah update dalam 3 hari terakhir
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const recentUpdates = await prisma.mentoringSession.findMany({
    where: {
      id: sessionId,
      updatedAt: { gte: threeDaysAgo },
      mentors: {
        some: { mentorProfileId },
      },
    },
  });

  // Hitung update yang dilakukan mentor ini
  const updateCount = recentUpdates.length;

  if (updateCount >= 2) {
    throw {
      status: 429,
      message: "Anda hanya bisa mengubah sesi ini maksimal 2 kali dalam 3 hari",
    };
  }

  const updated = await prisma.mentoringSession.update({
    where: { id: sessionId },
    data: {
      ...updates,
      updatedAt: new Date(),
    },
  });

  return updated;
};

export async function getSessionsByServiceId({
  serviceId,
  page,
  limit,
  sortBy = "date",
  sortOrder = "asc",
  search,
}: {
  serviceId: string;
  page: number;
  limit: number;
  sortBy?: "date" | "rating";
  sortOrder?: "asc" | "desc";
  search?: string;
}) {
  // Validasi apakah serviceId ada
  const serviceExists = await prisma.mentoringService.findUnique({
    where: { id: serviceId },
    select: { id: true, isActive: true },
  });

  if (!serviceExists) {
    throw new Error("Mentoring service tidak ditemukan");
  }

  if (!serviceExists.isActive) {
    throw new Error("Mentoring service tidak aktif");
  }

  const skip = (page - 1) * limit;

  const sessions = await prisma.mentoringSession.findMany({
    where: {
      serviceId,
      status: "scheduled",
      mentoringService: {
        isActive: true,
      },
      ...(search
        ? {
            OR: [
              { notes: { contains: search, mode: "insensitive" } },
              { date: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip,
    take: limit,
    select: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
      durationMinutes: true,
      status: true,
      mentors: {
        select: {
          mentorProfile: {
            select: {
              id: true,
              user: {
                select: {
                  fullName: true,
                  profilePicture: true,
                },
              },
            },
          },
        },
      },
      feedbacks: {
        orderBy: { rating: "desc" },
        take: 2,
        select: {
          rating: true,
          comment: true,
          user: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });

  console.log("Sessions found for serviceId:", serviceId, sessions); // Debugging

  const total = await prisma.mentoringSession.count({
    where: {
      serviceId,
      status: "scheduled",
      mentoringService: {
        isActive: true,
      },
      ...(search
        ? {
            OR: [
              { notes: { contains: search, mode: "insensitive" } },
              { date: { contains: search } },
            ],
          }
        : {}),
    },
  });

  return {
    data: sessions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export const getPublicMentoringSessionById = async (id: string) => {
  const session = await prisma.mentoringSession.findUnique({
    where: { id },
    select: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
      durationMinutes: true,
      status: true,
      notes: true,
      mentoringService: {
        select: {
          serviceName: true,
          description: true,
          serviceType: true,
        },
      },
      mentors: {
        select: {
          mentorProfile: {
            select: {
              user: {
                select: {
                  fullName: true,
                },
              },
              expertise: true,
            },
          },
        },
      },
      feedbacks: {
        select: {
          rating: true,
          comment: true,
          user: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: { rating: "desc" },
        take: 3,
      },
    },
  });

  if (!session) {
    throw new Error("Sesi mentoring tidak ditemukan");
  }

  // Periksa apakah status null atau tidak valid
  if (!session.status || !["scheduled", "ongoing"].includes(session.status)) {
    throw new Error("Sesi mentoring ini tidak tersedia untuk publik");
  }

  console.log("Session found for id:", id, session);

  return session;
};
