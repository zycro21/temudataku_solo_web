import { AyclSection } from "@/app/aycl/AyclClient";

import {
  Video,
  Zap,
  BookOpen,
  Award,
  Code2,
  Database,
  BarChart2,
  LayoutDashboard,
  BrainCircuit,
  ServerCog,
  Layers,
  Cpu,
  Network,
  Shield,
  Rocket,
  Lightbulb,
  Users,
  Briefcase,
  GraduationCap,
  RefreshCw,
  Megaphone,
  ShoppingCart,
  LineChart,
  Globe,
  FileText,
  CheckCircle,
  X,
  Check,
} from "lucide-react";

function getDifferentiatorIcon(text: string) {
  const t = text.toLowerCase();

  // ── Learning Style ──
  if (t.includes("live") || t.includes("zoom") || t.includes("meet"))
    return <Video size={20} className="text-emerald-600" />;

  if (t.includes("praktik") || t.includes("hands-on"))
    return <Zap size={20} className="text-emerald-600" />;

  if (t.includes("materi") || t.includes("ebook") || t.includes("modul"))
    return <BookOpen size={20} className="text-emerald-600" />;

  if (t.includes("sertifikat") || t.includes("certificate"))
    return <Award size={20} className="text-emerald-600" />;

  // ── Tech / IT ──
  if (t.includes("python") || t.includes("code") || t.includes("programming"))
    return <Code2 size={20} className="text-emerald-600" />;

  if (t.includes("sql") || t.includes("database"))
    return <Database size={20} className="text-emerald-600" />;

  if (t.includes("dashboard") || t.includes("visualisasi"))
    return <BarChart2 size={20} className="text-emerald-600" />;

  if (t.includes("frontend") || t.includes("ui"))
    return <LayoutDashboard size={20} className="text-emerald-600" />;

  if (t.includes("ai") || t.includes("machine learning"))
    return <BrainCircuit size={20} className="text-emerald-600" />;

  if (t.includes("backend") || t.includes("api"))
    return <ServerCog size={20} className="text-emerald-600" />;

  if (t.includes("fullstack"))
    return <Layers size={20} className="text-emerald-600" />;

  if (t.includes("cloud") || t.includes("devops"))
    return <Network size={20} className="text-emerald-600" />;

  if (t.includes("security") || t.includes("cyber"))
    return <Shield size={20} className="text-emerald-600" />;

  // ── Career / Growth ──
  if (t.includes("career") || t.includes("karier"))
    return <Briefcase size={20} className="text-emerald-600" />;

  if (t.includes("student") || t.includes("mahasiswa"))
    return <GraduationCap size={20} className="text-emerald-600" />;

  if (t.includes("switch") || t.includes("pindah"))
    return <RefreshCw size={20} className="text-emerald-600" />;

  if (t.includes("mentor") || t.includes("community"))
    return <Users size={20} className="text-emerald-600" />;

  // ── Business ──
  if (t.includes("marketing"))
    return <Megaphone size={20} className="text-emerald-600" />;

  if (t.includes("sales") || t.includes("ecommerce"))
    return <ShoppingCart size={20} className="text-emerald-600" />;

  if (t.includes("business") || t.includes("bisnis"))
    return <LineChart size={20} className="text-emerald-600" />;

  // ── General ──
  if (t.includes("insight"))
    return <Lightbulb size={20} className="text-emerald-600" />;

  if (t.includes("global"))
    return <Globe size={20} className="text-emerald-600" />;

  if (t.includes("report") || t.includes("dokumen"))
    return <FileText size={20} className="text-emerald-600" />;

  if (t.includes("hasil") || t.includes("output"))
    return <CheckCircle size={20} className="text-emerald-600" />;

  // fallback
  return <Rocket size={20} className="text-emerald-600" />;
}

const comparison = [
  {
    label: "Sudah nemu course tapi isinya cuma materi aja tanpa praktik",
    aycl: "Praktik langsung selama sesi kelas dan bisa tanya mentor saat sesi praktik",
  },
  {
    label: "Takut tertinggal kalau tidak ikut sesi tertentu",
    aycl: "Ada akses materi dan rekaman kelas",
  },
  {
    label: "Belajar tapi tidak punya bukti hasil belajar",
    aycl: "Mendapat sertifikat program",
  },
];

interface WhyDifferentSectionProps {
  differentiator: AyclSection | null;
  title: string;
}

export default function WhyDifferentSection({
  differentiator,
  title,
}: WhyDifferentSectionProps) {
  type DifferentiatorItem = {
    title: string;
    desc: string;
  };

  const items: DifferentiatorItem[] =
    differentiator?.content?.items?.map((i: any) => ({
      title: i.title,
      desc: i.desc,
    })) ?? [];

  if (!differentiator || items.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 px-4 bg-gradient-to-b from-white to-emerald-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-emerald-600 font-medium text-sm uppercase tracking-widest mb-2">
            Keunggulan
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Kenapa {title} Berbeda?
          </h2>
        </div>

        {/* Reason cards */}
        <div className="space-y-4 mb-12">
          {Array.from({ length: Math.ceil(items.length / 2) }).map(
            (_, rowIndex) => {
              const rowItems = items.slice(rowIndex * 2, rowIndex * 2 + 2);

              return (
                <div key={rowIndex} className="flex justify-center gap-3 sm:gap-4">
                  {rowItems.map((r, i) => (
                    <div
                      key={i}
                      className="bg-white border border-emerald-100 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 flex-1 max-w-full sm:max-w-[calc(50%-0.5rem)]"
                    >
                      <div className="bg-emerald-50 rounded-lg p-2 shrink-0 mx-auto sm:mx-0">
                        {getDifferentiatorIcon(r.title + " " + r.desc)}
                      </div>

                      <div className="flex flex-col items-center sm:items-start">
                        <p className="font-semibold text-gray-800 text-sm sm:text-sm mb-1">
                          {r.title}
                        </p>
                        <p className="text-gray-500 font-medium text-xs sm:text-sm leading-relaxed max-w-md sm:max-w-none">
                          {r.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            },
          )}
        </div>

        {/* Comparison table */}
        <div className="bg-white border border-emerald-100 rounded-2xl overflow-hidden shadow-sm">
          {/* Header row */}
          <div className="grid grid-cols-2 bg-emerald-50 border-b border-emerald-100">
            <div className="px-4 sm:px-6 py-3 font-semibold text-gray-500 text-xs sm:text-sm flex items-center justify-center text-center">
              Belajar Sendiri
            </div>
            <div className="px-4 sm:px-6 py-3 font-semibold text-emerald-700 text-xs sm:text-sm bg-emerald-100 flex items-center justify-center text-center">
              {title} ✓
            </div>
          </div>

          {/* Rows */}
          {comparison.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-2 border-b last:border-0 border-emerald-100"
            >
              <div className="px-4 sm:px-6 py-3 sm:py-4 flex gap-2 items-start">
                <X size={15} className="text-red-700 shrink-0 mt-1 sm:mt-1.5" />
                <p className="text-gray-500 font-medium text-xs sm:text-sm leading-relaxed">
                  {row.label}
                </p>
              </div>

              <div className="px-4 sm:px-6 py-3 sm:py-4 flex gap-2 items-start bg-emerald-50/60">
                <Check size={15} className="text-emerald-600 shrink-0 mt-1 sm:mt-1.5" />
                <p className="text-gray-700 font-medium text-xs sm:text-sm leading-relaxed">
                  {row.aycl}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
