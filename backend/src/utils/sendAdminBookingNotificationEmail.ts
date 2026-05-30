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

export const sendAdminBookingNotificationEmail = async ({
  menteeName,
  menteeEmail,

  mentorNames,

  serviceName,
  serviceType,

  merchantOrderId,
  paymentMethod,
  amount,
  paymentDate,
  invoiceStatus,

  sessionDate,
  startTime,
  endTime,
  durationMinutes,
  meetingLink,
}: {
  menteeName: string;
  menteeEmail: string;

  mentorNames: string[];

  serviceName: string;
  serviceType: string;

  merchantOrderId: string;
  paymentMethod: string | null;
  amount: number;
  paymentDate: Date;
  invoiceStatus: string;

  // Data sesi mentoring
  sessionDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes?: number | null;
  meetingLink?: string | null;
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const formatSessionTime = (time: string | null | undefined) => {
    if (!time) return "-";

    return new Date(time).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    });
  };

  const formatRupiah = (value: number) => `Rp${value.toLocaleString("id-ID")}`;

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const serviceTypeLabel =
    serviceType === "one-on-one" ? "Mentoring 1-on-1" : "Mentoring Grup";

  const paymentMethodLabel = paymentMethod
    ? (PAYMENT_METHOD_MAP[paymentMethod] ?? paymentMethod)
    : "-";

  const invoiceStatusLabel =
    invoiceStatus === "PAID_DONE"
      ? `<span style="display:inline-block;background-color:#dcfce7;color:#166534;font-size:12px;font-weight:600;padding:4px 12px;border-radius:999px;border:1px solid #bbf7d0;">✅ LUNAS</span>`
      : invoiceStatus === "PARTIALLY_PAID"
        ? `<span style="display:inline-block;background-color:#fef3c7;color:#92400e;font-size:12px;font-weight:600;padding:4px 12px;border-radius:999px;border:1px solid #fde68a;">⏳ SEBAGIAN TERBAYAR</span>`
        : `<span style="display:inline-block;background-color:#fee2e2;color:#991b1b;font-size:12px;font-weight:600;padding:4px 12px;border-radius:999px;border:1px solid #fecaca;">❌ BELUM TERBAYAR</span>`;

  const sessionInfoSection =
    sessionDate || startTime || meetingLink
      ? `
      <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:20px;">
        <div style="background-color:#10b981;padding:10px 18px;">
          <p style="margin:0;color:#ffffff;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">📅 Jadwal Sesi Mentoring</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          ${
            sessionDate
              ? `
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px 18px;color:#6b7280;font-size:13px;width:40%;">Tanggal Sesi</td>
            <td style="padding:12px 18px;color:#111827;font-size:13px;font-weight:600;">${sessionDate}</td>
          </tr>`
              : ""
          }
          ${
            startTime && endTime
              ? `
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px 18px;color:#6b7280;font-size:13px;">Waktu</td>
            <td style="padding:12px 18px;color:#111827;font-size:13px;font-weight:600;">${formatSessionTime(startTime)} – ${formatSessionTime(endTime)} WIB</td>
          </tr>`
              : ""
          }
          ${
            durationMinutes
              ? `
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px 18px;color:#6b7280;font-size:13px;">Durasi</td>
            <td style="padding:12px 18px;color:#111827;font-size:13px;">${durationMinutes} menit</td>
          </tr>`
              : ""
          }
          ${
            meetingLink
              ? `
          <tr>
            <td style="padding:12px 18px;color:#6b7280;font-size:13px;">Link Meeting</td>
            <td style="padding:12px 18px;font-size:13px;">
              <a href="${meetingLink}" style="color:#10b981;font-weight:600;word-break:break-all;">${meetingLink}</a>
            </td>
          </tr>`
              : ""
          }
        </table>
      </div>`
      : "";

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Notifikasi Admin – Booking Mentoring Baru</title>
</head>
<body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background-color:#ffffff;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,0.08);overflow:hidden;">

    <!-- HEADER -->
    <div style="background-color:#10b981;padding:32px 30px 24px 30px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.3px;">TemuDataku</h1>
      <p style="margin:6px 0 0 0;color:#d1fae5;font-size:13px;">Panel Admin — Notifikasi Booking Baru</p>
    </div>

    <!-- HERO -->
    <div style="background-color:#ecfdf5;text-align:center;padding:24px 30px 20px 30px;border-bottom:1px solid #d1fae5;">
      <div style="display:inline-block;background-color:#10b981;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;color:#ffffff;margin-bottom:12px;">🧾</div>
      <h2 style="margin:0;color:#065f46;font-size:20px;font-weight:700;">Booking Mentoring Baru Masuk!</h2>
      <p style="margin:8px 0 0 0;color:#047857;font-size:14px;">Pembayaran telah dikonfirmasi. Berikut ringkasan lengkap transaksi.</p>
    </div>

    <!-- BODY -->
    <div style="padding:28px 30px;">

      <!-- STATUS BADGE -->
      <div style="text-align:center;margin-bottom:24px;">
        ${invoiceStatusLabel}
      </div>

      <!-- DATA MENTEE -->
      <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:20px;">
        <div style="background-color:#10b981;padding:10px 18px;">
          <p style="margin:0;color:#ffffff;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">👤 Data Mentee</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px 18px;color:#6b7280;font-size:13px;width:40%;">Nama</td>
            <td style="padding:12px 18px;color:#111827;font-size:13px;font-weight:600;">${menteeName}</td>
          </tr>
          <tr>
            <td style="padding:12px 18px;color:#6b7280;font-size:13px;">Email</td>
            <td style="padding:12px 18px;color:#111827;font-size:13px;">${menteeEmail}</td>
          </tr>
        </table>
      </div>

      <!-- DATA MENTOR -->
      <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:20px;">
        <div style="background-color:#10b981;padding:10px 18px;">
          <p style="margin:0;color:#ffffff;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">🎓 Data Mentor</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:12px 18px;color:#6b7280;font-size:13px;width:40%;">Nama Mentor</td>
            <td style="padding:12px 18px;color:#111827;font-size:13px;font-weight:600;">${mentorNames.join(", ")}</td>
          </tr>
        </table>
      </div>

      <!-- DETAIL PROGRAM -->
      <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:20px;">
        <div style="background-color:#10b981;padding:10px 18px;">
          <p style="margin:0;color:#ffffff;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">📚 Detail Program</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px 18px;color:#6b7280;font-size:13px;width:40%;">Program</td>
            <td style="padding:12px 18px;color:#111827;font-size:13px;font-weight:600;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding:12px 18px;color:#6b7280;font-size:13px;">Tipe Sesi</td>
            <td style="padding:12px 18px;color:#111827;font-size:13px;">${serviceTypeLabel}</td>
          </tr>
        </table>
      </div>

      <!-- JADWAL SESI -->
      ${sessionInfoSection}

      <!-- DETAIL PEMBAYARAN -->
      <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:20px;">
        <div style="background-color:#10b981;padding:10px 18px;">
          <p style="margin:0;color:#ffffff;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">💳 Detail Pembayaran</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px 18px;color:#6b7280;font-size:13px;width:40%;">No. Order</td>
            <td style="padding:12px 18px;color:#111827;font-size:13px;font-family:monospace;">${merchantOrderId}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px 18px;color:#6b7280;font-size:13px;">Metode Pembayaran</td>
            <td style="padding:12px 18px;color:#111827;font-size:13px;">${paymentMethodLabel}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px 18px;color:#6b7280;font-size:13px;">Tanggal Bayar</td>
            <td style="padding:12px 18px;color:#111827;font-size:13px;">${formatDate(paymentDate)}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:12px 18px;color:#6b7280;font-size:13px;">Total Dibayar</td>
            <td style="padding:12px 18px;color:#10b981;font-size:15px;font-weight:700;">${formatRupiah(amount)}</td>
          </tr>
          <tr>
            <td style="padding:12px 18px;color:#6b7280;font-size:13px;">Status</td>
            <td style="padding:12px 18px;">${invoiceStatusLabel}</td>
          </tr>
        </table>
      </div>

    </div>

    <!-- FOOTER -->
    <div style="background-color:#f0fdf4;border-top:1px solid #d1fae5;padding:18px 30px;text-align:center;">
      <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.6;">
        © ${new Date().getFullYear()} TemuDataku. Email admin otomatis — jangan dibalas.
      </p>
    </div>

  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"TemuDataku System" <${process.env.EMAIL_USER}>`,
    to: "temudataku@gmail.com",
    subject: `[Admin] Booking Baru – ${menteeName} × ${mentorNames.join(", ")} | ${serviceName}`,
    html,
  });
};
