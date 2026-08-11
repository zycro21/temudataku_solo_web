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
  black: "#000000",
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
  const step = 42; // 🔥 DIPERLEBAR dari 26 — biar grid nggak terlalu mepet

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
   🔥 PERBAIKAN POSISI (SANGAT KE KANAN & KE ATAS):
   - Posisi X dihitung hanya berjarak 10px dari tepi kanan (sebelumnya 30px).
   - Posisi Y diubah menjadi 10px dari atas (sebelumnya 20px).
   - Ukuran tetap 300px lebar agar proporsional.
   ============================================================ */
export function drawLogoBadge(
  doc: PDFKit.PDFDocument,
  opts: {
    logoImagePath?: string;
    // 🔥 UBAH LAGI: sekarang logo dibungkus KOTAK dengan border navy di
    // sisi KIRI, KANAN, BAWAH saja (sisi ATAS sengaja TIDAK digambar,
    // karena kotaknya ditempelkan pas di tepi atas halaman — jadi tepi
    // kertas itu sendiri yang "jadi" batas atasnya, nggak perlu digaris
    // ulang). Plus shadow tipis di sisi kanan-bawah, biar kotaknya
    // kelihatan "mengambang" dikit dari halaman.
    //   - Mau lebih ke KANAN → kecilkan `marginRight`
    //   - Mau kotaknya nggak nempel banget ke tepi atas → besarkan `marginTop`
    //   - Mau logonya lebih besar/kecil → ubah `width` (ini lebar LOGO-nya,
    //     BUKAN lebar kotak — kotak otomatis nambah padding di sekelilingnya)
    marginRight?: number;
    marginTop?: number;
    width?: number;
    paddingX?: number;
    paddingY?: number;
  } = {},
) {
  const pageW = doc.page.width;
  const {
    logoImagePath,
    marginRight = 30,
    marginTop = 0, // 🔥 default 0 — nempel ke tepi atas halaman
    width = 56, // 🔥 DIKECILKAN lagi dari 120 → 56
    paddingX = 12,
    paddingY = 10,
  } = opts;

  // Aspect ratio FILE BERSIH (`logo-clean.png`) ≈ 2.35:1
  const ASPECT_RATIO = 2.35;
  const logoW = width;
  const logoH = logoW / ASPECT_RATIO;

  const boxW = logoW + paddingX * 2;
  const boxH = logoH + paddingY * 2;

  const x = pageW - marginRight - boxW;
  const y = marginTop;

  // --- SHADOW (2 lapis tipis, digeser ke kanan-bawah) ---
  doc.save();
  doc.opacity(0.08);
  doc
    .rect(x + 4, y + 5, boxW, boxH)
    .fillColor("#0B2A5B")
    .fill();
  doc.opacity(0.14);
  doc
    .rect(x + 2, y + 3, boxW, boxH)
    .fillColor("#0B2A5B")
    .fill();
  doc.opacity(1);
  doc.restore();

  // --- LATAR KOTAK (putih, biar logo kontras dari grid background) ---
  // 🔥 UBAH: dulu `doc.rect(...)` biasa (sudut lancip semua). Sekarang
  // digambar manual pakai path supaya 2 sudut BAWAH-nya ikut membulat,
  // senada sama border di bawah ini (sudut ATAS tetap lancip karena
  // sisi atas kotak nempel ke tepi kertas, jadi nggak kelihatan).
  //   - Mau bulatannya lebih/kurang → ubah `borderRadius` di bawah.
  const borderRadius = 8;
  doc
    .moveTo(x, y)
    .lineTo(x, y + boxH - borderRadius)
    .quadraticCurveTo(x, y + boxH, x + borderRadius, y + boxH)
    .lineTo(x + boxW - borderRadius, y + boxH)
    .quadraticCurveTo(x + boxW, y + boxH, x + boxW, y + boxH - borderRadius)
    .lineTo(x + boxW, y)
    .lineTo(x, y)
    .closePath()
    .fillColor(COLORS.white)
    .fill();

  // --- BORDER: cuma kiri + bawah + kanan (path TERBUKA, mulai dari
  // pojok kiri-atas, turun ke kiri-bawah, ke kanan-bawah, naik ke
  // kanan-atas — sisi ATAS SENGAJA nggak ikut di-stroke). ---
  // 🔥 UBAH: 2 sudut BAWAH (kiri-bawah & kanan-bawah) sekarang dibulatkan
  // pakai `quadraticCurveTo` (bukan `lineTo` tajam lagi), dengan control
  // point persis di titik sudutnya — teknik standar buat bikin 1 sudut
  // rounded di path terbuka. Radius pakai `borderRadius` yang sama
  // dengan kotak putih di atas biar nyambung rapi.
  doc.save();
  doc
    .lineWidth(2.4)
    .strokeColor(COLORS.navy)
    .moveTo(x, y)
    .lineTo(x, y + boxH - borderRadius)
    .quadraticCurveTo(x, y + boxH, x + borderRadius, y + boxH)
    .lineTo(x + boxW - borderRadius, y + boxH)
    .quadraticCurveTo(x + boxW, y + boxH, x + boxW, y + boxH - borderRadius)
    .lineTo(x + boxW, y)
    .stroke();
  doc.restore();

  // --- ISI KOTAK: logo di-CENTER (horizontal & vertical) ---
  const logoX = x + (boxW - logoW) / 2;
  const logoY = y + (boxH - logoH) / 2;

  if (logoImagePath) {
    doc.image(logoImagePath, logoX, logoY, { width: logoW, height: logoH });
    return { x, y, width: boxW, height: boxH };
  }

  // Fallback SEDERHANA kalau `logoImagePath` belum diisi sama sekali —
  // ikon + teks manual, seadanya, tetap di-center di dalam kotak yang
  // sama supaya konsisten sama versi gambar aslinya.
  const iconSize = Math.min(logoH, 34);
  const iconY = logoY + (logoH - iconSize) / 2;
  doc
    .save()
    .circle(logoX + iconSize / 2, iconY + iconSize / 2, iconSize / 2)
    .fillColor(COLORS.navy)
    .fill();
  doc
    .circle(logoX + iconSize / 2, iconY + iconSize / 2, iconSize / 2 - 5)
    .fillColor(COLORS.green)
    .fill();
  doc.restore();

  const textX = logoX + iconSize + 8;
  doc
    .font(FONTS.bold)
    .fontSize(12)
    .fillColor(COLORS.navy)
    .text("Temu", textX, iconY + iconSize / 2 - 13, { lineBreak: false });
  doc
    .font(FONTS.bold)
    .fontSize(12)
    .fillColor(COLORS.green)
    .text("Dataku", textX, iconY + iconSize / 2 + 1, { lineBreak: false });

  return { x, y, width: boxW, height: boxH };
}

