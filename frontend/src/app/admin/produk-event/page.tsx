"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FileText,
  Download,
  CheckCircle,
  Plus,
  Upload,
  ChevronUp,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "./data-table";
import { columns, Project } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MentorOption } from "@/types/mentor";

type EditFieldProps = {
  label: string;
  children: React.ReactNode;
};

const EditField = ({ label, children }: EditFieldProps) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-600 block">{label}</label>
    {children}
  </div>
);

export default function AdminMentorPage() {
  const [exportOpen, setExportOpen] = useState(false);

  const handleExportProductEvent = async (format: "csv" | "excel") => {
    const loadingToastId = toast.loading(
      `Mengekspor produk & event ke ${format.toUpperCase()}...`
    );

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/exportProductEvent`,
        {
          params: { format },
          responseType: "blob",
          withCredentials: true,
        }
      );

      const blob = new Blob([res.data], {
        type: res.headers["content-type"],
      });

      // Ambil filename dari Content-Disposition
      const contentDisposition = res.headers["content-disposition"];
      let filename = "product-event";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[1]) filename = match[1];
      } else {
        const timestamp = new Date()
          .toLocaleString("sv-SE")
          .replace(" ", "_")
          .replace(/:/g, "-");

        filename = `product-event-${timestamp}.${
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
        description: `Produk & event berhasil diekspor (${filename})`,
      });
    } catch (err: any) {
      console.error("Export product event error:", err);

      toast.error("Gagal export produk & event", {
        id: loadingToastId,
        description:
          err?.response?.data?.message ??
          "Terjadi kesalahan saat mengekspor data",
      });
    }
  };

  const [mentorOptions, setMentorOptions] = useState<MentorOption[]>([]);
  const [mentorLoading, setMentorLoading] = useState(false);

  // 🟢 mentoring (multi)
  const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);
  // 🔵 e-learning (single)
  const [selectedMentorId, setSelectedMentorId] = useState<string>("");

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setMentorLoading(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentor/admin/mentor-profiles`,
          {
            withCredentials: true,
            params: {
              page: 1,
              limit: 10000,
              isVerified: true,
            },
          }
        );

        const options: MentorOption[] = res.data.data.map((item: any) => ({
          id: item.id,
          name: item.user?.fullName ?? "Tanpa Nama",
        }));

        setMentorOptions(options);
      } catch (err) {
        console.error("Gagal fetch mentor:", err);
      } finally {
        setMentorLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return "-";
    return new Date(date).toISOString().split("T")[0];
  };

  const mapServiceTypeToProgram = (type?: string): Project["tipeMentoring"] => {
    if (!type) return undefined;

    const normalized = type
      .toLowerCase()
      .replace(/[_\s]+/g, "-")
      .replace(/--+/g, "-")
      .trim();

    switch (normalized) {
      case "bootcamp":
        return "Bootcamp";

      case "shortclass":
        return "Short Class";

      case "live-class":
      case "liveclass":
      case "live class":
        return "Live Class";

      case "one-on-one":
      case "one-on-1":
      case "oneonone":
        return "1 on 1 Mentoring";

      case "group":
      case "group-mentoring":
        return "Group Mentoring";

      default:
        return undefined;
    }
  };

  const mapMentoringToProject = (item: any): Project => {
    const mentors = item.mentors ?? [];

    return {
      id: item.id,
      foto: "/images/Navbar_logo.png",
      nama: item.serviceName,
      kategori: "Mentoring",
      tipeMentoring: mapServiceTypeToProgram(item.serviceType),

      mentorIds: mentors.map((m: any) => m.mentorProfileId),
      mentorNames: mentors.map((m: any) => m.fullName),

      // 🟢 duration & participants
      maxParticipants: item.maxParticipants ?? undefined,
      durationDays: item.durationDays ?? undefined,

      harga: Number(item.price),
      hargaDisplay: formatRupiah(Number(item.price)),
      hargaDiskon: formatRupiah(Number(item.price)),
      deskripsi: item.description ?? "-",
      status: item.isActive ? "Aktif" : "Nonaktif",

      diskonTipe: "-",
      diskon: 0,

      // 🔹 mentoring fields
      benefits: item.benefits ?? "-",
      mechanism: item.mechanism ?? "-",
      syllabusPath: item.syllabusPath ?? "-",
      toolsUsed: item.toolsUsed ?? "-",
      targetAudience: item.targetAudience ?? "-",
      schedule: item.schedule ?? "-",
      alumniPortfolio: item.alumniPortfolio ?? "-",

      tanggalDitambahkan: formatDate(item.createdAt),
    };
  };

  const mapELearningToProject = (item: any): Project => {
    const rawPath = item.thumbnailImages?.[0];
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    const normalizedPath = rawPath
      ? rawPath.replace(/^\/?images\/?/, "") // 🔥 buang images di depan
      : null;

    return {
      id: item.id,
      foto: normalizedPath
        ? `${baseUrl}/images/${normalizedPath}`
        : "/images/Navbar_logo.png",

      nama: item.title,
      kategori: "E-Learning",

      mentorId: item.mentorId,
      mentorName: item.mentorProfile?.user?.fullName ?? "-",

      // 🔵 duration & participants
      // E-learning tidak punya maxParticipants → undefined
      maxParticipants: undefined,
      durationDays: undefined,

      harga: Number(item.price),
      hargaDisplay: formatRupiah(Number(item.price)),
      hargaDiskon: formatRupiah(Number(item.price)),
      deskripsi: item.description ?? "-",
      status: item.isActive ? "Aktif" : "Nonaktif",

      diskonTipe: "-",
      diskon: 0,

      category: item.category ?? "-",
      tags: item.tags ?? [],
      targetAudience: item.targetAudience ?? "-",
      level: item.level ?? "-",
      estimatedDuration: item.estimatedDuration ?? "-",
      benefits: item.benefits ?? "-",
      toolsUsed: item.toolsUsed ?? "-",

      tanggalDitambahkan: formatDate(item.createdAt),
    };
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        const [mentoringRes, elearningRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/admin/mentoring-services`,
            {
              withCredentials: true,
              params: {
                page: 1,
                limit: 10000,
              },
            }
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses`,
            {
              withCredentials: true,
              params: {
                page: 1,
                limit: 10000,
              },
            }
          ),
        ]);

        const mentoringProjects = mentoringRes.data.data.map(
          mapMentoringToProject
        );

        const elearningProjects = elearningRes.data.data.map(
          mapELearningToProject
        );

        console.log(elearningProjects.map((p: any) => p.foto));

        setProjects([...mentoringProjects, ...elearningProjects]);
      } catch (error) {
        console.error("Gagal fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addStep, setAddStep] = useState(1);

  const mapServiceType = (type?: TipeMentoring): string | undefined => {
    if (!type) return undefined;

    switch (type) {
      case "Bootcamp":
        return "bootcamp";

      case "Short Class":
        return "shortclass";

      case "Live Class":
        return "liveclass";

      case "1 on 1 Mentoring":
        return "one-on-one";

      case "Group Mentoring":
        return "groupF";

      default:
        return undefined;
    }
  };

  type Kategori = "Mentoring" | "E-Learning";
  type TipeMentoring =
    | "Bootcamp"
    | "Short Class"
    | "Live Class"
    | "1 on 1 Mentoring"
    | "Group Mentoring"
    | undefined;

  type AddFormData = {
    nama: string;
    kategori: Kategori;
    tipeMentoring?: TipeMentoring;
    foto: File | null;

    deskripsi: string;
    harga: string;
    status: string;

    // 🆕 mentor
    mentorIds?: string[]; // mentoring
    mentorId?: string; // e-learning

    diskonTipe: "persentase" | "angka";
    diskon: number;
    hargaDiskon: string;

    maxParticipants?: string; // 🆕 string (biar aman input)
    durationDays?: string; // 🆕

    // 🟢 MENTORING
    benefits?: string;
    mechanism?: string;
    toolsUsed?: string;
    targetAudience?: string;
    schedule?: string;
    alumniPortfolio?: string;
    syllabusPath?: string;

    // 🔵 E-LEARNING
    category?: string;
    level?: string;
    estimatedDuration?: string;
    tags?: string[];
  };

  const initialAddFormData: AddFormData = {
    nama: "",
    kategori: "Mentoring",
    tipeMentoring: undefined,
    foto: null,

    deskripsi: "",
    harga: "",
    status: "Aktif",

    mentorIds: [],
    mentorId: "",

    diskonTipe: "persentase",
    diskon: 0,
    hargaDiskon: "",

    maxParticipants: "",
    durationDays: "",

    // mentoring
    benefits: "",
    mechanism: "",
    toolsUsed: "",
    targetAudience: "",
    schedule: "",
    alumniPortfolio: "",
    syllabusPath: "",

    // e-learning
    category: "",
    level: "",
    estimatedDuration: "",
    tags: [],
  };

  const [addFormData, setAddFormData] =
    useState<AddFormData>(initialAddFormData);

  const resetAddModal = () => {
    setAddFormData(initialAddFormData);
    setSelectedMentorIds([]); // mentoring
    setSelectedMentorId(""); // e-learning
    setAddStep(1);
  };

  const handleCloseAddDialog = () => {
    setShowAddDialog(false);
    resetAddModal();
  };

  const handleNextStep = () => setAddStep(2);
  const handlePrevStep = () => setAddStep(1);

  const handleSave = async () => {
    // =====================
    // ✅ VALIDASI WAJIB
    // =====================
    if (!addFormData.nama || !addFormData.harga) {
      toast.error("Nama dan harga wajib diisi");
      return;
    }

    if (addFormData.kategori === "Mentoring" && !addFormData.tipeMentoring) {
      toast.error("Tipe mentoring wajib dipilih");
      return;
    }

    if (addFormData.kategori === "Mentoring") {
      if (!addFormData.maxParticipants || !addFormData.durationDays) {
        toast.error("Max participants dan duration wajib diisi");
        return;
      }
    }

    try {
      if (addFormData.kategori === "Mentoring") {
        // =====================
        // 🟢 MENTORING (JSON)
        // =====================
        const payload = {
          serviceName: addFormData.nama,
          description: addFormData.deskripsi || undefined,
          price: Number(addFormData.harga),
          serviceType: mapServiceType(addFormData.tipeMentoring),

          maxParticipants: Number(addFormData.maxParticipants),
          durationDays: Number(addFormData.durationDays),

          mentorProfileIds: selectedMentorIds, // ⚠️ WAJIB ARRAY
          benefits: addFormData.benefits || undefined,
          mechanism: addFormData.mechanism || undefined,
          syllabusPath: addFormData.syllabusPath || undefined,
          toolsUsed: addFormData.toolsUsed || undefined,
          targetAudience: addFormData.targetAudience || undefined,
          schedule: addFormData.schedule || undefined,
          alumniPortfolio: addFormData.alumniPortfolio || undefined,
        };

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/mentoring-services`,
          payload,
          {
            withCredentials: true,
          }
        );

        toast.success("Produk mentoring berhasil ditambahkan");
      } else {
        // =====================
        // 🔵 E-LEARNING (FORMDATA)
        // =====================
        const formData = new FormData();

        formData.append("mentorId", selectedMentorId);
        formData.append("title", addFormData.nama);
        formData.append("description", addFormData.deskripsi);
        formData.append("price", addFormData.harga);
        if (addFormData.category)
          formData.append("category", addFormData.category);

        if (addFormData.targetAudience)
          formData.append("targetAudience", addFormData.targetAudience);

        if (addFormData.level) formData.append("level", addFormData.level);

        if (addFormData.estimatedDuration)
          formData.append("estimatedDuration", addFormData.estimatedDuration);

        if (addFormData.benefits)
          formData.append("benefits", addFormData.benefits);

        if (addFormData.toolsUsed)
          formData.append("toolsUsed", addFormData.toolsUsed);

        formData.append(
          "isActive",
          addFormData.status === "Aktif" ? "true" : "false"
        );

        (addFormData.tags ?? []).forEach((tag) =>
          formData.append("tags[]", tag)
        );

        if (addFormData.foto) {
          formData.append("thumbnailImages", addFormData.foto);
        }

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses`,
          formData,
          {
            withCredentials: true,
          }
        );

        toast.success("E-learning berhasil ditambahkan");
      }

      // =====================
      // ✅ SUCCESS
      // =====================
      handleCloseAddDialog();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Gagal menyimpan data");
    }
  };

  const [stats, setStats] = useState<
    {
      title: string;
      value: string;
      image: string;
      color: string;
    }[]
  >([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // =====================
        // FETCH MENTORING
        // =====================
        const mentoringRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/admin/mentoring-services`,
          {
            params: {
              page: "1",
              limit: "10000",
            },
            withCredentials: true,
          }
        );

        const mentoringData = mentoringRes.data.data || [];

        // === TIPE KHUSUS ===
        const ONE_ON_ONE_TYPES = ["one-on-one", "1-on-1", "one on one"];
        const GROUP_TYPES = ["group", "group mentoring"];

        // flag untuk cek keberadaan
        let hasOneOnOne = false;
        let hasGroup = false;

        // counter untuk tipe lain
        let otherTypesCount = 0;

        mentoringData.forEach((item: any) => {
          const type = item.serviceType?.toLowerCase();

          if (!type) return;

          if (ONE_ON_ONE_TYPES.includes(type)) {
            hasOneOnOne = true;
          } else if (GROUP_TYPES.includes(type)) {
            hasGroup = true;
          } else {
            // tipe lain dihitung semua
            otherTypesCount += 1;
          }
        });

        // one-on-one + group masing-masing max 1
        const totalMentoring =
          (hasOneOnOne ? 1 : 0) + (hasGroup ? 1 : 0) + otherTypesCount;

        // =====================
        // FETCH E-LEARNING
        // =====================
        const elearningRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses`,
          {
            params: {
              page: 1,
              limit: 10000, // cukup ambil total
            },
            withCredentials: true,
          }
        );

        const totalELearning = elearningRes.data.total || 0;

        // =====================
        // TOTAL PRODUK & EVENT
        // =====================
        const totalProdukEvent = totalMentoring + totalELearning;

        // =====================
        // SET STATS
        // =====================
        setStats([
          {
            title: "Total Produk & Event",
            value: totalProdukEvent.toString(),
            image: "/assets/admin/pro.svg",
            color: "text-gray-900",
          },
          {
            title: "Mentoring",
            value: totalMentoring.toString(),
            image: "/assets/admin/produkmentoring.svg",
            color: "text-green-600",
          },
          {
            title: "E-Learning",
            value: totalELearning.toString(),
            image: "/assets/admin/tugas.svg",
            color: "text-green-600",
          },
        ]);
      } catch (err) {
        console.error("Gagal fetch stats produk & event:", err);
      }
    };

    fetchStats();
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            Produk & Event
          </h1>
          <p className="text-gray-600">Produk & Event</p>
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

                {exportOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleExportProductEvent("csv")}>
                Export ke CSV
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleExportProductEvent("excel")}
              >
                Export ke Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tombol Tambah Produk & Event */}
          <Button
            className="bg-[#0CA678] hover:bg-[#08916C] flex items-center gap-1"
            onClick={() => {
              setAddFormData({
                nama: "",
                kategori: "Mentoring",
                tipeMentoring: "Bootcamp",
                foto: null,

                deskripsi: "",
                harga: "",
                status: "Aktif",

                diskonTipe: "persentase",
                diskon: 0,
                hargaDiskon: "",

                // 🟢 mentoring
                benefits: "",
                mechanism: "",
                toolsUsed: "",
                targetAudience: "",
                schedule: "",
                alumniPortfolio: "",
                syllabusPath: "",

                // 🔵 e-learning
                category: "",
                level: "",
                estimatedDuration: "",
                tags: [],
              });

              setAddStep(1);
              setShowAddDialog(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk & Event</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="w-full flex flex-col justify-between px-0 py-2
      shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200
      cursor-pointer rounded-lg bg-white"
          >
            {/* Header */}
            <CardHeader className="flex items-center justify-between px-5 pt-2 pb-1">
              <div className="flex items-center gap-2">
                <Image
                  src={stat.image}
                  alt={stat.title}
                  width={20}
                  height={20}
                  className="opacity-90"
                />
                <CardTitle className="text-md font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-500" />
            </CardHeader>

            {/* Content */}
            <CardContent className="px-5 pt-0 pb-3">
              <div className="flex items-center gap-3">
                <p className={`text-4xl font-bold leading-tight ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        Daftar Produk & Event
      </h2>

      {/* DataTable */}
      <Card className="p-6">
        <DataTable
          columns={columns}
          data={projects}
          mentorOptions={mentorOptions}
        />
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent
          className="max-w-3xl max-h-[85vh] flex flex-col"
          onInteractOutside={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Tambah Produk / Event Baru</DialogTitle>
            </div>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="my-6 mb-2">
            <div className="flex items-center space-x-6">
              {/* Step 1 */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    addStep >= 1
                      ? "bg-[#0CA678] text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  1
                </div>
                <span
                  className={`text-sm font-bold ${
                    addStep === 1 ? "text-[#0CA678]" : "text-gray-400"
                  }`}
                >
                  Informasi Dasar
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    addStep >= 2
                      ? "bg-[#0CA678] text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-sm font-bold ${
                    addStep === 2 ? "text-[#0CA678]" : "text-gray-400"
                  }`}
                >
                  Deskripsi & Harga
                </span>
              </div>
            </div>

            {/* Garis pemisah bawah */}
            <div className="border-b pb-4 mt-4" />
          </div>

          {/* Form Content (scrollable) */}
          <div
            ref={scrollRef}
            className="space-y-6 max-h-[420px] overflow-y-auto pr-2 py-3"
          >
            {addStep === 1 ? (
              <>
                {/* Foto */}
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Foto Produk Atau Event
                  </label>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {addFormData.foto ? (
                      <img
                        src={URL.createObjectURL(addFormData.foto)}
                        alt="Preview"
                        className="mx-auto mb-3 w-24 h-24 object-cover rounded"
                      />
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-[#0CA678] mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">
                          Pilih file atau seret di sini
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          png atau jpg
                        </p>
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

                    <Button
                      className="bg-[#0CA678] hover:bg-[#08916C] text-white"
                      onClick={() =>
                        document.getElementById("fileUpload")?.click()
                      }
                    >
                      Upload
                    </Button>
                  </div>
                </div>

                {/* Nama */}
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Nama Produk
                  </label>
                  <Input
                    placeholder="Contoh: Bootcamp UI/UX"
                    value={addFormData.nama}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, nama: e.target.value })
                    }
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Kategori
                  </label>
                  <Select
                    value={addFormData.kategori}
                    onValueChange={(value) => {
                      // update kategori & tipe mentoring
                      setAddFormData((prev) => ({
                        ...prev,
                        kategori: value as Kategori,
                        tipeMentoring:
                          value === "Mentoring"
                            ? prev.tipeMentoring
                            : undefined,
                      }));

                      // reset mentor biar tidak nyangkut
                      setSelectedMentorIds([]);
                      setSelectedMentorId("");
                    }}
                  >
                    <SelectTrigger className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mentoring">Mentoring</SelectItem>
                      <SelectItem value="E-Learning">E-Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipe Mentoring */}
                {addFormData.kategori === "Mentoring" && (
                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-2">
                      Tipe Mentoring
                    </label>

                    <Select
                      value={addFormData.tipeMentoring}
                      onValueChange={(value) =>
                        setAddFormData({
                          ...addFormData,
                          tipeMentoring: value as TipeMentoring,
                        })
                      }
                    >
                      <SelectTrigger className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                        <SelectValue placeholder="Pilih tipe mentoring" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                        <SelectItem value="Short Class">Short Class</SelectItem>
                        <SelectItem value="Live Class">Live Class</SelectItem>
                        <SelectItem value="1 on 1 Mentoring">
                          1 on 1 Mentoring
                        </SelectItem>
                        <SelectItem value="Group Mentoring">
                          Group Mentoring
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {addFormData.kategori === "Mentoring" && (
                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-2">
                      Pilih Mentor (bisa lebih dari 1)
                    </label>

                    <div
                      className={`
    border rounded-lg p-3 space-y-2
    ${mentorOptions.length > 6 ? "max-h-[192px] overflow-y-auto" : ""}
  `}
                    >
                      {mentorOptions.map((mentor) => {
                        const checked = selectedMentorIds.includes(mentor.id);

                        return (
                          <label
                            key={mentor.id}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setSelectedMentorIds((prev) =>
                                  checked
                                    ? prev.filter((id) => id !== mentor.id)
                                    : [...prev, mentor.id]
                                );
                              }}
                            />
                            {mentor.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {addFormData.kategori === "E-Learning" && (
                  <div>
                    <label className="text-sm font-bold text-gray-900 block mb-2">
                      Pilih Mentor
                    </label>

                    <Select
                      value={selectedMentorId}
                      onValueChange={(value) => setSelectedMentorId(value)}
                    >
                      <SelectTrigger className="w-full border rounded-lg">
                        <SelectValue placeholder="Pilih mentor" />
                      </SelectTrigger>

                      <SelectContent>
                        {mentorOptions.map((mentor) => (
                          <SelectItem key={mentor.id} value={mentor.id}>
                            {mentor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Deskripsi */}
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    placeholder="Masukkan deskripsi produk"
                    value={addFormData.deskripsi}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        deskripsi: e.target.value,
                      })
                    }
                    rows={4}
                    className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                  />
                </div>

                {addFormData.kategori === "Mentoring" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Max Participants */}
                    <div>
                      <label className="text-sm font-bold text-gray-900 block mb-2">
                        Max Participants
                      </label>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Contoh: 20"
                        value={addFormData.maxParticipants}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            maxParticipants: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* Duration Days */}
                    <div>
                      <label className="text-sm font-bold text-gray-900 block mb-2">
                        Duration (Days)
                      </label>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Contoh: 14"
                        value={addFormData.durationDays}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            durationDays: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Harga */}
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Harga
                  </label>
                  <Input
                    placeholder="Contoh: 250000"
                    value={addFormData.harga}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, harga: e.target.value })
                    }
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Status
                  </label>
                  <Select
                    value={addFormData.status}
                    onValueChange={(value) =>
                      setAddFormData({ ...addFormData, status: value })
                    }
                  >
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
                {/* <div>
                  <label className="text-sm font-bold text-gray-900 block mb-2">
                    Diskon
                  </label> */}

                {/* Pilihan diskon horizontal */}
                {/* <div className="flex flex-row items-center gap-6 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="diskonTipe"
                        checked={addFormData.diskonTipe === "persentase"}
                        onChange={() =>
                          setAddFormData({
                            ...addFormData,
                            diskonTipe: "persentase",
                            diskon: 0,
                          })
                        }
                      />
                      <span className="text-sm font-bold text-gray-700">
                        Persentase (%)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="diskonTipe"
                        checked={addFormData.diskonTipe === "angka"}
                        onChange={() =>
                          setAddFormData({
                            ...addFormData,
                            diskonTipe: "angka",
                            diskon: 0,
                          })
                        }
                      />
                      <span className="text-sm font-bold text-gray-700">
                        Nominal (Rp)
                      </span>
                    </label>
                  </div> */}

                {/* Input muncul jika radio dipilih */}
                {/* {addFormData.diskonTipe && (
                    <Input
                      className="mt-2"
                      placeholder={
                        addFormData.diskonTipe === "persentase"
                          ? "Isikan persentase diskon"
                          : "Isikan jumlah diskon dalam rupiah"
                      }
                      value={addFormData.diskon === 0 ? "" : addFormData.diskon} // ← kalau 0, kosong
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        const harga = Number(addFormData.harga);

                        if (addFormData.diskonTipe === "persentase") {
                          const diskon = (harga * value) / 100;
                          setAddFormData({
                            ...addFormData,
                            diskon: value,
                            hargaDiskon: String(harga - diskon),
                          });
                        } else {
                          setAddFormData({
                            ...addFormData,
                            diskon: value,
                            hargaDiskon: String(harga - value),
                          });
                        }
                      }}
                    />
                  )}
                </div> */}

                {/* Harga Setelah Diskon */}
                {/* {addFormData.hargaDiskon && (
                  <div className="bg-green-50 p-2 rounded-lg text-sm font-medium text-green-700">
                    Harga Setelah Diskon: Rp{addFormData.hargaDiskon}
                  </div>
                )} */}

                {addFormData.kategori === "Mentoring" && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-base font-bold text-emerald-700">
                      Detail Mentoring
                    </h3>

                    <EditField label="Benefits">
                      <textarea
                        rows={3}
                        placeholder="Tuliskan manfaat utama yang akan didapatkan peserta"
                        className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                        value={addFormData.benefits}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            benefits: e.target.value,
                          }))
                        }
                      />
                    </EditField>

                    <EditField label="Mechanism">
                      <textarea
                        rows={3}
                        placeholder="Jelaskan mekanisme pelaksanaan mentoring"
                        className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                        value={addFormData.mechanism}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            mechanism: e.target.value,
                          }))
                        }
                      />
                    </EditField>

                    <EditField label="Syllabus Path">
                      <textarea
                        rows={2}
                        placeholder="Masukkan alur atau path silabus mentoring"
                        className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                        value={addFormData.syllabusPath}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            syllabusPath: e.target.value,
                          }))
                        }
                      />
                    </EditField>

                    <EditField label="Tools Used">
                      <textarea
                        rows={2}
                        placeholder="Sebutkan tools atau teknologi yang digunakan"
                        className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                        value={addFormData.toolsUsed}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            toolsUsed: e.target.value,
                          }))
                        }
                      />
                    </EditField>

                    <EditField label="Target Audience">
                      <textarea
                        rows={2}
                        placeholder="Jelaskan target peserta mentoring"
                        className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                        value={addFormData.targetAudience}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            targetAudience: e.target.value,
                          }))
                        }
                      />
                    </EditField>

                    <EditField label="Schedule">
                      <textarea
                        rows={2}
                        placeholder="Tuliskan jadwal pelaksanaan mentoring"
                        className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                        value={addFormData.schedule}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            schedule: e.target.value,
                          }))
                        }
                      />
                    </EditField>

                    <EditField label="Alumni Portfolio">
                      <textarea
                        rows={2}
                        placeholder="Contoh portfolio atau hasil karya alumni"
                        className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                        value={addFormData.alumniPortfolio}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            alumniPortfolio: e.target.value,
                          }))
                        }
                      />
                    </EditField>
                  </div>
                )}

                {addFormData.kategori === "E-Learning" && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-base font-bold text-emerald-700">
                      Detail E-Learning
                    </h3>

                    <EditField label="Category">
                      <textarea
                        rows={2}
                        placeholder="Masukkan kategori e-learning"
                        className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                        value={addFormData.category}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                      />
                    </EditField>

                    <EditField label="Level">
                      <textarea
                        rows={2}
                        placeholder="Tentukan level e-learning (Beginner, Intermediate, Advanced)"
                        className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                        value={addFormData.level}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            level: e.target.value,
                          }))
                        }
                      />
                    </EditField>

                    <EditField label="Estimated Duration">
                      <textarea
                        rows={2}
                        placeholder="Perkiraan durasi pembelajaran"
                        className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                        value={addFormData.estimatedDuration}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            estimatedDuration: e.target.value,
                          }))
                        }
                      />
                    </EditField>

                    <EditField label="Benefits">
                      <textarea
                        rows={3}
                        placeholder="Manfaat yang akan diperoleh peserta e-learning"
                        className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                        value={addFormData.benefits}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            benefits: e.target.value,
                          }))
                        }
                      />
                    </EditField>

                    <EditField label="Tools Used">
                      <textarea
                        rows={2}
                        placeholder="Tools atau platform yang digunakan dalam e-learning"
                        className="
    w-full
    border border-gray-300
    rounded-lg
    px-3 py-2
    text-sm
    outline-none
    focus:border-emerald-400
    focus:ring-1
    focus:ring-emerald-400
    transition
  "
                        value={addFormData.toolsUsed}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            toolsUsed: e.target.value,
                          }))
                        }
                      />
                    </EditField>

                    {/* TAGS – TETAP INPUT */}
                    <EditField label="Tags">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(addFormData.tags ?? []).map((tag, idx) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => {
                                const scrollTop =
                                  scrollRef.current?.scrollTop ?? 0;

                                setAddFormData((prev) => ({
                                  ...prev,
                                  tags: prev.tags?.filter((_, i) => i !== idx),
                                }));

                                requestAnimationFrame(() => {
                                  if (scrollRef.current) {
                                    scrollRef.current.scrollTop = scrollTop;
                                  }
                                });
                              }}
                              className="text-emerald-700 hover:text-red-600 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      <Input
                        placeholder="Tekan Enter untuk menambahkan tag"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();

                            const scrollTop = scrollRef.current?.scrollTop ?? 0;
                            const value = (
                              e.target as HTMLInputElement
                            ).value.trim();
                            if (!value) return;

                            if (!(addFormData.tags ?? []).includes(value)) {
                              setAddFormData((prev) => ({
                                ...prev,
                                tags: [...(prev.tags ?? []), value],
                              }));
                            }

                            (e.target as HTMLInputElement).value = "";

                            requestAnimationFrame(() => {
                              if (scrollRef.current) {
                                scrollRef.current.scrollTop = scrollTop;
                              }
                            });
                          }
                        }}
                      />
                    </EditField>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t">
            {addStep === 1 ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1 border-[#0CA678] text-[#0CA678] bg-transparent"
                  onClick={handleCloseAddDialog}
                >
                  Kembali
                </Button>
                <Button
                  className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
                  onClick={handleNextStep}
                >
                  Selanjutnya
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1 border-[#0CA678] text-[#0CA678] bg-transparent"
                  onClick={handlePrevStep}
                >
                  Sebelumnya
                </Button>
                <Button
                  className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white"
                  onClick={handleSave}
                >
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
