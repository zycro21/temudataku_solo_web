"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

// 🔥 DIUBAH: tidak ada lagi batas total percobaan seumur hidup. Sekarang
// mentee bebas mengulang quiz KAPAN SAJA, dibatasi cuma lewat JENDELA
// WAKTU: maksimal QUIZ_ATTEMPTS_PER_WINDOW kali dalam
// QUIZ_ATTEMPT_WINDOW_HOURS jam, dihitung mulai dari attempt PERTAMA di
// jendela yang lagi aktif. Begitu QUIZ_ATTEMPT_WINDOW_HOURS jam lewat
// sejak attempt pertama itu, jendela otomatis reset (attempt berikutnya
// jadi awal jendela baru). Nilai ini SENGAJA disamakan dengan konstanta
// di backend (elearningQuizAttempt.service.ts) — kalau salah satu
// diubah, ubah juga yang satunya.
export const QUIZ_ATTEMPT_WINDOW_HOURS = 24;
export const QUIZ_ATTEMPTS_PER_WINDOW = 4;

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
  // 🔥 BARU: cuma diisi backend di response POST /attempts (submitAttempt),
  // state jendela 24 jam SETELAH attempt ini tersimpan.
  attemptsInWindow?: number;
  nextAttemptAvailableAt?: string | null;
}

interface UseElearningQuizAttemptResult {
  // history
  isLoadingHistory: boolean;
  latestAttempt: QuizAttemptRecord | null;
  attemptsUsed: number;
  isPerfectScore: boolean;

  // 🔥 BARU: pengganti attemptsRemaining/hasReachedMaxAttempts lama —
  // sekarang berbasis jendela waktu, bukan batas total. Nilai ini
  // diturunkan dari `attemptsInWindow`/`nextAttemptAvailableAt` yang
  // dikirim balik backend di response GET /attempts/me (lihat
  // ElearningQuizAttemptService.getAttemptsByRole).
  attemptsInWindow: number;
  canAttemptNow: boolean;
  // Kapan boleh mengerjakan lagi kalau `canAttemptNow` false. `null`
  // kalau memang masih boleh sekarang.
  nextAttemptAvailableAt: string | null;

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
  const [attemptsInWindow, setAttemptsInWindow] = useState(0);
  const [nextAttemptAvailableAt, setNextAttemptAvailableAt] = useState<
    string | null
  >(null);
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
            // 🔥 DIUBAH: dulu dibatasi `MAX_QUIZ_ATTEMPTS` (total percobaan
            // seumur hidup, sekarang dihapus — tidak ada lagi batas
            // total). FE cuma butuh attempt PALING TERAKHIR untuk
            // ditampilkan (`rows[0]`); info jendela 24 jam sendiri dihitung
            // backend dari SELURUH histori dan dikirim terpisah lewat
            // `attemptsInWindow`/`nextAttemptAvailableAt` di root response
            // (tidak tergantung `limit` ini).
            limit: 1,
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

      // 🔥 BARU: field jendela waktu dikirim backend di root response
      // (bukan di dalam `data`), khusus untuk role mentee — lihat
      // ElearningQuizAttemptService.getAttemptsByRole. Fallback aman
      // (0 attempt / boleh attempt sekarang) kalau field belum ada,
      // misal saat dipanggil oleh admin/mentor.
      setAttemptsInWindow(res.data?.attemptsInWindow ?? 0);
      setNextAttemptAvailableAt(res.data?.nextAttemptAvailableAt ?? null);
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
      setAttemptsInWindow(0);
      setNextAttemptAvailableAt(null);
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
        // 🔥 BARU: backend ikut mengirim balik state jendela TERBARU
        // setelah attempt ini tersimpan (lihat payload di
        // ELearningQuizAttemptService.startQuizAttempt).
        if (typeof attempt?.attemptsInWindow === "number") {
          setAttemptsInWindow(attempt.attemptsInWindow);
        }
        setNextAttemptAvailableAt(attempt?.nextAttemptAvailableAt ?? null);
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

  // 🔥 BARU: "boleh attempt sekarang" ditentukan backend lewat
  // `nextAttemptAvailableAt` (null = boleh). FE tidak menghitung ulang
  // jendela 24 jam sendiri — cukup percaya nilai dari backend supaya
  // tidak ada celah selisih jam client vs server.
  const canAttemptNow = !nextAttemptAvailableAt;

  return {
    isLoadingHistory,
    latestAttempt,
    attemptsUsed,
    attemptsInWindow,
    canAttemptNow,
    nextAttemptAvailableAt,
    isPerfectScore,
    isSubmitting,
    submitAttempt,
    refetchHistory: fetchHistory,
  };
}
