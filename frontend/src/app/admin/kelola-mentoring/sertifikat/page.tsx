"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FileText,
  Download,
  Clock,
  CheckCircle,
  Upload,
  Plus,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DataTable as DataTableSertifikatTerbit } from "./sertifikat-terbit/data-table";
import { DataTable as DataTableSertifikatMentee } from "./sertifkat-mentee/data-table";
import {
  columns as columnsSertifikatTerbit,
  PublishedCertificate,
} from "./sertifikat-terbit/columns";
import { columnsMentee, MenteeCertificate } from "./sertifkat-mentee/columns";

export default function AdminMentorPage() {
  const [exportOpen, setExportOpen] = useState(false);

  const handleExportCertificates = async (format: "csv" | "excel") => {
    const loadingToastId = toast.loading(
      `Mengekspor data sertifikat ke ${format.toUpperCase()}...`
    );

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/certificate/certificatesExport`,
        {
          params: { format }, // ⬅️ csv | excel (SESUAI API)
          responseType: "blob",
          withCredentials: true,
        }
      );

      const blob = new Blob([res.data], {
        type: res.headers["content-type"],
      });

      // Ambil filename dari header kalau ada
      const contentDisposition = res.headers["content-disposition"];
      let filename = "certificates-export";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[1]) filename = match[1];
      } else {
        const timestamp = new Date()
          .toLocaleString("sv-SE")
          .replace(" ", "_")
          .replace(/:/g, "-");
        filename = `certificates-${timestamp}.${
          format === "excel" ? "xlsx" : "csv"
        }`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export berhasil", {
        id: loadingToastId,
        description: `Data sertifikat berhasil diekspor (${filename})`,
      });
    } catch (err: any) {
      console.error("Export certificates error:", err);

      toast.error("Gagal export data sertifikat", {
        id: loadingToastId,
        description:
          err?.response?.data?.message ??
          "Terjadi kesalahan saat mengekspor data sertifikat",
      });
    }
  };

  const [showAddDialog, setShowAddDialog] = useState(false);

  const [addFormData, setAddFormData] = useState({
    name: "",
    program: "",
    templatePreview: "",
    templateFile: null as File | null,
  });

  // const publishedCertificates: PublishedCertificate[] = [
  //   {
  //     id: "MNTG01",
  //     template: "/placeholder.svg?height=40&width=60&text=Template",
  //     name: "Sertifikat Kelulusan",
  //     program: "Short Class",
  //     date: "10-05-2025, 20:00",
  //   },
  //   {
  //     id: "MNTG02",
  //     template: "/placeholder.svg?height=40&width=60&text=Template",
  //     name: "Sertifikat Penyelesaian",
  //     program: "Live Class",
  //     date: "10-05-2025, 20:00",
  //   },
  //   {
  //     id: "MNTG03",
  //     template: "/placeholder.svg?height=40&width=60&text=Template",
  //     name: "Sertifikat Peserta Bootcamp",
  //     program: "Bootcamp",
  //     date: "11-05-2025, 18:30",
  //   },
  //   {
  //     id: "MNTG04",
  //     template: "/placeholder.svg?height=40&width=60&text=Template",
  //     name: "Sertifikat Pencapaian Data Science",
  //     program: "Short Class",
  //     date: "12-05-2025, 19:00",
  //   },
  //   {
  //     id: "MNTG05",
  //     template: "/placeholder.svg?height=40&width=60&text=Template",
  //     name: "Sertifikat Web Development",
  //     program: "Live Class",
  //     date: "12-05-2025, 14:20",
  //   },
  //   {
  //     id: "MNTG06",
  //     template: "/placeholder.svg?height=40&width=60&text=Template",
  //     name: "Sertifikat UI/UX Mastery",
  //     program: "Bootcamp",
  //     date: "13-05-2025, 09:45",
  //   },
  //   {
  //     id: "MNTG07",
  //     template: "/placeholder.svg?height=40&width=60&text=Template",
  //     name: "Sertifikat Data Analyst Foundation",
  //     program: "Short Class",
  //     date: "14-05-2025, 20:10",
  //   },
  //   {
  //     id: "MNTG08",
  //     template: "/placeholder.svg?height=40&width=60&text=Template",
  //     name: "Sertifikat Machine Learning",
  //     program: "Live Class",
  //     date: "14-05-2025, 12:00",
  //   },
  //   {
  //     id: "MNTG09",
  //     template: "/placeholder.svg?height=40&width=60&text=Template",
  //     name: "Sertifikat Backend Engineering",
  //     program: "Bootcamp",
  //     date: "15-05-2025, 16:50",
  //   },
  //   {
  //     id: "MNTG10",
  //     template: "/placeholder.svg?height=40&width=60&text=Template",
  //     name: "Sertifikat Digital Marketing",
  //     program: "Short Class",
  //     date: "15-05-2025, 08:25",
  //   },
  //   {
  //     id: "MNTG11",
  //     template: "/placeholder.svg?height=40&width=60&text=Template",
  //     name: "Sertifikat Fullstack Developer",
  //     program: "Bootcamp",
  //     date: "16-05-2025, 21:10",
  //   },
  // ];

  const [menteeCertificates, setMenteeCertificates] = useState<
    MenteeCertificate[]
  >([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const mapProgramLabel = (raw: string): string => {
    switch (raw?.toLowerCase()) {
      case "shortclass":
        return "Short Class";
      case "live class":
      case "liveclass":
        return "Live Class";
      case "bootcamp":
        return "Bootcamp";
      default:
        return raw; // fallback aman
    }
  };

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/certificate/admin/certificates`,
          {
            params: {
              page: 1,
              limit: 10000,
            },
            withCredentials: true,
          }
        );

        const items = res.data.data.items;

        const mapped: MenteeCertificate[] = items.map((cert: any) => ({
          id: cert.id,
          mentee: cert.user?.fullName ?? "-",
          name: `Sertifikat ${cert.mentoringService?.serviceName ?? ""}`,
          program: mapProgramLabel(cert.mentoringService?.serviceType),
          date: formatDate(cert.updatedAt || cert.createdAt),

          // TAMBAHAN BARU
          certificatePath: cert.certificatePath,
          driveUrl: cert.googleDriveUrl || undefined,
        }));

        setMenteeCertificates(mapped);
      } catch (error) {
        console.error("Gagal mengambil sertifikat:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const [stats, setStats] = useState([
    {
      title: "Jumlah Sertifikat Terbit",
      value: "-",
      image: "/assets/admin/tugas.svg",
      color: "text-gray-900",
    },
  ]);

  useEffect(() => {
    const fetchCertificateStats = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/certificate/admin/certificates`,
          {
            params: {
              page: 1,
              limit: 10000,
            },
            withCredentials: true,
          }
        );

        const totalIssued = res.data?.data?.total ?? 0;

        setStats((prev) =>
          prev.map((stat) =>
            stat.title === "Jumlah Sertifikat Terbit"
              ? { ...stat, value: totalIssued.toString() }
              : stat
          )
        );
      } catch (error) {
        console.error("Failed fetch certificate stats", error);
      }
    };

    fetchCertificateStats();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Sertifikat
          </h1>

          {/* Breadcrumb */}
          <p className="text-gray-600 flex items-center">
            Kelola Mentoring
            <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
            <span className="font-semibold text-gray-800">Sertifikat</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Dropdown Export Data */}
          <DropdownMenu onOpenChange={(open) => setExportOpen(open)}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-300"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>

                {/* Chevron toggle */}
                {exportOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleExportCertificates("csv")}>
                Export ke CSV
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleExportCertificates("excel")}
              >
                Export ke Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tombol Tambah Sertifikat
          <Button
            className="bg-[#0CA678] hover:bg-[#08916C] flex items-center gap-1"
            onClick={() => {
              setAddFormData({
                name: "",
                program: "",
                templatePreview: "",
                templateFile: null,
              });

              setShowAddDialog(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Sertifikat</span>
          </Button> */}
        </div>
      </div>

      {/* Stats Cards — versi mirip page jadwal sesi */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="max-w-[340px] w-full flex flex-col justify-between px-0 py-2
      shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200
      cursor-pointer rounded-lg bg-white"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-5 pt-2 pb-1">
              <div className="flex items-center gap-3">
                {stat.image && (
                  <Image
                    src={stat.image}
                    alt={stat.title}
                    width={15}
                    height={15}
                    className="opacity-80"
                  />
                )}
                <p className="text-md font-medium text-gray-600">
                  {stat.title}
                </p>
              </div>

              <ChevronDown className="w-5 h-5 text-gray-500" />
            </div>

            {/* CONTENT */}
            <CardContent className="px-5 pt-0 pb-3">
              <div className="flex items-center gap-3">
                <p
                  className={`text-4xl font-bold leading-tight ${
                    stat.color || "text-gray-900"
                  }`}
                >
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        Daftar Sertifikat Diterbitkan
      </h2> */}

      {/* DataTable sertifikat terbit */}
      {/* <Card className="p-6">
        <DataTableSertifikatTerbit
          columns={columnsSertifikatTerbit}
          data={publishedCertificates}
        />
      </Card> */}

      <h2 className="text-2xl font-semibold text-gray-900 mb-3 mt-7">
        Daftar Sertifikat Mentee
      </h2>

      <Card className="p-6 mt-5">
        <DataTableSertifikatMentee
          columns={columnsMentee}
          data={menteeCertificates}
        />
      </Card>

      {/* Add Certificate Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent
          className="sm:max-w-lg max-h-[85vh] flex flex-col"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Tambah Sertifikat Baru
            </DialogTitle>
          </DialogHeader>

          <div className="border-t my-3"></div>

          {/* FORM WRAPPER SCROLLABLE */}
          <div
            className="space-y-6 overflow-y-auto pr-2"
            style={{ maxHeight: "60vh" }}
          >
            {/* Upload Template */}
            <div>
              <p className="text-sm font-medium text-gray-900 mb-4">
                Template Sertifikat
              </p>

              <div
                className={`
            border-2 border-dashed rounded-lg p-6
            flex flex-col items-center justify-center text-center
            cursor-pointer transition
            ${
              addFormData.templatePreview
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-300 hover:border-emerald-500"
            }
          `}
                onClick={() =>
                  document.getElementById("upload-template")?.click()
                }
              >
                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  id="upload-template"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setAddFormData({
                      ...addFormData,
                      templatePreview: url,
                      templateFile: file,
                    });
                  }}
                />

                {addFormData.templatePreview ? (
                  <Image
                    src={addFormData.templatePreview}
                    alt="Preview"
                    width={240}
                    height={160}
                    className="rounded-md object-contain shadow-sm"
                  />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-[#0CA678]" />
                    </div>
                    <p className="text-gray-700 font-medium">
                      Pilih file atau seret di sini
                    </p>
                    <p className="text-xs text-gray-500 mb-2">png atau jpg</p>

                    <Button className="bg-[#0CA678] hover:bg-[#08916C]">
                      Upload
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Nama Sertifikat */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Nama Sertifikat
              </label>

              <Input
                placeholder="Contoh: Sertifikat Challenge Data Science"
                value={addFormData.name}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, name: e.target.value })
                }
                className={`
            transition
            ${addFormData.name ? "bg-gray-100 border-gray-400" : ""}
          `}
              />
            </div>

            {/* Program */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Program
              </label>

              <Select
                value={addFormData.program}
                onValueChange={(value) =>
                  setAddFormData({ ...addFormData, program: value })
                }
              >
                <SelectTrigger
                  className={`
              transition
              ${addFormData.program ? "bg-gray-100 border-gray-400" : ""}
            `}
                >
                  <SelectValue placeholder="Pilih Program" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                  <SelectItem value="Short Class">Short Class</SelectItem>
                  <SelectItem value="Live Class">Live Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t my-4"></div>

          <DialogFooter className="flex space-x-4 sm:justify-center">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setShowAddDialog(false)}
            >
              Kembali
            </Button>

            <Button
              className="flex-1 bg-[#0CA678] hover:bg-[#08916C]"
              onClick={() => {
                const newCertificate = {
                  id: crypto.randomUUID().slice(0, 8).toUpperCase(),
                  name: addFormData.name,
                  program: addFormData.program,
                  template: addFormData.templatePreview,
                  date: new Date().toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                };

                console.log("Tambah Sertifikat:", newCertificate);

                setShowAddDialog(false);
              }}
            >
              Tambah Sertifikat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
