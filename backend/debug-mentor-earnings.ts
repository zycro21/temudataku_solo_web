/**
 * SCRIPT DEBUG SEMENTARA — bukan bagian dari aplikasi, cuma buat verifikasi.
 * Boleh dihapus setelah selesai dicek.
 *
 * Cara pakai:
 *   1. Isi MENTOR_ID_TO_CHECK di bawah dengan mentorProfileId yang mau dicek.
 *      INI SATU-SATUNYA tempat yang perlu diedit di file ini.
 *   2. Jalankan: npx tsx debug-mentor-earnings.ts
 *
 * Kalau project kamu pakai instance PrismaClient yang di-share dari file lain
 * (misal `../lib/prisma.ts`), ganti baris `new PrismaClient()` di bawah jadi
 * import dari situ supaya konsisten sama koneksi yang dipakai aplikasi.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔥 GANTI INI dengan mentorProfileId yang mau dicek — SATU-SATUNYA tempat
// yang perlu diedit. Jangan ubah variabel lain di bawah.
const MENTOR_ID_TO_CHECK: string = "Mentor-000002";

const PLACEHOLDER = "isi-mentor-profile-id-di-sini";

// 🔥 DIUBAH: samain dengan getMentorEarnings di booking_service.ts —
// sekarang cuma one-on-one & group (bootcamp dikeluarkan total, bukan
// cuma di-rate 1 lagi).
const MENTOR_SHARE_RATE: Record<string, number> = {
  "one-on-one": 0.6,
  group: 0.6,
};

async function main() {
  if (!MENTOR_ID_TO_CHECK || MENTOR_ID_TO_CHECK === PLACEHOLDER) {
    console.error(
      "Isi dulu MENTOR_ID_TO_CHECK di bagian atas file dengan mentorProfileId yang mau dicek.",
    );
    return;
  }

  const mentorId = MENTOR_ID_TO_CHECK;

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ["confirmed", "completed"] },
      mentoringService: {
        // 🔥 DIUBAH: bootcamp dihapus dari filter, samain sama backend
        serviceType: { in: ["one-on-one", "group"] },
        mentors: { some: { mentorProfileId: mentorId } },
      },
    },
    include: {
      invoice: { include: { payments: true } },
      mentoringService: { select: { serviceType: true, serviceName: true } },
    },
  });

  if (bookings.length === 0) {
    console.log(
      `Tidak ada booking one-on-one/group (confirmed/completed) untuk mentorId "${mentorId}". ` +
        `Cek lagi apakah mentorId-nya benar.`,
    );
    return;
  }

  let grossTotal = 0;
  let netTotal = 0;

  console.log(
    "\nbookingId".padEnd(30) +
      "serviceType".padEnd(14) +
      "gross (100%)".padStart(16) +
      "rate".padStart(8) +
      "net (share)".padStart(16),
  );
  console.log("-".repeat(84));

  for (const booking of bookings) {
    // 🔥 Pengecekan eksplisit status booking (meski query Prisma di atas
    // sudah filter ini, ditulis ulang di sini biar jelas dua syaratnya:
    // booking HARUS confirmed/completed, DAN minimal ada 1 payment yang
    // confirmed/completed juga).
    const isBookingConfirmed = ["confirmed", "completed"].includes(
      (booking.status || "").toLowerCase(),
    );
    if (!isBookingConfirmed) continue;

    const paidPayments =
      booking.invoice?.payments.filter((p) =>
        ["confirmed", "completed"].includes((p.status || "").toLowerCase()),
      ) || [];

    if (paidPayments.length === 0) continue;

    const gross = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const serviceType = booking.mentoringService?.serviceType || "-";
    const rate = MENTOR_SHARE_RATE[serviceType] ?? 1;
    const net = Math.round(gross * rate);

    grossTotal += gross;
    netTotal += net;

    console.log(
      booking.id.padEnd(30) +
        serviceType.padEnd(14) +
        gross.toLocaleString("id-ID").padStart(16) +
        `${rate}`.padStart(8) +
        net.toLocaleString("id-ID").padStart(16),
    );
  }

  console.log("-".repeat(84));
  console.log(
    `TOTAL kalau masih 100% (gross) : Rp${grossTotal.toLocaleString("id-ID")}`,
  );
  console.log(
    `TOTAL setelah share benar (net): Rp${netTotal.toLocaleString("id-ID")}`,
  );
  console.log(
    `\nAngka "net" di atas seharusnya PERSIS SAMA dengan yang muncul di ` +
      `dashboard mentor (Total Pendapatan) kalau kode barunya jalan dengan benar.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(() => prisma.$disconnect());