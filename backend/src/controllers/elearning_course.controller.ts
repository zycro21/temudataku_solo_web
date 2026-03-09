import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequestElearning } from "../middlewares/authenticate.js";
import { ELearningCourseService } from "../services/elearning_course.service.js";

export const ELearningCourseController = {
  async getAllCourses(
    req: AuthenticatedRequestElearning,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery, user } = req;

      if (!validatedQuery || !user) {
        res.status(400).json({
          success: false,
          message: "Query atau user tidak valid",
        });
        return;
      }

      // cukup kirim validatedQuery + user ke service
      const result = await ELearningCourseService.getAllCourses(
        validatedQuery,
        user,
      );

      res.status(200).json({
        success: true,
        message: "Daftar kursus berhasil diambil",
        ...result,
      });
    } catch (err) {
      next(err);
    }
  },

  async getCourseById(
    req: AuthenticatedRequestElearning,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams?.id || !user) {
        res.status(400).json({
          success: false,
          message: "Parameter ID atau user tidak valid",
        });
        return;
      }

      const course = await ELearningCourseService.getCourseById(
        validatedParams.id,
        user,
      );

      if (!course) {
        res.status(404).json({
          success: false,
          message: "Kursus tidak ditemukan",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Detail kursus berhasil diambil",
        data: course,
      });
    } catch (err) {
      next(err);
    }
  },

  async createCourse(
    req: AuthenticatedRequestElearning,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedBody, user } = req;

      if (!validatedBody || !user) {
        res.status(400).json({
          success: false,
          message: "Data request tidak valid",
        });
        return;
      }

      // role yang diperlakukan seperti admin
      const adminLikeRoles = ["admin", "cm", "curdev"];

      // karena user bisa punya banyak role
      const isAdminLike = user.roles?.some((role) =>
        adminLikeRoles.includes(role),
      );

      if (!isAdminLike) {
        res.status(403).json({
          success: false,
          message: "Hanya admin/cm/curdev yang dapat membuat kursus",
        });
        return;
      }

      const uploadedImages = req.files
        ? (req.files as Express.Multer.File[]).map(
            (file) => `/images/elearningThumbnail/${file.filename}`,
          )
        : [];

      const result = await ELearningCourseService.createCourse({
        ...validatedBody,
        thumbnailImages: uploadedImages,
      });

      res.status(201).json({
        success: true,
        message: "Kursus berhasil dibuat",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateCourse(
    req: AuthenticatedRequestElearning,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedBody, validatedParams, user } = req;

      if (!validatedParams?.id || !user) {
        res.status(400).json({
          success: false,
          message: "Parameter ID atau user tidak valid",
        });
        return;
      }

      const uploadedImages = req.files
        ? (req.files as Express.Multer.File[]).map(
            (file) => `/images/elearningThumbnail/${file.filename}`,
          )
        : [];

      const updatedData = {
        ...validatedBody,
        ...(uploadedImages.length > 0 && { thumbnailImages: uploadedImages }),
      };

      const updatedCourse = await ELearningCourseService.updateCourse(
        validatedParams.id,
        updatedData,
        user,
      );

      res.status(200).json({
        success: true,
        message: "Kursus berhasil diperbarui",
        data: updatedCourse,
      });
    } catch (err) {
      next(err);
    }
  },

  async toggleStatus(
    req: AuthenticatedRequestElearning,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, validatedBody, user } = req;

      if (!validatedParams?.id || validatedBody?.isActive === undefined) {
        res.status(400).json({
          success: false,
          message: "Parameter ID atau body tidak valid",
        });
        return;
      }

      // Hanya admin yang bisa toggle, authorizeRoles sudah ngecek
      if (!user?.roles.includes("admin")) {
        res.status(403).json({
          success: false,
          message: "Akses ditolak: hanya admin yang bisa mengubah status",
        });
        return;
      }

      const updatedCourse = await ELearningCourseService.toggleCourseStatus(
        validatedParams.id,
        validatedBody.isActive, // sudah pasti boolean sekarang
      );

      if (!updatedCourse) {
        res.status(404).json({
          success: false,
          message: "Kursus tidak ditemukan",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Status kursus berhasil diperbarui menjadi ${
          validatedBody.isActive ? "aktif" : "nonaktif"
        }`,
        data: updatedCourse,
      });
      return;
    } catch (err) {
      next(err);
    }
  },

  async deleteCourse(
    req: AuthenticatedRequestElearning,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams?.id) {
        res.status(400).json({
          success: false,
          message: "Parameter ID tidak valid",
        });
        return;
      }

      const roles = user?.roles || [];

      // Role yang diperlakukan seperti admin
      const adminLikeRoles = ["admin", "cm", "curdev"];
      const isAdminLike = roles.some((role) => adminLikeRoles.includes(role));

      if (!isAdminLike) {
        res.status(403).json({
          success: false,
          message:
            "Akses ditolak: hanya admin, cm, atau curdev yang bisa menghapus kursus",
        });
        return;
      }

      const deletedCourse = await ELearningCourseService.deleteCourse(
        validatedParams.id,
      );

      if (!deletedCourse) {
        res.status(404).json({
          success: false,
          message: "Kursus tidak ditemukan",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Kursus berhasil dihapus",
        data: deletedCourse,
      });
      return;
    } catch (err: unknown) {
      next(err);
    }
  },

  async listCourses(
    req: AuthenticatedRequestElearning,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery } = req;

      const page = validatedQuery?.page ? parseInt(validatedQuery.page, 10) : 1;
      const limit = validatedQuery?.limit
        ? parseInt(validatedQuery.limit, 10)
        : 10;

      const filters = {
        category: validatedQuery?.category,
        level: validatedQuery?.level,
        mentorId: validatedQuery?.mentorId,
        search: validatedQuery?.search,
      };

      const courses = await ELearningCourseService.listCourses(
        filters,
        page,
        limit,
      );

      res.status(200).json({
        success: true,
        message: "Daftar kursus berhasil diambil",
        data: courses,
      });
      return;
    } catch (err) {
      next(err);
    }
  },

  async getCourseDetail(
    req: AuthenticatedRequestElearning,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams } = req;

      if (!validatedParams?.id) {
        res.status(400).json({
          success: false,
          message: "Parameter ID tidak valid",
        });
        return;
      }

      const course = await ELearningCourseService.getCourseDetail(
        validatedParams.id,
      );

      if (!course) {
        res.status(404).json({
          success: false,
          message: "Kursus tidak ditemukan",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Detail kursus berhasil diambil",
        data: course,
      });
    } catch (err) {
      next(err);
    }
  },

  async getCourseStatistics(
    req: AuthenticatedRequestElearning,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedParams, user } = req;

      if (!validatedParams?.id || !user) {
        res.status(400).json({
          success: false,
          message: "Parameter atau user tidak valid",
        });
        return;
      }

      const stats = await ELearningCourseService.getCourseStatistics(
        validatedParams.id,
        user,
      );

      if (!stats) {
        res.status(404).json({
          success: false,
          message: "Kursus tidak ditemukan atau Anda tidak berhak mengakses",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Statistik kursus berhasil diambil",
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  },

  async exportCourses(
    req: AuthenticatedRequestElearning,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { validatedQuery } = req;
      const format = validatedQuery?.format;

      if (!format || (format !== "csv" && format !== "excel")) {
        res.status(400).json({
          success: false,
          message: "Invalid format. Use 'csv' or 'excel'",
        });
        return;
      }

      const file = await ELearningCourseService.exportCoursesToFile(format);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${file.filename}`,
      );
      res.setHeader("Content-Type", file.mimetype);

      res.send(file.buffer);
    } catch (err) {
      next(err);
    }
  },

  async exportProductEvent(
    req: AuthenticatedRequestElearning,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { user } = req;

      if (!user?.userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const roles = user.roles || [];

      // role yang diperlakukan seperti admin
      const adminLikeRoles = ["admin", "cm", "curdev"];
      const isAdminLike = roles.some((role) => adminLikeRoles.includes(role));

      if (!isAdminLike) {
        res.status(403).json({
          success: false,
          message: "Akses ditolak: hanya admin, cm, atau curdev",
        });
        return;
      }

      const format = req.validatedQuery?.format;

      if (!format || (format !== "csv" && format !== "excel")) {
        res.status(400).json({
          success: false,
          message: "Invalid format. Use 'csv' or 'excel'",
        });
        return;
      }

      const file =
        await ELearningCourseService.exportProductEventToFile(format);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${file.filename}`,
      );
      res.setHeader("Content-Type", file.mimetype);

      res.send(file.buffer);
    } catch (err) {
      next(err);
    }
  },
};
