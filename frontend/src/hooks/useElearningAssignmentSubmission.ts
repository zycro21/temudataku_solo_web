"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export const MAX_ASSIGNMENT_ATTEMPTS = 2;

// 🔥 DIUBAH: ambang batas skor kelulusan dinaikkan dari 75 → 80. Berlaku
// KHUSUS di attempt terakhir (attempt ke-MAX_ASSIGNMENT_ATTEMPTS). Di
// attempt terakhir, admin/curdev tidak lagi bisa menandai "perlu revisi"
// (karena memang sudah tidak ada kesempatan mengumpulkan ulang), jadi
// lolos/tidaknya mentee ditentukan otomatis dari skor terhadap ambang
// batas ini. ⚠️ Nilai ini HARUS disamakan dengan konstanta yang sama di
// backend (ASSIGNMENT_PASSING_SCORE, dulu ada di
// elearningCertificate.service.ts — kalau logic kelulusan assignment ada
// juga di service progress/submission lain, samakan di sana juga).
export const PASSING_SCORE_THRESHOLD = 80;

export type SubmissionStatus =
  | "PENDING"
  | "REVIEWED"
  | "REVISION_REQUIRED"
  | "APPROVED"
  | "REJECTED";

// 🔥 BARU: hasil akhir yang benar-benar ditampilkan ke user (mentee
// maupun admin), TERPISAH dari `status` mentah yang dikirim backend.
// Backend cuma pernah mengirim PENDING / REVISION_REQUIRED / REVIEWED
// (tidak pernah literal APPROVED/REJECTED — lihat catatan di
// getAssignmentReviewOutcome di bawah), jadi "lolos" vs "tidak lolos"
// HARUS diturunkan di sini, bukan dibaca langsung dari `status`.
export type AssignmentReviewOutcome =
  | "PENDING"
  | "REVISION_REQUIRED"
  | "APPROVED"
  | "REJECTED";

/**
 * Satu-satunya sumber kebenaran untuk menentukan hasil akhir submission
 * assignment (dipakai oleh sisi mentee lewat hook ini, DAN oleh sisi
 * admin/curdev di GradeSubmissionModal.tsx & SubmissionsTable.tsx —
 * supaya kedua sisi selalu sepakat, tidak ada lagi celah beda logic).
 *
 * Aturan bisnisnya:
 * - Belum direview sama sekali → PENDING.
 * - Reviewer mencentang "perlu revisi" → REVISION_REQUIRED. Ini HANYA
 *   valid untuk attempt yang BUKAN attempt terakhir — di attempt
 *   terakhir, UI form review (GradeSubmissionModal) sudah tidak
 *   menyediakan opsi ini sama sekali, karena mentee sudah tidak punya
 *   kesempatan mengumpulkan ulang. Kalau bukan attempt terakhir DAN
 *   reviewer tidak mencentang "perlu revisi" → langsung APPROVED, tanpa
 *   syarat skor minimum (skor cuma catatan, bukan penentu lolos di
 *   attempt non-terakhir).
 * - Di attempt terakhir, reviewer tidak lagi menentukan revisi — lolos
 *   tidaknya murni dari skor: >= PASSING_SCORE_THRESHOLD → APPROVED,
 *   di bawah itu → REJECTED.
 */
export function getAssignmentReviewOutcome(params: {
  status: string | null | undefined;
  isRevisionRequired?: boolean | null;
  score?: number | null;
  isLastAttempt: boolean;
}): AssignmentReviewOutcome {
  const { status, isRevisionRequired, score, isLastAttempt } = params;

  if (!status || status === "PENDING") return "PENDING";
  if (isRevisionRequired) return "REVISION_REQUIRED";

  if (isLastAttempt) {
    return typeof score === "number" && score >= PASSING_SCORE_THRESHOLD
      ? "APPROVED"
      : "REJECTED";
  }

  return "APPROVED";
}

export interface SubmissionRecord {
  id: string;
  notes: string | null;
  files: string[];
  status: SubmissionStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  feedback: string | null;
  score: number | null;
  isRevisionRequired: boolean | null;
  // 🔥 BARU: batas waktu revisi yang ditetapkan reviewer (admin/curdev)
  // saat me-review submission — dikirim balik oleh backend di field yang
  // sama dengan yang di-set lewat endpoint review (lihat
  // GradeSubmissionModal.tsx sisi admin).
  revisionDeadline: string | null;
  attemptsUsed?: number;
  attemptsRemaining?: number;
}

interface UseElearningAssignmentSubmissionResult {
  // history
  isLoadingHistory: boolean;
  latestSubmission: SubmissionRecord | null;
  attemptsUsed: number;
  attemptsRemaining: number;

  // status turunan — dipakai langsung di komponen biar nggak ulang logic
  // di banyak tempat
  isPending: boolean; // sudah dikirim, belum direview admin/curdev
  isApproved: boolean; // lolos
  needsRevision: boolean; // sudah direview, perlu revisi
  isRejected: boolean; // 🔥 BARU: sudah direview di attempt terakhir & skor < ambang batas → tidak lolos
  isLastAttempt: boolean; // 🔥 BARU: submission ini dikirim di attempt terakhir (tidak ada kesempatan revisi lagi)
  canRetry: boolean; // needsRevision DAN masih ada sisa kesempatan

