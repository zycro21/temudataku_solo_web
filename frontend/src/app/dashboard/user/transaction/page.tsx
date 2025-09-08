import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import TransactionSection from "@/components/dashboard/user/transaction/transactionSection";

export default function TransactionDashboardUserPage() {
  return (
    <div className="flex mb-8">
      <Sidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-72">
        <DashboardHeader />
        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            Histori Transaksi
          </h1>
          <TransactionSection />
        </main>
      </div>
    </div>
  );
}
