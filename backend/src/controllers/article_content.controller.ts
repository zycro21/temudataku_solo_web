import { Response, NextFunction } from "express";
// 🔥 Sesuaikan path import ini dengan struktur folder project kamu
import { AuthenticatedRequestArticleContent } from "../middlewares/authenticate.js";
import ArticleContentService from "../services/article_content.service.js";

const adminLikeRoles = ["admin", "cm", "curdev"];

function isAdminLike(user?: { roles: string[] }) {
  return !!user?.roles?.some((role) => adminLikeRoles.includes(role));
}

// Dipakai bareng di semua method di bawah — satu tempat buat mapping
// pesan error dari service ke status HTTP yang sesuai.
function handleArticleContentError(
  err: any,
  res: Response,
  next: NextFunction,
) {
  if (
    err.message === "Artikel tidak ditemukan" ||
    err.message === "Block tidak ditemukan"
  ) {
    res.status(404).json({ success: false, message: err.message });
    return;
  }

  // 🔥 Satu artikel cuma boleh 1 Table of Content — pelanggaran constraint
  // unik ini konflik sama state yang ada, bukan salah format request.
  if (err.message.includes("sudah punya Table of Content")) {
    res.status(409).json({ success: false, message: err.message });
    return;
  }

  if (
    err.message.includes("tidak sesuai jumlah") ||
    err.message.includes("File media untuk") ||
    err.message.includes("wajib diisi untuk media") ||
    err.message === "orderNumber tidak valid" ||
    // 🔥 Target Link/Table of Content nggak valid: targetKey/targetContentBlockId
    // atau targetMediaKey/targetAdditionalContentId nggak ketemu, diisi
    // dua-duanya sekaligus, nggak diisi sama sekali, atau externalUrl
    // kosong buat link bertipe external_url.
    err.message.includes("tidak ditemukan") ||
    err.message.includes("Target wajib diisi salah satu") ||
    err.message.includes("externalUrl wajib diisi untuk link")
  ) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  next(err);
}

export default {
  // PUT /articles/:id/content — bulk-replace semua block sekaligus
  async updateArticleContent(
    req: AuthenticatedRequestArticleContent,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (
        !validatedParams?.id ||
        !validatedBody ||
        !("blocks" in validatedBody) ||
        !user
      ) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      if (!isAdminLike(user)) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat mengubah konten artikel",
        });
        return;
      }

      const mediaFiles = (req.files as Express.Multer.File[]) ?? [];

      const updated = await ArticleContentService.updateArticleContent(
        validatedParams.id,
        validatedBody,
        mediaFiles,
      );

      res.status(200).json({
        success: true,
        message: "Konten artikel berhasil diperbarui",
        data: updated,
      });
    } catch (err: any) {
      handleArticleContentError(err, res, next);
    }
  },

  // GET /articles/:id/content/blocks — list semua block sebuah artikel
  async getArticleBlocks(
    req: AuthenticatedRequestArticleContent,
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
          message: "Hanya admin/cm/curdev yang dapat mengakses endpoint ini",
        });
        return;
      }

      const blocks = await ArticleContentService.getArticleBlocks(
        validatedParams.id,
      );

      res.status(200).json({ success: true, data: blocks });
    } catch (err: any) {
      handleArticleContentError(err, res, next);
    }
  },

  // GET /articles/:id/content/blocks/:blockId — detail 1 block
  async getArticleBlockById(
    req: AuthenticatedRequestArticleContent,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams?.id || !validatedParams?.blockId || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      if (!isAdminLike(user)) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat mengakses endpoint ini",
        });
        return;
      }

      const block = await ArticleContentService.getArticleBlockById(
        validatedParams.id,
        validatedParams.blockId,
      );

      res.status(200).json({ success: true, data: block });
    } catch (err: any) {
      handleArticleContentError(err, res, next);
    }
  },

  // POST /articles/:id/content/blocks — tambah 1 block baru
  async createArticleBlock(
    req: AuthenticatedRequestArticleContent,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (
        !validatedParams?.id ||
        !validatedBody ||
        "blocks" in validatedBody ||
        !user
      ) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      if (!isAdminLike(user)) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat membuat konten artikel",
        });
        return;
      }

      const mediaFiles = (req.files as Express.Multer.File[]) ?? [];

      const created = await ArticleContentService.createArticleBlock(
        validatedParams.id,
        validatedBody,
        mediaFiles,
      );

      res.status(201).json({
        success: true,
        message: "Block berhasil ditambahkan",
        data: created,
      });
    } catch (err: any) {
      handleArticleContentError(err, res, next);
    }
  },

  // PATCH /articles/:id/content/blocks/:blockId — update 1 block
  async updateArticleBlock(
    req: AuthenticatedRequestArticleContent,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (
        !validatedParams?.id ||
        !validatedParams?.blockId ||
        !validatedBody ||
        "blocks" in validatedBody ||
        !user
      ) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      if (!isAdminLike(user)) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat mengubah konten artikel",
        });
        return;
      }

      const mediaFiles = (req.files as Express.Multer.File[]) ?? [];

      const updated = await ArticleContentService.updateArticleBlock(
        validatedParams.id,
        validatedParams.blockId,
        validatedBody,
        mediaFiles,
      );

      res.status(200).json({
        success: true,
        message: "Block berhasil diperbarui",
        data: updated,
      });
    } catch (err: any) {
      handleArticleContentError(err, res, next);
    }
  },

  // DELETE /articles/:id/content/blocks/:blockId — hapus 1 block
  async deleteArticleBlock(
    req: AuthenticatedRequestArticleContent,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams?.id || !validatedParams?.blockId || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      if (!isAdminLike(user)) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat menghapus konten artikel",
        });
        return;
      }

      await ArticleContentService.deleteArticleBlock(
        validatedParams.id,
        validatedParams.blockId,
      );

      res.status(200).json({
        success: true,
        message: "Block berhasil dihapus",
      });
    } catch (err: any) {
      handleArticleContentError(err, res, next);
    }
  },
};
