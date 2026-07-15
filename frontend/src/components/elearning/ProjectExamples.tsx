"use client";

import * as React from "react";
import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import type { CarouselApi } from "@/components/ui/carousel";

/* =======================
   PROJECT DATA (MAPPING)
======================= */
const projects = [
  {
    id: 1,
    title:
      "Hubungan Positif antara Angka Stunting dan Faktor Ekonomi Provinsi Papua Barat Indonesia",
    description:
      "Project ini menganalisis hubungan angka stunting dengan faktor ekonomi di Papua Barat, dan menemukan korelasi positif di antara keduanya.",
    authors: ["John Drake Lane", "Mario Bros", "Lusiana Gomes"],
    image:
      "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    title:
      "Analisis Faktor Sosial terhadap Kesehatan Anak di Wilayah Timur Indonesia",
    description:
      "Studi ini mengeksplorasi pengaruh faktor sosial dan lingkungan terhadap kesehatan anak di wilayah Indonesia Timur.",
    authors: ["John Drake Lane", "Mario Bros", "Lusiana Gomes"],
    image:
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Analisis Trend Pertumbuhan Ekonomi Digital Indonesia",
    description:
      "Penelitian mendalam tentang pertumbuhan sektor ekonomi digital di Indonesia dan dampaknya terhadap UMKM.",
    authors: ["Sarah Connor", "Bruce Wayne", "Diana Prince"],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Visualisasi Data Persebaran UMKM Berbasis GIS",
    description:
      "Project visualisasi interaktif untuk melihat persebaran UMKM di Indonesia menggunakan pendekatan GIS dan data terbuka.",
    authors: ["Clark Kent", "Peter Parker"],
    image:
      "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Analisis Sentimen Publik terhadap Kebijakan Kesehatan",
    description:
      "Menggunakan NLP untuk menganalisis sentimen masyarakat terhadap kebijakan kesehatan melalui media sosial.",
    authors: ["Tony Stark", "Natasha Romanoff"],
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Dashboard Interaktif Monitoring Kesehatan Daerah",
    description:
      "Dashboard data interaktif untuk memantau indikator kesehatan daerah secara real-time.",
    authors: ["Steve Rogers", "Sam Wilson"],
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 7,
    title: "Machine Learning untuk Prediksi Risiko Stunting",
    description:
      "Model machine learning untuk memprediksi risiko stunting berdasarkan data sosio-ekonomi.",
    authors: ["Bruce Banner", "Shuri"],
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 8,
    title: "Eksplorasi Data Pendidikan dan Dampaknya terhadap Kesehatan",
    description:
      "Eksplorasi korelasi tingkat pendidikan dengan kualitas kesehatan masyarakat.",
    authors: ["Wanda Maximoff", "Vision"],
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function ProjectExamples() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(1);
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
    <section className="py-8 md:py-12 bg-white w-full overflow-hidden">
      {/* ===== HEADER ===== */}
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
            Proyek Sejauh Ini, Keren Nggak Sih?
          </h2>
          <p className="text-sm md:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Bukan sekadar latihan, ini hasil nyata dari mereka yang udah serius
            ngejalanin challenge di TemuDataku. Dari analisis data sampai
            visualisasi yang insight-driven, semua proyek ini nunjukin gimana
            latihan bisa beneran ngasah skill.
          </p>
        </div>
      </div>

      {/* ===== CAROUSEL ===== */}
      <div className="max-w-[1200px] mx-auto px-4">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{ align: "start", loop: true }}
        >
          <CarouselContent className="gap-4">
            {projects.map((project) => (
              <CarouselItem
                key={project.id}
                className="basis-full md:basis-1/2"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-md h-full flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                  {/* IMAGE */}
                  <div className="relative h-48 md:h-56">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1.5 line-clamp-2">
                      {project.title}
                    </h3>

                    <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-3 flex-1">
                      {project.description}
                    </p>

                    {/* AUTHORS */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-700 mb-3">
                      <Image
                        src="/assets/elearning/solar.svg"
                        alt="Author"
                        width={14}
                        height={14}
                      />
                      <span className="line-clamp-1">
                        {project.authors.join(", ")}
                      </span>
                    </div>

                    <Button className="w-fit bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-4 py-2 h-auto">
                      Jelajahi Proyek
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* ARROWS */}
          <CarouselPrevious className="hidden md:flex -left-10 bg-white border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white shadow-md transition-colors" />
          <CarouselNext className="hidden md:flex -right-10 bg-white border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white shadow-md transition-colors" />
        </Carousel>

        {/* DOTS */}
        <div className="flex justify-center mt-4 gap-1.5">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                current === i + 1
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
