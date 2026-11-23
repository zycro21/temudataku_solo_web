import rateLimit from "express-rate-limit";

// Endpoint ekspor data: publik, tapi berat (membaca ratusan tabel sekaligus).
// 100 request / 15 menit per IP. Ubah angka di bawah kalau perlu.
export const dataExportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7", // header RateLimit-* untuk client
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak permintaan, coba lagi beberapa menit lagi",
  },
});