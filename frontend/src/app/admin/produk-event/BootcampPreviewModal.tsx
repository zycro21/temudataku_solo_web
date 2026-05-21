"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  Clock,
  Tag,
  Star,
  ChevronRight,
  UserRound,
  BookOpen,
  GraduationCap,
  Calendar,
  Users,
  MessageCircle,
  UserCheck,
  Award,
  CheckCircle,
  Cloud,
  Server,
  Briefcase,
  FileText,
  Network,
  Globe,
  Layers,
  Rocket,
  Database,
  BarChart,
  Laptop,
  Code,
  Cpu,
  Headphones,
  Shield,
  Video,
  Presentation,
  Gift,
  Lightbulb,
  Target,
  ChartNoAxesCombined,
  Flag,
  BookCheck,
} from "lucide-react";

// ─── Types (harus sama dengan AddFormData di page.tsx) ────────────────────────
type SectionItem = { title: string; description: string };
type ToolItem = { name: string };
type ScheduleItem = { date: string };
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

export type PreviewData = {
  nama: string;
  foto: File | null;
  fotoUrl?: string; // untuk edit modal — URL existing thumbnail dari DB
  level?: string;
  category?: string;
  deskripsi: string;
  harga: string;
  strikePrice?: string;
  totalWeeks?: string;
  totalProjects?: string;
  programAbout?: string;
  benefits?: SectionItem[];
  mechanisms?: SectionItem[];
  syllabuses?: SectionItem[];
  targets?: SectionItem[];
  tools?: ToolItem[];
  schedules?: ScheduleItem[];
  portfolios?: PortfolioItem[];
  testimonials?: TestimonialItem[];
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatRupiah(val: string | number) {
  const n = Number(val);
  if (!n || isNaN(n)) return "Rp0";
  return "Rp" + n.toLocaleString("id-ID");
}

function formatScheduleRange(schedules: ScheduleItem[]): string {
  if (!schedules || schedules.length === 0) return "Tanggal belum tersedia";
  const sorted = [...schedules]
    .filter((s) => s.date)
    .map((s) => new Date(s.date))
    .sort((a, b) => a.getTime() - b.getTime());
  if (sorted.length === 0) return "Tanggal belum tersedia";
  const fmt = (d: Date) =>
    d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const first = fmt(sorted[0]);
  const last = fmt(sorted[sorted.length - 1]);
  return first === last ? first : `${first} – ${last}`;
}

function formatDesc(text: string) {
  if (!text) return "";
  return text
    .split("\n")
    .map((p) => {
      let f = p
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/_(.*?)_/g, "<u>$1</u>");
      return `<p class="mb-2">${f}</p>`;
    })
    .join("");
}

function fmtText(text: string) {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<u>$1</u>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}

// ─── Icon helpers (mirror dari ProgramDetailSection) ─────────────────────────
const iconMap: { keywords: string[]; icons: any[] }[] = [
  {
    keywords: ["belajar", "materi", "modul", "kelas"],
    icons: [BookOpen, GraduationCap],
  },
  { keywords: ["waktu", "durasi", "jam"], icons: [Clock, Calendar] },
  {
    keywords: ["mentor", "mentoring", "konsultasi"],
    icons: [Users, MessageCircle, UserCheck],
  },
  { keywords: ["sertifikat", "certificate"], icons: [Award, CheckCircle] },
  { keywords: ["cloud", "server", "aws"], icons: [Cloud, Server] },
  {
    keywords: ["karir", "career", "cv", "interview"],
    icons: [Briefcase, FileText],
  },
  { keywords: ["network", "komunitas", "relasi"], icons: [Network, Globe] },
  { keywords: ["project", "portfolio"], icons: [Layers, Rocket] },
  {
    keywords: ["data", "analysis"],
    icons: [Database, BarChart, ChartNoAxesCombined],
  },
  { keywords: ["tools", "software", "coding"], icons: [Laptop, Code, Cpu] },
  { keywords: ["support", "bantuan"], icons: [Headphones, Shield] },
  { keywords: ["live", "rekaman", "video"], icons: [Video, Presentation] },
  { keywords: ["bonus", "gratis"], icons: [Gift, Star] },
  { keywords: ["ide", "insight"], icons: [Lightbulb, Target] },
];
const defaultIcons = [BookOpen, Star, Rocket, Globe, Award];

