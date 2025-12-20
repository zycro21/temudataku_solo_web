"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FileText,
  Download,
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { DataTable } from "./data-table";
import { columns, Datas } from "./columns";

export default function AdminMentorPage() {
  const [exportOpen, setExportOpen] = useState(false);

  const handleExportMentorReports = async (format: "csv" | "excel") => {
    const loadingToastId = toast.loading(
      `Mengekspor laporan mentor ke ${format.toUpperCase()}...`
    );

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorReports/mentor/reportsExport`,
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
      let filename = "mentor-reports";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[1]) filename = match[1];
      } else {
        const timestamp = new Date()
          .toLocaleString("sv-SE")
          .replace(" ", "_")
          .replace(/:/g, "-");

        filename = `mentor-reports-${timestamp}.${
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
        description: `Laporan mentor berhasil diekspor (${filename})`,
      });
    } catch (err: any) {
      console.error("Export mentor reports error:", err);

      toast.error("Gagal export laporan mentor", {
        id: loadingToastId,
        description:
          err?.response?.data?.message ??
          "Terjadi kesalahan saat mengekspor laporan mentor",
      });
    }
  };

  const [datas, setDatas] = useState<Datas[]>([]);
  const [loading, setLoading] = useState(false);

  const mapServiceTypeToProgram = (type?: string) => {
    if (!type) return "-";

    const normalized = type
      .toLowerCase()
      .replace(/[_\s]+/g, "-")
      .replace(/--+/g, "-")
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

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "-";

    const date = new Date(isoString);

    const formattedDate = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${formattedDate}, ${formattedTime}`;
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorReports/mentor/reports`,
          {
            withCredentials: true, // ✅ pakai cookie token
            params: {
              page: 1,
              limit: 10000,
            },
          }
        );

        const mapped: Datas[] = res.data.data.map((report: any) => ({
          id: report.id,
          mentor: report.mentorProfile?.user?.fullName || "-",
          topic: report.session?.mentoringService?.serviceName || "-",
          program: mapServiceTypeToProgram(
            report.session?.mentoringService?.serviceType
          ),
          date: formatDateTime(report.session?.startTime),

          evaluasi: {
            understanding: report.understanding || "",
            catatan_mentor: report.participation || "",
            common_question: report.commonQuestions || "",
            kendala: report.challenges || "",
            tantangan: report.nextFocus || "",
            catatan_tambahan: report.additionalNotes || "",
          },
        }));

        setDatas(mapped);
      } catch (err) {
        console.error("Gagal ambil mentor reports", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const [stats, setStats] = useState<
    {
      title: string;
      value: string;
      image: string;
      color: string;
    }[]
  >([]);

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorReports/mentorReportStats`,
          { withCredentials: true }
        );

        const { totalFeedback, filled, unfilled } = res.data.data;

        setStats([
          {
            title: "Total Feedback Mentor",
            value: totalFeedback.toString(),
            image: "/assets/admin/totalFeedback.svg",
            color: "text-blue-600",
          },
          {
            title: "Sudah Diisi",
            value: filled.toString(),
            image: "/assets/admin/menteeac.svg",
            color: "text-emerald-600",
          },
          {
            title: "Belum Diisi",
            value: unfilled.toString(),
            image: "/assets/admin/menteenonac.svg",
            color: "text-yellow-600",
          },
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // const stats = [
  //   {
  //     title: "Total Feedback Mentor",
  //     value: "80",
  //     image: "/assets/admin/totalFeedback.svg",
  //     color: "text-gray-900",
  //     change: "+12%",
  //   },
  //   {
  //     title: "Sudah Diisi",
  //     value: "78",
  //     image: "/assets/admin/menteeac.svg",
  //     color: "text-green-600",
  //     change: "+5%",
  //   },
  //   {
  //     title: "Belum Diisi",
  //     value: "2",
  //     image: "/assets/admin/menteenonac.svg",
  //     color: "text-orange-600",
  //   },
  // ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Feedback Mentor
          </h1>

          {/* Breadcrumb */}
          <p className="text-gray-600 flex items-center">
            Kelola Mentoring
            <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
            <span className="font-semibold text-gray-800">Feedback Mentor</span>
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
            <DropdownMenuItem onClick={() => handleExportMentorReports("csv")}>
              Export ke CSV
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleExportMentorReports("excel")}
            >
              Export ke Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Cards */}
      <div className="w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
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

                {/* {stat.change && (
                  <span className="inline-block text-xs font-medium text-emerald-700 bg-green-200 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                )} */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        Daftar Feedback Mentor
      </h2>

      {/* DataTable */}
      <Card className="p-6">
        <DataTable columns={columns} data={datas} />
      </Card>
    </>
  );
}
