"use client";

import AffSidebar from "@/components/dashboard/affiliator/sidebarDashboardAff";
import DashboardAffHeader from "@/components/dashboard/affiliator/headerDashboardAff";
import AffStatCards from "@/components/dashboard/affiliator/affStatCards";
import MetodeSaldo from "@/components/dashboard/affiliator/withdraw/metodeSaldo";
import PenarikanSaldo from "@/components/dashboard/affiliator/withdraw/penarikanSaldo";

export default function MainDashboardAffPage() {
  return (
    <div className="flex mb-8">
      <AffSidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-72">
        <DashboardAffHeader />
        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-2xl font-semibold text-gray-800">Withdraw</h1>
          <p className="mt-0 mb-10 text-gray-500">Penarikan Dana</p>

          {/* Section: Stat Cards */}
          <div className="max-w-[80%] mb-6">
            <AffStatCards />
          </div>

          <div className="max-w-[98%] mb-8">
            <MetodeSaldo />
          </div>

          <div className="max-w-[98%]">
            <PenarikanSaldo />
          </div>

        </main>
      </div>
    </div>
  );
}
