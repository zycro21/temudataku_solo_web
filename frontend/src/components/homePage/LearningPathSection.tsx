"use client";

import { useState, forwardRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  Calendar,
  CalendarDays,
  Search,
  Tag,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MentorSelectionModal from "../mentoring/MentorSelectionModal";
import { toast } from "sonner";
import { motion } from "framer-motion";

const tabs = [
  { id: "mentoring", label: "Mentoring" },
  { id: "program", label: "Bootcamp" },
  { id: "aycl", label: "All You Can Learn" },
];

const LearningPathsSection = forwardRef<HTMLDivElement>((props, ref) => {
  const [activeTab, setActiveTab] = useState("mentoring");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [bootcamps, setBootcamps] = useState<any[]>([]);
  const [bootcampLoading, setBootcampLoading] = useState(true);

  const [ayclBatches, setAyclBatches] = useState<any[]>([]);
  const [ayclLoading, setAyclLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchBootcamps = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/public-bootcamps`,
          { params: { page: 1, limit: 6 } }, // cuma ambil 6
        );

        setBootcamps(res.data.data || []);
      } catch (error) {
        console.error("Error fetching bootcamps:", error);
      } finally {
        setBootcampLoading(false);
      }
    };

    fetchBootcamps();
  }, []);

  useEffect(() => {
    const fetchAycl = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aycl/public/aycl/list`,
        );

        setAyclBatches(res.data.data || []);
      } catch {
        setAyclBatches([]);
      } finally {
        setAyclLoading(false);
      }
    };

    fetchAycl();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getLevelLabel = (level?: string) => {
    if (!level) return "";

    const normalized = level.toLowerCase();

    switch (normalized) {
      case "beginner":
        return "Level Beginner – Langkah Awal Menjadi Ahli";
      case "intermediate":
        return "Level Intermediate – Tingkatkan Skala Kemampuanmu";
      case "advance":
      case "advanced":
        return "Level Advanced – Kuasai Teknologi Masa Depan";
      case "professional":
        return "Level Professional – Siap Taklukkan Standar Industri";
      default:
        return `Level ${level}`;
    }
  };

  const normalizeToolName = (tool: string) => {
    return tool
      .toLowerCase()
      .replace(/\(.*?\)/g, "")
      .replace(/\s+/g, "")
      .trim();
  };

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
    const src = toolPaths[normalized] || "/assets/toolIcons/python.svg";

    return (
      <TooltipProvider key={tool}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-200 cursor-pointer hover:scale-110 transition-transform">
              <Image
                src={src}
                alt={tool}
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tool}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  type ServiceType = "one-on-one" | "group";

  interface MentoringOption {
    id: number;
    title: string;
    price: string;
    image: string;
    features: string[];
    type: ServiceType;
    originalPrice?: string;
    badge?: string;
  }

  const mentoringOptions: MentoringOption[] = [
    {
      id: 1,
      title: "Mentoring 1 on 1",
      originalPrice: "Rp 199.000",
      price: "Rp 99.000",
      badge: "BEST SESSION",
      type: "one-on-one",
      features: [
        "Mentoring 45 menit",
        "Tanya apapun permasalahan dalam bidang data science",
        "Rekaman sesi mentoring",
        "Garansi kepuasan*",
        "Dapatkan akses ke praktik data science**",
      ],
      image: "/assets/mentoringPage/mentoring1on1.svg",
    },
    {
      id: 2,
      title: "Mentoring Group",
      price: "Rp 249.000",
      type: "group",
      features: [
        "Mentoring 90 menit",
        "Tanya apapun permasalahan dalam bidang data science",
        "Rekaman sesi mentoring",
        "Garansi kepuasan*",
        "Dapatkan akses ke praktik data science**",
      ],
      image: "/assets/mentoringPage/mentoringgroup.svg",
    },
  ];

  const handleSelectService = async (type: "one-on-one" | "group") => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/public-mentoring-services`,
        {
          params: {
            serviceType: type,
            page: 1,
            limit: 1,
          },
        },
      );

      const services = response.data?.data || [];

      if (services.length === 0) {
        toast.error("Service belum tersedia.");
        return;
      }

      const service = services[0];

      setSelectedService(service);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Gagal mengambil service:", error);
      toast.error("Terjadi kesalahan saat mengambil layanan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={ref} className="py-14 mb-12 bg-white">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-5 lg:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 px-2">
          <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">
            Jalur Belajar
          </p>

          <h2 className="text-xl sm:text-2xl md:text-[32px] font-bold mb-10 sm:mb-14 leading-snug">
            Jalur Belajar di TemuDataku
            <br />
            yang Bisa Kamu Pilih
          </h2>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-10">
            <div className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto lg:overflow-visible whitespace-nowrap w-full lg:w-auto bg-white">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 sm:px-5 py-2 text-sm sm:text-[15px] text-center rounded-md font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-[#0CA678] text-white shadow-sm"
                      : "text-gray-600 bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= MENTORING ================= */}
        {activeTab === "mentoring" && (
          <div className="grid md:grid-cols-2 gap-6 justify-items-center">
            {mentoringOptions.map((option) => (
              <Card
                key={option.id}
                className="overflow-hidden shadow-md border-0"
              >
                <div className="relative">
                  <Image
                    src={option.image}
                    alt={option.title}
                    width={400}
                    height={220}
                    className="w-full h-44 sm:h-48 object-cover"
                  />
                  {option.badge && (
                    <div className="absolute bottom-0 left-0 right-0 bg-[#243A77] text-white text-center py-2 text-xs font-semibold">
                      {option.badge}
                    </div>
                  )}
                </div>

                <CardContent className="pt-0 p-4 sm:p-5">
                  <h3 className="text-xl font-bold mb-2 sm:mb-3 text-center sm:text-left">
                    {option.title}
                  </h3>

                  <div className="mb-5 text-center sm:text-left">
                    {option.originalPrice && (
                      <span className="text-xs text-gray-500 line-through mr-2">
                        {option.originalPrice}
                      </span>
                    )}
                    <span className="text-xl font-bold">{option.price}</span>
                  </div>

                  <ul className="space-y-2 mb-5 text-left sm:text-left">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#0CA678]" />
                        <span className="text-xs text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectService(option.type as any)}
                    disabled={loading}
                    className="w-full bg-[#0CA678] hover:bg-[#08916C] text-white py-2.5 text-sm sm:text-base"
                  >
                    {loading ? "Memuat..." : "Ikuti Sesi"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ================= AYCL ================= */}
        {activeTab === "aycl" && (
          <div>
            {ayclLoading ? (
              <div className="text-center py-16 text-gray-500 text-sm">
                Loading...
              </div>
            ) : ayclBatches.length > 0 ? (
              /* ADA AYCL AKTIF */
              <div className="flex flex-col gap-6">
                {ayclBatches.map((batch, index) => (
                  <motion.div
                    key={batch.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.2,
                      ease: "easeOut",
                    }}
                    whileHover={{ scale: 1.01 }}
                    className={`relative overflow-hidden rounded-2xl 
  p-6 sm:p-8 md:p-12 text-white shadow-xl
  ${
    index === 1
      ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
      : "bg-gradient-to-br from-emerald-600 to-emerald-800"
  }`}
                  >
                    {/* Decorative */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 6, repeat: Infinity }}
                      className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5"
                    />
                    <div className="absolute -bottom-14 -left-14 w-64 h-64 rounded-full bg-white/5" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                      {/* LEFT */}
                      <div className="flex-1 text-center md:text-left">
                        <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
                          🎉 Sudah Hadir Sekarang!
                        </span>

                        <h3 className="text-2xl md:text-3xl font-bold mb-3">
                          {batch.title}
                        </h3>

                        {batch.subHeadline && (
                          <p className="text-emerald-100 text-sm md:text-base mb-4">
                            {batch.subHeadline}
                          </p>
                        )}

                        <div className="flex items-baseline gap-2 mb-6 justify-center md:justify-start">
                          <span className="text-emerald-200 text-base">
                            Hanya
                          </span>
                          <span className="text-3xl font-extrabold">
                            Rp{Number(batch.price).toLocaleString("id-ID")}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                          <Button
                            onClick={() =>
                              router.push(`/aycl?slug=${batch.slug}`)
                            }
                            className="bg-white text-emerald-700 hover:bg-emerald-50 
               font-semibold px-6 py-2.5 text-sm shadow-sm
               rounded-lg transition-all duration-200 hover:scale-[1.02]"
                          >
                            Daftar Sekarang
                          </Button>

                          <Button
                            onClick={() =>
                              router.push(`/aycl?slug=${batch.slug}`)
                            }
                            className="
    bg-transparent 
    text-white 
    border border-white/70
    hover:bg-white/10 hover:border-white
    font-medium px-6 py-2.5 text-sm
    rounded-lg
    transition-all duration-200
  "
                          >
                            Lihat Detail
                          </Button>
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="md:w-64 bg-white/10 rounded-xl p-6 border border-white/20 mx-auto md:mx-0">
                        <p className="text-xs font-semibold text-emerald-200 mb-4">
                          Yang Kamu Dapatkan
                        </p>

                        <ul className="space-y-3">
                          {[
                            "Akses materi dan hands-of-project",
                            "Sesi live interaktif",
                            "Komunitas eksklusif",
                            "Sertifikat kelulusan",
                          ].map((item) => (
                            <li key={item} className="flex gap-2 text-sm">
                              <Check className="w-4 h-4 text-emerald-300" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* TIDAK ADA AYCL AKTIF */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                    <CalendarDays className="w-9 h-9 text-emerald-500" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 text-xs font-bold">
                      !
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  All You Can Learn Akan Segera Kembali
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Program batch berikutnya sedang dalam persiapan. Pantau terus
                  untuk mendapatkan informasi terbaru!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= PROGRAM ================= */}
        {activeTab === "program" && (
          <div>
            {bootcampLoading ? (
              <div className="text-center py-16 text-gray-500 text-sm">
                Loading bootcamps...
              </div>
            ) : bootcamps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-emerald-50 p-5 rounded-full mb-5">
                  <CalendarDays className="w-10 h-10 text-emerald-600" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Bootcamp Akan Segera Hadir
                </h3>

                <p className="text-sm text-gray-600 max-w-md">
                  Saat ini belum ada bootcamp yang tersedia.
                </p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {bootcamps.map((bootcamp) => (
                    <Card
                      key={bootcamp.id}
                      className="overflow-hidden hover:shadow-md transition-shadow border border-gray-200 rounded-lg p-0 gap-0"
                    >
                      <div className="relative">
                        <Image
                          src={
                            bootcamp.thumbnail ??
                            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop"
                          }
                          alt={bootcamp.serviceName}
                          width={400}
                          height={180}
                          className="w-full h-48 object-cover"
                        />

                        <div className="absolute top-0 right-0 bg-gray-500 text-white px-2 py-1 rounded-bl-lg text-xs font-medium">
                          {bootcamp.availableSlots !== null
                            ? `<${bootcamp.availableSlots} Kuota`
                            : "Unlimited"}
                        </div>

                        <div className="absolute bottom-0 w-full bg-brand-color-secondary text-white px-3 py-2 text-sm font-semibold text-center">
                          {getLevelLabel(bootcamp.level)}
                        </div>
                      </div>

                      <CardContent className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                          {bootcamp.serviceName}
                        </h3>

                        <div className="flex gap-2 mb-3 flex-wrap">
                          {bootcamp.toolsUsed
                            ?.split(",")
                            .map((tool: string) => tool.trim())
                            .map((tool: string) => getToolIcon(tool))}
                        </div>

                        <div className="flex items-center gap-2 text-gray-700 text-sm font-medium mb-3">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>
                            {bootcamp.sessionDateRange
                              ? bootcamp.sessionDateRange
                                  .split(" - ")
                                  .map((date: string) => formatDate(date))
                                  .join(" - ")
                              : "Tanggal belum tersedia"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-5">
                          <Tag className="w-4 h-4 text-gray-500" />

                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400 line-through">
                              Rp
                              {Math.round(
                                Number(bootcamp.price) / 0.875,
                              ).toLocaleString("id-ID")}
                            </span>

                            <span className="text-lg font-bold text-gray-900">
                              Rp{Number(bootcamp.price).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button
                            onClick={() =>
                              router.push(`/programs/${bootcamp.id}`)
                            }
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-sm"
                          >
                            Daftar Sekarang
                          </Button>

                          <Button
                            onClick={() =>
                              router.push(`/programs/${bootcamp.id}`)
                            }
                            variant="outline"
                            className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 py-2 text-sm"
                          >
                            Lihat Detail
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/programs")}
                    className="px-5 py-2 text-sm flex items-center gap-2 text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                  >
                    Lihat Lebih Banyak
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        <MentorSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          service={selectedService}
        />
      </div>
    </section>
  );
});

export default LearningPathsSection;