function getIconForBenefit(text: string) {
  const lowerText = text.toLowerCase();
  for (const cat of iconMap) {
    if (cat.keywords.some((kw) => lowerText.includes(kw))) {
      return cat.icons[Math.floor(Math.random() * cat.icons.length)];
    }
  }
  return defaultIcons[Math.floor(Math.random() * defaultIcons.length)];
}

function getIconForSession(text: string, index: number) {
  const lowerText = text.toLowerCase();
  for (const cat of iconMap) {
    if (cat.keywords.some((kw) => lowerText.includes(kw))) {
      return cat.icons[index % cat.icons.length];
    }
  }
  return defaultIcons[index % defaultIcons.length];
}

function getToolIconPath(tool: string): string {
  const toolPaths: Record<string, string> = {
    excel: "/assets/toolIcons/excel.svg",
    microsoftexcel: "/assets/toolIcons/excel.svg",
    python: "/assets/toolIcons/python.svg",
    powerbi: "/assets/toolIcons/powerbi.svg",
    mysql: "/assets/toolIcons/mysql.svg",
    sql: "/assets/toolIcons/mysql.svg",
    postgresql: "/assets/toolIcons/postgresql.svg",
    pytorch: "/assets/toolIcons/pytorch.svg",
    scikitlearn: "/assets/toolIcons/scikitlearn.svg",
    tensorflow: "/assets/toolIcons/tensorflow.svg",
    docker: "/assets/toolIcons/docker.svg",
    kubernetes: "/assets/toolIcons/kubernetes.svg",
    aws: "/assets/toolIcons/aws.svg",
    mlflow: "/assets/toolIcons/mlflow.svg",
    jupyter: "/assets/toolIcons/jupyter.svg",
    jupyternotebook: "/assets/toolIcons/jupyter.svg",
    statistics: "/assets/toolIcons/statistic.svg",
    tableau: "/assets/toolIcons/tableau.svg",
    datastudio: "/assets/toolIcons/looker.svg",
    looker: "/assets/toolIcons/looker.svg",
    opencv: "/assets/toolIcons/opencv.svg",
    googlecolab: "/assets/toolIcons/googlecolab.svg",
    keras: "/assets/toolIcons/keras.svg",
    huggingface: "/assets/toolIcons/hf.svg",
    metabase: "/assets/toolIcons/metabase.svg",
    superset: "/assets/toolIcons/superset.svg",
    spark: "/assets/toolIcons/spark.svg",
    apachespark: "/assets/toolIcons/spark.svg",
    hadoop: "/assets/toolIcons/hadoop.svg",
    airflow: "/assets/toolIcons/airflow.svg",
    apacheairflow: "/assets/toolIcons/airflow.svg",
    dbt: "/assets/toolIcons/dbt.svg",
    pandas: "/assets/toolIcons/pandas.svg",
    numpy: "/assets/toolIcons/numpy.svg",
    fastapi: "/assets/toolIcons/fastapi.svg",
    streamlit: "/assets/toolIcons/streamlit.svg",
    wandb: "/assets/toolIcons/wandb.svg",
    gcp: "/assets/toolIcons/gcp.svg",
    googlecloud: "/assets/toolIcons/gcp.svg",
    bigquery: "/assets/toolIcons/bigquery.svg",
    snowflake: "/assets/toolIcons/snowflake.svg",
    mongodb: "/assets/toolIcons/mongodb.svg",
    r: "/assets/toolIcons/r.svg",
    rlanguage: "/assets/toolIcons/r.svg",
    git: "/assets/toolIcons/git.svg",
    github: "/assets/toolIcons/github.svg",
    // ── aliases belum ada ──
    "scikit-learn": "/assets/toolIcons/scikitlearn.svg",
    weightsandbiases: "/assets/toolIcons/wandb.svg",
    apachehop: "/assets/toolIcons/apachehop.png",
    // ── online fallback icons ──
    seaborn: "/assets/toolIcons/seaborn.svg",
    matplotlib: "/assets/toolIcons/matplotlib.svg",
    plotly: "/assets/toolIcons/plotly.svg",
    xgboost: "/assets/toolIcons/xgboost.svg",
    lightgbm: "/assets/toolIcons/lightbgm.svg",
    catboost: "/assets/toolIcons/catboost.svg",
    dask: "/assets/toolIcons/dask.svg",
    polars: "/assets/toolIcons/polars.svg",
    nltk: "/assets/toolIcons/nltk.png",
    spacy: "/assets/toolIcons/spacy.svg",
    langchain: "/assets/toolIcons/langchain.svg",
    llamaindex: "/assets/toolIcons/llamaindex.svg",
    transformers: "/assets/toolIcons/huggingface.svg",
    onnx: "/assets/toolIcons/onxx.svg",
    tritoninferenceserver: "/assets/toolIcons/triton.png",
    ray: "/assets/toolIcons/ray.png",
    raytune: "/assets/toolIcons/ray.png",
    optuna: "/assets/toolIcons/optuna.svg",
    deepspeed: "/assets/toolIcons/deepspeed.svg",
    accelerate: "/assets/toolIcons/accelerate.svg",
    bokeh: "/assets/toolIcons/bokeh.svg",
    altair: "/assets/toolIcons/altair.svg",
    dash: "/assets/toolIcons/dash.svg",
    plotnine: "/assets/toolIcons/plotnine.svg",
    kafka: "/assets/toolIcons/kafka.svg",
    apacheflink: "/assets/toolIcons/apacheflink.svg",
    apachebeam: "/assets/toolIcons/beam.svg",
    deltalake: "/assets/toolIcons/deltalake.svg",
    databricks: "/assets/toolIcons/databricks.svg",
    presto: "/assets/toolIcons/presto.svg",
    trino: "/assets/toolIcons/trino.svg",
    clickhouse: "/assets/toolIcons/clickhouse.svg",
    azure: "/assets/toolIcons/azure.svg",
    azureml: "/assets/toolIcons/azureml.svg",
    sagemaker: "/assets/toolIcons/sagemaker.svg",
    vertexai: "/assets/toolIcons/vertexai.svg",
    terraform: "/assets/toolIcons/terraform.svg",
    pulumi: "/assets/toolIcons/pulumi.svg",
    circleci: "/assets/toolIcons/circleci.svg",
    gitlabci: "/assets/toolIcons/gitlabci.svg",
    argocd: "/assets/toolIcons/argocd.svg",
    prefect: "/assets/toolIcons/prefect.svg",
    dvc: "/assets/toolIcons/dvc.svg",
    greatexpectations: "/assets/toolIcons/ge.svg",
    evidentlyai: "/assets/toolIcons/evidentlyai.svg",
    nodejs: "/assets/toolIcons/nodejs.svg",
    expressjs: "/assets/toolIcons/expressjs.svg",
    nestjs: "/assets/toolIcons/nestjs.svg",
    go: "/assets/toolIcons/go.svg",
    gin: "/assets/toolIcons/gin.svg",
    redis: "/assets/toolIcons/redis.svg",
    graphql: "/assets/toolIcons/graphql.svg",
    grpc: "/assets/toolIcons/grpc.svg",
    pinecone: "/assets/toolIcons/pinecone.svg",
    weaviate: "/assets/toolIcons/weaviate.svg",
    faiss: "/assets/toolIcons/faiss.png",
    chroma: "/assets/toolIcons/chroma.svg",
    milvus: "/assets/toolIcons/milvus.svg",
    elasticsearch: "/assets/toolIcons/elasticsearch.svg",
    opensearch: "/assets/toolIcons/opensearch.svg",
    gensim: "/assets/toolIcons/gensim.png",
    textblob: "/assets/toolIcons/textblob.svg",
    tesseractocr: "/assets/toolIcons/tesseract.svg",
    detectron2: "/assets/toolIcons/detectron.png",
    visualstudiocode: "/assets/toolIcons/vsc.svg",
    spreadsheet: "/assets/toolIcons/spreadsheet.svg",
    dbeaver: "/assets/toolIcons/dbeaver.svg",
    pgadmin: "/assets/toolIcons/pgadmin.svg",
    grafana: "/assets/toolIcons/grafana.svg",
    prometheus: "/assets/toolIcons/prometheus.svg",
    microsoftpowerpoint: "/assets/toolIcons/powerpoint.svg",
    microsoftword: "/assets/toolIcons/word.svg",
  };
  const normalized = tool
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9-]/g, "");
  return toolPaths[normalized] || "/assets/toolIcons/python.svg";
}

