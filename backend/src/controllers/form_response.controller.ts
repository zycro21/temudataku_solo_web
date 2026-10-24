import { Response, NextFunction } from "express";
// 🔥 Sesuaikan path import ini dengan struktur folder project kamu
import { AuthenticatedRequestForm } from "../middlewares/authenticate.js";
import { logActivity } from "../utils/logActivtiy.js";
import * as FormResponseService from "../services/form_response.service.js";
import type {
  ExportResponsesQuery,
  ListResponsesQuery,
  QuestionAnswersQuery,
} from "../validations/form_response.validation.js";

const formManagerRoles = ["admin", "cm"];

function isFormManager(user?: { roles: string[] }) {
  return !!user?.roles?.some((role) => formManagerRoles.includes(role));
}

function getManagerActor(
  req: AuthenticatedRequestForm,
  res: Response,
): FormResponseService.FormActor | null {
  const { user } = req;

  if (!user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return null;
  }
  if (!isFormManager(user)) {
    res.status(403).json({
      success: false,
      message: "Hanya admin/cm yang dapat mengakses response form",
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

export default {
  // GET /forms/:id/responses — list (search, filter status, rentang tanggal, pagination)
  async listResponses(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const actor = getManagerActor(req, res);
      if (!actor) return;
      if (!req.validatedParams?.id || !req.validatedQuery) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const data = await FormResponseService.listResponses(
        actor,
        req.validatedParams.id,
        req.validatedQuery as unknown as ListResponsesQuery,
      );
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // GET /forms/:id/responses/:responseId — detail (+ prev/next buat Individual view)
  async getResponseDetail(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const actor = getManagerActor(req, res);
      if (!actor) return;
      if (!req.validatedParams?.id || !req.validatedParams?.responseId) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const data = await FormResponseService.getResponseDetail(
        actor,
        req.validatedParams.id,
        req.validatedParams.responseId,
      );
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // GET /forms/:id/responses/summary — Summary view
  async getResponseSummary(
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

      const data = await FormResponseService.getResponseSummary(
        actor,
        req.validatedParams.id,
      );
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // GET /forms/:id/responses/questions/:itemId — Question view
  async getQuestionAnswers(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const actor = getManagerActor(req, res);
      if (!actor) return;
      if (
        !req.validatedParams?.id ||
        !req.validatedParams?.itemId ||
        !req.validatedQuery
      ) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const data = await FormResponseService.getQuestionAnswers(
        actor,
        req.validatedParams.id,
        req.validatedParams.itemId,
        req.validatedQuery as unknown as QuestionAnswersQuery,
      );
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // GET /forms/:id/responses/export — Export CSV
  async exportResponses(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const actor = getManagerActor(req, res);
      if (!actor) return;
      if (!req.validatedParams?.id || !req.validatedQuery) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const { fileBuffer, fileName, mimeType, rowCount } =
        await FormResponseService.exportResponsesCsv(
          actor,
          req.validatedParams.id,
          req.validatedQuery as unknown as ExportResponsesQuery,
        );

      // Pencatatan aktivitas nggak boleh menggagalkan export yang sudah jadi
      try {
        await logActivity({
          userId: actor.userId,
          action: "EXPORT_FORM_RESPONSES",
          type: "EXPORT",
          description: `Mengekspor ${rowCount} response form ${req.validatedParams.id} (CSV).`,
          req: req as any,
        } as any);
      } catch (err) {
        console.error("[form] gagal mencatat aktivitas export:", err);
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`,
      );
      res.setHeader("Content-Type", mimeType);
      res.send(fileBuffer);
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },

  // GET /forms/:id/responses/:responseId/files/:fileId — download file upload
  async downloadResponseFile(
    req: AuthenticatedRequestForm,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const actor = getManagerActor(req, res);
      if (!actor) return;
      if (
        !req.validatedParams?.id ||
        !req.validatedParams?.responseId ||
        !req.validatedParams?.fileId
      ) {
        res
          .status(400)
          .json({ success: false, message: "Data request tidak valid" });
        return;
      }

      const { absolutePath, originalName, mimeType } =
        await FormResponseService.getResponseFileForDownload(
          actor,
          req.validatedParams.id,
          req.validatedParams.responseId,
          req.validatedParams.fileId,
        );

      // File dari responder = konten yang nggak dipercaya: paksa download,
      // jangan biarkan browser mengeksekusi/menampilkan inline.
      res.setHeader("X-Content-Type-Options", "nosniff");
      if (mimeType) res.setHeader("Content-Type", mimeType);
      res.download(absolutePath, originalName, (err) => {
        if (err && !res.headersSent) next(err);
      });
    } catch (err: any) {
      handleFormError(err, res, next);
    }
  },
};
