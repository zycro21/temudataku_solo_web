// components/dashboard/user/pengumpulan/pengumpulanBelumModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function PengumpulanBelumModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white w-full">
          Kumpulkan Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kumpulkan Project</DialogTitle>
        </DialogHeader>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Judul */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Judul Project</label>
            <input
              type="text"
              placeholder="Judul"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Media Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Media Upload</label>
            <div className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center py-6 gap-3">
              <Upload className="w-8 h-8 text-emerald-500" />
              <p className="text-sm text-gray-500 text-center">
                select your file or drag and drop
                <br />
                <span className="text-xs">
                  png, pdf, psd, xls, csv, docx accepted
                </span>
              </p>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2">
                Upload
              </Button>
            </div>
          </div>

          {/* Upload via URL */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Upload from URL</label>
            <input
              type="url"
              placeholder="Add file URL"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="mt-4 flex justify-between gap-3">
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              Kembali
            </Button>
          </DialogClose>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white w-full">
            Kumpulkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
