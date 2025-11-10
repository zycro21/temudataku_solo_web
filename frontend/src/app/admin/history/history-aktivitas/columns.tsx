"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export type historyAktivitas = {
  id: string;
  date: string;
  namaPengguna: string;
  role: string;
  aktivitas: string;
  ipAddress: string;
  status: string;
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

export const columns: ColumnDef<historyAktivitas>[] = [
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
    accessorKey: "aktivitas",
    header: "Aktivitas",
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
];
