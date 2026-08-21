"use client";

import { useCallback, useRef, useState } from "react";
import axios from "axios";

export interface ElearningSubChapterCertificateApiItem {
  certificateNumber: string;
  displayNumber: string;
  certificateUrl: string;
  issuedAt: string | null;
  status: string | null;
  subChapter: {
    title: string;
    course: { title: string };
  };
}

// 🔥 DIUBAH TOTAL: sertifikat SEKARANG dicetak manual oleh mentee (tombol
// di area konten), bukan auto-generate berdasarkan syarat skor quiz/
// assignment lagi. Syarat progress 100% TETAP berlaku (dicek backend),
// tapi begitu 100%, mentee yang menentukan KAPAN mau cetak — termasuk
// cetak ULANG kalau nilainya membaik setelah attempt baru (dibatasi
// cooldown 1x per 30 hari, lihat `nextPrintAvailableAt`).
//
// State machine baru:
// - "idle"          → progress belum 100%, sertifikat belum relevan sama
//                      sekali.
// - "checking"       → sedang mengecek apakah mentee SUDAH PERNAH cetak
//                      sertifikat untuk subchapter ini (GET saja, TIDAK
//                      generate apa pun).
// - "not-generated"  → progress 100%, tapi belum pernah dicetak. Area
//                      konten akan menampilkan tombol "Cetak Sertifikat".
// - "generating"     → proses cetak (pertama kali ATAU cetak ulang)
//                      sedang berjalan di backend.
// - "ready"          → sertifikat sudah ada & bisa dilihat/diunduh (juga
//                      dipakai untuk kondisi "sudah ada, ingin cetak
//                      ulang" — lihat `canPrintNow`/`nextPrintAvailableAt`
//                      untuk tahu apakah tombol cetak ulang aktif).
// - "error"          → gagal memeriksa/mencetak karena error beneran
//                      (bukan cooldown, bukan progress belum 100%).
export type CertificateStatus =
  | "idle"
  | "checking"
  | "not-generated"
  | "generating"
  | "ready"
  | "error";

interface UseElearningSubChapterCertificateResult {
  certificate: ElearningSubChapterCertificateApiItem | null;
  status: CertificateStatus;
  // Pesan terakhir dari backend — dipakai buat kondisi "error" (alasan
  // gagal) MAUPUN kondisi cooldown saat mentee mencoba cetak ulang lebih
  // cepat dari jadwalnya (status tetap "ready", pesan ini yang kasih tahu
  // alasannya + kapan boleh cetak ulang).
  errorMessage: string | null;
  // Kapan mentee boleh cetak ULANG — `null` kalau belum pernah cetak sama
  // sekali (cetak PERTAMA selalu boleh selama progress 100%, tidak kena
  // cooldown ini).
  nextPrintAvailableAt: string | null;
  // Ringkasan siap-pakai: true kalau tombol "Cetak Sertifikat" /
  // "Cetak Ulang" boleh AKTIF sekarang.
  canPrintNow: boolean;
  // Cuma MENGECEK (GET) — dipanggil begitu progress nyentuh 100%, BUKAN
  // men-generate apa pun. Aman dipanggil berkali-kali (di-guard, lihat
  // catatan di dalam).
  checkCertificate: (
    subChapterId: string,
    progressPercent: number,
  ) => Promise<void>;
  // Betul-betul MENCETAK (POST) — HANYA dipanggil lewat aksi eksplisit
  // mentee (klik tombol "Cetak Sertifikat" / "Cetak Ulang"), tidak pernah
  // dipanggil otomatis dari effect mana pun.
  printCertificate: (subChapterId: string) => Promise<void>;
}

// 🔥 BARU: cetak ulang dibatasi 1x per 30 hari, dihitung dari `issuedAt`
// sertifikat yang lagi aktif sekarang (SAMA persis sama yang dihitung di
// backend — lihat CERTIFICATE_PRINT_COOLDOWN_DAYS di
// elearningCertificate.service.ts. Kalau salah satu diubah, ubah juga
// yang satunya biar FE & BE selalu sepakat).
const PRINT_COOLDOWN_DAYS = 30;

