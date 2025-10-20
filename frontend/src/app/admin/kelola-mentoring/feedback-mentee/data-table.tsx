"use client";

import * as React from "react";
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Datas } from "./columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@radix-ui/react-select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends Datas, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedProject, setSelectedProject] = React.useState<Datas>({
    id: "",
    mentor: "",
    mentee: "",
    program: "",
    date: "",
    topic: "",
    evaluasi: {
      kemudahan_materi: 0,
      kejelasan_materi: 0,
      mentor_menjawab: 0,
      pelaksanaan: 0,
      kesesuaian_jadwal: 0,
      kualitas_platform: 0,
      masukkan: "",
      catatan_tambahan: "",
    },
  });

  const [showDetailDialog, setShowDetailDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  const [editStep, setEditStep] = React.useState(1);

  const [editFormData, setEditFormData] = React.useState({
    id: "",
    mentor: "",
    mentee: "",
    program: "",
    date: "",
    topic: "",
    evaluasi: {
      kemudahan_materi: 0,
      kejelasan_materi: 0,
      mentor_menjawab: 0,
      pelaksanaan: 0,
      kesesuaian_jadwal: 0,
      kualitas_platform: 0,
      masukkan: "",
      catatan_tambahan: "",
    },
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
                            setSelectedProject(row.original);
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
      {/* 📌 Detail Feedback Mentee Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Detail Feedback Mentee</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="evaluasi" className="w-full mt-4">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="informasi">Informasi Dasar</TabsTrigger>
              <TabsTrigger value="evaluasi">Evaluasi & Catatan</TabsTrigger>
            </TabsList>

            {/* STEP 1: Informasi Dasar */}
            <TabsContent value="informasi" className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600 mb-1">ID Feedback</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedProject?.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tanggal & Waktu Pengumpulan</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedProject?.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mentor</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedProject?.mentor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mentee</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedProject?.mentee}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Program</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedProject?.program}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Topik</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedProject?.topic}</p>
                </div>
              </div>
            </TabsContent>

            {/* STEP 2: Evaluasi & Catatan */}
            <TabsContent value="evaluasi" className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kemudahan Materi</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedProject?.evaluasi.kemudahan_materi}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kejelasan Materi</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedProject?.evaluasi.kejelasan_materi}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Respon Mentor terhadap Pertanyaan</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedProject?.evaluasi.mentor_menjawab}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pelaksanaan Kelas</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedProject?.evaluasi.pelaksanaan}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kesesuaian Jadwal</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedProject?.evaluasi.kesesuaian_jadwal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kualitas Platform</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedProject?.evaluasi.kualitas_platform}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Masukkan</p>
                <p className="text-lg font-semibold text-gray-900">{selectedProject?.evaluasi.masukkan || "Tidak ada"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Catatan Tambahan</p>
                <p className="text-lg font-semibold text-gray-900">{selectedProject?.evaluasi.catatan_tambahan || "Tidak ada"}</p>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-4" />

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
              onClick={() => {
                setEditFormData(selectedProject);
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
                console.log("Delete feedback:", selectedProject);
                setShowDetailDialog(false);
              }}
            >
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✏️ Edit Feedback Mentee Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Edit Feedback Mentor</DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center space-x-4 py-4">
            <div className={`flex items-center space-x-2 ${editStep === 1 ? "text-[#0CA678]" : "text-gray-400"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${editStep === 1 ? "bg-[#0CA678] text-white" : "bg-gray-200 text-gray-600"}`}>1</div>
              <span className="font-medium">Informasi Mentoring</span>
            </div>
            <div className={`flex items-center space-x-2 ${editStep === 2 ? "text-[#0CA678]" : "text-gray-400"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${editStep === 2 ? "bg-[#0CA678] text-white" : "bg-gray-200 text-gray-600"}`}>2</div>
              <span className="font-medium">Evaluasi Mentor</span>
            </div>
          </div>

          <div className="space-y-6 py-4">
            {/* Step 1: Informasi Mentoring */}
            {editStep === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Mentoring</label>
                  <Input value={editFormData.id} readOnly className="bg-green-50 border-green-200 text-green-800 font-medium" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Mentor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mentor</label>
                    <Select value={editFormData.mentor} onValueChange={(value) => setEditFormData({ ...editFormData, mentor: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Mentor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laura Ayu">Laura Ayu</SelectItem>
                        <SelectItem value="Gilang Dirga">Gilang Dirga</SelectItem>
                        <SelectItem value="Nina Pratiwi">Nina Pratiwi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Program */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                    <Select value={editFormData.program} onValueChange={(value) => setEditFormData({ ...editFormData, program: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                        <SelectItem value="Short Class">Short Class</SelectItem>
                        <SelectItem value="Live Class">Live Class</SelectItem>
                        <SelectItem value="1 on 1 Mentoring">1 on 1 Mentoring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tanggal & Topik */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal & Waktu</label>
                    <Input type="datetime-local" value={editFormData.date} onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Topik</label>
                    <Input type="text" placeholder="Masukkan topik sesi" value={editFormData.topic} onChange={(e) => setEditFormData({ ...editFormData, topic: e.target.value })} />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Evaluasi Mentor */}
            {editStep === 2 && (
              <div className="space-y-6">
                {/* Input Nilai (1-5) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Materi Mudah Dimengerti</label>
                    <Input
                      type="number"
                      value={editFormData.evaluasi.kemudahan_materi}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          evaluasi: { ...editFormData.evaluasi, kemudahan_materi: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Materi Jelas & Interaktif</label>
                    <Input
                      type="number"
                      value={editFormData.evaluasi.kejelasan_materi}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          evaluasi: { ...editFormData.evaluasi, kejelasan_materi: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mentor Menjawab Dengan Baik</label>
                    <Input
                      type="number"
                      value={editFormData.evaluasi.mentor_menjawab}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          evaluasi: { ...editFormData.evaluasi, mentor_menjawab: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pelaksanaan Tepat Waktu</label>
                    <Input
                      type="number"
                      value={editFormData.evaluasi.pelaksanaan}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          evaluasi: { ...editFormData.evaluasi, pelaksanaan: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jadwal Sesuai</label>
                    <Input
                      type="number"
                      value={editFormData.evaluasi.kesesuaian_jadwal}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          evaluasi: { ...editFormData.evaluasi, kesesuaian_jadwal: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform Pembelajaran Baik</label>
                    <Input
                      type="number"
                      value={editFormData.evaluasi.kualitas_platform}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          evaluasi: { ...editFormData.evaluasi, kualitas_platform: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>

                {/* Masukkan/Saran */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Masukkan / Saran untuk meningkatkan pembelajaran</label>
                  <Textarea
                    rows={3}
                    value={editFormData.evaluasi.masukkan}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        evaluasi: { ...editFormData.evaluasi, masukkan: e.target.value },
                      })
                    }
                  />
                </div>

                {/* Catatan Tambahan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan</label>
                  <Textarea
                    rows={3}
                    value={editFormData.evaluasi.catatan_tambahan}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        evaluasi: { ...editFormData.evaluasi, catatan_tambahan: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
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
              className="bg-[#0CA678] hover:bg-[#08916C] text-white"
              onClick={() => {
                if (editStep === 2) {
                  console.log("✅ Save Feedback:", editFormData);
                  setShowEditDialog(false);
                  setEditStep(1);
                } else {
                  setEditStep(editStep + 1);
                }
              }}
            >
              {editStep === 2 ? "Simpan Perubahan" : "Selanjutnya"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
