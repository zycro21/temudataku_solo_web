"use client";

import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import RichTextEditor, { type RichTextEditorRef } from "./RichTextEditor";
import { getFontStyle } from "./fontStyles";
import { TableView } from "./TableView";
import {
  MAX_CELL_LENGTH,
  MAX_HEADER_LENGTH,
  MAX_TABLE_COLUMNS,
  MAX_TABLE_ROWS,
  applyPaste,
  gridFromData,
  gridToData,
  isGridEmpty,
  newId,
  parseClipboardGrid,
  type EditorGrid,
  type EditorRow,
  type TableData,
} from "./tableUtils";

type SelectionHandler = Parameters<
  typeof RichTextEditor
>[0]["onSelectionChange"];

export interface TableBodyProps {
  /** Bentuk data: { columns: [{header}], rows: [{cells}] } — header & cells = HTML. */
  initialData?: Partial<TableData>;
  fontType?: string;
  fontSize?: number;
  onChangeData?: (data: TableData) => void;
  /** Dipanggil saat sebuah sel/header difokus → panel Style mengendalikan sel itu. */
  onEditorFocus?: (ref: RichTextEditorRef) => void;
  onSelectionChange?: SelectionHandler;
}

// Border tipis antar kolom + highlight sel yang sedang diedit.
const cellTdClass =
  "border-l border-gray-200 p-0 align-top focus-within:bg-emerald-50/60 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-emerald-400";

const headerThClass =
  "group/col relative border-l border-emerald-200 p-0 text-left focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-emerald-400";

// ─── Satu baris editor (di-memo supaya ketik di satu sel tidak me-render ulang
// ratusan baris lain) ────────────────────────────────────────────────────────
const EditorRowView = memo(function EditorRowView({
  row,
  rowIndex,
  columnIds,
  version,
  canDelete,
  textStyle,
  activeColId,
  onCellChange,
  onDeleteRow,
  onPaste,
  onCellFocus,
  onCellBlur,
  onSelectionChange,
}: {
  row: EditorRow;
  rowIndex: number;
  columnIds: string[];
  version: number;
  canDelete: boolean;
  textStyle: CSSProperties;
  /** id kolom sel yang sedang aktif di baris ini (null kalau tidak ada). */
  activeColId: string | null;
  onCellChange: (rowId: string, colIndex: number, value: string) => void;
  onDeleteRow: (rowId: string) => void;
  onPaste: (
    e: React.ClipboardEvent<HTMLDivElement>,
    rowIndex: number,
    colIndex: number,
  ) => void;
  onCellFocus: (rowId: string, colId: string, api: RichTextEditorRef) => void;
  onCellBlur: (rowId: string, colId: string) => void;
  onSelectionChange?: SelectionHandler;
}) {
  const apis = useRef(new Map<string, RichTextEditorRef>());
  const centered = columnIds.length > 1;

  return (
    <tr className="group/row border-t border-gray-200">
      <td className="w-10 select-none bg-gray-50 px-2 text-center align-middle text-xs text-gray-400">
        <span className="group-hover/row:hidden">{rowIndex + 1}</span>
        <button
          type="button"
          onClick={() => onDeleteRow(row.id)}
          disabled={!canDelete}
          title="Delete row"
          aria-label={`Delete row ${rowIndex + 1}`}
          className="hidden text-gray-300 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 group-hover/row:inline-block"
        >
          <Trash2 size={13} />
        </button>
      </td>
      {columnIds.map((colId, c) => (
        // key pakai id kolom (bukan index) → hapus kolom tidak menukar isi editor
        <td key={`${colId}-${version}`} className={cellTdClass}>
          <RichTextEditor
            value={row.cells[c] ?? ""}
            onChange={(html) => onCellChange(row.id, c, html)}
            onPaste={(e) => onPaste(e, rowIndex, c)}
            onMount={(api) => apis.current.set(colId, api)}
            onUnmount={() => apis.current.delete(colId)}
            onFocus={() => {
              const api = apis.current.get(colId);
              if (api) onCellFocus(row.id, colId, api);
            }}
            onBlur={() => onCellBlur(row.id, colId)}
            onSelectionChange={
              activeColId === colId ? onSelectionChange : undefined
            }
            maxLength={MAX_CELL_LENGTH}
            className={`min-w-32 px-3 py-2 text-sm text-gray-800 ${
              centered ? "text-center" : "text-left"
            }`}
            style={textStyle}
          />
        </td>
      ))}
    </tr>
  );
});

// ─── Preview (setelah Create / Save) ──────────────────────────────────────────
function TablePreview({
  data,
  onEdit,
}: {
  data: TableData;
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
        title="Edit table"
        className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 opacity-0 shadow-sm transition-opacity hover:border-emerald-300 hover:text-emerald-600 group-hover/preview:opacity-100"
      >
        <Pencil size={11} />
        Edit
      </button>
      <TableView
        columns={data.columns}
        rows={data.rows}
        fontType={data.fontType}
        fontSize={data.fontSize}
      />
    </div>
  );
}

