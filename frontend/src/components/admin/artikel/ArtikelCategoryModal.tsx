"use client";

import { useState } from "react";
import { X, Pencil, Trash2, Check, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export interface ArtikelCategoryOption {
  id: string;
  name: string;
  articleCount: number;
}

interface ArtikelCategoryModalProps {
  open: boolean;
  onClose: () => void;
  categories: ArtikelCategoryOption[];
  // Dipanggil setelah create/update/delete sukses, biar parent (ArtikelHeader)
  // refetch daftar kategori dari GET /api/article/categories.
  onChanged: () => void;
}

// ─── Modal "Manage Article Categories" ────────────────────────────────────
// Gantiin list kategori yang dulu di-hardcode di FE — sekarang full CRUD ke
// backend (GET/POST/PATCH/DELETE /api/article/categories).
export default function ArtikelCategoryModal({
  open,
  onClose,
  categories,
  onChanged,
}: ArtikelCategoryModalProps) {
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!open) return null;

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;

    try {
      setCreating(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/categories`,
        { name },
        { withCredentials: true },
      );
      setNewName("");
      onChanged();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Gagal membuat kategori",
      );
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (category: ArtikelCategoryOption) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (id: string) => {
    const name = editingName.trim();
    if (!name) return;

    try {
      setSavingId(id);
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/categories/${id}`,
        { name },
        { withCredentials: true },
      );
      cancelEdit();
      onChanged();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Gagal mengubah kategori",
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (category: ArtikelCategoryOption) => {
    // Kategori yang masih dipakai artikel ditolak backend (409) — dicegat
    // juga di FE biar nggak perlu round-trip kalau udah keliatan dipakai.
    if (category.articleCount > 0) {
      toast.error(
        `Kategori "${category.name}" masih dipakai ${category.articleCount} artikel, pindahkan dulu artikelnya sebelum menghapus.`,
      );
      return;
    }

    try {
      setDeletingId(category.id);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/categories/${category.id}`,
        { withCredentials: true },
      );
      onChanged();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Gagal menghapus kategori",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-[420px] rounded-2xl shadow-2xl p-6">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-800">
            Manage Article Categories
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-5">
          Create, edit, and organize categories for your articles.
        </p>

        {/* Add New Category */}
        <label className="text-sm font-medium text-gray-700">
          Add New Category
        </label>
        <div className="flex gap-2 mt-1.5 mb-5">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Nama kategori"
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60 flex items-center gap-1.5"
          >
            {creating && <Loader2 size={14} className="animate-spin" />}
            Add
          </button>
        </div>

        {/* Category List */}
        <label className="text-sm font-medium text-gray-700">
          Category List
        </label>
        <div className="mt-1.5 space-y-2 max-h-64 overflow-y-auto pr-1">
          {categories.length === 0 && (
            <p className="text-sm text-gray-400 py-3 text-center">
              Belum ada kategori.
            </p>
          )}

          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between border rounded-lg px-3 py-2"
            >
              {editingId === category.id ? (
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(category.id);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  autoFocus
                  className="flex-1 border rounded px-2 py-1 text-sm mr-2 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              ) : (
                <span className="text-sm text-gray-700">{category.name}</span>
              )}

              <div className="flex items-center gap-1.5 shrink-0">
                {editingId === category.id ? (
                  <button
                    onClick={() => handleSaveEdit(category.id)}
                    disabled={savingId === category.id}
                    className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-60"
                  >
                    {savingId === category.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(category)}
                    className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <Pencil size={14} />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(category)}
                  disabled={deletingId === category.id}
                  className="p-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-60"
                >
                  {deletingId === category.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full border border-emerald-500 text-emerald-600 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
