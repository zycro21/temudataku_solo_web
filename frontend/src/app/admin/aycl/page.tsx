"use client";
import { useState } from "react";
import AyclHeader from "@/components/admin/aycl/AyclHeader";
import AyclTable from "@/components/admin/aycl/AyclTable";

export default function AyclAdminPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="space-y-4">
      <AyclHeader onAyclCreated={triggerRefresh} refreshKey={refreshKey} />
      <AyclTable refreshKey={refreshKey} onDataChanged={triggerRefresh} />
    </div>
  );
}
