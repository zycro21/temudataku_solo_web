// src/components/dashboard/user/recommendationSection.tsx
"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function RecommendationSection() {
  const recommendations = [
    {
      tag: "Dapatkan Sertifikat!",
      title: "Forecasting Harga Saham",
      type: "Practice",
      level: "Expert",
    },
    {
      tag: "Dapatkan Sertifikat!",
      title: "Forecasting Harga Saham Dengan Mengunakan Metode",
      type: "Live Class",
      level: "Beginner",
    },
    {
      tag: "Dapatkan Sertifikat!",
      title: "Forecasting Harga Saham",
      type: "Live Class",
      level: "Beginner",
    },
    {
      tag: "Dapatkan Sertifikat!",
      title: "Another Long Forecasting Class Example",
      type: "Practice",
      level: "Intermediate",
    },
  ];

  return (
    <div className="mt-8">
      {/* Container putih */}
      <div className="bg-white rounded-2xl shadow-sm p-6 relative">
        {/* Judul */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Rekomendasi
        </h2>

        {/* Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent>
            {recommendations.map((item, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="relative bg-emerald-100 p-6 rounded-xl overflow-hidden min-h-[120px] flex flex-col justify-between">
                  <Image
                    src="/assets/dashboard/user/leaf.svg"
                    alt="pattern"
                    width={80}
                    height={80}
                    className="absolute right-2 bottom-2 opacity-80"
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <span className="text-sm text-gray-600 block mb-3">
                      {item.tag}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 pr-16 break-words">
                      {item.title}
                    </h3>
                    <div className="flex items-center text-sm font-medium text-gray-600">
                      <span>{item.type}</span>
                      <span className="mx-2">|</span>
                      <span>{item.level}</span>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Controls */}
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}
