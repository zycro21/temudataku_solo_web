import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const resetDatabase = async () => {
  try {
    // Menghapus data dari semua tabel
    await prisma.users.deleteMany();

    console.log("Database telah direset");
  } catch (error) {
    console.error("Gagal mereset database:", error);
  }
};

resetDatabase();
