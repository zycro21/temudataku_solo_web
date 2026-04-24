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
    <div className="mb-5 mt-0">
      <h2 className="text-base font-semibold text-gray-800 mb-3">{title}</h2>

      {sertifikats.length === 0 ? (
        <p className="text-gray-500 text-xs">Belum ada sertifikat.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                <h3 className="text-sm mb-2 font-semibold text-gray-800 leading-tight line-clamp-2">
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
                  onClick={() => {
                    if (sertifikat.hasCertificate && sertifikat.downloadLink)
                      window.open(sertifikat.downloadLink, "_blank");
                  }}
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
      )}
    </div>
  );
}
