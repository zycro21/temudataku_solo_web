"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";

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
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40, // biar kecil, sama seperti w-12
  },
  {
    accessorKey: "id",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>ID Project</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
  {
    accessorKey: "mentee",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Mentee</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
  {
    accessorKey: "mentor",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Mentor</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
  {
    accessorKey: "program",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Program</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Tanggal & Waktu Pengumpulan</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
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
