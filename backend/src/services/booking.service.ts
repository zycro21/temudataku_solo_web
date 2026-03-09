import { PrismaClient, Prisma } from "@prisma/client";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import { format, parseISO, subDays } from "date-fns";
import { Buffer } from "buffer";
import { format as formatDate } from "date-fns";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path folder uploads utama
const uploadsRoot = path.join(__dirname, "../../uploads");

const prisma = new PrismaClient();

type ServiceType = "one-on-one" | "group" | "bootcamp";

const generatePaymentId = async (
  type: "booking" | "practice",
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

const getOrCreateAutoService = async (
  tx: Prisma.TransactionClient,
  serviceId: string,
  serviceType: "one-on-one" | "group",
) => {
  await tx.$executeRaw`
    SELECT id
    FROM mentoring_services
    WHERE id = ${serviceId}
    FOR UPDATE
  `;

  const currentService = await tx.mentoringService.findUnique({
    where: { id: serviceId },
  });

  if (!currentService) {
    throw {
      status: 404,
      message: "Service tidak ditemukan.",
    };
  }

  // 🔥 SELALU BUAT SERVICE BARU

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
  // khusus untuk ID → ganti dash jadi underscore
  const idPrefix = serviceType.replace(/-/g, "_");

  const generatedId = `${idPrefix}-${paddedNumber}`;

  await tx.mentoringService.create({
    data: {
      id: generatedId,
      serviceName:
        serviceType === "one-on-one"
          ? `Mentoring 1 on 1 - ${nextNumber}`
          : `Mentoring Group - ${nextNumber}`,
      description: currentService.description,
      price: currentService.price,
      serviceType: currentService.serviceType,
      maxParticipants: currentService.maxParticipants,
      durationDays: currentService.durationDays,
      isActive: true,
    },
  });

  return currentService; // booking tetap pakai service lama
};

const generateRandomString = (length: number) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
};

