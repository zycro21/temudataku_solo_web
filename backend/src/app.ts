// src/app.ts
import express, { Application } from "express";
import { PrismaClient } from "@prisma/client";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import cors from "cors";
import { corsOptions } from "./configs/corsConfig";

const app: Application = express();

// Inisialisasi Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Testing
app.get("/", (req, res) => {
  res.send("Hello, This is API");
});

// Tambahkan route lainnya sesuai kebutuhan
// Contoh route


// Handler setelah semua route
app.use(errorHandler);
app.use(notFound);

export { app, prisma };
