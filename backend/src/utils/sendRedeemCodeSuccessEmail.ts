import nodemailer from "nodemailer";

export const sendRedeemCodeSuccessEmail = async ({
  email,
  fullName,
  planName,
  code,
  durationDay,
  redeemedAt,
  startAt,
  endAt,
}: {
  email: string;
  fullName: string;
  planName: string;
  code: string;
  durationDay: number;
  redeemedAt: Date;
  startAt: Date;
  endAt: Date;
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDateOnly = (date: Date) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  // 🔥 Nama produk selalu diawali "E-Learning Subscription" — samain
  // konvensi sama email pembayaran, biar user gampang ngenalin ini
  // langganan yang sama, cuma jalur perolehannya beda (redeem vs bayar).
  const productName = `E-Learning Subscription - ${planName}`;

  const mailOptions = {
    from: `"TemuDataku" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🎁 Klaim Kode Redeem Berhasil – ${productName} | TemuDataku`,
    html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Konfirmasi Klaim Kode Redeem E-Learning Subscription</title>
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
      <div style="display:inline-block; background-color:#10b981; border-radius:50%; width:56px; height:56px; line-height:56px; font-size:26px; color:#ffffff; margin-bottom:12px;">
        🎁
      </div>
      <h2 style="margin:0; color:#065f46; font-size:20px; font-weight:700;">
        Klaim Kode Redeem Berhasil!
      </h2>
      <p style="margin:8px 0 0 0; color:#047857; font-size:14px;">
        Selamat, langganan E-Learning kamu sudah aktif — tanpa perlu bayar.
      </p>
    </div>

    <!-- BODY -->
    <div style="padding:28px 30px;">

      <p style="margin:0 0 20px 0; color:#374151; font-size:15px; line-height:1.7;">
        Halo <strong>${fullName}</strong>,
      </p>
      <p style="margin:0 0 24px 0; color:#374151; font-size:15px; line-height:1.7;">
        Kode redeem yang kamu masukkan berhasil diklaim, dan kamu sekarang
        punya akses penuh ke <strong>${productName}</strong>.
        Berikut adalah detail klaimnya:
      </p>

      <!-- DETAIL KLAIM -->
      <div style="background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; margin-bottom:24px;">
        <div style="background-color:#10b981; padding:12px 18px;">
          <p style="margin:0; color:#ffffff; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">
            Detail Klaim
          </p>
        </div>

        <table style="width:100%; border-collapse:collapse;">
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px; color:#6b7280; font-size:13px; width:45%;">Produk</td>
            <td style="padding:13px 18px; color:#111827; font-size:13px; font-weight:600;">${productName}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px; color:#6b7280; font-size:13px;">Kode Redeem</td>
            <td style="padding:13px 18px; color:#065f46; font-size:13px; font-family:monospace; font-weight:700; letter-spacing:0.5px;">${code}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px; color:#6b7280; font-size:13px;">Tanggal Klaim</td>
            <td style="padding:13px 18px; color:#111827; font-size:13px;">${formatDate(redeemedAt)}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px; color:#6b7280; font-size:13px;">Durasi Akses</td>
            <td style="padding:13px 18px; color:#111827; font-size:13px;">${durationDay} hari</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px; color:#6b7280; font-size:13px;">Berlaku Hingga</td>
            <td style="padding:13px 18px; color:#111827; font-size:13px;">${formatDateOnly(endAt)}</td>
          </tr>
          <tr>
            <td style="padding:13px 18px; color:#6b7280; font-size:13px;">Biaya</td>
            <td style="padding:13px 18px; color:#10b981; font-size:15px; font-weight:700;">GRATIS (Kode Redeem)</td>
          </tr>
        </table>
      </div>

      <!-- STATUS BADGE -->
      <div style="text-align:center; margin-bottom:24px;">
        <span style="display:inline-block; background-color:#dcfce7; color:#166534; font-size:13px; font-weight:600; padding:7px 20px; border-radius:999px; border:1px solid #bbf7d0;">
          ✅ Status: AKTIF
        </span>
      </div>

      <!-- PENUTUP -->
      <p style="margin:28px 0 0 0; color:#374151; font-size:14px; line-height:1.7;">
        Jika ada pertanyaan, jangan ragu untuk menghubungi tim kami melalui WhatsApp (0851-5675-0480 / 0853-3619-6913) atau email resmi TemuDataku.
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
