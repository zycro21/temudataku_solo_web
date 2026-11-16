"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { splitEquationLines } from "./equationUtils";

// Render LaTeX → HTML pakai KaTeX. `trust: false` (default KaTeX) memastikan
// perintah seperti \href / \includegraphics tidak dieksekusi, jadi aman dipakai
// dengan dangerouslySetInnerHTML. throwOnError=false: LaTeX yang salah tampil
// merah, bukan bikin halaman error.
export function MathView({
  latex,
  displayMode = false,
  className,
}: {
  latex: string;
  displayMode?: boolean;
  className?: string;
}) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        strict: "ignore",
        trust: false,
        errorColor: "#dc2626",
      });
    } catch {
      return "";
    }
  }, [latex, displayMode]);

  return (
    <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

// Tampilan persamaan (rata tengah, bisa di-scroll kalau panjang). Setiap baris
// yang diketik (Enter) dirender sebagai baris sendiri; baris kosong jadi jarak.
// Dipakai di preview editor, modal preview, dan halaman belajar.
export function EquationView({ latex }: { latex: string }) {
  const lines = useMemo(() => {
    const all = splitEquationLines(latex);
    let start = 0;
    let end = all.length;
    while (start < end && !all[start].trim()) start++;
    while (end > start && !all[end - 1].trim()) end--;
    return all.slice(start, end);
  }, [latex]);

  return (
    <div className="w-full overflow-x-auto py-1 text-center">
      {lines.map((line, i) =>
        line.trim() ? (
          <MathView
            key={i}
            latex={line}
            displayMode
            className="block [&_.katex-display]:my-1"
          />
        ) : (
          <div key={i} className="h-4" aria-hidden="true" />
        ),
      )}
    </div>
  );
}
