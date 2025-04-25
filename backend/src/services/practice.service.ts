import { PrismaClient, Prisma } from "@prisma/client";
import { Parser as Json2CsvParser } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate, subDays } from "date-fns";
import { Buffer } from "buffer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { uploadToGoogleDrive } from "../utils/googleDrive";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createPractice = async (input: {
  mentorId: string;
  title: string;
  description?: string;
  thumbnailImage?: string;
  price: number;
  practiceType?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
}) => {
  const {
    mentorId,
    title,
    description,
    thumbnailImage,
    price,
    practiceType,
    category,
    tags,
    isActive,
  } = input;

  const mentor = await prisma.mentorProfile.findUnique({
    where: { id: mentorId },
  });

  if (!mentor) {
    throw new Error("Mentor tidak ditemukan");
  }

  const practice = await prisma.practice.create({
    data: {
      mentorId,
      title,
      description,
      thumbnailImage,
      price: new Prisma.Decimal(price),
      practiceType,
      category,
      tags: tags ? JSON.stringify(tags) : undefined,
      isActive: isActive ?? true,
    },
  });

  return practice;
};
