"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ChevronUp, ChevronDown } from "lucide-react";

export type Mentee = {
  id: string;
  photo: string;
  name: string;
  email: string;
  createdAt: string;
  role: string;
  status: string;
};

export const columns: ColumnDef<Mentee>[] = [
  // =========================
  // SELECT (CHECKBOX)
  // =========================
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
  },

  // =========================
  // ID MENTEE (SORTABLE)
  // =========================
  {
    accessorKey: "id",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          className="font-semibold flex items-center gap-1 !cursor-pointer"
          onClick={() => {
            if (!sorted) column.toggleSorting(false);
            else if (sorted === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
        >
          ID Mentee
          {sorted === "asc" && <ChevronDown className="w-4 h-4" />}
          {sorted === "desc" && <ChevronUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  // =========================
  // FOTO (NO SORT)
  // =========================
  {
    accessorKey: "photo",
    header: "Foto",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="relative w-10 h-10 rounded-full overflow-hidden">
        <Image
          src={row.getValue("photo")}
          alt={row.original.name}
          fill
          className="object-cover"
          sizes="40px"
          unoptimized
        />
      </div>
    ),
  },

  // =========================
  // NAMA (SORTABLE)
  // =========================
  {
    accessorKey: "name",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          className="font-semibold flex items-center gap-1 !cursor-pointer"
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

  // =========================
  // EMAIL (SORTABLE)
  // =========================
  {
    accessorKey: "email",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          className="font-semibold flex items-center gap-1 !cursor-pointer"
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

  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      const sorted = column.getIsSorted();
      return (
        <button
          className="font-semibold flex items-center gap-1 !cursor-pointer"
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

    // Format tanggal biar lebih cantik
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return <span>{formatted}</span>;
    },
  },

  // =========================
  // PERAN (FILTER CYCLER)
  // NOW ALSO SUPPORTS AFFILIATOR
  // =========================
  {
    accessorKey: "role",
    enableSorting: false,
    header: ({ table }) => {
      const col = table.getColumn("role");
      const filter = col?.getFilterValue() as string;

      const label = !filter || filter === "" ? "Peran" : `Peran - ${filter}`;

      return (
        <button
          className="font-semibold flex items-center gap-1 !cursor-pointer"
          onClick={() => {
            if (!col) return;
            const current = col.getFilterValue() || "";

            if (current === "") col.setFilterValue("Mentee");
            else if (current === "Mentee") col.setFilterValue("Mentor");
            else if (current === "Mentor") col.setFilterValue("Admin");
            else if (current === "Admin") col.setFilterValue("Affiliator");
            else col.setFilterValue(""); // reset
          }}
        >
          {label}
          {filter && <ChevronDown className="w-4 h-4" />}
        </button>
      );
    },

    cell: ({ row }) => (
      <Badge className="bg-blue-100 text-blue-800">
        {row.getValue("role")}
      </Badge>
    ),
  },
];
