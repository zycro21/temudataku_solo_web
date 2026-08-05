"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export const MAX_ASSIGNMENT_ATTEMPTS = 2;

export type SubmissionStatus =
  | "PENDING"
  | "REVIEWED"
  | "REVISION_REQUIRED"
  | "APPROVED"
  | "REJECTED";

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

  const isPending = latestSubmission?.status === "PENDING";
  const isApproved = latestSubmission?.status === "APPROVED";
  const needsRevision =
    !!latestSubmission &&
    !isPending &&
    !isApproved &&
    !!latestSubmission.isRevisionRequired;

  const attemptsRemaining =
    latestSubmission?.attemptsRemaining ??
    Math.max(MAX_ASSIGNMENT_ATTEMPTS - attemptsUsed, 0);

  return {
    isLoadingHistory,
    latestSubmission,
    attemptsUsed,
    attemptsRemaining,
    isPending: !!isPending,
    isApproved: !!isApproved,
    needsRevision,
    canRetry: needsRevision && attemptsRemaining > 0,
    isSubmitting,
    submitAssignment,
    refetchHistory: fetchHistory,
  };
}
