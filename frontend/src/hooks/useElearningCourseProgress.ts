"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export type ElearningSubChapterProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export interface ElearningSubChapterProgressItem {
  subChapterId: string;
  progressPercent: number;
  status: ElearningSubChapterProgressStatus;
  lastActivityAt: string | null;
}

export interface ElearningCourseProgressApiItem {
  courseId: string;
  totalSubChapter: number;
  completedSubChapter: number;
  progressPercent: number;
  isEligibleCertificate: boolean;
  subChapterProgress: ElearningSubChapterProgressItem[];
}

interface UseElearningCourseProgressResult {
  progress: ElearningCourseProgressApiItem | null;
  loading: boolean;
  refetch: () => void;
}

/**
 * Hook fetch progress belajar user untuk satu Course dari
 * GET /api/elearningProgress/courses/{id}/progress.
 * Satu request ini sudah mencakup progress overall (buat header) DAN
 * progress tiap subChapter/"kelas" (buat tiap kartu di SubChapter),
 * supaya tidak perlu N+1 request per kartu.
 */
export function useElearningCourseProgress(
  courseId: string,
): UseElearningCourseProgressResult {
  const [progress, setProgress] =
    useState<ElearningCourseProgressApiItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningProgress/courses/${courseId}/progress`,
        { withCredentials: true },
      );

      setProgress(res.data?.data ?? null);
    } catch (err) {
      // 🔥 Kalau gagal (mis. belum ada progress sama sekali / error jaringan),
      // biarkan UI fallback ke tampilan tanpa data progress (aman, tidak
      // memblokir halaman course detail yang sudah ter-render).
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, loading, refetch: fetchProgress };
}
