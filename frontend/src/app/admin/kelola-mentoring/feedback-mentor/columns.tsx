"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown } from "lucide-react";

// Tipe data Project
export type Datas = {
  id: string;
  mentor: string;
  program: string;
  date: string; // Tanggal & Waktu Pengumpulan
  topic: string;
  evaluasi: {
    understanding: string;
    common_question: string;
    kendala: string;
    tantangan: string;
    catatan_mentor: string;
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
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },

  /* ===========================
     SORTING 3-MODE TEMPLATE
  ============================ */
  {
    accessorKey: "id",
    header: ({ column }) => {
      const sort = column.getIsSorted();

      return (
        <button
          onClick={() => {
            if (!sort) column.toggleSorting(false); // pertama ASC
            else if (sort === "asc") column.toggleSorting(true); // kedua DESC
            else column.clearSorting(); // ketiga RESET
          }}
          className={`flex items-center gap-1 w-full cursor-pointer 
            ${sort ? "bg-emerald-200" : ""}`}
        >
          ID Feedback Mentor
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
          Tanggal & Waktu
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

  /* ===========================
         PROGRAM FILTER
     (Bootcamp → Short Class → Live Class → RESET)
  ============================ */
  {
    accessorKey: "program",
    header: ({ column }) => {
      const filter = column.getFilterValue() as string | undefined;
      const cycle = ["Bootcamp", "Short Class", "Live Class", "1 on 1 Mentoring", "Group Mentoring"];

      const next = () => {
        if (!filter) return cycle[0];
        const i = cycle.indexOf(filter);
        if (i < cycle.length - 1) return cycle[i + 1];
        return undefined; // reset
      };

      return (
        <button
          onClick={() => column.setFilterValue(next())}
          className={`flex items-center gap-1 w-full cursor-pointer 
            ${filter ? "bg-emerald-200" : ""}`}
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
          onClick={() => {
            if (!sort) column.toggleSorting(false);
            else if (sort === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
          className={`flex items-center gap-1 w-full cursor-pointer 
            ${sort ? "bg-emerald-200" : ""}`}
        >
          Topik
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },
];
