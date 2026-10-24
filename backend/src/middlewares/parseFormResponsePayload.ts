import type { Request, Response, NextFunction } from "express";
import fs from "fs";

/**
 * Endpoint submit / edit / draft response menerima multipart/form-data
 * (karena bisa ada file upload): semua jawaban dikirim sebagai JSON string
 * di field "payload", file dikirim di field "file:<itemId>".
 *
 * Middleware ini mem-parse `payload` lalu menimpa req.body dengan objeknya,
 * supaya bisa divalidasi zod seperti request biasa.
 * Kalau request ternyata JSON biasa (tanpa field payload, tanpa file), body
 * dipakai apa adanya.
 */
export const parseFormResponsePayload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const raw = (req.body as any)?.payload;

    if (typeof raw === "string") {
      req.body = JSON.parse(raw);
    } else if (!req.body) {
      req.body = {};
    }

    next();
  } catch {
    res.status(400).json({
      success: false,
      message: "Field payload harus berupa JSON yang valid",
    });
  }
};

/**
 * Pasang SETELAH multer dan SEBELUM parseFormResponsePayload / validate.
 *
 * Multer sudah menulis file ke disk sebelum validasi jalan. Kalau request
 * akhirnya gagal (payload invalid, validasi zod gagal, dst., status >= 400),
 * file yang sudah terlanjur tersimpan dihapus supaya nggak jadi file yatim.
 * Kalau sukses (status < 400), file dipakai service dan nggak disentuh.
 */
export const cleanupFormUploadsOnError = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.on("finish", () => {
    if (res.statusCode < 400) return;
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    for (const f of files) {
      try {
        if (f.path && fs.existsSync(f.path)) fs.unlinkSync(f.path);
      } catch {
        /* best-effort */
      }
    }
  });
  next();
};