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

  // TAMBAHAN
  skor: number;
  publicVisible: boolean;

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
    accessorKey: "topic",
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
          Nama Program
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
    accessorKey: "publicVisible",
    enableSorting: false,
    header: () => (
      <div className="text-center">
        Tampil
        <br />
        Publik
      </div>
    ),
    cell: ({ getValue }) => {
      const visible = getValue<boolean>();

      return (
        <div className="flex justify-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold
            ${
              visible
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {visible ? "Ya" : "Tidak"}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "skor",
    header: ({ column }) => {
      const sort = column.getIsSorted();

      return (
        <button
          onClick={() => {
            if (!sort) column.toggleSorting(false);
            else if (sort === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
          className={`flex items-center justify-center gap-1 w-full cursor-pointer
        ${sort ? "bg-emerald-200" : ""}`}
        >
          Skor Keseluruhan
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },

    // INI PENTING: center-in value
    cell: ({ getValue }) => {
      const value = getValue<number>();

      return (
        <div
          className={`flex justify-center font-semibold
        ${
          value >= 90
            ? "text-emerald-600"
            : value >= 75
            ? "text-yellow-600"
            : "text-red-600"
        }`}
        >
          {value}
        </div>
      );
    },
  },
];
