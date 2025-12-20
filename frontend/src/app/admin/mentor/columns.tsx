"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ChevronUp, ChevronDown } from "lucide-react";

export type Mentor = {
  id: string;
  photo: string;
  name: string;
  registeredAt: string;
  email: string;
  role: string;
  status: string;
  bio?: string;
  expertise?: string;
};

export const columns: ColumnDef<Mentor>[] = [
  // SELECT
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  },

  // ID (sortable)
  {
    accessorKey: "id",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          className="font-semibold flex items-center gap-1 cursor-pointer"
          onClick={() => {
            if (!sorted) column.toggleSorting(false);
            else if (sorted === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
        >
          ID Mentor
          {sorted === "asc" && <ChevronDown className="w-4 h-4" />}
          {sorted === "desc" && <ChevronUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  // PHOTO (not sortable / not clickable)
  {
    accessorKey: "photo",
    header: "Foto",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="w-10 h-10 rounded-full overflow-hidden">
        <Image
          src={row.getValue("photo") || "/assets/dashboard/user/avatar.png"}
          alt={row.original.name}
          width={15}
          height={15}
          unoptimized
          className="object-cover w-full h-full"
        />
      </div>
    ),
  },

  // NAME (sortable)
  {
    accessorKey: "name",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          className="font-semibold flex items-center gap-1 cursor-pointer"
          onClick={() => {
            if (!sorted) column.toggleSorting(false);
            else if (sorted === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
        >
          Nama Lengkap
          {sorted === "asc" && <ChevronDown className="w-4 h-4" />}
          {sorted === "desc" && <ChevronUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  // REGISTERED AT (sortable)
  {
    accessorKey: "registeredAt",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          className="font-semibold flex items-center gap-1 cursor-pointer"
          onClick={() => {
            if (!sorted) column.toggleSorting(false);
            else if (sorted === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
        >
          Tanggal Registrasi
          {sorted === "asc" && <ChevronDown className="w-4 h-4" />}
          {sorted === "desc" && <ChevronUp className="w-4 h-4" />}
        </button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("registeredAt"));
      return (
        <span className="text-sm text-gray-600">
          {date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      );
    },
  },

  // EMAIL (sortable)
  {
    accessorKey: "email",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          className="font-semibold flex items-center gap-1 cursor-pointer"
          onClick={() => {
            if (!sorted) column.toggleSorting(false);
            else if (sorted === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
        >
          Email
          {sorted === "asc" && <ChevronDown className="w-4 h-4" />}
          {sorted === "desc" && <ChevronUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  // ROLE (not clickable for mentor — only show badge)
  {
    accessorKey: "role",
    header: "Peran",
    enableSorting: false,
    cell: ({ row }) => (
      <Badge className="bg-blue-100 text-blue-800">
        {row.getValue("role")}
      </Badge>
    ),
  },

  // (optional) status column
  {
    accessorKey: "status",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          className="font-semibold flex items-center gap-1 cursor-pointer"
          onClick={() => {
            if (!sorted) column.toggleSorting(false);
            else if (sorted === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
        >
          Status
          {sorted === "asc" && <ChevronDown className="w-4 h-4" />}
          {sorted === "desc" && <ChevronUp className="w-4 h-4" />}
        </button>
      );
    },
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("status")}</span>
    ),
  },
];
