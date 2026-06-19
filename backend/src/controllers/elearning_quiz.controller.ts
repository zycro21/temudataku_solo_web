import { Response, NextFunction } from "express";
import { ELearningQuizService } from "../services/elearning_quiz.service.js";
import { AuthenticatedRequestQuiz } from "../middlewares/authenticate.js";

export class ELearningQuizController {
  static async createQuiz(
    req: AuthenticatedRequestQuiz,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams?.textId || !validatedBody || !user) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const { textId } = validatedParams;
      const { title, description, timeLimitMinutes } = validatedBody;

      if (!title) {
        res
          .status(400)
          .json({ success: false, message: "Judul quiz wajib diisi" });
        return;
      }

      const newQuiz = await ELearningQuizService.createQuiz(
        textId,
        {
          title,
          description,
          timeLimitMinutes,
        },
        user,
      );

      res.status(201).json({
        success: true,
        message: "Quiz berhasil dibuat",
        data: newQuiz,
      });
      return;
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      } else if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      } else if (err.message.includes("sudah memiliki quiz")) {
        res.status(400).json({ success: false, message: err.message });
        return;
      } else {
        next(err);
      }
    }
  }

  static async getQuizBySubBab(
    req: AuthenticatedRequestQuiz,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedQuery, user } = req;
      if (!validatedParams?.subBabId || !user) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const { subBabId } = validatedParams;
      const { search, sortBy, sortOrder, page, limit } = validatedQuery;

      const quizzes = await ELearningQuizService.getQuizBySubBab(
        subBabId,
        { search, sortBy, sortOrder, page, limit },
        user,
      );

      if (!quizzes || quizzes.data.length === 0) {
        res
          .status(404)
          .json({ success: false, message: "Quiz tidak ditemukan" });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Quiz ditemukan",
        pagination: quizzes.pagination,
        data: quizzes.data,
      });
    } catch (err: any) {
      if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async getQuizById(
    req: AuthenticatedRequestQuiz,
    res: Response,
    next: NextFunction,
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

      const quiz = await ELearningQuizService.getQuizById(
        validatedParams.id,
        user,
      );

      if (!quiz) {
        res.status(404).json({
          success: false,
          message: "Quiz tidak ditemukan",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Quiz ditemukan",
        data: quiz,
      });
    } catch (err: any) {
      if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      } else if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      } else {
        next(err);
      }
    }
  }

  static async updateQuiz(
    req: AuthenticatedRequestQuiz,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;
      if (!validatedParams?.id || !validatedBody || !user) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const updated = await ELearningQuizService.updateQuiz(
        validatedParams.id,
        validatedBody,
        user,
      );

      res.status(200).json({
        success: true,
        message: "Quiz berhasil diperbarui",
        data: updated,
      });
    } catch (err: any) {
      if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      } else if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      } else if (err.message.includes("tidak dapat diubah")) {
        res.status(400).json({ success: false, message: err.message });
        return;
      } else {
        next(err);
      }
    }
  }

  static async deleteQuiz(
    req: AuthenticatedRequestQuiz,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      const quizId = validatedParams?.id;

      if (!quizId) {
        res.status(400).json({
          success: false,
          message: "Quiz ID wajib diisi",
        });
        return;
      }

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await ELearningQuizService.deleteQuiz(quizId, {
        userId: user.userId,
        roles: user.roles,
        mentorProfileId: user.mentorProfileId,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({
          success: false,
          message: err.message,
        });
        return;
      }

      if (err.message.includes("Akses ditolak")) {
        res.status(403).json({
          success: false,
          message: err.message,
        });
        return;
      }

      next(err);
    }
  }

  static async getAllQuizzes(
    req: AuthenticatedRequestQuiz,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery, user } = req;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { search, sortBy, sortOrder, page, limit, courseId } =
        validatedQuery;

      const result = await ELearningQuizService.getAllQuizzes(
        {
          search,
          sortBy,
          sortOrder,
          page,
          limit,
          courseId,
        },
        {
          userId: user.userId,
          roles: user.roles,
          mentorProfileId: user.mentorProfileId,
        },
      );

      res.status(200).json({
        success: true,
        message: "Daftar quiz berhasil diambil",
        ...result,
      });
    } catch (err: any) {
      if (err.message.includes("Akses ditolak")) {
        res.status(403).json({
          success: false,
          message: err.message,
        });
        return;
      }

      next(err);
    }
  }

  static async getQuizzesByCourse(
    req: AuthenticatedRequestQuiz,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedQuery, user } = req;
      if (!validatedParams?.courseId || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const { courseId } = validatedParams;
      const { page, limit, search, sortBy, order } = validatedQuery;

      const result = await ELearningQuizService.getQuizzesByCourse(
        courseId,
        user,
        { page, limit, search, sortBy, order },
      );

      res.status(200).json({
        success: true,
        message: "Daftar quiz berhasil diambil",
        ...result,
      });
    } catch (err: any) {
      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      } else if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      } else {
        next(err);
      }
    }
  }

  static async exportQuizzes(
    req: AuthenticatedRequestQuiz,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery, user } = req;
      const format = validatedQuery?.format;

      if (!user || !user.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          message: "Akses ditolak. Hanya admin yang dapat mengekspor data.",
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

      const file = await ELearningQuizService.exportQuizzesToFile(format);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${file.filename}`,
      );
      res.setHeader("Content-Type", file.mimetype);

      res.send(file.buffer);
      return;
    } catch (err) {
      next(err);
    }
  }
}
