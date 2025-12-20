import { PrismaClient, Prisma } from "@prisma/client";
import { Parser as Json2CsvParser } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate, subDays } from "date-fns";
import { Buffer } from "buffer";
import path from "path";
import { comparePlagiarismScore } from "../utils/plagiarism.js";

const prisma = new PrismaClient();

export const createProject = async ({
  serviceId,
  title,
  description,
  userId,
  roles,
}: {
  serviceId: string;
  title: string;
  description?: string;
  userId: string;
  roles: string[];
}) => {
  // 1. Validasi mentoring service ada
  const service = await prisma.mentoringService.findUnique({
    where: { id: serviceId },
    include: {
      mentors: {
        select: {
          mentorProfile: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!service) {
    throw new Error("Mentoring service tidak ditemukan");
  }

  // 2. Jika bukan admin, cek apakah user adalah mentor di mentoring service tsb
  const isAdmin = roles.includes("admin");

  if (!isAdmin) {
    const isAuthorizedMentor = service.mentors.some(
      (m) => m.mentorProfile.userId === userId
    );

    if (!isAuthorizedMentor) {
      throw new Error(
        "Anda tidak memiliki akses untuk membuat project di service ini"
      );
    }
  }

  // 3. Generate custom project ID
  const serviceType =
    service.serviceType?.toLowerCase().replace(/\s+/g, "-") || "general";
  const date = formatDate(new Date(), "yyyyMMdd");
  const random = Math.floor(100000 + Math.random() * 900000); // 6 digit
  const customProjectId = `Project-${serviceType}-${date}-${random}`;

  // 4. Buat project baru
  const newProject = await prisma.project.create({
    data: {
      id: customProjectId,
      serviceId,
      title,
      description,
    },
  });

  return newProject;
};

export const updateProject = async ({
  projectId,
  title,
  description,
  userId,
  roles,
}: {
  projectId: string;
  title?: string;
  description?: string;
  userId: string;
  roles: string[];
}) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      mentoringService: {
        include: {
          mentors: {
            select: {
              mentorProfile: {
                select: { userId: true },
              },
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project tidak ditemukan");
  }

  const isAdmin = roles.includes("admin");

  if (!isAdmin) {
    const isAuthorizedMentor = project.mentoringService.mentors.some(
      (m) => m.mentorProfile.userId === userId
    );
    if (!isAuthorizedMentor) {
      throw new Error(
        "Anda tidak memiliki akses untuk memperbarui project ini"
      );
    }
  }

  const isTitleChanged = title !== undefined && title !== project.title;
  const isDescriptionChanged =
    description !== undefined && description !== project.description;

  if (!isTitleChanged && !isDescriptionChanged) {
    return { noChange: true, project };
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      title: isTitleChanged ? title : undefined,
      description: isDescriptionChanged ? description : undefined,
      updatedAt: new Date(),
    },
  });

  return { noChange: false, project: updatedProject };
};

export const deleteProject = async (projectId: string) => {
  // 1. Cek apakah project ada
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project tidak ditemukan");
  }

  // 2. Hapus project
  await prisma.project.delete({
    where: { id: projectId },
  });
};

export const getAllProjects = async ({
  page,
  limit,
  search,
  serviceId,
  sortBy,
  sortOrder,
}: {
  page: number;
  limit: number;
  search?: string;
  serviceId?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }
  if (serviceId) {
    where.serviceId = serviceId;
  }

  const [total, projects] = await prisma.$transaction([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: {
        mentoringService: true,
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
  ]);

  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    projects,
  };
};

export const getProjectDetail = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      mentoringService: true,
      submissions: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePicture: true,
            },
          },
          gradedByUser: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          session: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project tidak ditemukan");
  }

  return project;
};

