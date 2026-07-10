import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Hitung season aktif berdasarkan tanggal sekarang (WIB = UTC+7)
function resolveCurrentSeason(): {
  seasonName: string;
  startDate: Date;
  endDate: Date;
} {
  // Tanggal sekarang dalam WIB
  const nowWIB = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );
  const month = nowWIB.getMonth() + 1; // 1-based
  const year = nowWIB.getFullYear();

  // Season 1: Jan–Apr (bulan 1–4)
  if (month >= 1 && month <= 4) {
    return {
      seasonName: `Season 1 ${year}`,
      startDate: new Date(`${year}-01-01T00:00:00.000+07:00`),
      endDate: new Date(`${year}-04-30T23:59:59.999+07:00`),
    };
  }

  // Season 2: Mei–Agt (bulan 5–8)
  if (month >= 5 && month <= 8) {
    return {
      seasonName: `Season 2 ${year}`,
      startDate: new Date(`${year}-05-01T00:00:00.000+07:00`),
      endDate: new Date(`${year}-08-31T23:59:59.999+07:00`),
    };
  }

  // Season 3: Sep–Des (bulan 9–12)
  return {
    seasonName: `Season 3 ${year}`,
    startDate: new Date(`${year}-09-01T00:00:00.000+07:00`),
    endDate: new Date(`${year}-12-31T23:59:59.999+07:00`),
  };
}

async function main() {
  const current = resolveCurrentSeason();
  console.log(`Season aktif saat ini: ${current.seasonName}`);
  console.log(
    `Periode: ${current.startDate.toISOString()} – ${current.endDate.toISOString()}`,
  );

  // 1. Cek apakah season sudah ada di DB
  const existingSeason = await prisma.affiliatorSeason.findFirst({
    where: { seasonName: current.seasonName },
  });

  let season;
  if (existingSeason) {
    console.log(`${current.seasonName} sudah ada di DB, skip create.`);
    season = existingSeason;

    // Pastikan isActive = true kalau ternyata false
    if (!existingSeason.isActive) {
      await prisma.affiliatorSeason.update({
        where: { id: existingSeason.id },
        data: { isActive: true },
      });
      console.log(`isActive diupdate ke true untuk ${current.seasonName}.`);
    }
  } else {
    // Nonaktifkan season lain yang masih isActive = true sebelum insert
    await prisma.affiliatorSeason.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    season = await prisma.affiliatorSeason.create({
      data: {
        seasonName: current.seasonName,
        startDate: current.startDate,
        endDate: current.endDate,
        isActive: true,
      },
    });
    console.log(`Season dibuat: ${season.seasonName} (id: ${season.id})`);
  }

  // 2. Seed SeasonPoint untuk semua affiliator aktif yang belum punya record di season ini
  const affiliators = await prisma.affiliatorProfile.findMany({
    where: { isActive: true },
    select: { id: true, currentTier: true },
  });

  console.log(`Total affiliator aktif: ${affiliators.length}`);

  let created = 0;
  let skipped = 0;

  for (const aff of affiliators) {
    const existing = await prisma.affiliatorSeasonPoint.findUnique({
      where: {
        affiliatorProfileId_seasonId: {
          affiliatorProfileId: aff.id,
          seasonId: season.id,
        },
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.affiliatorSeasonPoint.create({
      data: {
        affiliatorProfileId: aff.id,
        seasonId: season.id,
        points: 0,
        tierAtSeasonStart: aff.currentTier,
      },
    });
    created++;
  }

  console.log(
    `SeasonPoint dibuat: ${created}, dilewati (sudah ada): ${skipped}`,
  );
  console.log("Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
