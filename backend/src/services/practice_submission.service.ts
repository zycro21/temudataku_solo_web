import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export const createPracticeSubmissionService = async ({
  userId,
  practiceId,
  notes,
  files,
}: {
  userId: string;
  practiceId: string;
  notes?: string;
  files: string[];
}) => {
  // Generate custom ID otomatis
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const customId = `SubPrac-${datePart}-${random}`;

  // Pastikan practice ada
  const practice = await prisma.practice.findUnique({
    where: { id: practiceId },
  });
  if (!practice) throw new Error("Practice not found");

  // Cek apakah mentee sudah membeli practice ini
  const purchased = await prisma.practicePurchase.findFirst({
    where: {
      userId,
      practiceId,
    },
  });

  if (!purchased) {
    throw new Error("You must purchase this practice before submitting");
  }

  //  Cek apakah sudah pernah submit sebelumnya
  const existing = await prisma.practiceSubmission.findUnique({
    where: { userId_practiceId: { userId, practiceId } },
  });
  if (existing) throw new Error("You have already submitted for this practice");

  // 4️⃣ Buat submission baru
  const submission = await prisma.practiceSubmission.create({
    data: {
      id: customId,
      userId,
      practiceId,
      notes,
      files,
      status: "pending",
    },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      practice: { select: { id: true, title: true } },
    },
  });

  return submission;
};

export const getAllPracticeSubmissionsService = async ({
  user,
  page,
  limit,
  search,
  status,
  sort_by,
  order,
}: {
  user: any;
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sort_by: string;
  order: string;
}) => {
  const skip = (page - 1) * limit;
  const take = limit;

  const where: Prisma.PracticeSubmissionWhereInput = {};

  // Jika mentor, filter hanya submission dari practice yang dia pegang
  if (user.roles.includes("mentor") && !user.roles.includes("admin")) {
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { id: user.mentorProfileId },
      select: { id: true },
    });

    if (!mentorProfile) throw new Error("Mentor profile not found");

    where.practice = { mentorId: mentorProfile.id };
  }

  // Filter status (jika ada)
  if (status) where.status = status;

  // Search (nama user atau judul practice)
  if (search) {
    where.OR = [
      { user: { fullName: { contains: search, mode: "insensitive" } } },
      { practice: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Hitung total data
  const total = await prisma.practiceSubmission.count({ where });

  // Ambil data dengan pagination dan sorting
  const submissions = await prisma.practiceSubmission.findMany({
    where,
    skip,
    take,
    orderBy: { [sort_by]: order },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      practice: { select: { id: true, title: true } },
      reviewer: { select: { id: true, fullName: true, email: true } },
    },
  });

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: submissions,
  };
};

export const getOwnPracticeSubmissionsService = async ({
  user,
  page,
  limit,
  status,
  sort_by,
  order,
}: {
  user: any;
  page: number;
  limit: number;
  status?: string;
  sort_by: string;
  order: string;
}) => {
  const skip = (page - 1) * limit;
  const take = limit;

  const where: Prisma.PracticeSubmissionWhereInput = {
    userId: user.id, // Hanya milik mentee saat ini
  };

  if (status) where.status = status;

  const total = await prisma.practiceSubmission.count({ where });

  const submissions = await prisma.practiceSubmission.findMany({
    where,
    skip,
    take,
    orderBy: { [sort_by]: order },
    include: {
      practice: { select: { id: true, title: true } },
      reviewer: { select: { id: true, fullName: true, email: true } },
    },
  });

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: submissions,
  };
};

export const getPracticeSubmissionByIdService = async ({
  id,
  user,
}: {
  id: string;
  user: any;
}) => {
  const submission = await prisma.practiceSubmission.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      reviewer: { select: { id: true, fullName: true, email: true } },
      practice: { select: { id: true, title: true, mentorId: true } },
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  const userRoles = user.roles || [];

  // ADMIN → bisa akses semua
  if (userRoles.includes("admin")) {
    return submission;
  }

  // MENTOR → hanya bisa lihat submission dari practice miliknya
  if (userRoles.includes("mentor")) {
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { id: user.mentorProfileId },
    });

    if (!mentorProfile || submission.practice.mentorId !== mentorProfile.id) {
      throw new Error("You are not authorized to view this submission.");
    }

    return submission;
  }

  // MENTEE → hanya bisa lihat submission miliknya dan yang practice-nya sudah dibeli
  if (userRoles.includes("mentee")) {
    const purchased = await prisma.practicePurchase.findFirst({
      where: {
        userId: user.userId, // fix: pakai user.userId bukan user.id
        practiceId: submission.practice.id,
      },
    });

    if (!purchased || submission.user.id !== user.userId) {
      throw new Error("You are not authorized to view this submission.");
    }

    return submission;
  }

  // Role lain → tolak
  throw new Error("You are not authorized to view this submission.");
};

export const reviewPracticeSubmissionService = async ({
  id,
  userId,
  roles,
  mentorProfileId,
  status,
  kesesuaian,
  kualitas,
  kreativitas,
  kelengkapan,
  komentar,
  saran,
  perluRevisi,
}: {
  id: string;
  userId: string;
  roles: string[];
  mentorProfileId?: string | null;
  status?: string;
  kesesuaian?: string;
  kualitas?: string;
  kreativitas?: string;
  kelengkapan?: string;
  komentar?: string;
  saran?: string;
  perluRevisi?: boolean;
}) => {
  // Pastikan user valid
  if (!userId) throw new Error("Unauthorized: userId is required");

  // Ambil submission
  const submission = await prisma.practiceSubmission.findUnique({
    where: { id },
    include: {
      practice: { select: { id: true, mentorId: true } },
    },
  });

  if (!submission) throw new Error("Submission not found");

  // ADMIN atau MENTOR boleh review
  if (!roles.includes("admin") && !roles.includes("mentor")) {
    throw new Error(
      "Unauthorized: Only mentor or admin can review submissions"
    );
  }

  // MENTOR hanya bisa review submission practice miliknya
  if (roles.includes("mentor") && !roles.includes("admin")) {
    if (!mentorProfileId) throw new Error("Mentor profile not found");
    if (submission.practice.mentorId !== mentorProfileId) {
      throw new Error(
        "Unauthorized: You can only review submissions from your own practices"
      );
    }
  }

  // Data untuk diupdate
  const updateData: any = {
    reviewedById: userId,
    reviewedAt: new Date(),
  };

  if (status) updateData.status = status;
  if (kesesuaian) updateData.kesesuaian = kesesuaian;
  if (kualitas) updateData.kualitas = kualitas;
  if (kreativitas) updateData.kreativitas = kreativitas;
  if (kelengkapan) updateData.kelengkapan = kelengkapan;
  if (komentar) updateData.komentar = komentar;
  if (saran) updateData.saran = saran;
  if (typeof perluRevisi === "boolean") updateData.perluRevisi = perluRevisi;

  // Update data di database
  const updatedSubmission = await prisma.practiceSubmission.update({
    where: { id },
    data: updateData,
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      reviewer: { select: { id: true, fullName: true, email: true } },
      practice: { select: { id: true, title: true } },
    },
  });

  return updatedSubmission;
};

export const deletePracticeSubmissionService = async (
  id: string,
  user: { userId: string; roles: string[] }
) => {
  const submission = await prisma.practiceSubmission.findUnique({
    where: { id },
  });

  if (!submission) throw new Error("Submission not found");

  // 🔹 Hanya admin yang boleh hapus
  if (!user.roles.includes("admin")) {
    throw new Error("Unauthorized: Only admin can delete submissions");
  }

  await prisma.practiceSubmission.delete({ where: { id } });
};