export const getMentorProjects = async (
  userId: string,
  page: number,
  limit: number
) => {
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!mentorProfile) {
    throw new Error("Profil mentor tidak ditemukan");
  }

  const mentorProfileId = mentorProfile.id;

  const services = await prisma.mentoringServiceMentor.findMany({
    where: { mentorProfileId },
    select: { mentoringServiceId: true },
  });

  if (services.length === 0) {
    throw new Error("Mentor belum terhubung ke layanan manapun");
  }

  const serviceIds = services.map((s) => s.mentoringServiceId);

  const skip = (page - 1) * limit;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: { serviceId: { in: serviceIds } },
      include: { mentoringService: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.project.count({
      where: { serviceId: { in: serviceIds } },
    }),
  ]);

  if (projects.length === 0) {
    throw new Error("Belum ada proyek di layanan service mentoring Anda");
  }

  return {
    data: projects,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getMentorProjectDetail = async (
  userId: string,
  projectId: string
) => {
  // Ambil mentor profile
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!mentorProfile) {
    throw new Error("Profil mentor tidak ditemukan");
  }

  const mentorProfileId = mentorProfile.id;

  // Ambil semua service yang diikuti mentor
  const services = await prisma.mentoringServiceMentor.findMany({
    where: { mentorProfileId },
    select: { mentoringServiceId: true },
  });

  const serviceIds = services.map((s) => s.mentoringServiceId);

  // Cek apakah projectId termasuk dalam mentoring service mentor
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      serviceId: { in: serviceIds },
    },
    include: {
      mentoringService: true,
      submissions: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePicture: true,
            },
          },
          session: true,
          gradedByUser: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { submissionDate: "desc" },
      },
    },
  });

  if (!project) {
    throw new Error(
      "Proyek tidak ditemukan atau tidak termasuk dalam service mentoring Anda"
    );
  }

  return project;
};

export const getUniqueMentees = async (userId: string) => {
  // cari mentor profile berdasarkan userId
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!mentorProfile) {
    throw new Error("Profil mentor tidak ditemukan");
  }

  const mentorProfileId = mentorProfile.id;

  // ambil semua mentoring service yang dimiliki mentor ini
  const services = await prisma.mentoringServiceMentor.findMany({
    where: { mentorProfileId },
    select: { mentoringServiceId: true },
  });

  if (services.length === 0) {
    throw new Error("Mentor belum terhubung ke layanan manapun");
  }

  const serviceIds = services.map((s) => s.mentoringServiceId);

  // ambil semua project dari mentoring services
  const projects = await prisma.project.findMany({
    where: { serviceId: { in: serviceIds } },
    select: { id: true },
  });

  if (projects.length === 0) {
    throw new Error("Belum ada proyek di layanan service mentoring Anda");
  }

  const projectIds = projects.map((p) => p.id);

  // hitung distinct menteeId dari submissions di semua project
  const uniqueMentees = await prisma.projectSubmission.findMany({
    where: { projectId: { in: projectIds } },
    distinct: ["menteeId"],
    select: { menteeId: true },
  });

  return uniqueMentees.length;
};

