import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("SEASON EVALUATION CRON REGISTERED");

// ============================================================
// CONSTANTS
// ============================================================

const MAINTENANCE_QUOTA = {
  GOLD: 40,
  SILVER: 15,
  BRONZE: 0, // tidak ada kuota
} as const;

// ============================================================
// HELPER: Kalkulasi hasil evaluasi satu affiliator
// ============================================================

function resolveSeasonEvaluation(
  currentTier: string,
  seasonPoints: number, // poin yang dikumpulkan dalam season ini
  totalPoints: number, // lifetime total di AffiliatorProfile (untuk kalkulasi penalti)
): {
  quotaMet: boolean;
  newTier: string;
  newTotalPoints: number; // totalPoints setelah penalti (jika ada)
} {
  // ── BRONZE: tidak ada kuota, tidak bisa turun ──────────────
  if (currentTier === "BRONZE") {
    return {
      quotaMet: true,
      newTier: "BRONZE",
      newTotalPoints: totalPoints,
    };
  }

  // ── SILVER ─────────────────────────────────────────────────
  if (currentTier === "SILVER") {
    const quotaMet = seasonPoints >= MAINTENANCE_QUOTA.SILVER;

    if (quotaMet) {
      return { quotaMet: true, newTier: "SILVER", newTotalPoints: totalPoints };
    }

    // Gagal → turun ke BRONZE
    // Penalti di totalPoints:
    //   - totalPoints < 75  → totalPoints - 15 (floor 0)
    //   - totalPoints >= 75 → cap ke batas atas BRONZE = 39
    const newTotalPoints =
      totalPoints < 75 ? Math.max(0, totalPoints - 15) : 39;

    return { quotaMet: false, newTier: "BRONZE", newTotalPoints };
  }

  // ── GOLD ───────────────────────────────────────────────────
  if (currentTier === "GOLD") {
    const quotaMet = seasonPoints >= MAINTENANCE_QUOTA.GOLD;

    if (quotaMet) {
      return { quotaMet: true, newTier: "GOLD", newTotalPoints: totalPoints };
    }

    // Gagal → turun ke SILVER
    // Penalti di totalPoints:
    //   - totalPoints < 175  → totalPoints - 15 (floor 0)
    //   - totalPoints >= 175 → cap ke batas atas SILVER = 119
    const newTotalPoints =
      totalPoints < 175 ? Math.max(0, totalPoints - 15) : 119;

    return { quotaMet: false, newTier: "SILVER", newTotalPoints };
  }

  // Fallback (tier tidak dikenal)
  return { quotaMet: true, newTier: currentTier, newTotalPoints: totalPoints };
}

// ============================================================
// HELPER: Hitung jadwal season berikutnya dari endDate season saat ini
// Season cycle (fixed):
//   Season 1 → Jan 1  – Apr 30
//   Season 2 → May 1  – Aug 31
//   Season 3 → Sep 1  – Dec 31
// ============================================================

function resolveNextSeasonDates(currentEndDate: Date): {
  seasonName: string;
  startDate: Date;
  endDate: Date;
} {
  const endMonth = currentEndDate.getMonth() + 1; // 1-based
  const endYear = currentEndDate.getFullYear();

  // Tentukan season berikutnya berdasarkan bulan akhir season sekarang
  // Apr (4) → berikutnya Season 2: May 1 – Aug 31 (tahun sama)
  // Aug (8) → berikutnya Season 3: Sep 1 – Dec 31 (tahun sama)
  // Dec (12) → berikutnya Season 1: Jan 1 – Apr 30 (tahun depan)

  if (endMonth === 4) {
    return {
      seasonName: `Season 2 ${endYear}`,
      startDate: new Date(`${endYear}-05-01T00:00:00.000+07:00`),
      endDate: new Date(`${endYear}-08-31T23:59:59.999+07:00`),
    };
  }

  if (endMonth === 8) {
    return {
      seasonName: `Season 3 ${endYear}`,
      startDate: new Date(`${endYear}-09-01T00:00:00.000+07:00`),
      endDate: new Date(`${endYear}-12-31T23:59:59.999+07:00`),
    };
  }

  if (endMonth === 12) {
    const nextYear = endYear + 1;
    return {
      seasonName: `Season 1 ${nextYear}`,
      startDate: new Date(`${nextYear}-01-01T00:00:00.000+07:00`),
      endDate: new Date(`${nextYear}-04-30T23:59:59.999+07:00`),
    };
  }

  // Fallback — seharusnya tidak pernah tercapai kalau data season benar
  throw new Error(
    `[SeasonEval] endDate bulan ${endMonth} tidak dikenali dalam season cycle.`,
  );
}

// ============================================================
// MAIN EVALUATION FUNCTION
// ============================================================

