"use client";

import AffSidebar from "@/components/dashboard/affiliator/sidebarDashboardAff";
import DashboardAffHeader from "@/components/dashboard/affiliator/headerDashboardAff";
import AffStatCards from "@/components/dashboard/affiliator/affStatCards";
import AffReferralAnalytics from "@/components/dashboard/affiliator/affReferralAnalytics";
import AffReferralCode from "@/components/dashboard/affiliator/affReferralCode";
import AffRecentReferrals from "@/components/dashboard/affiliator/affRecentReferrals";

export default function MainDashboardAffPage() {
  return (
    <div className="flex mb-8">
      <AffSidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-72">
        <DashboardAffHeader />
        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-2xl font-semibold text-gray-800">Overview</h1>
          <p className="mt-0 mb-10 text-gray-500">Overview</p>

          {/* Section: Stat Cards */}
          <div className="max-w-[80%]">
            <AffStatCards />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 mt-4">
            {/* Grafik Analitik 55% */}
            <div className="lg:col-span-6">
              <AffReferralAnalytics />
            </div>

            {/* Kode Referral 45% */}
            <div className="lg:col-span-5">
              <AffReferralCode />
              {/* Referral terbaru */}
              <div className="mt-6">
                <AffRecentReferrals />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
