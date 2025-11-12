import { Response, NextFunction } from "express";
import { AuthenticatedRequestQuestion } from "../middlewares/authenticate.js";
import { ELearningQuestionService } from "../services/elearning_question.service.js";

export class ELearningQuestionController {
  static async createQuestion(
    req: AuthenticatedRequestQuestion,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams?.id || !validatedBody || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const { id } = validatedParams;
      const { questionText, options, correctAnswer, explanation } =
        validatedBody;

      // validasi body wajib
      if (!questionText || !options || !correctAnswer) {
        res.status(400).json({
          success: false,
          message: "questionText, options, dan correctAnswer wajib diisi",
        });
        return;
      }

      // validasi correctAnswer ada di options
      if (!options.includes(correctAnswer)) {
        res.status(400).json({
          success: false,
          message: "Jawaban benar harus salah satu dari opsi yang tersedia",
        });
        return;
      }

      const question = await ELearningQuestionService.createQuestion(
        id,
        { questionText, options, correctAnswer, explanation },
        user
      );

      res.status(201).json({
        success: true,
        message: "Pertanyaan berhasil ditambahkan",
        data: question,
      });
      return;
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
      } else if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
      } else {
        next(err);
      }
    }
  }

  static async getQuestionsByQuiz(
    req: AuthenticatedRequestQuestion,
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

      const { id } = validatedParams;
      const { page, limit, search, sortBy, order } = validatedQuery;

      const result = await ELearningQuestionService.getQuestionsByQuiz(
        id,
        user,
        { page, limit, search, sortBy, order }
      );

      res.status(200).json({
        success: true,
        message: "Daftar pertanyaan berhasil diambil",
        ...result,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
      } else if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
      } else {
        next(err);
      }
    }
  }

  static async getQuestionById(
    req: AuthenticatedRequestQuestion,
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

      const question = await ELearningQuestionService.getQuestionById(
        validatedParams.id,
        user
      );

      res.status(200).json({
        success: true,
        message: "Detail pertanyaan berhasil diambil",
        data: question,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
      } else if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
      } else {
        next(err);
      }
    }
  }

  static async updateQuestion(
    req: AuthenticatedRequestQuestion,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;
      if (!validatedParams?.id || !user) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      // minimal: body boleh kosong (partial), service will handle no-change case
      const questionId = validatedParams.id;
      const payload = validatedBody || {};

      // quick validation: if options provided but correctAnswer provided & not in options => fail early
      if (payload.options && payload.correctAnswer) {
        if (!payload.options.includes(payload.correctAnswer)) {
          res.status(400).json({
            success: false,
            message: "Jawaban benar harus salah satu dari opsi yang tersedia",
          });
          return;
        }
      }

      // if options provided but correctAnswer NOT provided, ensure existing correct answer will still be valid
      // We'll let service validate that (requires DB read), but we could do early check only when both provided.

      const updated = await ELearningQuestionService.updateQuestion(
        questionId,
        payload,
        user
      );

      res.status(200).json({
        success: true,
        message: "Pertanyaan berhasil diperbarui",
        data: updated,
      });
    } catch (err: any) {
      // translate common errors if desired
      if (err.message && err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      } else if (err.message && err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      } else if (err.message && err.message.includes("Jawaban benar")) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async deleteQuestion(
    req: AuthenticatedRequestQuestion,
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

      await ELearningQuestionService.deleteQuestion(validatedParams.id, user);

      res.status(200).json({
        success: true,
        message: "Pertanyaan berhasil dihapus dan orderNumber dirapikan",
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      } else if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async duplicateQuestion(
    req: AuthenticatedRequestQuestion,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;
      if (!validatedParams?.id || !validatedBody?.targetQuizId || !user) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const questionId = validatedParams.id;
      const { targetQuizId } = validatedBody;

      const duplicated = await ELearningQuestionService.duplicateQuestion(
        questionId,
        targetQuizId,
        user
      );

      res.status(201).json({
        success: true,
        message: "Pertanyaan berhasil diduplikasi",
        data: duplicated,
      });
      return;
    } catch (err: any) {
      if (err.message?.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message?.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async globalViewQuestions(
    req: AuthenticatedRequestQuestion,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedQuery, user } = req;
      if (!user || !user.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          message:
            "Akses ditolak: hanya admin yang dapat melihat semua pertanyaan",
        });
        return;
      }

      const questions = await ELearningQuestionService.globalViewQuestions(
        validatedQuery
      );

      res.status(200).json({
        success: true,
        message: "Daftar pertanyaan berhasil diambil",
        data: questions,
      });
    } catch (err) {
      next(err);
    }
  }

  static async exportQuestions(
    req: AuthenticatedRequestQuestion,
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
            "Akses ditolak. Hanya admin yang dapat mengekspor pertanyaan.",
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

      const file = await ELearningQuestionService.exportQuestionsToFile(format);

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