const avatarColors = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-indigo-500",
];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function BootcampPreviewModal({ data }: { data: PreviewData }) {
  const fotoUrl = useMemo(() => {
    if (data.foto) return URL.createObjectURL(data.foto);
    if (data.fotoUrl) return data.fotoUrl;
    return null;
  }, [data.foto, data.fotoUrl]);

  const scheduleDateRange = useMemo(
    () => formatScheduleRange(data.schedules ?? []),
    [data.schedules],
  );

  const strikeDisplay = useMemo(() => {
    if (data.strikePrice && Number(data.strikePrice) > 0)
      return formatRupiah(data.strikePrice);
    if (data.harga && Number(data.harga) > 0)
      return formatRupiah(Math.round(Number(data.harga) / 0.875));
    return null;
  }, [data.harga, data.strikePrice]);

  return (
    <div className="flex flex-col gap-0 text-sm min-w-0 w-full overflow-hidden">
      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-6 px-4 relative overflow-hidden rounded-t-xl border border-gray-200">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
          <span>{data.category || "Bootcamp"}</span>
          <span>&gt;</span>
          <span className="text-gray-800 font-medium">
            {data.nama || "Nama Program"}
          </span>
        </nav>

        <div className="flex flex-col gap-4">
          {/* Thumbnail — full width */}
          <div className="w-full">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt="thumbnail"
                className="w-full h-44 object-cover rounded-lg shadow"
              />
            ) : (
              <div className="w-full h-36 bg-white/60 rounded-lg flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-300 gap-1">
                <svg
                  className="w-8 h-8 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-[10px]">Thumbnail belum diunggah</span>
              </div>
            )}
          </div>

          {/* Konten */}
          <div className="space-y-2 min-w-0">
            {/* Level ribbon */}
            {data.level && (
              <div className="inline-block">
                <div className="bg-blue-900 text-white px-3 py-1 text-[10px] font-bold tracking-wide rounded-sm">
                  Level {data.level}
                </div>
              </div>
            )}

            {/* Title */}
            <h2 className="text-base font-bold text-gray-900 leading-snug break-words">
              {data.nama || (
                <span className="text-gray-400 italic font-normal">
                  Nama program belum diisi...
                </span>
              )}
            </h2>

            {/* Deskripsi */}
            {data.deskripsi ? (
              <div
                className="text-gray-600 text-[10px] leading-relaxed break-words overflow-wrap-anywhere"
                dangerouslySetInnerHTML={{ __html: formatDesc(data.deskripsi) }}
              />
            ) : (
              <p className="text-[10px] text-gray-400 italic">
                Deskripsi belum diisi...
              </p>
            )}

            {/* Tanggal */}
            <div className="flex items-start gap-2 text-[10px] text-gray-700">
              <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span className="font-medium break-words">
                {scheduleDateRange}
              </span>
            </div>

            {/* Harga */}
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                {strikeDisplay && (
                  <span className="text-[10px] text-gray-400 line-through">
                    {strikeDisplay}
                  </span>
                )}
                <span className="text-sm font-bold text-gray-900">
                  {data.harga ? formatRupiah(data.harga) : "Rp0"}
                </span>
              </div>
            </div>

            {/* Tombol (non-interaktif) */}
            <div className="flex gap-2 pt-1">
              <div className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-semibold rounded-lg">
                Daftar Sekarang
              </div>
              <div className="px-3 py-1.5 border border-emerald-600 text-emerald-600 text-[10px] font-semibold rounded-lg">
                Konsultasi Gratis
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          DETAIL SECTION (stat bar)
      ══════════════════════════════════════ */}
      <section className="border-x border-gray-200 bg-white px-4 py-3">
        <div className="flex gap-3">
          {/* Minggu */}
          <div className="flex flex-col items-center justify-center gap-2 bg-gray-50 rounded-lg p-3 flex-1 text-center">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
              <Image
                src="/assets/programsPage/calendar.svg"
                alt="cal"
                width={20}
                height={20}
              />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {data.totalWeeks || "–"}
              </div>
              <div className="text-[9px] text-gray-500 leading-tight">
                Minggu belajar
              </div>
            </div>
          </div>

          {/* 1 on 1 */}
          <div className="flex flex-col items-center justify-center gap-2 bg-gray-50 rounded-lg p-3 flex-1 text-center">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
              <Image
                src="/assets/programsPage/lesson.svg"
                alt="lesson"
                width={20}
                height={20}
              />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                Live Session
              </div>
              <div className="text-[9px] text-gray-500 leading-tight">
                Dengan Mentor Setiap Week
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="flex flex-col items-center justify-center gap-2 bg-gray-50 rounded-lg p-3 flex-1 text-center">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
              <Image
                src="/assets/programsPage/diagram.svg"
                alt="diagram"
                width={20}
                height={20}
              />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {data.totalProjects ? `${data.totalProjects}+` : "–"}
              </div>
              <div className="text-[9px] text-gray-500 leading-tight">
                Real case projects
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PROGRAM DETAIL SECTION
      ══════════════════════════════════════ */}
      <section className="border border-gray-200 rounded-b-xl bg-white min-w-0 overflow-hidden">
        {/* Section 1 - Tentang Bootcamp */}
        <div>
          <div className="bg-blue-900 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <h4 className="text-[11px] font-semibold">
                1. Tentang Bootcamp Ini
              </h4>
            </div>
          </div>
          <div className="bg-white px-4 py-3">
            {data.programAbout ? (
              <div
                className="text-[10px] text-gray-700 leading-relaxed break-words"
                dangerouslySetInnerHTML={{
                  __html: formatDesc(data.programAbout),
                }}
              />
            ) : (
              <EmptyPlaceholder text="Program About belum diisi..." />
            )}
          </div>
        </div>

        {/* Section 2 - Benefit */}
        <div>
          <div className="bg-blue-900 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <h4 className="text-[11px] font-semibold">
                2. Apa Aja yang Kamu Dapat di Sini?
              </h4>
            </div>
          </div>
          <div className="bg-white px-4 py-3">
            <p className="text-[10px] text-gray-600 leading-relaxed mb-3">
              Berikut adalah rincian benefit dalam bentuk aset dan layanan
              pendukung yang disediakan untuk memastikan setiap peserta dapat
              mengikuti materi dengan optimal.
            </p>
            {(data.benefits ?? []).length > 0 ? (
              <div className="space-y-2">
                {(data.benefits ?? []).map((benefit, i) => {
                  const IconComponent = getIconForBenefit(
                    benefit.title + " " + benefit.description,
                  );
                  return (
                    <div
                      key={i}
                      className="flex gap-3 bg-gray-50 rounded p-3 min-w-0"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <IconComponent className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-[10px] font-semibold text-gray-900 break-words">
                          {benefit.title}
                        </h5>
                        <p
                          className="text-[10px] text-gray-600 mt-0.5 break-words"
                          dangerouslySetInnerHTML={{
                            __html: fmtText(benefit.description),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyPlaceholder text="Benefit belum ditambahkan..." />
            )}
          </div>
        </div>

        {/* Section 3 - Mekanisme */}
        <div>
          <div className="bg-blue-900 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <h4 className="text-[11px] font-semibold">
                3. Gimana Bootcamp Ini Berjalan?
              </h4>
            </div>
          </div>
          <div className="bg-white px-4 py-3">
            <p className="text-[10px] text-gray-600 leading-relaxed mb-3">
              Berikut adalah gambaran mengenai sistem teknis dan operasional
              yang dijalankan selama masa pelatihan.
            </p>
            {(data.mechanisms ?? []).length > 0 ? (
              <div className="space-y-2">
                {(data.mechanisms ?? []).map((item, i) => {
                  const IconComponent = getIconForBenefit(
                    item.title + " " + item.description,
                  );
                  return (
                    <div
                      key={i}
                      className="flex gap-3 bg-gray-50 rounded p-3 min-w-0"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <IconComponent className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-[10px] font-semibold text-gray-900 break-words">
                          {item.title}
                        </h5>
                        <p
                          className="text-[10px] text-gray-600 mt-0.5 break-words"
                          dangerouslySetInnerHTML={{
                            __html: fmtText(item.description),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyPlaceholder text="Mekanisme belum ditambahkan..." />
            )}
          </div>
        </div>

        {/* Section 4 - Silabus */}
        <div>
          <div className="bg-blue-900 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <h4 className="text-[11px] font-semibold">
                4. Modul dan Silabus yang Akan Kamu Pelajari
              </h4>
            </div>
          </div>
          <div className="bg-white px-4 py-3">
            <p className="text-[10px] text-gray-600 leading-relaxed mb-3">
              Bagian ini memuat rincian materi dan urutan pembelajaran yang
              telah disusun secara sistematis.
            </p>
            {(data.syllabuses ?? []).length > 0 ? (
              <div className="space-y-2">
                {(data.syllabuses ?? []).map((item, i) => {
                  const IconComponent = getIconForSession(
                    item.title + " " + item.description,
                    i,
                  );
                  return (
                    <div key={i} className="bg-gray-50 rounded p-3 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <IconComponent className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-[10px] font-semibold text-gray-900 break-words">
                            {item.title}
                          </h5>
                          <p
                            className="text-[10px] text-gray-600 mt-0.5 break-words"
                            dangerouslySetInnerHTML={{
                              __html: fmtText(item.description),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyPlaceholder text="Silabus belum ditambahkan..." />
            )}
          </div>
        </div>

        {/* Section 5 - Tools */}
        <div>
          <div className="bg-blue-900 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <h4 className="text-[11px] font-semibold">
                5. Tools yang Digunakan Saat Belajar
              </h4>
            </div>
          </div>
          <div className="bg-white px-4 py-3">
            <p className="text-[10px] text-gray-600 leading-relaxed mb-3">
              Berikut adalah spesifikasi peralatan dan aplikasi yang akan
              dipelajari dan digunakan sepanjang program berlangsung.
            </p>
            {(data.tools ?? []).length > 0 ? (
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {(data.tools ?? []).map((t, i) => (
                  <div
                    key={i}
                    className="relative group flex items-center justify-center"
                  >
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                      <Image
                        src={getToolIconPath(t.name)}
                        alt={t.name}
                        width={22}
                        height={22}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-900 text-white text-[9px] px-2 py-0.5 rounded whitespace-nowrap z-10">
                      {t.name}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPlaceholder text="Tools belum ditambahkan..." />
            )}
          </div>
        </div>

        {/* Section 6 - Target Audience */}
        <div>
          <div className="bg-blue-900 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <h4 className="text-[11px] font-semibold">
                6. Bootcamp Ini Cocok untuk Siapa?
              </h4>
            </div>
          </div>
          <div className="bg-white px-4 py-3">
            <p className="text-[10px] text-gray-600 leading-relaxed mb-3">
              Bagian ini merinci kriteria dan profil peserta yang akan
              memperoleh manfaat maksimal dari kurikulum yang kami jalankan.
            </p>
            {(data.targets ?? []).length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {(data.targets ?? []).map((t, i) => (
                  <div
                    key={i}
                    className="text-center bg-gray-50 rounded-lg p-3 min-w-0"
                  >
                    <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <UserRound className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h5 className="text-[10px] font-bold text-gray-900 break-words mb-1">
                      {t.title}
                    </h5>
                    <p
                      className="text-[10px] text-gray-600 break-words"
                      dangerouslySetInnerHTML={{
                        __html: fmtText(t.description),
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPlaceholder text="Target audience belum ditambahkan..." />
            )}
          </div>
        </div>

        {/* Section 7 - Jadwal */}
        <div>
          <div className="bg-blue-900 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <h4 className="text-[11px] font-semibold">
                7. Belajarnya Kapan Aja, Sih?
              </h4>
            </div>
          </div>
          <div className="bg-white px-4 py-3">
            <p className="text-[10px] text-gray-600 leading-relaxed mb-3">
              Berikut adalah agenda operasional mengenai waktu pelaksanaan
              pelatihan yang perlu diperhatikan oleh setiap peserta untuk
              kelancaran koordinasi belajar:
            </p>
            {(data.schedules ?? []).filter((s) => s.date).length > 0 ? (
              <>
                <div className="bg-gray-50 border-l-4 border-emerald-400 rounded p-3 my-2">
                  <p
                    className="text-[10px] font-medium text-gray-800 break-words"
                    dangerouslySetInnerHTML={{ __html: scheduleDateRange }}
                  />
                </div>
                <p className="text-[10px] text-gray-600">
                  Seluruh pertemuan diatur dalam zona waktu yang sama yakni{" "}
                  <b>WIB</b>.
                </p>
              </>
            ) : (
              <EmptyPlaceholder text="Jadwal belum ditambahkan..." />
            )}
          </div>
        </div>

        {/* Section 8 - Portfolio */}
        <div>
          <div className="bg-blue-900 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <h4 className="text-[11px] font-semibold">
                8. Intip Karya Alumni dari Bootcamp Ini
              </h4>
            </div>
          </div>
          <div className="bg-white px-4 py-3">
            <p className="text-[10px] text-gray-600 leading-relaxed mb-3">
              Bagian ini menyajikan dokumentasi proyek dan hasil karya yang
              telah diselesaikan oleh para peserta pada angkatan sebelumnya.
            </p>
            {(data.portfolios ?? []).length > 0 ? (
              <div className="space-y-2">
                {(data.portfolios ?? []).map((p, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100 min-w-0"
                  >
                    {/* Image placeholder area */}
                    <div className="h-20 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <Layers className="w-8 h-8 text-indigo-300" />
                    </div>
                    <div className="p-3">
                      <h5 className="text-[10px] font-bold text-gray-900 break-words mb-1">
                        {p.title || `Proyek #${i + 1}`}
                      </h5>
                      {p.description && (
                        <p className="text-[10px] text-gray-600 break-words mb-1 line-clamp-2">
                          {p.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mb-1">
                        <UserRound className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-[10px] text-gray-500 break-words">
                          {p.menteeName || "Nama mentee"}
                        </span>
                      </div>
                      {p.projectLink && (
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Jelajahi Proyek →
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPlaceholder text="Portfolio belum ditambahkan..." />
            )}
          </div>
        </div>

        {/* Section 9 - Testimonial */}
        <div className="rounded-b-xl overflow-hidden">
          <div className="bg-blue-900 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <h4 className="text-[11px] font-semibold">
                9. Apa Kata Mereka Setelah Bootcamp?
              </h4>
            </div>
          </div>
          <div className="bg-white px-4 py-3 pb-4">
            <p className="text-[10px] text-gray-600 leading-relaxed mb-3">
              Berikut adalah ulasan dari para peserta mengenai pengalaman
              akademik dan teknis yang mereka peroleh selama masa pelatihan.
            </p>
            {(data.testimonials ?? []).length > 0 ? (
              <div className="space-y-2">
                {(data.testimonials ?? []).map((t, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}
                      >
                        <UserRound className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-900 break-words">
                          {t.name || "Nama"}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Alumni Bootcamp
                        </p>
                        <p className="text-[9px] text-gray-400">
                          Mentee temudataku
                        </p>
                      </div>
                    </div>
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-1.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className={`w-2.5 h-2.5 ${s < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-700 italic break-words">
                      &quot;{t.comment || "Komentar..."}&quot;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPlaceholder text="Testimonial belum ditambahkan..." />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyPlaceholder({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        <svg
          className="w-3 h-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <p className="text-[10px] text-gray-400 italic">{text}</p>
    </div>
  );
}
