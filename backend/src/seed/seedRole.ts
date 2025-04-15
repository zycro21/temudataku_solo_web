import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const roles = [
    {
      id: 1,
      role_name: "admin",
      description: "Administrator of the system",
    },
    {
      id: 2,
      role_name: "mentor",
      description: "Mentor that helps mentees",
    },
    {
      id: 3,
      role_name: "mentee",
      description: "User who wants to learn",
    },
    {
      id: 4,
      role_name: "affiliator",
      description: "Affiliator who brings new users",
    },
  ];

  for (const role of roles) {
    await prisma.roles.upsert({
      where: { role_name: role.role_name },
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
