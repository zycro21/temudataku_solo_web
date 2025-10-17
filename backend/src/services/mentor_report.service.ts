import { PrismaClient, Prisma } from "@prisma/client";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import { customAlphabet } from "nanoid";

const prisma = new PrismaClient();

export const createMentorReport = async (
  userId: string,
  data: {
    sessionId: string;
    understanding: string;
    participation: string;
    challenges?: string;
    commonQuestions?: string;
    nextFocus?: string;
    additionalNotes?: string;
  }
) => {
  // Cari profil mentor berdasarkan userId
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });
  if (!mentorProfile) {
    throw new Error("Profil mentor tidak ditemukan");
  }

  // Pastikan session valid dan ambil list mentor yang menangani
  const session = await prisma.mentoringSession.findUnique({
    where: { id: data.sessionId },
    include: { mentors: true },
  });
  if (!session) {
    throw new Error("Sesi mentoring tidak ditemukan");
  }

  // Cek apakah mentor ini memang menangani sesi tersebut
  const isMentorAssigned = session.mentors.some(
    (m) => m.mentorProfileId === mentorProfile.id
  );
  if (!isMentorAssigned) {
    throw new Error(
      "Anda tidak memiliki akses untuk membuat laporan pada sesi ini"
    );
  }

  // Pastikan belum ada laporan dari mentor ini untuk sesi tersebut
  const existingReport = await prisma.mentorReport.findFirst({
    where: { sessionId: data.sessionId, mentorProfileId: mentorProfile.id },
  });
  if (existingReport) {
    throw new Error("Laporan untuk sesi ini sudah pernah dibuat");
  }

  // generator: huruf kapital + angka, panjang 5
  const nanoid = customAlphabet("1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6);

  function generateMentorReportId() {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `MR-${today}-${nanoid()}`;
  }

  // Buat laporan
  return prisma.mentorReport.create({
    data: {
      id: generateMentorReportId(),
      ...data,
      mentorProfileId: mentorProfile.id,
    },
  });
};

export const getMentorReports = async (
  userId: string,
  roles: string[],
  page: number,
  limit: number,
  filters?: {
    sessionId?: string;
    search?: string; // bisa untuk searching di kolom tertentu
  },
  sort?: {
    field?: "createdAt" | "updatedAt";
    order?: "asc" | "desc";
  }
) => {
  const skip = (page - 1) * limit;

  let where: any = {};
  // jika mentor → filter berdasarkan mentorProfileId
  if (roles.includes("mentor")) {
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });
    if (!mentorProfile) {
      throw new Error("Profil mentor tidak ditemukan");
    }
    where.mentorProfileId = mentorProfile.id;
  }

  // filtering tambahan
  if (filters?.sessionId) {
    where.sessionId = filters.sessionId;
  }
  if (filters?.search) {
    where.OR = [
      { understanding: { contains: filters.search, mode: "insensitive" } },
      { participation: { contains: filters.search, mode: "insensitive" } },
      { challenges: { contains: filters.search, mode: "insensitive" } },
      { commonQuestions: { contains: filters.search, mode: "insensitive" } },
      { nextFocus: { contains: filters.search, mode: "insensitive" } },
      { additionalNotes: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const orderBy: any = {
    [sort?.field || "createdAt"]: sort?.order || "desc",
  };

  const [reports, total] = await Promise.all([
    prisma.mentorReport.findMany({
      where,
      include: { session: true, mentorProfile: true },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.mentorReport.count({ where }),
  ]);

  return {
    data: reports,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getMentorReportById = async (
  userId: string,
  roles: string[],
  id: string
) => {
  // kalau admin → ambil report apa saja
  if (roles.includes("admin")) {
    const report = await prisma.mentorReport.findUnique({
      where: { id },
      include: { session: true, mentorProfile: true },
    });
    if (!report) throw new Error("Laporan mentor tidak ditemukan");
    return report;
  }

  // kalau mentor → cek kepemilikan
  if (roles.includes("mentor")) {
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });
    if (!mentorProfile) throw new Error("Profil mentor tidak ditemukan");

    const report = await prisma.mentorReport.findFirst({
      where: { id, mentorProfileId: mentorProfile.id },
      include: { session: true, mentorProfile: true },
    });
    if (!report) {
      throw new Error(
        "Laporan mentor tidak ditemukan atau Anda tidak memiliki akses"
      );
    }
    return report;
  }

  throw new Error("Anda tidak memiliki izin untuk melihat laporan ini");
};

export const updateMentorReport = async (
  userId: string,
  id: string,
  data: Partial<{
    understanding: string;
    participation: string;
    challenges?: string;
    commonQuestions?: string;
    nextFocus?: string;
    additionalNotes?: string;
  }>
) => {
  // Cari profil mentor
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });
  if (!mentorProfile) {
    throw new Error("Profil mentor tidak ditemukan");
  }

  // Cari report
  const report = await prisma.mentorReport.findFirst({
    where: { id, mentorProfileId: mentorProfile.id },
    include: { session: { include: { mentors: true } } },
  });
  if (!report) {
    throw new Error("Laporan mentor tidak ditemukan");
  }

  // Validasi apakah mentor memang bagian dari sesi
  const isMentorAssigned = report.session.mentors.some(
    (m) => m.mentorProfileId === mentorProfile.id
  );
  if (!isMentorAssigned) {
    throw new Error("Anda tidak memiliki akses untuk memperbarui laporan ini");
  }

  // Update report (partial)
  return prisma.mentorReport.update({
    where: { id },
    data,
  });
};

export const deleteMentorReport = async (
  userId: string,
  roles: string[],
  reportId: string
) => {
  // kalau admin, langsung hapus report apapun
  if (roles.includes("admin")) {
    const report = await prisma.mentorReport.findUnique({
      where: { id: reportId },
    });
    if (!report) {
      throw new Error("Laporan mentor tidak ditemukan");
    }
    await prisma.mentorReport.delete({ where: { id: reportId } });
    return { message: "Laporan mentor berhasil dihapus (oleh admin)" };
  }

  // kalau mentor, cek kepemilikan
  if (roles.includes("mentor")) {
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });
    if (!mentorProfile) {
      throw new Error("Profil mentor tidak ditemukan");
    }

    const report = await prisma.mentorReport.findFirst({
      where: { id: reportId, mentorProfileId: mentorProfile.id },
    });
    if (!report) {
      throw new Error(
        "Laporan mentor tidak ditemukan atau Anda tidak memiliki akses"
      );
    }

    await prisma.mentorReport.delete({ where: { id: reportId } });
    return { message: "Laporan mentor berhasil dihapus (oleh mentor)" };
  }

  throw new Error("Anda tidak memiliki izin untuk menghapus laporan ini");
};

