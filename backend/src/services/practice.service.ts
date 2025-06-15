import { PrismaClient, Prisma } from "@prisma/client";
import { Parser as Json2CsvParser } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate, subDays } from "date-fns";
import { Buffer } from "buffer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AuthenticatedRequestPractice } from "../middlewares/authenticate";
import { uploadToGoogleDrive } from "../utils/googleDrive";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createPractice = async (input: {
  mentorId: string;
  title: string;
  description?: string;
  thumbnailImages?: string[];
  price: number;
  practiceType?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  benefits?: string;
  toolsUsed?: string;
  challenges?: string;
  expectedOutcomes?: string;
  estimatedDuration?: string;
  targetAudience?: string;
}) => {
  const {
    mentorId,
    title,
    description,
    thumbnailImages,
    price,
    practiceType,
    category,
    tags,
    isActive,
    benefits,
    toolsUsed,
    challenges,
    expectedOutcomes,
    estimatedDuration,
    targetAudience,
  } = input;

  // Cari mentor berdasarkan mentorId
  const mentor = await prisma.mentorProfile.findUnique({
    where: { id: mentorId },
  });

  if (!mentor) {
    throw new Error("Mentor tidak ditemukan");
  }

  // Siapkan data secara dinamis
  const data: any = {
    mentorId,
    title,
    description,
    thumbnailImages,
    price: new Prisma.Decimal(price),
    practiceType,
    category,
    tags,
    isActive: isActive ?? true,
  };

  // Masukkan kolom tambahan hanya jika ada nilainya
  if (benefits) data.benefits = benefits;
  if (toolsUsed) data.toolsUsed = toolsUsed;
  if (challenges) data.challenges = challenges;
  if (expectedOutcomes) data.expectedOutcomes = expectedOutcomes;
  if (estimatedDuration) data.estimatedDuration = estimatedDuration;
  if (targetAudience) data.targetAudience = targetAudience;

  const practice = await prisma.practice.create({ data });
  return practice;
};

const thumbnailUploadPath = path.join(
  __dirname,
  "../../images/thumbnailPractice"
);

export const updatePractice = async (
  id: string,
  updates: {
    mentorId?: string;
    title?: string;
    description?: string;
    price?: number;
    practiceType?: string;
    category?: string;
    tags?: string[];
    isActive?: boolean;
    benefits?: string;
    toolsUsed?: string;
    challenges?: string;
    expectedOutcomes?: string;
    estimatedDuration?: string;
    targetAudience?: string;
  },
  uploadedImages: string[] = []
) => {
  const existingPractice = await prisma.practice.findUnique({
    where: { id },
  });

  if (!existingPractice) {
    throw new Error("Practice tidak ditemukan");
  }

  // Validasi mentorId jika ada
  if (updates.mentorId) {
    const mentorExists = await prisma.mentorProfile.findUnique({
      where: { id: updates.mentorId },
    });

    if (!mentorExists) {
      throw new Error("Mentor ID tidak valid");
    }
  }

  // Handle thumbnail image: hapus lama jika ada yang baru
  let finalThumbnails = existingPractice.thumbnailImages || [];

  if (uploadedImages.length > 0) {
    await Promise.all(
      finalThumbnails.map(async (oldImagePath) => {
        const fileNameOnly = path.basename(oldImagePath);
        const filePath = path.join(thumbnailUploadPath, fileNameOnly);

        try {
          await fs.promises.unlink(filePath);
        } catch (err) {
          console.error(`Gagal menghapus file lama: ${filePath}`, err);
        }
      })
    );

    finalThumbnails = uploadedImages;
  }

  const updatedPractice = await prisma.practice.update({
    where: { id },
    data: {
      ...updates,
      price:
        updates.price !== undefined
          ? new Prisma.Decimal(updates.price)
          : undefined,
      thumbnailImages: finalThumbnails,
      updatedAt: new Date(),
    },
  });

  return updatedPractice;
};

export const getAdminPracticeList = async (query: any) => {
  const { page, limit, search, status, mentorId, sortBy, sortOrder } = query;

  const skip = (page - 1) * limit;

  const where: any = {};

  // Search by title, category, or practiceType
  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        category: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        practiceType: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  // Filter by status
  if (status === "active") where.isActive = true;
  else if (status === "inactive") where.isActive = false;

  // Filter by mentor
  if (mentorId) where.mentorId = mentorId;

  // Query to get practice data and total count
  const [practices, total] = await prisma.$transaction([
    prisma.practice.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        mentorProfile: {
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
    }),
    prisma.practice.count({ where }),
  ]);

  return {
    data: practices,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPracticeById = async (id: string) => {
  try {
    // Fetch practice data along with its related tables
    const practice = await prisma.practice.findUnique({
      where: { id },
      include: {
        mentorProfile: {
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
        practiceMaterials: true,
        practiceReviews: true,
        practicePurchases: true,
      },
    });

    // Check if practice data is found
    if (!practice) {
      throw new Error("Practice not found");
    }

    // Check if related tables are empty and add a message
    const response = {
      practice,
      practiceMaterialsMessage:
        practice.practiceMaterials.length === 0
          ? "No materials available for this practice."
          : "Materials available.",
      practiceReviewsMessage:
        practice.practiceReviews.length === 0
          ? "No reviews yet for this practice."
          : "Reviews available.",
      practicePurchasesMessage:
        practice.practicePurchases.length === 0
          ? "No purchases yet for this practice."
          : "Purchases made.",
    };

    return response;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error("Failed to fetch practice details: " + error.message);
    } else {
      throw new Error(
        "An unknown error occurred while fetching practice details"
      );
    }
  }
};

export const deletePracticeSoft = async (id: string) => {
  try {
    await prisma.practice.update({
      where: { id },
      data: { isActive: false }, // Soft delete
    });
  } catch (err) {
    // Assert that `err` is an instance of Error
    const error = err as Error;
    throw new Error("Failed to deactivate practice: " + error.message);
  }
};

export const deletePracticeHard = async (id: string) => {
  try {
    await prisma.practice.delete({
      where: { id }, // Hard delete
    });
  } catch (err) {
    // Assert that `err` is an instance of Error
    const error = err as Error;
    throw new Error("Failed to delete practice: " + error.message);
  }
};

export const getPracticesByMentorId = async (
  mentorId: string,
  {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
  }: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    search: string;
  }
) => {
  try {
    const skip = (page - 1) * limit;

    const where: Prisma.PracticeWhereInput = {
      mentorId,
      isActive: true,
      title: {
        contains: search,
        mode: Prisma.QueryMode.insensitive, // ✅ fix di sini
      },
    };

    const [practices, total] = await Promise.all([
      prisma.practice.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.practice.count({ where }),
    ]);

    return {
      data: practices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (err) {
    const error = err as Error;
    throw new Error("Failed to fetch practices: " + error.message);
  }
};

export const getPracticeDetailByMentor = async (
  practiceId: string,
  mentorProfileId?: string
) => {
  if (!mentorProfileId) return null;

  const practice = await prisma.practice.findFirst({
    where: {
      id: practiceId,
      mentorId: mentorProfileId,
    },
    include: {
      mentorProfile: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              profilePicture: true,
            },
          },
        },
      },
      practiceMaterials: true,
      practiceReviews: true,
      practicePurchases: true,
    },
  });

  if (!practice) return null;

  return {
    ...practice,
    practiceMaterials:
      practice.practiceMaterials.length > 0
        ? practice.practiceMaterials
        : "Belum ada materi pada course ini",
    practiceReviews:
      practice.practiceReviews.length > 0
        ? practice.practiceReviews
        : "Belum ada review dari mentee",
    practicePurchases:
      practice.practicePurchases.length > 0
        ? practice.practicePurchases
        : "Belum ada pembelian untuk course ini",
  };
};

