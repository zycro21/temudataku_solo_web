"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface Sertifikat {
  id: string;
  title: string;
  description: string;
  program: string;
  category: string;
  dateRange: string;
  image: string;
  downloadLink?: string;
}

interface SertifikatSectionProps {
  title: string;
  sertifikats: Sertifikat[];
}

export default function SertifikatSection({
  title,
  sertifikats,
}: SertifikatSectionProps) {
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
              className="p-0 overflow-hidden flex flex-col justify-between"
            >
              {/* Gambar */}
              <div className="relative w-full h-48">
                <Image
                  src={
                    sertifikat.image &&
                    (sertifikat.image.startsWith("/") ||
                      sertifikat.image.startsWith("http"))
                      ? sertifikat.image
                      : "/assets/dashboard/user/kokok.png"
                  }
                  alt={sertifikat.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Konten */}
              <CardContent className="px-5 pt-1 pb-5 flex-1 space-y-3">
                <h3 className="text-lg font-bold text-gray-800">
                  {sertifikat.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {sertifikat.description}
                </p>

                <div className="flex text-sm gap-2 text-gray-600 mt-4">
                  <Calendar className="w-4 h-4" />
                  <span className="font-bold">{sertifikat.dateRange}</span>
                </div>
              </CardContent>

              {/* Footer dengan tombol Download */}
              <CardFooter className="flex px-5 pb-6 mt-auto w-full">
                {sertifikat.downloadLink && (
                  <a
                    href={sertifikat.downloadLink}
                    download
                    className="w-full text-center px-3 py-2 text-sm font-medium rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition"
                  >
                    Download
                  </a>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
