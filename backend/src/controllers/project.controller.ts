import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestProject } from "../middlewares/authenticate";
import { format } from "date-fns";
import { HttpError } from "../utils/httpError";
import * as ProjectService from "../services/project.service";
import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient();

export const createProjectHandler = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const { serviceId, title, description } = req.validatedBody;
    const user = req.user!;

    const project = await ProjectService.createProject({
      serviceId,
      title,
      description,
      userId: user.userId,
      roles: user.roles,
    });

    res.status(201).json({
      message: "Project berhasil dibuat",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProjectHandler = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;
    const { title, description } = req.validatedBody;
    const user = req.user!;

    const { noChange, project } = await ProjectService.updateProject({
      projectId: id,
      title,
      description,
      userId: user.userId,
      roles: user.roles,
    });

    if (noChange) {
      res.status(200).json({
        message: "Tidak ada perubahan dilakukan",
        data: project,
      });
      return;
    }

    res.status(200).json({
      message: "Project berhasil diperbarui",
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProjectHandler = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;

    await ProjectService.deleteProject(id);

    res.status(200).json({
      message: "Project berhasil dihapus",
    });
  } catch (err) {
    next(err);
  }
};

export const getAllProjectsHandler = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      serviceId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const result = await ProjectService.getAllProjects({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      serviceId: serviceId as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
    });

    res.status(200).json({
      message: "Daftar proyek berhasil diambil",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getProjectDetailHandler = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;

    const projectDetail = await ProjectService.getProjectDetail(id);

    res.status(200).json({
      message: "Detail proyek berhasil diambil",
      data: projectDetail,
    });
  } catch (err) {
    next(err);
  }
};

export const getMentorProjectService = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const { page = "1", limit = "10" } = req.validatedQuery;
    const currentPage = parseInt(page, 10);
    const perPage = parseInt(limit, 10);

    const result = await ProjectService.getMentorProjects(
      userId,
      currentPage,
      perPage
    );

    res.status(200).json({
      message: "Daftar proyek berhasil diambil",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const getMentorProjectDetail = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const projectId = req.params.id;

    const project = await ProjectService.getMentorProjectDetail(
      userId,
      projectId
    );

    res.status(200).json({
      message: "Detail proyek berhasil diambil",
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

export const getMenteeProjects = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const {
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = "1",
      limit = "10",
    } = req.query as any;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const data = await ProjectService.getMenteeProjects({
      userId,
      search,
      sortBy,
      sortOrder,
      page: pageNum,
      limit: limitNum,
    });

    res.status(200).json({
      message: "Daftar proyek berhasil diambil",
      ...data,
    });
  } catch (err) {
    next(err);
  }
};

export const getMenteeProjectDetail = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const projectId = req.params.id;

    const project = await ProjectService.getMenteeProjectDetail({
      userId,
      projectId,
    });

    res.status(200).json({
      message: "Detail proyek berhasil diambil",
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

export const exportProjects = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const { format } = req.query as { format: "csv" | "excel" };

    const { buffer, fileName, contentType } =
      await ProjectService.exportProjects({ format });

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", contentType);
    res.status(200).send(buffer);
  } catch (err) {
    next(err);
  }
};

export const submitProject = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: projectId } = req.validatedParams;
    const { sessionId } = req.validatedBody;
    const menteeId = req.user?.userId!;

    // Cek kalau multiple files diupload
    const uploadedFiles = req.files as Express.Multer.File[] | undefined;
    if (!uploadedFiles || uploadedFiles.length === 0) {
      throw new Error("Harus mengirim minimal satu file.");
    }

    // Gunakan path relatif: submissions/filename.ext
    const filePaths = uploadedFiles.map((file) =>
      path.join("submissions", file.filename).replace(/\\/g, "/")
    );

    const submission = await ProjectService.submit({
      projectId,
      menteeId,
      filePaths,
      sessionId,
    });

    res.status(201).json({
      message: "Submit submission berhasil",
      data: {
        submission,
        plagiarismScore: submission.plagiarismScore,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const reviewSubmission = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const submission = await ProjectService.reviewSubmission({
      submissionId: req.params.id,
      mentorId: req.user?.mentorProfileId, // untuk validasi
      userId: req.user?.userId, // untuk simpan ke gradedBy
      role: req.user?.roles,
      ...req.validatedBody,
    });

    res.status(200).json({
      message: "Penilaian berhasil diberikan",
      data: submission,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getAdminSubmissions = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search,
      projectId,
      serviceId,
      isReviewed,
      sortBy = "submissionDate",
      sortOrder = "desc",
      page = "1",
      limit = "10",
    } = req.validatedQuery;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const sortFieldMap: Record<string, string> = {
      score: "Score",
      submissionDate: "submissionDate",
      createdAt: "createdAt",
    };

    const normalizedSortBy = sortFieldMap[sortBy] || "submissionDate";

    const data = await ProjectService.getAdminSubmissions({
      search,
      projectId,
      serviceId,
      isReviewed:
        isReviewed === "true"
          ? true
          : isReviewed === "false"
          ? false
          : undefined,
      sortBy: normalizedSortBy,
      sortOrder,
      page: pageNum,
      limit: limitNum,
    });

    res.status(200).json({
      message: "Daftar submission berhasil diambil",
      ...data,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminSubmissionDetail = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams;

    const data = await ProjectService.getAdminSubmissionDetail(id);

    if (!data) {
      res.status(404).json({
        success: false,
        message: "Submission tidak ditemukan",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Detail submission berhasil diambil",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const exportAdminSubmissions = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const { format } = req.validatedQuery;

    const { fileBuffer, filename, contentType } =
      await ProjectService.exportAdminSubmissions({ format });

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(fileBuffer);
  } catch (err) {
    next(err);
  }
};

export const getMentorProjectSubmissions = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = req.params.id;
    const mentorProfileId = req.user?.mentorProfileId;

    const submissions = await ProjectService.getMentorProjectSubmissionsService(
      {
        projectId,
        mentorProfileId,
      }
    );

    res.status(200).json({ success: true, data: submissions });
    return;
  } catch (err) {
    next(err);
  }
};

export const getMentorSubmissionDetail = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const submissionId = req.params.id;
    const mentorProfileId = req.user?.mentorProfileId;

    const submission = await ProjectService.getMentorSubmissionDetailService({
      submissionId,
      mentorProfileId,
    });

    res.status(200).json({ success: true, data: submission });
    return;
  } catch (err) {
    next(err);
  }
};

export const getMenteeSubmissions = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const menteeId = req.user?.userId; // ← sesuai interface kamu
    const { page = 1, limit = 10 } = req.validatedQuery as {
      page: number;
      limit: number;
    };

    const result = await ProjectService.getMenteeSubmissionsService({
      menteeId,
      page,
      limit,
    });

    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getMenteeSubmissionDetail = async (
  req: AuthenticatedRequestProject,
  res: Response,
  next: NextFunction
) => {
  try {
    const menteeId = req.user?.userId;
    const { id } = req.validatedParams as { id: string };

    const result = await ProjectService.getMenteeSubmissionDetailService({
      id,
      menteeId,
    });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
