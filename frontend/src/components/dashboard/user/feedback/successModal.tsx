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
        onInteractOutside={(e) => e.preventDefault()}
        className="
    bg-white rounded-lg shadow
    w-full max-w-xs
    p-4
    text-center
    overflow-x-hidden
  "
      >
        <DialogTitle className="sr-only">Feedback terkirim</DialogTitle>

        {/* ICON */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-emerald-500"
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

        {/* TEXT */}
        <h3 className="text-sm font-semibold">Horray!</h3>
        <p className="text-xs text-gray-600 mt-1">
          Feedback-mu berhasil disampaikan!
        </p>

        {/* BUTTON */}
        <DialogClose asChild>
          <Button className="mt-4 w-full text-xs py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white">
            Kembali ke Dashboard
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
