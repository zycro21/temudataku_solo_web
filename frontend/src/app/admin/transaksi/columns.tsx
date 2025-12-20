"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown } from "lucide-react";

export type Project = {
  paymentId: string;   // ⬅️ MURNI ID DB (dipakai update)
  displayId: string;

  mentee: string;
  mentor: string;
  program: string;
  topic: string;
  date: string;
  totalHarga: string;
  statusTransaksi: string;
  alasan: string;
  type: string;
};

function threeModeSort(column: any) {
  const sort = column.getIsSorted();
  if (!sort) column.toggleSorting(false); // ASC
  else if (sort === "asc") column.toggleSorting(true); // DESC
  else column.clearSorting(); // RESET
}

export const columns: ColumnDef<Project>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    size: 40,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
      />
    ),
  },

  /* ================================
     SORTING 3 MODE: id, mentee, mentor, topic
  ================================= */
  {
    accessorKey: "displayId",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return (
        <button
          onClick={() => threeModeSort(column)}
          className={`flex items-center gap-1 w-full cursor-pointer ${
            sort ? "bg-emerald-200" : ""
          }`}
        >
          ID Transaksi
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  {
    accessorKey: "mentee",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return (
        <button
          onClick={() => threeModeSort(column)}
          className={`flex items-center gap-1 w-full cursor-pointer ${
            sort ? "bg-emerald-200" : ""
          }`}
        >
          Mentee
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  {
    accessorKey: "type",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return (
        <button
          onClick={() => threeModeSort(column)}
          className={`flex items-center gap-1 w-full cursor-pointer ${
            sort ? "bg-emerald-200" : ""
          }`}
        >
          Tipe
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  /* ================================
      FILTER 8 MODE: PROGRAM
  ================================= */
  {
    accessorKey: "program",
    header: ({ column }) => {
      const filter = column.getFilterValue() as string | undefined;

      const cycle = [
        "Bootcamp",
        "Short Class",
        "Live Class",
        "1 on 1 Mentoring",
        "Group Mentoring",
      ];

      const next = () => {
        if (!filter) return cycle[0];
        const index = cycle.indexOf(filter);
        if (index === -1 || index === cycle.length - 1) return undefined; // reset
        return cycle[index + 1];
      };

      return (
        <button
          onClick={() => column.setFilterValue(next())}
          className={`flex items-center gap-1 w-full cursor-pointer bg-transparent ${
            filter ? "bg-emerald-200" : ""
          }`}
        >
          {filter ? `Program – ${filter}` : "Program"}
        </button>
      );
    },
  },

  {
    accessorKey: "topic",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return (
        <button
          onClick={() => threeModeSort(column)}
          className={`flex items-center gap-1 w-full cursor-pointer ${
            sort ? "bg-emerald-200" : ""
          }`}
        >
          Topik/Judul
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  {
    accessorKey: "date",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return (
        <button
          onClick={() => threeModeSort(column)}
          className={`flex items-center gap-1 w-full cursor-pointer ${
            sort ? "bg-emerald-200" : ""
          }`}
        >
          Tanggal
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },
];