export const getMenteeProjects = async ({
  userId,
  search,
  sortBy,
  sortOrder,
  page,
  limit,
}: {
  userId: string;
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}) => {
  // Ambil semua serviceId yang pernah dibooking mentee ini
  const bookings = await prisma.booking.findMany({
    where: { menteeId: userId },
    select: { mentoringServiceId: true },
  });

  const bookedServiceIds = bookings.map((b) => b.mentoringServiceId);

  // Pagination
  const skip = (page - 1) * limit;

  // Query proyek berdasarkan service yang pernah dibooking
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: {
        serviceId: { in: bookedServiceIds },
        ...(search && {
          title: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
      include: {
        mentoringService: {
          select: {
            id: true,
            serviceName: true,
            serviceType: true,
            durationDays: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.project.count({
      where: {
        serviceId: { in: bookedServiceIds },
        ...(search && {
          title: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: projects,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

export const getMenteeProjectDetail = async ({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) => {
  // Cari proyeknya dulu
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      mentoringService: {
        select: {
          id: true,
          serviceName: true,
          serviceType: true,
          durationDays: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Proyek tidak ditemukan");
  }

  // Cek apakah mentee punya akses (pernah booking service-nya)
  const isBooked = await prisma.booking.findFirst({
    where: {
      menteeId: userId,
      mentoringServiceId: project.serviceId,
    },
  });

  if (!isBooked) {
    throw new Error("Kamu tidak memiliki akses ke proyek ini");
  }

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    createdAt: project.createdAt,
    mentoringService: project.mentoringService,
  };
};

export const exportProjects = async ({
  format,
}: {
  format: "csv" | "excel";
}) => {
  const projects = await prisma.project.findMany({
    include: {
      mentoringService: true,
      submissions: {
        include: {
          user: true,
        },
      },
    },
  });

  const exportData = projects.map((p) => ({
    projectId: p.id,
    title: p.title,
    description: p.description || "",
    createdAt: p.createdAt?.toISOString(),
    serviceName: p.mentoringService.serviceName,
    serviceType: p.mentoringService.serviceType,
    totalSubmissions: p.submissions.length,
  }));

  const timestamp = formatDate(new Date(), "yyyyMMdd-HHmmss");
  const fileName = `project-export-${timestamp}.${
    format === "csv" ? "csv" : "xlsx"
  }`;

  if (format === "csv") {
    const parser = new Json2CsvParser();
    const csv = parser.parse(exportData);
    return {
      buffer: Buffer.from(csv),
      fileName,
      contentType: "text/csv",
    };
  } else {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Projects");

    sheet.columns = [
      { header: "Project ID", key: "projectId" },
      { header: "Title", key: "title" },
      { header: "Description", key: "description" },
      { header: "Created At", key: "createdAt" },
      { header: "Service Name", key: "serviceName" },
      { header: "Service Type", key: "serviceType" },
      { header: "Total Submissions", key: "totalSubmissions" },
    ];

    sheet.addRows(exportData);

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      buffer,
      fileName,
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }
};

function generateSubmissionId(menteeId: string, serviceId: string): string {
  const timestamp = formatDate(new Date(), "yyyyMMddHHmmss");
  return `Submission-${menteeId}-${serviceId}-${timestamp}`;
}

export const submit = async ({
  projectId,
  menteeId,
  filePaths,
  sessionId,
  title,
  projectLink,
}: {
  projectId: string;
  menteeId: string;
  filePaths: string[];
  sessionId?: string;
  title?: string;
  projectLink?: string;
}) => {
  // 1. Validasi project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { mentoringService: true },
  });
  if (!project) throw new Error("Proyek tidak ditemukan");

  // 2. Validasi booking
  const hasBooked = await prisma.booking.findFirst({
    where: {
      mentoringServiceId: project.serviceId,
      status: { in: ["confirmed", "completed"] },
      OR: [
        { menteeId },
        {
          participants: { some: { userId: menteeId } },
        },
      ],
    },
  });
  if (!hasBooked) throw new Error("Kamu belum pernah membooking layanan ini.");

  // 3. Cek existing submission
  const existing = await prisma.projectSubmission.findFirst({
    where: { projectId, menteeId },
  });
  if (existing) {
    throw new Error(
      "Kamu sudah pernah mengumpulkan submission untuk proyek ini."
    );
  }

  // 4. Generate ID
  const customId = generateSubmissionId(menteeId, project.serviceId);

  // 5. Validasi file dan hitung plagiarism score
  const validExtensions = [
    ".png",
    ".pdf",
    ".psd",
    ".xls",
    ".csv",
    ".docx",
    ".ipynb",
    ".pptx",
  ];

  const extensions = filePaths.map((file) => path.extname(file).toLowerCase());
  if (extensions.some((ext) => !validExtensions.includes(ext))) {
    throw new Error(
      "Format file tidak didukung. Gunakan salah satu dari: png, pdf, psd, xls, csv, docx, ipynb, pptx."
    );
  }

  if (!extensions.every((ext) => ext === extensions[0])) {
    throw new Error("Semua file harus memiliki tipe yang sama");
  }

  const extension = extensions[0];

  let plagiarismScore: number | null = null;

  // Jalankan plagiarism check hanya untuk .ipynb atau .pptx
  if ([".ipynb", ".pptx"].includes(extensions[0])) {
    try {
      const targetType = extensions[0] === ".pptx" ? "pptx" : "ipynb";
      plagiarismScore = await comparePlagiarismScore({
        projectId,
        currentFilePaths: filePaths,
        fileType: targetType,
      });
    } catch (err: any) {
      console.error("Error menghitung plagiarism score:", err.message);
      throw new Error("Gagal menghitung skor plagiarisme");
    }
  }

  // 6. Simpan ke DB
  const submission = await prisma.projectSubmission.create({
    data: {
      id: customId,
      projectId,
      menteeId,
      sessionId,
      title,
      projectLink,
      filePaths,
      plagiarismScore,
      reviewStatus: "PENDING",
    },
  });

  return submission;
};

export const revise = async ({
  submissionId,
  menteeId,
  title,
  projectLink,
  filePaths,
}: {
  submissionId: string;
  menteeId: string;
  title?: string;
  projectLink?: string;
  filePaths?: string[];
}) => {
  const submission = await prisma.projectSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) throw new Error("Submission tidak ditemukan");
  if (submission.menteeId !== menteeId)
    throw new Error("Kamu tidak berhak mengedit submission ini");
  if (submission.reviewStatus !== "REVISION_REQUIRED")
    throw new Error("Submission ini tidak memerlukan revisi");

  // Reset semua, pakai input baru atau kosongkan
  const updated = await prisma.projectSubmission.update({
    where: { id: submissionId },
    data: {
      title: title ?? "",
      projectLink: projectLink ?? "",
      filePaths: filePaths ?? [],
      reviewStatus: "PENDING",
      isReviewed: false,
      isRevisedRequired: false,
      updatedAt: new Date(),
    },
  });

  return updated;
};

export const reviewSubmission = async ({
  submissionId,
  mentorId,
  userId,
  role,
  score,
  briefScore,
  technicalScore,
  creativityScore,
  completenessScore,
  mentorFeedback,
  mentorSuggestion,
  isRevisedRequired,
  revisionDeadline,
  sessionId,
}: {
  submissionId: string;
  mentorId: string;
  userId: string;
  role: string;
  score?: number;
  briefScore?: string;
  technicalScore?: string;
  creativityScore?: string;
  completenessScore?: string;
  mentorFeedback: string;
  mentorSuggestion?: string;
  isRevisedRequired?: boolean;
  revisionDeadline?: string;
  sessionId?: string;
}) => {
  const submission = await prisma.projectSubmission.findUnique({
    where: { id: submissionId },
    include: {
      project: {
        include: {
          mentoringService: {
            include: { mentors: { include: { mentorProfile: true } } },
          },
        },
      },
    },
  });
  if (!submission) throw new Error("Submission tidak ditemukan.");

  const isMentorOfService = submission.project.mentoringService.mentors.some(
    (m) => m.mentorProfile?.id === mentorId
  );

  const isAdmin = Array.isArray(role) && role.includes("admin");

  if (!(isMentorOfService || isAdmin)) {
    throw new Error("Kamu tidak berhak menilai submission ini.");
  }

  // tentukan reviewStatus
  let reviewStatus: "REVIEWED" | "REVISION_REQUIRED" | "PENDING" = "PENDING";
  if (isRevisedRequired) {
    reviewStatus = "REVISION_REQUIRED";
  } else {
    reviewStatus = "REVIEWED";
  }

  const updated = await prisma.projectSubmission.update({
    where: { id: submissionId },
    data: {
      score: score ?? null, // opsional
      briefScore: briefScore ?? null,
      technicalScore: technicalScore ?? null,
      creativityScore: creativityScore ?? null,
      completenessScore: completenessScore ?? null,
      mentorFeedback,
      mentorSuggestion,
      isRevisedRequired: isRevisedRequired ?? false,
      revisionDeadline: isRevisedRequired ? new Date(revisionDeadline!) : null,
      reviewStatus,
      isReviewed: true,
      gradedBy: userId,
      sessionId: sessionId ?? submission.sessionId,
      updatedAt: new Date(),
    },
  });

  return updated;
};

export const getAdminSubmissions = async ({
  search,
  projectId,
  serviceId,
  isReviewed,
  sortBy,
  sortOrder,
  page,
  limit,
}: {
  search?: string;
  projectId?: string;
  serviceId?: string;
  isReviewed?: boolean;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}) => {
  const skip = (page - 1) * limit;

  const whereClause: any = {
    ...(projectId && { projectId }),
    ...(isReviewed !== undefined && { isReviewed }),
    ...(search && {
      user: {
        fullName: {
          contains: search,
          mode: "insensitive",
        },
      },
    }),
    ...(serviceId && {
      project: {
        serviceId,
      },
    }),
  };

  const [submissions, total] = await Promise.all([
    prisma.projectSubmission.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        gradedByUser: { select: { fullName: true } }, // <-- Tambahan
        project: {
          select: {
            id: true,
            title: true,
            mentoringService: {
              select: { id: true, serviceName: true, serviceType: true },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.projectSubmission.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Mapping reviewStatus ke statusDetail untuk FE
  const statusMap: Record<string, string> = {
    PENDING: "Belum Direview",
    REVIEWED: "Sudah Direview",
    REVISION_REQUIRED: "Revisi",
  };

  const formattedData = submissions.map((s) => ({
    id: s.id,
    mentee: s.user.fullName,
    mentor: s.gradedByUser?.fullName || "-", // Bisa kosong jika belum dinilai
    program: s.project.mentoringService.serviceName,
    date: s.submissionDate?.toISOString() || "",
    deadline: s.revisionDeadline?.toISOString() || "",
    projectFile: s.filePaths, // kirim semua file ke frontend
    topic: s.project.title,
    statusDetail: statusMap[s.reviewStatus],
    score: s.score?.toString() || "",
    document: s.projectLink || "",
  }));

  return {
    data: formattedData,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

export const getAdminSubmissionDetail = async (submissionId: string) => {
  const submission = await prisma.projectSubmission.findUnique({
    where: { id: submissionId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      project: {
        select: {
          id: true,
          title: true,
          description: true,
          mentoringService: {
            select: {
              id: true,
              serviceName: true,
              serviceType: true,
            },
          },
        },
      },
      gradedByUser: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return submission;
};

export const exportAdminSubmissions = async ({
  format,
}: {
  format: "csv" | "excel";
}) => {
  const submissions = await prisma.projectSubmission.findMany({
    include: {
      user: {
        select: { fullName: true, email: true },
      },
      project: {
        select: {
          title: true,
          mentoringService: { select: { serviceName: true } },
        },
      },
      gradedByUser: {
        select: { fullName: true, email: true },
      },
    },
  });

  const flatData = submissions.map((sub) => ({
    submissionId: sub.id,
    menteeName: sub.user?.fullName ?? "",
    menteeEmail: sub.user?.email ?? "",
    projectTitle: sub.project?.title ?? "",
    serviceName: sub.project?.mentoringService?.serviceName ?? "",
    submissionDate: sub.submissionDate?.toISOString() ?? "",
    plagiarismScore: sub.plagiarismScore ? sub.plagiarismScore.toString() : "",
    score: sub.score ? sub.score.toString() : "",
    briefScore: sub.briefScore ?? "",
    technicalScore: sub.technicalScore ?? "",
    creativityScore: sub.creativityScore ?? "",
    completenessScore: sub.completenessScore ?? "",
    mentorFeedback: sub.mentorFeedback ?? "",
    mentorSuggestion: sub.mentorSuggestion ?? "",
    isReviewed: sub.isReviewed ? "Yes" : "No",
    reviewStatus: sub.reviewStatus ?? "",
    isRevisedRequired: sub.isRevisedRequired ? "Yes" : "No",
    revisionDeadline: sub.revisionDeadline?.toISOString() ?? "",
    gradedBy: sub.gradedByUser
      ? `${sub.gradedByUser.fullName} (${sub.gradedByUser.email})`
      : "",
    createdAt: sub.createdAt?.toISOString() ?? "",
    updatedAt: sub.updatedAt?.toISOString() ?? "",
  }));

  const timestamp = formatDate(new Date(), "yyyyMMdd_HHmmss");

  if (format === "csv") {
    const parser = new Json2CsvParser();
    const csv = parser.parse(flatData);

    return {
      fileBuffer: Buffer.from(csv),
      filename: `submissions_${timestamp}.csv`,
      contentType: "text/csv",
    };
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Submissions");

  // Jika tidak ada data, pastikan ada kolom dummy agar worksheet.columns tidak kosong
  const columnsSource = flatData[0] || {
    submissionId: "",
    menteeName: "",
    menteeEmail: "",
    projectTitle: "",
    serviceName: "",
    submissionDate: "",
    plagiarismScore: "",
    score: "",
    briefScore: "",
    technicalScore: "",
    creativityScore: "",
    completenessScore: "",
    mentorFeedback: "",
    mentorSuggestion: "",
    isReviewed: "",
    reviewStatus: "",
    isRevisedRequired: "",
    revisionDeadline: "",
    gradedBy: "",
    createdAt: "",
    updatedAt: "",
  };

  worksheet.columns = Object.keys(columnsSource).map((key) => ({
    header: key,
    key,
    width: 20,
  }));

  worksheet.addRows(flatData);

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    fileBuffer: buffer,
    filename: `submissions_${timestamp}.xlsx`,
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
};

export const getMentorProjectSubmissionsService = async ({
  projectId,
  mentorProfileId,
}: {
  projectId: string;
  mentorProfileId?: string;
}) => {
  if (!mentorProfileId) {
    throw new Error("Mentor profile ID is required");
  }

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { id: mentorProfileId },
    include: {
      mentoringServices: {
        include: {
          mentoringService: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!mentorProfile) {
    throw new Error("Mentor profile not found");
  }

  const allowedServiceIds = mentorProfile.mentoringServices.map(
    (ms) => ms.mentoringService.id
  );

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { serviceId: true },
  });

  if (!project || !allowedServiceIds.includes(project.serviceId)) {
    throw new Error(
      "You are not authorized to access this project's submissions"
    );
  }

  const submissions = await prisma.projectSubmission.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
      gradedByUser: {
        select: {
          fullName: true,
        },
      },
    },
    orderBy: { submissionDate: "desc" },
  });

  return submissions.map((sub) => ({
    id: sub.id,
    menteeName: sub.user?.fullName,
    menteeEmail: sub.user?.email,
    title: sub.title,
    filePaths: sub.filePaths,
    projectLink: sub.projectLink,
    submissionDate: sub.submissionDate,
    plagiarismScore: sub.plagiarismScore,
    score: sub.score,
    briefScore: sub.briefScore,
    technicalScore: sub.technicalScore,
    creativityScore: sub.creativityScore,
    completenessScore: sub.completenessScore,
    mentorFeedback: sub.mentorFeedback,
    mentorSuggestion: sub.mentorSuggestion,
    isReviewed: sub.isReviewed,
    reviewStatus: sub.reviewStatus,
    isRevisedRequired: sub.isRevisedRequired,
    revisionDeadline: sub.revisionDeadline,
    gradedBy: sub.gradedBy,
    gradedByName: sub.gradedByUser?.fullName,
    createdAt: sub.createdAt,
    updatedAt: sub.updatedAt,
  }));
};

export const getMentorServiceSubmissionsService = async ({
  serviceId,
  mentorProfileId,
}: {
  serviceId: string;
  mentorProfileId?: string;
}) => {
  if (!mentorProfileId) {
    throw new Error("Mentor profile ID is required");
  }

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { id: mentorProfileId },
    include: {
      mentoringServices: {
        include: {
          mentoringService: { select: { id: true } },
        },
      },
    },
  });

  if (!mentorProfile) {
    throw new Error("Mentor profile not found");
  }

  const allowedServiceIds = mentorProfile.mentoringServices.map(
    (ms) => ms.mentoringService.id
  );

  if (!allowedServiceIds.includes(serviceId)) {
    throw new Error(
      "You are not authorized to access this service's submissions"
    );
  }

  const submissions = await prisma.projectSubmission.findMany({
    where: {
      project: {
        serviceId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePicture: true,
        },
      },
      gradedByUser: {
        select: { fullName: true },
      },
      project: {
        include: {
          mentoringService: {
            select: {
              id: true,
              serviceName: true,
              description: true,
              price: true,
              serviceType: true,
              maxParticipants: true,
              durationDays: true,
              benefits: true,
              mechanism: true,
              syllabusPath: true,
              toolsUsed: true,
              targetAudience: true,
              schedule: true,
              alumniPortfolio: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
    orderBy: { submissionDate: "desc" },
  });

  return submissions.map((sub) => ({
    id: sub.id,
    menteeId: sub.user?.id,
    menteeName: sub.user?.fullName,
    menteeEmail: sub.user?.email,
    menteePhoto: sub.user?.profilePicture,
    projectId: sub.project?.id,
    projectTitle: sub.project?.title,
    projectDescription: sub.project?.description,
    projectCreatedAt: sub.project?.createdAt,
    projectUpdatedAt: sub.project?.updatedAt,
    mentoringService: sub.project?.mentoringService
      ? {
          id: sub.project.mentoringService.id,
          serviceName: sub.project.mentoringService.serviceName,
          description: sub.project.mentoringService.description,
          price: sub.project.mentoringService.price,
          serviceType: sub.project.mentoringService.serviceType,
          maxParticipants: sub.project.mentoringService.maxParticipants,
          durationDays: sub.project.mentoringService.durationDays,
          benefits: sub.project.mentoringService.benefits,
          mechanism: sub.project.mentoringService.mechanism,
          syllabusPath: sub.project.mentoringService.syllabusPath,
          toolsUsed: sub.project.mentoringService.toolsUsed,
          targetAudience: sub.project.mentoringService.targetAudience,
          schedule: sub.project.mentoringService.schedule,
          alumniPortfolio: sub.project.mentoringService.alumniPortfolio,
          isActive: sub.project.mentoringService.isActive,
          createdAt: sub.project.mentoringService.createdAt,
          updatedAt: sub.project.mentoringService.updatedAt,
        }
      : null,
    title: sub.title,
    filePaths: sub.filePaths,
    projectLink: sub.projectLink,
    submissionDate: sub.submissionDate,
    plagiarismScore: sub.plagiarismScore,
    score: sub.score,
    briefScore: sub.briefScore,
    technicalScore: sub.technicalScore,
    creativityScore: sub.creativityScore,
    completenessScore: sub.completenessScore,
    mentorFeedback: sub.mentorFeedback,
    mentorSuggestion: sub.mentorSuggestion,
    isReviewed: sub.isReviewed,
    reviewStatus: sub.reviewStatus,
    isRevisedRequired: sub.isRevisedRequired,
    revisionDeadline: sub.revisionDeadline,
    gradedBy: sub.gradedBy,
    gradedByName: sub.gradedByUser?.fullName,
    createdAt: sub.createdAt,
    updatedAt: sub.updatedAt,
  }));
};

export const getMentorSubmissionDetailService = async ({
  submissionId,
  mentorProfileId,
}: {
  submissionId: string;
  mentorProfileId?: string;
}) => {
  if (!mentorProfileId) {
    throw new Error("Mentor profile ID is required");
  }

  const submission = await prisma.projectSubmission.findUnique({
    where: { id: submissionId },
    include: {
      project: {
        include: {
          mentoringService: {
            select: { id: true },
          },
        },
      },
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
      gradedByUser: {
        select: {
          fullName: true,
        },
      },
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  // cek akses mentor
  const mentorServiceAccess = await prisma.mentoringServiceMentor.findFirst({
    where: {
      mentorProfileId,
      mentoringServiceId: submission.project.mentoringService.id,
    },
  });

  if (!mentorServiceAccess) {
    throw new Error("You are not authorized to view this submission");
  }

  return {
    id: submission.id,
    projectId: submission.projectId,
    title: submission.title,
    filePaths: submission.filePaths,
    projectLink: submission.projectLink,
    submissionDate: submission.submissionDate,
    plagiarismScore: submission.plagiarismScore,
    score: submission.score,
    briefScore: submission.briefScore,
    technicalScore: submission.technicalScore,
    creativityScore: submission.creativityScore,
    completenessScore: submission.completenessScore,
    mentorFeedback: submission.mentorFeedback,
    mentorSuggestion: submission.mentorSuggestion,
    isReviewed: submission.isReviewed,
    reviewStatus: submission.reviewStatus,
    isRevisedRequired: submission.isRevisedRequired,
    revisionDeadline: submission.revisionDeadline,
    gradedBy: submission.gradedBy,
    gradedByName: submission.gradedByUser?.fullName,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
    mentee: {
      name: submission.user?.fullName,
      email: submission.user?.email,
    },
  };
};

export const getMenteeSubmissionsService = async ({
  menteeId,
  page,
  limit,
}: {
  menteeId?: string;
  page: number;
  limit: number;
}) => {
  if (!menteeId) throw new Error("User not authenticated");

  const bookings = await prisma.booking.findMany({
    where: {
      menteeId,
      status: { in: ["confirmed", "completed"] },
    },
    select: { mentoringServiceId: true },
  });

  const allowedServiceIds = bookings.map((b) => b.mentoringServiceId);
  if (allowedServiceIds.length === 0) {
    return { data: [], page, total: 0, totalPage: 0 };
  }

  const allowedProjects = await prisma.project.findMany({
    where: { serviceId: { in: allowedServiceIds } },
    select: { id: true },
  });

  const allowedProjectIds = allowedProjects.map((p) => p.id);

  const total = await prisma.projectSubmission.count({
    where: {
      menteeId,
      projectId: { in: allowedProjectIds },
    },
  });

  const submissions = await prisma.projectSubmission.findMany({
    where: {
      menteeId,
      projectId: { in: allowedProjectIds },
    },
    include: {
      project: { select: { title: true } },
      gradedByUser: { select: { id: true, fullName: true, email: true } },
    },
    orderBy: {
      submissionDate: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  const totalPage = Math.ceil(total / limit);

  return {
    data: submissions.map((sub) => ({
      id: sub.id,
      projectTitle: sub.project.title,
      title: sub.title,
      filePaths: sub.filePaths,
      projectLink: sub.projectLink,
      submissionDate: sub.submissionDate,
      plagiarismScore: sub.plagiarismScore,
      score: sub.score,
      briefScore: sub.briefScore,
      technicalScore: sub.technicalScore,
      creativityScore: sub.creativityScore,
      completenessScore: sub.completenessScore,
      mentorFeedback: sub.mentorFeedback,
      mentorSuggestion: sub.mentorSuggestion,
      isReviewed: sub.isReviewed,
      reviewStatus: sub.reviewStatus,
      isRevisedRequired: sub.isRevisedRequired,
      revisionDeadline: sub.revisionDeadline,
      gradedBy: sub.gradedByUser
        ? {
            id: sub.gradedByUser.id,
            fullName: sub.gradedByUser.fullName,
            email: sub.gradedByUser.email,
          }
        : null,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    })),
    total,
    page,
    totalPage,
  };
};

export const getMenteeSubmissionDetailService = async ({
  id,
  menteeId,
}: {
  id: string;
  menteeId?: string;
}) => {
  if (!menteeId) throw new Error("User not authenticated");

  const submission = await prisma.projectSubmission.findFirst({
    where: {
      id,
      menteeId, // hanya submission milik mentee tsb
    },
    include: {
      project: { select: { title: true } },
      gradedByUser: { select: { id: true, fullName: true, email: true } },
    },
  });

  if (!submission) {
    throw new Error("Submission not found or not accessible");
  }

  return {
    id: submission.id,
    projectTitle: submission.project.title,
    title: submission.title,
    filePaths: submission.filePaths,
    projectLink: submission.projectLink,
    submissionDate: submission.submissionDate,
    plagiarismScore: submission.plagiarismScore,
    score: submission.score,
    briefScore: submission.briefScore,
    technicalScore: submission.technicalScore,
    creativityScore: submission.creativityScore,
    completenessScore: submission.completenessScore,
    mentorFeedback: submission.mentorFeedback,
    mentorSuggestion: submission.mentorSuggestion,
    isReviewed: submission.isReviewed,
    reviewStatus: submission.reviewStatus,
    isRevisedRequired: submission.isRevisedRequired,
    revisionDeadline: submission.revisionDeadline,
    gradedBy: submission.gradedByUser
      ? {
          id: submission.gradedByUser.id,
          fullName: submission.gradedByUser.fullName,
          email: submission.gradedByUser.email,
        }
      : null,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  };
};

export const getProjectStats = async () => {
  const [
    totalProject,
    totalSubmission,
    reviewedSubmission,
    notReviewedSubmission,
    projectWithSubmission,
  ] = await prisma.$transaction([
    // Total Project
    prisma.project.count(),

    // Total submission (Sudah Mengirim)
    prisma.projectSubmission.count(),

    // Submission sudah direview
    prisma.projectSubmission.count({
      where: {
        reviewStatus: "REVIEWED",
      },
    }),

    // Submission belum direview
    prisma.projectSubmission.count({
      where: {
        reviewStatus: "PENDING",
      },
    }),

    // Project yang punya minimal 1 submission
    prisma.project.count({
      where: {
        submissions: {
          some: {},
        },
      },
    }),
  ]);

  const notSubmitted = totalProject - projectWithSubmission;

  return {
    totalProject,
    submitted: totalSubmission,
    notSubmitted: notSubmitted < 0 ? 0 : notSubmitted,
    reviewed: reviewedSubmission,
    notReviewed: notReviewedSubmission,
  };
};

export const deleteSubmission = async ({
  submissionId,
  mentorId,
  role,
}: {
  submissionId: string;
  mentorId?: string;
  role: string[];
}) => {
  const submission = await prisma.projectSubmission.findUnique({
    where: { id: submissionId },
    include: {
      project: {
        include: {
          mentoringService: {
            include: { mentors: { include: { mentorProfile: true } } },
          },
        },
      },
    },
  });

  if (!submission) {
    throw new Error("Submission tidak ditemukan.");
  }

  const isMentorOfService =
    mentorId &&
    submission.project.mentoringService.mentors.some(
      (m) => m.mentorProfile?.id === mentorId
    );

  const isAdmin = role.includes("admin");

  if (!(isMentorOfService || isAdmin)) {
    throw new Error("Kamu tidak berhak menghapus submission ini.");
  }

  await prisma.projectSubmission.delete({
    where: { id: submissionId },
  });

  return true;
};
