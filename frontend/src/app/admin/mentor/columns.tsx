"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

// Tipe data mentee
export type Mentor = {
  id: string;
  photo: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  bio: string;
};

export const columns: ColumnDef<Mentor>[] = [
  {
    id: "select",
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID Mentee",
  },
  {
    accessorKey: "photo",
    header: "Foto",
    cell: ({ row }) => <Image src={row.getValue("photo") || "/placeholder.svg"} alt={row.original.name} width={40} height={40} className="rounded-full" />,
  },
  {
    accessorKey: "name",
    header: "Nama Lengkap",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Peran",
    cell: ({ row }) => (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        {row.getValue("role")}
      </Badge>
    ),
  },
];
