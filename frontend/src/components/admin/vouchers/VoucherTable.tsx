"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  X,
  MoreVertical,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface Voucher {
  id: string;
  code: string;
  name: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  productScope: string;
  usageLimit: number | null;
  usageCount: number;
  expiryDate: string | null;
  isActive: boolean;
  createdAt: string;
  createdBy: { id: string; fullName: string; email: string } | null;
  _count: { usages: number };
}

interface VouchersTableProps {
  search: string;
  refreshKey: number;
  onRefresh: () => void;
}

const PRODUCT_SCOPES = [
  "GLOBAL",
  "ELEARNING",
  "PRACTICE",
  "MENTORING",
  "AYCL",
] as const;
const DISCOUNT_TYPES = ["PERCENTAGE", "FLAT"] as const;
type ProductScope = (typeof PRODUCT_SCOPES)[number];
type DiscountType = (typeof DISCOUNT_TYPES)[number];

const SCOPE_LABELS: Record<string, string> = {
  GLOBAL: "Global",
  ELEARNING: "E-Learning",
  PRACTICE: "Practice",
  MENTORING: "Mentoring",
  AYCL: "AYCL",
};

const SCOPE_COLORS: Record<string, string> = {
  GLOBAL: "bg-blue-50 text-blue-700",
  ELEARNING: "bg-purple-50 text-purple-700",
  PRACTICE: "bg-orange-50 text-orange-700",
  MENTORING: "bg-teal-50 text-teal-700",
  AYCL: "bg-pink-50 text-pink-700",
};

interface EditForm {
  code: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  maxDiscountAmount: string;
  minimumPurchase: string;
  productScope: ProductScope;
  usageLimit: string;
  usageLimitPerUser: string;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
}

