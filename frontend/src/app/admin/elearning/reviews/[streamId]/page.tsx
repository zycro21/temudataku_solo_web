"use client";

import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ReviewCourseListTable from "@/components/admin/reviews/[streamId]/ReviewCourseListTable";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface CourseReviewListItem {
  id: string;
  title: string;
  level: string | null;
  estimatedTime: string | null;
  status: string | null;
  orderNumber: number | null;
  createdAt: string | null;
  reviewCount: number; // total review untuk sub-chapter ("course") ini
  averageRating: number;
}

export default function ReviewCourseListPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const streamId = params?.streamId as string;
  const streamTitleFromQuery = searchParams.get("title");

  const [streamTitle, setStreamTitle] = useState(
    streamTitleFromQuery ?? "Loading...",
  );
  const [courses, setCourses] = useState<CourseReviewListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!streamId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1) Ambil semua sub-chapter ("course") dalam stream ini.
        const subChapterRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubChapter/courses/${streamId}/subchapters`,
          {
            withCredentials: true,
            params: { limit: 1000 },
          },
        );
        const subChapters = (subChapterRes.data?.data?.subChapters ??
          []) as any[];

        // 2) Ambil SEMUA review milik admin sekali jalan, lalu kelompokkan
        //    per subChapterId di client. Ini dipilih ketimbang manggil
        //    endpoint review satu-satu per sub-chapter (N+1 request),
        //    karena endpoint list sub-chapter saat ini belum nyertain
        //    jumlah review-nya (lihat catatan perbaikan endpoint).
        const reviewRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningReview/reviews/me`,
          {
            withCredentials: true,
            params: { limit: 10000 },
          },
        );
        const allReviews = (reviewRes.data?.data?.data ?? []) as any[];

        const reviewMap = new Map<
          string,
          { count: number; ratingSum: number }
        >();
        for (const r of allReviews) {
          if (r.subChapter?.course?.id !== streamId) continue;
          const key = r.subChapterId ?? r.subChapter?.id;
          if (!key) continue;
          const prev = reviewMap.get(key) ?? { count: 0, ratingSum: 0 };
          prev.count += 1;
          prev.ratingSum += Number(r.rating ?? 0);
          reviewMap.set(key, prev);
        }

        const mapped: CourseReviewListItem[] = subChapters.map((sc) => {
          const agg = reviewMap.get(sc.id) ?? { count: 0, ratingSum: 0 };
          return {
            id: sc.id,
            title: sc.title,
            level: sc.level ?? null,
            estimatedTime: sc.estimatedTime ?? null,
            status: sc.status ?? null,
            orderNumber: sc.orderNumber ?? null,
            createdAt: sc.createdAt ?? null,
            reviewCount: agg.count,
            averageRating:
              agg.count > 0
                ? Number((agg.ratingSum / agg.count).toFixed(1))
                : 0,
          };
        });

        setCourses(mapped);

        // Judul stream: kalau nggak dikirim lewat query, coba tebak dari
        // salah satu review yang match (course.title), fallback generik.
        if (!streamTitleFromQuery) {
          const fromReview = allReviews.find(
            (r) => r.subChapter?.course?.id === streamId,
          )?.subChapter?.course?.title;
          setStreamTitle(fromReview ?? "Stream");
        }
      } catch (err) {
        console.error("Gagal mengambil data course review:", err);
        toast.error("Gagal memuat data course. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [streamId, streamTitleFromQuery]);

  const totalReviews = courses.reduce((acc, c) => acc + c.reviewCount, 0);

  return (
    <div className="space-y-5 p-1">
      <div>
        <Link
          href="/admin/elearning/reviews"
          className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-emerald-600"
        >
          <ChevronLeft size={16} />
          Kembali ke Daftar Stream
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{streamTitle}</h1>
        <p className="text-sm text-gray-500">
          {courses.length} course &middot; {totalReviews} total review
        </p>
      </div>

      <ReviewCourseListTable
        streamId={streamId}
        streamTitle={streamTitle}
        courses={courses}
        isLoading={isLoading}
      />
    </div>
  );
}
