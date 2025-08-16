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
        title: "Hubungan Positif antara Angka Stunting dan Faktor Ekonomi Provinsi Papua Barat Indonesia",
        description:
            "Project ini menganalisis hubungan angka stunting dengan faktor ekonomi di Papua Barat, dan menemukan korelasi positif di antara keduanya.",
        authors: ["John Drake Lane", "Mario Bros", "Lusiana Gomes"],
        image: "/images/project-laptop-1.jpg", // Placeholder image
    },
    {
        id: 2,
        title: "Hubungan Positif antara Angka Stunting dan Faktor Ekonomi Provinsi Papua Barat Indonesia",
        description:
            "Project ini menganalisis hubungan angka stunting dengan faktor ekonomi di Papua Barat, dan menemukan korelasi positif di antara keduanya.",
        authors: ["John Drake Lane", "Mario Bros", "Lusiana Gomes"],
        image: "/images/project-laptop-2.jpg", // Placeholder image
    },
    {
        id: 3,
        title: "Analisis Trend Pertumbuhan Ekonomi Digital Indonesia",
        description:
            "Penelitian mendalam tentang pertumbuhan sektor ekonomi digital di Indonesia dan dampaknya terhadap UMKM.",
        authors: ["Sarah Connor", "Bruce Wayne", "Diana Prince"],
        image: "/images/project-laptop-3.jpg", // Placeholder image
    },
];

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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8 md:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 px-4">
                        Project Sejauh Ini, Keren Nggak Sih?
                    </h2>
                    <p className="text-base md:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed px-4">
                        Di sini kamu bisa lihat hasil karya alumni TemuDataku
                        selama ikut bootcamp. Bukan cuma materi, tapi project
                        beneran yang nunjukin skill mereka di dunia data. Yuk
                        intip, siapa tahu bisa jadi inspirasi kamu juga!
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
                            skipSnaps: false,
                            dragFree: true,
                        }}
                    >
                        <CarouselContent className="py-2 md:py-5 -ml-2 md:-ml-4">
                            {projects.map((project) => (
                                <CarouselItem
                                    key={project.id}
                                    className="pl-2 md:pl-4 basis-[85%] sm:basis-[75%] md:basis-1/2 lg:basis-[45%]"
                                >
                                    <div className="bg-bg-color-primary rounded-lg md:rounded-xl overflow-hidden h-full flex flex-col">
                                        {/* Project Image */}
                                        <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0">
                                            <Image
                                                src="/assets/mentoringPage/laptop.svg"
                                                alt="laptop"
                                                width={400}
                                                height={300}
                                                className="w-full h-full object-cover"
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
