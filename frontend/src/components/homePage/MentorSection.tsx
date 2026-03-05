"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
      name: "Jesselyn Mu",
      role: "Mentor Data Scientist",
      experience: "Teknik Informatika UPNV Jakarta",
      skills:
        "Python, SQL, Machine Learning, Statistical Analysis, Data Visualization (Tableau/Power BI), Predictive Modeling, Big Data Analytics, Deep Learning",
      image: "/assets/mentor/jessely.png",
    },
    {
      id: 2,
      name: "Vania Frederica",
      role: "Mentor Data Analyst",
      experience: "Statistika Institut Teknologi Sepuluh Nopember",
      skills:
        "SQL, Power BI, Tableau, Advanced Excel, Google Looker Studio, Data Storytelling, Exploratory Data Analysis (EDA)",
      image: "/assets/mentor/vania.png",
    },
    {
      id: 3,
      name: "Muhamad Ali",
      role: "Mentor AI Engineer",
      experience: "S2 Data Science for Business Utel University",
      skills:
        "Deep Learning, PyTorch, TensorFlow, Computer Vision, NLP, MLOps, Cloud Computing, LLM",
      image: "/assets/mentor/ali.png",
    },
    {
      id: 4,
      name: "Mochamad Dimas Putra Hermawan",
      role: "Mentor Machine Learning Engineer",
      experience: "Teknologi Informasi Universitas Brawijaya",
      skills:
        "Python, Machine Learning Model, Docker, Kubernetes, MLOps Pipeline, Model Deployment, CI/CD for ML",
      image: "/assets/mentor/dimas.png",
    },
    {
      id: 5,
      name: "Verren Angelina Saputra",
      role: "Mentor AI Engineer",
      experience: "Teknik Informatika Binus University",
      skills:
        "Python, TensorFlow, PyTorch, OpenCV, Deep Learning, Computer Vision, Natural Language Processing (NLP), LLM",
      image: "/assets/mentor/verren.png",
    },
    {
      id: 6,
      name: "Muchammad Anang Setianto",
      role: "Mentor Data Engineer",
      experience: "Sistem Informasi Binus University",
      skills:
        "Apache Airflow, Spark, Hadoop, PostgreSQL, BigQuery, Snowflake, Data Warehousing, ETL/ELT Pipeline, Database Schema Design",
      image: "/assets/mentor/anang.png",
    },
  ];

  return (
    <section className="pb-8 md:pb-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
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
                    <div className="relative h-64 sm:h-72 md:h-80 bg-white flex items-center justify-center">
                      <Image
                        src={mentor.image}
                        alt={mentor.name}
                        width={400}
                        height={310}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                        {mentor.name}
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-3 text-base text-gray-700">
                          <Briefcase className="w-5 h-5" />
                          <span>{mentor.role}</span>
                        </div>
                        <div className="flex items-center gap-3 text-base text-gray-700">
                          <Calendar className="w-5 h-5" />
                          <span>{mentor.experience}</span>
                        </div>
                        <div className="flex items-start gap-3 text-base text-gray-700">
                          <Code className="w-5 h-5 shrink-0 mt-1" />
                          <span className="leading-relaxed break-words">
                            {mentor.skills}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push("/mentor")}
                        className="text-[#0CA678] font-semibold text-base hover:underline hover:cursor-pointer"
                      >
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
