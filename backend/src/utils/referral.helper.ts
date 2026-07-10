// referral.helper.ts
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const resolveProductConfig = async (
  productType: string,
  tier: string,
) => {
  const config = await prisma.affiliatorProductConfig.findUnique({
    where: {
      productType_tier: {
        productType,
        tier,
      },
    },
  });

  if (!config) {
    throw new Error(
      `Product config not found for productType=${productType} tier=${tier}`,
    );
  }

  if (!config.isActive) {
    throw new Error(
      `Referral is not available for this product type (${productType})`,
    );
  }

  return config;
};

// Helper mapping: context + info produk → productType string
export const resolveElearningProductType = (durationDay: number): string => {
  if (durationDay <= 30) return "ELEARNING_1M";
  if (durationDay <= 90) return "ELEARNING_3M";
  return "ELEARNING_6M";
};

export const resolveMentoringProductType = (serviceType: string): string => {
  const map: Record<string, string> = {
    bootcamp: "MENTORING_BOOTCAMP",
    "one-on-one": "MENTORING_ONE_ON_ONE",  // ← hyphen, bukan underscore
    group: "MENTORING_GROUP",
  };
  const result = map[serviceType.toLowerCase()];
  if (!result)
    throw new Error(`Unknown mentoring service type: ${serviceType}`);
  return result;
};

// referral.helper.ts (update)

export const getActiveSeason = async (tx: Prisma.TransactionClient) => {
  const now = new Date();
  return tx.affiliatorSeason.findFirst({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });
};

export const recordReferralCommission = async (
  tx: Prisma.TransactionClient,
  {
    referralCodeId,
    affiliatorProfileId,
    transactionId,
    productType,
    tier,
    originalPrice,
  }: {
    referralCodeId: string;
    affiliatorProfileId: string;
    transactionId: string;
    productType: string;
    tier: string;
    originalPrice: number;
  },
) => {
  // Idempotency check
  const existingCommission = await tx.referralCommisions.findFirst({
    where: { transactionId },
  });
  if (existingCommission) return existingCommission;

  const config = await tx.affiliatorProductConfig.findUnique({
    where: { productType_tier: { productType, tier } },
  });

  if (!config || !config.isActive) {
    console.error(
      `[recordReferralCommission] Config tidak ditemukan/nonaktif untuk productType=${productType} tier=${tier}. Komisi TIDAK dicatat.`,
    );
    return null;
  }

  let commissionAmount = 0;
  if (config.commissionAmount) {
    commissionAmount = config.commissionAmount.toNumber();
  } else if (config.commissionPercent) {
    commissionAmount = Math.round(
      originalPrice * (config.commissionPercent.toNumber() / 100),
    );
  }

  const pointsAwarded = config.pointsAwarded;

  // Season aktif — OPSIONAL. Jika tidak ada, komisi tetap dicatat
  // tapi seasonId null dan poin di-skip (tidak menggagalkan transaksi).
  const season = await getActiveSeason(tx);

  if (!season) {
    console.warn(
      `[recordReferralCommission] Tidak ada season aktif saat ini. Komisi tetap dicatat tanpa seasonId, poin di-skip. referralCodeId=${referralCodeId}, transactionId=${transactionId}`,
    );
  }

  // Catat commission — selalu jalan meski season null
  const commission = await tx.referralCommisions.create({
    data: {
      referralCodeId,
      transactionId,
      amount: commissionAmount,
      tierAtTransaction: tier,
      productType,
      pointsAwarded: season ? pointsAwarded : null,
      seasonId: season?.id ?? null,
      created_at: new Date(),
    },
  });

  // Update poin season — HANYA jika season aktif ada
  if (season) {
    const existingSeasonPoint = await tx.affiliatorSeasonPoint.findUnique({
      where: {
        affiliatorProfileId_seasonId: {
          affiliatorProfileId,
          seasonId: season.id,
        },
      },
    });

    if (existingSeasonPoint) {
      await tx.affiliatorSeasonPoint.update({
        where: { id: existingSeasonPoint.id },
        data: { points: { increment: pointsAwarded }, updatedAt: new Date() },
      });
    } else {
      const profile = await tx.affiliatorProfile.findUnique({
        where: { id: affiliatorProfileId },
        select: { currentTier: true },
      });

      await tx.affiliatorSeasonPoint.create({
        data: {
          affiliatorProfileId,
          seasonId: season.id,
          points: pointsAwarded,
          tierAtSeasonStart: profile?.currentTier ?? "BRONZE",
        },
      });
    }

    // Update totalPoints lifetime + auto-upgrade tier jika melewati ambang batas
    const updatedProfile = await tx.affiliatorProfile.update({
      where: { id: affiliatorProfileId },
      data: {
        totalPoints: { increment: pointsAwarded },
        updatedAt: new Date(),
      },
      select: { totalPoints: true, currentTier: true },
    });

    const newTotalPoints = updatedProfile.totalPoints;
    const currentTier = updatedProfile.currentTier;

    // Hitung tier baru berdasarkan totalPoints terbaru
    let newTier: string;
    if (newTotalPoints >= 120) {
      newTier = "GOLD";
    } else if (newTotalPoints >= 40) {
      newTier = "SILVER";
    } else {
      newTier = "BRONZE";
    }

    // Update tier hanya jika berubah — hindari write yang tidak perlu
    if (newTier !== currentTier) {
      await tx.affiliatorProfile.update({
        where: { id: affiliatorProfileId },
        data: { currentTier: newTier, updatedAt: new Date() },
      });

      console.log(
        `[recordReferralCommission] TIER UPGRADE | affiliatorProfileId: ${affiliatorProfileId} | ` +
          `${currentTier} → ${newTier} | totalPoints: ${newTotalPoints}`,
      );
    }
  }

  return commission;
};
