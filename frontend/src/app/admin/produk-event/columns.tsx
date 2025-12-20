"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";

export type Project = {
  id: string;
  foto: string;
  nama: string;

  kategori: "Mentoring" | "E-Learning";

  /* =====================
     MENTORING ONLY
  ===================== */
  tipeMentoring?:
    | "Bootcamp"
    | "Short Class"
    | "Live Class"
    | "1 on 1 Mentoring"
    | "Group Mentoring";

  mentorIds?: string[]; // 🟢 mentoring (multi)
  mentorId?: string; // 🔵 e-learning (single)

  mentorNames?: string[]; // 🟢 mentoring (multi)
  mentorName?: string; // 🔵 e-learning (single)

  maxParticipants?: number; // 🆕
  durationDays?: number; // 🆕

  benefits?: string;
  mechanism?: string;
  syllabusPath?: string;
  toolsUsed?: string;
  targetAudience?: string;
  schedule?: string;
  alumniPortfolio?: string;

  /* =====================
     E-LEARNING ONLY
  ===================== */
  category?: string;
  tags?: string[];
  level?: string;
  estimatedDuration?: string;

  /* =====================
     SHARED
  ===================== */
  harga: number;
  hargaDisplay: string;
  hargaDiskon: string;
  deskripsi: string;
  status: string;
  diskonTipe: string;
  diskon: number;
  tanggalDitambahkan?: string;
};

// Cycle kategori untuk filter 4 mode
const kategoriCycle = ["Mentoring", "E-Learning"];

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
          ID Produk
          {sort === "asc" && <ArrowDown className="w-4 h-4" />}
          {sort === "desc" && <ArrowUp className="w-4 h-4" />}
        </button>
      );
    },

    // TAMBAHKAN INI
    cell: ({ getValue }) => (
      <div className="break-all whitespace-normal max-w-[200px]">
        {getValue() as string}
      </div>
    ),
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
          unoptimized
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

    // TAMBAHKAN INI
    cell: ({ getValue }) => (
      <div className="break-words whitespace-normal max-w-[250px]">
        {getValue() as string}
      </div>
    ),
  },

  /* ============================
     FILTER 4 MODE – KATEGORI
     Mentoring → E-Learning → RESET
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
    accessorKey: "hargaDisplay",
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

    // INI PENTING
    cell: ({ getValue }) => (
      <div className="font-semibold text-gray-900">{getValue() as string}</div>
    ),
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

    // TAMBAHKAN INI (PALING PENTING)
    cell: ({ getValue }) => (
      <div className="break-words whitespace-normal max-w-[350px]">
        {getValue() as string}
      </div>
    ),
  },
];
