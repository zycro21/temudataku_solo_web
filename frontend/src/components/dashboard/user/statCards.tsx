"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";

const stats = [
  {
    title: "Program Terdaftar",
    value: 5,
    icon: "/assets/dashboard/user/programterdaftar.svg",
  },
  {
    title: "Jumlah Materi",
    value: 15,
    icon: "/assets/dashboard/user/jumlahmateri.svg",
  },
  {
    title: "Sertifikat",
    value: 2,
    icon: "/assets/dashboard/user/sertifikat2.svg",
  },
  {
    title: "Tugas Selesai",
    value: 2,
    icon: "/assets/dashboard/user/tugasselesai.svg",
  },
];

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-6 gap-y-6 mb-6 justify-items-start">
      {stats.map((item, idx) => (
        <div
          key={idx}
          className="relative p-4 bg-white border border-gray-200 rounded-lg shadow-sm max-w-[264px] w-full"
        >
          {/* Chevron Right */}
          <ChevronRight className="absolute top-3 right-3 w-4 h-4 text-gray-800" />

          {/* Icon + Title */}
          <div className="flex items-center gap-2">
            <Image
              src={item.icon}
              alt={item.title}
              width={16}
              height={16}
              className="text-gray-600"
            />
            <span className="text-sm text-gray-600">{item.title}</span>
          </div>

          {/* Value */}
          <div className="mt-5">
            <span className="text-3xl font-bold text-gray-900">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
