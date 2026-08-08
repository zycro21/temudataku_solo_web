"use client";

import { useCallback, useRef, useState } from "react";
import axios from "axios";

export interface SubChapterProgressRecord {
  id: string;
  userId: string;
  subChapterId: string;
  progressPercent: number;
  lastActivityAt: string | null;
}

interface MarkTextProgressResult {
  textProgress: {
    id: string;
    userId: string;
    textId: string;
    progress: number;
    lastAccessedAt: string | null;
  };
  subChapterProgress: SubChapterProgressRecord;
}

/**
 * Hook progress tracking buat SubchapterDetail.tsx & SubchapterContent.tsx.
 * Ada 2 fungsi dengan sumber kebenaran BEDA sengaja:
 *
 * 1. `markTextComplete(textId)` — KHUSUS materi (submodule). Nulis ke
 *    `ELearningTextProgress` lewat PATCH /texts/:id/progress, karena
 *    "sudah scroll sampai bawah" itu event sesaat yang nggak ada sumber
 *    kebenaran lain buat disimpan — jadi HARUS di-cache begitu terjadi.
 *
 * 2. `syncSubChapterProgress(subChapterId, dedupeKey)` — KHUSUS quiz &
 *    assignment. TIDAK nulis apa pun, cuma minta backend hitung ULANG
 *    progressPercent dari data yang MEMANG sudah ada sumber kebenarannya
 *    sendiri: ELearningQuizAttempt (buat quiz) & ELearningSubmission
 *    (buat assignment). Sengaja begini (bukan ikut nulis ke
 *    ELearningTextProgress kayak materi) supaya progress quiz/assignment
 *    SELALU merefleksikan kondisi TERKINI attempt/submission-nya — kalau
 *    attempt/submission-nya dihapus atau berubah, panggilan berikutnya ke
 *    fungsi ini otomatis dapat angka yang benar, nggak nyangkut di 100%
 *    selamanya kayak sebelumnya (materi TextProgress yang udah ke-set
 *    nggak pernah di-re-verifikasi ke sumber aslinya).
 *
 * `dedupeKey` di `syncSubChapterProgress` dibiarkan terpisah dari
 * `subChapterId` karena satu SubChapter bisa punya lebih dari satu
 * quiz/assignment (textId beda-beda) — tiap textId tetap harus sync
 * sendiri-sendiri pas dibuka, walau semuanya nyumbang ke SubChapter yang
 * sama.
 */
export function useElearningTextProgress(
  onProgressUpdated?: (subChapterProgress: SubChapterProgressRecord) => void,
) {
  const [isMarking, setIsMarking] = useState(false);

  // 🔥 Cegah nembak endpoint yang sama berkali-kali beruntun dalam satu
  // sesi halaman ini terbuka (mis. handler scroll yang fire puluhan kali
  // per detik pas deket bawah, atau effect quiz/assignment yang re-run
  // tiap render gara-gara dependency lain berubah). Kalau requestnya
  // GAGAL, key-nya dilepas lagi dari Set (lihat catch di bawah) supaya
  // bisa dicoba ulang di kesempatan berikutnya.
  const markedTextIdsRef = useRef<Set<string>>(new Set());
  const syncedKeysRef = useRef<Set<string>>(new Set());

  const markTextComplete = useCallback(
    async (textId: string | null | undefined) => {
      if (!textId || markedTextIdsRef.current.has(textId)) return;

      markedTextIdsRef.current.add(textId);
      setIsMarking(true);
      try {
        const res = await axios.patch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningProgress/texts/${textId}/progress`,
          {},
          { withCredentials: true },
        );
        const data: MarkTextProgressResult | undefined = res.data?.data;
        if (data?.subChapterProgress) {
          onProgressUpdated?.(data.subChapterProgress);
        }
      } catch {
        // 🔥 Gagal nandain progress bukan error yang perlu mengganggu
        // pengalaman belajar (ini side-effect tracking, bukan bagian
        // dari alur utama seperti submit quiz/assignment yang sudah
        // punya toast error sendiri) — jangan toast di sini.
        markedTextIdsRef.current.delete(textId);
      } finally {
        setIsMarking(false);
      }
    },
    [onProgressUpdated],
  );

  const syncSubChapterProgress = useCallback(
    async (
      subChapterId: string | null | undefined,
      dedupeKey?: string | null,
    ) => {
      if (!subChapterId) return;
      const key = dedupeKey ?? subChapterId;
      if (syncedKeysRef.current.has(key)) return;

      syncedKeysRef.current.add(key);
      setIsMarking(true);
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningProgress/subchapters/${subChapterId}/recalculate`,
          {},
          { withCredentials: true },
        );
        const data: SubChapterProgressRecord | undefined = res.data?.data;
        if (data) onProgressUpdated?.(data);
      } catch {
        syncedKeysRef.current.delete(key);
      } finally {
        setIsMarking(false);
      }
    },
    [onProgressUpdated],
  );

  return { isMarking, markTextComplete, syncSubChapterProgress };
}
