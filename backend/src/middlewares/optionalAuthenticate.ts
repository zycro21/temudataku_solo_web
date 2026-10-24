import type { Request, Response, NextFunction } from "express";
// 🔥 Sesuaikan path import ini dengan struktur folder project kamu
import { authenticate } from "./authenticate.js";

/**
 * Autentikasi OPSIONAL buat endpoint responder publik.
 *
 * Token valid                       -> req.user terisi (sama persis seperti `authenticate`).
 * Tidak ada token / invalid / expired -> lanjut sebagai anonim (req.user kosong), BUKAN 401.
 *
 * Keputusan "login wajib atau tidak" diambil di service berdasarkan setting
 * form (responderAccess).
 *
 * Middleware ini membungkus `authenticate` yang sudah ada, jadi nggak perlu
 * tahu cara ambil token (cookie/bearer). Asumsi: kalau gagal, `authenticate`
 * membalas lewat res.status(...).json(...) atau memanggil next(err).
 * Kalau implementasi `authenticate` kamu beda, sesuaikan isi file ini.
 */
export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let settled = false;

  const continueAnonymous = () => {
    if (settled) return;
    settled = true;
    (req as any).user = undefined;
    next();
  };

  // "Response palsu": semua balasan error dari authenticate ditelan, lalu
  // request diteruskan sebagai anonim.
  const shim: any = {
    locals: res.locals,
    headersSent: false,
    status: () => shim,
    set: () => shim,
    setHeader: () => shim,
    cookie: () => shim,
    clearCookie: () => shim,
    json: () => {
      continueAnonymous();
      return shim;
    },
    send: () => {
      continueAnonymous();
      return shim;
    },
    end: () => {
      continueAnonymous();
      return shim;
    },
    sendStatus: () => {
      continueAnonymous();
      return shim;
    },
  };

  try {
    (authenticate as any)(req, shim, (err?: unknown) => {
      if (settled) return;
      if (err) return continueAnonymous();
      settled = true;
      next();
    });
  } catch {
    continueAnonymous();
  }
};