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
  Eye,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "./data-table";
import { columns, Project } from "./columns";
import dynamic from "next/dynamic";

export default function AdminMentorPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [exportOpen, setExportOpen] = useState(false);

  const handleExportSubmission = async (format: "csv" | "excel") => {
    const loadingToastId = toast.loading(
      `Mengekspor submissions ke ${format.toUpperCase()}...`
    );

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/project/adminSubmissionsExport`,
        {
          params: { format },
          responseType: "blob",
          withCredentials: true, // pastikan cookie/auth dikirim
        }
      );

      const blob = new Blob([res.data], { type: res.headers["content-type"] });

      // Buat timestamp untuk filename
      const now = new Date();
      const timestamp = now
        .toLocaleString("sv-SE")
        .replace(" ", "_")
        .replace(/:/g, "-");

      const extension = format === "excel" ? "xlsx" : "csv";
      const filename = `submissions-${timestamp}.${extension}`;

      // Buat link download
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
        description: `Data submissions berhasil diekspor (${filename})`,
      });
    } catch (err: any) {
      console.error("Export submissions error:", err);

      toast.error("Gagal export data submissions", {
        id: loadingToastId,
        description:
          err?.response?.data?.message ??
          "Terjadi kesalahan saat mengekspor data submissions",
      });
    }
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/project/admin/submissions`,
          {
            withCredentials: true,
            params: {
              page: 1,
              limit: 10000,
              sortBy: "submissionDate",
              sortOrder: "desc",
            },
          }
        );

        setProjects(res.data.data);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.response?.data?.message || "Gagal memuat daftar submission"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  type ProjectStats = {
    totalProject: number;
    submitted: number;
    notSubmitted: number;
    reviewed: number;
    notReviewed: number;
  };

  const [statsData, setStatsData] = useState<ProjectStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchProjectStats = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/project/adminprojectsstats`,
          {
            withCredentials: true,
          }
        );

        setStatsData(res.data.data);
      } catch (error) {
        console.error("Gagal mengambil statistik project:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchProjectStats();
  }, []);

  const stats = [
    {
      title: "Total Project",
      value: statsData?.totalProject ?? 0,
      image: "/assets/admin/totalproject.svg",
      color: "text-gray-900",
    },
    {
      title: "Sudah Mengirim",
      value: statsData?.submitted ?? 0,
      image: "/assets/admin/menteeac.svg",
      color: "text-green-600",
    },
    {
      title: "Belum Mengirim",
      value: statsData?.notSubmitted ?? 0,
      image: "/assets/admin/penjadwalanulang.svg",
      color: "text-orange-600",
    },
    {
      title: "Sudah Direview",
      value: statsData?.reviewed ?? 0,
      image: "/assets/admin/menteeac.svg",
      color: "text-green-600",
    },
    {
      title: "Belum Direview",
      value: statsData?.notReviewed ?? 0,
      image: "/assets/admin/penjadwalanulang.svg",
      color: "text-orange-600",
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">Project</h1>

          {/* Breadcrumb */}
          <p className="text-gray-600 flex items-center">
            Kelola Mentoring
            <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
            <span className="font-semibold text-gray-800">Project</span>
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
            <DropdownMenuItem onClick={() => handleExportSubmission("csv")}>
              Export ke CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportSubmission("excel")}>
              Export ke Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Cards — versi mirip page jadwal sesi */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="max-w-[340px] w-full flex flex-col justify-between px-0 py-2
        shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200
        cursor-pointer rounded-lg bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-1">
              <div className="flex items-center gap-3">
                {/* Jika ada image/icon, bisa pakai stat.image */}
                {stat.image && (
                  <Image
                    src={stat.image}
                    alt={stat.title}
                    width={15}
                    height={15}
                    className="opacity-90"
                  />
                )}
                <p className="text-md font-medium text-gray-600">
                  {stat.title}
                </p>
              </div>

              <ChevronDown className="w-5 h-5 text-gray-500" />
            </div>

            {/* Content */}
            <CardContent className="px-5 pt-0 pb-3">
              <div className="flex items-center gap-3">
                <p
                  className={`text-4xl font-bold leading-tight ${
                    stat.color || "text-gray-900"
                  }`}
                >
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
        Jadwal Sesi Mentoring
      </h2>

      {/* DataTable */}
      <Card className="p-6">
        <DataTable columns={columns} data={projects} />
      </Card>
    </>
  );
}
