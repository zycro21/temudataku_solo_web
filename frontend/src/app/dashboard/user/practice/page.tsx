"use client";

import { useState, useMemo } from "react";
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

const VALID_LEVELS = ["Pemula", "Menengah", "Ahli"] as const;
const VALID_STATUS = ["Belum Dikerjakan", "Selesai", "Sudah Direview"] as const;

export default function PracticeDashboardUserPage() {
  const [levelFilter, setLevelFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy data practice
  const rawPractice: Practice[] = [
    {
      id: "1",
      title: "EDA practice",
      description:
        "Practice ini berfokus memberikan pemahaman lebih terkait EDA dengan topik kesehatan.",
      level: "Pemula",
      status: "Belum Dikerjakan",
      dateStart: "05 Maret 2025",
      dateEnd: "10 Maret 2025",
      image: "",
      detailUrl: "/practice/1", // bisa route berbeda
    },
    {
      id: "2",
      title: "Data Cleaning practice",
      description:
        "Practice ini berfokus memberikan pemahaman lebih terkait Data Cleaning dengan dataset real.",
      level: "Menengah",
      status: "Belum Dikerjakan",
      dateStart: "05 Maret 2025",
      dateEnd: "10 Maret 2025",
      image: "",
      detailUrl: "https://drive.google.com/example-link-2", // bisa link drive
    },
    {
      id: "3",
      title: "Modeling practice",
      description:
        "Practice ini berfokus memberikan pemahaman lebih terkait Machine Learning Modeling.",
      level: "Pemula",
      status: "Selesai",
      dateStart: "05 Maret 2025",
      dateEnd: "10 Maret 2025",
      image: "",
      detailUrl: "/practice/3",
      submission: {
        notes:
          "Forecasting memang tidak dimulai dari code scratch, tapi dari hasil akurasi sudah sangat bagus sekaliiiii",
        fileName: "Prediction.pdf",
        fileSize: "400 KB",
        fileUrl: "#",
      },
    },
    {
      id: "4",
      title: "Machine Learning Advance",
      description:
        "Practice ini berfokus memberikan pemahaman lebih terkait Machine Learning Advance.",
      level: "Menengah",
      status: "Sudah Direview",
      dateStart: "05 September 2025",
      dateEnd: "10 September 2025",
      image: "",
      detailUrl: "/practice/3",
      submission: {
        notes: "Tugas Machine Learning di Cloud VPS",
        fileName: "Prediction.pdf",
        fileSize: "1200 KB",
        fileUrl: "#",
      },
      review: {
        penilaian: {
          kesesuaian: "Cukup Sesuai",
          kualitas: "Sangat Baik",
          kreativitas: "Cukup Baik",
          kelengkapan: "Lengkap",
        },
        feedback: {
          komentar: "Sudah oke, analisis cloud cukup detail.",
          saran: "Bisa coba gunakan AutoML untuk eksperimen tambahan.",
          perluRevisi: "Tidak",
        },
      },
    },
    {
      id: "5",
      title: "Deep Learning Practice",
      description: "Practice ini fokus pada CNN untuk image classification.",
      level: "Ahli",
      status: "Sudah Direview",
      dateStart: "15 September 2025",
      dateEnd: "20 September 2025",
      image: "",
      detailUrl: "/practice/5",
      submission: {
        notes: "Model CNN cukup optimal dengan 90% akurasi.",
        fileName: "CNN_Model.pdf",
        fileSize: "800 KB",
        fileUrl: "#",
      },
      review: {
        penilaian: {
          kesesuaian: "Sangat Sesuai",
          kualitas: "Cukup Baik",
          kreativitas: "Sangat Baik",
          kelengkapan: "Perlu Revisi",
        },
        feedback: {
          komentar: "Struktur CNN bagus, tapi dokumentasi masih kurang.",
          saran: "Lengkapi laporan dengan confusion matrix & ROC curve.",
          perluRevisi: "Ya",
        },
      },
    },
  ] as Practice[];

  const allPractice = rawPractice.filter(
    (p) => VALID_LEVELS.includes(p.level) && VALID_STATUS.includes(p.status)
  );

  // Filtering
  const filteredPractice = useMemo(() => {
    return allPractice.filter((p) => {
      const matchLevel = levelFilter === "Semua" || p.level === levelFilter;
      const matchStatus = statusFilter === "Semua" || p.status === statusFilter;
      const matchSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLevel && matchStatus && matchSearch;
    });
  }, [allPractice, levelFilter, statusFilter, searchQuery]);

  // Grouping by status
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

          {/* Filter Section */}
          <PracticeFilters
            levelFilter={levelFilter}
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            onLevelChange={setLevelFilter}
            onStatusChange={setStatusFilter}
            onSearchChange={setSearchQuery}
          />

          {/* Jika kosong → fallback */}
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <Ban className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-700 font-semibold mb-1">
                Belum ada practice
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {statusFilter === "Sudah Direview"
                  ? "Saat ini, Anda belum memiliki practice yang sudah direview"
                  : statusFilter === "Selesai"
                  ? "Saat ini, Anda belum memiliki practice yang sudah selesai"
                  : statusFilter === "Belum Dikerjakan"
                  ? "Saat ini, Anda belum memiliki practice yang belum dikerjakan"
                  : "Saat ini, Anda belum memiliki practice yang dapat dikerjakan"}
              </p>
              <Link
                href="/practice"
                className="px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition cursor-pointer"
              >
                Ikuti practice
              </Link>
            </div>
          ) : (
            Object.entries(groupedPractice).map(([status, practices]) => {
              let sectionTitle = "";

              if (levelFilter !== "Semua" && statusFilter !== "Semua") {
                sectionTitle = `${levelFilter} dan ${status}`;
              } else if (levelFilter !== "Semua" && statusFilter === "Semua") {
                sectionTitle = levelFilter;
              } else {
                sectionTitle = status;
              }

              return (
                <PracticeSection
                  key={status}
                  title={sectionTitle}
                  practices={practices}
                />
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}
