"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Search,
  Trash,
  Plus,
  Upload,
} from "lucide-react";
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
import Image from "next/image";
import { MentorOption } from "@/types/mentor";
import BootcampPreviewModal, { PreviewData } from "./BootcampPreviewModal";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  mentorOptions: MentorOption[];
  onRefresh?: () => void;
}

type EditFieldProps = {
  label: string;
  children: React.ReactNode;
};

// ── font xs agar tidak zoom-in ──
const EditField = ({ label, children }: EditFieldProps) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-600 block">{label}</label>
    {children}
  </div>
);

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

export function DataTable<TData extends Project, TValue>({
  columns,
  data,
  mentorOptions,
  onRefresh,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedProduct, setSelectedProject] = React.useState<Project | null>(
    null,
  );
  const [detailTab, setDetailTab] = React.useState(1);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);

  // ── state untuk data lengkap hasil fetch API (khusus Mentoring) ──────
  const [detailApiData, setDetailApiData] = React.useState<any | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setDetailTab(1);
    setDetailApiData(null);
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    kategori: "Mentoring" | "E-Learning";
  } | null>(null);

  const handleDelete = (id?: string) => {
    if (!id || !selectedProduct) return;
    setDeleteTarget({
      id,
      kategori: selectedProduct.kategori as "Mentoring" | "E-Learning",
    });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.kategori === "Mentoring") {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/admin/mentoring-services/${deleteTarget.id}`,
          { withCredentials: true },
        );
      } else {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningCourse/courses/${deleteTarget.id}`,
          { withCredentials: true },
        );
      }
      toast.success("Produk berhasil dihapus");
      setIsDeleteDialogOpen(false);
      setIsDetailDialogOpen(false);
      setDeleteTarget(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus produk");
    }
  };

  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showEditPreview, setShowEditPreview] = React.useState(false);
  const [editStep, setEditStep] = React.useState(1);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  type Kategori = "Mentoring" | "E-Learning";
  type TipeMentoring =
    | "Bootcamp"
    | "Short Class"
    | "Live Class"
    | "1 on 1 Mentoring"
    | "Group Mentoring"
    | "";

  // ── Section item types ──────────────────────────────────────────────────
  type SectionItem = { id?: string; title: string; description: string };
  type ToolItem = { id?: string; name: string };
  type ScheduleItem = { id?: string; date: string };
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

  type EditFormData = {
    id: string;
    nama: string;
    kategori: Kategori;
    tipeMentoring: TipeMentoring;
    foto: File | null;
    deskripsi: string;
    harga: string;
    strikePrice: string;
    status: string;

    // mentor
    mentorIds?: string[];
    mentorId?: string;

    maxParticipants?: string;
    durationDays?: string;
    startDate?: string;
    endDate?: string;

    diskonTipe: string;
    diskon: number;
    hargaDiskon: string;

    // 🟢 MENTORING — simple fields
    slug?: string;
    isFeatured?: boolean;
    whatsappGroup?: string;
    programAbout?: string;
    totalWeeks?: string;
    totalProjects?: string;
    category?: string;
    level?: string;

    // 🟢 MENTORING — sections (split by type)
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
    estimatedDuration?: string;
    tags?: string[];
  };

  const initialEditFormData: EditFormData = {
    id: "",
    nama: "",
    kategori: "Mentoring",
    tipeMentoring: "",
    foto: null,
    deskripsi: "",
    harga: "",
    strikePrice: "",
    status: "Aktif",
    mentorIds: [],
    mentorId: "",
    maxParticipants: "",
    durationDays: "",
    startDate: "",
    endDate: "",
    diskonTipe: "persentase",
    diskon: 0,
    hargaDiskon: "",
    slug: "",
    isFeatured: false,
    whatsappGroup: "",
    programAbout: "",
    totalWeeks: "",
    totalProjects: "",
    category: "",
    level: "",
    benefits: [],
    mechanisms: [],
    syllabuses: [],
    targets: [],
    tools: [],
    schedules: [],
    portfolios: [],
    testimonials: [],
    estimatedDuration: "",
    tags: [],
  };

  const [editFormData, setEditFormData] =
    useState<EditFormData>(initialEditFormData);
  const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState("");

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setShowEditPreview(false);
    setEditStep(1);
  };

  const handleEditNextStep = () => {
    if (editStep < 2) setEditStep(editStep + 1);
  };

  const handleEditPrevStep = () => {
    if (editStep > 1) setEditStep(editStep - 1);
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const toBooleanStatus = (status: string) => status === "Aktif";

  // ── ToolSelect component ────────────────────────────────────────────────
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
                  e.preventDefault();
                  onChange(tool);
                  setQuery(tool);
                  setOpen(false);
                }}
                className="px-3 py-2 text-xs hover:bg-emerald-50 cursor-pointer"
              >
                {tool}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── handleSaveEdit ──────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    try {
      if (!editFormData.id) {
        toast.error("ID produk tidak ditemukan");
        return;
      }

      // ============================
      // 🟢 MENTORING
      // ============================
      if (editFormData.kategori === "Mentoring") {
        const sections = [
          ...(editFormData.benefits ?? []).map((item) => ({
            id: item.id,
            type: "BENEFIT",
            title: item.title,
            description: item.description,
          })),
          ...(editFormData.mechanisms ?? []).map((item) => ({
            id: item.id,
            type: "MECHANISM",
            title: item.title,
            description: item.description,
          })),
          ...(editFormData.syllabuses ?? []).map((item) => ({
            id: item.id,
            type: "SYLLABUS",
            title: item.title,
            description: item.description,
          })),
          ...(editFormData.targets ?? []).map((item) => ({
            id: item.id,
            type: "TARGET",
            title: item.title,
            description: item.description,
          })),
        ];

        // tools: { id?, name }[] sesuai validator update backend
        const tools = (editFormData.tools ?? []).map((t) => ({
          id: t.id,
          name: t.name,
        }));

        // schedules: { id?, date }[] sesuai validator update backend
        const schedules = (editFormData.schedules ?? [])
          .filter((s) => s.date)
          .map((s) => ({
            id: s.id,
            date: new Date(s.date).toISOString(),
          }));

        const portfolios = (editFormData.portfolios ?? []).map((p) => ({
          title: p.title,
          description: p.description,
          menteeName: p.menteeName,
          projectLink: p.projectLink,
        }));

        const testimonials = (editFormData.testimonials ?? []).map((t) => ({
          name: t.name,
          role: t.role || undefined,
          comment: t.comment,
          rating: t.rating,
        }));

        const jsonPayload = {
          serviceName: editFormData.nama,
          description: editFormData.deskripsi,
          price: Number(editFormData.harga),
          strikePrice: editFormData.strikePrice
            ? Number(editFormData.strikePrice)
            : undefined,
          maxParticipants: editFormData.maxParticipants
            ? Number(editFormData.maxParticipants)
            : undefined,
          durationDays: editFormData.durationDays
            ? Number(editFormData.durationDays)
            : undefined,
          startDate: editFormData.startDate
            ? editFormData.startDate
            : undefined,
          endDate: editFormData.endDate ? editFormData.endDate : undefined,
          isActive: toBooleanStatus(editFormData.status),
          slug: editFormData.slug ?? undefined,
          isFeatured: editFormData.isFeatured ?? false,
          whatsappGroup: editFormData.whatsappGroup
            ? editFormData.whatsappGroup
            : undefined,
          programAbout: editFormData.programAbout ?? undefined,
          totalWeeks: editFormData.totalWeeks
            ? Number(editFormData.totalWeeks)
            : undefined,
          totalProjects: editFormData.totalProjects
            ? Number(editFormData.totalProjects)
            : undefined,
          category: editFormData.category ?? undefined,
          level: editFormData.level ?? undefined,
          mentorProfileIds: selectedMentorIds,
          sections,
          tools,
          schedules,
          portfolios,
          testimonials,
        };

        // hapus undefined dari top-level
        Object.keys(jsonPayload).forEach(
          (key) =>
            (jsonPayload as any)[key] === undefined &&
            delete (jsonPayload as any)[key],
        );

        // hapus id: undefined dari nested array items agar tidak dikirim
        const cleanArrayItem = (item: Record<string, any>) => {
          const clean = { ...item };
          if (clean.id === undefined) delete clean.id;
          return clean;
        };
        (jsonPayload as any).sections = sections.map(cleanArrayItem);
        (jsonPayload as any).tools = tools.map(cleanArrayItem);
        (jsonPayload as any).schedules = schedules.map(cleanArrayItem);

        await axios.patch(
          `${API_BASE}/api/mentorService/admin/mentoring-services/${editFormData.id}`,
          jsonPayload,
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          },
        );

        // upload thumbnail jika ada foto baru
        if (editFormData.foto) {
          const thumbForm = new FormData();
          thumbForm.append("thumbnail", editFormData.foto);
          thumbForm.append("serviceType", "bootcamp");
          await axios.patch(
            `${API_BASE}/api/mentorService/admin/mentoring-services/${editFormData.id}`,
            thumbForm,
            {
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" },
            },
          );
        }

        toast.success("Mentoring berhasil diperbarui");
      }

      // ============================
      // 🔵 E-LEARNING
      // ============================
      if (editFormData.kategori === "E-Learning") {
        const formData = new FormData();
        formData.append("title", editFormData.nama);
        formData.append("description", editFormData.deskripsi);
        formData.append("price", editFormData.harga);
        formData.append("category", editFormData.category || "");
        formData.append("level", editFormData.level || "");
        formData.append(
          "estimatedDuration",
          editFormData.estimatedDuration || "",
        );
        formData.append(
          "isActive",
          String(toBooleanStatus(editFormData.status)),
        );
        if (selectedMentorId) formData.append("mentorId", selectedMentorId);
        (editFormData.tags ?? []).forEach((tag) =>
          formData.append("tags[]", tag),
        );
        if (editFormData.foto)
          formData.append("thumbnailImages", editFormData.foto);

        await axios.put(
          `${API_BASE}/api/elearningCourse/courses/${editFormData.id}`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        toast.success("E-Learning berhasil diperbarui");
      }

      setShowEditDialog(false);
      setEditStep(1);
      onRefresh?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Gagal menyimpan perubahan");
    }
  };

  // ── fetch detail mentoring by ID untuk prefill edit form ────────────────
  const fetchAndPopulateEditForm = async (product: Project) => {
    setPreviewFoto(product.foto);
    setSelectedMentorIds(product.mentorIds || []);
    setSelectedMentorId(product.mentorId || "");
    setEditStep(1);

    if (product.kategori !== "Mentoring") {
      // E-Learning: langsung dari project data
      setEditFormData({
        id: product.id,
        nama: product.nama,
        kategori: product.kategori as Kategori,
        tipeMentoring: "",
        foto: null,
        deskripsi: product.deskripsi,
        harga: product.harga.toString(),
        strikePrice: "",
        status: product.status,
        mentorIds: [],
        mentorId: product.mentorId || "",
        maxParticipants: "",
        durationDays: "",
        diskonTipe: product.diskonTipe ?? "persentase",
        diskon: product.diskon ?? 0,
        hargaDiskon: product.hargaDiskon ?? "",
        slug: "",
        isFeatured: false,
        programAbout: "",
        totalWeeks: "",
        totalProjects: "",
        category: product.category ?? "",
        level: product.level ?? "",
        benefits: [],
        mechanisms: [],
        syllabuses: [],
        targets: [],
        tools: [],
        schedules: [],
        portfolios: [],
        testimonials: [],
        estimatedDuration: product.estimatedDuration ?? "",
        tags: product.tags ?? [],
      });
      return;
    }

    // Mentoring: fetch detail dari API untuk dapat sections, tools, schedules, portfolios, testimonials
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/admin/mentoring-services/${product.id}`,
        { withCredentials: true },
      );
      const d = res.data.data;

      const sections: any[] = d.sections ?? [];
      const benefits: SectionItem[] = sections
        .filter((s: any) => s.type === "BENEFIT")
        .map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description ?? "",
        }));
      const mechanisms: SectionItem[] = sections
        .filter((s: any) => s.type === "MECHANISM")
        .map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description ?? "",
        }));
      const syllabuses: SectionItem[] = sections
        .filter((s: any) => s.type === "SYLLABUS")
        .map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description ?? "",
        }));
      const targets: SectionItem[] = sections
        .filter((s: any) => s.type === "TARGET")
        .map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description ?? "",
        }));

      const tools: ToolItem[] = (d.tools ?? []).map((t: any) => ({
        id: t.id,
        name: t.name,
      }));
      const schedules: ScheduleItem[] = (d.schedules ?? []).map((s: any) => ({
        id: s.id,
        date: s.date ? new Date(s.date).toISOString().split("T")[0] : "",
      }));
      const portfolios: PortfolioItem[] = (d.portfolios ?? []).map(
        (p: any) => ({
          title: p.title ?? "",
          description: p.description ?? "",
          menteeName: p.menteeName ?? "",
          projectLink: p.projectLink ?? "",
        }),
      );
      const testimonials: TestimonialItem[] = (d.testimonials ?? []).map(
        (t: any) => ({
          name: t.name ?? "",
          role: t.role ?? "",
          comment: t.comment ?? "",
          rating: t.rating ?? 5,
        }),
      );

      setSelectedMentorIds(
        (d.mentors ?? []).map((m: any) => m.mentorProfileId),
      );

      setEditFormData({
        id: product.id,
        nama: d.serviceName ?? product.nama,
        kategori: "Mentoring",
        tipeMentoring: (product.tipeMentoring ?? "") as TipeMentoring,
        foto: null,
        deskripsi: d.description ?? product.deskripsi,
        harga: d.price != null ? String(d.price) : product.harga.toString(),
        strikePrice: d.strikePrice != null ? String(d.strikePrice) : "",
        status: d.isActive ? "Aktif" : "Non Aktif",
        mentorIds: (d.mentors ?? []).map((m: any) => m.mentorProfileId),
        mentorId: "",
        maxParticipants:
          d.maxParticipants != null ? String(d.maxParticipants) : "",
        durationDays: d.durationDays != null ? String(d.durationDays) : "",
        startDate: d.startDate
          ? new Date(d.startDate).toISOString().split("T")[0]
          : "",
        endDate: d.endDate
          ? new Date(d.endDate).toISOString().split("T")[0]
          : "",
        diskonTipe: "persentase",
        diskon: 0,
        hargaDiskon: "",
        slug: d.slug ?? "",
        isFeatured: d.isFeatured ?? false,
        whatsappGroup: d.whatsappGroup ?? "",
        programAbout: d.programAbout ?? "",
        totalWeeks: d.totalWeeks != null ? String(d.totalWeeks) : "",
        totalProjects: d.totalProjects != null ? String(d.totalProjects) : "",
        category: d.category ?? "",
        level: d.level ?? "",
        benefits,
        mechanisms,
        syllabuses,
        targets,
        tools,
        schedules,
        portfolios,
        testimonials,
        estimatedDuration: "",
        tags: [],
      });

      // Set preview foto dengan URL statis dari API jika ada thumbnail
      if (d.thumbnail) {
        setPreviewFoto(`${process.env.NEXT_PUBLIC_API_BASE_URL}${d.thumbnail}`);
      } else {
        setPreviewFoto(null);
      }
    } catch (err) {
      console.error("Gagal fetch detail mentoring untuk edit:", err);
      toast.error("Gagal memuat detail produk untuk diedit");
    }
  };

  // ── fetchAndPopulateDetailData ─────────────────────────────
  const fetchAndPopulateDetailData = async (product: Project) => {
    setDetailApiData(null);
    setDetailTab(1);

    if (product.kategori !== "Mentoring") {
      // E-Learning: data sudah cukup dari selectedProduct
      setDetailApiData(null);
      return;
    }

    // Mentoring: fetch dari API untuk dapat data lengkap
    try {
      setDetailLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorService/admin/mentoring-services/${product.id}`,
        { withCredentials: true },
      );
      const d = res.data.data;

      const sections: any[] = d.sections ?? [];
      const benefits = sections
        .filter((s: any) => s.type === "BENEFIT")
        .map((s: any) => ({
          title: s.title,
          description: s.description ?? "",
        }));
      const mechanisms = sections
        .filter((s: any) => s.type === "MECHANISM")
        .map((s: any) => ({
          title: s.title,
          description: s.description ?? "",
        }));
      const syllabuses = sections
        .filter((s: any) => s.type === "SYLLABUS")
        .map((s: any) => ({
          title: s.title,
          description: s.description ?? "",
        }));
      const targets = sections
        .filter((s: any) => s.type === "TARGET")
        .map((s: any) => ({
          title: s.title,
          description: s.description ?? "",
        }));

      setDetailApiData({
        id: d.id,
        serviceName: d.serviceName,
        description: d.description,
        thumbnail: d.thumbnail,
        price: d.price,
        strikePrice: d.strikePrice,
        serviceType: d.serviceType,
        maxParticipants: d.maxParticipants,
        durationDays: d.durationDays,
        startDate: d.startDate ?? null,
        endDate: d.endDate ?? null,
        programAbout: d.programAbout,
        totalWeeks: d.totalWeeks,
        totalProjects: d.totalProjects,
        whatsappGroup: d.whatsappGroup ?? null,
        slug: d.slug,
        isFeatured: d.isFeatured,
        category: d.category,
        level: d.level,
        isActive: d.isActive,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        benefits,
        mechanisms,
        syllabuses,
        targets,
        tools: (d.tools ?? []).map((t: any) => ({ name: t.name })),
        schedules: (d.schedules ?? []).map((s: any) => ({
          date: s.date ? new Date(s.date).toISOString().split("T")[0] : "",
        })),
        portfolios: (d.portfolios ?? []).map((p: any) => ({
          title: p.title ?? "",
          description: p.description ?? "",
          menteeName: p.menteeName ?? "",
          projectLink: p.projectLink ?? "",
        })),
        testimonials: (d.testimonials ?? []).map((t: any) => ({
          name: t.name ?? "",
          role: t.role ?? "",
          comment: t.comment ?? "",
          rating: t.rating ?? 5,
        })),
        mentors: (d.mentors ?? []).map((m: any) => ({
          mentorProfileId: m.mentorProfileId,
          name: m.user?.fullName ?? "-",
        })),
      });
    } catch (err) {
      console.error("Gagal fetch detail mentoring:", err);
      toast.error("Gagal memuat detail produk");
    } finally {
      setDetailLoading(false);
    }
  };

  // ── table setup ─────────────────────────────────────────────────────────
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);
  const totalPages = table.getPageCount();

  // ── DetailItem helper ───────────────────────────────────────────────────
  const DetailItem = ({ label, value }: { label: string; value?: string }) => (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1">
        {label}
      </label>
      <p className="text-xs font-medium text-gray-900">
        {value && value !== "-" ? value : "-"}
      </p>
    </div>
  );

  const getFileNameFromUrl = (url?: string | null) => {
    if (!url) return "";
    try {
      return decodeURIComponent(url.split("/").pop() || "");
    } catch {
      return "";
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // EDIT DIALOG — struktur sama persis dengan Add Modal di page.tsx
  // ════════════════════════════════════════════════════════════════════════
  const EditDialog = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${showEditDialog ? "" : "hidden"}`}
      aria-hidden={!showEditDialog}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Side-by-side wrapper */}
      <div className="relative z-10 flex items-start gap-3 max-w-[95vw]">
        {/* ── EDIT FORM MODAL ── */}
        <div className="bg-white rounded-xl shadow-xl flex flex-col w-[520px] max-h-[88vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            <h2 className="text-sm font-semibold text-gray-800">
              Edit Produk / Event
            </h2>
            <div className="flex items-center gap-2">
              {editFormData.kategori === "Mentoring" && (
                <button
                  type="button"
                  onClick={() => setShowEditPreview((v) => !v)}
                  className={`text-[10px] px-2.5 py-1 rounded border font-medium transition ${
                    showEditPreview
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {showEditPreview ? "Sembunyikan Preview" : "Lihat Preview"}
                </button>
              )}
              <button
                type="button"
                onClick={handleCloseEditDialog}
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
              {/* Step 1 */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs ${
                    editStep >= 1
                      ? "bg-[#0CA678] text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  1
                </div>
                <span
                  className={`text-xs font-semibold ${
                    editStep === 1 ? "text-[#0CA678]" : "text-gray-400"
                  }`}
                >
                  Informasi Dasar
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs ${
                    editStep >= 2
                      ? "bg-[#0CA678] text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-xs font-semibold ${
                    editStep === 2 ? "text-[#0CA678]" : "text-gray-400"
                  }`}
                >
                  Deskripsi &amp; Harga
                </span>
              </div>
            </div>

            {/* Garis pemisah bawah */}
            <div className="border-b pb-2 mt-2" />
          </div>

          {/* Form Content (scrollable) */}
          <div
            ref={scrollRef}
            className="space-y-3 max-h-[440px] overflow-y-auto pr-2 py-2 px-6"
          >
            {editStep === 1 ? (
              <>
                {/* ── Foto ── */}
                <div>
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
                    Foto Produk Atau Event
                  </label>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {previewFoto || editFormData.foto ? (
                      <>
                        <img
                          src={
                            editFormData.foto
                              ? URL.createObjectURL(editFormData.foto)
                              : previewFoto!
                          }
                          alt="Preview"
                          className="mx-auto mb-3 w-full h-48 object-cover rounded-lg shadow"
                        />
                        <p className="text-xs text-gray-500 mb-2 truncate max-w-xs mx-auto">
                          {editFormData.foto?.name ||
                            getFileNameFromUrl(previewFoto) ||
                            "foto_produk.jpg"}
                        </p>
                        <div className="flex justify-center gap-2">
                          <label className="bg-[#0CA678] hover:bg-[#08916C] text-white text-xs px-3 py-1.5 rounded cursor-pointer">
                            Ubah Foto
                            <input
                              type="file"
                              accept="image/png, image/jpeg"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setEditFormData((prev) => ({
                                  ...prev,
                                  foto: file,
                                }));
                                if (file)
                                  setPreviewFoto(URL.createObjectURL(file));
                              }}
                            />
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-red-400 text-red-500 hover:bg-red-50 hover:text-red-700 text-xs h-7 px-3 gap-1"
                            onClick={() => {
                              setEditFormData((prev) => ({
                                ...prev,
                                foto: null,
                              }));
                              setPreviewFoto(null);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus Foto
                          </Button>
                        </div>
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
                            document.getElementById("editFileUpload")?.click()
                          }
                        >
                          Upload
                        </Button>
                      </>
                    )}
                    <input
                      id="editFileUpload"
                      type="file"
                      accept="image/png, image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setEditFormData((prev) => ({ ...prev, foto: file }));
                        if (file) setPreviewFoto(URL.createObjectURL(file));
                      }}
                    />
                  </div>
                </div>

                {/* ── Nama ── */}
                <div>
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
                    Nama Produk
                  </label>
                  <Input
                    placeholder="Contoh: Bootcamp UI/UX"
                    value={editFormData.nama}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, nama: e.target.value })
                    }
                  />
                </div>

                {/* ── Kategori ── */}
                <div>
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
                    Kategori
                  </label>
                  <Select
                    value={editFormData.kategori}
                    onValueChange={(value) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        kategori: value as Kategori,
                        tipeMentoring:
                          value === "Mentoring" ? prev.tipeMentoring : "",
                      }))
                    }
                  >
                    <SelectTrigger className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs h-8">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mentoring">Mentoring</SelectItem>
                      <SelectItem value="E-Learning">E-Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* ── Tipe Mentoring ── */}
                {editFormData.kategori === "Mentoring" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-900 block mb-1">
                      Tipe Mentoring
                    </label>
                    <Select
                      value={editFormData.tipeMentoring}
                      onValueChange={(value) =>
                        setEditFormData({
                          ...editFormData,
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

                {/* ── Slug + isFeatured ── */}
                {editFormData.kategori === "Mentoring" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-900 block mb-1">
                        Slug
                      </label>
                      <Input
                        placeholder="contoh: bootcamp-uiux-2025"
                        value={editFormData.slug ?? ""}
                        onChange={(e) => {
                          let value = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "");
                          setEditFormData((prev) => ({ ...prev, slug: value }));
                        }}
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        Hanya huruf kecil, angka, dan tanda strip (-). Tanpa
                        spasi.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-900 block mb-1">
                        Is Featured
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="editIsFeatured"
                          checked={editFormData.isFeatured ?? false}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              isFeatured: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 accent-emerald-600"
                        />
                        <label
                          htmlFor="editIsFeatured"
                          className="text-xs text-gray-700 cursor-pointer"
                        >
                          Tampilkan sebagai featured
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-900 block mb-1">
                        WhatsApp Group
                      </label>
                      <Input
                        placeholder="Contoh: https://chat.whatsapp.com/..."
                        value={editFormData.whatsappGroup ?? ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            whatsappGroup: e.target.value,
                          }))
                        }
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        Link grup WhatsApp untuk peserta program ini.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Pilih Mentor (Mentoring multi) ── */}
                {editFormData.kategori === "Mentoring" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-900 block mb-1">
                      Pilih Mentor (bisa lebih dari 1)
                    </label>
                    <div
                      className={`border rounded-lg p-2 space-y-1 ${
                        mentorOptions.length > 6
                          ? "max-h-[160px] overflow-y-auto"
                          : ""
                      }`}
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
                              onChange={() =>
                                setSelectedMentorIds((prev) =>
                                  checked
                                    ? prev.filter((id) => id !== mentor.id)
                                    : [...prev, mentor.id],
                                )
                              }
                            />
                            {mentor.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Pilih Mentor (E-Learning single) ── */}
                {editFormData.kategori === "E-Learning" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-900 block mb-1">
                      Pilih Mentor
                    </label>
                    <Select
                      value={selectedMentorId}
                      onValueChange={setSelectedMentorId}
                    >
                      <SelectTrigger className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs h-8">
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

                {/* ── Max Participants + Start Date + End Date (Mentoring) ── */}
                {editFormData.kategori === "Mentoring" && (
                  <div className="space-y-2">
                    <EditField label="Max Participants">
                      <Input
                        type="number"
                        min={1}
                        placeholder="Contoh: 20"
                        value={editFormData.maxParticipants ?? ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            maxParticipants: e.target.value,
                          }))
                        }
                      />
                    </EditField>
                    <EditField label="Start Date">
                      <Input
                        type="date"
                        value={editFormData.startDate ?? ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                      />
                    </EditField>
                    <EditField label="End Date">
                      <Input
                        type="date"
                        value={editFormData.endDate ?? ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                      />
                    </EditField>
                  </div>
                )}

                {/* ── Category ── */}
                {editFormData.kategori === "Mentoring" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-900 block mb-1">
                      Category
                    </label>
                    <Select
                      value={editFormData.category ?? ""}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({
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
                        <SelectItem value="AI Engineer">AI Engineer</SelectItem>
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

                {/* ── Level ── */}
                {editFormData.kategori === "Mentoring" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-900 block mb-1">
                      Level
                    </label>
                    <Select
                      value={editFormData.level ?? ""}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, level: value }))
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

                {/* ── Harga ── */}
                <div>
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
                    Harga
                  </label>
                  <Input
                    placeholder="Contoh: 250000"
                    value={editFormData.harga}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        harga: e.target.value,
                      })
                    }
                  />
                </div>

                {/* ── Harga Coret ── */}
                {editFormData.kategori === "Mentoring" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-900 block mb-1">
                      Harga Coret / Strike Price
                    </label>
                    <Input
                      type="number"
                      placeholder="Contoh: 3000000"
                      value={editFormData.strikePrice ?? ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          strikePrice: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                {/* ── Status ── */}
                <div>
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
                    Status
                  </label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, status: value })
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
              </>
            ) : (
              <>
                {/* ═══════════════════════════════════════
                  STEP 2
              ═══════════════════════════════════════ */}

                {/* ── Deskripsi ── */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-900 block mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                    placeholder="Masukkan deskripsi produk"
                    value={editFormData.deskripsi}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        deskripsi: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* ── E-LEARNING only fields ── */}
                {editFormData.kategori === "E-Learning" && (
                  <div className="space-y-3 pt-3 border-t">
                    <h3 className="text-xs font-bold text-emerald-700">
                      Detail E-Learning
                    </h3>

                    <div>
                      <label className="text-xs font-semibold text-gray-900 block mb-1">
                        Category
                      </label>
                      <Select
                        value={editFormData.category ?? ""}
                        onValueChange={(value) =>
                          setEditFormData((prev) => ({
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
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-900 block mb-1">
                        Level
                      </label>
                      <Select
                        value={editFormData.level ?? ""}
                        onValueChange={(value) =>
                          setEditFormData((prev) => ({ ...prev, level: value }))
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

                    <EditField label="Estimated Duration">
                      <Input
                        placeholder="Contoh: 10 Jam"
                        value={editFormData.estimatedDuration ?? ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            estimatedDuration: e.target.value,
                          }))
                        }
                      />
                    </EditField>

                    {/* Tags */}
                    <EditField label="Tags">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(editFormData.tags ?? []).map((tag, idx) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  tags: prev.tags?.filter((_, i) => i !== idx),
                                }))
                              }
                              className="font-bold"
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
                            const value = (
                              e.target as HTMLInputElement
                            ).value.trim();
                            if (!value) return;
                            setEditFormData((prev) => ({
                              ...prev,
                              tags: prev.tags?.includes(value)
                                ? prev.tags
                                : [...(prev.tags ?? []), value],
                            }));
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                    </EditField>
                  </div>
                )}

                {/* ── MENTORING step 2 detail ── */}
                {editFormData.kategori === "Mentoring" && (
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
                          value={editFormData.totalWeeks ?? ""}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
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
                          value={editFormData.totalProjects ?? ""}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
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
                        value={editFormData.programAbout ?? ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            programAbout: e.target.value,
                          }))
                        }
                      />
                    </EditField>

                    {/* ════════════════════════════════════════
                      SECTIONS — 4 types
                  ════════════════════════════════════════ */}
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
                              setEditFormData((prev) => ({
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
                        {(editFormData[key] ?? []).map((item, idx) => (
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
                                  setEditFormData((prev) => ({
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
                                setEditFormData((prev) => ({
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
                                setEditFormData((prev) => ({
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
                            setEditFormData((prev) => ({
                              ...prev,
                              tools: [...(prev.tools ?? []), { name: "" }],
                            }))
                          }
                          className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Tambah Tool
                        </button>
                      </div>
                      {(editFormData.tools ?? []).map((tool, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <ToolSelect
                            value={tool.name}
                            onChange={(val) =>
                              setEditFormData((prev) => ({
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
                              setEditFormData((prev) => ({
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
                            setEditFormData((prev) => ({
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
                      {(editFormData.schedules ?? []).map((sched, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={sched.date}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
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
                              setEditFormData((prev) => ({
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
                            setEditFormData((prev) => ({
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
                      {(editFormData.portfolios ?? []).map((p, idx) => (
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
                                setEditFormData((prev) => ({
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
                              setEditFormData((prev) => ({
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
                              setEditFormData((prev) => ({
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
                              setEditFormData((prev) => ({
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
                              setEditFormData((prev) => ({
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
                            setEditFormData((prev) => ({
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
                      {(editFormData.testimonials ?? []).map((t, idx) => (
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
                                setEditFormData((prev) => ({
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
                              setEditFormData((prev) => ({
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
                              setEditFormData((prev) => ({
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
                              setEditFormData((prev) => ({
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
                                setEditFormData((prev) => ({
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
            {editStep === 1 ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1 border-[#0CA678] text-[#0CA678] bg-transparent text-xs h-8"
                  onClick={handleCloseEditDialog}
                >
                  Kembali
                </Button>
                <Button
                  className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white text-xs h-8"
                  onClick={handleEditNextStep}
                >
                  Selanjutnya
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1 border-[#0CA678] text-[#0CA678] bg-transparent text-xs h-8"
                  onClick={handleEditPrevStep}
                >
                  Sebelumnya
                </Button>
                <Button
                  className="flex-1 bg-[#0CA678] hover:bg-[#08916C] text-white text-xs h-8"
                  onClick={handleSaveEdit}
                >
                  Simpan Perubahan
                </Button>
              </>
            )}
          </div>
        </div>
        {/* ── END EDIT FORM MODAL ── */}

        {/* ── PREVIEW PANEL ── */}
        {showEditPreview && editFormData.kategori === "Mentoring" && (
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
                  nama: editFormData.nama,
                  foto: editFormData.foto,
                  fotoUrl: previewFoto ?? undefined,
                  level: editFormData.level,
                  category: editFormData.category,
                  deskripsi: editFormData.deskripsi,
                  harga: editFormData.harga,
                  strikePrice: editFormData.strikePrice,
                  totalWeeks: editFormData.totalWeeks,
                  totalProjects: editFormData.totalProjects,
                  programAbout: editFormData.programAbout,
                  benefits: editFormData.benefits,
                  mechanisms: editFormData.mechanisms,
                  syllabuses: editFormData.syllabuses,
                  targets: editFormData.targets,
                  tools: editFormData.tools,
                  schedules: editFormData.schedules,
                  portfolios: editFormData.portfolios,
                  testimonials: editFormData.testimonials,
                }}
              />
            </div>
          </div>
        )}
        {/* ── END PREVIEW PANEL ── */}
      </div>
      {/* end side-by-side wrapper */}
    </div>
    /* end Edit Dialog + Preview wrapper */
  );

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
            className="pl-10 bg-gray-100 border border-gray-300 focus:border-green-500 focus:ring-green-500 focus-visible:ring-green-500 rounded-lg"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`px-4 py-3 text-sm font-semibold text-gray-700 transition-colors ${
                      header.column.getIsSorted() ? "bg-emerald-200" : ""
                    } ${header.column.getIsFiltered() ? "bg-emerald-100" : ""} ${
                      header.column.getCanSort() || header.column.getCanFilter()
                        ? "cursor-pointer"
                        : ""
                    }`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
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
                        className={`px-4 py-3 align-top break-words whitespace-normal ${
                          isSelectColumn ? "" : "cursor-pointer"
                        }`}
                        onClick={() => {
                          if (!isSelectColumn) {
                            setSelectedProject(row.original);
                            setIsDetailDialogOpen(true);
                            fetchAndPopulateDetailData(row.original);
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
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
                Math.min(totalPages, pageIndex + 3),
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

      {/* Detail Product Dialog */}
      {isDetailDialogOpen && selectedProduct && (
        <Dialog open onOpenChange={setIsDetailDialogOpen}>
          <DialogContent
            className="max-w-2xl p-4 max-h-[88vh] overflow-hidden flex flex-col"
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <div className="flex items-center justify-between pb-2 border-b">
                <DialogTitle className="text-sm font-semibold">
                  Detail Produk & Event
                </DialogTitle>
              </div>
            </DialogHeader>

            {/* Tab Selector */}
            <div className="flex w-full mt-2 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
              <button
                onClick={() => setDetailTab(1)}
                className={`w-1/2 py-3 px-2 text-xs font-semibold leading-normal transition-colors flex items-center justify-center min-h-[44px] ${
                  detailTab === 1
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                Informasi Dasar
              </button>
              <button
                onClick={() => setDetailTab(2)}
                className={`w-1/2 py-3 px-2 text-xs font-semibold leading-normal transition-colors flex items-center justify-center min-h-[44px] ${
                  detailTab === 2
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                Deskripsi & Harga
              </button>
            </div>

            {/* Loading state */}
            {detailLoading && (
              <div className="flex-1 flex items-center justify-center py-8">
                <p className="text-xs text-gray-500">Memuat data...</p>
              </div>
            )}

            {/* Scrollable Content */}
            {!detailLoading && (
              <div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-3">
                {(() => {
                  const isMentoring = selectedProduct.kategori === "Mentoring";
                  const d = isMentoring ? detailApiData : null;

                  const toRupiah = (val?: number | null) =>
                    val != null
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(val)
                      : "-";

                  return (
                    <>
                      {detailTab === 1 && (
                        <>
                          {/* Foto */}
                          <div>
                            <label className="text-xs font-semibold text-gray-900 block mb-1">
                              Foto Produk Atau Event
                            </label>
                            <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                              {(() => {
                                const imgSrc =
                                  isMentoring && d?.thumbnail
                                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${d.thumbnail}`
                                    : selectedProduct.foto &&
                                        selectedProduct.foto !==
                                          "/images/Navbar_logo.png"
                                      ? selectedProduct.foto
                                      : null;
                                return imgSrc ? (
                                  <Image
                                    src={imgSrc}
                                    alt={selectedProduct.nama}
                                    width={400}
                                    height={250}
                                    unoptimized
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">
                                      Product Image
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Nama */}
                          <DetailItem
                            label="Nama Produk"
                            value={
                              isMentoring
                                ? (d?.serviceName ?? selectedProduct.nama)
                                : selectedProduct.nama
                            }
                          />

                          {/* Kategori + Tipe */}
                          <div className="grid grid-cols-2 gap-2">
                            <DetailItem
                              label="Kategori"
                              value={selectedProduct.kategori}
                            />
                            {isMentoring && (
                              <DetailItem
                                label="Tipe Mentoring"
                                value={selectedProduct.tipeMentoring ?? "-"}
                              />
                            )}
                          </div>

                          {/* ID + Tanggal */}
                          <div className="grid grid-cols-2 gap-2">
                            <DetailItem
                              label="ID Produk"
                              value={selectedProduct.id}
                            />
                            <DetailItem
                              label="Tanggal Ditambahkan"
                              value={selectedProduct.tanggalDitambahkan ?? "-"}
                            />
                          </div>

                          {/* MENTORING: Slug + isFeatured (atas mentor) */}
                          {isMentoring && (
                            <div className="space-y-2">
                              <DetailItem label="Slug" value={d?.slug ?? "-"} />
                              <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">
                                  Is Featured
                                </label>
                                <p
                                  className={`text-xs font-semibold ${
                                    d?.isFeatured
                                      ? "text-emerald-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {d?.isFeatured ? "Ya" : "Tidak"}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">
                                  WhatsApp Group
                                </label>
                                {d?.whatsappGroup ? (
                                  <a
                                    href={d.whatsappGroup}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-emerald-600 underline break-all"
                                  >
                                    {d.whatsappGroup}
                                  </a>
                                ) : (
                                  <p className="text-xs font-medium text-gray-900">
                                    -
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Mentor */}
                          <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">
                              Mentor
                            </label>
                            {isMentoring ? (
                              <div className="flex flex-wrap gap-1.5">
                                {isMentoring &&
                                d?.mentors &&
                                d.mentors.length > 0 ? (
                                  d.mentors.map((m: any, i: number) => (
                                    <span
                                      key={i}
                                      className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium"
                                    >
                                      {m.name}
                                    </span>
                                  ))
                                ) : (selectedProduct.mentorNames ?? []).length >
                                  0 ? (
                                  selectedProduct.mentorNames!.map(
                                    (name, idx) => (
                                      <span
                                        key={idx}
                                        className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium"
                                      >
                                        {name}
                                      </span>
                                    ),
                                  )
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    -
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs font-medium text-gray-900">
                                {selectedProduct.mentorName ?? "-"}
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {detailTab === 2 && (
                        <>
                          {/* Deskripsi */}
                          <div>
                            <label className="text-xs font-semibold text-gray-900 block mb-1">
                              Deskripsi
                            </label>
                            <p className="text-xs text-gray-900 leading-relaxed">
                              {isMentoring
                                ? (d?.description ?? selectedProduct.deskripsi)
                                : selectedProduct.deskripsi}
                            </p>
                          </div>

                          {/* Harga + Status */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">
                                Harga
                              </label>
                              <p className="text-xs font-semibold text-gray-900">
                                {isMentoring
                                  ? toRupiah(d?.price)
                                  : selectedProduct.hargaDisplay}
                              </p>
                            </div>
                            {isMentoring && (
                              <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">
                                  Harga Coret
                                </label>
                                <p className="text-xs font-semibold text-gray-400 line-through">
                                  {d?.strikePrice != null
                                    ? toRupiah(Number(d.strikePrice))
                                    : "-"}
                                </p>
                              </div>
                            )}
                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">
                                Status
                              </label>
                              <p
                                className={`text-xs font-semibold ${
                                  selectedProduct.status === "Aktif"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {selectedProduct.status}
                              </p>
                            </div>
                          </div>

                          {/* MENTORING ONLY */}
                          {isMentoring && (
                            <div className="space-y-4 pt-3 border-t">
                              {/* Category + Level + Max Participants + Start/End Date (pindahan dari page 1) */}
                              <DetailItem
                                label="Category"
                                value={d?.category ?? "-"}
                              />
                              <DetailItem
                                label="Level"
                                value={d?.level ?? "-"}
                              />
                              <DetailItem
                                label="Max Participants"
                                value={
                                  d?.maxParticipants != null
                                    ? String(d.maxParticipants)
                                    : "-"
                                }
                              />
                              <DetailItem
                                label="Start Date"
                                value={
                                  d?.startDate
                                    ? new Date(d.startDate).toLocaleDateString(
                                        "id-ID",
                                        {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                        },
                                      )
                                    : "-"
                                }
                              />
                              <DetailItem
                                label="End Date"
                                value={
                                  d?.endDate
                                    ? new Date(d.endDate).toLocaleDateString(
                                        "id-ID",
                                        {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                        },
                                      )
                                    : "-"
                                }
                              />

                              {/* Total Minggu Pelaksanaan (atas-bawah, sebelum Detail Mentoring) */}
                              <DetailItem
                                label="Total Minggu Pelaksanaan"
                                value={
                                  d?.totalWeeks != null
                                    ? String(d.totalWeeks)
                                    : "-"
                                }
                              />

                              {/* Total Proyek (atas-bawah, sebelum Detail Mentoring) */}
                              <DetailItem
                                label="Total Proyek"
                                value={
                                  d?.totalProjects != null
                                    ? String(d.totalProjects)
                                    : "-"
                                }
                              />

                              {/* WhatsApp Group */}
                              <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">
                                  WhatsApp Group
                                </label>
                                {d?.whatsappGroup ? (
                                  <a
                                    href={d.whatsappGroup}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-emerald-600 underline break-all"
                                  >
                                    {d.whatsappGroup}
                                  </a>
                                ) : (
                                  <p className="text-xs font-medium text-gray-900">
                                    -
                                  </p>
                                )}
                              </div>

                              <h3 className="text-xs font-bold text-emerald-700">
                                Detail Mentoring
                              </h3>

                              {/* Program About */}
                              {d?.programAbout && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                                    Program Tentang Apa?
                                  </label>
                                  <p className="text-xs text-gray-900 leading-relaxed">
                                    {d.programAbout}
                                  </p>
                                </div>
                              )}

                              {/* BENEFIT */}
                              {Array.isArray(d?.benefits) &&
                                d.benefits.length > 0 && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-2">
                                      Benefit Program
                                    </label>
                                    <div className="space-y-1.5">
                                      {d.benefits.map((b: any, i: number) => (
                                        <div
                                          key={i}
                                          className="bg-emerald-50 border border-emerald-100 rounded-lg p-2"
                                        >
                                          <p className="text-xs font-semibold text-emerald-800">
                                            {b.title}
                                          </p>
                                          {b.description && (
                                            <p className="text-xs text-gray-600 mt-0.5">
                                              {b.description}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {/* MECHANISM */}
                              {Array.isArray(d?.mechanisms) &&
                                d.mechanisms.length > 0 && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-2">
                                      Mekanisme Program
                                    </label>
                                    <div className="space-y-1.5">
                                      {d.mechanisms.map((m: any, i: number) => (
                                        <div
                                          key={i}
                                          className="bg-blue-50 border border-blue-100 rounded-lg p-2"
                                        >
                                          <p className="text-xs font-semibold text-blue-800">
                                            {m.title}
                                          </p>
                                          {m.description && (
                                            <p className="text-xs text-gray-600 mt-0.5">
                                              {m.description}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {/* SYLLABUS */}
                              {Array.isArray(d?.syllabuses) &&
                                d.syllabuses.length > 0 && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-2">
                                      Silabus Program
                                    </label>
                                    <div className="space-y-1.5">
                                      {d.syllabuses.map((s: any, i: number) => (
                                        <div
                                          key={i}
                                          className="bg-purple-50 border border-purple-100 rounded-lg p-2"
                                        >
                                          <p className="text-xs font-semibold text-purple-800">
                                            {s.title}
                                          </p>
                                          {s.description && (
                                            <p className="text-xs text-gray-600 mt-0.5">
                                              {s.description}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {/* TARGET */}
                              {Array.isArray(d?.targets) &&
                                d.targets.length > 0 && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-2">
                                      Target Audience
                                    </label>
                                    <div className="space-y-1.5">
                                      {d.targets.map((t: any, i: number) => (
                                        <div
                                          key={i}
                                          className="bg-orange-50 border border-orange-100 rounded-lg p-2"
                                        >
                                          <p className="text-xs font-semibold text-orange-800">
                                            {t.title}
                                          </p>
                                          {t.description && (
                                            <p className="text-xs text-gray-600 mt-0.5">
                                              {t.description}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {/* TOOLS */}
                              {Array.isArray(d?.tools) &&
                                d.tools.length > 0 && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-2">
                                      Tools yang Digunakan
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                      {d.tools.map((t: any, i: number) => (
                                        <span
                                          key={i}
                                          className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 font-medium"
                                        >
                                          {t.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {/* SCHEDULES */}
                              {Array.isArray(d?.schedules) &&
                                d.schedules.length > 0 && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-2">
                                      Jadwal (Tanggal)
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                      {d.schedules.map((s: any, i: number) => (
                                        <span
                                          key={i}
                                          className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700 font-medium"
                                        >
                                          {s.date
                                            ? new Date(
                                                s.date,
                                              ).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                              })
                                            : "-"}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {/* PORTFOLIOS */}
                              {Array.isArray(d?.portfolios) &&
                                d.portfolios.length > 0 && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-2">
                                      Portfolio Alumni
                                    </label>
                                    <div className="space-y-2">
                                      {d.portfolios.map((p: any, i: number) => (
                                        <div
                                          key={i}
                                          className="border border-gray-200 rounded-lg p-2 bg-gray-50 space-y-1"
                                        >
                                          <p className="text-xs font-semibold text-gray-800">
                                            {p.title}
                                          </p>
                                          <p className="text-xs text-gray-600">
                                            Mentee: {p.menteeName}
                                          </p>
                                          {p.description && (
                                            <p className="text-xs text-gray-500">
                                              {p.description}
                                            </p>
                                          )}
                                          <a
                                            href={p.projectLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-emerald-600 underline break-all"
                                          >
                                            {p.projectLink}
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {/* TESTIMONIALS */}
                              {Array.isArray(d?.testimonials) &&
                                d.testimonials.length > 0 && (
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-2">
                                      Testimonial
                                    </label>
                                    <div className="space-y-2">
                                      {d.testimonials.map(
                                        (t: any, i: number) => (
                                          <div
                                            key={i}
                                            className="border border-gray-200 rounded-lg p-2 bg-gray-50 space-y-1"
                                          >
                                            <div className="flex items-center justify-between">
                                              <p className="text-xs font-semibold text-gray-800">
                                                {t.name}
                                              </p>
                                              <span className="text-xs text-yellow-600 font-medium">
                                                {"★".repeat(t.rating)}
                                                {"☆".repeat(5 - t.rating)}
                                              </span>
                                            </div>
                                            {t.role && (
                                              <p className="text-xs text-gray-500">
                                                {t.role}
                                              </p>
                                            )}
                                            <p className="text-xs text-gray-700 leading-relaxed">
                                              {t.comment}
                                            </p>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}

                          {/* E-LEARNING ONLY */}
                          {!isMentoring && (
                            <div className="space-y-3 pt-3 border-t">
                              <h3 className="text-xs font-bold text-emerald-700">
                                Detail E-Learning
                              </h3>
                              <div className="grid grid-cols-2 gap-2">
                                <DetailItem
                                  label="Category"
                                  value={selectedProduct.category}
                                />
                                <DetailItem
                                  label="Level"
                                  value={selectedProduct.level}
                                />
                              </div>
                              <DetailItem
                                label="Estimated Duration"
                                value={selectedProduct.estimatedDuration}
                              />
                              <DetailItem
                                label="Target Audience"
                                value={selectedProduct.targetAudience}
                              />
                              <DetailItem
                                label="Tools Used"
                                value={selectedProduct.toolsUsed}
                              />
                              <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1">
                                  Tags
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {(selectedProduct.tags ?? []).length > 0 ? (
                                    selectedProduct.tags!.map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700"
                                      >
                                        {tag}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-gray-400">
                                      -
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex pt-3 mt-3 border-t gap-2">
              <Button
                className="flex-1 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center space-x-1.5"
                onClick={async () => {
                  if (selectedProduct) {
                    setIsDetailDialogOpen(false);
                    await fetchAndPopulateEditForm(selectedProduct);
                    setTimeout(() => setShowEditDialog(true), 0);
                  }
                }}
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Button>

              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center space-x-2"
                onClick={() => handleDelete(selectedProduct?.id)}
              >
                <Trash className="w-4 h-4" />
                <span>Hapus</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Product Dialog */}
      {EditDialog}

      {isDeleteDialogOpen && (
        <Dialog open onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent
            className="max-w-md"
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-emerald-700">
                Konfirmasi Hapus
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Apakah kamu yakin ingin menghapus{" "}
                <span className="font-semibold text-gray-900">
                  {selectedProduct?.nama}
                </span>
                ?
              </p>
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                Tindakan ini tidak dapat dibatalkan.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button
                variant="outline"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={confirmDelete}
              >
                Ya, Hapus
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
