"use client";

import { useState } from "react";
import { FileText, Download, CheckCircle, Plus, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { DataTable } from "./data-table";
import { columns, Project } from "./columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminMentorPage() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "P001",
      foto: "/images/excel.png",
      nama: "Excel Untuk Pemula",
      bootcamp: "Short Class",
      harga: "Rp 150.000",
      deskripsi: "Kelas belajar excel dasar",
      status: "Aktif",
      diskonTipe: "persentase",
      hargaDiskon: "Rp 150.000",
    },
    {
      id: "P002",
      foto: "/images/datascience.png",
      nama: "Introduction to Data Science",
      bootcamp: "Bootcamp",
      harga: "Rp 850.000",
      deskripsi: "Pengenalan awal data science",
      status: "Aktif",
      diskonTipe: "persentase",
      hargaDiskon: "Rp 850.000",
    },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addStep, setAddStep] = useState(1);

  const [addFormData, setAddFormData] = useState({
    nama: "",
    kategori: "Mentoring",
    foto: null as File | null,
    deskripsi: "",
    harga: "",
    status: "Aktif",
    diskonTipe: "persentase",
    diskon: "0",
    hargaDiskon: "",
  });

  const handleCloseAddDialog = () => {
    setShowAddDialog(false);
    setAddStep(1);
  };

  const handleNextStep = () => setAddStep(2);
  const handlePrevStep = () => setAddStep(1);

  const handleSave = () => {
    const newItem: Project = {
      id: "P" + String(projects.length + 1).padStart(3, "0"),
      foto: "/images/default.png",
      nama: addFormData.nama,
      bootcamp: addFormData.kategori,
      harga: "Rp " + addFormData.harga,
      deskripsi: addFormData.deskripsi,
      status: addFormData.status,
      diskonTipe: addFormData.diskonTipe,
      hargaDiskon: "Rp " + addFormData.hargaDiskon,
    };

    setProjects([...projects, newItem]);
    handleCloseAddDialog();
  };

  const stats = [
    { title: "Total Produk & Event", value: "10", icon: FileText, color: "text-gray-900" },
    { title: "Mentoring", value: "2", icon: CheckCircle, color: "text-green-600" },
    { title: "Pratice", value: "10", icon: CheckCircle, color: "text-green-600" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk & Event</h1>
          <p className="text-gray-600">Produk & Event</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </Button>
          <Button
            className="bg-[#0CA678] hover:bg-[#08916C] flex items-center space-x-2"
            onClick={() => {
              setAddFormData({
                nama: "",
                kategori: "Mentoring",
                foto: null,
                deskripsi: "",
                harga: "",
                status: "Aktif",
                diskonTipe: "persentase",
                diskon: "0",
                hargaDiskon: "",
              });
              setShowAddDialog(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk & Event</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DataTable */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Daftar Produk & Event</h2>
        <DataTable columns={columns} data={projects} />
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Tambah Produk / Event Baru</DialogTitle>
            </div>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center space-x-4 my-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${addStep >= 1 ? "bg-[#0CA678] text-white" : "bg-gray-300 text-gray-600"}`}>1</div>
              <span className={`text-sm font-medium ${addStep === 1 ? "text-[#0CA678]" : "text-gray-400"}`}>Informasi Dasar</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200" />
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${addStep >= 2 ? "bg-[#0CA678] text-white" : "bg-gray-300 text-gray-600"}`}>2</div>
              <span className={`text-sm font-medium ${addStep === 2 ? "text-[#0CA678]" : "text-gray-400"}`}>Deskripsi & Harga</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {addStep === 1 ? (
              <>
                {/* Foto */}
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">Foto Produk Atau Event</label>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {addFormData.foto ? (
                      <img src={URL.createObjectURL(addFormData.foto)} alt="Preview" className="mx-auto mb-3 w-24 h-24 object-cover rounded" />
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-[#0CA678] mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Pilih file atau seret di sini</p>
                        <p className="text-xs text-gray-500 mb-3">png atau jpg</p>
                      </>
                    )}

                    <input
                      id="fileUpload"
                      type="file"
                      accept="image/png, image/jpeg"
                      className="hidden"
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          foto: e.target.files ? e.target.files[0] : null,
                        })
                      }
                    />

                    <Button className="bg-[#0CA678] hover:bg-[#08916C] text-white" onClick={() => document.getElementById("fileUpload")?.click()}>
                      Upload
                    </Button>
                  </div>
                </div>

                {/* Nama */}
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">Nama Produk</label>
                  <Input placeholder="Contoh: Bootcamp UI/UX" value={addFormData.nama} onChange={(e) => setAddFormData({ ...addFormData, nama: e.target.value })} />
                </div>

                {/* Kategori */}
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">Kategori</label>
                  <Select value={addFormData.kategori} onValueChange={(value) => setAddFormData({ ...addFormData, kategori: value })}>
                    <SelectTrigger className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mentoring">Mentoring</SelectItem>
                      <SelectItem value="Practice">Practice</SelectItem>
                      <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                {/* Deskripsi */}
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">Deskripsi</label>
                  <textarea
                    placeholder="Masukkan deskripsi produk"
                    value={addFormData.deskripsi}
                    onChange={(e) => setAddFormData({ ...addFormData, deskripsi: e.target.value })}
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                {/* Harga */}
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">Harga</label>
                  <Input placeholder="Contoh: 250000" value={addFormData.harga} onChange={(e) => setAddFormData({ ...addFormData, harga: e.target.value })} />
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">Status</label>
                  <Select value={addFormData.status} onValueChange={(value) => setAddFormData({ ...addFormData, status: value })}>
                    <SelectTrigger className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Non Aktif">Non Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Diskon */}
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">Diskon</label>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="diskonTipe" checked={addFormData.diskonTipe === "persentase"} onChange={() => setAddFormData({ ...addFormData, diskonTipe: "persentase" })} />
                      <span className="text-sm text-gray-700">Persentase (%)</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="diskonTipe" checked={addFormData.diskonTipe === "angka"} onChange={() => setAddFormData({ ...addFormData, diskonTipe: "angka" })} />
                      <span className="text-sm text-gray-700">Nominal (Rp)</span>
                    </label>
                  </div>

                  <Input
                    className="mt-2"
                    placeholder={addFormData.diskonTipe === "persentase" ? "Contoh: 20" : "Contoh: 50000"}
                    value={addFormData.diskon}
                    onChange={(e) => {
                      const value = e.target.value;
                      const harga = Number(addFormData.harga);

                      if (addFormData.diskonTipe === "persentase") {
                        const diskon = (harga * Number(value)) / 100;
                        setAddFormData({
                          ...addFormData,
                          diskon: value,
                          hargaDiskon: String(harga - diskon),
                        });
                      } else {
                        setAddFormData({
                          ...addFormData,
                          diskon: value,
                          hargaDiskon: String(harga - Number(value)),
                        });
                      }
                    }}
                  />
                </div>

                {/* Harga Setelah Diskon */}
                {addFormData.hargaDiskon && <div className="bg-green-50 p-2 rounded-lg text-sm font-medium text-green-700">Harga Setelah Diskon: Rp {addFormData.hargaDiskon}</div>}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t">
            {addStep === 1 ? (
              <>
                <Button variant="outline" className="flex-1 border-[#0CA678] text-[#0CA678] bg-transparent" onClick={handleCloseAddDialog}>
                  Kembali
                </Button>
                <Button className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white" onClick={handleNextStep}>
                  Selanjutnya
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="flex-1 border-[#0CA678] text-[#0CA678] bg-transparent" onClick={handlePrevStep}>
                  Sebelumnya
                </Button>
                <Button className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white" onClick={handleSave}>
                  Simpan
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
