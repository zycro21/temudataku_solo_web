import { Response, NextFunction } from "express";
// 🔥 Sesuaikan path import ini dengan struktur folder project kamu
import { AuthenticatedRequestForm } from "../middlewares/authenticate.js";
import { logActivity } from "../utils/logActivtiy.js";
import * as FormService from "../services/form.service.js";
import type {
  CreateFormInput,
  DuplicateFormInput,
  ListEligibleEventsQuery,
  ListFormsQuery,
  PrefillLinkInput,
  SaveFormStructureInput,
  UpdateFormInput,
} from "../validations/form.validation.js";

// Class Manager + admin. Kepemilikan form (siapa boleh buka form siapa)
// dicek lagi di service.
const formManagerRoles = ["admin", "cm"];

function isFormManager(user?: { roles: string[] }) {
  return !!user?.roles?.some((role) => formManagerRoles.includes(role));
}

// Validasi user + role sekali di awal; return actor, atau null kalau sudah
// membalas 401/403.
function getManagerActor(
  req: AuthenticatedRequestForm,
  res: Response,
): FormService.FormActor | null {
  const { user } = req;

  if (!user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return null;
  }
  if (!isFormManager(user)) {
    res.status(403).json({
      success: false,
      message: "Hanya admin/cm yang dapat mengelola form",
    });
    return null;
  }
  return { userId: user.userId, roles: user.roles };
}

// Satu tempat buat mapping error dari service ke respons HTTP.
// Service melempar FormError (punya status, code, details).
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
    console.error("[form] gagal mencatat aktivitas:", err);
  }
}

export default {
  // GET /forms — Kelola Form (tab, search, filter, urutan)
  async listForms(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const actor = getManagerActor(req, res);
      if (!actor) return;

      const data = await FormService.listForms(
        actor,
        req.validatedQuery as unknown as ListFormsQuery,
      );
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // GET /events/eligible — Pilih Event Non-Kelas
  async listEligibleEvents(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const actor = getManagerActor(req, res);
      if (!actor) return;

      const data = await FormService.listEligibleEvents(
        actor,
        req.validatedQuery as unknown as ListEligibleEventsQuery,
      );
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // POST /forms — buat form baru (tipe dipilih dulu, lalu masuk builder)
  async createForm(
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

      const created = await FormService.createForm(
        actor,
        req.validatedBody as CreateFormInput,
      );

      await logSafely(
        req,
        "CREATE_FORM",
        "CREATE",
        `Membuat form "${(created as any)?.title}" (${(created as any)?.type}).`,
      );

      res.status(201).json({
        success: true,
        message: "Form berhasil dibuat",
        data: created,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // GET /forms/:id — detail form + seluruh struktur (buat Form Builder)
  async getFormDetail(
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

      const data = await FormService.getFormDetail(
        actor,
        req.validatedParams.id,
      );
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // PATCH /forms/:id — judul, deskripsi, pengaturan, tema
  async updateForm(
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

      const updated = await FormService.updateForm(
        actor,
        req.validatedParams.id,
        req.validatedBody as UpdateFormInput,
      );

      res.status(200).json({
        success: true,
        message: "Form berhasil diperbarui",
        data: updated,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // PUT /forms/:id/structure — Simpan Draft (section, pertanyaan, pilihan)
  async saveFormStructure(
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

      const saved = await FormService.saveFormStructure(
        actor,
        req.validatedParams.id,
        req.validatedBody as SaveFormStructureInput,
      );

      res.status(200).json({
        success: true,
        message: "Draft form berhasil disimpan",
        data: saved,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // POST /forms/:id/publish
  async publishForm(
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

      const data = await FormService.publishForm(actor, req.validatedParams.id);

      await logSafely(
        req,
        "PUBLISH_FORM",
        "UPDATE",
        `Mempublikasikan form ${req.validatedParams.id}.`,
      );

      res.status(200).json({
        success: true,
        message: "Form berhasil dipublikasikan",
        data,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // POST /forms/:id/unpublish
  async unpublishForm(
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

      const data = await FormService.unpublishForm(
        actor,
        req.validatedParams.id,
      );

      await logSafely(
        req,
        "UNPUBLISH_FORM",
        "UPDATE",
        `Menghentikan publikasi form ${req.validatedParams.id}.`,
      );

      res.status(200).json({
        success: true,
        message: "Publikasi form dihentikan",
        data,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // POST /forms/:id/archive
  async archiveForm(
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

      const data = await FormService.archiveForm(actor, req.validatedParams.id);

      await logSafely(
        req,
        "ARCHIVE_FORM",
        "UPDATE",
        `Mengarsipkan form ${req.validatedParams.id}.`,
      );

      res.status(200).json({
        success: true,
        message: "Form berhasil diarsipkan",
        data,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // POST /forms/:id/duplicate
  async duplicateForm(
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

      const data = await FormService.duplicateForm(
        actor,
        req.validatedParams.id,
        (req.validatedBody ?? {}) as DuplicateFormInput,
      );

      await logSafely(
        req,
        "DUPLICATE_FORM",
        "CREATE",
        `Menduplikasi form ${req.validatedParams.id}.`,
      );

      res.status(201).json({
        success: true,
        message: "Form berhasil diduplikasi",
        data,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // GET /forms/:id/share — URL untuk panel Bagikan Link (QR dibuat di frontend)
  async getShareInfo(
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

      const data = await FormService.getShareInfo(
        actor,
        req.validatedParams.id,
      );
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // POST /forms/:id/prefill-link
  async createPrefillLink(
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

      const data = await FormService.buildPrefillLink(
        actor,
        req.validatedParams.id,
        req.validatedBody as PrefillLinkInput,
      );
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // GET /forms/:id/preview — data renderer responden, TANPA menyimpan response
  async getFormPreview(
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

      const data = await FormService.getFormPreview(
        actor,
        req.validatedParams.id,
      );
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // PUT /forms/:id/header-image
  async setHeaderImage(
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

      const data = await FormService.setFormHeaderImage(
        actor,
        req.validatedParams.id,
        req.file,
      );
      res.status(200).json({
        success: true,
        message: "Header image berhasil diperbarui",
        data,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // DELETE /forms/:id/header-image
  async removeHeaderImage(
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

      const data = await FormService.removeFormHeaderImage(
        actor,
        req.validatedParams.id,
      );
      res.status(200).json({
        success: true,
        message: "Header image dihapus",
        data,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // POST /forms/:id/media — upload gambar/video buat elemen Image/Video
  async uploadMedia(
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

      const data = await FormService.uploadFormMedia(
        actor,
        req.validatedParams.id,
        req.file,
      );
      res.status(201).json({
        success: true,
        message: "Media berhasil diunggah",
        data,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },
};
