"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Edit, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Tipe data Project
export type Project = {
  id: string;
  mentee: string;
  date: string; // Tanggal & Waktu Pengumpulan
  submissionStatus: string;
  reviewStatus: string;
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "sudah dikumpulkan":
      return "bg-green-100 text-green-500 border border-green-500";
    case "sudah direview":
      return "bg-green-100 text-green-500 border border-green-500";
    case "belum dikumpulkan":
      return "bg-yellow-100 text-yellow-500 border border-yellow-500";
    case "belum direview":
      return "bg-yellow-100 text-yellow-500 border border-yellow-500";
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
    accessorKey: "id",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>ID Sesi</span>
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
    accessorKey: "date",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Tanggal & Waktu Sesi</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
  {
    accessorKey: "submissionStatus",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Status Pengumpulan</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Badge className={getStatusBadgeColor(row.original.submissionStatus)}>
          <span className="capitalize">{row.original.submissionStatus}</span>
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "reviewStatus",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Status Review</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Badge className={getStatusBadgeColor(row.original.reviewStatus)}>
          <span className="capitalize">{row.original.reviewStatus}</span>
        </Badge>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: () => (
      <div className="flex items-center space-x-2">
        <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-500">
          <Eye className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-[#0CA678] hover:bg-[#08916C] text-white border-[#0CA678]">
          <Edit className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];
