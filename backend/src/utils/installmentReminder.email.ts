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

  const mailOptions = {
    from: `"TemuDataku" <${process.env.EMAIL_USER}>`,
    to,
    subject,

    html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
</head>

<body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial,sans-serif;">

  <div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08);">

    <!-- HEADER -->
    <div style="background:#f59e0b; padding:28px; text-align:center;">
      <h1 style="margin:0; color:#ffffff;">
        TemuDataku
      </h1>
    </div>

    <!-- CONTENT -->
    <div style="padding:30px;">

      <h2 style="margin-top:0; color:#111827;">
        ${heading}
      </h2>

      <p style="color:#374151; line-height:1.7;">
        Halo <strong>${name}</strong>,
      </p>

      <p style="color:#374151; line-height:1.7;">
       ${message}
      </p>

      <p style="color:#374151; line-height:1.7;">
         Pembayaran cicilan ke-${installmentNumber}
        untuk program <strong>${serviceName}</strong>.
      </p>

      <!-- BOX -->
      <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:20px; margin:24px 0;">

        <table style="width:100%; border-collapse:collapse;">

          <tr>
            <td style="padding:10px 0; color:#6b7280;">
              Program
            </td>

            <td style="padding:10px 0; font-weight:600; color:#111827;">
              ${serviceName}
            </td>
          </tr>

          <tr>
            <td style="padding:10px 0; color:#6b7280;">
              Cicilan
            </td>

            <td style="padding:10px 0; font-weight:600; color:#111827;">
              Ke-${installmentNumber}
            </td>
          </tr>

          <tr>
            <td style="padding:10px 0; color:#6b7280;">
              Jumlah
            </td>

            <td style="padding:10px 0; font-weight:700; color:#f59e0b;">
              ${formatRupiah(amount)}
            </td>
          </tr>

          <tr>
            <td style="padding:10px 0; color:#6b7280;">
              Jatuh Tempo
            </td>

            <td style="padding:10px 0; color:#111827;">
              ${formatDate(dueDate)}
            </td>
          </tr>

        </table>
      </div>

      <!-- BUTTON -->
      <div style="text-align:center; margin:30px 0;">

        <a href="${paymentUrl}"
          style="
            display:inline-block;
            padding:14px 28px;
            background:#f59e0b;
            color:#ffffff;
            text-decoration:none;
            border-radius:8px;
            font-weight:600;
          ">
          Bayar Sekarang
        </a>

      </div>

      <p style="color:#6b7280; line-height:1.7; font-size:14px;">
        Jika kamu sudah melakukan pembayaran, abaikan email ini.
      </p>

      <p style="color:#374151; line-height:1.7;">
        Salam,<br />
        <strong>Tim TemuDataku</strong>
      </p>

    </div>

    <!-- FOOTER -->
    <div style="background:#f9fafb; padding:20px; text-align:center; border-top:1px solid #e5e7eb;">
      <p style="margin:0; color:#9ca3af; font-size:12px;">
        © ${new Date().getFullYear()} TemuDataku
      </p>
    </div>

  </div>

</body>
</html>
`,
  };

  await transporter.sendMail(mailOptions);
};
