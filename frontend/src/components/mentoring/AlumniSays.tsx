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

// Testimoni sudah diperbarui (pujian beragam, natural, dan relevan)
const alumni = [
  {
    id: 1,
    name: "Raka F. Maulana",
    role: "Alumni Group Mentoring",
    status: "Mahasiswa Aktif",
    image: "/images/alumni-1.jpg",
    testimonial:
      "Sesi mentoringnya keren banget! Mentor benar-benar sabar menjelaskan konsep yang sulit jadi mudah dimengerti. Sekarang aku jauh lebih percaya diri ngerjain proyek data sendiri.",
  },
  {
    id: 2,
    name: "Christie Andita",
    role: "Alumni Group Mentoring",
    status: "Mahasiswa Aktif",
    image: "/images/alumni-2.jpg",
    testimonial:
      "Mentoring di TemuDataku bikin aku lebih paham dunia kerja nyata. Mentor kasih insight langsung dari industri yang gak akan aku dapetin dari kelas biasa.",
  },
  {
    id: 3,
    name: "Indra Fahri Eka",
    role: "Alumni Group Mentoring",
    status: "Mahasiswa Aktif",
    image: "/images/alumni-3.jpg",
    testimonial:
      "Suka banget sama cara mentor ngajarin! Step-by-step, dikasih contoh real case juga. Setelah mentoring, aku bisa bikin dashboard profesional pertama aku!",
  },
  {
    id: 4,
    name: "Fachri K.",
    role: "Alumni Group Mentoring",
    status: "Mahasiswa Aktif",
    image: "/images/alumni-4.jpg",
    testimonial:
      "Bukan cuma belajar teknikal, tapi juga dapet motivasi dan arahan karir. Komunitasnya juga suportif banget, jadi semangat terus buat belajar data.",
  },
];

export default function AlumniSays() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <section className="py-8 md:py-16" id="alumni-says">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8">
          <div className="mb-6 lg:mb-0 lg:max-w-md">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Apa Kata Alumni Tentang Mentoring di TemuDataku?
            </h2>
          </div>
          <div className="lg:max-w-md lg:text-right">
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              Dengar langsung pengalaman mereka yang sudah ikut mentoring —
              bagaimana bimbingan dari praktisi membantu mereka berkembang dan
              menembus karier impian di dunia data.
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
              loop: false,
              skipSnaps: false,
              dragFree: true,
            }}
          >
            <CarouselContent className="py-2 md:py-5 -ml-2 md:-ml-4 px-0">
              {alumni.map((person) => (
                <CarouselItem
                  key={person.id}
                  className="pl-2 md:pl-4 basis-[85%] sm:basis-[65%] md:basis-1/2 lg:basis-1/3"
                >
                  <div className="bg-white rounded-lg md:rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
                    {/* Alumni Image */}
                    <div className="relative h-64 sm:h-72 md:h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                      <Image
                        src={"/assets/mentoringPage/testimoni1.svg"}
                        width={400}
                        height={320}
                        alt="alumni"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Alumni Info */}
                    <div className="p-4 md:p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Image
                          src={"/assets/mentoringPage/testimoni1.svg"}
                          width={56}
                          height={56}
                          alt="alumni"
                          className="w-14 h-14 object-cover rounded-full"
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-1">
                            {person.name}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
                            {person.role}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {person.status}
                          </p>
                        </div>
                      </div>

                      {/* Testimonial text ditampilkan */}
                      <p className="text-sm md:text-base text-gray-700 leading-relaxed flex-1">
                        “{person.testimonial}”
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation */}
            <CarouselPrevious className="hidden md:flex left-2 lg:-left-12 bg-white border-gray-200 hover:bg-gray-50 shadow-md" />
            <CarouselNext className="hidden md:flex right-2 lg:-right-12 bg-white border-gray-200 hover:bg-gray-50 shadow-md" />
          </Carousel>

          {/* Dots */}
          <div className="flex justify-center mt-4 md:mt-6 space-x-2">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors touch-manipulation ${
                  index + 1 === current
                    ? "bg-emerald-500"
                    : "bg-gray-300 hover:bg-gray-400 active:bg-gray-500"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
