"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export interface ElearningCourseApiItem {
  id: string;
  title: string;
  description: string | null;
  thumbnailImages: string[];
  category: string | null;
  level: string | null;
  tags: string[];
  isActive: boolean | null;
  status: string | null;
  coursesCount: number;
  modulesCount: number;
  materialsCount: number;
  // 🔥 Total estimasi waktu belajar course (menit), dijumlahkan backend dari
  // estimatedTime tiap subChapter — dipakai buat badge "~ X jam Y menit".
  totalEstimatedMinutes: number;
  averageRating?: number;
  reviewCount?: number;
  // 🔥 Jumlah klik "stream" asli dari DB (SUM semua akun, tiap akun sudah
  // di-cap maksimal 10 di backend) — dipakai buat badge "peserta" di card,
  // menggantikan rumus acak berbasis total subscriber yang lama.
  totalStreamCount?: number;
  mentorProfile?: {
    user?: {
      fullName: string;
      profilePicture: string | null;
    } | null;
  } | null;
}

export type ElearningCoursesErrorType =
  | "unauthenticated" // belum login sama sekali
  | "no-subscription" // sudah login tapi belum punya subscription aktif
  | "unknown"
  | null;

/**
 * 🔥 Rating yang DITAMPILKAN ke user sengaja dinaikkan dari rating asli
 * (`averageRating` apa adanya dari backend) — permintaan bisnis:
 * - Rating di rentang 0 - 1 dinaikkan 50%.
 * - Rating di atas 1 dinaikkan 30%.
 * - Hasilnya nggak pernah melebihi 5 (dibatasi/clamped).
 *
 * Dipakai bareng oleh ElearningSelection.tsx & ElearningFul.tsx — jangan
 * dipanggil dua kali buat nilai yang sama (mis. sekali buat StarRating,
 * sekali lagi buat teks angka) dengan hasil beda gara-gara pembulatan;
 * simpan hasilnya ke satu variabel dulu di pemanggil kalau dipakai lebih
 * dari sekali untuk course yang sama.
 */
export function getDisplayedRating(rating: number | null | undefined): number {
  const safeRating = Math.max(0, rating ?? 0);
  const multiplier = safeRating <= 1 ? 1.9 : 1.1;
  const boosted = safeRating * multiplier;
  return Math.min(5, Number(boosted.toFixed(1)));
}

interface UseElearningCoursesResult {
  courses: ElearningCourseApiItem[];
  loading: boolean;
  errorType: ElearningCoursesErrorType;
  refetch: () => void;
}

/**
 * Hook fetch daftar E-Learning Course dari backend.
 * Dipakai bareng oleh ElearningSelection (preview di /elearning) dan
 * ElearningFul (halaman katalog lengkap /elearningfull) supaya tidak
 * duplikasi logic fetch + error handling.
 *
 * Catatan penting: endpoint /api/elearningCourse/courses membatasi akses
 * berdasarkan role — mentee HARUS punya subscription aktif untuk bisa
 * melihat daftar course sama sekali (403 kalau tidak ada). Guest yang
 * belum login akan kena 401. Kedua kasus ini ditangani lewat `errorType`
 * supaya UI bisa menampilkan pesan yang sesuai, bukan cuma error generik.
 */
export function useElearningCourses(): UseElearningCoursesResult {
  const [courses, setCourses] = useState<ElearningCourseApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<ElearningCoursesErrorType>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setErrorType(null);

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses`,
        {
          withCredentials: true,
          params: {
            limit: 200,
            sortBy: "createdAt",
            order: "desc",
          },
        },
      );

      const allCourses: ElearningCourseApiItem[] = res.data?.data ?? [];

      // 🔥 Endpoint ini belum punya filter isActive/status di backend, jadi
      // difilter di sini — course cuma ditampilkan kalau memang aktif DAN
      // sudah PUBLISHED (bukan DRAFT/ARCHIVED).
      const visibleCourses = allCourses.filter(
        (course) => course.isActive === true && course.status === "PUBLISHED",
      );

      setCourses(visibleCourses);
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401) {
        setErrorType("unauthenticated");
      } else if (status === 403) {
        setErrorType("no-subscription");
      } else {
        setErrorType("unknown");
      }

      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();

    // 🔥 Sama seperti SubscriptionStatusBanner — kalau login/register
    // sukses di halaman /elearning atau /elearningfull, redirect-nya ke
    // path yang SAMA, jadi komponen ini tidak remount dan effect di atas
    // tidak jalan ulang. Dengarkan event yang sudah ditembak oleh
    // LoginModal/RegisterModal supaya data course langsung fetch ulang.
    const handleAuthChanged = () => {
      fetchCourses();
    };

    window.addEventListener(
      "elearning-subscription:refresh",
      handleAuthChanged,
    );

    return () => {
      window.removeEventListener(
        "elearning-subscription:refresh",
        handleAuthChanged,
      );
    };
  }, [fetchCourses]);

  return { courses, loading, errorType, refetch: fetchCourses };
}
