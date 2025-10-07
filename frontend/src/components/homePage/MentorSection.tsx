"use client";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Briefcase, Calendar, Code } from "lucide-react";
import React from "react";
import Image from "next/image";

const MentorSection = () => {
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
  const mentors = [
    {
      id: 1,
      name: "Vania Frederica",
      role: "Data Scientist di Lorem Ipsum",
      experience: "2 Tahun Sebagai Data Scientist",
      skills: "Python, Excel, BI, SQL",
      image: "/assets/mentorPage/mentors/vania.svg",
    },
    {
      id: 2,
      name: "Mochamad Dimas Putra Hermawan",
      role: "Data Scientist di Lorem Ipsum",
      experience: "2 Tahun Sebagai Data Scientist",
      skills: "Python, Excel, BI, SQL",
      image: "/assets/mentorPage/mentors/dimas.svg",
    },
    {
      id: 3,
      name: "Jesselyn Mu",
      role: "Data Scientist di Lorem Ipsum",
      experience: "3 Tahun Sebagai Data Scientist",
      skills: "Python, Excel, BI, SQL",
      image: "/assets/mentorPage/mentors/jesselyn.svg",
    },
    {
      id: 4,
      name: "M. Iqbal Purba",
      role: "Data Scientist di Lorem Ipsum",
      experience: "3 Tahun Sebagai Data Scientist",
      skills: "Python, Excel, BI, SQL",
      image: "/assets/mentorPage/mentors/iqbal.svg",
    },
    {
      id: 5,
      name: "Muhamad Ali",
      role: "Data Scientist di Lorem Ipsum",
      experience: "3 Tahun Sebagai Data Scientist",
      skills: "Python, Excel, BI, SQL",
      image: "/assets/mentorPage/mentors/ali.svg",
    },
  ];

  return (
    <section className="py-8 md:py-16">
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm font-semibold text-[#243A77] mb-2">Mentor</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Perkenalkan Mentor-Mentor
              <br />
              Berpengalaman Kami
            </h2>
          </div>

          {/* Tombol navigasi hanya tampil di md ke atas */}
          <div className="hidden md:flex gap-3"></div>
        </div>
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
            <CarouselContent className="py-2 md:py-5 -ml-2 md:-ml-4 px-0">
              {mentors.map((mentor) => (
                <CarouselItem
                  key={mentor.id}
                  className="pl-2 md:pl-4 basis-[85%] sm:basis-[65%] md:basis-1/2 lg:basis-1/3"
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-none h-full">
                    <div className=" relative h-64 sm:h-72 md:h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                      <Image
                        src={mentor.image}
                        alt={mentor.name}
                        width={400}
                        height={320}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {mentor.name}
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span>{mentor.role}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{mentor.experience}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Code className="w-4 h-4" />
                          <span>{mentor.skills}</span>
                        </div>
                      </div>
                      <button className="text-[#0CA678] font-medium text-sm hover:underline">
                        Lihat Profil Lengkap
                      </button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Tombol navigasi ditaruh di pojok kanan atas */}
            <div className="hidden md:flex gap-2 absolute -top-10 right-20 z-10">
              <CarouselPrevious className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 shadow-md w-10 h-10" />
              <CarouselNext className="bg-[#0CA678] hover:bg-[#08916C] text-white shadow-md w-10 h-10" />
            </div>
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
};

export default MentorSection;
