"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface DiscardChangesModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DiscardChangesModal({
  open,
  onClose,
  onConfirm,
}: DiscardChangesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md text-center px-3 py-8" // padding atas bawah lebih lebar
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-6">
          {/* gap lebih besar */}
          {/* Icon peringatan pakai image lokal */}
          <div className="flex items-center justify-center">
            <Image
              src="/assets/dashboard/mentor/service/redwarning.svg"
              alt="Warning Icon"
              width={150}
              height={150}
              className="object-contain"
            />
          </div>
          <DialogHeader className="flex flex-col items-center text-center">
            <DialogTitle className="text-lg font-semibold">
              Buang Perubahan?
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Apakah Anda yakin ingin menutup tanpa menyimpan?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-3 mt-2 w-full">
            {" "}
            {/* tombol full width */}
            <Button
              variant="outline"
              className="flex-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
              onClick={onClose}
            >
              Tidak, Lanjutkan
            </Button>
            <Button
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={onConfirm}
            >
              Ya, Buang Perubahan
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
