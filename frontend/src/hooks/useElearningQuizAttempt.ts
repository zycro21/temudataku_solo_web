"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export const MAX_QUIZ_ATTEMPTS = 2;

export interface QuizAttemptRecord {
  id: string;
  score: number | null;
  // 🔥 nilai per soal bisa string (single-answer) ATAU string[] (soal
  // dengan lebih dari satu jawaban benar) — backend menormalisasi
  // keduanya jadi Set saat grading.
  answers: Record<string, string | string[]> | null;
  startedAt: string | null;
  completedAt: string | null;
  quiz?: { id: string; title: string };
}

interface UseElearningQuizAttemptResult {
  // history
  isLoadingHistory: boolean;
  latestAttempt: QuizAttemptRecord | null;
  attemptsUsed: number;
  attemptsRemaining: number;
  hasReachedMaxAttempts: boolean;
  isPerfectScore: boolean;

  // submit
  isSubmitting: boolean;
  submitAttempt: (
    answers: Record<string, string[]>,
  ) => Promise<QuizAttemptRecord | null>;

  // manual refresh kalau dibutuhkan (mis. setelah retry)
  refetchHistory: () => Promise<void>;
}

// 🔥 Helper: cari & format pesan error yang enak dibaca dari response axios.
// Kalau backend balikin field-level Zod issues (mis. { errors: [{ path,
// message }] } atau { errors: { fieldName: string[] } }), kita surface
// path/field-nya biar user (atau kita pas debugging) tahu persis input mana
// yang salah — bukan cuma "Data tidak valid" generik.
function extractErrorMessage(err: any): string {
  const data = err?.response?.data;
  if (!data) return "Terjadi kesalahan, silakan coba lagi";

  const rawErrors = data.errors;

  if (Array.isArray(rawErrors) && rawErrors.length > 0) {
    return rawErrors
      .map((issue: any) => {
        const path = Array.isArray(issue?.path)
          ? issue.path.join(".")
          : issue?.path;
        return path ? `${path}: ${issue.message}` : issue.message;
      })
      .join(" | ");
  }

  if (rawErrors && typeof rawErrors === "object") {
    return Object.entries(rawErrors)
      .map(([field, messages]) => {
        const msg = Array.isArray(messages) ? messages.join(", ") : messages;
        return `${field}: ${msg}`;
      })
      .join(" | ");
  }

  return data.message ?? "Terjadi kesalahan, silakan coba lagi";
}

/**
 * Hook history + submit attempt quiz — pola sama persis dengan
 * useElearningTextDetail.ts (axios biasa + NEXT_PUBLIC_API_BASE_URL +
 * withCredentials), BUKAN pakai authAxios dari AuthContext.
 */
export function useElearningQuizAttempt(
  quizId: string | null | undefined,
): UseElearningQuizAttemptResult {
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttemptRecord | null>(
    null,
  );
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // supaya response fetch yang "telat" (mis. quizId sudah ganti duluan)
  // nggak nimpa state quiz yang aktif sekarang.
  const activeQuizIdRef = useRef<string | null | undefined>(quizId);

  const fetchHistory = useCallback(async () => {
    if (!quizId) {
      setIsLoadingHistory(false);
      setLatestAttempt(null);
      setAttemptsUsed(0);
      return;
    }

    activeQuizIdRef.current = quizId;
    setIsLoadingHistory(true);

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningQuizAttempt/quizzes/${quizId}/attempts/me`,
        {
          withCredentials: true,
          params: {
            page: 1,
            limit: MAX_QUIZ_ATTEMPTS,
            sortBy: "startedAt",
            order: "desc",
          },
        },
      );

      if (activeQuizIdRef.current !== quizId) return; // sudah pindah quiz

      const rows: QuizAttemptRecord[] = res.data?.data ?? [];
      const total: number = res.data?.total ?? rows.length;

      setAttemptsUsed(total);
      setLatestAttempt(rows[0] ?? null);
    } catch (err: any) {
      if (activeQuizIdRef.current !== quizId) return;

      // "Belum ada attempt untuk quiz ini" (dari service, mentee yang
      // belum pernah ngerjain) → wajar, bukan error yang perlu ditoast.
      const message = err?.response?.data?.message ?? "";
      if (!message.includes("Belum ada attempt")) {
        toast.error(extractErrorMessage(err));
      }
      setLatestAttempt(null);
      setAttemptsUsed(0);
    } finally {
      if (activeQuizIdRef.current === quizId) setIsLoadingHistory(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const submitAttempt = useCallback(
    async (answers: Record<string, string[]>) => {
      if (!quizId) return null;

      setIsSubmitting(true);
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningQuizAttempt/quizzes/${quizId}/attempts`,
          { answers },
          { withCredentials: true },
        );

        const attempt: QuizAttemptRecord = res.data?.data;
        setLatestAttempt(attempt);
        setAttemptsUsed((prev) => prev + 1);
        return attempt;
      } catch (err: any) {
        toast.error(extractErrorMessage(err));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [quizId],
  );

  const isPerfectScore = (latestAttempt?.score ?? -1) >= 100;

  return {
    isLoadingHistory,
    latestAttempt,
    attemptsUsed,
    attemptsRemaining: Math.max(MAX_QUIZ_ATTEMPTS - attemptsUsed, 0),
    hasReachedMaxAttempts: attemptsUsed >= MAX_QUIZ_ATTEMPTS,
    isPerfectScore,
    isSubmitting,
    submitAttempt,
    refetchHistory: fetchHistory,
  };
}
