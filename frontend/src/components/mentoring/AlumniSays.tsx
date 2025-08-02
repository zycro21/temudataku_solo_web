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
import alumni1 from "@/assets/mentoringPage/testimoni1.svg"

// Sample alumni data
const alumni = [
    {
        id: 1,
        name: "John Drake Lane",
        role: "Alumni Group Mentoring",
        status: "Mahasiswa Aktif",
        image: "/images/alumni-1.jpg", // Placeholder
        testimonial: "Belajar bareng mentor bikin perjalanan data gak kerasa sendirian. Banyak alumni jadi makin paham, makin pede, dan siap terjun ke dunia kerja."
    },
    {
        id: 2,
        name: "John Drake Lane",
        role: "Alumni Group Mentoring", 
        status: "Mahasiswa Aktif",
        image: "/images/alumni-2.jpg", // Placeholder
        testimonial: "Mentoring di TemuDataku memberikan pengalaman yang luar biasa. Ilmu yang didapat sangat applicable di dunia kerja."
    },
    {
        id: 3,
        name: "John Drake Lane",
        role: "Alumni Group Mentoring",
        status: "Mahasiswa Aktif", 
        image: "/images/alumni-3.jpg", // Placeholder
        testimonial: "Program mentoring yang terstruktur dan mentor yang berpengalaman membuat learning journey jadi lebih terarah."
    },
    {
        id: 4,
        name: "John Drake Lane",
        role: "Alumni Group Mentoring",
        status: "Mahasiswa Aktif",
        image: "/images/alumni-4.jpg", // Placeholder  
        testimonial: "Networking yang dibangun selama mentoring sangat berharga untuk karir di bidang data science."
    }
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
        <section className="py-8 md:py-16">
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
                            Belajar bareng mentor bikin perjalanan data gak kerasa sendirian. Banyak
                            alumni jadi makin paham, makin pede, dan siap terjun ke dunia kerja. Yuk,
                            intip cerita mereka!
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
                        <CarouselContent className="py-2 md:py-5 -ml-2 md:-ml-4 px-4">
                            {alumni.map((person) => (
                                <CarouselItem
                                    key={person.id}
                                    className="pl-2 md:pl-4 basis-[85%] sm:basis-[65%] md:basis-1/2 lg:basis-1/3"
                                >
                                    <div className="bg-white rounded-lg md:rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
                                        {/* Alumni Image */}
                                        <div className="relative h-64 sm:h-72 md:h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                                            {/* Placeholder for alumni photo */}
                                            <Image src={alumni1} alt="alumni" className="w-full h-full object-cover" />
                                        </div>

                                        {/* Alumni Info */}
                                        <div className="p-4 md:p-6 flex flex-col flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                {/* Small avatar */}
                                                <Image src={alumni1} alt="alumni" className="w-14 h-14 object-cover rounded-full" />
                                                
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