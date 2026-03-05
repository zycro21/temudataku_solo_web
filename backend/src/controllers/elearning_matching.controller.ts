import { Response, NextFunction } from "express";
import { ELearningMatchingQuestionService } from "../services/elearning_matching.service.js";
import { AuthenticatedRequestELearningMatching } from "../middlewares/authenticate.js";

export class ELearningMatchingQuestionController {
  static async createMatchingQuestion(
    req: AuthenticatedRequestELearningMatching,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result =
        await ELearningMatchingQuestionService.createMatchingQuestion(
          validatedParams.interactiveId,
          validatedBody ?? {},
          user
        );

      res.status(201).json({
        success: true,
        message: "Matching question berhasil dibuat",
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("sudah memiliki")) {
        res.status(409).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async getMatchingQuestion(
    req: AuthenticatedRequestELearningMatching,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedQuery, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const result =
        await ELearningMatchingQuestionService.getMatchingQuestionDetail(
          validatedParams.interactiveId,
          validatedQuery ?? {},
          user
        );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("FORBIDDEN")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("NOT_FOUND")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async updateMatchingQuestion(
    req: AuthenticatedRequestELearningMatching,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !validatedBody || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result =
        await ELearningMatchingQuestionService.updateMatchingQuestion(
          validatedParams.interactiveId,
          validatedBody,
          user
        );

      res.status(200).json({
        success: true,
        message: "Matching question berhasil diperbarui",
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("FORBIDDEN")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("NOT_FOUND")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async deleteMatchingQuestion(
    req: AuthenticatedRequestELearningMatching,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result =
        await ELearningMatchingQuestionService.deleteMatchingQuestion(
          validatedParams.interactiveId,
          user
        );

      res.status(200).json({
        success: true,
        message: "Matching question berhasil dihapus",
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("FORBIDDEN")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("NOT_FOUND")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async checkMatchingExistence(
    req: AuthenticatedRequestELearningMatching,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).end();
        return;
      }

      await ELearningMatchingQuestionService.checkMatchingExistence(
        validatedParams.interactiveId,
        user
      );

      res.status(200).end();
    } catch (err: any) {
      if (err.message === "MATCHING_NOT_FOUND") {
        res.status(404).end();
        return;
      }

      if (err.message.includes("FORBIDDEN")) {
        res.status(403).end();
        return;
      }

      next(err);
    }
  }

  static async getMatchingMeta(
    req: AuthenticatedRequestELearningMatching,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const data = await ELearningMatchingQuestionService.getMatchingMeta(
        validatedParams.interactiveId,
        user
      );

      res.status(200).json({
        success: true,
        data,
      });
    } catch (err: any) {
      if (err.message.includes("Akses ditolak")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("tidak ditemukan")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async createMatchingItem(
    req: AuthenticatedRequestELearningMatching,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !validatedBody || !user) {
        res.status(400).json({ success: false, message: "Data tidak valid" });
        return;
      }

      const result = await ELearningMatchingQuestionService.createMatchingItem(
        validatedParams.questionId,
        validatedBody,
        user
      );

      res.status(201).json({
        success: true,
        message: "Matching item berhasil dibuat",
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("FORBIDDEN")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("NOT_FOUND")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("INVALID")) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async updateMatchingItem(
    req: AuthenticatedRequestELearningMatching,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await ELearningMatchingQuestionService.updateMatchingItem(
        validatedParams.itemId,
        validatedBody ?? {},
        user
      );

      res.status(200).json({
        success: true,
        message: "Matching item berhasil diperbarui",
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("FORBIDDEN")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("NOT_FOUND")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("CONFLICT")) {
        res.status(409).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async deleteMatchingItem(
    req: AuthenticatedRequestELearningMatching,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      await ELearningMatchingQuestionService.deleteMatchingItem(
        validatedParams.itemId,
        user
      );

      res.status(200).json({
        success: true,
        message: "Matching item berhasil dihapus",
      });
    } catch (err: any) {
      if (err.message.includes("FORBIDDEN")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("NOT_FOUND")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async reorderMatchingItems(
    req: AuthenticatedRequestELearningMatching,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !validatedBody || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      await ELearningMatchingQuestionService.reorderMatchingItems(
        validatedParams.questionId,
        validatedBody,
        user
      );

      res.status(200).json({
        success: true,
        message: "Urutan matching item berhasil diperbarui",
      });
    } catch (err: any) {
      if (err.message.includes("FORBIDDEN")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("NOT_FOUND")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async setCorrectPairs(
    req: AuthenticatedRequestELearningMatching,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !validatedBody || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      await ELearningMatchingQuestionService.setCorrectPairs(
        validatedParams.questionId,
        validatedBody.pairs,
        user
      );

      res.status(200).json({
        success: true,
        message: "Correct matching pairs berhasil disimpan",
      });
    } catch (err: any) {
      if (err.message.includes("FORBIDDEN") || err.message.includes("Akses")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("NOT_FOUND")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async getMatchingForPlay(
    req: AuthenticatedRequestELearningMatching,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedQuery, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await ELearningMatchingQuestionService.getMatchingForPlay(
        validatedParams.interactiveId,
        validatedQuery ?? {},
        user
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("FORBIDDEN")) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }

      if (err.message.includes("NOT_FOUND")) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async getMatchingItemsForEditor(
    req: AuthenticatedRequestELearningMatching,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result =
        await ELearningMatchingQuestionService.getMatchingItemsForEditor(
          validatedParams.questionId,
          user
        );

      res.status(200).json({
        success: true,
        message: "Matching items berhasil diambil",
        data: result,
      });
    } catch (err: any) {
      if (err.message.includes("FORBIDDEN")) {
        res.status(403).json({ success: false, message: "Akses ditolak" });
        return;
      }

      if (err.message.includes("NOT_FOUND")) {
        res
          .status(404)
          .json({
            success: false,
            message: "Matching question tidak ditemukan",
          });
        return;
      }

      next(err);
    }
  }
}
