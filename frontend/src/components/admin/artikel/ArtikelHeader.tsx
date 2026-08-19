"use client";

import {
  Search,
  Plus,
  FileText,
  CheckCircle2,
  PenLine,
  Archive,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

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

export default function ArtikelHeader({
  search,
  onSearchChange,
  onArticleCreated,
  stats,
}: ArtikelHeaderProps) {
  const [creating, setCreating] = useState(false);

  // 🔥 Sengaja nggak pakai modal form kayak "Create Stream" — klik langsung
  // bikin artikel draft dengan judul default, baru diedit lewat Edit modal
  // di tabel (metadata) atau halaman konten (nanti, belum dibuat).
  const handleCreateDefault = async () => {
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("title", "Artikel Baru");
      formData.append("status", "DRAFT");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/articles`,
        formData,
        { withCredentials: true },
      );

      toast.success("Artikel baru berhasil dibuat");
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
          onClick={handleCreateDefault}
          disabled={creating}
          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg disabled:opacity-60"
        >
          <span className="bg-white rounded-full p-1 flex items-center justify-center">
            <Plus size={16} className="text-emerald-600" strokeWidth={3} />
          </span>
          {creating ? "Membuat..." : "Buat Artikel"}
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
    </div>
  );
}
