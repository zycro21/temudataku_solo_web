"use client";

import { useState } from "react";
import StreamsHeader from "@/components/admin/elearning/streams/StreamsHeader";
import StreamsTable from "@/components/admin/elearning/streams/StreamsTable";

export default function StreamsPage() {
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-6">
      <StreamsHeader
        search={search}
        onSearchChange={setSearch}
        onStreamCreated={handleRefresh}
      />
      <StreamsTable search={search} refreshKey={refreshKey} />
    </div>
  );
}