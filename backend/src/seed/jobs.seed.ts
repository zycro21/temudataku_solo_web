import { PrismaClient } from "@prisma/client";
import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, "datadummyscraping.csv");

function parseSalary(range: string) {
  if (!range) {
    return {
      min: null,
      max: null,
    };
  }

  const cleaned = range.replace(/Rp/g, "").trim();

  const [min, max] = cleaned.split("-");

  return {
    min: Number(min.replace(/\./g, "").trim()),
    max: Number(max.replace(/\./g, "").trim()),
  };
}

async function seed() {
  const rows: any[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve())
      .on("error", reject);
  });

  console.log("Total rows:", rows.length);
  console.log("First row:", rows[0]);

  // return;

  for (const row of rows) {
    const companyName = row["Company Name"]?.trim();

    if (!companyName) {
      console.log("Company Name kosong, skip");
      continue;
    }

    const salary = parseSalary(row["Range Gaji"]);

    const company = await prisma.company.upsert({
      where: {
        companyName,
      },
      update: {},
      create: {
        companyName,
      },
    });

    console.log(`Creating job: ${row["Nama Role"]} - ${companyName}`);

    await prisma.job.create({
      data: {
        companyId: company.id,

        jobTitle: row["Nama Role"]?.trim(),

        salaryMin: salary.min,
        salaryMax: salary.max,

        city: row["Kota"]?.trim(),
        country: row["Negara"]?.trim(),

        workType: row["Tipe Pekerjaan"]?.trim(),
        level: row["Level"]?.trim(),

        experienceRequired: row["Pengalaman"]?.trim(),

        isActive: true,
      },
    });
  }

  console.log("Seed selesai");
}

seed()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
