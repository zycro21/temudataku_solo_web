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

interface SuccessCardAddReviewProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function SuccessCardAddReviewModal({
  open,
  onClose,
  onConfirm,
}: SuccessCardAddReviewProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md text-center px-3 py-8"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Icon sukses */}
          <div className="flex items-center justify-center">
            <Image
              src="/assets/dashboard/mentor/service/greensuccess.svg"
              alt="Success Icon"
              width={150}
              height={150}
              className="object-contain"
            />
          </div>

          <DialogHeader className="flex flex-col items-center text-center">
            <DialogTitle className="text-lg font-semibold text-emerald-600">
              Review Berhasil Ditambahkan!
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Review proyek telah berhasil disimpan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex w-full">
            <Button
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => {
                onConfirm(); // close modal sukses
                onClose(); // tutup AddReviewModal
                window.location.href = "/dashboard/mentor/services/project";
              }}
            >
              Kembali ke Dashboard
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
