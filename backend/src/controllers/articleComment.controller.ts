import { Response, NextFunction } from "express";
import { AuthenticatedRequestArticle } from "../middlewares/authenticate.js";
import ArticleCommentService from "../services/articleComment.service.js";

export default {
  async createComment(
    req: AuthenticatedRequestArticle,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams?.id || !validatedBody?.content || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await ArticleCommentService.createComment(
        validatedParams.id,
        user.userId,
        validatedBody.content,
        validatedBody.parentId,
      );

      res.status(201).json({
        success: true,
        message: "Komentar berhasil ditambahkan",
        data: result,
      });
    } catch (err: any) {
      if (
        err.message === "Artikel tidak ditemukan" ||
        err.message === "Komentar induk tidak ditemukan"
      ) {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  // Publik — sengaja nggak di-guard `authenticate`, sama kayak konten
  // artikel itu sendiri (getArticleBySlug) yang bisa dibaca siapa aja
  // tanpa login. Butuh login cuma buat NGIRIM komentar/like, bukan buat
  // MELIHAT-nya.
  async getComments(
    req: AuthenticatedRequestArticle,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams } = req;

      if (!validatedParams?.id) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await ArticleCommentService.getComments(
        validatedParams.id,
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      if (err.message === "Artikel tidak ditemukan") {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  async toggleCommentLike(
    req: AuthenticatedRequestArticle,
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

      const result = await ArticleCommentService.toggleCommentLike(
        validatedParams.id,
        user.userId,
      );

      res.status(200).json({
        success: true,
        message: result.liked
          ? "Komentar berhasil disukai"
          : "Like komentar dibatalkan",
        data: result,
      });
    } catch (err: any) {
      if (err.message === "Komentar tidak ditemukan") {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  // 🔥 BARU — status like komentar (di artikel ini) MILIK USER YANG
  // SEDANG LOGIN, dipanggil terpisah dari getComments (publik). Sama
  // pola articleLike.controller.ts -> getArticleLikeStatus.
  async getCommentsLikeStatus(
    req: AuthenticatedRequestArticle,
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

      const likedCommentIds = await ArticleCommentService.getCommentsLikeStatus(
        validatedParams.id,
        user.userId,
      );

      res.status(200).json({
        success: true,
        data: likedCommentIds,
      });
    } catch (err: any) {
      if (err.message === "Artikel tidak ditemukan") {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  // 🔥 BARU — hapus komentar/reply milik sendiri (soft delete)
  async deleteComment(
    req: AuthenticatedRequestArticle,
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

      await ArticleCommentService.deleteComment(
        validatedParams.id,
        user.userId,
      );

      res.status(200).json({
        success: true,
        message: "Komentar berhasil dihapus",
      });
    } catch (err: any) {
      if (err.message === "Komentar tidak ditemukan") {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (
        err.message === "Anda tidak dapat menghapus komentar milik orang lain"
      ) {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },
};
