"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FORM_API,
  FormCategory,
  FormType,
  TYPE_LABEL,
  getApiErrorMessage,
} from "./shared";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: FormType;
  onCreated: (category: FormCategory) => void;
}

export default function CreateCategoryModal({
  open,
  onOpenChange,
  type,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset isian setiap modal dibuka
  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
  }, [open]);

  const canSubmit = !submitting && name.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const toastId = toast.loading("Membuat jenis form...");
    try {
      const res = await axios.post(
        `${FORM_API}/categories`,
        {
          type,
          name: name.trim(),
          ...(description.trim() && { description: description.trim() }),
        },
        { withCredentials: true },
      );
      const created: FormCategory = res.data?.data ?? res.data;
      toast.success("Jenis form berhasil dibuat", { id: toastId });
      onOpenChange(false);
      onCreated(created);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Gagal membuat jenis form"), {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex items-start justify-between">
          <DialogTitle>Buat Jenis Baru</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <span className="inline-flex w-fit rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
          {TYPE_LABEL[type]}
        </span>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="category-name"
              className="mb-1.5 block text-xs font-medium text-gray-600"
            >
              Nama jenis
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              maxLength={80}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Contoh: Pendaftaran"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label
              htmlFor="category-desc"
              className="mb-1.5 block text-xs font-medium text-gray-600"
            >
              Deskripsi <span className="text-gray-400">(opsional)</span>
            </label>
            <textarea
              id="category-desc"
              rows={3}
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan kegunaan jenis form ini"
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
