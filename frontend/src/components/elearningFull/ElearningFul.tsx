"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  Search,
  Clock,
  Database,
  ChevronDown,
  ChevronUp,
  SearchX,
  Lock,
  LogIn,
  Star,
  Users,
} from "lucide-react";
import SubscriptionStatusBanner from "@/components/elearning/SubscriptionStatusBanner";
import {
  useElearningCourses,
  getDisplayedRating,
} from "@/hooks/useElearningCourses";
import {
  recordElearningStreamClick,
  getDisplayedStreamCount,
} from "@/hooks/useElearningStreamClick";

// Practice utama
export interface Practice {
  id: number;
  tipe: string;
  title: string;
  image: string;
  deskripsi: string;
  level: string;
  keywords: string[];

  jumlahSubChapter: number;
  jumlahModul: number;

  rating: number;
  JumlahPerating: string;
  jumlahPembeli: string;

  subChapters: SubChapter[];
  progressSummary: PracticeProgressSummary;
}

// Subchapter / kelas
export interface SubChapter {
  id: number;
  coverImage: string;
  title: string;
  description: string;

  taskType: TaskType;

  modules: Module[];

  progressPercent: number; // 0 - 100
  lastActivityAt: string | null; // ISO date
}

// Jenis tugas di kelas
export type TaskType = "quiz" | "project" | "quiz_and_project";

// Modul kecil di dalam subchapter
export interface Module {
  id: number;
  title: string;
  estimatedMinutes: number; // estimasi pengerjaan
  completed: boolean;
}

// Summary progress untuk practice
export interface PracticeProgressSummary {
  completedSubChapters: number; // kelas selesai 100%
  totalSubChapters: number;
}

// 🔥 Beda dari profilePicture — thumbnailImages di DB SUDAH termasuk path
// lengkapnya sendiri (mis. "/images/elearningThumbnail/thumbnail-....png"),
// jadi tinggal ditempel ke base URL, TANPA tambahan "/images/" lagi.
function resolveThumbnailImage(thumbnail: string | null | undefined) {
  if (!thumbnail) return null;

  if (thumbnail.startsWith("http")) {
    return thumbnail;
  }

  return `${process.env.NEXT_PUBLIC_API_BASE_URL}${thumbnail}`;
}

