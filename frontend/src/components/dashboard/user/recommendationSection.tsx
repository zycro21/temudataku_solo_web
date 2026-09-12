// src/components/dashboard/user/recommendationSection.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { Star, Users, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// 🔥 Sesuai skema course E-Learning (bukan lagi mentoring booking).
interface ElearningCourseItem {
  id: string;
  title: string;
  description: string;
  thumbnailImages?: string[];
  coursesCount: number;
  modulesCount: number;
  totalEstimatedMinutes: number;
  averageRating: number;
  reviewCount: number;
  totalStreamCount: number;
  status: string; // "DRAFT" | "PUBLISHED" | "ARCHIVED"
  isActive?: boolean;
  createdAt: string;
}

// 🔥 Sama persis seperti di ElearningSelection.tsx — thumbnailImages di DB
// sudah termasuk path lengkapnya sendiri, tinggal ditempel ke base URL.
function resolveThumbnailImage(thumbnail: string | null | undefined) {
  if (!thumbnail) return null;
  if (thumbnail.startsWith("http")) return thumbnail;
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}${thumbnail}`;
}

// 🔥 Sama persis seperti di ElearningSelection.tsx
function formatEstimatedDuration(totalMinutes: number) {
  if (!totalMinutes || totalMinutes <= 0) return "Segera hadir";

  const rounded = Math.max(10, Math.round(totalMinutes / 10) * 10);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;

  if (hours === 0) return `${minutes} menit`;
  if (minutes === 0) return `${hours} jam`;
  return `${hours} jam ${minutes} menit`;
}

// 🔥 Sama persis seperti di ElearningSelection.tsx
function StarRating({ rating }: { rating: number }) {
  const safeRating = Math.max(0, Math.min(rating, 5));

  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const fillPercent = Math.max(0, Math.min(1, safeRating - i)) * 100;

        return (
          <div key={i} className="relative w-3.5 h-3.5 shrink-0">
            <Star className="absolute inset-0 w-3.5 h-3.5 text-gray-300 fill-gray-300" />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const MAX_VISIBLE = 6;

export default function RecommendationSection() {
  const [courses, setCourses] = useState<ElearningCourseItem[]>([]);
  const [totalPublished, setTotalPublished] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses`,
          {
            params: {
              page: 1,
              limit: 1000,
              sortBy: "createdAt",
              order: "desc",
            },
            withCredentials: true,
          },
        );

        const allCourses: ElearningCourseItem[] = res.data?.data || [];

        // 🔥 Backend untuk role mentee sebenarnya sudah otomatis cuma
        // ngirim course yang isActive & status PUBLISHED, tapi difilter
        // eksplisit lagi di sini biar tetap benar walau role/filter
        // backend berubah nanti.
        const published = allCourses.filter(
          (c) => c.status === "PUBLISHED" && c.isActive !== false,
        );

        // sudah terurut createdAt desc dari backend (params sortBy di atas),
        // jadi tinggal ambil 6 teratas = 6 yang paling baru.
        setTotalPublished(published.length);
        setCourses(published.slice(0, MAX_VISIBLE));
      } catch (err) {
        console.error("Error fetch elearning recommendations:", err);
        setError("Gagal memuat rekomendasi.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const canShowAll = totalPublished > MAX_VISIBLE;

  if (loading) {
    return (
      <div className="mt-8 flex justify-center">
        <div className="relative w-full max-w-[90rem] rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-white border border-emerald-100 shadow-sm p-6 sm:p-8 overflow-hidden">
          <p className="text-gray-500">Memuat rekomendasi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 flex justify-center">
        <div className="relative w-full max-w-[90rem] rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-white border border-emerald-100 shadow-sm p-6 sm:p-8 overflow-hidden">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="mt-8 flex justify-center">
        <div className="relative w-full max-w-[90rem] rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-white border border-emerald-100 shadow-sm p-6 sm:p-8 overflow-hidden">
          <p className="text-gray-500">Tidak ada rekomendasi untuk saat ini!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 flex justify-center">
      <div className="relative w-full max-w-[90rem] rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-white border border-emerald-100 shadow-sm p-6 sm:p-8 overflow-hidden">
        {/* Aksen dekoratif — cuma hiasan blur di pojok, tidak mengganggu konten */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-12 w-48 h-48 bg-teal-200/30 rounded-full blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center gap-3 mb-1">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 text-white shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              Rekomendasi Untukmu
            </h2>
            <p className="text-xs text-gray-500">
              E-Learning terbaru yang siap kamu pelajari
            </p>
          </div>
        </div>

        <div className="relative px-3 sm:px-10 mt-6">
          <Carousel opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent>
              {courses.map((course) => (
                <CarouselItem
                  key={course.id}
                  className="basis-full sm:basis-1/2 lg:basis-1/3 flex-shrink-0"
                >
                  {/* 🔥 Card di bawah ini SAMA PERSIS dengan card di
                      ElearningSelection.tsx (halaman /elearning) — thumbnail,
                      judul, deskripsi, badge kelas/modul, rating & peserta.
                      Ditambah "px-2" di sini biar ada jarak antar-card
                      (sebelumnya nempel langsung tanpa gap). */}
                  <Link
                    href={`/elearning/${course.id}`}
                    className="block h-full px-1 sm:px-2"
                  >
                    <Card className="group rounded-xl border border-gray-200 hover:shadow-lg transition-all p-0 cursor-pointer hover:-translate-y-1 duration-300 h-full bg-white">
                      {/* Image Section */}
                      <div className="relative px-2 pt-2">
                        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[4/3]">
                          <Image
                            src={
                              resolveThumbnailImage(
                                course.thumbnailImages?.[0],
                              ) || "/assets/elearning/placeholder.png"
                            }
                            alt={course.title}
                            fill
                            unoptimized
                            className="object-contain"
                          />
                        </div>
                      </div>

                      <CardContent className="p-4 pt-0">
                        {/* Title */}
                        <h3
                          title={course.title}
                          className="text-base leading-snug font-bold text-gray-900 mb-1.5 line-clamp-1 transition-colors group-hover:text-emerald-600"
                        >
                          {course.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-gray-700 mb-3 line-clamp-2">
                          {course.description}
                        </p>

                        {/* Class & Module Info */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 text-xs mb-4">
                          {/* Kelas */}
                          <div className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg w-fit">
                            <Image
                              src="/assets/elearning/class.svg"
                              alt="Kelas"
                              width={10}
                              height={10}
                            />
                            <span className="font-medium">
                              {course.coursesCount} Kelas
                            </span>
                          </div>

                          {/* Modul */}
                          <div className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg w-fit flex-wrap">
                            <Image
                              src="/assets/elearning/module.svg"
                              alt="Modul"
                              width={10}
                              height={10}
                            />
                            <span className="font-medium">
                              {course.modulesCount} Modul
                            </span>

                            {/* Estimasi waktu */}
                            <span className="ml-1.5 text-[10px] text-gray-700 bg-gray-200 px-1.5 py-0.5 rounded-full">
                              ~{" "}
                              {formatEstimatedDuration(
                                course.totalEstimatedMinutes,
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Footer — rating & jumlah peserta */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-xs pt-3 border-t border-gray-100">
                          <div className="flex items-center flex-wrap gap-1.5">
                            <StarRating rating={course.averageRating} />
                            <span className="text-gray-700 font-medium">
                              {course.averageRating.toFixed(1)}
                            </span>
                            <span className="text-gray-500">
                              ({course.reviewCount ?? 0} ulasan)
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-gray-500">
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-medium">
                              {course.totalStreamCount ?? 0} peserta
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* 🔥 Muncul hanya kalau course PUBLISHED lebih dari 6 — bawa ke
            /elearning langsung scroll ke section katalog lengkapnya. */}
        {canShowAll && (
          <div className="relative flex justify-center mt-8">
            <Link href="/elearning#elearning-selection">
              <Button className="px-5 py-1.5 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                Tampilkan Semua
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
