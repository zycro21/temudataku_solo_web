"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface PaymentErrorModalProps {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export default function PaymentErrorModal({
  open,
  onClose,
  onRetry,
}: PaymentErrorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center rounded-2xl">
        <DialogHeader className="flex flex-col items-center gap-4">
          {/* Icon Error */}
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-red-100">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>

          {/* Title & Subtitle */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Oh Snapp!</h2>
            <p className="text-sm text-gray-600">
              Pembayaranmu gagal atau melewati batas waktu.
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={onRetry}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Kembali ke Pembayaran
          </Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
