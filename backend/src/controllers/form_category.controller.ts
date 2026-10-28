import { Response, NextFunction } from "express";
// 🔥 Sesuaikan path import ini dengan struktur folder project kamu
import { AuthenticatedRequestForm } from "../middlewares/authenticate.js";
import { logActivity } from "../utils/logActivtiy.js";
import * as FormCategoryService from "../services/form_category.service.js";
import type { FormActor } from "../services/form.service.js";
import type {
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from "../validations/form_category.validation.js";

// Class Manager + admin. Hak ubah/hapus jenis (admin atau pembuatnya)
// dicek lagi di service.
const formManagerRoles = ["admin", "cm"];

function isFormManager(user?: { roles: string[] }) {
  return !!user?.roles?.some((role) => formManagerRoles.includes(role));
}

function getManagerActor(
  req: AuthenticatedRequestForm,
  res: Response,
): FormActor | null {
  const { user } = req;

  if (!user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return null;
  }
  if (!isFormManager(user)) {
    res.status(403).json({
      success: false,
      message: "Hanya admin/cm yang dapat mengelola jenis form",
    });
    return null;
  }
  return { userId: user.userId, roles: user.roles };
}

function handleFormError(err: any, res: Response, next: NextFunction) {
  if (typeof err?.status === "number") {
    res.status(err.status).json({
      success: false,
      message: err.message,
      ...(err.code ? { code: err.code } : {}),
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }
  next(err);
}

// Pencatatan aktivitas nggak boleh menggagalkan request yang sudah sukses
async function logSafely(
  req: AuthenticatedRequestForm,
  action: string,
  type: string,
  description: string,
) {
  try {
    await logActivity({
      userId: req.user!.userId,
      action,
      type,
      description,
      req: req as any,
    } as any);
  } catch (err) {
    console.error("[form-category] gagal mencatat aktivitas:", err);
  }
}

export default {
  // GET /categories — daftar jenis per tipe (halaman Jenis Form)
  async listCategories(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const actor = getManagerActor(req, res);
      if (!actor) return;
      if (!req.validatedQuery) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const data = await FormCategoryService.listCategories(
        actor,
        req.validatedQuery as unknown as ListCategoriesQuery,
      );
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // POST /categories — buat jenis baru
  async createCategory(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const actor = getManagerActor(req, res);
      if (!actor) return;
      if (!req.validatedBody) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const created = await FormCategoryService.createCategory(
        actor,
        req.validatedBody as CreateCategoryInput,
      );

      await logSafely(
        req,
        "CREATE_FORM_CATEGORY",
        "CREATE",
        `Membuat jenis form "${(created as any)?.name}" (${(created as any)?.type}).`,
      );

      res.status(201).json({
        success: true,
        message: "Jenis form berhasil dibuat",
        data: created,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // PATCH /categories/:id — ubah nama / deskripsi
  async updateCategory(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const actor = getManagerActor(req, res);
      if (!actor) return;
      if (!req.validatedParams?.id || !req.validatedBody) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const updated = await FormCategoryService.updateCategory(
        actor,
        req.validatedParams.id,
        req.validatedBody as UpdateCategoryInput,
      );

      await logSafely(
        req,
        "UPDATE_FORM_CATEGORY",
        "UPDATE",
        `Memperbarui jenis form ${req.validatedParams.id}.`,
      );

      res.status(200).json({
        success: true,
        message: "Jenis form berhasil diperbarui",
        data: updated,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // DELETE /categories/:id — ditolak (409) kalau masih dipakai form
  async deleteCategory(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const actor = getManagerActor(req, res);
      if (!actor) return;
      if (!req.validatedParams?.id) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const data = await FormCategoryService.deleteCategory(
        actor,
        req.validatedParams.id,
      );

      await logSafely(
        req,
        "DELETE_FORM_CATEGORY",
        "DELETE",
        `Menghapus jenis form ${req.validatedParams.id}.`,
      );

      res.status(200).json({
        success: true,
        message: "Jenis form berhasil dihapus",
        data,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },
};
