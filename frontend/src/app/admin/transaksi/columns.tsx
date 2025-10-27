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
  topic: string;
  date: string; // Tanggal & Waktu Pengumpulan
  totalHarga: string;
  statusTransaksi: string;
  alasan: string;
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
    accessorKey: "id",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>ID Transaksi</span>
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
    accessorKey: "topic",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Topik</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
];
