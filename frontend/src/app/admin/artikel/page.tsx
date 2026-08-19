"use client";

import { useState } from "react";
import ArtikelHeader from "@/components/admin/artikel/ArtikelHeader";
import ArtikelTable, {
  ArtikelStats,
} from "@/components/admin/artikel/ArtikelTable";

export default function ArtikelPage() {
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<ArtikelStats>({
    total: 0,
    draft: 0,
    published: 0,
    archived: 0,
  });

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-6">
      <ArtikelHeader
        search={search}
        onSearchChange={setSearch}
        onArticleCreated={handleRefresh}
        stats={stats}
      />
      <ArtikelTable
        search={search}
        refreshKey={refreshKey}
        onStatsChange={setStats}
      />
    </div>
  );
}
