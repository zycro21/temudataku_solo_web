/**
 * certificateDesign.ts
 * ------------------------------------------------------------------
 * Kumpulan helper visual + 2 fungsi render halaman sertifikat
 * (Page 1: Certificate of Completion, Page 2: Kompetensi yang Dilatih)
 * dibuat supaya tampilannya mengikuti template desain Canva yang
 * dikirim (2 gambar referensi).
 *
 * File ini DROP-IN REPLACEMENT untuk 3 hal di service lama kamu:
 *   1. `drawTable`              → diganti versi yang lebih "bertema"
 *   2. `renderCertificatePage`  → didesain ulang total (Page 1)
 *   3. `renderAssessmentPage`   → didesain ulang total (Page 2),
 *                                 SEKARANG BUTUH parameter tambahan
 *                                 `subChapterTitle` (lihat catatan di
 *                                 bagian bawah file / integrasi).
 *
 * Semua logika bisnis (query quiz/submission/progress, upload ke
 * Google Drive, simpan ke DB, dsb) di `generateCertificate` /
 * `generateCertificatePDF` TIDAK PERLU DIUBAH — itu sudah benar.
 * Yang berubah cuma bagian "menggambar" PDF-nya.
 * ------------------------------------------------------------------
 */

import PDFDocument from "pdfkit";

/* ============================================================
   1. DESIGN TOKENS
   ============================================================ */

export const COLORS = {
  navy: "#0B2A5B", // warna teks judul besar & aksen gelap
  navyDark: "#081D42",
  green: "#00B67A", // hijau utama (judul "CERTIFICATE", subtitle)
  greenDark: "#049966",
  orange: "#F5A623", // warna nomor sertifikat
  gray: "#5B6472", // teks body / deskripsi
  grayLight: "#9AA3AF",
  gridLine: "#EDEFF3", // garis grid diagonal watermark
  white: "#FFFFFF",
};

// Ganti ini kalau kamu sudah register custom font (Poppins/Montserrat dkk)
// lewat doc.registerFont("Heading", "path/to/font.ttf"). Default pakai
// Helvetica bawaan pdfkit supaya nggak butuh file font tambahan dulu.
export const FONTS = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
  italic: "Helvetica-Oblique",
};

/* ============================================================
   2. BACKGROUND — grid diagonal tipis (watermark pattern)
      Ini yang bikin efek "kotak-kotak miring" transparan di
      kedua gambar referensi. Full vector, jadi presisi di semua
      resolusi tanpa butuh asset gambar.
   ============================================================ */
export function drawDiagonalGridBackground(doc: PDFKit.PDFDocument) {
  const w = doc.page.width;
  const h = doc.page.height;
  const step = 26;

  doc.save();
  doc.rect(0, 0, w, h).clip();
  doc.lineWidth(0.6).strokeColor(COLORS.gridLine).opacity(0.9);

  const count = Math.ceil((w + h) / step) + 2;

  // diagonal "/"
  for (let i = -count; i < count; i++) {
    const x0 = i * step;
    doc
      .moveTo(x0, h)
      .lineTo(x0 + h, 0)
      .stroke();
  }
  // diagonal "\"
  for (let i = -count; i < count; i++) {
    const x0 = i * step;
    doc
      .moveTo(x0, 0)
      .lineTo(x0 + h, h)
      .stroke();
  }

  doc.opacity(1);
  doc.restore();
}

/* ============================================================
   3. LOGO BADGE (kanan atas) — "Temu Dataku"
      Kalau kamu punya file logo asli (PNG/SVG-hasil-export),
      lebih baik embed langsung pakai `logoImagePath` supaya
      identik dengan brand asset asli. Kalau nggak dikasih,
      fallback ke badge vector sederhana.
   ============================================================ */
export function drawLogoBadge(
  doc: PDFKit.PDFDocument,
  opts: { x: number; y: number; logoImagePath?: string } = { x: 0, y: 0 },
) {
  const { x, y, logoImagePath } = opts;
  const boxW = 118;
  const boxH = 40;

  if (logoImagePath) {
    doc.image(logoImagePath, x, y, { fit: [boxW, boxH] });
    return;
  }

  // Fallback vector badge: lingkaran teal kecil + teks "Temu Dataku"
  const iconR = 14;
  doc
    .save()
    .circle(x + iconR, y + boxH / 2, iconR)
    .fillColor(COLORS.navy)
    .fill();
  doc
    .circle(x + iconR, y + boxH / 2, iconR - 5)
    .fillColor(COLORS.green)
    .fill();
  doc.restore();

  doc
    .font(FONTS.bold)
    .fontSize(11)
    .fillColor(COLORS.navy)
    .text("Temu", x + iconR * 2 + 8, y + boxH / 2 - 12, { lineBreak: false });
  doc
    .font(FONTS.bold)
    .fontSize(11)
    .fillColor(COLORS.green)
    .text("Dataku", x + iconR * 2 + 8, y + boxH / 2 + 1, { lineBreak: false });
}

