import { Response, NextFunction } from "express";
// 🔥 Sesuaikan path import ini dengan struktur folder project kamu
import { AuthenticatedRequestForm } from "../middlewares/authenticate.js";
import * as FormPublicService from "../services/form_public.service.js";
import type { SubmitResponseInput } from "../validations/form_public.validation.js";

// Responder boleh anonim: req.user bisa kosong (diisi optionalAuthenticate
// kalau ada token valid). Keputusan "login wajib" ada di service.
function toPublicUser(
  req: AuthenticatedRequestForm,
): FormPublicService.PublicUser {
  const { user } = req;
  if (!user) return undefined;
  return {
    userId: user.userId,
    roles: user.roles,
    email: user.email,
    fullName: user.fullName,
  };
}

// Token edit buat responder anonim: lebih baik lewat header (nggak masuk log
// URL), query string tetap didukung buat link dari email receipt.
function getEditToken(req: AuthenticatedRequestForm): string | undefined {
  return req.header("x-form-edit-token") ?? req.validatedQuery?.editToken;
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

export default {
  // GET /forms/:slug — form + status penerimaan + status responder
  async getForm(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const slug = req.validatedParams?.slug;
      if (!slug) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const data = await FormPublicService.getPublicForm(
        slug,
        toPublicUser(req),
      );
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // GET /events/:eventId/forms — daftar form Published di halaman Event
  async listEventForms(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const eventId = req.validatedParams?.eventId;
      if (!eventId) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const data = await FormPublicService.listEventForms(eventId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // POST /forms/:slug/responses — submit response final
  async submitResponse(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const slug = req.validatedParams?.slug;
      if (!slug || !req.validatedBody) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const files = (req.files as Express.Multer.File[]) ?? [];
      const result = await FormPublicService.submitFormResponse(
        slug,
        toPublicUser(req),
        req.validatedBody as SubmitResponseInput,
        files,
      );

      res.status(result.replay ? 200 : 201).json({
        success: true,
        message: "Jawaban berhasil dikirim",
        data: result,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // GET /forms/:slug/responses/:responseId — ambil response sendiri (buat prefill edit)
  async getOwnResponse(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const slug = req.validatedParams?.slug;
      const responseId = req.validatedParams?.responseId;
      if (!slug || !responseId) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const data = await FormPublicService.getOwnFormResponse(
        slug,
        responseId,
        toPublicUser(req),
        getEditToken(req),
      );
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // PUT /forms/:slug/responses/:responseId — edit response setelah submit
  async editResponse(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const slug = req.validatedParams?.slug;
      const responseId = req.validatedParams?.responseId;
      if (!slug || !responseId || !req.validatedBody) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const files = (req.files as Express.Multer.File[]) ?? [];
      const data = await FormPublicService.editFormResponse(
        slug,
        responseId,
        toPublicUser(req),
        getEditToken(req),
        req.validatedBody as SubmitResponseInput,
        files,
      );

      res.status(200).json({
        success: true,
        message: "Jawaban berhasil diperbarui",
        data,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // PUT /forms/:slug/draft — autosave draft (wajib login)
  async saveDraft(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const slug = req.validatedParams?.slug;
      if (!slug || !req.validatedBody) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const files = (req.files as Express.Multer.File[]) ?? [];
      const data = await FormPublicService.saveFormDraft(
        slug,
        toPublicUser(req),
        req.validatedBody as SubmitResponseInput,
        files,
      );

      res.status(200).json({
        success: true,
        message: "Draft tersimpan",
        data,
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // GET /forms/:slug/draft — ambil draft milik responder (null kalau belum ada)
  async getDraft(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const slug = req.validatedParams?.slug;
      if (!slug) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const data = await FormPublicService.getFormDraft(
        slug,
        toPublicUser(req),
      );
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },
};
