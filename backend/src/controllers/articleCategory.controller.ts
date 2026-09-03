import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestArticle } from "../middlewares/authenticate.js";
import ArticleCategoryService from "../services/articleCategory.service.js";

const adminLikeRoles = ["admin", "cm", "curdev"];

function isAdminLike(user?: { roles: string[] }) {
  return !!user?.roles?.some((role) => adminLikeRoles.includes(role));
}

export default {
  // Publik — dipakai dropdown filter & form buat/edit artikel
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await ArticleCategoryService.getCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  },

  async createCategory(
    req: AuthenticatedRequestArticle,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedBody, user } = req;

      if (!validatedBody?.name || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      if (!isAdminLike(user)) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat membuat kategori",
        });
        return;
      }

      const category = await ArticleCategoryService.createCategory(
        validatedBody.name,
      );

      res.status(201).json({
        success: true,
        message: "Kategori berhasil dibuat",
        data: category,
      });
    } catch (err: any) {
      if (err.message === "Kategori dengan nama ini sudah ada") {
        res.status(409).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  async updateCategory(
    req: AuthenticatedRequestArticle,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedBody, validatedParams, user } = req;

      if (!validatedBody?.name || !validatedParams?.id || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      if (!isAdminLike(user)) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat mengubah kategori",
        });
        return;
      }

      const category = await ArticleCategoryService.updateCategory(
        validatedParams.id,
        validatedBody.name,
      );

      res.status(200).json({
        success: true,
        message: "Kategori berhasil diperbarui",
        data: category,
      });
    } catch (err: any) {
      if (err.message === "Kategori tidak ditemukan") {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message === "Kategori dengan nama ini sudah ada") {
        res.status(409).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  async deleteCategory(
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

      if (!isAdminLike(user)) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat menghapus kategori",
        });
        return;
      }

      await ArticleCategoryService.deleteCategory(validatedParams.id);

      res.status(200).json({
        success: true,
        message: "Kategori berhasil dihapus",
      });
    } catch (err: any) {
      if (err.message === "Kategori tidak ditemukan") {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message.includes("masih dipakai oleh")) {
        res.status(409).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },

  // 🔥 BARU — detail 1 kategori (publik), dipakai halaman kategori artikel di FE
  async getCategoryById(
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

      const category = await ArticleCategoryService.getCategoryById(
        validatedParams.id,
      );

      res.status(200).json({ success: true, data: category });
    } catch (err: any) {
      if (err.message === "Kategori tidak ditemukan") {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  },
};
