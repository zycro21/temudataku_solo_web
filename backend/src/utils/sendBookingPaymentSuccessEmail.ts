import nodemailer from "nodemailer";

// 🔥 Mapping kode Duitku → nama metode pembayaran
const PAYMENT_METHOD_MAP: Record<string, string> = {
  A1: "ATM Bersama",
  I1: "Bank Nasional Indonesia (BNI)",
  M2: "Bank Mandiri",
  BR: "Bank Rakyat Indonesia (BRI)",
  BV: "Bank Syariah Indonesia (BSI)",
  SP: "QRIS/Shopeepay",
};

export const sendBookingPaymentSuccessEmail = async ({
  email,
  fullName,

  // ubah
  serviceName,
  programName,

  merchantOrderId,
  paymentMethod,
  amount,
  paymentDate,
  whatsappGroup,

  paymentType,
  invoiceStatus,
  remainingAmount,
  nextDueDate,
  installmentNumber,
  installmentCount,
}: {
  email: string;
  fullName: string;

  // NEW
  serviceName: string;
  programName: string;

  merchantOrderId: string;
  paymentMethod: string | null;
  amount: number;
  paymentDate: Date;
  whatsappGroup: string | null;

  paymentType: "FULL" | "INSTALLMENT";
  invoiceStatus: string;

  remainingAmount?: number;
  nextDueDate?: Date | null;

  installmentNumber?: number | null;
  installmentCount?: number | null;
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const formatRupiah = (value: number) => `Rp${value.toLocaleString("id-ID")}`;

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const paymentMethodLabel = paymentMethod
    ? (PAYMENT_METHOD_MAP[paymentMethod] ?? paymentMethod)
    : "-";

  const whatsappSection = whatsappGroup
    ? `
      <div style="margin-top: 28px; background-color: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 10px; padding: 20px;">
        <p style="margin: 0 0 10px 0; font-size: 15px; font-weight: 600; color: #065f46;">
          🟢 Bergabung ke Grup WhatsApp Bootcamp
        </p>
        <p style="margin: 0 0 14px 0; font-size: 14px; color: #374151; line-height: 1.6;">
          Klik tombol di bawah untuk bergabung ke grup WhatsApp eksklusif peserta program <strong>${programName}</strong>.
          Di sini kamu akan mendapat info jadwal, materi, dan update terbaru dari Tim TemuDataku.
        </p>
        <a href="${whatsappGroup}"
          style="display: inline-block; padding: 11px 28px; background-color: #25D366; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Gabung Grup WhatsApp
        </a>
        <p style="margin: 14px 0 6px 0; font-size: 12px; color: #6b7280;">
          Jika tombol tidak berfungsi, salin link berikut:
        </p>
        <div style="word-break: break-all; background-color: #ffffff; border: 1px dashed #6ee7b7; padding: 10px; border-radius: 6px; font-size: 12px; color: #065f46;">
          ${whatsappGroup}
        </div>
      </div>
    `
    : "";

  const isFullyPaid = invoiceStatus === "PAID_DONE";

  const paymentStatusBadge = isFullyPaid
    ? `
    <span style="display:inline-block; background-color:#dcfce7; color:#166534; font-size:13px; font-weight:600; padding:7px 20px; border-radius:999px; border:1px solid #bbf7d0;">
      ✅ Status: LUNAS
    </span>
  `
    : `
    <span style="display:inline-block; background-color:#fef3c7; color:#92400e; font-size:13px; font-weight:600; padding:7px 20px; border-radius:999px; border:1px solid #fde68a;">
      ⏳ Status: CICILAN BERHASIL
    </span>
  `;

  const installmentInfoSection =
    paymentType === "INSTALLMENT" && !isFullyPaid
      ? `
      <div style="margin-top: 22px; background-color:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:18px;">
        <p style="margin:0 0 12px 0; font-size:15px; font-weight:700; color:#92400e;">
          📌 Informasi Cicilan
        </p>

        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0; color:#6b7280; font-size:13px;">
              Cicilan
            </td>

            <td style="padding:8px 0; text-align:right; color:#111827; font-size:13px; font-weight:600;">
              ${installmentNumber}/${installmentCount}
            </td>
          </tr>

          <tr>
            <td style="padding:8px 0; color:#6b7280; font-size:13px;">
              Sisa Pembayaran
            </td>

            <td style="padding:8px 0; text-align:right; color:#b45309; font-size:13px; font-weight:700;">
              ${formatRupiah(remainingAmount || 0)}
            </td>
          </tr>

          ${
            nextDueDate
              ? `
              <tr>
                <td style="padding:8px 0; color:#6b7280; font-size:13px;">
                  Jatuh Tempo Berikutnya
                </td>

                <td style="padding:8px 0; text-align:right; color:#111827; font-size:13px; font-weight:600;">
                  ${formatDate(nextDueDate)}
                </td>
              </tr>
            `
              : ""
          }
        </table>

        <p style="margin:14px 0 0 0; font-size:12px; line-height:1.7; color:#92400e;">
          Pembayaran cicilan kamu berhasil diterima, namun program belum sepenuhnya lunas.
          Silakan lakukan pembayaran berikutnya sebelum tanggal jatuh tempo.
        </p>
      </div>
    `
      : "";

  const mailOptions = {
    from: `"TemuDataku" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Pembayaran Berhasil – ${serviceName} | TemuDataku`,
    html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Konfirmasi Pembayaran Bootcamp</title>
</head>
<body style="margin:0; padding:0; background-color:#f0fdf4; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

  <div style="max-width:600px; margin:32px auto; background-color:#ffffff; border-radius:12px; box-shadow:0 2px 16px rgba(0,0,0,0.08); overflow:hidden;">

    <!-- HEADER -->
    <div style="background-color:#10b981; padding:32px 30px 24px 30px; text-align:center;">
      <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.3px;">
        TemuDataku
      </h1>
    </div>

    <!-- HERO BADGE -->
    <div style="background-color:#ecfdf5; text-align:center; padding:24px 30px 20px 30px; border-bottom:1px solid #d1fae5;">
      <div style="display:inline-block; background-color:#10b981; border-radius:50%; width:56px; height:56px; line-height:56px; font-size:28px; color:#ffffff; margin-bottom:12px;">
        ✓
      </div>
      <h2 style="margin:0; color:#065f46; font-size:20px; font-weight:700;">
        Pembayaran Berhasil!
      </h2>
      <p style="margin:8px 0 0 0; color:#047857; font-size:14px;">
        Selamat, pendaftaran kamu telah dikonfirmasi.
      </p>
    </div>

    <!-- BODY -->
    <div style="padding:28px 30px;">

      <p style="margin:0 0 20px 0; color:#374151; font-size:15px; line-height:1.7;">
        Halo <strong>${fullName}</strong>,
      </p>
      <p style="margin:0 0 24px 0; color:#374151; font-size:15px; line-height:1.7;">
        Terima kasih telah melakukan pembayaran untuk program <strong>${serviceName}</strong>. 
        Berikut adalah detail transaksi kamu:
      </p>

      <!-- DETAIL TRANSAKSI -->
      <div style="background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; margin-bottom:24px;">
        <div style="background-color:#10b981; padding:12px 18px;">
          <p style="margin:0; color:#ffffff; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">
            Detail Transaksi
          </p>
        </div>

        <table style="width:100%; border-collapse:collapse;">
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px; color:#6b7280; font-size:13px; width:45%;">Program</td>
            <td style="padding:13px 18px; color:#111827; font-size:13px; font-weight:600;">${serviceName}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px; color:#6b7280; font-size:13px;">No. Order</td>
            <td style="padding:13px 18px; color:#111827; font-size:13px; font-family:monospace;">${merchantOrderId}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px; color:#6b7280; font-size:13px;">Metode Pembayaran</td>
            <td style="padding:13px 18px; color:#111827; font-size:13px;">${paymentMethodLabel}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px; color:#6b7280; font-size:13px;">Tanggal Pembayaran</td>
            <td style="padding:13px 18px; color:#111827; font-size:13px;">${formatDate(paymentDate)}</td>
          </tr>
          <tr>
            <td style="padding:13px 18px; color:#6b7280; font-size:13px;">Total Dibayar</td>
            <td style="padding:13px 18px; color:#10b981; font-size:15px; font-weight:700;">${formatRupiah(amount)}</td>
          </tr>
        </table>
      </div>

      <!-- STATUS BADGE -->
      <div style="text-align:center; margin-bottom:24px;">
        ${paymentStatusBadge}
      </div>

      ${installmentInfoSection}

      <!-- WHATSAPP SECTION -->
      ${whatsappSection}

      <!-- PENUTUP -->
      <p style="margin:28px 0 0 0; color:#374151; font-size:14px; line-height:1.7;">
        Jika ada pertanyaan, jangan ragu untuk menghubungi tim kami melalui WhatsApp (0822-3452-9895 / 0853-3619-6913) atau email resmi TemuDataku.
      </p>
      <p style="margin:10px 0 0 0; color:#374151; font-size:14px; line-height:1.7;">
        Semangat belajar dan sampai jumpa di kelas! 🚀
      </p>
      <p style="margin:16px 0 0 0; color:#374151; font-size:14px;">
        Salam hangat,<br/>
        <strong style="color:#10b981;">Tim TemuDataku</strong>
      </p>
    </div>

    <!-- FOOTER -->
    <div style="background-color:#f0fdf4; border-top:1px solid #d1fae5; padding:18px 30px; text-align:center;">
      <p style="margin:0; color:#6b7280; font-size:12px; line-height:1.6;">
        © ${new Date().getFullYear()} TemuDataku. Semua hak cipta dilindungi.<br/>
        Email ini dikirim otomatis, mohon tidak membalas email ini.
      </p>
    </div>

  </div>
</body>
</html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
