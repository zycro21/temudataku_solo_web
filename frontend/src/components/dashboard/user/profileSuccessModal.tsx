"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SuccessModal({
  open,
  onOpenChange,
}: SuccessModalProps) {
  const router = useRouter();

  const handleBack = () => {
    onOpenChange(false);
    router.push("/dashboard/user");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-sm w-full max-h-[85vh] overflow-y-auto my-6 px-5 py-6 flex flex-col items-center justify-center text-center"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Success</DialogTitle>

        {/* Icon Success */}
        <CheckCircle className="w-14 h-14 text-emerald-500 mb-3" />

        {/* Teks */}
        <h2 className="text-base font-semibold">Horray!</h2>
        <p className="text-xs text-gray-600 mt-1 leading-relaxed max-w-[260px]">
          Akun berhasil diperbarui, silakan refresh website Anda.
        </p>

        {/* Tombol */}
        <Button
          onClick={handleBack}
          size="sm"
          className="mt-4 px-4 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          Kembali ke Dashboard
        </Button>
      </DialogContent>
    </Dialog>
  );
}
