"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export interface SubBabCompletionItem {
  subBabId: string;
  completed: boolean;
}

export interface TextCompletionItem {
  textId: string;
  completed: boolean;
}

interface SubChapterTextProgressApiResult {
  subChapterId: string;
  subBabProgress: SubBabCompletionItem[];
  textProgress: TextCompletionItem[];
}

interface UseElearningSubChapterTextProgressResult {
  completedTextIds: Set<string>;
  completedSubBabIds: Set<string>;
  loading: boolean;
  refetch: () => void;
}

/**
 * Hook fetch status selesai/belum per ELearningText & ELearningSubBab
 * (buat centang checklist di SubchapterSidebar.tsx) dari
 * GET /api/elearningProgress/subchapters/{id}/text-progress.
 *
 * Sengaja dipisah dari useElearningCourseProgress (yang cuma bawa
 * progressPercent per SubChapter, bukan breakdown per-item) — sidebar
 * butuh tahu textId/subBabId MANA SAJA yang sudah selesai, bukan cuma
 * angka persentase.
 */
export function useElearningSubChapterTextProgress(
  subChapterId: string | null | undefined,
): UseElearningSubChapterTextProgressResult {
  const [completedTextIds, setCompletedTextIds] = useState<Set<string>>(
    new Set(),
  );
  const [completedSubBabIds, setCompletedSubBabIds] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!subChapterId) return;

    setLoading(true);

    try {
      const res = await axios.get<{ data: SubChapterTextProgressApiResult }>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningProgress/subchapters/${subChapterId}/text-progress`,
        { withCredentials: true },
      );

      const data = res.data?.data;
      setCompletedTextIds(
        new Set(
          (data?.textProgress ?? [])
            .filter((t) => t.completed)
            .map((t) => t.textId),
        ),
      );
      setCompletedSubBabIds(
        new Set(
          (data?.subBabProgress ?? [])
            .filter((sb) => sb.completed)
            .map((sb) => sb.subBabId),
        ),
      );
    } catch {
      // 🔥 Gagal fetch checklist bukan error fatal — sidebar tetap render,
      // cuma tanpa centang (fallback aman, sama pola dengan hook progress
      // lain di project ini, mis. useElearningCourseProgress).
      setCompletedTextIds(new Set());
      setCompletedSubBabIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [subChapterId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    completedTextIds,
    completedSubBabIds,
    loading,
    refetch: fetchProgress,
  };
}
