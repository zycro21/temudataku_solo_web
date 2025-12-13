"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Project } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends Project, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(
    null
  );
  const [showDetailDialog, setShowDetailDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showRefundDialog, setShowRefundDialog] = React.useState(false);

  const [editStep, setEditStep] = React.useState(1);

  const [editFormData, setEditFormData] = React.useState({
    id: "",
    mentee: "",
    mentor: "",
    program: "",
    topic: "",
    date: "",
    totalHarga: "",
    statusTransaksi: "",
    alasan: "",
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
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
    <div>
      {/* Search bar */}
      <div className="flex items-center pb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

          <Input
            placeholder="Cari berdasarkan Mentee, Mentor, atau Program..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="
        pl-10
        bg-gray-100
        border border-gray-300
        focus:border-green-500
        focus:ring-green-500
        focus-visible:ring-green-500
        rounded-lg
      "
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`
                                px-4 py-3 text-sm font-semibold text-gray-700 transition-colors
                                ${
                                  header.column.getIsSorted()
                                    ? "bg-emerald-200"
                                    : ""
                                }
                                ${
                                  header.column.getIsFiltered()
                                    ? "bg-emerald-200"
                                    : ""
                                }
                                ${
                                  header.column.getCanSort() ||
                                  header.column.getCanFilter()
                                    ? "cursor-pointer"
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
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => {
                    const isSelectColumn = cell.column.id === "select";
                    return (
                      <TableCell
                        key={cell.id}
                        className={`px-4 py-4 text-sm ${
                          isSelectColumn ? "" : "cursor-pointer"
                        }`}
                        onClick={() => {
                          if (!isSelectColumn) {
                            setSelectedProject(row.original);
                            setShowDetailDialog(true);
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 📌 Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Menampilkan {from}-{to} dari {totalRows} data
        </div>
        <div className="flex items-center space-x-4">
          {/* Tampilkan per halaman */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Tampilkan per halaman</span>
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

      {/* Detail Project Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent
          className="max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Detail Transaksi
            </DialogTitle>
          </DialogHeader>

          {selectedProject && (
            <div className="py-4">
              {/* Scrollable Content */}
              <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
                {/* First Row */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ID Transaksi</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Tanggal & Waktu Order
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.date}
                    </p>
                  </div>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mentee</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.mentee}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mentor</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.mentor}
                    </p>
                  </div>
                </div>

                {/* Third Row */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Program</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.program}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Topik</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.topic}
                    </p>
                  </div>
                </div>

                {/* Fourth Row */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Harga</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.totalHarga}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Status Transaksi
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.statusTransaksi}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t">
                {/* Edit */}
                <Button
                  className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
                  onClick={() => {
                    if (!selectedProject) return;

                    setEditFormData({
                      id: selectedProject.id,
                      date: selectedProject.date,
                      mentee: selectedProject.mentee,
                      mentor: selectedProject.mentor,
                      program: selectedProject.program,
                      topic: selectedProject.topic,
                      totalHarga: selectedProject.totalHarga,
                      statusTransaksi: selectedProject.statusTransaksi,
                      alasan: selectedProject.alasan,
                    });

                    setEditStep(1);
                    setShowDetailDialog(false);
                    setShowEditDialog(true);
                  }}
                >
                  Edit
                </Button>

                {/* Pengembalian Dana */}
                <Button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() => {
                    setShowDetailDialog(false);
                    setShowRefundDialog(true);
                  }}
                >
                  Pengembalian Dana
                </Button>

                {/* Hapus */}
                <Button
                  variant="destructive"
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  onClick={() => {
                    console.log("Delete project:", selectedProject);
                    setShowDetailDialog(false);
                  }}
                >
                  Hapus
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Project Transaksi Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent
          className="max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Edit Transaksi
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Step 1 */}
            {editStep === 1 && (
              <>
                {/* ID Sesi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Sesi
                  </label>
                  <Input
                    value={editFormData.id}
                    readOnly
                    className="pointer-events-none select-none bg-gray-100 text-gray-700"
                  />
                </div>

                {/* Mentee & Mentor */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Mentee (Input manual) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mentee
                    </label>
                    <Input
                      value={editFormData.mentee}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          mentee: e.target.value,
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Mentor tetap select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mentor
                    </label>
                    <Select
                      value={editFormData.mentor}
                      onValueChange={(value) =>
                        setEditFormData({ ...editFormData, mentor: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Mentor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gilang Dirga">
                          Gilang Dirga
                        </SelectItem>
                        <SelectItem value="Nina Pratiwi">
                          Nina Pratiwi
                        </SelectItem>
                        <SelectItem value="Laura Ayu">Laura Ayu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Program (FULL WIDTH) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program
                  </label>
                  <Select
                    value={editFormData.program}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, program: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Short Class">Short Class</SelectItem>
                      <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                      <SelectItem value="Live Class">Live Class</SelectItem>
                      <SelectItem value="1 on 1 Mentoring">
                        1 on 1 Mentoring
                      </SelectItem>
                      <SelectItem value="Group Mentoring">
                        Group Mentoring
                      </SelectItem>
                      <SelectItem value="Practice">Practice</SelectItem>
                      <SelectItem value="E-Learning">E-Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Baris Total Harga + Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Harga
                    </label>
                    <Input
                      value={editFormData.totalHarga}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          totalHarga: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Transaksi
                    </label>
                    <Select
                      value={editFormData.statusTransaksi}
                      onValueChange={(value) =>
                        setEditFormData({
                          ...editFormData,
                          statusTransaksi: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Belum Dibayar">
                          Belum Dibayar
                        </SelectItem>
                        <SelectItem value="Selesai">Selesai</SelectItem>
                        <SelectItem value="Dibatalkan">Dibatalkan</SelectItem>
                        <SelectItem value="Menunggu Konfirmasi">
                          Menunggu Konfirmasi
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* CTA BUTTONS FULL-WIDTH 1/2 – 1/2 */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (editStep === 1) {
                  setShowEditDialog(false);
                  setEditStep(1);
                } else {
                  setEditStep(editStep - 1);
                }
              }}
            >
              {editStep === 1 ? "Kembali" : "Sebelumnya"}
            </Button>

            <Button
              className="bg-[#0CA678] hover:bg-[#08916C] text-white w-full"
              onClick={() => {
                if (editStep === 1) {
                  console.log("Save changes:", editFormData);
                  setShowEditDialog(false);
                  setEditStep(1);
                } else {
                  setEditStep(editStep + 1);
                }
              }}
            >
              {editStep === 1 ? "Simpan Perubahan" : "Selanjutnya"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent
          className="max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Pengembalian Dana (Refund)
            </DialogTitle>
          </DialogHeader>

          {selectedProject && (
            <div className="py-4 flex flex-col">
              {/* Scrollable Konten */}
              <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 pb-6">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Transaksi</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Tanggal & Waktu Order
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.date}
                    </p>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mentee</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.mentee}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mentor</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.mentor}
                    </p>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Program</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.program}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Topik</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.topic}
                    </p>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Harga</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.totalHarga}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Status Transaksi
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.statusTransaksi}
                    </p>
                  </div>
                </div>

                {/* Row 5 – Alasan */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Alasan Meminta Pengembalian Dana
                  </p>
                  <p className="text-lg font-semibold text-gray-900 whitespace-pre-line">
                    {selectedProject.alasan || "-"}
                  </p>
                </div>
              </div>

              {/* Garis pemisah + CTA */}
              <div className="pt-6 border-t">
                <Button
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-6 text-base font-semibold rounded-lg"
                  onClick={() => {
                    console.log("Refund confirmed for:", selectedProject);
                    setShowRefundDialog(false);
                  }}
                >
                  Konfirmasi Pengembalian Dana
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
