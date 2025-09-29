"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

export type PublishedCertificate = {
  id: string;
  template: string;
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

export const columns: ColumnDef<PublishedCertificate>[] = [
  {
    accessorKey: "id",
    header: "ID Sertifikat",
  },
  {
    accessorKey: "template",
    header: "Foto Template",
    cell: ({ row }) => (
      <div className="w-16 h-10 bg-gray-200 rounded border flex items-center justify-center">
        <img src={row.original.template} alt="template" className="object-cover rounded" />
      </div>
    ),
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
