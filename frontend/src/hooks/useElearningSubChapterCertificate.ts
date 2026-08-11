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

export type CertificateStatus =
  | "idle" // belum dicek sama sekali / progress belum 100%
  | "checking" // lagi GET .../certificate/me
  | "generating" // lagi POST .../certificate/auto
  | "ready" // sudah ada (baru dibuat / sudah ada sebelumnya)
  | "error";

interface UseElearningSubChapterCertificateResult {
  certificate: ElearningSubChapterCertificateApiItem | null;
  status: CertificateStatus;
  /**
   * Panggil ini tiap kali progress SubChapter berubah (sama seperti pola
   * `checkMyReview` di SubchapterDetail.tsx). Aman dipanggil berkali-kali
   * — kalau sudah "ready"/"checking"/"generating", panggilan berikutnya
   * di-skip (tidak nembak API lagi).
   *
   * Alurnya:
   * 1. GET /subchapters/{id}/certificate/me → cek apakah mentee sudah
   *    punya sertifikat untuk course ini.
   * 2. Kalau SUDAH ada → langsung tampilkan (status "ready"), SELESAI.
   * 3. Kalau BELUM ada DAN progressPercent < 100 → status balik ke
   *    "idle" (belum eligible, jangan generate).
   * 4. Kalau BELUM ada DAN progressPercent >= 100 → POST
   *    /subchapters/{id}/certificate/auto buat generate-nya sekarang.
   */
  ensureCertificate: (
    subChapterId: string,
    progressPercent: number,
  ) => Promise<void>;
}

export function useElearningSubChapterCertificate(): UseElearningSubChapterCertificateResult {
  const [certificate, setCertificate] =
    useState<ElearningSubChapterCertificateApiItem | null>(null);
  const [status, setStatus] = useState<CertificateStatus>("idle");

  // 🔥 Sama seperti `reviewCheckedRef` di SubchapterDetail.tsx — mencegah
  // `ensureCertificate` nembak API berkali-kali tiap kali komponen
  // re-render (mis. tiap kali progressPercent di-set ulang ke angka yang
  // sama), cukup jalan sekali per mount sampai statusnya pasti
  // (ready/error).
  const inFlightRef = useRef(false);

  const ensureCertificate = useCallback(
    async (subChapterId: string, progressPercent: number) => {
      if (!subChapterId) return;
      // 🔥 Kalau progress belum 100%, jangan lakukan apa-apa (status idle)
      if (progressPercent < 100) {
        setStatus("idle");
        return;
      }

      if (inFlightRef.current) return;
      if (status === "ready" || status === "generating") return;

      inFlightRef.current = true;
      setStatus("checking");

      try {
        // 1) Cek dulu — jangan asumsikan langsung generate, siapa tahu
        // sertifikatnya sudah pernah dibuat di kunjungan sebelumnya.
        const checkRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCertificate/subchapters/${subChapterId}/certificate/me`,
          { withCredentials: true },
        );

        const existing: ElearningSubChapterCertificateApiItem | null =
          checkRes.data?.data ?? null;

        if (existing) {
          setCertificate(existing);
          setStatus("ready");
          return;
        }

        // 2) Belum ada. Kalau progress belum 100%, belum saatnya generate
        // — balik ke idle dan diamkan (akan dicoba lagi lain kali
        // `ensureCertificate` dipanggil dengan progressPercent baru).
        if (progressPercent < 100) {
          setStatus("idle");
          return;
        }

        // 3) Progress sudah 100% dan belum ada sertifikat → generate
        // sekarang (endpoint ini sendiri sudah menjaga idempoten: kalau
        // ternyata di sisi server SUDAH ada, dia akan menolak dengan
        // error "Certificate already exists...", ditangani di catch di
        // bawah dengan mencoba GET ulang).
        setStatus("generating");

        const generateRes = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCertificate/subchapters/${subChapterId}/certificate/auto`,
          {},
          { withCredentials: true },
        );

        setCertificate(generateRes.data?.data ?? null);
        setStatus("ready");
      } catch (err) {
        // 🔥 Race condition: kalau dua tab/request nyaris bersamaan
        // sama-sama lolos pengecekan "belum ada" lalu sama-sama generate,
        // salah satu bakal gagal karena constraint unik di DB
        // (`userId_subChapterId`). Daripada langsung nampilin error ke
        // mentee, coba GET ulang sekali — kemungkinan besar sertifikatnya
        // justru sudah berhasil dibuat oleh request yang satunya.
        try {
          const retryRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCertificate/subchapters/${subChapterId}/certificate/me`,
            { withCredentials: true },
          );
          const existing: ElearningSubChapterCertificateApiItem | null =
            retryRes.data?.data ?? null;

          if (existing) {
            setCertificate(existing);
            setStatus("ready");
            return;
          }
        } catch {
          // diamkan, jatuh ke status error di bawah
        }

        console.error("Gagal memuat/membuat sertifikat:", err);
        setStatus("error");
      } finally {
        inFlightRef.current = false;
      }
    },
    [status],
  );

  return { certificate, status, ensureCertificate };
}
