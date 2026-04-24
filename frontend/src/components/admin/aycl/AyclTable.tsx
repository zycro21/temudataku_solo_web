"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
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
  Filter,
  Search,
  Plus,
} from "lucide-react";

interface AyclTableProps {
  refreshKey?: number;
  onDataChanged?: () => void;
}

type SortKey = string | null;
type SortDirection = "asc" | "desc" | null;

interface AyclItem {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

interface ScheduleEntry {
  id?: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  googleMeetLink: string;
  quota: string;
}

interface MaterialEntry {
  id?: string;
  title: string;
  description: string;
}

interface DifferentiatorItem {
  title: string;
  desc: string;
}

const emptySchedule = (): ScheduleEntry => ({
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  googleMeetLink: "",
  quota: "",
});
const emptyMaterial = (): MaterialEntry => ({ title: "", description: "" });
const emptyDiff = (): DifferentiatorItem => ({ title: "", desc: "" });

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mb-3 mt-1">
      {children}
    </p>
  );
}

function FieldLabel({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {optional && (
        <span className="ml-1 text-xs text-gray-400 font-normal">
          (opsional)
        </span>
      )}
    </label>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-400";
const textareaCls = `${inputCls} resize-none`;

const toDateInputVal = (iso: string | null | undefined): string => {
  if (!iso) return "";
  return iso.slice(0, 10);
};

const toTimeInputVal = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const isExpired = (endDate: string | null) => {
  if (!endDate) return false;
  return new Date(endDate) < new Date();
};

type SectionType =
  | "PROGRAM_INFO"
  | "CHALLENGE"
  | "TARGET"
  | "DIFFERENTIATOR"
  | "BENEFIT"
  | "CLOSING";

interface RawSection {
  id: string;
  type: SectionType;
  title: string;
  order: number;
  content: any;
}

export default function AyclTable({
  refreshKey,
  onDataChanged,
}: AyclTableProps) {
  const [data, setData] = useState<AyclItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "expired"
  >("all");
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // ── Edit Modal state ─────────────────────────────────────────────────────────
  const [editId, setEditId] = useState<string | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [editPage, setEditPage] = useState<1 | 2>(1);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editCore, setEditCore] = useState({
    title: "",
    slug: "",
    whatsappGroupLink: "",
    price: "",
    isActive: true,
  });
  const [editHeadline, setEditHeadline] = useState("");
  const [editSubHeadline, setEditSubHeadline] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editProgramInfoText, setEditProgramInfoText] = useState("");
  const [editProgramInfoId, setEditProgramInfoId] = useState<
    string | undefined
  >(undefined);
  const [editSchedules, setEditSchedules] = useState<ScheduleEntry[]>([
    emptySchedule(),
  ]);
  const [editChallenges, setEditChallenges] = useState<string[]>([""]);
  const [editChallengeId, setEditChallengeId] = useState<string | undefined>(
    undefined,
  );
  const [editTargets, setEditTargets] = useState<string[]>([""]);
  const [editTargetId, setEditTargetId] = useState<string | undefined>(
    undefined,
  );
  const [editDifferentiators, setEditDifferentiators] = useState<
    DifferentiatorItem[]
  >([emptyDiff()]);
  const [editDiffId, setEditDiffId] = useState<string | undefined>(undefined);
  const [editMaterials, setEditMaterials] = useState<MaterialEntry[]>([
    emptyMaterial(),
  ]);
  const [editBenefits, setEditBenefits] = useState<string[]>([""]);
  const [editBenefitId, setEditBenefitId] = useState<string | undefined>(
    undefined,
  );
  const [editClosingText, setEditClosingText] = useState("");
  const [editClosingId, setEditClosingId] = useState<string | undefined>(
    undefined,
  );

  // ── Delete Modal ─────────────────────────────────────────────────────────────
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ id: string } | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteSuccessVisible, setDeleteSuccessVisible] = useState(false);

  // ── Fetch list ───────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aycl/aycl`,
        { params: { limit: "1000" }, withCredentials: true },
      );
      setData(res.data.data ?? []);
    } catch (err) {
      console.error("Gagal mengambil data AYCL:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  useEffect(() => {
    if (editId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [editId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpenMenu(null);
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setShowFilter(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, perPage]);

  const filtered = data.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      item.title.toLowerCase().includes(q) ||
      (item.description ?? "").toLowerCase().includes(q);
    const expired = isExpired(item.endDate);
    const matchFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && item.isActive && !expired) ||
      (filterStatus === "inactive" && !item.isActive) ||
      (filterStatus === "expired" && expired);
    return matchSearch && matchFilter;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const mod = sortDir === "asc" ? 1 : -1;
    if (sortKey === "title") return a.title.localeCompare(b.title) * mod;
    if (sortKey === "startDate")
      return (
        (new Date(a.startDate ?? 0).getTime() -
          new Date(b.startDate ?? 0).getTime()) *
        mod
      );
    if (sortKey === "endDate")
      return (
        (new Date(a.endDate ?? 0).getTime() -
          new Date(b.endDate ?? 0).getTime()) *
        mod
      );
    return 0;
  });

  const totalData = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalData);
  const paged = sorted.slice(startIndex, endIndex);

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

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (sortKey !== colKey || !sortDir) return null;
    return sortDir === "desc" ? (
      <ChevronDown size={13} className="inline ml-1 shrink-0" />
    ) : (
      <ChevronUp size={13} className="inline ml-1 shrink-0" />
    );
  };

  const thBase = (colKey: SortKey) =>
    `px-4 py-3 cursor-pointer select-none transition-colors text-[13px] font-semibold ${
      sortKey === colKey
        ? "bg-emerald-200 text-emerald-800"
        : "text-gray-700 hover:bg-emerald-100"
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

  // ── Dynamic list helpers ─────────────────────────────────────────────────────
  const addStr = (list: string[], set: (v: string[]) => void) =>
    set([...list, ""]);
  const updateStr = (
    list: string[],
    set: (v: string[]) => void,
    i: number,
    val: string,
  ) => {
    const next = [...list];
    next[i] = val;
    set(next);
  };
  const removeStr = (list: string[], set: (v: string[]) => void, i: number) =>
    set(list.filter((_, idx) => idx !== i));

  const addSchedule = () => setEditSchedules((p) => [...p, emptySchedule()]);
  const updateSchedule = (i: number, key: keyof ScheduleEntry, val: string) => {
    setEditSchedules((p) => {
      const n = [...p];
      n[i] = { ...n[i], [key]: val };
      return n;
    });
  };
  const removeSchedule = (i: number) =>
    setEditSchedules((p) => p.filter((_, idx) => idx !== i));

  const addMaterial = () => setEditMaterials((p) => [...p, emptyMaterial()]);
  const updateMaterial = (i: number, key: keyof MaterialEntry, val: string) => {
    setEditMaterials((p) => {
      const n = [...p];
      n[i] = { ...n[i], [key]: val };
      return n;
    });
  };
  const removeMaterial = (i: number) =>
    setEditMaterials((p) => p.filter((_, idx) => idx !== i));

  const addDiff = () => setEditDifferentiators((p) => [...p, emptyDiff()]);
  const updateDiff = (
    i: number,
    key: keyof DifferentiatorItem,
    val: string,
  ) => {
    setEditDifferentiators((p) => {
      const n = [...p];
      n[i] = { ...n[i], [key]: val };
      return n;
    });
  };
  const removeDiff = (i: number) =>
    setEditDifferentiators((p) => p.filter((_, idx) => idx !== i));

  // ── Open Edit ────────────────────────────────────────────────────────────────
  const openEdit = async (item: AyclItem) => {
    setEditId(item.id);
    setEditPage(1);
    setIsLoadingDetail(true);
    setTimeout(() => setEditVisible(true), 10);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aycl/aycl/${item.id}`,
        { withCredentials: true },
      );
      const d = res.data.data;

      setEditCore({
        title: d.title ?? "",
        slug: d.slug ?? "",
        whatsappGroupLink: d.whatsappGroupLink ?? "",
        price: d.price != null ? String(d.price) : "",
        isActive: d.isActive ?? true,
      });
      setEditHeadline(d.headline ?? "");
      setEditSubHeadline(d.subHeadline ?? "");
      setEditDescription(d.description ?? "");

      const sections: RawSection[] = d.sections ?? [];

      const programInfo = sections.find((s) => s.type === "PROGRAM_INFO");
      setEditProgramInfoId(programInfo?.id);
      setEditProgramInfoText(programInfo?.content?.text ?? "");

      const challenge = sections.find((s) => s.type === "CHALLENGE");
      setEditChallengeId(challenge?.id);
      setEditChallenges(
        challenge?.content?.items?.length ? challenge.content.items : [""],
      );

      const target = sections.find((s) => s.type === "TARGET");
      setEditTargetId(target?.id);
      setEditTargets(
        target?.content?.items?.length ? target.content.items : [""],
      );

      const diff = sections.find((s) => s.type === "DIFFERENTIATOR");
      setEditDiffId(diff?.id);
      setEditDifferentiators(
        diff?.content?.items?.length ? diff.content.items : [emptyDiff()],
      );

      const benefit = sections.find((s) => s.type === "BENEFIT");
      setEditBenefitId(benefit?.id);
      setEditBenefits(
        benefit?.content?.items?.length ? benefit.content.items : [""],
      );

      const closing = sections.find((s) => s.type === "CLOSING");
      setEditClosingId(closing?.id);
      setEditClosingText(closing?.content?.text ?? "");

      setEditMaterials(
        (d.materials ?? []).length > 0
          ? (d.materials ?? []).map((m: any) => ({
              id: m.id,
              title: m.title ?? "",
              description: m.description ?? "",
            }))
          : [emptyMaterial()],
      );
      setEditSchedules(
        (d.schedules ?? []).length > 0
          ? (d.schedules ?? []).map((s: any) => ({
              id: s.id,
              title: s.title ?? "",
              date: toDateInputVal(s.date),
              startTime: toTimeInputVal(s.startTime),
              endTime: toTimeInputVal(s.endTime),
              googleMeetLink: s.googleMeetLink ?? "",
              quota: s.quota != null ? String(s.quota) : "",
            }))
          : [emptySchedule()],
      );
    } catch (err: any) {
      toast.error("Gagal memuat detail AYCL");
      closeEdit();
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeEdit = () => {
    setEditVisible(false);
    setTimeout(() => setEditId(null), 250);
  };

  const validateEditPage1 = () => {
    if (!editCore.title.trim()) {
      toast.error("Title wajib diisi");
      return false;
    }
    if (!editCore.slug.trim()) {
      toast.error("Slug wajib diisi");
      return false;
    }
    if (editCore.price === "" || isNaN(Number(editCore.price))) {
      toast.error("Price wajib diisi dengan angka");
      return false;
    }
    return true;
  };

  const handleEditSave = async () => {
    if (!editId) return;
    if (!editHeadline.trim()) {
      toast.error("Headline wajib diisi");
      return;
    }
    setIsSubmitting(true);
    try {
      const sections: any[] = [];
      let order = 1;

      if (editProgramInfoText.trim()) {
        sections.push({
          ...(editProgramInfoId ? { id: editProgramInfoId } : {}),
          type: "PROGRAM_INFO",
          title: "Program Info",
          content: { text: editProgramInfoText },
          order: order++,
        });
      }
      const filteredChallenges = editChallenges.filter((c) => c.trim());
      if (filteredChallenges.length) {
        sections.push({
          ...(editChallengeId ? { id: editChallengeId } : {}),
          type: "CHALLENGE",
          title: "Challenge",
          content: { items: filteredChallenges },
          order: order++,
        });
      }
      const filteredTargets = editTargets.filter((t) => t.trim());
      if (filteredTargets.length) {
        sections.push({
          ...(editTargetId ? { id: editTargetId } : {}),
          type: "TARGET",
          title: "Target",
          content: { items: filteredTargets },
          order: order++,
        });
      }
      const filteredDiff = editDifferentiators.filter(
        (d) => d.title.trim() || d.desc.trim(),
      );
      if (filteredDiff.length) {
        sections.push({
          ...(editDiffId ? { id: editDiffId } : {}),
          type: "DIFFERENTIATOR",
          title: "Differentiator",
          content: { items: filteredDiff },
          order: order++,
        });
      }
      const filteredBenefits = editBenefits.filter((b) => b.trim());
      if (filteredBenefits.length) {
        sections.push({
          ...(editBenefitId ? { id: editBenefitId } : {}),
          type: "BENEFIT",
          title: "Benefit",
          content: { items: filteredBenefits },
          order: order++,
        });
      }
      if (editClosingText.trim()) {
        sections.push({
          ...(editClosingId ? { id: editClosingId } : {}),
          type: "CLOSING",
          title: "Closing",
          content: { text: editClosingText },
          order: order++,
        });
      }

      const filteredMaterials = editMaterials
        .filter((m) => m.title.trim())
        .map((m) => ({
          ...(m.id ? { id: m.id } : {}),
          title: m.title,
          description: m.description || undefined,
        }));

      const filteredSchedules = editSchedules
        .filter((s) => s.date && s.startTime && s.endTime)
        .map((s) => ({
          ...(s.id ? { id: s.id } : {}),
          title: s.title || undefined,
          date: s.date,
          startTime: `${s.date}T${s.startTime}:00`,
          endTime: `${s.date}T${s.endTime}:00`,
          googleMeetLink: s.googleMeetLink || undefined,
          quota: s.quota ? parseInt(s.quota) : undefined,
        }));

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aycl/aycl/${editId}`,
        {
          title: editCore.title,
          slug: editCore.slug,
          whatsappGroupLink: editCore.whatsappGroupLink || undefined,
          price: Number(editCore.price),
          isActive: editCore.isActive,
          headline: editHeadline,
          subHeadline: editSubHeadline || undefined,
          description: editDescription || undefined,
          sections,
          materials: filteredMaterials,
          schedules: filteredSchedules,
        },
        { withCredentials: true },
      );

      toast.success("AYCL berhasil diperbarui!");
      closeEdit();
      fetchData();
      onDataChanged?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Gagal memperbarui AYCL";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete helpers ───────────────────────────────────────────────────────────
  const openDelete = (id: string) => {
    setDeleteModal({ id });
    setTimeout(() => setDeleteVisible(true), 10);
  };
  const closeDelete = () => {
    setDeleteVisible(false);
    setTimeout(() => setDeleteModal(null), 250);
  };
  const confirmDelete = async () => {
    if (!deleteModal || isDeleting) return;
    setIsDeleting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/aycl/aycl/${deleteModal.id}`,
        { withCredentials: true },
      );
      toast.success("AYCL berhasil dihapus");
      setDeleteVisible(false);
      setTimeout(() => {
        setDeleteModal(null);
        setShowDeleteSuccess(true);
        setTimeout(() => setDeleteSuccessVisible(true), 10);
      }, 250);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus AYCL");
    } finally {
      setIsDeleting(false);
    }
  };
  const closeDeleteSuccess = () => {
    setDeleteSuccessVisible(false);
    setTimeout(() => {
      setShowDeleteSuccess(false);
      fetchData();
      onDataChanged?.();
    }, 250);
  };

  const filterLabels: Record<string, string> = {
    all: "Semua",
    active: "Aktif",
    inactive: "Tidak Aktif",
    expired: "Sudah Lewat",
  };

  return (
    <div className="bg-white rounded-xl border overflow-visible mb-20">
      {/* Filter bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b gap-3">
        <div className="relative w-72">
          <input
            placeholder="Cari berdasarkan title atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-300 transition"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {totalData} program ditemukan
          </span>
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter((v) => !v)}
              className="flex items-center gap-2 text-[13px] font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition"
            >
              <Filter size={13} />
              Filter: {filterLabels[filterStatus]}
              <ChevronDown size={13} />
            </button>
            {showFilter && (
              <div className="absolute right-0 top-10 bg-white border rounded-lg shadow-md z-50 w-40 text-sm">
                {(["all", "active", "inactive", "expired"] as const).map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFilterStatus(f);
                        setShowFilter(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition ${filterStatus === f ? "text-emerald-600 font-semibold" : "text-gray-700"}`}
                    >
                      {filterLabels[f]}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "#DDF6EC" }}>
            <th className="px-4 py-3 text-left text-gray-700 text-[13px] font-semibold w-12">
              No
            </th>
            <th
              className={`${thBase("title")} text-left`}
              onClick={() => handleSort("title")}
            >
              Title <SortIcon colKey="title" />
            </th>
            <th className="px-4 py-3 text-left text-gray-700 text-[13px] font-semibold">
              Deskripsi
            </th>
            <th
              className={`${thBase("startDate")} text-center`}
              onClick={() => handleSort("startDate")}
            >
              Tanggal Mulai <SortIcon colKey="startDate" />
            </th>
            <th
              className={`${thBase("endDate")} text-center`}
              onClick={() => handleSort("endDate")}
            >
              Tanggal Selesai <SortIcon colKey="endDate" />
            </th>
            <th className="px-4 py-3 text-center text-gray-700 text-[13px] font-semibold">
              Status
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
                Memuat data...
              </td>
            </tr>
          ) : paged.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-5 py-10 text-center text-gray-400 text-sm"
              >
                {search
                  ? `Tidak ada AYCL yang cocok dengan "${search}"`
                  : "Belum ada data AYCL"}
              </td>
            </tr>
          ) : (
            paged.map((item, idx) => {
              const expired = isExpired(item.endDate);
              return (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-[12px] text-gray-500 tabular-nums">
                    {startIndex + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-[12px] font-medium text-gray-800 max-w-[180px]">
                    {item.title}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray-500 max-w-[260px]">
                    <span className="line-clamp-2">
                      {item.description ?? "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-center text-gray-600">
                    {formatDate(item.startDate)}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-center text-gray-600">
                    {formatDate(item.endDate)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {expired ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500">
                        Sudah Lewat
                      </span>
                    ) : item.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
                        Tidak Aktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(openMenu === item.id ? null : item.id);
                      }}
                      className="p-2 rounded-md hover:bg-gray-100"
                    >
                      <MoreVertical size={15} />
                    </button>
                    {openMenu === item.id && (
                      <div
                        ref={menuRef}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-6 mt-1 w-36 bg-white border rounded-lg shadow-md z-50 text-sm"
                      >
                        <button
                          onClick={() => {
                            setOpenMenu(null);
                            openEdit(item);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenu(null);
                            openDelete(item.id);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 text-red-500"
                        >
                          <Trash2 size={14} /> Delete
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

      {/* Pagination */}
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

      {/* ── Edit Modal ─────────────────────────────────────────────────────────── */}
      {editId && (
        <div
          className={`fixed inset-0 h-screen w-screen z-[9999] flex items-center justify-center transition-opacity duration-300 ${editVisible ? "bg-black/60 opacity-100 backdrop-blur-sm" : "bg-black/0 opacity-0"}`}
        >
          <div
            className={`bg-white w-[620px] max-h-[88vh] flex flex-col rounded-2xl shadow-2xl transform transition-all duration-300 ${editVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Edit AYCL
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {editPage === 1
                    ? "Langkah 1 dari 2 — Informasi utama program"
                    : "Langkah 2 dari 2 — Detail & konten program"}
                </p>
              </div>
              <button
                onClick={closeEdit}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-7 pt-3 pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className={`h-1.5 rounded-full flex-1 transition-colors ${editPage >= 1 ? "bg-emerald-500" : "bg-gray-200"}`}
                />
                <div
                  className={`h-1.5 rounded-full flex-1 transition-colors ${editPage >= 2 ? "bg-emerald-500" : "bg-gray-200"}`}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-400">Inti</span>
                <span className="text-[10px] text-gray-400">Detail</span>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-7 py-4">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-16 text-sm text-gray-400">
                  Memuat detail...
                </div>
              ) : (
                <>
                  {/* PAGE 1 */}
                  {editPage === 1 && (
                    <div className="space-y-4">
                      <div>
                        <FieldLabel>Title</FieldLabel>
                        <input
                          type="text"
                          value={editCore.title}
                          onChange={(e) =>
                            setEditCore((p) => ({
                              ...p,
                              title: e.target.value,
                            }))
                          }
                          placeholder="AYCL Batch 2"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <FieldLabel>Slug</FieldLabel>
                        <input
                          type="text"
                          value={editCore.slug}
                          onChange={(e) =>
                            setEditCore((p) => ({
                              ...p,
                              slug: e.target.value
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                .replace(/[^a-z0-9-]/g, ""),
                            }))
                          }
                          placeholder="aycl-batch-2"
                          className={inputCls}
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                          Hanya huruf kecil, angka, dan tanda hubung (-)
                        </p>
                      </div>
                      <div>
                        <FieldLabel>Harga (Rp)</FieldLabel>
                        <input
                          type="number"
                          min={0}
                          value={editCore.price}
                          onChange={(e) =>
                            setEditCore((p) => ({
                              ...p,
                              price: e.target.value,
                            }))
                          }
                          placeholder="49000"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <FieldLabel optional>Link Grup WhatsApp</FieldLabel>
                        <input
                          type="url"
                          value={editCore.whatsappGroupLink}
                          onChange={(e) =>
                            setEditCore((p) => ({
                              ...p,
                              whatsappGroupLink: e.target.value,
                            }))
                          }
                          placeholder="https://chat.whatsapp.com/..."
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <FieldLabel>Status</FieldLabel>
                        <div className="relative">
                          <select
                            value={editCore.isActive ? "true" : "false"}
                            onChange={(e) =>
                              setEditCore((p) => ({
                                ...p,
                                isActive: e.target.value === "true",
                              }))
                            }
                            className={`${inputCls} appearance-none`}
                          >
                            <option value="true">Aktif</option>
                            <option value="false">Tidak Aktif</option>
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PAGE 2 */}
                  {editPage === 2 && (
                    <div className="space-y-5">
                      {/* Hero */}
                      <SectionLabel>Hero</SectionLabel>
                      <div>
                        <FieldLabel>Headline</FieldLabel>
                        <input
                          type="text"
                          value={editHeadline}
                          onChange={(e) => setEditHeadline(e.target.value)}
                          placeholder="All You Can Learn • Data Analyst Program"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <FieldLabel optional>Sub Headline</FieldLabel>
                        <input
                          type="text"
                          value={editSubHeadline}
                          onChange={(e) => setEditSubHeadline(e.target.value)}
                          placeholder="Upgrade skill Data Analyst..."
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <FieldLabel optional>
                          Deskripsi Singkat Program
                        </FieldLabel>
                        <textarea
                          rows={2}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Program belajar intensif untuk kamu..."
                          className={textareaCls}
                        />
                      </div>

                      <div className="border-t border-gray-100" />

                      {/* Program Info */}
                      <SectionLabel>Info Program</SectionLabel>
                      <div>
                        <FieldLabel optional>Teks Program Info</FieldLabel>
                        <textarea
                          rows={3}
                          value={editProgramInfoText}
                          onChange={(e) =>
                            setEditProgramInfoText(e.target.value)
                          }
                          placeholder="AYCL Batch 2 adalah program belajar Data Analyst..."
                          className={textareaCls}
                        />
                      </div>

                      <div className="border-t border-gray-100" />

                      {/* Schedule */}
                      <SectionLabel>Jadwal / Schedule</SectionLabel>
                      {editSchedules.map((s, i) => (
                        <div
                          key={i}
                          className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/60"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">
                              Sesi {i + 1}
                            </span>
                            {editSchedules.length > 1 && (
                              <button
                                onClick={() => removeSchedule(i)}
                                className="text-red-400 hover:text-red-600 transition"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <div>
                            <FieldLabel optional>Judul Sesi</FieldLabel>
                            <input
                              type="text"
                              value={s.title}
                              onChange={(e) =>
                                updateSchedule(i, "title", e.target.value)
                              }
                              placeholder="Sesi 1 — Data Cleaning"
                              className={inputCls}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <FieldLabel>Tanggal</FieldLabel>
                              <input
                                type="date"
                                value={s.date}
                                onChange={(e) =>
                                  updateSchedule(i, "date", e.target.value)
                                }
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <FieldLabel>Mulai</FieldLabel>
                              <input
                                type="time"
                                value={s.startTime}
                                onChange={(e) =>
                                  updateSchedule(i, "startTime", e.target.value)
                                }
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <FieldLabel>Selesai</FieldLabel>
                              <input
                                type="time"
                                value={s.endTime}
                                onChange={(e) =>
                                  updateSchedule(i, "endTime", e.target.value)
                                }
                                className={inputCls}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <FieldLabel optional>Link Google Meet</FieldLabel>
                              <input
                                type="url"
                                value={s.googleMeetLink}
                                onChange={(e) =>
                                  updateSchedule(
                                    i,
                                    "googleMeetLink",
                                    e.target.value,
                                  )
                                }
                                placeholder="https://meet.google.com/..."
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <FieldLabel optional>Kuota</FieldLabel>
                              <input
                                type="number"
                                min={1}
                                value={s.quota}
                                onChange={(e) =>
                                  updateSchedule(i, "quota", e.target.value)
                                }
                                placeholder="100"
                                className={inputCls}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addSchedule}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition"
                      >
                        <Plus size={13} /> Tambah Jadwal
                      </button>

                      <div className="border-t border-gray-100" />

                      {/* Challenge */}
                      <SectionLabel>Tantangan Sebelum Memulai</SectionLabel>
                      {editChallenges.map((c, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <input
                            type="text"
                            value={c}
                            onChange={(e) =>
                              updateStr(
                                editChallenges,
                                setEditChallenges,
                                i,
                                e.target.value,
                              )
                            }
                            placeholder={`Challenge ${i + 1}`}
                            className={inputCls}
                          />
                          {editChallenges.length > 1 && (
                            <button
                              onClick={() =>
                                removeStr(editChallenges, setEditChallenges, i)
                              }
                              className="mt-2 text-red-400 hover:text-red-600 shrink-0 transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          addStr(editChallenges, setEditChallenges)
                        }
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition"
                      >
                        <Plus size={13} /> Tambah Tantangan
                      </button>

                      <div className="border-t border-gray-100" />

                      {/* Target */}
                      <SectionLabel>Target Peserta</SectionLabel>
                      {editTargets.map((t, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <input
                            type="text"
                            value={t}
                            onChange={(e) =>
                              updateStr(
                                editTargets,
                                setEditTargets,
                                i,
                                e.target.value,
                              )
                            }
                            placeholder={`Target ${i + 1}`}
                            className={inputCls}
                          />
                          {editTargets.length > 1 && (
                            <button
                              onClick={() =>
                                removeStr(editTargets, setEditTargets, i)
                              }
                              className="mt-2 text-red-400 hover:text-red-600 shrink-0 transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addStr(editTargets, setEditTargets)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition"
                      >
                        <Plus size={13} /> Tambah Target
                      </button>

                      <div className="border-t border-gray-100" />

                      {/* Differentiator */}
                      <SectionLabel>
                        Perbedaan Program ini dengan Program Lain
                      </SectionLabel>
                      {editDifferentiators.map((d, i) => (
                        <div
                          key={i}
                          className="border border-gray-100 rounded-xl p-3 space-y-2 bg-gray-50/60"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">
                              Item {i + 1}
                            </span>
                            {editDifferentiators.length > 1 && (
                              <button
                                onClick={() => removeDiff(i)}
                                className="text-red-400 hover:text-red-600 transition"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={d.title}
                            onChange={(e) =>
                              updateDiff(i, "title", e.target.value)
                            }
                            placeholder="Judul keunggulan"
                            className={inputCls}
                          />
                          <textarea
                            rows={2}
                            value={d.desc}
                            onChange={(e) =>
                              updateDiff(i, "desc", e.target.value)
                            }
                            placeholder="Deskripsi keunggulan..."
                            className={textareaCls}
                          />
                        </div>
                      ))}
                      <button
                        onClick={addDiff}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition"
                      >
                        <Plus size={13} /> Tambah Perbedaan
                      </button>

                      <div className="border-t border-gray-100" />

                      {/* Materials */}
                      <SectionLabel>Materi Program</SectionLabel>
                      {editMaterials.map((m, i) => (
                        <div
                          key={i}
                          className="border border-gray-100 rounded-xl p-3 space-y-2 bg-gray-50/60"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">
                              Materi {i + 1}
                            </span>
                            {editMaterials.length > 1 && (
                              <button
                                onClick={() => removeMaterial(i)}
                                className="text-red-400 hover:text-red-600 transition"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={m.title}
                            onChange={(e) =>
                              updateMaterial(i, "title", e.target.value)
                            }
                            placeholder="Data Cleaning with Excel"
                            className={inputCls}
                          />
                          <textarea
                            rows={2}
                            value={m.description}
                            onChange={(e) =>
                              updateMaterial(i, "description", e.target.value)
                            }
                            placeholder="Deskripsi materi (opsional)..."
                            className={textareaCls}
                          />
                        </div>
                      ))}
                      <button
                        onClick={addMaterial}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition"
                      >
                        <Plus size={13} /> Tambah Materi
                      </button>

                      <div className="border-t border-gray-100" />

                      {/* Benefit */}
                      <SectionLabel>Benefit</SectionLabel>
                      {editBenefits.map((b, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <input
                            type="text"
                            value={b}
                            onChange={(e) =>
                              updateStr(
                                editBenefits,
                                setEditBenefits,
                                i,
                                e.target.value,
                              )
                            }
                            placeholder={`Benefit ${i + 1}`}
                            className={inputCls}
                          />
                          {editBenefits.length > 1 && (
                            <button
                              onClick={() =>
                                removeStr(editBenefits, setEditBenefits, i)
                              }
                              className="mt-2 text-red-400 hover:text-red-600 shrink-0 transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addStr(editBenefits, setEditBenefits)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition"
                      >
                        <Plus size={13} /> Tambah Benefit
                      </button>

                      <div className="border-t border-gray-100" />

                      {/* Closing */}
                      <SectionLabel>Closing</SectionLabel>
                      <div>
                        <FieldLabel optional>Teks Penutup</FieldLabel>
                        <textarea
                          rows={2}
                          value={editClosingText}
                          onChange={(e) => setEditClosingText(e.target.value)}
                          placeholder="Kalau kamu ingin mulai belajar data dengan lebih terarah..."
                          className={textareaCls}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-7 py-4 border-t border-gray-100 shrink-0 flex gap-3">
              {editPage === 1 ? (
                <>
                  <button
                    onClick={closeEdit}
                    className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (validateEditPage1()) setEditPage(2);
                    }}
                    disabled={isLoadingDetail}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Selanjutnya <ChevronRight size={15} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditPage(1)}
                    className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft size={15} /> Kembali
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={isSubmitting}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────────── */}
      {deleteModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${deleteVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"}`}
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
              Hapus Program AYCL?
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Program AYCL akan dihapus
              secara permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDelete}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Success Modal ──────────────────────────────────────────────── */}
      {showDeleteSuccess && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${deleteSuccessVisible ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"}`}
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
              Program AYCL Dihapus!
            </h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              Program AYCL telah dihapus secara permanen.
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
    </div>
  );
}
