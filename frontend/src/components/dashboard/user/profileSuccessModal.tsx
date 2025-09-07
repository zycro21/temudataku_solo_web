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
        className="sm:max-w-md flex flex-col items-center justify-center text-center py-8"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Tambahkan DialogTitle untuk aksesibilitas */}
        <DialogTitle className="sr-only">Success</DialogTitle>

        {/* Icon Success */}
        <CheckCircle className="w-20 h-20 text-emerald-500 mb-4" />

        {/* Teks */}
        <h2 className="text-lg font-bold">Horray!</h2>
        <p className="text-sm text-gray-600">Akun berhasil diperbarui</p>

        {/* Tombol */}
        <Button
          onClick={handleBack}
          className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          Kembali ke Dashboard
        </Button>
      </DialogContent>
    </Dialog>
  );
}
