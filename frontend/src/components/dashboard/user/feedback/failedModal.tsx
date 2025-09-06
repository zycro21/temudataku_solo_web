"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";

interface FailedModalProps {
  open: boolean;
  onClose: () => void; // dipanggil saat modal ditutup
  onRetry?: () => void; // dipanggil saat user pilih "Tambah Umpan Balik"
}

export default function FailedModal({
  open,
  onClose,
  onRetry,
}: FailedModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogOverlay />

      <DialogContent
        showCloseButton={false}
        className="bg-white rounded-xl shadow-lg w-[350px] p-6 text-center"
      >
        {/* Wajib untuk aksesibilitas Radix, disembunyikan agar tampilan tidak berubah */}
        <DialogTitle className="sr-only">Feedback gagal dikirim</DialogTitle>

        {/* Icon merah */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <circle cx="12" cy="17" r="1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Judul & pesan */}
        <h3 className="text-lg font-semibold">Oops!</h3>
        <p className="text-sm text-gray-600 mt-1">
          Umpan balikmu gagal disampaikan!
        </p>

        {/* Tombol aksi */}
        <div className="mt-6 flex gap-3 justify-center">
          {/* Tombol ini menutup dialog (DialogClose) — onOpenChange akan memicu onClose */}
          <DialogClose asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Kembali ke Dashboard
            </Button>
          </DialogClose>

          {/* Tombol retry: panggil onRetry (jika ada) lalu minta parent menutup modal lewat onClose */}
          <Button
            variant="outline"
            onClick={() => {
              onRetry?.();
              onClose();
            }}
            className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          >
            Tambah Umpan Balik
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
