import Sidebar from "@/components/dashboard/user/sidebarDashboardUser";
import DashboardHeader from "@/components/dashboard/user/dashboardHeader";

export default function FeedbackDashboardUserPage() {
  return (
    <div className="flex mb-8">
      <Sidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-72">
        <DashboardHeader />
        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            Feedback
          </h1>

            {/* <FeedbackFilters ... /> */}
  
  {/* <FeedbackSection
    title="Bootcamp Data Science"
    feedbacks={filteredBootcamp}
  /> */}

  {/* <FeedbackSection
    title="Short Class Python"
    feedbacks={filteredShortClass}
  /> */}
        </main>
      </div>
    </div>
  );
}
