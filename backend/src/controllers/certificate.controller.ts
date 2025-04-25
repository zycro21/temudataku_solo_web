import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestCertificate } from "../middlewares/authenticate";
import { format } from "date-fns";
import { HttpError } from "../utils/httpError";
import * as CertificateService from "../services/certificate.service";
import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient();

export const generateCertificate = async (
  req: AuthenticatedRequestCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    const { menteeId, serviceId } = req.validatedBody as {
      menteeId: string;
      serviceId: string;
    };

    const result = await CertificateService.generateCertificateService({
      menteeId,
      serviceId,
    });

    res.status(201).json({
      success: true,
      message: "Certificate generated successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllCertificates = async (
  req: AuthenticatedRequestCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, status, serviceId, startDate, endDate } =
      req.validatedQuery as {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        serviceId?: string;
        startDate?: string;
        endDate?: string;
      };

    const result = await CertificateService.getAllCertificatesService({
      page,
      limit,
      search,
      status,
      serviceId,
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      message: "Certificates fetched successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCertificate = async (
  req: AuthenticatedRequestCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams as { id: string };
    const { status, verifiedBy, note } = req.validatedBody as {
      status?: string;
      verifiedBy?: string;
      note?: string;
    };

    const result = await CertificateService.updateCertificateService({
      id,
      status,
      verifiedBy,
      note,
    });

    res.status(200).json({
      success: true,
      message: "Certificate updated successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getMenteeCertificatesController = async (
  req: AuthenticatedRequestCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, status, serviceId } = req.query as {
      page?: string;
      limit?: string;
      status?: string;
      serviceId?: string;
    };

    const menteeId = req.user?.userId as string;

    const result = await CertificateService.getMenteeCertificatesService({
      menteeId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      status,
      serviceId,
    });

    res.status(200).json({
      success: true,
      message: "Mentee certificates retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getCertificateDetailController = async (
  req: AuthenticatedRequestCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams; // Ambil id dari validatedParams
    const userId = req.user?.userId as string;
    const userRole = req.user?.roles.includes("admin") ? "admin" : "mentee";

    const certificate = await CertificateService.getCertificateDetailService(
      id,
      userId,
      userRole
    );

    res.status(200).json({
      success: true,
      message: "Certificate details retrieved successfully",
      data: certificate,
    });
  } catch (err) {
    next(err);
  }
};

export const downloadCertificateController = async (
  req: AuthenticatedRequestCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;
    const userId = req.user?.userId!;
    const roles = req.user?.roles!;

    const filePath = await CertificateService.downloadCertificate(
      id,
      userId,
      roles
    );

    return res.download(filePath);
  } catch (err) {
    next(err);
  }
};

export const exportCertificatesController = async (
  req: AuthenticatedRequestCertificate,
  res: Response,
  next: NextFunction
) => {
  try {
    const { format } = req.validatedQuery as { format: "csv" | "excel" };

    const { buffer, filename, contentType } =
      await CertificateService.exportCertificates(format);

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", contentType);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};
