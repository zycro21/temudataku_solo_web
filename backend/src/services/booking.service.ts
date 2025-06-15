import { PrismaClient, Prisma } from "@prisma/client";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import { format, parseISO, subDays } from "date-fns";
import { Buffer } from "buffer";
import { format as formatDate } from "date-fns";

const prisma = new PrismaClient();

type ServiceType =
  | "one-on-one"
  | "group"
  | "bootcamp"
  | "shortclass"
  | "live class";

const generatePaymentId = async (
  type: "booking" | "practice"
): Promise<string> => {
  const datePart = formatDate(new Date(), "yyyyMMdd");
  const prefix = type === "booking" ? "PAY-BKG" : "PAY-PRC";
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    const id = `${prefix}-${datePart}-${randomDigits}`;
    const existing = await prisma.payment.findUnique({
      where: { id },
    });
    if (!existing) {
      return id;
    }
  }

  throw {
    status: 500,
    message: "Gagal menghasilkan ID Payment unik setelah beberapa percobaan",
  };
};

const generateBookingId = async (serviceType: ServiceType): Promise<string> => {
  const cleanType = serviceType.toLowerCase().replace(/\s+/g, "-");
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    const id = `Booking-${cleanType}-${randomDigits}`;
    const existing = await prisma.booking.findUnique({
      where: { id },
    });
    if (!existing) {
      return id;
    }
  }

  throw {
    status: 500,
    message: "Gagal menghasilkan ID Booking unik setelah beberapa percobaan",
  };
};