export default function VouchersTable({
  search,
  refreshKey,
  onRefresh,
}: VouchersTableProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Filters
  const [productScope, setProductScope] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");

  // Modals
  const [detailVoucher, setDetailVoucher] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Action popup menu
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuOpenUpward, setMenuOpenUpward] = useState(false);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(limit),
      };
      if (search) params.search = search;
      if (productScope) params.productScope = productScope;
      if (isActiveFilter !== "") params.isActive = isActiveFilter;

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/voucher/vouchers`,
        { params, withCredentials: true },
      );
      setVouchers(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
      setTotalPages(res.data.totalPages ?? 1);
    } catch {
      toast.error("Gagal memuat daftar voucher");
    } finally {
      setLoading(false);
    }
  }, [search, page, productScope, isActiveFilter, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [search, productScope, isActiveFilter, refreshKey]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detail
  async function openDetail(id: string) {
    setDetailLoading(true);
    setDetailVoucher({});
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/voucher/vouchers/${id}`,
        { withCredentials: true },
      );
      setDetailVoucher(res.data.data);
    } catch {
      toast.error("Gagal memuat detail voucher");
      setDetailVoucher(null);
    } finally {
      setDetailLoading(false);
    }
  }

  // Edit
  // Konversi ISO UTC string ke format datetime-local (waktu lokal browser)
  function toLocalDatetimeInput(isoString: string | null | undefined): string {
    if (!isoString) return "";
    const d = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  }

  function openEdit(v: Voucher) {
    setEditVoucher(v);
    setEditForm({
      code: v.code,
      name: v.name,
      description: (v as any).description ?? "",
      discountType: v.discountType,
      discountValue: String(v.discountValue),
      maxDiscountAmount: String((v as any).maxDiscountAmount ?? ""),
      minimumPurchase: String((v as any).minimumPurchase ?? ""),
      productScope: v.productScope as ProductScope,
      usageLimit: v.usageLimit != null ? String(v.usageLimit) : "",
      usageLimitPerUser: String((v as any).usageLimitPerUser ?? 1),
      startDate: toLocalDatetimeInput((v as any).startDate),
      expiryDate: toLocalDatetimeInput(v.expiryDate),
      isActive: v.isActive,
    });
  }

  function handleEditChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    if (!editForm) return;
    const { name, value, type } = e.target;
    let finalValue: string | boolean =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    // Auto-set waktu ke 00:01 saat pilih tanggal mulai / kedaluwarsa
    if ((name === "startDate" || name === "expiryDate") && value) {
      finalValue = `${value}T00:01`;
    }

    setEditForm((prev) => ({ ...prev!, [name]: finalValue }));
  }

  async function handleEditSubmit() {
    if (!editVoucher || !editForm) return;
    setEditSubmitting(true);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/voucher/vouchers/${editVoucher.id}`,
        {
          code: editForm.code,
          name: editForm.name,
          description: editForm.description || undefined,
          discountType: editForm.discountType,
          discountValue: Number(editForm.discountValue),
          maxDiscountAmount: editForm.maxDiscountAmount
            ? Number(editForm.maxDiscountAmount)
            : undefined,
          minimumPurchase: editForm.minimumPurchase
            ? Number(editForm.minimumPurchase)
            : undefined,
          productScope: editForm.productScope,
          usageLimit: editForm.usageLimit
            ? Number(editForm.usageLimit)
            : undefined,
          usageLimitPerUser: Number(editForm.usageLimitPerUser),
          startDate: editForm.startDate || undefined,
          expiryDate: editForm.expiryDate || undefined,
          isActive: editForm.isActive,
        },
        { withCredentials: true },
      );
      toast.success("Voucher berhasil diperbarui");
      setEditVoucher(null);
      setEditForm(null);
      fetchVouchers();
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal memperbarui voucher");
    } finally {
      setEditSubmitting(false);
    }
  }

  // Toggle active
  async function handleToggleActive(v: Voucher) {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/voucher/vouchers/${v.id}`,
        {
          isActive: !v.isActive,
        },
        { withCredentials: true },
      );
      toast.success(`Voucher ${!v.isActive ? "diaktifkan" : "dinonaktifkan"}`);
      fetchVouchers();
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal mengubah status");
    }
  }

  // Delete
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/voucher/vouchers/${deleteTarget.id}`,
        { withCredentials: true },
      );
      toast.success("Voucher berhasil dihapus");
      setDeleteTarget(null);
      fetchVouchers();
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal menghapus voucher");
    } finally {
      setDeleteLoading(false);
    }
  }

  function formatDiscount(v: Voucher) {
    if (v.discountType === "PERCENTAGE") return `${v.discountValue}%`;
    return `Rp${Number(v.discountValue).toLocaleString("id-ID")}`;
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-20">
        {/* Table toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-gray-700">
            Voucher Terdaftar
            {!loading && (
              <span className="ml-2 text-gray-400 font-normal">({total})</span>
            )}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter scope */}
            <select
              value={productScope}
              onChange={(e) => setProductScope(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 bg-white text-gray-600"
            >
              <option value="">Semua Scope</option>
              {PRODUCT_SCOPES.map((s) => (
                <option key={s} value={s}>
                  {SCOPE_LABELS[s]}
                </option>
              ))}
            </select>
            {/* Filter status */}
            <select
              value={isActiveFilter}
              onChange={(e) => setIsActiveFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 bg-white text-gray-600"
            >
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Tidak Aktif</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 text-xs font-medium uppercase tracking-wide">
                <th className="text-left px-5 py-3">Kode</th>
                <th className="text-left px-5 py-3">Nama</th>
                <th className="text-left px-5 py-3">Diskon</th>
                <th className="text-left px-5 py-3">Scope</th>
                <th className="text-left px-5 py-3">Kedaluwarsa</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : vouchers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    Tidak ada voucher ditemukan
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                        {v.code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 max-w-[160px] truncate">
                      {v.name}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 font-medium">
                      {formatDiscount(v)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${SCOPE_COLORS[v.productScope] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {SCOPE_LABELS[v.productScope] ?? v.productScope}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {formatDate(v.expiryDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${v.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${v.isActive ? "bg-green-500" : "bg-red-400"}`}
                        />
                        {v.isActive ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (openMenu === v.id) {
                              setOpenMenu(null);
                            } else {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              const spaceBelow =
                                window.innerHeight - rect.bottom;
                              const estimatedMenuHeight = 230;
                              setMenuOpenUpward(
                                spaceBelow < estimatedMenuHeight,
                              );
                              setMenuRect(rect);
                              setOpenMenu(v.id);
                            }
                          }}
                          className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
                        >
                          <MoreVertical size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Menampilkan{" "}
              <span className="font-medium text-gray-600">
                {total === 0 ? 0 : (page - 1) * limit + 1}–
                {Math.min(page * limit, total)}
              </span>{" "}
              dari <span className="font-medium text-gray-600">{total}</span>{" "}
              data
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 text-xs rounded-lg border transition-colors ${
                        pageNum === page
                          ? "bg-green-600 text-white border-green-600"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== Fixed Action Popup Menu ===== */}
      {openMenu &&
        vouchers.find((v) => v.id === openMenu) &&
        menuRect &&
        (() => {
          const v = vouchers.find((v) => v.id === openMenu)!;
          return (
            <div
              ref={menuRef}
              onClick={(e) => e.stopPropagation()}
              style={
                menuOpenUpward
                  ? {
                      bottom: window.innerHeight - menuRect.top + 4,
                      right: window.innerWidth - menuRect.right,
                    }
                  : {
                      top: menuRect.bottom + 4,
                      right: window.innerWidth - menuRect.right,
                    }
              }
              className="fixed w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-[9999] text-sm py-1"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(null);
                  openDetail(v.id);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700"
              >
                <Eye size={14} /> Detail
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(null);
                  openEdit(v);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(null);
                  handleToggleActive(v);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-700"
              >
                {v.isActive ? (
                  <ToggleRight size={14} className="text-orange-500" />
                ) : (
                  <ToggleLeft size={14} className="text-green-600" />
                )}
                {v.isActive ? "Nonaktifkan" : "Aktifkan"}
              </button>
              <div className="mx-3 my-1 border-t border-gray-100" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(null);
                  setDeleteTarget(v);
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-red-50 text-red-600"
              >
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          );
        })()}

      {/* ===== Detail Modal ===== */}
      {detailVoucher !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-base font-semibold text-gray-800">
                Detail Voucher
              </h2>
              <button
                onClick={() => setDetailVoucher(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto">
              {detailLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-gray-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-5 text-sm">
                  {/* Hero card — kode + status */}
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-emerald-100 text-xs mb-1">
                          Kode Voucher
                        </p>
                        <p className="font-mono font-bold text-2xl tracking-widest">
                          {detailVoucher.code}
                        </p>
                        <p className="text-emerald-100 text-xs mt-1">
                          {detailVoucher.name}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                          detailVoucher.isActive
                            ? "bg-white/20 text-white"
                            : "bg-red-400/30 text-red-100"
                        }`}
                      >
                        {detailVoucher.isActive ? "● Aktif" : "● Tidak Aktif"}
                      </span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-emerald-100 text-xs mb-0.5">
                          Nilai Diskon
                        </p>
                        <p className="text-3xl font-bold">
                          {detailVoucher.discountType === "PERCENTAGE"
                            ? `${detailVoucher.discountValue}%`
                            : `Rp${Number(detailVoucher.discountValue).toLocaleString("id-ID")}`}
                        </p>
                        {detailVoucher.discountType === "PERCENTAGE" &&
                          detailVoucher.maxDiscountAmount && (
                            <p className="text-emerald-200 text-xs mt-0.5">
                              maks. Rp
                              {Number(
                                detailVoucher.maxDiscountAmount,
                              ).toLocaleString("id-ID")}
                            </p>
                          )}
                      </div>
                      <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                        {SCOPE_LABELS[detailVoucher.productScope] ??
                          detailVoucher.productScope}
                      </span>
                    </div>
                  </div>

                  {/* Section 1 — Info diskon & batasan */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                      Ketentuan
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        [
                          "Tipe Diskon",
                          detailVoucher.discountType === "PERCENTAGE"
                            ? "Persentase (%)"
                            : "Nominal (Rp)",
                        ],
                        [
                          "Min. Pembelian",
                          detailVoucher.minimumPurchase
                            ? `Rp${Number(detailVoucher.minimumPurchase).toLocaleString("id-ID")}`
                            : "—",
                        ],
                        [
                          "Limit Pemakaian",
                          detailVoucher.usageLimit ?? "Unlimited",
                        ],
                        ["Limit per User", detailVoucher.usageLimitPerUser],
                        [
                          "Sudah Dipakai",
                          `${detailVoucher.usageCount ?? 0}× dari ${detailVoucher.usageLimit ?? "∞"}`,
                        ],
                        ["Deskripsi", detailVoucher.description || "—"],
                      ].map(([label, value]) => (
                        <div
                          key={String(label)}
                          className="bg-gray-50 rounded-lg px-3 py-2.5"
                        >
                          <p className="text-xs text-gray-400 mb-0.5">
                            {label}
                          </p>
                          <p className="text-sm font-medium text-gray-800 break-words">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2 — Periode & audit */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                      Periode & Audit
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["Tanggal Mulai", formatDate(detailVoucher.startDate)],
                        ["Kedaluwarsa", formatDate(detailVoucher.expiryDate)],
                        [
                          "Dibuat oleh",
                          detailVoucher.createdBy?.fullName ?? "—",
                        ],
                        ["Dibuat pada", formatDate(detailVoucher.createdAt)],
                      ].map(([label, value]) => (
                        <div
                          key={String(label)}
                          className="bg-gray-50 rounded-lg px-3 py-2.5"
                        >
                          <p className="text-xs text-gray-400 mb-0.5">
                            {label}
                          </p>
                          <p className="text-sm font-medium text-gray-800">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent usages */}
                  {detailVoucher.usages?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                        5 Pemakaian Terbaru
                      </p>
                      <div className="space-y-2">
                        {detailVoucher.usages.map((u: any) => (
                          <div
                            key={u.id}
                            className="flex items-center justify-between bg-gray-50 px-3 py-2.5 rounded-lg gap-2"
                          >
                            <span className="text-sm text-gray-700 truncate flex-1">
                              {u.user?.fullName ?? "—"}
                            </span>
                            <span className="text-xs text-gray-400 shrink-0">
                              {formatDate(u.usedAt)}
                            </span>
                            <span
                              className={`text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full ${
                                u.status === "USED"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : u.status === "CANCELLED"
                                    ? "bg-red-50 text-red-500"
                                    : "bg-orange-50 text-orange-600"
                              }`}
                            >
                              {u.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== Edit Modal ===== */}
      {editVoucher && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-base font-semibold text-gray-800">
                Edit Voucher
              </h2>
              <button
                onClick={() => {
                  setEditVoucher(null);
                  setEditForm(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              {/* Row: kode + nama */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Voucher <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="code"
                    value={editForm.code}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 uppercase"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Hanya huruf, angka,{" "}
                    <code className="bg-gray-100 px-0.5 rounded">-</code> dan{" "}
                    <code className="bg-gray-100 px-0.5 rounded">_</code>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Voucher <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi{" "}
                  <span className="text-emerald-500 font-normal text-xs">
                    Opsional
                  </span>
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-none"
                />
              </div>

              {/* Tipe diskon + nilai diskon */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Diskon <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="discountType"
                    value={editForm.discountType}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white"
                  >
                    <option value="PERCENTAGE">Persentase (%)</option>
                    <option value="FLAT">Nominal (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai Diskon <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="discountValue"
                    type="number"
                    value={editForm.discountValue}
                    onChange={handleEditChange}
                    placeholder={
                      editForm.discountType === "PERCENTAGE"
                        ? "Contoh: 30"
                        : "Contoh: 50000"
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Maks potongan (PERCENTAGE only) + min pembelian */}
              <div className="grid grid-cols-2 gap-4">
                {editForm.discountType === "PERCENTAGE" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maks. Potongan (Rp){" "}
                      <span className="text-emerald-500 font-normal text-xs">
                        Opsional
                      </span>
                    </label>
                    <input
                      name="maxDiscountAmount"
                      type="number"
                      value={editForm.maxDiscountAmount}
                      onChange={handleEditChange}
                      placeholder="Contoh: 100000"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Pembelian (Rp){" "}
                    <span className="text-emerald-500 font-normal text-xs">
                      Opsional
                    </span>
                  </label>
                  <input
                    name="minimumPurchase"
                    type="number"
                    value={editForm.minimumPurchase}
                    onChange={handleEditChange}
                    placeholder="Contoh: 200000"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Scope produk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope Produk
                </label>
                <select
                  name="productScope"
                  value={editForm.productScope}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white"
                >
                  {PRODUCT_SCOPES.map((s) => (
                    <option key={s} value={s}>
                      {SCOPE_LABELS[s] ?? s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Limit pemakaian + limit per user */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limit Pemakaian{" "}
                    <span className="text-emerald-500 font-normal text-xs">
                      Opsional
                    </span>
                    <span className="text-gray-400 font-normal text-xs">
                      {" "}
                      (kosong = unlimited)
                    </span>
                  </label>
                  <input
                    name="usageLimit"
                    type="number"
                    value={editForm.usageLimit}
                    onChange={handleEditChange}
                    placeholder="Contoh: 100"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limit per User
                  </label>
                  <input
                    name="usageLimitPerUser"
                    type="number"
                    value={editForm.usageLimitPerUser}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Tanggal mulai + kedaluwarsa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Mulai{" "}
                    <span className="text-emerald-500 font-normal text-xs">
                      Opsional
                    </span>
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    value={
                      editForm.startDate ? editForm.startDate.slice(0, 10) : ""
                    }
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Kedaluwarsa{" "}
                    <span className="text-emerald-500 font-normal text-xs">
                      Opsional
                    </span>
                  </label>
                  <input
                    name="expiryDate"
                    type="date"
                    value={
                      editForm.expiryDate
                        ? editForm.expiryDate.slice(0, 10)
                        : ""
                    }
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Status aktif */}
              <div className="flex items-center gap-2">
                <input
                  id="editIsActive"
                  name="isActive"
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={handleEditChange}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="editIsActive" className="text-sm text-gray-700">
                  Aktifkan voucher ini
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-white rounded-b-2xl">
              <button
                onClick={() => {
                  setEditVoucher(null);
                  setEditForm(null);
                }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={editSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-60"
              >
                {editSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Confirm Modal ===== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-2">
              Hapus Voucher?
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              Voucher{" "}
              <span className="font-mono font-semibold text-gray-800">
                {deleteTarget.code}
              </span>{" "}
              akan dihapus permanen.
            </p>
            <p className="text-xs text-red-400 mb-5">
              Voucher yang sudah pernah digunakan tidak bisa dihapus.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-60"
              >
                {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
