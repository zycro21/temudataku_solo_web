"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import type { ContentBlock } from "@/components/elearning/ElearningSelection";

// 🔥 Bentuk quiz/assignment API asli belum sepenuhnya sama dengan yang
// dipakai QuizRenderer/AssignmentRenderer di SubchapterContent (dibangun
// dari data dummy). Ditype `any` di sini apa adanya dari backend — adaptasi
// ke bentuk yang dipakai renderer dilakukan di SubchapterDetail, bukan di
// hook ini, supaya hook ini tetap murni representasi API.
export interface ElearningTextDetailApiItem {
  id: string;
  title: string | null;
  status: string;
  orderNumber: number | null;
  createdAt: string;
  updatedAt: string;
  blocks: ContentBlock[];
  subBab: { id: string; title: string };
  quiz: any | null;
  assignment: any | null;
  course: { id: string; title: string };
}

export type ElearningTextDetailErrorType =
  | "unauthenticated"
  | "no-subscription"
  | "not-found"
  | "unknown"
  | null;

interface UseElearningTextDetailResult {
  text: ElearningTextDetailApiItem | null;
  loading: boolean;
  errorType: ElearningTextDetailErrorType;
  refetch: () => void;
}

/**
 * Hook fetch detail lengkap satu ELearningText ("materi"/submodule) dari
 * GET /api/elearningText/texts/{id} — dipanggil on-demand tiap kali user
 * memilih item materi/quiz/assignment di sidebar (bukan di-fetch semua
 * sekaligus, karena isinya bisa berat — blocks lengkap tiap konten).
 */
export function useElearningTextDetail(
  textId: string | null,
): UseElearningTextDetailResult {
  const [text, setText] = useState<ElearningTextDetailApiItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] =
    useState<ElearningTextDetailErrorType>(null);

  const fetchText = useCallback(async () => {
    if (!textId) {
      setText(null);
      return;
    }

    setLoading(true);
    setErrorType(null);

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningText/texts/${textId}`,
        { withCredentials: true },
      );

      setText(res.data?.data ?? null);
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

      setText(null);
    } finally {
      setLoading(false);
    }
  }, [textId]);

  useEffect(() => {
    fetchText();
  }, [fetchText]);

  return { text, loading, errorType, refetch: fetchText };
}
