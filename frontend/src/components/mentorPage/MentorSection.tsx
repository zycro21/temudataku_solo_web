/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Briefcase, Calendar, Code, Linkedin } from "lucide-react";
import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { describe } from "node:test";

// Bagi mentor ke dalam grup isi 6
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const MentorSection = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const [selectedMentor, setSelectedMentor] = React.useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const mentors = [
    {
      id: 1,
      name: "Jesselyn Mu",
      role: "Mentor Data Scientist",
      experience: "Teknik Informatika UPNV Jakarta",
      skills:
        "Python, SQL, Machine Learning, Statistical Analysis, Data Visualization (Tableau/Power BI), Predictive Modeling, Big Data Analytics, Deep Learning",
      linkedin: "https://www.linkedin.com/in/jesselyn-mu/",
      biography:
        "Jesselyn adalah praktisi Data Science dengan pengalaman mengerjakan berbagai project machine learning dan analytics di industri. Ia fokus pada implementasi model yang scalable dan business-oriented.",
      image: "/assets/mentor/jessely.png",
    },
    {
      id: 2,
      name: "Vania Frederica",
      role: "Mentor Data Analyst",
      experience: "Statistika Institut Teknologi Sepuluh Nopember",
      skills:
        "SQL, Power BI, Tableau, Advanced Excel, Google Looker Studio, Data Storytelling, Exploratory Data Analysis (EDA)",
      linkedin: "https://www.linkedin.com/in/vania-frederica/",
      biography:
        "Vania memiliki spesialisasi dalam data visualization dan storytelling. Ia membantu mentee memahami bagaimana mengubah data mentah menjadi insight yang actionable.",
      image: "/assets/mentor/vania.png",
    },
    {
      id: 3,
      name: "Muhamad Ali",
      role: "Mentor AI Engineer",
      experience: "S2 Data Science for Business Utel University",
      skills:
        "Deep Learning, PyTorch, TensorFlow, Computer Vision, NLP, MLOps, Cloud Computing, LLM",
      linkedin: "https://www.linkedin.com/in/ngodingyo/",
      biography:
        "Ali fokus pada deep learning dan AI production system. Ia berpengalaman dalam deployment model dan pengembangan solusi AI berbasis cloud.",
      image: "/assets/mentor/ali.png",
    },
    {
      id: 4,
      name: "Mochamad Dimas Putra Hermawan",
      role: "Mentor Machine Learning Engineer",
      experience: "Teknologi Informasi Universitas Brawijaya",
      skills:
        "Python, Machine Learning Model, Docker, Kubernetes, MLOps Pipeline, Model Deployment, CI/CD for ML",
      linkedin: "https://www.linkedin.com/in/mochamaddimasputrahermawan/",
      biography:
        "Dimas berpengalaman membangun ML pipeline end-to-end dari experimentation hingga deployment menggunakan best practice MLOps.",
      image: "/assets/mentor/dimas.png",
    },
    {
      id: 5,
      name: "Verren Angelina Saputra",
      role: "Mentor AI Engineer",
      experience: "Teknik Informatika Binus University",
      skills:
        "Python, TensorFlow, PyTorch, OpenCV, Deep Learning, Computer Vision, Natural Language Processing (NLP), LLM",
      linkedin: "https://www.linkedin.com/in/verrenangelinasaputra/",
      biography:
        "Verren memiliki spesialisasi di Computer Vision dan NLP. Ia aktif mengembangkan solusi AI berbasis deep learning.",
      image: "/assets/mentor/verren.png",
    },
    {
      id: 6,
      name: "Muchammad Anang Setianto",
      role: "Mentor Data Engineer",
      experience: "Sistem Informasi Binus University",
      skills:
        "Apache Airflow, Spark, Hadoop, PostgreSQL, BigQuery, Snowflake, Data Warehousing, ETL/ELT Pipeline, Database Schema Design",
      linkedin: "https://www.linkedin.com/in/masetianto/",
      biography:
        "Anang adalah Data Engineer dengan pengalaman membangun data pipeline skala besar dan arsitektur data warehouse modern.",
      image: "/assets/mentor/anang.png",
    },
  ];

  const mentorGroups = chunkArray(mentors, 6);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <section id="mentorSection" className="py-10 md:py-16">
      <div className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm font-semibold text-[#243A77] mb-2">Mentor</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Perkenalkan Mentor-Mentor
              <br />
              Berpengalaman Kami
            </h2>
          </div>
        </div>

        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            loop: false,
          }}
        >
          <CarouselContent>
            {mentorGroups.map((group, groupIndex) => (
              <CarouselItem key={groupIndex}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-5">
                  {group.map((mentor) => (
                    <div
                      key={mentor.id}
                      className="
    bg-white rounded-2xl 
    border border-gray-200 
    overflow-hidden h-full
    transition-all duration-300
    hover:-translate-y-2
    hover:shadow-2xl
    hover:border-emerald-300
    group
  "
                    >
                      {/* IMAGE SECTION */}
                      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                        {/* Decorative Soft Circle */}
                        <div className="absolute w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition duration-500"></div>

                        <Image
                          src={mentor.image}
                          alt={mentor.name}
                          width={500}
                          height={500}
                          className="
      relative z-10 
      max-h-[85%] 
      w-auto 
      object-contain
    "
                        />
                      </div>

                      {/* ROLE BADGE (Floating Below Image) */}
                      <div className="flex justify-center">
                        <div className="mt-4 bg-white px-5 py-2 rounded-full text-xs font-semibold text-emerald-600 shadow-md border border-gray-200">
                          {mentor.role}
                        </div>
                      </div>

                      {/* CONTENT SECTION */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 leading-snug mb-1">
                          {mentor.name}
                        </h3>

                        <p className="text-sm text-gray-500 mb-4">
                          {mentor.experience}
                        </p>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-start gap-3 text-sm text-gray-700">
                            <Code className="w-4 h-4 shrink-0 mt-1 text-emerald-500" />
                            <span className="leading-relaxed line-clamp-3">
                              {mentor.skills}
                            </span>
                          </div>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              onClick={() => {
                                setSelectedMentor(mentor);
                                setIsDialogOpen(true);
                              }}
                              className="text-[#0CA678] font-semibold text-base hover:underline hover:cursor-pointer"
                            >
                              Lihat Profil Lengkap
                            </button>
                          </DialogTrigger>
                          <DialogContent
                            className="max-w-lg"
                            onPointerDownOutside={(e) => e.preventDefault()}
                          >
                            <DialogHeader>
                              <VisuallyHidden>
                                <DialogTitle>
                                  {selectedMentor?.name}
                                </DialogTitle>
                              </VisuallyHidden>
                              <DialogDescription asChild>
                                <div className="mt-4">
                                  {/* Header Section */}
                                  <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 mb-6 text-white text-center">
                                    <div className="flex justify-center mb-4">
                                      <Image
                                        width={120}
                                        height={120}
                                        src={selectedMentor?.image}
                                        alt={selectedMentor?.name}
                                        className="rounded-full border-4 border-white shadow-lg object-contain bg-white"
                                      />
                                    </div>
                                    <h3 className="text-2xl font-bold">
                                      {selectedMentor?.name}
                                    </h3>
                                    <p className="text-base opacity-90">
                                      {selectedMentor?.role}
                                    </p>
                                  </div>

                                  {/* Detail Section */}
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-base text-gray-700">
                                      <Calendar className="w-5 h-5 text-emerald-500" />
                                      <span>{selectedMentor?.experience}</span>
                                    </div>

                                    <div className="flex items-start gap-3 text-base text-gray-700">
                                      <Code className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                                      <span className="leading-relaxed break-words">
                                        {selectedMentor?.skills}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-base text-gray-700">
                                      <Linkedin className="w-5 h-5 text-emerald-500" />
                                      <a
                                        href={selectedMentor?.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 hover:underline break-all"
                                      >
                                        Linkedin
                                      </a>
                                    </div>

                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                                      <p className="text-base font-semibold mb-2">
                                        Biografi
                                      </p>
                                      <p className="text-base text-gray-700 leading-relaxed">
                                        {selectedMentor?.biography}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="hidden md:flex gap-2 absolute -top-10 right-20 z-10">
            <CarouselPrevious className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 shadow-md w-10 h-10" />
            <CarouselNext className="bg-[#0CA678] hover:bg-[#08916C] text-white shadow-md w-10 h-10" />
          </div>
        </Carousel>

        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index + 1 === current
                  ? "bg-emerald-500"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorSection;
