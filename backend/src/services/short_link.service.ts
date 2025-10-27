import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function generateRandomShortCode(len = 6) {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

async function ensureUniqueShortCode(candidate: string) {
  const existing = await prisma.shortLink.findUnique({
    where: { shortCode: candidate },
  });
  return !existing;
}

export const createShortLinkService = async ({
  originalUrl,
  shortCode,
  expiresAt,
  isActive,
  createdById,
}: {
  originalUrl: string;
  shortCode?: string;
  expiresAt?: Date;
  isActive?: boolean;
  createdById?: string | null;
}) => {
  // Jika custom shortCode disediakan, cek keunikan
  if (shortCode) {
    const exists = await prisma.shortLink.findUnique({ where: { shortCode } });
    if (exists) throw new Error("shortCode already taken");
  } else {
    // Auto generate unique code
    let attempts = 0;
    let candidate = generateRandomShortCode(6);
    while (!(await ensureUniqueShortCode(candidate)) && attempts < 6) {
      candidate = generateRandomShortCode(6);
      attempts++;
    }
    if (!(await ensureUniqueShortCode(candidate))) {
      throw new Error("Failed to generate unique short code, try again");
    }
    shortCode = candidate;
  }

  // Default expire = 15 hari
  const defaultExpiresAt = new Date();
  defaultExpiresAt.setDate(defaultExpiresAt.getDate() + 15);

  const created = await prisma.shortLink.create({
    data: {
      shortCode,
      originalUrl,
      createdById: createdById || null,
      expiresAt: expiresAt || defaultExpiresAt,
      isActive: typeof isActive === "boolean" ? isActive : true,
    },
  });

  return created;
};

export const getAllShortLinksService = async ({
  search,
  sort_by,
  order,
}: {
  search?: string;
  sort_by?: string;
  order?: string;
}) => {
  const where: Prisma.ShortLinkWhereInput = {};

  if (search) {
    where.OR = [
      { shortCode: { contains: search, mode: "insensitive" } },
      { originalUrl: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: any = {};
  orderBy[sort_by || "createdAt"] = order === "asc" ? "asc" : "desc";

  const data = await prisma.shortLink.findMany({
    where,
    orderBy,
    include: {
      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return data;
};

export const getMyShortLinksService = async ({
  userId,
  page,
  limit,
  search,
  sort_by,
  order,
}: {
  userId: string;
  page: number;
  limit: number;
  search?: string;
  sort_by?: string;
  order?: string;
}) => {
  const skip = (page - 1) * limit;
  const take = limit;

  const where: Prisma.ShortLinkWhereInput = {
    createdById: userId,
  };

  if (search) {
    where.OR = [
      { shortCode: { contains: search, mode: "insensitive" } },
      { originalUrl: { contains: search, mode: "insensitive" } },
    ];
  }

  const total = await prisma.shortLink.count({ where });
  const orderBy: any = {};
  orderBy[sort_by || "createdAt"] = order === "asc" ? "asc" : "desc";

  const data = await prisma.shortLink.findMany({
    where,
    skip,
    take,
    orderBy,
  });

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data,
  };
};

export const getShortLinkByIdService = async ({
  id,
  requester,
}: {
  id: string;
  requester?: { userId?: string; roles?: string[] };
}) => {
  const link = await prisma.shortLink.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, fullName: true, email: true } },
    },
  });

  if (!link) throw new Error("Short link not found");

  const isAdmin = requester?.roles?.includes("admin");
  const isOwner = link.createdById === requester?.userId;

  if (isAdmin || isOwner) {
    return link;
  }

  throw new Error("Unauthorized to view this short link");
};

export const updateShortLinkService = async ({
  id,
  requesterUserId,
  requesterRoles,
  shortCode,
  expiresAt,
  isActive,
}: {
  id: string;
  requesterUserId: string;
  requesterRoles: string[];
  shortCode?: string;
  expiresAt?: string | Date;
  isActive?: boolean;
}) => {
  const link = await prisma.shortLink.findUnique({ where: { id } });
  if (!link) throw new Error("Short link not found");

  const isAdmin = requesterRoles.includes("admin");
  const isOwner = link.createdById === requesterUserId;

  if (!isAdmin && !isOwner)
    throw new Error("Unauthorized to update this short link");

  const data: any = {};

  // Cek shortCode unik jika mau diubah
  if (shortCode && shortCode !== link.shortCode) {
    const existing = await prisma.shortLink.findUnique({
      where: { shortCode },
    });
    if (existing) throw new Error("Short code already in use");
    data.shortCode = shortCode;
  }

  if (typeof isActive === "boolean") data.isActive = isActive;

  if (expiresAt)
    data.expiresAt =
      expiresAt instanceof Date ? expiresAt : new Date(expiresAt);

  data.updatedAt = new Date();

  const updated = await prisma.shortLink.update({
    where: { id },
    data,
  });

  return updated;
};

export const deleteShortLinkService = async ({
  id,
  requesterUserId,
  requesterRoles,
}: {
  id: string;
  requesterUserId: string;
  requesterRoles: string[];
}) => {
  const link = await prisma.shortLink.findUnique({ where: { id } });
  if (!link) throw new Error("Short link not found");

  const isAdmin = requesterRoles.includes("admin");
  if (!isAdmin) throw new Error("Only admin can delete short links");

  await prisma.shortLink.delete({ where: { id } });

  return { id, deletedBy: requesterUserId, deletedAt: new Date() };
};

/**
 * Redirect service:
 * - find by shortCode
 * - check isActive and expiresAt
 * - increment clickCount (atomic)
 * - return originalUrl
 */
export const redirectShortCodeService = async (shortCode: string) => {
  const link = await prisma.shortLink.findUnique({ where: { shortCode } });
  if (!link) throw new Error("Short link not found");

  if (!link.isActive) throw new Error("Short link is disabled");

  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
    throw new Error("Short link expired");
  }

  // increment clickCount atomically
  await prisma.shortLink.update({
    where: { id: link.id },
    data: { clickCount: { increment: 1 } },
  });

  return link.originalUrl;
};
