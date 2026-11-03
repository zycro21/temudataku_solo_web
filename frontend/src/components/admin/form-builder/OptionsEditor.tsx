"use client";

import { Plus, X } from "lucide-react";
import {
  isBranching,
  isGrid,
  newOption,
  type EditorItem,
  type EditorOption,
  type NavAction,
  type SectionTarget,
} from "./editorModel";

interface Props {
  item: EditorItem;
  /** Semua section form (tujuan lompat untuk branching) */
  targets: SectionTarget[];
  /** Section tempat pertanyaan ini berada (tidak boleh jadi tujuan sendiri) */
  sectionUid: string;
  onChange: (patch: Partial<EditorItem>) => void;
}

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";
const selectClass =
  "rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";
const iconBtn =
  "rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent";

const branchValue = (o: EditorOption) =>
  o.branchAction === "GO_TO_SECTION"
    ? `GO:${o.branchSectionRef ?? ""}`
    : o.branchAction;

function applyBranch(o: EditorOption, v: string): EditorOption {
  if (v.startsWith("GO:")) {
    return {
      ...o,
      branchAction: "GO_TO_SECTION",
      branchSectionRef: v.slice(3) || null,
    };
  }
  return { ...o, branchAction: v as NavAction, branchSectionRef: null };
}

export default function OptionsEditor({
  item,
  targets,
  sectionUid,
  onChange,
}: Props) {
  // ── Grid: daftar baris + daftar kolom ──────────────────────────────────────
  if (isGrid(item.type)) {
    const rows = item.options.filter((o) => o.kind === "GRID_ROW");
    const cols = item.options.filter((o) => o.kind === "GRID_COLUMN");
    const commit = (r: EditorOption[], c: EditorOption[]) =>
      onChange({ options: [...r, ...c] });

    const list = (
      title: string,
      kind: "GRID_ROW" | "GRID_COLUMN",
      current: EditorOption[],
    ) => {
      const setList = (next: EditorOption[]) =>
        kind === "GRID_ROW" ? commit(next, cols) : commit(rows, next);
      const noun = kind === "GRID_ROW" ? "Baris" : "Kolom";
      return (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">{title}</p>
          {current.map((o, i) => (
            <div key={o.uid} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-center text-xs text-gray-400">
                {i + 1}.
              </span>
              <input
                type="text"
                value={o.label}
                onChange={(e) =>
                  setList(
                    current.map((x) =>
                      x.uid === o.uid ? { ...x, label: e.target.value } : x,
                    ),
                  )
                }
                placeholder={`${noun} ${i + 1}`}
                aria-label={`${noun} ${i + 1}`}
                className={inputClass}
              />
              <button
                type="button"
                aria-label={`Hapus ${noun.toLowerCase()}`}
                disabled={current.length <= 1}
                onClick={() => setList(current.filter((x) => x.uid !== o.uid))}
                className={iconBtn}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setList([
                ...current,
                newOption(`${noun} ${current.length + 1}`, kind),
              ])
            }
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah {noun.toLowerCase()}
          </button>
        </div>
      );
    };

    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {list("Baris", "GRID_ROW", rows)}
        {list("Kolom", "GRID_COLUMN", cols)}
      </div>
    );
  }

  // ── Pilihan (Multiple Choice, Checkboxes, Dropdown) ────────────────────────
  const choices = item.options.filter((o) => o.kind === "CHOICE");
  const branching = isBranching(item.type);
  const otherTargets = targets.filter((t) => t.uid !== sectionUid);
  const canBranch = branching && otherTargets.length > 0;

  const setOption = (uid: string, next: EditorOption) =>
    onChange({ options: item.options.map((o) => (o.uid === uid ? next : o)) });

  return (
    <div className="space-y-2">
      {choices.map((o, i) => (
        <div key={o.uid} className="flex flex-wrap items-center gap-2">
          {item.type === "DROPDOWN" ? (
            <span className="w-5 shrink-0 text-center text-xs text-gray-400">
              {i + 1}.
            </span>
          ) : (
            <span
              aria-hidden
              className={`h-4 w-4 shrink-0 border-2 border-gray-300 ${
                item.type === "MULTIPLE_CHOICE" ? "rounded-full" : "rounded"
              }`}
            />
          )}
          <input
            type="text"
            value={o.label}
            onChange={(e) => setOption(o.uid, { ...o, label: e.target.value })}
            placeholder={`Opsi ${i + 1}`}
            aria-label={`Opsi ${i + 1}`}
            className={`${inputClass} min-w-0 flex-1`}
          />
          {canBranch && (
            <select
              value={branchValue(o)}
              onChange={(e) => setOption(o.uid, applyBranch(o, e.target.value))}
              aria-label={`Setelah memilih opsi ${i + 1}`}
              className={`${selectClass} max-w-48`}
            >
              <option value="NEXT">Lanjut seperti biasa</option>
              <option value="SUBMIT">Kirim form</option>
              {otherTargets.map((t) => (
                <option key={t.uid} value={`GO:${t.uid}`}>
                  Lompat ke {t.label}
                </option>
              ))}
              {branchValue(o) === "GO:" && (
                <option value="GO:" disabled>
                  Pilih section tujuan…
                </option>
              )}
            </select>
          )}
          <button
            type="button"
            aria-label="Hapus opsi"
            disabled={choices.length <= 1}
            onClick={() =>
              onChange({ options: item.options.filter((x) => x.uid !== o.uid) })
            }
            className={iconBtn}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange({
            options: [...item.options, newOption(`Opsi ${choices.length + 1}`)],
          })
        }
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
      >
        <Plus className="h-3.5 w-3.5" />
        Tambah opsi
      </button>
      {branching && !canBranch && (
        <p className="text-xs text-gray-400">
          Tambahkan section lain untuk mengatur lompatan berdasarkan jawaban.
        </p>
      )}
    </div>
  );
}
