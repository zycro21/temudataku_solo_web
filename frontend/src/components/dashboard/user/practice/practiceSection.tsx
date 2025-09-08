"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import KumpulkanModal from "./kumpulkanModal";
import LihatPengumpulanModal from "./lihatPengumpulanModal";
import LihatReviewModal from "./lihatReviewModal";

interface Practice {
  id: string;
  title: string;
  description: string;
  level: "Pemula" | "Menengah" | "Ahli";
  status: "Belum Dikerjakan" | "Selesai" | "Sudah Direview";
  dateStart: string;
  dateEnd: string;
  image: string;
  detailUrl: string;
  submission?: {
    notes: string;
    fileName: string;
    fileSize: string;
    fileUrl: string;
  };
  review?: {
    penilaian: {
      kesesuaian: string;
      kualitas: string;
      kreativitas: string;
      kelengkapan: string;
    };
    feedback: {
      komentar: string;
      saran: string;
      perluRevisi: "Ya" | "Tidak";
    };
  };
}

interface PracticeSectionProps {
  title: string;
  practices: Practice[];
}

export default function PracticeSection({
  title,
  practices,
}: PracticeSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mb-4 mt-0">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">{title}</h2>

      {practices.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada practice.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {practices.map((practice) => (
            <Card
              key={practice.id}
              className="p-0 overflow-hidden flex flex-col justify-between"
            >
              {/* Gambar */}
              <div className="relative w-full h-44">
                <Image
                  src={
                    practice.image &&
                    (practice.image.startsWith("/") ||
                      practice.image.startsWith("http"))
                      ? practice.image
                      : "/assets/dashboard/user/kokok.png"
                  }
                  alt={practice.title}
                  fill
                  className="object-cover"
                />
                {/* Badge status */}
                <span className="absolute bottom-2 left-2 bg-gray-200 text-black text-xs font-semibold px-3 py-1 rounded-md">
                  {practice.level}
                </span>
              </div>

              {/* Konten */}
              <CardContent className="px-5 pt-2 pb-5 flex-1 space-y-3">
                <h3 className="text-base font-bold text-gray-800">
                  {practice.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {practice.description}{" "}
                  <a
                    href={practice.detailUrl} // 👈 pakai link berbeda tiap card
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Lihat detail Practice
                  </a>
                </p>

                {/* Struktur tanggal */}
                <div className="flex items-start gap-2 text-sm text-gray-600 mt-4">
                  <Calendar className="w-4 h-4 mt-1" />
                  <div className="flex gap-8">
                    <div className="flex flex-col items-start">
                      <span>dari</span>
                      <span className="font-semibold">
                        {practice.dateStart}
                      </span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span>sampai</span>
                      <span className="font-semibold">{practice.dateEnd}</span>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Footer dengan tombol aksi */}
              <CardFooter className="flex px-5 pb-6 mt-auto w-full">
                {practice.status === "Belum Dikerjakan" && <KumpulkanModal />}
                {practice.status === "Selesai" && (
                  <LihatPengumpulanModal submission={practice.submission} />
                )}
                {practice.status === "Sudah Direview" && practice.review && (
                  <LihatReviewModal
                    bootcampTitle={practice.title}
                    schedule={`${practice.dateStart} - ${practice.dateEnd}`}
                    review={practice.review}
                  />
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
