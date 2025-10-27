"use client";

import { useState } from "react";
import SidebarShortLink from "@/components/shortlink/SidebarShortLink";
import CreateShortLink from "@/components/shortlink/CreateShortLink";
import ShortLinkHistory from "@/components/shortlink/ShortLinkHistory";

export default function ShortLinkDashboardPage() {
  const [activeMenu, setActiveMenu] = useState("create");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarShortLink activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <main className="ml-64 flex-1 p-8 transition-all duration-200">
        {activeMenu === "create" && <CreateShortLink />}
        {activeMenu === "history" && <ShortLinkHistory />}
      </main>
    </div>
  );
}
