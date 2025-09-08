"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface SubmissionData {
  notes: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
}

export default function LihatPengumpulanModal({
  submission,
}: {
  submission?: SubmissionData;
}) {
  if (!submission) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full px-3 py-2 text-sm font-medium rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition">
          Sudah Dikumpulkan - Lihat Detail
        </button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Lihat Pengumpulan</DialogTitle>
        </DialogHeader>

        <div className="border-b border-gray-200 my-1" />

        <div className="space-y-3">
          {/* Notes */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              className="w-full border rounded-md pl-2 pt-2 p-5 text-sm text-gray-400 bg-gray-100 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              rows={5}
              disabled
              defaultValue={submission.notes}
            />
          </div>

          {/* Upload Section */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Upload</label>
            <div className="flex items-center justify-between border rounded-md p-2 bg-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium">{submission.fileName}</p>
                  <p className="text-xs text-gray-500">{submission.fileSize}</p>
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:underline"
                  >
                    Click to view
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              className="w-full border-emerald-500 text-emerald-500 hover:bg-emerald-50"
            >
              Kembali
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
