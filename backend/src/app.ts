import express, { Application } from "express";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import path from "path";
import fs from "fs";
import cors from "cors";
import { corsOptions } from "./configs/corsConfig.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import mentorRoutes from "./routes/mentor.route.js";
import mentorServiceRoutes from "./routes/mentor_service.route.js";
import mentoringSessionRoutes from "./routes/mentoring_session.route.js";
import feedbackRoutes from "./routes/feedback.route.js";
import notificationRoute from "./routes/notification.route.js";
import bookingRoute from "./routes/booking.route.js";
import projectRoute from "./routes/project.route.js";
import certificateRoute from "./routes/certificate.route.js";
import practiceRoute from "./routes/practice.route.js";
import behaviorRoute from "./routes/behavior.route.js";
import referralRoute from "./routes/referral.route.js";
import paymentRoute from "./routes/payment.route.js";
import withdrawalRoute from "./routes/withdrawal.route.js";
import mentorReportRoute from "./routes/mentor_report.route.js";
import userActivityLog from "./routes/userActivityLog.route.js";
import practiceSubmissionsRoute from "./routes/practice_submission.route.js";
import shortLinkRoutes from "./routes/short_link.route.js";
import elearningCourseRoutes from "./routes/elearning_course.route.js";
import elearningSubChapterRoutes from "./routes/elearning_subchapter.route.js";
import elearngingSubBabRoutes from "./routes/elearning_subbab.route.js";
import elearningTextRoutes from "./routes/elearning_text.route.js";
import elearningQuizRoutes from "./routes/elearning_quiz.route.js";
import elearningQuestionRoutes from "./routes/elearning_question.route.js";
import elearningQuizAttempt from "./routes/elearning_quiz_attempt.route.js";
import elearningAssignment from "./routes/elearning_assignment.route.js";
import elearningSubmission from "./routes/elearning_submission.route.js";
import elearningPurchase from "./routes/elearning_purchase.route.js";
import adminActivityLogRoutes from "./routes/adminActivityLog.route.js"
import { redirectShortCodeController } from "./controllers/short_link.controller.js";
import "./schedulers/cron.js";
import { fileURLToPath } from "url";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./swagger/swaggerOptions.js";

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

app.set("trust proxy", true);

// Testing
app.get("/", (req, res) => {
  res.send("Hello, This is API");
});

// Prefix hit shortlink publik
app.get("/s/:shortCode", redirectShortCodeController);

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
app.use("/api/referral", referralRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/withdrawals", withdrawalRoute);
app.use("/api/mentorReports", mentorReportRoute);
app.use("/api/logActivity", userActivityLog);
app.use("/api/practiceSubmissions", practiceSubmissionsRoute);
app.use("/api/shortlink", shortLinkRoutes);
app.use("/api/elearningCourse", elearningCourseRoutes);
app.use("/api/elearningSubChapter", elearningSubChapterRoutes);
app.use("/api/elearningSubBab", elearngingSubBabRoutes);
app.use("/api/elearningText", elearningTextRoutes);
app.use("/api/elearningQuiz", elearningQuizRoutes);
app.use("/api/elearningQuestion", elearningQuestionRoutes);
app.use("/api/elearningQuizAttempt", elearningQuizAttempt);
app.use("/api/elearningAssignment", elearningAssignment);
app.use("/api/elearningSubmission", elearningSubmission);
app.use("/api/elearningPurchase", elearningPurchase);
app.use("/api/admin_activity_logs", adminActivityLogRoutes);

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

const uploadsPath = path.join(__dirname, "../uploads");
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
app.use("/practiceFiles", express.static(practiceFilesPath));

const supportDocPath = path.join(__dirname, "../uploads/supportDocument");
console.log("Serving support documents from:", supportDocPath);

app.use(
  "/supportDocuments",
  (req, res, next) => {
    console.log("Accessing support document path:", req.path);
    const filePath = path.join(supportDocPath, req.path);
    console.log("Looking for file:", filePath);
    next();
  },
  express.static(supportDocPath)
);

const practiceSubmissionsPath = path.join(
  __dirname,
  "../uploads/practice/submissions"
);
console.log("Serving practice submissions from:", practiceSubmissionsPath);

app.use(
  "/practiceSubmissions",
  (req, res, next) => {
    console.log("Accessing practice submissions path:", req.path);
    const filePath = path.join(practiceSubmissionsPath, req.path);
    console.log("Looking for file:", filePath);
    next();
  },
  express.static(practiceSubmissionsPath)
);

// === E-Learning Submissions ===
const elearningSubmissionsPath = path.join(
  __dirname,
  "../uploads/elearning/submissions"
);
console.log("Serving e-learning submissions from:", elearningSubmissionsPath);

app.use(
  "/uploads/elearning/submissions",
  (req, res, next) => {
    console.log("Accessing e-learning submission path:", req.path);
    const filePath = path.join(elearningSubmissionsPath, req.path);
    console.log("Looking for file:", filePath);
    next();
  },
  express.static(elearningSubmissionsPath)
);

// Swagger Docs
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Handler setelah semua route
app.use(errorHandler);
app.use(notFound);

export { prisma };
export default app;
