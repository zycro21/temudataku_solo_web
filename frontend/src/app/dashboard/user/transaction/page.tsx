"use client";

import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import TransactionSection from "@/components/dashboard/user/transaction/transactionSection";

export default function TransactionDashboardUserPage() {
  return (
    <div className="flex">
      <Sidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <DashboardHeader />
        {/* Main content */}
        <main className="flex-1 px-5 py-4 bg-gray-50 overflow-x-hidden min-w-0">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">
            Histori Transaksi
          </h1>
          <TransactionSection />
        </main>
      </div>
    </div>
  );
}
