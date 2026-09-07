"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import StatCards from "@/components/dashboard/user/statCards";
import ChartSection from "@/components/dashboard/user/chartSection";
import ScheduleSection from "@/components/dashboard/user/scheduleSection";
import ActivitySection from "@/components/dashboard/user/activitySection";
import RecommendationSection from "@/components/dashboard/user/recommendationSection";
import axios from "axios";

export default function MainDashboardUserPage() {
  const [user, setUser] = useState<any>(null);
  // 🔥 BARU: state buka/tutup drawer sidebar khusus mobile
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
          { withCredentials: true },
        );
        setUser(res.data.data);
      } catch (err) {
        console.error("Gagal fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  // Ambil nama pertama minimal 2 huruf
  const getFirstName = (fullName: string) => {
    if (!fullName) return "User";
    const parts = fullName.trim().split(/\s+/);
    let first = parts.find((p) => p.length >= 2) || parts[0];
    return first;
  };

  const firstName = user ? getFirstName(user.fullName) : "User";

  return (
    <div className="flex">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Konten kanan */}
      {/* 🔥 DIUBAH: dulu selalu "ml-64" (mepet ke lebar sidebar yang
          selalu tampil) — sekarang "ml-0 md:ml-64": di mobile sidebar-nya
          drawer/overlay (nggak makan tempat), jadi konten full width;
          begitu masuk breakpoint md ke atas, balik persis "ml-64" seperti
          semula. */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 min-w-0">
        <DashboardHeader
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* 🔥 DIUBAH: px-5 → px-3 md:px-5, biar konten nggak terlalu
            mepet ke tepi layar di HP; di desktop tetap px-5 seperti
            semula. */}
        <main className="flex-1 px-3 md:px-5 py-4 bg-gray-50 overflow-x-hidden">
          {/* 🔥 BARU: kartu sapaan khusus MOBILE (md:hidden) — avatar
              inisial + sapaan + subtitle kecil, biar nggak polos cuma
              teks doang di layar sempit. TIDAK muncul di desktop sama
              sekali (digantikan <h1> di bawahnya). */}
          <div className="md:hidden mb-4 rounded-xl bg-white border border-gray-200 p-4 flex items-center gap-3">
            {/* <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-sm">
              {firstName.charAt(0).toUpperCase()}
            </div> */}
            <div className="min-w-0">
              <p className="text-base font-semibold text-gray-800 truncate">
                Halo, {firstName}
              </p>
              <p className="text-[11px] text-gray-500">
                Selamat datang kembali di TemuDataku
              </p>
            </div>
          </div>

          {/* 🔥 DIUBAH: <h1> ASLI ini TIDAK diubah sama sekali (teks,
              class, posisinya identik) — cuma ditambah "hidden md:block"
              biar disembunyikan di mobile (digantikan kartu welcome di
              atas) dan tampil PERSIS seperti semula mulai breakpoint md
              ke atas (desktop 100% tidak berubah). */}
          <h1 className="hidden md:block text-xl font-semibold text-gray-800 mb-4">
            Halo, {firstName}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kiri */}
            <div className="space-y-4 min-w-0">
              <StatCards />
              <ChartSection />
            </div>

            {/* Kanan */}
            <div className="space-y-4 min-w-0">
              <ScheduleSection />
              <ActivitySection />
            </div>
          </div>

          <div className="mt-4 mb-5">{/* <RecommendationSection /> */}</div>
        </main>
      </div>
    </div>
  );
}
