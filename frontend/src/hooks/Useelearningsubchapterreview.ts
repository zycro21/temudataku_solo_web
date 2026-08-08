"use client";

import { useCallback, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export interface SubChapterReviewRecord {
  id: string;
  rating: number;
  comment: string | null;
  isPublic: boolean;
  isAnonymous: boolean;
  createdAt: string | null;
}

/**
 * Hook buat modal review otomatis di SubchapterDetail.tsx.
 *
 * Dua tanggung jawab:
 * 1. `checkMyReview(subChapterId)` — GET /reviews/me?subChapterId=...&limit=1
 *    (endpoint LIST "review saya" yang sudah ada, tinggal difilter pakai
 *    subChapterId — bukan endpoint baru terpisah). Karena
 *    `@@unique([userId, subChapterId])` di skema, hasilnya maksimal 1
 *    item. Balikin `null` kalau mentee BELUM pernah review sub-chapter
 *    ini (bukan error — "belum pernah review" itu jawaban valid, bukan
 *    404), atau objek review kalau sudah pernah.
 * 2. `submitReview(subChapterId, payload)` — POST /subchapters/:id/review.
 *    Begitu sukses, `myReview` ke-update sendiri jadi review yang baru
 *    dibuat, jadi modal nggak akan muncul lagi selama komponen ini hidup.
 *
 * `myReview` sengaja dibedain 3 kondisi: `undefined` (belum pernah dicek
 * sama sekali), `null` (sudah dicek, memang belum ada review), atau objek
 * (sudah ada review) — supaya pemanggil bisa nunggu hasil cek dulu sebelum
 * mutusin nampilin modal (hindari modal "flash" sebentar sebelum data
 * beneran ke-load).
 */
export function useElearningSubChapterReview() {
  const [myReview, setMyReview] = useState<
    SubChapterReviewRecord | null | undefined
  >(undefined);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkMyReview = useCallback(async (subChapterId: string) => {
    setIsChecking(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningReview/reviews/me`,
        {
          withCredentials: true,
          params: { subChapterId, limit: 1 },
        },
      );
      // 🔥 Endpoint ini bentuk response-nya list ({ meta, data: [...] }),
      // bukan single object — ambil elemen pertama aja (maksimal 1 hasil
      // berkat unique constraint userId+subChapterId di backend).
      const rows: SubChapterReviewRecord[] = res.data?.data?.data ?? [];
      const data = rows[0] ?? null;
      setMyReview(data);
      return data;
    } catch {
      // 🔥 Gagal ngecek status review bukan error yang perlu mengganggu
      // pengalaman belajar (modal review cuma pelengkap, bukan bagian
      // utama alur belajar) — biarin `myReview` tetap `undefined` supaya
      // pemanggil tau pengecekan belum berhasil (bukan dianggap "sudah
      // pasti belum review" yang bisa salah nampilin modal padahal
      // sebenarnya sudah pernah).
      return undefined;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const submitReview = useCallback(
    async (
      subChapterId: string,
      payload: { rating: number; comment?: string },
    ) => {
      setIsSubmitting(true);
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningReview/subchapters/${subChapterId}/review`,
          payload,
          { withCredentials: true },
        );
        const data: SubChapterReviewRecord = res.data?.data;
        setMyReview(data);
        toast.success("Terima kasih atas review-nya!");
        return data;
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message ??
            "Gagal mengirim review, silakan coba lagi",
        );
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { myReview, isChecking, isSubmitting, checkMyReview, submitReview };
}
