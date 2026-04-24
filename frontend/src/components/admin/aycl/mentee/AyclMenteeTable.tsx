"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  MoreVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Eye,
} from "lucide-react";

interface AyclMenteeTableProps {
  refreshKey?: number;
  onDataChanged?: () => void;
}

type SortKey = string | null;
type SortDirection = "asc" | "desc" | null;

interface AyclBookingItem {
  id: string;
  status: string;
  createdAt: string;
  currentStatus: string | null;
  institution: string | null;
  studyProgram: string | null;
  semester: string | null;
  age: number | null;
  reason: string | null;
  familiarity: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
  };
  batch: {
    id: string;
    title: string;
    price: number;
  };
  payment: {
    id: string;
    amount: number;
    status: string | null;
    paymentMethod: string | null;
    merchantOrderId: string | null;
    paymentDate: string | null;
  } | null;
  participants: {
    id: string;
    schedule: {
      id: string;
      title: string;
      date: string;
      startTime: string;
      endTime: string;
    };
  }[];
}

const formatRupiah = (value: number) =>
  `Rp${Number(value).toLocaleString("id-ID")}`;

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  confirmed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  completed: "bg-blue-50 text-blue-700 border border-blue-200",
  cancelled: "bg-red-50 text-red-600 border border-red-200",
};

const PAYMENT_METHOD_MAP: Record<string, string> = {
  A1: "ATM Bersama",
  I1: "Bank Nasional Indonesia (BNI)",
  M2: "Bank Mandiri",
  BR: "Bank Rakyat Indonesia (BRI)",
  BV: "Bank Syariah Indonesia (BSI)",
  SP: "QRIS/Shopeepay",
};

const PAYMENT_STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  confirmed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  completed: "bg-blue-50 text-blue-700 border border-blue-200",
  cancelled: "bg-red-50 text-red-600 border border-red-200",
  settlement: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  failed: "bg-red-50 text-red-600 border border-red-200",
  expired: "bg-gray-100 text-gray-500 border border-gray-200",
};

