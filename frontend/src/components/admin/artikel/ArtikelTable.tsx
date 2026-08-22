"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  MoreVertical,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Archive,
  FileText,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { ARTICLE_CATEGORIES } from "./articleCategories";

// ─── Type dari API ────────────────────────────────────────────────────────────
interface ArticleFromAPI {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  author: {
    id: string;
    fullName: string;
    profilePicture: string | null;
  } | null;
}

export interface ArtikelStats {
  total: number;
  draft: number;
  published: number;
  archived: number;
}

type SortDirection = "desc" | "asc" | null;
type SortKey = "title" | "category" | "status" | "createdAt" | null;

interface ArtikelTableProps {
  search: string;
  refreshKey?: number;
  onStatsChange?: (stats: ArtikelStats) => void;
}

// ─── Badge status (3 kondisi: DRAFT / PUBLISHED / ARCHIVED) ──────────────────
function StatusBadge({ status }: { status: ArticleFromAPI["status"] }) {
  const meta: Record<
    ArticleFromAPI["status"],
    { label: string; className: string }
  > = {
    PUBLISHED: {
      label: "Published",
      className: "bg-emerald-100 text-emerald-700",
    },
    DRAFT: { label: "Draft", className: "bg-amber-100 text-amber-700" },
    ARCHIVED: { label: "Archived", className: "bg-gray-200 text-gray-600" },
  };
  const m = meta[status] ?? meta.DRAFT;
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${m.className}`}
    >
      {m.label}
    </span>
  );
}

export default function ArtikelTable({
  search,
  refreshKey = 0,
  onStatsChange,
}: ArtikelTableProps) {
  const [articles, setArticles] = useState<ArticleFromAPI[]>([]);
  const [loading, setLoading] = useState(true);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuOpenUpward, setMenuOpenUpward] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    articleId: string | null;
    title: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    type: "delete" | "status";
    message: string;
  } | null>(null);

  // ─── Edit modal ──────────────────────────────────────────────────────────
  const [editModal, setEditModal] = useState<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    tags: string[];
    status: ArticleFromAPI["status"];
    coverImage: string;
  } | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editTagInput, setEditTagInput] = useState("");
  const MAX_TAGS = 10;
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // ─── Fetch data dari API ────────────────────────────────────────────────────
  // Sengaja fetch limit besar sekali, baru sort/filter/paginate di client —
  // samain pola dengan StreamsTable biar interaksi (sort/search/paginate)
  // instan tanpa round-trip tiap kali.
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/articles/admin`,
        {
          withCredentials: true,
          params: { limit: 1000 },
        },
      );
      setArticles(res.data.data?.data ?? []);
      if (res.data.data?.stats) {
        onStatsChange?.(res.data.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
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
  const filteredArticles = articles.filter((article) => {
    const query = search.toLowerCase();
    return (
      (article.title ?? "").toLowerCase().includes(query) ||
      (article.excerpt ?? "").toLowerCase().includes(query) ||
      (article.category ?? "").toLowerCase().includes(query)
    );
  });

  // ─── Sort ───────────────────────────────────────────────────────────────────
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    const modifier = sortDir === "asc" ? 1 : -1;
    return String(valA ?? "").localeCompare(String(valB ?? "")) * modifier;
  });

  // ─── Pagination ─────────────────────────────────────────────────────────────
  const totalData = sortedArticles.length;
  const totalPages = Math.max(1, Math.ceil(totalData / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalData);
  const pagedArticles = sortedArticles.slice(startIndex, endIndex);

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
    if (deleteModal || successModal) {
      setTimeout(() => setShowModal(true), 10);
    } else {
      setShowModal(false);
    }
  }, [deleteModal, successModal]);

  // ─── Format tanggal dari ISO string ─────────────────────────────────────────
  const formatDate = (raw: string | null) => {
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

  // ─── Quick status change ─────────────────────────────────────────────────
  const handleChangeStatus = async (
    articleId: string,
    status: ArticleFromAPI["status"],
  ) => {
    try {
      const formData = new FormData();
      formData.append("status", status);

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/articles/${articleId}`,
        formData,
        { withCredentials: true },
      );

      const labels: Record<ArticleFromAPI["status"], string> = {
        DRAFT: "Artikel dijadikan draft",
        PUBLISHED: "Artikel berhasil dipublikasikan",
        ARCHIVED: "Artikel berhasil diarsipkan",
      };

      setSuccessModal({ type: "status", message: labels[status] });
      fetchArticles();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || err.message || "Gagal mengubah status",
      );
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteModal?.articleId) return;

    try {
      setDeleteLoading(true);

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/articles/${deleteModal.articleId}`,
        { withCredentials: true },
      );

      setShowModal(false);
      setTimeout(() => {
        setDeleteModal(null);
        setDeleteLoading(false);
        setSuccessModal({
          type: "delete",
          message: "Artikel berhasil dihapus",
        });
        fetchArticles();
      }, 250);
    } catch (err: any) {
      console.error(err);
      setDeleteLoading(false);
      toast.error(
        err.response?.data?.message || err.message || "Gagal menghapus artikel",
      );
    }
  };

  const closeSuccessModal = () => {
    setShowModal(false);
    setTimeout(() => setSuccessModal(null), 250);
  };

  // ─── Edit modal ──────────────────────────────────────────────────────────
  const openEditModal = (article: ArticleFromAPI) => {
    setEditModal({
      id: article.id,
      title: article.title ?? "",
      slug: article.slug ?? "",
      excerpt: article.excerpt ?? "",
      category: article.category ?? "",
      tags: article.tags ?? [],
      status: article.status,
      coverImage: article.coverImage ?? "",
    });
    setEditCoverFile(null);
    setEditCoverPreview(null);
    setEditTagInput("");
    setTimeout(() => setEditVisible(true), 10);
  };

  const closeEditModal = () => {
    setEditVisible(false);
    setTimeout(() => {
      setEditModal(null);
      setEditCoverFile(null);
      setEditCoverPreview(null);
      setEditTagInput("");
    }, 250);
  };

  const addEditTag = () => {
    if (!editModal) return;
    const value = editTagInput.trim();
    if (!value) return;
    if (editModal.tags.length >= MAX_TAGS) {
      toast.warning(`Maksimal ${MAX_TAGS} tags`);
      return;
    }
    if (editModal.tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      setEditTagInput("");
      return;
    }
    setEditModal({ ...editModal, tags: [...editModal.tags, value] });
    setEditTagInput("");
  };

  const removeEditTag = (index: number) => {
    if (!editModal) return;
    setEditModal({
      ...editModal,
      tags: editModal.tags.filter((_, i) => i !== index),
    });
  };

  const handleEditTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEditTag();
    } else if (
      e.key === "Backspace" &&
      !editTagInput &&
      editModal &&
      editModal.tags.length > 0
    ) {
      removeEditTag(editModal.tags.length - 1);
    }
  };

  const handleEditCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditCoverFile(file);
    setEditCoverPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;

    if (!editModal.title.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }

    setEditSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", editModal.title);
      if (editModal.slug.trim()) formData.append("slug", editModal.slug.trim());
      formData.append("excerpt", editModal.excerpt);
      formData.append("category", editModal.category);
      editModal.tags.forEach((tag) => formData.append("tags", tag));
      formData.append("status", editModal.status);
      if (editCoverFile) formData.append("coverImage", editCoverFile);

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/articles/${editModal.id}`,
        formData,
        { withCredentials: true },
      );

      toast.success("Artikel berhasil diperbarui");
      closeEditModal();
      fetchArticles();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Gagal memperbarui artikel",
      );
    } finally {
      setEditSaving(false);
    }
  };

  // 🔥 BARU: "Edit Konten" — nanti diarahkan ke halaman konten artikel
  // (belum dibuat). Untuk sekarang cuma placeholder biar aksinya sudah ada
  // di menu; begitu halaman kontennya jadi, tinggal ganti isi fungsi ini
  // jadi router.push(`/admin/artikel/${article.id}/konten`) atau semacamnya.
  const handleEditContent = (article: ArticleFromAPI) => {
    toast.info("Fitur edit konten akan segera hadir");
  };

  // Status lain yang belum aktif — dipakai buat quick action di dropdown.
  // 🔥 DIUBAH: "Jadikan Draft" DIHAPUS dari sini — status DRAFT tetap ada
  // sebagai opsi di form "Edit Data" (dropdown status di modal edit), tapi
  // tidak lagi tersedia sebagai quick action satu-klik di menu tabel.
  const otherStatuses = (
    current: ArticleFromAPI["status"],
  ): { status: ArticleFromAPI["status"]; label: string; icon: any }[] => {
    const all: {
      status: ArticleFromAPI["status"];
      label: string;
      icon: any;
    }[] = [
      { status: "PUBLISHED", label: "Publikasikan", icon: CheckCircle2 },
      { status: "ARCHIVED", label: "Arsipkan", icon: Archive },
    ];
    return all.filter((s) => s.status !== current);
  };

  return (
    <div className="bg-white rounded-xl border overflow-visible mb-20">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "#DDF6EC" }}>
            <th className="px-5 py-3 text-left text-gray-700 text-[13px] font-semibold">
              Cover
            </th>
            <th
              className={`${thBase("title")} text-left`}
              onClick={() => handleSort("title")}
            >
              Judul <SortIcon colKey="title" />
            </th>
            <th
              className={`${thBase("category")} text-left`}
              onClick={() => handleSort("category")}
            >
              Kategori <SortIcon colKey="category" />
            </th>
            <th
              className={`${thBase("status")} text-center`}
              onClick={() => handleSort("status")}
            >
              Status <SortIcon colKey="status" />
            </th>
            <th className="px-5 py-3 text-left text-gray-700 text-[13px] font-semibold">
              Penulis
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
                Memuat artikel...
              </td>
            </tr>
          ) : pagedArticles.length > 0 ? (
            pagedArticles.map((article) => {
              const cover = article.coverImage
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${article.coverImage}`
                : "";
              const { date, time } = formatDate(article.createdAt);

              return (
                <tr
                  key={article.id}
                  // 🔥 CATATAN: klik baris tetap jalan pintas ke "Edit Data"
                  // (bukan "Edit Konten"), karena halaman edit konten belum
                  // dibuat. Kalau nanti halaman kontennya sudah ada dan mau
                  // klik baris diarahkan ke sana, cukup ganti baris di bawah
                  // ini jadi handleEditContent(article).
                  onClick={() => {
                    if (openMenu || deleteModal || editModal) return;
                    openEditModal(article);
                  }}
                  className="border-t hover:bg-gray-50 transition cursor-pointer"
                >
                  {/* Cover */}
                  <td className="px-4 py-3">
                    <div className="w-16 h-12 relative">
                      {cover ? (
                        <Image
                          src={cover}
                          alt="cover"
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
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3 text-[12px] font-medium text-gray-800 max-w-[280px]">
                    <span className="line-clamp-2">{article.title}</span>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 text-[12px] text-gray-500">
                    {article.category ?? "-"}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={article.status} />
                  </td>

                  {/* Author */}
                  <td className="px-4 py-3 text-[12px] text-gray-600">
                    {article.author?.fullName ?? "-"}
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
                          if (openMenu === article.id) {
                            setOpenMenu(null);
                          } else {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const estimatedMenuHeight = 200;
                            setMenuOpenUpward(spaceBelow < estimatedMenuHeight);
                            setOpenMenu(article.id);
                          }
                        }}
                        className="p-2 rounded-md hover:bg-gray-100"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {openMenu === article.id && (
                        <div
                          ref={menuRef}
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute right-0 w-44 bg-white border rounded-lg shadow-md z-50 text-sm ${
                            menuOpenUpward
                              ? "bottom-full mb-2"
                              : "top-full mt-2"
                          }`}
                        >
                          {/* 🔥 DIUBAH: dulu satu tombol "Edit" langsung buka
                              modal metadata. Sekarang dipecah dua: "Edit
                              Konten" (nanti masuk ke halaman konten artikel,
                              belum dibuat) dan "Edit Data" (modal metadata
                              yang sudah ada — judul, slug, excerpt, tags,
                              cover, status, dst). */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              handleEditContent(article);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                          >
                            <FileText size={15} />
                            Edit Konten
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              openEditModal(article);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                          >
                            <Pencil size={15} />
                            Edit Data
                          </button>

                          {otherStatuses(article.status).map((s) => {
                            const Icon = s.icon;
                            return (
                              <button
                                key={s.status}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenu(null);
                                  handleChangeStatus(article.id, s.status);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700"
                              >
                                <Icon size={15} />
                                {s.label}
                              </button>
                            );
                          })}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              setDeleteModal({
                                articleId: article.id,
                                title: article.title,
                              });
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 text-red-600"
                          >
                            <Trash2 size={15} />
                            Hapus
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
                colSpan={7}
                className="px-5 py-10 text-center text-gray-400 text-sm"
              >
                {search
                  ? `Tidak ada artikel yang cocok dengan "${search}"`
                  : "Belum ada artikel."}
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

      {/* ── DELETE CONFIRM / SUCCESS MODAL ──────────────────────────────────── */}
      {(deleteModal || successModal) && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            showModal
              ? "bg-black/60 backdrop-blur-sm opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          {deleteModal && (
            <div
              className={`bg-white w-[400px] rounded-2xl shadow-2xl p-7 text-center transform transition-all duration-300 ${
                showModal
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
                Hapus Artikel Ini?
              </h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                <span className="font-medium text-gray-700">
                  "{deleteModal.title}"
                </span>{" "}
                akan dihapus permanen beserta seluruh kontennya. Tindakan ini
                tidak bisa dibatalkan.
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
          )}

          {successModal && (
            <div
              className={`bg-white w-[400px] rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-300 ${
                showModal
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
              <p className="text-sm text-gray-400 mb-7">
                {successModal.message}
              </p>
              <button
                onClick={closeSuccessModal}
                className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition text-sm"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── EDIT MODAL ──────────────────────────────────────────────────────── */}
      {editModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            editVisible
              ? "bg-black/60 backdrop-blur-sm opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[560px] max-h-[88vh] rounded-2xl shadow-2xl flex flex-col transform transition-all duration-300 ${
              editVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-semibold text-gray-800">
                Edit Data Artikel
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Judul
                </label>
                <input
                  type="text"
                  value={editModal.title}
                  onChange={(e) =>
                    setEditModal({ ...editModal, title: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Slug
                </label>
                <input
                  type="text"
                  value={editModal.slug}
                  onChange={(e) =>
                    setEditModal({ ...editModal, slug: e.target.value })
                  }
                  placeholder="dikosongkan = tetap pakai slug lama"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 placeholder:text-gray-400"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ringkasan
                </label>
                <textarea
                  value={editModal.excerpt}
                  onChange={(e) =>
                    setEditModal({ ...editModal, excerpt: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kategori
                </label>
                {/* 🔥 DIUBAH: dulu input teks bebas — sekarang dropdown dari
                    daftar kategori tetap (lihat articleCategories.ts). Kalau
                    artikel lama sudah punya kategori custom yang BUKAN dari
                    daftar ini (peninggalan sebelum ada dropdown), kategori
                    itu tetap ditampilkan sebagai opsi tambahan di sini biar
                    datanya nggak diam-diam berubah/hilang saat modal dibuka
                    — admin yang pilih sendiri kalau mau gantikan ke kategori
                    baku. */}
                <select
                  value={editModal.category}
                  onChange={(e) =>
                    setEditModal({ ...editModal, category: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="">Tanpa kategori</option>
                  {editModal.category &&
                    !ARTICLE_CATEGORIES.includes(
                      editModal.category as (typeof ARTICLE_CATEGORIES)[number],
                    ) && (
                      <option value={editModal.category}>
                        {editModal.category} (kategori lama)
                      </option>
                    )}
                  {ARTICLE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tags{" "}
                  <span className="text-gray-400 font-normal">
                    ({editModal.tags.length}/{MAX_TAGS})
                  </span>
                </label>
                <div className="w-full border border-gray-200 rounded-lg px-2.5 py-2 flex flex-wrap items-center gap-1.5 focus-within:ring-1 focus-within:ring-emerald-400">
                  {editModal.tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-md"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeEditTag(index)}
                        className="text-emerald-500 hover:text-emerald-800 transition"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {editModal.tags.length < MAX_TAGS && (
                    <input
                      value={editTagInput}
                      onChange={(e) => setEditTagInput(e.target.value)}
                      onKeyDown={handleEditTagKeyDown}
                      onBlur={addEditTag}
                      type="text"
                      placeholder={
                        editModal.tags.length === 0
                          ? "Ketik tag lalu tekan Enter"
                          : ""
                      }
                      className="flex-1 min-w-[100px] text-sm text-gray-700 placeholder-gray-400 focus:outline-none py-1"
                    />
                  )}
                </div>
              </div>

              {/* Cover */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cover
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="border border-emerald-500 text-emerald-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-50 transition"
                  >
                    Ganti Cover
                  </button>
                  <span className="text-sm text-gray-400 truncate max-w-[220px]">
                    {editCoverFile ? editCoverFile.name : "Belum ada file baru"}
                  </span>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEditCoverChange}
                  />
                </div>

                {/* 🔥 FIX: dulu fallback-nya string kosong ("") kalau belum
                    ada preview file baru MAUPUN cover lama — itu yang bikin
                    console warning "empty string passed to src". Sekarang
                    src dihitung dulu ke variabel, dan <img> cuma dirender
                    kalau src-nya benar-benar ada. */}
                {(() => {
                  const editCoverSrc =
                    editCoverPreview ||
                    (editModal.coverImage
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${editModal.coverImage}`
                      : null);

                  if (!editCoverSrc) {
                    return (
                      <div className="mt-3 flex h-20 w-28 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-[11px] text-gray-400">
                        Belum ada cover
                      </div>
                    );
                  }

                  return (
                    <div className="mt-3 border border-gray-200 rounded-lg p-2 w-fit">
                      <img
                        src={editCoverSrc}
                        alt="Cover preview"
                        className="w-28 h-20 object-cover rounded-md bg-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  );
                })()}
                {editCoverFile && (
                  <p className="text-[11px] text-amber-600 mt-1.5">
                    Cover lama akan dihapus otomatis kalau perubahan ini
                    disimpan.
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  value={editModal.status}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      status: e.target.value as ArticleFromAPI["status"],
                    })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
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
    </div>
  );
}
