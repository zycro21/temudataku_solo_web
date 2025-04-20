import { PrismaClient, Prisma } from "@prisma/client";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import { format, parseISO, subDays } from "date-fns";
import { Buffer } from "buffer";

const prisma = new PrismaClient();

export const createFeedback = async (input: {
  userId: string;
  sessionId: string;
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
}) => {
  const { userId, sessionId, rating, comment, isAnonymous } = input;

  // Validasi rating
  if (rating < 1 || rating > 5) {
    throw new Error("Rating harus berada di antara 1 sampai 5.");
  }

  // Cek apakah session-nya valid
  const session = await prisma.mentoringSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error("Sesi mentoring tidak ditemukan.");
  }

  if (session.status !== "completed") {
    throw new Error(
      "Feedback hanya bisa diberikan untuk sesi yang telah selesai."
    );
  }

  // Cek apakah user sudah pernah memberi feedback untuk sesi ini
  const existing = await prisma.feedback.findUnique({
    where: {
      sessionId_userId: { sessionId, userId },
    },
  });

  if (existing) {
    throw new Error("Kamu sudah memberi feedback untuk sesi ini.");
  }

  // Cek apakah user punya booking valid untuk mentoring service dari sesi ini
  const isDevBypass = process.env.BYPASS_FEEDBACK_BOOKING_CHECK === "true";

  if (!isDevBypass) {
    const hasValidBooking = await prisma.booking.findFirst({
      where: {
        mentoringServiceId: session.serviceId,
        menteeId: userId,
        status: "completed",
      },
    });

    if (!hasValidBooking) {
      throw new Error("Kamu belum pernah mengikuti sesi ini.");
    }
  }

  // Simpan feedback
  const feedback = await prisma.feedback.create({
    data: {
      sessionId,
      userId,
      rating,
      comment,
      isAnonymous: isAnonymous ?? false,
    },
  });

  return feedback;
};

export const updateFeedback = async (input: {
  feedbackId: string;
  userId: string;
  comment: string;
}) => {
  const { feedbackId, userId, comment } = input;

  // Cari feedback
  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
  });

  if (!feedback) {
    throw new Error("Feedback tidak ditemukan.");
  }

  if (feedback.userId !== userId) {
    throw new Error("Kamu tidak diizinkan mengedit feedback ini.");
  }

  // Cek apakah komentar berubah
  if (feedback.comment === comment) {
    throw new Error("Komentar tidak berubah, tidak perlu diupdate.");
  }

  // Update jika komentar memang berubah
  const updated = await prisma.feedback.update({
    where: { id: feedbackId },
    data: {
      comment,
      updatedAt: new Date(),
    },
  });

  return updated;
};

export const deleteFeedback = async (input: {
  feedbackId: string;
  userId: string;
  isAdmin: boolean;
}) => {
  const { feedbackId, userId, isAdmin } = input;

  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
  });

  if (!feedback) {
    throw new Error("Feedback tidak ditemukan.");
  }

  // Kalau admin → hard delete
  if (isAdmin) {
    await prisma.feedback.delete({
      where: { id: feedbackId },
    });
    return;
  }

  // Kalau bukan admin → pastikan user pemilik feedback
  if (feedback.userId !== userId) {
    throw new Error("Kamu tidak diizinkan menghapus feedback ini.");
  }

  // Soft delete → ubah isVisible ke false
  await prisma.feedback.update({
    where: { id: feedbackId },
    data: {
      isVisible: false,
      updatedAt: new Date(),
    },
  });
};

