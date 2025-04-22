import { PrismaClient, Prisma } from "@prisma/client";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import { format, parseISO, subDays } from "date-fns";
import { Buffer } from "buffer";

const prisma = new PrismaClient();

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
    participantIds?: string[];
    bookingDate?: string; // <-- ubah dari Date ke string (input format: "yyyy-mm-dd")
  }
) => {
  // 1. Cek service ada dan aktif
  const mentoringService = await prisma.mentoringService.findUnique({
    where: { id: mentoringServiceId },
  });

  if (!mentoringService || !mentoringService.isActive) {
    throw {
      status: 404,
      message: "Mentoring service tidak ditemukan atau tidak aktif.",
    };
  }

  const totalParticipants = 1 + participantIds.length;
  if (
    mentoringService.maxParticipants &&
    totalParticipants > mentoringService.maxParticipants
  ) {
    throw {
      status: 400,
      message: `Maksimal ${mentoringService.maxParticipants} peserta diperbolehkan.`,
    };
  }

  // 2. Validasi duplikat participantIds
  const uniqueParticipantIds = new Set(participantIds);
  if (uniqueParticipantIds.size !== participantIds.length) {
    throw {
      status: 400,
      message: "Terdapat duplikat pada participantIds.",
    };
  }

  // 3. Validasi user eksis
  const allUserIds = [menteeId, ...participantIds];
  const existingUsers = await prisma.user.findMany({
    where: {
      id: {
        in: allUserIds,
      },
    },
    select: { id: true },
  });

  if (existingUsers.length !== allUserIds.length) {
    throw {
      status: 400,
      message: "Terdapat userId yang tidak valid.",
    };
  }

  // 4. Validasi referralUsageId (jika ada)
  if (referralUsageId) {
    const referral = await prisma.referralUsage.findUnique({
      where: { id: referralUsageId },
      include: {
        booking: true,
      },
    });

    if (!referral) {
      throw {
        status: 404,
        message: "Referral usage tidak ditemukan.",
      };
    }

    if (referral.booking.length > 0) {
      throw {
        status: 400,
        message: "Referral usage sudah digunakan.",
      };
    }
  }

  // Konversi string bookingDate (yyyy-mm-dd) ke Date
  let finalBookingDate = new Date();
  if (bookingDate) {
    const parsedDate = new Date(bookingDate);
    if (isNaN(parsedDate.getTime())) {
      throw {
        status: 400,
        message: "Format bookingDate tidak valid. Gunakan yyyy-mm-dd.",
      };
    }
    finalBookingDate = parsedDate;
  }

  // Generate Booking ID unik
  function generateBookingId(serviceType: string): string {
    const cleanType = serviceType.toLowerCase().replace(/\s+/g, "-");
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    return `Booking-${cleanType}-${randomDigits}`;
  }

  const leaderFlag =
    mentoringService.serviceType === "one-on-one" ||
    mentoringService.serviceType === "group";

  const booking = await prisma.$transaction(async (tx) => {
    // Generate ID booking unik
    let bookingId = "";
    let isUnique = false;

    while (!isUnique) {
      bookingId = generateBookingId(mentoringService.serviceType ?? "unknown");
      const existing = await tx.booking.findUnique({
        where: { id: bookingId },
      });
      if (!existing) isUnique = true;
    }

    const newBooking = await tx.booking.create({
      data: {
        id: bookingId,
        menteeId,
        mentoringServiceId,
        referralUsageId,
        specialRequests,
        bookingDate: finalBookingDate,
        status: "pending",
        participants: {
          create: [
            {
              userId: menteeId,
              isLeader: leaderFlag,
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

    return newBooking;
  });

  return booking;
};
