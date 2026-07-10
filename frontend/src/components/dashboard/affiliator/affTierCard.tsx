"use client";

import { Shield, Star, Zap, TrendingUp } from "lucide-react";
import { useAffiliatorProfile } from "@/hooks/useAffiliatorProfile";

const TIER_CONFIG = {
  BRONZE: {
    label: "Bronze",
    color: "text-amber-700",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50",
    border: "border-amber-200",
    barColor: "bg-amber-400",
    badgeBg: "bg-amber-100",
    icon: Shield,
  },
  SILVER: {
    label: "Silver",
    color: "text-slate-600",
    bg: "bg-gradient-to-br from-slate-50 to-gray-50",
    border: "border-slate-200",
    barColor: "bg-slate-400",
    badgeBg: "bg-slate-100",
    icon: Star,
  },
  GOLD: {
    label: "Gold",
    color: "text-yellow-600",
    bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
    border: "border-yellow-200",
    barColor: "bg-yellow-400",
    badgeBg: "bg-yellow-100",
    icon: Zap,
  },
} as const;

// Batas bawah per tier untuk progress bar
const TIER_MIN: Record<string, number> = { BRONZE: 0, SILVER: 40, GOLD: 120 };
const TIER_MAX: Record<string, number> = { BRONZE: 39, SILVER: 119, GOLD: 120 };

export default function AffTierCard() {
  const { data, loading } = useAffiliatorProfile();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
        <div className="h-6 w-32 bg-gray-100 rounded mb-4" />
        <div className="h-16 bg-gray-100 rounded-xl mb-4" />
        <div className="h-2 bg-gray-100 rounded-full" />
      </div>
    );
  }

  if (!data) return null;

  const { tierProgress, currentSeason } = data;
  const tier =
    (tierProgress.currentTier as keyof typeof TIER_CONFIG) || "BRONZE";
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG.BRONZE;
  const Icon = config.icon;

  // Progress ke tier berikutnya
  const min = TIER_MIN[tier] ?? 0;
  const max = TIER_MAX[tier] ?? 39;
  const progressToNext =
    tier === "GOLD"
      ? 100
      : Math.min(
          100,
          Math.round(
            ((tierProgress.totalPoints - min) / (max - min + 1)) * 100,
          ),
        );

  return (
    <div
      className={`rounded-2xl p-5 border ${config.border} ${config.bg} shadow-sm`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 ${config.badgeBg} rounded-xl flex items-center justify-center`}
          >
            <Icon size={20} className={config.color} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Tier Saat Ini</p>
            <p className={`text-lg font-bold ${config.color}`}>
              {config.label}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Poin</p>
          <p className="text-2xl font-bold text-gray-800">
            {tierProgress.totalPoints}
          </p>
        </div>
      </div>

      {/* Progress ke tier berikutnya */}
      {tier !== "GOLD" ? (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Progress ke {tierProgress.nextTier}</span>
            <span>
              {tierProgress.pointsToNextTier !== null
                ? `${tierProgress.pointsToNextTier} poin lagi`
                : ""}
            </span>
          </div>
          <div className="h-2 bg-white/60 rounded-full overflow-hidden">
            <div
              className={`h-full ${config.barColor} rounded-full transition-all duration-700`}
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="h-2 bg-yellow-200 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 w-full rounded-full" />
          </div>
          <p className="text-[11px] text-yellow-600 mt-1.5 font-medium text-center">
            Tier Tertinggi — Pertahankan dengan ≥40 poin/season
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-white/50 pt-4">
        {currentSeason ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={13} className="text-gray-500" />
                <p className="text-xs font-semibold text-gray-600">
                  {currentSeason.seasonName}
                </p>
              </div>
              <p className="text-xs text-gray-400">
                s/d{" "}
                {new Date(currentSeason.endDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Poin Season Ini</span>
              {currentSeason.maintenanceQuota !== null ? (
                <span className="font-medium">
                  {currentSeason.pointsThisSeason} /{" "}
                  {currentSeason.maintenanceQuota} kuota
                </span>
              ) : (
                <span className="text-emerald-600">
                  Tidak ada kuota (Bronze)
                </span>
              )}
            </div>

            {currentSeason.maintenanceProgress !== null && (
              <>
                <div className="h-1.5 bg-white/60 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      currentSeason.maintenanceProgress >= 100
                        ? "bg-emerald-500"
                        : currentSeason.maintenanceProgress >= 60
                          ? "bg-blue-400"
                          : "bg-red-400"
                    }`}
                    style={{
                      width: `${Math.min(100, currentSeason.maintenanceProgress)}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-right font-medium">
                  {currentSeason.maintenanceProgress >= 100 ? (
                    <span className="text-emerald-600">✓ Kuota terpenuhi</span>
                  ) : (
                    <span className="text-red-500">
                      Butuh{" "}
                      {currentSeason.maintenanceQuota! -
                        currentSeason.pointsThisSeason}{" "}
                      poin lagi
                    </span>
                  )}
                </p>
              </>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-400 text-center">
            Tidak ada season aktif
          </p>
        )}
      </div>
    </div>
  );
}
