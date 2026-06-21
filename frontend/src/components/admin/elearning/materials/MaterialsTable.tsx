"use client";

import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { useState, useRef, useEffect, memo } from "react";
import { toast } from "sonner";
import {
  MoreVertical,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
  FileText,
  History as HistoryIcon,
} from "lucide-react";

interface MaterialsTableProps {
  search: string;
  refreshKey?: number;
  onMaterialUpdated?: () => void;
}

type SortDirection = "desc" | "asc" | null;
type SortKey = string | null;

interface ELearningText {
  id: string;
  title: string | null;
  orderNumber: number | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  updatedAt: string | null;
}

// ─── Type untuk Audit Log History ────────────────────────────────────────────
interface AuditLogUser {
  id: string;
  fullName: string;
  email: string | null;
  profilePicture: string | null;
}

interface AuditLogItem {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "PUBLISH" | "ARCHIVE";
  description: string | null;
  oldValue: any;
  newValue: any;
  createdAt: string;
  user: AuditLogUser | null;
}

// ─── Komponen-komponen kecil didefinisikan di LUAR komponen utama ─────────────
// Ini penting! Mendefinisikan komponen di dalam render body menyebabkan
// React membuat instance baru setiap render → infinite re-render loop.

const DragHandle = memo(() => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-gray-400"
  >
    <circle cx="4" cy="2.5" r="1.2" fill="currentColor" />
    <circle cx="4" cy="7" r="1.2" fill="currentColor" />
    <circle cx="4" cy="11.5" r="1.2" fill="currentColor" />
    <circle cx="10" cy="2.5" r="1.2" fill="currentColor" />
    <circle cx="10" cy="7" r="1.2" fill="currentColor" />
    <circle cx="10" cy="11.5" r="1.2" fill="currentColor" />
  </svg>
));
DragHandle.displayName = "DragHandle";

