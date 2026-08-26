"use client";

import {
  Search,
  Plus,
  FileText,
  CheckCircle2,
  PenLine,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ARTICLE_CATEGORIES } from "./articleCategories";

export interface ArtikelStatsShape {
  total: number;
  draft: number;
  published: number;
}

export interface ArtikelAuthorOption {
  id: string;
  fullName: string;
}

type StatusFilterValue = "" | "DRAFT" | "PUBLISHED";

interface ArtikelHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  authorFilter: string;
  onAuthorFilterChange: (value: string) => void;
  statusFilter: StatusFilterValue;
  onStatusFilterChange: (value: StatusFilterValue) => void;
  authors: ArtikelAuthorOption[];
  stats: ArtikelStatsShape;
}

// 🔥 BARU: dropdown filter kategori/penulis/status, dibikin komponen kecil
// biar styling-nya (pill bordered + chevron kanan) konsisten di ketiganya
// dan sesuai referensi desain (row filter di kanan search bar).
function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none border border-gray-200 rounded-lg bg-white pl-3.5 pr-9 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

export default function ArtikelHeader({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  authorFilter,
  onAuthorFilterChange,
  statusFilter,
  onStatusFilterChange,
  authors,
  stats,
}: ArtikelHeaderProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  // 🔥 DIUBAH TOTAL: dulu tombol ini buka modal "Buat Artikel Baru" buat
  // isi judul/kategori/status dulu sebelum artikel beneran dibuat.
  // Sekarang klik tombol LANGSUNG bikin artikel baru dengan value default
  // (judul "Artikel Baru", status DRAFT — sisanya default dari backend),
  // begitu ID-nya kebentuk langsung redirect ke halaman editor artikel
  // (/admin/artikel/[id]). Semua detail (judul asli, kategori, cover, dst)
  // dilengkapi di halaman editor itu, bukan lagi lewat modal di sini.
  const handleCreateClick = async () => {
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("title", "Artikel Baru");
      formData.append("status", "DRAFT");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/articles`,
        formData,
        { withCredentials: true },
      );

      const newId = res.data.data?.id;
      if (!newId) throw new Error("ID artikel baru tidak ditemukan");

      router.push(`/admin/artikel/${newId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || err.message || "Gagal membuat artikel",
      );
      setCreating(false);
    }
    // sengaja nggak ada finally { setCreating(false) } di jalur sukses —
    // halaman ini langsung ditinggalkan (redirect), jadi state-nya nggak
    // relevan lagi.
  };

  const statCards = [
    {
      label: "Total Artikel",
      value: stats.total,
      icon: FileText,
      accent: "text-gray-700 bg-gray-100",
    },
    {
      label: "Published",
      value: stats.published,
      icon: CheckCircle2,
      accent: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Draft",
      value: stats.draft,
      icon: PenLine,
      accent: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Title + Create button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Kelola Artikel
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola semua artikel — mulai dari draft sampai publish.
          </p>
        </div>

        <Button
          onClick={handleCreateClick}
          disabled={creating}
          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg disabled:opacity-60"
        >
          <span className="bg-white rounded-full p-1 flex items-center justify-center">
            <Plus size={16} className="text-emerald-600" strokeWidth={3} />
          </span>
          {creating ? "Membuat..." : "Buat Artikel"}
        </Button>
      </div>

      {/* Stats cards — cuma total/published/draft, archived sudah tidak dipakai */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border px-5 py-4 flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.accent}`}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-semibold text-gray-800 leading-tight">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500 truncate">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Cari artikel..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-11 py-2 text-sm bg-white h-auto"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        <div className="flex items-center gap-3">
          <FilterSelect
            value={categoryFilter}
            onChange={onCategoryFilterChange}
          >
            <option value="">Semua Kategori</option>
            {ARTICLE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect value={authorFilter} onChange={onAuthorFilterChange}>
            <option value="">Semua Penulis</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.fullName}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={statusFilter}
            onChange={(value) =>
              onStatusFilterChange(value as StatusFilterValue)
            }
          >
            <option value="">Semua Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </FilterSelect>
        </div>
      </div>
    </div>
  );
}
