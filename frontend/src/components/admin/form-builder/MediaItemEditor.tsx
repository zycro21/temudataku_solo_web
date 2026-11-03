"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ImageIcon, Loader2, Trash2, Upload, Video } from "lucide-react";
import type { EditorItem, ItemConfig } from "./editorModel";
import { mediaSrc } from "./formTheme";
import { FORM_API, getApiErrorMessage } from "./shared";

interface Props {
  formId: string;
  item: EditorItem; // type IMAGE atau VIDEO
  onChange: (config: ItemConfig) => void;
}

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

const MAX_BYTES = 100 * 1024 * 1024;

export default function MediaItemEditor({ formId, item, onChange }: Props) {
  const isImage = item.type === "IMAGE";
  const cfg = (item.config ?? {}) as Record<string, unknown>;
  const url = typeof cfg.url === "string" ? cfg.url : "";
  const caption = typeof cfg.caption === "string" ? cfg.caption : "";
  const widthPercent =
    typeof cfg.widthPercent === "number" ? cfg.widthPercent : 100;
  const isUploaded = url.startsWith("/uploads/");

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const set = (patch: Record<string, unknown>) =>
    onChange({ ...cfg, ...patch });

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (isImage && !file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (jpg, png, gif, webp)");
      return;
    }
    if (!isImage && !file.type.startsWith("video/")) {
      toast.error("File harus berupa video (mp4, mov, avi, mkv, webm)");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Ukuran file maksimal 100 MB");
      return;
    }
    setUploading(true);
    const toastId = toast.loading("Mengunggah file...");
    try {
      const fd = new FormData();
      fd.append("mediaFile", file);
      const res = await axios.post(`${FORM_API}/forms/${formId}/media`, fd, {
        withCredentials: true,
      });
      const data = res.data?.data ?? res.data;
      set({ url: data.url });
      toast.success("File terunggah. Klik Simpan Draft untuk menyimpan.", {
        id: toastId,
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Gagal mengunggah file"), {
        id: toastId,
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex min-h-32 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
        {url ? (
          isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaSrc(url)}
              alt={caption || "Gambar"}
              style={{ width: `${widthPercent}%` }}
              className="max-h-72 rounded-md object-contain"
            />
          ) : isUploaded ? (
            <video
              src={mediaSrc(url)}
              controls
              className="max-h-72 w-full rounded-md"
            />
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-emerald-600 underline"
            >
              {url}
            </a>
          )
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            {isImage ? (
              <ImageIcon className="h-8 w-8" />
            ) : (
              <Video className="h-8 w-8" />
            )}
            <span className="text-xs">
              {isImage ? "Belum ada gambar" : "Belum ada video"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={isImage ? "image/*" : "video/*"}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {url ? "Ganti file" : "Unggah file"}
        </button>
        {url && (
          <button
            type="button"
            onClick={() => set({ url: undefined })}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus
          </button>
        )}
      </div>

      <input
        type="url"
        value={isUploaded ? "" : url}
        onChange={(e) => set({ url: e.target.value })}
        placeholder={
          isUploaded
            ? "File sudah diunggah (hapus dulu untuk memakai link)"
            : `atau tempel link ${isImage ? "gambar" : "video"} (https://...)`
        }
        disabled={isUploaded}
        aria-label="Link"
        className={fieldClass}
      />

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          type="text"
          value={caption}
          onChange={(e) => set({ caption: e.target.value })}
          placeholder="Keterangan (opsional)"
          aria-label="Keterangan"
          maxLength={300}
          className={fieldClass}
        />
        {isImage && (
          <label className="flex items-center gap-2 text-xs text-gray-600">
            Lebar
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={widthPercent}
              onChange={(e) => set({ widthPercent: Number(e.target.value) })}
              className="accent-emerald-500"
            />
            <span className="w-10 text-right">{widthPercent}%</span>
          </label>
        )}
      </div>
    </div>
  );
}
