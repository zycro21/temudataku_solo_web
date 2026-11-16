// Aturan & helper persamaan (equation). Disamakan dengan validasi backend
// (elearning_text.validation.ts → equationContentSchema) supaya error muncul
// di editor, bukan baru setelah request ditolak server.

export const MAX_LATEX_LENGTH = 8000;

// Sama dengan BLOCKED_LATEX_COMMANDS di backend.
export const BLOCKED_LATEX_COMMANDS =
  /\\(href|url|includegraphics|require|input|include|write|def|newcommand|renewcommand|catcode|html[A-Za-z]*)(?![A-Za-z])/;

const PLACEHOLDER_REGEX = /\\placeholder(?![A-Za-z])/;

/** Kembalikan pesan error (Bahasa Indonesia) atau null kalau LaTeX valid untuk disimpan. */
export function validateLatex(latex: string): string | null {
  if (!latex.trim()) return "Persamaan tidak boleh kosong";
  if (latex.length > MAX_LATEX_LENGTH) {
    return `Persamaan maksimal ${MAX_LATEX_LENGTH} karakter (sekarang ${latex.length})`;
  }
  if (PLACEHOLDER_REGEX.test(latex)) {
    return "Masih ada kotak kosong di persamaan, isi atau hapus dulu";
  }
  if (BLOCKED_LATEX_COMMANDS.test(latex)) {
    return "Persamaan mengandung perintah LaTeX yang tidak diizinkan";
  }
  return null;
}

/**
 * Sisipkan template ke teks LaTeX (mode "LaTeX source").
 * `\placeholder{}` dibuang, kursor diletakkan di dalam pasangan `{}` pertama
 * supaya user bisa langsung mengetik argumennya.
 */
export function insertAtCursor(
  value: string,
  start: number,
  end: number,
  template: string,
): { value: string; caret: number } {
  const text = template.replace(/\\placeholder\{\}/g, "");
  const next = value.slice(0, start) + text + value.slice(end);
  const firstEmpty = text.indexOf("{}");
  const caret = start + (firstEmpty >= 0 ? firstEmpty + 1 : text.length);
  return { value: next, caret };
}

// ─── Baris persamaan ──────────────────────────────────────────────────────────
// Satu baris di editor (Enter) = satu baris di hasil. Persamaan disimpan sebagai
// teks dengan "\n" di antara baris, jadi mode Visual dan LaTeX saling kompatibel.

// Selisih "kedalaman" sebuah baris: \begin / \end dan kurung kurawal. Baris
// yang masih berada di dalam environment (matriks, aligned) atau kurung yang
// belum tertutup digabung ke baris berikutnya supaya tidak terpotong.
function nestingDelta(line: string): number {
  const begins = (line.match(/\\begin\{/g) ?? []).length;
  const ends = (line.match(/\\end\{/g) ?? []).length;
  const plain = line.replace(/\\\\/g, "").replace(/\\[{}]/g, "");
  const open = (plain.match(/\{/g) ?? []).length;
  const close = (plain.match(/\}/g) ?? []).length;
  return begins - ends + (open - close);
}

/** Pecah teks persamaan menjadi baris-baris yang dirender terpisah. Minimal 1 baris. */
export function splitEquationLines(latex: string): string[] {
  const raw = latex.replace(/\r\n?/g, "\n").split("\n");
  const lines: string[] = [];
  let buffer: string[] = [];
  let depth = 0;
  for (const line of raw) {
    buffer.push(line);
    depth += nestingDelta(line);
    if (depth <= 0) {
      lines.push(buffer.join("\n"));
      buffer = [];
      depth = 0;
    }
  }
  if (buffer.length > 0) lines.push(buffer.join("\n"));
  return lines;
}

/** Buang baris kosong di akhir (mis. Enter yang tidak sengaja ditekan). */
export const trimTrailingBlankLines = (latex: string) =>
  latex.replace(/\n\s*$/, "");
