import nodemailer from "nodemailer";

// Email untuk fitur Form Builder: tanda terima untuk responder dan notifikasi
// respons baru untuk pembuat form / tim. Dipanggil dari afterResponseSubmitted()
// di form_public.service.ts (best-effort, tidak boleh menggagalkan submit).
//
// Desain sengaja dibuat berbeda dari email transaksi (pembayaran):
//  - Tanda terima responder : hero gradasi rata-kiri + "tiket" ringkasan
//  - Notifikasi admin       : header gelap + kartu statistik + kartu responder

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// Teks dari responder / admin dimasukkan ke HTML email, jadi harus di-escape
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const WIB = { timeZone: "Asia/Jakarta" } as const;

const formatDate = (date: Date) =>
  `${new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...WIB,
  })} WIB`;

const formatDateOnly = (date: Date) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...WIB,
  });

const formatTimeOnly = (date: Date) =>
  `${new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    ...WIB,
  })} WIB`;

const FONT =
  "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif";

// ─── Tanda terima respons (ke responder) ────────────────────────────────────

export const sendFormResponseReceiptEmail = async ({
  email,
  respondentName,
  formTitle,
  submittedAt,
  confirmationMessage,
  editUrl,
}: {
  email: string;
  respondentName?: string | null;
  formTitle: string;
  /** Tidak ditampilkan di email responder; dibiarkan di signature agar pemanggil tidak berubah */
  responseId?: string;
  submittedAt: Date;
  confirmationMessage?: string | null;
  editUrl?: string | null;
}) => {
  const transporter = createTransporter();

  const safeTitle = escapeHtml(formTitle);
  const firstName = respondentName?.trim().split(/\s+/)[0] ?? "";
  const heading = firstName
    ? `Terima kasih, ${escapeHtml(firstName)}!`
    : "Terima kasih!";

  const confirmationSection = confirmationMessage?.trim()
    ? `
          <tr>
            <td style="padding:0 32px 22px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:14px;">
                <tr>
                  <td width="44" valign="top" style="padding:16px 0 16px 18px;font-family:Georgia,serif;font-size:44px;line-height:36px;color:#6ee7b7;">&ldquo;</td>
                  <td style="padding:16px 20px 16px 6px;font-family:${FONT};font-size:14px;line-height:1.7;color:#065f46;">
                    ${escapeHtml(confirmationMessage.trim()).replace(/\r?\n/g, "<br/>")}
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
    : "";

  const editSection = editUrl
    ? `
          <tr>
            <td style="padding:0 32px 26px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d1fae5;border-radius:14px;">
                <tr>
                  <td style="padding:20px 22px;font-family:${FONT};">
                    <p style="margin:0 0 4px 0;font-size:15px;font-weight:700;color:#064e3b;">Ada yang perlu diubah?</p>
                    <p style="margin:0 0 16px 0;font-size:13px;line-height:1.6;color:#4b5563;">
                      Jawabanmu masih bisa diedit selama form masih menerima respons.
                    </p>
                    <a href="${escapeHtml(editUrl)}"
                      style="display:inline-block;padding:11px 24px;border:2px solid #10b981;border-radius:999px;background-color:#ffffff;color:#047857;font-size:13px;font-weight:700;text-decoration:none;">
                      Ubah Jawaban &rarr;
                    </a>
                    <p style="margin:16px 0 6px 0;font-size:12px;color:#6b7280;">Atau salin link berikut:</p>
                    <div style="word-break:break-all;background-color:#f9fafb;border-radius:8px;padding:10px 12px;font-family:Consolas,Menlo,monospace;font-size:11px;line-height:1.5;color:#065f46;">
                      ${escapeHtml(editUrl)}
                    </div>
                    <p style="margin:12px 0 0 0;font-size:12px;line-height:1.5;color:#9ca3af;">
                      &#128274; Link ini bersifat pribadi. Jangan dibagikan karena bisa dipakai untuk mengubah jawabanmu.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
    : "";

  const mailOptions = {
    from: `"TemuDataku" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Terima kasih! Jawabanmu untuk "${formTitle}" sudah kami terima`,
    html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light only" />
  <title>Jawabanmu sudah kami terima</title>
</head>
<body style="margin:0;padding:0;background-color:#ecfdf5;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Jawabanmu untuk ${safeTitle} sudah kami terima.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ecfdf5;">
    <tr>
      <td align="center" style="padding:28px 12px 36px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">

          <!-- BRAND -->
          <tr>
            <td style="padding:0 8px 14px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:${FONT};font-size:19px;font-weight:800;letter-spacing:-0.3px;color:#064e3b;">
                    Temu<span style="color:#10b981;">Dataku</span>
                  </td>
                  <td align="right" style="font-family:${FONT};font-size:10px;font-weight:700;letter-spacing:2px;color:#059669;text-transform:uppercase;">
                    Tanda Terima
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- KARTU -->
          <tr>
            <td style="background-color:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 8px 28px rgba(6,95,70,0.12);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

                <!-- HERO -->
                <tr>
                  <td style="background-color:#10b981;background-image:linear-gradient(135deg,#34d399 0%,#10b981 45%,#047857 100%);padding:34px 32px 32px 32px;font-family:${FONT};">
                    <span style="display:inline-block;padding:6px 14px;border-radius:999px;background-color:#d1fae5;color:#065f46;font-size:11px;font-weight:800;letter-spacing:1.2px;">
                      &#10003;&nbsp; JAWABAN TERKIRIM
                    </span>
                    <h1 style="margin:18px 0 8px 0;font-size:28px;line-height:1.2;font-weight:800;color:#ffffff;">
                      ${heading}
                    </h1>
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#ecfdf5;">
                      Jawabanmu untuk <strong style="color:#ffffff;">${safeTitle}</strong> sudah kami terima dengan baik.
                    </p>
                  </td>
                </tr>

                <tr><td style="height:26px;line-height:26px;font-size:0;">&nbsp;</td></tr>

                ${confirmationSection}

                <!-- TIKET RINGKASAN -->
                <tr>
                  <td style="padding:0 32px 26px 32px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px dashed #a7f3d0;border-radius:16px;background-color:#f0fdf4;">
                      <tr>
                        <td colspan="2" style="padding:18px 22px 16px 22px;font-family:${FONT};">
                          <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#059669;">FORM</div>
                          <div style="margin-top:4px;font-size:17px;font-weight:700;line-height:1.35;color:#064e3b;">${safeTitle}</div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" valign="top" style="padding:16px 22px;border-top:2px dashed #a7f3d0;font-family:${FONT};">
                          <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#059669;">DIKIRIM PADA</div>
                          <div style="margin-top:4px;font-size:13px;line-height:1.5;color:#1f2937;">${formatDate(submittedAt)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${editSection}

                <!-- BANTUAN -->
                <tr>
                  <td style="padding:0 32px 30px 32px;font-family:${FONT};font-size:13px;line-height:1.7;color:#6b7280;">
                    Butuh bantuan? Hubungi kami lewat WhatsApp
                    <strong style="color:#065f46;">0851-5675-0480</strong> /
                    <strong style="color:#065f46;">0853-3619-6913</strong>
                    atau email resmi TemuDataku.
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding:22px 12px 0 12px;font-family:${FONT};font-size:11px;line-height:1.7;color:#047857;">
              &copy; ${new Date().getFullYear()} TemuDataku &middot; Email ini dikirim otomatis, mohon tidak membalas.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ─── Notifikasi respons baru (ke pembuat form / tim) ────────────────────────

export const sendFormNewResponseNotificationEmail = async ({
  email,
  ownerName,
  formTitle,
  respondentName,
  respondentEmail,
  responseId,
  submittedAt,
  totalResponses,
  detailUrl,
  responsesUrl,
}: {
  email: string;
  ownerName?: string | null;
  formTitle: string;
  respondentName?: string | null;
  respondentEmail?: string | null;
  responseId: string;
  submittedAt: Date;
  totalResponses: number;
  /** Link ke halaman Detail Respon di dashboard (tombol utama) */
  detailUrl?: string | null;
  /** Link ke daftar respons form ini (tautan kedua) */
  responsesUrl?: string | null;
}) => {
  const transporter = createTransporter();

  const safeTitle = escapeHtml(formTitle);
  const isAccount = !!respondentName?.trim();
  const respondentLabel = isAccount
    ? escapeHtml(respondentName!.trim())
    : "Responder anonim";
  const respondentEmailLabel = respondentEmail
    ? escapeHtml(respondentEmail)
    : "Email tidak dikumpulkan";
  const initial = escapeHtml(
    (respondentName?.trim() || respondentEmail || "A").charAt(0).toUpperCase(),
  );
  const greeting = ownerName?.trim()
    ? `Halo <strong>${escapeHtml(ownerName.trim())}</strong>,`
    : "Halo,";

  const buttons = detailUrl
    ? `
                <tr>
                  <td style="padding:0 30px 8px 30px;font-family:${FONT};">
                    <a href="${escapeHtml(detailUrl)}"
                      style="display:inline-block;padding:13px 28px;border-radius:12px;background-color:#10b981;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">
                      Lihat Detail Respons &rarr;
                    </a>
                  </td>
                </tr>
                ${
                  responsesUrl
                    ? `<tr>
                  <td style="padding:8px 30px 26px 30px;font-family:${FONT};font-size:13px;color:#6b7280;">
                    atau <a href="${escapeHtml(responsesUrl)}" style="color:#059669;font-weight:600;text-decoration:underline;">lihat semua respons</a> untuk form ini
                  </td>
                </tr>`
                    : `<tr><td style="height:18px;line-height:18px;font-size:0;">&nbsp;</td></tr>`
                }`
    : `
                <tr>
                  <td style="padding:0 30px 26px 30px;font-family:${FONT};font-size:13px;line-height:1.7;color:#4b5563;">
                    Buka tab <strong>Respon</strong> di dashboard TemuDataku untuk melihat jawaban lengkapnya.
                  </td>
                </tr>`;

  const mailOptions = {
    from: `"TemuDataku" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Respons baru #${totalResponses.toLocaleString("id-ID")} masuk: ${formTitle}`,
    html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light only" />
  <title>Respons baru</title>
</head>
<body style="margin:0;padding:0;background-color:#f0fdf4;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${respondentLabel} baru saja mengisi ${safeTitle}. Total ${totalResponses} respons.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;">
    <tr>
      <td align="center" style="padding:28px 12px 36px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(6,95,70,0.14);">

          <!-- HEADER GELAP -->
          <tr>
            <td style="background-color:#064e3b;background-image:linear-gradient(135deg,#064e3b 0%,#065f46 100%);padding:26px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="54" valign="middle">
                    <div style="width:46px;height:46px;line-height:46px;text-align:center;border-radius:14px;background-color:#10b981;font-size:22px;">&#128229;</div>
                  </td>
                  <td valign="middle" style="padding-left:14px;font-family:${FONT};">
                    <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:#6ee7b7;">RESPONS BARU</div>
                    <div style="margin-top:3px;font-size:19px;font-weight:700;line-height:1.3;color:#ffffff;">${safeTitle}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SAPAAN -->
          <tr>
            <td style="padding:24px 30px 18px 30px;font-family:${FONT};font-size:14px;line-height:1.7;color:#374151;">
              ${greeting} seseorang baru saja mengisi form ini.
            </td>
          </tr>

          <!-- STATISTIK -->
          <tr>
            <td style="padding:0 30px 16px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" valign="top" style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:14px;padding:16px 18px;font-family:${FONT};">
                    <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#059669;">TOTAL RESPONS</div>
                    <div style="margin-top:4px;font-size:34px;font-weight:800;line-height:1.1;color:#047857;">${totalResponses.toLocaleString("id-ID")}</div>
                  </td>
                  <td width="4%" style="font-size:0;line-height:0;">&nbsp;</td>
                  <td width="48%" valign="top" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:16px 18px;font-family:${FONT};">
                    <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#6b7280;">MASUK PADA</div>
                    <div style="margin-top:6px;font-size:14px;font-weight:700;line-height:1.3;color:#111827;">${formatDateOnly(submittedAt)}</div>
                    <div style="margin-top:2px;font-size:13px;color:#6b7280;">${formatTimeOnly(submittedAt)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- RESPONDER -->
          <tr>
            <td style="padding:0 30px 22px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:14px;">
                <tr>
                  <td width="62" valign="middle" style="padding:16px 0 16px 16px;">
                    <div style="width:42px;height:42px;line-height:42px;text-align:center;border-radius:50%;background-color:#10b981;font-family:${FONT};font-size:17px;font-weight:700;color:#ffffff;">${initial}</div>
                  </td>
                  <td valign="middle" style="padding:16px 8px 16px 8px;font-family:${FONT};">
                    <div style="font-size:14px;font-weight:700;color:#111827;">${respondentLabel}</div>
                    <div style="margin-top:2px;font-size:12px;color:#6b7280;word-break:break-all;">${respondentEmailLabel}</div>
                  </td>
                  <td align="right" valign="middle" style="padding:16px 16px 16px 8px;font-family:${FONT};">
                    <span style="display:inline-block;white-space:nowrap;padding:4px 10px;border-radius:999px;background-color:${isAccount ? "#d1fae5" : "#f3f4f6"};color:${isAccount ? "#065f46" : "#6b7280"};font-size:11px;font-weight:700;">
                      ${isAccount ? "Akun TemuDataku" : "Anonim"}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TOMBOL -->
          ${buttons}

          <!-- ID RESPONS (rujukan admin) -->
          <tr>
            <td style="padding:0 30px 24px 30px;font-family:Consolas,Menlo,monospace;font-size:11px;color:#9ca3af;">
              ID respons: ${escapeHtml(responseId)}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#f0fdf4;border-top:1px solid #d1fae5;padding:16px 30px;font-family:${FONT};font-size:11px;line-height:1.7;color:#6b7280;text-align:center;">
              &copy; ${new Date().getFullYear()} TemuDataku &middot; Kamu menerima email ini karena notifikasi respons baru aktif pada form ini. Email dikirim otomatis, mohon tidak membalas.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
