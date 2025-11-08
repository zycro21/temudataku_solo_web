import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmailVerification = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // atau SMTP lainnya
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify?token=${token}`;

  const mailOptions = {
    from: `"TemuDataku" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verifikasi Akun Anda - TemuDataku",
    html: `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verifikasi Akun TemuDataku</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f8fafc;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        padding: 30px;
      }
      .header {
        text-align: center;
        border-bottom: 2px solid #10B981;
        padding-bottom: 12px;
        margin-bottom: 25px;
      }
      .header h2 {
        color: #10B981;
        margin: 0;
        font-size: 22px;
      }
      .content {
        color: #333333;
        line-height: 1.6;
        font-size: 15px;
      }
      .verify-button {
        display: inline-block;
        margin-top: 25px;
        padding: 12px 30px;
        background-color: #10B981;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        letter-spacing: 0.3px;
        transition: background-color 0.2s ease-in-out;
      }
      .verify-button:hover {
        background-color: #0ea271;
      }
      .footer {
        text-align: center;
        color: #888;
        font-size: 13px;
        margin-top: 35px;
        border-top: 1px solid #eee;
        padding-top: 15px;
      }
      a {
        color: #10B981;
        word-break: break-all;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Selamat Datang di TemuDataku 🌿</h2>
      </div>
      <div class="content">
        <p>Halo,</p>
        <p>Terima kasih telah mendaftar di <strong>TemuDataku</strong>! Untuk melanjutkan, silakan verifikasi akun Anda dengan menekan tombol di bawah ini:</p>
        <p style="text-align: center;">
          <a href="${verifyUrl}" class="verify-button">Verifikasi Akun</a>
        </p>
        <p>Jika tombol di atas tidak berfungsi, Anda juga dapat menyalin dan membuka tautan berikut di browser Anda:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>Tautan ini akan kedaluwarsa dalam waktu <strong>1 jam</strong>.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} TemuDataku. Semua hak cipta dilindungi.</p>
      </div>
    </div>
  </body>
  </html>
  `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendResetPasswordEmail = async (
  email: string,
  token: string,
  roles: string[]
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // tentukan path reset tergantung role
  let path = "/reset-password";
  if (roles.includes("affiliator")) {
    path = "/reset-password/affiliator";
  }

  const resetUrl = `${process.env.CLIENT_URL}${path}?token=${token}`;

  const mailOptions = {
    from: `"TemuDataku" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Password Anda - TemuDataku",
    html: `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Password - TemuDataku</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f8fafc;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        padding: 30px;
      }
      .header {
        text-align: center;
        border-bottom: 2px solid #10B981;
        padding-bottom: 12px;
        margin-bottom: 25px;
      }
      .header h2 {
        color: #10B981;
        margin: 0;
        font-size: 22px;
      }
      .content {
        color: #333333;
        line-height: 1.6;
        font-size: 15px;
      }
      .reset-button {
        display: inline-block;
        margin-top: 25px;
        padding: 12px 30px;
        background-color: #10B981;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        letter-spacing: 0.3px;
        transition: background-color 0.2s ease-in-out;
      }
      .reset-button:hover {
        background-color: #0ea271;
      }
      .footer {
        text-align: center;
        color: #888;
        font-size: 13px;
        margin-top: 35px;
        border-top: 1px solid #eee;
        padding-top: 15px;
      }
      a {
        color: #10B981;
        word-break: break-all;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Permintaan Reset Password 🔒</h2>
      </div>
      <div class="content">
        <p>Halo,</p>
        <p>Kami menerima permintaan untuk mengatur ulang password akun Anda di <strong>TemuDataku</strong>.</p>
        <p>Untuk melanjutkan, silakan klik tombol di bawah ini:</p>
        <p style="text-align: center;">
          <a href="${resetUrl}" class="reset-button">Reset Password</a>
        </p>
        <p>Jika tombol di atas tidak berfungsi, Anda juga dapat menyalin dan membuka tautan berikut di browser Anda:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Tautan ini akan kedaluwarsa dalam waktu <strong>1 jam</strong>.</p>
        <p>Jika Anda tidak meminta pengaturan ulang password, abaikan email ini dengan aman.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} TemuDataku. Semua hak cipta dilindungi.</p>
      </div>
    </div>
  </body>
  </html>
  `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendNotificationEmail = async ({
  to,
  subject,
  message,
  actionUrl,
}: {
  to: string;
  subject: string;
  message: string;
  actionUrl?: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // atau SMTP lainnya
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Mentoring App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <h2>${subject}</h2>
      <p>${message}</p>
      ${
        actionUrl
          ? `<p><a href="${actionUrl}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Lihat Selengkapnya</a></p>`
          : ""
      }
      <p>Terima kasih telah menggunakan platform kami.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
