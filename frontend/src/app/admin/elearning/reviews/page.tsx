"use client";

import axios from "axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import ReviewStreamStatsCards from "@/components/admin/reviews/ReviewStreamStatsCards";
import ReviewStreamListTable from "@/components/admin/reviews/ReviewStreamListTable";

// ─── Types ──────────────────────────────────────────────────────────────────
// Dipakai bareng-bareng sama komponen tabel, sama kayak pola
// `AssignmentListItem` yang di-export dari page submissions.
export interface StreamReviewListItem {
  id: string;
  title: string;
  category: string | null;
  level: string | null;
  status: string | null;
  createdAt: string | null;
  mentorProfile?: {
    user?: {
      fullName?: string | null;
    } | null;
  } | null;
  coursesCount: number; // jumlah ELearningSubChapter ("course" di FE) dalam stream ini
  reviewCount: number; // total review dari SELURUH subChapter di stream ini
  averageRating: number; // rata-rata rating dari SELURUH subChapter di stream ini
}

export default function ReviewStreamListPage() {
  const [streams, setStreams] = useState<StreamReviewListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStreams = async () => {
      setIsLoading(true);
      try {
        // Backend endpoint ini defaultnya sudah balikin limit besar (10000)
        // sekaligus, jadi kita ambil semuanya sekali jalan lalu search /
        // sort / pagination dikerjakan di client. Ini juga sekalian
        // ngakalin keterbatasan `sortBy` di backend yang cuma
        // support createdAt/title/price (reviewCount & averageRating
        // belum bisa disortir dari backend).
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses`,
          {
            withCredentials: true,
            params: { limit: 1000 },
          },
        );

        const rows = (res.data?.data ?? []) as any[];
        const mapped: StreamReviewListItem[] = rows.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category ?? null,
          level: c.level ?? null,
          status: c.status ?? null,
          createdAt: c.createdAt ?? null,
          mentorProfile: c.mentorProfile,
          coursesCount: c.coursesCount ?? c.subChapters?.length ?? 0,
          reviewCount: c.reviewCount ?? 0,
          averageRating: c.averageRating ?? 0,
        }));

        setStreams(mapped);
      } catch (err) {
        console.error("Gagal mengambil data stream review:", err);
        toast.error("Gagal memuat data stream. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreams();
  }, []);

  const totalReviewAllStreams = streams.reduce(
    (acc, s) => acc + s.reviewCount,
    0,
  );
  const totalCoursesAllStreams = streams.reduce(
    (acc, s) => acc + s.coursesCount,
    0,
  );

  return (
    <div className="space-y-5 p-1">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Monitoring Review E-Learning
        </h1>
        <p className="text-sm text-gray-500">
          Pantau jumlah review mentee per stream. Klik salah satu baris untuk
          melihat rincian per course.
        </p>
      </div>

      <ReviewStreamStatsCards
        totalStreams={streams.length}
        totalCourses={totalCoursesAllStreams}
        totalReviews={totalReviewAllStreams}
        isLoading={isLoading}
      />

      <ReviewStreamListTable streams={streams} isLoading={isLoading} />
    </div>
  );
}
