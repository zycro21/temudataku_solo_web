"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export interface ElearningTextSummaryApiItem {
  id: string;
  subBabId: string;
  title: string | null;
  orderNumber: number | null;
  status: string;
  quiz: { id: string; title: string } | null;
  assignment: { id: string; title: string } | null;
}

export interface ElearningSubBabSummaryApiItem {
  id: string;
  subChapterId: string;
  title: string;
  orderNumber: number | null;
  estimatedTime: string | null;
  status: string;
  texts: ElearningTextSummaryApiItem[];
}

export interface ElearningSubChapterDetailApiItem {
  id: string;
  courseId: string;
  title: string;
  coverImage: string | null;
  description: string | null;
  orderNumber: number;
  estimatedTime: string | null;
  taskType: string | null;
  status: string;
  level: string | null;
  subBabs: ElearningSubBabSummaryApiItem[];
  course: { id: string; title: string };
}

export type ElearningSubChapterDetailErrorType =
  | "unauthenticated"
  | "no-subscription"
  | "not-found"
  | "unknown"
  | null;

interface UseElearningSubChapterDetailResult {
  subChapter: ElearningSubChapterDetailApiItem | null;
  loading: boolean;
  errorType: ElearningSubChapterDetailErrorType;
  refetch: () => void;
}

/**
 * Hook fetch detail satu SubChapter ("kelas") beserta seluruh SubBab
 * ("modul") + ringkasan Text di dalamnya (judul, ada-tidaknya quiz/
 * assignment) dari GET /api/elearningSubChapter/subchapters/{id}.
 * Dipakai buat bangun struktur sidebar navigasi materi. Konten lengkap
 * tiap Text (blocks/quiz.questions/assignment.instructions) baru di-fetch
 * on-demand lewat useElearningTextDetail saat Text itu dipilih.
 */
export function useElearningSubChapterDetail(
  subChapterId: string,
): UseElearningSubChapterDetailResult {
  const [subChapter, setSubChapter] =
    useState<ElearningSubChapterDetailApiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] =
    useState<ElearningSubChapterDetailErrorType>(null);

  const fetchSubChapter = useCallback(async () => {
    if (!subChapterId) return;

    setLoading(true);
    setErrorType(null);

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubChapter/subchapters/${subChapterId}`,
        { withCredentials: true },
      );

      setSubChapter(res.data?.data ?? null);
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401) {
        setErrorType("unauthenticated");
      } else if (status === 403) {
        setErrorType("no-subscription");
      } else if (status === 404) {
        setErrorType("not-found");
      } else {
        setErrorType("unknown");
      }

      setSubChapter(null);
    } finally {
      setLoading(false);
    }
  }, [subChapterId]);

  useEffect(() => {
    fetchSubChapter();
  }, [fetchSubChapter]);

  return { subChapter, loading, errorType, refetch: fetchSubChapter };
}
