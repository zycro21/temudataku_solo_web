"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
// Tipe data Project
export type Project = {
  id: string;
  foto: string;
  nama: string;
  bootcamp: string;
  harga: string;
  deskripsi: string;
  status: string;
  diskonTipe: string;
  hargaDiskon: string;
};

export const columns: ColumnDef<Project>[] = [
  {
    id: "select",
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "id",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>ID Produk</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
  {
    accessorKey: "foto",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Foto</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
    cell: ({ cell }) => {
      const url = cell.getValue() as string;
      return <Image src={url} alt="Foto Produk" width={40} height={40} className="rounded object-cover border" />;
    },
    size: 80,
    enableSorting: false,
  },
  {
    accessorKey: "nama",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Nama Produk</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
  {
    accessorKey: "bootcamp",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Kategori</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
  {
    accessorKey: "harga",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Harga</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
  {
    accessorKey: "deskripsi",
    header: () => (
      <div className="flex items-center space-x-1">
        <span>Deskripsi</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    ),
  },
];
