"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  ScriptableContext,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { toast } from "sonner";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface ActivityLog {
  id: string;
  page: string;
  durationSec: number;
  accessedAt: string;
}

export default function ChartSection() {
  const [activeTab, setActiveTab] = useState<"Week" | "Month">("Month");
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logActivity/activity`,
          {
            params: {
              page: 1,
              limit: 1000,
              sortBy: "accessedAt",
              sortOrder: "asc",
            },
            withCredentials: true,
          },
        );
        setLogs(res.data?.data || []);
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.response?.data?.message ||
            "Gagal memuat data aktivitas pengguna.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, []);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentWeek = Math.ceil(now.getDate() / 7);

  const monthlyTotals = new Array(12).fill(0);
  logs.forEach((log) => {
    const month = new Date(log.accessedAt).getMonth();
    monthlyTotals[month] += log.durationSec;
  });

  const weeklyTotals = new Array(4).fill(0);
  logs
    .filter((log) => new Date(log.accessedAt).getMonth() === currentMonth)
    .forEach((log) => {
      const day = new Date(log.accessedAt).getDate();
      const week = Math.ceil(day / 7) - 1;
      if (week >= 0 && week < 4) weeklyTotals[week] += log.durationSec;
    });

  // 🔥 BARU: total durasi periode yang lagi ditampilin — dihitung dari
  // data yang SUDAH ada di state (monthlyTotals/weeklyTotals), murni
  // tampilan tambahan, TIDAK ada request baru ke backend. Cuma dipakai
  // di ringkasan mobile di bawah.
  const totalSecondsForActiveTab =
    (activeTab === "Month"
      ? monthlyTotals[currentMonth]
      : weeklyTotals[currentWeek - 1]) || 0;
  const totalMinutesForActiveTab = Math.floor(totalSecondsForActiveTab / 60);

  const data =
    activeTab === "Month"
      ? {
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Durasi Lihat Halaman (detik)",
              data: monthlyTotals,
              backgroundColor: (context: ScriptableContext<"bar">) => {
                const index = context.dataIndex;
                return index === currentMonth ? "#10B981" : "#D1FAE5";
              },
              borderRadius: 4,
              barPercentage: 0.6,
              categoryPercentage: 0.8,
            },
          ],
        }
      : {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              label: "Durasi Lihat Halaman (detik)",
              data: weeklyTotals,
              backgroundColor: (context: ScriptableContext<"bar">) => {
                const index = context.dataIndex;
                return index + 1 === currentWeek ? "#10B981" : "#D1FAE5";
              },
              borderRadius: 4,
              barPercentage: 0.6,
              categoryPercentage: 0.8,
            },
          ],
        };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#ccc",
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const seconds = context.raw || 0;
            const minutes = Math.floor(seconds / 60);
            return `${minutes} menit`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: (ctx: any) => {
            // Warna label emerald untuk bulan/week aktif
            const index = ctx.index;
            if (
              (activeTab === "Month" && index === currentMonth) ||
              (activeTab === "Week" && index + 1 === currentWeek)
            ) {
              return "#10B981"; // emerald
            }
            return "#6B7280"; // abu default
          },
        },
        border: { display: false },
      },
      y: {
        display: false,
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm w-full overflow-hidden">
      {/* 🔥 DIUBAH: dulu selalu flex-row (judul kiri, toggle kanan) dalam
          satu baris. Di mobile (<640px) sekarang ditumpuk (flex-col) dan
          toggle-nya full-width, dibagi rata 2 tombol — biar nggak
          mepet/kepotong di layar sempit. Mulai sm: ke atas balik PERSIS
          flex-row seperti semula. */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3">
        <h2 className="text-sm font-semibold text-gray-800">
          Waktu Lihat Halaman
        </h2>

        <div className="flex bg-gray-100 p-0.5 rounded-full text-[11px] font-medium w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("Week")}
            className={`flex-1 sm:flex-none px-3 py-1 sm:py-0.5 rounded-full transition ${
              activeTab === "Week"
                ? "bg-emerald-500 text-white"
                : "text-gray-500"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setActiveTab("Month")}
            className={`flex-1 sm:flex-none px-3 py-1 sm:py-0.5 rounded-full transition ${
              activeTab === "Month"
                ? "bg-emerald-500 text-white"
                : "text-gray-500"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* 🔥 BARU: ringkasan total durasi, CUMA muncul di mobile
          (sm:hidden) — angkanya dari data yang sudah di-fetch, bukan
          request baru. Ngasih konteks cepat tanpa perlu baca chart. */}
      {!loading && (
        <p className="sm:hidden text-[11px] text-gray-500 mb-2">
          Total {activeTab === "Month" ? "bulan ini" : "minggu ini"}:{" "}
          <span className="font-semibold text-emerald-600">
            {totalMinutesForActiveTab} menit
          </span>
        </p>
      )}

      {/* 🔥 DIUBAH: tinggi chart sedikit dipendekkan di mobile
          (h-[160px]), balik ke h-[200px] (original) mulai sm: ke atas. */}
      <div className="h-[160px] sm:h-[200px] relative">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <Bar data={data} options={options} />
            {data.datasets[0].data.every((v: number) => v === 0) && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg pointer-events-none">
                <p className="text-gray-500 text-xs font-medium">
                  Belum ada data aktivitas
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