/* ============================================================
   4. DEKORASI KOLOM KIRI (Page 1)
      Kolom vertikal berisi lingkaran & belah-ketupat selang-seling
      hijau/navy, meniru border dekoratif di sisi kiri sertifikat.
   ============================================================ */
export function drawSideDecoration(doc: PDFKit.PDFDocument) {
  const h = doc.page.height;
  const colors = [COLORS.green, COLORS.navy];
  const unit = 78; // tinggi tiap "sel" motif
  const cx = 34; // pusat X motif (sebagian keluar dari tepi kiri)

  let idx = 0;
  for (let cy = unit / 2; cy < h; cy += unit) {
    const mainColor = colors[idx % 2];
    const altColor = colors[(idx + 1) % 2];

    // lingkaran besar (setengah terpotong tepi kiri)
    doc.save();
    doc.rect(0, cy - unit / 2, 70, unit).clip();
    doc
      .circle(cx, cy, unit / 2 - 4)
      .fillColor(mainColor)
      .fillOpacity(1)
      .fill();
    doc.restore();

    // belah ketupat outline di tengah lingkaran
    const d = 20;
    doc
      .save()
      .lineWidth(2.2)
      .strokeColor(COLORS.white)
      .moveTo(cx, cy - d)
      .lineTo(cx + d, cy)
      .lineTo(cx, cy + d)
      .lineTo(cx - d, cy)
      .closePath()
      .stroke()
      .restore();

    // aksen titik kecil di sela-sela
    doc
      .circle(cx + 44, cy + unit / 2, 5)
      .fillColor(altColor)
      .fill();

    idx++;
  }
}

/* ============================================================
   5. DEKORASI PAGE 2 — spiral kiri-atas & garis diagonal
      kanan-bawah (sudut), meniru elemen grafis di gambar ke-2.
   ============================================================ */
export function drawTopLeftSpiral(doc: PDFKit.PDFDocument, x = 30, y = 26) {
  doc.save();
  doc.lineWidth(3.2).strokeColor(COLORS.green);
  const rings = 4;
  for (let i = 0; i < rings; i++) {
    const r = 10 + i * 7;
    const startAngle = i * 35;
    doc
      .path(describeArcPath(x + 30, y + 30, r, startAngle, startAngle + 260))
      .stroke();
  }
  doc.restore();
}

export function drawBottomRightStripes(doc: PDFKit.PDFDocument) {
  const w = doc.page.width;
  const h = doc.page.height;
  const size = 150;

  doc.save();
  // clip segitiga di pojok kanan-bawah
  doc
    .moveTo(w, h - size)
    .lineTo(w, h)
    .lineTo(w - size, h)
    .closePath()
    .clip();

  doc.lineWidth(9).strokeColor(COLORS.green).opacity(0.85);
  const step = 16;
  for (let i = -size; i < size * 2; i += step) {
    doc
      .moveTo(w - size + i, h + size)
      .lineTo(w + size, h - size + i)
      .stroke();
  }
  doc.opacity(1);
  doc.restore();
}