/* ============================================================
   4. DEKORASI KOLOM KIRI (Page 1) — motif "batik" (terinspirasi
      motif Kawung): dua kolom lingkaran hijau/navy yang saling
      overlap, sehingga ruang kosong di antaranya otomatis
      membentuk motif bintang berujung empat khas batik. Ditambah
      cincin tipis di dalam tiap lingkaran, "isen-isen" (motif
      pengisi 4-titik) di tiap ujung bintang, dan aksen cincin
      selang-seling supaya nggak polos. Full vector, presisi di
      semua resolusi PDF.
      🔥 UPDATE (permintaan user): motif dibuat lebih "ramai"/detail
      dari versi sebelumnya (yang cuma 2 lapis lingkaran polos) —
      bagian LAIN di file ini TIDAK diubah.
   ============================================================ */
export function drawSideDecoration(doc: PDFKit.PDFDocument) {
  const h = doc.page.height;
  const colors = [COLORS.green, COLORS.navy];

  // 🔥 Mau strip-nya lebih lebar/sempit → ubah `stripW`.
  // 🔥 Mau motifnya lebih rapat/renggang vertikal → ubah `rowH`.
  // 🔥 Mau bintang di tengah lebih besar/kecil → ubah `r`
  //    (radius harus lebih besar dari setengah `rowH` & setengah
  //    `stripW` supaya lingkaran tetangga nyambung, tapi lebih
  //    kecil dari setengah diagonal sel supaya bintangnya nggak
  //    ketutup penuh).
  const stripW = 78;
  const rowH = 74;
  const r = 43;

  const rows = Math.ceil(h / rowH) + 2;

  /* --- lapis 1: lingkaran dasar + cincin tipis di dalamnya --- */
  doc.save();
  doc.rect(0, 0, stripW, h).clip();

  for (let row = -1; row < rows; row++) {
    const cy = row * rowH + rowH / 2;
    const idx = ((row % 2) + 2) % 2; // biar aman untuk row negatif
    const leftColor = colors[idx];
    const rightColor = colors[(idx + 1) % 2];

    // kolom kiri (sebagian keluar/terpotong tepi kiri halaman)
    doc.circle(0, cy, r).fillColor(leftColor).fill();
    // kolom kanan (terpotong tepi kanan strip, nyambung ke putih)
    doc.circle(stripW, cy, r).fillColor(rightColor).fill();

    // 🔥 cincin tipis di dalam tiap lingkaran, kesan motif "lapisan"
    doc.save();
    doc.lineWidth(1.1).strokeColor(COLORS.white).opacity(0.5);
    doc.circle(0, cy, r * 0.62).stroke();
    doc.circle(stripW, cy, r * 0.62).stroke();
    doc.opacity(1);
    doc.restore();
  }

  // 🔥 "isen-isen" (motif pengisi khas batik): 4 titik kecil di tiap
  // ujung bintang, supaya ruang putihnya nggak polos kosong
  for (let row = 0; row < rows; row++) {
    const sx = stripW / 2;
    const sy = row * rowH;
    const dotR = 2.1;
    const spread = 9;
    doc.fillColor(COLORS.navy).opacity(0.9);
    doc.circle(sx, sy - spread, dotR).fill();
    doc.circle(sx, sy + spread, dotR).fill();
    doc.circle(sx - spread, sy, dotR).fill();
    doc.circle(sx + spread, sy, dotR).fill();
    doc.opacity(1);
  }

  doc.restore();

  /* --- lapis 2: aksen cincin, selang-seling kiri/kanan tiap 2 baris --- */
  doc.save();
  doc.rect(0, 0, stripW, h).clip();
  doc.lineWidth(2.2).strokeColor(COLORS.white);
  for (let row = 0; row < rows; row += 2) {
    const cy = row * rowH + rowH / 2;
    const cx = (row / 2) % 2 === 0 ? stripW * 0.62 : stripW * 0.38;
    doc.circle(cx, cy, 8).stroke();
    doc.circle(cx, cy, 2.6).fillColor(COLORS.white).fill();
  }
  doc.restore();
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
  drawLogoBadge(doc, {
    logoImagePath,
    marginRight: 30, // 🔥 kecilkan angka ini kalau mau lebih ke KANAN
    marginTop: 0, // 🔥 0 = kotak nempel pas di tepi atas halaman
    width: 56, // 🔥 lebar LOGO (dikecilkan lagi dari 120 → 56)
  });

  // 🔥 UBAH: dulu semua teks header (CERTIFICATE s/d judul course) rata
  // TENGAH halaman. Sekarang rata KIRI, dan `leftX` ini SENGAJA dipakai
  // ulang persis sama buat blok tanda tangan di footer (`sigX = leftX`
  // di bawah) — supaya keduanya sejajar rapi di sisi kiri, sesuai contoh
  // desain. Nilainya dikasih jarak aman dari dekorasi lingkaran di tepi
  // kiri (`drawSideDecoration`, yang makan tempat sampai ±83px).
  const leftX = 110;
  const contentWidth = pageW - leftX - 70;

  /* HEADER: "CERTIFICATE" */
  doc
    .font(FONTS.bold)
    .fontSize(64) // 🔥 diperbesar dari 46 — biar nggak kerasa kosong
    .fillColor(COLORS.green)
    .text("CERTIFICATE", leftX, 52, { align: "left", width: contentWidth });

  /* "Of Completion" - Tanpa border, di bawah CERTIFICATE */
  const pillText = "OF COMPLETION";
  const fontSize = 28;
  doc
    .font(FONTS.bold)
    .fontSize(fontSize)
    .fillColor(COLORS.green)
    .text(pillText, leftX + 5, 52 + 64 + 2, {
      // 🔥 leftX + 20 = geser ke kanan 20px
      // 52 + 64 + 8 = posisi di bawah CERTIFICATE dengan jarak 8px
      lineBreak: false,
    });

  /* ===== BODY COPY ===== */
  // 🔥 Posisi Y dihitung dari "Of Completion" (52 + 64 + 4 + 36 = 156)
  // lalu ditambah jarak 20px (lebih dekat dari sebelumnya)
  // 🔥 NAIKKAN SELURUH BLOK: dikurangi 30px (MOVE_UP) supaya semua elemen
  // dari "This Certificate is Proudly Presented to:" s/d judul course
  // ikut naik bareng, tapi JARAK antar elemen di bawahnya tetap sama
  // karena semuanya dihitung relatif dari bodyCopyY ini. Mau naik lebih
  // tinggi/rendah lagi? tinggal ubah angka `MOVE_UP` di bawah ini.
  const MOVE_UP = -2;
  const bodyCopyY = 52 + 64 + 4 + 36 + 10 - MOVE_UP; // = 146

  // 🔥 GESER KE KANAN: khusus blok "This Certificate is Proudly Presented
  // to:" s/d judul course dipakai `bodyLeftX` (bukan `leftX` biasa) supaya
  // bisa digeser ke kanan sendiri tanpa mempengaruhi "CERTIFICATE",
  // "OF COMPLETION", ataupun blok tanda tangan (`sigX`) yang masih pakai
  // `leftX`. Mau geser lebih jauh/dekat lagi? tinggal ubah `SHIFT_RIGHT`.
  const SHIFT_RIGHT = 8;
  const bodyLeftX = leftX + SHIFT_RIGHT;
  const bodyContentWidth = contentWidth - SHIFT_RIGHT;

  doc
    .font(FONTS.regular)
    .fontSize(22) // 🔥 DIPERBESAR dari 19
    .fillColor(COLORS.gray)
    .text("This Certificate is Proudly Presented to:", bodyLeftX, bodyCopyY, {
      align: "left",
      width: bodyContentWidth,
    });

  /* ===== NAMA PESERTA ===== */
  // 🔥 Posisi Y dihitung dari body copy + tinggi font body + jarak 12px
  const userNameY = bodyCopyY + 24 + 12; // = 176 + 22 + 12 = 210

  doc.font(FONTS.bold).fontSize(40); // 🔥 DIPERBESAR dari 46 — di-set dulu SEBELUM
  // `formatUserNameForCertificate` supaya pengukuran lebar teksnya akurat
  // (pakai font & fontSize yang sama persis dengan yang bakal dipakai
  // buat nge-render).

  // 🔥 BARU: kalau nama peserta kepanjangan (bakal jadi 2 baris), otomatis
  // disingkat — 2 kata pertama tetap utuh, sisanya jadi inisial.
  // Contoh: "Nasywaa Salma Salsabila Putri Ramadhani" → "Nasywaa Salma S. P. R."
  const displayUserName = formatUserNameForCertificate(
    doc,
    userName,
    bodyContentWidth,
  );

  doc.fillColor(COLORS.navy).text(displayUserName, bodyLeftX, userNameY, {
    align: "left",
    width: bodyContentWidth,
  });

  /* ===== GARIS PEMISAH DI BAWAH NAMA ===== */
  // 🔥 Hitung lebar nama peserta (pakai versi yang SUDAH disingkat kalau
  // memang disingkat, biar garis bawahnya sesuai teks yang ditampilkan)
  const userNameWidth = doc.widthOfString(displayUserName);
  const lineY = userNameY + 28 + 16; // = 210 + 56 + 16 = 282

  // 🔥 Garis mengikuti panjang nama (dengan padding 20px di kiri dan kanan)
  doc
    .moveTo(bodyLeftX, lineY)
    .lineTo(bodyLeftX + userNameWidth + 40, lineY) // 🔥 +40 = padding 20px kiri & kanan
    .lineWidth(2) // 🔥 DIPERBESAR dari 1
    .strokeColor(COLORS.grayLight)
    .stroke();

  /* "Has Completed In E-Learning" */
  // 🔥 Hitung posisi Y dari garis sebelumnya (lineY = 282) + jarak 20px
  const completedY = lineY + 10; // = 282 + 24 = 306

  const completedFontSize = 20; // 🔥 DIPERBESAR dari 16
  doc
    .font(FONTS.regular)
    .fontSize(completedFontSize)
    .fillColor(COLORS.gray)
    .text("Has Completed In ", bodyLeftX, completedY, { lineBreak: false });

  const line1W = doc.widthOfString("Has Completed In ");
  doc
    .font(FONTS.bold)
    .fontSize(completedFontSize) // 🔥 DIPERBESAR dari 16
    .fillColor(COLORS.navy)
    .text("E-Learning", bodyLeftX + line1W, completedY, { lineBreak: false });

  /* Judul course/sub-chapter */
  // 🔥 Hitung posisi Y dari completedY + tinggi font + jarak 12px
  const courseY = completedY + completedFontSize + 10; // = 306 + 20 + 14 = 340

  const courseFontSize = 28; // 🔥 DIPERBESAR dari 28
  doc
    .font(FONTS.bold)
    .fontSize(courseFontSize)
    .fillColor(COLORS.green)
    .text(subChapterTitle, bodyLeftX, courseY, {
      align: "left",
      width: bodyContentWidth,
    });

  /* ===== FOOTER: tanda tangan (kiri) ===== */
  // 🔥 UBAH: `sigX` sekarang SAMA PERSIS dengan `leftX` header di atas
  // (dulu sigX = 90, leftX beda sendiri) — ini yang bikin "CERTIFICATE"
  // s/d judul course sejajar rapi dengan nama & tanda tangan CEO.
  const sigX = leftX;
  const sigLineY = pageH - 100; // 🔥 tetap dipakai sebagai TITIK ACUAN posisi (bukan garis lagi)

  // --- TANDA TANGAN (GAMBAR) ---
  // 🔥 UBAH: ukuran fit TETAP [170, 85] (nggak diubah sesuai instruksi),
  // cuma posisi Y digeser turun (dari `sigLineY - 85` → `sigLineY - 74`)
  // supaya tanda tangannya lebih DEKAT ke nama di bawahnya — soalnya
  // garis pembatasnya udah dihapus, jadi nggak perlu nyisain jarak buat
  // garis itu lagi.
  if (signatureImagePath) {
    doc.image(signatureImagePath, sigX + 70, sigLineY - 74, {
      fit: [170, 85],
    });
  } else {
    // fallback kalau `signatureImagePath` belum diisi — teks bergaya
    // tanda tangan pakai font italic.
    doc
      .font(FONTS.italic)
      .fontSize(30)
      .fillColor(COLORS.navy)
      .text(initialsSignaturePlaceholder(signerName), sigX, sigLineY - 69, {
        lineBreak: false,
      });
  }

  // 🔥 DIHAPUS: garis pembatas antara tanda tangan & nama (dulu di sini
  // ada `doc.moveTo(sigX, sigLineY).lineTo(sigX + 230, sigLineY).stroke()`)
  // — sesuai permintaan, garisnya dihilangkan total.

  // --- NAMA PENANDATANGAN ---
  // 🔥 UBAH: digeser naik (dari `sigLineY + 14` → `sigLineY + 6`) biar
  // makin dekat ke tanda tangan di atasnya, seiring garis yang udah
  // dihapus.
  doc
    .font(FONTS.bold)
    .fontSize(20)
    .fillColor(COLORS.black)
    .text(signerName, sigX, sigLineY + 6, { lineBreak: false });

  // Helper function untuk badge dengan teks terpusat
  function drawCenteredBadge(
    doc: PDFKit.PDFDocument,
    text: string,
    x: number,
    y: number,
    paddingX: number = 70,
    height: number = 30,
    fontSize: number = 16,
    bgColor: string = COLORS.navy,
    textColor: string = COLORS.white,
    verticalAdjustment: number = 0, // 🔥 Tambahkan parameter ini
  ) {
    // Hitung lebar badge
    doc.font(FONTS.bold).fontSize(fontSize);
    const textWidth = doc.widthOfString(text);
    const badgeWidth = textWidth + paddingX;

    // Gambar badge
    doc.roundedRect(x, y, badgeWidth, height, 4).fillColor(bgColor).fill();

    // Hitung posisi teks di tengah badge
    const textX = x + (badgeWidth - textWidth) / 2;

    // 🔥 MODIFIKASI: Tambahkan verticalAdjustment untuk kontrol posisi vertikal
    const textY = y + height / 2 - fontSize / 2 - 1 + verticalAdjustment;
    //                                                  ↑
    //                                  + nilai = turun, - nilai = naik

    // Gambar teks
    doc
      .fillColor(textColor)
      .font(FONTS.bold)
      .fontSize(fontSize)
      .text(text, textX, textY, { lineBreak: false });

    return { badgeWidth, textX, textY };
  }

  // Penggunaan dengan adjustment:
  // --- BADGE JABATAN (CEO TemuDataku) ---
  // 🔥 UBAH: teksnya di-uppercase (`.toUpperCase()`) sesuai permintaan,
  // dan posisi Y disesuaikan (`sigLineY + 34`, dulu `+42`) biar jaraknya
  // ke nama tetap proporsional walau nama sekarang sudah naik ke `+6`.
  drawCenteredBadge(
    doc,
    signerTitle.toUpperCase(),
    sigX,
    sigLineY + 34,
    70, // padding horizontal
    30, // height
    16, // fontSize
    COLORS.navy,
    COLORS.white,
    3, // 🔥 verticalAdjustment = +3 (turun 3px)
  );

  /* ===== FOOTER: QR + nomor sertifikat (kanan) ===== */
  // 🔥 UBAH: QR diperbesar (95 → 115) dan digeser lebih ke kanan (jarak
  // dari tepi kanan dikecilkan dari 90 → 60px). Teks "Nomor:" & tanggal
  // di bawahnya otomatis ikut geser & melebar karena posisinya dihitung
  // dari `qrX`/`qrSize`, dan fontSize-nya juga dinaikkan sedikit (10 →
  // 11.5) biar sepadan sama QR yang sekarang lebih besar.
  const qrSize = 115;
  const qrX = pageW - 60 - qrSize;
  const qrY = pageH - 75 - qrSize;
  doc.image(qrBuffer, qrX, qrY, { width: qrSize });

  doc
    .font(FONTS.bold)
    .fontSize(11.5)
    .fillColor(COLORS.black)
    .text(
      `Nomor: ${displayNumber ?? certificateNumber}`,
      qrX - 40,
      qrY + qrSize + 10,
      {
        width: qrSize + 80,
        align: "center",
      },
    );

  doc
    .font(FONTS.regular)
    .fontSize(11.5)
    .fillColor(COLORS.gray)
    .text(formatIssueDateID(issueDate), qrX - 40, qrY + qrSize + 26, {
      width: qrSize + 80,
      align: "center",
    });
}

