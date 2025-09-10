"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";

export default function SuccessWithdrawModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   max-w-sm w-full bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center"
      >
        <VisuallyHidden>
          <DialogTitle>Berhasil</DialogTitle>
        </VisuallyHidden>

        {/* Icon Success pakai Image */}
        <div className="w-24 h-24 mb-3 mt-2 flex items-center justify-center">
          <Image
            src="/assets/dashboard/affiliator/successmodal.svg"
            alt="Success Icon"
            width={180}
            height={180}
          />
        </div>

        <h2 className="text-xl font-bold mb-1 text-gray-800">
          Penarikan Berhasil Diajukan!
        </h2>
        <p className="text-gray-600 mb-6 text-base leading-relaxed">
          Dana kamu sedang diproses. Mohon tunggu 1-3 hari kerja untuk pencairan
        </p>

        <Button
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-8 py-3 text-base font-semibold"
          onClick={onClose}
        >
          Tutup
        </Button>
      </DialogContent>
    </Dialog>
  );
}
