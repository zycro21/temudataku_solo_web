"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ImagePlus, Loader2, RotateCcw, Trash2 } from "lucide-react";
import type { FormSettings } from "./editorModel";
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_THEME_COLOR,
  FONT_PRESETS,
  fontStack,
} from "./formTheme";
import { FORM_API, getApiErrorMessage, resolveImageUrl } from "./shared";

interface Props {
  formId: string;
  settings: FormSettings;
  disabled: boolean;
  onChange: (patch: Partial<FormSettings>) => void;
  /** Header image langsung tersimpan di server, jadi tidak lewat "Simpan Draft" */
  onHeaderImage: (path: string | null) => void;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

function ColorField({
  label,
  value,
  fallback,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  fallback: string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  const valid = HEX.test(value);
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={valid ? value : fallback}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="h-9 w-12 cursor-pointer rounded-lg border border-gray-200 bg-white p-1 disabled:cursor-not-allowed"
        />
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fallback}
          maxLength={7}
          aria-label={`${label} (hex)`}
          className={`w-28 rounded-lg border px-3 py-2 font-mono text-sm text-gray-700 focus:outline-none focus:ring-1 ${
            value && !valid
              ? "border-red-300 focus:border-red-400 focus:ring-red-400"
              : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
          }`}
        />
        <button
          type="button"
          disabled={disabled || !value}
          onClick={() => onChange("")}
          aria-label={`Kembalikan ${label} ke default`}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
      {value && !valid && (
        <p className="mt-1 text-xs text-red-600">
          Format hex 6 digit, contoh #10B981
        </p>
      )}
    </div>
  );
}

export default function AppearanceTab({
  formId,
  settings,
  disabled,
  onChange,
  onHeaderImage,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const theme = HEX.test(settings.themeColor)
    ? settings.themeColor
    : DEFAULT_THEME_COLOR;
  const bg = HEX.test(settings.backgroundColor)
    ? settings.backgroundColor
    : DEFAULT_BACKGROUND_COLOR;
  const headerSrc = resolveImageUrl(settings.headerImage);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      toast.error("Header image harus jpg, png, atau webp");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Ukuran header image maksimal 5 MB");
      return;
    }
    setBusy(true);
    const toastId = toast.loading("Mengunggah header image...");
    try {
      const fd = new FormData();
      fd.append("headerImage", file);
      const res = await axios.put(
        `${FORM_API}/forms/${formId}/header-image`,
        fd,
        { withCredentials: true },
      );
      const data = res.data?.data ?? res.data;
      onHeaderImage(data.headerImage ?? null);
      toast.success("Header image tersimpan", { id: toastId });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Gagal mengunggah header image"), {
        id: toastId,
      });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async () => {
    setBusy(true);
    const toastId = toast.loading("Menghapus header image...");
    try {
      await axios.delete(`${FORM_API}/forms/${formId}/header-image`, {
        withCredentials: true,
      });
      onHeaderImage(null);
      toast.success("Header image dihapus", { id: toastId });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Gagal menghapus header image"), {
        id: toastId,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4">
        {/* Header image */}
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900">Header Image</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Tampil di bagian atas form. Format jpg, png, atau webp, maksimal 5
            MB. Perubahan header image langsung tersimpan.
          </p>
          <div className="mt-3 flex min-h-28 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
            {headerSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={headerSrc}
                alt="Header form"
                className="max-h-48 w-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-400">
                Belum ada header image
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => upload(e.target.files?.[0])}
            />
            <button
              type="button"
              disabled={disabled || busy}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" />
              )}
              {settings.headerImage ? "Ganti gambar" : "Unggah gambar"}
            </button>
            {settings.headerImage && (
              <button
                type="button"
                disabled={disabled || busy}
                onClick={remove}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus
              </button>
            )}
          </div>
        </section>

        {/* Warna & font */}
        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Warna & Tipografi
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              label="Warna tema"
              value={settings.themeColor}
              fallback={DEFAULT_THEME_COLOR}
              disabled={disabled}
              onChange={(v) => onChange({ themeColor: v })}
            />
            <ColorField
              label="Warna latar"
              value={settings.backgroundColor}
              fallback={DEFAULT_BACKGROUND_COLOR}
              disabled={disabled}
              onChange={(v) => onChange({ backgroundColor: v })}
            />
          </div>
          <div>
            <label
              htmlFor="font-preset"
              className="mb-1.5 block text-xs font-medium text-gray-600"
            >
              Gaya font
            </label>
            <select
              id="font-preset"
              value={settings.fontPreset || "sans"}
              disabled={disabled}
              onChange={(e) =>
                onChange({
                  fontPreset: e.target.value === "sans" ? "" : e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-72"
            >
              {FONT_PRESETS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </section>
      </div>

      {/* Pratinjau tema */}
      <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4 xl:sticky xl:top-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Pratinjau</h2>
        <div
          className="overflow-hidden rounded-lg border border-gray-200 p-3"
          style={{
            backgroundColor: bg,
            fontFamily: fontStack(settings.fontPreset),
          }}
        >
          <div
            className="overflow-hidden rounded-lg bg-white shadow-sm"
            style={{ borderTop: `4px solid ${theme}` }}
          >
            {headerSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={headerSrc}
                alt=""
                className="h-16 w-full object-cover"
              />
            )}
            <div className="space-y-2 p-3">
              <p className="text-base font-bold text-gray-900">
                {settings.title || "Judul form"}
              </p>
              <p className="text-xs text-gray-500">
                Contoh pertanyaan dan tombol akan memakai tema ini.
              </p>
              <button
                type="button"
                tabIndex={-1}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: theme }}
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
