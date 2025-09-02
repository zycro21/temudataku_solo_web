import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";
import StatCards from "@/components/dashboard/user/statCards";
import ChartSection from "@/components/dashboard/user/chartSection";
import ScheduleSection from "@/components/dashboard/user/scheduleSection";
import ActivitySection from "@/components/dashboard/user/activitySection";
import RecommendationSection from "@/components/dashboard/user/recommendationSection";

export default function JadwalDashboardUserPage() {
  return (
    <div className="flex mb-8">
      <Sidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-72">
        <DashboardHeader />
        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            Jadwal
          </h1>

        </main>
      </div>
    </div>
  );
}
