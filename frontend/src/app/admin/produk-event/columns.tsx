"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";

// ── Section item types (sesuai skema DB terbaru) ────────────────────────────
type SectionItem = {
  title: string;
  description: string;
};

type ToolItem = {
  id?: string;
  name: string;
};

type ScheduleItem = {
  id?: string;
  date: string;
};

type PortfolioItem = {
  id?: string;
  title: string;
  description?: string | null;
  menteeName: string;
  projectLink: string;
  thumbnail?: string | null;
};

type TestimonialItem = {
  id?: string;
  name: string;
  role?: string | null;
  comment: string;
  rating: number;
};

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

  maxParticipants?: number;
  durationDays?: number;
  startDate?: string | null;
  endDate?: string | null;

  // ── NEW SIMPLE FIELDS (skema DB terbaru) ──
  strikePrice?: number | null;
  programAbout?: string | null;
  totalWeeks?: number | null;
  totalProjects?: number | null;
  slug?: string | null;
  isFeatured?: boolean;
  whatsappGroup?: string | null;

  // ── SECTIONS (split per type, skema DB terbaru) ──
  // benefits pakai union: SectionItem[] untuk Mentoring, string untuk E-Learning
  benefits?: SectionItem[] | string;
  mechanisms?: SectionItem[];
  syllabuses?: SectionItem[];
  targets?: SectionItem[];

  // ── RELATIONS (skema DB terbaru) ──
  tools?: ToolItem[];
  schedules?: ScheduleItem[];
  portfolios?: PortfolioItem[];
  testimonials?: TestimonialItem[];

  // ── FIELD LAMA (tetap dipertahankan untuk E-Learning & backward compat) ──
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
  isActive?: boolean | null;
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
        <div className="w-[72px] h-[48px] relative rounded overflow-hidden border flex-shrink-0">
          <Image
            src={url}
            alt="Foto Produk"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      );
    },
    size: 88,
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
     WHATSAPP GROUP (NO SORT)
  ============================ */
  {
    accessorKey: "whatsappGroup",
    enableSorting: false,
    header: () => <div className="px-2 py-1">WhatsApp Group</div>,
    cell: ({ getValue }) => {
      const val = getValue() as string | null | undefined;
      if (!val) return <span className="text-gray-400 text-xs">-</span>;
      return (
        <a
          href={val}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-emerald-600 underline break-all"
        >
          {val}
        </a>
      );
    },
  },

  /* ============================
     AKTIF
  ============================ */
  {
    accessorKey: "isActive",
    enableSorting: false,
    header: () => <div className="px-2 py-1">Aktif</div>,
    cell: ({ getValue }) => {
      const active = getValue() as boolean | null | undefined;
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            active
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {active ? "Aktif" : "Nonaktif"}
        </span>
      );
    },
  },
];
