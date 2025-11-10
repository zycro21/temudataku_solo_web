"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
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
import { ChevronLeft, ChevronRight } from "lucide-react";
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends Project, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(
    null
  );
  const [showDetailDialog, setShowDetailDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  const [editStep, setEditStep] = React.useState(1);

  const [editFormData, setEditFormData] = React.useState({
    id: "",
    mentee: "",
    date: "",
    submissionStatus: "",
    reviewStatus: "",
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
        <Input
          placeholder="Cari data..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm border-green-500 focus-visible:ring-green-500"
        />
      </div>

      {/* 📋 Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                        className={isSelectColumn ? "" : "cursor-pointer"}
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

      {/* 📌 Detail Project Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Detail Project
            </DialogTitle>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-6 py-4">
              {/* First Row */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600 mb-1">ID Project</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedProject.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Tanggal & Waktu Pengumpulan
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedProject.date}
                  </p>
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mentee</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedProject.mentee}
                  </p>
                </div>
              </div>

              {/* Third Row */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Program</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedProject.submissionStatus}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Topik</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedProject.reviewStatus}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6 border-t">
                <Button
                  className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
                  onClick={() => {
                    if (!selectedProject) return;

                    setEditFormData({
                      id: selectedProject.id,
                      date: selectedProject.date,
                      mentee: selectedProject.mentee ?? "",
                      submissionStatus: selectedProject.submissionStatus ?? "",
                      reviewStatus: selectedProject.reviewStatus ?? "",
                    });

                    // kalau ada modal edit, panggil disini
                    setEditStep(1);
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
                    console.log("Delete project:", selectedProject);
                    setShowDetailDialog(false);
                  }}
                >
                  Hapus
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ✏️ Edit Project Mentee Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Edit Project Mentee
            </DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center space-x-4 py-4">
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
              <span className="font-medium">Edit Informasi Dasar</span>
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
              <span className="font-medium">Edit Project</span>
            </div>
          </div>

          <div className="space-y-6 py-4">
            {/* Step 1 */}
            {editStep === 1 && (
              <>
                {/* ID Mentoring */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Sesi
                  </label>
                  <Input
                    value={editFormData.id}
                    readOnly
                    className="bg-green-50 border-green-200 text-green-800 font-medium"
                  />
                </div>

                {/* Mentor & Mentee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mentee
                  </label>
                  <Select
                    value={editFormData.mentee}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, mentee: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Mentee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kevin Mendoza">
                        Kevin Mendoza
                      </SelectItem>
                      <SelectItem value="Jehan Ra">Jehan Ra</SelectItem>
                      <SelectItem value="Galih B">Galih B</SelectItem>
                      <SelectItem value="Bonda Prakoso">
                        Bonda Prakoso
                      </SelectItem>
                      <SelectItem value="Darwin Nunez">Darwin Nunez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mentor
                    </label>
                    <Select
                      value={editFormData.submissionStatus}
                      onValueChange={(value) =>
                        setEditFormData({
                          ...editFormData,
                          submissionStatus: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sudah dikumpulkan">
                          Sudah Dikumpulkan
                        </SelectItem>
                        <SelectItem value="belum dikumpulkan">
                          Belum Dikumpulkan
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mentee
                    </label>
                    <Select
                      value={editFormData.reviewStatus}
                      onValueChange={(value) =>
                        setEditFormData({
                          ...editFormData,
                          reviewStatus: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sudah direview">
                          Sudah Direview
                        </SelectItem>
                        <SelectItem value="belum direview">
                          Belum Direview
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
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
                if (editStep === 1) {
                  console.log("Save changes:", editFormData);
                  setShowEditDialog(false);
                  setEditStep(1);
                } else {
                  setEditStep(editStep + 1);
                }
              }}
            >
              {editStep === 1 ? "Simpan Perubahan" : "Selanjutnya"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
