"use client";

import { useState } from "react";
import ArtikelHeader, {
  ArtikelStatsShape,
  ArtikelAuthorOption,
} from "@/components/admin/artikel/ArtikelHeader";
import ArtikelTable from "@/components/admin/artikel/ArtikelTable";

type StatusFilterValue = "" | "DRAFT" | "PUBLISHED";

export default function ArtikelPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("");
  const [stats, setStats] = useState<ArtikelStatsShape>({
    total: 0,
    draft: 0,
    published: 0,
  });
  // Daftar penulis unik, diisi oleh ArtikelTable setelah fetch, dipakai
  // buat ngisi opsi dropdown filter "Penulis" di header.
  const [authors, setAuthors] = useState<ArtikelAuthorOption[]>([]);

  return (
    <div className="space-y-6">
      <ArtikelHeader
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        authorFilter={authorFilter}
        onAuthorFilterChange={setAuthorFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        authors={authors}
        stats={stats}
      />
      <ArtikelTable
        search={search}
        categoryFilter={categoryFilter}
        authorFilter={authorFilter}
        statusFilter={statusFilter}
        onStatsChange={setStats}
        onAuthorsChange={setAuthors}
      />
    </div>
  );
}