// 🔥 FIX: sebelumnya pakai teknik "1 lapisan overlay di-clip berdasarkan
// persentase LEBAR TOTAL container (termasuk gap antar bintang)" — itu
// SALAH, karena gap ikut kepotong sebagai bagian dari persentase, jadi di
// rating tinggi (mis. 4.4) sisa lebar abis buat "melewati" gap sebelum
// sempat ngisi bintang terakhir, hasilnya bintang ke-5 cuma keisi secuil
// padahal seharusnya ~40%. Sekarang tiap bintang dihitung fill-nya
// SENDIRI-SENDIRI (independen dari gap), jadi proporsinya akurat.
function StarRating({ rating }: { rating: number }) {
  const safeRating = Math.max(0, Math.min(rating, 5));

  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const fillPercent = Math.max(0, Math.min(1, safeRating - i)) * 100;

        return (
          <div key={i} className="relative w-4 h-4 shrink-0">
            <Star className="absolute inset-0 w-4 h-4 text-gray-300 fill-gray-300" />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ElearningSelection() {
  const { courses, loading, errorType } = useElearningCourses();

  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // 🔥 Kategori diambil dinamis dari data yang benar-benar ada, bukan
  // hardcode, karena `category` di backend adalah free text dari admin.
  const categories = [
    "Semua",
    ...Array.from(
      new Set(
        courses
          .map((c) => c.category)
          .filter((c): c is string => !!c && c.trim().length > 0),
      ),
    ),
  ];

  const filteredPractices = courses.filter((course) => {
    const matchCategory =
      selectedCategory === "Semua" || course.category === selectedCategory;

    const matchSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());

    return matchCategory && matchSearch;
  });

  const INITIAL_COUNT = 12;

  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const totalPractices = filteredPractices.length;
  const visiblePractices = filteredPractices.slice(0, visibleCount);

  const isExpanded = visibleCount >= totalPractices;
  const canExpand = totalPractices > INITIAL_COUNT;

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(INITIAL_COUNT);
  };

  // 🔥 Format total menit belajar (hasil sum estimatedTime semua subChapter,
  // dari backend) jadi "X jam Y menit", dibulatkan ke kelipatan 10 menit
  // terdekat — sama persis dengan yang dipakai di ElearningSelection.
  const formatEstimatedDuration = (totalMinutes: number) => {
    if (!totalMinutes || totalMinutes <= 0) return "Segera hadir";

    const rounded = Math.max(10, Math.round(totalMinutes / 10) * 10);
    const hours = Math.floor(rounded / 60);
    const minutes = rounded % 60;

    if (hours === 0) return `${minutes} menit`;
    if (minutes === 0) return `${hours} jam`;
    return `${hours} jam ${minutes} menit`;
  };

  const renderStars = (rating: number) => {
    const safeRating = Math.max(0, Math.min(5, rating));

    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;

      const fillPercentage =
        safeRating >= starValue
          ? 100
          : safeRating > starValue - 1
            ? (safeRating - (starValue - 1)) * 100
            : 0;

      return (
        <div key={index} className="relative w-4 h-4">
          {/* Star base (gray) */}
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="absolute inset-0 text-gray-300"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.974c.3.921-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.197-1.539-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.049 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.974z" />
          </svg>

          {/* Star fill (yellow) */}
          <div
            className="absolute inset-0 overflow-hidden text-amber-400"
            style={{ width: `${fillPercentage}%` }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.974c.3.921-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.197-1.539-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.049 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.974z" />
            </svg>
          </div>
        </div>
      );
    });
  };

  return (
    <section className="py-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SubscriptionStatusBanner />

        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Kuasai Skill dengan E-Learning Praktis
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Dari nol sampai expert, e-learning ini siap temenin langkah
            belajarmu. Tinggal pilih modul, terus jalanin!
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar - Full width */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(INITIAL_COUNT); // reset pagination
                  }}
                  placeholder="Cari E-learning-mu di sini"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Category Filter - Left aligned */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = selectedCategory === category;

              return (
                <Button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  variant={isActive ? "default" : "outline"}
                  className={`px-6 py-2 rounded-md ${
                    isActive
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {category}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Practice Cards Grid / Empty / Loading / Locked State */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 overflow-hidden animate-pulse"
              >
                <div className="h-[240px] bg-gray-200 m-2 rounded-lg" />
                <div className="p-5 pt-0 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : errorType === "unauthenticated" ||
          errorType === "no-subscription" ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {errorType === "unauthenticated"
                ? "Login dulu untuk lihat katalog E-Learning"
                : "Kamu belum punya langganan aktif"}
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              {errorType === "unauthenticated"
                ? "Masuk ke akun kamu untuk menjelajahi seluruh course E-Learning yang tersedia."
                : "Berlangganan sekarang untuk membuka akses ke seluruh course E-Learning."}
            </p>
            {errorType === "unauthenticated" ? (
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("auth:open-login"))
                }
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold px-6 py-2.5 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Masuk Sekarang
              </button>
            ) : (
              <Link
                href="/elearning"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold px-6 py-2.5 transition-all"
              >
                Lihat Paket Langganan
              </Link>
            )}
          </div>
        ) : totalPractices === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            {/* Icon */}
            <SearchX className="w-16 h-16 text-gray-400 mb-4" />

            {/* Text */}
            <h3 className="text-lg font-semibold text-gray-700">
              Data tidak ditemukan
            </h3>

            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Coba ubah kata pencarian atau filter level dan kategori yang kamu
              pilih
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePractices.map((course) => (
              <Link
                key={course.id}
                href={`/elearning/${course.id}?from=elearningfull`}
                className="block"
                onClick={() => recordElearningStreamClick(course.id)}
              >
                <Card className="group rounded-xl border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-0 cursor-pointer">
                  {/* Image Section */}
                  <div className="relative px-2 pt-2">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[4/3]">
                      <Image
                        src={
                          resolveThumbnailImage(course.thumbnailImages?.[0]) ||
                          "/assets/elearning/placeholder.png"
                        }
                        alt={course.title}
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                  </div>

                  <CardContent className="p-5 pt-0">
                    {/* Title */}
                    <h3
                      title={course.title}
                      className="text-[1.375rem] leading-snug font-bold text-gray-900 mb-2 line-clamp-1 transition-colors group-hover:text-emerald-600"
                    >
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-700 mb-5 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Class & Module Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                      {/* Kelas */}
                      <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                        <Image
                          src="/assets/elearning/class.svg"
                          alt="Kelas"
                          width={12}
                          height={12}
                        />
                        <span className="font-medium">
                          {course.coursesCount} Kelas
                        </span>
                      </div>

                      {/* Modul */}
                      <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                        <Image
                          src="/assets/elearning/module.svg"
                          alt="Modul"
                          width={12}
                          height={12}
                        />
                        <span className="font-medium">
                          {course.modulesCount} Modul
                        </span>

                        {/* Estimasi waktu */}
                        <span className="ml-2 text-xs text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full">
                          ~{" "}
                          {formatEstimatedDuration(
                            course.totalEstimatedMinutes,
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Footer — rating & jumlah peserta */}
                    {(() => {
                      // 🔥 Dihitung sekali di sini, lalu dipakai ulang di
                      // StarRating (visual bintang) & teks angka — biar
                      // dua-duanya selalu konsisten.
                      const displayedRating = getDisplayedRating(
                        course.averageRating,
                      );

                      return (
                        <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <StarRating rating={displayedRating} />
                            <span className="text-gray-700 font-medium">
                              {displayedRating.toFixed(1)}
                            </span>
                            <span className="text-gray-500">
                              ({course.reviewCount ?? 0} ulasan)
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">
                              {getDisplayedStreamCount(
                                course.id,
                                course.totalStreamCount ?? 0,
                              )}{" "}
                              peserta
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {canExpand && (
          <div className="flex justify-center mt-10 gap-4 flex-wrap">
            {/* Toggle Less / More */}
            {!isExpanded && (
              <Button
                variant="outline"
                className="px-6 py-2 rounded-xl border-emerald-500 text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                onClick={() => setVisibleCount(totalPractices)}
              >
                Lihat Lebih Banyak
                <ChevronDown className="w-4 h-4 transition-all duration-200" />
              </Button>
            )}

            {isExpanded && (
              <Button
                variant="ghost"
                className="
      px-6 py-2
      bg-gray-100 hover:bg-gray-200
      text-gray-700 hover:text-gray-900
      border border-gray-200
      rounded-xl
      flex items-center gap-2
      transition-all
    "
                onClick={() => setVisibleCount(INITIAL_COUNT)}
              >
                <ChevronUp className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                Tampilkan Lebih Sedikit
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
