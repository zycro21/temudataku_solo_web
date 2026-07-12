"use client";

import { Shield, Star, Zap, TrendingUp, Clock } from "lucide-react";
import { useAffiliatorProfile } from "@/hooks/useAffiliatorProfile";

const TIER_CONFIG = {
  BRONZE: {
    label: "Bronze",
    icon: Shield,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    nextThreshold: 40,
    nextLabel: "Silver",
    description: "Bagi kode referralmu & kumpulkan poin untuk naik ke Silver",
    zeroHint:
      "Yuk bagikan kode referralmu sekarang — kumpulkan poin dan raih tier Silver!",
  },
  SILVER: {
    label: "Silver",
    icon: Star,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    nextThreshold: 120,
    nextLabel: "Gold",
    description: "Keren! Terus referral untuk naik ke Gold",
    zeroHint:
      "Kumpulkan poin sebelum periode ini berakhir agar tidak turun tier",
  },
  GOLD: {
    label: "Gold",
    icon: Zap,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    nextThreshold: null,
    nextLabel: null,
    description: "Tier tertinggi — kamu sudah di puncak!",
    zeroHint:
      "Kumpulkan poin agar tier Gold-mu tidak turun di periode berikutnya",
  },
} as const;

const TIER_MIN: Record<string, number> = { BRONZE: 0, SILVER: 40, GOLD: 120 };
const TIER_MAX: Record<string, number> = { BRONZE: 39, SILVER: 119, GOLD: 9999 };

function Skeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-emerald-100 animate-pulse">
      <div className="h-9 bg-emerald-100" />
      <div className="p-5 bg-white space-y-3">
        <div className="h-3 w-40 bg-gray-100 rounded" />
        <div className="h-2 bg-gray-100 rounded-full" />
        <div className="h-16 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function AffTierCard() {
  const { data, loading } = useAffiliatorProfile();

  if (loading) return <Skeleton />;
  if (!data) return null;

  const { tierProgress, currentSeason } = data;
  const tierKey =
    (tierProgress.currentTier as keyof typeof TIER_CONFIG) || "BRONZE";
  const config = TIER_CONFIG[tierKey] ?? TIER_CONFIG.BRONZE;
  const Icon = config.icon;

  const totalPoints = tierProgress.totalPoints;
  const min = TIER_MIN[tierKey] ?? 0;
  const max = TIER_MAX[tierKey] ?? 39;
  const progressPct =
    tierKey === "GOLD"
      ? 100
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(((totalPoints - min) / (max - min + 1)) * 100),
          ),
        );

  const seasonPoints = currentSeason?.pointsThisSeason ?? 0;
  const minPointsToKeep = currentSeason?.maintenanceQuota ?? null;
  const seasonProgress = currentSeason?.maintenanceProgress ?? null;
  const isSafe = seasonProgress !== null && seasonProgress >= 100;

  return (
    <div className="rounded-2xl border border-emerald-100 overflow-hidden shadow-sm bg-white">
      {/* ── Season banner — selalu di atas & mencolok ───────────── */}
      <div className="bg-emerald-600 px-6 py-3 flex items-center justify-between">
        {currentSeason ? (
          <>
            <div className="flex items-center gap-2 text-white">
              <TrendingUp size={14} />
              <span className="text-sm font-bold">
                {currentSeason.seasonName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-50">
              <Clock size={12} />
              <span className="text-[11px] font-medium">
                Berakhir{" "}
                {new Date(currentSeason.endDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-emerald-50">
            <Clock size={13} />
            <span className="text-[12px]">
              Tidak ada periode aktif saat ini
            </span>
          </div>
        )}
      </div>

      {/* ── Hero: tier & progress ─────────────────────────────────── */}
      <div className="px-6 py-5 relative overflow-hidden">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[11px] font-semibold text-emerald-700/60 uppercase tracking-widest mb-1">
              Tier Saat Ini
            </p>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-lg ${config.iconBg}`}
              >
                <Icon size={18} className={config.iconColor} />
              </span>
              <span className="text-2xl font-black text-gray-800">
                {config.label}
              </span>
            </div>
            <p className="text-gray-500 text-[12px] max-w-[220px] leading-snug">
              {config.description}
            </p>
          </div>

          {/* Poin badge */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 text-center min-w-[80px]">
            <p className="text-[10px] font-bold text-emerald-700/60 uppercase tracking-wider mb-0.5">
              Total Poin
            </p>
            {totalPoints === 0 ? (
              <>
                <p className="text-emerald-700 text-3xl font-black leading-none">
                  0
                </p>
                <p className="text-emerald-600/50 text-[10px] mt-1">
                  belum ada poin
                </p>
              </>
            ) : (
              <p className="text-emerald-700 text-3xl font-black leading-none">
                {totalPoints}
              </p>
            )}
          </div>
        </div>

        {/* Progress ke tier berikutnya */}
        {tierKey !== "GOLD" ? (
          <div className="relative">
            <div className="flex justify-between items-baseline mb-1.5">
              <p className="text-[12px] text-gray-500 font-medium">
                Menuju{" "}
                <span className="font-bold text-gray-800">
                  {config.nextLabel}
                </span>
              </p>
              <p className="text-[12px] text-gray-400">
                {totalPoints === 0
                  ? `Butuh ${config.nextThreshold} poin`
                  : tierProgress.pointsToNextTier !== null
                    ? `${tierProgress.pointsToNextTier} poin lagi`
                    : ""}
              </p>
            </div>
            <div className="h-2.5 bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>{min} poin</span>
              <span>{max + 1} poin</span>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="h-2.5 bg-emerald-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-full rounded-full" />
            </div>
            <p className="text-[12px] text-gray-500 mt-1.5 font-medium">
              🏆 Kamu sudah di tier tertinggi — pertahankan terus!
            </p>
          </div>
        )}
      </div>

      {/* ── Season detail section ────────────────────────────────── */}
      <div className="bg-emerald-50/60 px-6 py-4">
        {currentSeason ? (
          <>
            {/* Silver & Gold: tampilkan target poin periode */}
            {minPointsToKeep !== null ? (
              <>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-[11px] text-gray-500 mb-0.5">
                      Poin periode ini
                    </p>
                    <p className="text-xl font-black text-gray-800 leading-none">
                      {seasonPoints}
                      <span className="text-sm font-normal text-gray-400 ml-1">
                        / {minPointsToKeep} target
                      </span>
                    </p>
                  </div>

                  {/* Status badge */}
                  <div
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      isSafe
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {isSafe ? "✓ Aman" : "Perlu poin"}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-white rounded-full overflow-hidden mb-2 border border-emerald-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isSafe
                        ? "bg-emerald-500"
                        : seasonProgress !== null && seasonProgress >= 50
                          ? "bg-emerald-400"
                          : "bg-red-400"
                    }`}
                    style={{ width: `${Math.min(100, seasonProgress ?? 0)}%` }}
                  />
                </div>

                {/* Keterangan */}
                <p
                  className={`text-[12px] font-medium ${
                    isSafe ? "text-emerald-700" : "text-gray-600"
                  }`}
                >
                  {isSafe ? (
                    "✓ Tier kamu aman sampai akhir periode ini"
                  ) : seasonPoints === 0 ? (
                    <>{config.zeroHint}</>
                  ) : (
                    `Kumpulkan ${minPointsToKeep - seasonPoints} poin lagi agar tier kamu tidak turun`
                  )}
                </p>
              </>
            ) : (
              /* Bronze — belum ada kuota bertahan, arahkan untuk naik tier */
              <div className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-emerald-100">
                <Icon
                  size={16}
                  className={`${config.iconColor} mt-0.5 shrink-0`}
                />
                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    {seasonPoints === 0
                      ? "Yuk mulai kumpulkan poin!"
                      : "Terus kumpulkan poin!"}
                  </p>
                  <p className="text-[12px] text-emerald-700 mt-0.5 leading-snug">
                    {seasonPoints === 0
                      ? tierProgress.pointsToNextTier !== null
                        ? `Kamu butuh ${tierProgress.pointsToNextTier} poin lagi untuk naik ke tier Silver. Bagikan kode referralmu sekarang!`
                        : config.zeroHint
                      : tierProgress.pointsToNextTier !== null
                        ? `${seasonPoints} poin terkumpul periode ini — tinggal ${tierProgress.pointsToNextTier} poin lagi menuju Silver!`
                        : `${seasonPoints} poin dikumpulkan periode ini — terus semangat!`}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-gray-400 py-1">
            <Clock size={14} />
            <p className="text-sm">Tidak ada periode aktif saat ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
