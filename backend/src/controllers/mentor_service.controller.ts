import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authenticate";
import { HttpError } from "../utils/httpError";
import * as MentorServiceService from "../services/mentor_service.service";
import { uploadPath } from "../middlewares/uploadImage";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createMentoringServiceController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction  
) => {
  try {
    const input = req.validatedBody ?? req.body;

    const result = await MentorServiceService.createMentoringService(input);

    res.status(201).json({
      message: "Mentoring service created successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllMentoringServicesController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, sort_by, order } = req.validatedQuery!;

    const result = await MentorServiceService.getAllMentoringServices({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy: sort_by,
      order: order as "asc" | "desc" | undefined,
    });

    res.json({
      message: "Mentoring services retrieved successfully",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getMentoringServiceDetailController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams!;

    // Pastikan ID valid (misalnya validasi format ID atau cek apakah ada di DB)
    if (!id || typeof id !== "string") {
      res.status(400).json({ message: "Invalid service ID" });
      return;
    }

    const service = await MentorServiceService.getMentoringServiceDetailById(
      id
    );

    if (!service) {
      res.status(404).json({ message: "Mentoring service not found" });
      return;
    }

    res.status(200).json({
      message: "Mentoring service detail retrieved successfully",
      data: service,
    });
    return;
  } catch (err) {
    // Tangani error yang lebih spesifik di sini
    console.error("Error in getMentoringServiceDetailController:", err);
    next(err); // Serahkan ke middleware error handling global
  }
};

export const updateMentoringServiceController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.validatedParams?.id); // Debugging

    if (!req.validatedParams || !req.validatedBody) {
      res.status(400).json({ message: "Invalid request" });
      return;
    }

    const { id } = req.validatedParams;
    const {
      serviceName,
      description,
      price,
      maxParticipants,
      durationDays,
      isActive,
      mentorProfileIds,
      benefits,
      mechanism,
      syllabusPath,
      toolsUsed,
      targetAudience,
      schedule,
      alumniPortfolio,
    } = req.validatedBody;

    const updatedService =
      await MentorServiceService.updateMentoringServiceById(id, {
        serviceName,
        description,
        price,
        maxParticipants,
        durationDays,
        isActive,
        mentorProfileIds,
        benefits,
        mechanism,
        syllabusPath,
        toolsUsed,
        targetAudience,
        schedule,
        alumniPortfolio,
      });

    res.status(200).json({
      message: "Mentoring service updated successfully",
      updatedFields: updatedService.updatedFields,
      data: {
        ...updatedService,
        price: Number(updatedService!.price),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMentoringServiceController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams!;

    // Panggil service untuk menghapus mentoring service
    await MentorServiceService.deleteMentoringServiceById(id);

    // Berikan response sukses jika berhasil
    res.status(200).json({
      message: "Mentoring service deleted successfully",
    });
  } catch (err) {
    // Tambahkan log error (opsional)
    console.error(
      `Error deleting mentoring service with id ${req.validatedParams?.id}:`,
      err
    );

    // Pastikan error yang dilempar memiliki pesan yang jelas
    if (
      err instanceof Error &&
      err.message.includes(
        "Cannot delete service with scheduled or ongoing sessions"
      )
    ) {
      res.status(400).json({
        message: err.message,
      });
    } else {
      // Untuk error lainnya, delegasikan ke error handling middleware
      next(err);
    }
  }
};

export const exportMentoringServicesController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { format } = req.validatedQuery!;

    if (!format || (format !== "csv" && format !== "excel")) {
      res.status(400).json({ message: "Invalid format. Use 'csv' or 'excel'" });
      return;
    }

    const file = await MentorServiceService.exportMentoringServicesToFile(
      format
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${file.filename}`
    );
    res.setHeader("Content-Type", file.mimetype);

    res.send(file.buffer);
  } catch (err) {
    next(err);
  }
};

export const getMentoringServicesByMentorController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const mentorId = req.user?.userId; // Mendapatkan mentorId dari user yang sudah login

    if (!mentorId) {
      res.status(400).json({ message: "Mentor ID not found in the request" });
      return;
    }

    // Ambil semua mentoring services yang terkait dengan mentor
    const services = await MentorServiceService.getMentoringServicesByMentor(
      mentorId
    );

    // Mengembalikan response dengan data mentoring services
    res.status(200).json({
      success: true,
      data: services,
    });
    return;
  } catch (err) {
    next(err); // Mengarahkan error ke middleware error handling
  }
};

export const getMentoringServiceDetailForMentorController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: serviceId } = req.validatedParams!;
    const { userId } = req.user!;

    const detail =
      await MentorServiceService.getMentoringServiceDetailForMentor(
        serviceId,
        userId
      );

    if (!detail) {
      res.status(404).json({
        message: "Service not found or you are not authorized to view it.",
      });
      return;
    }

    res.status(200).json({ data: detail });
    return;
  } catch (error) {
    console.error(
      "Error in getMentoringServiceDetailForMentorController:",
      error
    );
    next(error);
  }
};

export const getPublicMentoringServicesController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      expertise,
    } = req.validatedQuery || {};

    const result = await MentorServiceService.getPublicMentoringServices(
      Number(page),
      Number(limit),
      search,
      expertise
    );

    res.status(200).json({
      data: result.data,
      pagination: {
        totalData: result.totalData,
        totalPage: result.totalPage,
        currentPage: result.currentPage,
      },
    });
  } catch (error) {
    console.error("Error in getPublicMentoringServicesController:", error);
    next(error);
  }
};

export const getPublicMentoringServiceDetailController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams!;

    const data = await MentorServiceService.getPublicMentoringServiceDetail(id);

    if (!data) {
      res
        .status(404)
        .json({ message: "Mentoring service not found or not accessible" });
      return;
    }

    res.status(200).json({ data });
  } catch (error) {
    console.error("Error in getPublicMentoringServiceDetailController:", error);
    next(error);
  }
};
