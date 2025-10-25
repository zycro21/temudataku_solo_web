"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface Materi {
  id: string;
  title: string;
  description: string;
  program: string;
  category: string;
  dateRange: string;
  image: string;
  pptLink?: string;
  videoLink?: string;
}

interface MateriSectionProps {
  title: string;
  materis: Materi[];
}

export default function MateriSection({ title, materis }: MateriSectionProps) {
  useEffect(() => {
    console.log("MateriSection mounted, data:", materis);
  }, [materis]);

  // Helper cek valid link
  const isValidLink = (link?: string) =>
    typeof link === "string" && link.trim() !== "";

  return (
    <div className="mb-8 mt-2">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>

      {materis.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada materi.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {materis.map((materi) => {
            const hasPpt = isValidLink(materi.pptLink);
            const hasVideo = isValidLink(materi.videoLink);

            return (
              <Card
                key={materi.id}
                className="p-0 overflow-hidden flex flex-col justify-between"
              >
                {/* Gambar */}
                <div className="relative w-full h-48">
                  <Image
                    src={
                      materi.image &&
                      (materi.image.startsWith("/") ||
                        materi.image.startsWith("http"))
                        ? materi.image
                        : "/assets/dashboard/user/kokok.png"
                    }
                    alt={materi.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Konten */}
                <CardContent className="px-5 pt-1 pb-5 flex-1 space-y-3">
                  <h3 className="text-lg font-bold text-gray-800">
                    {materi.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {materi.description}
                  </p>

                  <div className="flex text-sm gap-2 text-gray-600 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{materi.dateRange}</span>
                  </div>
                </CardContent>

                {/* 🔗 Tombol Aksi */}
                <CardFooter className="flex flex-col gap-2 px-5 pb-6">
                  {/* Tombol PPT */}
                  <a
                    href={hasPpt ? materi.pptLink : undefined}
                    target={hasPpt ? "_blank" : undefined}
                    rel={hasPpt ? "noopener noreferrer" : undefined}
                    className={`w-full text-center px-4 py-2 rounded-lg transition ${
                      hasPpt
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                    onClick={(e) => {
                      if (!hasPpt) e.preventDefault();
                    }}
                  >
                    Lihat PPT
                  </a>

                  {/* Tombol Video */}
                  <a
                    href={hasVideo ? materi.videoLink : undefined}
                    target={hasVideo ? "_blank" : undefined}
                    rel={hasVideo ? "noopener noreferrer" : undefined}
                    className={`w-full text-center px-4 py-2 rounded-lg transition ${
                      hasVideo
                        ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                    onClick={(e) => {
                      if (!hasVideo) e.preventDefault();
                    }}
                  >
                    Lihat Rekaman Kelas
                  </a>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
