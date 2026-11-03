"use client";

import { useRef, useState } from "react";
import { Paperclip, Upload, X } from "lucide-react";
import { mediaSrc } from "@/components/admin/form-builder/formTheme";

// ─── Tipe data (sesuai GET /api/formpublic/forms/:slug) ─────────────────────

export type ItemType =
  | "SHORT_ANSWER"
  | "PARAGRAPH"
  | "MULTIPLE_CHOICE"
  | "CHECKBOXES"
  | "DROPDOWN"
  | "FILE_UPLOAD"
  | "LINEAR_SCALE"
  | "RATING"
  | "MULTIPLE_CHOICE_GRID"
  | "CHECKBOX_GRID"
  | "DATE"
  | "TIME_DURATION"
  | "TITLE_DESCRIPTION"
  | "IMAGE"
  | "VIDEO";

export type NavAction = "NEXT" | "GO_TO_SECTION" | "SUBMIT";

export interface ValidationRule {
  kind: "number" | "text" | "length" | "regex" | "selectCount";
  op: string;
  min?: number;
  max?: number;
  value?: number | string;
  message?: string;
}

export interface PublicOption {
  id: string;
  kind: "CHOICE" | "GRID_ROW" | "GRID_COLUMN";
  label: string;
  branchAction: NavAction;
  branchSectionId: string | null;
}

export interface PublicItem {
  id: string;
  type: ItemType;
  title: string | null;
  description: string | null;
  isRequired: boolean;
  shuffleOptions: boolean;
  validation: ValidationRule | null;
  config: Record<string, unknown> | null;
  options: PublicOption[];
}

// File yang sudah tersimpan di server (mode edit)
export interface ExistingFile {
  id: string;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number;
}

// Jawaban pertanyaan File Upload: file baru + file lama yang dipertahankan
export interface FileValue {
  files: File[];
  keep: ExistingFile[];
}

// Bentuk nilai per tipe:
//  teks / tanggal / waktu / pilihan tunggal -> string
//  linear scale / rating                    -> number
//  checkboxes                               -> string[] (id opsi)
//  grid                                     -> Record<rowId, columnId[]>
//  file upload                              -> FileValue
export type FieldValue =
  | string
  | number
  | string[]
  | Record<string, string[]>
  | FileValue;

export const isFileValue = (v: unknown): v is FileValue =>
  !!v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  "files" in v &&
  "keep" in v;

const CONTENT_TYPES: ItemType[] = ["TITLE_DESCRIPTION", "IMAGE", "VIDEO"];
export const isAnswerable = (t: ItemType) => !CONTENT_TYPES.includes(t);

// ─── Helper tampilan ────────────────────────────────────────────────────────

const FILE_ACCEPT: Record<string, string[]> = {
  image: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
  pdf: [".pdf"],
  document: [".doc", ".docx", ".txt", ".rtf", ".odt"],
  spreadsheet: [".xls", ".xlsx", ".csv", ".ods"],
  presentation: [".ppt", ".pptx", ".odp"],
  video: [".mp4", ".mov", ".avi", ".mkv", ".webm"],
  audio: [".mp3", ".wav", ".m4a", ".ogg"],
  archive: [".zip", ".rar", ".7z"],
};

const FILE_LABEL: Record<string, string> = {
  image: "Gambar",
  pdf: "PDF",
  document: "Dokumen",
  spreadsheet: "Spreadsheet",
  presentation: "Presentasi",
  video: "Video",
  audio: "Audio",
  archive: "Arsip",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Link YouTube / Vimeo diubah ke URL embed; selain itu null
function toEmbedUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      const m = /^\/(embed|shorts|live)\/([\w-]+)/.exec(u.pathname);
      return m ? `https://www.youtube.com/embed/${m[2]}` : null;
    }
    if (host === "vimeo.com") {
      const m = /^\/(\d+)/.exec(u.pathname);
      return m ? `https://player.vimeo.com/video/${m[1]}` : null;
    }
  } catch {
    /* bukan URL valid */
  }
  return null;
}

const inputBase =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:bg-gray-50 sm:text-sm";

// ─── Input per tipe ─────────────────────────────────────────────────────────