export const getPublicPractices = async (query: {
  search?: string;
  category?: string;
  tags?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: "createdAt" | "price";
  sortOrder?: "asc" | "desc";
  page: number;
  limit: number;
}) => {
  const {
    search,
    category,
    tags,
    priceMin,
    priceMax,
    sortBy = "createdAt",
    sortOrder = "desc",
    page,
    limit,
  } = query;

  const whereClause: any = {
    isActive: true,
  };

  if (search || category) {
    whereClause.OR = [];

    if (search) {
      whereClause.OR.push({ title: { contains: search, mode: "insensitive" } });
    }

    if (category) {
      whereClause.OR.push({
        category: { contains: category, mode: "insensitive" },
      });
    }
  }

  if (tags) {
    const tagArray = tags.split(",").map((t) => t.trim());
    whereClause.tags = { hasSome: tagArray };
  }

  if (priceMin || priceMax) {
    whereClause.price = {};
    if (priceMin) whereClause.price.gte = priceMin;
    if (priceMax) whereClause.price.lte = priceMax;
  }

  const [total, practices] = await Promise.all([
    prisma.practice.count({ where: whereClause }),
    prisma.practice.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        mentorProfile: {
          include: {
            user: {
              select: {
                fullName: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    practices: practices.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      category: p.category,
      tags: p.tags,
      practiceType: p.practiceType,
      thumbnailImages: p.thumbnailImages,
      createdAt: p.createdAt,
      benefits: p.benefits,
      toolsUsed: p.toolsUsed,
      challenges: p.challenges,
      expectedOutcomes: p.expectedOutcomes,
      estimatedDuration: p.estimatedDuration,
      targetAudience: p.targetAudience,
      mentor: {
        fullName: p.mentorProfile?.user.fullName,
        profilePicture: p.mentorProfile?.user.profilePicture,
      },
    })),
  };
};

export const getPracticePreview = async (practiceId: string) => {
  try {
    const practice = await prisma.practice.findUnique({
      where: { id: practiceId },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailImages: true,
        price: true,
        practiceType: true,
        category: true,
        tags: true,
        benefits: true,
        toolsUsed: true,
        challenges: true,
        expectedOutcomes: true,
        estimatedDuration: true,
        targetAudience: true,
        practiceMaterials: {
          select: {
            id: true,
            title: true,
            description: true,
            orderNumber: true,
          },
        },
        mentorProfile: {
          select: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!practice) return null;

    return {
      id: practice.id,
      title: practice.title,
      description: practice.description,
      thumbnailImages: practice.thumbnailImages,
      price: practice.price,
      practiceType: practice.practiceType,
      category: practice.category,
      tags: practice.tags,
      benefits: practice.benefits,
      toolsUsed: practice.toolsUsed,
      challenges: practice.challenges,
      expectedOutcomes: practice.expectedOutcomes,
      estimatedDuration: practice.estimatedDuration,
      targetAudience: practice.targetAudience,
      practiceMaterials: practice.practiceMaterials,
      mentor: practice.mentorProfile?.user.fullName || "Mentor not found",
    };
  } catch (error) {
    throw new Error("Error fetching practice preview");
  }
};

export const createPracticeMaterialService = async (input: {
  practiceId: string;
  title: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { practiceId, title, description, status, startDate, endDate } = input;

  // 1. Validasi practiceId ada
  const practice = await prisma.practice.findUnique({
    where: { id: practiceId },
  });

  if (!practice) {
    throw new Error("Practice not found");
  }

  // 2. Hitung orderNumber otomatis
  const lastMaterial = await prisma.practiceMaterial.findFirst({
    where: { practiceId },
    orderBy: { orderNumber: "desc" },
  });

  const nextOrderNumber = lastMaterial ? lastMaterial.orderNumber + 1 : 1;

  // 3. Buat practice material
  const newMaterial = await prisma.practiceMaterial.create({
    data: {
      practiceId,
      title,
      description,
      orderNumber: nextOrderNumber,
      status,
      startDate: startDate ? new Date(startDate + "T00:00:00Z") : undefined,
      endDate: endDate ? new Date(endDate + "T00:00:00Z") : undefined,
    },
  });
  return newMaterial;
};

export const updatePracticeMaterialService = async (input: {
  practiceId: string;
  materialId: string;
  title?: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const {
    practiceId,
    materialId,
    title,
    description,
    status,
    startDate,
    endDate,
  } = input;

  // 1. Cari material existing
  const material = await prisma.practiceMaterial.findFirst({
    where: {
      id: materialId,
      practiceId: practiceId,
    },
  });

  if (!material) {
    throw new Error("Practice material not found");
  }

  // 2. Siapkan updateData hanya kalau beda
  const updateData: any = {};
  const updatedFields: string[] = [];

  if (title !== undefined && title !== material.title) {
    updateData.title = title;
    updatedFields.push("title");
  }

  if (description !== undefined && description !== material.description) {
    updateData.description = description;
    updatedFields.push("description");
  }

  if (status !== undefined && status !== material.status) {
    updateData.status = status;
    updatedFields.push("status");
  }

  if (startDate !== undefined) {
    const newStartDate = new Date(startDate);
    if (
      !material.startDate ||
      newStartDate.getTime() !== material.startDate.getTime()
    ) {
      updateData.startDate = newStartDate;
      updatedFields.push("startDate");
    }
  }

  if (endDate !== undefined) {
    const newEndDate = new Date(endDate);
    if (
      !material.endDate ||
      newEndDate.getTime() !== material.endDate.getTime()
    ) {
      updateData.endDate = newEndDate;
      updatedFields.push("endDate");
    }
  }

  // 3. Kalau tidak ada perubahan, return langsung
  if (updatedFields.length === 0) {
    return {
      material,
      updatedFields: [],
      message: "No changes detected. Nothing was updated.",
    };
  }

  // 4. Lanjut update
  const updatedMaterial = await prisma.practiceMaterial.update({
    where: { id: materialId },
    data: {
      ...updateData,
      updatedAt: new Date(),
    },
  });

  return {
    material: updatedMaterial,
    updatedFields,
    message: "Practice material updated successfully",
  };
};

export const deletePracticeMaterialService = async (input: {
  practiceId: string;
  materialId: string;
}) => {
  const { practiceId, materialId } = input;

  // 1. Cari material untuk validasi
  const material = await prisma.practiceMaterial.findFirst({
    where: {
      id: materialId,
      practiceId: practiceId,
    },
  });

  if (!material) {
    throw new Error("Practice material not found");
  }

  // 2. Hapus material
  await prisma.practiceMaterial.delete({
    where: {
      id: materialId,
    },
  });

  return;
};

export const uploadPracticeFileService = async (input: {
  materialId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
}) => {
  const { materialId, fileName, filePath, fileType, fileSize } = input;

  // Hitung orderNumber terakhir
  const lastFile = await prisma.practiceFile.findFirst({
    where: { materialId },
    orderBy: { orderNumber: "desc" },
  });

  const nextOrderNumber = lastFile ? lastFile.orderNumber + 1 : 1;

  const newPracticeFile = await prisma.practiceFile.create({
    data: {
      materialId,
      fileName,
      filePath,
      fileType,
      fileSize,
      orderNumber: nextOrderNumber,
    },
  });

  return newPracticeFile;
};

export const updatePracticeFile = async (fileId: string, fileName: string) => {
  // Cek apakah file ada
  const existingFile = await prisma.practiceFile.findUnique({
    where: { id: fileId },
  });

  if (!existingFile) {
    const error: any = new Error("Practice file not found");
    error.statusCode = 404;
    throw error;
  }

  // Update nama file
  const updatedFile = await prisma.practiceFile.update({
    where: { id: fileId },
    data: {
      fileName,
      updatedAt: new Date(), // update timestamp juga
    },
  });

  return updatedFile;
};

export const deletePracticeFile = async (fileId: string) => {
  const existingFile = await prisma.practiceFile.findUnique({
    where: { id: fileId },
  });

  if (!existingFile) {
    const error: any = new Error("Practice file not found");
    error.statusCode = 404;
    throw error;
  }

  const fileFullPath = path.join(
    __dirname,
    "../../uploads",
    existingFile.filePath // tidak perlu practiceFile lagi
  );

  await new Promise<void>((resolve, reject) => {
    fs.unlink(fileFullPath, (err) => {
      if (err && err.code !== "ENOENT") {
        return reject(err);
      }
      resolve();
    });
  });

  await prisma.practiceFile.delete({
    where: { id: fileId },
  });

  return;
};

export const getPracticeFilesByMaterialService = async ({
  materialId,
  page,
  limit,
  user,
}: {
  materialId: string;
  page: number;
  limit: number;
  user: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
  };
}) => {
  const { userId, roles, mentorProfileId } = user;

  const material = await prisma.practiceMaterial.findUnique({
    where: { id: materialId },
    select: {
      id: true,
      practice: {
        select: {
          id: true,
          mentorId: true,
        },
      },
    },
  });

  if (!material) {
    const error = new Error("Practice Material not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const practiceId = material.practice.id;
  const mentorId = material.practice.mentorId;

  const isAdmin = roles.includes("admin");
  const isMentor = mentorProfileId && mentorProfileId === mentorId;
  const isConfirmedMentee = await prisma.practicePurchase.findFirst({
    where: {
      practiceId,
      userId,
      status: "confirmed",
    },
  });

  if (!isAdmin && !isMentor && !isConfirmedMentee) {
    const error = new Error(
      "You do not have permission to access these practice files"
    );
    (error as any).statusCode = 403;
    throw error;
  }

  // Kalau lolos akses, baru ambil practice files
  const practiceFiles = await prisma.practiceFile.findMany({
    where: {
      materialId,
    },
    orderBy: {
      orderNumber: "asc",
    },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      fileName: true,
      filePath: true,
      fileType: true,
      fileSize: true,
      orderNumber: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const totalFiles = await prisma.practiceFile.count({
    where: {
      materialId,
    },
  });

  return {
    practiceFiles,
    totalFiles,
    totalPages: Math.ceil(totalFiles / limit),
  };
};

export const getPracticeMaterialsService = async (
  practiceId: string,
  user: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
  },
  page: number,
  limit: number
) => {
  const practice = await prisma.practice.findUnique({
    where: { id: practiceId },
    select: {
      id: true,
      mentorId: true,
    },
  });

  if (!practice) {
    const error = new Error("Practice not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const isAdmin = user.roles.includes("admin");
  const isMentor =
    user.mentorProfileId && user.mentorProfileId === practice.mentorId;

  const isConfirmedMentee = await prisma.practicePurchase.findFirst({
    where: {
      practiceId: practiceId,
      userId: user.userId,
      status: "confirmed",
    },
  });

  if (!isAdmin && !isMentor && !isConfirmedMentee) {
    const error = new Error(
      "You do not have permission to access this practice materials"
    );
    (error as any).statusCode = 403;
    throw error;
  }

  const [materials, totalItems] = await prisma.$transaction([
    prisma.practiceMaterial.findMany({
      where: {
        practiceId: practiceId,
      },
      orderBy: {
        orderNumber: "asc",
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        orderNumber: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
        practiceFiles: {
          orderBy: { orderNumber: "asc" },
          select: {
            id: true,
            fileName: true,
            filePath: true,
            fileType: true,
            fileSize: true,
            orderNumber: true,
          },
        },
      },
    }),
    prisma.practiceMaterial.count({
      where: {
        practiceId: practiceId,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    materials,
    totalItems,
    totalPages,
  };
};

export const getPracticeMaterialDetailService = async (
  practiceId: string,
  materialId: string,
  user: {
    userId: string;
    roles: string[];
    mentorProfileId?: string;
  }
) => {
  const practice = await prisma.practice.findUnique({
    where: { id: practiceId },
    select: {
      id: true,
      mentorId: true,
    },
  });

  if (!practice) {
    const error = new Error("Practice not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const isAdmin = user.roles.includes("admin");
  const isMentor =
    user.mentorProfileId && user.mentorProfileId === practice.mentorId;

  // Cek kalau user mentee: apakah pernah purchase practice ini dan statusnya confirmed
  const isConfirmedMentee = await prisma.practicePurchase.findFirst({
    where: {
      practiceId: practiceId,
      userId: user.userId,
      status: "confirmed",
    },
  });

  if (!isAdmin && !isMentor && !isConfirmedMentee) {
    const error = new Error(
      "You do not have permission to access this practice material"
    );
    (error as any).statusCode = 403;
    throw error;
  }

  // Ambil detail material
  const material = await prisma.practiceMaterial.findUnique({
    where: { id: materialId },
    select: {
      id: true,
      title: true,
      description: true,
      orderNumber: true,
      status: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
      practiceFiles: {
        orderBy: { orderNumber: "asc" },
        select: {
          id: true,
          fileName: true,
          filePath: true,
          fileType: true,
          fileSize: true,
          orderNumber: true,
        },
      },
    },
  });

  if (!material) {
    const error = new Error("Practice material not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return material;
};

// Fungsi untuk menghasilkan ID unik untuk Payment
const generatePaymentId = async (
  type: "booking" | "practice"
): Promise<string> => {
  const datePart = formatDate(new Date(), "yyyyMMdd");
  const prefix = type === "booking" ? "PAY-BKG" : "PAY-PRC";
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    const id = `${prefix}-${datePart}-${randomDigits}`;
    const existing = await prisma.payment.findUnique({
      where: { id },
    });
    if (!existing) {
      return id;
    }
  }

  throw {
    status: 500,
    message: "Gagal menghasilkan ID Payment unik setelah beberapa percobaan",
  };
};

const generatePracticePurchaseId = async (): Promise<string> => {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    const id = `Purchase-${randomDigits}`;
    const existing = await prisma.practicePurchase.findUnique({
      where: { id },
    });
    if (!existing) {
      return id;
    }
  }

  throw {
    status: 500,
    message:
      "Gagal menghasilkan ID PracticePurchase unik setelah beberapa percobaan",
  };
};

export const createPracticePurchase = async (input: {
  userId: string;
  practiceId: string;
  referralUsageId?: string;
}) => {
  const { userId, practiceId, referralUsageId } = input;

  const practice = await prisma.practice.findUnique({
    where: { id: practiceId },
    select: {
      id: true,
      price: true,
      isActive: true,
    },
  });

  if (!practice || !practice.isActive) {
    throw {
      status: 404,
      message: "Practice tidak ditemukan atau tidak aktif.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw {
      status: 404,
      message: "User tidak ditemukan.",
    };
  }

  let discountPercentage = 0;
  let originalPrice = practice.price.toNumber();
  let finalPrice = originalPrice;
  let referralCodeId: string | null = null;
  let commissionPercentage = 0;

  if (referralUsageId) {
    const referralUsage = await prisma.referralUsage.findUnique({
      where: { id: referralUsageId },
      include: {
        practicePurchase: true,
        booking: true,
        referralCode: {
          select: {
            id: true,
            discountPercentage: true,
            commissionPercentage: true,
          },
        },
      },
    });

    if (!referralUsage) {
      throw {
        status: 404,
        message: "Referral usage tidak ditemukan.",
      };
    }

    if (referralUsage.practicePurchase || referralUsage.booking) {
      throw {
        status: 400,
        message: "Referral usage sudah digunakan.",
      };
    }

    discountPercentage =
      referralUsage.referralCode.discountPercentage.toNumber();
    commissionPercentage =
      referralUsage.referralCode.commissionPercentage.toNumber();
    referralCodeId = referralUsage.referralCode.id;
    finalPrice = originalPrice * (1 - discountPercentage / 100);
  }

  const purchase = await prisma.$transaction(async (tx) => {
    const purchaseId = await generatePracticePurchaseId();

    const newPurchase = await tx.practicePurchase.create({
      data: {
        id: purchaseId,
        userId,
        practiceId,
        referralUsageId,
        status: "pending",
      },
      include: {
        payment: true,
      },
    });

    const paymentId = await generatePaymentId("practice");

    const payment = await tx.payment.create({
      data: {
        id: paymentId,
        practicePurchaseId: newPurchase.id,
        amount: finalPrice,
        status: "pending",
      },
    });

    if (payment.bookingId) {
      throw {
        status: 400,
        message:
          "Payment tidak boleh terkait dengan Booking dan PracticePurchase bersamaan.",
      };
    }

    if (referralUsageId && referralCodeId) {
      const commissionAmount = finalPrice * (commissionPercentage / 100);
      await tx.referralCommisions.create({
        data: {
          referralCodeId,
          transactionId: paymentId,
          amount: commissionAmount,
          created_at: new Date(),
        },
      });
    }

    return {
      ...newPurchase,
      payment,
      originalPrice,
      finalPrice,
    };
  });

  return {
    success: true,
    message: "Practice purchase berhasil dibuat.",
    data: purchase,
  };
};

export const cancelPracticePurchase = async (input: {
  userId: string;
  practicePurchaseId: string;
}) => {
  const { userId, practicePurchaseId } = input;

  const purchase = await prisma.practicePurchase.findUnique({
    where: { id: practicePurchaseId },
  });

  if (!purchase) {
    throw new Error("Practice Purchase not found");
  }

  if (purchase.userId !== userId) {
    throw new Error("Unauthorized to cancel this purchase");
  }

  if (purchase.status !== "pending") {
    throw new Error("Only pending purchases can be cancelled");
  }

  const updatedPurchase = await prisma.practicePurchase.update({
    where: { id: practicePurchaseId },
    data: {
      status: "cancelled",
      updatedAt: new Date(),
    },
  });

  return updatedPurchase;
};

export const getPracticePurchases = async (input: {
  userId: string;
  page: number;
  limit: number;
  status?: string;
  search?: string;
}) => {
  const { userId, page, limit, status, search } = input;

  const whereClause: Prisma.PracticePurchaseWhereInput = {
    userId,
    ...(status ? { status } : {}),
    ...(search
      ? {
          practice: {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
        }
      : {}),
  };

  const [purchases, total] = await prisma.$transaction([
    prisma.practicePurchase.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        practice: {
          select: {
            id: true,
            title: true,
            thumbnailImages: true,
            price: true,
          },
        },
      },
    }),
    prisma.practicePurchase.count({
      where: whereClause,
    }),
  ]);

  return {
    data: purchases,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const getPracticePurchaseDetail = async (input: {
  id: string;
  userId: string;
}) => {
  const { id, userId } = input;

  const purchase = await prisma.practicePurchase.findFirst({
    where: {
      id,
      userId, // pastikan hanya purchase milik user ini
    },
    include: {
      practice: {
        select: {
          id: true,
          title: true,
          thumbnailImages: true,
          price: true,
          description: true,
          practiceType: true,
          category: true,
          tags: true,
        },
      },
      payment: {
        select: {
          id: true,
          paymentMethod: true,
          status: true,
          amount: true,
          createdAt: true,
        },
      },
      referralUsage: {
        select: {
          id: true,
          referralCode: true,
        },
      },
    },
  });

  if (!purchase) {
    throw new Error("Practice purchase not found or access denied");
  }

  return purchase;
};

export const getAllPracticePurchasesService = async (query: any) => {
  const {
    status,
    user,
    practice,
    startDate,
    endDate,
    page = "1",
    limit = "10",
    sortBy = "purchaseDate",
    sortOrder = "desc",
  } = query;

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  const where: any = {};

  if (status) {
    where.status = status;
  }

  // Parse startDate and endDate dengan format yyyy-mm-dd
  if (startDate && endDate) {
    where.purchaseDate = {
      gte: new Date(`${startDate}T00:00:00.000Z`), // Convert ke format ISO
      lte: new Date(`${endDate}T23:59:59.999Z`), // Convert ke format ISO
    };
  }

  if (user) {
    where.user = {
      OR: [
        { fullName: { contains: user, mode: "insensitive" } },
        { email: { contains: user, mode: "insensitive" } },
      ],
    };
  }

  if (practice) {
    where.practice = {
      title: {
        contains: practice,
        mode: "insensitive",
      },
    };
  }

  const [total, practicePurchases] = await Promise.all([
    prisma.practicePurchase.count({ where }),
    prisma.practicePurchase.findMany({
      where,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: true,
        practice: true,
        payment: true,
        referralUsage: true,
      },
    }),
  ]);

  const totalPage = Math.ceil(total / pageSize);

  return {
    total,
    totalPage,
    page: pageNumber,
    pageSize,
    data: practicePurchases,
  };
};

export const getPracticePurchaseDetailService = async (id: string) => {
  const practicePurchase = await prisma.practicePurchase.findUnique({
    where: { id },
    include: {
      user: true,
      practice: true,
      payment: true,
      referralUsage: true,
    },
  });

  if (!practicePurchase) {
    throw new Error("Practice Purchase not found");
  }

  return practicePurchase;
};

export const updatePracticePurchaseStatusService = async (
  id: string,
  status: string
) => {
  // 1. Cari Practice Purchase
  const practicePurchase = await prisma.practicePurchase.findUnique({
    where: { id },
  });

  if (!practicePurchase) {
    const error: any = new Error("Practice purchase not found");
    error.statusCode = 404;
    throw error;
  }

  // 2. Update Status
  const updatedPracticePurchase = await prisma.practicePurchase.update({
    where: { id },
    data: {
      status,
      updatedAt: new Date(), // update updatedAt juga
    },
    include: {
      user: {
        select: { id: true, fullName: true, email: true },
      },
      practice: {
        select: { id: true, title: true },
      },
    },
  });

  return updatedPracticePurchase;
};

export const exportPracticePurchasesService = async (
  format: "csv" | "excel"
) => {
  const practicePurchases = await prisma.practicePurchase.findMany({
    include: {
      user: true,
      practice: true,
    },
  });

  // Map datanya biar rapi
  const mappedData = practicePurchases.map((purchase) => ({
    purchaseId: purchase.id,
    status: purchase.status,
    price: purchase.practice.price,
    userId: purchase.userId,
    userName: purchase.user?.fullName,
    userEmail: purchase.user?.email,
    practiceId: purchase.practiceId,
    practiceTitle: purchase.practice?.title,
    createdAt: purchase.createdAt,
    updatedAt: purchase.updatedAt,
  }));

  if (format === "csv") {
    const parser = new Json2CsvParser({
      fields: Object.keys(mappedData[0] || {}),
    });
    const csv = parser.parse(mappedData);
    return Buffer.from(csv, "utf-8");
  } else {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Practice Purchases");

    worksheet.columns = Object.keys(mappedData[0] || {}).map((key) => ({
      header: key,
      key,
      width: 20,
    }));

    mappedData.forEach((data) => {
      worksheet.addRow(data);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
};

export const createOrUpdatePracticeProgressService = async (input: {
  materialId: string;
  userId?: string; // optional, default ke currentUserId kalau nggak diisi
  isCompleted?: boolean;
  timeSpentSeconds?: number;
  currentUserId: string;
  currentUserRole: string[]; // contoh: ["mentee"], ["admin"]
  currentUserMentorProfileId?: string;
}) => {
  const {
    materialId,
    userId,
    isCompleted,
    timeSpentSeconds,
    currentUserId,
    currentUserRole,
    currentUserMentorProfileId,
  } = input;

  const practiceMaterial = await prisma.practiceMaterial.findUnique({
    where: { id: materialId },
    include: { practice: true },
  });

  if (!practiceMaterial) {
    throw new Error("Practice material not found");
  }

  const practice = practiceMaterial.practice;

  // Akses Validation
  const isAdmin = currentUserRole.includes("admin");
  const isMentor =
    currentUserRole.includes("mentor") &&
    currentUserMentorProfileId === practice.mentorId;
  let isMentee = false;

  if (!isAdmin && !isMentor) {
    const practicePurchase = await prisma.practicePurchase.findFirst({
      where: {
        userId: currentUserId,
        practiceId: practice.id,
        status: "confirmed",
      },
    });

    isMentee = !!practicePurchase;

    if (!isMentee) {
      throw new Error("Unauthorized to create or update practice progress");
    }
  }

  const finalUserId = userId ?? currentUserId;

  // Upsert PracticeProgress (MODIFIKASI DI SINI)
  const practiceProgress = await prisma.practiceProgress.upsert({
    where: {
      userId_materialId: {
        userId: finalUserId,
        materialId,
      },
    },
    update: {
      isCompleted: isCompleted ?? undefined,
      timeSpentSeconds: timeSpentSeconds ?? undefined,
      lastAccessed: new Date(), // <<< tambahkan ini saat UPDATE
    },
    create: {
      userId: finalUserId,
      materialId,
      isCompleted: isCompleted ?? false,
      timeSpentSeconds: timeSpentSeconds ?? 0,
      lastAccessed: new Date(), // <<< tambahkan ini saat CREATE
    },
  });

  return practiceProgress;
};

export const updatePracticeProgress = async ({
  id,
  data,
  user,
}: {
  id: string;
  data: {
    isCompleted?: boolean;
    timeSpentSeconds?: number;
    lastAccessed?: Date;
  };
  user: AuthenticatedRequestPractice["user"];
}) => {
  const existingProgress = await prisma.practiceProgress.findUnique({
    where: { id },
    include: {
      practiceMaterial: {
        include: {
          practice: true,
        },
      },
    },
  });

  if (!existingProgress) {
    throw new Error("Practice progress not found.");
  }

  // Validasi berdasarkan role user
  if (user?.roles.includes("mentee")) {
    // Mentee hanya bisa update progress milik mereka sendiri
    console.log("Mentee validating...");
    console.log("existingProgress.userId:", existingProgress.userId);
    console.log("user.userId:", user.userId);

    if (existingProgress.userId !== user.userId) {
      throw new Error("You are not authorized to update this progress.");
    }
  } else if (user?.roles.includes("mentor")) {
    // Mentor hanya bisa update progress untuk mentee yang mengakses practice milik mereka
    console.log("Mentor validating...");
    if (!user.mentorProfileId) {
      throw new Error("Mentor profile not found.");
    }

    const practice = existingProgress.practiceMaterial.practice;
    if (practice.mentorId !== user.mentorProfileId) {
      throw new Error(
        "You are not authorized to update this mentee's progress."
      );
    }
  } else if (user?.roles.includes("admin")) {
    // Admin bisa update semua progress, tidak perlu validasi tambahan
    console.log("Admin validating...");
  } else {
    // Kalau role tidak diketahui
    throw new Error("You are not authorized to update this progress.");
  }

  // Update progress dengan data baru
  const updatedProgress = await prisma.practiceProgress.update({
    where: { id },
    data: {
      isCompleted: data.isCompleted,
      timeSpentSeconds: data.timeSpentSeconds,
      lastAccessed: data.lastAccessed,
    },
  });

  return updatedProgress;
};

export const getAllPracticeProgressService = async ({
  page,
  limit,
  search,
  user,
}: {
  page: number;
  limit: number;
  search?: string;
  user: AuthenticatedRequestPractice["user"];
}) => {
  const skip = (page - 1) * limit;

  // Inisialisasi whereCondition
  let whereCondition: Prisma.PracticeProgressWhereInput = {};

  // Tambahkan filter berdasarkan role
  if (user!.roles.includes("mentee")) {
    // Mentee hanya bisa melihat progress mereka sendiri
    whereCondition = {
      ...whereCondition,
      userId: user!.userId,
    };
  } else if (user!.roles.includes("mentor")) {
    // Mentor hanya bisa melihat progress mentee untuk practice mereka
    if (!user!.mentorProfileId) {
      throw new Error("Mentor profile not found");
    }
    whereCondition = {
      ...whereCondition,
      practiceMaterial: {
        practice: {
          mentorId: user!.mentorProfileId,
        },
      },
    };
  } else if (user!.roles.includes("admin")) {
    // Admin bisa melihat semua progress, tidak perlu filter tambahan
  } else {
    throw new Error("Unauthorized: Invalid role");
  }

  // Tambahkan filter pencarian jika ada
  if (search) {
    whereCondition = {
      ...whereCondition,
      OR: [
        {
          user: {
            fullName: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
      ],
    };
  }

  const [progressList, total] = await Promise.all([
    prisma.practiceProgress.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        practiceMaterial: {
          select: {
            id: true,
            title: true,
            practice: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.practiceProgress.count({
      where: whereCondition,
    }),
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: progressList,
  };
};

export const getPracticeProgressByIdService = async ({
  id,
  user,
}: {
  id: string;
  user: AuthenticatedRequestPractice["user"];
}) => {
  // Ambil progress dengan relasi yang diperlukan
  const progress = await prisma.practiceProgress.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      practiceMaterial: {
        select: {
          id: true,
          title: true,
          practice: {
            select: {
              id: true,
              title: true,
              mentorId: true,
            },
          },
        },
      },
    },
  });

  if (!progress) {
    throw new Error("Practice progress not found");
  }

  // Otorisasi berdasarkan role
  if (user!.roles.includes("mentee")) {
    // Mentee hanya bisa melihat progress mereka sendiri
    if (progress.userId !== user!.userId) {
      throw new Error("Unauthorized: You can only view your own progress");
    }
  } else if (user!.roles.includes("mentor")) {
    // Mentor hanya bisa melihat progress untuk practice mereka
    if (!user!.mentorProfileId) {
      throw new Error("Mentor profile not found");
    }
    if (progress.practiceMaterial.practice.mentorId !== user!.mentorProfileId) {
      throw new Error(
        "Unauthorized: You can only view progress for your own practices"
      );
    }
  } else if (user!.roles.includes("admin")) {
    // Admin bisa melihat semua progress
  } else {
    throw new Error("Unauthorized: Invalid role");
  }

  return progress;
};

export const deletePracticeProgressService = async ({
  id,
  user,
}: {
  id: string;
  user: AuthenticatedRequestPractice["user"];
}) => {
  // Cek otorisasi: hanya admin yang diizinkan
  if (!user!.roles.includes("admin")) {
    throw new Error("Unauthorized: Only admins can delete practice progress");
  }

  // Cek apakah progress ada
  const progress = await prisma.practiceProgress.findUnique({
    where: { id },
  });

  if (!progress) {
    throw new Error("Practice progress not found");
  }

  // Hapus progress
  await prisma.practiceProgress.delete({
    where: { id },
  });

  return { id };
};

export const createPracticeReviewService = async ({
  practiceId,
  rating,
  comment,
  user,
}: {
  practiceId: string;
  rating: number;
  comment?: string;
  user: AuthenticatedRequestPractice["user"];
}) => {
  // Validasi: pastikan user adalah mentee
  if (!user!.roles.includes("mentee")) {
    throw new Error("Unauthorized: Only mentees can create reviews");
  }

  // Cek apakah practice ada
  const practice = await prisma.practice.findUnique({
    where: { id: practiceId },
  });
  if (!practice) {
    throw new Error("Practice not found");
  }

  // Cek apakah user sudah membeli practice dengan status confirmed
  const purchase = await prisma.practicePurchase.findFirst({
    where: {
      userId: user!.userId,
      practiceId,
      status: "confirmed",
    },
  });
  if (!purchase) {
    throw new Error(
      "Unauthorized: You must purchase this practice with confirmed status to review it"
    );
  }

  // Cek apakah user sudah memberikan review untuk practice ini
  const existingReview = await prisma.practiceReview.findUnique({
    where: {
      userId_practiceId: {
        userId: user!.userId,
        practiceId,
      },
    },
  });
  if (existingReview) {
    throw new Error("You have already reviewed this practice");
  }

  // Buat review
  const review = await prisma.practiceReview.create({
    data: {
      userId: user!.userId,
      practiceId,
      rating,
      comment,
      submittedDate: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      practice: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return review;
};

export const updatePracticeReviewService = async ({
  id,
  comment,
  user,
}: {
  id: string;
  comment?: string;
  user: AuthenticatedRequestPractice["user"];
}) => {
  // Validasi: pastikan user adalah mentee
  if (!user!.roles.includes("mentee")) {
    throw new Error("Unauthorized: Only mentees can update reviews");
  }

  // Cek apakah review ada dan milik user
  const review = await prisma.practiceReview.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      practice: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (review.userId !== user!.userId) {
    throw new Error("Unauthorized: You can only update your own review");
  }

  // Update review
  const updatedReview = await prisma.practiceReview.update({
    where: { id },
    data: {
      comment,
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      practice: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return updatedReview;
};

export const getUserPracticeReviewsService = async ({
  userId,
  page,
  limit,
  user,
}: {
  userId: string;
  page: number;
  limit: number;
  user: AuthenticatedRequestPractice["user"];
}) => {
  // Validasi: pastikan user adalah mentee dan hanya bisa melihat review mereka sendiri
  if (!user!.roles.includes("mentee")) {
    throw new Error("Unauthorized: Only mentees can view their reviews");
  }

  if (userId !== user!.userId) {
    throw new Error("Unauthorized: You can only view your own reviews");
  }

  const skip = (page - 1) * limit;

  // Ambil review dengan paginasi
  const [reviews, total] = await Promise.all([
    prisma.practiceReview.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        practice: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        submittedDate: "desc",
      },
    }),
    prisma.practiceReview.count({
      where: {
        userId,
      },
    }),
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: reviews,
  };
};

export const getPracticeReviewsService = async ({
  practiceId,
  page,
  limit,
  user,
}: {
  practiceId: string;
  page: number;
  limit: number;
  user: AuthenticatedRequestPractice["user"];
}) => {
  // Validasi: pastikan user adalah mentee
  if (!user!.roles.includes("mentee")) {
    throw new Error("Unauthorized: Only mentees can view practice reviews");
  }

  // Cek apakah practice ada
  const practice = await prisma.practice.findUnique({
    where: { id: practiceId },
  });
  if (!practice) {
    throw new Error("Practice not found");
  }

  const skip = (page - 1) * limit;

  // Ambil review dengan paginasi
  const [reviews, total] = await Promise.all([
    prisma.practiceReview.findMany({
      where: {
        practiceId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        practice: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        submittedDate: "desc",
      },
    }),
    prisma.practiceReview.count({
      where: {
        practiceId,
      },
    }),
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: reviews,
  };
};

export const updateAdminPracticeReviewService = async ({
  id,
  comment,
  rating,
  user,
}: {
  id: string;
  comment?: string;
  rating?: number;
  user: AuthenticatedRequestPractice["user"];
}) => {
  // Validasi: pastikan user adalah admin
  if (!user!.roles.includes("admin")) {
    throw new Error("Unauthorized: Only admins can update reviews");
  }

  // Cek apakah review ada
  const review = await prisma.practiceReview.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      practice: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  // Update review
  const updatedReview = await prisma.practiceReview.update({
    where: { id },
    data: {
      comment,
      rating,
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      practice: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return updatedReview;
};

export const deleteAdminPracticeReviewService = async ({
  id,
  user,
}: {
  id: string;
  user: AuthenticatedRequestPractice["user"];
}) => {
  // Validasi: pastikan user adalah admin
  if (!user!.roles.includes("admin")) {
    throw new Error("Unauthorized: Only admins can delete reviews");
  }

  // Cek apakah review ada
  const review = await prisma.practiceReview.findUnique({
    where: { id },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  // Hapus review
  await prisma.practiceReview.delete({
    where: { id },
  });

  return { id };
};

export const getAllAdminPracticeReviewsService = async ({
  page,
  limit,
  search,
  practiceId,
  userId,
  rating,
  startDate,
  endDate,
  user,
}: {
  page: number;
  limit: number;
  search?: string;
  practiceId?: string;
  userId?: string;
  rating?: number;
  startDate?: Date;
  endDate?: Date;
  user: AuthenticatedRequestPractice["user"];
}) => {
  // Validasi: pastikan user adalah admin
  if (!user!.roles.includes("admin")) {
    throw new Error("Unauthorized: Only admins can view all reviews");
  }

  const skip = (page - 1) * limit;

  // Bangun kondisi where untuk filter
  const where: Prisma.PracticeReviewWhereInput = {};

  if (practiceId) {
    where.practiceId = practiceId;
  }

  if (userId) {
    where.userId = userId;
  }

  if (rating) {
    where.rating = rating;
  }

  if (search) {
    where.comment = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (startDate || endDate) {
    where.submittedDate = {};
    if (startDate) {
      where.submittedDate.gte = startDate;
    }
    if (endDate) {
      where.submittedDate.lte = endDate;
    }
  }

  // Ambil review dengan paginasi dan filter
  const [reviews, total] = await Promise.all([
    prisma.practiceReview.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        practice: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        submittedDate: "desc",
      },
    }),
    prisma.practiceReview.count({
      where,
    }),
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: reviews,
  };
};

export const getAdminPracticeReviewByIdService = async ({
  id,
  user,
}: {
  id: string;
  user: AuthenticatedRequestPractice["user"];
}) => {
  // Validasi: pastikan user adalah admin
  if (!user!.roles.includes("admin")) {
    throw new Error("Unauthorized: Only admins can view review details");
  }

  // Ambil review dengan relasi user dan practice
  const review = await prisma.practiceReview.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      practice: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  return review;
};

export const exportAdminPracticeReviewsService = async ({
  format,
  search,
  practiceId,
  userId,
  rating,
  startDate,
  endDate,
  user,
}: {
  format: "csv" | "excel";
  search?: string;
  practiceId?: string;
  userId?: string;
  rating?: number;
  startDate?: Date;
  endDate?: Date;
  user: AuthenticatedRequestPractice["user"];
}) => {
  // Validasi: pastikan user adalah admin
  if (!user!.roles.includes("admin")) {
    throw new Error("Unauthorized: Only admins can export reviews");
  }

  // Bangun kondisi where untuk filter
  const where: Prisma.PracticeReviewWhereInput = {};

  if (practiceId) {
    where.practiceId = practiceId;
  }

  if (userId) {
    where.userId = userId;
  }

  if (rating) {
    where.rating = rating;
  }

  if (search) {
    where.comment = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (startDate || endDate) {
    where.submittedDate = {};
    if (startDate) {
      where.submittedDate.gte = startDate;
    }
    if (endDate) {
      where.submittedDate.lte = endDate;
    }
  }

  // Ambil semua review tanpa paginasi
  const reviews = await prisma.practiceReview.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      },
      practice: {
        select: {
          id: true,
          title: true,
          price: true,
          category: true,
        },
      },
    },
    orderBy: {
      submittedDate: "desc",
    },
  });

  // Format data untuk ekspor
  const formattedReviews = reviews.map((review) => ({
    review_id: review.id,
    user_id: review.userId,
    user_full_name: review.user.fullName,
    user_email: review.user.email,
    user_phone_number: review.user.phoneNumber || "",
    practice_id: review.practiceId,
    practice_title: review.practice.title,
    practice_price: review.practice.price.toString(),
    practice_category: review.practice.category || "",
    rating: review.rating,
    comment: review.comment || "",
    submitted_date: review.submittedDate
      ? formatDate(review.submittedDate, "yyyy-MM-dd HH:mm:ss")
      : "",
    created_at: review.createdAt
      ? formatDate(review.createdAt, "yyyy-MM-dd HH:mm:ss")
      : "",
    updated_at: review.updatedAt
      ? formatDate(review.updatedAt, "yyyy-MM-dd HH:mm:ss")
      : "",
  }));

  // Nama file dengan tanggal dan waktu saat ini untuk keunikan
  const currentDateTime = formatDate(new Date(), "yyyy-MM-dd_HH-mm-ss");
  const fileName = `practice_reviews_${currentDateTime}.${
    format === "csv" ? "csv" : "xlsx"
  }`;

  // Ekspor ke CSV atau Excel
  let buffer: Buffer;

  if (format === "csv") {
    const fields = [
      { label: "Review ID", value: "review_id" },
      { label: "User ID", value: "user_id" },
      { label: "User Full Name", value: "user_full_name" },
      { label: "User Email", value: "user_email" },
      { label: "User Phone Number", value: "user_phone_number" },
      { label: "Practice ID", value: "practice_id" },
      { label: "Practice Title", value: "practice_title" },
      { label: "Practice Price", value: "practice_price" },
      { label: "Practice Category", value: "practice_category" },
      { label: "Rating", value: "rating" },
      { label: "Comment", value: "comment" },
      { label: "Submitted Date", value: "submitted_date" },
      { label: "Created At", value: "created_at" },
      { label: "Updated At", value: "updated_at" },
    ];

    const json2csvParser = new Json2CsvParser({ fields });
    const csv = json2csvParser.parse(formattedReviews);
    buffer = Buffer.from(csv);
  } else {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Practice Reviews");

    // Kolom header
    worksheet.columns = [
      { header: "Review ID", key: "review_id", width: 30 },
      { header: "User ID", key: "user_id", width: 30 },
      { header: "User Full Name", key: "user_full_name", width: 20 },
      { header: "User Email", key: "user_email", width: 30 },
      { header: "User Phone Number", key: "user_phone_number", width: 20 },
      { header: "Practice ID", key: "practice_id", width: 30 },
      { header: "Practice Title", key: "practice_title", width: 30 },
      { header: "Practice Price", key: "practice_price", width: 15 },
      { header: "Practice Category", key: "practice_category", width: 20 },
      { header: "Rating", key: "rating", width: 10 },
      { header: "Comment", key: "comment", width: 50 },
      { header: "Submitted Date", key: "submitted_date", width: 20 },
      { header: "Created At", key: "created_at", width: 20 },
      { header: "Updated At", key: "updated_at", width: 20 },
    ];

    // Tambahkan data
    formattedReviews.forEach((review) => {
      worksheet.addRow(review);
    });

    // Format header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    // Simpan ke buffer
    buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  }

  return { buffer, fileName };
};
