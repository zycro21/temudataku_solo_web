"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Download, Edit, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Tipe data Project
export type Project = {
  id: string;
  date: string; // Tanggal & Waktu Pengumpulan
  jenisData: string;
  ukuranFile: string;
  formatFile: string;
  status: string;
};

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
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
    size: 40, // biar kecil, sama seperti w-12
  },
  {
    accessorKey: "date",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Tanggal & Waktu</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
  {
    accessorKey: "jenisData",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Jenis Data</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
  {
    accessorKey: "ukuranFile",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Ukuran File</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
  {
    accessorKey: "formatFile",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Format File</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Status</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Badge className={getStatusBadgeColor(row.original.status)}>
          <span className="capitalize">{row.original.status}</span>
        </Badge>
      </div>
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
            <Button size="sm" variant="outline" className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white border-blue-500" onClick={() => console.log("Unduh:", row.original.id)}>
              <Download className="w-4 h-4" />
            </Button>
          ) : status === "gagal" ? (
            <Button size="sm" variant="outline" className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500" onClick={() => console.log("Ulang:", row.original.id)}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-[#0CA678] hover:bg-[#08916C] text-white border-[#0CA678]" onClick={() => console.log("Edit:", row.original.id)}>
              <Edit className="w-4 h-4" />
            </Button>
          )}

          <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500" onClick={() => console.log("Hapus:", row.original.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    },
  },
];
