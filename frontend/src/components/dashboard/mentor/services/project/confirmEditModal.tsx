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

interface ConfirmEditModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmEditModal({
  open,
  onClose,
  onConfirm,
}: ConfirmEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md text-center px-3 py-8"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-center">
            <Image
              src="/assets/dashboard/mentor/service/greenconfirm.svg"
              alt="Warning Icon"
              width={150}
              height={150}
              className="object-contain"
            />
          </div>
          <DialogHeader className="flex flex-col items-center text-center">
            <DialogTitle className="text-lg font-semibold">
              Simpan Perubahan?
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Apakah Anda ingin menyimpan perubahan ini?
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
              Tidak, Batal
            </Button>
            <Button
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={onConfirm}
            >
              Ya, Simpan Perubahan
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