export default function AyclMenteeTable({
  refreshKey,
  onDataChanged,
}: AyclMenteeTableProps) {
  const [data, setData] = useState<AyclBookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // ── Detail Modal ──────────────────────────────────────────────────────────
  const [detailItem, setDetailItem] = useState<AyclBookingItem | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // ── Delete Modal ──────────────────────────────────────────────────────────
  const [deleteModal, setDeleteModal] = useState<{ id: string } | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteSuccessVisible, setDeleteSuccessVisible] = useState(false);

  // ── Fetch Data ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ayclbooking`,
        {
          params: { limit: 10000 },
          withCredentials: true,
        },
      );
      setData(res.data.data ?? []);
    } catch (err) {
      toast.error("Gagal memuat data pendaftar AYCL");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  // ── Close menu on outside click or scroll ────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setMenuPosition(null);
      }
    };
    const scrollHandler = () => {
      setOpenMenu(null);
      setMenuPosition(null);
    };
    document.addEventListener("mousedown", handler);
    window.addEventListener("scroll", scrollHandler, true);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("scroll", scrollHandler, true);
    };
  }, []);

  // ── Filtered & sorted & paginated data ───────────────────────────────────
  const filtered = data.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.user.fullName.toLowerCase().includes(q) ||
      item.user.email.toLowerCase().includes(q) ||
      item.user.id.toLowerCase().includes(q) ||
      item.batch.title.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const mod = sortDir === "asc" ? 1 : -1;
    if (sortKey === "no") return 0; // no dihandle lewat index, skip
    if (sortKey === "userId") return a.user.id.localeCompare(b.user.id) * mod;
    if (sortKey === "nama")
      return a.user.fullName.localeCompare(b.user.fullName) * mod;
    if (sortKey === "email")
      return a.user.email.localeCompare(b.user.email) * mod;
    if (sortKey === "batch")
      return a.batch.title.localeCompare(b.batch.title) * mod;
    if (sortKey === "harga") {
      const aVal = a.payment ? a.payment.amount : a.batch.price;
      const bVal = b.payment ? b.payment.amount : b.batch.price;
      return (aVal - bVal) * mod;
    }
    if (sortKey === "status") return a.status.localeCompare(b.status) * mod;
    return 0;
  });

  const totalData = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalData);
  const paginated = sorted.slice(startIndex, endIndex);

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
      <ChevronDown size={12} className="inline ml-1 shrink-0" />
    ) : (
      <ChevronUp size={12} className="inline ml-1 shrink-0" />
    );
  };

  const thBase = (colKey: SortKey) =>
    `px-4 py-2.5 cursor-pointer select-none transition-colors text-xs font-medium ${
      sortKey === colKey
        ? "bg-emerald-200 text-emerald-800"
        : "text-gray-500 hover:bg-emerald-50"
    }`;

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

  // ── Detail Modal ──────────────────────────────────────────────────────────
  const openDetail = (item: AyclBookingItem) => {
    setDetailItem(item);
    setTimeout(() => setDetailVisible(true), 10);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setTimeout(() => setDetailItem(null), 250);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const openDelete = (id: string) => {
    setDeleteModal({ id });
    setTimeout(() => setDeleteVisible(true), 10);
  };

  const closeDelete = () => {
    setDeleteVisible(false);
    setTimeout(() => setDeleteModal(null), 250);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      setIsDeleting(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ayclbooking/${deleteModal.id}`,
        { withCredentials: true },
      );
      closeDelete();
      setTimeout(() => {
        setShowDeleteSuccess(true);
        setTimeout(() => setDeleteSuccessVisible(true), 10);
      }, 300);
      fetchData();
      onDataChanged?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus booking");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteSuccess = () => {
    setDeleteSuccessVisible(false);
    setTimeout(() => setShowDeleteSuccess(false), 250);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm mb-16">
      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 gap-3">
        <div className="relative w-72">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari nama, email, user ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>
        <span className="text-xs text-gray-400">{totalData} pendaftar</span>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th
                className={`${thBase("no")} text-center w-8`}
                onClick={() => handleSort("no")}
              >
                No <SortIcon colKey="no" />
              </th>
              <th
                className={`${thBase("userId")} text-left`}
                onClick={() => handleSort("userId")}
              >
                User ID <SortIcon colKey="userId" />
              </th>
              <th
                className={`${thBase("nama")} text-left`}
                onClick={() => handleSort("nama")}
              >
                Nama <SortIcon colKey="nama" />
              </th>
              <th
                className={`${thBase("email")} text-left`}
                onClick={() => handleSort("email")}
              >
                Email <SortIcon colKey="email" />
              </th>
              <th
                className={`${thBase("batch")} text-left`}
                onClick={() => handleSort("batch")}
              >
                Produk <SortIcon colKey="batch" />
              </th>
              <th
                className={`${thBase("harga")} text-left`}
                onClick={() => handleSort("harga")}
              >
                Harga <SortIcon colKey="harga" />
              </th>
              <th
                className={`${thBase("status")} text-left`}
                onClick={() => handleSort("status")}
              >
                Status <SortIcon colKey="status" />
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 w-10">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-gray-400 text-xs"
                >
                  Tidak ada data pendaftar.
                </td>
              </tr>
            ) : (
              paginated.map((item, idx) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                >
                  <td className="px-4 py-3 text-center text-gray-400">
                    {startIndex + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono">
                    {item.user.id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium">
                    {item.user.fullName}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.user.email}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate">
                    {item.batch.title}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {item.payment
                      ? formatRupiah(item.payment.amount)
                      : formatRupiah(item.batch.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_BADGE[item.status] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      ref={(el) => {
                        buttonRefs.current[item.id] = el;
                      }}
                      onClick={() => {
                        if (openMenu === item.id) {
                          setOpenMenu(null);
                          setMenuPosition(null);
                        } else {
                          const btn = buttonRefs.current[item.id];
                          if (btn) {
                            const rect = btn.getBoundingClientRect();
                            setMenuPosition({
                              top: rect.bottom + window.scrollY + 4,
                              left: rect.right + window.scrollX - 128,
                            });
                          }
                          setOpenMenu(item.id);
                        }
                      }}
                      className="p-1 rounded hover:bg-gray-100 transition text-gray-500"
                    >
                      <MoreVertical size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-600">
        <span>
          Menampilkan {totalData === 0 ? 0 : startIndex + 1} – {endIndex} dari{" "}
          {totalData} data
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span>Tampilkan per halaman</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
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
            <ChevronLeft size={14} />
          </button>
          <div className="flex items-center gap-1">
            {getPaginationItems().map((item, idx) =>
              item === "..." ? (
                <span
                  key={`e-${idx}`}
                  className="w-6 h-6 flex items-center justify-center text-xs text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`w-6 h-6 rounded text-xs font-medium transition-colors ${item === safePage ? "bg-emerald-500 text-white" : "hover:bg-gray-100 text-gray-600"}`}
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
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Action Dropdown Portal ──────────────────────────────────────────── */}
      {openMenu &&
        menuPosition &&
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            style={{ top: menuPosition.top, left: menuPosition.left }}
            className="fixed z-[9999] bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-32"
          >
            {(() => {
              const item = paginated.find((i) => i.id === openMenu);
              if (!item) return null;
              return (
                <>
                  <button
                    onClick={() => {
                      setOpenMenu(null);
                      openDetail(item);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Eye size={13} className="text-emerald-600" />
                    Detail
                  </button>
                  <button
                    onClick={() => {
                      setOpenMenu(null);
                      openDelete(item.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </>
              );
            })()}
          </div>,
          document.body,
        )}

      {/* ── Detail Modal ───────────────────────────────────────────────────── */}
      {detailItem && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-250 ${detailVisible ? "bg-black/50 opacity-100" : "bg-black/0 opacity-0"}`}
        >
          <div
            className={`bg-white w-[680px] max-h-[88vh] rounded-2xl shadow-2xl flex flex-col transform transition-all duration-250 ${detailVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
          >
            {/* Header modal */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Detail Pendaftar AYCL
                </h2>
              </div>
              <button
                onClick={closeDetail}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body modal */}
            <div className="overflow-y-auto px-7 py-5 space-y-4 text-[11px]">
              {/* Info User */}
              <section>
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.12em] mb-2">
                  Data Mentee
                </p>
                <div className="space-y-2.5 bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
                  <Row label="User ID" value={detailItem.user.id} mono />
                  <Row label="Nama" value={detailItem.user.fullName} />
                  <Row label="Email" value={detailItem.user.email} />
                  <Row
                    label="No. WhatsApp"
                    value={detailItem.user.phoneNumber ?? "-"}
                  />
                </div>
              </section>

              {/* Data Pembayaran (gabungan booking + payment) */}
              <section>
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.12em] mb-2">
                  Data Pembayaran
                </p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 space-y-2.5">
                  <Row label="Produk" value={detailItem.batch.title} />
                  <Row
                    label="Tanggal Pendaftaran"
                    value={formatDateTime(detailItem.createdAt)}
                  />
                  {detailItem.payment ? (
                    <>
                      <Row
                        label="No. Order"
                        value={detailItem.payment.merchantOrderId ?? "-"}
                        mono
                      />
                      <Row
                        label="Nominal"
                        value={formatRupiah(detailItem.payment.amount)}
                      />
                      <Row
                        label="Metode Pembayaran"
                        value={
                          detailItem.payment.paymentMethod
                            ? (PAYMENT_METHOD_MAP[
                                detailItem.payment.paymentMethod
                              ] ?? detailItem.payment.paymentMethod)
                            : "-"
                        }
                      />
                      <Row
                        label="Tanggal Pembayaran"
                        value={formatDateTime(
                          detailItem.payment.paymentDate ?? null,
                        )}
                      />
                      <Row
                        label="Status Pembayaran"
                        value={
                          detailItem.payment.status ? (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${PAYMENT_STATUS_BADGE[detailItem.payment.status.toLowerCase()] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}
                            >
                              {detailItem.payment.status
                                .charAt(0)
                                .toUpperCase() +
                                detailItem.payment.status.slice(1)}
                            </span>
                          ) : (
                            "-"
                          )
                        }
                      />
                    </>
                  ) : (
                    <p className="text-gray-400 italic">
                      Belum ada data pembayaran.
                    </p>
                  )}
                </div>
              </section>

              {/* Info Form Peserta */}
              <section>
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.12em] mb-2">
                  Hasil Data Form Peserta
                </p>
                <div className="space-y-3 bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
                  <RowStacked
                    label="Status saat ini"
                    value={detailItem.currentStatus ?? "-"}
                  />
                  <RowStacked
                    label="Instansi/Universitas saat ini"
                    value={detailItem.institution ?? "-"}
                  />
                  <RowStacked
                    label="Program Studi"
                    value={detailItem.studyProgram ?? "-"}
                  />
                  <RowStacked
                    label="Semester Saat ini"
                    value={detailItem.semester ?? "-"}
                  />
                  <RowStacked
                    label="Usia"
                    value={detailItem.age ? `${detailItem.age} tahun` : "-"}
                  />
                  <RowStacked
                    label="Sejauh mana kamu familiar dengan topik All You Can Learn ini?"
                    value={detailItem.familiarity ?? "-"}
                  />
                  <RowStacked
                    label="Mengapa kamu tertarik mengikuti All You Can Learn ini?"
                    value={detailItem.reason ?? "-"}
                    multiline
                  />
                </div>
              </section>

              {/* Kelas yang dipilih */}
              <section>
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.12em] mb-2">
                  Kelas yang Dipilih untuk Diikuti
                </p>
                {detailItem.participants.length === 0 ? (
                  <p className="text-gray-400 italic px-1">
                    Belum ada kelas dipilih.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {detailItem.participants.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {p.schedule.title}
                          </p>
                          <p className="text-gray-500 mt-0.5">
                            {formatDate(p.schedule.date)} &nbsp;·&nbsp;{" "}
                            {new Date(p.schedule.startTime).toLocaleTimeString(
                              "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}{" "}
                            –{" "}
                            {new Date(p.schedule.endTime).toLocaleTimeString(
                              "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Footer modal */}
            <div className="px-7 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={closeDetail}
                className="w-full border border-gray-200 text-gray-500 py-2 rounded-lg text-[11px] font-medium hover:bg-gray-50 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ───────────────────────────────────────── */}
      {deleteModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${deleteVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"}`}
        >
          <div
            className={`bg-white w-[400px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${deleteVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
              </div>
            </div>
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              Hapus Booking AYCL?
            </h2>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Data booking akan dihapus
              secara permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDelete}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg text-xs font-medium hover:bg-red-600 transition disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Success Modal ────────────────────────────────────────────── */}
      {showDeleteSuccess && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${deleteSuccessVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"}`}
        >
          <div
            className={`bg-white w-[400px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${deleteSuccessVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
              </div>
            </div>
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              Booking Dihapus!
            </h2>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Data booking AYCL telah dihapus secara permanen.
            </p>
            <button
              onClick={closeDeleteSuccess}
              className="w-full bg-red-500 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper row component (horizontal: label — value) ─────────────────────────
function Row({
  label,
  value,
  mono = false,
  multiline = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  multiline?: boolean;
}) {
  return (
    <div className="flex gap-2 min-w-0">
      <span className="text-gray-400 w-32 shrink-0 leading-relaxed">
        {label}
      </span>
      <span
        className={`text-gray-700 flex-1 min-w-0 break-words whitespace-normal leading-relaxed ${mono ? "font-mono text-[10px]" : ""} ${multiline ? "whitespace-pre-wrap" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

// ── Helper row component (stacked: label atas, value bawah) ──────────────────
function RowStacked({
  label,
  value,
  mono = false,
  multiline = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  multiline?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-gray-400 leading-relaxed mb-0.5">{label}</p>
      <p
        className={`text-gray-700 break-words whitespace-normal leading-relaxed ${mono ? "font-mono text-[10px]" : ""} ${multiline ? "whitespace-pre-wrap" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
