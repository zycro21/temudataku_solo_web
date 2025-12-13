"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";

export type historyAktivitas = {
  id: string;
  date: string;
  namaPengguna: string;
  role: string;
  aktivitas: string;
  ipAddress: string;
  status: string;
};

// Badge warna status
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "berhasil":
      return "bg-green-100 text-green-800 border border-green-500";
    case "gagal":
      return "bg-red-100 text-red-800 border border-red-500";
    default:
      return "bg-gray-100 text-gray-800 border-gray-500";
  }
};

// Role filter cycle
const roleCycle = ["Admin", "Mentor", "Mentee", "Affiliator"];

// Status filter cycle
const statusCycle = ["berhasil", "gagal"];

export const columns: ColumnDef<historyAktivitas>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    size: 40,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
      />
    ),
  },

  /* ================================
     SORT 3 MODE – DATE
  ================================= */
  {
    accessorKey: "date",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return (
        <button
          onClick={() => {
            if (!sort) column.toggleSorting(false); // ASC
            else if (sort === "asc") column.toggleSorting(true); // DESC
            else column.clearSorting(); // RESET
          }}
          className={`flex items-center gap-1 w-full cursor-pointer 
            ${sort ? "bg-emerald-200" : ""}`}
        >
          Tanggal & Waktu
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  /* ================================
     SORT 3 MODE – NAMA PENGGUNA
  ================================= */
  {
    accessorKey: "namaPengguna",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return (
        <button
          onClick={() => {
            if (!sort) column.toggleSorting(false);
            else if (sort === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
          className={`flex items-center gap-1 w-full cursor-pointer 
            ${sort ? "bg-emerald-200" : ""}`}
        >
          Nama Pengguna
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  /* ================================
        FILTER 5 MODE – ROLE
  ================================= */
  {
    accessorKey: "role",
    header: ({ column }) => {
      const filter = column.getFilterValue() as string | undefined;

      const nextFilter = () => {
        if (!filter) return roleCycle[0];

        const idx = roleCycle.indexOf(filter);
        if (idx === -1 || idx === roleCycle.length - 1) return undefined;

        return roleCycle[idx + 1];
      };

      return (
        <button
          onClick={() => column.setFilterValue(nextFilter())}
          className={`flex items-center gap-1 w-full cursor-pointer 
            ${filter ? "bg-emerald-200" : ""}`}
        >
          {filter ? `Role – ${filter}` : "Role"}
        </button>
      );
    },
  },

  /* ================================
     SORT 3 MODE – AKTIVITAS
  ================================= */
  {
    accessorKey: "aktivitas",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return (
        <button
          onClick={() => {
            if (!sort) column.toggleSorting(false);
            else if (sort === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
          className={`flex items-center gap-1 w-full cursor-pointer 
            ${sort ? "bg-emerald-200" : ""}`}
        >
          Aktivitas
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  /* ================================
     SORT 3 MODE – IP ADDRESS
  ================================= */
  {
    accessorKey: "ipAddress",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return (
        <button
          onClick={() => {
            if (!sort) column.toggleSorting(false);
            else if (sort === "asc") column.toggleSorting(true);
            else column.clearSorting();
          }}
          className={`flex items-center gap-1 w-full cursor-pointer 
            ${sort ? "bg-emerald-200" : ""}`}
        >
          IP Address
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  /* ================================
     FILTER 3 MODE – STATUS
  ================================= */
  {
    accessorKey: "status",
    header: ({ column }) => {
      const filter = column.getFilterValue() as string | undefined;

      const nextFilter = () => {
        if (!filter) return statusCycle[0];

        const idx = statusCycle.indexOf(filter);
        if (idx === -1 || idx === statusCycle.length - 1) return undefined;

        return statusCycle[idx + 1];
      };

      return (
        <button
          onClick={() => column.setFilterValue(nextFilter())}
          className={`flex items-center gap-1 w-full cursor-pointer 
            ${filter ? "bg-emerald-200" : ""}`}
        >
          {filter ? `Status – ${filter}` : "Status"}
        </button>
      );
    },
    cell: ({ row }) => (
      <Badge className={getStatusBadgeColor(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
];
