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
import { UserRound } from "lucide-react";

// Sample project data
const projects = [
  {
    id: 1,
    title:
      "Analisis Prediksi Stunting Berbasis Machine Learning di Papua Barat",
    description:
      "Menggunakan Random Forest untuk memprediksi tingkat stunting berdasarkan indikator ekonomi, pendidikan, dan akses kesehatan.",
    authors: ["Rama Mahendra", "Siti Nur Aisyah", "Yusuf Pranowo"],
    keywords: ["health", "machine-learning", "indonesia"],
    link: "https://example.com/project/stunting-ml",
  },
  {
    id: 2,
    title: "Dashboard Interaktif Pertumbuhan Startup Indonesia 2015–2024",
    description:
      "Visualisasi data pertumbuhan startup berbasis sektor industri menggunakan Tableau dan analisis tren investasi.",
    authors: ["Putri Ayudya", "Arga Wibisono", "Dimas Tri Saputra"],
    keywords: ["dashboard", "startup", "data-visualization"],
    link: "https://example.com/project/startup-dashboard",
  },
  {
    id: 3,
    title: "Segmentasi Pelanggan E-Commerce Menggunakan Clustering K-Means",
    description:
      "Clustering pelanggan berdasarkan perilaku transaksi untuk meningkatkan efektivitas campaign marketing.",
    authors: ["Fajar Nugroho"],
    keywords: ["clustering", "ecommerce", "marketing"],
    link: "https://example.com/project/customer-clustering",
  },
  {
    id: 4,
    title: "Analisis Sentimen Media Sosial terhadap Kebijakan Publik",
    description:
      "Mengolah data Twitter menggunakan NLP untuk memahami persepsi masyarakat terhadap kebijakan pemerintah.",
    authors: ["Marsha Syakira", "Steven Widjaya", "Lukman Hakim"],
    keywords: ["nlp", "sentiment-analysis", "social-media"],
    link: "https://example.com/project/sentiment-analysis",
  },
];

const getProjectImage = (keywords?: string[]) => {
  if (!keywords || keywords.length === 0)
    return "/assets/programsPage/project/default-project.jpg";

  const map: Record<string, string> = {
    "machine-learning": "/assets/programsPage/project/ml.jpg",
    dashboard: "/assets/programsPage/project/dashboard.jpg",
    clustering: "/assets/programsPage/project/clustering.jpg",
    nlp: "/assets/programsPage/project/nlp.jpg",
    health: "/assets/programsPage/project/health.jpg",
    ecommerce: "/assets/programsPage/project/ecommerce.jpg",
  };

  for (const key of keywords) {
    if (map[key]) return map[key];
  }

  return "/assets/programsPage/project/ml.jpg";
};

export default function ProjectExamples() {
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
    <section className="py-6 md:py-12 bg-white">
      <div className="max-w-[1000px] mx-auto px-3 sm:px-5 lg:px-6">
        {/* Header */}
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4 px-2">
            Project Sejauh Ini, Keren Nggak Sih?
          </h2>
          <p className="text-sm md:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed px-2">
            Di sini kamu bisa lihat hasil karya alumni TemuDataku selama ikut
            bootcamp. Bukan cuma materi, tapi project beneran yang nunjukin
            skill mereka di dunia data. Yuk intip, siapa tahu bisa jadi
            inspirasi kamu juga!
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Carousel
            setApi={setApi}
            className="w-full"
            opts={{
              align: "start",
              loop: true,
              dragFree: false,
            }}
          >
            <CarouselContent className="gap-4">
              {projects.map((project) => (
                <CarouselItem
                  key={project.id}
                  className="basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <div className="bg-bg-color-primary rounded-md md:rounded-lg overflow-hidden h-full flex flex-col">
                    {/* Project Image */}
                    <div className="relative h-44 sm:h-48 md:h-52 lg:h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0">
                      <Image
                        src={getProjectImage(project.keywords)}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Project Content */}
                    <div className="p-3 md:p-4 flex flex-col flex-1">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3 leading-snug line-clamp-3">
                        {project.title}
                      </h3>

                      <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 leading-relaxed line-clamp-3 flex-1">
                        {project.description}
                      </p>

                      {/* Authors */}
                      <div className="flex items-center mb-3 md:mb-4 gap-2">
                        <UserRound className="w-3.5 h-3.5" />
                        <span className="text-[11px] md:text-xs text-gray-700 line-clamp-1">
                          {project.authors.join(", ")}
                        </span>
                      </div>

                      {/* Button */}
                      <Button className="w-fit bg-emerald-500 hover:bg-emerald-600 text-white px-3 md:px-4 py-1.5 rounded-md font-medium text-xs md:text-sm">
                        Jelajahi Proyek
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="hidden md:flex left-1 lg:-left-8 bg-white border-gray-200 hover:bg-gray-50 shadow-sm" />
            <CarouselNext className="hidden md:flex right-1 lg:-right-8 bg-white border-gray-200 hover:bg-gray-50 shadow-sm" />
          </Carousel>

          {/* Dots */}
          <div className="flex justify-center mt-3 md:mt-4 space-x-1.5">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-colors ${
                  index + 1 === current
                    ? "bg-emerald-500"
                    : "bg-gray-300 hover:bg-gray-400"
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
