"use client";

import {
  Search,
  Plus,
  FileText,
  CheckCircle2,
  PenLine,
  Archive,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ARTICLE_CATEGORIES } from "./articleCategories";

export interface ArtikelStatsShape {
  total: number;
  draft: number;
  published: number;
  archived: number;
}

interface ArtikelHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onArticleCreated?: () => void;
  stats: ArtikelStatsShape;
}

type CreateStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export default function ArtikelHeader({
  search,
  onSearchChange,
  onArticleCreated,
  stats,
}: ArtikelHeaderProps) {
  const [creating, setCreating] = useState(false);

  // 🔥 DIUBAH TOTAL: dulu klik tombol "Buat Artikel" LANGSUNG bikin artikel
  // ke backend dengan judul default ("Artikel Baru") — alurnya kerasa aneh
  // karena artikel muncul begitu saja di tabel sebelum admin sempat isi
  // apa-apa, baru diedit belakangan. Sekarang klik tombol cuma BUKA MODAL
  // dulu (admin isi judul minimal + opsional kategori/status), baru submit
  // di modal ini yang benar-benar bikin artikelnya.
  const [createModal, setCreateModal] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createCategory, setCreateCategory] = useState("");
  // 🔥 BARU: default status artikel baru sekarang ARCHIVED (bukan DRAFT
  // lagi) — permintaan eksplisit biar artikel yang baru dibuat nggak
  // otomatis nongol di daftar draft/published sebelum benar-benar siap.
  const [createStatus, setCreateStatus] = useState<CreateStatus>("ARCHIVED");

  const openCreateModal = () => {
    setCreateTitle("");
    setCreateCategory("");
    setCreateStatus("ARCHIVED");
    setCreateModal(true);
    setTimeout(() => setCreateVisible(true), 10);
  };

  const closeCreateModal = () => {
    if (creating) return;
    setCreateVisible(false);
    setTimeout(() => setCreateModal(false), 250);
  };

  const handleCreateSubmit = async () => {
    if (!createTitle.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }

    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("title", createTitle.trim());
      if (createCategory.trim()) {
        formData.append("category", createCategory.trim());
      }
      formData.append("status", createStatus);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/articles`,
        formData,
        { withCredentials: true },
      );

      toast.success("Artikel baru berhasil dibuat");
      setCreateVisible(false);
      setTimeout(() => setCreateModal(false), 250);
      onArticleCreated?.();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || err.message || "Gagal membuat artikel",
      );
    } finally {
      setCreating(false);
    }
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
    {
      label: "Archived",
      value: stats.archived,
      icon: Archive,
      accent: "text-gray-500 bg-gray-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title + Create button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Artikel</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola semua artikel — mulai dari draft, publish, sampai arsip.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg disabled:opacity-60"
        >
          <span className="bg-white rounded-full p-1 flex items-center justify-center">
            <Plus size={16} className="text-emerald-600" strokeWidth={3} />
          </span>
          Buat Artikel
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Search */}
      <div className="relative w-[28rem]">
        <Input
          placeholder="Cari artikel..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11 py-2 text-sm bg-white h-auto"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* 🔥 BARU: modal "Buat Artikel Baru" — dibuka dari tombol di atas.
          Detail lain (ringkasan, tags, cover) sengaja tidak dimasukkan di
          sini biar modal ini cepat & fokus; itu semua bisa dilengkapi lewat
          "Edit Data" di tabel setelah artikel dibuat. */}
      {createModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
            createVisible
              ? "bg-black/60 backdrop-blur-sm opacity-100"
              : "bg-black/0 opacity-0"
          }`}
        >
          <div
            className={`bg-white w-[440px] rounded-2xl shadow-2xl flex flex-col transform transition-all duration-300 ${
              createVisible
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Buat Artikel Baru
              </h2>
              <button
                onClick={closeCreateModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Judul artikel"
                  autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <p className="mt-1.5 text-[11px] text-gray-400">
                  Ringkasan, tags, dan cover bisa dilengkapi lewat "Edit Data"
                  di tabel setelah artikel ini dibuat.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kategori
                </label>
                {/* 🔥 DIUBAH: dulu input teks bebas — sekarang dropdown dari
                    daftar kategori tetap (lihat articleCategories.ts) biar
                    penulisan kategori konsisten di semua artikel, nggak ada
                    variasi ketikan yang beda-beda untuk kategori yang sama. */}
                <select
                  value={createCategory}
                  onChange={(e) => setCreateCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="">Tanpa kategori</option>
                  {ARTICLE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  value={createStatus}
                  onChange={(e) =>
                    setCreateStatus(e.target.value as CreateStatus)
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="ARCHIVED">Archived</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={closeCreateModal}
                disabled={creating}
                className="flex-1 border border-emerald-500 text-emerald-600 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={handleCreateSubmit}
                disabled={creating}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {creating ? "Membuat..." : "Buat Artikel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
