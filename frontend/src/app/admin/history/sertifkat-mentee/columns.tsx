"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
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
    accessorKey: "mentee",
    header: "Mentee",
  },
  {
    accessorKey: "name",
    header: "Nama Sertifikat",
  },
  {
    accessorKey: "program",
    header: "Program",
    cell: ({ row }) => <Badge className={getProgramBadgeColor(row.original.program)}>{row.original.program}</Badge>,
  },
  {
    accessorKey: "date",
    header: "Tanggal & Waktu",
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