export const createBooking = async (
  menteeId: string,
  {
    mentoringServiceId,
    referralUsageId,
    specialRequests,
    bookingDate,
    participantIds = [],
  }: {
    mentoringServiceId: string;
    referralUsageId?: string;
    specialRequests?: string;
    bookingDate?: string;
    participantIds?: string[];
  }
) => {
  const mentoringService = await prisma.mentoringService.findUnique({
    where: { id: mentoringServiceId },
    select: {
      id: true,
      isActive: true,
      maxParticipants: true,
      serviceType: true,
      price: true,
    },
  });

  if (!mentoringService || !mentoringService.isActive) {
    throw {
      status: 404,
      message: "Mentoring service tidak ditemukan atau tidak aktif.",
    };
  }

  const validServiceTypes: ServiceType[] = [
    "one-on-one",
    "group",
    "bootcamp",
    "shortclass",
    "live class",
  ];
  if (
    !mentoringService.serviceType ||
    !validServiceTypes.includes(mentoringService.serviceType as ServiceType)
  ) {
    throw {
      status: 400,
      message: "Tipe layanan tidak valid atau tidak diisi.",
    };
  }

  const isManualBooking =
    mentoringService.serviceType === "one-on-one" ||
    mentoringService.serviceType === "group";
  const isMultiParticipant = mentoringService.serviceType === "group";

  if (!isMultiParticipant && participantIds.length > 0) {
    throw {
      status: 400,
      message: "participantIds hanya diperbolehkan untuk layanan Group.",
    };
  }

  const totalParticipants = 1 + participantIds.length;
  if (
    isMultiParticipant &&
    mentoringService.maxParticipants &&
    totalParticipants > mentoringService.maxParticipants
  ) {
    throw {
      status: 400,
      message: `Maksimal ${mentoringService.maxParticipants} peserta diperbolehkan.`,
    };
  }

  if (!isManualBooking && mentoringService.maxParticipants) {
    const activeBookings = await prisma.booking.count({
      where: {
        mentoringServiceId,
        status: { in: ["pending", "confirmed"] },
      },
    });
    if (activeBookings >= mentoringService.maxParticipants) {
      throw {
        status: 400,
        message: "Kapasitas untuk layanan ini sudah penuh.",
      };
    }
  }

  if (isMultiParticipant) {
    const uniqueParticipantIds = new Set(participantIds);
    if (uniqueParticipantIds.size !== participantIds.length) {
      throw {
        status: 400,
        message: "Terdapat duplikat pada participantIds.",
      };
    }
  }

  const allUserIds = [menteeId, ...participantIds];
  const existingUsers = await prisma.user.findMany({
    where: {
      id: { in: allUserIds },
    },
    select: { id: true },
  });

  if (existingUsers.length !== allUserIds.length) {
    throw {
      status: 400,
      message: "Terdapat userId yang tidak valid.",
    };
  }

  let discountPercentage = 0;
  let originalPrice = mentoringService.price.toNumber();
  let finalPrice = originalPrice;
  let referralCodeId: string | null = null;
  let commissionPercentage = 0;

  if (referralUsageId) {
    const referralUsage = await prisma.referralUsage.findUnique({
      where: { id: referralUsageId },
      include: {
        booking: true,
        practicePurchase: true,
        referralCode: {
          select: {
            id: true,
            discountPercentage: true,
            commissionPercentage: true,
          },
        },
      },
    });

    if (!referralUsage) {
      throw {
        status: 404,
        message: "Referral usage tidak ditemukan.",
      };
    }

    if (referralUsage.booking || referralUsage.practicePurchase) {
      throw {
        status: 400,
        message: "Referral usage sudah digunakan.",
      };
    }

    discountPercentage =
      referralUsage.referralCode.discountPercentage.toNumber();
    commissionPercentage =
      referralUsage.referralCode.commissionPercentage.toNumber();
    referralCodeId = referralUsage.referralCode.id;
    finalPrice = originalPrice * (1 - discountPercentage / 100);
  }

  let finalBookingDate: Date;

  if (isManualBooking) {
    if (!bookingDate) {
      throw {
        status: 400,
        message: "bookingDate wajib diisi untuk layanan one-on-one atau group.",
      };
    }

    const parsedDate = new Date(bookingDate);
    if (isNaN(parsedDate.getTime())) {
      throw {
        status: 400,
        message: "Format bookingDate tidak valid. Gunakan yyyy-mm-dd.",
      };
    }

    finalBookingDate = parsedDate;
  } else {
    finalBookingDate = new Date();
  }

  const booking = await prisma.$transaction(async (tx) => {
    const bookingId = await generateBookingId(
      mentoringService.serviceType as ServiceType
    );

    const newBooking = await tx.booking.create({
      data: {
        id: bookingId,
        menteeId,
        mentoringServiceId,
        referralUsageId,
        specialRequests,
        bookingDate: finalBookingDate,
        status: isManualBooking ? "confirmed" : "pending",
        participants: {
          create: [
            {
              userId: menteeId,
              isLeader: isManualBooking,
              paymentStatus: isManualBooking ? "confirmed" : "pending",
            },
            ...participantIds.map((userId) => ({
              userId,
              isLeader: false,
              paymentStatus: "confirmed",
            })),
          ],
        },
      },
      include: {
        participants: true,
      },
    });

    const paymentId = await generatePaymentId("booking");
    const payment = await tx.payment.create({
      data: {
        id: paymentId,
        bookingId: newBooking.id,
        amount: finalPrice,
        status: isManualBooking ? "confirmed" : "pending",
      },
    });

    if (payment.practicePurchaseId) {
      throw {
        status: 400,
        message:
          "Payment tidak boleh terkait dengan Booking dan PracticePurchase bersamaan.",
      };
    }

    // Catat komisi referral jika ada referralUsageId
    if (referralUsageId && referralCodeId) {
      const commissionAmount = finalPrice * (commissionPercentage / 100);
      await tx.referralCommisions.create({
        data: {
          referralCodeId,
          transactionId: paymentId,
          amount: commissionAmount,
          created_at: new Date(),
        },
      });
    }

    return {
      ...newBooking,
      payment,
      originalPrice,
      finalPrice,
    };
  });

  return {
    success: true,
    message: "Booking berhasil dibuat.",
    data: booking,
  };
};

export const getMenteeBookings = async (
  menteeId: string,
  {
    page,
    limit,
    status,
    sortBy,
    sortOrder,
  }: {
    page: number;
    limit: number;
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
) => {
  const skip = (page - 1) * limit;

  const whereClause = {
    menteeId,
    ...(status && { status }),
  };

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      mentoringService: true,
      participants: true,
    },
    orderBy: {
      [sortBy ?? "createdAt"]: sortOrder ?? "desc",
    },
    skip,
    take: limit,
  });

  const total = await prisma.booking.count({ where: whereClause });

  // Tambahkan pengecekan jika status di-filter tapi hasil kosong
  if (status && bookings.length === 0) {
    throw {
      status: 404,
      message: `Tidak ditemukan booking dengan status "${status}".`,
    };
  }

  return {
    data: bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getMenteeBookingDetail = async (
  userId: string,
  bookingId: string
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      mentoringService: true,
      participants: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true,
              email: true,
              city: true,
              province: true,
            },
          },
        },
      },
      payment: true,
    },
  });

  if (!booking) {
    throw { status: 404, message: "Booking tidak ditemukan." };
  }

  if (booking.menteeId !== userId) {
    throw { status: 403, message: "Akses ditolak. Bukan booking milikmu." };
  }

  const serviceType = booking.mentoringService.serviceType;

  let filteredParticipants = booking.participants;

  if (
    serviceType === "bootcamp" ||
    serviceType === "shortclass" ||
    serviceType === "liveclass"
  ) {
    filteredParticipants = filteredParticipants.filter(
      (p) => p.userId === userId
    );
  }

  return {
    ...booking,
    participants: filteredParticipants,
  };
};

