"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SuccessModal({ open, onClose }: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center rounded-2xl p-6">
        <DialogHeader className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <div className="w-24 h-24 flex items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>

          {/* Judul */}
          <h2 className="text-xl font-semibold">Horray!</h2>

          {/* Deskripsi */}
          <p className="text-sm text-gray-600">
            Pembayaranmu berhasil!
          </p>
        </DialogHeader>

        {/* Tombol */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={onClose}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
