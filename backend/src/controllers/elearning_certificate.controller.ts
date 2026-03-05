import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestELearningCertificate } from "../middlewares/authenticate.js";
import { format } from "date-fns";
import { HttpError } from "../utils/httpError";
import * as ElearningCertificateService from "../services/elearning_certificate.service.js";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { logActivity } from "../utils/logActivtiy.js";

export const generateCertificateManual = async (
  req: AuthenticatedRequestELearningCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: courseId } = req.validatedParams;
    const { userId, note } = req.validatedBody;

    const result = await ElearningCertificateService.generateCertificate({
      courseId,
      userId,
      verifiedBy: req.user!.userId,
      note,
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// export const generateCertificateAuto = async (
//   req: AuthenticatedRequestELearningCertificate,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const courseId = req.params.id;
//     const userId = req.user!.userId;

//     const result = await ElearningCertificateService.generateCertificateAuto({
//       courseId,
//       userId,
//     });

//     res.status(201).json({ success: true, data: result });
//   } catch (err) {
//     next(err);
//   }
// };

export const getMyCertificates = async (
  req: AuthenticatedRequestELearningCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await ElearningCertificateService.getCertificatesByUser({
      userId: req.user!.userId,
      query: req.validatedQuery,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getCertificateDetail = async (
  req: AuthenticatedRequestELearningCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    const certificateId = req.validatedParams.id;
    const userId = req.user!.userId;
    const roles = req.user!.roles; // asumsi roles sudah array

    const isAdmin = roles.includes("admin");

    const result = await ElearningCertificateService.getCertificateDetail({
      certificateId,
      userId,
      isAdmin,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const deleteCertificate = async (
  req: AuthenticatedRequestELearningCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    const certificateId = req.validatedParams.id;

    await ElearningCertificateService.deleteCertificate(certificateId);

    res.json({
      success: true,
      message: "Certificate deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getAllCertificates = async (
  req: AuthenticatedRequestELearningCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    const q = req.validatedQuery || {};

    const result = await ElearningCertificateService.getAllCertificates({
      page: q.page,
      limit: q.limit,
      sortBy: q.sortBy,
      sortOrder: q.sortOrder,
      status: q.status,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCertificate = async (
  req: AuthenticatedRequestELearningCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    const certificateId = req.validatedParams.id;
    const { status, note } = req.validatedBody;

    const adminId = req.user!.userId;

    const updated = await ElearningCertificateService.updateCertificate(
      certificateId,
      {
        status,
        note,
        verifiedBy: adminId,
      }
    );

    res.json({
      success: true,
      message: "Certificate updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const markCertificateAsViewed = async (
  req: AuthenticatedRequestELearningCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    const certificateId = req.validatedParams.id;
    const userId = req.user!.userId;

    const updated = await ElearningCertificateService.markCertificateAsViewed(
      certificateId,
      userId
    );

    res.json({
      success: true,
      message: "Certificate marked as viewed",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const regenerateCertificate = async (
  req: AuthenticatedRequestELearningCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    const certificateId = req.validatedParams.id;
    const adminId = req.user!.userId;

    const result = await ElearningCertificateService.regenerateCertificate(
      certificateId,
      adminId
    );

    res.json({
      success: true,
      message: "Certificate regenerated successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const exportCertificates = async (
  req: AuthenticatedRequestELearningCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const format = req.validatedQuery?.format === "excel" ? "excel" : "csv";

    const { buffer, fileName, mimeType } =
      await ElearningCertificateService.exportCertificatesToFile(format);

    // Activity log
    await logActivity({
      userId: req.user.userId,
      action: "ADMIN_EXPORT_ELEARNING_CERTIFICATES",
      type: "EXPORT",
      description: `Admin mengekspor sertifikat e-learning dalam format ${format}`,
      req,
    });

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", mimeType);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};
