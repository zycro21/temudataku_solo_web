"use client";

import { useState } from "react";
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
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  FileText,
  Trash2,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SesiMentoring } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends SesiMentoring, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedMentee, setSelectedMentee] = useState<SesiMentoring | null>(
    null
  );
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [editStep, setEditStep] = useState(1);

  const [editFormData, setEditFormData] = useState<{
    id: string;
    mentor: string;
    program: string;
    topik: string;
    date: string;
    time: string;
    durasi: string;
    dokumenPendukung: string;
    ukuranFile: number | null;
    status: string;
  }>({
    id: "",
    mentor: "",
    program: "",
    topik: "",
    date: "",
    time: "",
    durasi: "",
    dokumenPendukung: "",
    ukuranFile: null,
    status: "",
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
    getSortedRowModel: getSortedRowModel(), // <= WAJIB untuk sorting
    getPaginationRowModel: getPaginationRowModel(),

    enableSorting: true,
    enableMultiSort: false,
    enableColumnFilters: true,
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);
  const totalPages = table.getPageCount();

  // Fungsi untuk konversi dd-mm-yy ke yyyy-mm-dd
  function convertToDateInputFormat(dateStr: string) {
    // Asumsikan dateStr = "20-10-26" => "2020-10-26"
    const [yy, mm, dd] = dateStr.split("-");
    const fullYear = +yy > 50 ? `19${yy}` : `20${yy}`; // 20 berarti 2020, 21 => 2021, dll
    return `${fullYear}-${mm}-${dd}`;
  }

  return (
    <div>
      {/* Search bar */}
      <div className="flex items-center pb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

          <Input
            placeholder="Cari Jadwal Mentoring berdasarkan Nama atau Email..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="
        pl-10 
        bg-gray-100 
        border border-gray-300
        focus:border-emerald-500 
        focus:ring-emerald-500
        focus-visible:ring-emerald-500
        rounded-lg
      "
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`
    px-5 py-4 text-sm font-semibold 
    text-gray-700 transition-colors
    
    ${header.column.getIsSorted() ? "bg-emerald-200" : ""}
    ${header.column.getIsFiltered() ? "bg-emerald-100" : ""}
    ${
      header.column.getCanSort() || header.column.getCanFilter()
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
                        className={`px-5 py-4 text-sm ${
                          isSelectColumn ? "" : "cursor-pointer"
                        }`}
                        onClick={() => {
                          if (!isSelectColumn) {
                            setSelectedMentee(row.original);
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
                  className="h-24 text-center text-gray-500"
                >
                  Tidak ada data.
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

      {/*  Session Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent
          className="sm:max-w-xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Detail Sesi Mentoring
            </DialogTitle>
          </DialogHeader>

          {/* Garis pemisah rapat di bawah title */}
          <div className="border-b border-gray-200 mb-3" />

          {selectedMentee && (
            <div className="flex flex-col max-h-[70vh] overflow-y-auto px-1">
              {/* === KONTEN UTAMA === */}
              <div className="space-y-5">
                {/* BARIS 1: ID Mentoring | Tanggal & Waktu */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Mentoring</p>
                    <p className="text-lg font-semibold">{selectedMentee.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Tanggal & Waktu
                    </p>
                    <p className="text-lg font-semibold">
                      {selectedMentee.date}
                    </p>
                  </div>
                </div>

                {/* BARIS 2: Mentor | (kosong) */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mentor</p>
                    <p className="text-lg font-semibold">
                      {selectedMentee.mentor}
                    </p>
                  </div>
                  <div>{/* kosong sesuai permintaan */}</div>
                </div>

                {/* BARIS 3: Program | Topik */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Program</p>
                    <p className="text-lg font-semibold">
                      {selectedMentee.program}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Topik</p>
                    <p className="text-lg font-semibold">
                      {selectedMentee.topik}
                    </p>
                  </div>
                </div>

                {/* BARIS 4: Durasi | Status */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Durasi Sesi</p>
                    <p className="text-lg font-semibold">
                      {selectedMentee.durasi}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <p className="text-lg font-semibold">
                      {selectedMentee.status}
                    </p>
                  </div>
                </div>

                {/* Dokumen pendukung */}
                {selectedMentee.dokumenPendukung &&
                  selectedMentee.dokumenPendukung !== "-" && (
                    <div className="pt-2">
                      <p className="text-sm text-gray-500 mb-2">
                        Dokumen Pendukung
                      </p>

                      <div className="p-3 bg-gray-50 rounded-lg flex items-center space-x-3">
                        <FileText className="w-7 h-7 text-gray-400 mt-1" />

                        <div className="flex flex-col flex-1">
                          {/* Nama File */}
                          <p className="font-medium text-gray-900">
                            {selectedMentee.dokumenPendukung}
                          </p>

                          {/* Ukuran File (contoh perhitungan jika tersedia) */}
                          <p className="text-sm text-gray-500">
                            {selectedMentee.ukuranFile
                              ? `${(
                                  selectedMentee.ukuranFile /
                                  1024 /
                                  1024
                                ).toFixed(2)}mb`
                              : "Ukuran tidak tersedia"}
                          </p>

                          {/* Tombol tampil di baris bawah */}
                          <button className="text-[#0CA678] text-sm font-medium hover:underline text-left mt-1">
                            Lihat Dokumen
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Garis pemisah sebelum tombol CTA */}
              <div className="border-b border-gray-200 my-4" />

              {/* === CTA BUTTONS === */}
              <div className="flex space-x-4">
                <Button
                  className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
                  onClick={() => {
                    setEditFormData({
                      id: selectedMentee.id,
                      mentor: selectedMentee.mentor,
                      program: selectedMentee.program,
                      topik: selectedMentee.topik,
                      date: convertToDateInputFormat(selectedMentee.date),
                      time: selectedMentee.time,
                      durasi: selectedMentee.durasi,
                      status: selectedMentee.status,
                      dokumenPendukung: selectedMentee.dokumenPendukung,
                      ukuranFile: selectedMentee.ukuranFile,
                    });

                    setEditStep(1);
                    setShowDetailDialog(false);
                    setShowEditDialog(true);
                  }}
                >
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  onClick={() => {
                    console.log("Delete session:", selectedMentee);
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

      {/* Edit Session Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent
          className="sm:max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Edit Sesi Mentoring
            </DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-start space-x-6 mb-4">
            {[
              { step: 1, label: "Edit Informasi Dasar" },
              { step: 2, label: "Edit Jadwal & Status" },
              { step: 3, label: "Edit Dokumen Pendukung" },
            ].map(({ step, label }) => (
              <div key={step} className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                    editStep === step
                      ? "bg-[#0CA678] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                <span
                  className={`text-xs font-medium ${
                    editStep === step ? "text-[#0CA678]" : "text-gray-500"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Divider antara Step Indicator & Form */}
          <div className="border-t border-gray-200 mb-2" />

          <div className="space-y-6">
            {/* Step 1: Basic Information */}
            {editStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    ID Mentoring
                  </label>
                  <Input
                    value={editFormData.id}
                    disabled
                    className="w-full bg-green-100 border-green-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Mentor
                  </label>
                  <Select
                    value={editFormData.mentor}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, mentor: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laura Ayu">Laura Ayu</SelectItem>
                      <SelectItem value="Gilang Dirga">Gilang Dirga</SelectItem>
                      <SelectItem value="Nina Pratiwi">Nina Pratiwi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Program
                  </label>
                  <Select
                    value={editFormData.program}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, program: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 on 1 Mentoring">
                        1 on 1 Mentoring
                      </SelectItem>
                      <SelectItem value="Group Mentoring">
                        Group Mentoring
                      </SelectItem>
                      <SelectItem value="Short Class">Short Class</SelectItem>
                      <SelectItem value="Live Class">Live Class</SelectItem>
                      <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Topik
                  </label>
                  <Textarea
                    value={editFormData.topik}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        topik: e.target.value,
                      })
                    }
                    className="w-full min-h-[100px] resize-none"
                    placeholder="Masukkan topik mentoring"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Schedule & Status */}
            {editStep === 2 && (
              <div className="grid grid-cols-2 gap-6">
                {/* Tanggal */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tanggal
                  </label>
                  <Input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, date: e.target.value })
                    }
                    className="w-full"
                  />
                </div>

                {/* Waktu */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Waktu
                  </label>
                  <Select
                    value={editFormData.time}
                    onValueChange={(val: string) =>
                      setEditFormData({ ...editFormData, time: val })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "20:00",
                        "19:00",
                        "18:00",
                        "16:00",
                        "15:00",
                        "14:00",
                      ].map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Durasi */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Durasi Sesi
                  </label>
                  <Select
                    value={editFormData.durasi}
                    onValueChange={(val: string) =>
                      setEditFormData({ ...editFormData, durasi: val })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih durasi" />
                    </SelectTrigger>
                    <SelectContent>
                      {["60 Menit", "90 Menit", "120 Menit", "180 Menit"].map(
                        (opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Status
                  </label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(val: string) =>
                      setEditFormData({ ...editFormData, status: val })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "terjadwal",
                        "selesai",
                        "dibatalkan",
                        "penjadwalan ulang",
                      ].map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Supporting Documents */}
            {editStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Dokumen Pendukung
                  </h3>

                  {editFormData.dokumenPendukung !== "-" && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {editFormData.dokumenPendukung}
                          </p>
                          <p className="text-sm text-gray-500">
                            {editFormData.ukuranFile &&
                            editFormData.ukuranFile > 0
                              ? `${(
                                  editFormData.ukuranFile /
                                  1024 /
                                  1024
                                ).toFixed(2)} MB`
                              : "Ukuran tidak tersedia"}
                          </p>
                          <button className="text-[#0CA678] text-sm font-medium hover:underline">
                            Lihat Dokumen
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-red-500 hover:bg-red-100 rounded"
                          onClick={() =>
                            setEditFormData({
                              ...editFormData,
                              dokumenPendukung: "-",
                              ukuranFile: null, 
                            })
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider antara Form & CTA */}
          <div className="border-t border-gray-200 mt-2" />

          {/* Navigation Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
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
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C]"
              onClick={() => {
                if (editStep === 3) {
                  console.log("Save changes:", editFormData);
                  setShowEditDialog(false);
                  setEditStep(1);
                } else {
                  setEditStep(editStep + 1);
                }
              }}
            >
              {editStep === 3 ? "Simpan Perubahan" : "Selanjutnya"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
