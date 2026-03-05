import { PrismaClient, Prisma } from "@prisma/client";
import { Parser as Json2CsvParser } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate, subDays } from "date-fns";
import { Buffer } from "buffer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { uploadToGoogleDrive } from "../utils/googleDrive.js";
import QRCode from "qrcode";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateQRCodeBuffer(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: "png",
    width: 300,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}

function formatIssueDate(date: string | Date): string {
  const d = new Date(date);

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Helper function to generate PDF
async function generateCertificatePDF({
  certificateNumber,
  menteeName,
  serviceName,
  serviceType,
  issueDate,
  pdfPath,
  projects,
}: {
  certificateNumber: string;
  menteeName: string;
  serviceName: string;
  serviceType?: string;
  issueDate: string;
  pdfPath: string;
  projects: {
    title: string;
    grade?: string;
    feedback?: string;
    mentorName?: string;
  }[];
}): Promise<void> {
  const frontendCertificateUrl = `https://frontend-domain.com/certificate/${certificateNumber}`;
  const qrBuffer = await generateQRCodeBuffer(frontendCertificateUrl);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 40,
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    const fontDir = path.join(__dirname, "../../assets/fonts");

    doc.registerFont("Poppins", path.join(fontDir, "Poppins-Regular.ttf"));
    doc.registerFont("Poppins-Bold", path.join(fontDir, "Poppins-Bold.ttf"));
    doc.registerFont(
      "Poppins-SemiBold",
      path.join(fontDir, "Poppins-SemiBold.ttf")
    );

    // Colors
    const primaryColor = "#003087"; // Navy blue
    const accentColor = "#FFD700"; // Gold
    const textColor = "#000000"; // Black
    const secondaryTextColor = "#333333"; // Dark gray
    const tableHeaderBg = "#F5F5F5"; // Light gray

    // Fonts
    const fontRegular = "Poppins";
    const fontBold = "Poppins-Bold";
    const fontSemiBold = "Poppins-SemiBold";

    // ---------------------------
    // Page 1 - Certificate (NEW DESIGN)
    // ---------------------------

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#FFFFFF");

    // ===== LEFT DECORATION STRIP =====
    doc.rect(0, 0, 90, doc.page.height).fill("#0A2A66");

    // Accent shapes
    doc.circle(45, 120, 25).fill("#00C2A8");
    doc.circle(45, 180, 12).fill("#FFFFFF");

    // ===== HEADER =====
    doc
      .font(fontBold)
      .fontSize(28)
      .fillColor("#00A859")
      .text("CERTIFICATE", 120, 80, { align: "left" });

    doc
      .font(fontRegular)
      .fontSize(16)
      .fillColor("#000000")
      .text("Of Completion", 120, 115, { align: "left" });

    // Logo kanan atas
    const logoPath = path.join(__dirname, "../../assets/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width - 200, 60, { width: 150 });
    }

    // ===== BODY TEXT =====
    doc
      .font(fontRegular)
      .fontSize(14)
      .fillColor("#333333")
      .text("This Certificate is Proudly Presented to", 120, 180);

    // Mentee Name (Highlight)
    doc
      .font(fontSemiBold)
      .fontSize(26)
      .fillColor("#0A2A66")
      .text(menteeName, 120, 210);

    // Subtitle (Service Type – dynamic)
    doc
      .font(fontRegular)
      .fontSize(14)
      .fillColor("#333333")
      .text(`Has Completed in ${serviceType ?? "Program"}`, 120, 260);

    // Service Name
    doc
      .font(fontBold)
      .fontSize(22)
      .fillColor("#00A859")
      .text(serviceName, 120, 290);

    // ===== SIGNATURE =====
    const signaturePath = path.join(__dirname, "../../assets/signature.png");
    if (fs.existsSync(signaturePath)) {
      doc.image(signaturePath, 120, 360, { width: 160 });
    }

    doc
      .font(fontRegular)
      .fontSize(12)
      .fillColor("#000000")
      .text("Example", 120, 440);

    doc
      .font(fontSemiBold)
      .fontSize(12)
      .fillColor("#000000")
      .text("CEO TemuDataku", 120, 460);

    // ===== QR CODE =====
    doc.image(qrBuffer, doc.page.width - 260, doc.page.height - 300, {
      width: 150,
    });

    // Certificate number
    doc
      .font(fontRegular)
      .fontSize(10)
      .fillColor("#333333")
      .text(certificateNumber, doc.page.width - 260, doc.page.height - 140, {
        width: 150,
        align: "center",
      });

    // Issue date
    doc
      .font(fontRegular)
      .fontSize(12)
      .fillColor("#666666")
      .text(
        formatIssueDate(issueDate),
        doc.page.width - 260,
        doc.page.height - 125,
        {
          width: 150,
          align: "center",
        }
      );

    // ---------------------------
    // Page 2 - Project Table (Landscape)
    // ---------------------------
    doc.addPage({ size: "A4", layout: "landscape", margin: 40 });

    doc
      .rect(0, 0, doc.page.width, doc.page.height)
      .fillOpacity(0.1)
      .fill("#E6E6FA")
      .fillOpacity(1);

    // Title
    doc
      .font(fontBold)
      .fontSize(20)
      .fillColor(primaryColor)
      .text("Project Summary", 40, 50, { align: "left" });

    const tableTop = 80;
    const rowHeight = 30;
    const colWidths = [50, 300, 100, 250, 100];
    const tableWidth = colWidths.reduce((sum, w) => sum + w, 0);
    const tableLeft = (doc.page.width - tableWidth) / 2;

    const drawRow = (
      y: number,
      values: string[],
      bold = false,
      isHeader = false
    ) => {
      doc
        .font(bold ? fontSemiBold : fontRegular)
        .fontSize(10)
        .fillColor(isHeader ? primaryColor : textColor);

      if (isHeader) {
        doc
          .rect(tableLeft, y, tableWidth, rowHeight)
          .fill(tableHeaderBg)
          .fillColor(primaryColor);
      }

      let x = tableLeft;
      values.forEach((value, i) => {
        const width = colWidths[i];
        doc.text(value, x + 5, y + 8, {
          width: width - 10,
          height: rowHeight - 10,
          align: "left",
        });
        x += width;
      });

      // Table borders
      x = tableLeft;
      for (let i = 0; i <= colWidths.length; i++) {
        doc
          .moveTo(x, y)
          .lineTo(x, y + rowHeight)
          .stroke(secondaryTextColor);
        x += colWidths[i] || 0;
      }

      doc
        .moveTo(tableLeft, y)
        .lineTo(tableLeft + tableWidth, y)
        .stroke(secondaryTextColor);

      doc
        .moveTo(tableLeft, y + rowHeight)
        .lineTo(tableLeft + tableWidth, y + rowHeight)
        .stroke(secondaryTextColor);
    };

    // Header
    drawRow(
      tableTop,
      ["No", "Project Title", "Grade", "Mentor Feedback", "Mentor"],
      true,
      true
    );

    // Rows
    if (projects.length > 0) {
      projects.forEach((project, index) => {
        drawRow(tableTop + rowHeight * (index + 1), [
          (index + 1).toString(),
          project.title || "-",
          project.grade || "-",
          project.feedback || "-",
          project.mentorName || "-",
        ]);
      });
    } else {
      doc
        .font(fontRegular)
        .fontSize(12)
        .fillColor(secondaryTextColor)
        .text("No projects submitted", tableLeft, tableTop + rowHeight + 10);
    }

    // Footer
    doc
      .font(fontRegular)
      .fontSize(10)
      .fillColor(secondaryTextColor)
      .text("Page 2 of 2 - TemuDataku", 0, doc.page.height - 20, {
        align: "center",
      });

    doc.end();

    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}

export const generateCertificateService = async ({
  menteeId,
  serviceId,
}: {
  menteeId: string;
  serviceId: string;
}) => {
  // Cek apakah certificate sudah ada
  const existingCertificate = await prisma.certificate.findUnique({
    where: {
      menteeId_serviceId: { menteeId, serviceId },
    },
  });

  if (existingCertificate) {
    throw new Error("Certificate already exists for this mentee and service");
  }

  // Ambil data mentee dan service
  const mentee = await prisma.user.findUnique({
    where: { id: menteeId },
    select: { fullName: true, email: true },
  });

  const service = await prisma.mentoringService.findUnique({
    where: { id: serviceId },
    select: {
      serviceName: true,
      serviceType: true,
      durationDays: true,
    },
  });

  if (!mentee || !service) {
    throw new Error("Mentee or service not found");
  }

  // Validasi keterlibatan mentee dalam booking yang aktif
  const hasBooked = await prisma.bookingParticipant.findFirst({
    where: {
      userId: menteeId,
      booking: {
        mentoringServiceId: serviceId,
        status: { not: "cancelled" },
      },
    },
  });

  if (!hasBooked) {
    throw new Error("Mentee has not participated in this service");
  }

  // Ambil daftar project + submission milik mentee untuk service ini
  const projects = await prisma.project.findMany({
    where: {
      serviceId: serviceId,
      submissions: {
        some: {
          menteeId,
        },
      },
    },
    select: {
      title: true,
      submissions: {
        where: { menteeId },
        select: {
          score: true,
          mentorFeedback: true,
          gradedByUser: {
            select: {
              fullName: true,
            },
          },
        },
        take: 1,
      },
    },
  });

  // Format project data for PDF
  const projectList = projects.map((project) => ({
    title: project.title,
    grade: project.submissions[0]?.score?.toString(),
    feedback: project.submissions[0]?.mentorFeedback ?? undefined, // Convert null to undefined
    mentorName: project.submissions[0]?.gradedByUser?.fullName,
  }));

  // Generate nomor sertifikat
  const certificateNumber = `CERT-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 5)
    .toUpperCase()}`;

  // Generate PDF
  const pdfDir = path.join(__dirname, "../../Uploads/certificate");
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }
  const pdfFileName = `${certificateNumber}-${menteeId}.pdf`;
  const pdfPath = path.join(pdfDir, pdfFileName);

  await generateCertificatePDF({
    certificateNumber,
    menteeName: mentee.fullName,
    serviceName: service.serviceName,
    serviceType: service.serviceType ?? undefined,
    issueDate: new Date().toISOString().split("T")[0],
    pdfPath,
    projects: projectList,
  });

  // Upload ke Google Drive
  const uploadedFile = await uploadToGoogleDrive(
    pdfPath,
    pdfFileName,
    "16dqTiqyEhFhrfzfoX5upUkgkNoUGNnI9" // Google Drive folder ID
  );

  console.log("Uploaded to Google Drive:", uploadedFile.webViewLink);

  // Simpan ke database
  const certificate = await prisma.certificate.create({
    data: {
      certificateNumber,
      certificatePath: `/certificates/${pdfFileName}`,
      googleDriveUrl: uploadedFile.webViewLink,
      projectCertificatePath: null, // Set to null if not used
      issueDate: new Date(),
      status: "generated",
      user: { connect: { id: menteeId } },
      mentoringService: { connect: { id: serviceId } },
    },
    include: {
      user: { select: { fullName: true, email: true } },
      mentoringService: { select: { serviceName: true } },
    },
  });

  return certificate;
};

