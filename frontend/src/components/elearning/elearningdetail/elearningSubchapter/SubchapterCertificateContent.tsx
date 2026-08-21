"use client";

import {
  Award,
  Download,
  ExternalLink,
  Loader2,
  RotateCw,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type {
  CertificateStatus,
  ElearningSubChapterCertificateApiItem,
} from "@/hooks/useElearningSubChapterCertificate";

interface Props {
  status: CertificateStatus;
  certificate: ElearningSubChapterCertificateApiItem | null;
  // 🔥 BARU: pesan error ATAU pesan cooldown terakhir dari backend.
  errorMessage?: string | null;
  // 🔥 BARU: kapan boleh cetak ULANG — `null` kalau belum pernah cetak.
  nextPrintAvailableAt?: string | null;
  // 🔥 BARU: ringkasan siap-pakai, tombol cetak/cetak-ulang aktif atau
  // tidak.
  canPrintNow?: boolean;
  // 🔥 DIUBAH: dulu `onRetry` cuma dipakai buat retry pengecekan status
  // (error state). Sekarang ada dua aksi terpisah:
  // - `onCheck`  → cek ulang status (dipakai di state "error").
  // - `onPrint`  → BENAR-BENAR mencetak (state "not-generated" pertama
  //                kali, atau "ready" untuk cetak ulang).
  onCheck?: () => void;
  onPrint?: () => void;
}

/**
 * Konten "Sertifikat" — dirender di AREA KONTEN UTAMA (bukan sidebar),
 * persis seperti materi/quiz/assignment, begitu mentee klik tombol
 * "Sertifikat" di sidebar.
 *
 * 🔥 DIUBAH TOTAL: sertifikat sekarang DICETAK MANUAL oleh mentee lewat
 * tombol di sini — tidak lagi auto-generate berdasarkan syarat skor
 * quiz/assignment. Progress 100% tetap jadi syarat (dicek sebelum
 * komponen ini bahkan bisa diakses — lihat SubchapterDetail.tsx), tapi
 * KAPAN mau cetak sepenuhnya keputusan mentee, termasuk cetak ULANG
 * (dibatasi cooldown, lihat `nextPrintAvailableAt`) kalau nilainya
 * membaik setelah mengerjakan ulang quiz/assignment.
 */
export default function SubchapterCertificateContent({
  status,
  certificate,
  errorMessage,
  nextPrintAvailableAt,
  canPrintNow = false,
  onCheck,
  onPrint,
}: Props) {
  const formatDateID = (dateStr: string | null | undefined) => {
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
  };

  // 🔥 BARU: khusus buat `nextPrintAvailableAt`. Nilainya adalah
  // `issuedAt + 30 hari` — JAM-nya ikut persis dari `issuedAt`, bukan
  // 00:00. Kalau cuma ditampilkan tanggalnya (pakai `formatDateID`),
  // mentee bisa salah kira sudah boleh cetak ulang sejak pagi di tanggal
  // itu, padahal baru aktif jam yang sama dengan waktu cetak terakhir.
  // Makanya di sini jamnya WAJIB ikut ditampilkan.
  const formatDateTimeID = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      const datePart = d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const timePart = d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      });
      return `${datePart}, ${timePart} WIB`;
    } catch {
      return "-";
    }
  };

  if (status === "checking") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Memeriksa sertifikat kamu...
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Selamat, kamu sudah menyelesaikan kelas ini 🎉 Mohon tunggu
            sebentar.
          </p>
        </div>
      </div>
    );
  }

  if (status === "generating") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Sedang membuat sertifikat kamu...
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Proses ini biasanya cuma butuh beberapa detik.
          </p>
        </div>
      </div>
    );
  }

  // 🔥 BARU: progress 100% tapi mentee belum pernah cetak — tampilkan
  // ajakan cetak, bukan auto-generate.
  if (status === "not-generated") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Sparkles className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">
            Selamat! Kamu Sudah Menyelesaikan Kelas Ini 🎉
          </p>
          <p className="mt-1.5 max-w-sm text-sm text-gray-500">
            Sertifikat kelulusanmu sudah siap dicetak. Nilai yang tercantum akan
            diambil dari Percobaan/Attempt Quiz/Projek TERAKHIR kamu.
          </p>
        </div>

        {errorMessage && (
          <p className="max-w-sm text-xs text-amber-600">{errorMessage}</p>
        )}

        {/* 🔥 BARU: peringatan tegas SEBELUM cetak pertama kali — mentee
            perlu tahu dari awal bahwa setelah ini ditekan, sertifikat baru
            bisa dicetak ULANG 1 bulan kemudian (mis. kalau nanti nilai
            quiz/tugasnya membaik). Bukan cuma muncul belakangan di state
            "ready" — supaya keputusannya dipikirkan dulu SEBELUM klik,
            bukan sesudahnya. */}
        <div className="flex max-w-sm items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
          <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber-500" />
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Perhatikan dulu:</span> sertifikat
            hanya bisa dicetak{" "}
            <span className="font-semibold">1 kali setiap bulan</span>. Kalau
            kamu berencana mengerjakan ulang Quiz/Projek untuk nilai yang lebih
            bagus, sebaiknya selesaikan itu dulu SEBELUM menekan tombol di bawah
            ini - supaya sertifikat yang tercetak langsung memuat nilai
            terbaikmu.
          </p>
        </div>

        <button
          onClick={onPrint}
          className="mt-1 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
        >
          <Award size={16} />
          Cetak Sertifikat
        </button>
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
          <p className="mt-1 max-w-sm text-xs text-gray-500">
            {errorMessage ??
              "Terjadi kendala saat mengambil/membuat sertifikat kamu."}
          </p>
        </div>
        {onCheck && (
          <button
            onClick={onCheck}
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

        {/* 🔥 BARU: cetak ULANG — buat mentee yang nilainya membaik
            setelah mengerjakan ulang quiz/tugas, dibatasi cooldown 1x per
            30 hari (lihat useElearningSubChapterCertificate.ts). */}
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-5 text-center">
          <p className="text-xs text-gray-600">
            Nilai quiz/projekmu berubah dan ingin sertifikat ter-update?
          </p>

          {canPrintNow ? (
            <>
              <button
                onClick={onPrint}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              >
                <RotateCw size={13} />
                Cetak Ulang Sertifikat
              </button>
              {/* 🔥 BARU: pengingat yang sama seperti di state cetak
                  pertama kali — jatah cetak ulang cuma 1x per bulan, jadi
                  pastikan nilai sudah final sebelum menekan tombol ini. */}
              <p className="mt-1 flex max-w-xs items-start gap-1.5 text-left text-[11px] text-amber-700">
                <TriangleAlert size={13} className="mt-0.5 shrink-0" />
                <span>
                  Pikirkan baik-baik — setelah ini, jatah cetak ulang berikutnya
                  baru tersedia 1 bulan lagi.
                </span>
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-400">
              Kamu bisa cetak ulang sertifikat mulai{" "}
              <span className="font-semibold text-gray-500">
                {formatDateTimeID(nextPrintAvailableAt)}
              </span>{" "}
              (maksimal 1x cetak ulang per bulan dari sertifikat dicetak).
            </p>
          )}

          {errorMessage && (
            <p className="mt-1 text-xs text-amber-600">{errorMessage}</p>
          )}
        </div>
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
