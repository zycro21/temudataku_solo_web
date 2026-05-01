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
  Trash2,
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
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-600 block">{label}</label>
    {children}
  </div>
);

export default function AdminMentorPage() {
  const [exportOpen, setExportOpen] = useState(false);

  const handleExportProductEvent = async (format: "csv" | "excel") => {
    const loadingToastId = toast.loading(
      `Mengekspor produk & event ke ${format.toUpperCase()}...`,
    );

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/exportProductEvent`,
        {
          params: { format },
          responseType: "blob",
          withCredentials: true,
        },
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
          },
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
            },
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses`,
            {
              withCredentials: true,
              params: {
                page: 1,
                limit: 10000,
              },
            },
          ),
        ]);

        const mentoringProjects = mentoringRes.data.data.map(
          mapMentoringToProject,
        );

        const elearningProjects = elearningRes.data.data.map(
          mapELearningToProject,
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

  // ── Section item types ──────────────────────────────────────────────────
  type SectionItem = { title: string; description: string };
  type ToolItem = { name: string };
  type ScheduleItem = { date: string }; // ISO date string
  type PortfolioItem = {
    title: string;
    description: string;
    menteeName: string;
    projectLink: string;
    thumbnail: string;
  };
  type TestimonialItem = {
    name: string;
    role: string;
    comment: string;
    rating: number;
  };

  type AddFormData = {
    nama: string;
    kategori: Kategori;
    tipeMentoring?: TipeMentoring;
    foto: File | null;

    deskripsi: string;
    harga: string;
    strikePrice: string;
    status: string;

    // mentor
    mentorIds?: string[]; // mentoring
    mentorId?: string; // e-learning

    diskonTipe: "persentase" | "angka";
    diskon: number;
    hargaDiskon: string;

    maxParticipants?: string;
    durationDays?: string;

    // 🟢 MENTORING — simple fields
    slug?: string;
    isFeatured?: boolean;
    programAbout?: string;
    totalWeeks?: string;
    totalProjects?: string;

    // 🟢 MENTORING — sections (BENEFIT, MECHANISM, SYLLABUS, TARGET)
    benefits?: SectionItem[];
    mechanisms?: SectionItem[];
    syllabuses?: SectionItem[];
    targets?: SectionItem[];

    // 🟢 MENTORING — relations
    tools?: ToolItem[];
    schedules?: ScheduleItem[];
    portfolios?: PortfolioItem[];
    testimonials?: TestimonialItem[];

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
    strikePrice: "",
    status: "Aktif",

    mentorIds: [],
    mentorId: "",

    diskonTipe: "persentase",
    diskon: 0,
    hargaDiskon: "",

    maxParticipants: "",
    durationDays: "",

    // mentoring simple fields
    slug: "",
    isFeatured: false,
    programAbout: "",
    totalWeeks: "",
    totalProjects: "",

    // mentoring sections
    benefits: [],
    mechanisms: [],
    syllabuses: [],
    targets: [],

    // mentoring relations
    tools: [],
    schedules: [],
    portfolios: [],
    testimonials: [],

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

    if (addFormData.kategori === "Mentoring") {
      if (!addFormData.maxParticipants || !addFormData.durationDays) {
        toast.error("Max participants dan duration wajib diisi");
        return;
      }
    }

    try {
      // =====================
      // 🟢 MENTORING (JSON)
      // =====================
      const payload = {
        serviceName: addFormData.nama,
        description: addFormData.deskripsi || undefined,
        price: Number(addFormData.harga),
        strikePrice: addFormData.strikePrice
          ? Number(addFormData.strikePrice)
          : undefined,
        serviceType: "bootcamp", // otomatis bootcamp

        maxParticipants: Number(addFormData.maxParticipants),
        durationDays: Number(addFormData.durationDays),

        slug: addFormData.slug || undefined,
        isFeatured: addFormData.isFeatured ?? false,
        programAbout: addFormData.programAbout || undefined,
        totalWeeks: addFormData.totalWeeks
          ? Number(addFormData.totalWeeks)
          : undefined,
        totalProjects: addFormData.totalProjects
          ? Number(addFormData.totalProjects)
          : undefined,

        mentorProfileIds: selectedMentorIds,

        sections: [
          ...(addFormData.benefits ?? []).map((item, i) => ({
            type: "BENEFIT",
            title: item.title,
            content: { title: item.title, description: item.description },
            order: i,
          })),
          ...(addFormData.mechanisms ?? []).map((item, i) => ({
            type: "MECHANISM",
            title: item.title,
            content: { title: item.title, description: item.description },
            order: i,
          })),
          ...(addFormData.syllabuses ?? []).map((item, i) => ({
            type: "SYLLABUS",
            title: item.title,
            content: { title: item.title, description: item.description },
            order: i,
          })),
          ...(addFormData.targets ?? []).map((item, i) => ({
            type: "TARGET",
            title: item.title,
            content: { title: item.title, description: item.description },
            order: i,
          })),
        ],

        tools: (addFormData.tools ?? []).map((t) => ({ name: t.name })),

        schedules: (addFormData.schedules ?? [])
          .filter((s) => s.date)
          .map((s) => ({ date: new Date(s.date).toISOString() })),

        portfolios: (addFormData.portfolios ?? []).map((p) => ({
          title: p.title,
          description: p.description || undefined,
          menteeName: p.menteeName,
          projectLink: p.projectLink,
          thumbnail: p.thumbnail || undefined,
        })),

        testimonials: (addFormData.testimonials ?? []).map((t) => ({
          name: t.name,
          role: t.role || undefined,
          comment: t.comment,
          rating: t.rating,
        })),
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/mentoring-services`,
        payload,
        {
          withCredentials: true,
        },
      );

      toast.success("Produk mentoring berhasil ditambahkan");

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
          },
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
          },
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        {/* Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-0.5">
            Produk & Event
          </h1>
          <p className="text-sm text-gray-500">Produk & Event</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dropdown Export */}
          <DropdownMenu onOpenChange={(open) => setExportOpen(open)}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1.5 h-9 px-3 text-sm
          bg-white hover:bg-gray-50 border border-gray-300"
              >
                <Download className="w-4 h-4" />
                <span className="whitespace-nowrap">Export</span>

                {exportOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-36 text-sm">
              <DropdownMenuItem onClick={() => handleExportProductEvent("csv")}>
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExportProductEvent("excel")}
              >
                Export Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Button Tambah */}
          <Button
            className="flex items-center gap-1.5 h-9 px-3 text-sm
      bg-[#0CA678] hover:bg-[#08916C]"
            onClick={() => {
              resetAddModal();
              setShowAddDialog(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="whitespace-nowrap">Tambah</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="
        w-full flex flex-col justify-between
        px-0 py-1.5
        shadow-sm hover:shadow-md
        transition-all duration-200
        cursor-pointer rounded-md bg-white
      "
          >
            {/* Header */}
            <CardHeader className="flex items-center justify-between px-3 pt-2 pb-1">
              <div className="flex items-center gap-2 min-w-0">
                <Image
                  src={stat.image}
                  alt={stat.title}
                  width={14}
                  height={14}
                  className="opacity-90"
                />
                <CardTitle className="text-xs font-medium text-gray-600 truncate">
                  {stat.title}
                </CardTitle>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            </CardHeader>

            {/* Content */}
            <CardContent className="px-3 pt-0 pb-2">
              <p className={`text-xl font-bold leading-tight ${stat.color}`}>
                {stat.value}
              </p>
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
          className="max-w-4xl max-h-[88vh] flex flex-col"
          onInteractOutside={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm font-semibold">
                Tambah Produk / Event Baru
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="my-3 mb-1">
            <div className="flex items-center space-x-4">
              {/* Step 1 */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs ${
                    addStep >= 1
                      ? "bg-[#0CA678] text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  1
                </div>
                <span
                  className={`text-xs font-semibold ${
                    addStep === 1 ? "text-[#0CA678]" : "text-gray-400"
                  }`}
                >
                  Informasi Dasar
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs ${
                    addStep >= 2
                      ? "bg-[#0CA678] text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-xs font-semibold ${
                    addStep === 2 ? "text-[#0CA678]" : "text-gray-400"
                  }`}
                >
                  Deskripsi & Harga
                </span>
              </div>
            </div>

            {/* Garis pemisah bawah */}
            <div className="border-b pb-2 mt-2" />
          </div>

          {/* Form Content (scrollable) */}
          <div
            ref={scrollRef}
            className="space-y-3 max-h-[440px] overflow-y-auto pr-2 py-2"
          >
            {addStep === 1 ? (
              <>
                {/* Foto */}
                <div>
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
                    Foto Produk Atau Event
                  </label>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {addFormData.foto ? (
                      <img
                        src={URL.createObjectURL(addFormData.foto)}
                        alt="Preview"
                        className="mx-auto mb-2 w-14 h-14 object-cover rounded"
                      />
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-[#0CA678] mx-auto mb-1" />
                        <p className="text-xs text-gray-600 mb-0.5">
                          Pilih file atau seret di sini
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
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
                      className="bg-[#0CA678] hover:bg-[#08916C] text-white text-xs h-7 px-3"
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
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
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
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
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
                    <SelectTrigger className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs h-8">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mentoring">Mentoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipe Mentoring */}
                {addFormData.kategori === "Mentoring" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-900 block mb-1">
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
                      <SelectTrigger className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs h-8">
                        <SelectValue placeholder="Pilih tipe mentoring" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Bootcamp">Bootcamp</SelectItem>
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
                  <div className="space-y-3">
                    {/* Slug */}
                    <div>
                      <label className="text-xs font-semibold text-gray-900 block mb-1">
                        Slug (opsional)
                      </label>
                      <Input
                        placeholder="Contoh: bootcamp-uiux-2025"
                        value={addFormData.slug ?? ""}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            slug: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* Is Featured */}
                    <div>
                      <label className="text-xs font-semibold text-gray-900 block mb-1">
                        Is Featured
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          checked={addFormData.isFeatured ?? false}
                          onChange={(e) =>
                            setAddFormData((prev) => ({
                              ...prev,
                              isFeatured: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 accent-emerald-600"
                        />
                        <label
                          htmlFor="isFeatured"
                          className="text-xs text-gray-700 cursor-pointer"
                        >
                          Tampilkan sebagai featured
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {addFormData.kategori === "Mentoring" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-900 block mb-1">
                      Pilih Mentor (bisa lebih dari 1)
                    </label>

                    <div
                      className={`
    border rounded-lg p-2 space-y-1
    ${mentorOptions.length > 6 ? "max-h-[160px] overflow-y-auto" : ""}
  `}
                    >
                      {mentorOptions.map((mentor) => {
                        const checked = selectedMentorIds.includes(mentor.id);

                        return (
                          <label
                            key={mentor.id}
                            className="flex items-center gap-2 text-xs cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setSelectedMentorIds((prev) =>
                                  checked
                                    ? prev.filter((id) => id !== mentor.id)
                                    : [...prev, mentor.id],
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
              </>
            ) : (
              <>
                {/* Deskripsi */}
                <div>
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
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
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                  />
                </div>

                {addFormData.kategori === "Mentoring" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Max Participants */}
                    <div>
                      <label className="text-xs font-semibold text-gray-900 block mb-1">
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
                      <label className="text-xs font-semibold text-gray-900 block mb-1">
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
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
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

                {/* Harga Coret */}
                {addFormData.kategori === "Mentoring" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-900 block mb-1">
                      Harga Coret / Strike Price (opsional)
                    </label>
                    <Input
                      type="number"
                      placeholder="Contoh: 3000000"
                      value={addFormData.strikePrice ?? ""}
                      onChange={(e) =>
                        setAddFormData((prev) => ({
                          ...prev,
                          strikePrice: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
                    Status
                  </label>
                  <Select
                    value={addFormData.status}
                    onValueChange={(value) =>
                      setAddFormData({ ...addFormData, status: value })
                    }
                  >
                    <SelectTrigger className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs h-8">
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
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
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
                  <div className="space-y-4 pt-3 border-t">
                    <h3 className="text-xs font-bold text-emerald-700">
                      Detail Mentoring
                    </h3>

                    {/* ── Total Weeks & Total Projects ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <EditField label="Total Minggu">
                        <Input
                          type="number"
                          min={1}
                          placeholder="Contoh: 12"
                          value={addFormData.totalWeeks ?? ""}
                          onChange={(e) =>
                            setAddFormData((prev) => ({
                              ...prev,
                              totalWeeks: e.target.value,
                            }))
                          }
                        />
                      </EditField>
                      <EditField label="Total Proyek">
                        <Input
                          type="number"
                          min={0}
                          placeholder="Contoh: 5"
                          value={addFormData.totalProjects ?? ""}
                          onChange={(e) =>
                            setAddFormData((prev) => ({
                              ...prev,
                              totalProjects: e.target.value,
                            }))
                          }
                        />
                      </EditField>
                    </div>

                    {/* ── Program About ── */}
                    <EditField label="Program About (opsional)">
                      <textarea
                        rows={3}
                        placeholder="Deskripsi singkat tentang program ini"
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                        value={addFormData.programAbout ?? ""}
                        onChange={(e) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            programAbout: e.target.value,
                          }))
                        }
                      />
                    </EditField>

                    {/* ════════════════════════════════════════
                        SECTIONS
                    ════════════════════════════════════════ */}

                    {/* ── BENEFIT ── */}
                    {(
                      [
                        {
                          key: "benefits" as const,
                          label: "Benefit",
                          placeholder: {
                            title: "Contoh: Kuasai UI/UX",
                            desc: "Contoh: Peserta mampu membuat desain profesional",
                          },
                        },
                        {
                          key: "mechanisms" as const,
                          label: "Mechanism",
                          placeholder: {
                            title: "Contoh: Live Session",
                            desc: "Contoh: Sesi live 2x seminggu bersama mentor",
                          },
                        },
                        {
                          key: "syllabuses" as const,
                          label: "Syllabus",
                          placeholder: {
                            title: "Contoh: Week 1 — Dasar Desain",
                            desc: "Contoh: Pengenalan Figma, prinsip dasar UI",
                          },
                        },
                        {
                          key: "targets" as const,
                          label: "Target Audience",
                          placeholder: {
                            title: "Contoh: Fresh Graduate",
                            desc: "Contoh: Lulusan baru yang ingin masuk industri desain",
                          },
                        },
                      ] as const
                    ).map(({ key, label, placeholder }) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-600">
                            {label}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setAddFormData((prev) => ({
                                ...prev,
                                [key]: [
                                  ...(prev[key] ?? []),
                                  { title: "", description: "" },
                                ],
                              }))
                            }
                            className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Tambah {label}
                          </button>
                        </div>
                        {(addFormData[key] ?? []).map((item, idx) => (
                          <div
                            key={idx}
                            className="border border-gray-200 rounded-lg p-2 space-y-1.5 bg-gray-50"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-500">
                                {label} #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setAddFormData((prev) => ({
                                    ...prev,
                                    [key]: (prev[key] ?? []).filter(
                                      (_, i) => i !== idx,
                                    ),
                                  }))
                                }
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <Input
                              placeholder={placeholder.title}
                              value={item.title}
                              onChange={(e) =>
                                setAddFormData((prev) => ({
                                  ...prev,
                                  [key]: (prev[key] ?? []).map((it, i) =>
                                    i === idx
                                      ? { ...it, title: e.target.value }
                                      : it,
                                  ),
                                }))
                              }
                            />
                            <textarea
                              rows={2}
                              placeholder={placeholder.desc}
                              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                              value={item.description}
                              onChange={(e) =>
                                setAddFormData((prev) => ({
                                  ...prev,
                                  [key]: (prev[key] ?? []).map((it, i) =>
                                    i === idx
                                      ? { ...it, description: e.target.value }
                                      : it,
                                  ),
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ))}

                    {/* ════════════════════════════════════════
                        TOOLS
                    ════════════════════════════════════════ */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">
                          Tools yang Digunakan
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setAddFormData((prev) => ({
                              ...prev,
                              tools: [...(prev.tools ?? []), { name: "" }],
                            }))
                          }
                          className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Tambah Tool
                        </button>
                      </div>
                      {(addFormData.tools ?? []).map((tool, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            placeholder="Contoh: Figma"
                            value={tool.name}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                tools: (prev.tools ?? []).map((t, i) =>
                                  i === idx ? { name: e.target.value } : t,
                                ),
                              }))
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setAddFormData((prev) => ({
                                ...prev,
                                tools: (prev.tools ?? []).filter(
                                  (_, i) => i !== idx,
                                ),
                              }))
                            }
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* ════════════════════════════════════════
                        SCHEDULES
                    ════════════════════════════════════════ */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">
                          Jadwal (Tanggal)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setAddFormData((prev) => ({
                              ...prev,
                              schedules: [
                                ...(prev.schedules ?? []),
                                { date: "" },
                              ],
                            }))
                          }
                          className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Tambah Jadwal
                        </button>
                      </div>
                      {(addFormData.schedules ?? []).map((sched, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={sched.date}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                schedules: (prev.schedules ?? []).map((s, i) =>
                                  i === idx ? { date: e.target.value } : s,
                                ),
                              }))
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setAddFormData((prev) => ({
                                ...prev,
                                schedules: (prev.schedules ?? []).filter(
                                  (_, i) => i !== idx,
                                ),
                              }))
                            }
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* ════════════════════════════════════════
                        PORTFOLIO
                    ════════════════════════════════════════ */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">
                          Portfolio Alumni
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setAddFormData((prev) => ({
                              ...prev,
                              portfolios: [
                                ...(prev.portfolios ?? []),
                                {
                                  title: "",
                                  description: "",
                                  menteeName: "",
                                  projectLink: "",
                                  thumbnail: "",
                                },
                              ],
                            }))
                          }
                          className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Tambah Portfolio
                        </button>
                      </div>
                      {(addFormData.portfolios ?? []).map((p, idx) => (
                        <div
                          key={idx}
                          className="border border-gray-200 rounded-lg p-2 space-y-1.5 bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">
                              Portfolio #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setAddFormData((prev) => ({
                                  ...prev,
                                  portfolios: (prev.portfolios ?? []).filter(
                                    (_, i) => i !== idx,
                                  ),
                                }))
                              }
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <Input
                            placeholder="Judul proyek"
                            value={p.title}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                portfolios: (prev.portfolios ?? []).map(
                                  (it, i) =>
                                    i === idx
                                      ? { ...it, title: e.target.value }
                                      : it,
                                ),
                              }))
                            }
                          />
                          <Input
                            placeholder="Nama mentee"
                            value={p.menteeName}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                portfolios: (prev.portfolios ?? []).map(
                                  (it, i) =>
                                    i === idx
                                      ? { ...it, menteeName: e.target.value }
                                      : it,
                                ),
                              }))
                            }
                          />
                          <Input
                            placeholder="Link proyek (URL)"
                            value={p.projectLink}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                portfolios: (prev.portfolios ?? []).map(
                                  (it, i) =>
                                    i === idx
                                      ? { ...it, projectLink: e.target.value }
                                      : it,
                                ),
                              }))
                            }
                          />
                          <Input
                            placeholder="Thumbnail (URL, opsional)"
                            value={p.thumbnail}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                portfolios: (prev.portfolios ?? []).map(
                                  (it, i) =>
                                    i === idx
                                      ? { ...it, thumbnail: e.target.value }
                                      : it,
                                ),
                              }))
                            }
                          />
                          <textarea
                            rows={2}
                            placeholder="Deskripsi (opsional)"
                            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                            value={p.description}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                portfolios: (prev.portfolios ?? []).map(
                                  (it, i) =>
                                    i === idx
                                      ? { ...it, description: e.target.value }
                                      : it,
                                ),
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>

                    {/* ════════════════════════════════════════
                        TESTIMONIALS
                    ════════════════════════════════════════ */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">
                          Testimonial
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setAddFormData((prev) => ({
                              ...prev,
                              testimonials: [
                                ...(prev.testimonials ?? []),
                                { name: "", role: "", comment: "", rating: 5 },
                              ],
                            }))
                          }
                          className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Tambah Testimonial
                        </button>
                      </div>
                      {(addFormData.testimonials ?? []).map((t, idx) => (
                        <div
                          key={idx}
                          className="border border-gray-200 rounded-lg p-2 space-y-1.5 bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">
                              Testimonial #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setAddFormData((prev) => ({
                                  ...prev,
                                  testimonials: (
                                    prev.testimonials ?? []
                                  ).filter((_, i) => i !== idx),
                                }))
                              }
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <Input
                            placeholder="Nama"
                            value={t.name}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                testimonials: (prev.testimonials ?? []).map(
                                  (it, i) =>
                                    i === idx
                                      ? { ...it, name: e.target.value }
                                      : it,
                                ),
                              }))
                            }
                          />
                          <Input
                            placeholder="Role / Jabatan (opsional)"
                            value={t.role}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                testimonials: (prev.testimonials ?? []).map(
                                  (it, i) =>
                                    i === idx
                                      ? { ...it, role: e.target.value }
                                      : it,
                                ),
                              }))
                            }
                          />
                          <textarea
                            rows={2}
                            placeholder="Komentar"
                            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                            value={t.comment}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                testimonials: (prev.testimonials ?? []).map(
                                  (it, i) =>
                                    i === idx
                                      ? { ...it, comment: e.target.value }
                                      : it,
                                ),
                              }))
                            }
                          />
                          <EditField label={`Rating: ${t.rating} / 5`}>
                            <input
                              type="range"
                              min={1}
                              max={5}
                              value={t.rating}
                              className="w-full accent-emerald-600"
                              onChange={(e) =>
                                setAddFormData((prev) => ({
                                  ...prev,
                                  testimonials: (prev.testimonials ?? []).map(
                                    (it, i) =>
                                      i === idx
                                        ? {
                                            ...it,
                                            rating: Number(e.target.value),
                                          }
                                        : it,
                                  ),
                                }))
                              }
                            />
                          </EditField>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-3 border-t">
            {addStep === 1 ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1 border-[#0CA678] text-[#0CA678] bg-transparent text-xs h-8"
                  onClick={handleCloseAddDialog}
                >
                  Kembali
                </Button>
                <Button
                  className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white text-xs h-8"
                  onClick={handleNextStep}
                >
                  Selanjutnya
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1 border-[#0CA678] text-[#0CA678] bg-transparent text-xs h-8"
                  onClick={handlePrevStep}
                >
                  Sebelumnya
                </Button>
                <Button
                  className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white text-xs h-8"
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
