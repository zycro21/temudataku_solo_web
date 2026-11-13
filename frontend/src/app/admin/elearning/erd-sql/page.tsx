"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ErdCanvas from "../../../../components/admin/elearning/erd-sql/ErdCanvas";
import ErdIntro, { ErdNotes } from "../../../../components/admin/elearning/erd-sql/ErdIntro";
import ErdLegend from "../../../../components/admin/elearning/erd-sql/ErdLegend";
import TableChips from "../../../../components/admin/elearning/erd-sql/TableChips";
import TableDetailPanel from "../../../../components/admin/elearning/erd-sql/TableDetailPanel";
import { RELATIONS, TABLES, getTable } from "../../../../components/admin/elearning/erd-sql/erdSqlData";

export default function ErdSqlPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const table = selected ? (getTable(selected) ?? null) : null;

  return (
    <div className="space-y-4">
      <ErdIntro />

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Diagram relasi
            </h2>
            <p className="text-sm text-gray-500">
              Pilih tabel di diagram atau lewat tombol di samping untuk membuka
              detailnya.
            </p>
          </div>
          <TableChips
            tables={TABLES}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        <ErdLegend />

        <ErdCanvas
          tables={TABLES}
          relations={RELATIONS}
          selected={selected}
          onSelect={setSelected}
        />
      </section>

      <ErdNotes />

      {/* Popup detail tabel: hanya bisa ditutup lewat tombol X (atau Esc) */}
      <Dialog
        open={!!table}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          aria-describedby={undefined}
          onInteractOutside={(e) => e.preventDefault()}
          className="flex max-h-[90vh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl [&>button:last-child]:hidden"
        >
          {table && (
            <TableDetailPanel
              table={table}
              onClose={() => setSelected(null)}
              onSelectTable={setSelected}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
