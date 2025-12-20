"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown, Trash2, Eye } from "lucide-react";

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
      return "bg-red-100 text-red-800 border-red-500";
    default:
      return "bg-gray-100 text-gray-800 border-gray-500";
  }
};

// Status filter cycle
const statusCycle = ["berhasil", "gagal"];

export const columns: ColumnDef<loginHistory>[] = [
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
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },

  /* ========================================
      SORT — TANGGAL (ASC → DESC → RESET)
  ========================================= */
  {
    accessorKey: "date",
    header: ({ column }) => {
      const sort = column.getIsSorted(); // false | asc | desc

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

  /* ========================================
      SORT — NAMA PENGGUNA
  ========================================= */
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

  /* ========================================
    SORT — ROLE
========================================= */
  {
    accessorKey: "role",
    header: ({ column }) => {
      const sort = column.getIsSorted(); // false | asc | desc

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
          Role
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  {
    accessorKey: "perangkat",
    header: ({ column }) => {
      const sort = column.getIsSorted(); // false | asc | desc

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
          Perangkat
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  /* ========================================
      SORT — IP ADDRESS
  ========================================= */
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

  /* ========================================
      FILTER — STATUS (berhasil → gagal → reset)
  ========================================= */
  {
    accessorKey: "status",
    header: ({ column }) => {
      const filter = column.getFilterValue() as string | undefined;

      const nextFilter = () => {
        if (!filter) return statusCycle[0]; // berhasil
        const index = statusCycle.indexOf(filter);
        if (index === -1 || index === statusCycle.length - 1) return undefined; // reset
        return statusCycle[index + 1]; // gagal
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

  {
    accessorKey: "aksi",
    header: "Aksi",
    cell: ({ row }) => (
      <span className="text-gray-700 font-medium">{row.original.aksi}</span>
    ),
  },
];
