"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown } from "lucide-react";

// Tipe data mentee
export type SesiMentoring = {
  id: string;
  serviceId: string;
  mentor: string;
  mentorProfileId: string;
  program: string;
  durasi: string;
  topik: string;
  date: string;
  rawDate: string; // "20-10-2025"
  rawStartTime: string; // ISO
  rawEndTime: string;
  time: string;
  dokumenPendukung: string;
  ukuranFile: number | null;
  status: string;
};

export const columns: ColumnDef<SesiMentoring>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
  },

  // ==========================
  // ID MENTORING (SORT ASC/DESC/RESET)
  // ==========================
  {
    accessorKey: "id",
    header: ({ column }) => {
      const sort = column.getIsSorted(); // false | "asc" | "desc"

      return (
        <button
          onClick={() => {
            if (!sort) column.toggleSorting(false); // ASC
            else if (sort === "asc") column.toggleSorting(true); // DESC
            else column.clearSorting(); // RESET
          }}
          className={`flex items-center gap-1 cursor-pointer ${
            sort ? "bg-emerald-200 px-2 py-1 rounded" : ""
          }`}
        >
          ID Mentoring
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  {
    accessorKey: "mentor",
    header: ({ column }) => {
      const sort = column.getIsSorted();

      return (
        <button
          onClick={() => {
            if (!sort) column.toggleSorting(false); // ASC
            else if (sort === "asc") column.toggleSorting(true); // DESC
            else column.clearSorting(); // RESET
          }}
          className={`flex items-center gap-1 cursor-pointer ${
            sort ? "bg-emerald-200 px-2 py-1 rounded" : ""
          }`}
        >
          Mentor
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  // ================================
  // PROGRAM (MULTI FILTER CYCLE)
  // ================================
  {
    accessorKey: "program",
    header: ({ column, table }) => {
      const filter = column.getFilterValue() as string | undefined;

      // Urutan filter yang kamu minta
      const programCycle = [
        "Bootcamp",
        "Short Class",
        "Live Class",
        "1 on 1 Mentoring",
        "Group Mentoring",
      ];

      return (
        <button
          className={`flex items-center gap-1 py-1 cursor-pointer ${
            filter ? "bg-emerald-200" : ""
          }`}
          onClick={() => {
            const idx = programCycle.indexOf(filter ?? "");

            if (idx === -1) {
              column.setFilterValue(programCycle[0]);
            } else if (idx < programCycle.length - 1) {
              column.setFilterValue(programCycle[idx + 1]);
            } else {
              column.setFilterValue(undefined); // reset
            }
          }}
        >
          {filter ? `Program - ${filter}` : "Program"}
        </button>
      );
    },
  },

  // ============================
  // TOPIK (SORT ASC/DESC/RESET)
  // ============================
  {
    accessorKey: "topik",
    header: ({ column }) => {
      const sort = column.getIsSorted();

      return (
        <button
          onClick={() => {
            if (!sort) column.toggleSorting(false);
            else if (sort === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
          className={`flex items-center gap-1 cursor-pointer ${
            sort ? "bg-emerald-200 px-2 py-1 rounded" : ""
          }`}
        >
          Topik
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  // ================================
  // DOKUMEN PENDUKUNG (SORT 3 MODE)
  // ================================
  {
    accessorKey: "dokumenPendukung",
    header: ({ column }) => {
      const sort = column.getIsSorted();

      return (
        <button
          onClick={() => {
            if (!sort) column.toggleSorting(false);
            else if (sort === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
          className={`flex items-center gap-1 cursor-pointer ${
            sort ? "bg-emerald-200 px-2 py-1 rounded" : ""
          }`}
        >
          Dokumen Pendukung
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },
];
