"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

// Tipe data mentee
export type SesiMentoring = {
  id: string;
  mentor: string;
  program: string;
  durasi: string;
  topik: string;
  date: string;
  dokumenPendukung: string;
  status: string;
};

export const columns: ColumnDef<SesiMentoring>[] = [
  {
    id: "select",
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID Mentoring",
  },
  {
    accessorKey: "mentor",
    header: "Mentor",
  },
  {
    accessorKey: "program",
    header: "Program",
  },
  {
    accessorKey: "topik",
    header: "Topik",
  },
  {
    accessorKey: "dokumenPendukung",
    header: "Dokumen Pendukung",
  },
];
