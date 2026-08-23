import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const roles = [
    {
      id: "1",
      roleName: "admin",
      description: "Administrator of the system",
    },
    {
      id: "2",
      roleName: "mentor",
      description: "Mentor that helps mentees",
    },
    {
      id: "3",
      roleName: "mentee",
      description: "User who wants to learn",
    },
    {
      id: "4",
      roleName: "affiliator",
      description: "Affiliator who brings new users",
    },
    {
      id: "5",
      roleName: "curdev",
      description:
        "Curriculum Developer who manages curriculum mentoring & elearning",
    },
    {
      id: "6",
      roleName: "cm",
      description: "Class Manager who manages class operations",
    },
    {
      id: "7",
      roleName: "guest",
      description: "Guest with VIEW access to e-learning dashboard in admin",
    },
    // 🔥 BARU: role Content Writer (cw) — punya akses ke endpoint & dashboard
    // admin artikel (CRUD artikel), setara admin khusus untuk modul artikel.
    // id "8" dipakai karena id 1-7 sudah terpakai di atas.
    {
      id: "8",
      roleName: "cw",
      description:
        "Content Writer who manages articles (create, edit, publish)",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { roleName: role.roleName },
      update: {},
      create: role,
    });
  }

  console.log("✅ Roles seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
