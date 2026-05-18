"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  BookCheck,
  ChartNoAxesCombined,
  Flag,
  UserRound,
  BookOpen,
  Clock,
  Users,
  Award,
  Laptop,
  Server,
  Cloud,
  Briefcase,
  FileText,
  GraduationCap,
  Presentation,
  MessageCircle,
  Network,
  Code,
  Database,
  BarChart,
  Lightbulb,
  Shield,
  Star,
  Rocket,
  Globe,
  Target,
  UserCheck,
  Video,
  Headphones,
  Calendar,
  CheckCircle,
  Gift,
  Layers,
  Cpu,
} from "lucide-react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

export default function ProgramDetailSection({
  data,
  onRegister,
  isLoading,
  alreadyPurchased,
  checkingPurchase,
}: {
  data: any;
  onRegister: () => void;
  isLoading: boolean;
  alreadyPurchased: boolean;
  checkingPurchase: boolean;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [projectApi, setProjectApi] = useState<CarouselApi>();
  const [projectCurrent, setProjectCurrent] = useState(0);
  const [projectCount, setProjectCount] = useState(0);

  const programItems = [
    "Deskripsi Bootcamp",
    "Benefit Bootcamp",
    "Mekanisme Bootcamp",
    "Modul dan Silabus Bootcamp",
    "Tools yang Digunakan",
    "Peserta Bootcamp",
    "Jadwal Bootcamp",
    "Portofolio Alumni",
    "Testimoni Alumni",
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const headerOffset = 100; // sesuaikan dengan tinggi navbar
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = window.pageYOffset + elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    api.on("reInit", () => {
      setCount(api.scrollSnapList().length);
    });
  }, [api]);

  useEffect(() => {
    if (!projectApi) {
      return;
    }

    setProjectCount(projectApi.scrollSnapList().length);
    setProjectCurrent(projectApi.selectedScrollSnap() + 1);

    projectApi.on("select", () => {
      setProjectCurrent(projectApi.selectedScrollSnap() + 1);
    });
  }, [projectApi]);

  const formatDescription = (text: string) => {
    if (!text) return "";

    // Split berdasarkan newline
    const paragraphs = text.split("\n");

    return paragraphs
      .map((para, index) => {
        let formatted = para;

        // Bold **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // Underline _text_
        formatted = formatted.replace(/_(.*?)_/g, "<u>$1</u>");

        // Italic *text*
        formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

        return `<p class="${
          index === 0 ? "" : "mt-2"
        } text-gray-700 leading-relaxed">${formatted}</p>`;
      })
      .join("");
  };

  const formatText = (text: string) => {
    if (!text) return "";

    // Bold **text**
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Underline _text_
    text = text.replace(/_(.*?)_/g, "<u>$1</u>");

    // Italic *text*
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

    return text;
  };

  const sectionsArray: {
    id: string;
    type: string;
    title: string;
    content: any;
    order: number;
  }[] = Array.isArray(data?.sections) ? data.sections : [];

  const benefitsArray = sectionsArray
    .filter((s) => s.type === "BENEFIT")
    .map((s) => ({
      title: s.title,
      description: (s.content as any)?.description ?? "",
    }));

  const mechanismArray = sectionsArray
    .filter((s) => s.type === "MECHANISM")
    .map((s) => ({
      title: s.title,
      description: (s.content as any)?.description ?? "",
    }));

  const syllabusArray = sectionsArray
    .filter((s) => s.type === "SYLLABUS")
    .map((s) => ({
      title: s.title,
      description: (s.content as any)?.description ?? "",
    }));

  const targetAudienceArray = sectionsArray
    .filter((s) => s.type === "TARGET")
    .map((s) => ({
      title: s.title,
      description: (s.content as any)?.description ?? "",
    }));

  const toolsArray: { id: string; name: string }[] = Array.isArray(data?.tools)
    ? data.tools
    : [];

  const schedulesArray: { id: string; date: string | Date }[] = Array.isArray(
    data?.schedules,
  )
    ? data.schedules
    : [];

  const alumniPortfolioArray = Array.isArray(data?.portfolios)
    ? data.portfolios
    : [];

  const totalProjects = alumniPortfolioArray.length;
  const canScroll = totalProjects > 2;

  const testimonialsArray = Array.isArray(data?.testimonials)
    ? data.testimonials
    : [];

  const totalTestimonials = testimonialsArray.length;
  const canScrollTestimonial = totalTestimonials > 2;

  const iconMap: { keywords: string[]; icons: any[] }[] = [
    {
      keywords: ["belajar", "materi", "modul", "kelas"],
      icons: [BookOpen, GraduationCap],
    },
    {
      keywords: ["waktu", "durasi", "jam"],
      icons: [Clock, Calendar],
    },
    {
      keywords: ["mentor", "mentoring", "konsultasi"],
      icons: [Users, MessageCircle, UserCheck],
    },
    {
      keywords: ["sertifikat", "certificate"],
      icons: [Award, CheckCircle],
    },
    {
      keywords: ["cloud", "server", "aws"],
      icons: [Cloud, Server],
    },
    {
      keywords: ["karir", "career", "cv", "interview"],
      icons: [Briefcase, FileText],
    },
    {
      keywords: ["network", "komunitas", "relasi"],
      icons: [Network, Globe],
    },
    {
      keywords: ["project", "portfolio"],
      icons: [Layers, Rocket],
    },
    {
      keywords: ["data", "analysis"],
      icons: [Database, BarChart, ChartNoAxesCombined],
    },
    {
      keywords: ["tools", "software", "coding"],
      icons: [Laptop, Code, Cpu],
    },
    {
      keywords: ["support", "bantuan"],
      icons: [Headphones, Shield],
    },
    {
      keywords: ["live", "rekaman", "video"],
      icons: [Video, Presentation],
    },
    {
      keywords: ["bonus", "gratis"],
      icons: [Gift, Star],
    },
    {
      keywords: ["ide", "insight"],
      icons: [Lightbulb, Target],
    },
  ];

  const defaultIcons = [BookOpen, Star, Rocket, Globe, Award];

  const getRandomIcon = (icons: any[]) =>
    icons[Math.floor(Math.random() * icons.length)];

  const getIconForBenefit = (text: string) => {
    const lowerText = text.toLowerCase();

    for (const category of iconMap) {
      if (category.keywords.some((keyword) => lowerText.includes(keyword))) {
        return getRandomIcon(category.icons);
      }
    }

    // Kalau tidak ada keyword match → random default
    return getRandomIcon(defaultIcons);
  };

  const getIconForSession = (text: string, index: number) => {
    const lowerText = text.toLowerCase();

    for (const category of iconMap) {
      if (category.keywords.some((keyword) => lowerText.includes(keyword))) {
        return category.icons[index % category.icons.length];
      }
    }

    return defaultIcons[index % defaultIcons.length];
  };

  const formatRichText = (text: string) => {
    if (!text) return "";

    const paragraphs = text.split("\n");

    return paragraphs
      .map((para, index) => {
        let formatted = para;

        formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        formatted = formatted.replace(/_(.*?)_/g, "<u>$1</u>");
        formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

        return `<p class="${index === 0 ? "" : "mt-2"}">${formatted}</p>`;
      })
      .join("");
  };

  const formatScheduleDisplay = (
    schedules: { id: string; date: string | Date }[],
  ): string => {
    if (!schedules || schedules.length === 0) return "Jadwal belum tersedia";

    const HARI = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const BULAN = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const sorted = [...schedules]
      .map((s) => new Date(s.date))
      .sort((a, b) => a.getTime() - b.getTime());

    if (sorted.length === 1) {
      const d = sorted[0];
      return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
    }

    if (sorted.length === 2) {
      const [a, b] = sorted;
      if (
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear()
      ) {
        // Bulan & tahun sama
        return `(${HARI[a.getDay()]}, ${a.getDate()}) &amp; (${HARI[b.getDay()]}, ${b.getDate()}) - ${BULAN[a.getMonth()]} ${a.getFullYear()}`;
      } else if (a.getFullYear() === b.getFullYear()) {
        // Bulan beda, tahun sama
        return `(${HARI[a.getDay()]}, ${a.getDate()} - ${BULAN[a.getMonth()]}) &amp; (${HARI[b.getDay()]}, ${b.getDate()} - ${BULAN[b.getMonth()]}) - ${a.getFullYear()}`;
      } else {
        // Tahun beda
        return `(${HARI[a.getDay()]}, ${a.getDate()} - ${BULAN[a.getMonth()]} ${a.getFullYear()}) &amp; (${HARI[b.getDay()]}, ${b.getDate()} - ${BULAN[b.getMonth()]} ${b.getFullYear()})`;
      }
    }

    // Lebih dari 2 tanggal → tampil tanggal pertama SAMPAI tanggal terakhir
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    return (
      `${HARI[first.getDay()]}, ${first.getDate()} ${BULAN[first.getMonth()]} ${first.getFullYear()} ` +
      `<strong>-</strong> ` +
      `${HARI[last.getDay()]}, ${last.getDate()} ${BULAN[last.getMonth()]} ${last.getFullYear()}` +
      ` (Detailnya akan disampaikan lebih lanjut)`
    );
  };

  const normalizeToolName = (tool: string) =>
    tool
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9-]/g, "");

  const getToolIcon = (tool: string) => {
    const toolPaths: Record<string, string> = {
      excel: "/assets/toolIcons/excel.svg",
      microsoftexcel: "/assets/toolIcons/excel.svg",
      python: "/assets/toolIcons/python.svg",
      powerbi: "/assets/toolIcons/powerbi.svg",
      mysql: "/assets/toolIcons/mysql.svg",
      sql: "/assets/toolIcons/mysql.svg",
      postgresql: "/assets/toolIcons/postgresql.svg",
      pytorch: "/assets/toolIcons/pytorch.svg",
      "scikit-learn": "/assets/toolIcons/scikitlearn.svg",
      tensorflow: "/assets/toolIcons/tensorflow.svg",
      docker: "/assets/toolIcons/docker.svg",
      kubernetes: "/assets/toolIcons/kubernetes.svg",
      aws: "/assets/toolIcons/aws.svg",
      mlflow: "/assets/toolIcons/mlflow.svg",
      jupyter: "/assets/toolIcons/jupyter.svg",
      jupyternotebook: "/assets/toolIcons/jupyter.svg",
      statistics: "/assets/toolIcons/statistic.svg",
      tableau: "/assets/toolIcons/tableau.svg",
      googlelookerstudio: "/assets/toolIcons/looker.svg",
      looker: "/assets/toolIcons/looker.svg",
      opencv: "/assets/toolIcons/opencv.svg",
      googlecolab: "/assets/toolIcons/googlecolab.svg",
      keras: "/assets/toolIcons/keras.svg",
      huggingface: "/assets/toolIcons/hf.svg",
      metabase: "/assets/toolIcons/metabase.svg",
      superset: "/assets/toolIcons/superset.svg",
      spark: "/assets/toolIcons/spark.svg",
      apachespark: "/assets/toolIcons/spark.svg",
      hadoop: "/assets/toolIcons/hadoop.svg",
      airflow: "/assets/toolIcons/airflow.svg",
      apacheairflow: "/assets/toolIcons/airflow.svg",
      dbt: "/assets/toolIcons/dbt.svg",
      pandas: "/assets/toolIcons/pandas.svg",
      numpy: "/assets/toolIcons/numpy.svg",
      fastapi: "/assets/toolIcons/fastapi.svg",
      streamlit: "/assets/toolIcons/streamlit.svg",
      wandb: "/assets/toolIcons/wandb.svg",
      weightsandbiases: "/assets/toolIcons/wandb.svg",
      gcp: "/assets/toolIcons/gcp.svg",
      googlecloud: "/assets/toolIcons/gcp.svg",
      bigquery: "/assets/toolIcons/bigquery.svg",
      snowflake: "/assets/toolIcons/snowflake.svg",
      mongodb: "/assets/toolIcons/mongodb.svg",
      r: "/assets/toolIcons/r.svg",
      rlanguage: "/assets/toolIcons/r.svg",
      git: "/assets/toolIcons/git.svg",
      github: "/assets/toolIcons/github.svg",
    };

    const normalized = normalizeToolName(tool);
    return toolPaths[normalized] || "/assets/toolIcons/default.svg";
  };

  const normalizeAudience = (text: string) =>
    text.toLowerCase().replace(/\s+/g, " ").trim();

  const getAudienceImage = (audience: string) => {
    const normalized = normalizeAudience(audience);

    const audienceMap: { keywords: string[]; image: string }[] = [
      {
        keywords: ["mahasiswa", "student", "fresh graduate", "freshgraduate"],
        image: "/assets/audience/student.svg",
      },
      {
        keywords: ["data analyst", "data analysis", "analyst"],
        image: "/assets/audience/data-analyst.jpg",
      },
      {
        keywords: ["data scientist", "machine learning", "ml engineer"],
        image: "/assets/audience/data-scientist.svg",
      },
      {
        keywords: ["software engineer", "developer", "programmer", "web"],
        image: "/assets/audience/developer.svg",
      },
      {
        keywords: ["career switch", "switch career", "career shifter"],
        image: "/assets/audience/career-switch.jpg",
      },
      {
        keywords: ["business", "entrepreneur", "owner", "bisnis"],
        image: "/assets/audience/business.svg",
      },
      {
        keywords: ["ui ux", "designer", "design", "ui", "ux"],
        image: "/assets/audience/designer.jpg",
      },
      {
        keywords: ["beginner", "pemula", "no experience"],
        image: "/assets/audience/beginner.svg",
      },
    ];

    for (const category of audienceMap) {
      if (category.keywords.some((keyword) => normalized.includes(keyword))) {
        return category.image;
      }
    }

    return "/assets/audience/student.svg";
  };

  const normalizeProject = (text: string) =>
    text.toLowerCase().replace(/\s+/g, " ").trim();

  const getProjectImage = (project: any) => {
    const combinedText = normalizeProject(
      `${project.title} ${project.description}`,
    );

    const projectMap: { keywords: string[]; image: string }[] = [
      {
        keywords: ["dashboard", "visualisasi", "power bi", "tableau"],
        image: "/assets/projects/dashboard.svg",
      },
      {
        keywords: ["machine learning", "ml", "model", "prediction"],
        image: "/assets/projects/machine-learning.jpg",
      },
      {
        keywords: ["web", "website", "frontend", "backend"],
        image: "/assets/projects/web.jpg",
      },
      {
        keywords: ["data analysis", "analisis data", "excel"],
        image: "/assets/projects/data-analysis.jpg",
      },
      {
        keywords: ["ai", "chatbot", "nlp"],
        image: "/assets/projects/ai.jpg",
      },
      {
        keywords: ["big data", "spark", "hadoop"],
        image: "/assets/projects/bigdata.jpg",
      },
    ];

    for (const category of projectMap) {
      if (category.keywords.some((keyword) => combinedText.includes(keyword))) {
        return category.image;
      }
    }

    return "/assets/projects/ai.jpg";
  };

  const avatarColors = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-indigo-500",
  ];

  const getAvatarColor = (index: number) =>
    avatarColors[index % avatarColors.length];

  return (
    <div className="max-w-[1175px] mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Isi Bootcampnya Apa Aja? Yuk Simak!
        </h2>
        <p className="text-gray-600 text-lg max-w-4xl mx-auto leading-relaxed">
          Di bootcamp ini, kamu akan langsung terjun ke praktik: memahami dasar
          analisis data, mengenal tools yang sering dipakai di industri, dan
          membangun proyek yang bisa kamu tunjukkan ke HR atau klien.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - Detail Program */}
        <div>
          <div className="bg-gray-50 rounded-sm p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Detail Program
            </h3>

            <div className="space-y-1">
              {programItems.map((item, index) => (
                <div key={index} className="border-b border-gray-200">
                  <button
                    onClick={() => scrollToSection(`section-${index + 1}`)}
                    className="w-full flex items-center gap-3 py-4 text-left 
           hover:bg-gray-100 transition-colors 
           cursor-pointer group"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 transition-transform group-hover:translate-x-1" />
                    <span className="text-gray-700 font-medium">
                      {index + 1}. {item}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            {/* Register Button */}
            <div className="mt-8">
              <Button
                onClick={onRegister}
                disabled={isLoading || alreadyPurchased || checkingPurchase}
                className={`
    font-semibold py-3 px-8 rounded-lg transition-colors w-full
    ${
      alreadyPurchased
        ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400 text-white"
        : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
    }
  `}
              >
                {checkingPurchase
                  ? "Memeriksa..."
                  : alreadyPurchased
                    ? "Sudah Dibeli"
                    : isLoading
                      ? "Memproses..."
                      : "Daftar Sekarang"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Two Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1 - Tentang Latihan Ini */}
          <div id="section-1">
            <div className="bg-blue-900 text-white p-6 rounded-sm">
              <div className="flex items-center gap-3">
                <ChevronRight className="w-5 h-5" />
                <h4 className="text-xl font-semibold">
                  1. Tentang Bootcamp Ini
                </h4>
              </div>
            </div>

            <div className="bg-white p-6">
              <div
                dangerouslySetInnerHTML={{
                  __html: formatDescription(data?.programAbout),
                }}
              />
            </div>
          </div>

          {/* Section 2 - Apa Aja yang Kamu Dapat */}
          <div id="section-2">
            <div className="bg-blue-900 text-white p-6 rounded-sm">
              <div className="flex items-center gap-3">
                <ChevronRight className="w-5 h-5" />
                <h4 className="text-xl font-semibold">
                  2. Apa Aja yang Kamu Dapat di Sini?
                </h4>
              </div>
            </div>

            <div className="bg-white p-6">
              <p className="text-gray-700 leading-relaxed mb-6">
                Berikut adalah rincian benefit dalam bentuk aset dan layanan
                pendukung yang disediakan untuk memastikan setiap peserta dapat
                mengikuti materi dengan optimal.
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefitsArray.length > 0 ? (
                  benefitsArray.map(
                    (
                      benefit: { title: string; description: string },
                      index: number,
                    ) => (
                      <div
                        key={index}
                        className="flex gap-4 bg-gray-50 rounded-sm p-6"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            {(() => {
                              const IconComponent = getIconForBenefit(
                                benefit.title + " " + benefit.description,
                              );
                              return (
                                <IconComponent className="w-7 h-7 text-brand-color-primary" />
                              );
                            })()}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">
                            {benefit.title}
                          </h5>

                          <p
                            className="text-gray-600 text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: formatText(benefit.description),
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <p className="text-gray-500 col-span-2">
                    Benefit belum tersedia
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3 - Gimana Bootcamp Ini Berjalan? */}
          <div id="section-3">
            <div className="bg-blue-900 text-white p-6 rounded-sm">
              <div className="flex items-center gap-3">
                <ChevronRight className="w-5 h-5" />
                <h4 className="text-xl font-semibold">
                  3. Gimana Bootcamp Ini Berjalan?
                </h4>
              </div>
            </div>

            <div className="bg-white p-6">
              <p className="text-gray-700 leading-relaxed mb-6">
                Berikut adalah gambaran mengenai sistem teknis dan operasional
                yang dijalankan selama masa pelatihan. Informasi ini ditujukan
                untuk memberikan pemahaman mengenai cara kerja ekosistem
                belajar.
              </p>

              {/* Tasks Section with Gray Background */}
              <div className="p-6 rounded-sm space-y-8">
                {mechanismArray.length > 0 ? (
                  mechanismArray.map(
                    (
                      item: { title: string; description: string },
                      index: number,
                    ) => (
                      <div
                        key={index}
                        className="flex gap-4 bg-gray-50 rounded-sm p-6"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                            {(() => {
                              const IconComponent = getIconForBenefit(
                                item.title + " " + item.description,
                              );
                              return (
                                <IconComponent className="w-7 h-7 text-brand-color-primary" />
                              );
                            })()}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 text-lg mb-2">
                            {item.title}
                          </h5>
                          <p
                            className="text-gray-600 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: formatText(item.description),
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <p className="text-gray-500">Mekanisme belum tersedia</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4 - Modul dan Silabus yang Akan Kamu Pelajari */}
          <div id="section-4">
            <div className="bg-blue-900 text-white p-6 rounded-sm">
              <div className="flex items-center gap-3">
                <ChevronRight className="w-5 h-5" />
                <h4 className="text-xl font-semibold">
                  4. Modul dan Silabus yang Akan Kamu Pelajari
                </h4>
              </div>
            </div>

            <div className="bg-white p-6">
              <p className="text-gray-700 leading-relaxed mb-6">
                Bagian ini memuat rincian materi dan urutan pembelajaran yang
                telah disusun secara sistematis. Anda dapat meninjau cakupan
                topik dari tingkat dasar hingga penerapan kompleks yang akan
                dibahas di setiap fasenya.
              </p>

              {/* Collapsible Items */}
              <div className="space-y-4">
                {syllabusArray.length > 0 ? (
                  <>
                    {syllabusArray.map(
                      (
                        item: { title: string; description: string },
                        index: number,
                      ) => {
                        const IconComponent = getIconForSession(
                          item.title + " " + item.description,
                          index,
                        );

                        return (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-sm p-6"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                <IconComponent className="w-5 h-5 text-brand-color-primary" />
                              </div>

                              <div>
                                <h5 className="font-semibold text-gray-900 text-lg">
                                  {item.title}
                                </h5>

                                <p
                                  className="text-gray-600 mt-1 leading-relaxed"
                                  dangerouslySetInnerHTML={{
                                    __html: formatText(item.description),
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">
                    Modul belum tersedia untuk bootcamp ini.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 5 - Peralatan Tempur Selama Belajar */}
          <div id="section-5">
            <div className="bg-blue-900 text-white p-6 rounded-sm">
              <div className="flex items-center gap-3">
                <ChevronRight className="w-5 h-5" />
                <h4 className="text-xl font-semibold">
                  5. Tools yang Digunakan Saat Belajar
                </h4>
              </div>
            </div>

            <div className="bg-white p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                Berikut adalah spesifikasi peralatan dan aplikasi yang akan
                dipelajari dan digunakan sepanjang program berlangsung. Daftar
                ini disusun berdasarkan standar teknologi yang relevan dengan
                kebutuhan industri saat ini untuk mendukung efektivitas belajar
                peserta.
              </p>

              <div className="flex flex-wrap items-center gap-6 mt-6">
                {toolsArray.length > 0 ? (
                  toolsArray.map(
                    (tool: { id: string; name: string }, index: number) => (
                      <div
                        key={tool.id ?? index}
                        className="relative group flex items-center justify-center"
                      >
                        <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                          <Image
                            src={getToolIcon(tool.name)}
                            alt={tool.name}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        </div>

                        {/* Tooltip */}
                        <div className="absolute -bottom-10 scale-0 group-hover:scale-100 transition-transform duration-200 bg-gray-900 text-white text-xs px-3 py-1 rounded-md whitespace-nowrap">
                          {tool.name}
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <p className="text-gray-500">Tools belum tersedia</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 6 - Latihan Ini Cocok untuk Siapa? */}
          <div id="section-6">
            <div className="bg-blue-900 text-white p-6 rounded-sm">
              <div className="flex items-center gap-3">
                <ChevronRight className="w-5 h-5" />
                <h4 className="text-xl font-semibold">
                  6. Bootcamp Ini Cocok untuk Siapa?
                </h4>
              </div>
            </div>

            <div className="bg-white p-6">
              <p className="text-gray-700 leading-relaxed mb-8">
                Bagian ini merinci kriteria dan profil peserta yang akan
                memperoleh manfaat maksimal dari kurikulum yang kami jalankan.
                Informasi ini mencakup latar belakang pendidikan, peran
                profesional, hingga minat spesifik yang relevan dengan materi
                pelatihan.
              </p>

              {/* Participant Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {targetAudienceArray.length > 0 ? (
                  targetAudienceArray.map(
                    (
                      audience: { title: string; description: string },
                      index: number,
                    ) => (
                      <div
                        key={index}
                        className="text-center bg-gray-50 rounded-xl p-6 
           transition-all duration-300 ease-out
           hover:-translate-y-2 
           hover:shadow-2xl 
           hover:bg-white
           group cursor-pointer"
                      >
                        <div className="w-32 h-32 mx-auto mb-4 rounded-xl overflow-hidden relative shadow-md group-hover:shadow-xl transition-all duration-300">
                          <Image
                            src={getAudienceImage(
                              audience.title + " " + audience.description,
                            )}
                            alt={audience.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                        </div>

                        <h5 className="font-bold text-gray-900 text-lg mb-2 transition-colors duration-300 group-hover:text-blue-900">
                          {audience.title}
                        </h5>

                        <p
                          className="text-gray-600 text-sm leading-relaxed transition-colors duration-300 group-hover:text-gray-700"
                          dangerouslySetInnerHTML={{
                            __html: formatText(audience.description),
                          }}
                        />
                      </div>
                    ),
                  )
                ) : (
                  <p className="text-gray-500 col-span-3">
                    Target audience belum tersedia
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 7 - Berapa Lama Waktu yang Dibutuhkan untuk Latihan Ini? */}
          <div id="section-7">
            <div className="bg-blue-900 text-white p-6 rounded-sm">
              <div className="flex items-center gap-3">
                <ChevronRight className="w-5 h-5" />
                <h4 className="text-xl font-semibold">
                  7. Belajarnya Kapan Aja, Sih?
                </h4>
              </div>
            </div>

            <div className="bg-white p-6">
              <div className="text-gray-700 leading-relaxed">
                Berikut adalah agenda operasional mengenai waktu pelaksanaan
                pelatihan yang perlu diperhatikan oleh setiap peserta untuk
                kelancaran koordinasi belajar:
                <div className="text-black p-6 rounded-lg shadow-xl border-l-4 border-emerald-400 my-6">
                  <p
                    className="leading-relaxed text-base font-medium"
                    dangerouslySetInnerHTML={{
                      __html: formatScheduleDisplay(schedulesArray),
                    }}
                  />
                </div>
                Seluruh pertemuan diatur dalam zona waktu yang sama yakni{" "}
                <b>WIB</b> untuk memudahkan sinkronisasi antara mentor dan
                peserta dari berbagai wilayah
              </div>
            </div>
          </div>

          {/* Section 8 - Intip Karya Alumni dari Bootcamp Ini */}
          <div id="section-8">
            <div className="bg-blue-900 text-white p-6 rounded-sm">
              <div className="flex items-center gap-3">
                <ChevronRight className="w-5 h-5" />
                <h4 className="text-xl font-semibold">
                  8. Intip Karya Alumni dari Bootcamp Ini
                </h4>
              </div>
            </div>

            <div className="bg-white p-6">
              <p className="text-gray-700 leading-relaxed mb-8">
                Bagian ini menyajikan dokumentasi proyek dan hasil karya yang
                telah diselesaikan oleh para peserta pada angkatan sebelumnya.
                Penjelasan berikut memberikan gambaran mengenai bentuk penerapan
                nyata dari seluruh teori dan modul yang telah dipelajari selama
                program berlangsung.
              </p>

              {/* Alumni Projects Carousel */}
              <div className="relative px-6 md:px-12">
                <Carousel
                  setApi={setProjectApi}
                  className="w-full"
                  opts={{
                    align: "start",
                    loop: canScroll,
                    skipSnaps: false,
                    dragFree: false,
                  }}
                >
                  <CarouselContent className="py-6">
                    {alumniPortfolioArray.map((project: any, index: number) => (
                      <CarouselItem
                        key={index}
                        className="px-4 basis-full md:basis-1/2"
                      >
                        <div className="bg-gray-50 rounded-lg md:rounded-xl overflow-hidden h-full flex flex-col">
                          {/* Project Image */}
                          <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0 overflow-hidden">
                            <Image
                              src={
                                project.thumbnail
                                  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${project.thumbnail}`
                                  : getProjectImage(project)
                              }
                              alt={project.title}
                              fill
                              unoptimized
                              className="object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </div>

                          {/* Project Content */}
                          <div className="p-4 md:p-6 flex flex-col flex-1">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight line-clamp-3">
                              {project.title}
                            </h3>

                            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed line-clamp-3 flex-1">
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: formatText(project.description),
                                }}
                              />
                            </p>

                            {/* Authors */}
                            <div className="flex items-center mb-4 md:mb-6 gap-3">
                              <UserRound className="w-4 h-4" />
                              <span className="text-xs md:text-sm text-gray-700 line-clamp-1">
                                {project.menteeName}
                              </span>
                            </div>

                            {/* Button */}
                            <Button
                              onClick={() =>
                                window.open(project.projectLink, "_blank")
                              }
                              className="w-fit bg-emerald-500 hover:bg-emerald-600 text-white px-4 md:px-6 py-2 rounded-lg font-medium text-sm md:text-base"
                            >
                              Jelajahi Proyek
                            </Button>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  {/* Navigation Arrows */}
                  <CarouselPrevious
                    disabled={!canScroll}
                    className={`-left-12 md:-left-16 shadow-xl border transition-all
    ${
      canScroll
        ? "bg-emerald-500 text-white hover:bg-emerald-600"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }`}
                  />

                  <CarouselNext
                    disabled={!canScroll}
                    className={`-right-12 md:-right-16 shadow-xl border transition-all
    ${
      canScroll
        ? "bg-emerald-500 text-white hover:bg-emerald-600"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }`}
                  />
                </Carousel>

                {/* Dots Indicator */}
                <div className="flex justify-center mt-6 space-x-3">
                  {Array.from({ length: projectCount }).map((_, index) => (
                    <button
                      key={index}
                      disabled={!canScroll}
                      onClick={() => canScroll && projectApi?.scrollTo(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300
        ${
          index + 1 === projectCurrent
            ? "bg-emerald-500 scale-125"
            : "bg-gray-300 hover:bg-gray-400"
        }
        ${!canScroll ? "cursor-not-allowed opacity-50" : ""}
      `}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 9 - Apa Kata Mereka Setelah Bootcamp? */}
          <div id="section-9">
            <div className="bg-blue-900 text-white p-6 rounded-sm">
              <div className="flex items-center gap-3">
                <ChevronRight className="w-5 h-5" />
                <h4 className="text-xl font-semibold">
                  9. Apa Kata Mereka Setelah Bootcamp?
                </h4>
              </div>
            </div>

            <div className="bg-white p-6">
              <p className="text-gray-700 leading-relaxed mb-8">
                Berikut adalah ulasan dari para peserta mengenai pengalaman
                akademik dan teknis yang mereka peroleh selama masa pelatihan.
                Catatan ini berfungsi sebagai referensi mengenai tingkat
                kepuasan dan pencapaian individu setelah menyelesaikan seluruh
                tahapan dalam bootcamp ini.
              </p>

              {/* Testimonial Carousel */}
              <div className="relative px-6 md:px-12">
                <Carousel
                  setApi={setApi}
                  className="w-full"
                  opts={{
                    align: "start",
                    loop: canScrollTestimonial,
                    skipSnaps: false,
                    dragFree: false,
                  }}
                >
                  <CarouselContent>
                    {testimonialsArray.map(
                      (testimonial: any, index: number) => (
                        <CarouselItem
                          key={index}
                          className="px-4 basis-full md:basis-1/2"
                        >
                          <div className="bg-gray-50 rounded-sm p-6 h-full">
                            <div className="flex items-start gap-4 mb-4">
                              <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${getAvatarColor(
                                  index,
                                )}`}
                              >
                                <UserRound className="w-8 h-8" />
                              </div>
                              <div>
                                <h5 className="font-bold text-gray-900 text-lg">
                                  {testimonial.name}
                                </h5>
                                <p className="text-gray-600 text-sm">
                                  Alumni Bootcamp
                                </p>
                                <p className="text-gray-500 text-xs">
                                  Mentee temudataku
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              &quot;
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: formatText(testimonial.comment),
                                }}
                              />
                              &quot;
                            </p>
                          </div>
                        </CarouselItem>
                      ),
                    )}
                  </CarouselContent>

                  {/* Navigation Arrows - Positioned Outside */}
                  <CarouselPrevious
                    disabled={!canScrollTestimonial}
                    className={`-left-12 md:-left-16 shadow-xl border transition-all
    ${
      canScrollTestimonial
        ? "bg-emerald-500 text-white hover:bg-emerald-600"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }`}
                  />

                  <CarouselNext
                    disabled={!canScrollTestimonial}
                    className={`-right-12 md:-right-16 shadow-xl border transition-all
    ${
      canScrollTestimonial
        ? "bg-emerald-500 text-white hover:bg-emerald-600"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }`}
                  />
                </Carousel>
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center mt-6 space-x-3">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    disabled={!canScrollTestimonial}
                    onClick={() => canScrollTestimonial && api?.scrollTo(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300
        ${
          index + 1 === current
            ? "bg-emerald-500 scale-125"
            : "bg-gray-300 hover:bg-gray-400"
        }
        ${!canScrollTestimonial ? "cursor-not-allowed opacity-50" : ""}
      `}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
