"use client";

import { useEffect, useState } from "react";
import axios from "axios";

/**
 * Fetch jumlah total subscriber E-Learning (hitungan doang, tanpa data
 * pribadi apa pun) dari endpoint publik yang aman diakses guest/mentee.
 * Dipakai sebagai basis buat menampilkan "jumlah peserta" di tiap kartu
 * course, karena tidak ada tracking enrollment per-course di skema —
 * subscription-nya berlaku untuk semua course sekaligus.
 */
export function useElearningSubscriberCount() {
  const [totalSubscribers, setTotalSubscribers] = useState(0);

  useEffect(() => {
    let isMounted = true;

    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubscription/elearning/subscriptions/public-count`,
      )
      .then((res) => {
        if (!isMounted) return;
        setTotalSubscribers(res.data?.data?.totalSubscribers ?? 0);
      })
      .catch(() => {
        if (isMounted) setTotalSubscribers(0);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return totalSubscribers;
}

/**
 * Angka "peserta" per course = total subscriber + offset acak (0-20),
 * di-seed dari courseId supaya stabil (tidak berubah-ubah tiap re-render)
 * selama session yang sama.
 */
export function getDisplayedParticipantCount(
  courseId: string,
  totalSubscribers: number,
) {
  if (totalSubscribers <= 0) return 0;

  let hash = 0;
  for (let i = 0; i < courseId.length; i++) {
    hash = (hash << 5) - hash + courseId.charCodeAt(i);
    hash |= 0;
  }

  const offset = Math.abs(hash) % 21; // 0-20

  return totalSubscribers + offset;
}
