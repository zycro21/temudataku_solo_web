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
import { User } from "lucide-react";

const alumni = [
  {
    id: 1,
    name: "Rafi Aditya",
    role: "Data Analyst Intern",
    status: "Fresh Graduate",
    color: "text-emerald-500",
    testimonial:
      "Bootcamp ini bikin aku ngerti fundamental data analytics dengan lebih terstruktur dan aplikatif.",
  },
  {
    id: 2,
    name: "Salsabila Putri Rahma",
    role: "Business Intelligence Staff",
    status: "Career Switcher",
    color: "text-sky-500",
    testimonial:
      "Materinya relevan banget sama kebutuhan industri. Sekarang lebih pede presentasi insight ke tim.",
  },
  {
    id: 3,
    name: "Dimas Wicaksono",
    role: "Junior Data Scientist",
    status: "Mahasiswa Tingkat Akhir",
    color: "text-violet-500",
    testimonial:
      "Mentornya suportif dan projectnya real case. Sangat membantu bangun portfolio.",
  },
  {
    id: 4,
    name: "Nadira Khairunnisa",
    role: "Marketing Data Specialist",
    status: "Full-time Employee",
    color: "text-rose-500",
    testimonial:
      "Belajar di TemuDataku bikin aku paham cara baca data untuk ambil keputusan bisnis.",
  },
  {
    id: 5,
    name: "Arman Prakoso Wijaya",
    role: "Freelance Data Analyst",
    status: "Remote Worker",
    color: "text-amber-500",
    testimonial:
      "Networking alumni dan komunitasnya ngebantu banget buat dapet peluang project.",
  },
];

export default function AlumniSays() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="py-8 md:py-16">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8">
          <div className="mb-6 lg:mb-0 lg:max-w-md">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Apa Kata Alumni Tentang Bootcamp di TemuDataku?
            </h2>
          </div>
          <div className="lg:max-w-md lg:text-right">
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              Belajar bareng mentor bikin perjalanan data gak kerasa sendirian.
              Banyak alumni jadi makin paham, makin pede, dan siap terjun ke
              dunia kerja.
            </p>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Carousel
            setApi={setApi}
            className="w-full"
            opts={{
              align: "start",
              loop: true, // ✅ LOOP AKTIF
              dragFree: false,
            }}
          >
            <CarouselContent className="-ml-4">
              {alumni.map((person) => (
                <CarouselItem
                  key={person.id}
                  className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div className="bg-white rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 h-full flex flex-col p-6 border border-transparent hover:border-emerald-200">
                    {/* ICON LEBIH BESAR */}
                    <div className="flex justify-center mb-6">
                      <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className={`w-14 h-14 ${person.color}`} />
                      </div>
                    </div>

                    <div className="text-center flex-1 flex flex-col">
                      <h3 className="text-base font-bold text-gray-900 mb-1">
                        {person.name}
                      </h3>
                      <p className="text-sm text-gray-600">{person.role}</p>
                      <p className="text-xs text-gray-500 mb-4">
                        {person.status}
                      </p>

                      <p className="text-sm text-gray-700 leading-relaxed mt-auto">
                        "{person.testimonial}"
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Emerald Themed Arrows */}
            <CarouselPrevious className="hidden md:flex -left-10 bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 shadow-md" />
            <CarouselNext className="hidden md:flex -right-10 bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 shadow-md" />
          </Carousel>

          {/* Improved Dots */}
          <div className="flex justify-center mt-8 gap-3">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === current
                    ? "w-8 h-3 bg-emerald-500"
                    : "w-3 h-3 bg-gray-300 hover:bg-emerald-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
