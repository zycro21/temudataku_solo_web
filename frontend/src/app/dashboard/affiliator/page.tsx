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
      <div className="flex-1 flex flex-col ml-56">
        <DashboardAffHeader />
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-2xl font-semibold text-gray-800">Overview</h1>
          <p className="mt-0 mb-6 text-gray-500">Dashboard Affiliator</p>

          {/* Row 1: Stat cards */}
          <div className="mb-6">
            <AffStatCards />
          </div>

          {/* Row 2: Tier — 1 baris penuh */}
          <div className="mb-6">
            <AffReferralCode />
          </div>

          {/* Row 3: Referral Code — 1 baris penuh */}
          <div className="mb-6">
            <AffTierCard />
          </div>

          {/* Row 4: Chart + Komisi terbaru */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AffReferralAnalytics />
            <AffRecentReferrals />
          </div>
        </main>
      </div>
    </div>
  );
}
