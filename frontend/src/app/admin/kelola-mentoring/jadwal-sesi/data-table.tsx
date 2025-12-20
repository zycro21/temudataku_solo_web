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
  FileText,
  Trash2,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SesiMentoring } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends SesiMentoring, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedMentee, setSelectedMentee] = useState<SesiMentoring | null>(
    null
  );
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [editStep, setEditStep] = useState(1);

  const [editFormData, setEditFormData] = useState<{
    id: string;
    mentor: string;
    mentorProfileId: string;
    program: string;
    topik: string;
    date: string;
    time: string;
    durasi: string;
    dokumenPendukung: string;
    ukuranFile: number | null;
    status: string;
  }>({
    id: "",
    mentor: "",
    mentorProfileId: "",
    program: "",
    topik: "",
    date: "",
    time: "",
    durasi: "",
    dokumenPendukung: "",
    ukuranFile: null,
    status: "",
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
    getSortedRowModel: getSortedRowModel(), // <= WAJIB untuk sorting
    getPaginationRowModel: getPaginationRowModel(),

    enableSorting: true,
    enableMultiSort: false,
    enableColumnFilters: true,
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);
  const totalPages = table.getPageCount();

  const toISODate = (ddmmyyyy: string) => {
    const [dd, mm, yyyy] = ddmmyyyy.split("-");
    return `${yyyy}-${mm}-${dd}`;
  };

  const parseDateAndTime = (value: string) => {
    // contoh: 20-10-2025 (08:30 - 09:45)
    const match = value.match(
      /^(\d{2}-\d{2}-\d{4})\s+\((\d{2}:\d{2})\s-\s(\d{2}:\d{2})\)$/
    );

    if (!match) {
      return { date: "", time: "" };
    }

    return {
      date: toISODate(match[1]), // ✅ FIX PENTING
      time: `${match[2]} - ${match[3]}`,
    };
  };

  const formatHourMinute = (iso: string) =>
    new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  type MentorOption = {
    id: string;
    fullName: string;
  };

  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [loadingMentor, setLoadingMentor] = useState(false);

  useEffect(() => {
    if (!selectedMentee?.serviceId || !showEditDialog) return;

    const fetchMentorsByService = async () => {
      setLoadingMentor(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentor/admin/mentor-profiles/by-service/${selectedMentee.serviceId}`,
          { withCredentials: true }
        );

        setMentors(res.data.data);
      } catch (err) {
        console.error("Gagal mengambil mentor by service", err);
        setMentors([]);
      } finally {
        setLoadingMentor(false);
      }
    };

    fetchMentorsByService();
  }, [selectedMentee?.serviceId, showEditDialog]);

  const [initialProgram, setInitialProgram] = useState<string>("");

  const parseTimeRange = (time: string) => {
    // "13:30 - 15:00"
    const match = time.match(/^(\d{2}):(\d{2})\s-\s(\d{2}):(\d{2})$/);

    if (!match) return null;

    return {
      startTime: {
        hour: Number(match[1]),
        minute: Number(match[2]),
      },
      endTime: {
        hour: Number(match[3]),
        minute: Number(match[4]),
      },
    };
  };

  const mapProgramToServiceType = (program: string) => {
    switch (program) {
      case "1 on 1 Mentoring":
        return "one-on-one";
      case "Group Mentoring":
        return "group";
      case "Short Class":
        return "shortclass";
      case "Live Class":
        return "live class";
      case "Bootcamp":
        return "bootcamp";
      default:
        return "bootcamp";
    }
  };

  const handleSaveEditSession = async () => {
    try {
      const sessionId = editFormData.id;

      /** ===============================
     * 1. UPDATE JADWAL (DATE + TIME)
     =============================== */
      const timeParsed = parseTimeRange(editFormData.time);

      if (editFormData.date || timeParsed) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/admin/mentoring-sessions/${sessionId}`,
          {
            date: editFormData.date
              ? editFormData.date.split("-").reverse().join("-") // yyyy-mm-dd -> dd-mm-yyyy
              : undefined,
            ...(timeParsed ?? {}),
          },
          { withCredentials: true }
        );
      }

      /** ===============================
     * 2. UPDATE STATUS
     =============================== */
      if (editFormData.status) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/admin/mentoring-sessions/${sessionId}/status`,
          { status: editFormData.status },
          { withCredentials: true }
        );
      }

      /** ===============================
     * 3. UPDATE MENTOR
     =============================== */
      if (editFormData.mentorProfileId) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/admin/mentoring-sessions/${sessionId}/mentors`,
          {
            mentorProfileIds: [editFormData.mentorProfileId],
          },
          { withCredentials: true }
        );
      }

      /** ===============================
 * 4. UPDATE PROGRAM SAJA
 * (serviceType mentoring service)
 =============================== */
      if (
        selectedMentee?.serviceId &&
        editFormData.program !== initialProgram
      ) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/admin/mentoring-services/${selectedMentee.serviceId}`,
          {
            serviceType: mapProgramToServiceType(editFormData.program),
          },
          { withCredentials: true }
        );
      }

      toast.success("Sesi mentoring berhasil diperbarui");

      setShowEditDialog(false);
      setEditStep(1);
      // fetchMentoringSessions();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message ?? "Gagal menyimpan perubahan");
    }
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSession = async () => {
    if (!selectedMentee?.id) return;

    try {
      setIsDeleting(true);

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/admin/mentoring-sessions/${selectedMentee.id}`,
        { withCredentials: true }
      );

      toast.success("Sesi mentoring berhasil dihapus");

      setShowDeleteDialog(false);
      setSelectedMentee(null);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Gagal menghapus sesi mentoring"
      );
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
            placeholder="Cari Jadwal Mentoring berdasarkan Nama atau Email..."
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`
    px-5 py-4 text-sm font-semibold 
    text-gray-700 transition-colors
    
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
                        className={`
    px-5 py-4 text-sm 
    ${isSelectColumn ? "" : "cursor-pointer"} 
    ${
      cell.column.id === "topik" || cell.column.id === "dokumenPendukung"
        ? "whitespace-normal break-words"
        : ""
    }
  `}
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

      {/* Session Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent
          className="sm:max-w-xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Detail Sesi Mentoring
            </DialogTitle>
          </DialogHeader>

          {/* Garis pemisah rapat di bawah title */}
          <div className="border-b border-gray-200 mb-3" />

          {selectedMentee && (
            <div className="flex flex-col max-h-[70vh] overflow-y-auto px-1">
              {/* === KONTEN UTAMA === */}
              <div className="space-y-5">
                {/* BARIS 1: ID Mentoring | Tanggal & Waktu */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Mentoring</p>
                    <p className="text-lg font-semibold">{selectedMentee.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Tanggal & Waktu
                    </p>
                    <p className="text-lg font-semibold">
                      {selectedMentee.date}
                    </p>
                  </div>
                </div>

                {/* BARIS 2: Mentor | (kosong) */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mentor</p>
                    <p className="text-lg font-semibold">
                      {selectedMentee.mentor}
                    </p>
                  </div>
                  <div>{/* kosong sesuai permintaan */}</div>
                </div>

                {/* BARIS 3: Program | Topik */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Program</p>
                    <p className="text-lg font-semibold">
                      {selectedMentee.program}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Topik</p>
                    <p className="text-lg font-semibold">
                      {selectedMentee.topik}
                    </p>
                  </div>
                </div>

                {/* BARIS 4: Durasi | Status */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Durasi Sesi</p>
                    <p className="text-lg font-semibold">
                      {selectedMentee.durasi}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <p className="text-lg font-semibold">
                      {selectedMentee.status
                        ? selectedMentee.status.charAt(0).toUpperCase() +
                          selectedMentee.status.slice(1)
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Dokumen pendukung */}
                {selectedMentee.dokumenPendukung &&
                  selectedMentee.dokumenPendukung !== "-" && (
                    <div className="pt-2">
                      <p className="text-sm text-gray-500 mb-2">
                        Dokumen Pendukung
                      </p>

                      <div className="p-3 bg-gray-50 rounded-lg flex items-center space-x-3">
                        <FileText className="w-7 h-7 text-gray-400 mt-1" />

                        <div className="flex flex-col flex-1">
                          {/* Nama File */}
                          <p className="font-medium text-gray-900">
                            {selectedMentee.dokumenPendukung}
                          </p>

                          {/* Ukuran File */}
                          <p className="text-sm text-gray-500">
                            {selectedMentee.ukuranFile
                              ? `${(
                                  selectedMentee.ukuranFile /
                                  1024 /
                                  1024
                                ).toFixed(2)}mb`
                              : "Ukuran tidak tersedia"}
                          </p>

                          {/* Tombol lihat dokumen */}
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/supportDocuments/${selectedMentee.dokumenPendukung}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0CA678] text-sm font-medium hover:underline text-left mt-1"
                          >
                            Lihat Dokumen
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Garis pemisah sebelum tombol CTA */}
              <div className="border-b border-gray-200 my-4" />

              {/* === CTA BUTTONS === */}
              <div className="flex space-x-4">
                <Button
                  className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
                  onClick={() => {
                    const parsed = parseDateAndTime(selectedMentee.date);
                    setInitialProgram(selectedMentee.program);

                    setEditFormData({
                      id: selectedMentee.id,
                      mentor: selectedMentee.mentor,
                      mentorProfileId: selectedMentee.mentorProfileId ?? "",
                      program: selectedMentee.program,
                      topik: selectedMentee.topik,
                      date: toISODate(selectedMentee.rawDate),
                      time: `${formatHourMinute(
                        selectedMentee.rawStartTime
                      )} - ${formatHourMinute(selectedMentee.rawEndTime)}`,
                      durasi: selectedMentee.durasi,
                      status: selectedMentee.status,
                      dokumenPendukung: selectedMentee.dokumenPendukung,
                      ukuranFile: selectedMentee.ukuranFile,
                    });

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
                    setShowDetailDialog(false);
                    setShowDeleteDialog(true);
                  }}
                >
                  Hapus
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent
          className="sm:max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Edit Sesi Mentoring
            </DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-start space-x-6 mb-4">
            {[
              { step: 1, label: "Edit Informasi Dasar" },
              { step: 2, label: "Edit Jadwal & Status" },
              { step: 3, label: "Edit Dokumen Pendukung" },
            ].map(({ step, label }) => (
              <div key={step} className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                    editStep === step
                      ? "bg-[#0CA678] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                <span
                  className={`text-xs font-medium ${
                    editStep === step ? "text-[#0CA678]" : "text-gray-500"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Divider antara Step Indicator & Form */}
          <div className="border-t border-gray-200 mb-2" />

          <div className="space-y-6">
            {/* Step 1: Basic Information */}
            {editStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    ID Mentoring
                  </label>
                  <Input
                    value={editFormData.id}
                    disabled
                    className="w-full bg-green-100 border-green-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Mentor
                  </label>
                  <Select
                    key={editFormData.mentorProfileId}
                    value={editFormData.mentorProfileId}
                    onValueChange={(value) =>
                      setEditFormData({
                        ...editFormData,
                        mentorProfileId: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih mentor" />
                    </SelectTrigger>

                    <SelectContent>
                      {loadingMentor && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          Memuat mentor...
                        </div>
                      )}

                      {!loadingMentor &&
                        mentors.map((mentor) => (
                          <SelectItem key={mentor.id} value={mentor.id}>
                            {mentor.fullName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Program
                  </label>
                  <Select
                    value={editFormData.program}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, program: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 on 1 Mentoring">
                        1 on 1 Mentoring
                      </SelectItem>
                      <SelectItem value="Group Mentoring">
                        Group Mentoring
                      </SelectItem>
                      <SelectItem value="Short Class">Short Class</SelectItem>
                      <SelectItem value="Live Class">Live Class</SelectItem>
                      <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Topik (Otomatis dari Layanan)
                  </label>

                  <Textarea
                    value={editFormData.topik}
                    disabled
                    readOnly
                    className="w-full min-h-[100px] resize-none bg-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="Topik ditentukan dari layanan mentoring"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Schedule & Status */}
            {editStep === 2 && (
              <div className="grid grid-cols-2 gap-6">
                {/* Tanggal */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tanggal
                  </label>
                  <Input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, date: e.target.value })
                    }
                    className="w-full"
                  />
                </div>

                {/* Waktu */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Waktu
                  </label>
                  <Input
                    placeholder="HH:MM - HH:MM"
                    value={editFormData.time}
                    onChange={(e) => {
                      // ambil angka saja
                      const digits = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 8);

                      let formatted = "";

                      if (digits.length >= 1) {
                        formatted += digits.slice(0, 2);
                      }

                      if (digits.length >= 3) {
                        formatted =
                          digits.slice(0, 2) + ":" + digits.slice(2, 4);
                      }

                      if (digits.length >= 5) {
                        formatted =
                          digits.slice(0, 2) +
                          ":" +
                          digits.slice(2, 4) +
                          " - " +
                          digits.slice(4, 6);
                      }

                      if (digits.length >= 7) {
                        formatted =
                          digits.slice(0, 2) +
                          ":" +
                          digits.slice(2, 4) +
                          " - " +
                          digits.slice(4, 6) +
                          ":" +
                          digits.slice(6, 8);
                      }

                      setEditFormData({
                        ...editFormData,
                        time: formatted,
                      });
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Durasi Sesi
                  </label>
                  <Input
                    value={editFormData.durasi}
                    disabled
                    className="w-full bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Status
                  </label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(val: string) =>
                      setEditFormData({ ...editFormData, status: val })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      {["scheduled", "ongoing", "completed", "cancelled"].map(
                        (opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Supporting Documents */}
            {editStep === 3 && selectedMentee && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Dokumen Pendukung
                  </h3>

                  {editFormData.dokumenPendukung !== "-" && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {editFormData.dokumenPendukung}
                          </p>
                          <p className="text-sm text-gray-500">
                            {editFormData.ukuranFile &&
                            editFormData.ukuranFile > 0
                              ? `${(
                                  editFormData.ukuranFile /
                                  1024 /
                                  1024
                                ).toFixed(2)} MB`
                              : "Ukuran tidak tersedia"}
                          </p>
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/supportDocuments/${selectedMentee.dokumenPendukung}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0CA678] text-sm font-medium hover:underline"
                          >
                            Lihat Dokumen
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {editFormData.dokumenPendukung === "-" && (
                    <p className="text-sm text-gray-500 italic">
                      Tidak ada dokumen pendukung
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider antara Form & CTA */}
          <div className="border-t border-gray-200 mt-2" />

          {/* Navigation Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
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
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C]"
              onClick={() => {
                if (editStep === 3) {
                  handleSaveEditSession();
                } else {
                  setEditStep(editStep + 1);
                }
              }}
            >
              {editStep === 3 ? "Simpan Perubahan" : "Selanjutnya"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent
          className="sm:max-w-md border-emerald-200"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-700">
              Konfirmasi Hapus Sesi
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-700">
              Apakah kamu yakin ingin menghapus sesi mentoring berikut?
            </p>

            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Mentor</p>
              <p className="font-semibold text-gray-900">
                {selectedMentee?.mentor}
              </p>

              <p className="text-sm text-gray-500 mt-3 mb-1">Program</p>
              <p className="font-semibold text-gray-900">
                {selectedMentee?.program}
              </p>

              <p className="text-sm text-gray-500 mt-3 mb-1">Tanggal</p>
              <p className="font-semibold text-gray-900">
                {selectedMentee?.date}
              </p>
            </div>

            <p className="text-sm text-red-600">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Batal
            </Button>

            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleDeleteSession}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
