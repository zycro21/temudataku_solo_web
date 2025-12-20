import { Request, Response, NextFunction } from "express";
import {
  getAllWithdrawalMethods,
  getWithdrawalMethodById,
  createWithdrawalMethod,
  updateWithdrawalMethod,
  removeWithdrawalMethod,
  exportWithdrawal,
  toggleWithdrawalStatus,
  getAdminWithdrawals,
} from "../services/withdrawal.service.js";
import {
  AuthenticatedRequest,
  AuthenticatedRequestWithdrawal,
} from "../middlewares/authenticate.js";
import { format as formatDate, subDays } from "date-fns";
import { logActivity } from "../utils/logActivtiy.js";

export const getAllWithdrawal = async (
  req: AuthenticatedRequestWithdrawal,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const roles = req.user?.roles || [];

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;

    const result = await getAllWithdrawalMethods(userId, roles, page, limit);

    res.json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getWithdrawalById = async (
  req: AuthenticatedRequestWithdrawal,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId!;
    const roles = req.user?.roles || [];
    const id = req.validatedParams!.id as string;

    const method = await getWithdrawalMethodById(userId, roles, id);

    res.json({ success: true, data: method });
  } catch (err) {
    next(err);
  }
};

export const createWithdrawal = async (
  req: AuthenticatedRequestWithdrawal,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const rolesLog = req.user?.roles || [];
    const adminId = req.user?.userId;

    const roles = req.user?.roles || [];
    let targetUserId: string;

    if (roles.includes("admin")) {
      // Admin boleh tentuin userId target
      if (!req.body.userId) {
        res.status(400).json({
          success: false,
          message:
            "userId is required when creating withdrawal method as admin",
        });
        return;
      }
      targetUserId = req.body.userId;
    } else if (roles.includes("affiliator")) {
      // Affiliator hanya bisa untuk dirinya sendiri
      targetUserId = req.user!.userId;
    } else {
      res.status(403).json({
        success: false,
        message:
          "Forbidden: only admin or affiliator can create withdrawal methods",
      });
      return;
    }

    const method = await createWithdrawalMethod(targetUserId, req.body);

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: req.user!.userId,
        action: "CREATE_WITHDRAWAL_METHOD",
        type: "CREATE",
        description: `Admin created withdrawal method for user ${targetUserId} (ID: ${method.id})`,
        req,
      });
    }

    res.status(201).json({ success: true, data: method });
  } catch (err) {
    next(err);
  }
};

export const updateWithdrawal = async (
  req: AuthenticatedRequestWithdrawal,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const rolesLog = req.user?.roles || [];
    const adminId = req.user?.userId;

    const userId = req.user?.userId!;
    const roles = req.user?.roles || [];
    const id = req.validatedParams!.id as string;
    const body = req.validatedBody!;

    const method = await updateWithdrawalMethod(userId, roles, id, body);

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId,
        action: "UPDATE_WITHDRAWAL_METHOD",
        type: "UPDATE",
        description: `Admin updated withdrawal method ${id}`,
        req,
      });
    }

    res.json({ success: true, data: method });
  } catch (err) {
    next(err);
  }
};

export const removeWithdrawal = async (
  req: AuthenticatedRequestWithdrawal,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const rolesLog = req.user?.roles || [];
    const adminId = req.user?.userId;

    const userId = req.user?.userId!;
    const roles = req.user?.roles || [];
    const id = req.validatedParams!.id as string;

    await removeWithdrawalMethod(userId, roles, id);

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId,
        action: "DELETE_WITHDRAWAL_METHOD",
        type: "DELETE",
        description: `Admin deleted withdrawal method ${id}`,
        req,
      });
    }

    res.json({ success: true, message: "Withdrawal method deleted" });
  } catch (err) {
    next(err);
  }
};

export const exportWithdrawalData = async (
  req: AuthenticatedRequestWithdrawal,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const rolesLog = req.user?.roles || [];
    const adminId = req.user?.userId;

    const format = req.query.format as "csv" | "excel";

    const buffer = await exportWithdrawal({ format });

    const timestamp = formatDate(new Date(), "yyyyMMdd-HHmmss");
    const filename = `withdrawals-${timestamp}.${
      format === "csv" ? "csv" : "xlsx"
    }`;

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: adminId!,
        action: "EXPORT_WITHDRAWAL",
        type: "EXPORT",
        description: `Exported withdrawal file in format ${format}`,
        req,
      });
    }

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader(
      "Content-Type",
      format === "csv"
        ? "text/csv"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    res.status(status).json({ success: false, message });
  }
};

export const toggleWithdrawalStatusController = async (
  req: AuthenticatedRequestWithdrawal,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: "Unauthorized. User ID not found." });
      return;
    }
    const rolesLog = req.user?.roles || [];
    const adminId = req.user?.userId;

    const { id } = req.validatedParams ?? {};
    const { isActive } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Withdrawal method ID is required",
      });
      return;
    }

    if (typeof isActive !== "boolean") {
      res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const updated = await toggleWithdrawalStatus({
      id,
      userId: req.user.userId,
      role: req.user.roles.includes("admin") ? "admin" : "affiliator",
      isActive,
    });

    if (rolesLog.includes("admin") && adminId) {
      await logActivity({
        userId: req.user.userId,
        action: isActive
          ? "ACTIVATE_WITHDRAWAL_METHOD"
          : "DEACTIVATE_WITHDRAWAL_METHOD",
        type: "withdrawal",
        description: `Admin set withdrawal ${id} to ${
          isActive ? "active" : "inactive"
        }`,
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: `Withdrawal method ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      data: updated,
    });
    return;
  } catch (error: any) {
    if (error.message.includes("not found")) {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    if (error.message.includes("Forbidden")) {
      res.status(403).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
    return;
  }
};

export const getAdminWithdrawalsController = async (
  req: AuthenticatedRequestWithdrawal,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, sortBy, order, providerName, type, isActive } =
      req.query as any;

    const result = await getAdminWithdrawals({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sortBy: sortBy as string,
      order: (order as "asc" | "desc") || "desc",
      providerName: providerName as string | undefined,
      type: type as string | undefined,
      isActive: isActive as unknown as boolean | undefined,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
    return;
  } catch (err) {
    next(err);
  }
};
