"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ITEM_TYPE_LABEL,
  importItem,
  type EditorItem,
  type FormDetail,
} from "./editorModel";
import {
  FORM_API,
  getApiErrorMessage,
  useDebouncedValue,
  type FormListItem,
} from "./shared";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Form yang sedang diedit (tidak ditampilkan sebagai sumber) */
  currentFormId: string;
  onImport: (items: EditorItem[]) => void;
}

export default function ImportQuestionsModal({
  open,
  onOpenChange,
  currentFormId,
  onImport,
}: Props) {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim());
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [source, setSource] = useState<FormListItem | null>(null);
  const [detail, setDetail] = useState<FormDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  // Reset setiap modal dibuka
  useEffect(() => {
    if (!open) return;
    setSearch("");
    setSource(null);
    setDetail(null);
    setChecked(new Set());
  }, [open]);

  // Daftar form yang bisa diakses (backend sudah membatasi sesuai hak akses)
  useEffect(() => {
    if (!open || source) return;
    const controller = new AbortController();
    setLoadingList(true);
    setListError(null);
    axios
      .get(`${FORM_API}/forms`, {
        params: {
          search: debounced || undefined,
          limit: 20,
          sortBy: "updatedAt",
          sortOrder: "desc",
        },
        withCredentials: true,
        signal: controller.signal,
      })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setForms(data?.items ?? []);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setForms([]);
        setListError(getApiErrorMessage(err, "Gagal memuat daftar form"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingList(false);
      });
    return () => controller.abort();
  }, [open, source, debounced]);

  const pickSource = async (f: FormListItem) => {
    setSource(f);
    setDetail(null);
    setChecked(new Set());
    setLoadingDetail(true);
    try {
      const res = await axios.get(`${FORM_API}/forms/${f.id}`, {
        withCredentials: true,
      });
      setDetail(res.data?.data ?? res.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Gagal memuat isi form"));
      setSource(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const allItems = useMemo(
    () => (detail ? detail.sections.flatMap((s) => s.items) : []),
    [detail],
  );

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleImport = () => {
    const picked = allItems.filter((it) => checked.has(it.id));
    if (picked.length === 0) return;
    onImport(picked.map(importItem));
    onOpenChange(false);
    toast.success(
      `${picked.length} elemen diimpor. Klik Simpan Draft untuk menyimpan.`,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex items-start justify-between">
          <DialogTitle>Import Question dari Form Lain</DialogTitle>
          <DialogClose />
        </DialogHeader>

        {!source ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul form..."
                aria-label="Cari judul form"
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {loadingList && (
                <div className="flex justify-center py-8 text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
              {!loadingList && listError && (
                <p className="py-8 text-center text-sm text-red-600">
                  {listError}
                </p>
              )}
              {!loadingList &&
                !listError &&
                forms.filter((f) => f.id !== currentFormId).length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-500">
                    Tidak ada form lain yang bisa diimpor.
                  </p>
                )}
              {!loadingList &&
                forms
                  .filter((f) => f.id !== currentFormId)
                  .map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => pickSource(f)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-left hover:border-emerald-300 hover:bg-emerald-50/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-gray-900">
                          {f.title}
                        </span>
                        <span className="block truncate text-xs text-gray-500">
                          {f.type === "EVENT" ? "Form Event" : "Form Non-Event"}
                          {f.eventNameSnapshot
                            ? ` · ${f.eventNameSnapshot}`
                            : ""}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-gray-400">
                        {f.status}
                      </span>
                    </button>
                  ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setSource(null)}
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Pilih form lain
            </button>
            <p className="text-sm font-semibold text-gray-900">
              {source.title}
            </p>

            {loadingDetail && (
              <div className="flex justify-center py-8 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}

            {detail && (
              <>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{checked.size} dipilih</span>
                  <button
                    type="button"
                    onClick={() =>
                      setChecked(
                        checked.size === allItems.length
                          ? new Set()
                          : new Set(allItems.map((i) => i.id)),
                      )
                    }
                    className="font-medium text-emerald-600 hover:underline"
                  >
                    {checked.size === allItems.length
                      ? "Batalkan semua"
                      : "Pilih semua"}
                  </button>
                </div>
                <div className="max-h-72 space-y-3 overflow-y-auto">
                  {detail.sections.map((s, si) => (
                    <div key={s.id}>
                      <p className="mb-1 text-xs font-medium text-emerald-700">
                        Section {si + 1}
                        {s.title ? ` – ${s.title}` : ""}
                      </p>
                      {s.items.length === 0 && (
                        <p className="text-xs text-gray-400">Kosong</p>
                      )}
                      {s.items.map((it) => (
                        <label
                          key={it.id}
                          className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked.has(it.id)}
                            onChange={() => toggle(it.id)}
                            className="mt-0.5 h-4 w-4 accent-emerald-500"
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-sm text-gray-800">
                              {it.title || "(tanpa judul)"}
                            </span>
                            <span className="block text-xs text-gray-500">
                              {ITEM_TYPE_LABEL[it.type]}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-2 flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            disabled={checked.size === 0}
            onClick={handleImport}
            className="bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            Impor {checked.size > 0 ? `${checked.size} elemen` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
