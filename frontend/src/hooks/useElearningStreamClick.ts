"use client";

import axios from "axios";

/**
 * Catat 1 klik "stream" untuk course tertentu, oleh user yang sedang login.
 * Backend yang menentukan cap (maksimal 10 klik dihitung per akun per
 * course) — di sini kita cuma nembak request-nya.
 *
 * Sengaja "fire and forget": dipanggil pas card course diklik, TANPA
 * nge-block navigasi (Link tetap jalan normal). Kalau gagal (mis. request
 * race dengan unmount, network error, atau user belum login) — diabaikan
 * saja, karena ini cuma metrik tampilan, bukan hal krusial buat alur user.
 */
export async function recordElearningStreamClick(
  courseId: string,
): Promise<void> {
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses/${courseId}/stream-click`,
      {},
      { withCredentials: true },
    );
  } catch {
    // Diamkan — lihat catatan di atas.
  }
}

/**
 * Angka "peserta" yang DITAMPILKAN ke user sengaja dinaikkan 50%-75% dari
 * angka stream count asli (`totalStreamCount` apa adanya dari backend) —
 * sama pola-nya dengan `getDisplayedRating` di useElearningCourses.ts.
 *
 * Persentase boost-nya di-seed dari courseId (bukan Math.random() polos),
 * supaya STABIL — tidak berubah-ubah tiap kali card di-render ulang atau
 * tiap kali user reload halaman, tapi tetap beda-beda antar course.
 *
 * Dipakai bareng oleh ElearningSelection.tsx & ElearningFul.tsx.
 */
/**
 * Angka "peserta" yang DITAMPILKAN ke user sengaja dinaikkan dari angka
 * stream count asli (`totalStreamCount` apa adanya dari backend) — kali ini
 * boost-nya ANGKA ASLI (additive), bukan persentase lagi.
 *
 * Bahkan actualCount = 0 tetap di-boost (tidak lagi return 0 langsung).
 *
 * Besaran boost tergantung tier actualCount:
 * - 0 - 50   -> boost +30 s/d +50
 * - 51 - 100 -> boost +20 s/d +30
 * - > 100    -> boost +0  s/d +20
 *
 * Boost-nya di-seed dari courseId (bukan Math.random() polos), supaya
 * STABIL — tidak berubah-ubah tiap kali card di-render ulang atau tiap
 * kali user reload halaman, tapi tetap beda-beda antar course.
 *
 * Dipakai bareng oleh ElearningSelection.tsx & ElearningFul.tsx.
 */
export function getDisplayedStreamCount(
  courseId: string,
  actualCount: number,
): number {
  const safeCount = Math.max(0, actualCount ?? 0);

  let hash = 0;
  for (let i = 0; i < courseId.length; i++) {
    hash = (hash << 5) - hash + courseId.charCodeAt(i);
    hash |= 0;
  }

  // seed 0 - 0.999... dari hash courseId
  const seedFraction = (Math.abs(hash) % 1000) / 1000;

  let minBoost: number;
  let maxBoost: number;

  if (safeCount <= 50) {
    minBoost = 30;
    maxBoost = 50;
  } else if (safeCount <= 100) {
    minBoost = 20;
    maxBoost = 30;
  } else {
    minBoost = 0;
    maxBoost = 20;
  }

  const boost = Math.round(minBoost + seedFraction * (maxBoost - minBoost));

  return safeCount + boost;
}
