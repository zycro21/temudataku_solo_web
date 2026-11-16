"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import EquationPalette from "./EquationPalette";
import MathFieldInput, { type MathFieldHandle } from "./MathFieldInput";
import { EquationView } from "./MathView";
import {
  MAX_LATEX_LENGTH,
  insertAtCursor,
  trimTrailingBlankLines,
  validateLatex,
} from "./equationUtils";

export interface EquationBodyProps {
  /** Bentuk data: { latex: string } — sama dengan yang disimpan backend. */
  initialData?: { latex?: string };
  onChangeData?: (data: { latex: string }) => void;
}

type InputMode = "visual" | "latex";

// ─── Preview (setelah Create / Save) ──────────────────────────────────────────
function EquationPreview({
  latex,
  onEdit,
}: {
  latex: string;
  onEdit: () => void;
}) {
  return (
    <div className="group/preview relative rounded-xl border-2 border-dashed border-gray-300 bg-white p-4">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="Edit equation"
        className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 opacity-0 shadow-sm transition-opacity hover:border-emerald-300 hover:text-emerald-600 group-hover/preview:opacity-100"
      >
        <Pencil size={11} />
        Edit
      </button>
      {latex.trim() ? (
        <EquationView latex={latex} />
      ) : (
        <p className="text-center text-sm italic text-gray-400">Equation</p>
      )}
    </div>
  );
}

// ─── EquationBody (stateful controller) ───────────────────────────────────────
export function EquationBody({ initialData, onChangeData }: EquationBodyProps) {
  const startLatex = initialData?.latex ?? "";
  const [mode, setMode] = useState<"canvas" | "preview">(
    startLatex.trim() ? "preview" : "canvas",
  );
  const [latex, setLatex] = useState(startLatex);
  const [inputMode, setInputMode] = useState<InputMode>("visual");
  const fieldRef = useRef<MathFieldHandle>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Data dari luar berubah (mis. undo/redo di halaman) → ikuti.
  useEffect(() => {
    if (initialData?.latex !== undefined && initialData.latex !== latex) {
      setLatex(initialData.latex);
      setMode(initialData.latex.trim() ? "preview" : "canvas");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.latex]);

  const handleInsert = (template: string) => {
    if (inputMode === "visual") {
      fieldRef.current?.insert(template);
      return;
    }
    const el = textareaRef.current;
    const start = el?.selectionStart ?? latex.length;
    const end = el?.selectionEnd ?? latex.length;
    const { value, caret } = insertAtCursor(latex, start, end, template);
    setLatex(value);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
  };

  const handleCreate = () => {
    // Enter yang tertinggal di akhir tidak ikut disimpan sebagai baris kosong.
    const clean = trimTrailingBlankLines(latex);
    const error = validateLatex(clean);
    if (error) {
      toast.error("Equation belum bisa disimpan", { description: error });
      return;
    }
    setLatex(clean);
    onChangeData?.({ latex: clean });
    setMode("preview");
  };

  if (mode === "preview") {
    return <EquationPreview latex={latex} onEdit={() => setMode("canvas")} />;
  }

  return (
    <div className="relative space-y-3 rounded-xl border-2 border-dashed border-gray-300 bg-white p-4">
      {/* Mode input */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-gray-500">
          Equation <span className="text-red-500">*</span>
        </p>
        <div
          role="group"
          aria-label="Mode input"
          className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5"
        >
          {(["visual", "latex"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={inputMode === m}
              onClick={() => setInputMode(m)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                inputMode === m
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-500 hover:text-emerald-600"
              }`}
            >
              {m === "visual" ? "Visual" : "LaTeX"}
            </button>
          ))}
        </div>
      </div>

      {inputMode === "visual" ? (
        <MathFieldInput
          ref={fieldRef}
          value={latex}
          onChange={setLatex}
          onLoadError={() => {
            toast.error("Editor visual gagal dimuat", {
              description: "Beralih ke mode LaTeX.",
            });
            setInputMode("latex");
          }}
        />
      ) : (
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            rows={3}
            spellCheck={false}
            aria-label="LaTeX source"
            placeholder={String.raw`Contoh: x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`}
            className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Eye size={12} /> Preview
            </span>
            <span
              className={latex.length > MAX_LATEX_LENGTH ? "text-red-500" : ""}
            >
              {latex.length}/{MAX_LATEX_LENGTH}
            </span>
          </div>
          <div className="min-h-14 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            {latex.trim() ? (
              <EquationView latex={latex} />
            ) : (
              <p className="py-3 text-center text-sm italic text-gray-400">
                Preview persamaan akan muncul di sini
              </p>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Tekan Enter untuk pindah ke baris baru.
      </p>

      <EquationPalette onInsert={handleInsert} />

      <div className="flex flex-col items-center justify-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleCreate}
          className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
        >
          Create / Save Equation
        </button>
        <p className="animate-pulse text-center text-xs font-bold text-red-500">
          ⚠️ Jangan lupa klik Create / Save Equation Jika Ingin Tersimpan!
        </p>
      </div>
    </div>
  );
}

export default EquationBody;
