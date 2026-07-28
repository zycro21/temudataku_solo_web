"use client";

import { AlertTriangle } from "lucide-react";

interface UnsavedChangesModalProps {
  open: boolean;
  isSaving?: boolean;
  onCancel: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

/**
 * Modal peringatan saat user pencet "kembali" tapi ada perubahan
 * yang belum di-save.
 *
 * 3 pilihan:
 * - Cancel        → tetap di halaman edit/create
 * - Discard       → buang perubahan, lanjut keluar (router.back())
 * - Save & Leave  → save dulu, baru keluar
 */
export default function UnsavedChangesModal({
  open,
  isSaving = false,
  onCancel,
  onDiscard,
  onSave,
}: UnsavedChangesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50">
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-gray-800">
              Perubahan belum disimpan
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Kamu punya perubahan yang belum di-save. Simpan dulu sebelum
              kembali, atau perubahan akan hilang.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Menyimpan..." : "Simpan & Kembali"}
          </button>
          <button
            onClick={onDiscard}
            disabled={isSaving}
            className="w-full rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Buang Perubahan & Kembali
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="w-full rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
