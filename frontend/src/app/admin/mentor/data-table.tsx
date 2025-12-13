"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
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
import { ChevronLeft, ChevronRight, Upload, User, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mentor } from "./columns";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
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

export function DataTable<TData extends Mentor, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedMentee, setSelectedMentee] = useState<Mentor | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [editPhotoPreview, setEditPhotoPreview] = useState("");

  const [editStep, setEditStep] = useState(1);

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "Mentor",
    status: "Aktif",
    expertise: "",
    bio: "",
  });

  const expertiseOptions = [
    "Data Engineer",
    "Data Scientist",
    "Data Analyst",
    "Machine Learning Engineer",
    "Business Intelligence",
    "Software Engineer",
    "Mobile Developer",
    "Cloud Architect",
    "AI Researcher",
    "Fullstack Developer",
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,

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
      {/* Search Bar (UI seperti Mentee Table) */}
      <div className="flex items-center pb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            placeholder="Cari Mentor berdasarkan Nama atau Email..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 focus-visible:ring-green-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`
    px-4 py-3 border-b
    ${
      header.column.getIsSorted()
        ? "bg-emerald-100 text-emerald-700"
        : "bg-gray-50 text-gray-700"
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
                <TableRow key={row.id} className="hover:bg-gray-50 transition">
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
                  className="h-24 text-center"
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

      {/* Mentor Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent
          className="sm:max-w-xl my-2 p-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <DialogHeader className="px-6 pt-4 pb-3">
            <DialogTitle className="text-xl font-bold">
              Detail Mentor
            </DialogTitle>
          </DialogHeader>

          {/* Garis pemisah */}
          <div className="border-t mx-6 mb-1"></div>

          {/* Scrollable Content */}
          <ScrollArea className="max-h-[60vh] px-6 py-3">
            {selectedMentee && (
              <div className="space-y-5">
                {/* Foto */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Foto Mentor</p>

                  <div className="w-full h-64 bg-gray-200 rounded-md overflow-hidden relative">
                    <Image
                      src={
                        selectedMentee.photo ||
                        "/placeholder.svg?height=256&width=400&text=Profile+Photo"
                      }
                      alt={selectedMentee.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Detail Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Mentor</p>
                    <p className="text-lg font-semibold break-words">
                      {selectedMentee.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nama Lengkap</p>
                    <p className="text-lg font-semibold break-words">
                      {selectedMentee.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Username</p>
                    <p className="text-lg font-semibold break-words">
                      {selectedMentee.username}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-lg font-semibold break-words">
                      {selectedMentee.email}
                    </p>
                  </div>
                </div>

                {/* Bio & Keahlian sejajar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bio</p>
                    <p className="text-lg font-semibold whitespace-pre-line">
                      {selectedMentee.bio || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Keahlian</p>
                    <p className="text-lg font-semibold">
                      {selectedMentee.expertise || "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Garis pemisah sebelum tombol */}
          <div className="border-t mx-6 mt-2"></div>

          {/* Footer */}
          <DialogFooter className="flex space-x-4 px-6 py-6 sm:justify-center">
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
                console.log("Delete mentor:", selectedMentee);
                setShowDetailDialog(false);
              }}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Mentor Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent
          className="sm:max-w-xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Mentor</DialogTitle>
          </DialogHeader>

          {/* Step Indicator — DISAMAKAN DENGAN ADD */}
          <div className="flex items-center justify-start space-x-8 mb-1">
            {/* STEP 1 */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  editStep === 1
                    ? "bg-[#0CA678] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span
                className={`text-xs font-medium ${
                  editStep === 1 ? "text-[#0CA678]" : "text-gray-500"
                }`}
              >
                Lengkapi Informasi Dasar
              </span>
            </div>

            {/* STEP 2 */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  editStep === 2
                    ? "bg-[#0CA678] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span
                className={`text-xs font-medium ${
                  editStep === 2 ? "text-[#0CA678]" : "text-gray-500"
                }`}
              >
                Lengkapi Profil Admin
              </span>
            </div>

            {/* STEP 3 */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  editStep === 3
                    ? "bg-[#0CA678] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <span
                className={`text-xs font-medium ${
                  editStep === 3 ? "text-[#0CA678]" : "text-gray-500"
                }`}
              >
                Atur Peran dan Status
              </span>
            </div>
          </div>

          {/* Separator */}
          <div className="border-b border-gray-200 mb-4"></div>

          {/* ===================== STEP CONTENT ===================== */}
          <div className="space-y-6">
            {/* STEP 1 */}
            {editStep === 1 && (
              <>
                {/* FOTO — DISAMAKAN */}
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-4">
                    Foto Mentor
                  </p>

                  <div className="flex items-start space-x-4">
                    {/* Preview Foto */}
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {editPhotoPreview ? (
                        <Image
                          src={editPhotoPreview}
                          alt="Preview"
                          width={80}
                          height={80}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-gray-400" />
                      )}
                    </div>

                    {/* Bagian kanan */}
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-3">
                        {/* Hidden input file */}
                        <input
                          type="file"
                          accept="image/png, image/jpeg"
                          className="hidden"
                          id="upload-edit-photo"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setEditPhotoPreview(URL.createObjectURL(file));
                          }}
                        />

                        <Button
                          variant="outline"
                          className="border-[#0CA678] text-[#0CA678] border-dashed hover:bg-[#0CA678] hover:text-white bg-transparent"
                          onClick={() =>
                            document
                              .getElementById("upload-edit-photo")
                              ?.click()
                          }
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload foto profil
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={() => setEditPhotoPreview("")}
                        >
                          Hapus
                        </Button>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        File png atau jpg maks 4MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* FORM FIELD */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Nama Lengkap
                    </label>
                    <Input
                      placeholder="Masukkan nama lengkap mentor"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full py-3 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="Masukkan alamat email aktif"
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          email: e.target.value,
                        })
                      }
                      className="w-full py-3 text-base"
                    />
                  </div>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {editStep === 2 && (
              <div className="space-y-6">
                <div className="bg-gray-100 p-4 rounded-md">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Keahlian Mentor
                  </label>

                  <Select
                    value={editFormData.expertise || ""}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, expertise: value })
                    }
                  >
                    <SelectTrigger className="w-full py-3 text-base bg-white">
                      <SelectValue placeholder="Pilih keahlian" />
                    </SelectTrigger>

                    <SelectContent>
                      {expertiseOptions.map((item, index) => (
                        <SelectItem key={index} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gray-100 p-4 rounded-md">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Bio
                  </label>

                  <textarea
                    placeholder="Masukkan bio mentor"
                    value={editFormData.bio || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, bio: e.target.value })
                    }
                    className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md 
              resize-none focus:ring-[#0CA678] focus:border-[#0CA678] 
              text-base bg-white"
                  />
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {editStep === 3 && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Peran
                  </label>
                  <Select
                    value={editFormData.role}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, role: value })
                    }
                  >
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
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Status Akun
                  </label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, status: value })
                    }
                  >
                    <SelectTrigger className="w-full py-3 text-base">
                      <SelectValue placeholder="Aktif" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 mt-2 pt-2"></div>

          {/* FOOTER BUTTONS */}
          <DialogFooter className="flex space-x-4 sm:justify-center mt-2">
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
              {editStep === 1 ? "Kembali" : "Sebelumnya"}
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
