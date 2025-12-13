import "@tanstack/react-table";
import type { Project } from "@/app/admin/kelola-practice/columns"; // sesuaikan path-nya

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onView?: (row: TData) => void;
    onEdit?: (row: TData) => void;
    onDelete?: (row: TData) => void;
  }
}