const MaterialStatusBadge = memo(({ status }: { status: string }) => {
  const isPublished = status === "PUBLISHED";
  const isArchived = status === "ARCHIVED";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${
        isPublished
          ? "bg-emerald-100 text-emerald-700"
          : isArchived
            ? "bg-amber-100 text-amber-700"
            : "bg-gray-100 text-gray-500"
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
});
MaterialStatusBadge.displayName = "MaterialStatusBadge";

// SortIcon juga harus di luar — menerima props, bukan closure
const SortIcon = memo(
  ({
    colKey,
    sortKey,
    sortDir,
  }: {
    colKey: SortKey;
    sortKey: SortKey;
    sortDir: SortDirection;
  }) => {
    if (sortKey !== colKey || !sortDir) return null;
    return sortDir === "desc" ? (
      <ChevronDown size={14} className="inline ml-1 shrink-0" />
    ) : (
      <ChevronUp size={14} className="inline ml-1 shrink-0" />
    );
  },
);
SortIcon.displayName = "SortIcon";

// ─── Main component ───────────────────────────────────────────────────────────
export default function MaterialsTable({
  search,
  refreshKey,
  onMaterialUpdated,
}: MaterialsTableProps) {
  const params = useParams();
  const router = useRouter();
  const moduleId = params?.moduleId as string;

  const [materials, setMaterials] = useState<ELearningText[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalData, setTotalData] = useState(0);
  const [internalRefreshKey, setInternalRefreshKey] = useState(0);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuOpenUpward, setMenuOpenUpward] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // ── Edit ──────────────────────────────────────────────────────────────────
  const [editModal, setEditModal] = useState<{
    materialId: string;
    title: string;
    status: string;
  } | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [editSuccessVisible, setEditSuccessVisible] = useState(false);

  // ── Publish / Unpublish ───────────────────────────────────────────────────
  const [actionModal, setActionModal] = useState<{
    type: "publish" | "unpublish";
    materialId: string;
  } | null>(null);
  const [actionVisible, setActionVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    type: "publish" | "unpublish";
  } | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);

  // ── Delete ────────────────────────────────────────────────────────────────
  const [deleteModal, setDeleteModal] = useState<{ materialId: string } | null>(
    null,
  );
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteSuccessVisible, setDeleteSuccessVisible] = useState(false);

  // ─── History modal ───────────────────────────────────────────────────────
  const [historyModal, setHistoryModal] = useState<{
    materialId: string;
    materialTitle: string;
  } | null>(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<AuditLogItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [selectedLogVisible, setSelectedLogVisible] = useState(false);

  const fetchHistory = async (materialId: string, page: number) => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningText/texts/${materialId}/history`,
        {
          withCredentials: true,
          params: { page, limit: 10 },
        },
      );
      setHistoryLogs(res.data.data ?? []);
      setHistoryTotalPages(res.data.pagination?.totalPages ?? 1);
    } catch (err: any) {
      console.error("Failed to fetch history:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Gagal mengambil riwayat perubahan",
      );
      setHistoryLogs([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (historyModal) {
      fetchHistory(historyModal.materialId, historyPage);
    }
    setSelectedLog(null);
    setSelectedLogVisible(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyModal, historyPage]);

  const openHistoryModal = (mat: ELearningText) => {
    setHistoryPage(1);
    setHistoryModal({
      materialId: mat.id,
      materialTitle: mat.title ?? "(tanpa judul)",
    });
    setTimeout(() => setHistoryVisible(true), 10);
  };

  const closeHistoryModal = () => {
    setHistoryVisible(false);
    setSelectedLogVisible(false);
    setTimeout(() => {
      setHistoryModal(null);
      setHistoryLogs([]);
      setSelectedLog(null);
    }, 250);
  };

  // ─── Detail diff panel (old vs new) ─────────────────────────────────────
  const openDetailPanel = (log: AuditLogItem) => {
    setSelectedLog(log);
    setTimeout(() => setSelectedLogVisible(true), 10);
  };

  const closeDetailPanel = () => {
    setSelectedLogVisible(false);
    setTimeout(() => setSelectedLog(null), 200);
  };

  const formatAuditValue = (value: any): string => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "boolean") return value ? "Ya" : "Tidak";
    if (Array.isArray(value)) {
      if (value.length === 0) return "-";
      return value
        .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
        .join(", ");
    }
    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const getAuditDiffRows = (
    oldValue: any,
    newValue: any,
  ): { key: string; oldVal: any; newVal: any }[] => {
    const oldObj =
      oldValue && typeof oldValue === "object" && !Array.isArray(oldValue)
        ? oldValue
        : {};
    const newObj =
      newValue && typeof newValue === "object" && !Array.isArray(newValue)
        ? newValue
        : {};

    const keys = Array.from(
      new Set([...Object.keys(oldObj), ...Object.keys(newObj)]),
    );

    return keys
      .map((key) => ({ key, oldVal: oldObj[key], newVal: newObj[key] }))
      .filter(
        (row) => JSON.stringify(row.oldVal) !== JSON.stringify(row.newVal),
      );
  };

  const auditActionMeta: Record<string, { label: string; className: string }> =
    {
      CREATE: { label: "Dibuat", className: "bg-emerald-100 text-emerald-700" },
      UPDATE: { label: "Diperbarui", className: "bg-blue-100 text-blue-700" },
      DELETE: { label: "Dihapus", className: "bg-red-100 text-red-700" },
      PUBLISH: {
        label: "Dipublikasikan",
        className: "bg-emerald-100 text-emerald-700",
      },
      ARCHIVE: { label: "Diarsipkan", className: "bg-gray-200 text-gray-700" },
    };

  // ── Fetch Data ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!moduleId) return;

    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningText/subbabs/${moduleId}/texts`,
          {
            withCredentials: true,
            params: {
              page: currentPage,
              limit: perPage,
              search: search || undefined,
              sortBy: "orderNumber",
              sortOrder: "asc",
            },
          },
        );
        setMaterials(res.data.data ?? []);
        setTotalData(res.data.pagination?.total ?? 0);
      } catch (err) {
        console.error("Gagal fetch materials:", err);
        toast.error("Gagal memuat data materials");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [moduleId, currentPage, perPage, search, refreshKey, internalRefreshKey]);

  // ── Filter / Sort / Pagination ────────────────────────────────────────────
  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("desc");
    } else if (sortDir === "desc") setSortDir("asc");
    else {
      setSortKey(null);
      setSortDir(null);
    }
    setCurrentPage(1);
  };

  // thBase sebagai fungsi biasa (bukan komponen) — aman di dalam render
  const thBase = (colKey: SortKey) =>
    `px-4 py-3 cursor-pointer select-none transition-colors text-[13px] font-semibold ${
      sortKey === colKey
        ? "bg-emerald-200 text-emerald-800"
        : "text-gray-700 hover:bg-emerald-100"
    }`;

  const sortedMaterials = [...materials].sort(
    (a: ELearningText, b: ELearningText) => {
      if (!sortKey || !sortDir) return 0;
      const modifier = sortDir === "asc" ? 1 : -1;
      if (sortKey === "title") {
        return (a.title ?? "").localeCompare(b.title ?? "") * modifier;
      }
      if (sortKey === "status") {
        return a.status.localeCompare(b.status) * modifier;
      }
      if (sortKey === "lastUpdated") {
        return (
          (new Date(a.updatedAt ?? 0).getTime() -
            new Date(b.updatedAt ?? 0).getTime()) *
          modifier
        );
      }
      return 0;
    },
  );

  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalData);
  const pagedMaterials = sortedMaterials;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, perPage]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpenMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  // ── Edit helpers ──────────────────────────────────────────────────────────
  const openEditModal = (mat: ELearningText) => {
    setEditModal({
      materialId: mat.id,
      title: mat.title ?? "",
      status: mat.status,
    });
    setTimeout(() => setEditVisible(true), 10);
  };
  const closeEditModal = () => {
    setEditVisible(false);
    setTimeout(() => setEditModal(null), 250);
  };
  const handleEditSave = () => {
    setEditVisible(false);
    setTimeout(() => {
      setEditModal(null);
      setShowEditSuccess(true);
      setTimeout(() => setEditSuccessVisible(true), 10);
    }, 250);
  };
  const closeEditSuccess = () => {
    setEditSuccessVisible(false);
    setTimeout(() => setShowEditSuccess(false), 250);
  };

  // ── Publish/Unpublish helpers ─────────────────────────────────────────────
  const openActionModal = (
    type: "publish" | "unpublish",
    materialId: string,
  ) => {
    setActionModal({ type, materialId });
    setTimeout(() => setActionVisible(true), 10);
  };

  const closeActionModal = () => {
    setActionVisible(false);
    setTimeout(() => setActionModal(null), 250);
  };

  const confirmAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    const newStatus =
      actionModal.type === "unpublish" ? "ARCHIVED" : "PUBLISHED";
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningText/texts/${actionModal.materialId}`,
        { status: newStatus },
        { withCredentials: true },
      );
      const type = actionModal.type;
      setActionVisible(false);
      setTimeout(() => {
        setActionModal(null);
        setSuccessModal({ type });
        setTimeout(() => setSuccessVisible(true), 10);
      }, 250);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Gagal mengubah status material",
      );
    } finally {
      setActionLoading(false);
    }
  };
  const closeSuccessModal = () => {
    setSuccessVisible(false);
    setTimeout(() => {
      setSuccessModal(null);
      setInternalRefreshKey((prev) => prev + 1);
      onMaterialUpdated?.();
    }, 250);
  };

  // ── Delete helpers ────────────────────────────────────────────────────────
  const openDeleteModal = (materialId: string) => {
    setDeleteModal({ materialId });
    setTimeout(() => setDeleteVisible(true), 10);
  };
  const closeDeleteModal = () => {
    setDeleteVisible(false);
    setTimeout(() => setDeleteModal(null), 250);
  };
  const confirmDelete = async () => {
    if (!deleteModal) return;
    setDeleteLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningText/texts/${deleteModal.materialId}`,
        { withCredentials: true },
      );
      setDeleteVisible(false);
      setTimeout(() => {
        setDeleteModal(null);
        setShowDeleteSuccess(true);
        setTimeout(() => setDeleteSuccessVisible(true), 10);
      }, 250);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal menghapus material");
    } finally {
      setDeleteLoading(false);
    }
  };
  const closeDeleteSuccess = () => {
    setDeleteSuccessVisible(false);
    setTimeout(() => {
      setShowDeleteSuccess(false);
      setInternalRefreshKey((prev) => prev + 1);
      onMaterialUpdated?.();
    }, 250);
  };

  const handleEditMaterial = (mat: any) => {
    const { streamId, courseId, moduleId } = params;

    router.push(
      `/admin/elearning/streams/${streamId}/courses/${courseId}/modules/${moduleId}/materials/create?mode=edit&materialId=${mat.id}`,
    );
  };

  return (
    <div className="bg-white rounded-xl border overflow-visible mb-20">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "#DDF6EC" }}>
            <th className="px-4 py-3 text-left text-gray-700 text-[13px] font-semibold w-16">
              Order
            </th>
            <th
              className={`${thBase("title")} text-left`}
              onClick={() => handleSort("title")}
            >
              Material Title{" "}
              <SortIcon colKey="title" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th
              className={`${thBase("status")} text-center`}
              onClick={() => handleSort("status")}
            >
              Status{" "}
              <SortIcon colKey="status" sortKey={sortKey} sortDir={sortDir} />
            </th>
            <th
              className={`${thBase("lastUpdated")} text-center`}
              onClick={() => handleSort("lastUpdated")}
            >
              Last Updated{" "}
              <SortIcon
                colKey="lastUpdated"
                sortKey={sortKey}
                sortDir={sortDir}
              />
            </th>
            <th className="px-4 py-3 text-center text-gray-700 text-[13px] font-semibold">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-10 text-center text-gray-400 text-sm"
              >
                Loading...
              </td>
            </tr>
          ) : materials.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-10 text-center text-gray-400 text-sm"
              >
                {search
                  ? `No materials found matching "${search}"`
                  : "No materials available in this module"}
              </td>
            </tr>
          ) : (
            pagedMaterials.map((mat: ELearningText, index: number) => {
              const updatedDate = mat.updatedAt
                ? new Date(mat.updatedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "-";
              const updatedTime = mat.updatedAt
                ? new Date(mat.updatedAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <tr
                  key={mat.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition">
                        <DragHandle />
                      </span>
                      <span className="text-[12px] text-gray-500 tabular-nums">
                        {mat.orderNumber ?? startIndex + index + 1}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-[12px] font-medium text-gray-800 max-w-[360px]">
                    {mat.title ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <MaterialStatusBadge status={mat.status} />
                  </td>

                  <td className="px-4 py-3 text-center text-gray-500">
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-[12px]">{updatedDate}</span>
                      <span className="text-[10px] text-gray-400">
                        {updatedTime}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center relative">
                    <div className="relative inline-block">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (openMenu === mat.id) {
                            setOpenMenu(null);
                          } else {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const estimatedMenuHeight = 260;
                            setMenuOpenUpward(spaceBelow < estimatedMenuHeight);
                            setOpenMenu(mat.id);
                          }
                        }}
                        className="p-2 rounded-md hover:bg-gray-100"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {openMenu === mat.id && (
                        <div
                          ref={menuRef}
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute right-0 w-40 bg-white border rounded-lg shadow-md z-50 text-sm ${
                            menuOpenUpward
                              ? "bottom-full mb-2"
                              : "top-full mt-2"
                          }`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              openHistoryModal(mat);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                          >
                            <HistoryIcon size={15} />
                            History
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              handleEditMaterial(mat);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                          >
                            <Pencil size={15} /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              openActionModal(
                                mat.status === "PUBLISHED"
                                  ? "unpublish"
                                  : "publish",
                                mat.id,
                              );
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                          >
                            {mat.status === "PUBLISHED" ? (
                              <>
                                <FileText size={15} /> Unpublish
                              </>
                            ) : (
                              <>
                                <Globe size={15} /> Publish
                              </>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              openDeleteModal(mat.id);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 text-red-600"
                          >
                            <Trash2 size={15} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
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
                  key={`e-${idx}`}
                  className="w-7 h-7 flex items-center justify-center text-[13px] text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`w-7 h-7 rounded text-[13px] font-medium transition-colors ${item === safePage ? "bg-emerald-500 text-white" : "hover:bg-gray-100 text-gray-600"}`}
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

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      {editModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${editVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"}`}
        >
          <div
            className={`bg-white w-[540px] rounded-2xl shadow-2xl pt-6 px-7 pb-10 transform transition-all duration-300 ${editVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Edit Material
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Update the details of this material.
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition mt-0.5"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-5 mt-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Material Title
                </label>
                <input
                  type="text"
                  defaultValue={editModal.title}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Status
                </label>
                <div className="relative">
                  <select
                    defaultValue={editModal.status}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <button
                onClick={closeEditModal}
                className="flex-1 border border-emerald-500 text-emerald-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Success Modal ───────────────────────────────────────────────── */}
      {showEditSuccess && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${editSuccessVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"}`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${editSuccessVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Material Updated Successfully!
            </h2>
            <p className="text-sm text-gray-400 mb-7">
              The material details have been saved.
            </p>
            <button
              onClick={closeEditSuccess}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Publish / Unpublish Confirmation Modal ───────────────────────────── */}
      {actionModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${actionVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"}`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${actionVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                  {actionModal.type === "unpublish" ? (
                    <FileText className="w-7 h-7 text-amber-500" />
                  ) : (
                    <Globe className="w-7 h-7 text-amber-500" />
                  )}
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {actionModal.type === "unpublish"
                ? "Unpublish this Material?"
                : "Publish this Material?"}
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              {actionModal.type === "unpublish"
                ? "This material will be set to Draft and hidden from learners."
                : "This material will be published and visible to learners."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeActionModal}
                disabled={actionLoading}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={actionLoading}
                className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {actionLoading
                  ? actionModal.type === "unpublish"
                    ? "Unpublishing..."
                    : "Publishing..."
                  : actionModal.type === "unpublish"
                    ? "Unpublish"
                    : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Publish / Unpublish Success Modal ───────────────────────────────── */}
      {successModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${successVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"}`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${successVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {successModal.type === "unpublish"
                ? "Material Unpublished!"
                : "Material Published!"}
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              {successModal.type === "unpublish"
                ? "The material has been set to Draft."
                : "The material is now live and visible to learners."}
            </p>
            <button
              onClick={closeSuccessModal}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────────────────── */}
      {deleteModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${deleteVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"}`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${deleteVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Delete this Material?
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              This action cannot be undone. The material will be permanently
              removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Success Modal ─────────────────────────────────────────────── */}
      {showDeleteSuccess && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${deleteSuccessVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"}`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${deleteSuccessVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Material Deleted!
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              The material has been permanently removed.
            </p>
            <button
              onClick={closeDeleteSuccess}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── HISTORY MODAL ───────────────────────────────────────────────────── */}
      {historyModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center gap-4 transition-opacity duration-300 ${
            historyVisible
              ? "bg-black/60 backdrop-blur-sm opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          {/* List riwayat */}
          <div
            className={`bg-white w-[560px] max-h-[80vh] flex flex-col rounded-2xl shadow-2xl transform transition-all duration-300 ${
              historyVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            {/* Header — sticky */}
            <div className="flex items-start justify-between pt-6 px-7 pb-4 border-b border-gray-100 shrink-0">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-800">
                  Riwayat Perubahan
                </h2>
                <p className="text-sm text-gray-400 mt-0.5 truncate">
                  {historyModal.materialTitle}
                </p>
              </div>
              <button
                onClick={closeHistoryModal}
                className="text-gray-400 hover:text-gray-600 transition mt-0.5 shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-7 py-5">
              {historyLoading ? (
                <p className="text-sm text-gray-400 text-center py-10">
                  Memuat riwayat...
                </p>
              ) : historyLogs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">
                  Belum ada riwayat perubahan untuk material ini.
                </p>
              ) : (
                <ul className="space-y-3">
                  {historyLogs.map((log) => {
                    const meta = auditActionMeta[log.action] ?? {
                      label: log.action,
                      className: "bg-gray-100 text-gray-600",
                    };
                    const createdDate = new Date(log.createdAt);
                    const isSelected = selectedLog?.id === log.id;

                    return (
                      <li
                        key={log.id}
                        onClick={() => openDetailPanel(log)}
                        className={`rounded-lg border px-3 py-3 cursor-pointer transition-colors ${
                          isSelected
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-gray-800 truncate block">
                              {log.user?.fullName ?? "Pengguna tidak diketahui"}
                            </span>
                            <span className="text-xs text-gray-400 truncate block">
                              {log.user?.email ?? "-"}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${meta.className}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {log.description ?? "Tidak ada deskripsi perubahan"}
                        </p>
                        <span className="text-[11px] text-gray-400 mt-1 block">
                          {createdDate.toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          ·{" "}
                          {createdDate.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer / Pagination */}
            {historyTotalPages > 1 && (
              <div className="flex items-center justify-between px-7 py-4 border-t border-gray-100 shrink-0">
                <button
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-gray-500">
                  Halaman {historyPage} dari {historyTotalPages}
                </span>
                <button
                  onClick={() =>
                    setHistoryPage((p) => Math.min(historyTotalPages, p + 1))
                  }
                  disabled={historyPage === historyTotalPages}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Detail perubahan (old vs new) — muncul di sebelah kanan */}
          {selectedLog && (
            <div
              className={`bg-white w-[400px] max-h-[80vh] flex flex-col rounded-2xl shadow-2xl transform transition-all duration-200 ${
                selectedLogVisible
                  ? "scale-100 opacity-100 translate-x-0"
                  : "scale-95 opacity-0 -translate-x-3"
              }`}
            >
              <div className="flex items-start justify-between pt-6 px-6 pb-4 border-b border-gray-100 shrink-0">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-gray-800">
                    Detail Perubahan
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {(auditActionMeta[selectedLog.action]?.label ??
                      selectedLog.action) +
                      " oleh " +
                      (selectedLog.user?.fullName ??
                        "Pengguna tidak diketahui")}
                  </p>
                </div>
                <button
                  onClick={closeDetailPanel}
                  className="text-gray-400 hover:text-gray-600 transition mt-0.5 shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-6 py-5">
                {(() => {
                  const rows = getAuditDiffRows(
                    selectedLog.oldValue,
                    selectedLog.newValue,
                  );

                  if (rows.length === 0) {
                    return (
                      <p className="text-sm text-gray-400 text-center py-10">
                        Tidak ada detail perubahan field yang tercatat.
                      </p>
                    );
                  }

                  // Label field yang lebih ramah dibaca
                  const fieldLabels: Record<string, string> = {
                    title: "Judul",
                    status: "Status",
                    components: "Komponen",
                    quiz: "Quiz",
                    assignment: "Assignment",
                  };

                  return (
                    <div className="space-y-4">
                      {rows.map((row) => (
                        <div key={row.key}>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {fieldLabels[row.key] ?? row.key}
                          </span>
                          <div className="mt-1.5 space-y-1.5">
                            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                              <span className="block text-[10px] font-semibold text-red-500 mb-0.5">
                                Sebelum
                              </span>
                              {Array.isArray(row.oldVal) ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {row.oldVal.length === 0 ? (
                                    <span className="text-xs text-red-700">
                                      -
                                    </span>
                                  ) : (
                                    row.oldVal.map((v: string, i: number) => (
                                      <span
                                        key={i}
                                        className="px-1.5 py-0.5 rounded bg-red-100 text-[10px] text-red-700"
                                      >
                                        {v}
                                      </span>
                                    ))
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-red-700 whitespace-pre-wrap break-words">
                                  {formatAuditValue(row.oldVal)}
                                </span>
                              )}
                            </div>
                            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                              <span className="block text-[10px] font-semibold text-emerald-600 mb-0.5">
                                Sesudah
                              </span>
                              {Array.isArray(row.newVal) ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {row.newVal.length === 0 ? (
                                    <span className="text-xs text-emerald-700">
                                      -
                                    </span>
                                  ) : (
                                    row.newVal.map((v: string, i: number) => (
                                      <span
                                        key={i}
                                        className="px-1.5 py-0.5 rounded bg-emerald-100 text-[10px] text-emerald-700"
                                      >
                                        {v}
                                      </span>
                                    ))
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-emerald-700 whitespace-pre-wrap break-words">
                                  {formatAuditValue(row.newVal)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
