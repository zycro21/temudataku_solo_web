"use client";

import { Award, Download, ExternalLink, Loader2, RotateCw } from "lucide-react";
import type {
  CertificateStatus,
  ElearningSubChapterCertificateApiItem,
} from "@/hooks/useElearningSubChapterCertificate";

interface Props {
  status: CertificateStatus;
  certificate: ElearningSubChapterCertificateApiItem | null;
  notEligibleReason?: string | null; // 🔥 BARU
  onRetry?: () => void;
}

/**
 * Konten "Sertifikat" — dirender di AREA KONTEN UTAMA (bukan sidebar),
 * persis seperti materi/quiz/assignment, begitu mentee klik tombol
 * "Sertifikat" di sidebar. Lihat SubchapterSidebar.tsx (tombol pemicu)
 * dan SubchapterDetail.tsx (pemetaan contentMode "certificate" ke
 * komponen ini).
 *
 * Yang ditampilkan BUKAN cuma link/ikon — ini nampilin dokumen
 * sertifikat asli (PDF 2 halaman: Certificate of Completion + Kompetensi
 * yang Dilatih) langsung di halaman lewat embed preview Google Drive,
 * jadi mentee bisa lihat "gambar" sertifikatnya beneran tanpa harus
 * unduh dulu.
 */
export default function SubchapterCertificateContent({
  status,
  certificate,
  notEligibleReason,
  onRetry,
}: Props) {
  if (status === "checking" || status === "generating") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {status === "generating"
              ? "Membuat sertifikat kamu..."
              : "Memeriksa sertifikat kamu..."}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Selamat, kamu sudah menyelesaikan kelas ini 🎉 Mohon tunggu
            sebentar.
          </p>
        </div>
      </div>
    );
  }

  // 🔥 BARU: belum eligible — beda tone dari "error". Ini kondisi
  // normal, bukan kegagalan sistem.
  if (status === "not-eligible") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
          <Award className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Belum Bisa Mengambil Sertifikat
          </p>
          <p className="mt-1 max-w-sm text-xs text-gray-500">
            {notEligibleReason ??
              "Selesaikan quiz/proyek sesuai syarat kelulusan dulu ya, baru sertifikatnya bisa diterbitkan."}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            <RotateCw size={14} />
            Cek Lagi
          </button>
        )}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
          <Award className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Gagal memuat sertifikat
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Terjadi kendala saat mengambil/membuat sertifikat kamu.
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            <RotateCw size={14} />
            Coba Lagi
          </button>
        )}
      </div>
    );
  }

  if (status === "ready" && certificate) {
    const previewUrl = toDrivePreviewUrl(certificate.certificateUrl);

    return (
      <div className="mx-auto max-w-4xl">
        {/* Header ringkas */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <Award className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Selamat! Kamu Berhasil Menyelesaikan Kelas Ini 🎉
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {certificate.subChapter.title} &middot;{" "}
            {certificate.subChapter.course.title}
          </p>
        </div>

        {/* Info bar */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-600">
            <span>
              <span className="font-semibold text-gray-800">
                No. Sertifikat:
              </span>{" "}
              {certificate.displayNumber}
            </span>
            <span>
              <span className="font-semibold text-gray-800">Terbit:</span>{" "}
              {formatDateID(certificate.issuedAt)}
            </span>
          </div>

          <a
            href={certificate.certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            <Download size={14} />
            Unduh Sertifikat
          </a>
        </div>

        {/* Dokumen sertifikat (page 1 & 2) */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
          <iframe
            src={previewUrl}
            title="Pratinjau Sertifikat"
            className="h-[620px] w-full sm:h-[720px]"
            allow="autoplay"
          />
        </div>

        <p className="mt-3 text-center text-[11px] text-gray-400">
          Dokumen ini terdiri dari 2 halaman (Sertifikat &amp; Kompetensi yang
          Dilatih) — gulir/gunakan navigasi di dalam pratinjau untuk melihat
          halaman berikutnya. Kalau pratinjau tidak muncul,{" "}
          <a
            href={certificate.certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:underline"
          >
            buka di tab baru
            <ExternalLink size={11} />
          </a>
          .
        </p>
      </div>
    );
  }

  return null;
}

// Google Drive `webViewLink` formatnya:
// https://drive.google.com/file/d/FILE_ID/view?usp=drivesdk
// Buat di-embed di iframe (nampilin isi dokumennya langsung, bukan cuma
// tombol "buka di Drive"), perlu diubah ke bentuk `/preview`:
// https://drive.google.com/file/d/FILE_ID/preview
function toDrivePreviewUrl(viewUrl: string): string {
  const match = viewUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) return viewUrl;
  return `https://drive.google.com/file/d/${match[1]}/preview`;
}

function formatDateID(dateStr: string | null) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}
