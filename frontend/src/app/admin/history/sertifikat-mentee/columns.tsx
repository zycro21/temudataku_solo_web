"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export type loginHistory = {
  id: string;
  date: string;
  namaPengguna: string;
  role: string;
  perangkat: string;
  ipAddress: string;
  status: string;
  aksi: string;
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "berhasil":
      return "bg-green-100 text-green-800 border border-green-500";
    case "gagal":
      return "bg-red-100 text-red-800 border border-red-500";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-500";
  }
};

export const columns: ColumnDef<loginHistory>[] = [
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
    header: "ID Sertifikat",
  },
  {
    accessorKey: "date",
    header: "Tanggal & Waktu",
  },
  {
    accessorKey: "namaPengguna",
    header: "Nama Pengguna",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "perangkat",
    header: "Perangkat",
  },
  {
    accessorKey: "ipAddress",
    header: "IP Address",
  },
  {
    accessorKey: "status",
    header: "Program",
    cell: ({ row }) => <Badge className={getStatusBadgeColor(row.original.status)}>{row.original.status}</Badge>,
  },
  {
    accessorKey: "aksi",
    header: "Aksi",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-[#0CA678] hover:bg-[#08916C] text-white border-[#0CA678]" onClick={() => console.log("Edit:", row.original.id)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500" onClick={() => console.log("Hapus:", row.original.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];
