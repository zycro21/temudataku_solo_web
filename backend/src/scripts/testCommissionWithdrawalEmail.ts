// scripts/testCommissionWithdrawalEmail.ts
//
// Cara pakai:
//   npx ts-node scripts/testCommissionWithdrawalEmail.ts
//
// Pastikan .env kamu (EMAIL_USER & EMAIL_PASS) sudah ke-load.
// Kalau project pakai dotenv manual (bukan otomatis), jalanin dengan:
//   npx ts-node -r dotenv/config scripts/testCommissionWithdrawalEmail.ts

import { sendCommissionWithdrawalRequestEmail } from "../utils/commissionWithdrawalRequestEmail.js";
// ⬆️ sesuaikan path import ini dengan lokasi asli file emailnya di project kamu

async function main() {
  console.log("Mengirim email test...");

  try {
    await sendCommissionWithdrawalRequestEmail({
      affiliatorName: "Budi Santoso",
      affiliatorEmail: "budi.santoso@example.com",
      referralCode: "BUDI2026",
      amount: 250000,
      requestId: "test-req-" + Date.now(),
      requestDate: new Date(),
      withdrawalMethod: {
        type: "bank",
        providerName: "BCA",
        accountNumber: "1234567890",
        accountName: "Budi Santoso",
      },
      remainingBalance: 175000,
    });

    console.log("✅ Email berhasil dikirim! Cek inbox temudataku@gmail.com");
  } catch (err) {
    console.error("❌ Gagal kirim email:", err);
  }
}

main();