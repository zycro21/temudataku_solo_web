"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, Download } from "lucide-react";

interface Sertifikat {
  id: string;
  title: string;
  description: string;
  program: string;
  category: string;
  dateRange: string;
  image: string;
  downloadLink?: string;
  hasCertificate: boolean;
}

interface SertifikatSectionProps {
  title: string;
  sertifikats: Sertifikat[];
}

export default function SertifikatSection({
  title,
  sertifikats,
}: SertifikatSectionProps) {
  function parseDescription(text: string) {
    const lines = text.split("/n");

    return lines.map((line, lineIndex) => {
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|_.*?_)/g);

      return (
        <span key={lineIndex}>
          {parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }

            if (part.startsWith("_") && part.endsWith("_")) {
              return (
                <span key={i} className="underline">
                  {part.slice(1, -1)}
                </span>
              );
            }

            if (part.startsWith("*") && part.endsWith("*")) {
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    transform: "inline-block skewX(-8deg)",
                  }}
                >
                  {part.slice(1, -1)}
                </span>
              );
            }

            return <span key={i}>{part}</span>;
          })}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      );
    });
  }

  // 🔥 BARU: helper kecil buat tombol unduh mobile — logic-nya SAMA
  // PERSIS dengan onClick tombol desktop, cuma diekstrak biar tidak
  // duplikasi kode antara versi desktop & mobile.
  const handleDownload = (sertifikat: Sertifikat) => {
    if (sertifikat.hasCertificate && sertifikat.downloadLink) {
      window.open(sertifikat.downloadLink, "_blank");
    }
  };

  return (
    <div className="mb-5 mt-0">
      <h2 className="text-base font-semibold text-gray-800 mb-3">{title}</h2>

      {sertifikats.length === 0 ? (
        <p className="text-gray-500 text-xs">Belum ada sertifikat.</p>
      ) : (
        <>
          {/* Versi DESKTOP/tablet — grid card vertikal ASLI, TIDAK diubah
              sama sekali, cuma dibungkus "hidden sm:grid" (dulu "grid"
              polos) biar identik mulai sm: ke atas dan disembunyikan di
              mobile (digantikan list horizontal di bawah). */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sertifikats.map((sertifikat) => (
              <Card
                key={sertifikat.id}
                className="p-0 overflow-hidden flex flex-col shadow-sm hover:shadow transition"
              >
                {/* IMAGE */}
                <div className="relative w-full h-32">
                  <Image
                    src="/assets/dashboard/user/kokok.png"
                    alt="Certificate Placeholder"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* CONTENT */}
                <CardContent className="px-3 py-3 flex-1 space-y-2">
                  <h3
                    title={sertifikat.title}
                    className="text-sm mb-2 font-semibold text-gray-800 leading-tight line-clamp-2"
                  >
                    {sertifikat.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-snug line-clamp-3 break-words">
                    {parseDescription(sertifikat.description)}
                  </p>

                  {/* STATUS */}
                  <div className="flex flex-col mt-2 gap-3">
                    <div className="flex items-center text-xs gap-1.5 text-gray-600">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-medium break-words">
                        {sertifikat.dateRange}
                      </span>
                    </div>

                    <div
                      className={`text-xs font-semibold ${
                        sertifikat.hasCertificate
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {sertifikat.hasCertificate
                        ? "Sertifikat sudah terbit"
                        : "Sertifikat belum terbit"}
                    </div>
                  </div>
                </CardContent>

                {/* FOOTER */}
                <CardFooter className="px-3 pb-3 mt-auto w-full">
                  <button
                    disabled={!sertifikat.hasCertificate}
                    onClick={() => handleDownload(sertifikat)}
                    className={`
                  flex items-center justify-center gap-1.5
                  w-full
                  px-3 py-1.5
                  text-xs font-medium
                  rounded-md
                  transition
                  ${
                    sertifikat.hasCertificate
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }
                `}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Sertifikat
                  </button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* 🔥 BARU: versi MOBILE (sm:hidden) — list horizontal, bukan
              grid vertikal. Tiap baris: thumbnail kotak kecil di kiri,
              judul+status+tanggal di kanan (ringkas), tombol unduh
              full-width di bawah. Data & logic download SAMA PERSIS
              dengan versi desktop (pakai handleDownload yang sama). */}
          <div className="sm:hidden space-y-3">
            {sertifikats.map((sertifikat) => (
              <div
                key={sertifikat.id}
                className="bg-white border border-gray-200 rounded-lg p-3"
              >
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src="/assets/dashboard/user/kokok.png"
                      alt="Certificate Placeholder"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3
                      title={sertifikat.title}
                      className="text-sm font-semibold text-gray-800 leading-tight line-clamp-1"
                    >
                      {sertifikat.title}
                    </h3>

                    <div className="mt-1.5 flex items-center text-[11px] gap-1.5 text-gray-500">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span className="truncate">{sertifikat.dateRange}</span>
                    </div>

                    <div
                      className={`mt-1 text-[11px] font-semibold ${
                        sertifikat.hasCertificate
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {sertifikat.hasCertificate
                        ? "Sertifikat sudah terbit"
                        : "Sertifikat belum terbit"}
                    </div>
                  </div>
                </div>

                {/* ACTION — full-width di bawah, terpisah dari baris info */}
                <button
                  disabled={!sertifikat.hasCertificate}
                  onClick={() => handleDownload(sertifikat)}
                  className={`
                flex items-center justify-center gap-1.5
                w-full mt-3
                px-3 py-2
                text-xs font-medium
                rounded-md
                transition
                ${
                  sertifikat.hasCertificate
                    ? "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Sertifikat
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