export function useElearningSubChapterCertificate(): UseElearningSubChapterCertificateResult {
  const [certificate, setCertificate] =
    useState<ElearningSubChapterCertificateApiItem | null>(null);
  const [status, setStatus] = useState<CertificateStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inFlightRef = useRef(false);

  // 🔥 Pola sama seperti versi lama (statusRef) — MENJAGA identity
  // checkCertificate/printCertificate tetap STABIL walau status/certificate
  // berubah-ubah, supaya effect di SubchapterDetail.tsx yang bergantung ke
  // fungsi-fungsi ini TIDAK re-run berulang kali (lihat catatan panjang di
  // versi sebelumnya soal loop kelap-kelip sidebar — root cause-nya persis
  // ini kalau dilanggar).
  const statusRef = useRef<CertificateStatus>(status);
  statusRef.current = status;
  const certificateRef = useRef<ElearningSubChapterCertificateApiItem | null>(
    certificate,
  );
  certificateRef.current = certificate;

  const checkCertificate = useCallback(
    async (subChapterId: string, progressPercent: number) => {
      if (!subChapterId) return;
      if (progressPercent < 100) {
        setStatus("idle");
        return;
      }

      if (inFlightRef.current) return;
      // Begitu status SUDAH DIKETAHUI (ready / not-generated) atau lagi
      // diproses (checking / generating), tidak perlu cek ulang otomatis.
      // "error" & "idle" SENGAJA tidak masuk guard ini — biar bisa
      // di-retry (baik manual lewat tombol, maupun lewat pemanggilan
      // ulang effect di SubchapterDetail.tsx setelah progress berubah).
      if (
        statusRef.current === "ready" ||
        statusRef.current === "not-generated" ||
        statusRef.current === "checking" ||
        statusRef.current === "generating"
      )
        return;

      inFlightRef.current = true;
      setStatus("checking");
      setErrorMessage(null);

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCertificate/subchapters/${subChapterId}/certificate/me`,
          { withCredentials: true },
        );

        const existing: ElearningSubChapterCertificateApiItem | null =
          res.data?.data ?? null;

        if (existing) {
          setCertificate(existing);
          setStatus("ready");
        } else {
          setStatus("not-generated");
        }
      } catch (err) {
        console.error("Gagal memeriksa status sertifikat:", err);
        setStatus("error");
        setErrorMessage("Gagal memeriksa status sertifikat kamu.");
      } finally {
        inFlightRef.current = false;
      }
    },
    [],
  );

  const printCertificate = useCallback(async (subChapterId: string) => {
    if (!subChapterId) return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setStatus("generating");
    setErrorMessage(null);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCertificate/subchapters/${subChapterId}/certificate/auto`,
        {},
        { withCredentials: true },
      );

      setCertificate(res.data?.data ?? null);
      setStatus("ready");
    } catch (err: any) {
      const code = err?.response?.data?.code;
      const message: string =
        err?.response?.data?.message ??
        "Gagal mencetak sertifikat, silakan coba lagi.";

      if (code === "CERTIFICATE_COOLDOWN") {
        // Sertifikat yang lama TETAP berlaku & tidak hilang — balik ke
        // "ready" kalau kita sudah punya cache-nya. Kalau belum (edge
        // case: reprint dipanggil sebelum checkCertificate pernah
        // sukses), fallback ke "not-generated" supaya UI tidak nyangkut
        // di "generating" selamanya — SubchapterDetail.tsx akan
        // menampilkan pesan cooldown ini tanpa data sertifikat.
        setStatus(certificateRef.current ? "ready" : "not-generated");
        setErrorMessage(message);
      } else if (code === "CERTIFICATE_PROGRESS_INCOMPLETE") {
        setStatus("not-generated");
        setErrorMessage(message);
      } else {
        setStatus("error");
        setErrorMessage(message);
      }
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  const nextPrintAvailableAt = (() => {
    if (!certificate?.issuedAt) return null;
    const issued = new Date(certificate.issuedAt);
    const next = new Date(issued);
    next.setDate(next.getDate() + PRINT_COOLDOWN_DAYS);
    return next.toISOString();
  })();

  const canPrintNow =
    status === "not-generated" ||
    (status === "ready" &&
      (!nextPrintAvailableAt || new Date() >= new Date(nextPrintAvailableAt)));

  return {
    certificate,
    status,
    errorMessage,
    nextPrintAvailableAt,
    canPrintNow,
    checkCertificate,
    printCertificate,
  };
}
