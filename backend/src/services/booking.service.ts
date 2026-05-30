import { PrismaClient, Prisma, Payment } from "@prisma/client";
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

const addMonthsSafe = (date: Date, months: number): Date => {
  const originalDay = date.getDate();

  const newDate = new Date(date);

  // pindah ke tanggal 1 dulu supaya aman
  newDate.setDate(1);

  // tambah bulan
  newDate.setMonth(newDate.getMonth() + months);

  // cari tanggal terakhir bulan target
  const lastDayOfMonth = new Date(
    newDate.getFullYear(),
    newDate.getMonth() + 1,
    0,
  ).getDate();

  // gunakan tanggal original atau max tanggal bulan target
  newDate.setDate(Math.min(originalDay, lastDayOfMonth));

  return newDate;
};

export const createBooking = async (
  menteeId: string,
  {
    mentoringServiceId,
    mentorProfileId,
    referralUsageId,
    paymentType,
    installmentCount,
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
    paymentType: "FULL" | "INSTALLMENT";
    installmentCount?: number;
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

  // ======================================================
  // VALIDASI SERVICE ADA
  // ======================================================

  if (!mentoringService || !mentoringService.isActive) {
    throw {
      status: 404,
      message: "Mentoring service tidak ditemukan atau tidak aktif.",
    };
  }

  // ======================================================
  // VALIDASI CICILAN
  // ======================================================

  const isBootcamp = mentoringService.serviceType === "bootcamp";

  if (paymentType === "INSTALLMENT" && !isBootcamp) {
    throw {
      status: 400,
      message: "Cicilan hanya tersedia untuk layanan bootcamp.",
    };
  }

  // ======================================================
  // ONE-ON-ONE & GROUP WAJIB FULL PAYMENT
  // ======================================================

  if (
    (mentoringService.serviceType === "one-on-one" ||
      mentoringService.serviceType === "group") &&
    paymentType !== "FULL"
  ) {
    throw {
      status: 400,
      message: "Layanan ini hanya mendukung pembayaran full.",
    };
  }

  // ======================================================
  // VALIDASI INSTALLMENT
  // ======================================================

  if (paymentType === "INSTALLMENT") {
    if (!installmentCount) {
      throw {
        status: 400,
        message: "installmentCount wajib diisi.",
      };
    }

    // hanya support 2x dan 3x
    if (![2, 3].includes(installmentCount)) {
      throw {
        status: 400,
        message: "Cicilan hanya tersedia untuk 2x atau 3x pembayaran.",
      };
    }
  }

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
        invoice: {
          payments: {
            some: {
              status: "confirmed",
            },
          },
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

  const generateInstallmentAmounts = (
    totalAmount: number,
    installmentCount: number,
  ): number[] => {
    // =========================
    // 2x cicilan => 60 : 40
    // =========================
    if (installmentCount === 2) {
      const first = Math.round(totalAmount * 0.6);
      const second = totalAmount - first;

      return [first, second];
    }

    // =========================
    // 3x cicilan => 50 : 30 : 20
    // =========================
    if (installmentCount === 3) {
      const first = Math.round(totalAmount * 0.5);
      const second = Math.round(totalAmount * 0.3);
      const third = totalAmount - first - second;

      return [first, second, third];
    }

    // =========================
    // selain itu fallback rata
    // =========================
    const baseAmount = Math.floor(totalAmount / installmentCount);

    const amounts = Array(installmentCount).fill(baseAmount);

    const remainder = totalAmount - baseAmount * installmentCount;

    amounts[installmentCount - 1] += remainder;

    return amounts;
  };

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

    // ======================================================
    // CREATE BOOKING INVOICE
    // ======================================================

    const invoice = await tx.bookingInvoice.create({
      data: {
        bookingId: newBooking.id,
        totalAmount: finalPrice,
        paidAmount: 0,
        remainingAmount: finalPrice,
        paymentType,
        installmentCount: paymentType === "INSTALLMENT" ? installmentCount : 1,
        status: "HAVENT_PAID",
      },
    });

    // ======================================================
    // GENERATE PAYMENTS
    // ======================================================

    const payments = [];

    // FULL PAYMENT
    if (paymentType === "FULL") {
      const paymentId = await generatePaymentId("booking");

      const payment = await tx.payment.create({
        data: {
          id: paymentId,
          bookingInvoiceId: invoice.id,
          amount: finalPrice,
          installmentNumber: 1,
          status: "pending",
          // =========================================
          // REMINDER SYSTEM
          // =========================================
          reminderCount: 0,
          lastReminderSentAt: null,
        },
      });

      payments.push(payment);
    }

    // INSTALLMENT PAYMENT
    if (paymentType === "INSTALLMENT") {
      const totalInstallment = installmentCount!;

      const installmentAmounts = generateInstallmentAmounts(
        finalPrice,
        totalInstallment,
      );

      for (let i = 0; i < installmentAmounts.length; i++) {
        const paymentId = await generatePaymentId("booking");

        // =========================================
        // DUE DATE
        // =========================================
        // cicilan:
        // 0 = hari ini
        // 1 = +1 bulan
        // 2 = +2 bulan
        const dueDate = addMonthsSafe(bookingCreatedAt, i);

        const payment = await tx.payment.create({
          data: {
            id: paymentId,
            bookingInvoiceId: invoice.id,
            installmentNumber: i + 1,
            amount: installmentAmounts[i],
            dueDate,
            status: "pending",
            // =========================================
            // NEW REMINDER SYSTEM
            // =========================================
            reminderCount: 0,
            lastReminderSentAt: null,
          },
        });

        payments.push(payment);
      }
    }

    const firstPayment = payments[0];

    // Catat komisi referral jika ada referralUsageId
    if (referralUsageId && referralCodeId) {
      const commissionAmount = finalPrice * (commissionPercentage / 100);

      await tx.referralCommisions.create({
        data: {
          referralCodeId,
          transactionId: firstPayment.id,
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
      invoice,
      payments,
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
      invoice: {
        include: {
          payments: {
            orderBy: {
              installmentNumber: "asc",
            },
          },
        },
      },

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

    // ======================================================
    // PAYMENT SUMMARY
    // ======================================================

    const invoice = booking.invoice;

    const paidInstallments =
      invoice?.payments.filter((payment) =>
        ["confirmed", "completed"].includes(
          (payment.status || "").toLowerCase(),
        ),
      ) || [];

    const totalPaid = paidInstallments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    const totalInstallments = invoice?.installmentCount || 1;

    const paidInstallmentCount = paidInstallments.length;

    return {
      ...booking,

      paymentSummary: invoice
        ? {
            paymentType: invoice.paymentType,
            invoiceStatus: invoice.status,

            totalAmount: Number(invoice.totalAmount),
            paidAmount: Number(invoice.paidAmount),
            remainingAmount: Number(invoice.remainingAmount),

            installmentCount: totalInstallments,
            paidInstallmentCount,

            totalPaid,

            isFullyPaid: invoice.status === "PAID_DONE",

            payments: invoice.payments,
          }
        : null,

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

      // GANTI payment: true
      invoice: {
        include: {
          payments: {
            orderBy: {
              installmentNumber: "asc",
            },
          },
        },
      },
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

  // ============================================
  // PAYMENT SUMMARY
  // ============================================

  const invoice = booking.invoice;

  const paidPayments =
    invoice?.payments.filter((payment) =>
      ["confirmed", "completed"].includes((payment.status || "").toLowerCase()),
    ) || [];

  const paidInstallmentCount = paidPayments.length;

  return {
    ...booking,

    participants: filteredParticipants,

    paymentSummary: invoice
      ? {
          paymentType: invoice.paymentType,
          invoiceStatus: invoice.status,

          totalAmount: Number(invoice.totalAmount),
          paidAmount: Number(invoice.paidAmount),
          remainingAmount: Number(invoice.remainingAmount),

          installmentCount: invoice.installmentCount || 1,
          paidInstallmentCount,

          isFullyPaid: invoice.status === "PAID_DONE",

          payments: invoice.payments,
        }
      : null,
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

  // ✅ Helper lokal
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
      // ✅ TAMBAHAN
      invoice: {
        include: {
          payments: {
            orderBy: {
              installmentNumber: "asc",
            },
          },
        },
      },

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

  const completedPrograms = bookings
    .filter((booking) => {
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

      // =========================================
      // OPTIONAL VALIDASI CICILAN BOOTCAMP
      // =========================================

      // Kalau mau bootcamp dianggap selesai
      // hanya jika pembayaran lunas
      if (
        booking.mentoringService?.serviceType === "bootcamp" &&
        booking.invoice &&
        booking.invoice.status !== "PAID_DONE"
      ) {
        return false;
      }

      return lastSessionDate < now;
    })
    .map((booking) => {
      const invoice = booking.invoice;

      const paidPayments =
        invoice?.payments.filter((payment) =>
          ["confirmed", "completed"].includes(
            (payment.status || "").toLowerCase(),
          ),
        ) || [];

      return {
        ...booking,

        paymentSummary: invoice
          ? {
              paymentType: invoice.paymentType,
              invoiceStatus: invoice.status,

              totalAmount: Number(invoice.totalAmount),
              paidAmount: Number(invoice.paidAmount),
              remainingAmount: Number(invoice.remainingAmount),

              installmentCount: invoice.installmentCount || 1,

              paidInstallmentCount: paidPayments.length,

              isFullyPaid: invoice.status === "PAID_DONE",

              payments: invoice.payments,
            }
          : null,
      };
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

      invoice: {
        include: {
          payments: true,
        },
      },
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

  const hasConfirmedPayment = booking.invoice?.payments.some(
    (payment) => payment.status === "confirmed",
  );

  const hasCompletedPayment = booking.invoice?.payments.some(
    (payment) => payment.status === "completed",
  );

  if (
    booking.status !== "pending" ||
    hasConfirmedPayment ||
    hasCompletedPayment
  ) {
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
      mentoringService: true,
      invoice: {
        include: {
          payments: true,
        },
      },
    },
  });

  if (!booking) {
    throw {
      status: 404,
      message: "Booking tidak ditemukan.",
    };
  }

  // ======================================================
  // VALIDASI OWNER
  // ======================================================

  if (booking.menteeId !== userId) {
    throw {
      status: 403,
      message: "Akses ditolak. Ini bukan booking milikmu.",
    };
  }

  // ======================================================
  // VALIDASI SERVICE TYPE
  // ======================================================

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

  // ======================================================
  // VALIDASI STATUS BOOKING
  // ======================================================

  if (booking.status !== "pending") {
    throw {
      status: 400,
      message:
        "Booking sudah dikonfirmasi atau dibatalkan, tidak bisa dibatalkan.",
    };
  }

  // ======================================================
  // VALIDASI PAYMENT
  // ======================================================

  const invoice = booking.invoice;

  if (!invoice) {
    throw {
      status: 400,
      message: "Invoice booking tidak ditemukan.",
    };
  }

  // jika ada payment confirmed/completed -> tidak bisa cancel
  const hasPaidPayment = invoice.payments.some((payment) =>
    ["confirmed", "completed"].includes((payment.status || "").toLowerCase()),
  );

  if (hasPaidPayment) {
    throw {
      status: 400,
      message:
        "Booking sudah memiliki pembayaran berhasil, tidak bisa dibatalkan.",
    };
  }

  // ======================================================
  // CANCEL BOOKING
  // ======================================================

  const cancelledBooking = await prisma.$transaction(async (tx) => {
    // update booking
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "cancelled",
        updatedAt: new Date(),
      },
    });

    // update invoice
    await tx.bookingInvoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
      },
    });

    // update semua payment pending jadi cancelled
    await tx.payment.updateMany({
      where: {
        bookingInvoiceId: invoice.id,
        status: "pending",
      },
      data: {
        status: "cancelled",
        updatedAt: new Date(),
      },
    });

    // update participant payment status
    await tx.bookingParticipant.updateMany({
      where: {
        bookingId,
      },
      data: {
        paymentStatus: "failed",
      },
    });

    return updatedBooking;
  });

  return cancelledBooking;
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

          mentoringSessions: true,
        },
      },

      referralUsage: {
        include: {
          referralCode: true,
        },
      },

      invoice: {
        include: {
          payments: {
            orderBy: {
              installmentNumber: "asc",
            },
          },
        },
      },
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

    const invoice = b.invoice;

    const paidInstallments =
      invoice?.payments.filter((payment) =>
        ["confirmed", "completed"].includes(
          (payment.status || "").toLowerCase(),
        ),
      ) || [];

    const paidInstallmentCount = paidInstallments.length;

    return {
      ...b,

      paymentSummary: invoice
        ? {
            paymentType: invoice.paymentType,
            invoiceStatus: invoice.status,

            totalAmount: Number(invoice.totalAmount),
            paidAmount: Number(invoice.paidAmount),
            remainingAmount: Number(invoice.remainingAmount),

            installmentCount: invoice.installmentCount || 1,
            paidInstallmentCount,

            isFullyPaid: invoice.status === "PAID_DONE",

            payments: invoice.payments,
          }
        : null,

      fileSizes,
    };
  });

  const total = filteredBookings.length;

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
      total,
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

      // ✅ GANTI payment -> invoice
      invoice: {
        include: {
          payments: {
            orderBy: {
              installmentNumber: "asc",
            },
          },
        },
      },
    },
  });

  if (!booking) {
    return null;
  }

  // Tetap batasi hanya booking type tertentu
  const serviceType = booking.mentoringService?.serviceType;

  const allowedServiceTypes = ["one-on-one", "group", "bootcamp"];

  if (!serviceType || !allowedServiceTypes.includes(serviceType)) {
    return null;
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

      invoice: {
        include: {
          payments: true,
        },
      },
    },
  });

  if (!booking) return null;

  const serviceType = booking.mentoringService?.serviceType;

  const allowedServiceTypes = ["one-on-one", "group", "bootcamp"];

  if (!serviceType || !allowedServiceTypes.includes(serviceType)) {
    return null;
  }

  const isBootcamp = serviceType === "bootcamp";

  /**
   * ==================================
   * VALIDASI CICILAN BOOTCAMP
   * ==================================
   */
  if (newStatus === "confirmed" && isBootcamp) {
    const invoice = booking.invoice;

    if (!invoice) {
      throw new Error("Invoice booking tidak ditemukan.");
    }

    const hasPaidInstallment = invoice.payments.length > 0;

    const canConfirm =
      invoice.status === "PAID_DONE" ||
      invoice.status === "PARTIALLY_PAID" ||
      hasPaidInstallment;

    if (!canConfirm) {
      throw new Error("Booking bootcamp belum memiliki pembayaran yang valid.");
    }
  }

  /**
   * ==================================
   * VALIDASI COMPLETED
   * ==================================
   */
  if (newStatus === "completed") {
    if (booking.status !== "confirmed") {
      throw new Error("Booking hanya bisa diselesaikan dari status confirmed.");
    }
  }

  /**
   * ==================================
   * UPDATE BOOKING
   * ==================================
   */
  const updatedBooking = await prisma.booking.update({
    where: { id },

    data: {
      status: newStatus,
      updatedAt: new Date(),
    },
  });

  /**
   * ==================================
   * UPDATE PARTICIPANT STATUS
   * ==================================
   */
  if (newStatus === "cancelled") {
    await prisma.bookingParticipant.updateMany({
      where: {
        bookingId: id,
      },

      data: {
        paymentStatus: "failed",
      },
    });

    /**
     * ==================================
     * UPDATE INVOICE CANCELLED
     * ==================================
     */
    if (booking.invoice) {
      await prisma.bookingInvoice.update({
        where: {
          id: booking.invoice.id,
        },

        data: {
          status: "CANCELLED",
          updatedAt: new Date(),
        },
      });
    }
  } else if (newStatus === "confirmed" && !isBootcamp) {
    /**
     * ==================================
     * NON BOOTCAMP AUTO CONFIRM
     * ==================================
     */
    await prisma.bookingParticipant.updateMany({
      where: {
        bookingId: id,
      },

      data: {
        paymentStatus: "confirmed",
      },
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

      // BARU
      invoice: {
        include: {
          payments: {
            orderBy: {
              installmentNumber: "asc",
            },
          },
        },
      },
    },
  });

  const flatData = bookings.map((booking) => {
    const invoice = booking.invoice;

    const payments = invoice?.payments ?? [];

    return {
      BookingID: booking.id,

      MenteeName: booking.mentee.fullName,

      ServiceName: booking.mentoringService.serviceName,

      ServiceType: booking.mentoringService.serviceType,

      BookingDate: booking.bookingDate?.toISOString() ?? "-",

      BookingStatus: booking.status ?? "-",

      // =========================
      // INVOICE
      // =========================
      PaymentType: invoice?.paymentType ?? "-",

      InvoiceStatus: invoice?.status ?? "-",

      TotalAmount: invoice?.totalAmount?.toString() ?? "0",

      PaidAmount: invoice?.paidAmount?.toString() ?? "0",

      RemainingAmount: invoice?.remainingAmount?.toString() ?? "0",

      InstallmentCount: invoice?.installmentCount ?? 0,

      // =========================
      // PAYMENTS
      // =========================
      TotalPayments: payments.length,

      PaidInstallments: payments.filter((p) => p.status === "confirmed").length,

      PaymentStatuses:
        payments.length > 0
          ? payments
              .map(
                (p) => `#${p.installmentNumber ?? 1}:${p.status ?? "pending"}`,
              )
              .join(" | ")
          : "-",

      PaymentMethods:
        payments.length > 0
          ? payments.map((p) => p.paymentMethod ?? "-").join(" | ")
          : "-",

      // =========================
      // PARTICIPANTS
      // =========================
      Participants: booking.participants.map((p) => p.user.fullName).join(", "),

      // =========================
      // REFERRAL
      // =========================
      ReferralCode: booking.referralUsage?.referralCode.code ?? "-",

      // =========================
      // BOOKING DETAIL
      // =========================
      Material: booking.material ?? "-",

      ExpectedOutput: booking.expectedOutput ?? "-",

      SupportDocument: booking.supportDocument ?? "-",

      CreatedAt: booking.createdAt?.toISOString() ?? "-",
    };
  });

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

  if (flatData.length > 0) {
    worksheet.columns = Object.keys(flatData[0]).map((key) => ({
      header: key,
      key,
      width: 25,
    }));

    worksheet.addRows(flatData);
  }

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

  // ======================================================
  // FUNCTION HITUNG TOTAL PAYMENT BERHASIL
  // ======================================================

  const calculateTotalPayments = (
    bookings: Array<{
      invoice: {
        payments: Payment[];
      } | null;
    }>,
  ) => {
    return bookings.reduce((sum, booking) => {
      const paidPayments =
        booking.invoice?.payments.filter((payment) =>
          ["confirmed", "completed"].includes(
            (payment.status || "").toLowerCase(),
          ),
        ) || [];

      const bookingTotal = paidPayments.reduce(
        (paymentSum, payment) => paymentSum + Number(payment.amount),
        0,
      );

      return sum + bookingTotal;
    }, 0);
  };

  // ======================================================
  // TOTAL ALL TIME
  // ======================================================

  const allEarningsRaw = await prisma.booking.findMany({
    where: {
      status: {
        in: ["confirmed", "completed"],
      },
      mentoringService: {
        serviceType: {
          in: allowedServiceTypes,
        },
        mentors: {
          some: {
            mentorProfileId: mentorId,
          },
        },
      },
    },
    include: {
      invoice: {
        include: {
          payments: true,
        },
      },
    },
  });

  const totalAllTime = calculateTotalPayments(allEarningsRaw);

  // ======================================================
  // BULAN INI
  // ======================================================

  const earningsThisMonthRaw = await prisma.booking.findMany({
    where: {
      status: {
        in: ["confirmed", "completed"],
      },
      mentoringService: {
        serviceType: {
          in: allowedServiceTypes,
        },
        mentors: {
          some: {
            mentorProfileId: mentorId,
          },
        },
      },
      bookingDate: {
        gte: startOfThisMonth,
      },
    },
    include: {
      invoice: {
        include: {
          payments: true,
        },
      },
    },
  });

  const totalThisMonth = calculateTotalPayments(earningsThisMonthRaw);

  // ======================================================
  // BULAN LALU
  // ======================================================

  const earningsLastMonthRaw = await prisma.booking.findMany({
    where: {
      status: {
        in: ["confirmed", "completed"],
      },
      mentoringService: {
        serviceType: {
          in: allowedServiceTypes,
        },
        mentors: {
          some: {
            mentorProfileId: mentorId,
          },
        },
      },
      bookingDate: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
    },
    include: {
      invoice: {
        include: {
          payments: true,
        },
      },
    },
  });

  const totalLastMonth = calculateTotalPayments(earningsLastMonthRaw);

  // ======================================================
  // GROWTH PERCENT
  // ======================================================

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
