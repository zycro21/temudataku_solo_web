import Image from "next/image";

import MentorSidebar from "@/components/dashboard/mentor/sidebarDashboardMentor";
import DashboardAffHeader from "@/components/dashboard/affiliator/headerDashboardAff";

export default function MainDashboardAffPage() {
  return (
    <div className="flex mb-8">
      <MentorSidebar />
      {/* Konten sebelah kanan */}
      <div className="flex-1 flex flex-col ml-72">
        <DashboardAffHeader />
        {/* Main content */}
        <main className="flex-1 p-6 pl-7 bg-gray-50 overflow-x-hidden">
          <div className="flex flex-col">
            <div>
              <Image
                src="/assets/dashboard/user/avatar.png"
                alt="User Avatar"
                width={36}
                height={36}
                className="rounded-full"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Overview</h1>
              <p className="mt-0 mb-10 text-gray-500">Overview</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
