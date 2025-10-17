"use client";

import { useState } from "react";
import PengumpulanBelumModal from "./pengumpulanBelumModal";
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

type PengumpulanSelesaiModalProps = {
  projectId: string;
  bootcampTitle: string;
  schedule: string;
  projectTitle: string;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  url?: string;
  withTrigger?: boolean;
};

export default function PengumpulanSelesaiModal({
  projectId,
  bootcampTitle,
  schedule,
  projectTitle,
  fileName,
  fileSize,
  fileUrl,
  url,
  withTrigger = true,
}: PengumpulanSelesaiModalProps) {
  const [openSelesai, setOpenSelesai] = useState(false);
  const [openBelum, setOpenBelum] = useState(false);

  return (
    <>
      {/* Modal selesai */}
      <Dialog open={openSelesai} onOpenChange={setOpenSelesai}>
        {withTrigger && (
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white w-full">
              Lihat Project -{" "}
              <span className="text-yellow-500 font-semibold">Selesai</span>
            </Button>
          </DialogTrigger>
        )}

        <DialogContent
          className="sm:max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Lihat Project
            </DialogTitle>
            <p className="text-xs text-gray-500 mt-1">
              {bootcampTitle}: {schedule}
            </p>
          </DialogHeader>

          <div className="border-b border-gray-200 my-1" />

          <div className="flex flex-col gap-6 mt-2">
            {/* Judul Project */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Judul Project</label>
              <input
                type="text"
                value={projectTitle}
                disabled
                className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
              />
            </div>

            {/* Media Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Media Upload</label>
              {fileName ? (
                <div className="border rounded-md p-2 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📄</span>
                    <div className="flex flex-col">
                      <span
                        className="font-medium truncate max-w-[200px] text-gray-800"
                        title={fileName}
                      >
                        {fileName}
                      </span>
                      <span className="text-xs text-gray-500">{fileSize}</span>
                      {fileUrl && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 text-xs mt-1 underline"
                        >
                          Click to view
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Tidak ada file yang diupload
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-500 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Upload via URL */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Upload from URL</label>
              <input
                type="url"
                value={url || ""}
                disabled
                className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="mt-6 flex gap-3">
            <DialogClose asChild>
              <Button variant="outline" className="w-1/2">
                Kembali
              </Button>
            </DialogClose>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white w-1/2"
              onClick={() => {
                setOpenSelesai(false);
                setTimeout(() => setOpenBelum(true), 200);
              }}
            >
              Kumpulkan Ulang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal belum selesai */}
      <PengumpulanBelumModal
        open={openBelum}
        setOpen={setOpenBelum}
        withTrigger={false}
        projectId={projectId}
      />
    </>
  );
}
