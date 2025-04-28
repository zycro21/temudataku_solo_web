import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestPractice } from "../middlewares/authenticate";
import { format } from "date-fns";
import { HttpError } from "../utils/httpError";
import * as PracticeService from "../services/practice.service";
import { PrismaClient, Prisma } from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export const createPractice = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { validatedBody } = req;

    if (!validatedBody) {
      res.status(400).json({
        success: false,
        message: "Data request body tidak valid",
      });
      return;
    }

    const { mentorId, title, price, thumbnailImages, ...otherFields } =
      validatedBody;

    // Jika ada file, kita simpan array dari path gambar
    const uploadedImages = req.files
      ? (req.files as Express.Multer.File[]).map(
          (file) => `/images/thumbnailPractice/${file.filename}`
        )
      : [];

    // Pastikan `mentorId`, `title`, dan `price` ada (karena wajib)
    if (!mentorId || !title || !price) {
      res.status(400).json({
        success: false,
        message: "Mentor ID, Title, dan Price wajib diisi",
      });
      return;
    }

    const result = await PracticeService.createPractice({
      mentorId,
      title,
      price,
      thumbnailImages: uploadedImages, // Simpan array thumbnail images
      ...otherFields,
    });

    res.status(201).json({
      success: true,
      message: "Practice berhasil dibuat",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePractice = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;
    const updates = req.validatedBody!;
    const uploadedImages = req.files
      ? (req.files as Express.Multer.File[]).map(
          (file) => `/images/thumbnailPractice/${file.filename}`
        )
      : [];

    const updatedPractice = await PracticeService.updatePractice(
      id,
      updates,
      uploadedImages
    );

    res.status(200).json({
      success: true,
      message: "Practice berhasil diperbarui",
      data: updatedPractice,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminPracticeList = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ambil query yang sudah divalidasi
    const query = req.validatedQuery;

    // Memanggil service untuk mendapatkan daftar practice
    const practices = await PracticeService.getAdminPracticeList(query);

    res.status(200).json({
      success: true,
      message: "Daftar practice berhasil diambil",
      data: practices,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminPracticeDetail = async (
  req: AuthenticatedRequestPractice, // Use the custom request type
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the practice ID from the request params
    const { id } = req.params;

    // Call the service to get the practice details
    const practice = await PracticeService.getPracticeById(id);

    if (!practice) {
      res.status(404).json({
        success: false,
        message: "Practice not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Practice details fetched successfully",
      data: practice,
    });
    return;
  } catch (err) {
    next(err); // Pass any errors to the error handling middleware
  }
};

export const deleteAdminPractice = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Optional: Add a query param to decide between soft and hard delete
    const { hardDelete } = req.query;

    const practice = await PracticeService.getPracticeById(id);

    if (!practice) {
      res.status(404).json({
        success: false,
        message: "Practice not found",
      });
      return;
    }

    if (hardDelete === "true") {
      // Perform hard delete (remove the practice permanently)
      await PracticeService.deletePracticeHard(id);
      res.status(200).json({
        success: true,
        message: "Practice deleted successfully",
      });
      return;
    } else {
      // Perform soft delete (mark as inactive)
      await PracticeService.deletePracticeSoft(id);
      res.status(200).json({
        success: true,
        message: "Practice deactivated successfully",
      });
      return;
    }
  } catch (err) {
    next(err);
  }
};

export const getMentorPractices = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const mentorId = req.user?.mentorProfileId;

    if (!mentorId) {
      res.status(403).json({
        success: false,
        message: "Unauthorized: Mentor profile not found",
      });
      return;
    }

    const { page, limit, sortBy, sortOrder, search } = req.validatedQuery;

    const result = await PracticeService.getPracticesByMentorId(mentorId, {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
    });

    res.status(200).json({
      success: true,
      message: "Practices fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
};

export const getPracticeDetail = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;
    const mentorId = req.user?.mentorProfileId;

    const practice = await PracticeService.getPracticeDetailByMentor(
      id,
      mentorId
    );

    if (!practice) {
      res.status(404).json({
        success: false,
        message: "Practice tidak ditemukan atau bukan milikmu",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Detail practice berhasil diambil",
      data: practice,
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicPractices = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.validatedQuery!;
    const result = await PracticeService.getPublicPractices(query);

    res.status(200).json({
      success: true,
      message: "Daftar course berhasil diambil",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getPracticePreview = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Call service to get the practice details
    const practice = await PracticeService.getPracticePreview(id);

    if (!practice) {
      res.status(404).json({
        success: false,
        message: "Course not found",
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Course details fetched successfully",
      data: practice,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const createPracticeMaterialController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: practiceId } = req.validatedParams || {};
    const { title, description, status, startDate, endDate } =
      req.validatedBody || {};

    if (!practiceId || !title) {
      res.status(400).json({
        success: false,
        message: "Practice ID and Title are required",
      });
      return;
    }

    const material = await PracticeService.createPracticeMaterialService({
      practiceId,
      title,
      description,
      status,
      startDate,
      endDate,
    });

    res.status(201).json({
      success: true,
      message: "Practice material created successfully",
      data: material,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePracticeMaterialController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: practiceId, materialId } = req.validatedParams || {};
    const { title, description, status, startDate, endDate } =
      req.validatedBody || {};

    const updatedMaterial = await PracticeService.updatePracticeMaterialService(
      {
        practiceId,
        materialId,
        title,
        description,
        status,
        startDate,
        endDate,
      }
    );

    res.status(200).json({
      success: true,
      message: "Practice material updated successfully",
      data: updatedMaterial,
    });
  } catch (err) {
    next(err);
  }
};

export const deletePracticeMaterialController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: practiceId, materialId } = req.validatedParams;

    await PracticeService.deletePracticeMaterialService({
      practiceId,
      materialId,
    });

    res.status(200).json({
      success: true,
      message: "Practice material deleted successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const uploadPracticeFileController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { materialId, fileName } = req.validatedBody || {};
    const file = req.file;

    if (!file) {
      throw new Error("No file uploaded");
    }

    if (!materialId || !fileName) {
      throw new Error("Material ID and File Name are required");
    }

    const filePath = `practiceFile/${file.filename}`;
    const fileType = file.originalname.split(".").pop()?.toLowerCase() || "";
    const fileSize = Math.round(file.size / (1024 * 1024)); // Convert bytes ke MB dibulatkan

    const result = await PracticeService.uploadPracticeFileService({
      materialId,
      fileName,
      filePath,
      fileType,
      fileSize,
    });

    res.status(201).json({
      success: true,
      message: "Practice file uploaded successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePracticeFileController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.validatedParams;
    const { fileName } = req.validatedBody as { fileName: string };

    const updatedFile = await PracticeService.updatePracticeFile(
      fileId,
      fileName
    );

    res.status(200).json({
      success: true,
      message: "Practice file name updated successfully",
      data: updatedFile,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePracticeFileController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.validatedParams;

    await PracticeService.deletePracticeFile(fileId);

    res.status(200).json({
      success: true,
      message: "Practice file deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getPracticeFilesByMaterialController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { materialId } = req.validatedParams;
    const { mentorProfileId, roles, userId } = req.user!;

    const page = parseInt(req.validatedQuery.page as string) || 1;
    const limit = parseInt(req.validatedQuery.limit as string) || 10;

    if (!materialId) {
      res.status(400).json({
        success: false,
        message: "Material ID is required",
      });
      return;
    }

    // Call service langsung
    const { practiceFiles, totalFiles, totalPages } =
      await PracticeService.getPracticeFilesByMaterialService({
        materialId,
        page,
        limit,
        user: { userId, roles, mentorProfileId },
      });

    if (!practiceFiles.length) {
      res.status(404).json({
        success: false,
        message: "No practice files found for this material",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Practice files fetched successfully",
      data: practiceFiles,
      pagination: {
        currentPage: page,
        totalPages,
        totalFiles,
        pageSize: limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPracticeMaterialsController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;
    const { userId, roles, mentorProfileId } = req.user!;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { materials, totalItems, totalPages } =
      await PracticeService.getPracticeMaterialsService(
        id,
        {
          userId,
          roles,
          mentorProfileId,
        },
        page,
        limit
      );

    res.status(200).json({
      success: true,
      message: "Materials fetched successfully",
      data: materials,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        pageSize: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPracticeMaterialDetailController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, materialId } = req.validatedParams;
    const { userId, roles, mentorProfileId } = req.user!;

    const materialDetail =
      await PracticeService.getPracticeMaterialDetailService(id, materialId, {
        userId,
        roles,
        mentorProfileId,
      });

    res.status(200).json({
      success: true,
      message: "Practice material detail fetched successfully",
      data: materialDetail,
    });
  } catch (error) {
    next(error);
  }
};

export const createPracticePurchaseController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const practiceId = req.validatedBody?.practiceId!;

    const newPurchase = await PracticeService.createPracticePurchase({
      userId,
      practiceId,
    });

    res.status(201).json({
      success: true,
      message: "Practice purchase created successfully",
      data: newPurchase,
    });
  } catch (err) {
    next(err);
  }
};

export const cancelPracticePurchaseController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const { id } = req.validatedParams;

    const cancelledPurchase = await PracticeService.cancelPracticePurchase({
      userId,
      practicePurchaseId: id,
    });

    res.status(200).json({
      success: true,
      message: "Practice purchase cancelled successfully",
      data: cancelledPurchase,
    });
  } catch (err) {
    next(err);
  }
};

export const getPracticePurchasesController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const { page, limit, status, search } = req.validatedQuery;

    const purchases = await PracticeService.getPracticePurchases({
      userId,
      page,
      limit,
      status,
      search,
    });

    res.status(200).json({
      success: true,
      message: "Practice purchases fetched successfully",
      data: purchases,
    });
  } catch (err) {
    next(err);
  }
};

export const getPracticePurchaseDetailController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const { id } = req.validatedParams; // validated dari schema

    const purchase = await PracticeService.getPracticePurchaseDetail({
      id,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Practice purchase detail fetched successfully",
      data: purchase,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllPracticePurchasesController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await PracticeService.getAllPracticePurchasesService(
      req.validatedQuery
    );
    res.status(200).json({
      success: true,
      message: "Successfully fetched practice purchases",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminPracticePurchaseDetailController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams; // ambil dari validatedParams
    const data = await PracticeService.getPracticePurchaseDetailService(id);

    res.status(200).json({
      success: true,
      message: "Successfully fetched practice purchase detail",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePracticePurchaseStatusController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;
    const status = req.validatedBody?.status as string;

    const updatedPurchase =
      await PracticeService.updatePracticePurchaseStatusService(id, status);

    res.status(200).json({
      success: true,
      message: "Successfully updated practice purchase status",
      data: updatedPurchase,
    });
  } catch (error) {
    next(error);
  }
};

export const exportPracticePurchasesController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { format } = req.validatedQuery;
    const buffer = await PracticeService.exportPracticePurchasesService(format);

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}_${now
      .getHours()
      .toString()
      .padStart(2, "0")}-${now.getMinutes().toString().padStart(2, "0")}-${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    const fileName = `practice-purchases-${formattedDate}.${
      format === "csv" ? "csv" : "xlsx"
    }`;

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader(
      "Content-Type",
      format === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export const createOrUpdatePracticeProgressController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { materialId, userId, isCompleted, timeSpentSeconds } =
      req.validatedBody ?? {};
    const currentUser = req.user!; // dari authenticate middleware

    const result = await PracticeService.createOrUpdatePracticeProgressService({
      materialId: materialId!,
      userId,
      isCompleted,
      timeSpentSeconds,
      currentUserId: currentUser.userId,
      currentUserRole: currentUser.roles, // ini array string
      currentUserMentorProfileId: currentUser.mentorProfileId,
    });

    res.status(200).json({
      success: true,
      message: "Successfully created or updated practice progress",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePracticeProgressController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedBody = req.validatedBody;

    if (!validatedBody) {
      throw new Error("Request body is missing.");
    }

    const { isCompleted, timeSpentSeconds, lastAccessed } = validatedBody;
    const user = req.user!;

    const updatedProgress = await PracticeService.updatePracticeProgress({
      id,
      data: { isCompleted, timeSpentSeconds, lastAccessed },
      user,
    });

    res.status(200).json({
      success: true,
      message: "Practice progress updated successfully",
      data: updatedProgress,
    });
    return;
  } catch (err) {
    next(err);
  }
};

export const getAllPracticeProgressController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search } = req.validatedQuery as {
      page: number;
      limit: number;
      search?: string;
    };

    const progressList = await PracticeService.getAllPracticeProgressService({
      page,
      limit,
      search,
      user: req.user!, // Kirim user untuk otorisasi
    });

    res.json({
      success: true,
      message: "Successfully retrieved practice progress list.",
      data: progressList,
    });
  } catch (err) {
    next(err);
  }
};

export const getPracticeProgressByIdController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams as { id: string };

    const progress = await PracticeService.getPracticeProgressByIdService({
      id,
      user: req.user!,
    });

    res.json({
      success: true,
      message: "Successfully retrieved practice progress.",
      data: progress,
    });
  } catch (err) {
    next(err);
  }
};

export const deletePracticeProgressController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams as { id: string };

    await PracticeService.deletePracticeProgressService({
      id,
      user: req.user!,
    });

    res.status(200).json({
      success: true,
      message: "Practice progress deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

export const createPracticeReviewController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { practiceId, rating, comment } = req.validatedBody as {
      practiceId: string;
      rating: number;
      comment?: string;
    };

    const review = await PracticeService.createPracticeReviewService({
      practiceId,
      rating,
      comment,
      user: req.user!,
    });

    res.status(201).json({
      success: true,
      message: "Practice review created successfully.",
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePracticeReviewController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams as { id: string };
    const { comment } = req.validatedBody as { comment?: string };

    const review = await PracticeService.updatePracticeReviewService({
      id,
      comment,
      user: req.user!,
    });

    res.status(200).json({
      success: true,
      message: "Practice review updated successfully.",
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserPracticeReviewsController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams as { id: string };
    const { page, limit } = req.validatedQuery as {
      page: number;
      limit: number;
    };

    const reviews = await PracticeService.getUserPracticeReviewsService({
      userId: id,
      page,
      limit,
      user: req.user!,
    });

    res.status(200).json({
      success: true,
      message: "Successfully retrieved user practice reviews.",
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

export const getPracticeReviewsController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams as { id: string };
    const { page, limit } = req.validatedQuery as {
      page: number;
      limit: number;
    };

    const reviews = await PracticeService.getPracticeReviewsService({
      practiceId: id,
      page,
      limit,
      user: req.user!,
    });

    res.status(200).json({
      success: true,
      message: "Successfully retrieved practice reviews.",
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAdminPracticeReviewController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams as { id: string };
    const { comment, rating } = req.validatedBody as {
      comment?: string;
      rating?: number;
    };

    const review = await PracticeService.updateAdminPracticeReviewService({
      id,
      comment,
      rating,
      user: req.user!,
    });

    res.status(200).json({
      success: true,
      message: "Practice review updated successfully by admin.",
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAdminPracticeReviewController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams as { id: string };

    await PracticeService.deleteAdminPracticeReviewService({
      id,
      user: req.user!,
    });

    res.status(200).json({
      success: true,
      message: "Practice review deleted successfully by admin.",
    });
  } catch (err) {
    next(err);
  }
};

export const getAllAdminPracticeReviewsController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page,
      limit,
      search,
      practiceId,
      userId,
      rating,
      startDate,
      endDate,
    } = req.validatedQuery as {
      page: number;
      limit: number;
      search?: string;
      practiceId?: string;
      userId?: string;
      rating?: number;
      startDate?: Date;
      endDate?: Date;
    };

    const reviews = await PracticeService.getAllAdminPracticeReviewsService({
      page,
      limit,
      search,
      practiceId,
      userId,
      rating,
      startDate,
      endDate,
      user: req.user!,
    });

    res.status(200).json({
      success: true,
      message: "Successfully retrieved all practice reviews.",
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminPracticeReviewByIdController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams as { id: string };

    const review = await PracticeService.getAdminPracticeReviewByIdService({
      id,
      user: req.user!,
    });

    res.status(200).json({
      success: true,
      message: "Successfully retrieved practice review.",
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

export const exportAdminPracticeReviewsController = async (
  req: AuthenticatedRequestPractice,
  res: Response,
  next: NextFunction
) => {
  try {
    const { format, search, practiceId, userId, rating, startDate, endDate } =
      req.validatedQuery as {
        format: "csv" | "excel";
        search?: string;
        practiceId?: string;
        userId?: string;
        rating?: number;
        startDate?: Date;
        endDate?: Date;
      };

    const { buffer, fileName } =
      await PracticeService.exportAdminPracticeReviewsService({
        format,
        search,
        practiceId,
        userId,
        rating,
        startDate,
        endDate,
        user: req.user!,
      });

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader(
      "Content-Type",
      format === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};
