"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Users, BadgeCheck, CalendarClock } from "lucide-react";

interface AyclMenteeHeaderProps {
  refreshKey: number;
}

export default function AyclMenteeHeader({
  refreshKey,
}: AyclMenteeHeaderProps) {
  const [totalPendaftar, setTotalPendaftar] = useState(0);
  const [totalKonfirmasi, setTotalKonfirmasi] = useState(0);
  const [totalMingguIni, setTotalMingguIni] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ayclbooking/stats/ayclbooking`,
        { withCredentials: true },
      );

      const data = res.data.data;

      setTotalPendaftar(data.totalPendaftar ?? 0);
      setTotalKonfirmasi(data.totalKonfirmasi ?? 0);
      setTotalMingguIni(data.totalMingguIni ?? 0);
    } catch (err) {
      console.error("Gagal fetch stats AYCL Mentee:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const stats = [
    {
      label: "Total Pendaftar",
      value: totalPendaftar,
      icon: <Users size={16} className="text-emerald-600" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Terkonfirmasi",
      value: totalKonfirmasi,
      icon: <BadgeCheck size={16} className="text-emerald-600" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Seminggu Terakhir",
      value: totalMingguIni,
      icon: <CalendarClock size={16} className="text-emerald-600" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Headline */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Pendaftar AYCL</h1>
        <p className="text-sm text-gray-500 mt-1">
          Daftar seluruh mentee yang telah mendaftar program All You Can Learn.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`${s.bg} border ${s.border} rounded-xl px-4 py-3 flex items-center gap-3`}
          >
            <div className="shrink-0">{s.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-sm font-semibold text-gray-800">
                {loadingStats ? (
                  <span className="inline-block w-6 h-3 bg-gray-200 rounded animate-pulse" />
                ) : (
                  s.value
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
