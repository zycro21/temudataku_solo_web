"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import {
  Search,
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Tag,
} from "lucide-react";

export default function PracticeSelection() {
  const [bootcamps, setBootcamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("Semua");
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();

  const handleNavigate = (id: string) => {
    router.push(`/programs/${id}`);
  };

  useEffect(() => {
    const fetchBootcamps = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/public-bootcamps`,
          {
            params: { page: 1, limit: 50 },
          },
        );

        setBootcamps(res.data.data);
      } catch (error: any) {
        console.error(
          "Error fetching bootcamps:",
          error.response?.data || error.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBootcamps();
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

  const normalizeToolName = (tool: string) => {
    return tool
      .toLowerCase()
      .replace(/\(.*?\)/g, "") // hapus (Expert)
      .replace(/\s+/g, "") // hapus semua spasi
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
      // --- 1. Data Visualization & BI (Tambahan) ---
      metabase: "/assets/toolIcons/metabase.svg",
      superset: "/assets/toolIcons/superset.svg",

      // --- 2. Data Engineering & Big Data ---
      spark: "/assets/toolIcons/spark.svg",
      apachespark: "/assets/toolIcons/spark.svg",
      hadoop: "/assets/toolIcons/hadoop.svg",
      airflow: "/assets/toolIcons/airflow.svg",
      apacheairflow: "/assets/toolIcons/airflow.svg",
      dbt: "/assets/toolIcons/dbt.svg",

      // --- 3. Machine Learning & MLOps (Tambahan) ---
      pandas: "/assets/toolIcons/pandas.svg",
      numpy: "/assets/toolIcons/numpy.svg",
      fastapi: "/assets/toolIcons/fastapi.svg",
      streamlit: "/assets/toolIcons/streamlit.svg",
      wandb: "/assets/toolIcons/wandb.svg",
      weightsandbiases: "/assets/toolIcons/wandb.svg",

      // --- 4. Cloud & Database Lainnya ---
      gcp: "/assets/toolIcons/gcp.svg",
      googlecloud: "/assets/toolIcons/gcp.svg",
      bigquery: "/assets/toolIcons/bigquery.svg",
      snowflake: "/assets/toolIcons/snowflake.svg",
      mongodb: "/assets/toolIcons/mongodb.svg",

      // --- 5. Programming & Version Control ---
      r: "/assets/toolIcons/r.svg",
      rlanguage: "/assets/toolIcons/r.svg",
      git: "/assets/toolIcons/git.svg",
      github: "/assets/toolIcons/github.svg",
    };

    const normalized = normalizeToolName(tool);
    const src = toolPaths[normalized] || "/assets/toolIcons/default.svg";

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

  // 🔥 FILTER LOGIC (tanpa ubah UI)
  const filteredBootcamps = useMemo(() => {
    return bootcamps.filter((bootcamp) => {
      const matchSearch = bootcamp.serviceName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchSkill =
        selectedSkill === "Semua" ||
        bootcamp.category?.toLowerCase() === selectedSkill.toLowerCase();

      return matchSearch && matchSkill;
    });
  }, [bootcamps, searchTerm, selectedSkill]);

  const displayedBootcamps = showAll
    ? filteredBootcamps
    : filteredBootcamps.slice(0, 6);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading bootcamps...
      </div>
    );
  }

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

  return (
    <section id="practice-selection" className="py-16 px-4 md:px-6 lg:px-8 scroll-mt-[100px]">
      <div className="max-w-[1000px] mx-auto">
        {/* ================= HEADER (TIDAK DIUBAH) ================= */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Pilih Bootcamp yang Pas Untuk Kamu!
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Nggak semua orang punya cara belajar yang sama, makanya TemuDataku
            nyediain pilihan bootcamp yang bisa kamu sesuaikan sama kebutuhan,
            waktu, dan goals kamu. Yuk, cari yang paling pas buat perjalanan
            belajarmu!
          </p>
        </div>

        {/* ================= SEARCH & FILTER (TIDAK DIUBAH DESIGN) ================= */}
        <div className="mb-8 space-y-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari bootcamp-mu di sini"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                />
              </div>
            </div>

            {/* Dropdown tetap ada */}
            <div className="md:w-48">
              <Select
                value={selectedSkill}
                onValueChange={(val) => setSelectedSkill(val)}
              >
                <SelectTrigger className="w-full !h-full px-4 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 bg-white">
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua</SelectItem>
                  <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                  <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                  <SelectItem value="Machine Learning">
                    Machine Learning
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Jenis Keterampilan tetap ada */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center text-gray-700 font-medium">
              Jenis Keterampilan:
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Semua",
                "Data Analyst",
                "Data Scientist",
                "Machine Learning",
              ].map((skill) => (
                <Button
                  key={skill}
                  variant={selectedSkill === skill ? "default" : "outline"}
                  onClick={() => setSelectedSkill(skill)}
                  className={`px-6 py-2 rounded-md ${
                    selectedSkill === skill
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {skill}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= CARD GRID (DESIGN SAMA) ================= */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bootcamps.length === 0 ? (
            /* KOSONG TOTAL DARI SERVER */
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-emerald-50 p-6 rounded-full mb-6">
                <CalendarDays className="w-12 h-12 text-emerald-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Bootcamp Akan Segera Hadir
              </h3>

              <p className="text-gray-600 max-w-md">
                Saat ini belum ada bootcamp yang tersedia. Tim kami sedang
                menyiapkan program terbaik untuk kamu.
              </p>
            </div>
          ) : filteredBootcamps.length === 0 ? (
            /* ADA DATA, TAPI TIDAK SESUAI FILTER */
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-6">
                <Search className="w-12 h-12 text-gray-500" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Tidak Ada Hasil Ditemukan
              </h3>

              <p className="text-gray-600 max-w-md">
                Coba ubah kata kunci pencarian atau filter keterampilan yang
                kamu pilih.
              </p>
            </div>
          ) : (
            /* 🔥 NORMAL MAP */
            displayedBootcamps.map((bootcamp) => (
              <Card
                key={bootcamp.id}
                className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 rounded-lg p-0 gap-0"
              >
                <div className="relative">
                  <Image
                    src={
                      bootcamp.thumbnail ??
                      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop"
                    }
                    alt={bootcamp.serviceName}
                    width={400}
                    height={200}
                    className="w-full h-64 object-cover"
                  />

                  <div className="absolute top-0 right-0 bg-gray-500 text-white px-3 p-2 rounded-bl-lg text-sm font-medium">
                    {bootcamp.availableSlots !== null
                      ? `<${bootcamp.availableSlots} Kuota Tersisa`
                      : "Unlimited"}
                  </div>

                  <div className="absolute bottom-0 w-full bg-brand-color-secondary text-white px-4 py-3 text-base font-semibold text-center">
                    {getLevelLabel(bootcamp.level)}
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {bootcamp.serviceName}
                  </h3>

                  <div className="flex gap-2 mb-4">
                    {bootcamp.toolsUsed
                      ?.split(",")
                      .map((tool: string) => tool.trim())
                      .map((tool: string) => getToolIcon(tool))}
                  </div>

                  <div className="flex items-center gap-3 text-gray-700 text-base font-medium mb-4">
                    <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <span>
                      {bootcamp.sessionDateRange
                        ? bootcamp.sessionDateRange
                            .split(" - ")
                            .map((date: string) => formatDate(date))
                            .join(" - ")
                        : "Tanggal belum tersedia"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <Tag className="w-5 h-5 text-gray-500" />

                    <div className="flex flex-col">
                      {/* Harga Coret */}
                      <span className="text-sm text-gray-400 line-through">
                        Rp
                        {Math.round(
                          Number(bootcamp.price) / 0.875,
                        ).toLocaleString("id-ID")}
                      </span>

                      {/* Harga Diskon */}
                      <span className="text-2xl font-bold text-gray-900">
                        Rp{Number(bootcamp.price).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => handleNavigate(bootcamp.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
                    >
                      Daftar Sekarang
                    </Button>
                    <Button
                      onClick={() => handleNavigate(bootcamp.id)}
                      variant="outline"
                      className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 py-3"
                    >
                      Lihat Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-center mt-10">
          <Button
            variant="outline"
            onClick={() => filteredBootcamps.length > 6 && setShowAll(!showAll)}
            disabled={filteredBootcamps.length <= 6}
            className={`px-6 py-3 text-base flex items-center gap-2 transition-all
    ${
      filteredBootcamps.length <= 6
        ? "text-gray-500 border-gray-400 bg-gray-100 cursor-not-allowed hover:bg-gray-100 hover:text-gray-500"
        : "text-emerald-600 border-emerald-600 hover:bg-emerald-50 cursor-pointer"
    }`}
          >
            {showAll ? (
              <>
                Lihat Lebih Sedikit
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Lihat Lebih Banyak
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
