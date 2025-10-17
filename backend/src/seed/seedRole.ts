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
