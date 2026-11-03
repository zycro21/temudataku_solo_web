"use client";

import FormToggle from "./FormToggle";
import type { EditorItem, ItemConfig } from "./editorModel";

interface Props {
  item: EditorItem;
  onChange: (config: ItemConfig) => void;
}

const fieldClass =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

const FILE_KINDS: { value: string; label: string }[] = [
  { value: "image", label: "Gambar" },
  { value: "pdf", label: "PDF" },
  { value: "document", label: "Dokumen" },
  { value: "spreadsheet", label: "Spreadsheet" },
  { value: "presentation", label: "Presentasi" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "archive", label: "Arsip (zip, rar)" },
];

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

// Pengaturan khusus tipe + pratinjau singkat bentuk pertanyaannya
export default function ConfigEditor({ item, onChange }: Props) {
  const cfg = (item.config ?? {}) as Record<string, unknown>;
  const set = (patch: Record<string, unknown>) =>
    onChange({ ...cfg, ...patch });
  const num = (k: string, fallback: number) =>
    typeof cfg[k] === "number" ? (cfg[k] as number) : fallback;
  const str = (k: string) =>
    typeof cfg[k] === "string" ? (cfg[k] as string) : "";

  switch (item.type) {
    case "LINEAR_SCALE": {
      const min = num("min", 1);
      const max = num("max", 5);
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <select
              value={min}
              onChange={(e) => set({ min: Number(e.target.value) })}
              aria-label="Nilai awal skala"
              className={fieldClass}
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
            </select>
            <span>sampai</span>
            <select
              value={max}
              onChange={(e) => set({ max: Number(e.target.value) })}
              aria-label="Nilai akhir skala"
              className={fieldClass}
            >
              {range(2, 10).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="text"
              value={str("minLabel")}
              onChange={(e) => set({ minLabel: e.target.value })}
              placeholder={`Label ${min} (opsional)`}
              aria-label="Label nilai awal"
              maxLength={100}
              className={fieldClass}
            />
            <input
              type="text"
              value={str("maxLabel")}
              onChange={(e) => set({ maxLabel: e.target.value })}
              placeholder={`Label ${max} (opsional)`}
              aria-label="Label nilai akhir"
              maxLength={100}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {str("minLabel") && <span>{str("minLabel")}</span>}
            {range(min, max).map((n) => (
              <span
                key={n}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600"
              >
                {n}
              </span>
            ))}
            {str("maxLabel") && <span>{str("maxLabel")}</span>}
          </div>
        </div>
      );
    }

    case "RATING": {
      const max = num("max", 5);
      return (
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <select
            value={max}
            onChange={(e) => set({ max: Number(e.target.value) })}
            aria-label="Jumlah bintang"
            className={fieldClass}
          >
            {range(3, 10).map((n) => (
              <option key={n} value={n}>
                {n} bintang
              </option>
            ))}
          </select>
          <span aria-hidden className="text-amber-400">
            {"★".repeat(max)}
          </span>
        </div>
      );
    }

    case "FILE_UPLOAD": {
      const selected = Array.isArray(cfg.allowedTypes)
        ? (cfg.allowedTypes as string[])
        : [];
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <label className="flex items-center gap-2">
              Maks. file
              <select
                value={num("maxFiles", 1)}
                onChange={(e) => set({ maxFiles: Number(e.target.value) })}
                className={fieldClass}
              >
                {range(1, 10).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              Ukuran maks. (MB)
              <input
                type="number"
                min={1}
                max={50}
                value={num("maxSizeMb", 10)}
                onChange={(e) =>
                  set({
                    maxSizeMb: Math.min(
                      50,
                      Math.max(1, Math.round(Number(e.target.value) || 1)),
                    ),
                  })
                }
                className={`${fieldClass} w-24`}
              />
            </label>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-600">
              Tipe file yang diizinkan (kosong = semua tipe)
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {FILE_KINDS.map((k) => (
                <label
                  key={k.value}
                  className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(k.value)}
                    onChange={(e) =>
                      set({
                        allowedTypes: e.target.checked
                          ? [...selected, k.value]
                          : selected.filter((v) => v !== k.value),
                      })
                    }
                    className="h-4 w-4 accent-emerald-500"
                  />
                  {k.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "DATE":
      return (
        <div className="flex flex-wrap items-center gap-4">
          <input
            disabled
            type="date"
            className={`${fieldClass} bg-gray-50 sm:w-56`}
          />
          <FormToggle
            checked={cfg.includeYear !== false}
            onChange={(v) => set({ includeYear: v })}
            label="Sertakan tahun"
          />
        </div>
      );

    case "TIME_DURATION":
      return (
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <select
            value={str("mode") || "time"}
            onChange={(e) => set({ mode: e.target.value })}
            aria-label="Mode"
            className={fieldClass}
          >
            <option value="time">Waktu (jam:menit)</option>
            <option value="duration">Durasi (jam:menit:detik)</option>
          </select>
          <input
            disabled
            placeholder={str("mode") === "duration" ? "00:00:00" : "00:00"}
            className={`${fieldClass} w-32 bg-gray-50`}
          />
        </div>
      );

    case "MULTIPLE_CHOICE_GRID":
    case "CHECKBOX_GRID":
      return (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <FormToggle
            checked={cfg.requireEachRow === true}
            onChange={(v) => set({ requireEachRow: v })}
            label="Wajib isi setiap baris"
          />
          {item.type === "MULTIPLE_CHOICE_GRID" && (
            <FormToggle
              checked={cfg.oneResponsePerColumn === true}
              onChange={(v) => set({ oneResponsePerColumn: v })}
              label="Satu jawaban per kolom"
            />
          )}
        </div>
      );

    default:
      return null;
  }
}
