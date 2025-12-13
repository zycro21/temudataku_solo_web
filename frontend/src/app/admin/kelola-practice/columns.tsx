"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Edit, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";

export type Project = {
  id: string;
  mentee: string;
  date: string;
  submissionStatus: string;
  reviewStatus: string;
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "sudah dikumpulkan":
    case "sudah direview":
      return "bg-green-100 text-green-600 border border-green-600";
    case "belum dikumpulkan":
    case "belum direview":
      return "bg-yellow-100 text-yellow-600 border border-yellow-600";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

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

  /* ===========================
        SORTING ID (3 mode)
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
          ID Sesi
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  /* ===========================
        SORTING MENTEE
     =========================== */
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

  /* ===========================
        SORTING DATE
     =========================== */
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

  /* ===========================
        FILTER SUBMISSION
     =========================== */
  {
    accessorKey: "submissionStatus",
    header: ({ column }) => {
      const filter = column.getFilterValue() as string | undefined;

      const cycle = ["belum dikumpulkan", "sudah dikumpulkan"];

      const next = () => {
        if (!filter) return cycle[0];
        const i = cycle.indexOf(filter);
        if (i === cycle.length - 1) return undefined;
        return cycle[i + 1];
      };

      const isFiltered = !!filter;

      return (
        <button
          onClick={() => column.setFilterValue(next())}
          className={`flex items-center gap-1 w-full cursor-pointer 
            ${isFiltered ? "bg-emerald-200" : "bg-gray-100"}`}
        >
          {filter ? `Status Pengumpulan – ${filter}` : "Status Pengumpulan"}
        </button>
      );
    },
    cell: ({ row }) => (
      <Badge className={getStatusBadgeColor(row.original.submissionStatus)}>
        {row.original.submissionStatus}
      </Badge>
    ),
  },

  /* ===========================
        FILTER REVIEW
     =========================== */
  {
    accessorKey: "reviewStatus",
    header: ({ column }) => {
      const filter = column.getFilterValue() as string | undefined;

      const cycle = ["belum direview", "sudah direview"];

      const next = () => {
        if (!filter) return cycle[0];
        const i = cycle.indexOf(filter);
        if (i === cycle.length - 1) return undefined;
        return cycle[i + 1];
      };

      const isFiltered = !!filter;

      return (
        <button
          onClick={() => column.setFilterValue(next())}
          className={`flex items-center gap-1 w-full cursor-pointer 
            ${isFiltered ? "bg-emerald-200" : "bg-gray-100"}`}
        >
          {filter ? `Status Review – ${filter}` : "Status Review"}
        </button>
      );
    },
    cell: ({ row }) => (
      <Badge className={getStatusBadgeColor(row.original.reviewStatus)}>
        {row.original.reviewStatus}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row, table }) => (
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
          onClick={(e) => {
            e.stopPropagation();
            table.options.meta?.onView?.(row.original);
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-[#0CA678] hover:bg-[#08916C] text-white border-[#0CA678]"
          onClick={(e) => {
            e.stopPropagation();
            table.options.meta?.onEdit?.(row.original);
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500"
          onClick={(e) => {
            e.stopPropagation();
            table.options.meta?.onDelete?.(row.original);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];
