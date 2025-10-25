"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";

// Tipe data Project
export type Datas = {
  id: string;
  mentor: string;
  mentee: string;
  program: string;
  date: string; // Tanggal & Waktu Pengumpulan
  topic: string;
  evaluasi: {
    kemudahan_materi: number;
    kejelasan_materi: number;
    mentor_menjawab: number;
    pelaksanaan: number;
    kesesuaian_jadwal: number;
    kualitas_platform: number;
    masukkan: string;
    catatan_tambahan: string;
  };
} | null;

export const columns: ColumnDef<Datas>[] = [
  {
    id: "select",
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
    size: 40,
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
    accessorKey: "date",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Tanggal & Waktu Sesi</span>
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
  {
    accessorKey: "evaluasi.kemudahan_materi",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Kepuasan Keterlibatan Mentor</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
];
