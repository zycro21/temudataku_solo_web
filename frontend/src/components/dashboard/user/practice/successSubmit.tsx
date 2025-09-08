"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useRouter } from "next/navigation";

interface SubmitSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubmitSuccessDialog({
  open,
  onOpenChange,
}: SubmitSuccessDialogProps) {
  const router = useRouter();

  const handleRedirectNow = () => {
    onOpenChange(false);
    router.push("/dashboard/user/practice");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md flex flex-col items-center justify-center text-center py-10"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Success</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>

        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-lg font-semibold mt-6">Horray!</h2>
        <p className="text-sm text-gray-600">
          Practicemu berhasil dikumpulkan!
        </p>

        <Button
          className="bg-emerald-500 hover:bg-emerald-600 text-white mt-6"
          onClick={handleRedirectNow}
        >
          Kembali ke Dashboard
        </Button>
      </DialogContent>
    </Dialog>
  );
}
