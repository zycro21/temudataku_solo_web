"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown, Download, RotateCcw, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type Project = {
  id: string;
  date: string;
  jenisData: string[];
  ukuranFile: string;
  formatFile: "JSON" | "CSV" | "XLSX";
  status: "berhasil" | "gagal";
};

const formatCycle = ["JSON", "CSV", "XLSX"] as const;
const statusCycle = ["berhasil", "gagal"] as const;

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "berhasil":
      return "bg-green-100 text-green-500 border border-green-500";
    case "gagal":
      return "bg-red-100 text-red-500 border border-red-500";
    default:
      return "bg-gray-100 text-gray-800";
  }
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
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
      />
    ),
    enableSorting: false,
  },

  /* ============================
     SORT 3 MODE – DATE
  ============================ */
  {
    accessorKey: "date",
    header: ({ column }) => {
      const sort = column.getIsSorted(); // false | "asc" | "desc"

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
          Tanggal & Waktu
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  /* ============================
     SORT 3 MODE – JENIS DATA
  ============================ */
  {
    accessorKey: "jenisData",
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
          Jenis Data
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
    cell: ({ row }) =>
      row.original.jenisData.map((v, i) => (
        <span key={i} className="px-2 py-1 bg-gray-100 rounded mr-1">
          {v}
        </span>
      )),
  },

  /* ============================
     SORT 3 MODE – UKURAN FILE
  ============================ */
  {
    accessorKey: "ukuranFile",
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
          Ukuran File
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  /* ============================
     FILTER 4 MODE – FORMAT FILE
     JSON → CSV → XLSX → RESET
  ============================ */
  {
    accessorKey: "formatFile",
    header: ({ column }) => {
      const filter = column.getFilterValue() as string | undefined;

      const nextFilter = () => {
        if (!filter) return formatCycle[0];
        const idx = formatCycle.indexOf(filter as any);
        if (idx === -1 || idx === formatCycle.length - 1) return undefined;
        return formatCycle[idx + 1];
      };

      return (
        <button
          onClick={() => column.setFilterValue(nextFilter())}
          className={`flex items-center gap-1 w-full cursor-pointer  
            ${filter ? "bg-emerald-200" : ""}`}
        >
          {filter ? `Format File – ${filter}` : "Format File"}
        </button>
      );
    },
  },

  /* ============================
     FILTER 3 MODE – STATUS
     berhasil → gagal → RESET
  ============================ */
  {
    accessorKey: "status",
    header: ({ column }) => {
      const filter = column.getFilterValue() as string | undefined;

      const nextFilter = () => {
        if (!filter) return statusCycle[0];
        const idx = statusCycle.indexOf(filter as any);
        if (idx === -1 || idx === statusCycle.length - 1) return undefined;
        return statusCycle[idx + 1];
      };

      return (
        <button
          onClick={() => column.setFilterValue(nextFilter())}
          className={`flex items-center gap-1 w-full cursor-pointer  
            ${filter ? "bg-emerald-200" : ""}`}
        >
          {filter ? `Status – ${filter}` : "Status"}
        </button>
      );
    },
    cell: ({ row }) => (
      <Badge className={getStatusBadgeColor(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },

  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <div className="flex items-center space-x-2">
          {status === "berhasil" ? (
            <Button
              size="sm"
              variant="outline"
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
              onClick={() => console.log("Unduh:", row.original.id)}
            >
              <Download className="w-4 h-4" />
            </Button>
          ) : status === "gagal" ? (
            <Button
              size="sm"
              variant="outline"
              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
              onClick={() => console.log("Ulang:", row.original.id)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0 bg-[#0CA678] hover:bg-[#08916C] text-white border-[#0CA678]"
              onClick={() => console.log("Edit:", row.original.id)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            className="w-8 h-8 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500"
            onClick={() => console.log("Hapus:", row.original.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    },
  },
];
