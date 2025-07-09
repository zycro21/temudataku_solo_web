import { PrismaClient, Prisma } from "@prisma/client";
import { Parser as Json2CsvParser } from "json2csv";
import ExcelJS from "exceljs";
import { format as formatDate, subDays } from "date-fns";
import { Buffer } from "buffer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { uploadToGoogleDrive } from "../utils/googleDrive";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to generate PDF
async function generateCertificatePDF({
  certificateNumber,
  menteeName,
  serviceName,
  issueDate,
  pdfPath,
  projects,
}: {
  certificateNumber: string;
  menteeName: string;
  serviceName: string;
  issueDate: string;
  pdfPath: string;
  projects: {
    title: string;
    grade?: string;
    feedback?: string;
    mentorName?: string;
  }[];
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 40,
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Colors
    const primaryColor = "#003087"; // Navy blue
    const accentColor = "#FFD700"; // Gold
    const textColor = "#000000"; // Black
    const secondaryTextColor = "#333333"; // Dark gray
    const tableHeaderBg = "#F5F5F5"; // Light gray

    // Fonts
    const titleFont = "Times-Bold";
    const bodyFont = "Times-Roman";
    const tableFont = "Helvetica";
    const tableFontBold = "Helvetica-Bold";

    // ---------------------------
    // Page 1 - Certificate
    // ---------------------------
    doc
      .rect(0, 0, doc.page.width, doc.page.height)
      .fillOpacity(0.1)
      .fill("#E6E6FA")
      .fillOpacity(1);

    doc
      .lineWidth(3)
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .stroke(accentColor);
    doc
      .lineWidth(1)
      .rect(25, 25, doc.page.width - 50, doc.page.height - 50)
      .stroke(primaryColor);

    const logoPath = path.join(__dirname, "../../assets/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, (doc.page.width - 150) / 2, 30, { width: 150 });
    }

    const watermarkPath = path.join(__dirname, "../../assets/watermark.png");
    if (fs.existsSync(watermarkPath)) {
      doc
        .opacity(0.1)
        .image(watermarkPath, doc.page.width / 4, doc.page.height / 4, {
          width: doc.page.width / 2,
        })
        .opacity(1);
    }

    doc
      .fontSize(36)
      .font(titleFont)
      .fillColor(primaryColor)
      .text("Certificate of Completion", 0, 200, { align: "center" });

    doc
      .fontSize(18)
      .font(bodyFont)
      .fillColor(secondaryTextColor)
      .text("This certifies that", 0, 280, { align: "center" });

    doc
      .fontSize(28)
      .font(titleFont)
      .fillColor(textColor)
      .text(menteeName, 0, 320, { align: "center" });

    doc
      .fontSize(18)
      .font(bodyFont)
      .fillColor(secondaryTextColor)
      .text("has successfully completed the", 0, 380, { align: "center" });

    doc
      .fontSize(24)
      .font(titleFont)
      .fillColor(primaryColor)
      .text(serviceName, 0, 420, { align: "center" });

    doc
      .fontSize(16)
      .font(bodyFont)
      .fillColor(secondaryTextColor)
      .text("Congratulations on your achievement!", 0, 480, {
        align: "center",
      });

    doc
      .fontSize(12)
      .font(bodyFont)
      .fillColor(textColor)
      .text(`Certificate Number: ${certificateNumber}`, 0, 540, {
        align: "center",
      });
    doc.text(`Issue Date: ${issueDate}`, 0, 560, { align: "center" });

    const signaturePath = path.join(__dirname, "../../assets/signature.png");
    if (fs.existsSync(signaturePath)) {
      doc.image(signaturePath, 100, doc.page.height - 150, { width: 150 });
    } else {
      doc
        .fontSize(14)
        .font(bodyFont)
        .fillColor(secondaryTextColor)
        .text("Authorized Signature", 100, doc.page.height - 130);
      doc
        .lineWidth(1)
        .moveTo(90, doc.page.height - 140)
        .lineTo(250, doc.page.height - 140)
        .stroke(secondaryTextColor);
    }

    doc
      .rect(doc.page.width - 200, doc.page.height - 180, 100, 100)
      .fillOpacity(0.2)
      .fill(accentColor)
      .fillOpacity(1)
      .stroke(primaryColor);
    doc
      .fontSize(10)
      .font(bodyFont)
      .fillColor(secondaryTextColor)
      .text("Company Stamp", doc.page.width - 195, doc.page.height - 80, {
        align: "center",
      });

    doc
      .fontSize(10)
      .font(bodyFont)
      .fillColor(secondaryTextColor)
      .text("Page 1 of 2 - Temudataku", 0, doc.page.height - 20, {
        align: "center",
      });

    // ---------------------------
    // Page 2 - Project Table (Landscape)
    // ---------------------------
    doc.addPage({ size: "A4", layout: "landscape", margin: 40 });

    doc
      .rect(0, 0, doc.page.width, doc.page.height)
      .fillOpacity(0.1)
      .fill("#E6E6FA")
      .fillOpacity(1);

    doc
      .fontSize(20)
      .font(tableFontBold)
      .fillColor(primaryColor)
      .text("Project Summary", 40, 50, { align: "left" });

    const tableTop = 80;
    const rowHeight = 30;
    const colWidths = [50, 300, 100, 250, 100]; // Adjusted for landscape
    const tableWidth = colWidths.reduce((sum, w) => sum + w, 0);
    const tableLeft = (doc.page.width - tableWidth) / 2;

    const drawRow = (
      y: number,
      values: string[],
      bold = false,
      isHeader = false
    ) => {
      const font = bold ? tableFontBold : tableFont;
      doc
        .font(font)
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
          continued: false,
        });
        x += width;
      });

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

    drawRow(
      tableTop,
      ["No", "Project Title", "Grade", "Mentor Feedback", "Mentor"],
      true,
      true
    );

    if (projects.length > 0) {
      projects.forEach((project, index) => {
        const values = [
          (index + 1).toString(),
          project.title || "-",
          project.grade || "-",
          project.feedback || "-",
          project.mentorName || "-",
        ];
        drawRow(tableTop + rowHeight * (index + 1), values);
      });
    } else {
      doc
        .fontSize(12)
        .font(tableFont)
        .fillColor(secondaryTextColor)
        .text("No projects submitted", tableLeft, tableTop + rowHeight + 10, {
          align: "left",
        });
    }

    doc
      .fontSize(10)
      .font(tableFont)
      .fillColor(secondaryTextColor)
      .text("Page 2 of 2 - Temudataku", 0, doc.page.height - 20, {
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
    select: { serviceName: true, durationDays: true },
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
          Score: true,
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
    grade: project.submissions[0]?.Score?.toString(),
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
        user: { select: { fullName: true, email: true } },
        mentoringService: { select: { serviceName: true } },
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
}: {
  id: string;
  status?: string;
  verifiedBy?: string;
  note?: string;
}) => {
  const existing = await prisma.certificate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Certificate not found");
  }

  // Validasi: Jika ada verifiedBy, pastikan user-nya ada dan role-nya "admin"
  if (verifiedBy) {
    const userWithRoles = await prisma.user.findUnique({
      where: { id: verifiedBy },
      include: {
        userRoles: {
          include: {
            role: true, // Include relasi ke Role untuk akses roleName
          },
        },
      },
    });

    if (!userWithRoles) {
      throw new Error("VerifiedBy user not found");
    }

    const isAdmin = userWithRoles.userRoles.some(
      (userRole) => userRole.role.roleName === "admin"
    );

    if (!isAdmin) {
      throw new Error("VerifiedBy user must have admin role");
    }
  }

  const updated = await prisma.certificate.update({
    where: { id },
    data: {
      status,
      verifiedBy,
      note,
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