export const exportMentorReportsToFile = async (formatType: string) => {
  const reports = await prisma.mentorReport.findMany({
    include: {
      mentorProfile: {
        include: {
          user: true,
        },
      },
      session: {
        include: {
          mentoringService: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const rows = reports.map((r) => ({
    ID: r.id,
    Mentor: r.mentorProfile.user.fullName,
    MentorEmail: r.mentorProfile.user.email,
    MentorProfileID: r.mentorProfileId,
    SessionID: r.sessionId,
    ServiceName: r.session.mentoringService.serviceName,
    SessionDate: r.session.date,
    SessionTime: `${r.session.startTime} - ${r.session.endTime}`,
    Understanding: r.understanding || "",
    Participation: r.participation || "",
    Challenges: r.challenges || "",
    CommonQuestions: r.commonQuestions || "",
    NextFocus: r.nextFocus || "",
    AdditionalNotes: r.additionalNotes || "",
    CreatedAt: format(r.createdAt, "yyyy-MM-dd HH:mm"),
  }));

  const dateStr = format(new Date(), "yyyyMMdd-HHmmss");
  const baseFileName = `mentor-reports-${dateStr}`;

  if (formatType === "excel") {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("MentorReports");

    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
    }));

    rows.forEach((row) => worksheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      buffer,
      fileName: `${baseFileName}.xlsx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  } else {
    const parser = new Parser();
    const csv = parser.parse(rows);
    return {
      buffer: Buffer.from(csv, "utf-8"),
      fileName: `${baseFileName}.csv`,
      mimeType: "text/csv",
    };
  }
};

export const getMentorReportsBySessionId = async (
  userId: string,
  roles: string[],
  sessionId: string
) => {
  // kalau admin → ambil semua laporan mentor untuk sessionId
  if (roles.includes("admin")) {
    const reports = await prisma.mentorReport.findMany({
      where: { sessionId },
      include: {
        session: true,
        mentorProfile: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!reports.length) throw new Error("Laporan mentor tidak ditemukan");
    return reports;
  }

  // kalau mentor → ambil hanya miliknya sendiri
  if (roles.includes("mentor")) {
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });
    if (!mentorProfile) throw new Error("Profil mentor tidak ditemukan");

    const reports = await prisma.mentorReport.findMany({
      where: { sessionId, mentorProfileId: mentorProfile.id },
      include: {
        session: true,
        mentorProfile: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!reports.length) {
      throw new Error(
        "Laporan mentor tidak ditemukan atau Anda tidak memiliki akses"
      );
    }
    return reports;
  }

  throw new Error("Anda tidak memiliki izin untuk melihat laporan ini");
};

export const getMentorReportsByMentorProfileId = async (
  roles: string[],
  mentorProfileId: string
) => {
  // hanya admin yang boleh
  if (!roles.includes("admin")) {
    throw new Error("Anda tidak memiliki izin untuk melihat laporan ini");
  }

  const reports = await prisma.mentorReport.findMany({
    where: { mentorProfileId },
    include: {
      session: true,
      mentorProfile: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!reports.length) {
    throw new Error("Laporan mentor tidak ditemukan");
  }

  return reports;
};
