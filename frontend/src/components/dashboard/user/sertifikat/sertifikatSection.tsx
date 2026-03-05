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

  return (
    <div className="mb-6 mt-0">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>

      {sertifikats.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada sertifikat.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sertifikats.map((sertifikat) => (
            <Card
              key={sertifikat.id}
              className="p-0 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition"
            >
              {/* Gambar */}
              <div className="relative w-full h-48">
                <Image
                  src="/assets/dashboard/user/kokok.png"
                  alt="Certificate Placeholder"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Konten */}
              <CardContent className="px-5 pt-1 pb-5 flex-1 space-y-3">
                <h3 className="text-lg font-bold text-gray-800">
                  {sertifikat.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {parseDescription(sertifikat.description)}
                </p>

                {/* Status sertifikat */}
                <div className="flex flex-col mt-3">
                  <div className="flex items-center text-sm gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-600">
                      {sertifikat.dateRange}
                    </span>
                  </div>

                  <div
                    className={`flex items-center text-sm font-semibold mt-5 ${
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

              {/* Footer: hanya tombol Unduh */}
              <CardFooter className="flex px-5 pb-6 mt-0 w-full">
                <button
                  disabled={!sertifikat.hasCertificate}
                  onClick={() => {
                    if (sertifikat.hasCertificate && sertifikat.downloadLink)
                      window.open(sertifikat.downloadLink, "_blank");
                  }}
                  className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
                    sertifikat.hasCertificate
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Unduh Sertifikat
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
