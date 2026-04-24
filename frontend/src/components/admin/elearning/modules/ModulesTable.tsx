"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import StatusBadge from "../streams/StatusBadge";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  MoreVertical,
  Pencil,
  Copy,
  Archive,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface ModulesTableProps {
  search: string;
  refreshKey?: number;
}

type SortDirection = "desc" | "asc" | null;
type SortKey = string | null;

interface SubBab {
  id: string;
  title: string;
  orderNumber: number | null;
  estimatedTime: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  texts: any[];
}

// Drag handle icon (6-dot grid)
const DragHandle = () => (
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
);

const formatDuration = (estimatedTime: string | null) => {
  if (!estimatedTime) return "-";
  const minutes = parseInt(estimatedTime, 10);
  if (isNaN(minutes)) return estimatedTime;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}M`;
  if (m === 0) return `${h}H`;
  return `${h}H ${String(m).padStart(2, "0")}M`;
};

const formatDateTime = (dateString: string) => {
  const dateObj = new Date(dateString);
  const date = dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = dateObj.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { date, time };
};

export default function ModulesTable({
  search,
  refreshKey,
}: ModulesTableProps) {
  const params = useParams();
  const router = useRouter();
  const streamId = params?.streamId as string;
  const courseId = params?.courseId as string;

  const [modules, setModules] = useState<SubBab[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalData, setTotalData] = useState(0);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [editModal, setEditModal] = useState<{
    moduleId: string;
    name: string;
    duration: string;
    status: string;
    orderNumber: string;
  } | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    duration: "",
    status: "",
    orderNumber: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [editSuccessVisible, setEditSuccessVisible] = useState(false);
  const [internalRefreshKey, setInternalRefreshKey] = useState(0);

  const [actionModal, setActionModal] = useState<{
    type: "publish" | "unpublish";
    moduleId: string;
  } | null>(null);
  const [actionVisible, setActionVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    type: "publish" | "unpublish";
  } | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{ moduleId: string } | null>(
    null,
  );
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteSuccessVisible, setDeleteSuccessVisible] = useState(false);

  const [duplicateModal, setDuplicateModal] = useState<{
    moduleId: string;
  } | null>(null);
  const [duplicateVisible, setDuplicateVisible] = useState(false);
  const [duplicateLoading, setDuplicateLoading] = useState(false);

  // ── Fetch Data ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;

    const fetchModules = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubBab/subchapters/${courseId}/subbabs`,
          {
            withCredentials: true,
            params: {
              page: currentPage,
              limit: perPage,
              search: search || undefined,
              sort: sortDir === "asc" ? "asc" : "asc", // default asc, API supports asc/desc by orderNumber
            },
          },
        );
        const data = res.data.data;
        setModules(data.subBabs ?? []);
        setTotalData(data.total ?? 0);
      } catch (err) {
        console.error("Gagal fetch modules:", err);
        toast.error("Gagal memuat data modules");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [
    courseId,
    currentPage,
    perPage,
    search,
    sortDir,
    refreshKey,
    internalRefreshKey,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, perPage]);

  // ── Client-side sort (untuk kolom selain orderNumber) ────────────────────
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
    `px-4 py-3 cursor-pointer select-none transition-colors text-[13px] font-semibold ${
      sortKey === colKey
        ? "bg-emerald-200 text-emerald-800"
        : "text-gray-700 hover:bg-emerald-100"
    }`;

  const sortedModules = [...modules].sort((a: SubBab, b: SubBab) => {
    if (!sortKey || !sortDir) return 0;
    const modifier = sortDir === "asc" ? 1 : -1;

    if (sortKey === "name") {
      return a.title.localeCompare(b.title) * modifier;
    }
    if (sortKey === "materials") {
      return ((a.texts?.length ?? 0) - (b.texts?.length ?? 0)) * modifier;
    }
    if (sortKey === "duration") {
      const aVal = parseInt(a.estimatedTime ?? "0", 10) || 0;
      const bVal = parseInt(b.estimatedTime ?? "0", 10) || 0;
      return (aVal - bVal) * modifier;
    }
    if (sortKey === "status") {
      return a.status.localeCompare(b.status) * modifier;
    }
    if (sortKey === "created") {
      return (
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
        modifier
      );
    }
    return 0;
  });

  // Pagination (server-side total, client-side slice hanya untuk sorted)
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalData);
  const pagedModules = sortedModules;

  const getPaginationItems = (): (number | "...")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Edit ────────────────────────────────────────────────────────────────────
  const openEditModal = (mod: SubBab) => {
    setEditModal({
      moduleId: mod.id,
      name: mod.title,
      duration: mod.estimatedTime ?? "",
      status: mod.status,
      orderNumber: mod.orderNumber !== null ? String(mod.orderNumber) : "",
    });
    setEditForm({
      name: mod.title,
      duration: mod.estimatedTime ?? "",
      status: mod.status,
      orderNumber: mod.orderNumber !== null ? String(mod.orderNumber) : "",
    });
    setTimeout(() => setEditVisible(true), 10);
  };

  const closeEditModal = () => {
    setEditVisible(false);
    setTimeout(() => setEditModal(null), 250);
  };

  const handleEditSave = async () => {
    if (!editModal) return;
    setEditLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubBab/subbabs/${editModal.moduleId}`,
        {
          ...(editForm.name && { title: editForm.name }),
          ...(editForm.duration && { estimatedTime: editForm.duration }),
          ...(editForm.orderNumber && {
            orderNumber: parseInt(editForm.orderNumber, 10),
          }),
          ...(editForm.status && { status: editForm.status }),
        },
        { withCredentials: true },
      );
      setEditVisible(false);
      setTimeout(() => {
        setEditModal(null);
        setShowEditSuccess(true);
        setTimeout(() => setEditSuccessVisible(true), 10);
      }, 250);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Gagal menyimpan perubahan module";
      toast.error(msg);
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditSuccess = () => {
    setEditSuccessVisible(false);
    setTimeout(() => {
      setShowEditSuccess(false);
      setInternalRefreshKey((prev) => prev + 1);
    }, 250);
  };

  // ── Archive / Publish ───────────────────────────────────────────────────────
  const openActionModal = (type: "publish" | "unpublish", moduleId: string) => {
    setActionModal({ type, moduleId });
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubBab/subbabs/${actionModal.moduleId}`,
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
        err?.response?.data?.message ?? "Gagal mengubah status module",
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
    }, 250);
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const openDeleteModal = (moduleId: string) => {
    setDeleteModal({ moduleId });
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubBab/subbabs/${deleteModal.moduleId}`,
        { withCredentials: true },
      );
      setDeleteVisible(false);
      setTimeout(() => {
        setDeleteModal(null);
        setShowDeleteSuccess(true);
        setTimeout(() => setDeleteSuccessVisible(true), 10);
      }, 250);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal menghapus module");
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeDeleteSuccess = () => {
    setDeleteSuccessVisible(false);
    setTimeout(() => {
      setShowDeleteSuccess(false);
      setInternalRefreshKey((prev) => prev + 1);
    }, 250);
  };

  // ── Duplicate ────────────────────────────────────────────────────────────────
  const confirmDuplicate = async () => {
    if (!duplicateModal) return;
    setDuplicateLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubBab/subbabs/${duplicateModal.moduleId}/duplicate`,
        {},
        { withCredentials: true },
      );
      setDuplicateVisible(false);
      setTimeout(() => {
        setDuplicateModal(null);
        setInternalRefreshKey((prev) => prev + 1);
        toast.success("Module berhasil diduplikasi");
      }, 250);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal duplicate module");
    } finally {
      setDuplicateLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border overflow-visible mb-20">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "#DDF6EC" }}>
            <th className="px-4 py-3 text-left text-gray-700 text-[13px] font-semibold w-12">
              Order
            </th>
            <th
              className={`${thBase("name")} text-left`}
              onClick={() => handleSort("name")}
            >
              Module Name <SortIcon colKey="name" />
            </th>
            <th
              className={`${thBase("materials")} text-center`}
              onClick={() => handleSort("materials")}
            >
              Materials <SortIcon colKey="materials" />
            </th>
            <th
              className={`${thBase("duration")} text-center`}
              onClick={() => handleSort("duration")}
            >
              Duration <SortIcon colKey="duration" />
            </th>
            <th
              className={`${thBase("status")} text-center`}
              onClick={() => handleSort("status")}
            >
              Status <SortIcon colKey="status" />
            </th>
            <th
              className={`${thBase("created")} text-center`}
              onClick={() => handleSort("created")}
            >
              Created <SortIcon colKey="created" />
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
                colSpan={7}
                className="px-5 py-10 text-center text-gray-400 text-sm"
              >
                Loading...
              </td>
            </tr>
          ) : modules.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-5 py-10 text-center text-gray-400 text-sm"
              >
                {search
                  ? `No modules found matching "${search}"`
                  : "No modules available in this course"}
              </td>
            </tr>
          ) : (
            pagedModules.map((mod: SubBab, index: number) => {
              const { date, time } = formatDateTime(mod.createdAt);
              const materialsCount = mod.texts?.length ?? 0;

              return (
                <tr
                  key={mod.id}
                  onClick={() => {
                    if (openMenu || editModal || actionModal || deleteModal)
                      return;
                    router.push(
                      `/admin/elearning/streams/${streamId}/courses/${courseId}/modules/${mod.id}/materials`,
                    );
                  }}
                  className="border-t hover:bg-gray-50 transition cursor-pointer"
                >
                  {/* Drag handle + orderNumber */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition">
                        <DragHandle />
                      </span>
                      <span className="text-[12px] text-gray-500 tabular-nums">
                        {mod.orderNumber ?? startIndex + index + 1}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-[12px] font-medium text-gray-800 max-w-[280px]">
                    {mod.title}
                  </td>

                  <td className="px-4 py-3 text-[12px] text-center">
                    {materialsCount}
                  </td>

                  <td className="px-4 py-3 text-[12px] text-center">
                    {formatDuration(mod.estimatedTime)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <StatusBadge
                      status={
                        mod.status === "PUBLISHED" ? "Published" : "Archived"
                      }
                    />
                  </td>

                  <td className="px-4 py-3 text-center text-gray-500">
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-[12px]">{date}</span>
                      <span className="text-[10px] text-gray-400">{time}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(openMenu === mod.id ? null : mod.id);
                      }}
                      className="p-2 rounded-md hover:bg-gray-100"
                    >
                      <MoreVertical size={15} />
                    </button>

                    {openMenu === mod.id && (
                      <div
                        ref={menuRef}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-6 mt-2 w-40 bg-white border rounded-lg shadow-md z-50 text-sm"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(null);
                            openEditModal(mod);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                        >
                          <Pencil size={15} /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(null);
                            setDuplicateModal({ moduleId: mod.id });
                            setTimeout(() => setDuplicateVisible(true), 10);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                        >
                          <Copy size={15} /> Duplicate
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(null);
                            openActionModal(
                              mod.status === "ARCHIVED"
                                ? "publish"
                                : "unpublish",
                              mod.id,
                            );
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                        >
                          <Archive size={15} />
                          {mod.status === "ARCHIVED" ? "Publish" : "Archive"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(null);
                            openDeleteModal(mod.id);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-red-500"
                        >
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    )}
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

      {/* ── Edit Modal ─────────────────────────────────────────────────────────── */}
      {editModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            editVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[540px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl pt-6 px-7 pb-10 transform transition-all duration-300 ${
              editVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Edit Module
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Update the details of this module.
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
              {/* Module Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Module Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Order Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Order Number
                </label>
                <input
                  type="number"
                  min={1}
                  value={editForm.orderNumber}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      orderNumber: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  value={editForm.duration}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
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
                disabled={editLoading}
                className="flex-1 border border-emerald-500 text-emerald-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Success Modal ─────────────────────────────────────────────────── */}
      {showEditSuccess && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            editSuccessVisible
              ? "bg-black/60 opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${
              editSuccessVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
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
              Module Updated Successfully!
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              The module details have been saved.
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

      {/* ── Archive/Publish Confirmation Modal ────────────────────────────────── */}
      {actionModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            actionVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${
              actionVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Archive className="w-7 h-7 text-emerald-500" />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {actionModal.type === "unpublish"
                ? "Archive this Module?"
                : "Publish this Module?"}
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              {actionModal.type === "unpublish"
                ? "This module will be archived and hidden from learners."
                : "This module will be published and visible to learners."}
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
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {actionLoading
                  ? actionModal.type === "unpublish"
                    ? "Archiving..."
                    : "Publishing..."
                  : actionModal.type === "unpublish"
                    ? "Archive"
                    : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Archive/Publish Success Modal ─────────────────────────────────────── */}
      {successModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            successVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${
              successVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
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
                ? "Module Archived!"
                : "Module Published!"}
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              {successModal.type === "unpublish"
                ? "The module has been successfully archived."
                : "The module is now live and visible to learners."}
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

      {/* ── Delete Confirmation Modal ──────────────────────────────────────────── */}
      {deleteModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            deleteVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${
              deleteVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Delete this Module?
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              This action cannot be undone. All materials inside this module
              will also be permanently removed.
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

      {/* ── Delete Success Modal ───────────────────────────────────────────────── */}
      {showDeleteSuccess && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            deleteSuccessVisible
              ? "bg-black/60 opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${
              deleteSuccessVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Module Deleted!
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              The module has been permanently removed along with all its
              materials.
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
      {/* ── Duplicate Confirmation Modal ───────────────────────────────────────── */}
      {duplicateModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            duplicateVisible
              ? "bg-black/60 opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${
              duplicateVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Copy className="w-7 h-7 text-emerald-500" />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Duplicate this Module?
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              Module akan diduplikasi beserta semua kontennya. Title akan
              otomatis mendapatkan suffix{" "}
              <span className="font-medium text-gray-600">-copy (n)</span>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDuplicateVisible(false);
                  setTimeout(() => setDuplicateModal(null), 250);
                }}
                disabled={duplicateLoading}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDuplicate}
                disabled={duplicateLoading}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {duplicateLoading ? "Duplicating..." : "Duplicate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
