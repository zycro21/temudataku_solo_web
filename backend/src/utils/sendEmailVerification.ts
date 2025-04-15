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
    from: `"Mentoring App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your account",
    html: `
      <h2>Welcome to Mentoring Platform</h2>
      <p>Please verify your account by clicking the link below:</p>
      <a href="${verifyUrl}">Verify Account</a>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // atau SMTP lainnya
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Mentoring App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
