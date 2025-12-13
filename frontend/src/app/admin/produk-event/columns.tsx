"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";

// Tipe data Project
export type Project = {
  id: string;
  foto: string;
  nama: string;

  kategori: "Mentoring" | "Practice" | "E-Learning";

  tipeMentoring?:
    | "Bootcamp"
    | "Short Class"
    | "Live Class"
    | "1 on 1 Mentoring"
    | "Group Mentoring";

  harga: string;
  deskripsi: string;
  status: string;
  diskonTipe: string;
  diskon: number;   
  hargaDiskon: string;
  
  // Tambahkan ini
  tanggalDitambahkan?: string;
};

// Cycle kategori untuk filter 4 mode
const kategoriCycle = ["Mentoring", "Practice", "E-Learning"];

export const columns: ColumnDef<Project>[] = [
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

  /* ============================
     SORT 3 MODE – ID
  ============================ */
  {
    accessorKey: "id",
    header: ({ column }) => {
      const sort = column.getIsSorted(); // false | "asc" | "desc"

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
          ID Produk
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  /* ============================
     FOTO (NO SORT)
  ============================ */
  {
    accessorKey: "foto",
    enableSorting: false,
    header: () => <div className="px-2 py-1">Foto</div>,
    cell: ({ cell }) => {
      const url = cell.getValue() as string;
      return (
        <Image
          src={url}
          alt="Foto Produk"
          width={40}
          height={40}
          className="rounded object-cover border"
        />
      );
    },
    size: 80,
  },

  /* ============================
     SORT 3 MODE – NAMA
  ============================ */
  {
    accessorKey: "nama",
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
          Nama Produk
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  /* ============================
     FILTER 4 MODE – KATEGORI
     Mentoring → Practice → E-Learning → RESET
  ============================ */
  {
    accessorKey: "kategori",
    header: ({ column }) => {
      const filter = column.getFilterValue() as string | undefined;

      const nextFilter = () => {
        if (!filter) return kategoriCycle[0];
        const idx = kategoriCycle.indexOf(filter);
        if (idx === -1 || idx === kategoriCycle.length - 1) return undefined;
        return kategoriCycle[idx + 1];
      };

      return (
        <button
          onClick={() => column.setFilterValue(nextFilter())}
          className={`flex items-center gap-1 w-full cursor-pointer 
            ${filter ? "bg-emerald-200" : "bg-gray-100"}`}
        >
          {filter ? `Kategori – ${filter}` : "Kategori"}
        </button>
      );
    },
  },

  /* ============================
     SORT 3 MODE – HARGA
  ============================ */
  {
    accessorKey: "harga",
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
          Harga
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },

  /* ============================
     SORT 3 MODE – DESKRIPSI
  ============================ */
  {
    accessorKey: "deskripsi",
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
          Deskripsi
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },
  },
];