/**
 * 🔥 BARU: Singkat nama peserta kalau nama lengkapnya bakal kepanjangan
 * (melebihi 1 baris di area yang tersedia).
 *
 * Logikanya:
 *   1. Cek dulu lebar nama LENGKAP pakai font & fontSize yang sama
 *      dengan yang dipakai buat nge-render (biar pengukurannya akurat).
 *   2. Kalau lebar nama LENGKAP masih muat dalam 1 baris (<= maxWidth),
 *      tampilkan nama lengkap apa adanya — nggak disingkat.
 *   3. Kalau kepanjangan (bakal wrap ke baris ke-2), maka:
 *      - 2 kata PERTAMA tetap ditampilkan utuh
 *      - sisa kata-kata setelahnya disingkat jadi inisial + titik
 *      Contoh: "Nasywaa Salma Salsabila Putri Ramadhani"
 *              → "Nasywaa Salma S. P. R."
 *   4. Kalau nama cuma terdiri dari 1-2 kata tapi TETAP kepanjangan
 *      (kasus jarang, misal nama tunggal yang sangat panjang), nama
 *      dikembalikan apa adanya karena nggak ada lagi yang bisa
 *      disingkat.
 *
 * Catatan: fungsi ini HARUS dipanggil SETELAH `doc.font(...)` &
 * `doc.fontSize(...)` di-set ke nilai yang bakal dipakai buat nge-render
 * nama (`FONTS.bold`, 40), karena `doc.widthOfString()` bergantung ke
 * font/fontSize yang lagi aktif di `doc`.
 */
function formatUserNameForCertificate(
  doc: PDFKit.PDFDocument,
  fullName: string,
  maxWidth: number,
): string {
  const trimmed = fullName.trim();

  // Nama lengkap masih muat 1 baris → nggak perlu disingkat.
  if (doc.widthOfString(trimmed) <= maxWidth) {
    return trimmed;
  }

  const words = trimmed.split(/\s+/).filter(Boolean);

  // Cuma 1-2 kata tapi tetap kepanjangan → nggak ada lagi yang bisa
  // disingkat, kembalikan apa adanya (biarin PDFKit yang wrap sendiri).
  if (words.length <= 2) {
    return trimmed;
  }

  const firstTwo = words.slice(0, 2);
  const rest = words.slice(2);
  const initials = rest.map((w) => `${w[0].toUpperCase()}.`).join(" ");

  return `${firstTwo.join(" ")} ${initials}`;
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
    logoImagePath: opts.logoImagePath,
    marginRight: 30,
    marginTop: 0,
    width: 56,
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