export const updateMenteeBooking = async (
  userId: string,
  bookingId: string,
  {
    specialRequests,
    participantIds,
  }: {
    specialRequests?: string;
    participantIds?: string[];
  }
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      mentoringService: true,
      participants: true,
      payment: true,
    },
  });

  if (!booking) {
    throw { status: 404, message: "Booking tidak ditemukan." };
  }

  if (booking.menteeId !== userId) {
    throw { status: 403, message: "Akses ditolak. Ini bukan booking milikmu." };
  }

  const paymentStatus = booking.payment?.status;
  const isPaymentCompleted = paymentStatus === "completed";

  if (booking.status !== "pending" || isPaymentCompleted) {
    throw {
      status: 400,
      message:
        "Booking sudah dikonfirmasi atau sudah dibayar. Tidak bisa diubah.",
    };
  }

  const isGroup = booking.mentoringService.serviceType === "group";
  if (!isGroup && participantIds) {
    throw {
      status: 400,
      message: "Hanya booking group yang bisa mengubah daftar peserta.",
    };
  }

  // Update booking data
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      specialRequests,
      updatedAt: new Date(),
    },
  });

  // Update peserta jika perlu
  if (participantIds && isGroup) {
    await prisma.bookingParticipant.deleteMany({
      where: { bookingId },
    });

    // Tambahkan mentee sebagai peserta sekaligus leader
    const newParticipants = [
      {
        bookingId,
        userId: userId, // mentee
        isLeader: true,
        paymentStatus: "pending",
      },
      ...participantIds.map((participantId) => ({
        bookingId,
        userId: participantId,
        isLeader: false,
        paymentStatus: "pending",
      })),
    ];

    await prisma.bookingParticipant.createMany({
      data: newParticipants,
    });
  }

  const updatedBooking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      mentoringService: true,
      participants: {
        include: {
          user: true,
        },
      },
    },
  });

  return updatedBooking;
};

export const cancelMenteeBooking = async (
  userId: string,
  bookingId: string
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });

  if (!booking) {
    throw { status: 404, message: "Booking tidak ditemukan." };
  }

  if (booking.menteeId !== userId) {
    throw { status: 403, message: "Akses ditolak. Ini bukan booking milikmu." };
  }

  const isAlreadyPaid = booking.payment?.status === "completed";
  const isNotPending = booking.status !== "pending";

  if (isAlreadyPaid || isNotPending) {
    throw {
      status: 400,
      message:
        "Booking sudah dikonfirmasi atau dibayar, tidak bisa dibatalkan.",
    };
  }

  // Ubah status booking jadi 'cancelled'
  const cancelled = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "cancelled",
      updatedAt: new Date(),
    },
  });

  // Ubah semua paymentStatus peserta jadi 'failed'
  await prisma.bookingParticipant.updateMany({
    where: {
      bookingId: bookingId,
    },
    data: {
      paymentStatus: "failed",
    },
  });

  return cancelled;
};

