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
  ChevronUp,
  ChevronDown,
  ChevronRight,
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
import { columns, Project } from "./columns";

export default function AdminMentorPage() {
  const [exportOpen, setExportOpen] = useState(false);

  const handleExportPayments = async (format: "csv" | "excel") => {
    const loadingToastId = toast.loading(
      `Mengekspor data pembayaran ke ${format.toUpperCase()}...`,
    );

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/payments-export`,
        {
          params: { format }, // bisa ditambah status: 'confirmed' kalau mau filter
          responseType: "blob", // penting agar file diterima sebagai blob
          withCredentials: true,
        },
      );

      const blob = new Blob([res.data], { type: res.headers["content-type"] });

      // Ambil filename dari Content-Disposition
      const contentDisposition = res.headers["content-disposition"];
      let filename = "payments-export";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[1]) filename = match[1];
      } else {
        const timestamp = new Date()
          .toLocaleString("sv-SE")
          .replace(" ", "_")
          .replace(/:/g, "-");
        filename = `payments-${timestamp}.${
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
        description: `Data pembayaran berhasil diekspor (${filename})`,
      });
    } catch (err: any) {
      console.error("Export payments error:", err);

      toast.error("Gagal export data pembayaran", {
        id: loadingToastId,
        description:
          err?.response?.data?.message ??
          "Terjadi kesalahan saat mengekspor data pembayaran",
      });
    }
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

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

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoadingProjects(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/payments`,
          {
            params: {
              page: 1,
              limit: 10000, // ambil semua untuk tabel
            },
            withCredentials: true,
          },
        );

        const payments = res.data.data;

        console.log(res.data);

        const mappedProjects: Project[] = payments.map((p: any) => {
          const user = p.user;

          // --------------------------
          // ID Transaksi — dari merchantOrderId
          // --------------------------
          const paymentId = p.id;

          const displayId = p.merchantOrderId
            ? p.merchantOrderId
            : `${p.id} (Bukan Merchant Order ID)`;

          // --------------------------
          // TYPE
          // --------------------------
          let typeLabel = "-";
          if (p.bookingId) typeLabel = "Mentoring";
          else if (p.eLearningSubscriptionId) typeLabel = "E-Learning";
          else if (p.ayclBookingId) typeLabel = "AYCL";

          // --------------------------
          // PROGRAM
          // --------------------------
          let program = "-";
          if (typeLabel === "Mentoring") {
            program = mapServiceTypeToProgram(
              p.booking?.mentoringService?.serviceType,
            );
          } else if (typeLabel === "E-Learning") {
            const durationDays =
              p.eLearningSubscription?.plan?.durationDay ?? 0;
            const durationMonths =
              durationDays >= 30 ? Math.round(durationDays / 30) : 0;
            program =
              durationMonths > 0
                ? `Subscription ${durationMonths} Bulan eLearning`
                : `Subscription eLearning`;
          } else if (typeLabel === "AYCL") {
            program = p.ayclBooking?.batch?.title ?? "-";
          }

          // --------------------------
          // TOPIK / NAMA PRODUK
          // --------------------------
          let topic = "-";
          if (typeLabel === "Mentoring") {
            topic = p.booking?.mentoringService?.serviceName ?? "-";
          }

          // --------------------------
          // MENTOR (hanya untuk mentoring)
          // --------------------------
          const mentorNames =
            typeLabel === "Mentoring"
              ? (p.booking?.mentoringService?.mentors
                  ?.map((m: any) => m.mentorProfile.user.fullName)
                  .join(", ") ?? "-")
              : "-";

          // --------------------------
          // DATE
          // --------------------------
          const date = p.paymentDate
            ? new Date(p.paymentDate).toLocaleString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "(Belum ada Tanggal, Kemungkinan Belum Dibayar)";

          return {
            paymentId, // ⬅️ murni PK
            displayId,

            mentee: user?.fullName ?? "-",
            mentor: mentorNames,
            program,
            topic,
            date,
            totalHarga: `Rp${Number(p.amount).toLocaleString("id-ID")}`,
            statusTransaksi:
              p.status === "pending"
                ? "Belum Dibayar"
                : p.status === "confirmed"
                  ? "Lunas"
                  : p.status === "failed"
                    ? "Gagal"
                    : p.status === "refunded"
                      ? "Refunded"
                      : "-",
            alasan: "-",
            type: typeLabel,
          };
        });

        setProjects(mappedProjects);
      } catch (error) {
        console.error("Gagal fetch payments:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchPayments();
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
    const fetchPayments = async () => {
      try {
        setLoadingStats(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/payments`,
          {
            params: {
              page: 1,
              limit: 10000,
            },
            withCredentials: true,
          },
        );

        const statsFromApi = res.data.stats;

        setStats([
          {
            title: "Total Transaksi",
            value: statsFromApi.total.toString(),
            image: "/assets/admin/trans.svg",
            color: "text-gray-900",
          },
          {
            title: "Berhasil",
            value: statsFromApi.success.toString(),
            image: "/assets/admin/menteeac.svg",
            color: "text-green-600",
          },
          {
            title: "Proses",
            value: statsFromApi.process.toString(),
            image: "/assets/admin/penjadwalanulang.svg",
            color: "text-blue-600",
          },
          {
            title: "Gagal",
            value: statsFromApi.failed.toString(),
            image: "/assets/admin/menteenonac.svg",
            color: "text-orange-600",
          },
          {
            title: "Dikembalikan",
            value: statsFromApi.refunded.toString(),
            image: "/assets/admin/transdikembalikan.svg",
            color: "text-red-600",
          },
        ]);
      } catch (error) {
        console.error("Gagal mengambil payment stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchPayments();
  }, []);

  const StatCardSkeleton = () => (
    <Card className="w-full px-0 py-2 rounded-lg bg-white shadow-sm">
      <CardHeader className="flex items-center justify-between px-5 pt-2 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
      </CardHeader>

      <CardContent className="px-5 pt-0 pb-3">
        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        {/* Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-0.5">
            Transaksi
          </h1>
          <p className="text-sm text-gray-500">Transaksi</p>
        </div>

        {/* Export Button */}
        <DropdownMenu onOpenChange={(open) => setExportOpen(open)}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-1.5 h-9 px-3 text-sm
        bg-white hover:bg-gray-50 border border-gray-300"
            >
              <Download className="w-4 h-4" />
              <span className="whitespace-nowrap">Export</span>

              {exportOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-36 text-sm">
            <DropdownMenuItem onClick={() => handleExportPayments("csv")}>
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportPayments("excel")}>
              Export Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {loadingStats
          ? Array.from({ length: 5 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : stats.map((stat, index) => (
              <Card
                key={index}
                className="
            w-full
            flex flex-col justify-between
            px-0 py-1.5
            shadow-sm hover:shadow-md
            transition-all duration-200
            cursor-pointer rounded-md bg-white
          "
              >
                {/* Header */}
                <CardHeader className="flex items-center justify-between px-3 pt-2 pb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <Image
                      src={stat.image}
                      alt={stat.title}
                      width={14}
                      height={14}
                      className="opacity-90"
                    />
                    <CardTitle className="text-xs font-medium text-gray-600 truncate">
                      {stat.title}
                    </CardTitle>
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </CardHeader>

                {/* Content */}
                <CardContent className="px-3 pt-0 pb-2">
                  <p
                    className={`text-xl font-bold leading-tight ${stat.color}`}
                  >
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        Daftar Transaksi
      </h2>

      {/* DataTable */}
      <Card className="p-6">
        <DataTable columns={columns} data={projects} />
      </Card>
    </>
  );
}
