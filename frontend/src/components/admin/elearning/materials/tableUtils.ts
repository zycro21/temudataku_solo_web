// Aturan & helper tabel. Batas disamakan dengan validasi backend
// (elearning_text.validation.ts → tableContentSchema).
//
// Isi header & sel sekarang berupa HTML (rich text dari RichTextEditor).
// Konversi HTML ↔ markdown-token untuk backend dilakukan di page.tsx
// (sama seperti elemen lain: paragraph, accordion, dst).

export const MAX_TABLE_COLUMNS = 20;
export const MAX_TABLE_ROWS = 500;
export const MAX_HEADER_LENGTH = 255; // batas teks yang KELIATAN per header
export const MAX_CELL_LENGTH = 2000; // batas teks yang KELIATAN per sel

export interface EditorColumn {
  id: string;
  header: string; // HTML
}

export interface EditorRow {
  id: string;
  cells: string[]; // HTML per sel
}

export interface EditorGrid {
  columns: EditorColumn[];
  rows: EditorRow[];
}

/** Bentuk data yang disimpan di CanvasItem.data (header & cells = HTML). */
export interface TableData {
  columns: { header: string }[];
  rows: { cells: string[] }[];
  /** Font untuk seluruh tabel (dari panel Style). */
  fontType?: string;
  fontSize?: number;
}

let counter = 0;
export const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** Escape teks biasa supaya aman dimasukkan sebagai HTML. */
export const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** True kalau HTML tidak punya teks yang keliatan (mis. "<div><br></div>"). */
export const isHtmlBlank = (html: string | null | undefined) =>
  !html ||
  !html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|\u00A0/g, " ")
    .trim();

export function createEmptyGrid(columnCount = 3, rowCount = 3): EditorGrid {
  const columns = Array.from({ length: columnCount }, () => ({
    id: newId("col"),
    header: "",
  }));
  const rows = Array.from({ length: rowCount }, () => ({
    id: newId("row"),
    cells: Array.from({ length: columnCount }, () => ""),
  }));
  return { columns, rows };
}

/** Data tersimpan → state editor (dengan id stabil untuk key React). */
export function gridFromData(data?: Partial<TableData>): EditorGrid {
  const columns = (data?.columns ?? []).map((c) => ({
    id: newId("col"),
    header: c.header ?? "",
  }));
  if (columns.length === 0) return createEmptyGrid();
  const rows = (data?.rows ?? []).map((r) => ({
    id: newId("row"),
    cells: columns.map((_, i) => r.cells?.[i] ?? ""),
  }));
  return {
    columns,
    rows:
      rows.length > 0
        ? rows
        : [{ id: newId("row"), cells: columns.map(() => "") }],
  };
}

/** State editor → data tabel (tanpa id). */
export function gridToData(grid: EditorGrid): TableData {
  return {
    columns: grid.columns.map((c) => ({ header: c.header })),
    rows: grid.rows.map((r) => ({
      cells: grid.columns.map((_, i) => r.cells[i] ?? ""),
    })),
  };
}

export const isGridEmpty = (grid: EditorGrid) =>
  grid.columns.every((c) => isHtmlBlank(c.header)) &&
  grid.rows.every((r) => r.cells.every((cell) => isHtmlBlank(cell)));

/**
 * Teks hasil copy dari Excel / Google Sheets / tabel Word → matriks.
 * Mengembalikan null kalau isinya teks biasa (tanpa tab/baris baru) supaya
 * paste default tetap jalan.
 */
export function parseClipboardGrid(text: string): string[][] | null {
  const normalized = text.replace(/\r\n?/g, "\n").replace(/\n$/, "");
  if (!normalized.includes("\t") && !normalized.includes("\n")) return null;
  return normalized.split("\n").map((line) => line.split("\t"));
}

/**
 * Tempel matriks mulai dari sel (rowIndex, colIndex). rowIndex -1 = baris
 * header. Baris/kolom ditambah otomatis sampai batas maksimum; sisanya dipotong.
 * Nilai yang ditempel adalah teks biasa → di-escape jadi HTML.
 */
export function applyPaste(
  grid: EditorGrid,
  rowIndex: number,
  colIndex: number,
  matrix: string[][],
): { grid: EditorGrid; truncated: boolean } {
  let truncated = false;
  let columns = grid.columns.map((c) => ({ ...c }));
  let rows = grid.rows.map((r) => ({ ...r, cells: [...r.cells] }));

  // Tambah kolom bila perlu
  const neededColumns = colIndex + Math.max(...matrix.map((r) => r.length));
  const targetColumns = Math.min(neededColumns, MAX_TABLE_COLUMNS);
  if (neededColumns > MAX_TABLE_COLUMNS) truncated = true;
  while (columns.length < targetColumns) {
    columns.push({ id: newId("col"), header: "" });
    rows = rows.map((r) => ({ ...r, cells: [...r.cells, ""] }));
  }

  // Tambah baris bila perlu
  const neededRows = rowIndex + matrix.length;
  const targetRows = Math.min(neededRows, MAX_TABLE_ROWS);
  if (neededRows > MAX_TABLE_ROWS) truncated = true;
  while (rows.length < targetRows) {
    rows.push({ id: newId("row"), cells: columns.map(() => "") });
  }

  matrix.forEach((line, i) => {
    const r = rowIndex + i;
    if (r >= rows.length) return;
    line.forEach((value, j) => {
      const c = colIndex + j;
      if (c >= columns.length) return;
      if (r === -1) {
        columns[c] = {
          ...columns[c],
          header: escapeHtml(value.slice(0, MAX_HEADER_LENGTH)),
        };
      } else {
        rows[r].cells[c] = escapeHtml(value.slice(0, MAX_CELL_LENGTH));
      }
    });
  });

  return { grid: { columns, rows }, truncated };
}
