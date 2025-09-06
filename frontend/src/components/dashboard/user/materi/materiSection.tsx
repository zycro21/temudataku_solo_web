"use client";

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
  return (
    <div className="mb-8 mt-2">
      {" "}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      {materis.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada materi.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {materis.map((materi) => (
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
                <p className="text-sm text-gray-600">{materi.description}</p>

                <div className="flex text-sm gap-2 text-gray-600 mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>{materi.dateRange}</span>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col px-5 pb-6 mt-auto w-full">
                {/* Tombol full width, stack vertical */}
                <div className="flex flex-col gap-2 w-full mb-2">
                  {materi.pptLink && (
                    <a
                      href={materi.pptLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center px-3 py-2 text-sm font-medium rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition"
                    >
                      Lihat PPT
                    </a>
                  )}
                  {materi.videoLink && (
                    <a
                      href={materi.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center px-3 py-2 text-sm font-medium rounded-md border border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition"
                    >
                      Lihat Rekaman Kelas
                    </a>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
