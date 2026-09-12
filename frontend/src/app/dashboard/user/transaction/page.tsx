"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import TransactionSection from "@/components/dashboard/user/transaction/transactionSection";

export default function TransactionDashboardUserPage() {
  // 🔥 BARU: state drawer sidebar mobile — pola sama persis kayak
  // page.tsx Overview/Jadwal/Feedback/Sertifikat.
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 🔥 DIUBAH: "ml-64" → "ml-0 md:ml-64" */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 min-w-0">
        <DashboardHeader
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* 🔥 DIUBAH: px-5 → px-3 md:px-5 */}
        <main className="flex-1 px-3 md:px-5 py-4 bg-gray-50 overflow-x-hidden min-w-0">
          {/* 🔥 BARU: kartu judul khusus MOBILE (md:hidden), konsisten
              sama pola halaman lain. TIDAK muncul di desktop. */}
          <div className="md:hidden mb-4 rounded-xl bg-white border border-gray-200 p-4">
            <p className="text-base font-semibold text-gray-800">
              Histori Transaksi
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Riwayat pembayaran program yang kamu ikuti
            </p>
          </div>

          {/* 🔥 DIUBAH: <h1> ASLI tidak diubah sama sekali — cuma
              ditambah "hidden md:block". */}
          <h1 className="hidden md:block text-xl font-semibold text-gray-800 mb-4">
            Histori Transaksi
          </h1>

          <TransactionSection />
        </main>
      </div>
    </div>
  );
}
