// hooks/useAffiliatorProfile.ts
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export interface AffiliatorProfileData {
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    profilePicture: string | null;
  };
  profile: {
    id: string;
    currentTier: string;
    totalPoints: number;
    isActive: boolean;
    joinedAt: string;
  };
  tierProgress: {
    currentTier: string;
    nextTier: string | null;
    totalPoints: number;
    pointsToNextTier: number | null;
    maintenanceQuota: number | null;
  };
  currentSeason: {
    seasonName: string;
    startDate: string;
    endDate: string;
    pointsThisSeason: number;
    tierAtSeasonStart: string;
    maintenanceQuota: number | null;
    maintenanceProgress: number | null;
  } | null;
  seasonHistory: {
    seasonName: string;
    startDate: string;
    endDate: string;
    points: number;
    tierAtSeasonStart: string;
    tierAtSeasonEnd: string | null;
    maintenanceQuotaMet: boolean | null;
  }[];
  referralCodes: { id: string; code: string; isActive: boolean | null }[];
  commissionSummary: {
    totalEarned: number;
    totalPaid: number;
    pendingWithdrawal: number;
    availableBalance: number;
  };
}

export function useAffiliatorProfile() {
  const [data, setData] = useState<AffiliatorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/referral/affiliator/profile`,
        { withCredentials: true },
      )
      .then((res) => {
        if (res.data.success) setData(res.data.data);
        else setError("Gagal memuat profil affiliator");
      })
      .catch((err) => {
        setError(err?.message ?? "Terjadi kesalahan");
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
