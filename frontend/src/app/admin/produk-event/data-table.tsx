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
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Search,
  Trash,
} from "lucide-react";
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
import { useState } from "react";
import Image from "next/image";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends Project, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedProduct, setSelectedProject] = React.useState<Project | null>(
    null
  );
  const [detailTab, setDetailTab] = React.useState(1);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setDetailTab(1);
  };

  const handleDelete = (id?: string) => {
    if (!id) return;

    // Konfirmasi manual
    const konfirmasi = confirm("Yakin ingin menghapus produk ini?");
    if (!konfirmasi) return;

    console.log("Menghapus ID:", id);

    // TODO: Tambahkan API delete
    // await axios.delete(`/api/products/${id}`);

    // Setelah delete berhasil, kamu bisa:
    // - refresh table
    // - close dialog
    setIsDetailDialogOpen(false);
  };

  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [editStep, setEditStep] = React.useState(1);

  type Kategori = "Mentoring" | "Practice" | "E-Learning";
  type TipeMentoring =
    | "Bootcamp"
    | "Short Class"
    | "Live Class"
    | "1 on 1 Mentoring"
    | "Group Mentoring";

  type EditFormData = {
    id: string;
    nama: string;
    kategori: Kategori;
    tipeMentoring: TipeMentoring | "";
    foto: File | null;
    deskripsi: string;
    harga: string;
    status: string;

    diskonTipe: string;
    diskon: number;
    hargaDiskon: string;
  };

  const [editFormData, setEditFormData] = useState<EditFormData>({
    id: "",
    nama: "",
    kategori: "Mentoring",
    tipeMentoring: "",
    foto: null,
    deskripsi: "",
    harga: "",
    status: "Aktif",
    diskonTipe: "persentase",
    diskon: 0,
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
    getSortedRowModel: getSortedRowModel(),
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
            placeholder="Cari data..."
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
                                    ? "bg-emerald-100"
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
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => {
                    const isSelectColumn = cell.column.id === "select";
                    return (
                      <TableCell
                        key={cell.id}
                        className={`${
                          isSelectColumn ? "" : "cursor-pointer"
                        } px-4 py-3`}
                        onClick={() => {
                          if (!isSelectColumn) {
                            setSelectedProject(row.original);
                            setIsDetailDialogOpen(true);
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

      {/* Detail Product Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent
          className="max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center justify-between pb-3 border-b">
              <DialogTitle>Detail Produk & Event</DialogTitle>
              <button
                onClick={handleCloseDetailDialog}
                className="text-gray-400 hover:text-gray-600"
              ></button>
            </div>
          </DialogHeader>

          {/* Tab Selector */}
          <div className="flex w-full mt-4 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setDetailTab(1)}
              className={`w-1/2 py-2 text-sm font-medium transition-colors ${
                detailTab === 1
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              Informasi Dasar
            </button>

            <button
              onClick={() => setDetailTab(2)}
              className={`w-1/2 py-2 text-sm font-medium transition-colors ${
                detailTab === 2
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              Deskripsi, Harga, dan Status
            </button>
          </div>

          {/* Scrollable Content */}
          {selectedProduct && (
            <div className="max-h-[60vh] overflow-y-auto pr-2 mt-6 space-y-6">
              {detailTab === 1 ? (
                <>
                  {/* Foto */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">
                      Foto Produk Atau Event
                    </label>
                    <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                      {selectedProduct.foto ? (
                        <Image
                          src={selectedProduct.foto}
                          alt={selectedProduct.nama}
                          width={400}
                          height={250}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-500">Product Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ID + Tanggal Ditambahkan */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        ID Produk
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedProduct.id}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Tanggal Ditambahkan
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedProduct.tanggalDitambahkan ?? "-"}
                      </p>
                    </div>
                  </div>

                  {/* Kategori + Tipe Mentoring */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Kategori
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedProduct.kategori}
                      </p>
                    </div>

                    {selectedProduct.kategori === "Mentoring" && (
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          Tipe Mentoring
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedProduct.tipeMentoring ?? "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Nama Produk */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Nama Produk Atau Event
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProduct.nama}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Deskripsi */}
                  <div>
                    <label className="text-base font-semibold text-gray-600 block mb-2">
                      Deskripsi
                    </label>
                    <p className="text-sm font-bold text-gray-900 leading-relaxed">
                      {selectedProduct.deskripsi}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-base font-semibold text-gray-600 block mb-1">
                        Harga
                      </label>
                      <p className="text-sm font-bold text-gray-900">
                        {selectedProduct.harga}
                      </p>
                    </div>
                    <div>
                      <label className="text-base font-semibold text-gray-600 block mb-1">
                        Status
                      </label>
                      <p className="text-sm font-bold text-green-600">
                        {selectedProduct.status}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Diskon Tipe */}
                    <div>
                      <label className="text-base font-semibold text-gray-600 block mb-1">
                        Diskon Tipe
                      </label>
                      <p className="text-sm font-bold text-gray-900">
                        {selectedProduct.diskonTipe ?? "-"}
                      </p>
                    </div>

                    {/* Diskon */}
                    <div>
                      <label className="text-base font-semibold text-gray-600 block mb-1">
                        Diskon
                      </label>
                      <p className="text-sm font-bold text-gray-900">
                        {selectedProduct.diskonTipe === "persentase"
                          ? `${selectedProduct.diskon ?? 0}%`
                          : selectedProduct.diskonTipe === "angka"
                          ? `Rp${selectedProduct.diskon ?? 0}`
                          : "-"}
                      </p>
                    </div>

                    {/* Harga Diskon */}
                    <div>
                      <label className="text-base font-semibold text-gray-600 block mb-1">
                        Harga Setelah Diskon
                      </label>
                      <p className="text-sm font-bold text-gray-900">
                        {selectedProduct.hargaDiskon ?? "-"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex pt-6 border-t gap-3">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center space-x-2"
              onClick={() => {
                if (selectedProduct) {
                  setPreviewFoto(selectedProduct.foto);
                  setEditFormData({
                    id: selectedProduct.id,
                    nama: selectedProduct.nama,
                    kategori: selectedProduct.kategori,
                    tipeMentoring:
                      selectedProduct.kategori === "Mentoring"
                        ? selectedProduct.tipeMentoring ?? ""
                        : "",
                    foto: null,
                    deskripsi: selectedProduct.deskripsi,
                    harga: selectedProduct.harga,
                    status: selectedProduct.status,

                    // 🟢 Tambahkan ini
                    diskonTipe: selectedProduct.diskonTipe ?? "persentase",
                    diskon: selectedProduct.diskon ?? 0,
                    hargaDiskon: selectedProduct.hargaDiskon ?? "",
                  });
                }

                setIsDetailDialogOpen(false);
                setShowEditDialog(true);
              }}
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>

            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center space-x-2"
              onClick={() => handleDelete(selectedProduct?.id)}
            >
              <Trash className="w-4 h-4" />
              <span>Hapus</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] p-6 flex flex-col"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Edit Produk Atau Event</DialogTitle>
            </div>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center space-x-4 my-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${
                  editStep >= 1
                    ? "bg-[#0CA678] text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                1
              </div>
              <span
                className={`text-xs font-medium ${
                  editStep === 1 ? "text-[#0CA678]" : "text-gray-400"
                }`}
              >
                Edit Informasi Dasar
              </span>
            </div>

            {/* Garis dihapus */}

            <div className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${
                  editStep >= 2
                    ? "bg-[#0CA678] text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
              <span
                className={`text-xs font-medium ${
                  editStep === 2 ? "text-[#0CA678]" : "text-gray-400"
                }`}
              >
                Edit Deskripsi, Harga, dan Status
              </span>
            </div>
          </div>

          {/* Garis Pemisah */}
          <div className="w-full h-px bg-gray-300 mb-4"></div>

          {/* Konten Form Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {editStep === 1 ? (
              <>
                {/* STEP 1 */}
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Foto Produk
                  </label>

                  <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-6 flex flex-col items-center text-center">
                    <Image
                      src={previewFoto || "/placeholder-image.png"}
                      width={120}
                      height={120}
                      className="rounded object-contain max-w-full max-h-48 mb-3 bg-gray-300"
                      alt="foto"
                    />
                    <p className="font-bold text-gray-900 mb-1">
                      File Berhasil Diupload
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      {editFormData.foto?.name || "foto_produk.jpg"}
                    </p>
                    <div className="flex space-x-3">
                      <label className="bg-[#0CA678] hover:bg-[#08916C] text-white text-sm px-4 py-2 rounded cursor-pointer">
                        Ubah Foto
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setEditFormData({
                              ...editFormData,
                              foto: file,
                            });
                            if (file) setPreviewFoto(URL.createObjectURL(file));
                          }}
                        />
                      </label>

                      <Button
                        variant="destructive"
                        className="text-sm"
                        onClick={() => {
                          setEditFormData({ ...editFormData, foto: null });
                          setPreviewFoto(null);
                        }}
                      >
                        Hapus Foto
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-2">
                      ID Produk
                    </label>
                    <Input
                      value={editFormData.id}
                      disabled
                      className="bg-green-50 border-green-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-2">
                      Kategori Produk
                    </label>
                    <Select
                      value={editFormData.kategori}
                      onValueChange={(value) =>
                        setEditFormData({
                          ...editFormData,
                          kategori: value as Kategori,
                          tipeMentoring:
                            value === "Mentoring"
                              ? editFormData.tipeMentoring
                              : "",
                        })
                      }
                    >
                      <SelectTrigger className="w-full rounded-lg">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mentoring">Mentoring</SelectItem>
                        <SelectItem value="Practice">Practice</SelectItem>
                        <SelectItem value="E-Learning">E-Learning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {editFormData.kategori === "Mentoring" && (
                    <div className="mt-4 col-span-2">
                      <label className="text-sm font-bold text-gray-900 block mb-2">
                        Tipe Mentoring
                      </label>
                      <Select
                        value={editFormData.tipeMentoring}
                        onValueChange={(value) =>
                          setEditFormData({
                            ...editFormData,
                            tipeMentoring: value as TipeMentoring,
                          })
                        }
                      >
                        <SelectTrigger className="w-full rounded-lg">
                          <SelectValue placeholder="Pilih tipe mentoring" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                          <SelectItem value="Short Class">
                            Short Class
                          </SelectItem>
                          <SelectItem value="Live Class">Live Class</SelectItem>
                          <SelectItem value="1 on 1 Mentoring">
                            1 on 1 Mentoring
                          </SelectItem>
                          <SelectItem value="Group Mentoring">
                            Group Mentoring
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Nama Produk
                  </label>
                  <Input
                    value={editFormData.nama}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, nama: e.target.value })
                    }
                    placeholder="Masukkan nama produk"
                  />
                </div>
              </>
            ) : (
              <>
                {/* STEP 2 */}
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={editFormData.deskripsi}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        deskripsi: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Masukkan deskripsi produk"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-2">
                      Harga
                    </label>
                    <Input
                      value={editFormData.harga}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          harga: e.target.value,
                        })
                      }
                      placeholder="Masukkan harga"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-2">
                      Status
                    </label>
                    <Select
                      value={editFormData.status}
                      onValueChange={(value) =>
                        setEditFormData({ ...editFormData, status: value })
                      }
                    >
                      <SelectTrigger className="w-full rounded-lg">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Non Aktif">Non Aktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Diskon
                  </label>

                  <div className="flex flex-row items-center gap-6 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="diskonTipe"
                        checked={editFormData.diskonTipe === "persentase"}
                        onChange={() =>
                          setEditFormData({
                            ...editFormData,
                            diskonTipe: "persentase",
                            diskon: 0,
                          })
                        }
                      />
                      <span className="text-sm font-bold text-gray-700">
                        Persentase (%)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="diskonTipe"
                        checked={editFormData.diskonTipe === "angka"}
                        onChange={() =>
                          setEditFormData({
                            ...editFormData,
                            diskonTipe: "angka",
                            diskon: 0,
                          })
                        }
                      />
                      <span className="text-sm font-bold text-gray-700">
                        Nominal (Rp)
                      </span>
                    </label>
                  </div>

                  {editFormData.diskonTipe && (
                    <Input
                      className="mt-2"
                      placeholder={
                        editFormData.diskonTipe === "persentase"
                          ? "Isikan persentase diskon"
                          : "Isikan jumlah diskon dalam rupiah"
                      }
                      value={editFormData.diskon}
                      onChange={(e) => {
                        const value = Number(e.target.value) || 0;
                        const harga = Number(editFormData.harga) || 0;

                        if (editFormData.diskonTipe === "persentase") {
                          const hargaDiskon = harga - (harga * value) / 100;
                          setEditFormData({
                            ...editFormData,
                            diskon: value,
                            hargaDiskon: hargaDiskon.toString(),
                          });
                        } else {
                          const hargaDiskon = harga - value;
                          setEditFormData({
                            ...editFormData,
                            diskon: value,
                            hargaDiskon: hargaDiskon.toString(),
                          });
                        }
                      }}
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="flex space-x-3 pt-4 border-t mt-4">
            {editStep === 1 ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1 border-[#0CA678] text-[#0CA678]"
                  onClick={handleCloseEditDialog}
                >
                  Kembali
                </Button>
                <Button
                  className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
                  onClick={handleEditNextStep}
                >
                  Selanjutnya
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1 border-[#0CA678] text-[#0CA678]"
                  onClick={handleEditPrevStep}
                >
                  Sebelumnya
                </Button>
                <Button
                  className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
                  onClick={handleSaveEdit}
                >
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
