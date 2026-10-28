"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import {
  Archive,
  EyeOff,
  Link2,
  ListChecks,
  MoreHorizontal,
  Pencil,
  Send,
} from "lucide-react";
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
  FormListItem,
  formEditHref,
  formResponsesHref,
  getApiErrorMessage,
} from "./shared";

interface Props {
  form: FormListItem;
  onChanged: () => void;
}

const MENU_WIDTH = 208; // w-52
const ITEM_HEIGHT = 36;

export default function FormRowActions({ form, onChanged }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [busy, setBusy] = useState(false);

  const close = useCallback(() => setPos(null), []);

  const toggle = () => {
    if (pos) return close();
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Perkiraan tinggi menu (maks 6 item) untuk memutuskan buka ke atas/bawah
    const estHeight = 6 * ITEM_HEIGHT + 16;
    const openUp = rect.bottom + estHeight > window.innerHeight;
    setPos({
      top: openUp ? Math.max(8, rect.top - estHeight - 4) : rect.bottom + 4,
      left: Math.max(8, rect.right - MENU_WIDTH),
    });
  };

  // Tutup menu saat klik di luar, scroll, resize, atau Escape
  useEffect(() => {
    if (!pos) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [pos, close]);

  const run = async (
    path: "publish" | "unpublish" | "archive",
    loadingText: string,
    successText: string,
    errorText: string,
  ) => {
    setBusy(true);
    const toastId = toast.loading(loadingText);
    try {
      await axios.post(
        `${FORM_API}/forms/${form.id}/${path}`,
        {},
        { withCredentials: true },
      );
      toast.success(successText, { id: toastId });
      onChanged();
    } catch (err) {
      toast.error(getApiErrorMessage(err, errorText), { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    const toastId = toast.loading("Mengambil link form...");
    try {
      const res = await axios.get(`${FORM_API}/forms/${form.id}/share`, {
        withCredentials: true,
      });
      const url: string | undefined = res.data?.data?.url ?? res.data?.url;
      if (!url) throw new Error("URL tidak ditemukan");
      await navigator.clipboard.writeText(url);
      toast.success("Link form disalin", { id: toastId });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Gagal menyalin link form"), {
        id: toastId,
      });
    }
  };

  const itemClass =
    "flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50";

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        aria-label={`Aksi untuk ${form.title}`}
        aria-haspopup="menu"
        aria-expanded={!!pos}
        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: MENU_WIDTH,
            }}
            className="z-[60] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          >
            <Link
              href={formEditHref(form.id)}
              className={itemClass}
              onClick={close}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Form
            </Link>
            <Link
              href={formResponsesHref(form.id)}
              className={itemClass}
              onClick={close}
            >
              <ListChecks className="h-3.5 w-3.5" />
              Lihat Respons
            </Link>

            {form.status === "DRAFT" && (
              <button
                disabled={busy}
                className={itemClass}
                onClick={() => {
                  close();
                  run(
                    "publish",
                    "Mempublikasikan form...",
                    "Form berhasil dipublikasikan",
                    "Gagal mempublikasikan form",
                  );
                }}
              >
                <Send className="h-3.5 w-3.5" />
                Publikasikan
              </button>
            )}

            {form.status === "PUBLISHED" && (
              <>
                <button
                  className={itemClass}
                  onClick={() => {
                    close();
                    copyLink();
                  }}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Salin Link
                </button>
                <button
                  disabled={busy}
                  className={itemClass}
                  onClick={() => {
                    close();
                    run(
                      "unpublish",
                      "Membatalkan publikasi...",
                      "Publikasi form dibatalkan, form kembali ke Draft",
                      "Gagal membatalkan publikasi",
                    );
                  }}
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  Batalkan Publikasi
                </button>
              </>
            )}

            {form.status !== "ARCHIVED" && (
              <>
                <div className="my-1 border-t border-gray-100" />
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                  onClick={() => {
                    close();
                    setConfirmArchive(true);
                  }}
                >
                  <Archive className="h-3.5 w-3.5" />
                  Arsipkan
                </button>
              </>
            )}
          </div>,
          document.body,
        )}

      <Dialog open={confirmArchive} onOpenChange={setConfirmArchive}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex items-start justify-between">
            <DialogTitle>Arsipkan form ini?</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">{form.title}</span>{" "}
            akan disembunyikan dari daftar dan tidak bisa diakses responder.
            Form yang sudah diarsipkan tidak bisa dipublikasikan lagi.
          </p>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmArchive(false)}>
              Batal
            </Button>
            <Button
              disabled={busy}
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => {
                setConfirmArchive(false);
                run(
                  "archive",
                  "Mengarsipkan form...",
                  "Form berhasil diarsipkan",
                  "Gagal mengarsipkan form",
                );
              }}
            >
              Arsipkan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
