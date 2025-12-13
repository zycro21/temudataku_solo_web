"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export type PublishedCertificate = {
  id: string;
  template: string;
  name: string;
  program: string;
  date: string;
};

const getProgramBadgeColor = (program: string) => {
  switch (program) {
    case "Short Class":
      return "bg-blue-100 text-blue-800";
    case "Live Class":
      return "bg-purple-100 text-purple-800";
    case "Bootcamp":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const columns: ColumnDef<PublishedCertificate>[] = [
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
    size: 40,
  },

  // ==========================
  // 1. ID SERTIFIKAT (Sorting 3 mode)
  // ==========================
  {
    accessorKey: "id",
    enableGlobalFilter: true,
    header: ({ column }) => {
      const sort = column.getIsSorted();

      return (
        <button
          onClick={() => {
            if (!sort) column.toggleSorting(false); // ASC
            else if (sort === "asc") column.toggleSorting(true); // DESC
            else column.clearSorting(); // RESET
          }}
          className="flex items-center gap-1 w-full cursor-pointer"
        >
          ID Sertifikat
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  {
    accessorKey: "template",
    header: "Foto Template",
    cell: ({ row }) => (
      <div className="w-16 h-10 bg-gray-200 rounded border flex items-center justify-center">
        <img
          src={row.original.template}
          alt="template"
          className="object-cover rounded w-full h-full"
        />
      </div>
    ),
  },

  // ==========================
  // 2. NAMA SERTIFIKAT (Sorting 3 mode)
  // ==========================
  {
    accessorKey: "name",
    enableGlobalFilter: true,
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
          Nama Sertifikat
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  // ==========================
  // 3. PROGRAM (Filter 4 mode)
  // ==========================
  {
    accessorKey: "program",
    enableGlobalFilter: true,
    header: ({ column }) => {
      const filter = column.getFilterValue() as string | undefined;

      const cycle = ["Bootcamp", "Short Class", "Live Class"];

      return (
        <button
          className="flex items-center w-full cursor-pointer"
          onClick={() => {
            // 1 → Bootcamp
            if (!filter) {
              column.setFilterValue("Bootcamp");
              return;
            }

            // 2 → Short Class
            if (filter === "Bootcamp") {
              column.setFilterValue("Short Class");
              return;
            }

            // 3 → Live Class
            if (filter === "Short Class") {
              column.setFilterValue("Live Class");
              return;
            }

            // 4 → Reset (clear)
            column.setFilterValue(undefined);
          }}
        >
          {filter ? `Program - ${filter}` : "Program"}
        </button>
      );
    },
    cell: ({ row }) => (
      <Badge className={getProgramBadgeColor(row.original.program)}>
        {row.original.program}
      </Badge>
    ),
  },

  // ==========================
  // 4. Tanggal (Sorting 3 mode)
  // ==========================
  {
    accessorKey: "date",
    enableGlobalFilter: true,
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
          Tanggal & Waktu
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  // Actions
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row, table }) => (
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
          onClick={() => {
            // cast meta ke any supaya TS tidak complain
            const meta = table.options.meta as any;
            meta?.onView?.(row.original);
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-[#0CA678] hover:bg-[#08916C] text-white border-[#0CA678]]"
        >
          <Edit className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];
