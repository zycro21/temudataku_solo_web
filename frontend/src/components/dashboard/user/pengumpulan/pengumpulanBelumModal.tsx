"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
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
import Image from "next/image";
import { X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface PengumpulanBelumModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  withTrigger?: boolean;
  projectId: string; // penting untuk endpoint
}

export default function PengumpulanBelumModal({
  open,
  setOpen,
  withTrigger = true,
  projectId,
}: PengumpulanBelumModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setUrl("");
      setFiles([]);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (successOpen) {
      timeoutRef.current = setTimeout(() => {
        setSuccessOpen(false);
        router.push("/dashboard/user/pengumpulan");
      }, 5000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [successOpen, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setError("");

    if (!title.trim()) {
      setError("Judul proyek wajib diisi.");
      return;
    }

    if (files.length === 0 && !url.trim()) {
      setError("Wajib upload file atau isi URL proyek.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      if (url) formData.append("projectLink", url);
      files.forEach((file) => formData.append("submissionFile", file));

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      const response = await axios.post(
        `${baseUrl}/api/project/menteeSubmitProjects/${projectId}/submissions`,
        formData,
        {
          withCredentials: true, // kirim cookie otomatis
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        setOpen(false);
        setSuccessOpen(true);

        setTimeout(() => {
          window.location.href = "/dashboard/user/pengumpulan";
        }, 5000);
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Terjadi kesalahan saat mengirim submission.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectNow = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSuccessOpen(false);
    setTimeout(() => {
      router.push("/dashboard/user/pengumpulan");
    }, 50);
  };

  return (
    <>
      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        {withTrigger && (
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white w-full">
              Kumpulkan Project
            </Button>
          </DialogTrigger>
        )}
        <DialogContent
          className="sm:max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Kumpulkan Project</DialogTitle>
          </DialogHeader>

          <div className="border-b border-gray-200 my-1" />

          {/* Form */}
          <div className="flex flex-col gap-6 mt-2">
            {/* Judul */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Judul Project</label>
              <input
                type="text"
                placeholder="Judul"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Media Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Media Upload</label>
              <div className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center py-6 gap-3">
                <Image
                  src="/assets/dashboard/user/cloud.svg"
                  alt="Upload"
                  width={40}
                  height={40}
                  className="text-emerald-500"
                />
                <p className="text-sm text-gray-500 text-center">
                  select your file or drag and drop
                  <br />
                  <span className="text-xs">
                    png, pdf, psd, xls, csv, docx accepted
                  </span>
                </p>

                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    asChild
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 cursor-pointer"
                  >
                    <span>Upload</span>
                  </Button>
                </label>
              </div>

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
                placeholder="Add file URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="mt-6 flex gap-3">
            <DialogClose asChild>
              <Button variant="outline" className="w-1/2">
                Kembali
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white w-1/2"
            >
              {loading ? "Mengirim..." : "Kumpulkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Success */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
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
            Projectmu berhasil dikumpulkan!
          </p>
          <Button
            className="bg-emerald-500 hover:bg-emerald-600 text-white mt-6"
            onClick={handleRedirectNow}
          >
            Kembali ke Dashboard
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
