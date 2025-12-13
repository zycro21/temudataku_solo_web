"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  getSortedRowModel,
  ColumnDef,
  type SortingState,
  getPaginationRowModel,
  Row,
} from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MenteeCertificate } from "./columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [showDetailDialog, setShowDetailDialog] = React.useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    React.useState<MenteeCertificate | null>(null);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  // --- GLOBAL SEARCH FUNCTION ---
  const globalFilterFn = (
    row: Row<TData>,
    columnId: string,
    filterValue: string
  ) => {
    const value = row.getValue(columnId);
    return String(value ?? "")
      .toLowerCase()
      .includes(filterValue.toLowerCase());
  };

  const table = useReactTable({
    data,
    columns,
    meta: {
      onView: (item: MenteeCertificate) => {
        setSelectedCertificate(item);
        setShowDetailDialog(true);
      },
      onEdit: (item: MenteeCertificate) => {
        setSelectedCertificate(item);
        setShowEditDialog(true);
      },
    } as any,
    state: {
      globalFilter,
      sorting,
    },
    globalFilterFn,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,

    // Core features
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);
  const totalPages = table.getPageCount();

  return (
    <>
      <div className="space-y-4">
        {/* Search bar */}
        <div className="flex items-center pb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

            <Input
              placeholder="Cari data..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="
            pl-10 bg-gray-100 
            border border-gray-300
            focus:border-emerald-500
            focus:ring-emerald-500
            focus-visible:ring-emerald-500
            rounded-lg
          "
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`
                      px-5 py-4 text-sm cursor-pointer select-none
                      ${
                        header.column.getIsSorted() ||
                        header.column.getFilterValue()
                          ? "bg-emerald-100 text-emerald-900"
                          : ""
                      }
                  `}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-5 py-3 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Tidak ada data yang ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Menampilkan {from}-{to} dari {totalRows} data
          </div>
          <div className="flex items-center space-x-4">
            {/* Tampilkan per halaman */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Tampilkan per halaman
              </span>
              <select
                value={pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Numbered Pagination */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(
                  Math.max(0, pageIndex - 2),
                  Math.min(totalPages, pageIndex + 3)
                )
                .map((page) => (
                  <Button
                    key={page}
                    variant={pageIndex + 1 === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => table.setPageIndex(page - 1)}
                    className={
                      pageIndex + 1 === page
                        ? "bg-[#0CA678] hover:bg-[#08916C]"
                        : ""
                    }
                  >
                    {page}
                  </Button>
                ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent
          className="sm:max-w-lg my-2 p-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <DialogHeader className="px-6 pt-4 pb-3">
            <DialogTitle className="text-xl font-bold">
              Detail Sertifikat
            </DialogTitle>
          </DialogHeader>

          <div className="border-t mx-6 mb-4"></div>

          {/* Scrollable content */}
          <ScrollArea className="max-h-[65vh] px-6">
            {selectedCertificate && (
              <div className="space-y-5">
                {/* Template Sertifikat (gambar dummy karena table ini tidak punya gambar) */}
                <div>
                  <p className="text-sm text-gray-700 mb-2">
                    Template Sertifikat
                  </p>

                  <div className="w-full h-48 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                    <p className="text-gray-600 text-sm">Tidak ada gambar</p>
                  </div>
                </div>

                {/* Grid detail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* ID */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Sertifikat</p>
                    <p className="text-lg font-semibold">
                      {selectedCertificate.id}
                    </p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Tanggal & Waktu Diupload
                    </p>
                    <p className="text-lg font-semibold">
                      {selectedCertificate.date}
                    </p>
                  </div>

                  {/* Nama Sertifikat */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Nama Sertifikat
                    </p>
                    <p className="text-lg font-semibold">
                      {selectedCertificate.name}
                    </p>
                  </div>

                  {/* ➕ Tambahan Nama (mentee) */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nama</p>
                    <p className="text-lg font-semibold">
                      {selectedCertificate.mentee}
                    </p>
                  </div>

                  {/* Program */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Program</p>
                    <p className="text-lg font-semibold">
                      {selectedCertificate.program}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="border-t mx-6 mt-4"></div>

          <DialogFooter className="flex space-x-4 px-6 py-6 sm:justify-center">
            <Button
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C]"
              onClick={() => setShowDetailDialog(false)}
            >
              Edit
            </Button>

            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => setShowDetailDialog(false)}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================
    EDIT DIALOG
====================================================== */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg my-2 p-0">
          {/* Header */}
          <DialogHeader className="px-6 pt-4 pb-3">
            <DialogTitle className="text-xl font-bold">
              Edit Sertifikat
            </DialogTitle>
          </DialogHeader>

          <div className="border-t mx-6 mb-4"></div>

          <ScrollArea className="max-h-[65vh] px-6">
            {selectedCertificate && (
              <div className="space-y-5">
                {/* Template Upload */}
                <div>
                  <p className="text-sm text-gray-700 mb-2">
                    Template Sertifikat
                  </p>

                  <div className="w-full bg-emerald-50 border border-emerald-300 rounded-md p-4 flex flex-col items-center space-y-3">
                    <img
                      src="/placeholder-certificate.jpg"
                      className="w-full h-40 rounded object-cover"
                      alt="Template"
                    />

                    <p className="text-center text-sm">
                      File Berhasil Diupload
                      <br />
                      <span className="text-gray-500 text-xs">
                        TemplateSertif.png · 1.2 MB
                      </span>
                    </p>

                    <div className="flex space-x-3">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Ubah Template
                      </Button>
                      <Button variant="destructive">Hapus</Button>
                    </div>
                  </div>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* ID */}
                  <div>
                    <label className="text-sm text-gray-600">
                      ID Sertifikat
                    </label>
                    <Input
                      defaultValue={selectedCertificate.id}
                      className="mt-1"
                      readOnly
                    />
                  </div>

                  {/* Program */}
                  <div>
                    <label className="text-sm text-gray-600">Program</label>
                    <select
                      defaultValue={selectedCertificate.program}
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="Bootcamp">Bootcamp</option>
                      <option value="Short Class">Short Class</option>
                      <option value="Live Class">Live Class</option>
                    </select>
                  </div>
                </div>

                {/* Nama Sertifikat */}
                <div>
                  <label className="text-sm text-gray-600">
                    Nama Sertifikat
                  </label>
                  <Input
                    defaultValue={selectedCertificate.name}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="border-t mx-6 mt-4"></div>

          {/* Footer */}
          <DialogFooter className="flex space-x-4 px-6 py-6 sm:justify-center">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowEditDialog(false)}
            >
              Kembali
            </Button>

            <Button className="flex-1 bg-[#0CA678] hover:bg-[#08916C]">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
