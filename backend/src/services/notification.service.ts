import { PrismaClient, Prisma } from "@prisma/client";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import { format, parseISO, subDays } from "date-fns";
import { Buffer } from "buffer";
import { sendNotificationEmail } from "../utils/sendEmailVerification";
import { sendPushNotification } from "../utils/pushNotification";

const prisma = new PrismaClient();

interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  deliveryMethod?: "email" | "push" | "both" | null;
  actionUrl?: string | null;
  sentAt?: Date | null;
  meta?: Record<string, any> | null;
  targetRole?: string[] | null; // ✅ diubah jadi array
  createdAt?: Date | null;
  recipients: NotificationRecipient[];
}

interface NotificationRecipient {
  id: string;
  notificationId: string;
  userId: string;
  isRead: boolean | null;
  readAt?: Date | null;
  notification: Notification;
  user: User;
}

interface User {
  id: string;
  email: string;
}

// Utility function to transform JsonValue to Record<string, any> | null
const transformMeta = (meta: Prisma.JsonValue): Record<string, any> | null => {
  if (meta === null) return null;
  if (typeof meta === "object" && !Array.isArray(meta))
    return meta as Record<string, any>;
  return { value: meta }; // Wrap non-object values (string, number, boolean, array) in an object
};

export const createNotification = async (data: {
  type: string;
  title: string;
  message?: string;
  deliveryMethod: "email" | "push" | "both";
  actionUrl?: string;
  targetRole: string[];
  meta?: Record<string, any>;
}): Promise<Notification> => {
  // Daftar role yang valid
  const validRoles = ["admin", "mentee", "mentor", "affiliator"];

  // Filter targetRole untuk memastikan hanya berisi role yang valid
  const filteredTargetRole = data.targetRole.filter((role) =>
    validRoles.includes(role)
  );

  // Jika tidak ada role yang valid, lemparkan error
  if (filteredTargetRole.length === 0) {
    throw new Error("Target role tidak valid.");
  }

  // 1. Cari semua user yang punya role sesuai target
  const users = await prisma.user.findMany({
    where: {
      userRoles: {
        some: {
          role: {
            roleName: {
              in: filteredTargetRole, // Gunakan role yang sudah difilter
            },
          },
        },
      },
    },
  });

  if (!users.length) throw new Error("Tidak ada user dengan role tersebut.");

  const now = new Date();

  // 2. Buat notifikasi di tabel utama
  const notification = await prisma.notification.create({
    data: {
      type: data.type,
      title: data.title,
      message: data.message,
      deliveryMethod: data.deliveryMethod,
      actionUrl: data.actionUrl,
      targetRole: filteredTargetRole, // Gunakan role yang sudah difilter
      sentAt: now,
      meta: data.meta ?? {},
      recipients: {
        createMany: {
          data: users.map((user) => ({
            userId: user.id,
          })),
        },
      },
    },
    include: {
      recipients: {
        include: {
          notification: true,
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // 3. Kirim (jika perlu)
  for (const user of users) {
    if (data.deliveryMethod === "email" || data.deliveryMethod === "both") {
      sendNotificationEmail({
        to: user.email,
        subject: data.title,
        message: data.message ?? "",
        actionUrl: data.actionUrl,
      });
    }

    if (data.deliveryMethod === "push" || data.deliveryMethod === "both") {
      sendPushNotification({
        userId: user.id,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        meta: data.meta,
      });
    }
  }

  // Transform output to match Notification interface
  return {
    ...notification,
    deliveryMethod: notification.deliveryMethod as
      | "email"
      | "push"
      | "both"
      | null,
    meta: transformMeta(notification.meta), // Transform meta
    recipients: notification.recipients.map((recipient) => ({
      id: recipient.id,
      notificationId: recipient.notificationId,
      userId: recipient.userId,
      isRead: recipient.isRead ?? false,
      readAt: recipient.readAt,
      notification: {
        ...notification,
        deliveryMethod: notification.deliveryMethod as
          | "email"
          | "push"
          | "both"
          | null,
        meta: transformMeta(notification.meta), // Transform meta
        recipients: [], // Avoid circular reference
      },
      user: recipient.user,
    })),
  };
};

export const saveFcmToken = async (userId: string, fcmToken: string) => {
  try {
    // Simpan fcmToken ke database
    const user = await prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
    });
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to save FCM Token");
  }
};

export const getAdminNotifications = async (query: {
  page?: string;
  limit?: string;
  search?: string;
  deliveryMethod?: "email" | "push" | "both";
  targetRole?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const page = parseInt(query.page || "1");
  const limit = parseInt(query.limit || "10");
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (query.search) {
    whereClause.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { message: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.deliveryMethod) {
    whereClause.deliveryMethod = query.deliveryMethod;
  }

  if (query.targetRole) {
    whereClause.targetRole = {
      has: query.targetRole,
    };
  }

  if (query.startDate || query.endDate) {
    whereClause.sentAt = {};
    if (query.startDate) {
      whereClause.sentAt.gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      whereClause.sentAt.lte = endDate;
    }
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: whereClause,
      orderBy: { sentAt: "desc" },
      skip,
      take: limit,
      include: {
        recipients: {
          select: {
            id: true,
            isRead: true,
            userId: true,
          },
        },
      },
    }),
    prisma.notification.count({ where: whereClause }),
  ]);

  return {
    data: notifications,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const getNotificationDetailById = async (id: string) => {
  return await prisma.notification.findUnique({
    where: { id },
    include: {
      recipients: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePicture: true,
              userRoles: {
                include: {
                  role: {
                    select: {
                      roleName: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};

export const getRecipientsByNotificationId = async (notificationId: string) => {
  return await prisma.notificationRecipient.findMany({
    where: { notificationId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePicture: true,
          userRoles: {
            select: {
              role: {
                select: {
                  roleName: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      readAt: "asc", // Prioritaskan yang belum dibaca dulu
    },
  });
};

export const resendNotification = async (
  notificationId: string,
  userIds?: string[]
): Promise<{
  success: boolean;
  message: string;
  statusCode: number;
  data?: any;
}> => {
  // 1. Ambil notifikasi
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      recipients: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fcmToken: true,
            },
          },
        },
      },
    },
  });

  if (!notification) {
    return {
      success: false,
      message: "Notifikasi tidak ditemukan",
      statusCode: 404,
    };
  }

  const targetRecipients = notification.recipients
    .map((r) => r.user)
    .filter((user) => !userIds || userIds.includes(user.id));

  if (targetRecipients.length === 0) {
    return {
      success: false,
      message: "Penerima tidak ditemukan",
      statusCode: 404,
    };
  }

  const resentTo: string[] = [];

  for (const user of targetRecipients) {
    // Email
    if (
      notification.deliveryMethod === "email" ||
      notification.deliveryMethod === "both"
    ) {
      await sendNotificationEmail({
        to: user.email,
        subject: notification.title,
        message: notification.message ?? "",
        actionUrl: notification.actionUrl ?? undefined, // tambahin fallback ke undefined
      });
    }

    // Push
    if (
      notification.deliveryMethod === "push" ||
      notification.deliveryMethod === "both"
    ) {
      await sendPushNotification({
        userId: user.id,
        title: notification.title,
        message: notification.message ?? undefined, // ubah null jadi undefined
        actionUrl: notification.actionUrl ?? undefined,
        meta: transformMeta(notification.meta) ?? undefined, // ubah null jadi undefined
      });
    }

    resentTo.push(user.id);
  }

  // Update waktu dikirim ulang
  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      sentAt: new Date(),
    },
  });

  return {
    success: true,
    message: "Notifikasi berhasil dikirim ulang",
    statusCode: 200,
    data: {
      notificationId,
      resentTo,
    },
  };
};

export const exportNotifications = async (
  format: "excel" | "csv"
): Promise<{
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
}> => {
  const notifications = await prisma.notification.findMany({
    include: {
      recipients: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const flattened = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message ?? "",
    deliveryMethod: n.deliveryMethod ?? "",
    sentAt: n.sentAt?.toISOString() ?? "",
    targetRole: n.targetRole.join(", "),
    recipients: n.recipients
      .map((r) => `${r.user.fullName} <${r.user.email}>`)
      .join("; "),
    createdAt: n.createdAt?.toISOString() ?? "",
  }));

  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/T/, "_")
    .replace(/:/g, "-")
    .replace(/\..+/, "");
  const fileBaseName = `notifications-${timestamp}`;

  if (format === "csv") {
    const parser = new Parser();
    const csv = parser.parse(flattened);

    return {
      fileBuffer: Buffer.from(csv, "utf-8"),
      fileName: `${fileBaseName}.csv`,
      mimeType: "text/csv",
    };
  }

  // Excel
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Notifications");

  worksheet.columns = [
    { header: "ID", key: "id", width: 30 },
    { header: "Type", key: "type", width: 15 },
    { header: "Title", key: "title", width: 30 },
    { header: "Message", key: "message", width: 40 },
    { header: "Delivery Method", key: "deliveryMethod", width: 15 },
    { header: "Sent At", key: "sentAt", width: 20 },
    { header: "Target Role", key: "targetRole", width: 20 },
    { header: "Recipients", key: "recipients", width: 50 },
    { header: "Created At", key: "createdAt", width: 20 },
  ];

  worksheet.addRows(flattened);

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    fileBuffer: Buffer.from(buffer),
    fileName: `${fileBaseName}.xlsx`,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
};

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
) => {
  const recipient = await prisma.notificationRecipient.findUnique({
    where: {
      notificationId_userId: {
        notificationId,
        userId,
      },
    },
  });

  if (!recipient) {
    throw new Error("Notification not found for this user");
  }

  if (recipient.isRead) return; // sudah dibaca, skip update

  await prisma.notificationRecipient.update({
    where: {
      notificationId_userId: {
        notificationId,
        userId,
      },
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  // Cek apakah masih ada notifikasi yang belum dibaca
  const unreadCount = await prisma.notificationRecipient.count({
    where: {
      userId,
      isRead: false,
    },
  });

  if (unreadCount === 0) {
    throw new Error("All notifications already read");
  }

  // Update semua notifikasi yang belum dibaca
  await prisma.notificationRecipient.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

export const getAllNotificationsByUser = async ({
  userId,
  page,
  limit,
  sortBy,
  sortOrder,
  isRead,
  type,
  search,
}: {
  userId: string;
  page: number;
  limit: number;
  sortBy: "createdAt" | "sentAt";
  sortOrder: "asc" | "desc";
  isRead?: boolean;
  type?: string;
  search?: string;
}) => {
  const skip = (page - 1) * limit;

  const where: Prisma.NotificationRecipientWhereInput = {
    userId,
    ...(isRead !== undefined && { isRead }),
    notification: {
      ...(type && {
        type: {
          contains: type,
          mode: "insensitive",
        },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { message: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
  };

  const [notifications, total] = await Promise.all([
    prisma.notificationRecipient.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        notification: {
          [sortBy]: sortOrder,
        },
      },
      include: {
        notification: true,
      },
    }),
    prisma.notificationRecipient.count({ where }),
  ]);

  return {
    data: notifications,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUnreadNotificationCount = async (
  userId: string
): Promise<number> => {
  return prisma.notificationRecipient.count({
    where: {
      userId,
      isRead: false,
    },
  });
};
