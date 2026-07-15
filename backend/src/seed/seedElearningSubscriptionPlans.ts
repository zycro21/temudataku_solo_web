import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ELearningSubscriptionPlan...");

  const plans = [
    {
      name: "1 Bulan",
      durationDay: 30,
      price: 149000,
      description: "Akses semua materi e-learning selama 1 bulan.",
      isActive: true,
    },
    {
      name: "3 Bulan",
      durationDay: 90,
      price: 199000,
      description: "Akses semua materi e-learning selama 3 bulan. Paling hemat!",
      isActive: true,
    },
    {
      name: "6 Bulan",
      durationDay: 180,
      price: 299000,
      description: "Akses semua materi e-learning selama 6 bulan.",
      isActive: true,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const plan of plans) {
    const existing = await prisma.eLearningSubscriptionPlan.findFirst({
      where: { durationDay: plan.durationDay },
    });

    if (existing) {
      console.log(`  SKIP: Plan durasi ${plan.durationDay} hari sudah ada`);
      skipped++;
      continue;
    }

    await prisma.eLearningSubscriptionPlan.create({
      data: plan,
    });

    console.log(`  OK: ${plan.name} (Rp${plan.price.toLocaleString("id-ID")})`);
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