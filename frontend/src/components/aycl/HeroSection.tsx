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
} from "lucide-react";
import { AyclMaterial } from "@/app/aycl/AyclClient";

// ── Keyword → icon mapper ─────────────────────────────────────────────────────
function getMaterialIcon(title: string) {
  const t = title.toLowerCase();

  if (t.includes("excel") || t.includes("spreadsheet"))
    return <FileSpreadsheet size={20} className="text-emerald-600" />;
  if (t.includes("python"))
    return <Code2 size={20} className="text-emerald-600" />;
  if (t.includes("sql") || t.includes("database") || t.includes("query"))
    return <Database size={20} className="text-emerald-600" />;
  if (t.includes("dashboard") || t.includes("looker") || t.includes("studio"))
    return <LayoutDashboard size={20} className="text-emerald-600" />;
  if (t.includes("chart") || t.includes("visuali"))
    return <BarChart2 size={20} className="text-emerald-600" />;
  if (t.includes("pie") || t.includes("donut"))
    return <PieChart size={20} className="text-emerald-600" />;
  if (t.includes("trend") || t.includes("forecast") || t.includes("prediksi"))
    return <TrendingUp size={20} className="text-emerald-600" />;
  if (t.includes("line") || t.includes("time series"))
    return <LineChart size={20} className="text-emerald-600" />;
  if (t.includes("analisis") || t.includes("analysis") || t.includes("insight"))
    return <Search size={20} className="text-emerald-600" />;
  if (t.includes("machine") || t.includes("ai") || t.includes("model"))
    return <BrainCircuit size={20} className="text-emerald-600" />;
  if (t.includes("tabel") || t.includes("table") || t.includes("pivot"))
    return <Table2 size={20} className="text-emerald-600" />;
  if (t.includes("server") || t.includes("cloud") || t.includes("deploy"))
    return <ServerCog size={20} className="text-emerald-600" />;
  if (t.includes("statistik") || t.includes("statistic") || t.includes("math"))
    return <Sigma size={20} className="text-emerald-600" />;
  if (t.includes("web") || t.includes("scraping") || t.includes("api"))
    return <Globe size={20} className="text-emerald-600" />;
  if (t.includes("presentasi") || t.includes("report") || t.includes("laporan"))
    return <Presentation size={20} className="text-emerald-600" />;

  // default
  return <ClipboardList size={20} className="text-emerald-600" />;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface HeroSectionProps {
  title: string;
  headline: string;
  subHeadline: string | null;
  description: string | null;
  materials: AyclMaterial[];
}

export default function HeroSection({
  title,
  headline,
  subHeadline,
  description,
  materials,
}: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-100 pt-16 sm:pt-20 pb-12 sm:pb-16 px-4">
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge Group */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 sm:mb-6">
          <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full">
            {headline}
          </span>

          {/* Batch badge — dari title */}
          <span className="inline-block bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            {title}
          </span>
        </div>

        {/* Heading — dari subHeadline */}
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 leading-snug sm:leading-tight mb-4 sm:mb-5">
          {subHeadline ?? headline}
        </h1>

        {/* Description — dari description */}
        {description && (
          <p className="text-gray-600 font-medium text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-3 sm:mb-4 leading-relaxed">
            {description}
          </p>
        )}

        <p className="text-gray-400 font-medium text-xs sm:text-sm md:text-base max-w-xl mx-auto mb-8 sm:mb-12 leading-relaxed">
          Belajar skill yang relevan, aplikatif, dan bisa dipakai untuk
          portfolio maupun kebutuhan kerja.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mb-10 sm:mb-16">
          <button
            onClick={() => {
              const el = document.getElementById("daftar");
              if (el) {
                const yOffset = -95;
                const y =
                  el.getBoundingClientRect().top + window.pageYOffset + yOffset;

                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition text-sm sm:text-base"
          >
            Mau Ikutan Kelas
          </button>

          <button
            onClick={() => {
              const el = document.getElementById("tentang");
              if (el) {
                const yOffset = -95;
                const y =
                  el.getBoundingClientRect().top + window.pageYOffset + yOffset;

                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }}
            className="border border-emerald-300 hover:border-emerald-500 text-emerald-700 font-medium px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition text-sm sm:text-base"
          >
            Pelajari Lebih Lanjut
          </button>
        </div>

        {/* Topic cards — dari materials */}
        {materials.length > 0 && (
          <div className="space-y-4 text-left">
            {Array.from({ length: Math.ceil(materials.length / 2) }).map(
              (_, rowIndex) => {
                const rowItems = materials.slice(
                  rowIndex * 2,
                  rowIndex * 2 + 2,
                );

                return (
                  <div key={rowIndex} className="flex justify-center gap-4">
                    {rowItems.map((m, i) => (
                      <div
                        key={i}
                        className="bg-white border border-emerald-100 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 hover:shadow-md transition flex-1 max-w-full sm:max-w-[calc(50%-0.5rem)]"
                      >
                        <div className="bg-emerald-50 rounded-lg p-2 shrink-0 mx-auto sm:mx-0">
                          {getMaterialIcon(m.title)}
                        </div>

                        <div className="flex flex-col items-center sm:items-start">
                          <p className="font-semibold text-gray-800 text-sm sm:text-sm mb-1">
                            {m.title}
                          </p>
                          {m.description && (
                            <p className="text-gray-500 font-medium text-xs sm:text-sm leading-relaxed">
                              {m.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>
    </section>
  );
}