export const getAdminBookings = async (params: {
  status?: string;
  menteeName?: string;
  serviceName?: string;
  usedReferral?: boolean;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) => {
  const {
    status,
    menteeName,
    serviceName,
    usedReferral,
    startDate,
    endDate,
    page,
    limit,
    sortBy,
    sortOrder,
  } = params;

  const whereClause: any = {};

  if (status) whereClause.status = status;
  if (usedReferral !== undefined) {
    whereClause.referralUsageId = usedReferral
      ? { not: null }
      : { equals: null };
  }
  if (startDate || endDate) {
    whereClause.bookingDate = {};
    if (startDate) whereClause.bookingDate.gte = new Date(startDate);
    if (endDate) whereClause.bookingDate.lte = new Date(endDate);
  }

  const bookings = await prisma.booking.findMany({
    where: {
      ...whereClause,
      mentee: menteeName
        ? {
            fullName: {
              contains: menteeName,
              mode: "insensitive",
            },
          }
        : undefined,
      mentoringService: serviceName
        ? {
            serviceName: {
              contains: serviceName,
              mode: "insensitive",
            },
          }
        : undefined,
    },
    include: {
      mentee: true,
      mentoringService: true,
      referralUsage: {
        include: {
          referralCode: true,
        },
      },
      payment: true,
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.booking.count({
    where: {
      ...whereClause,
      mentee: menteeName
        ? {
            fullName: {
              contains: menteeName,
              mode: "insensitive",
            },
          }
        : undefined,
      mentoringService: serviceName
        ? {
            serviceName: {
              contains: serviceName,
              mode: "insensitive",
            },
          }
        : undefined,
    },
  });

  return {
    data: bookings,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAdminBookingDetail = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      mentee: true,
      mentoringService: true,
      referralUsage: {
        include: {
          referralCode: true,
          user: true,
        },
      },
      participants: {
        include: {
          user: true,
          payment: true,
        },
      },
      payment: true,
    },
  });

  return booking;
};

export const updateAdminBookingStatus = async (
  id: string,
  newStatus: "pending" | "confirmed" | "completed" | "cancelled"
) => {
  // Validasi status yang diperbolehkan (extra precaution)
  const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Status booking tidak valid.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      mentoringService: true,
      participants: true,
    },
  });

  if (!booking) return null;

  const isSpecialService =
    booking.mentoringService.serviceType === "bootcamp" ||
    booking.mentoringService.serviceType === "shortclass" ||
    booking.mentoringService.serviceType === "liveclass";

  // Update status booking
  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: {
      status: newStatus,
      updatedAt: new Date(),
    },
  });

  // Update status participants jika perlu
  if (newStatus === "cancelled") {
    await prisma.bookingParticipant.updateMany({
      where: { bookingId: id },
      data: { paymentStatus: "failed" },
    });
  } else if (newStatus === "confirmed" && !isSpecialService) {
    await prisma.bookingParticipant.updateMany({
      where: { bookingId: id },
      data: { paymentStatus: "confirmed" },
    });
  }

  return updatedBooking;
};

export const exportAdminBookings = async (formatType: "csv" | "excel") => {
  const bookings = await prisma.booking.findMany({
    include: {
      mentee: true,
      mentoringService: true,
      referralUsage: {
        include: {
          referralCode: true,
        },
      },
      participants: {
        include: {
          user: true,
        },
      },
    },
  });

  const flatData = bookings.map((booking) => ({
    BookingID: booking.id,
    MenteeName: booking.mentee.fullName,
    ServiceName: booking.mentoringService.serviceName,
    ServiceType: booking.mentoringService.serviceType,
    BookingDate: booking.bookingDate?.toISOString() ?? "-",
    Status: booking.status ?? "-",
    Participants: booking.participants.map((p) => p.user.fullName).join(", "),
    ReferralCode: booking.referralUsage?.referralCode.code ?? "-",
    CreatedAt: booking.createdAt?.toISOString() ?? "-",
  }));

  const timestamp = format(new Date(), "yyyyMMdd-HHmmss");

  if (formatType === "csv") {
    const parser = new Parser();
    const csv = parser.parse(flatData);

    return {
      fileBuffer: Buffer.from(csv, "utf-8"),
      fileName: `admin-bookings-${timestamp}.csv`,
      mimeType: "text/csv",
    };
  }

  // Excel (default)
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Bookings");

  worksheet.columns = Object.keys(flatData[0] || {}).map((key) => ({
    header: key,
    key,
    width: 25,
  }));

  worksheet.addRows(flatData);

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    fileBuffer: buffer,
    fileName: `admin-bookings-${timestamp}.xlsx`,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
};

export const getBookingParticipants = async (
  bookingId: string,
  menteeId: string
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              city: true,
              province: true,
              profilePicture: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.menteeId !== menteeId) {
    throw new Error("You are not allowed to view this booking's participants");
  }

  return booking.participants.map((p) => ({
    participantId: p.id,
    isLeader: p.isLeader,
    paymentStatus: p.paymentStatus,
    user: p.user,
  }));
};
