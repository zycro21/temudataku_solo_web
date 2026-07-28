"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export interface ElearningSubBabApiItem {
  id: string;
  title: string;
  texts: unknown[];
}

export interface ElearningSubChapterApiItem {
  id: string;
  courseId: string;
  title: string;
  coverImage: string | null;
  description: string | null;
  orderNumber: number;
  estimatedTime: string | null;
  taskType: "QUIZ" | "PROJECT" | "QUIZ_AND_PROJECT" | null;
  status: string;
  level: string | null;
  subBabs: ElearningSubBabApiItem[];
}

export interface ElearningCourseDetailApiItem {
  id: string;
  title: string;
  description: string | null;
  thumbnailImages: string[];
  category: string | null;
  tags: string[];
  targetAudience: string | null;
  level: string | null;
  estimatedDuration: string | null;
  benefits: string | null;
  toolsUsed: string | null;
  isActive: boolean | null;
  status: string | null;
  mentorProfile?: {
    user?: {
      fullName: string;
      profilePicture: string | null;
    } | null;
  } | null;
  subChapters: ElearningSubChapterApiItem[];
}

export type ElearningCourseDetailErrorType =
  | "unauthenticated" // belum login sama sekali
  | "no-subscription" // sudah login tapi belum punya subscription aktif
  | "not-found"
  | "unknown"
  | null;

interface UseElearningCourseDetailResult {
  course: ElearningCourseDetailApiItem | null;
  loading: boolean;
  errorType: ElearningCourseDetailErrorType;
  refetch: () => void;
}

/**
 * Hook fetch detail satu E-Learning Course (beserta subChapters & subBabs
 * di dalamnya) dari GET /api/elearningCourse/courses/{id}.
 * Dipakai oleh ElearningDetail untuk halaman /elearning/[id].
 */
export function useElearningCourseDetail(
  courseId: string,
): UseElearningCourseDetailResult {
  const [course, setCourse] = useState<ElearningCourseDetailApiItem | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] =
    useState<ElearningCourseDetailErrorType>(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setErrorType(null);

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses/${courseId}`,
        { withCredentials: true },
      );

      setCourse(res.data?.data ?? null);
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

      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();

    // 🔥 Sama seperti useElearningCourses — kalau login sukses di halaman
    // yang sama, komponen tidak remount, jadi perlu dengar event ini
    // supaya data course langsung fetch ulang tanpa refresh manual.
    const handleAuthChanged = () => {
      fetchCourse();
    };

    window.addEventListener(
      "elearning-subscription:refresh",
      handleAuthChanged,
    );

    return () => {
      window.removeEventListener(
        "elearning-subscription:refresh",
        handleAuthChanged,
      );
    };
  }, [fetchCourse]);

  return { course, loading, errorType, refetch: fetchCourse };
}
