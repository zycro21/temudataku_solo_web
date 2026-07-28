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

export const sendELearningSubscriptionPaymentSuccessEmail = async ({
  email,
  fullName,
  planName,
  merchantOrderId,
  paymentMethod,
  amount,
  paymentDate,
  originalPrice,
  discountAmount,
  discountCode,
}: {
  email: string;
  fullName: string;
  planName: string;
  merchantOrderId: string;
  paymentMethod: string | null;
  amount: number;
  paymentDate: Date;
  originalPrice?: number | null;
  discountAmount?: number | null;
  discountCode?: string | null;
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

  // 🔥 Gunakan mapping, fallback ke kode asli jika tidak ditemukan
  const paymentMethodLabel = paymentMethod
    ? (PAYMENT_METHOD_MAP[paymentMethod] ?? paymentMethod)
    : "-";

  // 🔥 Nama produk selalu diawali "E-Learning Subscription"
  const productName = `E-Learning Subscription - ${planName}`;

  const hasDiscount = !!discountAmount && discountAmount > 0;

  const discountSection = hasDiscount
    ? `
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px; color:#6b7280; font-size:13px;">Harga Awal</td>
            <td style="padding:13px 18px; color:#9ca3af; font-size:13px; text-decoration:line-through;">${formatRupiah(originalPrice ?? amount)}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px; color:#6b7280; font-size:13px;">Diskon${discountCode ? ` (${discountCode})` : ""}</td>
            <td style="padding:13px 18px; color:#dc2626; font-size:13px; font-weight:600;">- ${formatRupiah(discountAmount!)}</td>
          </tr>`
    : "";

  const mailOptions = {
    from: `"TemuDataku" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Pembayaran Berhasil – ${productName} | TemuDataku`,
    html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Konfirmasi Pembayaran E-Learning Subscription</title>
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
        Selamat, langganan E-Learning kamu telah aktif.
      </p>
    </div>

    <!-- BODY -->
    <div style="padding:28px 30px;">

      <p style="margin:0 0 20px 0; color:#374151; font-size:15px; line-height:1.7;">
        Halo <strong>${fullName}</strong>,
      </p>
      <p style="margin:0 0 24px 0; color:#374151; font-size:15px; line-height:1.7;">
        Terima kasih telah melakukan pembayaran untuk <strong>${productName}</strong>.
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
            <td style="padding:13px 18px; color:#6b7280; font-size:13px; width:45%;">Produk</td>
            <td style="padding:13px 18px; color:#111827; font-size:13px; font-weight:600;">${productName}</td>
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
          </tr>${discountSection}
          <tr>
            <td style="padding:13px 18px; color:#6b7280; font-size:13px;">Total Dibayar</td>
            <td style="padding:13px 18px; color:#10b981; font-size:15px; font-weight:700;">${formatRupiah(amount)}</td>
          </tr>
        </table>
      </div>

      <!-- STATUS BADGE -->
      <div style="text-align:center; margin-bottom:24px;">
        <span style="display:inline-block; background-color:#dcfce7; color:#166534; font-size:13px; font-weight:600; padding:7px 20px; border-radius:999px; border:1px solid #bbf7d0;">
          ✅ Status: LUNAS / CONFIRMED
        </span>
      </div>

      <!-- PENUTUP -->
      <p style="margin:28px 0 0 0; color:#374151; font-size:14px; line-height:1.7;">
        Jika ada pertanyaan, jangan ragu untuk menghubungi tim kami melalui WhatsApp (0822-3452-9895 / 0853-3619-6913) atau email resmi TemuDataku.
      </p>
      <p style="margin:10px 0 0 0; color:#374151; font-size:14px; line-height:1.7;">
        Selamat belajar dan sampai jumpa di kelas! 🚀
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