export const getMyFeedbacks = async ({
  userId,
  query,
}: {
  userId: string;
  query: {
    page?: string;
    limit?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}) => {
  const page = parseInt(query.page ?? "1");
  const limit = parseInt(query.limit ?? "10");
  const skip = (page - 1) * limit;
  const search = query.search ?? "";
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";

  const where: Prisma.FeedbackWhereInput = {
    userId,
    isVisible: true,
    OR: search
      ? [
          {
            comment: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            session: {
              mentoringService: {
                serviceName: {
                  // Changed from 'name' to 'serviceName'
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          },
        ]
      : undefined,
  };

  const [total, data] = await Promise.all([
    prisma.feedback.count({ where }),
    prisma.feedback.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
      select: {
        id: true,
        rating: true,
        comment: true,
        submittedDate: true,
        createdAt: true,
        isAnonymous: true,
        session: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            mentoringService: {
              select: {
                id: true,
                serviceName: true, // Changed from 'name' to 'serviceName'
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPublicFeedbacksByService = async ({
  serviceId,
  sortBy = "submittedDate",
  sortOrder = "desc",
  limit = 3,
}: {
  serviceId: string;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
}) => {
  // 1. Ambil feedback berdasarkan serviceId
  const feedbacks = await prisma.feedback.findMany({
    where: {
      isVisible: true,
      session: {
        serviceId,
      },
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    take: limit,
    select: {
      id: true,
      rating: true,
      comment: true,
      submittedDate: true,
      createdAt: true,
      session: {
        select: {
          id: true,
          date: true,
          mentoringService: {
            select: {
              id: true,
              serviceName: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          profilePicture: true,
        },
      },
    },
  });

  // 2. Hitung rata-rata rating per session
  const averagePerSession = await prisma.feedback.groupBy({
    by: ["sessionId"],
    where: {
      isVisible: true,
      session: {
        serviceId,
      },
    },
    _avg: {
      rating: true,
    },
  });

  // 3. Hitung rata-rata rating service = rata-rata dari semua avg session
  const totalAvg =
    averagePerSession.reduce(
      (sum, session) => sum + (session._avg.rating ?? 0),
      0
    ) / (averagePerSession.length || 1);

  return {
    averageRating: parseFloat(totalAvg.toFixed(2)),
    feedbacks,
  };
};

export const getMentorFeedbacks = async ({
  mentorProfileId,
  rating,
  sessionId,
  sortBy = "submittedDate",
  sortOrder = "desc",
  limit = 10,
}: {
  mentorProfileId: string;
  rating?: number;
  sessionId?: string;
  sortBy?: "submittedDate" | "rating";
  sortOrder?: "asc" | "desc";
  limit?: number;
}) => {
  // 1. Cari session-session yang dihandle mentor ini
  const sessionsHandled = await prisma.mentoringSessionMentor.findMany({
    where: { mentorProfileId },
    select: { mentoringSessionId: true },
  });

  const handledSessionIds = sessionsHandled.map((s) => s.mentoringSessionId);

  // 2. Ambil feedback dari sesi tersebut
  const feedbacks = await prisma.feedback.findMany({
    where: {
      sessionId: {
        in: handledSessionIds,
        ...(sessionId ? { equals: sessionId } : {}),
      },
      ...(rating ? { rating } : {}),
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    take: limit,
    select: {
      id: true,
      rating: true,
      comment: true,
      submittedDate: true,
      session: {
        select: {
          id: true,
          date: true,
          mentoringService: {
            select: {
              id: true,
              serviceName: true,
            },
          },
        },
      },
      isAnonymous: true,
      user: {
        select: {
          fullName: true,
          profilePicture: true,
        },
      },
    },
  });

  // 3. Sembunyikan info user jika feedback-nya anonim
  return feedbacks.map((f) => ({
    id: f.id,
    rating: f.rating,
    comment: f.comment,
    submittedDate: f.submittedDate,
    session: f.session,
    user: f.isAnonymous
      ? { fullName: "Anonymous", profilePicture: null }
      : f.user,
  }));
};

export const getAllFeedbacksForAdmin = async ({
  sessionId,
  userId,
  isVisible,
  minRating,
  maxRating,
  search,
  sortBy = "submittedDate",
  sortOrder = "desc",
  limit,
  page,
}: {
  sessionId?: string;
  userId?: string;
  isVisible?: boolean;
  minRating?: number;
  maxRating?: number;
  search?: string;
  sortBy?: "submittedDate" | "rating";
  sortOrder?: "asc" | "desc";
  limit?: number;
  page?: number;
}) => {
  const safeLimit = !limit || limit <= 0 ? 10 : Math.min(limit, 100); // Default 10, max 100
  const safePage = !page || page <= 0 ? 1 : page;

  const where: any = {
    ...(sessionId && { sessionId }),
    ...(userId && { userId }),
    ...(typeof isVisible === "boolean" && { isVisible }),
    ...(minRating && { rating: { gte: minRating } }),
    ...(maxRating && {
      rating: { ...(minRating ? { gte: minRating } : {}), lte: maxRating },
    }),
    ...(search && {
      OR: [
        { comment: { contains: search, mode: "insensitive" } },
        { user: { fullName: { contains: search, mode: "insensitive" } } },
      ],
    }),
  };

  const feedbacks = await prisma.feedback.findMany({
    where,
    orderBy: {
      [sortBy]: sortOrder,
    },
    take: safeLimit,
    skip: (safePage - 1) * safeLimit,
    select: {
      id: true,
      rating: true,
      comment: true,
      submittedDate: true,
      isVisible: true,
      isAnonymous: true,
      createdAt: true,
      updatedAt: true,
      session: {
        select: {
          id: true,
          date: true,
          mentoringService: {
            select: {
              id: true,
              serviceName: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePicture: true,
        },
      },
    },
  });

  const total = await prisma.feedback.count({ where });

  return {
    total,
    page: safePage,
    totalPages: Math.ceil(total / safeLimit),
    feedbacks,
  };
};

export const updateFeedbackVisibility = async (
  feedbackId: string,
  isVisible: boolean
) => {
  const existing = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    select: {
      id: true,
      isVisible: true,
    },
  });

  if (!existing) {
    throw new Error("Feedback tidak ditemukan");
  }

  if (existing.isVisible === isVisible) {
    // Tidak perlu update
    return {
      id: existing.id,
      isVisible: existing.isVisible,
      updated: false,
      message: `Status visibilitas sudah bernilai ${isVisible}`,
    };
  }

  const updated = await prisma.feedback.update({
    where: { id: feedbackId },
    data: {
      isVisible,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      isVisible: true,
      updatedAt: true,
    },
  });

  return {
    ...updated,
    updated: true,
    message: `Status visibilitas berhasil diubah menjadi ${isVisible}`,
  };
};

export const exportFeedbacksToFile = async (formatType: string) => {
  const feedbacks = await prisma.feedback.findMany({
    include: {
      user: true,
      session: {
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
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const rows = feedbacks.map((f) => {
    const mentorList = f.session.mentors.map((m) => {
      const mentorUser = m.mentorProfile.user;
      return `${mentorUser.fullName} (${m.mentorProfile.id})`;
    });

    return {
      ID: f.id,
      Rating: f.rating,
      Komentar: f.comment || "",
      TanggalSubmit: f.submittedDate
        ? format(f.submittedDate, "yyyy-MM-dd HH:mm")
        : "",
      IsAnonymous: f.isAnonymous ? "Ya" : "Tidak",
      IsVisible: f.isVisible ? "Ya" : "Tidak",
      User: f.isAnonymous ? "Anonim" : f.user.fullName,
      Email: f.isAnonymous ? "-" : f.user.email,
      SesiTanggal: f.session.date,
      Waktu: `${f.session.startTime} - ${f.session.endTime}`,
      NamaService: f.session.mentoringService.serviceName,
      MentorSesi: mentorList.join(", "),
    };
  });

  const dateStr = format(new Date(), "yyyyMMdd-HHmmss");
  const baseFileName = `feedbacks-${dateStr}`;

  if (formatType === "excel") {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Feedbacks");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
    }));

    rows.forEach((row) => worksheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      buffer,
      fileName: `${baseFileName}.xlsx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  } else {
    const parser = new Parser();
    const csv = parser.parse(rows);
    return {
      buffer: Buffer.from(csv, "utf-8"),
      fileName: `${baseFileName}.csv`,
      mimeType: "text/csv",
    };
  }
};

const parseFlexibleDate = (value?: string): Date | undefined => {
  if (!value) return undefined;

  // Coba parse ISO dulu
  const iso = parseISO(value);
  if (!isNaN(iso.getTime())) return iso;

  // Coba parse dd-mm-yyyy
  const [dd, mm, yyyy] = value.split("-");
  if (!dd || !mm || !yyyy) return undefined;

  const constructed = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
  return isNaN(constructed.getTime()) ? undefined : constructed;
};

export const getFeedbackStatistics = async (params: {
  startDate?: string;
  endDate?: string;
}) => {
  const start = parseFlexibleDate(params.startDate) ?? subDays(new Date(), 30);
  const end = parseFlexibleDate(params.endDate) ?? new Date();

  const dateFilter = {
    submittedDate: {
      gte: start,
      lte: end,
    },
  };

  const totalFeedback = await prisma.feedback.count({ where: dateFilter });

  const avgRatingRes = await prisma.feedback.aggregate({
    where: dateFilter,
    _avg: { rating: true },
  });

  const ratingDistributionRaw = await prisma.feedback.groupBy({
    by: ["rating"],
    _count: true,
    where: dateFilter,
    orderBy: { rating: "asc" },
  });

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
    const found = ratingDistributionRaw.find((r) => r.rating === i + 1);
    return { rating: i + 1, count: found?._count ?? 0 };
  });

  const anonymousCount = await prisma.feedback.count({
    where: { ...dateFilter, isAnonymous: true },
  });

  const visibleCount = await prisma.feedback.count({
    where: { ...dateFilter, isVisible: true },
  });

  const hiddenCount = totalFeedback - visibleCount;

  const latestFeedbacks = await prisma.feedback.findMany({
    where: dateFilter,
    take: 5,
    orderBy: { submittedDate: "desc" },
    include: {
      user: {
        select: { id: true, fullName: true },
      },
      session: {
        select: {
          id: true,
          date: true,
          mentoringService: {
            select: {
              id: true,
              serviceName: true,
            },
          },
        },
      },
    },
  });

  const avgPerSessionRaw = await prisma.feedback.groupBy({
    by: ["sessionId"],
    _avg: { rating: true },
    where: dateFilter,
  });

  const sessionIds = avgPerSessionRaw.map((s) => s.sessionId);

  const sessions = await prisma.mentoringSession.findMany({
    where: { id: { in: sessionIds } },
    select: {
      id: true,
      mentoringService: {
        select: {
          id: true,
          serviceName: true,
        },
      },
    },
  });

  const avgPerService = avgPerSessionRaw.map((stat) => {
    const session = sessions.find((s) => s.id === stat.sessionId);
    return {
      serviceId: session?.mentoringService.id ?? null,
      serviceName: session?.mentoringService.serviceName ?? "Unknown",
      avgRating: stat._avg.rating ?? 0,
    };
  });

  return {
    totalFeedback,
    averageRating: Number(avgRatingRes._avg.rating ?? 0).toFixed(2),
    ratingDistribution,
    anonymousCount,
    visibleCount,
    hiddenCount,
    latestFeedbacks,
    averageRatingPerService: avgPerService,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
};
