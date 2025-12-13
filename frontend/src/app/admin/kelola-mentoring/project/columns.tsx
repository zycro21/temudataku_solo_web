"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown } from "lucide-react";

// Tipe data Project
export type Project = {
  id: string;
  mentee: string;
  mentor: string;
  program: string;
  date: string; // Tanggal & Waktu Pengumpulan
  deadline?: string;
  projectFile: string; // link file / nama file
  topic: string;
  statusDetail: string;
  score: string;
  document: string;
};

export const columns: ColumnDef<Project>[] = [
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
    size: 40,
  },

  // ID Project (Sorting 3-mode)
  {
    accessorKey: "id",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return (
        <button
          onClick={() => {
            if (!sort) column.toggleSorting(false);
            else if (sort === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
          className="flex items-center gap-1 w-full cursor-pointer"
        >
          ID Project
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  // Mentee
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
          className="flex items-center gap-1 w-full cursor-pointer"
        >
          Mentee
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  // Mentor
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
          className="flex items-center gap-1 w-full cursor-pointer"
        >
          Mentor
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  // Program (Filter cycle)
  {
    accessorKey: "program",
    header: ({ column }) => {
      const filter = column.getFilterValue() as string | undefined;
      const programCycle = ["Bootcamp", "Live Class", "Short Class"];
      return (
        <button
          className="flex items-center gap-1 w-full cursor-pointer"
          onClick={() => {
            if (!filter) column.setFilterValue(programCycle[0]);
            else if (programCycle.indexOf(filter) < programCycle.length - 1)
              column.setFilterValue(
                programCycle[programCycle.indexOf(filter) + 1]
              );
            else column.setFilterValue(undefined); // reset
          }}
        >
          {filter ? `Program - ${filter}` : "Program"}
        </button>
      );
    },
  },

  // Tanggal & Waktu Pengumpulan
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
          className="flex items-center gap-1 w-full cursor-pointer"
        >
          Tanggal & Waktu Pengumpulan
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  // Project file
  {
    accessorKey: "projectFile",
    header: "Project",
    cell: ({ row }) => {
      const file = row.original.projectFile;
      return file ? (
        <a
          href={file}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Lihat
        </a>
      ) : (
        <span className="text-gray-400 italic">-</span>
      );
    },
  },
];
