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

  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

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
      image: "/assets/mentor/10.png",
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
      image: "/assets/mentor/4.png",
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
      image: "/assets/mentor/3.png",
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
      image: "/assets/mentor/6.png",
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
      image: "/assets/mentor/9.png",
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
      image: "/assets/mentor/2.png",
    },
    {
      id: 7,
      name: "Jasman",
      role: "Mentor AI/ML Engineer",
      experience: "Teknik Elektro & Listrik Universitas Islam Indonesia",
      skills:
        "Python, Tensorflow, Pytorch, Scikit-Learn, Streamlit, LangGraph, Paramiko, PyQt, Git, SSH, Cloud Services",
      linkedin: "https://www.linkedin.com/in/jasman-jasman-74ab21186/",
      biography:
        "Jasman merupakan AI Engineer dan Machine Learning Engineer dengan pengalaman industri dalam pengembangan solusi berbasis data dan AI. Berpengalaman membangun pipeline machine learning, sistem NLP, serta automasi berbasis Python. Terlibat dalam proyek lintas regional dan pengembangan produk teknologi, dengan fokus pada efisiensi, kualitas, serta implementasi solusi siap pakai di lingkungan produksi.",
      image: "/assets/mentor/5.png",
    },
    {
      id: 8,
      name: "Yogi Maulana",
      role: "Mentor Analytics Engineer",
      experience: "Teknologi Informasi Universitas Mercu Buana Yogyakarta",
      skills: "SQL, Python, dbt, Metabase, Looker Studio",
      linkedin: "https://www.linkedin.com/in/maulanayogi/",
      biography:
        "Yogi Maulana adalah Analytics Engineer dengan pengalaman lebih dari tujuh tahun dalam analitik data dan business intelligence. Berpengalaman membangun model data, dashboard, serta mendukung pengambilan keputusan lintas fungsi. Memiliki fokus pada pengembangan infrastruktur data yang efisien, mudah diakses, serta mendorong pemanfaatan data untuk menghasilkan insight bisnis yang berdampak.",
      image: "/assets/mentor/8.png",
    },
    {
      id: 9,
      name: "Akmal Fauzan",
      role: "Mentor Data Analyst",
      experience: "Statistik Universitas Islam Indonesia",
      skills:
        "Python (Pandas, NumPy, Matplotlib), SQL (PostgreSQL, MySQL, Oracle), Apache Airflow, Power BI, Qlik Sense, Tableau, Looker Studio, Excel (Advanced, VBA), RStudio",
      linkedin: "https://www.linkedin.com/in/akmal-fauzan-/",
      biography:
        "Akmal Fauzan adalah Data Analyst dengan pengalaman lebih dari tiga tahun di industri pertambangan, kelapa sawit, dan logistik. Berpengalaman dalam business intelligence, data engineering, serta analisis kinerja operasional. Terampil mengembangkan pipeline data, automasi ETL, dan pelaporan untuk mendukung efisiensi, kontrol biaya, serta pengambilan keputusan berbasis data.",
      image: "/assets/mentor/7.png",
    },
    {
      id: 10,
      name: "Miftahul Salam",
      role: "Mentor Data Engineer",
      experience: "Teknik Industri",
      skills:
        "Python, R, SQL, Apache (Spark, Airflow, Kafka), dbt, Google BigQuery, GCP, Cloudera, Docker, Qlik Replikate",
      linkedin: "https://www.linkedin.com/in/miftus/",
      biography:
        "Miftahus Salam adalah Data Specialist dan Data Engineer dengan pengalaman dalam perencanaan proyek serta konsultasi data. Berpengalaman membangun end-to-end data pipeline untuk mendukung reporting dan sistem pengambilan keputusan. Memiliki keahlian dalam analitik data dan pengolahan data skala besar untuk menghasilkan insight bisnis yang relevan dan terukur.",
      image: "/assets/mentor/1.png",
    },
  ];

  const mentorGroups = chunkArray(mentors, 6);

  React.useEffect(() => {
    if (!api) return;

    const update = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };

    update();
    api.on("select", update);
  }, [api]);

  return (
    <section id="mentorSection" className="py-8 md:py-12">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-5 lg:px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-xs font-semibold text-[#243A77] mb-1.5">
              Mentor
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
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
            containScroll: "keepSnaps",
            dragFree: false,
          }}
        >
          <CarouselContent>
            {mentorGroups.map((group, groupIndex) => (
              <CarouselItem key={groupIndex}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                  {group.map((mentor) => (
                    <div
                      key={mentor.id}
                      className="
                    bg-white rounded-xl
                    border border-gray-200
                    overflow-hidden h-full
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                    hover:border-emerald-300
                    group
                  "
                    >
                      {/* IMAGE */}
                      <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                        <div className="absolute w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition duration-500"></div>

                        <Image
                          src={mentor.image}
                          alt={mentor.name}
                          width={400}
                          height={400}
                          className="relative z-10 max-h-[85%] w-auto object-contain"
                        />
                      </div>

                      {/* ROLE BADGE */}
                      <div className="flex justify-center">
                        <div className="mt-4 bg-white px-4.5 py-2 rounded-full text-xs font-semibold text-emerald-600 shadow-sm border">
                          {mentor.role}
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {mentor.name}
                        </h3>

                        <p className="text-xs text-gray-500 mb-3">
                          {mentor.experience}
                        </p>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-start gap-2 text-xs text-gray-700">
                            <Code className="w-3.5 h-3.5 shrink-0 mt-1 text-emerald-500" />
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
                              className="text-[#0CA678] font-semibold text-sm hover:underline"
                            >
                              Lihat Profil Lengkap
                            </button>
                          </DialogTrigger>

                          <DialogContent
                            className="max-w-md"
                            onPointerDownOutside={(e) => e.preventDefault()}
                          >
                            <DialogHeader>
                              <VisuallyHidden>
                                <DialogTitle>
                                  {selectedMentor?.name}
                                </DialogTitle>
                              </VisuallyHidden>

                              <DialogDescription asChild>
                                <div className="mt-3">
                                  {/* HEADER */}
                                  <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-4 mb-4 text-white text-center">
                                    <div className="flex justify-center mb-3">
                                      <Image
                                        width={90}
                                        height={90}
                                        src={selectedMentor?.image}
                                        alt={selectedMentor?.name}
                                        className="rounded-full border-2 border-white shadow object-contain bg-white"
                                      />
                                    </div>

                                    <h3 className="text-lg font-bold">
                                      {selectedMentor?.name}
                                    </h3>
                                    <p className="text-sm opacity-90">
                                      {selectedMentor?.role}
                                    </p>
                                  </div>

                                  {/* DETAIL */}
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                      <Calendar className="w-4 h-4 text-emerald-500" />
                                      <span>{selectedMentor?.experience}</span>
                                    </div>

                                    <div className="flex items-start gap-2 text-sm text-gray-700">
                                      <Code className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                                      <span className="leading-relaxed break-words">
                                        {selectedMentor?.skills}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                      <Linkedin className="w-4 h-4 text-emerald-500" />
                                      <a
                                        href={selectedMentor?.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 hover:underline break-all"
                                      >
                                        Linkedin
                                      </a>
                                    </div>

                                    <div className="mt-4 p-3 bg-gray-50 rounded-md border">
                                      <p className="text-sm font-semibold mb-1">
                                        Biografi
                                      </p>
                                      <p className="text-sm text-gray-700 leading-relaxed">
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

          {/* NAV */}
          <div className="hidden md:flex gap-1.5 absolute -top-8 right-16 z-10">
            <CarouselPrevious
              className={`
      border border-gray-300 shadow-sm w-8 h-8
      ${
        canPrev
          ? "bg-white hover:bg-gray-100 text-gray-800 cursor-pointer"
          : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
      }
    `}
            />

            <CarouselNext
              className={`
      shadow-sm w-8 h-8
      ${
        canNext
          ? "bg-[#0CA678] hover:bg-[#08916C] text-white cursor-pointer"
          : "bg-gray-300 text-white cursor-not-allowed opacity-60"
      }
    `}
            />
          </div>
        </Carousel>

        {/* DOTS */}
        <div className="flex justify-center mt-4 space-x-1.5">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
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
