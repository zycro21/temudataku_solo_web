import express, { Application } from "express";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import path from "path";
import fs from "fs";
import cors from "cors";
import { corsOptions } from "./configs/corsConfig";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import mentorRoutes from "./routes/mentor.route";
import mentorServiceRoutes from "./routes/mentor_service.route";
import mentoringSessionRoutes from "./routes/mentoring_session.route";
import feedbackRoutes from "./routes/feedback.route";
import notificationRoute from "./routes/notification.route";
import bookingRoute from "./routes/booking.route";
import projectRoute from "./routes/project.route";
import certificateRoute from "./routes/certificate.route";
import practiceRoute from "./routes/practice.route";
import behaviorRoute from "./routes/behavior.route";
import "./schedulers/cron";
import { fileURLToPath } from "url";

import dotenv from "dotenv";
dotenv.config();

// Mendapatkan direktori saat ini
const __filename = fileURLToPath(import.meta.url);
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
app.use("/api/mentorService", mentorServiceRoutes);
app.use("/api/mentoringSession", mentoringSessionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/notification", notificationRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/project", projectRoute);
app.use("/api/certificate", certificateRoute);
app.use("/api/practice", practiceRoute);
app.use("/api/behavior", behaviorRoute);

// Path Static untuk Images
// Perbaikan di sini, mengganti __dirname dengan yang benar menggunakan import.meta.url
const imagesPath = path.join(__dirname, "../images");
console.log("Serving images from:", imagesPath);
app.use(
  "/images",
  (req, res, next) => {
    console.log("Accessing images path:", req.path);
    const filePath = path.join(imagesPath, req.path);
    console.log("Looking for file:", filePath);
    next();
  },
  express.static(imagesPath)
);

const uploadsPath = path.join(__dirname, "../uploads/submissions");
console.log("Serving uploads from:", uploadsPath);
app.use(
  "/uploads",
  (req, res, next) => {
    console.log("Accessing uploads path:", req.path);
    const filePath = path.join(uploadsPath, req.path);
    console.log("Looking for file:", filePath);
    next();
  },
  express.static(uploadsPath)
);

const certificatesPath = path.join(__dirname, "../uploads/certificate");
console.log("Serving certificates from:", certificatesPath);
app.use(
  "/certificates",
  (req, res, next) => {
    console.log("Accessing certificates path:", req.path);
    const filePath = path.join(certificatesPath, req.path);
    console.log("Looking for file:", filePath);
    next();
  },
  express.static(certificatesPath)
);

const practiceFilesPath = path.join(__dirname, "../uploads/practiceFile");
console.log("Serving practice files from:", practiceFilesPath);
app.use(
  "/practiceFiles",
  (req, res, next) => {
    console.log("Accessing practiceFiles path:", req.path);
    const filePath = path.join(practiceFilesPath, req.path);
    console.log("Looking for file:", filePath);
    next();
  },
  express.static(practiceFilesPath)
);

// Handler setelah semua route
app.use(errorHandler);
app.use(notFound);

export { app, prisma };