export const getAllCertificatesService = async ({
  page,
  limit,
  search,
  status,
  serviceId,
  startDate,
  endDate,
}: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  serviceId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const skip = (page - 1) * limit;

  const filters: any = {};

  if (status) filters.status = status;
  if (serviceId) filters.serviceId = serviceId;
  if (startDate || endDate) {
    filters.createdAt = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };
  }

  const searchCondition = search
    ? {
        OR: [
          { user: { fullName: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      }
    : {};

  const [certificates, total] = await Promise.all([
    prisma.certificate.findMany({
      skip,
      take: limit,
      where: {
        ...filters,
        ...searchCondition,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        mentoringService: {
          select: {
            serviceName: true, // untuk Nama Sertifikat
            serviceType: true, // untuk Program (Bootcamp / Live / Short)
          },
        },
      },
    }),
    prisma.certificate.count({
      where: {
        ...filters,
        ...searchCondition,
      },
    }),
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    items: certificates,
  };
};

export const updateCertificateService = async ({
  id,
  status,
  verifiedBy,
  note,
  removeCertificate,
  regenerateCertificate,
  adminId,
}: {
  id: string;
  status?: string;
  verifiedBy?: string;
  note?: string;
  removeCertificate?: boolean;
  regenerateCertificate?: boolean;
  adminId: string;
}) => {
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      mentoringService: { select: { id: true, serviceName: true } },
    },
  });

  if (!certificate) {
    throw new Error("Certificate not found");
  }

  if (removeCertificate && regenerateCertificate) {
    throw new Error(
      "Cannot remove and regenerate certificate at the same time"
    );
  }

  // ================= VALIDASI VERIFIED BY =================
  if (verifiedBy) {
    const admin = await prisma.user.findUnique({
      where: { id: verifiedBy },
      include: { userRoles: { include: { role: true } } },
    });

    if (!admin || !admin.userRoles.some((r) => r.role.roleName === "admin")) {
      throw new Error("VerifiedBy user must have admin role");
    }
  }

  let newCertificatePath: string | null | undefined;
  let newGoogleDriveUrl: string | null | undefined;

  // ================= REGENERATE CERTIFICATE =================
  if (regenerateCertificate) {
    const certificateNumber = certificate.certificateNumber;

    const pdfDir = path.join(__dirname, "../../Uploads/certificate");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfFileName = `${certificateNumber}-${certificate.user.id}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);

    // 🔁 generate ulang PDF
    await generateCertificatePDF({
      certificateNumber,
      menteeName: certificate.user.fullName,
      serviceName: certificate.mentoringService.serviceName,
      issueDate: new Date().toISOString().split("T")[0],
      pdfPath,
      projects: [], // bisa kamu isi ulang kalau mau ambil project lagi
    });

    // 🔁 upload ulang ke Google Drive
    const uploadedFile = await uploadToGoogleDrive(
      pdfPath,
      pdfFileName,
      "16dqTiqyEhFhrfzfoX5upUkgkNoUGNnI9"
    );

    newCertificatePath = `/certificates/${pdfFileName}`;
    newGoogleDriveUrl = uploadedFile.webViewLink;
  }

  // ================= UPDATE DB =================
  const updated = await prisma.certificate.update({
    where: { id },
    data: {
      status,
      verifiedBy,
      note,

      ...(removeCertificate && {
        certificatePath: null,
        googleDriveUrl: null,
        projectCertificatePath: null,
      }),

      ...(regenerateCertificate && {
        certificatePath: newCertificatePath,
        googleDriveUrl: newGoogleDriveUrl,
        issueDate: new Date(),
        status: "generated",
      }),

      updatedAt: new Date(),
    },
  });

  return updated;
};

export const getMenteeCertificatesService = async ({
  menteeId,
  page,
  limit,
  status,
  serviceId,
}: {
  menteeId: string;
  page: number;
  limit: number;
  status?: string;
  serviceId?: string;
}) => {
  const skip = (page - 1) * limit;

  const whereClause: any = {
    menteeId,
  };

  if (status) whereClause.status = status;
  if (serviceId) whereClause.serviceId = serviceId;

  const [total, certificates] = await Promise.all([
    prisma.certificate.count({ where: whereClause }),
    prisma.certificate.findMany({
      where: whereClause,
      include: {
        mentoringService: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: certificates,
  };
};

export const getCertificateDetailService = async (
  certificateId: string,
  userId: string,
  userRole: string
) => {
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      mentoringService: {
        select: {
          id: true,
          serviceName: true,
        },
      },
    },
  });

  if (!certificate) {
    throw new Error("Certificate not found");
  }

  if (!certificate.user || !certificate.mentoringService) {
    throw new Error(
      "Certificate data is incomplete: user or mentoring service not found"
    );
  }

  if (userRole !== "admin" && certificate.menteeId !== userId) {
    throw new Error("Unauthorized: You can only access your own certificates");
  }

  // Hanya izinkan mentee melihat sertifikat dengan status 'generated' atau 'sent'
  if (
    userRole !== "admin" &&
    !["generated", "sent"].includes(certificate.status || "")
  ) {
    throw new Error("Certificate is not accessible");
  }

  // Format download links dengan base URL jika ada
  const baseUrl = process.env.BASE_URL || "http://localhost:5001";
  const downloadLinks = {
    certificate: certificate.certificatePath
      ? `${baseUrl}${certificate.certificatePath}`
      : null,
    googleDrive: certificate.googleDriveUrl || null,
    projectCertificate: certificate.projectCertificatePath
      ? `${baseUrl}${certificate.projectCertificatePath}`
      : null,
  };

  return {
    id: certificate.id,
    certificateNumber: certificate.certificateNumber,
    issueDate: certificate.issueDate,
    status: certificate.status,
    verifiedBy: certificate.verifiedBy,
    note: certificate.note,
    createdAt: certificate.createdAt,
    updatedAt: certificate.updatedAt,
    mentee: {
      id: certificate.user.id,
      fullName: certificate.user.fullName,
      email: certificate.user.email,
    },
    mentoringService: {
      id: certificate.mentoringService.id,
      serviceName: certificate.mentoringService.serviceName,
    },
    downloadLinks,
  };
};

export const downloadCertificate = async (
  certificateId: string,
  userId: string,
  roles: string[]
): Promise<string> => {
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
  });

  if (!certificate) {
    throw new Error("Certificate not found");
  }

  const isAdmin = roles.includes("admin");

  if (!isAdmin && certificate.menteeId !== userId) {
    throw new Error("You do not have access to this certificate");
  }

  if (!certificate.certificatePath) {
    throw new Error("Certificate file path not available");
  }

  // Ambil nama file dari path
  const fileName = path.basename(certificate.certificatePath); // hasilnya: CERT-xxx.pdf

  const fullPath = path.resolve(
    __dirname,
    "../../uploads/certificate",
    fileName
  );

  console.log("Looking for file at:", fullPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error("Certificate file not found on server");
  }

  if (certificate.status !== "viewed") {
    await prisma.certificate.update({
      where: { id: certificateId },
      data: {
        status: "viewed",
      },
    });
  }

  return fullPath;
};

export const exportCertificates = async (
  format: "csv" | "excel"
): Promise<{ buffer: Buffer; filename: string; contentType: string }> => {
  const certificates = await prisma.certificate.findMany({
    include: {
      user: true,
      mentoringService: true,
    },
  });

  const mappedData = certificates.map((cert) => ({
    certificateNumber: cert.certificateNumber,
    fullName: cert.user.fullName,
    email: cert.user.email,
    serviceName: cert.mentoringService.serviceName,
    issueDate: cert.issueDate?.toISOString().split("T")[0] || "-",
    status: cert.status || "-",
    verifiedBy: cert.verifiedBy || "-",
    note: cert.note || "-",
  }));

  const timestamp = formatDate(new Date(), "yyyyMMdd-HHmmss");
  const filenamePrefix = `certificates-${timestamp}`;

  if (format === "csv") {
    const parser = new Json2CsvParser({ header: true });
    const csv = parser.parse(mappedData);
    const buffer = Buffer.from(csv, "utf-8");

    return {
      buffer,
      filename: `${filenamePrefix}.csv`,
      contentType: "text/csv",
    };
  } else {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Certificates");

    if (mappedData.length > 0) {
      worksheet.columns = Object.keys(mappedData[0]).map((key) => ({
        header: key,
        key,
        width: 20,
      }));
      worksheet.addRows(mappedData);
    }

    const excelBuffer = await workbook.xlsx.writeBuffer();
    return {
      buffer: Buffer.from(excelBuffer),
      filename: `${filenamePrefix}.xlsx`,
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }
};
