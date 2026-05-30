import nodemailer from "nodemailer";

export const sendInstallmentReminderEmail = async ({
  type,
  to,
  name,
  serviceName,
  installmentNumber,
  amount,
  dueDate,
  paymentId,
}: {
  type: "H_MINUS_3" | "DUE_TODAY" | "OVERDUE";

  to: string;
  name: string;
  serviceName: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  paymentId: string;
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
    });

  // ======================================================
  // PAYMENT URL
  // ======================================================

  const paymentUrl = `${process.env.FRONTEND_URL}/payment/${paymentId}`;

  let subject = "";
  let heading = "";
  let message = "";

  if (type === "H_MINUS_3") {
    subject = `📅 Pengingat Cicilan Jatuh Tempo 3 Hari Lagi`;

    heading = "Reminder Pembayaran Cicilan";

    message = `
    Pembayaran cicilan kamu akan jatuh tempo dalam 3 hari.
    Segera lakukan pembayaran agar akses program tetap berjalan lancar.
  `;
  }

  if (type === "DUE_TODAY") {
    subject = `⏰ Cicilan Jatuh Tempo Hari Ini`;

    heading = "Cicilan Jatuh Tempo Hari Ini";

    message = `
    Pembayaran cicilan kamu jatuh tempo hari ini.
    Segera lakukan pembayaran untuk menghindari keterlambatan.
  `;
  }

  if (type === "OVERDUE") {
    subject = `🚨 Cicilan Telah Melewati Jatuh Tempo`;

    heading = "Tagihan Cicilan Belum Dibayar";

    message = `
    Pembayaran cicilan kamu telah melewati tanggal jatuh tempo.
    Mohon segera lakukan pembayaran agar tidak mengganggu akses layanan.
  `;
  }

  // Warna aksen per tipe — tetap dalam keluarga emerald/hijau,
  // hanya OVERDUE pakai merah karena sifatnya darurat
  const accentColor =
    type === "OVERDUE"
      ? "#dc2626"
      : type === "DUE_TODAY"
        ? "#059669"
        : "#10b981";

  const accentBg =
    type === "OVERDUE"
      ? "#fee2e2"
      : type === "DUE_TODAY"
        ? "#d1fae5"
        : "#ecfdf5";

  const badgeLabel =
    type === "OVERDUE"
      ? "⚠️ MELEWATI JATUH TEMPO"
      : type === "DUE_TODAY"
        ? "⏰ JATUH TEMPO HARI INI"
        : "📅 3 HARI LAGI";

  const heroIcon =
    type === "OVERDUE" ? "🚨" : type === "DUE_TODAY" ? "⏰" : "📅";

  const noticeSection =
    type === "OVERDUE"
      ? `
      <div style="background-color:#fee2e2;border:1px solid #fecaca;border-radius:10px;padding:16px 18px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;font-weight:600;color:#dc2626;">⚠️ Perhatian</p>
        <p style="margin:8px 0 0 0;font-size:13px;color:#7f1d1d;line-height:1.6;">
          Tagihan ini telah melewati tanggal jatuh tempo. Mohon segera selesaikan pembayaran
          agar akses dan layanan program tidak terganggu.
        </p>
      </div>`
      : type === "DUE_TODAY"
        ? `
      <div style="background-color:#d1fae5;border:1px solid #6ee7b7;border-radius:10px;padding:16px 18px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;font-weight:600;color:#065f46;">💡 Info</p>
        <p style="margin:8px 0 0 0;font-size:13px;color:#064e3b;line-height:1.6;">
          Tagihan ini jatuh tempo hari ini. Lakukan pembayaran sekarang untuk menghindari keterlambatan.
        </p>
      </div>`
        : `
      <div style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:16px 18px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;font-weight:600;color:#065f46;">💡 Pengingat</p>
        <p style="margin:8px 0 0 0;font-size:13px;color:#064e3b;line-height:1.6;">
          Kamu masih punya waktu 3 hari untuk melakukan pembayaran. Jangan sampai terlewat ya!
        </p>
      </div>`;

  const mailOptions = {
    from: `"TemuDataku" <${process.env.EMAIL_USER}>`,
    to,
    subject,

    html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

  <div style="max-width:600px;margin:32px auto;background-color:#ffffff;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,0.08);overflow:hidden;">

    <!-- HEADER -->
    <div style="background-color:#10b981;padding:32px 30px 24px 30px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.3px;">TemuDataku</h1>
      <p style="margin:6px 0 0 0;color:#d1fae5;font-size:13px;">Pengingat Pembayaran Cicilan</p>
    </div>

    <!-- HERO -->
    <div style="background-color:#ecfdf5;text-align:center;padding:24px 30px 20px 30px;border-bottom:1px solid #d1fae5;">
      <div style="display:inline-block;background-color:${accentColor};border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;color:#ffffff;margin-bottom:12px;">
        ${heroIcon}
      </div>
      <h2 style="margin:0;color:#065f46;font-size:20px;font-weight:700;">${heading}</h2>
      <div style="display:inline-block;margin-top:10px;background-color:${accentBg};color:${accentColor};font-size:11px;font-weight:700;padding:5px 16px;border-radius:999px;letter-spacing:0.5px;">
        ${badgeLabel}
      </div>
    </div>

    <!-- BODY -->
    <div style="padding:28px 30px;">

      <p style="margin:0 0 16px 0;color:#374151;font-size:15px;line-height:1.7;">
        Halo <strong>${name}</strong>,
      </p>

      <p style="margin:0 0 16px 0;color:#374151;font-size:15px;line-height:1.7;">
        ${message}
      </p>

      <p style="margin:0 0 24px 0;color:#374151;font-size:15px;line-height:1.7;">
        Berikut adalah detail tagihan cicilan ke-<strong>${installmentNumber}</strong>
        untuk program <strong>${serviceName}</strong>:
      </p>

      <!-- DETAIL BOX -->
      <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
        <div style="background-color:#10b981;padding:12px 18px;">
          <p style="margin:0;color:#ffffff;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">💳 Detail Tagihan</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px;color:#6b7280;font-size:13px;width:45%;">Program</td>
            <td style="padding:13px 18px;color:#111827;font-size:13px;font-weight:600;">${serviceName}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px;color:#6b7280;font-size:13px;">Cicilan</td>
            <td style="padding:13px 18px;color:#111827;font-size:13px;font-weight:600;">Ke-${installmentNumber}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px;color:#6b7280;font-size:13px;">Jumlah</td>
            <td style="padding:13px 18px;color:#10b981;font-size:15px;font-weight:700;">${formatRupiah(amount)}</td>
          </tr>
          <tr>
            <td style="padding:13px 18px;color:#6b7280;font-size:13px;">Jatuh Tempo</td>
            <td style="padding:13px 18px;color:${accentColor};font-size:13px;font-weight:700;">${formatDate(dueDate)}</td>
          </tr>
        </table>
      </div>

      <!-- STATUS NOTICE -->
      ${noticeSection}

      <!-- CTA BUTTON -->
      <div style="text-align:center;margin:28px 0;">
        <a href="${paymentUrl}"
          style="display:inline-block;padding:13px 36px;background-color:#10b981;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;letter-spacing:0.2px;">
          Bayar Sekarang
        </a>
        <p style="margin:12px 0 0 0;font-size:11px;color:#6b7280;">
          Jika tombol tidak berfungsi, salin link berikut:
        </p>
        <div style="word-break:break-all;background-color:#f9fafb;border:1px dashed #a7f3d0;padding:8px 12px;border-radius:6px;font-size:11px;color:#059669;margin-top:6px;">
          ${paymentUrl}
        </div>
      </div>

      <p style="margin:0 0 16px 0;color:#6b7280;font-size:13px;line-height:1.7;">
        Jika kamu sudah melakukan pembayaran, abaikan email ini.
        Butuh bantuan? Hubungi kami di <strong>0822-3452-9895 / 0853-3619-6913</strong>.
      </p>

      <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
        Salam,<br/>
        <strong style="color:#10b981;">Tim TemuDataku</strong>
      </p>
    </div>

    <!-- FOOTER -->
    <div style="background-color:#f0fdf4;border-top:1px solid #d1fae5;padding:18px 30px;text-align:center;">
      <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.6;">
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