function RatingInput({
  max,
  value,
  onChange,
  disabled,
}: {
  max: number;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;
  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      className="flex flex-wrap items-center gap-1"
      onMouseLeave={() => setHover(null)}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} bintang`}
          disabled={disabled}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(value === n ? undefined : n)}
          className="text-3xl leading-none transition-transform hover:scale-110 disabled:opacity-50"
          style={{ color: n <= shown ? "#f59e0b" : "#d1d5db" }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function DurationInput({
  value,
  onChange,
  disabled,
  ring,
  hasError,
}: {
  value: string;
  onChange: (v: string | undefined) => void;
  disabled?: boolean;
  ring: React.CSSProperties;
  hasError: boolean;
}) {
  // State lokal supaya pengguna bisa mengetik sebagian (mis. hanya menit)
  const initial = /^(\d+):(\d{2})(?::(\d{2}))?$/.exec(value);
  const [parts, setParts] = useState<[string, string, string]>(
    initial
      ? [
          String(Number(initial[1])),
          String(Number(initial[2])),
          String(Number(initial[3] ?? 0)),
        ]
      : ["", "", ""],
  );

  const update = (idx: 0 | 1 | 2, raw: string) => {
    const max = idx === 0 ? 999 : 59;
    const digits = raw.replace(/\D/g, "").slice(0, idx === 0 ? 3 : 2);
    const clamped = digits === "" ? "" : String(Math.min(max, Number(digits)));
    const next = [...parts] as [string, string, string];
    next[idx] = clamped;
    setParts(next);
    if (next.every((p) => p === "")) return onChange(undefined);
    const pad = (s: string) => (s === "" ? "00" : s.padStart(2, "0"));
    onChange(`${pad(next[0])}:${pad(next[1])}:${pad(next[2])}`);
  };

  const labels = ["Jam", "Menit", "Detik"];
  return (
    <div className="flex max-w-xs items-end gap-2">
      {labels.map((label, i) => (
        <label
          key={label}
          className="min-w-0 flex-1 text-xs text-gray-500 sm:w-20 sm:flex-none"
        >
          {label}
          <input
            type="text"
            inputMode="numeric"
            value={parts[i]}
            disabled={disabled}
            placeholder="0"
            onChange={(e) => update(i as 0 | 1 | 2, e.target.value)}
            className={`${inputBase} mt-1 text-center ${
              hasError ? "border-red-400" : "border-gray-300"
            }`}
            style={ring}
          />
        </label>
      ))}
    </div>
  );
}

function FileInput({
  item,
  value,
  onChange,
  disabled,
  accent,
  draftNote,
}: {
  item: PublicItem;
  value: FileValue;
  onChange: (v: FileValue | undefined) => void;
  disabled?: boolean;
  accent: string;
  draftNote?: boolean;
}) {
  const cfg = item.config ?? {};
  const maxFiles = Math.max(1, Number(cfg.maxFiles ?? 1));
  const maxMb = Number(cfg.maxSizeMb ?? 10);
  const groups = Array.isArray(cfg.allowedTypes)
    ? (cfg.allowedTypes as string[])
    : [];
  const accept = groups.flatMap((g) => FILE_ACCEPT[g] ?? []).join(",");
  const typeLabel = groups.map((g) => FILE_LABEL[g] ?? g).join(", ");

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const total = value.files.length + value.keep.length;

  const addFiles = (list: FileList | File[]) => {
    const picked = Array.from(list);
    if (picked.length === 0) return;
    setLocalError(null);

    const tooBig = picked.find((f) => f.size > maxMb * 1024 * 1024);
    if (tooBig) {
      setLocalError(`"${tooBig.name}" melebihi ${maxMb} MB`);
      return;
    }

    // Batas 1 file: pilihan baru menggantikan yang lama
    if (maxFiles === 1) {
      onChange({ files: [picked[0]], keep: [] });
      return;
    }
    if (total + picked.length > maxFiles) {
      setLocalError(`Maksimal ${maxFiles} file`);
      return;
    }
    onChange({ files: [...value.files, ...picked], keep: value.keep });
  };

  const removeNew = (idx: number) => {
    setLocalError(null);
    const files = value.files.filter((_, i) => i !== idx);
    onChange(
      files.length || value.keep.length
        ? { files, keep: value.keep }
        : undefined,
    );
  };
  const removeKept = (id: string) => {
    setLocalError(null);
    const keep = value.keep.filter((f) => f.id !== id);
    onChange(
      value.files.length || keep.length
        ? { files: value.files, keep }
        : undefined,
    );
  };

  const rows = [
    ...value.keep.map((f) => ({
      key: `keep-${f.id}`,
      name: f.originalName,
      size: f.sizeBytes,
      note: "Sudah terunggah",
      remove: () => removeKept(f.id),
    })),
    ...value.files.map((f, i) => ({
      key: `new-${i}-${f.name}`,
      name: f.name,
      size: f.size,
      note: "",
      remove: () => removeNew(i),
    })),
  ];

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) addFiles(e.dataTransfer.files);
        }}
        className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors"
        style={{
          borderColor: dragging ? accent : "#d1d5db",
          backgroundColor: dragging ? `${accent}10` : "transparent",
        }}
      >
        <Upload className="h-5 w-5 text-gray-400" />
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
          style={{ borderColor: accent, color: accent }}
        >
          {maxFiles === 1 && total > 0 ? "Ganti file" : "Pilih file"}
        </button>
        <p className="text-xs text-gray-500">
          atau seret file ke sini. Maks. {maxFiles} file, {maxMb} MB per file
          {typeLabel ? `. Tipe: ${typeLabel}` : ""}.
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={maxFiles > 1}
          accept={accept || undefined}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {rows.length > 0 && (
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <li
              key={r.key}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
            >
              <span className="flex min-w-0 items-center gap-2 text-sm text-gray-700">
                <Paperclip className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate">{r.name}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatBytes(r.size)}
                  {r.note ? ` · ${r.note}` : ""}
                </span>
              </span>
              <button
                type="button"
                onClick={r.remove}
                disabled={disabled}
                aria-label={`Hapus ${r.name}`}
                className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {localError && <p className="text-xs text-red-600">{localError}</p>}
      {draftNote && (
        <p className="text-xs text-gray-400">
          File tidak ikut tersimpan di draft otomatis. Pilih ulang file jika
          kamu melanjutkan dari draft.
        </p>
      )}
    </div>
  );
}

function GridInput({
  item,
  value,
  onChange,
  disabled,
  accent,
  hasError,
}: {
  item: PublicItem;
  value: Record<string, string[]>;
  onChange: (v: Record<string, string[]> | undefined) => void;
  disabled?: boolean;
  accent: string;
  hasError: boolean;
}) {
  const rows = item.options.filter((o) => o.kind === "GRID_ROW");
  const cols = item.options.filter((o) => o.kind === "GRID_COLUMN");
  const single = item.type === "MULTIPLE_CHOICE_GRID";
  const onePerCol = single && item.config?.oneResponsePerColumn === true;

  const clean = (next: Record<string, string[]>) => {
    const filtered = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v.length > 0),
    );
    onChange(Object.keys(filtered).length ? filtered : undefined);
  };

  const toggle = (rowId: string, colId: string) => {
    const cur = value[rowId] ?? [];
    let next: Record<string, string[]>;
    if (single) {
      next = { ...value };
      if (onePerCol) {
        // Satu kolom hanya boleh dipakai satu baris
        for (const r of Object.keys(next)) {
          if (r !== rowId) next[r] = (next[r] ?? []).filter((c) => c !== colId);
        }
      }
      next[rowId] = cur.includes(colId) ? [] : [colId];
    } else {
      next = {
        ...value,
        [rowId]: cur.includes(colId)
          ? cur.filter((c) => c !== colId)
          : [...cur, colId],
      };
    }
    clean(next);
  };

  return (
    <div
      className={`overflow-x-auto rounded-lg border ${
        hasError ? "border-red-300" : "border-gray-200"
      }`}
    >
      <table className="w-full min-w-[28rem] text-sm text-gray-700">
        <thead>
          <tr className="bg-gray-50">
            <th className="sticky left-0 bg-gray-50 px-3 py-2 sm:static" />
            {cols.map((c) => (
              <th
                key={c.id}
                className="px-2 py-2 text-center text-xs font-medium text-gray-500"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-gray-100">
              <td className="sticky left-0 z-[1] min-w-[7rem] bg-white px-3 py-2.5 sm:static sm:min-w-0 sm:bg-transparent">
                {r.label}
              </td>
              {cols.map((c) => (
                <td key={c.id} className="px-2 py-2.5 text-center">
                  <input
                    type={single ? "radio" : "checkbox"}
                    name={`${item.id}-${r.id}`}
                    aria-label={`${r.label}: ${c.label}`}
                    checked={(value[r.id] ?? []).includes(c.id)}
                    disabled={disabled}
                    onChange={() => toggle(r.id, c.id)}
                    onClick={() => {
                      // Radio tidak memicu onChange saat diklik ulang: izinkan batal pilih
                      if (single && (value[r.id] ?? []).includes(c.id)) {
                        toggle(r.id, c.id);
                      }
                    }}
                    style={{ accentColor: accent }}
                    className="h-5 w-5 sm:h-4 sm:w-4"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Komponen utama ─────────────────────────────────────────────────────────

interface Props {
  item: PublicItem;
  value: FieldValue | undefined;
  error?: string;
  accent: string;
  disabled?: boolean;
  onChange: (v: FieldValue | undefined) => void;
  /** Tampilkan catatan bahwa file tidak ikut draft otomatis */
  draftNote?: boolean;
}

// Satu blok di halaman: pertanyaan (label + input + error) atau elemen konten
export default function QuestionField({
  item,
  value,
  error,
  accent,
  disabled,
  onChange,
  draftNote,
}: Props) {
  const cfg = (item.config ?? {}) as Record<string, unknown>;
  const ring = { "--tw-ring-color": accent } as React.CSSProperties;
  const borderClass = error ? "border-red-400" : "border-gray-300";
  const fieldClass = `${inputBase} ${borderClass}`;
  const choices = item.options.filter((o) => o.kind === "CHOICE");
  const text = typeof value === "string" ? value : "";

  // ── Elemen konten ──
  if (item.type === "TITLE_DESCRIPTION") {
    return (
      <div id={`q-${item.id}`} className="space-y-1">
        {item.title && (
          <h3 className="text-base font-semibold text-gray-900">
            {item.title}
          </h3>
        )}
        {item.description && (
          <p className="whitespace-pre-line text-sm text-gray-600">
            {item.description}
          </p>
        )}
      </div>
    );
  }

  if (item.type === "IMAGE") {
    const url = typeof cfg.url === "string" ? cfg.url : "";
    if (!url) return null;
    const width = Math.min(100, Math.max(10, Number(cfg.widthPercent ?? 100)));
    return (
      <figure id={`q-${item.id}`} className="flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaSrc(url)}
          alt={typeof cfg.caption === "string" ? cfg.caption : ""}
          style={{ width: `${width}%` }}
          className="h-auto max-w-full rounded-lg"
        />
        {typeof cfg.caption === "string" && cfg.caption && (
          <figcaption className="mt-1.5 text-center text-xs text-gray-500">
            {cfg.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (item.type === "VIDEO") {
    const url = typeof cfg.url === "string" ? cfg.url : "";
    if (!url) return null;
    const uploaded = url.startsWith("/uploads/");
    const embed = uploaded ? null : toEmbedUrl(url);
    return (
      <figure id={`q-${item.id}`} className="space-y-1.5">
        {uploaded ? (
          <video
            src={mediaSrc(url)}
            controls
            className="w-full rounded-lg bg-black"
          />
        ) : embed ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
              src={embed}
              title={
                typeof cfg.caption === "string" && cfg.caption
                  ? cfg.caption
                  : "Video"
              }
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-sm underline"
            style={{ color: accent }}
          >
            {url}
          </a>
        )}
        {typeof cfg.caption === "string" && cfg.caption && (
          <figcaption className="text-center text-xs text-gray-500">
            {cfg.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  // ── Pertanyaan ──
  const renderInput = () => {
    switch (item.type) {
      case "SHORT_ANSWER": {
        const rule = item.validation;
        const inputType =
          rule?.kind === "text" && rule.op === "email"
            ? "email"
            : rule?.kind === "text" && rule.op === "url"
              ? "url"
              : "text";
        return (
          <input
            type={inputType}
            inputMode={rule?.kind === "number" ? "decimal" : undefined}
            value={text}
            maxLength={1000}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Jawaban singkat"
            className={fieldClass}
            style={ring}
          />
        );
      }

      case "PARAGRAPH":
        return (
          <textarea
            rows={4}
            value={text}
            maxLength={10000}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Jawaban panjang"
            className={`${fieldClass} resize-y`}
            style={ring}
          />
        );

      case "MULTIPLE_CHOICE":
        return (
          <div role="radiogroup" className="space-y-2">
            {choices.map((o) => {
              const selected = value === o.id;
              return (
                <label
                  key={o.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-sm text-gray-700 transition-colors [overflow-wrap:anywhere] hover:bg-gray-50 sm:py-2.5"
                  style={{
                    borderColor: selected ? accent : "#e5e7eb",
                    backgroundColor: selected ? `${accent}10` : undefined,
                  }}
                >
                  <input
                    type="radio"
                    name={item.id}
                    checked={selected}
                    disabled={disabled}
                    onChange={() => onChange(o.id)}
                    style={{ accentColor: accent }}
                    className="h-5 w-5 shrink-0 sm:h-4 sm:w-4"
                  />
                  {o.label}
                </label>
              );
            })}
            {typeof value === "string" && value && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(undefined)}
                className="text-xs text-gray-400 underline hover:text-gray-600"
              >
                Hapus pilihan
              </button>
            )}
          </div>
        );

      case "CHECKBOXES": {
        const arr = Array.isArray(value) ? (value as string[]) : [];
        return (
          <div className="space-y-2">
            {choices.map((o) => {
              const selected = arr.includes(o.id);
              return (
                <label
                  key={o.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-sm text-gray-700 transition-colors [overflow-wrap:anywhere] hover:bg-gray-50 sm:py-2.5"
                  style={{
                    borderColor: selected ? accent : "#e5e7eb",
                    backgroundColor: selected ? `${accent}10` : undefined,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={disabled}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...arr, o.id]
                        : arr.filter((x) => x !== o.id);
                      onChange(next.length ? next : undefined);
                    }}
                    style={{ accentColor: accent }}
                    className="h-5 w-5 shrink-0 sm:h-4 sm:w-4"
                  />
                  {o.label}
                </label>
              );
            })}
          </div>
        );
      }

      case "DROPDOWN":
        return (
          <select
            value={text}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value || undefined)}
            className={fieldClass}
            style={ring}
          >
            <option value="">Pilih jawaban</option>
            {choices.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        );

      case "LINEAR_SCALE": {
        const min = Number(cfg.min ?? 1);
        const max = Number(cfg.max ?? 5);
        const numbers = Array.from(
          { length: Math.max(0, max - min + 1) },
          (_, i) => min + i,
        );
        return (
          <div className="space-y-2">
            <div role="radiogroup" className="flex flex-wrap gap-2">
              {numbers.map((n) => {
                const selected = value === n;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={disabled}
                    onClick={() => onChange(selected ? undefined : n)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border sm:h-10 sm:w-10 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
                    style={
                      selected
                        ? {
                            backgroundColor: accent,
                            borderColor: accent,
                            color: "#fff",
                          }
                        : { borderColor: "#d1d5db", color: "#374151" }
                    }
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            {(typeof cfg.minLabel === "string" ||
              typeof cfg.maxLabel === "string") && (
              <div className="flex justify-between gap-4 text-xs text-gray-500">
                <span>
                  {typeof cfg.minLabel === "string" ? cfg.minLabel : ""}
                </span>
                <span className="text-right">
                  {typeof cfg.maxLabel === "string" ? cfg.maxLabel : ""}
                </span>
              </div>
            )}
          </div>
        );
      }

      case "RATING":
        return (
          <RatingInput
            max={Number(cfg.max ?? 5)}
            value={typeof value === "number" ? value : undefined}
            disabled={disabled}
            onChange={onChange}
          />
        );

      case "MULTIPLE_CHOICE_GRID":
      case "CHECKBOX_GRID": {
        const grid =
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          !isFileValue(value)
            ? (value as Record<string, string[]>)
            : {};
        return (
          <GridInput
            item={item}
            value={grid}
            onChange={onChange}
            disabled={disabled}
            accent={accent}
            hasError={!!error}
          />
        );
      }

      case "DATE":
        return (
          <input
            type="date"
            value={text}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value || undefined)}
            className={`${fieldClass} sm:w-56`}
            style={ring}
          />
        );

      case "TIME_DURATION":
        return cfg.mode === "duration" ? (
          <DurationInput
            value={text}
            disabled={disabled}
            ring={ring}
            hasError={!!error}
            onChange={onChange}
          />
        ) : (
          <input
            type="time"
            value={text.slice(0, 5)}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value || undefined)}
            className={`${fieldClass} sm:w-40`}
            style={ring}
          />
        );

      case "FILE_UPLOAD":
        return (
          <FileInput
            item={item}
            value={isFileValue(value) ? value : { files: [], keep: [] }}
            onChange={onChange}
            disabled={disabled}
            accent={accent}
            draftNote={draftNote}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div id={`q-${item.id}`} className="space-y-2.5">
      <div>
        <p className="text-sm font-semibold text-gray-900">
          {item.title?.trim() || "(Pertanyaan tanpa judul)"}
          {item.isRequired && <span className="ml-1 text-red-500">*</span>}
        </p>
        {item.description && (
          <p className="mt-0.5 whitespace-pre-line text-xs text-gray-500">
            {item.description}
          </p>
        )}
      </div>
      {renderInput()}
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
