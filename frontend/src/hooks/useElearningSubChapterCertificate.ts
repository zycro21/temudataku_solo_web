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
  | "idle"
  | "checking"
  | "generating"
  | "not-eligible" // 🔥 BARU: progress 100%, tapi syarat skor belum terpenuhi
  | "ready"
  | "error";

interface UseElearningSubChapterCertificateResult {
  certificate: ElearningSubChapterCertificateApiItem | null;
  status: CertificateStatus;
  // 🔥 BARU: alasan belum eligible, dari message backend — dipakai buat
  // ditampilkan ke mentee di SubchapterCertificateContent.
  notEligibleReason: string | null;
  ensureCertificate: (
    subChapterId: string,
    progressPercent: number,
  ) => Promise<void>;
}

export function useElearningSubChapterCertificate(): UseElearningSubChapterCertificateResult {
  const [certificate, setCertificate] =
    useState<ElearningSubChapterCertificateApiItem | null>(null);
  const [status, setStatus] = useState<CertificateStatus>("idle");
  const [notEligibleReason, setNotEligibleReason] = useState<string | null>(
    null,
  );

  const inFlightRef = useRef(false);

  // 🔥 FIX (bug kelap-kelip di sidebar): sebelumnya `ensureCertificate`
  // di-useCallback dengan dependency `[status]` — artinya function
  // IDENTITY-nya berubah setiap kali status berubah. Karena SubchapterDetail
  // punya effect `[displayProgressPercent, subChapterId, ensureCertificate]`,
  // perubahan identity ini bikin effect itu jalan LAGI. Dan karena status
  // "not-eligible" SENGAJA tidak masuk guard (biar bisa di-retry manual),
  // effect yang re-run itu langsung manggil ensureCertificate lagi dari nol
  // → checking → generating → not-eligible → identity berubah lagi → effect
  // jalan lagi → LOOP TANPA HENTI (dan backend ke-spam POST /certificate/auto
  // berkali-kali).
  //
  // Fix: baca status TERKINI lewat ref (bukan lewat closure/dependency),
  // supaya identity ensureCertificate tetap STABIL (tidak pernah dibuat
  // ulang) walau status-nya berubah-ubah. Effect di komponen pemanggil jadi
  // cuma jalan saat subChapterId/progressPercent BENAR-BENAR berubah, bukan
  // tiap render.
  const statusRef = useRef<CertificateStatus>(status);
  statusRef.current = status;

  const ensureCertificate = useCallback(
    async (subChapterId: string, progressPercent: number) => {
      if (!subChapterId) return;
      if (progressPercent < 100) {
        setStatus("idle");
        return;
      }

      if (inFlightRef.current) return;
      // "not-eligible" & "error" SENGAJA tidak masuk guard ini — biar bisa
      // di-retry lewat pemanggilan MANUAL (klik tombol "Cek Lagi", atau
      // dipanggil ulang eksplisit setelah quiz/project di-attempt ulang di
      // SubchapterDetail.tsx) — BUKAN lewat re-run otomatis effect.
      if (
        statusRef.current === "ready" ||
        statusRef.current === "generating" ||
        statusRef.current === "checking"
      )
        return;

      inFlightRef.current = true;
      setStatus("checking");
      setNotEligibleReason(null);

      try {
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

        setStatus("generating");

        try {
          const generateRes = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCertificate/subchapters/${subChapterId}/certificate/auto`,
            {},
            { withCredentials: true },
          );

          setCertificate(generateRes.data?.data ?? null);
          setStatus("ready");
        } catch (genErr: any) {
          // 🔥 BARU: 422 + code CERTIFICATE_NOT_ELIGIBLE → bukan error,
          // itu memang belum saatnya. Jangan masuk alur retry-GET/error
          // di bawah, cukup simpan alasannya.
          if (
            genErr?.response?.status === 422 &&
            genErr?.response?.data?.code === "CERTIFICATE_NOT_ELIGIBLE"
          ) {
            setNotEligibleReason(genErr.response.data.message ?? null);
            setStatus("not-eligible");
            return;
          }

          // Race condition dua tab: coba GET ulang sekali dulu sebelum
          // benar-benar dianggap error.
          try {
            const retryRes = await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCertificate/subchapters/${subChapterId}/certificate/me`,
              { withCredentials: true },
            );
            const existingRetry: ElearningSubChapterCertificateApiItem | null =
              retryRes.data?.data ?? null;

            if (existingRetry) {
              setCertificate(existingRetry);
              setStatus("ready");
              return;
            }
          } catch {
            // diamkan, jatuh ke status error di bawah
          }

          console.error("Gagal membuat sertifikat:", genErr);
          setStatus("error");
        }
      } catch (err) {
        console.error("Gagal memuat sertifikat:", err);
        setStatus("error");
      } finally {
        inFlightRef.current = false;
      }
    },
    // 🔥 Dependency SENGAJA dikosongkan (bukan [status]) — lihat penjelasan
    // statusRef di atas. Ini yang bikin identity function stabil.
    [],
  );

  return { certificate, status, notEligibleReason, ensureCertificate };
}
