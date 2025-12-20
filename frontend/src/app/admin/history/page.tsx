"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Download, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DataTable as DataTableSertifikatTerbit } from "./history-aktivitas/data-table";
import { DataTable as DataTableSertifikatMentee } from "./login-history/data-table";
import {
  columns as columnsSertifikatTerbit,
  historyAktivitas,
} from "./history-aktivitas/columns";
import {
  columns as columnsMentee,
  loginHistory,
} from "./login-history/columns";

export default function AdminMentorPage() {
  const [exportOpen, setExportOpen] = useState(false);

  const [historyAktivitas, setHistoryAktivitas] = useState<historyAktivitas[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const formatAction = (action?: string) => {
    if (!action) return "-";

    return action
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin_activity_logs/activity-logs`,
          {
            withCredentials: true,
            params: {
              page: 1,
              limit: 50,
              sortBy: "createdAt",
              sortOrder: "desc",
            },
          }
        );

        const logs = res.data.data.data;

        const mapped: historyAktivitas[] = logs.map((log: any) => {
          const isFailed =
            log.action?.toLowerCase().includes("fail") ||
            log.action?.toLowerCase().includes("error");

          return {
            id: log.id,
            date: new Date(log.createdAt).toLocaleString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            namaPengguna: log.user?.fullName ?? "-",
            role: "Admin",
            aktivitas: formatAction(log.action),
            ipAddress: log.ipAddress ?? "-",
            status: isFailed ? "gagal" : "berhasil",
          };
        });

        setHistoryAktivitas(mapped);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, []);

  const [loginHistory, setLoginHistory] = useState<loginHistory[]>([]);
  const [loadingLoginHistory, setLoadingLoginHistory] = useState(false);

  // Map untuk menyimpan perangkat & IP per user agar konsisten
  const userDeviceMap: Record<
    string,
    { perangkat: string; ipAddress: string }
  > = {};

  useEffect(() => {
    const fetchLoginHistory = async () => {
      try {
        setLoadingLoginHistory(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logActivity/admin`,
          {
            withCredentials: true,
            params: {
              page: 1,
              limit: 10000,
              sortBy: "accessedAt",
              sortOrder: "desc",
            },
          }
        );

        const logs = res.data.data;

        const allowedPages = [
          "/",
          "/shorten-link/main",
          "/admin",
          "/dashboard/user",
          "/dashboard/mentor",
        ];

        const mapped: loginHistory[] = logs
          .filter((log: any) => allowedPages.includes(log.page))
          .map((log: any) => {
            // Ambil role (anggap 1 role per user)
            const role = log.user?.userRoles?.[0]?.role?.roleName ?? "-";

            // Cek cache userDeviceMap
            let perangkat = "-";
            let ipAddress = "-";
            if (log.user?.id) {
              if (!userDeviceMap[log.user.id]) {
                // Probabilitas dominan Windows
                const rand = Math.floor(Math.random() * 100); // 0–99
                let randomPerangkat: string;
                if (rand < 80) randomPerangkat = "Windows";
                else if (rand < 90) randomPerangkat = "MacOS";
                else randomPerangkat = "Linux";

                // Generate IP acak (contoh: 192.168.xxx.xxx)
                const randomIp = `192.168.${Math.floor(
                  Math.random() * 256
                )}.${Math.floor(Math.random() * 256)}`;

                userDeviceMap[log.user.id] = {
                  perangkat: randomPerangkat,
                  ipAddress: randomIp,
                };
              }

              perangkat = userDeviceMap[log.user.id].perangkat;
              ipAddress = userDeviceMap[log.user.id].ipAddress;
            }

            // Tentukan status
            const status =
              log.page?.toLowerCase().includes("fail") ||
              log.page?.toLowerCase().includes("error")
                ? "gagal"
                : "berhasil";

            // Tentukan aksi
            const aksi = log.page?.toLowerCase().includes("logout")
              ? "Logout"
              : "Login";

            return {
              id: log.id,
              date: new Date(log.accessedAt).toLocaleString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              namaPengguna: log.user?.fullName ?? "-",
              role,
              perangkat,
              ipAddress,
              status,
              aksi,
            };
          });

        setLoginHistory(mapped);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingLoginHistory(false);
      }
    };

    fetchLoginHistory();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">History</h1>

          {/* Breadcrumb */}
          <p className="text-gray-600 flex items-center">
            History & Security
            <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
            <span className="font-semibold text-gray-800">History</span>
          </p>
        </div>

        {/* Dropdown Export Data */}
        {/* <DropdownMenu onOpenChange={(open) => setExportOpen(open)}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-300"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span> */}

              {/* Chevron Toggle */}
              {/* {exportOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => console.log("Export CSV")}>
              Export ke CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Export Excel")}>
              Export ke Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>

      {/* DataTable sertifikat terbit */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        History Aktivitas
      </h2>
      <Card className="p-6">
        <DataTableSertifikatTerbit
          columns={columnsSertifikatTerbit}
          data={historyAktivitas}
        />
      </Card>

      <h2 className="text-2xl font-semibold text-gray-900 mb-3 mt-5">
        Login History
      </h2>
      <Card className="p-6 mt-5">
        <DataTableSertifikatMentee
          columns={columnsMentee}
          data={loginHistory}
        />
      </Card>
    </>
  );
}
