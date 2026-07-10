import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding AffiliatorProductConfig...");

  const configs = [
    // ── E-LEARNING 1 BULAN (flat amount) ─────────────────────────
    {
      productType: "ELEARNING_1M",
      tier: "BRONZE",
      commissionAmount: 20000,
      discountAmount: 50000,
      pointsAwarded: 2,
      isActive: true,
    },
    {
      productType: "ELEARNING_1M",
      tier: "SILVER",
      commissionAmount: 35000,
      discountAmount: 50000,
      pointsAwarded: 2,
      isActive: true,
    },
    {
      productType: "ELEARNING_1M",
      tier: "GOLD",
      commissionAmount: 45000,
      discountAmount: 50000,
      pointsAwarded: 2,
      isActive: true,
    },

    // ── E-LEARNING 3 BULAN (flat amount) ─────────────────────────
    {
      productType: "ELEARNING_3M",
      tier: "BRONZE",
      commissionAmount: 40000,
      discountAmount: 50000,
      pointsAwarded: 2,
      isActive: true,
    },
    {
      productType: "ELEARNING_3M",
      tier: "SILVER",
      commissionAmount: 60000,
      discountAmount: 50000,
      pointsAwarded: 2,
      isActive: true,
    },
    {
      productType: "ELEARNING_3M",
      tier: "GOLD",
      commissionAmount: 75000,
      discountAmount: 50000,
      pointsAwarded: 2,
      isActive: true,
    },

    // ── E-LEARNING 6 BULAN (flat amount) ─────────────────────────
    {
      productType: "ELEARNING_6M",
      tier: "BRONZE",
      commissionAmount: 60000,
      discountAmount: 100000,
      pointsAwarded: 2,
      isActive: true,
    },
    {
      productType: "ELEARNING_6M",
      tier: "SILVER",
      commissionAmount: 80000,
      discountAmount: 100000,
      pointsAwarded: 2,
      isActive: true,
    },
    {
      productType: "ELEARNING_6M",
      tier: "GOLD",
      commissionAmount: 100000,
      discountAmount: 100000,
      pointsAwarded: 2,
      isActive: true,
    },

    // ── MENTORING BOOTCAMP (persentase) ───────────────────────────
    {
      productType: "MENTORING_BOOTCAMP",
      tier: "BRONZE",
      commissionPercent: 5,
      discountPercent: 5,
      pointsAwarded: 10,
      isActive: false,
    },
    {
      productType: "MENTORING_BOOTCAMP",
      tier: "SILVER",
      commissionPercent: 7,
      discountPercent: 7,
      pointsAwarded: 10,
      isActive: false,
    },
    {
      productType: "MENTORING_BOOTCAMP",
      tier: "GOLD",
      commissionPercent: 10,
      discountPercent: 10,
      pointsAwarded: 10,
      isActive: false,
    },

    // ── MENTORING ONE-ON-ONE (belum aktif) ────────────────────────
    {
      productType: "MENTORING_ONE_ON_ONE",
      tier: "BRONZE",
      commissionPercent: 5,
      discountPercent: 5,
      pointsAwarded: 5,
      isActive: false,
    },
    {
      productType: "MENTORING_ONE_ON_ONE",
      tier: "SILVER",
      commissionPercent: 7,
      discountPercent: 7,
      pointsAwarded: 5,
      isActive: false,
    },
    {
      productType: "MENTORING_ONE_ON_ONE",
      tier: "GOLD",
      commissionPercent: 10,
      discountPercent: 10,
      pointsAwarded: 5,
      isActive: false,
    },

    // ── MENTORING GROUP (belum aktif) ─────────────────────────────
    {
      productType: "MENTORING_GROUP",
      tier: "BRONZE",
      commissionPercent: 5,
      discountPercent: 5,
      pointsAwarded: 5,
      isActive: false,
    },
    {
      productType: "MENTORING_GROUP",
      tier: "SILVER",
      commissionPercent: 7,
      discountPercent: 7,
      pointsAwarded: 5,
      isActive: false,
    },
    {
      productType: "MENTORING_GROUP",
      tier: "GOLD",
      commissionPercent: 10,
      discountPercent: 10,
      pointsAwarded: 5,
      isActive: false,
    },

    // ── AYCL (belum aktif) ────────────────────────────────────────
    {
      productType: "AYCL",
      tier: "BRONZE",
      commissionPercent: 5,
      discountPercent: 5,
      pointsAwarded: 5,
      isActive: false,
    },
    {
      productType: "AYCL",
      tier: "SILVER",
      commissionPercent: 7,
      discountPercent: 7,
      pointsAwarded: 5,
      isActive: false,
    },
    {
      productType: "AYCL",
      tier: "GOLD",
      commissionPercent: 10,
      discountPercent: 10,
      pointsAwarded: 5,
      isActive: false,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const config of configs) {
    const existing = await prisma.affiliatorProductConfig.findUnique({
      where: {
        productType_tier: {
          productType: config.productType,
          tier: config.tier,
        },
      },
    });

    if (existing) {
      console.log(`  SKIP: ${config.productType} / ${config.tier} sudah ada`);
      skipped++;
      continue;
    }

    await prisma.affiliatorProductConfig.create({
      data: {
        productType: config.productType,
        tier: config.tier,
        commissionAmount: config.commissionAmount ?? null,
        discountAmount: config.discountAmount ?? null,
        commissionPercent: config.commissionPercent ?? null,
        discountPercent: config.discountPercent ?? null,
        pointsAwarded: config.pointsAwarded,
        isActive: config.isActive,
      },
    });

    console.log(
      `  OK: ${config.productType} / ${config.tier} (isActive: ${config.isActive})`,
    );
    created++;
  }

  console.log(`\nSelesai. Dibuat: ${created}, Dilewati: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });