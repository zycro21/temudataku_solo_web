"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import EventFilters from "@/components/dashboard/user/event/eventFilters";
import EventSection from "@/components/dashboard/user/event/eventSection";
import { Ban } from "lucide-react";
import Link from "next/link";
import axios from "axios";

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: "Berbayar" | "Gratis";
  dateStart: string;
  dateEnd: string;
  schedule: string;
  location: string;
  image: string;
  type: "practice" | "mentoring";
}

const VALID_CATEGORIES = ["Berbayar", "Gratis"] as const;
export type Category = (typeof VALID_CATEGORIES)[number] | "Semua";

// 🔹 Helper untuk format tanggal (bisa fleksibel karena format di API tidak seragam)
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "Jadwal Menyusul"; // 🔹 ubah dari TBA ke Jadwal Menyusul
  try {
    const parsed =
      dateStr.includes("T") || dateStr.includes("-")
        ? new Date(dateStr)
        : new Date(dateStr.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1"));

    if (isNaN(parsed.getTime())) return "Jadwal Menyusul";

    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Jadwal Menyusul";
  }
};

export default function EventDashboardUserPage() {
  const [categoryFilter, setCategoryFilter] = useState<Category>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/new-services?page=1&limit=9`,
          {
            withCredentials: true,
          },
        );

        const fetched = res.data.data.data;

        // Map hasil API ke EventItem[]
        const mapped: EventItem[] = fetched.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description ?? "-",
          category: Number(item.price) === 0 ? "Gratis" : "Berbayar",

          dateStart: item.dateStart,
          dateEnd: item.dateEnd,

          schedule: item.schedule ?? "TBA",
          location:
            item.type === "mentoring"
              ? `Online Mentoring (${item.serviceType ?? "General"})`
              : "Online Practice",
          image: "/assets/dashboard/user/kokok.png",
          type: item.type,
        }));

        setEvents(mapped);
      } catch (error: any) {
        console.error("Gagal mengambil data event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter kategori + pencarian
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchCategory =
        categoryFilter === "Semua" || e.category === categoryFilter;

      const matchSearch =
        searchQuery === "" ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [events, categoryFilter, searchQuery]);

  const isEmpty = filteredEvents.length === 0;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <DashboardHeader />
        <main className="flex-1 px-5 py-4 bg-gray-50 overflow-x-hidden min-w-0">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Event</h1>

          <EventFilters
            categoryFilter={categoryFilter}
            searchQuery={searchQuery}
            onCategoryChange={setCategoryFilter}
            onSearchChange={setSearchQuery}
          />

          {loading ? (
            <div className="flex justify-center py-12 text-sm text-gray-500">
              Memuat event...
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <Ban className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Belum ada event
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Saat ini, Anda belum memiliki event yang dapat diikuti
              </p>
              <Link
                href="/programs"
                className="px-3 py-1.5 text-sm rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition"
              >
                Lihat Program
              </Link>
            </div>
          ) : (
            <EventSection events={filteredEvents} />
          )}
        </main>
      </div>
    </div>
  );
}
