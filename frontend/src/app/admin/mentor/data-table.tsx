"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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

  const handleSaveEditMentor = async () => {
    if (!selectedMentee?.id) return;

    const loadingToastId = toast.loading("Menyimpan perubahan data mentor...");

    try {
      // UPDATE DATA DASAR USER
      const formData = new FormData();
      formData.append("fullName", editFormData.name);
      formData.append("email", editFormData.email);

      const photoInput = document.getElementById(
        "upload-edit-photo",
      ) as HTMLInputElement;

      if (photoInput?.files?.[0]) {
        formData.append("profilePicture", photoInput.files[0]);
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/update`,
        formData,
        {
          params: {
            user_id: selectedMentee.id, // admin update mentor lain
          },
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );

      // UPDATE PROFIL MENTOR
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentor/profile`,
        {
          expertise: editFormData.expertise,
          bio: editFormData.bio,
        },
        {
          params: {
            userId: selectedMentee.id,
          },
          withCredentials: true,
        },
      );

      toast.success("Perubahan mentor berhasil disimpan", {
        id: loadingToastId,
      });

      setShowEditDialog(false);
      setEditStep(1);
    } catch (err: any) {
      console.error("Update mentor error:", err);

      toast.error("Gagal menyimpan perubahan mentor", {
        id: loadingToastId,
        description:
          err?.response?.data?.message ??
          "Terjadi kesalahan saat menyimpan data mentor",
      });
    }
  };

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <div>
      {/* Search Bar */}
      <div className="flex items-center pb-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Cari Mentor..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8 py-1.5 text-sm focus-visible:ring-green-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table className="text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`
                px-3 py-2 border-b text-xs font-medium whitespace-nowrap
                ${
                  header.column.getIsSorted()
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-50 text-gray-600"
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
                <TableRow key={row.id} className="hover:bg-gray-50 transition">
                  {row.getVisibleCells().map((cell) => {
                    const isSelectColumn = cell.column.id === "select";

                    return (
                      <TableCell
                        key={cell.id}
                        className={`px-3 py-2 text-xs truncate max-w-[160px] ${
                          isSelectColumn ? "" : "cursor-pointer"
                        }`}
                        onClick={() => {
                          if (!isSelectColumn) {
                            setSelectedMentee(row.original);
                            setShowDetailDialog(true);
                          }
                        }}
                      >
                        <div className="truncate">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-20 text-center text-sm"
                >
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
        <div className="text-xs text-gray-600">
          Menampilkan {from}-{to} dari {totalRows} data
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Per halaman */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600">Per halaman</span>
            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-xs"
            >
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
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
                  className={`h-7 px-2 text-xs ${
                    pageIndex + 1 === page
                      ? "bg-[#0CA678] hover:bg-[#08916C]"
                      : ""
                  }`}
                  onClick={() => table.setPageIndex(page - 1)}
                >
                  {page}
                </Button>
              ))}

            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mentor Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent
          className="
      w-[95vw] max-w-lg
      p-0
      rounded-lg
    "
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <DialogHeader className="px-5 pt-4 pb-2">
            <DialogTitle className="text-base font-semibold">
              Detail Mentor
            </DialogTitle>
          </DialogHeader>

          {/* Divider */}
          <div className="border-t mx-5"></div>

          {/* Scrollable Content */}
          <ScrollArea className="max-h-[65vh] px-5 py-3">
            {selectedMentee && (
              <div className="space-y-4">
                {/* Foto */}
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Foto Mentor</p>

                  <div className="w-full h-48 bg-gray-200 rounded-md overflow-hidden relative">
                    <Image
                      src={
                        selectedMentee.photo ||
                        "/placeholder.svg?height=256&width=400"
                      }
                      alt={selectedMentee.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Detail Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ID Mentor</p>
                    <p className="text-sm font-semibold break-words">
                      {selectedMentee.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Nama Lengkap</p>
                    <p className="text-sm font-semibold break-words">
                      {selectedMentee.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Tanggal Registrasi
                    </p>
                    <p className="text-sm font-semibold break-words">
                      {formatDateTime(selectedMentee.registeredAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-semibold break-words">
                      {selectedMentee.email}
                    </p>
                  </div>
                </div>

                {/* Bio & Keahlian */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Bio</p>
                    <p className="text-sm font-medium whitespace-pre-line">
                      {selectedMentee.bio || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Keahlian</p>
                    <p className="text-sm font-medium">
                      {selectedMentee.expertise || "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Divider */}
          <div className="border-t mx-5"></div>

          {/* Footer */}
          <DialogFooter className="flex gap-3 px-5 py-4">
            <Button
              className="flex-1 h-9 text-sm bg-[#0CA678] hover:bg-[#08916C]"
              onClick={() => {
                if (selectedMentee) {
                  setEditFormData({
                    name: selectedMentee.name,
                    email: selectedMentee.email,
                    role: selectedMentee.role,
                    status:
                      selectedMentee.status === "inaktif"
                        ? "Tidak Aktif"
                        : "Aktif",
                    bio: selectedMentee.bio || "",
                    expertise: selectedMentee.expertise || "",
                  });

                  setEditPhotoPreview(selectedMentee.photo || "");
                }

                setEditStep(1);
                setShowDetailDialog(false);
                setShowEditDialog(true);
              }}
            >
              Edit
            </Button>

            <Button
              variant="destructive"
              className="flex-1 h-9 text-sm"
              onClick={() => {
                setShowDetailDialog(false);
                setShowDeleteDialog(true);
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
          className="sm:max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Edit Mentor
            </DialogTitle>
          </DialogHeader>

          {/* Step Indicator — DISAMAKAN DENGAN ADD */}
          <div className="flex items-center justify-start space-x-5 mb-1">
            {/* STEP 1 */}
            <div className="flex items-center space-x-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
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
            <div className="flex items-center space-x-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
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
            <div className="flex items-center space-x-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
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
          <div className="border-b border-gray-200 mb-3"></div>

          {/* ===================== STEP CONTENT ===================== */}
          <div className="space-y-4">
            {/* STEP 1 */}
            {editStep === 1 && (
              <>
                {/* FOTO */}
                <div>
                  <p className="text-xs font-medium text-gray-900 mb-2">
                    Foto Mentor
                  </p>

                  <div className="flex items-start space-x-3">
                    {/* Preview Foto */}
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                      {editPhotoPreview ? (
                        <Image
                          src={editPhotoPreview}
                          alt="Preview"
                          width={56}
                          height={56}
                          unoptimized
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-gray-400" />
                      )}
                    </div>

                    {/* Bagian kanan */}
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
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
                          size="sm"
                          className="border-[#0CA678] text-[#0CA678] border-dashed hover:bg-[#0CA678] hover:text-white bg-transparent text-xs"
                          onClick={() =>
                            document
                              .getElementById("upload-edit-photo")
                              ?.click()
                          }
                        >
                          <Upload className="w-3 h-3 mr-1.5" />
                          Upload foto profil
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-xs"
                          onClick={() => setEditPhotoPreview("")}
                        >
                          Hapus
                        </Button>
                      </div>

                      <p className="text-xs text-gray-500 mt-1.5">
                        File png atau jpg maks 4MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* FORM FIELD */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-900 mb-1">
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
                      className="w-full text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-900 mb-1">
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
                      className="w-full text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {editStep === 2 && (
              <div className="space-y-4">
                <div className="bg-gray-100 p-3 rounded-md">
                  <label className="block text-xs font-medium text-gray-900 mb-1.5">
                    Keahlian Mentor
                  </label>

                  <Select
                    value={editFormData.expertise || ""}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, expertise: value })
                    }
                  >
                    <SelectTrigger className="w-full text-sm bg-white">
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

                <div className="bg-gray-100 p-3 rounded-md">
                  <label className="block text-xs font-medium text-gray-900 mb-1.5">
                    Bio
                  </label>

                  <textarea
                    placeholder="Masukkan bio mentor"
                    value={editFormData.bio || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, bio: e.target.value })
                    }
                    className="w-full min-h-[140px] p-2.5 border border-gray-300 rounded-md 
              resize-none focus:ring-[#0CA678] focus:border-[#0CA678] 
              text-sm bg-white"
                  />
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {editStep === 3 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Peran
                  </label>
                  <Select
                    value={editFormData.role}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, role: value })
                    }
                  >
                    <SelectTrigger className="w-full text-sm">
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
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Status Akun
                  </label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, status: value })
                    }
                  >
                    <SelectTrigger className="w-full text-sm">
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
          <div className="border-t border-gray-200 mt-1 pt-1"></div>

          {/* FOOTER BUTTONS */}
          <DialogFooter className="flex space-x-3 sm:justify-center mt-1">
            <Button
              variant="outline"
              className="flex-1 bg-transparent text-sm"
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
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-sm"
              onClick={() => {
                if (editStep === 3) {
                  handleSaveEditMentor();
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0CA678]">
              Konfirmasi Hapus Mentor
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-700 text-sm">
              Apakah kamu yakin ingin menghapus akun mentor berikut?
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <p className="font-semibold text-gray-900">
                {selectedMentee?.name}
              </p>
              <p className="text-sm text-gray-600">{selectedMentee?.email}</p>
            </div>

            <p className="text-sm text-red-600">
              Tindakan ini <b>tidak dapat dibatalkan</b>.
            </p>
          </div>

          <DialogFooter className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              disabled={deleting}
              onClick={() => setShowDeleteDialog(false)}
            >
              Batal
            </Button>

            <Button
              variant="destructive"
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C]"
              disabled={deleting}
              onClick={async () => {
                if (!selectedMentee?.id) return;

                setDeleting(true);
                const loadingToastId = toast.loading(
                  "Menghapus akun mentor...",
                );

                try {
                  await axios.delete(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/${selectedMentee.id}`,
                    {
                      withCredentials: true,
                    },
                  );

                  toast.success("Akun mentor berhasil dihapus", {
                    id: loadingToastId,
                  });

                  setShowDeleteDialog(false);
                  setSelectedMentee(null);
                  router.refresh();
                } catch (err: any) {
                  console.error(err);

                  toast.error("Gagal menghapus akun mentor", {
                    id: loadingToastId,
                    description:
                      err?.response?.data?.message ??
                      "Terjadi kesalahan saat menghapus akun",
                  });
                } finally {
                  setDeleting(false);
                }
              }}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
