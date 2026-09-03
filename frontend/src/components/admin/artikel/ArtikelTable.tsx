"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { ArtikelStatsShape, ArtikelAuthorOption } from "./ArtikelHeader";

// ─── Type dari API ────────────────────────────────────────────────────────────
// 🔥 DIUBAH: status ARCHIVED sudah tidak dipakai lagi di app — cuma DRAFT
// (setara "unpublished") & PUBLISHED.
type ArticleStatus = "DRAFT" | "PUBLISHED";

interface ArticleFromAPI {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  // 🔥 DIUBAH: category sekarang relasi ke ArticleCategory (bukan string
  // bebas lagi), jadi API balikinnya object {id, name} atau null.
  category: { id: string; name: string } | null;
  tags: string[];
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  author: {
    id: string;
    fullName: string;
    profilePicture: string | null;
    // 🔥 daftar nama role user (bisa lebih dari satu), dikirim backend
    // lewat authorSelectWithRoles + mapAuthorRoles() di article.service.ts.
    // Dipakai buat label role di kolom Author.
    roles: string[];
  } | null;
}

type SortDirection = "desc" | "asc" | null;
type SortKey = "title" | "category" | "author" | "status" | "date" | null;

type StatusFilterValue = "" | "DRAFT" | "PUBLISHED";

interface ArtikelTableProps {
  search: string;
  // 🔥 DIUBAH: sekarang berisi categoryId (id ArticleCategory), bukan nama
  // kategori lagi — biar match sama article.category.id di data API.
  categoryFilter: string;
  authorFilter: string;
  statusFilter: StatusFilterValue;
  onStatsChange?: (stats: ArtikelStatsShape) => void;
  onAuthorsChange?: (authors: ArtikelAuthorOption[]) => void;
}

