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
      image: "/assets/mentor/10.png",
    },
    {
      id: 2,
      name: "Vania Frederica",
      role: "Mentor Data Analyst",
      experience: "Statistika Institut Teknologi Sepuluh Nopember",
      skills:
        "SQL, Power BI, Tableau, Advanced Excel, Google Looker Studio, Data Storytelling, Exploratory Data Analysis (EDA)",
      image: "/assets/mentor/4.png",
    },
    {
      id: 3,
      name: "Muhamad Ali",
      role: "Mentor AI/ML Engineer",
      experience: "S2 Data Science for Business Utel University",
      skills:
        "Deep Learning, PyTorch, TensorFlow, Computer Vision, NLP, MLOps, Cloud Computing, LLM",
      image: "/assets/mentor/3.png",
    },
    {
      id: 4,
      name: "Mochamad Dimas Putra Hermawan",
      role: "Mentor AI/ML Engineer",
      experience: "Teknologi Informasi Universitas Brawijaya",
      skills:
        "Python, Machine Learning Model, Docker, Kubernetes, MLOps Pipeline, Model Deployment, CI/CD for ML",
      image: "/assets/mentor/6.png",
    },
    {
      id: 5,
      name: "Verren Angelina Saputra",
      role: "Mentor AI/ML Engineer",
      experience: "Teknik Informatika Binus University",
      skills:
        "Python, TensorFlow, PyTorch, OpenCV, Deep Learning, Computer Vision, Natural Language Processing (NLP), LLM",
      image: "/assets/mentor/9.png",
    },
    {
      id: 6,
      name: "Muchammad Anang Setianto",
      role: "Mentor Data Engineer",
      experience: "Sistem Informasi Binus University",
      skills:
        "Apache Airflow, Spark, Hadoop, PostgreSQL, BigQuery, Snowflake, Data Warehousing, ETL/ELT Pipeline, Database Schema Design",
      image: "/assets/mentor/2.png",
    },
    {
      id: 7,
      name: "Jasman",
      role: "Mentor AI/ML Engineer",
      experience: "Teknik Elektro & Listrik Universitas Islam Indonesia",
      skills:
        "Python, Tensorflow, Pytorch, Scikit-Learn, Streamlit, LangGraph, Paramiko, PyQt, Git, SSH, Cloud Services",
      image: "/assets/mentor/5.png",
    },
    {
      id: 8,
      name: "Yogi Maulana",
      role: "Mentor Analytics Engineer",
      experience: "Teknologi Informasi Universitas Mercu Buana Yogyakarta",
      skills:
        "SQL, Python, dbt, Metabase, Looker Studio",
      image: "/assets/mentor/8.png",
    },
    {
      id: 9,
      name: "Akmal Fauzan",
      role: "Mentor Data Analyst",
      experience: "Statistik Universitas Islam Indonesia",
      skills:
        "Python (Pandas, NumPy, Matplotlib), SQL (PostgreSQL, MySQL, Oracle), Apache Airflow, Power BI, Qlik Sense, Tableau, Looker Studio, Excel (Advanced, VBA), RStudio",
      image: "/assets/mentor/7.png",
    },
    {
      id: 10,
      name: "Miftahul Salam",
      role: "Mentor Data Engineer",
      experience: "Teknik Industri",
      skills:
        "Python, R, SQL, Apache (Spark, Airflow, Kafka), dbt, Google BigQuery, GCP, Cloudera, Docker, Qlik Replikate",
      image: "/assets/mentor/1.png",
    },
  ];

  return (
    <section className="pb-6 md:pb-12">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-5 lg:px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm font-semibold text-[#243A77] mb-2">Mentor</p>

            <h2 className="text-[26px] md:text-[30px] font-bold text-gray-900 leading-snug">
              Perkenalkan Mentor-Mentor
              <br />
              Berpengalaman Kami
            </h2>
          </div>

          <div className="hidden md:flex gap-2"></div>
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
            <CarouselContent className="py-2 md:py-4 -ml-2 md:-ml-3 px-0">
              {mentors.map((mentor) => (
                <CarouselItem
                  key={mentor.id}
                  className="pl-2 md:pl-3 basis-[85%] sm:basis-[65%] md:basis-1/2 lg:basis-1/3"
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-none h-full">
                    {/* IMAGE */}
                    <div className="relative h-52 sm:h-60 md:h-64 bg-white flex items-center justify-center">
                      <Image
                        src={mentor.image}
                        alt={mentor.name}
                        width={360}
                        height={260}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* CONTENT */}
                    <div className="p-4">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                        {mentor.name}
                      </h3>

                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Briefcase className="w-4 h-4" />
                          <span>{mentor.role}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4" />
                          <span>{mentor.experience}</span>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <Code className="w-4 h-4 shrink-0 mt-0.5" />
                          <span className="leading-relaxed break-words">
                            {mentor.skills}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push("/mentor")}
                        className="text-[#0CA678] font-medium text-sm hover:underline hover:cursor-pointer"
                      >
                        Lihat Profil Lengkap
                      </button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* NAV BUTTON */}
            <div className="hidden md:flex gap-1.5 absolute -top-8 right-12 z-10">
              <CarouselPrevious className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 shadow-sm w-9 h-9" />
              <CarouselNext className="bg-[#0CA678] hover:bg-[#08916C] text-white shadow-sm w-9 h-9" />
            </div>
          </Carousel>

          {/* DOTS */}
          <div className="flex justify-center mt-3 md:mt-5 space-x-2">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-colors ${
                  index + 1 === current
                    ? "bg-emerald-500"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorSection;
