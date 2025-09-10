import AffSidebar from "@/components/dashboard/affiliator/sidebarDashboardAff";
import DashboardAffHeader from "@/components/dashboard/affiliator/headerDashboardAff";
import AffProfileInfo from "@/components/dashboard/affiliator/profile/affProfileInfo";
import AffAccountInfo from "@/components/dashboard/affiliator/profile/affAccountInfo";
import AffSecuritySettings from "@/components/dashboard/affiliator/profile/affSecuritySettings";
import AffDangerZone from "@/components/dashboard/affiliator/profile/affDangerZone";

export default function MainDashboardAffProfilePage() {
  return (
    <div className="flex mb-8">
      <AffSidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-72">
        <DashboardAffHeader />
        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <h1 className="text-2xl font-semibold text-gray-800">
            Profile Settings
          </h1>
          <p className="mt-0 mb-10 text-gray-500">
            Manage your affiliate profile and account information
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mt-6">
            {/* Kiri: Profile Info (40%) */}
            <div className="lg:col-span-4">
              <AffProfileInfo />
            </div>

            {/* Kanan: Account Info, Security, Danger Zone (60%) */}
            <div className="lg:col-span-6 space-y-6">
              <AffAccountInfo />
              <AffSecuritySettings />
              <AffDangerZone />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
