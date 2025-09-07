"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import EventFilters from "@/components/dashboard/user/event/eventFilters";
import EventSection from "@/components/dashboard/user/event/eventSection";
import { Ban } from "lucide-react";
import Link from "next/link";

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
}

const VALID_CATEGORIES = ["Berbayar", "Gratis"] as const;
export type Category = (typeof VALID_CATEGORIES)[number] | "Semua";

export default function EventDashboardUserPage() {
  const [categoryFilter, setCategoryFilter] = useState<Category>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // 🔑 type guard agar TS yakin category valid
  const isValidCategory = (
    cat: string
  ): cat is (typeof VALID_CATEGORIES)[number] =>
    (VALID_CATEGORIES as readonly string[]).includes(cat);

  // Dummy data event
  const allEvents: EventItem[] = [
    {
      id: "1",
      title: "How To Become Data Scientist",
      description:
        "Ingin memulai karir di bidang data science tapi tidak tahu harus mulai dari mana? Webinar ini hadir untuk membantu kamu memahami langkah-langkah konkret menjadi seorang Data Scientist!",
      category: "Berbayar",
      dateStart: "05 Maret 2025",
      dateEnd: "10 Maret 2025",
      schedule: "12 Maret 2025",
      location: "Zoom Meeting",
      image: "",
    },
    {
      id: "2",
      title: "How To Become Data Scientist",
      description:
        "Ingin memulai karir di bidang data science tapi tidak tahu harus mulai dari mana? Webinar ini hadir untuk membantu kamu memahami langkah-langkah konkret menjadi seorang Data Scientist!",
      category: "Gratis",
      dateStart: "05 Maret 2025",
      dateEnd: "10 Maret 2025",
      schedule: "12 Maret 2025",
      location: "Zoom Meeting",
      image: "",
    },
  ].filter((e): e is EventItem => isValidCategory(e.category));

  // Filter data
  const filteredEvents = useMemo(() => {
    return allEvents.filter((e) => {
      const matchCategory =
        categoryFilter === "Semua" || e.category === categoryFilter;
      const matchSearch =
        searchQuery === "" ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [allEvents, categoryFilter, searchQuery]);

  const isEmpty = filteredEvents.length === 0;

  return (
    <div className="flex mb-8">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-72">
        <DashboardHeader />
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">Event</h1>

          {/* Filter Section */}
          <EventFilters
            categoryFilter={categoryFilter}
            searchQuery={searchQuery}
            onCategoryChange={setCategoryFilter}
            onSearchChange={setSearchQuery}
          />

          {/* Jika kosong → fallback */}
          {isEmpty ? (
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
