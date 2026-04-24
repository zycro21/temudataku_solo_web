"use client";

import { useState } from "react";
import StreamsHeader from "@/components/admin/elearning/streams/StreamsHeader";
import StreamsTable from "@/components/admin/elearning/streams/StreamsTable";

export default function StreamsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <StreamsHeader search={search} onSearchChange={setSearch} />
      <StreamsTable search={search} />
    </div>
  );
}