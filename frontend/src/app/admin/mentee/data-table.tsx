"use client";

import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";
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
import { Mentee } from "./columns";
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

export function DataTable<TData extends Mentee, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();

  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editPhotoPreview, setEditPhotoPreview] = useState("");

  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
  });

  const handleSaveEdit = async () => {
    if (!selectedMentee) return;

    try {
      const formData = new FormData();

      formData.append("fullName", editFormData.name);
      formData.append("email", editFormData.email);

      if (editFormData.role) {
        formData.append("role", editFormData.role.toLowerCase());
      }

      formData.append(
        "isActive",
        editFormData.status === "Aktif" ? "true" : "false",
      );

      const fileInput = document.getElementById(
        "edit-photo",
      ) as HTMLInputElement;

      if (fileInput?.files?.[0]) {
        formData.append("profilePicture", fileInput.files[0]);
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/admin/${selectedMentee.id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Data mentee berhasil diperbarui");

      setShowEditDialog(false);

      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal memperbarui data mentee");
    }
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteMentee = async () => {
    if (!selectedMentee) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/${selectedMentee.id}`,
        { withCredentials: true },
      );

      toast.success("Akun mentee berhasil dihapus");

      setShowDeleteDialog(false);
      setSelectedMentee(null);

      router.refresh();
    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data?.message || "Gagal menghapus akun mentee";

      toast.error(message);
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
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
      {/* Search bar */}
      <div className="flex items-center pb-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Cari nama, email, status..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm focus-visible:ring-green-500"
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
                    className={`px-3 py-2 text-gray-700 whitespace-nowrap
                ${
                  header.column.getIsSorted() || header.column.getFilterValue()
                    ? "bg-emerald-100 text-emerald-900"
                    : ""
                }
                ${
                  typeof header.column.columnDef.header === "function"
                    ? "cursor-pointer"
                    : ""
                }`}
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
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => {
                    const isSelectColumn = cell.column.id === "select";

                    return (
                      <TableCell
                        key={cell.id}
                        className={`px-3 py-2 align-middle ${
                          isSelectColumn ? "" : "cursor-pointer"
                        }`}
                        onClick={() => {
                          if (!isSelectColumn) {
                            setSelectedMentee(row.original);
                            setShowDetailDialog(true);
                          }
                        }}
                      >
                        <div className="truncate max-w-[160px]">
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Page size */}
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

          {/* Pagination buttons */}
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

      {/* Mentee Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent
          className="sm:max-w-xl my-2 p-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <DialogHeader className="px-6 pt-4 pb-3">
            <DialogTitle className="text-xl font-bold">
              Detail Mentee
            </DialogTitle>
          </DialogHeader>

          {/* Garis pemisah */}
          <div className="border-t mx-6 mb-2"></div>

          {/* Scrollable Content */}
          <ScrollArea className="max-h-[70vh] px-6 py-3">
            {selectedMentee && (
              <div className="space-y-6">
                {/* Foto */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Foto Mentee</p>

                  <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden relative">
                    <Image
                      src={
                        selectedMentee.photo ||
                        "/assets/dashboard/user/avatar.png"
                      }
                      alt={selectedMentee.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Detail Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Mentee</p>
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
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-lg font-semibold break-words">
                      {selectedMentee.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Tanggal Akun Dibuat
                    </p>
                    <p className="text-lg font-semibold break-words">
                      {new Date(selectedMentee.createdAt).toLocaleString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Peran</p>
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedMentee.role}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status Akun</p>
                    <p className="text-lg font-semibold">
                      {selectedMentee.status || "Aktif"}
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
                    role: selectedMentee.role.toLowerCase(),
                    status: selectedMentee.status ?? "Aktif",
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
                setShowDetailDialog(false);
                setShowDeleteDialog(true);
              }}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Mentee Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Mentee</DialogTitle>
          </DialogHeader>

          {/* Garis pemisah setelah Title */}
          <div className="border-t my-3"></div>

          <div className="space-y-6">
            {/* Photo Section */}
            <div>
              <p className="text-sm font-medium text-gray-900 mb-4">
                Foto Mentee
              </p>

              <div className="flex items-start space-x-4">
                {/* Preview Foto */}
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {editPhotoPreview || selectedMentee?.photo ? (
                    <Image
                      src={
                        editPhotoPreview ||
                        selectedMentee?.photo ||
                        "/placeholder.svg?height=80&width=80&text=Foto"
                      }
                      alt="Preview"
                      width={80}
                      height={80}
                      unoptimized
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>

                {/* Bagian kanan */}
                <div className="flex flex-col">
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      className="hidden"
                      id="edit-photo"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = URL.createObjectURL(file);
                        setEditPhotoPreview(url);
                      }}
                    />

                    <Button
                      variant="outline"
                      className="border-[#0CA678] text-[#0CA678] border-dashed hover:bg-[#0CA678] hover:text-white bg-transparent"
                      onClick={() =>
                        document.getElementById("edit-photo")?.click()
                      }
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Ganti foto profil
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

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nama Lengkap
                </label>
                <Input
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Peran
                  </label>
                  <Select
                    value={editFormData.role}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, role: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih peran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mentee">Mentee</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="affiliator">Affiliator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Status Akun
                  </label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, status: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Garis pemisah sebelum tombol */}
          <div className="border-t my-4"></div>

          <DialogFooter className="flex space-x-4 sm:justify-center">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setShowEditDialog(false)}
            >
              Batalkan Perubahan
            </Button>

            <Button
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C]"
              onClick={handleSaveEdit}
            >
              Simpan Perubahan
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
            <DialogTitle className="text-xl font-bold text-gray-900">
              Konfirmasi Hapus Akun
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-600">
              Apakah kamu yakin ingin menghapus akun mentee berikut?
            </p>

            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-sm font-semibold text-emerald-900">
                {selectedMentee?.name}
              </p>
              <p className="text-xs text-emerald-700">
                {selectedMentee?.email}
              </p>
            </div>

            <p className="text-xs text-red-600">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          <DialogFooter className="mt-6 flex space-x-3 sm:justify-end">
            <Button
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              onClick={() => setShowDeleteDialog(false)}
            >
              Batal
            </Button>

            <Button
              variant="destructive"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleDeleteMentee}
            >
              Ya, Hapus Akun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
