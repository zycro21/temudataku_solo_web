import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import { getClientIp } from "./network.js";

export const logActivity = async ({
  userId,
  action,
  type,
  description = "",
  req,
}: {
  userId: string;
  action: string;
  type?: string;
  description?: string;
  req: any;
}) => {
  try {
    await prisma.adminActivityLog.create({
      data: {
        userId,
        action,
        type,
        description,
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"] || null,
      },
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};
