"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SuccessModal({ open, onClose }: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogOverlay />
      <DialogContent
        showCloseButton={false}
        className="bg-white rounded-xl shadow-lg w-[350px] p-6 text-center"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Feedback terkirim</DialogTitle>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-emerald-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-semibold">Horray!</h3>
        <p className="text-sm text-gray-600 mt-1">
          Umpan balikmu berhasil disampaikan!
        </p>

        <DialogClose asChild>
          <Button className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white">
            Kembali ke Dashboard
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
