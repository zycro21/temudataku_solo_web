import { Response, NextFunction } from "express";
import { AuthenticatedRequestArticle } from "../middlewares/authenticate.js";
import ArticleLikeService from "../services/articleLike.service.js";

export default {
  // Like & unlike sengaja digabung jadi satu endpoint toggle (bukan
  // POST buat like + DELETE terpisah buat unlike) — FE cukup nembak satu
  // endpoint yang sama tiap tombol hati diklik, servernya yang nentuin
  // ini nge-like atau nge-unlike berdasarkan state yang ada di DB.
  async toggleArticleLike(
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

      const result = await ArticleLikeService.toggleArticleLike(
        validatedParams.id,
        user.userId,
      );

      res.status(200).json({
        success: true,
        message: result.liked
          ? "Artikel berhasil disukai"
          : "Like artikel dibatalkan",
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

  async getArticleLikeStatus(
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

      const result = await ArticleLikeService.getArticleLikeStatus(
        validatedParams.id,
        user.userId,
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
};
