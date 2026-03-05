import { Response, NextFunction } from "express";
import { ELearningMultipleChoiceService } from "../services/elearning_multiplechoices.service.js";
import { AuthenticatedRequestELearningMultipleChoice } from "../middlewares/authenticate.js";

export class ELearningMultipleChoiceController {
  static async create(
    req: AuthenticatedRequestELearningMultipleChoice,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !validatedBody || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const result = await ELearningMultipleChoiceService.create(
        validatedParams.interactiveId,
        validatedBody,
        user
      );

      res.status(201).json({
        success: true,
        message: "Multiple choice question berhasil dibuat",
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

      if (err.message.includes("ALREADY_EXISTS")) {
        res.status(409).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async getByInteractive(
    req: AuthenticatedRequestELearningMultipleChoice,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const result = await ELearningMultipleChoiceService.getByInteractive(
        validatedParams.interactiveId,
        user
      );

      res.status(200).json({
        success: true,
        message: "Multiple choice question berhasil diambil",
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

  static async update(
    req: AuthenticatedRequestELearningMultipleChoice,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !validatedBody || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const result = await ELearningMultipleChoiceService.update(
        validatedParams.interactiveId,
        validatedBody,
        user
      );

      res.status(200).json({
        success: true,
        message: "Multiple choice question berhasil diperbarui",
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

  static async delete(
    req: AuthenticatedRequestELearningMultipleChoice,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({ success: false });
        return;
      }

      await ELearningMultipleChoiceService.delete(
        validatedParams.interactiveId
      );

      res.status(200).json({
        success: true,
        message: "Multiple choice question berhasil dihapus",
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

  static async head(
    req: AuthenticatedRequestELearningMultipleChoice,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.sendStatus(400);
        return;
      }

      await ELearningMultipleChoiceService.head(
        validatedParams.interactiveId,
        user
      );

      // HEAD sukses → tanpa body
      res.sendStatus(200);
    } catch (err: any) {
      if (err.message.includes("FORBIDDEN")) {
        res.sendStatus(403);
        return;
      }

      if (err.message.includes("NOT_FOUND")) {
        res.sendStatus(404);
        return;
      }

      next(err);
    }
  }

  static async createOption(
    req: AuthenticatedRequestELearningMultipleChoice,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !validatedBody || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const createdOption =
        await ELearningMultipleChoiceService.createOptionForQuestion(
          validatedParams.questionId,
          validatedBody,
          user
        );

      res.status(201).json({
        success: true,
        message: "Multiple choice option berhasil dibuat",
        data: createdOption,
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

  static async updateOption(
    req: AuthenticatedRequestELearningMultipleChoice,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !validatedBody || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const updatedOption = await ELearningMultipleChoiceService.updateOption(
        validatedParams.optionId,
        validatedBody,
        user
      );

      res.status(200).json({
        success: true,
        message: "Multiple choice option berhasil diperbarui",
        data: updatedOption,
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

  static async deleteOption(
    req: AuthenticatedRequestELearningMultipleChoice,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const result = await ELearningMultipleChoiceService.deleteOption(
        validatedParams.optionId,
        user
      );

      res.status(200).json({
        success: true,
        message: "Multiple choice option berhasil dihapus",
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

  static async reorderOption(
    req: AuthenticatedRequestELearningMultipleChoice,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !validatedBody || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const result = await ELearningMultipleChoiceService.reorderOptions(
        validatedParams.questionId,
        validatedBody.orders,
        user
      );

      res.status(200).json({
        success: true,
        message: "Urutan option berhasil diperbarui",
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

  static async updateAnswerKey(
    req: AuthenticatedRequestELearningMultipleChoice,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !validatedBody || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const result = await ELearningMultipleChoiceService.updateAnswerKey(
        validatedParams.questionId,
        validatedBody.correctOptionIds,
        user
      );

      res.status(200).json({
        success: true,
        message: "Answer key berhasil diperbarui",
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

  static async getByQuestionId(
    req: AuthenticatedRequestELearningMultipleChoice,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const data = await ELearningMultipleChoiceService.getByQuestionId(
        validatedParams.questionId,
        user
      );

      res.status(200).json({
        success: true,
        data,
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

  static async getDetail(
    req: AuthenticatedRequestELearningMultipleChoice,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const result = await ELearningMultipleChoiceService.getDetail(
        validatedParams.optionId,
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
}