// ─── TableBody (stateful controller) ──────────────────────────────────────────
export function TableBody({
  initialData,
  fontType,
  fontSize,
  onChangeData,
  onEditorFocus,
  onSelectionChange,
}: TableBodyProps) {
  const hasSaved =
    (initialData?.columns?.length ?? 0) > 0 &&
    (initialData?.rows?.length ?? 0) > 0;

  const [mode, setMode] = useState<"canvas" | "preview">(
    hasSaved ? "preview" : "canvas",
  );
  const [grid, setGrid] = useState<EditorGrid>(() => gridFromData(initialData));

  // RichTextEditor hanya menyuntik `value` saat mount. Setelah paste massal
  // (yang mengubah banyak sel dari luar editor) semua editor di-mount ulang
  // lewat penambahan `version` ini supaya isinya ikut ter-update.
  const [version, setVersion] = useState(0);

  // Sel/header yang sedang fokus ("header" = baris judul kolom). Dipakai supaya
  // hanya sel aktif yang melaporkan status format ke panel Style.
  const [activeCell, setActiveCell] = useState<{
    rowId: string;
    colId: string;
  } | null>(null);

  const gridRef = useRef(grid);
  gridRef.current = grid;

  const onEditorFocusRef = useRef(onEditorFocus);
  onEditorFocusRef.current = onEditorFocus;

  const headerApis = useRef(new Map<string, RichTextEditorRef>());

  const columnCount = grid.columns.length;
  const rowCount = grid.rows.length;

  // Daftar id kolom yang stabil (referensi baru hanya kalau kolomnya berubah)
  const columnKey = grid.columns.map((c) => c.id).join("|");
  const columnIds = useMemo(() => columnKey.split("|"), [columnKey]);

  const textStyle = useMemo(
    () => getFontStyle(fontType, fontSize),
    [fontType, fontSize],
  );

  // ── Fokus sel ─────────────────────────────────────────────────────────────
  const handleCellFocus = useCallback(
    (rowId: string, colId: string, api: RichTextEditorRef) => {
      setActiveCell((prev) =>
        prev?.rowId === rowId && prev.colId === colId ? prev : { rowId, colId },
      );
      onEditorFocusRef.current?.(api);
    },
    [],
  );

  const handleCellBlur = useCallback((rowId: string, colId: string) => {
    setActiveCell((prev) =>
      prev?.rowId === rowId && prev.colId === colId ? null : prev,
    );
  }, []);

  // ── Mutasi (semua functional update → callback stabil untuk React.memo) ────
  const handleCellChange = useCallback(
    (rowId: string, colIndex: number, value: string) =>
      setGrid((prev) => ({
        ...prev,
        rows: prev.rows.map((r) =>
          r.id === rowId
            ? {
                ...r,
                cells: r.cells.map((v, i) => (i === colIndex ? value : v)),
              }
            : r,
        ),
      })),
    [],
  );

  const handleHeaderChange = (colId: string, value: string) =>
    setGrid((prev) => ({
      ...prev,
      columns: prev.columns.map((c) =>
        c.id === colId ? { ...c, header: value } : c,
      ),
    }));

  const handleAddRow = () =>
    setGrid((prev) =>
      prev.rows.length >= MAX_TABLE_ROWS
        ? prev
        : {
            ...prev,
            rows: [
              ...prev.rows,
              { id: newId("row"), cells: prev.columns.map(() => "") },
            ],
          },
    );

  const handleAddColumn = () =>
    setGrid((prev) =>
      prev.columns.length >= MAX_TABLE_COLUMNS
        ? prev
        : {
            columns: [...prev.columns, { id: newId("col"), header: "" }],
            rows: prev.rows.map((r) => ({ ...r, cells: [...r.cells, ""] })),
          },
    );

  const handleDeleteRow = useCallback(
    (rowId: string) =>
      setGrid((prev) =>
        prev.rows.length <= 1
          ? prev
          : { ...prev, rows: prev.rows.filter((r) => r.id !== rowId) },
      ),
    [],
  );

  const handleDeleteColumn = (colId: string) =>
    setGrid((prev) => {
      if (prev.columns.length <= 1) return prev;
      const index = prev.columns.findIndex((c) => c.id === colId);
      if (index === -1) return prev;
      return {
        columns: prev.columns.filter((c) => c.id !== colId),
        rows: prev.rows.map((r) => ({
          ...r,
          cells: r.cells.filter((_, i) => i !== index),
        })),
      };
    });

  // Paste dari Excel / Sheets / tabel Word → isi banyak sel sekaligus.
  // Paste teks biasa → disisipkan sebagai teks polos (format dari sumber lain
  // tidak ikut masuk). rowIndex -1 = baris header.
  const handlePaste = useCallback(
    (
      e: React.ClipboardEvent<HTMLDivElement>,
      rowIndex: number,
      colIndex: number,
    ) => {
      const text = e.clipboardData.getData("text/plain");
      const matrix = parseClipboardGrid(text);
      e.preventDefault();

      if (!matrix) {
        const plain = text.replace(/\r?\n$/, "");
        if (plain) document.execCommand("insertText", false, plain);
        return;
      }

      const result = applyPaste(gridRef.current, rowIndex, colIndex, matrix);
      if (result.truncated) {
        toast.warning("Sebagian data tidak ikut ditempel", {
          description: `Maksimal ${MAX_TABLE_COLUMNS} kolom dan ${MAX_TABLE_ROWS} baris.`,
        });
      }
      setGrid(result.grid);
      setVersion((v) => v + 1);
    },
    [],
  );

  const handleCreate = () => {
    if (isGridEmpty(grid)) {
      toast.error("Tabel belum bisa disimpan", {
        description: "Isi minimal satu header atau satu sel.",
      });
      return;
    }
    // fontType/fontSize ikut dibawa supaya tidak hilang saat data diganti
    onChangeData?.({ ...gridToData(grid), fontType, fontSize });
    setMode("preview");
  };

  if (mode === "preview") {
    return (
      <TablePreview
        data={{ ...gridToData(grid), fontType, fontSize }}
        onEdit={() => setMode("canvas")}
      />
    );
  }

  const atColumnLimit = columnCount >= MAX_TABLE_COLUMNS;
  const atRowLimit = rowCount >= MAX_TABLE_ROWS;
  const centered = columnCount > 1;

  return (
    <div className="relative space-y-3 rounded-xl border-2 border-dashed border-gray-300 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-gray-500">
          Table <span className="text-red-500">*</span>
        </p>
        <p className="text-xs text-gray-400">
          {columnCount} columns × {rowCount} rows
        </p>
      </div>

      <div className="max-h-[32rem] overflow-auto rounded-lg border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-emerald-50">
              <th className="w-10 bg-emerald-50" aria-label="Row number" />
              {grid.columns.map((col, c) => (
                <th
                  key={`${col.id}-${version}`}
                  scope="col"
                  className={headerThClass}
                >
                  <RichTextEditor
                    value={col.header}
                    onChange={(html) => handleHeaderChange(col.id, html)}
                    onPaste={(e) => handlePaste(e, -1, c)}
                    onMount={(api) => headerApis.current.set(col.id, api)}
                    onUnmount={() => headerApis.current.delete(col.id)}
                    onFocus={() => {
                      const api = headerApis.current.get(col.id);
                      if (api) handleCellFocus("header", col.id, api);
                    }}
                    onBlur={() => handleCellBlur("header", col.id)}
                    onSelectionChange={
                      activeCell?.rowId === "header" &&
                      activeCell.colId === col.id
                        ? onSelectionChange
                        : undefined
                    }
                    placeholder={`Header ${c + 1}`}
                    maxLength={MAX_HEADER_LENGTH}
                    className={`min-w-32 py-2 pl-3 pr-7 text-sm font-semibold text-emerald-800 ${
                      centered ? "text-center" : "text-left"
                    }`}
                    style={textStyle}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteColumn(col.id)}
                    disabled={columnCount <= 1}
                    title="Delete column"
                    aria-label={`Delete column ${c + 1}`}
                    className="absolute right-1.5 top-2 hidden rounded p-0.5 text-emerald-400 transition hover:bg-white hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 group-hover/col:block"
                  >
                    <X size={13} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.rows.map((row, r) => (
              <EditorRowView
                key={row.id}
                row={row}
                rowIndex={r}
                columnIds={columnIds}
                version={version}
                canDelete={rowCount > 1}
                textStyle={textStyle}
                activeColId={
                  activeCell?.rowId === row.id ? activeCell.colId : null
                }
                onCellChange={handleCellChange}
                onDeleteRow={handleDeleteRow}
                onPaste={handlePaste}
                onCellFocus={handleCellFocus}
                onCellBlur={handleCellBlur}
                // hanya baris aktif yang dapat handler → baris lain tetap ter-memo
                onSelectionChange={
                  activeCell?.rowId === row.id ? onSelectionChange : undefined
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleAddRow}
            disabled={atRowLimit}
            title={atRowLimit ? `Maksimal ${MAX_TABLE_ROWS} baris` : undefined}
            className="flex items-center gap-1.5 rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={14} />
            Add Row
          </button>
          <button
            type="button"
            onClick={handleAddColumn}
            disabled={atColumnLimit}
            title={
              atColumnLimit ? `Maksimal ${MAX_TABLE_COLUMNS} kolom` : undefined
            }
            className="flex items-center gap-1.5 rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={14} />
            Add Column
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            <Eye size={14} />
            Create / Save Table
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Maks. {MAX_TABLE_COLUMNS} kolom × {MAX_TABLE_ROWS} baris · Klik sel
          lalu pakai panel Style (bold, alignment, list, font, dll) · Tempel
          data dari Excel/Sheets langsung ke sel.
        </p>
        <p className="animate-pulse text-center text-xs font-bold text-red-500">
          ⚠️ Jangan lupa klik Create / Save Table Jika Ingin Tersimpan!
        </p>
      </div>
    </div>
  );
}

export default TableBody;
