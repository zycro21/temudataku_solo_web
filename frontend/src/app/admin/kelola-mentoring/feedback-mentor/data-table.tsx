"use client";

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
  DialogDescription,
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
import { Separator } from "@radix-ui/react-select";

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
    program: "",
    date: "",
    topic: "",
    evaluasi: {
      understanding: "",
      kendala: "",
      common_question: "",
      tantangan: "",
      catatan_mentor: "",
      catatan_tambahan: "",
    },
  });
  const [showDetailDialog, setShowDetailDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  const [editStep, setEditStep] = React.useState(1);

  const [editFormData, setEditFormData] = React.useState({
    id: "",
    mentor: "",
    program: "",
    date: "",
    topic: "",
    evaluasi: {
      understanding: "",
      kendala: "",
      common_question: "",
      tantangan: "",
      catatan_mentor: "",
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

  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  return (
    <div>
      {/* Search bar */}
      <div className="flex items-center pb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

          <Input
            placeholder="Cari berdasarkan Nama Mentor atau Isi Feedback..."
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

      {/* Table Wrapper */}
      <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
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
                        className={`px-4 py-3 ${
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
                  className="h-24 text-center text-gray-500 px-4 py-6"
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

      {/* Detail Project Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent
          className="
      max-w-4xl 
      max-h-[90vh] 
      p-6 
      rounded-xl 
      overflow-hidden
    "
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Detail Feedback Mentor
            </DialogTitle>
          </DialogHeader>

          {/* Wrapper scroll untuk isi modal */}
          <div className="overflow-y-auto max-h-[65vh] pr-2">
            <Tabs defaultValue="informasi" className="w-full mt-4">
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="informasi">Informasi Dasar</TabsTrigger>
                <TabsTrigger value="evaluasi">Evaluasi & Catatan</TabsTrigger>
              </TabsList>

              {/* ======================= */}
              {/* TAB: INFORMASI DASAR   */}
              {/* ======================= */}
              <TabsContent value="informasi" className="space-y-6">
                {/* ID + Tanggal */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ID Project</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject?.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Tanggal & Waktu Sesi
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject?.date}
                    </p>
                  </div>
                </div>

                {/* Program + Topik (1 Row) */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Program</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject?.program}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Topik</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject?.topic}
                    </p>
                  </div>
                </div>

                {/* Mentor (Baris sendiri) */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mentor</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedProject?.mentor}
                  </p>
                </div>
              </TabsContent>

              {/* ======================= */}
              {/* TAB: EVALUASI & CATATAN */}
              {/* ======================= */}
              <TabsContent value="evaluasi" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* 1️⃣ Pemahaman Mentor */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Pemahaman Mentee
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg text-gray-900 text-sm font-medium break-words whitespace-pre-wrap leading-relaxed">
                      {selectedProject?.evaluasi.understanding || "Tidak ada"}
                    </div>
                  </div>

                  {/* 2️⃣ Kendala */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Partisipasi Mentee
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg text-gray-900 text-sm font-medium break-words whitespace-pre-wrap leading-relaxed">
                      {selectedProject?.evaluasi.catatan_mentor || "Tidak ada"}
                    </div>
                  </div>

                  {/* 4️⃣ Tantangan */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Tantangan Mentee (Secara Umum)
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg text-gray-900 text-sm font-medium break-words whitespace-pre-wrap leading-relaxed">
                      {selectedProject?.evaluasi.kendala || "Tidak ada"}
                    </div>
                  </div>

                  {/* 3️⃣ Pertanyaan Umum */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Pertanyaan Umum dari Mentee
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg text-gray-900 text-sm font-medium break-words whitespace-pre-wrap leading-relaxed">
                      {selectedProject?.evaluasi.common_question || "Tidak ada"}
                    </div>
                  </div>

                  {/* 5️⃣ Catatan Mentor */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Fokus Selanjutnya (Di Sesi Selanjutnya)
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg text-gray-900 text-sm font-medium break-words whitespace-pre-wrap leading-relaxed">
                      {selectedProject?.evaluasi.tantangan || "Tidak ada"}
                    </div>
                  </div>

                  {/* 6️⃣ Catatan Tambahan */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Catatan Tambahan
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg text-gray-900 text-sm font-medium break-words whitespace-pre-wrap leading-relaxed">
                      {selectedProject?.evaluasi.catatan_tambahan ||
                        "Tidak ada"}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Garis pemisah di atas CTA */}
          <div className="border-t pt-4 mt-4" />

          {/* ======================= */}
          {/* CTA BUTTONS             */}
          {/* ======================= */}
          <div className="flex space-x-4 pt-2">
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
              onClick={() => setShowDeleteDialog(true)}
            >
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Feedback Mentor Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent
          className="max-w-3xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-xl font-semibold">
              Edit Feedback Mentor
            </DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center space-x-3 py-1">
            {/* Step 1 */}
            <div
              className={`flex items-center space-x-1 ${
                editStep === 1 ? "text-[#0CA678]" : "text-gray-400"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                  editStep === 1
                    ? "bg-[#0CA678] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="text-xs font-medium">Informasi Mentoring</span>
            </div>

            {/* Step 2 */}
            <div
              className={`flex items-center space-x-1 ${
                editStep === 2 ? "text-[#0CA678]" : "text-gray-400"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                  editStep === 2
                    ? "bg-[#0CA678] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="text-xs font-medium">Evaluasi Mentor</span>
            </div>

            {/* Step 3 */}
            <div
              className={`flex items-center space-x-1 ${
                editStep === 3 ? "text-[#0CA678]" : "text-gray-400"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                  editStep === 3
                    ? "bg-[#0CA678] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <span className="text-xs font-medium">Edit Catatan Tambahan</span>
            </div>
          </div>

          {/* ⬇️ Garis pemisah dipindah ke sini */}
          <div className="border-t mt-2 mb-0"></div>

          {/* ================= CONTENT ================= */}
          <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-2">
            {/* ================= STEP 1 (READ ONLY) ================= */}
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
                    disabled
                    className="bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed"
                  />
                </div>

                {/* Mentor & Program */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Mentor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mentor
                    </label>
                    <Input
                      value={editFormData.mentor}
                      readOnly
                      disabled
                      className="bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Program */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program
                    </label>
                    <Input
                      value={editFormData.program}
                      readOnly
                      disabled
                      className="bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Tanggal & Topik */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Tanggal & Waktu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal & Waktu
                    </label>
                    <Input
                      value={editFormData.date}
                      readOnly
                      disabled
                      className="bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Topik */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topik
                    </label>
                    <Input
                      value={editFormData.topic}
                      readOnly
                      disabled
                      className="bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ================= STEP 2 ================= */}
            {editStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* 1️⃣ Pemahaman Mentee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pemahaman Mentee
                    </label>
                    <Textarea
                      rows={3}
                      value={editFormData.evaluasi.understanding}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-800 pointer-events-none"
                    />
                  </div>

                  {/* 2️⃣ Partisipasi Mentee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Partisipasi Mentee
                    </label>
                    <Textarea
                      rows={3}
                      value={editFormData.evaluasi.catatan_mentor}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-800 pointer-events-none"
                    />
                  </div>

                  {/* 3️⃣ Tantangan Mentee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tantangan Mentee (Secara Umum)
                    </label>
                    <Textarea
                      rows={3}
                      value={editFormData.evaluasi.kendala}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-800 pointer-events-none"
                    />
                  </div>

                  {/* 4️⃣ Pertanyaan Umum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pertanyaan Umum yang ditanyakan Mentee
                    </label>
                    <Textarea
                      rows={3}
                      value={editFormData.evaluasi.common_question}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-800 pointer-events-none"
                    />
                  </div>

                  {/* 5️⃣ Fokus Selanjutnya */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fokus Selanjutnya (Di Sesi Selanjutnya)
                    </label>
                    <Textarea
                      rows={3}
                      value={editFormData.evaluasi.tantangan}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-800 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 3 ================= */}
            {editStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan Tambahan
                  </label>
                  <Textarea
                    rows={5}
                    value={editFormData.evaluasi.catatan_tambahan}
                    readOnly
                    className="bg-gray-50 border-gray-200 text-gray-800 pointer-events-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ================= NAVIGATION ================= */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t">
            {/* KIRI: Kembali / Sebelumnya */}
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

            {/* KANAN: Selanjutnya (mati di step 3) */}
            <Button
              className={`
      w-full
      bg-[#0CA678]
      text-white
      hover:bg-[#08916C]
      ${
        editStep === 3
          ? "opacity-50 cursor-not-allowed pointer-events-none"
          : ""
      }
    `}
              onClick={() => {
                if (editStep < 3) {
                  setEditStep(editStep + 1);
                }
              }}
            >
              Selanjutnya
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent
          className="max-w-md rounded-xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* HEADER */}
          <DialogHeader>
            <DialogTitle className="text-emerald-600 text-xl font-semibold">
              Konfirmasi Hapus Feedback
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Apakah Anda yakin ingin menghapus feedback mentor ini?
              <span className="block mt-2 text-sm text-red-500">
                Tindakan ini tidak dapat dibatalkan.
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* BODY */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-emerald-800">
              Feedback mentor yang dihapus akan hilang secara permanen dari
              sistem.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Batal
            </Button>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={deleting}
              onClick={async () => {
                if (!selectedProject?.id) return;

                try {
                  setDeleting(true);

                  await axios.delete(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorReports/mentor/reports/${selectedProject.id}`,
                    { withCredentials: true }
                  );

                  toast.success("Feedback mentor berhasil dihapus");

                  setShowDeleteDialog(false);
                  setShowDetailDialog(false);
                } catch (error: any) {
                  console.error(error);
                  toast.error(
                    error?.response?.data?.message ??
                      "Gagal menghapus feedback mentor"
                  );
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
