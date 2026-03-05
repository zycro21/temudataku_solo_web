"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import Image from "next/image";

/* =======================
   ALUMNI DATA (MAPPING)
======================= */
const alumni = [
  {
    id: 1,
    name: "John Drake Lane",
    role: "Alumni Group Mentoring",
    status: "Mahasiswa Aktif",
    image: "/assets/elearning/4.png",
  },
  {
    id: 2,
    name: "John Drake Lane",
    role: "Alumni Group Mentoring",
    status: "Mahasiswa Aktif",
    image: "/assets/elearning/1.jpg",
  },
  {
    id: 3,
    name: "John Drake Lane",
    role: "Alumni Group Mentoring",
    status: "Mahasiswa Aktif",
    image: "/assets/elearning/3.jpg",
  },
  {
    id: 4,
    name: "John Drake Lane",
    role: "Alumni Group Mentoring",
    status: "Mahasiswa Aktif",
    image: "/assets/elearning/4.png",
  },
];

export default function AlumniSays() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="py-12 md:py-20 w-full overflow-hidden bg-white">
      {/* ===== HEADER ===== */}
      <div className="max-w-[1100px] mx-auto px-4 mb-0 md:mb-14">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 max-w-md leading-snug">
            Apa kata Pengguna E-Learning di TemuDataku?
          </h2>

          <p className="text-base md:text-lg text-gray-800 leading-relaxed lg:flex-1 lg:text-right">
            E-learning ini bikin kamu nggak cuma ngerti konsep, tapi juga pede
            nunjukin hasil kerjamu ke dunia. Skill naik, karier mantap, masa
            depan terbuka. Latihan hari ini, peluang besok.
          </p>
        </div>
      </div>

      {/* ===== CAROUSEL ===== */}
      <div className="max-w-[1100px] mx-auto px-4 relative">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            loop: false,
          }}
        >
          <CarouselContent className="gap-6">
            {alumni.map((person) => (
              <CarouselItem
                key={person.id}
                className="basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
                  {/* IMAGE */}
                  <div className="relative h-72">
                    <Image
                      src={person.image}
                      alt={person.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* INFO */}
                  <div className="p-4 flex items-center gap-3 bg-gray-50">
                    <Image
                      src={person.image}
                      alt={person.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {person.name}
                      </h3>
                      <p className="text-xs text-gray-600 truncate">
                        {person.role}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {person.status}
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* ARROWS */}
          <CarouselPrevious className="hidden md:flex -left-14 scale-110 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-all" />
          <CarouselNext className="hidden md:flex -right-14 scale-110 border border-emerald-500 bg-white text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all" />
        </Carousel>

        {/* DOTS */}
        <div className="flex justify-center mt-6 gap-2">
          {alumni.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                current === index
                  ? "bg-emerald-500"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
