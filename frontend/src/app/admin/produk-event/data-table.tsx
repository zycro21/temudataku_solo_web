"use client";

import * as React from "react";
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Project } from "./columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends Project, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedProduct, setSelectedProject] = React.useState<Project | null>(null);
  const [detailTab, setDetailTab] = React.useState(1);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setDetailTab(1);
  };
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [editStep, setEditStep] = React.useState(1);

  const [editFormData, setEditFormData] = useState({
    id: "",
    nama: "",
    bootcamp: "",
    foto: "",
    deskripsi: "",
    harga: "",
    status: "Aktif",
    diskonTipe: "",
    hargaDiskon: "",
  });

  // close edit dialog
  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setEditStep(1); // reset kembali ke step 1
  };

  // ke step berikutnya
  const handleEditNextStep = () => {
    if (editStep < 2) {
      setEditStep(editStep + 1);
    }
  };

  // ke step sebelumnya
  const handleEditPrevStep = () => {
    if (editStep > 1) {
      setEditStep(editStep - 1);
    }
  };

  // simpan perubahan
  const handleSaveEdit = () => {
    console.log("Data yang diedit:", editFormData);

    // ===== TAMBAHKAN LOGIKA SIMPAN API KAMU DISINI =====
    // await axios.put(`/api/products/${selectedProduct.id}`, editFormData);

    // setelah berhasil simpan:
    setShowEditDialog(false);
    setEditStep(1);
  };

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
                            setIsDetailDialogOpen(true);
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

      {/* Detail Product Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Detail Produk & Event</DialogTitle>
              <button onClick={handleCloseDetailDialog} className="text-gray-400 hover:text-gray-600"></button>
            </div>
          </DialogHeader>

          {/* Tab Indicator */}
          <div className="flex items-center space-x-4 my-6">
            <button onClick={() => setDetailTab(1)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${detailTab === 1 ? "bg-[#0CA678] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Informasi Dasar
            </button>
            <button onClick={() => setDetailTab(2)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${detailTab === 2 ? "bg-[#0CA678] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Deskripsi, Harga, dan Status
            </button>
          </div>

          {selectedProduct && (
            <div className="space-y-6">
              {detailTab === 1 ? (
                <>
                  {/* Foto */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">Foto Produk Atau Event</label>
                    <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                      {selectedProduct.foto ? (
                        <img src={selectedProduct.foto} alt={selectedProduct.nama} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-500">Product Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">ID Produk</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedProduct.id}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Kategori</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedProduct.bootcamp}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Nama Produk Atau Event</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedProduct.nama}</p>
                  </div>
                </>
              ) : (
                <>
                  {/* Tab 2 */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-2">Deskripsi</label>
                    <p className="text-gray-900 text-sm leading-relaxed">{selectedProduct.deskripsi}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Harga</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedProduct.harga}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                      <p className="text-lg font-semibold text-green-600">{selectedProduct.status}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Diskon Tipe</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedProduct.diskonTipe ?? "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Harga Diskon</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedProduct.hargaDiskon ?? "-"}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t">
            <Button
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white flex items-center justify-center space-x-2"
              onClick={() => {
                if (selectedProduct) {
                  setEditFormData({
                    id: selectedProduct.id,
                    nama: selectedProduct.nama,
                    bootcamp: selectedProduct.bootcamp,
                    foto: selectedProduct.foto,
                    deskripsi: selectedProduct.deskripsi,
                    harga: selectedProduct.harga,
                    status: selectedProduct.status,
                    diskonTipe: selectedProduct.diskonTipe,
                    hargaDiskon: selectedProduct.hargaDiskon,
                  });
                }
                setIsDetailDialogOpen(false);
                setShowEditDialog(true);
              }}
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>
            <Button variant="destructive" className="flex-1 flex items-center justify-center space-x-2">
              <Trash2 className="w-4 h-4" />
              <span>Hapus</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Edit Produk Atau Event</DialogTitle>
            </div>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center space-x-4 my-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${editStep >= 1 ? "bg-[#0CA678] text-white" : "bg-gray-300 text-gray-600"}`}>1</div>
              <span className={`text-sm font-medium ${editStep === 1 ? "text-[#0CA678]" : "text-gray-400"}`}>Edit Informasi Dasar</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200" />
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${editStep >= 2 ? "bg-[#0CA678] text-white" : "bg-gray-300 text-gray-600"}`}>2</div>
              <span className={`text-sm font-medium ${editStep === 2 ? "text-[#0CA678]" : "text-gray-400"}`}>Edit Deskripsi, Harga, dan Status</span>
            </div>
          </div>

          <div className="space-y-6">
            {editStep === 1 ? (
              <>
                {/* Step 1 */}
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">Foto Produk</label>
                  <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img src={editFormData.foto} alt="foto" className="w-16 h-16 rounded object-cover bg-gray-300" />
                        <div>
                          <p className="font-medium text-gray-900">File Berhasil Diupload</p>
                          <p className="text-sm text-gray-600">foto_produk.jpg</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button className="bg-[#0CA678] hover:bg-[#08916C] text-white text-sm">Ubah Foto</Button>
                        <Button variant="destructive" className="text-sm" onClick={() => setEditFormData({ ...editFormData, foto: "" })}>
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">ID Produk</label>
                    <Input value={editFormData.id} disabled className="bg-green-50 border-green-300 font-medium" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">Kategori Produk</label>
                    <select value={editFormData.bootcamp} onChange={(e) => setEditFormData({ ...editFormData, bootcamp: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option>Mentoring</option>
                      <option>Practice</option>
                      <option>Bootcamp</option>
                      <option>Event</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">Nama Produk</label>
                  <Input value={editFormData.nama} onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })} placeholder="Masukkan nama produk" />
                </div>
              </>
            ) : (
              <>
                {/* Step 2 */}
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">Deskripsi</label>
                  <textarea
                    value={editFormData.deskripsi}
                    onChange={(e) => setEditFormData({ ...editFormData, deskripsi: e.target.value })}
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Masukkan deskripsi produk"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">Harga</label>
                    <Input value={editFormData.harga} onChange={(e) => setEditFormData({ ...editFormData, harga: e.target.value })} placeholder="Masukkan harga" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">Status</label>
                    <select value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option>Aktif</option>
                      <option>Non Aktif</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">Diskon Atau Promo</label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={editFormData.diskonTipe === "Persentase"} onChange={() => setEditFormData({ ...editFormData, diskonTipe: "Persentase" })} className="rounded" />
                      <span className="text-sm text-gray-700">Diskon Dalam Persentase</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={editFormData.diskonTipe === "Angka"} onChange={() => setEditFormData({ ...editFormData, diskonTipe: "Angka" })} className="rounded" />
                      <span className="text-sm text-gray-700">Diskon Dalam Angka</span>
                    </label>

                    {editFormData.diskonTipe && <Input value={editFormData.hargaDiskon} onChange={(e) => setEditFormData({ ...editFormData, hargaDiskon: e.target.value })} placeholder="Masukkan nilai diskon" />}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex space-x-3 pt-6 border-t">
            {editStep === 1 ? (
              <>
                <Button variant="outline" className="flex-1 border-[#0CA678] text-[#0CA678]" onClick={handleCloseEditDialog}>
                  Kembali
                </Button>
                <Button className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white" onClick={handleEditNextStep}>
                  Selanjutnya
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="flex-1 border-[#0CA678] text-[#0CA678]" onClick={handleEditPrevStep}>
                  Sebelumnya
                </Button>
                <Button className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white" onClick={handleSaveEdit}>
                  Simpan Perubahan
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
