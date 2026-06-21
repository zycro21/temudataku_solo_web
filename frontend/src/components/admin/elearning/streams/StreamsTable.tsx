"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
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
  History as HistoryIcon,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import StatusBadge from "./StatusBadge";

// ─── Type dari API ────────────────────────────────────────────────────────────
interface StreamFromAPI {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  status: string | null;
  thumbnailImages: string[];
  createdAt: string | null;
  coursesCount: number;
  modulesCount: number;
  materialsCount: number;
}

// ─── Type SortKey berbasis data API ──────────────────────────────────────────
type SortDirection = "desc" | "asc" | null;
type SortKey =
  | "title"
  | "description"
  | "level"
  | "coursesCount"
  | "modulesCount"
  | "materialsCount"
  | "status"
  | "createdAt"
  | null;

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

interface StreamsTableProps {
  search: string;
  refreshKey?: number;
}

export default function StreamsTable({
  search,
  refreshKey = 0,
}: StreamsTableProps) {
  const [streams, setStreams] = useState<StreamFromAPI[]>([]);
  const [loading, setLoading] = useState(true);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuOpenUpward, setMenuOpenUpward] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [showModal, setShowModal] = useState(false);

  const [actionModal, setActionModal] = useState<{
    type: "publish" | "unpublish";
    streamId: string | null;
  } | null>(null);

  const [successModal, setSuccessModal] = useState<{
    type: "publish" | "unpublish" | "delete";
  } | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    streamId: string | null;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [editModal, setEditModal] = useState<{
    streamId: string;
    name: string;
    description: string;
    level: string;
    thumbnail: string;
    status: string;
  } | null>(null);

  const [editVisible, setEditVisible] = useState(false);
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState<
    string | null
  >(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  const [initialEditData, setInitialEditData] = useState<any>(null);

  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [loadingDuplicate, setLoadingDuplicate] = useState(false);

  // ─── History modal ───────────────────────────────────────────────────────
  const [historyModal, setHistoryModal] = useState<{
    streamId: string;
    streamTitle: string;
  } | null>(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<AuditLogItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [selectedLogVisible, setSelectedLogVisible] = useState(false);

  const router = useRouter();

  // ─── Fetch data dari API ────────────────────────────────────────────────────
  const fetchStreams = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses`,
        {
          withCredentials: true,
          params: { limit: 10000 },
        },
      );
      setStreams(res.data.data ?? []);
    } catch (err) {
      console.error("Failed to fetch streams:", err);
      setStreams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, [refreshKey]);

  // ─── History ─────────────────────────────────────────────────────────────
  const fetchHistory = async (streamId: string, page: number) => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses/${streamId}/history`,
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
      fetchHistory(historyModal.streamId, historyPage);
    }
    setSelectedLog(null);
    setSelectedLogVisible(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyModal, historyPage]);

  const openHistoryModal = (stream: StreamFromAPI) => {
    setHistoryPage(1);
    setHistoryModal({ streamId: stream.id, streamTitle: stream.title });
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

  // ─── Duplicate ───────────────────────────────────────────────────────────────
  const handleDuplicate = async () => {
    if (!selectedStreamId) return;

    try {
      setLoadingDuplicate(true);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses/${selectedStreamId}/duplicate`,
        {},
        { withCredentials: true },
      );

      setShowDuplicateModal(false);
      toast.success("Stream berhasil diduplikasi");
      await fetchStreams();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Gagal menduplikasi stream",
      );
    } finally {
      setLoadingDuplicate(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteModal?.streamId) return;

    try {
      setDeleteLoading(true);

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses/${deleteModal.streamId}`,
        { withCredentials: true },
      );

      // fade out delete modal dulu
      setShowModal(false);
      setTimeout(() => {
        setDeleteModal(null);
        setDeleteLoading(false);
        setSuccessModal({ type: "delete" });
      }, 250);
    } catch (err: any) {
      console.error(err);
      setDeleteLoading(false);
      toast.error(
        err.response?.data?.message || err.message || "Gagal menghapus stream",
      );
    }
  };

  const handleUpdateStatus = async (
    streamId: string,
    status: "PUBLISHED" | "ARCHIVED",
  ) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses/${streamId}`,
        { status },
        { withCredentials: true },
      );

      // tunggu modal lama fade out dulu
      setTimeout(() => {
        setSuccessModal({
          type: status === "PUBLISHED" ? "publish" : "unpublish",
        });
      }, 250); // ⬅️ ini kunci smooth transition
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || err.message || "Gagal mengubah status",
      );
    }
  };

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
  const filteredStreams = streams.filter((stream) => {
    const query = search.toLowerCase();
    return (
      (stream.title ?? "").toLowerCase().includes(query) ||
      (stream.description ?? "").toLowerCase().includes(query)
    );
  });

  // ─── Sort ───────────────────────────────────────────────────────────────────
  const sortedStreams = [...filteredStreams].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    const modifier = sortDir === "asc" ? 1 : -1;
    if (typeof valA === "number" && typeof valB === "number") {
      return (valA - valB) * modifier;
    }
    return String(valA ?? "").localeCompare(String(valB ?? "")) * modifier;
  });

  // ─── Pagination ─────────────────────────────────────────────────────────────
  const totalData = sortedStreams.length;
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalData);
  const pagedStreams = sortedStreams.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, perPage]);

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

  // ─── Close dropdown jika klik luar ──────────────────────────────────────────
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
    if (actionModal || successModal || deleteModal || showDuplicateModal) {
      setTimeout(() => setShowModal(true), 10);
    } else {
      setShowModal(false);
    }
  }, [actionModal, successModal, deleteModal, showDuplicateModal]);

  // ─── Format tanggal dari ISO string ─────────────────────────────────────────
  const formatCreatedAt = (raw: string | null) => {
    if (!raw) return { date: "-", time: "" };
    const d = new Date(raw);
    const date = d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { date, time };
  };

  // ─── Edit modal ──────────────────────────────────────────────────────────────
  const openEditModal = (stream: StreamFromAPI) => {
    const normalizeLevel = (level: string | null) => {
      if (!level) return "Beginner";

      const l = level.toLowerCase();

      if (l === "beginner") return "Beginner";
      if (l === "intermediate") return "Intermediate";
      if (l === "advanced") return "Advanced";

      return "Beginner";
    };

    const initialData = {
      name: stream.title ?? "",
      description: stream.description ?? "",
      level: normalizeLevel(stream.level),
      status: stream.status === "PUBLISHED" ? "Published" : "Archived",
      thumbnail: stream.thumbnailImages?.[0] ?? "",
    };

    setEditModal({
      streamId: stream.id,
      name: initialData.name,
      description: initialData.description,
      level: initialData.level,
      thumbnail: initialData.thumbnail,
      status: initialData.status,
    });

    // ✅ TAMBAHKAN DI SINI
    setInitialEditData(initialData);

    setEditThumbnailFile(null);
    setEditThumbnailPreview(null);
    setTimeout(() => setEditVisible(true), 10);
  };

  const closeEditModal = () => {
    setEditVisible(false);
    setTimeout(() => {
      setEditModal(null);
      setEditThumbnailFile(null);
      setEditThumbnailPreview(null);
    }, 250);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditThumbnailFile(file);
    setEditThumbnailPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleEditSave = async () => {
    if (!editModal) return;

    // TAMBAHKAN DI SINI (PALING ATAS)
    if (initialEditData && editModal) {
      const isSame =
        initialEditData.name === editModal.name &&
        initialEditData.description === editModal.description &&
        initialEditData.level === editModal.level &&
        initialEditData.status === editModal.status &&
        !editThumbnailFile; // penting

      if (isSame) {
        toast.warning("Anda tidak mengubah apapun");
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("title", editModal.name);
      formData.append("description", editModal.description);
      formData.append("level", editModal.level.toLowerCase());

      // Map nilai status dari display ke enum backend
      const statusMap: Record<string, string> = {
        Published: "PUBLISHED",
        Archived: "ARCHIVED",
        PUBLISHED: "PUBLISHED",
        ARCHIVED: "ARCHIVED",
        DRAFT: "DRAFT",
      };
      formData.append("status", statusMap[editModal.status] ?? "ARCHIVED");

      if (editThumbnailFile) {
        formData.append("thumbnailImages", editThumbnailFile);
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses/${editModal.streamId}`,
        formData,
        { withCredentials: true },
      );

      toast.success("Stream berhasil diperbarui");
      closeEditModal();
      await fetchStreams();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Gagal memperbarui stream",
      );
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl border overflow-visible mb-20">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "#DDF6EC" }}>
            <th className="px-5 py-3 text-left text-gray-700 text-[13px] font-semibold">
              Thumbnail
            </th>
            <th
              className={`${thBase("title")} text-left`}
              onClick={() => handleSort("title")}
            >
              Stream Name <SortIcon colKey="title" />
            </th>
            <th
              className={`${thBase("description")} text-left`}
              onClick={() => handleSort("description")}
            >
              Description <SortIcon colKey="description" />
            </th>
            <th
              className={`${thBase("level")} text-left`}
              onClick={() => handleSort("level")}
            >
              Level <SortIcon colKey="level" />
            </th>
            <th
              className={`${thBase("coursesCount")} text-center`}
              onClick={() => handleSort("coursesCount")}
            >
              Courses <SortIcon colKey="coursesCount" />
            </th>
            {/* <th
              className={`${thBase("modulesCount")} text-center`}
              onClick={() => handleSort("modulesCount")}
            >
              Modules <SortIcon colKey="modulesCount" />
            </th>
            <th
              className={`${thBase("materialsCount")} text-center`}
              onClick={() => handleSort("materialsCount")}
            >
              Materials <SortIcon colKey="materialsCount" />
            </th> */}
            <th
              className={`${thBase("status")} text-center`}
              onClick={() => handleSort("status")}
            >
              Status <SortIcon colKey="status" />
            </th>
            <th
              className={`${thBase("createdAt")} text-center`}
              onClick={() => handleSort("createdAt")}
            >
              Created at <SortIcon colKey="createdAt" />
            </th>
            <th className="px-5 py-3 text-center text-gray-700 text-[13px] font-semibold">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={10}
                className="px-5 py-10 text-center text-gray-400 text-sm"
              >
                Loading streams...
              </td>
            </tr>
          ) : pagedStreams.length > 0 ? (
            pagedStreams.map((stream) => {
              const thumbnail = stream.thumbnailImages?.[0]
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${stream.thumbnailImages[0]}`
                : "";
              const { date, time } = formatCreatedAt(stream.createdAt);
              const normalizeStatus = (status: string | null) => {
                if (!status) return "Archived";

                const s = status.toUpperCase();

                if (s === "PUBLISHED") return "Published";
                return "Archived"; // DRAFT & ARCHIVED → Archived
              };

              return (
                <tr
                  key={stream.id}
                  onClick={() => {
                    if (openMenu || editModal || actionModal || deleteModal)
                      return;
                    router.push(
                      `/admin/elearning/streams/${stream.id}/courses`,
                    );
                  }}
                  className="border-t hover:bg-gray-50 transition cursor-pointer"
                >
                  {/* Thumbnail */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-16 h-12 relative">
                        {thumbnail ? (
                          <Image
                            src={thumbnail}
                            alt="thumbnail"
                            fill
                            className="object-cover rounded-md"
                            unoptimized
                          />
                        ) : (
                          <div className="w-16 h-12 rounded-md bg-gray-100 flex items-center justify-center text-[9px] text-gray-400">
                            No img
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 max-w-[72px] truncate">
                        {(() => {
                          const match = thumbnail.match(
                            /([^/]+\.(jpg|jpeg|png|gif|webp|svg))(\?|$)/i,
                          );
                          return match ? match[1] : "elearning.jpg";
                        })()}
                      </span>
                    </div>
                  </td>

                  {/* Stream Name */}
                  <td className="px-4 py-3 text-[12px] font-medium text-gray-800">
                    {stream.title}
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3 text-[12px] text-gray-500 max-w-[250px]">
                    <span className="line-clamp-3">
                      {stream.description ?? "-"}
                    </span>
                  </td>

                  {/* Level */}
                  <td className="px-4 py-3 text-[12px] font-semibold">
                    {(() => {
                      const level = stream.level?.toUpperCase();

                      let colorClass = "text-gray-500";

                      if (level === "BEGINNER") colorClass = "text-green-600";
                      else if (level === "INTERMEDIATE")
                        colorClass = "text-yellow-600";
                      else if (level === "ADVANCED")
                        colorClass = "text-red-600";

                      return <span className={colorClass}>{level ?? "-"}</span>;
                    })()}
                  </td>

                  {/* Courses */}
                  <td className="px-4 py-3 text-[12px] text-center">
                    {stream.coursesCount}
                  </td>

                  {/* Modules */}
                  {/* <td className="px-4 py-3 text-[12px] text-center">
                    {stream.modulesCount}
                  </td> */}

                  {/* Materials */}
                  {/* <td className="px-4 py-3 text-[12px] text-center">
                    {stream.materialsCount}
                  </td> */}

                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={normalizeStatus(stream.status)} />
                  </td>

                  {/* Created at */}
                  <td className="px-4 py-3 text-center text-gray-500">
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-[12px]">{date}</span>
                      <span className="text-[10px] text-gray-400">{time}</span>
                    </div>
                  </td>

                  {/* ACTION */}
                  <td className="px-4 py-3 text-center relative">
                    <div className="relative inline-block">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (openMenu === stream.id) {
                            setOpenMenu(null);
                          } else {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const estimatedMenuHeight = 230;
                            setMenuOpenUpward(spaceBelow < estimatedMenuHeight);
                            setOpenMenu(stream.id);
                          }
                        }}
                        className="p-2 rounded-md hover:bg-gray-100"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {openMenu === stream.id && (
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
                              openHistoryModal(stream);
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
                              openEditModal(stream);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              setSelectedStreamId(stream.id);
                              setShowDuplicateModal(true);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                          >
                            <Copy size={15} />
                            Duplicate
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              if (
                                stream.status === "ARCHIVED" ||
                                stream.status === "Archived"
                              ) {
                                setActionModal({
                                  type: "publish",
                                  streamId: stream.id,
                                });
                              } else {
                                setActionModal({
                                  type: "unpublish",
                                  streamId: stream.id,
                                });
                              }
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                          >
                            <Archive size={15} />
                            {stream.status === "ARCHIVED" ||
                            stream.status === "Archived"
                              ? "Published"
                              : "Archive"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              setDeleteModal({ streamId: stream.id });
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 text-red-600"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
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
                colSpan={10}
                className="px-5 py-10 text-center text-gray-400 text-sm"
              >
                {search
                  ? `No streams found matching "${search}"`
                  : "No streams available."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex items-center justify-between px-5 py-3 border-t text-[13px] text-gray-600">
        {/* Kiri: info */}
        <span>
          Menampilkan {totalData === 0 ? 0 : startIndex + 1} – {endIndex} dari{" "}
          {totalData} data
        </span>

        {/* Kanan: per page + navigasi */}
        <div className="flex items-center gap-3">
          {/* Per page */}
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

          {/* Prev */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
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

          {/* Next */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── ACTION MODAL (publish / unpublish) ──────────────────────────────── */}
      {actionModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${
            showModal ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[500px] rounded-2xl p-8 text-center shadow-2xl transform transition-all duration-300 ${
              showModal
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex justify-center mb-6">
              <Image
                src="/assets/admin/elearning/streamwarning.svg"
                alt="warning"
                width={180}
                height={180}
              />
            </div>

            {actionModal.type === "unpublish" ? (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Unpublish this Stream?
                </h2>

                <p className="text-sm text-gray-500 mb-7 leading-relaxed">
                  This stream will no longer be visible to learners.
                  <br />
                  You can publish it again anytime.
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setTimeout(() => setActionModal(null), 250);
                    }}
                    className="flex-1 border border-emerald-500 text-emerald-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={async () => {
                      if (!actionModal.streamId) return;

                      setShowModal(false);

                      // tunggu animasi close selesai
                      setTimeout(async () => {
                        if (!actionModal.streamId) return;

                        await handleUpdateStatus(
                          actionModal.streamId,
                          "ARCHIVED",
                        );
                        setActionModal(null);
                      }, 250);
                    }}
                    className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
                  >
                    Unpublish
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Publish this Stream?
                </h2>

                <p className="text-sm text-gray-500 mb-7 leading-relaxed">
                  This will make the stream available to learners.
                  <br />
                  You can still edit it later if needed.
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setTimeout(() => setActionModal(null), 250);
                    }}
                    className="flex-1 border border-emerald-500 text-emerald-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={async () => {
                      if (!actionModal.streamId) return;

                      setShowModal(false);

                      // tunggu animasi close selesai
                      setTimeout(async () => {
                        if (!actionModal.streamId) return;

                        await handleUpdateStatus(
                          actionModal.streamId,
                          "PUBLISHED",
                        );
                        setActionModal(null);
                      }, 250);
                    }}
                    className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
                  >
                    Publish
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {successModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${
            showModal ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl p-8 text-center shadow-2xl transform transition-all duration-300 ${
              showModal
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex justify-center mb-6">
              <Image
                src="/assets/admin/elearning/streamwarning2.svg"
                alt="success"
                width={200}
                height={140}
              />
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {successModal.type === "publish"
                ? "Stream Published Successfully!"
                : successModal.type === "unpublish"
                  ? "Stream Unpublished Successfully!"
                  : "Stream Deleted Successfully!"}
            </h2>

            <p className="text-sm text-gray-500 mb-6">
              {successModal.type === "publish"
                ? "Your stream is now live and accessible to learners."
                : successModal.type === "unpublish"
                  ? "This stream has been removed from learner access."
                  : "The stream and its content have been permanently deleted."}
            </p>

            <button
              onClick={async () => {
                setShowModal(false);

                setTimeout(async () => {
                  setSuccessModal(null);
                  await fetchStreams();
                }, 250);
              }}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition text-sm"
            >
              View Streams
            </button>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ────────────────────────────────────────────────────── */}
      {deleteModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${
            showModal ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[500px] rounded-2xl p-8 text-center shadow-2xl transform transition-all duration-300 ${
              showModal
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex justify-center mb-6">
              <Image
                src="/assets/admin/elearning/streamwarning.svg"
                alt="warning"
                width={180}
                height={180}
              />
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Delete this Stream?
            </h2>

            <p className="text-sm text-gray-500 mb-7 leading-relaxed">
              This action cannot be undone. The stream and its
              <br />
              content will be permanently deleted.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setTimeout(() => setDeleteModal(null), 250);
                }}
                className="flex-1 border border-emerald-500 text-emerald-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ──────────────────────────────────────────────────────── */}
      {editModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${
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
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Edit Stream
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Update stream details and learning structure.
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
              {/* Stream Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Stream Name
                </label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={(e) =>
                    setEditModal({ ...editModal, name: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Description
                </label>
                <textarea
                  value={editModal.description}
                  onChange={(e) =>
                    setEditModal({ ...editModal, description: e.target.value })
                  }
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none"
                />
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Level
                </label>
                <div className="relative">
                  <select
                    value={editModal.level}
                    onChange={(e) =>
                      setEditModal({ ...editModal, level: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Thumbnail
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="border border-emerald-500 text-emerald-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-50 transition"
                  >
                    Choose Files
                  </button>
                  <span className="text-sm text-gray-400 truncate max-w-[220px]">
                    {editThumbnailFile
                      ? editThumbnailFile.name
                      : (() => {
                          const match = editModal.thumbnail.match(
                            /([^/]+\.(jpg|jpeg|png|gif|webp|svg))(\?|$)/i,
                          );
                          return match ? match[1] : "No file chosen";
                        })()}
                  </span>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEditFileChange}
                  />
                </div>

                {/* Preview */}
                {(editThumbnailPreview || editModal.thumbnail) && (
                  <div className="mt-4 border border-gray-200 rounded-lg p-3 w-fit">
                    <div className="w-24 h-24 relative">
                      <Image
                        src={
                          editThumbnailPreview ??
                          (editModal.thumbnail
                            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${editModal.thumbnail}`
                            : "")
                        }
                        alt="Thumbnail preview"
                        fill
                        className="object-cover rounded-md"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={editModal.status}
                    onChange={(e) =>
                      setEditModal({ ...editModal, status: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                  >
                    <option value="Published">Publish</option>
                    <option value="Archived">Archived</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 mt-7">
              <button
                onClick={closeEditModal}
                className="flex-1 border border-emerald-500 text-emerald-600 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DUPLICATE MODAL ─────────────────────────────────────────────────── */}
      {showDuplicateModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${
            showModal ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[420px] rounded-2xl p-7 text-center shadow-2xl transform transition-all duration-300 ${
              showModal
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            {/* ICON */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <Copy className="text-emerald-600" size={28} />
              </div>
            </div>

            {/* TITLE */}
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Duplicate Stream?
            </h2>

            {/* DESCRIPTION */}
            <p className="text-sm text-gray-500 mb-7 leading-relaxed">
              Stream ini akan diduplikasi beserta seluruh course, module, dan
              material di dalamnya.
              <br />
              Kamu bisa mengedit hasil duplicate nanti.
            </p>

            {/* ACTION */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setTimeout(() => setShowDuplicateModal(false), 250);
                }}
                className="flex-1 border border-emerald-500 text-emerald-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition"
              >
                Batal
              </button>

              <button
                onClick={handleDuplicate}
                disabled={loadingDuplicate}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingDuplicate ? "Processing..." : "Duplicate"}
              </button>
            </div>
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
                  {historyModal.streamTitle}
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
                  Belum ada riwayat perubahan untuk stream ini.
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

                  return (
                    <div className="space-y-4">
                      {rows.map((row) => (
                        <div key={row.key}>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {row.key}
                          </span>
                          <div className="mt-1.5 space-y-1.5">
                            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                              <span className="block text-[10px] font-semibold text-red-500 mb-0.5">
                                Sebelum
                              </span>
                              <span className="text-xs text-red-700 whitespace-pre-wrap break-words">
                                {formatAuditValue(row.oldVal)}
                              </span>
                            </div>
                            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                              <span className="block text-[10px] font-semibold text-emerald-600 mb-0.5">
                                Sesudah
                              </span>
                              {row.key === "thumbnailImages" &&
                              Array.isArray(row.newVal) &&
                              row.newVal.length > 0 ? (
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                                  {row.newVal.map(
                                    (path: string, idx: number) => (
                                      <img
                                        key={idx}
                                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`}
                                        alt={`thumbnail-${idx}`}
                                        className="w-16 h-12 object-cover rounded-md border border-emerald-200 shrink-0"
                                        onError={(e) => {
                                          (
                                            e.target as HTMLImageElement
                                          ).style.display = "none";
                                        }}
                                      />
                                    ),
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
