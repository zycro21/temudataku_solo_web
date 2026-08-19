"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Copy,
  Power,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Filter,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

// ─── Type dari API ────────────────────────────────────────────────────────────
type RedeemCodeState = "ACTIVE" | "EXPIRED" | "EXHAUSTED" | "DISABLED";

interface RedeemCodeFromAPI {
  id: string;
  code: string;
  planId: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string | null;
  state: RedeemCodeState;
  plan: {
    id: string;
    name: string;
    durationDay: number;
    price: number | string;
  };
  createdBy: { id: string; fullName: string; email: string } | null;
}

interface RedeemCodeUsageDetail {
  id: string;
  redeemedAt: string;
  user: { id: string; fullName: string; email: string };
  subscription: {
    id: string;
    startAt: string;
    endAt: string;
    status: string;
  };
}

interface RedeemCodeDetail extends RedeemCodeFromAPI {
  usages: RedeemCodeUsageDetail[];
}

interface SubscriptionPlanOption {
  id: string;
  name: string;
  durationDay: number;
}

export interface RedeemCodeStats {
  total: number;
  active: number;
  exhausted: number;
  expired: number;
  disabled: number;
}

type SortKey =
  | "code"
  | "planName"
  | "usage"
  | "expiresAt"
  | "createdAt"
  | "state"
  | null;
type SortDirection = "desc" | "asc" | null;

interface RedeemCodeTableProps {
  search: string;
  refreshKey?: number;
  onStatsChange?: (stats: RedeemCodeStats) => void;
}

