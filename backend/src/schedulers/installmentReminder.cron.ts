import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";

import { sendInstallmentReminderEmail } from "../utils/installmentReminder.email.js";

const prisma = new PrismaClient();

console.log("INSTALLMENT CRON REGISTERED");

// ======================================================
// CRON INSTALLMENT REMINDER
// ======================================================

// setiap jam
cron.schedule("0 8 * * *", async () => {
  console.log("Running installment reminder job...");

  try {
    const now = new Date();

    const payments = await prisma.payment.findMany({
      where: {
        status: "pending",

        installmentNumber: {
          gt: 1,
        },

        dueDate: {
          not: null,
        },
      },

      include: {
        bookingInvoice: {
          include: {
            booking: {
              include: {
                mentee: true,
                mentoringService: true,
              },
            },
          },
        },
      },
    });

    console.log(`Found ${payments.length} installment payments`);

    for (const payment of payments) {
      const booking = payment.bookingInvoice?.booking;

      if (!booking || !payment.dueDate) continue;

      // =========================================
      // ANTI SPAM LIMIT
      // =========================================

      if (payment.reminderCount >= 10) {
        continue;
      }

      // =========================================
      // CEK SELISIH HARI
      // =========================================

      const diffDays = differenceInCalendarDays(payment.dueDate, now);

      let shouldSend = false;

      let reminderType: "H_MINUS_3" | "DUE_TODAY" | "OVERDUE" = "H_MINUS_3";

      // =========================================
      // H-3
      // =========================================

      if (diffDays === 3 && payment.reminderCount === 0) {
        shouldSend = true;
        reminderType = "H_MINUS_3";
      }

      // =========================================
      // HARI H
      // =========================================

      if (diffDays === 0 && payment.reminderCount <= 1) {
        shouldSend = true;
        reminderType = "DUE_TODAY";
      }

      // =========================================
      // OVERDUE
      // =========================================

      if (diffDays < 0) {
        const lastSent = payment.lastReminderSentAt;

        const hoursSinceLastReminder = lastSent
          ? (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60)
          : 999;

        // kirim tiap 24 jam
        if (hoursSinceLastReminder >= 24) {
          shouldSend = true;
          reminderType = "OVERDUE";
        }
      }

      if (!shouldSend) continue;

      // =========================================
      // SEND EMAIL
      // =========================================

      await sendInstallmentReminderEmail({
        type: reminderType,

        to: booking.mentee.email,

        name: booking.mentee.fullName,

        serviceName: booking.mentoringService.serviceName,

        installmentNumber: payment.installmentNumber!,

        amount: Number(payment.amount),

        dueDate: payment.dueDate,

        paymentId: payment.id,
      });

      // =========================================
      // UPDATE REMINDER INFO
      // =========================================

      await prisma.payment.update({
        where: {
          id: payment.id,
        },

        data: {
          reminderCount: {
            increment: 1,
          },

          lastReminderSentAt: new Date(),
        },
      });

      console.log(`Reminder ${reminderType} sent for payment ${payment.id}`);
    }
  } catch (error) {
    console.error("Installment reminder cron error:", error);
  }
});
