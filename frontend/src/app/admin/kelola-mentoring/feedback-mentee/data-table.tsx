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
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Datas } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends Datas, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedProject, setSelectedProject] = React.useState<Datas>({
    id: "",
    mentor: "",
    mentee: "",
    program: "",
    date: "",
    topic: "",
    skor: 0,
    publicVisible: true,
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
    skor: 0,
    publicVisible: true,
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
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);
  const totalPages = table.getPageCount();

  const calculateRatingFromEvaluasi = (evaluasi: any) => {
    // ambil hanya value numeric (6 skor)
    const values = Object.values(evaluasi).filter(
      (v) => typeof v === "number"
    ) as number[];

    if (values.length === 0) return 0;

    // rata-rata 0–100
    const avg100 = values.reduce((sum, v) => sum + (v || 0), 0) / values.length;

    // konversi ke 0–5
    return Number(((avg100 / 100) * 5).toFixed(1));
  };

  const buildFinalComment = (
    masukkan: string,
    catatanTambahan: string
  ): string | null => {
    let baseComment = masukkan?.trim() || "";

    if (catatanTambahan?.trim()) {
      baseComment +=
        (baseComment ? "\n" : "") +
        "Catatan Tambahan: " +
        catatanTambahan.trim();
    }

    return baseComment || null;
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmitEdit = async () => {
    try {
      setIsSubmitting(true);

      // Hitung rating (0–5, boleh desimal)
      const rating = calculateRatingFromEvaluasi(editFormData.evaluasi);

      // Bangun comment final (Masukkan + Catatan Tambahan)
      const comment = buildFinalComment(
        editFormData.evaluasi.masukkan,
        editFormData.evaluasi.catatan_tambahan
      );

      // Call API (PUT)
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feedback/adminFeedbacks/${editFormData.id}`,
        {
          isVisible: editFormData.publicVisible,
          rating,
          comment,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Feedback berhasil diperbarui");

      // Reset UI
      setShowEditDialog(false);
      setEditStep(1);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Gagal memperbarui feedback"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteFeedback = async () => {
    if (!selectedProject?.id) return;

    try {
      setIsDeleting(true);

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feedback/feedbacks/${selectedProject.id}`,
        {
          withCredentials: true,
        }
      );

      toast.success("Feedback berhasil dihapus");

      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Gagal menghapus feedback");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Search bar */}
      <div className="flex items-center pb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

          <Input
            placeholder="Cari berdasarkan Nama Mentee atau Email..."
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
      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`
                      px-4 py-3 text-sm font-semibold text-gray-700 transition-colors
                      ${header.column.getIsSorted() ? "bg-emerald-200" : ""}
                      ${header.column.getIsFiltered() ? "bg-emerald-100" : ""}
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
                  className="hover:bg-gray-50 transition-colors h-14"
                >
                  {row.getVisibleCells().map((cell) => {
                    const isSelectColumn = cell.column.id === "select";

                    return (
                      <TableCell
                        key={cell.id}
                        className={`px-4 py-3 text-sm ${
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

      {/* Detail Feedback Mentee Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent
          className="max-w-5xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Detail Feedback Mentee
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <Tabs defaultValue="informasi" className="w-full mt-4">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="informasi">Informasi Dasar</TabsTrigger>
              <TabsTrigger value="evaluasi">Evaluasi & Catatan</TabsTrigger>
            </TabsList>

            {/* Konten scrollable */}
            <div className="max-h-[70vh] overflow-y-auto pr-3">
              {/* INFORMASI DASAR */}
              <TabsContent value="informasi" className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ID Feedback</p>
                    <p className="text-lg font-semibold text-gray-900 break-words">
                      {selectedProject?.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Tanggal & Waktu Pengumpulan
                    </p>
                    <p className="text-lg font-semibold text-gray-900 break-words">
                      {selectedProject?.date}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mentor</p>
                    <p className="text-lg font-semibold text-gray-900 break-words">
                      {selectedProject?.mentor}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mentee</p>
                    <p className="text-lg font-semibold text-gray-900 break-words">
                      {selectedProject?.mentee}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Program</p>
                    <p className="text-lg font-semibold text-gray-900 break-words">
                      {selectedProject?.program}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Topik</p>
                    <p className="text-lg font-semibold text-gray-900 break-words">
                      {selectedProject?.topic}
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* EVALUASI */}
              <TabsContent value="evaluasi" className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Kemudahan Materi
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject?.evaluasi.kemudahan_materi}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Kejelasan Materi
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject?.evaluasi.kejelasan_materi}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Respon Mentor terhadap Pertanyaan
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject?.evaluasi.mentor_menjawab}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Pelaksanaan Kelas
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject?.evaluasi.pelaksanaan}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Kesesuaian Jadwal
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject?.evaluasi.kesesuaian_jadwal}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Kualitas Platform
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject?.evaluasi.kualitas_platform}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Masukkan</p>
                  <p className="text-lg font-semibold text-gray-900 whitespace-pre-wrap break-words">
                    {selectedProject?.evaluasi.masukkan || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Catatan Tambahan</p>
                  <p className="text-lg font-semibold text-gray-900 whitespace-pre-wrap break-words">
                    {selectedProject?.evaluasi.catatan_tambahan || "-"}
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Divider */}
          <div className="border-t pt-2 mt-4" />

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
              onClick={() => {
                if (selectedProject) {
                  setEditFormData(selectedProject);
                  setShowDetailDialog(false);
                  setShowEditDialog(true);
                }
              }}
            >
              Edit
            </Button>

            <Button
              variant="destructive"
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={() => {
                setShowDetailDialog(false);
                setShowDeleteDialog(true);
              }}
            >
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Feedback Mentee Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent
          className="max-w-3xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0CA678]" />
              <p className="mt-2 text-sm text-gray-600">
                Sedang memproses feedback...
              </p>
            </div>
          )}
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-xl font-semibold">
              Edit Feedback Mentor
            </DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center space-x-4 py-1">
            <div
              className={`flex items-center space-x-2 ${
                editStep === 1 ? "text-[#0CA678]" : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  editStep === 1
                    ? "bg-[#0CA678] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              {/* Font diperkecil */}
              <span className="font-medium text-sm">Informasi Mentoring</span>
            </div>

            <div
              className={`flex items-center space-x-2 ${
                editStep === 2 ? "text-[#0CA678]" : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  editStep === 2
                    ? "bg-[#0CA678] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              {/* Font diperkecil */}
              <span className="font-medium text-sm">Evaluasi Mentor</span>
            </div>
          </div>

          {/* Garis pemisah dipindah ke SINI */}
          <div className="border-b pb-2"></div>

          {/* ===== SCROLLABLE CONTENT ===== */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6 py-4">
              {/* ================= STEP 1 ================= */}
              {editStep === 1 && (
                <>
                  {/* ID Mentoring */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Mentoring
                    </label>
                    <Input
                      value={editFormData.id}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>

                  {/* Mentee & Mentor */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mentee
                      </label>
                      <Input
                        value={editFormData.mentee}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mentor
                      </label>
                      <Input
                        value={editFormData.mentor}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Program & Public Visible */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Program */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Program
                      </label>
                      <Input
                        value={editFormData.program}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>

                    {/* Public Visible */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Public Visible
                      </label>
                      <Select
                        value={editFormData.publicVisible ? "true" : "false"}
                        onValueChange={(value) =>
                          setEditFormData({
                            ...editFormData,
                            publicVisible: value === "true",
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Ya</SelectItem>
                          <SelectItem value="false">Tidak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {/* ================= STEP 2 ================= */}
              {editStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ["Materi Mudah Dimengerti", "kemudahan_materi"],
                      ["Materi Jelas & Interaktif", "kejelasan_materi"],
                      ["Mentor Menjawab Dengan Baik", "mentor_menjawab"],
                      ["Pelaksanaan Tepat Waktu", "pelaksanaan"],
                      ["Jadwal Sesuai", "kesesuaian_jadwal"],
                      ["Platform Pembelajaran Baik", "kualitas_platform"],
                    ].map(([label, key]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {label}
                        </label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={
                            editFormData.evaluasi[
                              key as keyof typeof editFormData.evaluasi
                            ] === 0
                              ? ""
                              : editFormData.evaluasi[
                                  key as keyof typeof editFormData.evaluasi
                                ]
                          }
                          onChange={(e) => {
                            const value = e.target.value;

                            // boleh kosong
                            if (value === "") {
                              setEditFormData({
                                ...editFormData,
                                evaluasi: {
                                  ...editFormData.evaluasi,
                                  [key]: 0,
                                },
                              });
                              return;
                            }

                            let num = Number(value);

                            if (isNaN(num)) return;

                            // batas maksimal 100
                            if (num > 100) num = 100;
                            if (num < 0) num = 0;

                            setEditFormData({
                              ...editFormData,
                              evaluasi: {
                                ...editFormData.evaluasi,
                                [key]: num,
                              },
                            });
                          }}
                        />

                        <p className="text-xs text-gray-500 mt-1">
                          Skala 0–100
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Masukkan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Masukkan / Saran
                    </label>
                    <Textarea
                      rows={3}
                      value={editFormData.evaluasi.masukkan}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          evaluasi: {
                            ...editFormData.evaluasi,
                            masukkan: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  {/* Catatan Tambahan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan Tambahan
                    </label>
                    <Textarea
                      rows={3}
                      value={editFormData.evaluasi.catatan_tambahan}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          evaluasi: {
                            ...editFormData.evaluasi,
                            catatan_tambahan: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex pt-4 border-t gap-3">
            <Button
              variant="outline"
              className="w-1/2"
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
              className="w-1/2 bg-[#0CA678] hover:bg-[#08916C] text-white"
              disabled={isSubmitting}
              onClick={() => {
                if (editStep === 2) {
                  handleSubmitEdit();
                } else {
                  setEditStep(editStep + 1);
                }
              }}
            >
              {isSubmitting
                ? "Menyimpan..."
                : editStep === 2
                ? "Simpan Perubahan"
                : "Selanjutnya"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Delete Confirmation Dialog ===== */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent
          className="max-w-md border border-emerald-100"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-emerald-700">
              Konfirmasi Hapus Feedback
            </DialogTitle>
          </DialogHeader>

          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>Apakah kamu yakin ingin menghapus feedback ini?</p>
            <p className="text-gray-500">
              Feedback yang dihapus{" "}
              <span className="font-medium">tidak dapat dikembalikan</span>.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              disabled={isDeleting}
              onClick={() => setShowDeleteDialog(false)}
            >
              Batal
            </Button>

            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isDeleting}
              onClick={handleDeleteFeedback}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