// ─── Badge status (cuma 2 kondisi: DRAFT / PUBLISHED) ────────────────────────
// Status apa pun selain PUBLISHED (termasuk peninggalan ARCHIVED lama di DB)
// ditampilkan sebagai "Draft" biar tetap aman kalau ada data lama.
function StatusBadge({ status }: { status: string }) {
  const isPublished = status === "PUBLISHED";
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
        isPublished
          ? "bg-emerald-100 text-emerald-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

// ─── Badge kategori ───────────────────────────────────────────────────────────
function CategoryBadge({
  category,
}: {
  category: { id: string; name: string } | null;
}) {
  if (!category) return <span className="text-xs text-gray-400">-</span>;
  return (
    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
      {category.name}
    </span>
  );
}

// ─── Label role penulis ───────────────────────────────────────────────────────
// Role bisa lebih dari satu di satu user — prioritas tampilan: Admin > CM >
// CURDEV (kalau include admin, selalu tampilkan Admin walau ada role lain).
function getAuthorRoleLabel(roles?: string[] | null): string | null {
  if (!roles || roles.length === 0) return null;
  const lower = roles.map((r) => r.toLowerCase());
  if (lower.includes("admin")) return "Admin";
  if (lower.includes("cm")) return "CM";
  if (lower.includes("curdev")) return "CURDEV";
  return null;
}

// ─── Avatar penulis (foto profil atau inisial) ───────────────────────────────
// 🔥 FIX: profilePicture dari API cuma nama file polos (mis. "abc123.jpg"),
// bukan path — dan bisa juga "default.jpg"/"default.png" (placeholder
// bawaan). Prefix "/images/" ditambahkan, dan default.jpg/png dianggap
// "belum ada foto" → fallback ke avatar inisial (bukan URL rusak).
function AuthorAvatar({ author }: { author: ArticleFromAPI["author"] }) {
  const initial = author?.fullName?.charAt(0)?.toUpperCase() ?? "?";
  const hasRealPhoto =
    author?.profilePicture &&
    !["default.jpg", "default.png"].includes(author.profilePicture);

  if (hasRealPhoto) {
    return (
      <div className="w-8 h-8 relative rounded-full overflow-hidden shrink-0 bg-gray-100">
        <Image
          src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${author!.profilePicture}`}
          alt={author!.fullName}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center shrink-0">
      {initial}
    </div>
  );
}

export default function ArtikelTable({
  search,
  categoryFilter,
  authorFilter,
  statusFilter,
  onStatsChange,
  onAuthorsChange,
}: ArtikelTableProps) {
  const router = useRouter();

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
      const data: ArticleFromAPI[] = res.data.data?.data ?? [];
      setArticles(data);

      if (res.data.data?.stats) {
        onStatsChange?.(res.data.data.stats);
      }

      // Susun daftar penulis unik dari hasil fetch, dikirim ke parent
      // (page.tsx) buat ngisi opsi dropdown filter "Penulis" di header.
      const uniqueAuthors = Array.from(
        new Map(
          data
            .filter(
              (
                a,
              ): a is ArticleFromAPI & {
                author: NonNullable<ArticleFromAPI["author"]>;
              } => !!a.author,
            )
            .map((a) => [
              a.author.id,
              { id: a.author.id, fullName: a.author.fullName },
            ]),
        ).values(),
      );
      onAuthorsChange?.(uniqueAuthors);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 DIUBAH: dulu ada dependency [refreshKey] yang dikirim dari header
  // buat trigger refetch setelah artikel baru dibuat lewat modal. Sekarang
  // "Buat Artikel" langsung redirect ke halaman editor (bukan modal di
  // halaman ini), jadi fetch cukup sekali pas komponen ini mount — begitu
  // admin kembali ke halaman list ini, komponennya remount & fetch ulang.
  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Ikon sort SELALU tampil di kolom yang bisa di-sort (bukan cuma muncul
  // pas aktif) — netral (ArrowUpDown, abu-abu) kalau belum aktif, ganti
  // jadi chevron arah aktif (hijau) kalau lagi disortir.
  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    const isActive = sortKey === colKey && sortDir;
    if (!isActive) {
      return <ArrowUpDown size={13} className="text-gray-400 shrink-0" />;
    }
    return sortDir === "desc" ? (
      <ChevronDown size={14} className="text-emerald-700 shrink-0" />
    ) : (
      <ChevronUp size={14} className="text-emerald-700 shrink-0" />
    );
  };

  const thSortable = (colKey: SortKey) =>
    `px-5 py-3 text-left cursor-pointer select-none transition-colors text-sm font-semibold ${
      sortKey === colKey
        ? "bg-emerald-200 text-emerald-800"
        : "text-gray-700 hover:bg-emerald-100"
    }`;

  // ─── Filter ─────────────────────────────────────────────────────────────────
  const filteredArticles = articles.filter((article) => {
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      (article.title ?? "").toLowerCase().includes(query) ||
      (article.excerpt ?? "").toLowerCase().includes(query) ||
      (article.category?.name ?? "").toLowerCase().includes(query);

    const matchesCategory =
      !categoryFilter || article.category?.id === categoryFilter;
    const matchesAuthor = !authorFilter || article.author?.id === authorFilter;
    const matchesStatus = !statusFilter || article.status === statusFilter;

    return matchesSearch && matchesCategory && matchesAuthor && matchesStatus;
  });

  // ─── Sort ───────────────────────────────────────────────────────────────────
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const modifier = sortDir === "asc" ? 1 : -1;

    if (sortKey === "author") {
      return (
        (a.author?.fullName ?? "").localeCompare(b.author?.fullName ?? "") *
        modifier
      );
    }
    if (sortKey === "category") {
      return (
        (a.category?.name ?? "").localeCompare(b.category?.name ?? "") *
        modifier
      );
    }
    if (sortKey === "date") {
      const dateA = new Date(a.publishedAt ?? a.createdAt ?? 0).getTime();
      const dateB = new Date(b.publishedAt ?? b.createdAt ?? 0).getTime();
      return (dateA - dateB) * modifier;
    }

    const valA = a[sortKey];
    const valB = b[sortKey];
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
  }, [search, categoryFilter, authorFilter, statusFilter, perPage]);

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

  // ─── Format tanggal published (relatif kalau baru, absolut kalau lama) ──────
  const formatPublishedDate = (article: ArticleFromAPI) => {
    const raw = article.publishedAt ?? article.createdAt;
    if (!raw) return "-";
    const date = new Date(raw);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Baru saja";
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;

    const datePart = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timePart = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `${datePart} ${timePart}`;
  };

  // ─── Navigasi ke halaman editor ──────────────────────────────────────────
  // 🔥 BARU: dulu klik baris / tombol "Edit" buka modal metadata di halaman
  // ini. Sekarang keduanya redirect ke halaman editor artikel
  // (/admin/artikel/[id]) — modal edit dihapus total dari komponen ini.
  const goToEditor = (articleId: string) => {
    router.push(`/admin/artikel/${articleId}`);
  };

  // ─── Toggle Publish / Unpublish ──────────────────────────────────────────
  const handleTogglePublish = async (article: ArticleFromAPI) => {
    const nextStatus: ArticleStatus =
      article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const formData = new FormData();
      formData.append("status", nextStatus);

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/articles/${article.id}`,
        formData,
        { withCredentials: true },
      );

      setSuccessModal({
        type: "status",
        message:
          nextStatus === "PUBLISHED"
            ? "Artikel berhasil dipublikasikan"
            : "Artikel berhasil di-unpublish",
      });
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
          // 🔥 DIUBAH: backend sekarang soft delete — artikel dipindah ke
          // trash (masih bisa direstore), bukan dihapus permanen.
          message: "Artikel berhasil dipindahkan ke trash",
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

  return (
    <div className="bg-white rounded-xl border overflow-visible mb-20">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "#DDF6EC" }}>
            <th
              className={thSortable("title")}
              onClick={() => handleSort("title")}
            >
              <span className="inline-flex items-center gap-1">
                Article <SortIcon colKey="title" />
              </span>
            </th>
            <th
              className={thSortable("category")}
              onClick={() => handleSort("category")}
            >
              <span className="inline-flex items-center gap-1">
                Category <SortIcon colKey="category" />
              </span>
            </th>
            <th
              className={thSortable("author")}
              onClick={() => handleSort("author")}
            >
              <span className="inline-flex items-center gap-1">
                Author <SortIcon colKey="author" />
              </span>
            </th>
            <th
              className={thSortable("status")}
              onClick={() => handleSort("status")}
            >
              <span className="inline-flex items-center gap-1">
                Status <SortIcon colKey="status" />
              </span>
            </th>
            <th
              className={thSortable("date")}
              onClick={() => handleSort("date")}
            >
              <span className="inline-flex items-center gap-1">
                Published Date <SortIcon colKey="date" />
              </span>
            </th>
            <th className="px-5 py-3 text-center text-gray-700 text-sm font-semibold">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={6}
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
              const roleLabel = getAuthorRoleLabel(article.author?.roles);

              return (
                <tr
                  key={article.id}
                  onClick={() => {
                    if (openMenu || deleteModal) return;
                    goToEditor(article.id);
                  }}
                  className="border-t hover:bg-gray-50 transition cursor-pointer"
                >
                  {/* Article: cover + title */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-11 relative shrink-0">
                        {cover ? (
                          <Image
                            src={cover}
                            alt="cover"
                            fill
                            className="object-cover rounded-md"
                            unoptimized
                          />
                        ) : (
                          <div className="w-14 h-11 rounded-md bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                            No img
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800 line-clamp-2 max-w-[240px]">
                        {article.title}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <CategoryBadge category={article.category} />
                  </td>

                  {/* Author */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <AuthorAvatar author={article.author} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {article.author?.fullName ?? "-"}
                        </p>
                        {roleLabel && (
                          <p className="text-xs text-gray-400">{roleLabel}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={article.status} />
                  </td>

                  {/* Published Date */}
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatPublishedDate(article)}
                  </td>

                  {/* ACTION — 3 aksi: Edit / Publish-Unpublish / Delete */}
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
                            const estimatedMenuHeight = 150;
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
                          className={`absolute right-0 w-36 bg-white border rounded-lg shadow-md z-50 text-sm overflow-hidden ${
                            menuOpenUpward
                              ? "bottom-full mb-2"
                              : "top-full mt-2"
                          }`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              goToEditor(article.id);
                            }}
                            className="block w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              handleTogglePublish(article);
                            }}
                            className="block w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                          >
                            {article.status === "PUBLISHED"
                              ? "Unpublish"
                              : "Publish"}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(null);
                              setDeleteModal({
                                articleId: article.id,
                                title: article.title,
                              });
                            }}
                            className="block w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600"
                          >
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
                colSpan={6}
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
                akan dipindahkan ke trash dan tidak lagi tampil di sini. Artikel
                masih bisa dipulihkan lagi dari trash kalau diperlukan.
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
    </div>
  );
}
