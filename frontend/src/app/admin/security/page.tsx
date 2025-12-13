"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Clock,
  ChevronDown,
  Calendar,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "./data-table";
import { columns, Project } from "./columns";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminMentorPage() {
  const [exportOpen, setExportOpen] = useState(false);

  const [projects] = useState<Project[]>([
    {
      id: "MNTG01",
      date: "10-05-2025, 20:00",
      jenisData: ["daftar mentee", "mentoring"],
      ukuranFile: "2 MB",
      formatFile: "JSON",
      status: "gagal",
    },
    {
      id: "MNTG02",
      date: "10-05-2025, 20:00",
      jenisData: ["daftar mentor"],
      ukuranFile: "2 MB",
      formatFile: "CSV",
      status: "berhasil",
    },
    {
      id: "MNTG03",
      date: "10-05-2025, 20:00",
      jenisData: ["produk & event"],
      ukuranFile: "3 MB",
      formatFile: "XLSX",
      status: "gagal",
    },
    {
      id: "MNTG04",
      date: "10-05-2025, 20:00",
      jenisData: ["elearning"],
      ukuranFile: "1.5 MB",
      formatFile: "CSV",
      status: "berhasil",
    },
    {
      id: "MNTG05",
      date: "10-05-2025, 20:00",
      jenisData: ["practice"],
      ukuranFile: "2 MB",
      formatFile: "JSON",
      status: "berhasil",
    },
    {
      id: "MNTG06",
      date: "10-05-2025, 20:00",
      jenisData: ["project"],
      ukuranFile: "2.5 MB",
      formatFile: "CSV",
      status: "berhasil",
    },
    {
      id: "MNTG07",
      date: "10-05-2025, 20:00",
      jenisData: ["transaksi"],
      ukuranFile: "2 MB",
      formatFile: "XLSX",
      status: "gagal",
    },
    {
      id: "MNTG08",
      date: "10-05-2025, 20:00",
      jenisData: ["semua"], // otomatis berisi semua jenis data
      ukuranFile: "5 MB",
      formatFile: "JSON",
      status: "berhasil",
    },
    {
      id: "MNTG09",
      date: "10-05-2025, 20:00",
      jenisData: ["daftar mentee", "daftar mentor", "project"],
      ukuranFile: "3 MB",
      formatFile: "CSV",
      status: "berhasil",
    },
    {
      id: "MNTG10",
      date: "10-05-2025, 20:00",
      jenisData: ["produk & event", "transaksi"],
      ukuranFile: "1 MB",
      formatFile: "XLSX",
      status: "gagal",
    },
    {
      id: "MNTG11",
      date: "10-05-2025, 20:00",
      jenisData: ["mentoring", "project"],
      ukuranFile: "2 MB",
      formatFile: "JSON",
      status: "berhasil",
    },
    {
      id: "MNTG12",
      date: "10-05-2025, 20:00",
      jenisData: ["daftar mentee"],
      ukuranFile: "1.2 MB",
      formatFile: "CSV",
      status: "gagal",
    },
    {
      id: "MNTG13",
      date: "10-05-2025, 20:00",
      jenisData: ["elearning", "practice"],
      ukuranFile: "2.7 MB",
      formatFile: "XLSX",
      status: "berhasil",
    },
    {
      id: "MNTG14",
      date: "10-05-2025, 20:00",
      jenisData: ["project"],
      ukuranFile: "3.4 MB",
      formatFile: "JSON",
      status: "gagal",
    },
    {
      id: "MNTG15",
      date: "10-05-2025, 20:00",
      jenisData: ["transaksi"],
      ukuranFile: "1.9 MB",
      formatFile: "CSV",
      status: "berhasil",
    },
    {
      id: "MNTG16",
      date: "10-05-2025, 20:00",
      jenisData: ["daftar mentor", "elearning"],
      ukuranFile: "2.2 MB",
      formatFile: "XLSX",
      status: "gagal",
    },
    {
      id: "MNTG17",
      date: "10-05-2025, 20:00",
      jenisData: ["project", "practice"],
      ukuranFile: "3 MB",
      formatFile: "CSV",
      status: "berhasil",
    },
    {
      id: "MNTG18",
      date: "10-05-2025, 20:00",
      jenisData: ["semua"], // auto semua jenis
      ukuranFile: "5.5 MB",
      formatFile: "JSON",
      status: "berhasil",
    },
    {
      id: "MNTG19",
      date: "10-05-2025, 20:00",
      jenisData: ["produk & event"],
      ukuranFile: "1.8 MB",
      formatFile: "CSV",
      status: "gagal",
    },
    {
      id: "MNTG20",
      date: "10-05-2025, 20:00",
      jenisData: ["mentoring"],
      ukuranFile: "2.3 MB",
      formatFile: "XLSX",
      status: "berhasil",
    },
    {
      id: "MNTG21",
      date: "10-05-2025, 20:00",
      jenisData: ["practice", "elearning"],
      ukuranFile: "2.1 MB",
      formatFile: "JSON",
      status: "berhasil",
    },
    {
      id: "MNTG22",
      date: "10-05-2025, 20:00",
      jenisData: ["daftar mentee", "produk & event"],
      ukuranFile: "3.2 MB",
      formatFile: "CSV",
      status: "gagal",
    },
    {
      id: "MNTG23",
      date: "10-05-2025, 20:00",
      jenisData: ["daftar mentor"],
      ukuranFile: "1.6 MB",
      formatFile: "XLSX",
      status: "berhasil",
    },
    {
      id: "MNTG24",
      date: "10-05-2025, 20:00",
      jenisData: ["project", "transaksi"],
      ukuranFile: "4 MB",
      formatFile: "JSON",
      status: "berhasil",
    },
    {
      id: "MNTG25",
      date: "10-05-2025, 20:00",
      jenisData: ["elearning"],
      ukuranFile: "1.7 MB",
      formatFile: "CSV",
      status: "gagal",
    },
  ]);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const dataTypes = [
    { id: "daftar mentee", label: "Daftar Mentee" },
    { id: "daftar mentor", label: "Daftar Mentor" },
    { id: "produk & event", label: "Produk & Event" },
    { id: "mentoring", label: "Mentoring" },
    { id: "elearning", label: "E-Learning" },
    { id: "practice", label: "Practice" },
    { id: "project", label: "Project" },
    { id: "transaksi", label: "Transaksi" },
    { id: "semua", label: "Semua" }, // memilih semuanya otomatis
  ];

  const backupFormats = [
    { id: "JSON", label: "JSON" },
    { id: "CSV", label: "CSV" },
    { id: "XLSX", label: "XLSX" },
  ];

  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>("JSON");

  const handleToggleDataType = (id: string) => {
    setSelectedDataTypes((current) => {
      // Jika pilih "semua" → reset langsung ke ["semua"]
      if (id === "semua") {
        return ["semua"];
      }

      // Jika sebelumnya sudah memilih "semua", dan sekarang pilih yang lain → matikan "semua"
      const withoutSemua = current.filter((item) => item !== "semua");

      // Toggle normal
      return withoutSemua.includes(id)
        ? withoutSemua.filter((item) => item !== id)
        : [...withoutSemua, id];
    });
  };

  const handleBackupNow = () => {
    console.log("Backup jenis:", selectedDataTypes);
    console.log("Format:", selectedFormat);
    setIsBackupModalOpen(false);
  };

  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  const [scheduleFrequency, setScheduleFrequency] = useState("harian");
  const [scheduleFormat, setScheduleFormat] = useState("JSON");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  function handleSaveSchedule() {
    console.log({
      scheduleFrequency,
      scheduleFormat,
      scheduleDate,
      scheduleTime,
    });

    setIsScheduleDialogOpen(false);
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Security
          </h1>

          {/* Breadcrumb */}
          <p className="text-gray-600 flex items-center">
            History & Security
            <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
            <span className="font-semibold text-gray-800">Security</span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="">
        {/* Backup Section */}
        <Card className="mb-6">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-semibold">Backup</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            <p className="text-sm text-gray-600">
              Backup data memastikan Anda tidak kehilangan informasi penting.
              Lakukan secara berkala atau aktifkan backup otomatis.
            </p>

            <div className="w-full md:w-1/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Backup Manual */}
                <div className="flex flex-col">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Backup Manual
                  </h3>

                  <Dialog
                    open={isBackupModalOpen}
                    onOpenChange={setIsBackupModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-[#0CA678] hover:bg-[#08916C] text-white text-base px-4 py-2 flex items-center gap-2">
                        <Image
                          src="/assets/admin/backup.svg" // sesuaikan path icon kamu
                          alt="backup-icon"
                          width={20}
                          height={20}
                        />
                        Buat Backup Sekarang
                      </Button>
                    </DialogTrigger>

                    {/* ⚠️ BAGIAN MODAL TIDAK DIUBAH */}
                    <DialogContent
                      className="max-w-md"
                      onInteractOutside={(e) => e.preventDefault()}
                    >
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                          Buat Backup Manual
                        </DialogTitle>
                      </DialogHeader>

                      <hr className="my-3" />

                      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {/* Data Types */}
                        <div>
                          <h3 className="text-base font-semibold mb-2">
                            Pilih jenis data yang ingin di-backup
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Bisa pilih lebih dari satu jenis.
                          </p>

                          <div className="grid grid-cols-2 gap-3">
                            {dataTypes.map((dataType) => (
                              <label
                                key={dataType.id}
                                className="flex items-center space-x-3 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedDataTypes.includes(
                                    dataType.id
                                  )}
                                  onChange={() =>
                                    handleToggleDataType(dataType.id)
                                  }
                                  className="w-5 h-5 rounded border-[#0CA678] accent-[#0CA678] focus:ring-[#0CA678]"
                                />
                                <span className="text-sm">
                                  {dataType.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <hr />

                        {/* Format */}
                        <div>
                          <h3 className="text-base font-semibold mb-4">
                            Pilih Format Backup
                          </h3>

                          <div className="flex items-center space-x-6">
                            {backupFormats.map((format) => (
                              <label
                                key={format.id}
                                className="flex items-center space-x-3 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name="backup-format"
                                  value={format.id}
                                  checked={selectedFormat === format.id}
                                  onChange={(e) =>
                                    setSelectedFormat(e.target.value)
                                  }
                                  className="w-5 h-5 accent-[#0CA678] border-[#0CA678]"
                                />
                                <span className="text-sm text-gray-900">
                                  {format.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <hr />

                        {/* Action */}
                        <DialogFooter className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setIsBackupModalOpen(false)}
                            className="flex-1 text-[#0CA678] border-[#0CA678] hover:bg-teal-50"
                          >
                            Kembali
                          </Button>
                          <Button
                            onClick={handleBackupNow}
                            className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
                          >
                            Backup Sekarang
                          </Button>
                        </DialogFooter>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Backup Otomatis */}
                <div className="flex flex-col justify-start pl-8">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Backup Otomatis
                  </h3>

                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                      <div className="transform scale-150 origin-left">
                        <Switch
                          id="backup-otomatis"
                          className="data-[state=checked]:bg-[#0CA678]"
                        />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setIsScheduleDialogOpen(true)}
                      className="text-[#0CA678] border-[#0CA678] hover:bg-teal-50 px-3 py-2 text-sm"
                    >
                      Atur Jadwal
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DataTable */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        Backup History
      </h2>
      <Card className="p-6">
        <DataTable columns={columns} data={projects} />
      </Card>

      <Dialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
      >
        <DialogContent
          className="max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Atur Jadwal Backup Otomatis</DialogTitle>
            <DialogDescription>
              Atur kapan backup otomatis dijalankan sesuai kebutuhan sistem.
            </DialogDescription>

            {/* Garis pemisah tambahan */}
            <hr className="mt-3 border-gray-200" />
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Frequency */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Pilih Frekuensi Backup
              </h3>

              <Select
                value={scheduleFrequency}
                onValueChange={setScheduleFrequency}
              >
                <SelectTrigger className="w-full border-gray-300">
                  <SelectValue placeholder="Pilih frekuensi" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="mingguan">Mingguan</SelectItem>
                  <SelectItem value="harian">Harian</SelectItem>
                  <SelectItem value="bulanan">Bulanan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Format → now using JSON / CSV / XLSX */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Pilih Format Backup
              </h3>

              <div className="flex items-center space-x-6">
                {backupFormats.map((format) => (
                  <label
                    key={format.id}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="schedule-format"
                      value={format.id}
                      checked={scheduleFormat === format.id}
                      onChange={(e) => setScheduleFormat(e.target.value)}
                      className="w-5 h-5 border-gray-300 accent-[#0CA678] focus:ring-[#0CA678]"
                    />
                    <span className="text-sm text-gray-900">
                      {format.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date & time */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Tanggal & Jam Backup
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-[#0CA678] p-3 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="flex-1 px-4 py-2 border-0 focus:outline-none text-gray-700"
                  />
                </div>

                {/* Time */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-[#0CA678] p-3 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="flex-1 px-4 py-2 border-0 focus:outline-none text-gray-700"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Footer */}
            <DialogFooter className="flex gap-3 sm:justify-end">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="flex-1 text-[#0CA678] border-[#0CA678] hover:bg-teal-50"
                >
                  Kembali
                </Button>
              </DialogClose>

              <Button
                onClick={handleSaveSchedule}
                className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
              >
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