  // submit
  isSubmitting: boolean;
  submitAssignment: (
    files: File[],
    notes: string,
  ) => Promise<SubmissionRecord | null>;

  refetchHistory: () => Promise<void>;
}

// Sama seperti hook quiz — format pesan error axios biar field-level Zod
// issues (kalau ada) ikut ke-surface, bukan cuma "Data tidak valid" generik.
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
 * Hook history + submit submission assignment (project) — pola sama
 * seperti useElearningQuizAttempt.ts (axios biasa + NEXT_PUBLIC_API_BASE_URL
 * + withCredentials), bukan authAxios.
 */
export function useElearningAssignmentSubmission(
  assignmentId: string | null | undefined,
): UseElearningAssignmentSubmissionResult {
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [latestSubmission, setLatestSubmission] =
    useState<SubmissionRecord | null>(null);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeAssignmentIdRef = useRef<string | null | undefined>(assignmentId);

  const fetchHistory = useCallback(async () => {
    if (!assignmentId) {
      setIsLoadingHistory(false);
      setLatestSubmission(null);
      setAttemptsUsed(0);
      return;
    }

    activeAssignmentIdRef.current = assignmentId;
    setIsLoadingHistory(true);

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubmission/me/assignments/${assignmentId}/submissions`,
        { withCredentials: true },
      );

      if (activeAssignmentIdRef.current !== assignmentId) return;

      const submission: SubmissionRecord | null = res.data?.data ?? null;
      setLatestSubmission(submission);
      setAttemptsUsed(submission?.attemptsUsed ?? (submission ? 1 : 0));
    } catch (err: any) {
      if (activeAssignmentIdRef.current !== assignmentId) return;

      // 404 "belum pernah mengirim submission" → wajar buat yang belum
      // pernah kumpul tugas, bukan error yang perlu ditoast.
      if (err?.response?.status !== 404) {
        toast.error(extractErrorMessage(err));
      }
      setLatestSubmission(null);
      setAttemptsUsed(0);
    } finally {
      if (activeAssignmentIdRef.current === assignmentId)
        setIsLoadingHistory(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const submitAssignment = useCallback(
    async (files: File[], notes: string) => {
      if (!assignmentId) return null;

      setIsSubmitting(true);
      try {
        const formData = new FormData();
        if (notes) formData.append("notes", notes);
        // 🔥 nama field HARUS "files" — cocok dengan multer middleware
        // `handleELearningSubmissionUpload("files", true)` di route.
        files.forEach((file) => formData.append("files", file));

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubmission/assignments/${assignmentId}/submissions`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        const submission: SubmissionRecord = res.data?.data;
        setLatestSubmission(submission);
        if (typeof submission?.attemptsUsed === "number") {
          setAttemptsUsed(submission.attemptsUsed);
        } else {
          setAttemptsUsed((prev) => prev + 1);
        }
        return submission;
      } catch (err: any) {
        toast.error(extractErrorMessage(err));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [assignmentId],
  );

  const attemptsRemaining =
    latestSubmission?.attemptsRemaining ??
    Math.max(MAX_ASSIGNMENT_ATTEMPTS - attemptsUsed, 0);

  // 🔥 FIX (celah revisi-di-attempt-terakhir): sebelumnya lolos/tidaknya
  // cuma ditentukan dari `isRevisionRequired`, jadi kalau reviewer
  // mencentang "perlu revisi" di attempt TERAKHIR, mentee terjebak
  // selamanya di status "Perlu Revisi" padahal sudah tidak ada
  // kesempatan mengumpulkan ulang (attemptsRemaining = 0, tombol
  // "Kumpulkan Revisi" tidak pernah bisa dipakai). Sekarang isLastAttempt
  // dihitung dulu, lalu hasil akhirnya diturunkan lewat
  // getAssignmentReviewOutcome (satu-satunya sumber kebenaran, dipakai
  // juga di sisi admin) — di attempt terakhir, status ditentukan dari
  // skor terhadap PASSING_SCORE_THRESHOLD, bukan dari toggle revisi lagi
  // (toggle itu sendiri sudah dihilangkan dari form review admin untuk
  // attempt terakhir).
  const isLastAttempt =
    !!latestSubmission &&
    (latestSubmission.attemptsUsed ?? attemptsUsed) >= MAX_ASSIGNMENT_ATTEMPTS;

  const outcome = latestSubmission
    ? getAssignmentReviewOutcome({
        status: latestSubmission.status,
        isRevisionRequired: latestSubmission.isRevisionRequired,
        score: latestSubmission.score,
        isLastAttempt,
      })
    : "PENDING";

  const isPending = outcome === "PENDING";
  const isApproved = outcome === "APPROVED";
  const needsRevision = outcome === "REVISION_REQUIRED";
  const isRejected = outcome === "REJECTED";

  return {
    isLoadingHistory,
    latestSubmission,
    attemptsUsed,
    attemptsRemaining,
    isPending,
    isApproved,
    needsRevision,
    isRejected,
    isLastAttempt,
    canRetry: needsRevision && attemptsRemaining > 0,
    isSubmitting,
    submitAssignment,
    refetchHistory: fetchHistory,
  };
}
