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

  // Program
  {
    accessorKey: "program",
    header: ({ column }) => {
      const sort = column.getIsSorted();

      return (
        <button
          onClick={() => {
            if (!sort) column.toggleSorting(false); // asc
            else if (sort === "asc") column.toggleSorting(true); // desc
            else column.clearSorting(); // reset
          }}
          className="flex items-center gap-1 w-full cursor-pointer"
        >
          Program
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
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
    cell: ({ row }) => {
      const rawDate = row.original.date;
      if (!rawDate) return <span className="text-gray-400 italic">-</span>;
      const formattedDate = new Date(rawDate).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      return <span>{formattedDate}</span>;
    },
  },

  {
    accessorKey: "projectFile",
    header: "Project",
    cell: ({ row }) => {
      const files: string[] = Array.isArray(row.original.projectFile)
        ? row.original.projectFile
        : row.original.projectFile
        ? [row.original.projectFile]
        : [];

      const document = row.original.document;

      if (files.length > 0) {
        return (
          <>
            {files.map((file, idx) => (
              <div key={idx}>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0CA678] text-sm font-medium hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Lihat – FILE {idx + 1}
                </a>
              </div>
            ))}
          </>
        );
      } else if (document && document.length > 0) {
        return (
          <a
            href={document}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0CA678] text-sm font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Lihat
          </a>
        );
      } else {
        return <span className="text-gray-400 italic">-</span>;
      }
    },
  },
];
