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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
          { withCredentials: true }
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
    <div className="flex mb-8">
      <Sidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-72">
        <DashboardHeader />
        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            Halo, {firstName}
          </h1>

          {/* Grid utama: kiri (2 kolom), kanan (1 kolom) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Kiri */}
            <div className="space-y-6">
              <StatCards />
              <ChartSection />
            </div>

            {/* Kanan */}
            <div className="space-y-6">
              <ScheduleSection />
              <ActivitySection />
            </div>
          </div>

          <RecommendationSection />
        </main>
      </div>
    </div>
  );
}
