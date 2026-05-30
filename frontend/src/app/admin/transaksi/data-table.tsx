"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
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
    null,
  );
  const [showDetailDialog, setShowDetailDialog] = React.useState(false);

  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [editStep, setEditStep] = React.useState(1);
  const [editFormData, setEditFormData] = React.useState({
    id: "",
    display: "",
    mentee: "",
    mentor: "",
    program: "",
    topic: "",
    date: "",
    totalHarga: "",
    statusTransaksi: "pending" as
      | "pending"
      | "confirmed"
      | "failed"
      | "refunded",
    alasan: "",
  });
  const [saving, setSaving] = React.useState(false);

  const [showRefundDialog, setShowRefundDialog] = React.useState(false);
  const [refunding, setRefunding] = React.useState(false);

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
                          header.getContext(),
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
                        className={`
    px-4 py-4 text-sm align-top
    break-words whitespace-normal
    max-w-[240px]
    ${isSelectColumn ? "" : "cursor-pointer"}
  `}
                        onClick={() => {
                          if (!isSelectColumn) {
                            setSelectedProject(row.original);
                            setShowDetailDialog(true);
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
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
                Math.min(totalPages, pageIndex + 3),
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
          className="max-w-xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Detail Transaksi
            </DialogTitle>
          </DialogHeader>

          {selectedProject && (
            <div className="py-3">
              {/* Scrollable Content */}
              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                {/* First Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">ID Transaksi</p>
                    <p className="text-sm font-semibold text-gray-900 break-words whitespace-normal leading-relaxed">
                      {selectedProject.displayId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">
                      Tanggal & Waktu Order
                    </p>
                    <p className="text-sm font-semibold text-gray-900 break-words whitespace-normal leading-relaxed">
                      {selectedProject.date}
                    </p>
                  </div>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Mentee</p>
                    <p className="text-sm font-semibold text-gray-900 break-words whitespace-normal leading-relaxed">
                      {selectedProject.mentee}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Type</p>
                    <p className="text-sm font-semibold text-gray-900 break-words whitespace-normal leading-relaxed">
                      {selectedProject.type}
                    </p>
                  </div>
                </div>

                {/* Third Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Program</p>
                    <p className="text-sm font-semibold text-gray-900 break-words whitespace-normal leading-relaxed">
                      {selectedProject.program}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Judul/Topik</p>
                    <p className="text-sm font-semibold text-gray-900 break-words whitespace-normal leading-relaxed">
                      {selectedProject.topic}
                    </p>
                  </div>
                </div>

                {/* Fourth Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Total Harga</p>
                    <p className="text-sm font-semibold text-gray-900 break-words whitespace-normal leading-relaxed">
                      {selectedProject.totalHarga}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">
                      Status Transaksi
                    </p>
                    <p className="text-sm font-semibold text-gray-900 break-words whitespace-normal leading-relaxed">
                      {selectedProject.statusTransaksi}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                {/* Edit */}
                <Button
                  className="bg-[#0CA678] hover:bg-[#08916C] text-white"
                  onClick={() => {
                    if (!selectedProject) return;

                    setEditFormData({
                      id: selectedProject.paymentId,
                      display: selectedProject.displayId,
                      date: selectedProject.date,
                      mentor: selectedProject.mentor,
                      mentee: selectedProject.mentee,
                      program: selectedProject.program,
                      topic: selectedProject.topic,
                      totalHarga: selectedProject.totalHarga,
                      statusTransaksi:
                        selectedProject.statusTransaksi === "Belum Dibayar"
                          ? "pending"
                          : selectedProject.statusTransaksi === "Lunas"
                            ? "confirmed"
                            : selectedProject.statusTransaksi === "Gagal"
                              ? "failed"
                              : selectedProject.statusTransaksi === "Refunded"
                                ? "refunded"
                                : "pending",
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
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() => {
                    setShowDetailDialog(false);
                    setShowRefundDialog(true);
                  }}
                >
                  Pengembalian Dana
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent
          className="max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Edit Transaksi
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* ID */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                ID Transaksi
              </label>
              <Input
                value={editFormData.display}
                readOnly
                className="bg-gray-100 pointer-events-none"
              />
            </div>

            {/* Mentee & Topik */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Mentee
                </label>
                <Input
                  value={editFormData.mentee}
                  readOnly
                  className="bg-gray-100 pointer-events-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Topik
                </label>
                <Input
                  value={editFormData.topic}
                  readOnly
                  className="bg-gray-100 pointer-events-none"
                />
              </div>
            </div>

            {/* Total & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Total Harga
                </label>
                <Input
                  value={editFormData.totalHarga}
                  readOnly
                  className="bg-gray-100 pointer-events-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Status Transaksi
                </label>
                <Select
                  value={editFormData.statusTransaksi}
                  onValueChange={(value) =>
                    setEditFormData({
                      ...editFormData,
                      statusTransaksi: value as any,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Belum Dibayar</SelectItem>
                    <SelectItem value="confirmed">Lunas</SelectItem>
                    <SelectItem value="failed">Gagal</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Batal
            </Button>

            <Button
              className="bg-[#0CA678] hover:bg-[#08916C] text-white"
              disabled={saving}
              onClick={async () => {
                try {
                  setSaving(true);

                  await axios.patch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/payments-status/${editFormData.id}`,
                    {
                      status: editFormData.statusTransaksi,
                    },
                    { withCredentials: true },
                  );

                  toast.success("Status transaksi berhasil diperbarui");

                  setShowEditDialog(false);
                } catch (error: any) {
                  console.error(error);

                  toast.error(
                    error?.response?.data?.message ??
                      "Gagal memperbarui status transaksi",
                  );
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </span>
              ) : (
                "Simpan Perubahan"
              )}
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
            <div className="py-3 flex flex-col">
              {/* Scrollable Konten */}
              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 pb-4">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">ID Transaksi</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedProject.displayId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">
                      Tanggal & Waktu Order
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedProject.date}
                    </p>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Mentee</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedProject.mentee}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Tipe</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedProject.type}
                    </p>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Program</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedProject.program}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Topik</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedProject.topic}
                    </p>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Total Harga</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedProject.totalHarga}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">
                      Status Transaksi
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedProject.statusTransaksi}
                    </p>
                  </div>
                </div>

                {/* Row 5 – Alasan */}
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">
                    Alasan Meminta Pengembalian Dana
                  </p>
                  <p className="text-sm font-semibold text-gray-900 whitespace-pre-line">
                    {selectedProject.alasan || "-"}
                  </p>
                </div>
              </div>

              {/* Garis pemisah + CTA */}
              <div className="pt-4 border-t">
                <Button
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-6 text-base font-semibold rounded-lg"
                  disabled={
                    refunding || selectedProject?.statusTransaksi === "Refunded"
                  }
                  onClick={async () => {
                    if (!selectedProject) return;

                    try {
                      setRefunding(true);

                      await axios.patch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/payments-status/${selectedProject.paymentId}`,
                        {
                          status: "refunded",
                        },
                        { withCredentials: true },
                      );

                      toast.success("Pengembalian dana berhasil diproses");

                      setShowRefundDialog(false);
                    } catch (error: any) {
                      console.error(error);

                      toast.error(
                        error?.response?.data?.message ??
                          "Gagal memproses pengembalian dana",
                      );
                    } finally {
                      setRefunding(false);
                    }
                  }}
                >
                  {refunding ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Memproses Refund...
                    </span>
                  ) : (
                    "Konfirmasi Pengembalian Dana"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
