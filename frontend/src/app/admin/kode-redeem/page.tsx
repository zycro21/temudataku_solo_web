"use client";

import { useState } from "react";
import RedeemCodeHeader from "@/components/admin/redeemCode/RedeemCodeHeader";
import RedeemCodeTable, {
  RedeemCodeStats,
} from "@/components/admin/redeemCode/RedeemCodeTable";

export default function RedeemCodePage() {
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<RedeemCodeStats>({
    total: 0,
    active: 0,
    exhausted: 0,
    expired: 0,
    disabled: 0,
  });

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-6">
      <RedeemCodeHeader
        search={search}
        onSearchChange={setSearch}
        onCodeCreated={handleRefresh}
        stats={stats}
      />
      <RedeemCodeTable
        search={search}
        refreshKey={refreshKey}
        onStatsChange={setStats}
      />
    </div>
  );
}
