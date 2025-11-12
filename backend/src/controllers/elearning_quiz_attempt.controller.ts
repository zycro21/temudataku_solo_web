import { Response, NextFunction } from "express";
import { AuthenticatedRequestQuizAttempt } from "../middlewares/authenticate.js";
import { ELearningQuizAttemptService } from "../services/elearning_quiz_attempt.service.js";

export class ELearningQuizAttemptController {
  static async startQuizAttempt(
    req: AuthenticatedRequestQuizAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;
      if (!validatedParams?.id || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      // Gunakan optional chaining + default object kosong
      const answers = validatedBody?.answers ?? {};

      const attempt = await ELearningQuizAttemptService.startQuizAttempt(
        validatedParams.id,
        user,
        answers
      );

      res.status(201).json({
        success: true,
        message: "Quiz attempt berhasil dikirim dan dinilai otomatis",
        data: attempt,
      });
      return;
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (
        err.message.includes("belum membeli") ||
        err.message.includes("sudah mengerjakan") ||
        err.message.includes("tidak valid") ||
        err.message.includes("Harus menjawab semua")
      ) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async getMyAttempt(
    req: AuthenticatedRequestQuizAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedQuery, user } = req;
      if (!validatedParams?.id || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const page = parseInt(validatedQuery?.page ?? "1", 10);
      const limit = parseInt(validatedQuery?.limit ?? "10", 10);
      const search = validatedQuery?.search ?? "";
      const sortBy = validatedQuery?.sortBy ?? "startedAt";
      const order = validatedQuery?.order ?? "desc";

      const result = await ELearningQuizAttemptService.getAttemptsByRole({
        quizId: validatedParams.id,
        user,
        page,
        limit,
        search,
        sortBy,
        order,
      });

      res.status(200).json({
        success: true,
        message: "Berhasil mengambil hasil attempt quiz",
        ...result,
      });
    } catch (err: any) {
      if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
      } else if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
      } else next(err);
    }
  }

  static async gradeAttempt(
    req: AuthenticatedRequestQuizAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams?.id || !validatedBody || !user) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const attemptId = validatedParams.id;
      const { score, remarks, isAutoGraded } = validatedBody;

      if (typeof score !== "number") {
        res
          .status(400)
          .json({ success: false, message: "Score wajib berupa angka" });
        return;
      }

      const updated = await ELearningQuizAttemptService.gradeAttempt(
        attemptId,
        user,
        { score, remarks, isAutoGraded }
      );

      res.status(200).json({
        success: true,
        message: "Attempt berhasil dinilai secara manual",
        data: updated,
      });
      return;
    } catch (err: any) {
      if (err.message?.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message?.includes("tidak memiliki izin")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async getAllAttempts(
    req: AuthenticatedRequestQuizAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedQuery, user } = req;
      if (!user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const data = await ELearningQuizAttemptService.getAllAttempts(
        user,
        validatedQuery
      );

      res.status(200).json({
        success: true,
        message: "Daftar attempt berhasil diambil",
        data,
      });
    } catch (err: any) {
      if (err.message?.includes("tidak memiliki izin")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async getAttemptById(
    req: AuthenticatedRequestQuizAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams?.id || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const attemptId = validatedParams.id;

      const data = await ELearningQuizAttemptService.getAttemptById(
        attemptId,
        user
      );

      res.status(200).json({
        success: true,
        message: "Detail attempt berhasil diambil",
        data,
      });
    } catch (err: any) {
      if (err.message?.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message?.includes("tidak memiliki izin")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async deleteAttempt(
    req: AuthenticatedRequestQuizAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams?.id || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const attemptId = validatedParams.id;

      const deleted = await ELearningQuizAttemptService.deleteAttempt(
        attemptId,
        user
      );

      res.status(200).json({
        success: true,
        message: "Attempt quiz berhasil dihapus",
        data: deleted,
      });
    } catch (err: any) {
      if (err.message?.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message?.includes("tidak memiliki izin")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async getQuizAttemptSummary(
    req: AuthenticatedRequestQuizAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams?.id || !user) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const quizId = validatedParams.id;
      const summary = await ELearningQuizAttemptService.getQuizAttemptSummary(
        quizId,
        user
      );

      res.status(200).json({
        success: true,
        message: "Statistik attempt quiz berhasil diambil",
        data: summary,
      });
    } catch (err: any) {
      if (err.message?.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message?.includes("tidak memiliki izin")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async getMyQuizHistory(
    req: AuthenticatedRequestQuizAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { user, validatedQuery } = req;

      if (!user?.userId) {
        res
          .status(401)
          .json({ success: false, message: "User tidak terautentikasi" });
        return;
      }

      const history = await ELearningQuizAttemptService.getMyQuizHistory(
        user.userId,
        validatedQuery
      );

      res.status(200).json({
        success: true,
        message: "Riwayat quiz berhasil diambil",
        data: history,
      });
    } catch (err) {
      next(err);
    }
  }

  static async exportQuizAttempts(
    req: AuthenticatedRequestQuizAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedQuery, user } = req;
      const format = validatedQuery?.format;

      if (!user || !user.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          message:
            "Akses ditolak. Hanya admin yang dapat mengekspor attempt quiz.",
        });
        return;
      }

      if (!format || (format !== "csv" && format !== "excel")) {
        res.status(400).json({
          success: false,
          message: "Invalid format. Use 'csv' or 'excel'",
        });
        return;
      }

      const file = await ELearningQuizAttemptService.exportQuizAttemptsToFile(
        format
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${file.filename}`
      );
      res.setHeader("Content-Type", file.mimetype);
      res.send(file.buffer);
    } catch (err) {
      next(err);
    }
  }
}
