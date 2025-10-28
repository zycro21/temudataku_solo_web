"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SubmitSuccessDialog from "./successSubmit";
import axios from "axios";
import { toast } from "sonner";

interface SubmitPracticeDialogProps {
  practiceId: string;
}

export default function SubmitPracticeDialog({
  practiceId,
}: SubmitPracticeDialogProps) {
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [open, setOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files ? Array.from(e.target.files) : [];
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!practiceId) return alert("Practice ID tidak ditemukan!");
    if (files.length === 0) return alert("Minimal unggah 1 file!");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("practiceId", practiceId);
      if (notes) formData.append("notes", notes);
      files.forEach((file) => formData.append("files", file));

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/practiceSubmissions/practice/submissions`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data?.success) {
        setOpen(false);
        setSuccessOpen(true);
        setNotes("");
        setFiles([]);

        toast.success("Practice berhasil dikumpulkan!");
      } else {
        toast.error(res.data?.message || "Gagal mengirim submission.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Terjadi kesalahan saat mengirim submission.", {
        description: err.response?.data?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            Kumpulkan
          </Button>
        </DialogTrigger>

        <DialogContent
          className="sm:max-w-lg p-6"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Kumpulkan Practice
            </DialogTitle>
          </DialogHeader>

          <div className="border-b border-gray-200 my-1" />

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keterangan tambahan"
              className="w-full border rounded-md pl-2 pt-2 p-5 text-sm bg-gray-100 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              rows={5}
            />
          </div>

          {/* Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Upload</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 text-center">
              <Image
                src="/assets/dashboard/user/cloud.svg"
                alt="Upload"
                width={40}
                height={40}
              />
              <p className="text-sm text-gray-500 mb-2">
                Pilih file atau seret di sini <br />
                <span className="text-xs text-gray-400">
                  png, pdf, jpg, xls, csv, docx
                </span>
              </p>
              <input
                type="file"
                className="hidden"
                id="file-upload"
                multiple
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="px-4 py-2 bg-emerald-500 text-white rounded-md cursor-pointer hover:bg-emerald-600 transition"
              >
                Upload
              </label>
            </div>

            {/* Preview list */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="border rounded-md p-2 flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">📄</span>
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[150px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <a
                          href={URL.createObjectURL(file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 text-xs mt-1 underline"
                        >
                          Click to view
                        </a>
                      </div>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="ml-3 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Hapus file</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="flex justify-between mt-6 px-6 gap-3">
            <DialogClose asChild>
              <Button variant="outline" className="w-1/2">
                Kembali
              </Button>
            </DialogClose>
            <Button
              className="w-1/2 bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" /> Mengirim...
                </>
              ) : (
                "Kumpulkan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <SubmitSuccessDialog open={successOpen} onOpenChange={setSuccessOpen} />
    </>
  );
}
