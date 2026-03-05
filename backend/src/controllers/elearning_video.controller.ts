import { Response, NextFunction } from "express";
import { ELearningVideoService } from "../services/elearning_video.service.js";
import { AuthenticatedRequestELearningVideo } from "../middlewares/authenticate.js";

export class ELearningVideoController {
  static async createVideo(
    req: AuthenticatedRequestELearningVideo,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { user, validatedParams, validatedBody } = req;

      if (!user) throw new Error("User tidak terautentikasi");
      if (!req.file) throw new Error("File wajib diupload");

      const mediaPath = `/uploads/elearning/videos/${req.file.filename}`;

      const result = await ELearningVideoService.createVideo({
        user,
        subBabId: validatedParams.id,
        title: validatedBody.title,
        anchor: validatedBody.anchor,
        filePath: mediaPath,
        fileAbsolutePath: req.file.path,
        mimeType: req.file.mimetype,
      });

      res.status(201).json({
        success: true,
        message: "Media berhasil ditambahkan",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getVideosBySubBab(
    req: AuthenticatedRequestELearningVideo,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.validatedParams;
      const { page, limit, sortBy, sortOrder } = req.validatedQuery;

      const result = await ELearningVideoService.getVideosBySubBab({
        user: req.user!,
        subBabId: id,
        page,
        limit,
        sortBy,
        sortOrder,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getVideoById(
    req: AuthenticatedRequestELearningVideo,
    res: Response,
    next: NextFunction
  ) {
    try {
      const videoId = req.validatedParams.id;

      const result = await ELearningVideoService.getVideoById({
        user: req.user!,
        videoId,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateVideo(
    req: AuthenticatedRequestELearningVideo,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await ELearningVideoService.updateVideo({
        user: req.user!,
        videoId: req.validatedParams.id,
        payload: req.validatedBody,
      });

      res.json({
        success: true,
        message: "Video berhasil diperbarui",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteVideo(
    req: AuthenticatedRequestELearningVideo,
    res: Response,
    next: NextFunction
  ) {
    try {
      await ELearningVideoService.deleteVideo({
        videoId: req.validatedParams.id,
      });

      res.json({
        success: true,
        message: "Video berhasil dihapus",
      });
    } catch (err) {
      next(err);
    }
  }

  static async reorderVideos(
    req: AuthenticatedRequestELearningVideo,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await ELearningVideoService.reorderVideos({
        user: req.user!,
        subBabId: req.validatedParams.id,
        blockId: req.validatedBody.blockId,
        orders: req.validatedBody.orders,
      });

      res.json({
        success: true,
        message: "Urutan video berhasil diperbarui",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async togglePreview(
    req: AuthenticatedRequestELearningVideo,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await ELearningVideoService.togglePreview({
        user: req.user!,
        videoId: req.validatedParams.id,
        isPreview: req.validatedBody.isPreview,
      });

      res.json({
        success: true,
        message: "Status preview berhasil diperbarui",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getVideoForPlayer(
    req: AuthenticatedRequestELearningVideo,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await ELearningVideoService.getVideoForPlayer(
        req.user!,
        req.validatedParams.id
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async moveVideo(
    req: AuthenticatedRequestELearningVideo,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await ELearningVideoService.moveVideo({
        user: req.user!,
        videoId: req.validatedParams.id,
        payload: req.validatedBody,
      });

      res.json({
        success: true,
        message: "Video berhasil dipindahkan",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getVideosByBlock(
    req: AuthenticatedRequestELearningVideo,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await ELearningVideoService.getVideosByBlock({
        user: req.user!,
        blockId: req.validatedParams.blockId,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
