"use client";

import * as React from "react";
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit, FileText, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SesiMentoring } from "./columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends SesiMentoring, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedMentee, setSelectedMentee] = React.useState<SesiMentoring | null>(null);
  const [showDetailDialog, setShowDetailDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  const [editStep, setEditStep] = React.useState(1);

  const [editFormData, setEditFormData] = React.useState({
    id: "",
    mentor: "",
    program: "",
    topik: "",
    date: "",
    durasi: "",
    dokumenPendukung: "",
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
      {/* 🔍 Search bar */}
      <div className="flex items-center pb-2">
        <Input placeholder="Cari data..." value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)} className="max-w-sm border-green-500 focus-visible:ring-green-500" />
      </div>

      {/* 📋 Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => {
                    const isSelectColumn = cell.column.id === "select";
                    return (
                      <TableCell
                        key={cell.id}
                        className={isSelectColumn ? "" : "cursor-pointer"}
                        onClick={() => {
                          if (!isSelectColumn) {
                            setSelectedMentee(row.original);
                            setShowDetailDialog(true);
                          }
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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
            <select value={pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))} className="border border-gray-300 rounded px-2 py-1 text-sm">
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Numbered Pagination */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, pageIndex - 2), Math.min(totalPages, pageIndex + 3))
              .map((page) => (
                <Button key={page} variant={pageIndex + 1 === page ? "default" : "outline"} size="sm" onClick={() => table.setPageIndex(page - 1)} className={pageIndex + 1 === page ? "bg-[#0CA678] hover:bg-[#08916C]" : ""}>
                  {page}
                </Button>
              ))}

            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 🟢 Mentee Detail Dialog */}
      {/* 📌 Session Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold">Detail Sesi Mentoring</DialogTitle>
          </DialogHeader>

          {selectedMentee && (
            <div className="space-y-6">
              {/* Session Details Grid */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Mentoring</p>
                    <p className="text-lg font-semibold">{selectedMentee.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mentor</p>
                    <p className="text-lg font-semibold">{selectedMentee.mentor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Program</p>
                    <p className="text-lg font-semibold">{selectedMentee.program}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Durasi Sesi</p>
                    <p className="text-lg font-semibold">{selectedMentee.durasi}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tanggal & Waktu</p>
                    <p className="text-lg font-semibold">{selectedMentee.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Topik</p>
                    <p className="text-lg font-semibold">{selectedMentee.topik}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <p className="text-lg font-semibold">{selectedMentee.status}</p>
                  </div>
                </div>
              </div>

              {/* Supporting Document */}
              {selectedMentee.dokumenPendukung && selectedMentee.dokumenPendukung !== "-" && (
                <div>
                  <p className="text-sm text-gray-500 mb-3">Dokumen Pendukung</p>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{selectedMentee.dokumenPendukung}</p>
                    </div>
                  </div>
                  <button className="text-[#0CA678] text-sm font-medium mt-2 hover:underline">Lihat Dokumen</button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button
                  className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
                  onClick={() => {
                    setEditFormData({
                      id: selectedMentee.id,
                      mentor: selectedMentee.mentor,
                      program: selectedMentee.program,
                      topik: selectedMentee.topik,
                      date: selectedMentee.date,
                      durasi: selectedMentee.durasi,
                      status: selectedMentee.status,
                      dokumenPendukung: selectedMentee.dokumenPendukung,
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

      {/* ✏️ Edit Mentor Dialog */}
      {/* 🟢 Edit Session Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold">Edit Sesi Mentoring</DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            {[
              { step: 1, label: "Edit Informasi Dasar" },
              { step: 2, label: "Edit Jadwal & Status" },
              { step: 3, label: "Edit Dokumen Pendukung" },
            ].map(({ step, label }) => (
              <div key={step} className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${editStep === step ? "bg-[#0CA678] text-white" : "bg-gray-200 text-gray-600"}`}>{step}</div>
                <span className={`text-sm font-medium ${editStep === step ? "text-[#0CA678]" : "text-gray-500"}`}>{label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {/* Step 1: Basic Information */}
            {editStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">ID Mentoring</label>
                  <Input value={editFormData.id} disabled className="w-full bg-green-100 border-green-200" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Mentor</label>
                  <Select value={editFormData.mentor} onValueChange={(value) => setEditFormData({ ...editFormData, mentor: value })}>
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
                  <label className="block text-sm font-medium text-gray-900 mb-2">Program</label>
                  <Select value={editFormData.program} onValueChange={(value) => setEditFormData({ ...editFormData, program: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 on 1 Mentoring">1 on 1 Mentoring</SelectItem>
                      <SelectItem value="Group Mentoring">Group Mentoring</SelectItem>
                      <SelectItem value="Short Class">Short Class</SelectItem>
                      <SelectItem value="Live Class">Live Class</SelectItem>
                      <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Topik</label>
                  <Textarea value={editFormData.topik} onChange={(e) => setEditFormData({ ...editFormData, topik: e.target.value })} className="w-full min-h-[100px] resize-none" placeholder="Masukkan topik mentoring" />
                </div>
              </div>
            )}

            {/* Step 2: Schedule & Status */}
            {editStep === 2 && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Tanggal</label>
                  <Select value={editFormData.date} onValueChange={(value) => setEditFormData({ ...editFormData, date: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih tanggal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10-05-2025">10-05-2025</SelectItem>
                      <SelectItem value="11-05-2025">11-05-2025</SelectItem>
                      <SelectItem value="12-05-2025">12-05-2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Waktu</label>
                  <Select value={editFormData.date} onValueChange={(value) => setEditFormData({ ...editFormData, date: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20:00">20:00</SelectItem>
                      <SelectItem value="19:00">19:00</SelectItem>
                      <SelectItem value="18:00">18:00</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                      <SelectItem value="15:00">15:00</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Durasi Sesi</label>
                  <Select value={editFormData.durasi} onValueChange={(value) => setEditFormData({ ...editFormData, durasi: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih durasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60 Menit">60 Menit</SelectItem>
                      <SelectItem value="90 Menit">90 Menit</SelectItem>
                      <SelectItem value="120 Menit">120 Menit</SelectItem>
                      <SelectItem value="180 Menit">180 Menit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
                  <Select value={editFormData.status} onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Terjadwal">Terjadwal</SelectItem>
                      <SelectItem value="Selesai">Selesai</SelectItem>
                      <SelectItem value="Dibatalkan">Dibatalkan</SelectItem>
                      <SelectItem value="Penjadwalan Ulang">Penjadwalan Ulang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Supporting Documents */}
            {editStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dokumen Pendukung</h3>
                  {editFormData.dokumenPendukung !== "-" && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{editFormData.dokumenPendukung}</p>
                          <p className="text-sm text-gray-500">{editFormData.dokumenPendukung}</p>
                          <button className="text-[#0CA678] text-sm font-medium hover:underline">Lihat Dokumen</button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-[#0CA678] hover:bg-green-100 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-500 hover:bg-red-100 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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
