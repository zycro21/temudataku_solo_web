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
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
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
    getSortedRowModel: getSortedRowModel(),
    // NEW
    meta: {
      onView: (project: Project) => {
        setSelectedProject(project);
        setShowDetailDialog(true);
      },
      onEdit: (project: Project) => {
        setSelectedProject(project);
        setEditFormData(project);
        setEditStep(1);
        setShowEditDialog(true);
      },
      onDelete: (project: Project) => {
        console.log("Deleting:", project);
      },
    },
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
        focus:border-emerald-500
        focus:ring-emerald-500
        focus-visible:ring-emerald-500
        rounded-lg
      "
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white p-4">
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
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors border-b"
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

      {/* Detail Sesi Practice */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent
          className="max-w-3xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Detail Sesi Practice
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
                  <p className="text-sm text-gray-600 mb-1">
                    Status Pengumpulan
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedProject.submissionStatus}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status Review</p>
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
                      mentee: selectedProject.mentee,
                      submissionStatus: selectedProject.submissionStatus,
                      reviewStatus: selectedProject.reviewStatus,
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

      {/* Edit Project Mentee Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent
          className="max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Edit Project Mentee
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Step 1 */}
            {editStep === 1 && (
              <>
                {/* ID Sesi */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    ID Sesi
                  </label>
                  <div className="w-full px-3 py-2 rounded-md bg-gray-100 border border-gray-300 text-black">
                    {editFormData.id}
                  </div>
                </div>

                {/* Mentee (Manual Input) */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Mentee
                  </label>
                  <Input
                    value={editFormData.mentee}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        mentee: e.target.value,
                      })
                    }
                    placeholder="Nama Mentee"
                  />
                </div>

                {/* Mentor & Review Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
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
                    <label className="block text-sm font-semibold text-black mb-2">
                      Review Status
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
          <div className="flex pt-6 border-t gap-3">
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