export const createBooking = async (
  menteeId: string,
  {
    mentoringServiceId,
    mentorProfileId,
    referralUsageId,
    specialRequests,
    bookingDate,
    participantIds = [],
    material,
    expectedOutput,
    supportDocument,
    startTime,
    endTime,
  }: {
    mentoringServiceId: string;
    mentorProfileId?: string;
    referralUsageId?: string;
    specialRequests?: string;
    bookingDate?: string;
    participantIds?: string[];
    material?: string;
    expectedOutput?: string;
    supportDocument?: string[] | null;
    startTime?: { hour: number; minute: number };
    endTime?: { hour: number; minute: number };
  },
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

  // CEK DUPLIKASI BOOKING BOOTCAMP
  if (mentoringService.serviceType === "bootcamp") {
    const existingConfirmedBooking = await prisma.booking.findFirst({
      where: {
        menteeId,
        mentoringServiceId,
        payment: {
          status: "confirmed",
        },
      },
    });

    if (existingConfirmedBooking) {
      throw {
        status: 400,
        message: "Kamu sudah membeli bootcamp ini.",
      };
    }
  }

  const validServiceTypes: ServiceType[] = ["one-on-one", "group", "bootcamp"];

  if (
    !mentoringService.serviceType ||
    !validServiceTypes.includes(mentoringService.serviceType as ServiceType)
  ) {
    throw {
      status: 400,
      message: "Layanan ini tidak tersedia untuk sistem booking.",
    };
  }

  if (
    !mentoringService.serviceType ||
    !validServiceTypes.includes(mentoringService.serviceType as ServiceType)
  ) {
    throw {
      status: 400,
      message: "Tipe layanan tidak valid atau tidak diisi.",
    };
  }

  // VALIDASI MENTOR UNTUK ONE-ON-ONE / GROUP
  if (
    mentoringService.serviceType === "one-on-one" ||
    mentoringService.serviceType === "group"
  ) {
    if (!mentorProfileId) {
      throw {
        status: 400,
        message: "mentorProfileId wajib dipilih untuk layanan ini.",
      };
    }

    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorProfileId },
    });

    if (!mentor) {
      throw {
        status: 404,
        message: "Mentor tidak ditemukan.",
      };
    }
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
        status: { in: ["confirmed"] },
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

  // bookingDate database = selalu waktu booking dibuat
  const bookingCreatedAt = new Date();

  // bookingDate dari frontend hanya untuk session
  let sessionBookingDate: string | undefined;

  if (isManualBooking) {
    if (!bookingDate) {
      throw {
        status: 400,
        message: "bookingDate wajib diisi untuk layanan ini.",
      };
    }

    if (!startTime || !endTime) {
      throw {
        status: 400,
        message: "startTime dan endTime wajib diisi untuk layanan ini.",
      };
    }

    sessionBookingDate = bookingDate;
  }

  const booking = await prisma.$transaction(async (tx) => {
    let finalService = mentoringService;

    if (
      mentoringService.serviceType === "one-on-one" ||
      mentoringService.serviceType === "group"
    ) {
      finalService = await getOrCreateAutoService(
        tx,
        mentoringService.id,
        mentoringService.serviceType as "one-on-one" | "group",
      );
    }

    // Attach mentor ke service jika belum ada
    if (
      (finalService.serviceType === "one-on-one" ||
        finalService.serviceType === "group") &&
      mentorProfileId
    ) {
      const existingRelation = await tx.mentoringServiceMentor.findFirst({
        where: {
          mentoringServiceId: finalService.id,
          mentorProfileId,
        },
      });

      if (!existingRelation) {
        await tx.mentoringServiceMentor.create({
          data: {
            mentoringServiceId: finalService.id,
            mentorProfileId,
          },
        });
      }
    }

    const bookingId = await generateBookingId(
      finalService.serviceType as ServiceType,
    );

    const newBooking = await tx.booking.create({
      data: {
        id: bookingId,
        menteeId,
        mentoringServiceId: finalService.id,
        referralUsageId,
        specialRequests,
        bookingDate: bookingCreatedAt,
        material,
        expectedOutput,
        supportDocument: supportDocument
          ? JSON.stringify(supportDocument)
          : null, // simpan JSON string
        status: "pending",
        participants: {
          create: [
            {
              userId: menteeId,
              isLeader: true,
              paymentStatus: "pending",
            },
            ...participantIds.map((userId) => ({
              userId,
              isLeader: false,
              paymentStatus: "pending",
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
        status: "pending",
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

    // =======================================================
    // ✅ AUTO CREATE MENTORING SESSION
    // =======================================================

    if (
      (finalService.serviceType === "one-on-one" ||
        finalService.serviceType === "group") &&
      mentorProfileId &&
      startTime &&
      endTime
    ) {
      const formatToDDMMYYYY = (date: string) => {
        const [year, month, day] = date.split("-");
        return `${day}-${month}-${year}`;
      };

      const sessionDate = formatToDDMMYYYY(sessionBookingDate!);

      const createWIBDateTime = (
        date: string,
        time: { hour: number; minute: number },
      ) => {
        const [year, month, day] = date.split("-");
        const hour = time.hour.toString().padStart(2, "0");
        const minute = time.minute.toString().padStart(2, "0");

        return new Date(`${year}-${month}-${day}T${hour}:${minute}:00+07:00`);
      };

      const startDateObj = createWIBDateTime(sessionBookingDate!, startTime);
      const endDateObj = createWIBDateTime(sessionBookingDate!, endTime);

      if (endDateObj <= startDateObj) {
        throw {
          status: 400,
          message: "endTime harus lebih besar dari startTime.",
        };
      }

      const durationMinutes = Math.floor(
        (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60),
      );

      const sessionId = `Session-${generateRandomString(10)}-${finalService.id}`;

      const session = await tx.mentoringSession.create({
        data: {
          id: sessionId,
          serviceId: finalService.id,
          date: sessionDate,
          startTime: startDateObj.toISOString(),
          endTime: endDateObj.toISOString(),
          durationMinutes,
          status: "scheduled",
          notes: specialRequests ?? null,
        },
      });

      await tx.mentoringSessionMentor.create({
        data: {
          mentoringSessionId: session.id,
          mentorProfileId,
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

export const updateBookingContent = async (
  bookingId: string,
  userId: string,
  {
    material,
    expectedOutput,
    supportDocument,
  }: {
    material?: string;
    expectedOutput?: string;
    supportDocument?: string[] | null;
  },
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { participants: true },
  });

  if (!booking) {
    throw { status: 404, message: "Booking not found." };
  }

  // Authorization: hanya leader boleh update
  const isLeader = booking.participants.find(
    (p) => p.userId === userId && p.isLeader,
  );

  if (!isLeader) {
    throw { status: 403, message: "Only leader can update booking content." };
  }

  let existingDocs: string[] = [];

  if (booking.supportDocument) {
    existingDocs = JSON.parse(booking.supportDocument);
  }

  if (supportDocument && supportDocument.length > 0) {
    existingDocs = [...existingDocs, ...supportDocument];
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      ...(material && { material }),
      ...(expectedOutput && { expectedOutput }),
      ...(supportDocument && {
        supportDocument: JSON.stringify(existingDocs),
      }),
      updatedAt: new Date(),
    },
  });

  return updatedBooking;
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
  },
) => {
  const skip = (page - 1) * limit;

  const whereClause = {
    menteeId,
    ...(status && { status }),
    mentoringService: {
      serviceType: {
        in: ["one-on-one", "group", "bootcamp"],
      },
    },
  };

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      mentoringService: {
        include: {
          projects: {
            include: {
              submissions: {
                where: { menteeId },
                select: {
                  id: true,
                  title: true,
                  filePaths: true,
                  projectId: true,
                  projectLink: true,
                  submissionDate: true,
                  score: true,
                  briefScore: true,
                  technicalScore: true,
                  creativityScore: true,
                  completenessScore: true,
                  plagiarismScore: true,
                  mentorFeedback: true,
                  mentorSuggestion: true,
                  reviewStatus: true,
                  isReviewed: true,
                  isRevisedRequired: true,
                  revisionDeadline: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
          mentoringSessions: {
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
              feedbacks: {
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
      },
      participants: true,
    },
    orderBy: {
      [sortBy ?? "createdAt"]: sortOrder ?? "desc",
    },
    skip,
    take: limit,
  });

  const total = await prisma.booking.count({ where: whereClause });

  // if (status && bookings.length === 0) {
  //   throw {
  //     status: 404,
  //     message: `Tidak ditemukan booking dengan status "${status}".`,
  //   };
  // }

  // 🔹 Tambahkan status project + ukuran file submission
  const enrichedBookings = bookings.map((booking) => {
    const mentoringService = booking.mentoringService;
    if (!mentoringService) return booking;

    const projects = mentoringService.projects.map((proj) => {
      const submissions = proj.submissions.map((subm) => {
        let filesWithSize: any[] = [];

        if (Array.isArray(subm.filePaths)) {
          filesWithSize = subm.filePaths.map((fp) => {
            try {
              const filePath = path.join(uploadsRoot, fp);
              const stats = fs.statSync(filePath);
              const sizeKB = (stats.size / 1024).toFixed(2) + " KB";
              return { filePath: fp, size: sizeKB };
            } catch (err) {
              return { filePath: fp, size: "Unknown" };
            }
          });
        }

        return {
          ...subm,
          fileDetails: filesWithSize,
        };
      });

      const submission = submissions?.[0];
      let status = "Belum Dikumpulkan";

      if (submission) {
        if (submission.isReviewed && submission.reviewStatus === "REVIEWED") {
          status = "Sudah Direview";
        } else if (submission.isRevisedRequired) {
          status = "Perlu Revisi";
        } else {
          status = "Sudah Dikumpulkan";
        }
      }

      return {
        ...proj,
        status,
        submissions,
      };
    });

    return {
      ...booking,
      mentoringService: {
        ...mentoringService,
        projects,
      },
    };
  });

  return {
    data: enrichedBookings,
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
  bookingId: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      mentoringService: {
        include: {
          mentoringSessions: {
            include: {
              mentors: {
                include: {
                  mentorProfile: true,
                },
              },
            },
          },
        },
      },
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

  const serviceType = booking.mentoringService?.serviceType;

  if (!serviceType) {
    throw {
      status: 404,
      message: "Booking tidak ditemukan.",
    };
  }

  const allowedServiceTypes = ["one-on-one", "group", "bootcamp"];

  if (!allowedServiceTypes.includes(serviceType)) {
    throw {
      status: 404,
      message: "Booking tidak ditemukan.",
    };
  }

  let filteredParticipants = booking.participants;

  // Bootcamp tetap hanya tampilkan diri sendiri
  if (serviceType === "bootcamp") {
    filteredParticipants = filteredParticipants.filter(
      (p) => p.userId === userId,
    );
  }

  return {
    ...booking,
    participants: filteredParticipants,
  };
};

export const getCompletedPrograms = async (
  menteeId: string,
  {
    page,
    limit,
    sortBy,
    sortOrder,
  }: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  },
) => {
  const skip = (page - 1) * limit;
  const now = new Date();

  // ✅ Helper lokal (tidak keluar dari function ini)
  const parseDDMMYYYY = (dateString: string): Date => {
    const [day, month, year] = dateString.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const bookings = await prisma.booking.findMany({
    where: {
      menteeId,
      status: {
        in: ["confirmed", "completed"],
      },
      mentoringService: {
        serviceType: {
          in: ["one-on-one", "group", "bootcamp"],
        },
      },
    },
    include: {
      mentoringService: {
        include: {
          mentoringSessions: true,
        },
      },
    },
    orderBy: {
      [sortBy ?? "bookingDate"]: sortOrder ?? "desc",
    },
  });

  const completedPrograms = bookings.filter((booking) => {
    const sessions = booking.mentoringService?.mentoringSessions;

    if (!sessions || sessions.length === 0) return false;

    // ambil session terakhir
    const sortedSessions = [...sessions].sort((a, b) => {
      const dateA = parseDDMMYYYY(a.date);
      const dateB = parseDDMMYYYY(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    const lastSession = sortedSessions[0];
    if (!lastSession?.date) return false;

    const lastSessionDate = parseDDMMYYYY(lastSession.date);

    return lastSessionDate < now;
  });

  const paginated = completedPrograms.slice(skip, skip + limit);

  return {
    data: paginated,
    pagination: {
      page,
      limit,
      total: completedPrograms.length,
      totalPages: Math.ceil(completedPrograms.length / limit),
    },
  };
};

export const updateMenteeBooking = async (
  userId: string,
  bookingId: string,
  {
    specialRequests,
    participantIds,
    material,
    expectedOutput,
  }: {
    specialRequests?: string;
    participantIds?: string[];
    material?: string;
    expectedOutput?: string;
  },
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

  // Batasi hanya 3 tipe layanan
  const serviceType = booking.mentoringService?.serviceType;

  if (!serviceType) {
    throw { status: 404, message: "Booking tidak ditemukan." };
  }

  const allowedServiceTypes = ["one-on-one", "group", "bootcamp"];

  if (!allowedServiceTypes.includes(serviceType)) {
    throw { status: 404, message: "Booking tidak ditemukan." };
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

  const isGroup = serviceType === "group";

  if (!isGroup && participantIds) {
    throw {
      status: 400,
      message: "Hanya booking group yang bisa mengubah daftar peserta.",
    };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      specialRequests,
      material,
      expectedOutput,
      updatedAt: new Date(),
    },
  });

  if (participantIds && isGroup) {
    await prisma.bookingParticipant.deleteMany({
      where: { bookingId },
    });

    const newParticipants = [
      {
        bookingId,
        userId,
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
  bookingId: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      payment: true,
      mentoringService: true, // tambahan
    },
  });

  if (!booking) {
    throw { status: 404, message: "Booking tidak ditemukan." };
  }

  if (booking.menteeId !== userId) {
    throw { status: 403, message: "Akses ditolak. Ini bukan booking milikmu." };
  }

  // Batasi hanya 3 tipe layanan
  const serviceType = booking.mentoringService?.serviceType;

  if (!serviceType) {
    throw { status: 404, message: "Booking tidak ditemukan." };
  }

  const allowedServiceTypes = ["one-on-one", "group", "bootcamp"];

  if (!allowedServiceTypes.includes(serviceType)) {
    throw { status: 404, message: "Booking tidak ditemukan." };
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

  const cancelled = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "cancelled",
      updatedAt: new Date(),
    },
  });

  await prisma.bookingParticipant.updateMany({
    where: {
      bookingId,
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
  isRescheduled?: boolean;
  hasSession?: boolean; // BARU
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
    isRescheduled,
    hasSession, // ⬅️ BARU
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

    if (startDate) {
      whereClause.bookingDate.gte = new Date(startDate);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      whereClause.bookingDate.lte = end;
    }
  }

  /**
   * ===============================
   * STEP A — mentoringService filter
   * ===============================
   */
  const mentoringServiceFilter: any = {
    // WAJIB hanya 3 tipe ini
    serviceType: {
      in: ["one-on-one", "group", "bootcamp"],
    },
  };

  // FILTER NAMA SERVICE
  if (serviceName) {
    mentoringServiceFilter.serviceName = {
      contains: serviceName,
      mode: "insensitive",
    };
  }

  // FILTER PUNYA SESSION
  if (hasSession) {
    mentoringServiceFilter.mentoringSessions = {
      some: {},
    };
  }

  // FILTER RESCHEDULE
  if (isRescheduled) {
    mentoringServiceFilter.serviceType = {
      in: ["one-on-one", "group"], // tetap sesuai logic lama
    };

    mentoringServiceFilter.mentoringSessions = {
      some: {},
    };
  }

  /**
   * ===============================
   * STEP B — QUERY PRISMA
   * ===============================
   */
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
      mentoringService:
        Object.keys(mentoringServiceFilter).length > 0
          ? mentoringServiceFilter
          : undefined,
    },
    include: {
      mentee: true,
      mentoringService: {
        include: {
          mentors: {
            include: {
              mentorProfile: {
                include: {
                  user: true,
                },
              },
            },
          },
          mentoringSessions: true, // ⬅️ WAJIB
        },
      },
      referralUsage: { include: { referralCode: true } },
      payment: true,
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
  });

  /**
   * ===============================
   * STEP C — FILTER RESCHEDULE (JS)
   * ===============================
   */
  let filteredBookings = bookings;

  if (isRescheduled) {
    filteredBookings = bookings.filter((booking) => {
      const sessions = booking.mentoringService?.mentoringSessions ?? [];

      return sessions.some(
        (s) =>
          s.updatedAt &&
          s.createdAt &&
          new Date(s.updatedAt).getTime() > new Date(s.createdAt).getTime(),
      );
    });
  }

  /**
   * ===============================
   * STEP D — FILE SIZE (TETAP)
   * ===============================
   */
  const bookingsWithSize = filteredBookings.map((b) => {
    let fileSizes: Array<number | null> = [];

    if (b.supportDocument) {
      let files: string[] = [];

      try {
        files = JSON.parse(b.supportDocument);
      } catch {
        files = [];
      }

      if (files.length > 0) {
        fileSizes = files.map((rawPath) => {
          try {
            const fixedPath = rawPath.replace(
              "supportDocuments",
              "supportDocument",
            );

            const filePath = path.join(uploadsRoot, fixedPath);
            const stats = fs.statSync(filePath);
            return stats.size;
          } catch {
            return null;
          }
        });
      }
    }

    return {
      ...b,
      fileSizes,
    };
  });

  /**
   * ===============================
   * STEP E — RETURN
   * ===============================
   */
  return {
    data: bookingsWithSize,
    meta: {
      page,
      limit,
      total: bookingsWithSize.length,
      totalPages: Math.ceil(bookingsWithSize.length / limit),
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

  if (!booking) {
    return null;
  }

  // Batasi hanya 3 serviceType
  const serviceType = booking.mentoringService?.serviceType;

  const allowedServiceTypes = ["one-on-one", "group", "bootcamp"];

  if (!serviceType || !allowedServiceTypes.includes(serviceType)) {
    return null; // dianggap tidak ditemukan
  }

  return booking;
};

export const updateAdminBookingStatus = async (
  id: string,
  newStatus: "pending" | "confirmed" | "completed" | "cancelled",
) => {
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

  const serviceType = booking.mentoringService?.serviceType;

  // Hanya boleh 3 tipe
  const allowedServiceTypes = ["one-on-one", "group", "bootcamp"];

  if (!serviceType || !allowedServiceTypes.includes(serviceType)) {
    return null; // dianggap tidak ditemukan
  }

  // Bootcamp tetap special
  const isSpecialService = serviceType === "bootcamp";

  // ==========================
  // UPDATE BOOKING
  // ==========================
  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: {
      status: newStatus,
      updatedAt: new Date(),
    },
  });

  // ==========================
  // UPDATE PARTICIPANTS
  // ==========================
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
  const allowedServiceTypes = ["one-on-one", "group", "bootcamp"];

  const bookings = await prisma.booking.findMany({
    where: {
      mentoringService: {
        serviceType: {
          in: allowedServiceTypes,
        },
      },
    },
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
    Material: booking.material ?? "-",
    ExpectedOutput: booking.expectedOutput ?? "-",
    SupportDocument: booking.supportDocument ?? "-",
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

  // Excel
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
  menteeId: string,
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

  // Batasi hanya 3 serviceType
  const allowedServiceTypes = ["one-on-one", "group", "bootcamp"];
  const serviceType = booking.mentoringService?.serviceType;

  if (!serviceType || !allowedServiceTypes.includes(serviceType)) {
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

export const getMentorEarnings = async (params: { mentorId: string }) => {
  const { mentorId } = params;

  const allowedServiceTypes = ["one-on-one", "group", "bootcamp"];

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // === TOTAL SEMUA WAKTU ===
  const allEarningsRaw = await prisma.booking.findMany({
    where: {
      status: { in: ["confirmed", "completed"] },
      mentoringService: {
        serviceType: { in: allowedServiceTypes },
        mentors: {
          some: { mentorProfileId: mentorId },
        },
      },
    },
    include: { payment: true },
  });

  const totalAllTime = allEarningsRaw.reduce(
    (sum, b) => sum + (b.payment?.amount ? Number(b.payment.amount) : 0),
    0,
  );

  // === BULAN INI ===
  const earningsThisMonthRaw = await prisma.booking.findMany({
    where: {
      status: { in: ["confirmed", "completed"] },
      mentoringService: {
        serviceType: { in: allowedServiceTypes },
        mentors: {
          some: { mentorProfileId: mentorId },
        },
      },
      bookingDate: { gte: startOfThisMonth },
    },
    include: { payment: true },
  });

  const totalThisMonth = earningsThisMonthRaw.reduce(
    (sum, b) => sum + (b.payment?.amount ? Number(b.payment.amount) : 0),
    0,
  );

  // === BULAN LALU ===
  const earningsLastMonthRaw = await prisma.booking.findMany({
    where: {
      status: { in: ["confirmed", "completed"] },
      mentoringService: {
        serviceType: { in: allowedServiceTypes },
        mentors: {
          some: { mentorProfileId: mentorId },
        },
      },
      bookingDate: { gte: startOfLastMonth, lte: endOfLastMonth },
    },
    include: { payment: true },
  });

  const totalLastMonth = earningsLastMonthRaw.reduce(
    (sum, b) => sum + (b.payment?.amount ? Number(b.payment.amount) : 0),
    0,
  );

  const growthPercent =
    totalLastMonth === 0
      ? totalThisMonth > 0
        ? 100
        : 0
      : ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;

  return {
    total: totalAllTime,
    growthPercent: Math.round(growthPercent),
  };
};

// Fungsi untuk admin: semua mentor, pagination
export const getAllMentorsEarnings = async (params: {
  page: number;
  limit: number;
}) => {
  const { page, limit } = params;
  const skip = (page - 1) * limit;

  const mentors = await prisma.mentorProfile.findMany({
    skip,
    take: limit,
    include: {
      user: true,
    },
  });

  const data = await Promise.all(
    mentors.map(async (mentor) => {
      const earnings = await getMentorEarnings({ mentorId: mentor.id });
      return {
        mentorId: mentor.id,
        fullName: mentor.user.fullName,
        ...earnings,
      };
    }),
  );

  const totalCount = await prisma.mentorProfile.count();

  return {
    data,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

export const getMentorBookings = async ({
  mentorId,
}: {
  mentorId?: string;
}) => {
  const allowedServiceTypes = ["one-on-one", "group", "bootcamp"];

  const bookings = await prisma.booking.findMany({
    where: {
      mentoringService: {
        serviceType: { in: allowedServiceTypes },
        ...(mentorId && {
          mentors: {
            some: {
              mentorProfileId: mentorId,
            },
          },
        }),
      },
    },
    include: {
      mentoringService: true,
      participants: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              city: true,
              province: true,
              profilePicture: true,
            },
          },
        },
      },
    },
  });

  return bookings.map((b) => ({
    bookingId: b.id,
    serviceId: b.mentoringServiceId,
    serviceName: b.mentoringService.serviceName,
    serviceType: b.mentoringService.serviceType,
    status: b.status,
    material: b.material,
    expectedOutput: b.expectedOutput,
    supportDocument: b.supportDocument,
    participants: b.participants.map((p) => ({
      participantId: p.id,
      isLeader: p.isLeader,
      paymentStatus: p.paymentStatus,
      user: p.user,
    })),
  }));
};

export const getMentorMenteeStats = async ({
  mentorId,
}: {
  mentorId?: string;
}) => {
  const allowedServiceTypes = ["one-on-one", "group", "bootcamp"];

  const services = await prisma.mentoringService.findMany({
    where: {
      serviceType: { in: allowedServiceTypes },
      ...(mentorId && {
        mentors: { some: { mentorProfileId: mentorId } },
      }),
    },
    include: {
      mentors: { select: { mentorProfileId: true } },
      mentoringSessions: {
        include: {
          mentors: { select: { mentorProfileId: true } },
        },
      },
      bookings: {
        include: {
          participants: { select: { userId: true } },
        },
      },
    },
  });

  const statsMap = new Map<
    string,
    {
      mentorId: string;
      serviceType: string;
      totalMentees: number;
      totalSessions: number;
    }
  >();

  services.forEach((service) => {
    service.mentors.forEach((m) => {
      if (mentorId && m.mentorProfileId !== mentorId) return;

      const key = `${m.mentorProfileId}-${service.serviceType ?? ""}`;

      if (!statsMap.has(key)) {
        statsMap.set(key, {
          mentorId: m.mentorProfileId,
          serviceType: service.serviceType ?? "",
          totalMentees: 0,
          totalSessions: 0,
        });
      }

      const stat = statsMap.get(key)!;

      const sessionsCount = service.mentoringSessions.filter((s) =>
        s.mentors.some((sm) => sm.mentorProfileId === m.mentorProfileId),
      ).length;

      stat.totalSessions += sessionsCount;

      if (sessionsCount > 0) {
        const menteeSet = new Set<string>();
        service.bookings.forEach((b) => {
          b.participants.forEach((p) => menteeSet.add(p.userId));
        });
        stat.totalMentees += menteeSet.size;
      }
    });
  });

  return Array.from(statsMap.values());
};
