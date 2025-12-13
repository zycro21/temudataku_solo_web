"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown } from "lucide-react";

// tipe
export type Datas = {
  id: string;
  mentor: string;
  mentee: string;
  program: string;
  date: string;
  topic: string;
  evaluasi: {
    kemudahan_materi: number;
    kejelasan_materi: number;
    mentor_menjawab: number;
    pelaksanaan: number;
    kesesuaian_jadwal: number;
    kualitas_platform: number;
    masukkan: string;
    catatan_tambahan: string;
  };
} | null;

export const columns: ColumnDef<Datas>[] = [
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

  /* ==========================
     SORTING 3-MODE TEMPLATE
     (ASC → DESC → RESET)
  =========================== */
  {
    accessorKey: "id",
    header: ({ column }) => {
      const sort = column.getIsSorted();

      return (
        <button
          onClick={() => {
            if (!sort) column.toggleSorting(false); // ASC
            else if (sort === "asc") column.toggleSorting(true); // DESC
            else column.clearSorting(); // RESET
          }}
          className={`flex items-center gap-1 w-full cursor-pointer 
            ${sort ? "bg-emerald-200" : ""}`}
        >
          ID
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
          onClick={() => {
            if (!sort) column.toggleSorting(false);
            else if (sort === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
          className={`flex items-center gap-1 w-full cursor-pointer  
            ${sort ? "bg-emerald-200" : ""}`}
        >
          Tanggal & Waktu Sesi
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
          onClick={() => {
            if (!sort) column.toggleSorting(false);
            else if (sort === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
          className={`flex items-center gap-1 w-full cursor-pointer 
            ${sort ? "bg-emerald-200" : ""}`}
        >
          Mentee
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
            if (!sort) column.toggleSorting(false);
            else if (sort === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
          className={`flex items-center gap-1 w-full cursor-pointer  
            ${sort ? "bg-emerald-200" : ""}`}
        >
          Mentor
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  /* ==========================
       FILTER 5-MODE PROGRAM
     Bootcamp → LC/SC → 1on1 → Group → RESET
  =========================== */
  {
    accessorKey: "program",
    header: ({ column }) => {
      const filter = column.getFilterValue() as string | undefined;

      const cycle = [
        "Bootcamp",
        "Live Class",
        "Short Class",
        "1 on 1 Mentoring",
        "Group Mentoring",
      ];

      const next = () => {
        if (!filter) return cycle[0];
        const i = cycle.indexOf(filter);
        if (i === -1 || i === cycle.length - 1) return undefined;
        return cycle[i + 1];
      };

      const isFiltered = !!filter;

      return (
        <button
          onClick={() => column.setFilterValue(next())}
          className={`
          flex items-center gap-1 w-full cursor-pointer 
          ${isFiltered ? "bg-emerald-200" : "bg-gray-100"} 
        `}
        >
          {filter ? `Program – ${filter}` : "Program"}
        </button>
      );
    },
  },

  {
    accessorKey: "evaluasi.kemudahan_materi",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return (
        <button
          onClick={() => {
            if (!sort) column.toggleSorting(false);
            else if (sort === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
          className={`flex items-center gap-1 w-full cursor-pointer 
            ${sort ? "bg-emerald-200" : ""}`}
        >
          Materi Mudah Dimengerti
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },
];
