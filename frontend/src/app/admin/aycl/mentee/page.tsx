"use client";

import { useState } from "react";
import AyclMenteeHeader from "@/components/admin/aycl/mentee/AyclMenteeHeader";
import AyclMenteeTable from "@/components/admin/aycl/mentee/AyclMenteeTable";

export default function AyclMenteeAdminPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="space-y-4">
      <AyclMenteeHeader refreshKey={refreshKey} />
      <AyclMenteeTable refreshKey={refreshKey} onDataChanged={triggerRefresh} />
    </div>
  );
}