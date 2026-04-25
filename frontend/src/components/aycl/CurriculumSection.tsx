import { AyclMaterial } from "@/app/aycl/AyclClient";

import {
  BarChart2,
  Code2,
  Database,
  LayoutDashboard,
  FileSpreadsheet,
  PieChart,
  TrendingUp,
  LineChart,
  Search,
  BrainCircuit,
  Table2,
  ServerCog,
  Sigma,
  Globe,
  Presentation,
  ClipboardList,
  Cpu,
  Network,
  Shield,
  Briefcase,
  Users,
  Megaphone,
  ShoppingCart,
  Lightbulb,
  BookOpen,
  Award,
} from "lucide-react";

// ── Keyword → icon mapper (SUPER LENGKAP) ─────────────────────────────────────
function getMaterialIcon(text: string) {
  const t = text.toLowerCase();

  // helper biar clean
  const has = (keywords: string[]) => keywords.some((k) => t.includes(k));

  // ── DATA & ANALYSIS ─────────────────────────────────────
  if (has(["excel", "spreadsheet", "xls"]))
    return <FileSpreadsheet size={20} className="text-emerald-600" />;

  if (has(["sql", "database", "db", "query", "postgres", "mysql", "sqlite"]))
    return <Database size={20} className="text-emerald-600" />;

  if (has(["analysis", "analisis", "analyze", "insight", "eda"]))
    return <Search size={20} className="text-emerald-600" />;

  if (has(["statistik", "statistics", "probability", "math", "matematika"]))
    return <Sigma size={20} className="text-emerald-600" />;

  if (has(["data cleaning", "cleaning", "preprocessing", "wrangling"]))
    return <Table2 size={20} className="text-emerald-600" />;

  // ── PROGRAMMING ─────────────────────────────────────────
  if (
    has([
      "python",
      "javascript",
      "typescript",
      "java",
      "golang",
      "go",
      "c++",
      "c#",
      "php",
      "ruby",
      "coding",
      "programming",
      "code",
      "script",
    ])
  )
    return <Code2 size={20} className="text-emerald-600" />;

  // ── FRONTEND / UI ───────────────────────────────────────
  if (
    has([
      "frontend",
      "ui",
      "ux",
      "react",
      "next",
      "html",
      "css",
      "tailwind",
      "design",
    ])
  )
    return <LayoutDashboard size={20} className="text-emerald-600" />;

  // ── VISUALIZATION ───────────────────────────────────────
  if (has(["dashboard", "looker", "power bi", "tableau"]))
    return <LayoutDashboard size={20} className="text-emerald-600" />;

  if (has(["chart", "visual", "visualisasi", "graph"]))
    return <BarChart2 size={20} className="text-emerald-600" />;

  if (has(["pie", "donut"]))
    return <PieChart size={20} className="text-emerald-600" />;

  if (has(["trend", "forecast", "prediction", "prediksi"]))
    return <TrendingUp size={20} className="text-emerald-600" />;

  if (has(["line", "time series", "ts"]))
    return <LineChart size={20} className="text-emerald-600" />;

  // ── AI / MACHINE LEARNING ───────────────────────────────
  if (
    has([
      "ai",
      "artificial intelligence",
      "ml",
      "machine learning",
      "deep learning",
      "dl",
      "nlp",
      "cv",
      "computer vision",
      "model",
      "training",
    ])
  )
    return <BrainCircuit size={20} className="text-emerald-600" />;

  // ── BACKEND / SYSTEM ────────────────────────────────────
  if (
    has([
      "backend",
      "api",
      "rest",
      "graphql",
      "server",
      "microservice",
      "service",
    ])
  )
    return <ServerCog size={20} className="text-emerald-600" />;

  if (has(["cloud", "aws", "gcp", "azure", "devops", "docker", "kubernetes"]))
    return <Network size={20} className="text-emerald-600" />;

  if (has(["security", "cyber", "auth", "jwt", "encryption"]))
    return <Shield size={20} className="text-emerald-600" />;

  if (has(["system", "hardware", "os", "linux"]))
    return <Cpu size={20} className="text-emerald-600" />;

  // ── WEB / INTERNET ──────────────────────────────────────
  if (has(["web", "website", "scraping", "crawler", "api integration"]))
    return <Globe size={20} className="text-emerald-600" />;

  // ── PRESENTATION / REPORT ───────────────────────────────
  if (has(["report", "laporan", "presentation", "ppt", "presentasi"]))
    return <Presentation size={20} className="text-emerald-600" />;

  // ── BUSINESS / CAREER ───────────────────────────────────
  if (has(["business", "bisnis", "strategy"]))
    return <Briefcase size={20} className="text-emerald-600" />;

  if (has(["team", "collaboration", "collab", "communication"]))
    return <Users size={20} className="text-emerald-600" />;

  if (has(["marketing", "ads", "branding"]))
    return <Megaphone size={20} className="text-emerald-600" />;

  if (has(["sales", "ecommerce", "shop", "store"]))
    return <ShoppingCart size={20} className="text-emerald-600" />;

  // ── GENERAL / EDUCATION ─────────────────────────────────
  if (has(["idea", "concept", "thinking"]))
    return <Lightbulb size={20} className="text-emerald-600" />;

  if (has(["materi", "modul", "lesson", "course"]))
    return <BookOpen size={20} className="text-emerald-600" />;

  if (has(["sertifikat", "certificate", "certification"]))
    return <Award size={20} className="text-emerald-600" />;

  // fallback
  return <ClipboardList size={20} className="text-emerald-600" />;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface CurriculumSectionProps {
  materials: AyclMaterial[];
  loading?: boolean;
}

export default function CurriculumSection({
  materials,
  loading,
}: CurriculumSectionProps) {
  // ── Loading state ──
  if (loading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-b from-white to-emerald-50">
        <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-white border border-emerald-100 rounded-xl"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!materials || materials.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-emerald-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-emerald-600 font-medium text-sm uppercase tracking-widest mb-2">
            Kurikulum
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Materi yang Akan Dipelajari
          </h2>
        </div>

        {/* Dynamic materials */}
        <div className="space-y-4">
          {materials.map((m, i) => {
            const num = String(i + 1).padStart(2, "0");

            return (
              <div
                key={i}
                className="bg-white border border-emerald-100 rounded-xl p-5 md:p-6 flex gap-5 items-start shadow-sm hover:shadow-md transition"
              >
                {/* Number */}
                <span className="text-3xl font-bold text-emerald-100 shrink-0 leading-none">
                  {num}
                </span>

                <div className="flex gap-4 items-start">
                  {/* Icon */}
                  <div className="bg-emerald-50 rounded-lg p-2 shrink-0">
                    {getMaterialIcon(m.title + " " + (m.description ?? ""))}
                  </div>

                  {/* Content */}
                  <div>
                    <p className="font-semibold text-gray-800 text-sm mb-1">
                      {m.title}
                    </p>
                    {m.description && (
                      <p className="text-gray-500 font-medium text-sm leading-relaxed">
                        {m.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