// ─── Badge state (4 kondisi) ─────────────────────────────────────────────────
function StateBadge({ state }: { state: RedeemCodeState }) {
  const meta: Record<RedeemCodeState, { label: string; className: string }> = {
    ACTIVE: { label: "Aktif", className: "bg-emerald-100 text-emerald-700" },
    EXHAUSTED: {
      label: "Kuota Habis",
      className: "bg-amber-100 text-amber-700",
    },
    EXPIRED: { label: "Kadaluarsa", className: "bg-gray-200 text-gray-600" },
    DISABLED: { label: "Dinonaktifkan", className: "bg-red-100 text-red-600" },
  };
  const m = meta[state] ?? meta.DISABLED;
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${m.className}`}
    >
      {m.label}
    </span>
  );
}

// ─── Format tanggal ────────────────────────────────────────────────────────────
function formatDate(raw: string | null) {
  if (!raw) return { date: "-", time: "" };
  const d = new Date(raw);
  return {
    date: d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
  };
}

// ISO string -> value yang bisa dipakai <input type="datetime-local">
function toDateTimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function RedeemCodeTable({
  search,
  refreshKey = 0,
  onStatsChange,
}: RedeemCodeTableProps) {
  const [codes, setCodes] = useState<RedeemCodeFromAPI[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlanOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuOpenUpward, setMenuOpenUpward] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Filters tambahan (di luar search dari parent)
  const [planFilter, setPlanFilter] = useState("");
  const [stateFilter, setStateFilter] = useState<RedeemCodeState | "">("");
  const [showFilters, setShowFilters] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{
    id: string;
    code: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successModal, setSuccessModal] = useState<string | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState<{
    id: string;
    code: string;
    maxUses: string;
    expiresAt: string;
    isActive: boolean;
    note: string;
  } | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // Detail modal
  const [detailModal, setDetailModal] = useState<RedeemCodeDetail | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // ─── Fetch data ────────────────────────────────────────────────────────────
  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/redeemCode/codes`,
        { withCredentials: true, params: { limit: 1000 } },
      );
      const data: RedeemCodeFromAPI[] = res.data.data?.data ?? [];
      setCodes(data);

      // Stats dihitung dari SELURUH data yang ke-fetch (bukan yang sudah
      // difilter lokal) — biar kartu di header selalu nunjukin total asli.
      onStatsChange?.({
        total: data.length,
        active: data.filter((c) => c.state === "ACTIVE").length,
        exhausted: data.filter((c) => c.state === "EXHAUSTED").length,
        expired: data.filter((c) => c.state === "EXPIRED").length,
        disabled: data.filter((c) => c.state === "DISABLED").length,
      });
    } catch (err) {
      console.error("Failed to fetch redeem codes:", err);
      setCodes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubscriptionPlan/elearning/subscription-plans`,
        { params: { isActive: true, limit: 50 }, withCredentials: true },
      );
      setPlans(res.data.data?.data ?? []);
    } catch (err) {
      console.error("Gagal mengambil subscription plans:", err);
    }
  };

  useEffect(() => {
    fetchCodes();
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // ─── Sort handler ───────────────────────────────────────────────────────────
  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortDir("asc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (sortKey !== colKey || !sortDir) return null;
    return sortDir === "desc" ? (
      <ChevronDown size={14} className="inline ml-1 shrink-0" />
    ) : (
      <ChevronUp size={14} className="inline ml-1 shrink-0" />
    );
  };

  const thBase = (colKey: SortKey) =>
    `px-5 py-3 cursor-pointer select-none transition-colors text-[13px] font-semibold ${
      sortKey === colKey
        ? "bg-emerald-200 text-emerald-800"
        : "text-gray-700 hover:bg-emerald-100"
    }`;

  // ─── Filter ─────────────────────────────────────────────────────────────────
  const filteredCodes = codes.filter((c) => {
    const query = search.toLowerCase();
    const matchSearch =
      c.code.toLowerCase().includes(query) ||
      (c.note ?? "").toLowerCase().includes(query);
    const matchPlan = planFilter ? c.planId === planFilter : true;
    const matchState = stateFilter ? c.state === stateFilter : true;
    return matchSearch && matchPlan && matchState;
  });

  // ─── Sort ───────────────────────────────────────────────────────────────────
  const sortValue = (c: RedeemCodeFromAPI, key: SortKey) => {
    switch (key) {
      case "code":
        return c.code;
      case "planName":
        return c.plan?.name ?? "";
      case "usage":
        return c.usedCount / Math.max(1, c.maxUses);
      case "expiresAt":
        return new Date(c.expiresAt).getTime();
      case "createdAt":
        return new Date(c.createdAt).getTime();
      case "state":
        return c.state;
      default:
        return "";
    }
  };

  const sortedCodes = [...filteredCodes].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const valA = sortValue(a, sortKey);
    const valB = sortValue(b, sortKey);
    const modifier = sortDir === "asc" ? 1 : -1;
    if (typeof valA === "number" && typeof valB === "number") {
      return (valA - valB) * modifier;
    }
    return String(valA).localeCompare(String(valB)) * modifier;
  });

  // ─── Pagination ─────────────────────────────────────────────────────────────
  const totalData = sortedCodes.length;
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalData);
  const pagedCodes = sortedCodes.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, perPage, planFilter, stateFilter]);

  const getPaginationItems = (): (number | "...")[] => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, safePage - 2);
    let end = start + 4;
    if (end > totalPages) {
      end = totalPages;
      start = end - 4;
    }
    const items: (number | "...")[] = [];
    if (start > 1) items.push("...");
    for (let i = start; i <= end; i++) items.push(i);
    if (end < totalPages) items.push("...");
    return items;
  };

  // ─── Close dropdown kalau klik luar ──────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (deleteModal) setTimeout(() => setConfirmVisible(true), 10);
    else setConfirmVisible(false);
  }, [deleteModal]);

  useEffect(() => {
    if (successModal) setTimeout(() => setSuccessVisible(true), 10);
    else setSuccessVisible(false);
  }, [successModal]);

  // ─── Copy code ──────────────────────────────────────────────────────────────
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Kode disalin ke clipboard");
  };

  // ─── Toggle isActive ─────────────────────────────────────────────────────────
  const handleToggleActive = async (id: string, nextActive: boolean) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/redeemCode/codes/${id}`,
        { isActive: nextActive },
        { withCredentials: true },
      );
      setSuccessModal(
        nextActive ? "Kode berhasil diaktifkan" : "Kode berhasil dinonaktifkan",
      );
      fetchCodes();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Gagal mengubah status kode",
      );
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      setDeleteLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/redeemCode/codes/${deleteModal.id}`,
        { withCredentials: true },
      );
      setConfirmVisible(false);
      setTimeout(() => {
        setDeleteModal(null);
        setDeleteLoading(false);
        setSuccessModal("Kode redeem berhasil dihapus");
        fetchCodes();
      }, 250);
    } catch (err: any) {
      console.error(err);
      setDeleteLoading(false);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Gagal menghapus kode redeem",
      );
    }
  };

  const closeSuccessModal = () => {
    setSuccessVisible(false);
    setTimeout(() => setSuccessModal(null), 250);
  };

  // ─── Edit modal ──────────────────────────────────────────────────────────────
  const openEditModal = (c: RedeemCodeFromAPI) => {
    setEditModal({
      id: c.id,
      code: c.code,
      maxUses: String(c.maxUses),
      expiresAt: toDateTimeLocalValue(c.expiresAt),
      isActive: c.isActive,
      note: c.note ?? "",
    });
    setTimeout(() => setEditVisible(true), 10);
  };

  const closeEditModal = () => {
    setEditVisible(false);
    setTimeout(() => setEditModal(null), 250);
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;

    const maxUsesNum = Number(editModal.maxUses);
    if (!maxUsesNum || maxUsesNum < 1) {
      toast.error("Max Uses minimal 1");
      return;
    }
    if (!editModal.expiresAt) {
      toast.error("Tanggal kadaluarsa wajib diisi");
      return;
    }

    setEditSaving(true);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/redeemCode/codes/${editModal.id}`,
        {
          maxUses: maxUsesNum,
          expiresAt: new Date(editModal.expiresAt).toISOString(),
          isActive: editModal.isActive,
          note: editModal.note,
        },
        { withCredentials: true },
      );

      toast.success("Kode redeem berhasil diperbarui");
      closeEditModal();
      fetchCodes();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || err.message || "Gagal memperbarui kode",
      );
    } finally {
      setEditSaving(false);
    }
  };

  // ─── Detail modal ────────────────────────────────────────────────────────────
  const openDetailModal = async (id: string) => {
    setDetailLoading(true);
    setTimeout(() => setDetailVisible(true), 10);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/redeemCode/codes/${id}`,
        { withCredentials: true },
      );
      setDetailModal(res.data.data);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Gagal memuat detail kode",
      );
      setDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailVisible(false);
    setTimeout(() => setDetailModal(null), 250);
  };

  return (
    <div className="bg-white rounded-xl border overflow-visible mb-20">
      {/* ── FILTER BAR ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-emerald-600 transition"
        >
          <Filter size={14} />
          Filter
          <ChevronDown
            size={14}
            className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
          />
        </button>

        {(planFilter || stateFilter) && (
          <button
            onClick={() => {
              setPlanFilter("");
              setStateFilter("");
            }}
            className="text-[12px] text-gray-400 hover:text-red-500 transition"
          >
            Reset filter
          </button>
        )}
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 px-5 py-3 border-b bg-gray-50/60">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-[13px] text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="">Semua Plan</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={stateFilter}
            onChange={(e) =>
              setStateFilter(e.target.value as RedeemCodeState | "")
            }
            className="border rounded-lg px-3 py-1.5 text-[13px] text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="EXHAUSTED">Kuota Habis</option>
            <option value="EXPIRED">Kadaluarsa</option>
            <option value="DISABLED">Dinonaktifkan</option>
          </select>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "#DDF6EC" }}>
            <th
              className={`${thBase("code")} text-left`}
              onClick={() => handleSort("code")}
            >
              Kode <SortIcon colKey="code" />
            </th>
            <th
              className={`${thBase("planName")} text-left`}
              onClick={() => handleSort("planName")}
            >
              Plan <SortIcon colKey="planName" />
            </th>
            <th
              className={`${thBase("usage")} text-center`}
              onClick={() => handleSort("usage")}
            >
              Kuota <SortIcon colKey="usage" />
            </th>
            <th
              className={`${thBase("state")} text-center`}
              onClick={() => handleSort("state")}
            >
              Status <SortIcon colKey="state" />
            </th>
            <th
              className={`${thBase("expiresAt")} text-center`}
              onClick={() => handleSort("expiresAt")}
            >
              Kadaluarsa <SortIcon colKey="expiresAt" />
            </th>
            <th
              className={`${thBase("createdAt")} text-center`}
              onClick={() => handleSort("createdAt")}
            >
              Dibuat <SortIcon colKey="createdAt" />
            </th>
            <th className="px-5 py-3 text-center text-gray-700 text-[13px] font-semibold">
              Aksi
            </th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={7}
                className="px-5 py-10 text-center text-gray-400 text-sm"
              >
                Memuat kode redeem...
              </td>
            </tr>
          ) : pagedCodes.length > 0 ? (
            pagedCodes.map((c) => {
              const expires = formatDate(c.expiresAt);
              const created = formatDate(c.createdAt);
              const quotaPercent = Math.min(
                100,
                Math.round((c.usedCount / Math.max(1, c.maxUses)) * 100),
              );

              return (
                <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                  {/* Code */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[12px] font-semibold text-gray-800">
                        {c.code}
                      </span>
                      <button
                        onClick={() => copyCode(c.code)}
                        className="text-gray-400 hover:text-emerald-600 transition"
                        title="Salin kode"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                    {c.note && (
                      <p className="text-[11px] text-gray-400 mt-0.5 max-w-[180px] truncate">
                        {c.note}
                      </p>
                    )}
                  </td>

                  {/* Plan */}
                  <td className="px-4 py-3 text-[12px] text-gray-600">
                    {c.plan?.name ?? "-"}
                    <span className="text-gray-400">
                      {" "}
                      ({c.plan?.durationDay ?? 0}h)
                    </span>
                  </td>

                  {/* Quota */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-1 w-24 mx-auto">
                      <span className="text-[11px] text-gray-500">
                        {c.usedCount}/{c.maxUses}
                      </span>
                      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            quotaPercent >= 100
                              ? "bg-amber-400"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${quotaPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* State */}
                  <td className="px-4 py-3 text-center">
                    <StateBadge state={c.state} />
                  </td>

                  {/* Expires at */}
                  <td className="px-4 py-3 text-center text-gray-500">
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-[12px]">{expires.date}</span>
                      <span className="text-[10px] text-gray-400">
                        {expires.time}
                      </span>
                    </div>
                  </td>

                  {/* Created at */}
                  <td className="px-4 py-3 text-center text-gray-500">
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-[12px]">{created.date}</span>
                      <span className="text-[10px] text-gray-400">
                        {created.time}
                      </span>
                    </div>
                  </td>

                  {/* ACTION */}
                  <td className="px-4 py-3 text-center relative">
                    <div className="relative inline-block">
                      <button
                        onClick={(e) => {
                          if (openMenu === c.id) {
                            setOpenMenu(null);
                          } else {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            setMenuOpenUpward(spaceBelow < 220);
                            setOpenMenu(c.id);
                          }
                        }}
                        className="p-2 rounded-md hover:bg-gray-100"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {openMenu === c.id && (
                        <div
                          ref={menuRef}
                          className={`absolute right-0 w-48 bg-white border rounded-lg shadow-md z-50 text-sm ${
                            menuOpenUpward
                              ? "bottom-full mb-2"
                              : "top-full mt-2"
                          }`}
                        >
                          <button
                            onClick={() => {
                              setOpenMenu(null);
                              openDetailModal(c.id);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                          >
                            <Eye size={15} />
                            Lihat Detail
                          </button>

                          <button
                            onClick={() => {
                              setOpenMenu(null);
                              openEditModal(c);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              setOpenMenu(null);
                              handleToggleActive(c.id, !c.isActive);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                          >
                            <Power size={15} />
                            {c.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </button>

                          {c.usedCount === 0 ? (
                            <button
                              onClick={() => {
                                setOpenMenu(null);
                                setDeleteModal({ id: c.id, code: c.code });
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 text-red-600"
                            >
                              <Trash2 size={15} />
                              Hapus
                            </button>
                          ) : (
                            <div
                              className="flex items-center gap-2 w-full px-4 py-2 text-gray-300 cursor-not-allowed"
                              title="Kode sudah pernah dipakai — nonaktifkan saja"
                            >
                              <Trash2 size={15} />
                              Hapus
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={7}
                className="px-5 py-10 text-center text-gray-400 text-sm"
              >
                {search || planFilter || stateFilter
                  ? "Tidak ada kode redeem yang cocok dengan filter."
                  : "Belum ada kode redeem."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex items-center justify-between px-5 py-3 border-t text-[13px] text-gray-600">
        <span>
          Menampilkan {totalData === 0 ? 0 : startIndex + 1} – {endIndex} dari{" "}
          {totalData} data
        </span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span>Tampilkan per halaman</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="border rounded px-2 py-1 text-[13px] text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1">
            {getPaginationItems().map((item, idx) =>
              item === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 h-7 flex items-center justify-center text-[13px] text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`w-7 h-7 rounded text-[13px] font-medium transition-colors ${
                    item === safePage
                      ? "bg-emerald-500 text-white"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── DELETE CONFIRM MODAL ─────────────────────────────────────────────── */}
      {deleteModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            confirmVisible
              ? "bg-black/60 backdrop-blur-sm opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[400px] rounded-2xl shadow-2xl p-7 text-center transform transition-all duration-300 ${
              confirmVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Hapus Kode Redeem Ini?
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              <span className="font-mono font-medium text-gray-700">
                {deleteModal.code}
              </span>{" "}
              akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                disabled={deleteLoading}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60"
              >
                {deleteLoading ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS MODAL (toggle status / delete) ──────────────────────────── */}
      {successModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            successVisible
              ? "bg-black/60 backdrop-blur-sm opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[400px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${
              successVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Berhasil!
            </h2>
            <p className="text-sm text-gray-400 mb-7">{successModal}</p>
            <button
              onClick={closeSuccessModal}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ───────────────────────────────────────────────────────── */}
      {editModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            editVisible
              ? "bg-black/60 backdrop-blur-sm opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[480px] max-h-[88vh] rounded-2xl shadow-2xl flex flex-col transform transition-all duration-300 ${
              editVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Edit Kode Redeem
                </h2>
                <p className="font-mono text-xs text-gray-400 mt-0.5">
                  {editModal.code}
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <p className="text-[12px] text-gray-400 -mt-1">
                Plan dan kode tidak bisa diubah setelah dibuat.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Max Uses
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editModal.maxUses}
                    onChange={(e) =>
                      setEditModal({ ...editModal, maxUses: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Kadaluarsa
                  </label>
                  <input
                    type="datetime-local"
                    value={editModal.expiresAt}
                    onChange={(e) =>
                      setEditModal({ ...editModal, expiresAt: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5">
                <span className="text-sm text-gray-700">Status Aktif</span>
                <button
                  type="button"
                  onClick={() =>
                    setEditModal({
                      ...editModal,
                      isActive: !editModal.isActive,
                    })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    editModal.isActive ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      editModal.isActive ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Catatan
                </label>
                <textarea
                  value={editModal.note}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      note: e.target.value.slice(0, 500),
                    })
                  }
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={closeEditModal}
                disabled={editSaving}
                className="flex-1 border border-emerald-500 text-emerald-600 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {editSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ─────────────────────────────────────────────────────── */}
      {(detailVisible || detailLoading) && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            detailVisible
              ? "bg-black/60 backdrop-blur-sm opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[560px] max-h-[88vh] rounded-2xl shadow-2xl flex flex-col transform transition-all duration-300 ${
              detailVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-semibold text-gray-800">
                Detail Kode Redeem
              </h2>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {detailLoading || !detailModal ? (
                <p className="text-sm text-gray-400 text-center py-10">
                  Memuat detail...
                </p>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-semibold text-gray-800">
                      {detailModal.code}
                    </span>
                    <StateBadge state={detailModal.state} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">Plan</p>
                      <p className="text-gray-700 font-medium">
                        {detailModal.plan?.name} (
                        {detailModal.plan?.durationDay} hari)
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">Kuota</p>
                      <p className="text-gray-700 font-medium">
                        {detailModal.usedCount} / {detailModal.maxUses} dipakai
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">Kadaluarsa</p>
                      <p className="text-gray-700 font-medium">
                        {formatDate(detailModal.expiresAt).date}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">
                        Dibuat oleh
                      </p>
                      <p className="text-gray-700 font-medium">
                        {detailModal.createdBy?.fullName ?? "-"}
                      </p>
                    </div>
                  </div>

                  {detailModal.note && (
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">Catatan</p>
                      <p className="text-sm text-gray-600">
                        {detailModal.note}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Riwayat Pemakaian ({detailModal.usages.length})
                    </p>

                    {detailModal.usages.length === 0 ? (
                      <p className="text-sm text-gray-400 border border-dashed rounded-lg py-6 text-center">
                        Belum ada yang redeem kode ini.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {detailModal.usages.map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2.5"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {u.user.fullName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {u.user.email}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {formatDate(u.redeemedAt).date}
                              </p>
                              <p className="text-[11px] text-emerald-600 font-medium">
                                {u.subscription.status}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={closeDetailModal}
                className="w-full border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
