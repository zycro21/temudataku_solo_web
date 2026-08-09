"use client";

import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ReviewDetailTable from "@/components/admin/reviews/[streamId]/[subChapterId]/ReviewDetailTable";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface ReviewDetailItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
  };
  subChapter?: {
    id: string;
    title: string;
    course: { id: string; title: string };
  };
}

export default function ReviewDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const streamId = params?.streamId as string;
  const subChapterId = params?.subChapterId as string;

  const courseTitleFromQuery = searchParams.get("title"); // judul sub-chapter
  const streamTitleFromQuery = searchParams.get("stream"); // judul stream

  const [courseTitle, setCourseTitle] = useState(
    courseTitleFromQuery ?? "Loading...",
  );
  const [streamTitle] = useState(streamTitleFromQuery ?? "");

  const [reviews, setReviews] = useState<ReviewDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination + sorting — endpoint /reviews/me support server-side page,
  // limit, dan sort (arah createdAt saja; belum ada pilihan kolom sort
  // lain, lihat catatan perbaikan endpoint).
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchReviews = useCallback(async () => {
    if (!subChapterId) return;
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningReview/reviews/me`,
        {
          withCredentials: true,
          params: {
            subChapterId,
            page,
            limit,
            sort: sortOrder,
          },
        },
      );

      const payload = res.data?.data;
      const rows = (payload?.data ?? []) as ReviewDetailItem[];
      setReviews(rows);
      setTotal(payload?.meta?.total ?? 0);

      if (!courseTitleFromQuery && rows[0]?.subChapter?.title) {
        setCourseTitle(rows[0].subChapter.title);
      }
    } catch (err) {
      console.error("Gagal mengambil data review:", err);
      toast.error("Gagal memuat data review. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [subChapterId, page, limit, sortOrder, courseTitleFromQuery]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-5 p-1">
      <div>
        <Link
          href={{
            pathname: `/admin/elearning/reviews/${streamId}`,
            query: streamTitle ? { title: streamTitle } : undefined,
          }}
          className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-emerald-600"
        >
          <ChevronLeft size={16} />
          Kembali ke Daftar Course
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{courseTitle}</h1>
        {streamTitle && (
          <p className="text-sm text-gray-500">Stream: {streamTitle}</p>
        )}
      </div>

      <ReviewDetailTable
        reviews={reviews}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        sortOrder={sortOrder}
        onSortOrderChange={(order) => {
          setSortOrder(order);
          setPage(1);
        }}
      />
    </div>
  );
}
