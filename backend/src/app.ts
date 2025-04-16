import express, { Application } from "express";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import path from "path";
import cors from "cors";
import { corsOptions } from "./configs/corsConfig";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import mentorRoutes from "./routes/mentor.route";
import './schedulers/cron';

// Mendapatkan direktori saat ini
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const app: Application = express();

// Inisialisasi Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parsing data URL-encode
app.use(cookieParser());
app.use(cors(corsOptions));

// Testing
app.get("/", (req, res) => {
  res.send("Hello, This is API");
});

// Another Route
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/mentor", mentorRoutes);

// Path Static untuk Images
// Perbaikan di sini, mengganti __dirname dengan yang benar menggunakan import.meta.url
app.use("/images", express.static(path.join(__dirname, "../images")));

// Handler setelah semua route
app.use(errorHandler);
app.use(notFound);

export { app, prisma };
