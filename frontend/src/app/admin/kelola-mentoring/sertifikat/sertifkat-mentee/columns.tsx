"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export type MenteeCertificate = {
  id: string;
  mentee: string;
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

export const columnsMentee: ColumnDef<MenteeCertificate>[] = [
  // =====================================================
  // CHECKBOX
  // =====================================================
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

  // =====================================================
  // 1. ID (Sorting 3 Mode)
  // =====================================================
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

  // =====================================================
  // 2. MENTEE (Sorting 3 Mode)
  // =====================================================
  {
    accessorKey: "mentee",
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
          Mentee
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  // =====================================================
  // 3. NAMA SERTIFIKAT (Sorting 3 Mode)
  // =====================================================
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

  // =====================================================
  // 4. PROGRAM (Filter 4 Mode)
  // =====================================================
  {
    accessorKey: "program",
    enableGlobalFilter: true,
    header: ({ column }) => {
      const filter = column.getFilterValue() as string | undefined;

      return (
        <button
          className="flex items-center w-full cursor-pointer"
          onClick={() => {
            if (!filter) {
              column.setFilterValue("Bootcamp");
              return;
            }
            if (filter === "Bootcamp") {
              column.setFilterValue("Short Class");
              return;
            }
            if (filter === "Short Class") {
              column.setFilterValue("Live Class");
              return;
            }

            // Klik ke-4 → RESET FILTER (referensi: columns.tsx)
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

  // =====================================================
  // 5. DATE (Sorting 3 Mode)
  // =====================================================
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

  // =====================================================
  // 6. ACTIONS
  // =====================================================
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
            const meta = table.options.meta as any;
            meta?.onView?.(row.original);
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-[#0CA678] hover:bg-[#08916C] text-white border-[#0CA678]"
          onClick={() => {
            const meta = table.options.meta as any;
            meta?.onEdit?.(row.original);
          }}
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
