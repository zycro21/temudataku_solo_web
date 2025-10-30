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
          }
        );

        const fetched = res.data.data.data;

        // Map hasil API ke EventItem[]
        const mapped: EventItem[] = fetched.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description ?? "-",
          category: Number(item.price) === 0 ? "Gratis" : "Berbayar",
          dateStart: formatDate(item.dateStart),
          dateEnd: formatDate(item.dateEnd),
          schedule: item.schedule ?? "TBA",
          location:
            item.type === "mentoring"
              ? `Online Mentoring (${item.serviceType ?? "General"})`
              : "Online Practice",
          image: "/assets/dashboard/user/kokok.png",
          type: item.type
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
    const now = new Date();

    return events.filter((e) => {
      // 🔹 Filter kategori & pencarian
      const matchCategory =
        categoryFilter === "Semua" || e.category === categoryFilter;
      const matchSearch =
        searchQuery === "" ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Konversi kembali dateStart untuk filter waktu
      const rawDateStart = e.dateStart?.toLowerCase().includes("jadwal")
        ? null
        : new Date(e.dateStart);
      const rawDateEnd = e.dateEnd?.toLowerCase().includes("jadwal")
        ? null
        : new Date(e.dateEnd);

      const isUpcoming =
        !rawDateStart || isNaN(rawDateStart.getTime()) // jadwal menyusul
          ? true
          : rawDateStart >= now; // hanya event yang belum lewat

      return matchCategory && matchSearch && isUpcoming;
    });
  }, [events, categoryFilter, searchQuery]);

  const isEmpty = filteredEvents.length === 0;

  return (
    <div className="flex mb-8">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-72">
        <DashboardHeader />
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">Event</h1>

          <EventFilters
            categoryFilter={categoryFilter}
            searchQuery={searchQuery}
            onCategoryChange={setCategoryFilter}
            onSearchChange={setSearchQuery}
          />

          {loading ? (
            <div className="flex justify-center py-20 text-gray-500">
              Memuat event...
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <Ban className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-700 font-semibold mb-1">
                Belum ada event
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Saat ini, Anda belum memiliki event yang dapat diikuti
              </p>
              <Link
                href="/programs"
                className="px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition cursor-pointer"
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