// util kecil buat generate SVG-like arc path yang dikonsumsi doc.path()
function describeArcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
) {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const start = {
    x: cx + r * Math.cos(toRad(startDeg)),
    y: cy + r * Math.sin(toRad(startDeg)),
  };
  const end = {
    x: cx + r * Math.cos(toRad(endDeg)),
    y: cy + r * Math.sin(toRad(endDeg)),
  };
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/* ============================================================
   6. PAGE 1 — Certificate of Completion
   ============================================================ */
export function renderCertificatePage({
  doc,
  certificateNumber,
  displayNumber,
  userName,
  subChapterTitle,
  issueDate,
  qrBuffer,
  signerName = "Mohammad Fathur Rozi",
  signerTitle = "CEO TemuDataku",
  signatureImagePath,
  logoImagePath,
}: {
  doc: PDFKit.PDFDocument;
  certificateNumber: string;
  // Nomor cantik yang DITAMPILKAN di sertifikat, format:
  // "01/ABCDEFG/TemuDataku". Kalau tidak diisi, fallback ke
  // `certificateNumber` (format lama ELCERT-...) supaya tetap kompatibel.
  displayNumber?: string;
  userName: string;
  subChapterTitle: string;
  issueDate: Date;
  qrBuffer: Buffer;
  signerName?: string;
  signerTitle?: string;
  signatureImagePath?: string;
  logoImagePath?: string;
}) {
  const pageW = doc.page.width;
  const pageH = doc.page.height;

  /* BACKGROUND */
  doc.rect(0, 0, pageW, pageH).fill(COLORS.white);
  drawDiagonalGridBackground(doc);
  drawSideDecoration(doc);

  /* LOGO */
  drawLogoBadge(doc, { x: pageW - 150, y: 24, logoImagePath });

  /* HEADER: "CERTIFICATE" */
  doc
    .font(FONTS.bold)
    .fontSize(38)
    .fillColor(COLORS.green)
    .text("CERTIFICATE", 90, 70, { align: "center", width: pageW - 180 });

  /* Pill "Of Completion" */
  const pillText = "Of Completion";
  doc.font(FONTS.bold).fontSize(13);
  const pillTextWidth = doc.widthOfString(pillText);
  const pillW = pillTextWidth + 48;
  const pillH = 26;
  const pillX = pageW / 2 - pillW / 2;
  const pillY = 118;
  doc
    .roundedRect(pillX, pillY, pillW, pillH, pillH / 2)
    .lineWidth(1.4)
    .strokeColor(COLORS.navy)
    .stroke();
  doc
    .fillColor(COLORS.navy)
    .text(pillText, pillX, pillY + 7, { width: pillW, align: "center" });

  /* Body copy */
  doc
    .font(FONTS.regular)
    .fontSize(13)
    .fillColor(COLORS.gray)
    .text("This Certificate is Proudly Presented to", 90, 168, {
      align: "center",
      width: pageW - 180,
    });

  /* Nama peserta */
  doc
    .font(FONTS.bold)
    .fontSize(30)
    .fillColor(COLORS.navy)
    .text(userName, 90, 196, { align: "center", width: pageW - 180 });

  /* garis pemisah di bawah nama */
  const lineY = 240;
  doc
    .moveTo(pageW / 2 - 160, lineY)
    .lineTo(pageW / 2 + 160, lineY)
    .lineWidth(1)
    .strokeColor(COLORS.grayLight)
    .stroke();

  /* "Has Completed In E-Learning" */
  doc.font(FONTS.regular).fontSize(13).fillColor(COLORS.gray);
  const line1 = "Has Completed In ";
  const line1W = doc.widthOfString(line1);
  const line2 = "E-Learning";
  doc.font(FONTS.bold).fontSize(13);
  const line2W = doc.widthOfString(line2);
  const totalLineW = line1W + line2W;
  const lineStartX = pageW / 2 - totalLineW / 2;
  const textY = 258;

  doc
    .font(FONTS.regular)
    .fillColor(COLORS.gray)
    .text(line1, lineStartX, textY, {
      lineBreak: false,
    });
  doc
    .font(FONTS.bold)
    .fillColor(COLORS.navy)
    .text(line2, lineStartX + line1W, textY, { lineBreak: false });

  /* Judul course/sub-chapter */
  doc
    .font(FONTS.bold)
    .fontSize(22)
    .fillColor(COLORS.green)
    .text(subChapterTitle, 90, 284, { align: "center", width: pageW - 180 });

  /* ===== FOOTER: tanda tangan (kiri) ===== */
  const sigX = 90;
  const sigLineY = pageH - 96;

  if (signatureImagePath) {
    doc.image(signatureImagePath, sigX, sigLineY - 46, { width: 120 });
  } else {
    // fallback: teks bergaya tanda tangan pakai font italic
    doc
      .font(FONTS.italic)
      .fontSize(26)
      .fillColor(COLORS.navy)
      .text(initialsSignaturePlaceholder(signerName), sigX, sigLineY - 40, {
        lineBreak: false,
      });
  }

  doc
    .moveTo(sigX, sigLineY)
    .lineTo(sigX + 190, sigLineY)
    .lineWidth(1)
    .strokeColor(COLORS.grayLight)
    .stroke();

  doc
    .font(FONTS.bold)
    .fontSize(13)
    .fillColor(COLORS.navy)
    .text(signerName, sigX, sigLineY + 8, { lineBreak: false });

  // badge navy kecil untuk jabatan
  doc.font(FONTS.bold).fontSize(10);
  const titleW = doc.widthOfString(signerTitle) + 24;
  doc
    .roundedRect(sigX, sigLineY + 28, titleW, 22, 4)
    .fillColor(COLORS.navy)
    .fill();
  doc
    .fillColor(COLORS.white)
    .text(signerTitle, sigX + 12, sigLineY + 34, { lineBreak: false });

  /* ===== FOOTER: QR + nomor sertifikat (kanan) ===== */
  const qrSize = 108;
  const qrX = pageW - 90 - qrSize;
  const qrY = pageH - 90 - qrSize;
  doc.image(qrBuffer, qrX, qrY, { width: qrSize });

  doc
    .font(FONTS.bold)
    .fontSize(10)
    .fillColor(COLORS.orange)
    .text(
      `Nomor: ${displayNumber ?? certificateNumber}`,
      qrX - 40,
      qrY + qrSize + 8,
      {
        width: qrSize + 80,
        align: "center",
      },
    );

  doc
    .font(FONTS.regular)
    .fontSize(10)
    .fillColor(COLORS.gray)
    .text(formatIssueDateID(issueDate), qrX - 40, qrY + qrSize + 22, {
      width: qrSize + 80,
      align: "center",
    });
}

function initialsSignaturePlaceholder(name: string) {
  // simple cursive-ish fallback: pakai nama depan sebagai "tanda tangan"
  const first = name.trim().split(" ")[0] ?? name;
  return first;
}

function formatIssueDateID(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/* ============================================================
   7. PAGE 2 — Kompetensi yang Dilatih (Assessment Summary)
   ============================================================ */
export function renderAssessmentPage(
  doc: PDFKit.PDFDocument,
  subChapterTitle: string,
  rows: string[][],
  opts: { logoImagePath?: string } = {},
) {
  const pageW = doc.page.width;
  const pageH = doc.page.height;

  /* BACKGROUND */
  doc.rect(0, 0, pageW, pageH).fill(COLORS.white);
  drawDiagonalGridBackground(doc);
  drawTopLeftSpiral(doc);
  drawBottomRightStripes(doc);
  drawLogoBadge(doc, {
    x: pageW - 150,
    y: 24,
    logoImagePath: opts.logoImagePath,
  });

  /* JUDUL */
  doc
    .font(FONTS.bold)
    .fontSize(24)
    .fillColor(COLORS.navy)
    .text("KOMPETENSI YANG DILATIH", 90, 60, {
      align: "center",
      width: pageW - 180,
    });

  doc
    .font(FONTS.bold)
    .fontSize(15)
    .fillColor(COLORS.green)
    .text(subChapterTitle, 90, 92, { align: "center", width: pageW - 180 });

  /* TABEL ASSESSMENT */
  drawThemedTable({
    doc,
    startX: pageW / 2 - 320,
    startY: 160,
    rowHeight: 38,
    columnWidths: [260, 100, 100, 180],
    rows,
  });

  doc
    .font(FONTS.regular)
    .fontSize(9)
    .fillColor(COLORS.gray)
    .text(
      "Halaman ini menampilkan rincian hasil penilaian peserta pada course terkait.",
      90,
      pageH - 60,
      { align: "center", width: pageW - 180 },
    );
}

/* ============================================================
   8. TABEL BERTEMA (replace `drawTable` lama)
   ============================================================ */
export function drawThemedTable({
  doc,
  startX,
  startY,
  rowHeight,
  columnWidths,
  rows,
}: {
  doc: PDFKit.PDFDocument;
  startX: number;
  startY: number;
  rowHeight: number;
  columnWidths: number[];
  rows: string[][];
}) {
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  let y = startY;

  rows.forEach((row, rowIndex) => {
    let x = startX;
    const isHeader = rowIndex === 0;
    const isLastRow = rowIndex === rows.length - 1; // "Final Score"

    // background baris
    doc
      .rect(startX, y, tableWidth, rowHeight)
      .fillColor(
        isHeader
          ? COLORS.navy
          : isLastRow
            ? "#E7F8F1"
            : rowIndex % 2 === 0
              ? COLORS.white
              : "#F7F8FA",
      )
      .fill();

    row.forEach((cell, i) => {
      doc
        .font(isHeader || isLastRow ? FONTS.bold : FONTS.regular)
        .fontSize(isHeader ? 11 : 11)
        .fillColor(
          isHeader
            ? COLORS.white
            : isLastRow
              ? COLORS.greenDark
              : COLORS.navyDark,
        )
        .text(cell, x + 12, y + rowHeight / 2 - 6, {
          width: columnWidths[i] - 20,
          align: "left",
        });
      x += columnWidths[i];
    });

    y += rowHeight;
  });

  // border luar tabel
  doc
    .rect(startX, startY, tableWidth, rowHeight * rows.length)
    .lineWidth(1)
    .strokeColor("#E2E5EA")
    .stroke();

  // garis antar baris (tipis)
  y = startY;
  for (let i = 0; i <= rows.length; i++) {
    doc
      .moveTo(startX, y)
      .lineTo(startX + tableWidth, y)
      .lineWidth(0.6)
      .strokeColor("#E2E5EA")
      .stroke();
    y += rowHeight;
  }
}
