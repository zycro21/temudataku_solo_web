"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Download,
  Users,
  UserCheck,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "./jadwal-sesi/data-table";
import { columns, SesiMentoring } from "./jadwal-sesi/columns";

export default function AdminMentorPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [exportOpen, setExportOpen] = useState(false);

  const handleExportMentoringSessions = async (format: "csv" | "excel") => {
    const loadingToastId = toast.loading(
      `Mengekspor sesi mentoring ke ${format.toUpperCase()}...`
    );

    try {
      // sesuaikan param format
      const apiFormat = format === "excel" ? "xlsx" : "csv";

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/admin/export`,
        {
          params: { format: apiFormat },
          responseType: "blob",
          withCredentials: true,
        }
      );

      const blob = new Blob([res.data], { type: res.headers["content-type"] });

      // BUAT TIMESTAMP FILE
      const now = new Date();
      const timestamp = now
        .toLocaleString("sv-SE")
        .replace(" ", "_")
        .replace(/:/g, "-");

      const extension = apiFormat; // csv/xlsx
      const filename = `mentoring-sessions-${timestamp}.${extension}`;

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
        description: `Data sesi mentoring berhasil diekspor (${filename})`,
      });
    } catch (err: any) {
      console.error("Export mentoring sessions error:", err);

      toast.error("Gagal export data sesi mentoring", {
        id: loadingToastId,
        description:
          err?.response?.data?.message ??
          "Terjadi kesalahan saat mengekspor data sesi mentoring",
      });
    }
  };

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

  const formatDuration = (minutes: number) => {
    const hours = minutes / 60;
    return hours >= 1 ? `${hours.toFixed(2)} jam` : `${minutes} menit`;
  };

  const formatHourMinute = (iso: string) =>
    new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const [mentees, setMentees] = useState<SesiMentoring[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMentoringSessions = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/admin/mentoring-sessions`,
          {
            withCredentials: true,
            params: {
              page: "1",
              limit: "10000",
            },
          }
        );

        const mapped: SesiMentoring[] = res.data.data.map((session: any) => {
          const mentorProfile = session.mentors?.[0]?.mentorProfile;
          const service = session.mentoringService;

          const topik = service
            ? service.serviceName +
              (service.description ? ` - ${service.description}` : "")
            : "-";

          // Dokumen pendukung (nama file saja)
          let dokumenPendukung = "-";
          if (session.supportDocument && session.supportDocument !== "[]") {
            try {
              const docs = JSON.parse(session.supportDocument);
              if (Array.isArray(docs) && docs.length > 0) {
                dokumenPendukung = docs
                  .map((d: string) => d.split("/").pop())
                  .join(", ");
              }
            } catch {
              dokumenPendukung =
                session.supportDocument.split("/").pop() ?? "-";
            }
          }

          const start = session.startTime
            ? formatHourMinute(session.startTime)
            : "-";

          const end = session.endTime ? formatHourMinute(session.endTime) : "-";

          return {
            id: session.id,
            serviceId: service?.id ?? "",
            mentor: mentorProfile?.user?.fullName ?? "-",
            mentorProfileId: mentorProfile?.id ?? "",
            program: mapServiceTypeToProgram(service?.serviceType),
            topik,

            rawDate: session.date, // "20-10-2025"
            rawStartTime: session.startTime, // ISO
            rawEndTime: session.endTime, // ISO
            // GABUNG TANGGAL + JAM
            date: `${session.date} (${start} - ${end})`,

            durasi: formatDuration(session.durationMinutes),
            dokumenPendukung,
            ukuranFile: session.supportDocumentSizes?.[0] ?? null,
            status: session.status ?? "-",
          };
        });

        setMentees(mapped);
      } catch (error) {
        console.error("Gagal mengambil sesi mentoring", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentoringSessions();
  }, []);

  const fetchAdminBookings = async (params: Record<string, any> = {}) => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/admin/bookings`,
      {
        params: {
          page: 1,
          limit: 10000,
          ...params,
        },
        withCredentials: true,
      }
    );

    return res.data.data.meta.total as number;
  };

  const fetchAdminMentoringSessionsCount = async (
    params: Record<string, any> = {}
  ) => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/admin/mentoring-sessions`,
      {
        params: {
          page: 1,
          limit: 1000,
          ...params,
        },
        withCredentials: true,
      }
    );

    return res.data.pagination.totalItems as number;
  };

  const formatDateWIB = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const fetchStats = async () => {
    const [
      totalBookings,
      totalLast7Days,
      // mentoring session based
      scheduledSessions,
      cancelledSessions,
      completedSessions,
      // tetap booking
      rescheduledCount,
    ] = await Promise.all([
      // 1. Mentoring Terdaftar (booking)
      fetchAdminBookings(),

      // 2. Change 7 hari (booking)
      fetchAdminBookings({
        startDate: formatDateWIB(sevenDaysAgo),
        endDate: formatDateWIB(today),
      }),

      // 3. Terjadwal (MENTORING SESSION)
      fetchAdminMentoringSessionsCount({ status: "scheduled" }),

      // 4. Dibatalkan (MENTORING SESSION)
      fetchAdminMentoringSessionsCount({ status: "cancelled" }),

      // 5. Selesai (MENTORING SESSION)
      fetchAdminMentoringSessionsCount({ status: "completed" }),

      // 6. Penjadwalan ulang (booking)
      fetchAdminBookings({ isRescheduled: true }),
    ]);

    return {
      mentoringTerdaftar: totalBookings,
      mentoringChange: totalLast7Days,
      // sudah FULL dari mentoring session
      terjadwal: scheduledSessions,
      dibatalkan: cancelledSessions,
      selesai: completedSessions,
      // tetap booking
      penjadwalanUlang: rescheduledCount,
    };
  };

  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);

        const result = await fetchStats();

        setStats([
          {
            title: "Mentoring Terdaftar",
            value: result.mentoringTerdaftar.toString(),
            change: `+${result.mentoringChange} minggu ini`,
            image: "/assets/admin/mentorterdaftar.svg",
          },
          {
            title: "Terjadwal",
            value: result.terjadwal.toString(),
            image: "/assets/dashboard/user/jadwal.svg",
            color: "text-blue-600",
          },
          {
            title: "Penjadwalan Ulang",
            value: result.penjadwalanUlang.toString(),
            image: "/assets/admin/penjadwalanulang.svg",
            color: "text-orange-600",
          },
          {
            title: "Dibatalkan",
            value: result.dibatalkan.toString(),
            image: "/assets/admin/menteenonac.svg",
            color: "text-red-600",
          },
          {
            title: "Selesai",
            value: result.selesai.toString(),
            image: "/assets/admin/menteeac.svg",
            color: "text-green-600",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const StatsCardSkeleton = () => (
    <Card className="max-w-[340px] w-full px-5 py-4 rounded-lg bg-white shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className="w-32 h-4 bg-gray-200 rounded" />
        </div>
        <div className="w-5 h-5 bg-gray-200 rounded" />
      </div>

      <div className="flex items-center gap-3">
        <div className="w-20 h-10 bg-gray-300 rounded" />
        <div className="w-24 h-6 bg-gray-200 rounded-full" />
      </div>
    </Card>
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Jadwal Sesi
          </h1>

          {/* Breadcrumb */}
          <p className="text-gray-600 flex items-center">
            Kelola Mentoring
            <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
            <span className="font-semibold text-gray-800">Jadwal Sesi</span>
          </p>
        </div>

        {mounted && (
          <DropdownMenu onOpenChange={(open) => setExportOpen(open)}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-300"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>

                {exportOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40" forceMount>
              <DropdownMenuItem
                onClick={() => handleExportMentoringSessions("csv")}
              >
                Export ke CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExportMentoringSessions("excel")}
              >
                Export ke Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <StatsCardSkeleton key={index} />
            ))
          : stats.map((stat, index) => (
              <Card
                key={index}
                className="max-w-[340px] w-full flex flex-col justify-between px-0 py-2
          shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200
          cursor-pointer rounded-lg bg-white"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-2 pb-1">
                  <div className="flex items-center gap-3">
                    <Image
                      src={stat.image}
                      alt={stat.title}
                      width={15}
                      height={15}
                      className="opacity-90"
                    />

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
        Jadwal Sesi Mentoring
      </h2>

      {/* DataTable */}
      <Card className="p-6">
        <DataTable columns={columns} data={mentees} />
      </Card>
    </>
  );
}
