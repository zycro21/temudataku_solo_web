"use client";

import AffSidebar from "@/components/dashboard/affiliator/sidebarDashboardAff";
import DashboardAffHeader from "@/components/dashboard/affiliator/headerDashboardAff";
import AffStatCards from "@/components/dashboard/affiliator/affStatCards";
import AffReferralAnalytics from "@/components/dashboard/affiliator/affReferralAnalytics";
import AffReferralCode from "@/components/dashboard/affiliator/affReferralCode";
import AffRecentReferrals from "@/components/dashboard/affiliator/affRecentReferrals";
import AffTierCard from "@/components/dashboard/affiliator/affTierCard";

export default function MainDashboardAffPage() {
  return (
    <div className="flex mb-8">
      <AffSidebar />
      <div className="flex-1 flex flex-col ml-72">
        <DashboardAffHeader />
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-2xl font-semibold text-gray-800">Overview</h1>
          <p className="mt-0 mb-6 text-gray-500">Dashboard Affiliator</p>

          {/* Stat cards */}
          <div className="max-w-[85%] mb-6">
            <AffStatCards />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-6">
            {/* Kiri: Tier card + Chart */}
            <div className="lg:col-span-6 space-y-6">
              <AffTierCard />
              <AffReferralAnalytics />
            </div>

            {/* Kanan: Referral code + Komisi terbaru */}
            <div className="lg:col-span-5 space-y-6">
              <AffReferralCode />
              <AffRecentReferrals />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
