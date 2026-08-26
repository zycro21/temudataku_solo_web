import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestArticle } from "../middlewares/authenticate.js";
import ArticleService from "../services/article.service.js";

const adminLikeRoles = ["admin", "cm", "curdev"];

export default {
  async createArticle(
    req: AuthenticatedRequestArticle,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedBody, user } = req;

      if (!validatedBody || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const isAdminLike = user.roles?.some((role) =>
        adminLikeRoles.includes(role),
      );

      if (!isAdminLike) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat membuat artikel",
        });
        return;
      }

      const uploadedCover = req.file
        ? `/images/articleCover/${req.file.filename}`
        : undefined;

      const result = await ArticleService.createArticle(
        {
          ...validatedBody,
          coverImage: uploadedCover ?? validatedBody.coverImage,
        },
        user.userId,
      );

      res.status(201).json({
        success: true,
        message: "Artikel berhasil dibuat",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async getArticles(
    req: AuthenticatedRequestArticle,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery } = req;

      const result = await ArticleService.getArticles({
        page: validatedQuery?.page ?? 1,
        limit: validatedQuery?.limit ?? 10,
        category: validatedQuery?.category,
        tag: validatedQuery?.tag,
        search: validatedQuery?.search,
        isRecommended: validatedQuery?.isRecommended,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // Admin-only — list SEMUA status (bukan cuma PUBLISHED), dipakai tabel admin
  async getArticlesAdmin(
    req: AuthenticatedRequestArticle,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery, user } = req;

      if (!user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const isAdminLike = user.roles?.some((role) =>
        adminLikeRoles.includes(role),
      );

      if (!isAdminLike) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat mengakses endpoint ini",
        });
        return;
      }

      const result = await ArticleService.getArticlesAdmin({
        page: validatedQuery?.page ?? 1,
        limit: validatedQuery?.limit ?? 10,
        search: validatedQuery?.search,
        status: validatedQuery?.status,
        isRecommended: validatedQuery?.isRecommended,
        sortBy: validatedQuery?.sortBy ?? "createdAt",
        sortOrder: validatedQuery?.sortOrder ?? "desc",
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // Admin-only — buat load artikel (termasuk draft/archived) ke form edit
  async getArticleById(
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

      const isAdminLike = user.roles?.some((role) =>
        adminLikeRoles.includes(role),
      );

      if (!isAdminLike) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat mengakses endpoint ini",
        });
        return;
      }

      const article = await ArticleService.getArticleById(validatedParams.id);

      res.status(200).json({
        success: true,
        data: article,
      });
    } catch (err: any) {
      if (err.message === "Artikel tidak ditemukan") {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  // Publik — dipakai halaman detail artikel
  async getArticleBySlug(
    req: AuthenticatedRequestArticle,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams } = req;

      if (!validatedParams?.slug) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const article = await ArticleService.getArticleBySlug(
        validatedParams.slug,
      );

      res.status(200).json({
        success: true,
        data: article,
      });
    } catch (err: any) {
      if (err.message === "Artikel tidak ditemukan") {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  async updateArticle(
    req: AuthenticatedRequestArticle,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedBody, validatedParams, user } = req;

      if (!validatedBody || !validatedParams?.id || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const isAdminLike = user.roles?.some((role) =>
        adminLikeRoles.includes(role),
      );

      if (!isAdminLike) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat mengubah artikel",
        });
        return;
      }

      const uploadedCover = req.file
        ? `/images/articleCover/${req.file.filename}`
        : undefined;

      const result = await ArticleService.updateArticle(validatedParams.id, {
        ...validatedBody,
        coverImage: uploadedCover ?? validatedBody.coverImage,
      });

      res.status(200).json({
        success: true,
        message: "Artikel berhasil diperbarui",
        data: result,
      });
    } catch (err: any) {
      if (err.message === "Artikel tidak ditemukan") {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message === "Slug sudah dipakai artikel lain") {
        res.status(409).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  async deleteArticle(
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

      const isAdminLike = user.roles?.some((role) =>
        adminLikeRoles.includes(role),
      );

      if (!isAdminLike) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat menghapus artikel",
        });
        return;
      }

      await ArticleService.deleteArticle(validatedParams.id);

      res.status(200).json({
        success: true,
        message: "Artikel berhasil dihapus",
      });
    } catch (err: any) {
      if (err.message === "Artikel tidak ditemukan") {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  // 🔥 BARU — daftar elemen sidebar yang di-favorite-in user yang lagi
  // login. Nggak perlu cek role admin-like lagi di sini karena route-nya
  // sudah di-guard authorizeRoles di articles.route.ts.
  async getElementFavorites(
    req: AuthenticatedRequestArticle,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { user } = req;

      if (!user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const favorites = await ArticleService.getElementFavorites(user.userId);

      res.status(200).json({
        success: true,
        data: favorites,
      });
    } catch (err) {
      next(err);
    }
  },

  // 🔥 BARU — toggle favorite satu elemen sidebar (favorite <-> unfavorite).
  async toggleElementFavorite(
    req: AuthenticatedRequestArticle,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedBody, user } = req;

      if (!validatedBody?.elementType || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      const result = await ArticleService.toggleElementFavorite(
        user.userId,
        validatedBody.elementType,
      );

      res.status(200).json({
        success: true,
        message: result.isFavorite
          ? "Elemen berhasil ditambahkan ke favorite"
          : "Elemen berhasil dihapus dari favorite",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
