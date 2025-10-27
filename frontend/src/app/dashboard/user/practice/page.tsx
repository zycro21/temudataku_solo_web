"use client";

import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import PracticeFilters from "@/components/dashboard/user/practice/practiceFilters";
import PracticeSection from "@/components/dashboard/user/practice/practiceSection";
import { Ban } from "lucide-react";
import Link from "next/link";

interface Practice {
  id: string;
  title: string;
  description: string;
  level: "Pemula" | "Menengah" | "Ahli";
  status: "Belum Dikerjakan" | "Selesai" | "Sudah Direview";
  dateStart: string;
  dateEnd: string;
  image: string;
  detailUrl: string;
  submission?: {
    notes: string;
    fileName: string;
    fileSize: string;
    fileUrl: string;
  };
  review?: {
    penilaian: {
      kesesuaian: string;
      kualitas: string;
      kreativitas: string;
      kelengkapan: string;
    };
    feedback: {
      komentar: string;
      saran: string;
      perluRevisi: "Ya" | "Tidak";
    };
  };
}

export default function PracticeDashboardUserPage() {
  const [levelFilter, setLevelFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPractices = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/practice/mentees/practice-purchases`,
          {
            withCredentials: true,
            params: {
              page: 1,
              limit: 100,
            },
          }
        );

        const apiData = res.data.data.data.map((p: any) => {
          const material = p.practice.practiceMaterials?.[0];
          const review = p.practice.practiceReviews?.[0];

          // Hitung tanggal start = 1 hari setelah purchaseDate
          const purchaseDate = new Date(p.purchaseDate);
          const startDate = new Date(purchaseDate);
          startDate.setDate(startDate.getDate() + 1);

          // Hitung tanggal end = 20 hari setelah startDate
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 20);

          return {
            id: p.practice.id,
            title: p.practice.title,
            description: p.practice.description,
            // ambil dari "practiceType"
            level: p.practice.practiceType || "Pemula",
            // status tetap sama seperti logika sebelumnya
            status:
              review != null
                ? "Sudah Direview"
                : material
                ? "Selesai"
                : "Belum Dikerjakan",
            // gunakan tanggal hasil kalkulasi
            dateStart: startDate.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }),
            dateEnd: endDate.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }),
            // ambil dari "thumbnailImages"
            image:
              p.practice.thumbnailImages?.[0] || "/images/default-practice.jpg",
            detailUrl: `/practice/${p.practice.id}`,
            review: review
              ? {
                  penilaian: {
                    kesesuaian: "Sangat Sesuai",
                    kualitas: "Baik",
                    kreativitas: "Baik",
                    kelengkapan: "Lengkap",
                  },
                  feedback: {
                    komentar: review.comment || "",
                    saran: "",
                    perluRevisi: "Tidak",
                  },
                }
              : undefined,
          };
        });

        setPractices(apiData);
      } catch (err) {
        console.error("Error fetching practices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPractices();
  }, [searchQuery, statusFilter]);

  const filteredPractice = useMemo(() => {
    return practices.filter((p) => {
      const matchLevel = levelFilter === "Semua" || p.level === levelFilter;
      const matchStatus = statusFilter === "Semua" || p.status === statusFilter;
      const matchSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLevel && matchStatus && matchSearch;
    });
  }, [practices, levelFilter, statusFilter, searchQuery]);

  const groupedPractice = useMemo(() => {
    const groups: Record<string, Practice[]> = {};
    filteredPractice.forEach((p) => {
      if (!groups[p.status]) groups[p.status] = [];
      groups[p.status].push(p);
    });
    return groups;
  }, [filteredPractice]);

  const isEmpty = Object.keys(groupedPractice).length === 0;

  return (
    <div className="flex mb-8">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-72">
        <DashboardHeader />
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            Practice
          </h1>

          <PracticeFilters
            levelFilter={levelFilter}
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            onLevelChange={setLevelFilter}
            onStatusChange={setStatusFilter}
            onSearchChange={setSearchQuery}
          />

          {loading ? (
            <p className="text-gray-500">Memuat data...</p>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <Ban className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-700 font-semibold mb-1">
                Belum ada practice
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Tidak ditemukan practice yang sesuai
              </p>
              <Link
                href="/practice"
                className="px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition cursor-pointer"
              >
                Ikuti practice
              </Link>
            </div>
          ) : (
            Object.entries(groupedPractice).map(([status, practices]) => (
              <PracticeSection
                key={status}
                title={status}
                practices={practices}
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
}
