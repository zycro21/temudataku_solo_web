"use client";

import { normalizeEditorHTML } from "@/lib/editorHTMLUtils";
import { getFontStyle } from "./fontStyles";
import type { TableData } from "./tableUtils";

// Tampilan tabel read-only. Dipakai di preview editor, modal preview mentee,
// dan halaman belajar — jadi tampilannya identik di semua tempat.
//
// Isi header & sel adalah HTML rich text (bold, alignment, list, indent, warna,
// dst). Alignment per sel/baris yang dipilih user ada di dalam HTML-nya
// (text-align), jadi otomatis menimpa default rata tengah di bawah.
//
// Lebar kolom dibagi rata sesuai jumlah kolom (bukan mengikuti panjang teks) dan
// isinya default rata tengah. Khusus 1 kolom default rata kiri. Tabel yang
// sangat lebar tidak dipaksa menyempit: tiap kolom punya lebar minimum dan tabel
// di-scroll. Antar kolom diberi garis tipis sebagai pembatas.
const contentClass =
  "break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5";

export function TableView({ columns, rows, fontType, fontSize }: TableData) {
  const multiColumn = columns.length > 1;
  const align = multiColumn ? "text-center" : "text-left";
  const textStyle = getFontStyle(fontType, fontSize);

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table
        className="w-full table-fixed border-collapse text-sm"
        style={{ ...textStyle, minWidth: `${columns.length * 9}rem` }}
      >
        <thead>
          <tr className="bg-emerald-600 text-white">
            {columns.map((col, i) => (
              <th
                key={i}
                scope="col"
                className={`whitespace-pre-wrap break-words px-4 py-2.5 font-semibold ${align} ${
                  i > 0 ? "border-l border-white/30" : ""
                }`}
              >
                <div
                  className={contentClass}
                  dangerouslySetInnerHTML={{
                    __html: normalizeEditorHTML(col.header) || "&nbsp;",
                  }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="odd:bg-white even:bg-gray-50">
              {columns.map((_, c) => (
                <td
                  key={c}
                  className={`whitespace-pre-wrap break-words border-t border-gray-200 px-4 py-2.5 align-middle text-gray-700 ${align} ${
                    c > 0 ? "border-l border-gray-200" : ""
                  }`}
                >
                  <div
                    className={contentClass}
                    dangerouslySetInnerHTML={{
                      __html: normalizeEditorHTML(row.cells[c]) || "&nbsp;",
                    }}
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

export default TableView;
