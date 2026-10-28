"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormBuilderHeader from "@/components/admin/form-builder/FormBuilderHeader";
import FormBuilderTable from "@/components/admin/form-builder/FormBuilderTable";
import {
  formCreateHref,
  type FormType,
  type SortOrder,
  type StatusFilter,
} from "@/components/admin/form-builder/shared";

export default function FormBuilderPage() {
  const [type, setType] = useState<FormType>("EVENT");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const router = useRouter();

  // Setiap filter berubah, kembali ke halaman 1
  const withReset =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };

  return (
    <div className="space-y-4">
      <FormBuilderHeader
        type={type}
        onTypeChange={withReset(setType)}
        search={search}
        onSearchChange={withReset(setSearch)}
        statusFilter={statusFilter}
        onStatusFilterChange={withReset(setStatusFilter)}
        sortOrder={sortOrder}
        onSortOrderChange={withReset(setSortOrder)}
        onCreateClick={() => router.push(`${formCreateHref}?type=${type}`)}
      />
      <FormBuilderTable
        type={type}
        search={search}
        statusFilter={statusFilter}
        sortOrder={sortOrder}
        page={page}
        onPageChange={setPage}
        refreshKey={0}
      />
    </div>
  );
}