async function runSeasonEvaluation() {
  console.log("[SeasonEval] ====== Starting season evaluation ======");
  const now = new Date();

  try {
    // ── 1. Cari season yang baru saja berakhir ────────────────
    const endingSeason = await prisma.affiliatorSeason.findFirst({
      where: {
        isActive: true,
        endDate: { lte: now },
      },
      orderBy: { endDate: "desc" },
    });

    if (!endingSeason) {
      console.log("[SeasonEval] Tidak ada season yang berakhir. Skip.");
      return;
    }

    console.log(`[SeasonEval] Season berakhir: ${endingSeason.seasonName}`);

    // ── 2. Cari atau auto-create season berikutnya ────────────
    let nextSeason = await prisma.affiliatorSeason.findFirst({
      where: {
        startDate: { gt: endingSeason.endDate },
      },
      orderBy: { startDate: "asc" },
    });

    if (!nextSeason) {
      console.log(
        "[SeasonEval] Season berikutnya belum ada di DB. Auto-creating...",
      );

      const nextSeasonDates = resolveNextSeasonDates(endingSeason.endDate);

      nextSeason = await prisma.affiliatorSeason.create({
        data: {
          seasonName: nextSeasonDates.seasonName,
          startDate: nextSeasonDates.startDate,
          endDate: nextSeasonDates.endDate,
          isActive: false, // akan diaktifkan di step 6
        },
      });

      console.log(
        `[SeasonEval] Season baru dibuat: ${nextSeason.seasonName} ` +
          `(${nextSeason.startDate.toISOString()} – ${nextSeason.endDate.toISOString()})`,
      );
    } else {
      console.log(
        `[SeasonEval] Season berikutnya ditemukan: ${nextSeason.seasonName}`,
      );
    }

    // ── 3. Ambil semua affiliator aktif + season point mereka ──
    const affiliators = await prisma.affiliatorProfile.findMany({
      where: { isActive: true },
      include: {
        seasonPoints: {
          where: { seasonId: endingSeason.id },
        },
      },
    });

    console.log(
      `[SeasonEval] Total affiliator aktif yang akan dievaluasi: ${affiliators.length}`,
    );

    let processed = 0;
    let demoted = 0;
    let errors = 0;

    // ── 4. Evaluasi per affiliator ─────────────────────────────
    for (const affiliator of affiliators) {
      try {
        const seasonPoint = affiliator.seasonPoints[0] ?? null;
        const currentSeasonPoints = seasonPoint?.points ?? 0;
        const currentTier = affiliator.currentTier;
        const currentTotalPoints = affiliator.totalPoints;

        const { quotaMet, newTier, newTotalPoints } = resolveSeasonEvaluation(
          currentTier,
          currentSeasonPoints,
          currentTotalPoints,
        );

        await prisma.$transaction(async (tx) => {
          // 4a. Update atau buat AffiliatorSeasonPoint untuk season yang berakhir
          if (seasonPoint) {
            await tx.affiliatorSeasonPoint.update({
              where: { id: seasonPoint.id },
              data: {
                tierAtSeasonEnd: newTier,
                maintenanceQuotaMet: quotaMet,
                updatedAt: new Date(),
              },
            });
          } else {
            // Affiliator tidak punya record di season ini (bergabung di tengah musim / belum pernah transaksi)
            // Tetap buat record retroaktif agar data audit lengkap
            await tx.affiliatorSeasonPoint.create({
              data: {
                affiliatorProfileId: affiliator.id,
                seasonId: endingSeason.id,
                points: 0,
                tierAtSeasonStart: currentTier,
                tierAtSeasonEnd: newTier,
                maintenanceQuotaMet: quotaMet,
              },
            });
          }

          // 4b. Update AffiliatorProfile: tier baru + totalPoints (setelah penalti jika ada)
          await tx.affiliatorProfile.update({
            where: { id: affiliator.id },
            data: {
              currentTier: newTier,
              totalPoints: newTotalPoints,
              updatedAt: new Date(),
            },
          });

          // 4c. Buat AffiliatorSeasonPoint awal untuk season berikutnya (idempotent)
          if (nextSeason) {
            const existingNextSeasonPoint =
              await tx.affiliatorSeasonPoint.findUnique({
                where: {
                  affiliatorProfileId_seasonId: {
                    affiliatorProfileId: affiliator.id,
                    seasonId: nextSeason.id,
                  },
                },
              });

            if (!existingNextSeasonPoint) {
              await tx.affiliatorSeasonPoint.create({
                data: {
                  affiliatorProfileId: affiliator.id,
                  seasonId: nextSeason.id,
                  points: 0,
                  tierAtSeasonStart: newTier,
                },
              });
            }
          }
        });

        if (!quotaMet) {
          console.log(
            `[SeasonEval] DEMOTED | affiliatorId: ${affiliator.id} | ` +
              `${currentTier} → ${newTier} | ` +
              `season pts: ${currentSeasonPoints} | ` +
              `total pts: ${currentTotalPoints} → ${newTotalPoints}`,
          );
          demoted++;
        }

        processed++;
      } catch (err) {
        console.error(
          `[SeasonEval] Error evaluating affiliator ${affiliator.id}:`,
          err,
        );
        errors++;
      }
    }

    // ── 5. Nonaktifkan season yang berakhir ───────────────────
    await prisma.affiliatorSeason.update({
      where: { id: endingSeason.id },
      data: { isActive: false },
    });

    // ── 6. Aktifkan season berikutnya ─────────────────────────
    if (nextSeason) {
      await prisma.affiliatorSeason.update({
        where: { id: nextSeason.id },
        data: { isActive: true },
      });
      console.log(`[SeasonEval] Season diaktifkan: ${nextSeason.seasonName}`);
    }

    console.log(
      `[SeasonEval] ====== Selesai. ` +
        `Processed: ${processed}, Demoted: ${demoted}, Errors: ${errors} ======`,
    );
  } catch (error) {
    console.error("[SeasonEval] Fatal error:", error);
  }
}

// ============================================================
// CRON SCHEDULES — Timezone: Asia/Jakarta (WIB)
//
//   Season 1 berakhir → 30 April   23:59 WIB
//   Season 2 berakhir → 31 Agustus 23:59 WIB
//   Season 3 berakhir → 31 Desember 23:59 WIB
// ============================================================

// 30 April 23:59 WIB
cron.schedule("59 23 30 4 *", runSeasonEvaluation, {
  timezone: "Asia/Jakarta",
});

// 31 Agustus 23:59 WIB
cron.schedule("59 23 31 8 *", runSeasonEvaluation, {
  timezone: "Asia/Jakarta",
});

// 31 Desember 23:59 WIB
cron.schedule("59 23 31 12 *", runSeasonEvaluation, {
  timezone: "Asia/Jakarta",
});
