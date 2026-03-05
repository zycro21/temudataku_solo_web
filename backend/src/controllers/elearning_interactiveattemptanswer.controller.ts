import { Response, NextFunction } from "express";
import { ELearningInteractiveAttemptService } from "../services/elearning_interactiveattemptanswer.service.js";
import { AuthenticatedRequestInteractiveAttempt } from "../middlewares/authenticate.js";
import { logActivity } from "../utils/logActivtiy.js";

export class ELearningInteractiveAttemptController {
  static async startAndSubmit(
    req: AuthenticatedRequestInteractiveAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !validatedBody || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const result =
        await ELearningInteractiveAttemptService.startAndSubmitAttempt(
          validatedParams.interactiveId,
          validatedBody.answers,
          user
        );

      res.status(201).json({
        success: true,
        message: "Interactive berhasil disubmit",
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

      if (err.message.includes("ALREADY_PASSED")) {
        res.status(409).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async getAttempts(
    req: AuthenticatedRequestInteractiveAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedQuery, user } = req;

      if (!validatedParams || !validatedQuery || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const result = await ELearningInteractiveAttemptService.getAttempts(
        validatedParams.interactiveId,
        validatedQuery,
        user
      );

      res.status(200).json({
        success: true,
        message: "Riwayat attempt berhasil diambil",
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

  static async getAttemptDetail(
    req: AuthenticatedRequestInteractiveAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const result = await ELearningInteractiveAttemptService.getAttemptDetail(
        validatedParams.attemptId,
        user
      );

      res.status(200).json({
        success: true,
        message: "Detail attempt berhasil diambil",
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

  static async getLatestAttempt(
    req: AuthenticatedRequestInteractiveAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const result = await ELearningInteractiveAttemptService.getLatestAttempt(
        validatedParams.interactiveId,
        user
      );

      res.status(200).json({
        success: true,
        message: "Latest attempt berhasil diambil",
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

  static async saveAnswers(
    req: AuthenticatedRequestInteractiveAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !validatedBody || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const result =
        await ELearningInteractiveAttemptService.saveAttemptAnswers(
          validatedParams.attemptId,
          validatedBody.answers,
          user
        );

      res.status(200).json({
        success: true,
        message: "Jawaban berhasil disimpan",
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

      if (err.message.includes("ALREADY_SUBMITTED")) {
        res.status(409).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async submitAttempt(
    req: AuthenticatedRequestInteractiveAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams || !validatedBody || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const result = await ELearningInteractiveAttemptService.submitAttempt(
        validatedParams.attemptId,
        validatedBody.answers,
        user
      );

      res.status(200).json({
        success: true,
        message: "Attempt berhasil disubmit",
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

      if (err.message.includes("ALREADY")) {
        res.status(409).json({ success: false, message: err.message });
        return;
      }

      next(err);
    }
  }

  static async getAttemptAnswers(
    req: AuthenticatedRequestInteractiveAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const data = await ELearningInteractiveAttemptService.getAttemptAnswers(
        validatedParams.attemptId,
        user
      );

      res.status(200).json({
        success: true,
        message: "History jawaban berhasil diambil",
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

  static async canAttempt(
    req: AuthenticatedRequestInteractiveAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams || !user) {
        res.status(400).json({ success: false });
        return;
      }

      const result =
        await ELearningInteractiveAttemptService.canAttemptInteractive(
          validatedParams.interactiveId,
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

  static async exportAttempts(
    req: AuthenticatedRequestInteractiveAttempt,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const format = req.validatedQuery?.format === "excel" ? "excel" : "csv";

      const { buffer, fileName, mimeType } =
        await ELearningInteractiveAttemptService.exportAttemptsToFile(format);

      // Activity log (optional tapi recommended)
      await logActivity({
        userId: req.user.userId,
        action: "ADMIN_EXPORT_INTERACTIVE_ATTEMPTS",
        type: "EXPORT",
        description: `Admin mengekspor history interactive attempts (${format})`,
        req,
      });

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.setHeader("Content-Type", mimeType);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  }
}
