// src/server.ts
import { app } from "./app"; // Mengimpor app dari app.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Inisialisasi server pada port yang diinginkan
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("Closing Prisma client...");
  await prisma.$disconnect();
  process.exit(0);
});
