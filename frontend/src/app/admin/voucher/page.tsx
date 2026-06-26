"use client";

import { useState } from "react";
import VouchersHeader from "@/components/admin/vouchers/VouchersHeader";
import VouchersTable from "@/components/admin/vouchers/VoucherTable";

export default function VouchersPage() {
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-6">
      <VouchersHeader
        search={search}
        onSearchChange={setSearch}
        onVoucherCreated={handleRefresh}
      />
      <VouchersTable search={search} refreshKey={refreshKey} onRefresh={handleRefresh} />
    </div>
  );
}