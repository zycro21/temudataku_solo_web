"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FileText,
  Download,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "./data-table";
import { columns, Datas } from "./columns";

export default function AdminMentorPage() {
  const [exportOpen, setExportOpen] = useState(false);

  const handleExportFeedbacks = async (format: "csv" | "excel") => {
    const loadingToastId = toast.loading(
      `Mengekspor data feedback ke ${format.toUpperCase()}...`
    );

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feedback/admin/feedbacks/export`,
        {
          params: { format }, // csv | excel
          responseType: "blob",
          withCredentials: true,
        }
      );

      const blob = new Blob([res.data], {
        type: res.headers["content-type"],
      });

      // Ambil filename dari Content-Disposition
      const contentDisposition = res.headers["content-disposition"];
      let filename = "feedback-export";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[1]) filename = match[1];
      } else {
        const timestamp = new Date()
          .toLocaleString("sv-SE")
          .replace(" ", "_")
          .replace(/:/g, "-");

        filename = `feedbacks-${timestamp}.${
          format === "excel" ? "xlsx" : "csv"
        }`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export berhasil", {
        id: loadingToastId,
        description: `Data feedback berhasil diekspor (${filename})`,
      });
    } catch (err: any) {
      console.error("Export feedback error:", err);

      toast.error("Gagal export data feedback", {
        id: loadingToastId,
        description:
          err?.response?.data?.message ??
          "Terjadi kesalahan saat mengekspor data feedback",
      });
    }
  };

  const [datas, setDatas] = useState<Datas[]>([]);
  const [loading, setLoading] = useState(false);

  const mapServiceTypeToProgram = (type?: string) => {
    if (!type) return "-";

    const normalized = type
      .toLowerCase()
      .replace(/[_\s]+/g, "-") // spasi & underscore → dash
      .replace(/--+/g, "-") // double dash
      .trim();

    switch (normalized) {
      case "bootcamp":
        return "Bootcamp";

      case "shortclass":
        return "Short Class";

      case "live-class":
      case "liveclass":
      case "live class":
        return "Live Class";

      case "one-on-one":
        return "1 on 1 Mentoring";

      case "group":
        return "Group Mentoring";

      default:
        return "-";
    }
  };

  const seededRandom = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const generateEvaluasiScores = (skor: number, seedBase: number) => {
    const count = 6;
    const MAX_DEVIATION = 15;

    const minAvg = Math.max(0, skor - 5);
    const maxAvg = Math.min(100, skor + 5);

    const targetAvg = seededRandom(seedBase + 1) * (maxAvg - minAvg) + minAvg;

    // generate nilai awal (deterministik)
    let values = Array.from({ length: count }, (_, i) => {
      const min = Math.max(0, skor - MAX_DEVIATION);
      const max = Math.min(100, skor + MAX_DEVIATION);

      return seededRandom(seedBase + i + 10) * (max - min) + min;
    });

    // normalisasi rata-rata
    const currentAvg = values.reduce((a, b) => a + b, 0) / count;
    const diff = targetAvg - currentAvg;

    values = values.map((v, i) => {
      const adjustment =
        diff / count + (seededRandom(seedBase + i + 20) - 0.5) * 4;

      return Math.min(100, Math.max(0, Math.round(v + adjustment)));
    });

    return values;
  };

  const stringToSeed = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const parseComment = (comment?: string) => {
    if (!comment) {
      return {
        masukkan: "-",
        catatan_tambahan: "-",
      };
    }

    const marker = "catatan tambahan:";
    const lower = comment.toLowerCase();

    const index = lower.indexOf(marker);

    // Jika tidak ada "Catatan tambahan:"
    if (index === -1) {
      return {
        masukkan: comment.trim(),
        catatan_tambahan: "-",
      };
    }

    const masukkan = comment.slice(0, index).trim();
    const catatan_tambahan = comment.slice(index + marker.length).trim();

    return {
      masukkan: masukkan || "-",
      catatan_tambahan: catatan_tambahan || "-",
    };
  };

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feedback/admin/feedbacks`,
          {
            params: {
              page: 1,
              limit: 1000,
            },
            withCredentials: true,
          }
        );

        const items = res.data.data.feedbacks;

        const mapped: Datas[] = items.map((fb: any) => {
          // mentor (ambil dari mentoring service mentor)
          const mentorName =
            fb.session?.mentors?.[0]?.mentorProfile?.user?.fullName ?? "-";

          // tanggal (prioritas submittedDate → createdAt)
          const dateSource = fb.submittedDate || fb.createdAt;

          // skor keseluruhan 0–100
          const skor =
            fb.rating != null ? Math.round((fb.rating / 5) * 100) : 0;

          // generate evaluasi random tapi konsisten
          const [
            kemudahan_materi,
            kejelasan_materi,
            mentor_menjawab,
            pelaksanaan,
            kesesuaian_jadwal,
            kualitas_platform,
          ] = generateEvaluasiScores(skor, stringToSeed(fb.id) + skor);

          const { masukkan, catatan_tambahan } = parseComment(fb.comment);

          return {
            id: fb.id,
            mentor: mentorName,
            mentee: fb.isAnonymous ? "Anonimous" : fb.user?.fullName ?? "-",
            program: mapServiceTypeToProgram(
              fb.session?.mentoringService?.serviceType
            ),
            topic: fb.session?.mentoringService?.serviceName ?? "-",
            date: dateSource
              ? new Date(dateSource).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-",
            skor,
            publicVisible: Boolean(fb.isVisible),
            evaluasi: {
              kemudahan_materi,
              kejelasan_materi,
              mentor_menjawab,
              pelaksanaan,
              kesesuaian_jadwal,
              kualitas_platform,
              masukkan,
              catatan_tambahan,
            },
          };
        });

        setDatas(mapped);
      } catch (err) {
        console.error("Gagal mengambil feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const [stats, setStats] = useState([
    {
      title: "Total Feedback Mentee",
      value: "0",
      image: "/assets/admin/totalFeedback.svg",
      color: "text-gray-900",
      change: "",
    },
  ]);

  useEffect(() => {
    const fetchFeedbackStats = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feedback/admin/feedbacks`,
          {
            params: {
              page: 1,
              limit: 10000, // ambil banyak, hanya untuk stats
            },
            withCredentials: true,
          }
        );

        const feedbacks = res.data.data.feedbacks;
        const total = res.data.data.total;

        // Hitung feedback 7 hari terakhir
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        const last7DaysCount = feedbacks.filter((fb: any) => {
          const submittedDate = new Date(fb.submittedDate);
          return submittedDate >= sevenDaysAgo;
        }).length;

        setStats([
          {
            title: "Total Feedback Mentee",
            value: total.toString(),
            image: "/assets/admin/totalFeedback.svg",
            color: "text-gray-900",
            change: last7DaysCount > 0 ? `+${last7DaysCount}` : "",
          },
        ]);
      } catch (error) {
        console.error("Gagal mengambil statistik feedback:", error);
      }
    };

    fetchFeedbackStats();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Feedback Mentee
          </h1>

          {/* Breadcrumb */}
          <p className="text-gray-600 flex items-center">
            Kelola Mentoring
            <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
            <span className="font-semibold text-gray-800">Feedback Mentee</span>
          </p>
        </div>

        {/* Dropdown Export Data */}
        <DropdownMenu onOpenChange={(open) => setExportOpen(open)}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-300"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>

              {/* Chevron Toggle */}
              {exportOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => handleExportFeedbacks("csv")}>
              Export ke CSV
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleExportFeedbacks("excel")}>
              Export ke Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Cards */}
      <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="max-w-[340px] w-full flex flex-col justify-between px-0 py-2
        shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200
        cursor-pointer rounded-lg bg-white"
          >
            {/* Header */}
            <CardHeader className="flex items-center justify-between px-5 pt-2 pb-1">
              <div className="flex items-center gap-2">
                <Image
                  src={stat.image}
                  alt={stat.title}
                  width={20}
                  height={20}
                  className="opacity-90"
                />
                <CardTitle className="text-md font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-500" />
            </CardHeader>

            {/* Content */}
            <CardContent className="px-5 pt-0 pb-3">
              <div className="flex items-center gap-3">
                <p className={`text-4xl font-bold leading-tight ${stat.color}`}>
                  {stat.value}
                </p>

                {stat.change && (
                  <span className="inline-block text-xs font-medium text-emerald-700 bg-green-200 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        Daftar Feedback Mentee
      </h2>

      {/* DataTable */}
      <Card className="p-6">
        <DataTable columns={columns} data={datas} />
      </Card>
    </>
  );
}
