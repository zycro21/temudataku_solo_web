"use client";

import * as React from "react";
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Upload, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mentor } from "./columns";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends Mentor, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedMentee, setSelectedMentee] = React.useState<Mentor | null>(null);
  const [showDetailDialog, setShowDetailDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  const [editStep, setEditStep] = React.useState(1);

  const [editFormData, setEditFormData] = React.useState({
    name: "",
    email: "",
    role: "Mentor",
    status: "Aktif",
    expertise: "",
    bio: "",
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
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-md my-4 p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl font-bold">Detail Mentor</DialogTitle>
          </DialogHeader>

          {/* Scrollable Area */}
          <ScrollArea className="max-h-[70vh] px-6">
            {selectedMentee && (
              <div className="space-y-6 pb-6">
                {/* Foto */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Foto Mentor</p>
                  <div className="w-full h-80 bg-gray-100 rounded-md overflow-hidden">
                    <Image width={400} height={320} src={selectedMentee.photo || "/placeholder.svg?height=320&width=400&text=Profile+Photo"} alt={selectedMentee.name} className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Detail Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Mentor</p>
                    <p className="text-lg font-semibold break-words whitespace-normal">{selectedMentee.id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nama Lengkap</p>
                    <p className="text-lg font-semibold break-words whitespace-normal">{selectedMentee.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Username</p>
                    <p className="text-lg font-semibold break-words whitespace-normal">{selectedMentee.username}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-lg font-semibold break-words whitespace-normal">{selectedMentee.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status Akun</p>
                    <p className="text-lg font-semibold">{selectedMentee.status || "Aktif"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bio</p>
                    <p className="text-lg font-semibold">{selectedMentee.bio || "-"}</p>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="flex space-x-4 sm:justify-center px-6 pb-6">
            <Button
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C]"
              onClick={() => {
                if (selectedMentee) {
                  setEditFormData({
                    name: selectedMentee.name,
                    email: selectedMentee.email,
                    role: selectedMentee.role,
                    status: selectedMentee.status || "Aktif",
                    bio: selectedMentee.bio || "",
                    expertise: selectedMentee.expertise || "",
                  });
                }
                setShowDetailDialog(false);
                setShowEditDialog(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                console.log("Delete mentee:", selectedMentee);
                setShowDetailDialog(false);
              }}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✏️ Edit Mentor Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Mentor</DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${editStep === 1 ? "bg-[#0CA678] text-white" : "bg-gray-200 text-gray-600"}`}>1</div>
              <span className={`text-sm font-medium ${editStep === 1 ? "text-[#0CA678]" : "text-gray-500"}`}>Informasi Dasar</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${editStep === 2 ? "bg-[#0CA678] text-white" : "bg-gray-200 text-gray-600"}`}>2</div>
              <span className={`text-sm font-medium ${editStep === 2 ? "text-[#0CA678]" : "text-gray-500"}`}>Profil Mentor</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${editStep === 3 ? "bg-[#0CA678] text-white" : "bg-gray-200 text-gray-600"}`}>3</div>
              <span className={`text-sm font-medium ${editStep === 3 ? "text-[#0CA678]" : "text-gray-500"}`}>Peran & Status</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            {editStep === 1 && (
              <>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-4">Foto Mentor</p>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="flex space-x-3">
                      <Button variant="outline" className="border-[#0CA678] text-[#0CA678] border-dashed hover:bg-[#0CA678] hover:text-white bg-transparent">
                        <Upload className="w-4 h-4 mr-2" /> Upload foto profil
                      </Button>
                      <Button variant="destructive">Hapus</Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">File png atau jpg maks 4MB</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">Nama Lengkap</label>
                    <Input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full py-3 text-base" />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">Email</label>
                    <Input type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="w-full py-3 text-base" />
                  </div>
                </div>
              </>
            )}

            {/* Step 2 */}
            {editStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">Keahlian Mentor</label>
                  <Select value={editFormData.expertise || ""} onValueChange={(value) => setEditFormData({ ...editFormData, expertise: value })}>
                    <SelectTrigger className="w-full py-3 text-base">
                      <SelectValue placeholder="Pilih keahlian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Data Engineer">Data Engineer</SelectItem>
                      <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                      <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                      <SelectItem value="Machine Learning Engineer">Machine Learning Engineer</SelectItem>
                      <SelectItem value="Business Intelligence">Business Intelligence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">Bio</label>
                  <textarea
                    value={editFormData.bio || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                    className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md resize-none focus:ring-[#0CA678] focus:border-[#0CA678] text-base"
                  />
                </div>
              </div>
            )}

            {/* Step 3 */}
            {editStep === 3 && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">Peran</label>
                  <Select value={editFormData.role} onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}>
                    <SelectTrigger className="w-full py-3 text-base">
                      <SelectValue placeholder="Mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mentee">Mentee</SelectItem>
                      <SelectItem value="Mentor">Mentor</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">Status Akun</label>
                  <Select value={editFormData.status} onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}>
                    <SelectTrigger className="w-full py-3 text-base">
                      <SelectValue placeholder="Aktif" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="inaktif">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex space-x-4 sm:justify-center mt-8">
            <Button
              variant="outline"
              className="flex-1 bg-transparent py-3"
              onClick={() => {
                if (editStep === 1) {
                  setShowEditDialog(false);
                  setEditStep(1);
                } else {
                  setEditStep(editStep - 1);
                }
              }}
            >
              {editStep === 1 ? "Batal" : "Sebelumnya"}
            </Button>
            <Button
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C] py-3"
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
