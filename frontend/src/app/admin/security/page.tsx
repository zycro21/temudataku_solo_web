"use client";

import { useState } from "react";
import { Clock, ChevronDown, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { DataTable } from "./data-table";
import { columns, Project } from "./columns";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminMentorPage() {
  const [projects] = useState<Project[]>([
    {
      id: "MNTG01",
      date: "10-05-2025, 20:00",
      jenisData: "PDF",
      ukuranFile: "2 MB",
      formatFile: "pdf",
      status: "gagal",
    },
    {
      id: "MNTG02",
      date: "10-05-2025, 20:00",
      jenisData: "PDF",
      ukuranFile: "2 MB",
      formatFile: "pdf",
      status: "berhasil",
    },
    {
      id: "MNTG03",
      date: "10-05-2025, 20:00",
      jenisData: "PDF",
      ukuranFile: "3 MB",
      formatFile: "pdf",
      status: "gagal",
    },
    {
      id: "MNTG04",
      date: "10-05-2025, 20:00",
      jenisData: "DOCX",
      ukuranFile: "1.5 MB",
      formatFile: "docx",
      status: "berhasil",
    },
    {
      id: "MNTG05",
      date: "10-05-2025, 20:00",
      jenisData: "DOCX",
      ukuranFile: "2 MB",
      formatFile: "docx",
      status: "berhasil",
    },
    {
      id: "MNTG06",
      date: "10-05-2025, 20:00",
      jenisData: "PDF",
      ukuranFile: "2.5 MB",
      formatFile: "pdf",
      status: "berhasil",
    },
    {
      id: "MNTG07",
      date: "10-05-2025, 20:00",
      jenisData: "PDF",
      ukuranFile: "2 MB",
      formatFile: "pdf",
      status: "gagal",
    },
    {
      id: "MNTG08",
      date: "10-05-2025, 20:00",
      jenisData: "ZIP",
      ukuranFile: "5 MB",
      formatFile: "zip",
      status: "berhasil",
    },
    {
      id: "MNTG09",
      date: "10-05-2025, 20:00",
      jenisData: "PDF",
      ukuranFile: "3 MB",
      formatFile: "pdf",
      status: "berhasil",
    },
    {
      id: "MNTG10",
      date: "10-05-2025, 20:00",
      jenisData: "DOCX",
      ukuranFile: "1 MB",
      formatFile: "docx",
      status: "gagal",
    },
  ]);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const dataTypes = [
    { id: "pengguna", label: "Pengguna" },
    { id: "transaksi", label: "Transaksi" },
    { id: "produk", label: "Produk" },
    { id: "event", label: "Event" },
  ];

  const backupFormats = [
    { id: "zip", label: "ZIP" },
    { id: "tar", label: "TAR" },
  ];

  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>("zip");

  const handleToggleDataType = (id: string) => {
    setSelectedDataTypes((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleBackupNow = () => {
    console.log("Backup jenis:", selectedDataTypes);
    console.log("Format:", selectedFormat);
    setIsBackupModalOpen(false);
  };

  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  const [scheduleFrequency, setScheduleFrequency] = useState("harian");
  const [scheduleFormat, setScheduleFormat] = useState("full");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const backupFormatsAutomatic = [
    { id: "full", label: "Full Backup" },
    { id: "partial", label: "Partial Backup" },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">History & Event</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
            <span>History & Event</span>
            <ChevronDown className="w-4 h-4 -rotate-90" />
            <span>Security</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="">
        {/* Backup Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">Backup data memastikan Anda tidak kehilangan informasi penting. Lakukan secara berkala atau aktifkan backup otomatis.</p>

            {/* Backup Manual */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Backup Manual</h3>
              <Dialog open={isBackupModalOpen} onOpenChange={setIsBackupModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#0CA678] hover:bg-[#08916C] text-white">Buat Backup Sekarang</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">Buat Backup Manual</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Data Types */}
                    <div>
                      <h3 className="text-base font-semibold mb-2">Pilih jenis data yang ingin di-backup</h3>
                      <p className="text-sm text-gray-600 mb-4">Bisa pilih lebih dari satu jenis.</p>

                      <div className="grid grid-cols-2 gap-3">
                        {dataTypes.map((dataType) => (
                          <label key={dataType.id} className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" checked={selectedDataTypes.includes(dataType.id)} onChange={() => handleToggleDataType(dataType.id)} className="w-5 h-5 rounded border-gray-300 text-[#0CA678] focus:ring-[#0CA678]" />
                            <span className="text-sm">{dataType.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <hr />

                    {/* Format */}
                    <div>
                      <h3 className="text-base font-semibold mb-4">Pilih Format Backup</h3>

                      <div className="flex items-center space-x-6">
                        {backupFormats.map((format) => (
                          <label key={format.id} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="backup-format"
                              value={format.id}
                              checked={selectedFormat === format.id}
                              onChange={(e) => setSelectedFormat(e.target.value)}
                              className="w-5 h-5 border-gray-300 text-[#0CA678] focus:ring-[#0CA678]"
                            />
                            <span className="text-sm">{format.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <hr />

                    {/* Action */}
                    <DialogFooter className="flex gap-3">
                      <Button variant="outline" onClick={() => setIsBackupModalOpen(false)} className="flex-1 text-[#0CA678] border-[#0CA678] hover:bg-teal-50">
                        Kembali
                      </Button>
                      <Button onClick={handleBackupNow} className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white">
                        Backup Sekarang
                      </Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Backup Otomatis */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Backup Otomatis</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Switch id="backup-otomatis" className="data-[state=checked]:bg-[#0CA678]" />
                </div>
                <Button variant={"link"} onClick={() => setIsScheduleDialogOpen(true)} className=" text-[#0CA678]">
                  Atur Jadwal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DataTable */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Backup History</h2>
        <DataTable columns={columns} data={projects} />
      </Card>

      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Atur Jadwal Backup Otomatis</DialogTitle>
            <DialogDescription>Atur kapan backup otomatis dijalankan sesuai kebutuhan sistem.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Frequency */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Pilih Frekuensi Backup</h3>

              <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
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

            {/* Format */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Pilih Format Backup</h3>

              <div className="flex items-center space-x-6">
                {backupFormatsAutomatic.map((format) => (
                  <label key={format.id} className="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" name="schedule-format" value={format.id} checked={scheduleFormat === format.id} onChange={(e) => setScheduleFormat(e.target.value)} className="w-5 h-5 border-gray-300 text-[#0CA678]" />
                    <span className="text-sm text-gray-900">{format.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Date & time */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Tanggal & Jam Backup</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-[#0CA678] p-3 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <input type="text" placeholder="DD-MM-YYYY" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="flex-1 px-4 py-2 border-0 focus:outline-none focus:ring-0 text-gray-700" />
                </div>

                {/* Time */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-[#0CA678] p-3 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <input type="text" placeholder="HH:MM" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="flex-1 px-4 py-2 border-0 focus:outline-none focus:ring-0 text-gray-700" />
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Footer */}
            <DialogFooter className="flex gap-3 sm:justify-end">
              <DialogClose asChild>
                <Button variant="outline" className="flex-1 text-[#0CA678] border-[#0CA678] hover:bg-teal-50">
                  Kembali
                </Button>
              </DialogClose>

              <Button onClick={handleSaveSchedule} className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white">
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
