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
    <section className="py-8 md:py-16 bg-white">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 px-4">
            Project Sejauh Ini, Keren Nggak Sih?
          </h2>
          <p className="text-base md:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed px-4">
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
            <CarouselContent className="gap-6">
              {projects.map((project) => (
                <CarouselItem
                  key={project.id}
                  className="basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <div className="bg-bg-color-primary rounded-lg md:rounded-xl overflow-hidden h-full flex flex-col">
                    {/* Project Image */}
                    <div className="relative h-60 overflow-hidden sm:h-56 md:h-64 lg:h-72 bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0">
                      <Image
                        src={getProjectImage(project.keywords)}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Project Content */}
                    <div className="p-4 md:p-6 flex flex-col flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight line-clamp-3">
                        {project.title}
                      </h3>

                      <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed line-clamp-3 flex-1">
                        {project.description}
                      </p>

                      {/* Authors */}
                      <div className="flex items-center mb-4 md:mb-6 gap-3">
                        <UserRound className="w-4 h-4" />

                        <span className="text-xs md:text-sm text-gray-700 line-clamp-1">
                          {project.authors.join(", ")}
                        </span>
                      </div>

                      {/* Button */}
                      <Button className="w-fit bg-emerald-500 hover:bg-emerald-600 text-white px-4 md:px-6 py-2 rounded-lg font-medium text-sm md:text-base">
                        Jelajahi Proyek
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Arrows - Hidden on mobile, shown on tablet+ */}
            <CarouselPrevious className="hidden md:flex left-2 lg:-left-12 bg-white border-gray-200 hover:bg-gray-50 shadow-md" />
            <CarouselNext className="hidden md:flex right-2 lg:-right-12 bg-white border-gray-200 hover:bg-gray-50 shadow-md" />
          </Carousel>

          {/* Dots Indicator */}
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
