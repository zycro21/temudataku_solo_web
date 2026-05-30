import nodemailer from "nodemailer";

export const sendMentorBookingNotificationEmail = async ({
  mentorEmail,
  mentorName,

  menteeName,
  menteeEmail,

  serviceName,
  serviceType,

  specialRequests,
  material,
  expectedOutput,

  sessionDate,
  startTime,
  endTime,
  durationMinutes,
  meetingLink,
}: {
  mentorEmail: string;
  mentorName: string;

  menteeName: string;
  menteeEmail: string;

  serviceName: string;
  serviceType: string;

  specialRequests?: string | null;
  material?: string | null;
  expectedOutput?: string | null;

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

  const serviceTypeLabel =
    serviceType === "one-on-one" ? "Mentoring 1-on-1" : "Mentoring Grup";

  const sessionInfoSection =
    sessionDate || startTime || meetingLink
      ? `
      <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;overflow:hidden;margin-bottom:24px;">
        <div style="background-color:#059669;padding:12px 18px;">
          <p style="margin:0;color:#ffffff;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">📅 Jadwal Sesi</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          ${
            sessionDate
              ? `
          <tr style="border-bottom:1px solid #d1fae5;">
            <td style="padding:13px 18px;color:#6b7280;font-size:13px;width:45%;">Tanggal Sesi</td>
            <td style="padding:13px 18px;color:#111827;font-size:13px;font-weight:600;">${sessionDate}</td>
          </tr>`
              : ""
          }
          ${
            startTime && endTime
              ? `
<tr style="border-bottom:1px solid #d1fae5;">
  <td style="padding:13px 18px;color:#6b7280;font-size:13px;">Waktu</td>
  <td style="padding:13px 18px;color:#111827;font-size:13px;font-weight:600;">
    ${formatSessionTime(startTime)} – ${formatSessionTime(endTime)} WIB
  </td>
</tr>`
              : ""
          }
          ${
            durationMinutes
              ? `
          <tr style="border-bottom:1px solid #d1fae5;">
            <td style="padding:13px 18px;color:#6b7280;font-size:13px;">Durasi</td>
            <td style="padding:13px 18px;color:#111827;font-size:13px;">${durationMinutes} menit</td>
          </tr>`
              : ""
          }
          ${
            meetingLink
              ? `
          <tr>
            <td style="padding:13px 18px;color:#6b7280;font-size:13px;">Link Meeting</td>
            <td style="padding:13px 18px;font-size:13px;">
              <a href="${meetingLink}" style="color:#059669;font-weight:600;word-break:break-all;">${meetingLink}</a>
            </td>
          </tr>`
              : ""
          }
        </table>
      </div>`
      : "";

  const sessionDetailSection =
    material || expectedOutput || specialRequests
      ? `
      <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
        <div style="background-color:#10b981;padding:12px 18px;">
          <p style="margin:0;color:#ffffff;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">📝 Kebutuhan Mentee</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          ${
            material
              ? `
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px;color:#6b7280;font-size:13px;width:45%;vertical-align:top;">Materi / Kebutuhan</td>
            <td style="padding:13px 18px;color:#111827;font-size:13px;line-height:1.6;">${material}</td>
          </tr>`
              : ""
          }
          ${
            expectedOutput
              ? `
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px;color:#6b7280;font-size:13px;vertical-align:top;">Output yang Diharapkan</td>
            <td style="padding:13px 18px;color:#111827;font-size:13px;line-height:1.6;">${expectedOutput}</td>
          </tr>`
              : ""
          }
          ${
            specialRequests
              ? `
          <tr>
            <td style="padding:13px 18px;color:#6b7280;font-size:13px;vertical-align:top;">Permintaan Khusus</td>
            <td style="padding:13px 18px;color:#111827;font-size:13px;line-height:1.6;">${specialRequests}</td>
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
  <title>Notifikasi Booking Mentoring Baru</title>
</head>
<body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background-color:#ffffff;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,0.08);overflow:hidden;">

    <!-- HEADER -->
    <div style="background-color:#10b981;padding:32px 30px 24px 30px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.3px;">TemuDataku</h1>
    </div>

    <!-- HERO -->
    <div style="background-color:#ecfdf5;text-align:center;padding:24px 30px 20px 30px;border-bottom:1px solid #d1fae5;">
      <div style="display:inline-block;background-color:#10b981;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;color:#ffffff;margin-bottom:12px;">📩</div>
      <h2 style="margin:0;color:#065f46;font-size:20px;font-weight:700;">Ada Booking Mentoring Baru!</h2>
      <p style="margin:8px 0 0 0;color:#047857;font-size:14px;">Seorang mentee telah memesan sesi mentoring bersamamu.</p>
    </div>

    <!-- BODY -->
    <div style="padding:28px 30px;">

      <p style="margin:0 0 20px 0;color:#374151;font-size:15px;line-height:1.7;">
        Halo <strong>${mentorName}</strong>,
      </p>
      <p style="margin:0 0 24px 0;color:#374151;font-size:15px;line-height:1.7;">
        Kamu mendapatkan booking <strong>${serviceTypeLabel}</strong> baru untuk program <strong>${serviceName}</strong>. Berikut detail mentee dan jadwal sesinya:
      </p>

      <!-- INFO MENTEE -->
      <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
        <div style="background-color:#10b981;padding:12px 18px;">
          <p style="margin:0;color:#ffffff;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">👤 Informasi Mentee</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px;color:#6b7280;font-size:13px;width:45%;">Nama</td>
            <td style="padding:13px 18px;color:#111827;font-size:13px;font-weight:600;">${menteeName}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px;color:#6b7280;font-size:13px;">Email</td>
            <td style="padding:13px 18px;color:#111827;font-size:13px;">${menteeEmail}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:13px 18px;color:#6b7280;font-size:13px;">Program</td>
            <td style="padding:13px 18px;color:#111827;font-size:13px;font-weight:600;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding:13px 18px;color:#6b7280;font-size:13px;">Tipe Sesi</td>
            <td style="padding:13px 18px;color:#111827;font-size:13px;">${serviceTypeLabel}</td>
          </tr>
        </table>
      </div>

      <!-- JADWAL SESI -->
      ${sessionInfoSection}

      <!-- KEBUTUHAN MENTEE -->
      ${sessionDetailSection}

      <!-- CALL TO ACTION -->
      <div style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:18px;margin-bottom:24px;">
        <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#92400e;">⚡ Tindak Lanjut</p>
        <ul style="margin:0;padding-left:20px;color:#374151;font-size:13px;line-height:2;">
          <li>Hubungi mentee di <strong>${menteeEmail}</strong> untuk konfirmasi dan koordinasi lebih lanjut.</li>
          <li>Siapkan materi yang relevan dengan kebutuhan mentee di atas.</li>
          <li>Pastikan link Zoom atau media meeting sudah siap sebelum sesi dimulai.</li>
        </ul>
      </div>

      <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
        Jika ada kendala, hubungi tim TemuDataku di <strong>0822-3452-9895 / 0853-3619-6913</strong>.
      </p>
      <p style="margin:16px 0 0 0;color:#374151;font-size:14px;">
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
</html>`;

  await transporter.sendMail({
    from: `"TemuDataku" <${process.env.EMAIL_USER}>`,
    to: mentorEmail,
    subject: `[Sesi Mentoring Baru] ${menteeName} memesan sesi ${serviceName}`,
    html,
  });
};
