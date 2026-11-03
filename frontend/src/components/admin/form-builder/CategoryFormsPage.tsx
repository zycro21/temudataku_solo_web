"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { ArrowLeft, ClipboardList, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormBreadcrumb from "./FormBreadcrumb";
import FormBuilderTable from "./FormBuilderTable";
import {
  FORM_API,
  formCreateHref,
  formNewHref,
  TYPE_LABEL,
  useDebouncedValue,
  type FormCategory,
  type FormType,
  type SortOrder,
  type StatusFilter,
} from "./shared";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Diarsipkan" },
];

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "desc", label: "Terbaru" },
  { value: "asc", label: "Terlama" },
];

const selectClass =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

// Halaman yang terbuka saat kartu jenis diklik: daftar form dengan jenis itu
export default function CategoryFormsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = String(params?.categoryId ?? "");
  const hintedType: FormType =
    searchParams.get("type") === "NON_EVENT" ? "NON_EVENT" : "EVENT";

  const [category, setCategory] = useState<FormCategory | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">(
    "loading",
  );
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);

  // Tidak ada endpoint detail jenis, jadi cari dari daftar jenis (kecil, tanpa paging).
  // Tipe dari URL dicoba dulu; kalau tidak ketemu, coba tipe satunya.
  useEffect(() => {
    const controller = new AbortController();
    const other: FormType = hintedType === "EVENT" ? "NON_EVENT" : "EVENT";
    const find = async (t: FormType) => {
      const res = await axios.get(`${FORM_API}/categories`, {
        params: { type: t },
        withCredentials: true,
        signal: controller.signal,
      });
      const data = res.data?.data ?? res.data;
      return (data?.items as FormCategory[] | undefined)?.find(
        (c) => c.id === categoryId,
      );
    };
    (async () => {
      try {
        const found = (await find(hintedType)) ?? (await find(other));
        if (found) {
          setCategory(found);
          setState("ready");
        } else {
          setState("missing");
        }
      } catch (err) {
        if (!axios.isCancel(err)) setState("missing");
      }
    })();
    return () => controller.abort();
  }, [categoryId, hintedType]);

  const type: FormType = category?.type ?? hintedType;
  const backHref = `${formCreateHref}?type=${type}&step=category`;

  const crumbs = ["Buat Form", "Pilih Jenis", category?.name ?? "Jenis Form"];

  if (state === "missing") {
    return (
      <div className="space-y-5">
        <FormBreadcrumb crumbs={["Buat Form", "Pilih Jenis"]} />
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center">
          <p className="text-sm text-gray-600">
            Jenis form tidak ditemukan atau sudah dihapus.
          </p>
          <Link
            href={backHref}
            className="mt-3 inline-block rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
          >
            Kembali ke daftar jenis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <FormBreadcrumb crumbs={crumbs} />

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            {state === "loading" ? (
              <div className="h-6 w-40 animate-pulse rounded bg-gray-100" />
            ) : (
              <h1 className="truncate text-xl font-bold text-gray-900">
                {category?.name}
              </h1>
            )}
            <p className="mt-0.5 max-w-xl text-xs text-gray-500">
              {category?.description ||
                `Daftar ${TYPE_LABEL[type]} dengan jenis ini.`}
            </p>
          </div>
        </div>
        <Button
          onClick={() =>
            router.push(`${formNewHref}?type=${type}&categoryId=${categoryId}`)
          }
          disabled={state !== "ready"}
          className="shrink-0 bg-emerald-500 text-white hover:bg-emerald-600"
        >
          <Plus className="mr-1 h-4 w-4" />
          Buat Form
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          aria-label="Filter status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setPage(1);
          }}
          className={selectClass}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Urutkan"
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value as SortOrder);
            setPage(1);
          }}
          className={selectClass}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari judul form atau event..."
            aria-label="Cari form"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {state === "ready" && (
        <FormBuilderTable
          type={type}
          categoryId={categoryId}
          search={debouncedSearch}
          statusFilter={statusFilter}
          sortOrder={sortOrder}
          page={page}
          onPageChange={setPage}
          refreshKey={0}
        />
      )}

      <div className="pt-2">
        <Button variant="outline" onClick={() => router.push(backHref)}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Kembali
        </Button>
      </div>
    </div>
  );
}
