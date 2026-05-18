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
import BootcampPreviewModal, { PreviewData } from "./BootcampPreviewModal";

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
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    return {
      id: item.id,
      foto: item.thumbnail
        ? `${baseUrl}${item.thumbnail}`
        : "/images/Navbar_logo.png",
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
      isActive: item.isActive,

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
      whatsappGroup: item.whatsappGroup ?? null,
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

      const mentoringProjects = mentoringRes.data.data
        .filter((item: any) => item.serviceType === "bootcamp")
        .map(mapMentoringToProject);

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

  useEffect(() => {
    fetchProjects();
  }, []);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
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
    startDate?: string;
    endDate?: string;

    // 🟢 MENTORING — simple fields
    slug?: string;
    isFeatured?: boolean;
    programAbout?: string;
    totalWeeks?: string;
    totalProjects?: string;
    whatsappGroup?: string;

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
    startDate: "",
    endDate: "",

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

  const [calculatedDays, setCalculatedDays] = useState<number>(0);

  const [addFormData, setAddFormData] =
    useState<AddFormData>(initialAddFormData);

  // Hitung durationDays otomatis dari startDate & endDate
  useEffect(() => {
    const start = addFormData.startDate;
    const end = addFormData.endDate;

    if (!start || !end) {
      setCalculatedDays(0);
      return;
    }

    const startD = new Date(start);
    const endD = new Date(end);

    startD.setHours(0, 0, 0, 0);
    endD.setHours(0, 0, 0, 0);

    const diffTime = endD.getTime() - startD.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setCalculatedDays(diffDays > 0 ? diffDays : 0);
  }, [addFormData.startDate, addFormData.endDate]);

  const TOOL_OPTIONS = [
    "Excel",
    "Python",
    "Pandas",
    "NumPy",
    "Power BI",
    "Tableau",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "BigQuery",
    "Snowflake",
    "Apache Spark",
    "Hadoop",
    "Airflow",
    "dbt",
    "Jupyter Notebook",
    "Google Colab",
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
    "Keras",
    "OpenCV",
    "FastAPI",
    "Streamlit",
    "MLflow",
    "Weights & Biases",
    "Docker",
    "Kubernetes",
    "AWS",
    "GCP",
    "Git",
    "GitHub",
    "R",
    "Statistics",
    "Looker",
    "Metabase",
    "Superset",
    "Hugging Face",
    // tambahan
    "Seaborn",
    "Matplotlib",
    "Plotly",
    "XGBoost",
    "LightGBM",
    "CatBoost",
    "Dask",
    "Polars",
    "NLTK",
    "SpaCy",
    "LangChain",
    "LlamaIndex",
    "Transformers",
    "ONNX",
    "Triton Inference Server",
    "Ray",
    "Ray Tune",
    "Optuna",
    "DeepSpeed",
    "Accelerate",
    "Bokeh",
    "Altair",
    "Dash",
    "Streamlit",
    "Plotnine",
    "Kafka",
    "Apache Flink",
    "Apache Beam",
    "Delta Lake",
    "Databricks",
    "Presto",
    "Trino",
    "ClickHouse",
    "Azure",
    "Azure ML",
    "SageMaker",
    "Vertex AI",
    "Terraform",
    "Pulumi",
    "CircleCI",
    "GitLab CI",
    "ArgoCD",
    "Prefect",
    "DVC",
    "Great Expectations",
    "Evidently AI",
    "Node.js",
    "Express.js",
    "NestJS",
    "Go",
    "Gin",
    "Redis",
    "GraphQL",
    "gRPC",
    "Pinecone",
    "Weaviate",
    "FAISS",
    "Chroma",
    "Milvus",
    "Elasticsearch",
    "OpenSearch",
    "Gensim",
    "TextBlob",
    "Tesseract OCR",
    "Detectron2",
  ];

  const resetAddModal = () => {
    setAddFormData(initialAddFormData);
    setSelectedMentorIds([]); // mentoring
    setSelectedMentorId(""); // e-learning
    setCalculatedDays(0);
    setAddStep(1);
    setShowPreviewDialog(false);
  };

  const handleCloseAddDialog = () => {
    setShowAddDialog(false);
    resetAddModal();
  };

  const handleNextStep = () => {
    const missing: string[] = [];

    // ── Semua kategori ──
    if (!addFormData.foto) missing.push("Foto Produk");
    if (!addFormData.nama.trim()) missing.push("Nama Produk");

    // ── Mentoring step-1 ──
    if (addFormData.kategori === "Mentoring") {
      if (!addFormData.tipeMentoring) missing.push("Tipe Mentoring");
      if (!addFormData.slug?.trim()) missing.push("Slug");
      if (selectedMentorIds.length === 0)
        missing.push("Pilih minimal 1 Mentor");
    }

    if (missing.length > 0) {
      toast.error(
        `Lengkapi field berikut sebelum melanjutkan:\n• ${missing.join("\n• ")}`,
        { duration: 5000 },
      );
      return;
    }

    setAddStep(2);
  };

  const handlePrevStep = () => setAddStep(1);

  const handleSave = async () => {
    // =====================
    // ✅ VALIDASI STEP 2
    // =====================
    const missing2: string[] = [];

    if (!addFormData.deskripsi?.trim()) missing2.push("Deskripsi");
    if (!addFormData.harga?.trim()) missing2.push("Harga");

    if (addFormData.kategori === "Mentoring") {
      if (!addFormData.maxParticipants?.trim())
        missing2.push("Max Participants");
      if (!addFormData.startDate?.trim()) missing2.push("Start Date");
      if (!addFormData.endDate?.trim()) missing2.push("End Date");
      if (!addFormData.category?.trim()) missing2.push("Category");
      if (!addFormData.level?.trim()) missing2.push("Level");
      if (!addFormData.strikePrice?.trim())
        missing2.push("Harga Coret / Strike Price");
      if (!addFormData.programAbout?.trim()) missing2.push("Program About");
      if (!addFormData.totalWeeks?.trim()) missing2.push("Total Minggu");
      if (!addFormData.totalProjects?.trim()) missing2.push("Total Proyek");
      if (!addFormData.whatsappGroup?.trim()) missing2.push("Group Whatsapp");

      // Sections — wajib minimal 1 item + tiap item harus terisi
      if (!addFormData.benefits || addFormData.benefits.length === 0) {
        missing2.push("Benefit (minimal 1 item)");
      } else {
        addFormData.benefits.forEach((b, i) => {
          if (!b.title.trim()) missing2.push(`Benefit #${i + 1}: Title`);
          if (!b.description.trim())
            missing2.push(`Benefit #${i + 1}: Description`);
        });
      }

      if (!addFormData.mechanisms || addFormData.mechanisms.length === 0) {
        missing2.push("Mechanism (minimal 1 item)");
      } else {
        addFormData.mechanisms.forEach((m, i) => {
          if (!m.title.trim()) missing2.push(`Mechanism #${i + 1}: Title`);
          if (!m.description.trim())
            missing2.push(`Mechanism #${i + 1}: Description`);
        });
      }

      if (!addFormData.syllabuses || addFormData.syllabuses.length === 0) {
        missing2.push("Syllabus (minimal 1 item)");
      } else {
        addFormData.syllabuses.forEach((s, i) => {
          if (!s.title.trim()) missing2.push(`Syllabus #${i + 1}: Title`);
          if (!s.description.trim())
            missing2.push(`Syllabus #${i + 1}: Description`);
        });
      }

      if (!addFormData.targets || addFormData.targets.length === 0) {
        missing2.push("Target Audience (minimal 1 item)");
      } else {
        addFormData.targets.forEach((t, i) => {
          if (!t.title.trim()) missing2.push(`Target #${i + 1}: Title`);
          if (!t.description.trim())
            missing2.push(`Target #${i + 1}: Description`);
        });
      }

      // Tools — wajib minimal 1
      if (!addFormData.tools || addFormData.tools.length === 0) {
        missing2.push("Tools yang Digunakan (minimal 1)");
      } else {
        addFormData.tools.forEach((t, i) => {
          if (!t.name.trim()) missing2.push(`Tool #${i + 1}: Nama`);
        });
      }

      // Schedules — wajib minimal 1
      if (!addFormData.schedules || addFormData.schedules.length === 0) {
        missing2.push("Jadwal (minimal 1 tanggal)");
      } else {
        addFormData.schedules.forEach((s, i) => {
          if (!s.date) missing2.push(`Jadwal #${i + 1}: Tanggal`);
        });
      }

      // Portfolios — wajib minimal 1 + semua field terisi
      if (!addFormData.portfolios || addFormData.portfolios.length === 0) {
        missing2.push("Portfolio Alumni (minimal 1 item)");
      } else {
        addFormData.portfolios.forEach((p, i) => {
          if (!p.title.trim()) missing2.push(`Portfolio #${i + 1}: Judul`);
          if (!p.menteeName.trim())
            missing2.push(`Portfolio #${i + 1}: Nama Mentee`);
          if (!p.projectLink.trim())
            missing2.push(`Portfolio #${i + 1}: Link Proyek`);
          if (!p.description.trim())
            missing2.push(`Portfolio #${i + 1}: Deskripsi`);
        });
      }

      // Testimonials — wajib minimal 1 + semua field terisi
      if (!addFormData.testimonials || addFormData.testimonials.length === 0) {
        missing2.push("Testimonial (minimal 1 item)");
      } else {
        addFormData.testimonials.forEach((t, i) => {
          if (!t.name.trim()) missing2.push(`Testimonial #${i + 1}: Nama`);
          if (!t.role.trim()) missing2.push(`Testimonial #${i + 1}: Role`);
          if (!t.comment.trim())
            missing2.push(`Testimonial #${i + 1}: Komentar`);
        });
      }
    }

    if (missing2.length > 0) {
      toast.error(
        `Lengkapi field berikut sebelum menyimpan:\n• ${missing2.join("\n• ")}`,
        { duration: 7000 },
      );
      return;
    }

    try {
      // =====================
      // 🟢 MENTORING
      // Strategi: POST JSON dulu (nested objects supported) → dapat ID
      //           → PATCH multipart hanya jika ada foto (multer upload thumbnail)
      // Ini menghindari "expected object, received string" karena FormData
      // tidak bisa kirim nested array of objects tanpa JSON.stringify,
      // sedangkan Zod validator backend tidak punya transform JSON.parse.
      // =====================
      const sections = [
        ...(addFormData.benefits ?? []).map((item) => ({
          type: "BENEFIT",
          title: item.title,
          description: item.description,
        })),
        ...(addFormData.mechanisms ?? []).map((item) => ({
          type: "MECHANISM",
          title: item.title,
          description: item.description,
        })),
        ...(addFormData.syllabuses ?? []).map((item) => ({
          type: "SYLLABUS",
          title: item.title,
          description: item.description,
        })),
        ...(addFormData.targets ?? []).map((item) => ({
          type: "TARGET",
          title: item.title,
          description: item.description,
        })),
      ];

      // tools: string[]  (sesuai validator: z.array(z.string()))
      const tools = (addFormData.tools ?? []).map((t) => t.name);

      // schedules: string[] ISO date  (sesuai validator: z.array(z.string()))
      const schedules = (addFormData.schedules ?? [])
        .filter((s) => s.date)
        .map((s) => new Date(s.date).toISOString());

      const portfolios = (addFormData.portfolios ?? []).map((p) => ({
        title: p.title,
        description: p.description,
        menteeName: p.menteeName,
        projectLink: p.projectLink,
        // thumbnail: p.thumbnail || undefined,
      }));

      const testimonials = (addFormData.testimonials ?? []).map((t) => ({
        name: t.name,
        role: t.role || undefined,
        comment: t.comment,
        rating: t.rating,
      }));

      // ── STEP 1: POST JSON (nested objects dikirim as-is, tidak stringify) ──
      const jsonPayload = {
        serviceName: addFormData.nama,
        description: addFormData.deskripsi,
        price: Number(addFormData.harga),
        strikePrice: Number(addFormData.strikePrice),
        serviceType: "bootcamp",
        maxParticipants: Number(addFormData.maxParticipants),
        startDate: addFormData.startDate,
        endDate: addFormData.endDate,
        whatsappGroup: addFormData.whatsappGroup ?? "",
        slug: addFormData.slug ?? "",
        isFeatured: addFormData.isFeatured ?? false,
        programAbout: addFormData.programAbout ?? "",
        totalWeeks: Number(addFormData.totalWeeks),
        totalProjects: Number(addFormData.totalProjects),
        mentorProfileIds: selectedMentorIds,
        category: addFormData.category ?? undefined,
        level: addFormData.level ?? undefined,
        sections,
        tools,
        schedules,
        portfolios,
        testimonials,
      };

      const createRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/mentoring-services`,
        jsonPayload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      // ── STEP 2: PATCH thumbnail via multipart ──
      // Catatan: updateMentoringServiceSchema punya .refine() yang cek
      // Object.keys(body).length > 0. Kalau hanya kirim file (thumbnail),
      // req.body akan kosong karena multer tidak parse body field teks.
      // Solusi: ikutkan satu scalar field (serviceType) agar body tidak kosong
      // sehingga refine validator lolos, sekaligus thumbnail ter-upload via multer.
      if (addFormData.foto) {
        const createdId = createRes.data?.data?.id;
        if (createdId) {
          const thumbForm = new FormData();
          thumbForm.append("thumbnail", addFormData.foto);
          // Minimal satu field body agar Zod refine tidak gagal
          thumbForm.append("serviceType", "bootcamp");
          await axios.patch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/admin/mentoring-services/${createdId}`,
            thumbForm,
            {
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" },
            },
          );
        }
      }

      toast.success("Produk mentoring berhasil ditambahkan");

      // =====================
      // ✅ SUCCESS
      // =====================
      handleCloseAddDialog();
      fetchProjects();
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

        // Hanya hitung yang serviceType === "bootcamp"
        const totalMentoring = mentoringData.filter(
          (item: any) => item.serviceType?.toLowerCase() === "bootcamp",
        ).length;

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

        // Total Produk & Event = bootcamp + e-learning
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

  function ToolSelect({
    value,
    onChange,
  }: {
    value: string;
    onChange: (val: string) => void;
  }) {
    const [query, setQuery] = useState(value || "");
    const [open, setOpen] = useState(false);

    const filtered = TOOL_OPTIONS.filter((tool) =>
      tool.toLowerCase().includes(query.toLowerCase()),
    );

    return (
      <div className="relative w-full">
        <Input
          placeholder="Cari tools... (contoh: python)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />

        {open && filtered.length > 0 && (
          <div
            className="absolute z-50 bg-white border rounded-md shadow-md w-full max-h-40 overflow-auto mt-1"
            onMouseDown={(e) => e.preventDefault()}
          >
            {filtered.map((tool, i) => (
              <div
                key={i}
                onMouseDown={(e) => {
                  e.preventDefault(); // 🔥 penting biar ga trigger blur

                  onChange(tool);
                  setQuery(tool);
                  setOpen(false);
                }}
                className="px-3 py-2 text-sm hover:bg-emerald-50 cursor-pointer"
              >
                {tool}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

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
          onRefresh={fetchProjects}
        />
      </Card>

      {/* Add Dialog + Preview — wrapper biar bisa side-by-side */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${showAddDialog ? "" : "hidden"}`}
        aria-hidden={!showAddDialog}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => {
            /* tidak close saat klik overlay, konsisten dgn onInteractOutside prevent */
          }}
        />

        {/* Side-by-side wrapper */}
        <div className="relative z-10 flex items-start gap-3 max-w-[95vw]">
          {/* ── ADD FORM MODAL ── */}
          <div className="bg-white rounded-xl shadow-xl flex flex-col w-[520px] max-h-[88vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-0">
              <h2 className="text-sm font-semibold text-gray-800">
                Tambah Produk / Event Baru
              </h2>
              <div className="flex items-center gap-2">
                {addFormData.kategori === "Mentoring" && (
                  <button
                    type="button"
                    onClick={() => setShowPreviewDialog((v) => !v)}
                    className={`text-[10px] px-2.5 py-1 rounded border font-medium transition ${
                      showPreviewDialog
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {showPreviewDialog
                      ? "Sembunyikan Preview"
                      : "Lihat Preview"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCloseAddDialog}
                  className="text-gray-400 hover:text-gray-700 text-lg leading-none"
                  aria-label="Tutup"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="px-6 my-3 mb-1">
              <div className="flex items-center space-x-4">
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
                    className={`text-xs font-semibold ${addStep === 1 ? "text-[#0CA678]" : "text-gray-400"}`}
                  >
                    Informasi Dasar
                  </span>
                </div>
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
                    className={`text-xs font-semibold ${addStep === 2 ? "text-[#0CA678]" : "text-gray-400"}`}
                  >
                    Deskripsi &amp; Harga
                  </span>
                </div>
              </div>
              <div className="border-b pb-2 mt-2" />
            </div>

            {/* Form Content (scrollable) */}
            <div
              ref={scrollRef}
              className="space-y-3 max-h-[440px] overflow-y-auto pr-2 py-2 px-6"
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
                        <>
                          <img
                            src={URL.createObjectURL(addFormData.foto)}
                            alt="Preview"
                            className="mx-auto mb-3 w-48 h-48 object-cover rounded-lg shadow"
                          />
                          <p className="text-xs text-gray-500 mb-2 truncate max-w-xs mx-auto">
                            {addFormData.foto.name}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-red-400 text-red-500 hover:bg-red-50 hover:text-red-700 text-xs h-7 px-3 gap-1"
                            onClick={() => {
                              setAddFormData((prev) => ({
                                ...prev,
                                foto: null,
                              }));
                              const input = document.getElementById(
                                "fileUpload",
                              ) as HTMLInputElement;
                              if (input) input.value = "";
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus Foto
                          </Button>
                        </>
                      ) : (
                        <>
                          <Upload className="w-7 h-7 text-[#0CA678] mx-auto mb-1" />
                          <p className="text-xs text-gray-600 mb-0.5">
                            Pilih file atau seret di sini
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            png atau jpg
                          </p>
                          <Button
                            type="button"
                            className="bg-[#0CA678] hover:bg-[#08916C] text-white text-xs h-7 px-3"
                            onClick={() =>
                              document.getElementById("fileUpload")?.click()
                            }
                          >
                            Upload
                          </Button>
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
                          Slug
                        </label>

                        <Input
                          placeholder="contoh: bootcamp-uiux-2025"
                          value={addFormData.slug ?? ""}
                          onChange={(e) => {
                            let value = e.target.value.toLowerCase();

                            // 🔥 filter hanya a-z 0-9 dan -
                            value = value.replace(/[^a-z0-9-]/g, "");

                            setAddFormData((prev) => ({
                              ...prev,
                              slug: value,
                            }));
                          }}
                        />

                        <p className="text-[10px] text-gray-500 mt-1">
                          Hanya huruf kecil, angka, dan tanda strip (-). Tanpa
                          spasi.
                        </p>
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

                      {/* Whatsapp Group */}
                      <div>
                        <label className="text-xs font-semibold text-gray-900 block mb-1">
                          Whatsapp Group
                        </label>

                        <Input
                          placeholder="Contoh: https://chat.whatsapp.com/xxxxx"
                          value={addFormData.whatsappGroup ?? ""}
                          onChange={(e) =>
                            setAddFormData((prev) => ({
                              ...prev,
                              whatsappGroup: e.target.value,
                            }))
                          }
                        />

                        <p className="text-[10px] text-gray-500 mt-1">
                          Link grup WhatsApp untuk peserta mentoring.
                        </p>
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
                      Deskripsi Produk
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
                    <div className="space-y-3">
                      {/* Max Participants */}
                      <div>
                        <label className="text-xs font-semibold text-gray-900 block mb-1">
                          Jumlah Maksimal Peserta
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

                      {/* Start Date & End Date */}
                      <div>
                        <label className="text-xs font-semibold text-gray-900 block mb-1">
                          Tanggal Mulai Ditampilkan
                        </label>
                        <Input
                          type="date"
                          value={addFormData.startDate ?? ""}
                          onChange={(e) =>
                            setAddFormData((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-900 block mb-1">
                          Tanggal Akhir Ditampilkan
                        </label>
                        <Input
                          type="date"
                          value={addFormData.endDate ?? ""}
                          min={addFormData.startDate ?? ""}
                          onChange={(e) =>
                            setAddFormData((prev) => ({
                              ...prev,
                              endDate: e.target.value,
                            }))
                          }
                        />
                        {addFormData.startDate &&
                          addFormData.endDate &&
                          calculatedDays > 0 && (
                            <p className="text-xs text-emerald-600 mt-1">
                              Durasi otomatis: <b>{calculatedDays} hari</b>
                            </p>
                          )}
                        {addFormData.startDate &&
                          addFormData.endDate &&
                          calculatedDays <= 0 && (
                            <p className="text-xs text-red-500 mt-1">
                              End Date harus setelah Start Date
                            </p>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Category */}
                  {addFormData.kategori === "Mentoring" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-900 block mb-1">
                        Category
                      </label>
                      <Select
                        value={addFormData.category ?? ""}
                        onValueChange={(value) =>
                          setAddFormData((prev) => ({
                            ...prev,
                            category: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs h-8">
                          <SelectValue placeholder="Pilih category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Machine Learning">
                            Machine Learning
                          </SelectItem>
                          <SelectItem value="Data Analyst">
                            Data Analyst
                          </SelectItem>
                          <SelectItem value="Data Scientist">
                            Data Scientist
                          </SelectItem>
                          <SelectItem value="Data Engineer">
                            Data Engineer
                          </SelectItem>
                          <SelectItem value="MLOps Engineer">
                            MLOps Engineer
                          </SelectItem>
                          <SelectItem value="Analytics Engineer">
                            Analytics Engineer
                          </SelectItem>
                          <SelectItem value="AI Engineer">
                            AI Engineer
                          </SelectItem>
                          <SelectItem value="Data Architect">
                            Data Architect
                          </SelectItem>
                          <SelectItem value="Business Intelligence (BI) Developer">
                            Business Intelligence (BI) Developer
                          </SelectItem>
                          <SelectItem value="Data Governance & Privacy Specialist">
                            Data Governance &amp; Privacy Specialist
                          </SelectItem>
                          <SelectItem value="AI Research Scientist">
                            AI Research Scientist
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Level */}
                  {addFormData.kategori === "Mentoring" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-900 block mb-1">
                        Level
                      </label>
                      <Select
                        value={addFormData.level ?? ""}
                        onValueChange={(value) =>
                          setAddFormData((prev) => ({ ...prev, level: value }))
                        }
                      >
                        <SelectTrigger className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs h-8">
                          <SelectValue placeholder="Pilih level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="Advance">Advance</SelectItem>
                          <SelectItem value="Professional">
                            Professional
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
                        setAddFormData({
                          ...addFormData,
                          harga: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Harga Coret */}
                  {addFormData.kategori === "Mentoring" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-900 block mb-1">
                        Harga Coret / Strike Price
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

                  {addFormData.kategori === "Mentoring" && (
                    <div className="space-y-4 pt-3 border-t">
                      <h3 className="text-xs font-bold text-emerald-700">
                        Detail Mentoring
                      </h3>

                      {/* ── Total Weeks & Total Projects ── */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <EditField label="Total Minggu Pelaksanaan">
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
                        <EditField label="Total Proyek di Bootcamp">
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
                      <EditField label="Program Tentang Apa?">
                        <textarea
                          rows={3}
                          placeholder="Deskripsi Detail tentang program ini"
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
                            label: "Benefit Program",
                            placeholder: {
                              title: "Contoh: Kuasai UI/UX",
                              desc: "Contoh: Peserta mampu membuat desain profesional",
                            },
                          },
                          {
                            key: "mechanisms" as const,
                            label: "Mekanisme Program",
                            placeholder: {
                              title: "Contoh: Live Session",
                              desc: "Contoh: Sesi live 2x seminggu bersama mentor",
                            },
                          },
                          {
                            key: "syllabuses" as const,
                            label: "Silabus Program",
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
                            <ToolSelect
                              value={tool.name}
                              onChange={(val) =>
                                setAddFormData((prev) => ({
                                  ...prev,
                                  tools: (prev.tools ?? []).map((t, i) =>
                                    i === idx ? { name: val } : t,
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
                                  schedules: (prev.schedules ?? []).map(
                                    (s, i) =>
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
                            <textarea
                              rows={2}
                              placeholder="Deskripsi"
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
                                  {
                                    name: "",
                                    role: "",
                                    comment: "",
                                    rating: 5,
                                  },
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
                              placeholder="Role / Jabatan"
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
            <div className="flex space-x-3 pt-3 border-t px-6 pb-5">
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
          </div>
          {/* ── END ADD FORM MODAL ── */}

          {/* ── PREVIEW PANEL ── */}
          {showPreviewDialog && addFormData.kategori === "Mentoring" && (
            <div className="bg-white rounded-xl shadow-xl flex flex-col w-[560px] max-h-[88vh] overflow-hidden min-w-0">
              {/* Preview Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50 rounded-t-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-800">
                      Preview Publik
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium whitespace-nowrap">
                      Live Preview
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Tampilan ini diperbarui otomatis saat kamu mengisi form
                  </p>
                </div>
              </div>

              {/* Scrollable preview content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 min-w-0">
                <BootcampPreviewModal
                  data={{
                    nama: addFormData.nama,
                    foto: addFormData.foto,
                    level: addFormData.level,
                    category: addFormData.category,
                    deskripsi: addFormData.deskripsi,
                    harga: addFormData.harga,
                    strikePrice: addFormData.strikePrice,
                    totalWeeks: addFormData.totalWeeks,
                    totalProjects: addFormData.totalProjects,
                    programAbout: addFormData.programAbout,
                    benefits: addFormData.benefits,
                    mechanisms: addFormData.mechanisms,
                    syllabuses: addFormData.syllabuses,
                    targets: addFormData.targets,
                    tools: addFormData.tools,
                    schedules: addFormData.schedules,
                    portfolios: addFormData.portfolios,
                    testimonials: addFormData.testimonials,
                  }}
                />
              </div>
            </div>
          )}
          {/* ── END PREVIEW PANEL ── */}
        </div>
        {/* end side-by-side wrapper */}
      </div>
      {/* end Add Dialog + Preview wrapper */}
    </>
  );
}
