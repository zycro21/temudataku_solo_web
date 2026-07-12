import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface CommissionWithdrawalRequestEmailPayload {
  affiliatorName: string;
  affiliatorEmail: string;
  referralCode: string;
  amount: number;
  requestId: string;
  requestDate: Date;
  withdrawalMethod: {
    type: "bank" | "eWallet";
    providerName: string;
    accountNumber: string;
    accountName: string;
  };
  remainingBalance: number; // ⭐ BARU — sisa saldo affiliator setelah request ini
}

const formatRupiah = (num: number) => "Rp" + num.toLocaleString("id-ID");

export const sendCommissionWithdrawalRequestEmail = async ({
  affiliatorName,
  affiliatorEmail,
  referralCode,
  amount,
  requestId,
  requestDate,
  withdrawalMethod,
  remainingBalance,
}: CommissionWithdrawalRequestEmailPayload) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const methodLabel =
    withdrawalMethod.type === "bank" ? "Transfer Bank" : "E-Wallet";

  const accountLabel =
    withdrawalMethod.type === "bank" ? "Nomor Rekening" : "Nomor E-Wallet";

  const formattedDate = requestDate.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const mailOptions = {
    from: `"TemuDataku" <${process.env.EMAIL_USER}>`,
    to: "temudataku@gmail.com",
    subject: `Permintaan Penarikan Komisi Affiliator - ${affiliatorName}`,
    html: `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Permintaan Penarikan Komisi</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #eef2f5;
        margin: 0;
        padding: 0;
      }
      .wrapper {
        padding: 32px 16px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 16px;
        box-shadow: 0 4px 24px rgba(16, 185, 129, 0.08), 0 1px 3px rgba(0,0,0,0.04);
        overflow: hidden;
      }

      /* ── Header ───────────────────────────────── */
      .header {
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        text-align: center;
        padding: 32px 24px 28px;
      }
      .header .badge {
        display: inline-block;
        background-color: rgba(255,255,255,0.18);
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        padding: 5px 12px;
        border-radius: 999px;
        margin-bottom: 12px;
      }
      .header h2 {
        color: #ffffff;
        margin: 0;
        font-size: 21px;
        font-weight: 700;
      }
      .header p {
        color: #d1fae5;
        margin: 6px 0 0;
        font-size: 13px;
      }

      /* ── Body ─────────────────────────────────── */
      .body-content {
        padding: 28px 28px 8px;
        color: #374151;
        line-height: 1.6;
        font-size: 14.5px;
      }
      .body-content p {
        margin: 0 0 8px;
      }

      /* ── Amount highlight ─────────────────────── */
      .amount-box {
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        border: 1px solid #6ee7b7;
        border-radius: 14px;
        padding: 22px;
        text-align: center;
        margin: 20px 0 24px;
      }
      .amount-box .icon {
        font-size: 22px;
        margin-bottom: 4px;
      }
      .amount-box p {
        margin: 0;
        color: #047857;
        font-size: 11.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.6px;
      }
      .amount-box h1 {
        margin: 8px 0 0;
        color: #065f46;
        font-size: 32px;
        font-weight: 800;
      }

      /* ── Section label ────────────────────────── */
      .section-label {
        font-size: 11.5px;
        font-weight: 700;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        margin: 0 0 10px;
      }

      /* ── Info grid (detail permintaan) ───────── */
      .info-grid {
        display: table;
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 0;
        background-color: #f9fafb;
        border: 1px solid #eef0f2;
        border-radius: 12px;
        margin-bottom: 22px;
        overflow: hidden;
      }
      .info-row {
        display: table-row;
      }
      .info-row .info-cell {
        display: table-cell;
        padding: 12px 16px;
        font-size: 13.5px;
        border-bottom: 1px solid #eef0f2;
      }
      .info-row:last-child .info-cell {
        border-bottom: none;
      }
      .info-cell.label {
        color: #6b7280;
        width: 44%;
      }
      .info-cell.value {
        color: #111827;
        font-weight: 600;
        text-align: right;
      }

      /* ── Transfer card (paling penting/actionable) ── */
      .transfer-card {
        background-color: #ffffff;
        border: 2px solid #10B981;
        border-radius: 14px;
        padding: 4px;
        margin-bottom: 22px;
      }
      .transfer-card-inner {
        background-color: #f0fdf4;
        border-radius: 10px;
        padding: 16px 18px 6px;
      }
      .transfer-card .title-row {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 10px;
      }
      .transfer-card .title-row .dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: #10B981;
        display: inline-block;
      }
      .transfer-card p.title {
        margin: 0;
        color: #047857;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.6px;
      }
      .transfer-card .info-grid {
        background-color: transparent;
        border: none;
        margin-bottom: 0;
      }
      .transfer-card .info-cell {
        border-bottom: 1px solid #dcfce7;
      }

      /* ── Action note ──────────────────────────── */
      .action-note {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        background-color: #fffbeb;
        border: 1px solid #fde68a;
        border-radius: 12px;
        padding: 14px 16px;
        margin-bottom: 24px;
        font-size: 13px;
        color: #92400e;
        line-height: 1.55;
      }
      .action-note .emoji {
        font-size: 16px;
        line-height: 1;
      }

      /* ── Footer ───────────────────────────────── */
      .footer {
        text-align: center;
        color: #9ca3af;
        font-size: 11.5px;
        padding: 20px 24px;
        border-top: 1px solid #f0f0f0;
        background-color: #fafafa;
      }
      .footer .brand {
        color: #059669;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <span class="badge">Butuh Tindakan</span>
          <h2>💸 Permintaan Penarikan Komisi</h2>
          <p>Mohon diproses dalam 1–3 hari kerja</p>
        </div>

        <div class="body-content">
          <p>Halo Admin,</p>
          <p>Seorang affiliator baru saja mengajukan permintaan penarikan komisi. Berikut detailnya:</p>

          <div class="amount-box">
            <div class="icon">💰</div>
            <p>Jumlah Penarikan</p>
            <h1>${formatRupiah(amount)}</h1>
            <p style="margin-top: 10px; text-transform: none; letter-spacing: normal; font-size: 12.5px; color: #065f46; font-weight: 600;">
              Sisa saldo affiliator ${affiliatorName} setelah ini: ${formatRupiah(remainingBalance)}
            </p>
          </div>

          <p class="section-label">Detail Permintaan</p>
          <div class="info-grid">
            <div class="info-row">
              <div class="info-cell label">Nama Affiliator</div>
              <div class="info-cell value">${affiliatorName}</div>
            </div>
            <div class="info-row">
              <div class="info-cell label">Email Affiliator</div>
              <div class="info-cell value">${affiliatorEmail}</div>
            </div>
            <div class="info-row">
              <div class="info-cell label">Kode Referral</div>
              <div class="info-cell value">${referralCode}</div>
            </div>
            <div class="info-row">
              <div class="info-cell label">ID Permintaan</div>
              <div class="info-cell value">${requestId}</div>
            </div>
            <div class="info-row">
              <div class="info-cell label">Tanggal Pengajuan</div>
              <div class="info-cell value">${formattedDate}</div>
            </div>
          </div>

          <div class="transfer-card">
            <div class="transfer-card-inner">
              <div class="title-row">
                <span class="dot"></span>
                <p class="title">Transfer Ke</p>
              </div>
              <div class="info-grid">
                <div class="info-row">
                  <div class="info-cell label">Metode</div>
                  <div class="info-cell value">${methodLabel} — ${withdrawalMethod.providerName}</div>
                </div>
                <div class="info-row">
                  <div class="info-cell label">${accountLabel}</div>
                  <div class="info-cell value">${withdrawalMethod.accountNumber}</div>
                </div>
                <div class="info-row">
                  <div class="info-cell label">Atas Nama</div>
                  <div class="info-cell value">${withdrawalMethod.accountName}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="action-note">
            <span class="emoji">⚠️</span>
            <span>Mohon proses transfer sesuai data di atas, lalu perbarui status permintaan ini (ID: <strong>${requestId}</strong>) di dashboard admin setelah dana terkirim.</span>
          </div>
        </div>

        <div class="footer">
          © ${new Date().getFullYear()} <span class="brand">TemuDataku</span> · Email otomatis, mohon tidak dibalas.
        </div>
      </div>
    </div>
  </body>
  </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
