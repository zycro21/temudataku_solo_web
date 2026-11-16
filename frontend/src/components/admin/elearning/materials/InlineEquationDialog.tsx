"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, X } from "lucide-react";
import { toast } from "sonner";
import EquationPalette from "./EquationPalette";
import MathFieldInput, { type MathFieldHandle } from "./MathFieldInput";
import { MathView } from "./MathView";
import {
  insertAtCursor,
  trimTrailingBlankLines,
  validateLatex,
} from "./equationUtils";

// Persamaan inline ikut menghabiskan jatah karakter field tempat ia disisipkan
// (highlight 1250, sel tabel 2000), jadi batasnya sengaja lebih kecil dari
// elemen Equation yang berdiri sendiri.
const MAX_INLINE_LATEX_LENGTH = 1000;

type InputMode = "visual" | "latex";

interface InlineEquationDialogProps {
  mode: "insert" | "edit";
  initialLatex: string;
  onConfirm: (latex: string) => void;
  onCancel: () => void;
}

export default function InlineEquationDialog({
  mode,
  initialLatex,
  onConfirm,
  onCancel,
}: InlineEquationDialogProps) {
  const [latex, setLatex] = useState(initialLatex);
  const [inputMode, setInputMode] = useState<InputMode>("visual");
  const fieldRef = useRef<MathFieldHandle>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fokus ke input begitu dialog (atau mode input) berubah.
  useEffect(() => {
    const t = setTimeout(() => {
      if (inputMode === "visual") fieldRef.current?.focus();
      else textareaRef.current?.focus();
    }, 60);
    return () => clearTimeout(t);
  }, [inputMode]);

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

  const handleConfirm = () => {
    // Persamaan inline satu baris: Enter di editor visual dianggap spasi
    // (KaTeX mengabaikan whitespace di math mode, jadi hasilnya sama).
    const clean = trimTrailingBlankLines(latex)
      .replace(/\s*\n\s*/g, " ")
      .trim();

    let error: string | null = null;
    if (clean.length > MAX_INLINE_LATEX_LENGTH) {
      error = `Persamaan inline maksimal ${MAX_INLINE_LATEX_LENGTH} karakter (sekarang ${clean.length})`;
    } else if (/\{\/?math\}/.test(clean)) {
      error = "Persamaan tidak boleh memuat teks {math} atau {/math}";
    } else {
      error = validateLatex(clean);
    }

    if (error) {
      toast.error("Persamaan belum bisa disisipkan", { description: error });
      return;
    }
    onConfirm(clean);
  };

  if (typeof document === "undefined") return null;

  // Semua event dihentikan di sini supaya klik / ketikan di dialog tidak
  // "bocor" lewat React tree ke handler card/canvas di atas RichTextEditor.
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={stop}
      onClick={stop}
      onKeyUp={stop}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape") onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === "edit" ? "Ubah persamaan" : "Sisipkan persamaan"}
        className="max-h-[90vh] w-full max-w-2xl space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-gray-800">
            {mode === "edit" ? "Ubah persamaan" : "Sisipkan persamaan"}
          </h3>
          <div className="flex items-center gap-2">
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
            <button
              type="button"
              onClick={onCancel}
              aria-label="Tutup"
              className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={16} />
            </button>
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
                className={
                  latex.length > MAX_INLINE_LATEX_LENGTH ? "text-red-500" : ""
                }
              >
                {latex.length}/{MAX_INLINE_LATEX_LENGTH}
              </span>
            </div>
            <div className="min-h-14 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center">
              {latex.trim() ? (
                <MathView latex={latex.replace(/\s*\n\s*/g, " ")} />
              ) : (
                <p className="py-3 text-center text-sm italic text-gray-400">
                  Preview persamaan akan muncul di sini
                </p>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400">
          Persamaan ini disisipkan di dalam teks (inline), jadi hanya satu
          baris. Untuk persamaan besar di baris sendiri, pakai elemen Equation.
        </p>

        <EquationPalette onInsert={handleInsert} />

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            {mode === "edit" ? "Simpan" : "Sisipkan"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
