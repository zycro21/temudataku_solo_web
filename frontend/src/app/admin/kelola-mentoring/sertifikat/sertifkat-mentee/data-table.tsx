"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  getSortedRowModel,
  ColumnDef,
  type SortingState,
  getPaginationRowModel,
  Row,
} from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MenteeCertificate } from "./columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [showDetailDialog, setShowDetailDialog] = React.useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    React.useState<MenteeCertificate | null>(null);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  const [editDraft, setEditDraft] = React.useState<MenteeCertificate | null>(
    null
  );
  const [generateClicked, setGenerateClicked] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // penanda aksi (BELUM kirim API)
  const [removeCertificate, setRemoveCertificate] = React.useState(false);
  const [regenerateCertificate, setRegenerateCertificate] =
    React.useState(false);

  const openEditDialog = (cert: MenteeCertificate) => {
    setSelectedCertificate(cert);
    setEditDraft({ ...cert });
    setRemoveCertificate(false);
    setRegenerateCertificate(false);
    setGenerateClicked(false);
    setShowEditDialog(true);
  };

  const hasCertificate = !!editDraft?.certificatePath && !removeCertificate;

  // --- GLOBAL SEARCH FUNCTION ---
  const globalFilterFn = (
    row: Row<TData>,
    columnId: string,
    filterValue: string
  ) => {
    const value = row.getValue(columnId);
    return String(value ?? "")
      .toLowerCase()
      .includes(filterValue.toLowerCase());
  };

  const table = useReactTable({
    data,
    columns,
    meta: {
      onView: (item: MenteeCertificate) => {
        setSelectedCertificate(item);
        setShowDetailDialog(true);
      },
      onEdit: (item: MenteeCertificate) => {
        openEditDialog(item);
      },
    } as any,
    state: {
      globalFilter,
      sorting,
    },
    globalFilterFn,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,

    // Core features
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

  const buildCertificatePathUrl = (certificatePath: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    const normalizedPath = certificatePath.startsWith("/")
      ? certificatePath.slice(1)
      : certificatePath;

    return `${baseUrl}/${normalizedPath}`;
  };

  const isPdf = (path?: string) => path?.toLowerCase().endsWith(".pdf");

  const isImage = (path?: string) => /\.(jpg|jpeg|png|webp)$/i.test(path || "");

  return (
    <>
      <div className="space-y-4">
        {/* Search bar */}
        <div className="flex items-center pb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

            <Input
              placeholder="Cari data..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="
            pl-10 bg-gray-100 
            border border-gray-300
            focus:border-emerald-500
            focus:ring-emerald-500
            focus-visible:ring-emerald-500
            rounded-lg
          "
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`
                      px-5 py-4 text-sm cursor-pointer select-none
                      ${
                        header.column.getIsSorted() ||
                        header.column.getFilterValue()
                          ? "bg-emerald-100 text-emerald-900"
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-5 py-3 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Tidak ada data yang ditemukan
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
              <span className="text-sm text-gray-600">
                Tampilkan per halaman
              </span>
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
      </div>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent
          className="sm:max-w-4xl my-2 p-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* ================= HEADER ================= */}
          <DialogHeader className="px-8 pt-6 pb-4">
            <DialogTitle className="text-2xl font-bold">
              Detail Sertifikat
            </DialogTitle>
          </DialogHeader>

          <div className="border-t mx-8" />

          {/* ================= SCROLLABLE CONTENT ================= */}
          <ScrollArea className="max-h-[70vh] px-8 py-6">
            {selectedCertificate && (
              <div className="space-y-8">
                {/* ================= TEMPLATE ================= */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Preview Sertifikat
                  </p>

                  <div className="w-full h-64 rounded-md overflow-hidden border bg-gray-100">
                    {selectedCertificate.certificatePath ? (
                      isPdf(selectedCertificate.certificatePath) ? (
                        /* ================= PDF PREVIEW ================= */
                        <iframe
                          src={`${buildCertificatePathUrl(
                            selectedCertificate.certificatePath
                          )}#page=1&zoom=50`}
                          className="w-full h-full"
                          title="Preview Sertifikat PDF"
                        />
                      ) : isImage(selectedCertificate.certificatePath) ? (
                        /* ================= IMAGE PREVIEW ================= */
                        <img
                          src={buildCertificatePathUrl(
                            selectedCertificate.certificatePath
                          )}
                          alt="Preview Sertifikat"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm text-gray-500">
                          Format file tidak didukung
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-gray-500">
                        Tidak ada file sertifikat
                      </div>
                    )}
                  </div>
                </div>

                {/* ================= DETAIL GRID ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ID */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Sertifikat</p>
                    <p className="text-base font-semibold break-words whitespace-normal">
                      {selectedCertificate.id}
                    </p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Tanggal & Waktu Diupload
                    </p>
                    <p className="text-base font-semibold break-words whitespace-normal">
                      {selectedCertificate.date}
                    </p>
                  </div>

                  {/* Nama Sertifikat */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Nama Sertifikat
                    </p>
                    <p className="text-base font-semibold break-words whitespace-normal">
                      {selectedCertificate.name}
                    </p>
                  </div>

                  {/* Mentee */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nama</p>
                    <p className="text-base font-semibold break-words whitespace-normal">
                      {selectedCertificate.mentee}
                    </p>
                  </div>

                  {/* Program */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Program</p>
                    <p className="text-base font-semibold">
                      {selectedCertificate.program}
                    </p>
                  </div>
                </div>

                {/* ================= LINK SERTIFIKAT ================= */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Akses Sertifikat</p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Certificate Path */}
                    {selectedCertificate.certificatePath && (
                      <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <a
                          href={buildCertificatePathUrl(
                            selectedCertificate.certificatePath
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Lihat Sertifikat (File)
                        </a>
                      </Button>
                    )}

                    {/* Drive URL */}
                    {selectedCertificate.driveUrl && (
                      <Button
                        asChild
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        <a
                          href={selectedCertificate.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Lihat Sertifikat (Drive)
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="border-t mx-8" />
        </DialogContent>
      </Dialog>

      {/* ======================================================
    EDIT DIALOG
====================================================== */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent
          className="sm:max-w-4xl my-2 p-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* ================= HEADER ================= */}
          <DialogHeader className="px-8 pt-6 pb-4">
            <DialogTitle className="text-2xl font-bold">
              Edit Sertifikat
            </DialogTitle>
          </DialogHeader>

          <div className="border-t mx-8" />

          {/* ================= SCROLLABLE CONTENT ================= */}
          <ScrollArea className="max-h-[65vh] px-8 py-6">
            {selectedCertificate && (
              <div className="space-y-6">
                {/* ================= TEMPLATE PREVIEW ================= */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Preview Sertifikat
                  </p>

                  <div className="w-full h-64 rounded-md overflow-hidden border bg-gray-100">
                    {hasCertificate ? (
                      isPdf(editDraft!.certificatePath!) ? (
                        <iframe
                          src={`${buildCertificatePathUrl(
                            editDraft!.certificatePath!
                          )}#page=1&zoom=50`}
                          className="w-full h-full"
                        />
                      ) : (
                        <img
                          src={buildCertificatePathUrl(
                            editDraft!.certificatePath!
                          )}
                          className="w-full h-full object-contain"
                        />
                      )
                    ) : generateClicked ? (
                      <div className="flex flex-col items-center justify-center h-full text-sm text-[#0CA678] gap-2">
                        <div className="animate-pulse font-semibold">
                          Sertifikat siap digenerate
                        </div>
                        <span className="text-xs text-gray-500">
                          Klik “Simpan Perubahan” untuk memproses
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-gray-500">
                        Tidak ada sertifikat
                      </div>
                    )}
                  </div>

                  {/* ================= ACTION BUTTON ================= */}
                  <div className="mt-4 flex justify-center">
                    {hasCertificate ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="px-8"
                        onClick={() => {
                          setRemoveCertificate(true);
                          setRegenerateCertificate(false);
                        }}
                      >
                        Hapus Sertifikat
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className={`px-8 transition-all ${
                          generateClicked
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#0CA678] hover:bg-[#08916C]"
                        }`}
                        disabled={generateClicked || isSubmitting}
                        onClick={() => {
                          setRegenerateCertificate(true);
                          setRemoveCertificate(false);
                          setGenerateClicked(true);

                          toast.info("Generate sertifikat dipilih", {
                            description:
                              "Klik Simpan Perubahan untuk memproses sertifikat",
                          });
                        }}
                      >
                        {generateClicked
                          ? "Siap Digenerate ✓"
                          : "Generate Sertifikat"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* ================= FORM ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* ID */}
                  <div>
                    <label className="text-sm text-gray-600">
                      ID Sertifikat
                    </label>
                    <Input
                      value={selectedCertificate.id}
                      readOnly
                      className="mt-1 bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  {/* Program */}
                  <div>
                    <label className="text-sm text-gray-600">Program</label>
                    <Input
                      value={selectedCertificate.program}
                      readOnly
                      className="mt-1 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Nama Sertifikat */}
                <div>
                  <label className="text-sm text-gray-600">
                    Nama Sertifikat
                  </label>
                  <Input
                    value={selectedCertificate.name}
                    readOnly
                    className="mt-1 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="border-t mx-8" />

          {/* ================= FOOTER ================= */}
          <DialogFooter className="px-8 py-6 flex gap-4 sm:justify-center">
            <Button
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
              onClick={() => {
                setShowEditDialog(false);
                setEditDraft(null);
                setRemoveCertificate(false);
                setRegenerateCertificate(false);
                setGenerateClicked(false);
              }}
            >
              Batal
            </Button>

            <Button
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C]"
              disabled={isSubmitting}
              onClick={async () => {
                if (!editDraft) return;

                setIsSubmitting(true);

                // optional: toast loading
                const loadingToastId = toast.loading(
                  regenerateCertificate
                    ? "Sedang generate sertifikat..."
                    : removeCertificate
                    ? "Sedang menghapus sertifikat..."
                    : "Menyimpan perubahan..."
                );

                try {
                  await axios.patch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/certificate/admin/certificates/${editDraft.id}`,
                    {
                      removeCertificate,
                      regenerateCertificate,
                    },
                    {
                      withCredentials: true,
                    }
                  );

                  toast.success("Sertifikat berhasil diperbarui", {
                    id: loadingToastId,
                    description: regenerateCertificate
                      ? "Sertifikat berhasil digenerate"
                      : removeCertificate
                      ? "Sertifikat berhasil dihapus"
                      : "Perubahan berhasil disimpan",
                  });

                  setShowEditDialog(false);
                  setEditDraft(null);
                  setRemoveCertificate(false);
                  setRegenerateCertificate(false);
                  setGenerateClicked(false);
                } catch (error: any) {
                  toast.error("Gagal memperbarui sertifikat", {
                    id: loadingToastId,
                    description:
                      error?.response?.data?.message ||
                      "Terjadi kesalahan saat memproses sertifikat",
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Sedang memproses...
                </span>
              ) : regenerateCertificate ? (
                "Generate & Simpan"
              ) : removeCertificate ? (
                "Hapus & Simpan"
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
