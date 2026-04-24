import {
  GraduationCap,
  Briefcase,
  RefreshCw,
  LineChart,
  Code2,
  Database,
  BarChart2,
  LayoutDashboard,
  BrainCircuit,
  Globe,
  ServerCog,
  Layers,
  ShoppingCart,
  Users,
  Megaphone,
  PenTool,
  Landmark,
  Stethoscope,
  BookOpen,
  Wrench,
  Calculator,
  Building2,
  TrendingUp,
  PackageSearch,
  HeartHandshake,
  Cpu,
  Network,
  Shield,
  FlaskConical,
  Microscope,
  Rocket,
  Lightbulb,
  Wallet,
  FileText,
  Factory,
  ClipboardList,
} from "lucide-react";
import { AyclSection } from "@/app/aycl/page";

// ── Keyword → { icon, title } mapper ──────────────────────────────────────────
// Fungsi ini mendeteksi konteks dari teks deskripsi target
// dan mengembalikan icon + label judul yang representatif.
function getTargetMeta(desc: string): {
  icon: React.ReactNode;
  title: string;
} {
  const t = desc.toLowerCase();

  // ── Bidang IT / Tech ──────────────────────────────────────────────────────
  if (t.includes("mahasiswa") || t.includes("student") || t.includes("kuliah"))
    return {
      icon: <GraduationCap size={22} className="text-emerald-600" />,
      title: "Mahasiswa",
    };
  if (
    t.includes("fresh graduate") ||
    t.includes("baru lulus") ||
    t.includes("lulusan baru")
  )
    return {
      icon: <Briefcase size={22} className="text-emerald-600" />,
      title: "Fresh Graduate",
    };
  if (
    t.includes("switch career") ||
    t.includes("career switch") ||
    t.includes("pindah karier") ||
    t.includes("ganti karir")
  )
    return {
      icon: <RefreshCw size={22} className="text-emerald-600" />,
      title: "Career Switcher",
    };
  if (t.includes("data analyst") || t.includes("analis data"))
    return {
      icon: <LineChart size={22} className="text-emerald-600" />,
      title: "Data Analyst",
    };
  if (
    t.includes("data scientist") ||
    t.includes("machine learning") ||
    t.includes("ml")
  )
    return {
      icon: <BrainCircuit size={22} className="text-emerald-600" />,
      title: "Data Scientist",
    };
  if (
    t.includes("data engineer") ||
    t.includes("pipeline") ||
    t.includes("etl")
  )
    return {
      icon: <Database size={22} className="text-emerald-600" />,
      title: "Data Engineer",
    };
  if (
    t.includes("programmer") ||
    t.includes("developer") ||
    t.includes("coding") ||
    t.includes("pemrograman")
  )
    return {
      icon: <Code2 size={22} className="text-emerald-600" />,
      title: "Programmer",
    };
  if (
    t.includes("frontend") ||
    t.includes("ui") ||
    t.includes("react") ||
    t.includes("web developer")
  )
    return {
      icon: <LayoutDashboard size={22} className="text-emerald-600" />,
      title: "Frontend Developer",
    };
  if (
    t.includes("backend") ||
    t.includes("server") ||
    t.includes("api") ||
    t.includes("node")
  )
    return {
      icon: <ServerCog size={22} className="text-emerald-600" />,
      title: "Backend Developer",
    };
  if (
    t.includes("fullstack") ||
    t.includes("full stack") ||
    t.includes("full-stack")
  )
    return {
      icon: <Layers size={22} className="text-emerald-600" />,
      title: "Fullstack Developer",
    };
  if (
    t.includes("cloud") ||
    t.includes("devops") ||
    t.includes("infrastruktur")
  )
    return {
      icon: <Network size={22} className="text-emerald-600" />,
      title: "DevOps / Cloud",
    };
  if (t.includes("cyber") || t.includes("keamanan") || t.includes("security"))
    return {
      icon: <Shield size={22} className="text-emerald-600" />,
      title: "Cybersecurity",
    };
  if (
    t.includes("ai") ||
    t.includes("artificial intelligence") ||
    t.includes("kecerdasan buatan")
  )
    return {
      icon: <Cpu size={22} className="text-emerald-600" />,
      title: "AI / Machine Learning",
    };
  if (
    t.includes("dashboard") ||
    t.includes("visualisasi") ||
    t.includes("visualization")
  )
    return {
      icon: <BarChart2 size={22} className="text-emerald-600" />,
      title: "BI / Analyst",
    };
  if (
    t.includes("startup") ||
    t.includes("founder") ||
    t.includes("entrepreneur") ||
    t.includes("wirausaha")
  )
    return {
      icon: <Rocket size={22} className="text-emerald-600" />,
      title: "Entrepreneur",
    };
  if (t.includes("product") || t.includes("produk") || t.includes("pm "))
    return {
      icon: <PackageSearch size={22} className="text-emerald-600" />,
      title: "Product Manager",
    };

  // ── Non-IT / Cross-field ──────────────────────────────────────────────────
  if (
    t.includes("bisnis") ||
    t.includes("business") ||
    t.includes("keputusan bisnis")
  )
    return {
      icon: <Building2 size={22} className="text-emerald-600" />,
      title: "Pelaku Bisnis",
    };
  if (
    t.includes("marketing") ||
    t.includes("pemasaran") ||
    t.includes("digital marketing")
  )
    return {
      icon: <Megaphone size={22} className="text-emerald-600" />,
      title: "Marketing",
    };
  if (
    t.includes("sales") ||
    t.includes("penjualan") ||
    t.includes("e-commerce") ||
    t.includes("ecommerce")
  )
    return {
      icon: <ShoppingCart size={22} className="text-emerald-600" />,
      title: "Sales / E-Commerce",
    };
  if (
    t.includes("hrd") ||
    t.includes("hr ") ||
    t.includes("human resource") ||
    t.includes("sdm")
  )
    return {
      icon: <Users size={22} className="text-emerald-600" />,
      title: "HR / SDM",
    };
  if (
    t.includes("keuangan") ||
    t.includes("finance") ||
    t.includes("akuntansi") ||
    t.includes("accounting")
  )
    return {
      icon: <Wallet size={22} className="text-emerald-600" />,
      title: "Keuangan / Finance",
    };
  if (t.includes("perbankan") || t.includes("bank") || t.includes("fintech"))
    return {
      icon: <Landmark size={22} className="text-emerald-600" />,
      title: "Perbankan / Fintech",
    };
  if (
    t.includes("investasi") ||
    t.includes("saham") ||
    t.includes("portofolio")
  )
    return {
      icon: <TrendingUp size={22} className="text-emerald-600" />,
      title: "Investor / Trader",
    };
  if (
    t.includes("konsultan") ||
    t.includes("consultant") ||
    t.includes("advisory")
  )
    return {
      icon: <Lightbulb size={22} className="text-emerald-600" />,
      title: "Konsultan",
    };
  if (t.includes("peneliti") || t.includes("research") || t.includes("riset"))
    return {
      icon: <FlaskConical size={22} className="text-emerald-600" />,
      title: "Peneliti",
    };
  if (
    t.includes("sains") ||
    t.includes("scientist") ||
    t.includes("laboratori")
  )
    return {
      icon: <Microscope size={22} className="text-emerald-600" />,
      title: "Ilmuwan / Saintis",
    };
  if (
    t.includes("dokter") ||
    t.includes("medis") ||
    t.includes("kesehatan") ||
    t.includes("health")
  )
    return {
      icon: <Stethoscope size={22} className="text-emerald-600" />,
      title: "Tenaga Medis",
    };
  if (
    t.includes("guru") ||
    t.includes("dosen") ||
    t.includes("pengajar") ||
    t.includes("pendidik")
  )
    return {
      icon: <BookOpen size={22} className="text-emerald-600" />,
      title: "Pendidik",
    };
  if (
    t.includes("desain") ||
    t.includes("designer") ||
    t.includes("kreatif") ||
    t.includes("ux")
  )
    return {
      icon: <PenTool size={22} className="text-emerald-600" />,
      title: "Designer",
    };
  if (
    t.includes("logistik") ||
    t.includes("supply chain") ||
    t.includes("distribusi")
  )
    return {
      icon: <Factory size={22} className="text-emerald-600" />,
      title: "Logistik / Supply Chain",
    };
  if (
    t.includes("teknik") ||
    t.includes("engineer") ||
    t.includes("manufaktur")
  )
    return {
      icon: <Wrench size={22} className="text-emerald-600" />,
      title: "Engineer / Teknik",
    };
  if (
    t.includes("statistik") ||
    t.includes("matematik") ||
    t.includes("statistika")
  )
    return {
      icon: <Calculator size={22} className="text-emerald-600" />,
      title: "Statistisi / Matematikawan",
    };
  if (
    t.includes("ngo") ||
    t.includes("sosial") ||
    t.includes("lsm") ||
    t.includes("nirlaba")
  )
    return {
      icon: <HeartHandshake size={22} className="text-emerald-600" />,
      title: "Organisasi Sosial",
    };
  if (
    t.includes("pemerintah") ||
    t.includes("asn") ||
    t.includes("birokrasi") ||
    t.includes("aparatur")
  )
    return {
      icon: <FileText size={22} className="text-emerald-600" />,
      title: "ASN / Pemerintahan",
    };
  if (
    t.includes("pekerja") ||
    t.includes("profesional") ||
    t.includes("karyawan")
  )
    return {
      icon: <Briefcase size={22} className="text-emerald-600" />,
      title: "Profesional",
    };

  // Default fallback
  return {
    icon: <ClipboardList size={22} className="text-emerald-600" />,
    title: "Peserta Umum",
  };
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface ForWhoSectionProps {
  target: AyclSection | null;
}

export default function ForWhoSection({ target }: ForWhoSectionProps) {
  // Jika tidak ada section TARGET, section tidak dirender
  if (!target) return null;

  const items: string[] = target.content?.items ?? [];

  if (items.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-emerald-50">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-emerald-600 font-medium text-sm uppercase tracking-widest mb-2">
          Untuk Kamu
        </p>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10">
          Cocok untuk Siapa?
        </h2>

        <div className="space-y-4">
          {Array.from({ length: Math.ceil(items.length / 2) }).map(
            (_, rowIndex) => {
              const rowItems = items.slice(rowIndex * 2, rowIndex * 2 + 2);

              return (
                <div key={rowIndex} className="flex justify-center gap-4">
                  {rowItems.map((desc, i) => {
                    const { icon, title } = getTargetMeta(desc);

                    return (
                      <div
                        key={i}
                        className="flex gap-4 items-start bg-white border border-emerald-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition w-full max-w-[420px] text-left"
                      >
                        <div className="bg-emerald-50 rounded-lg p-2 shrink-0">
                          {icon}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {title}
                          </p>
                          <p className="text-gray-500 font-medium text-sm mt-0.5 leading-relaxed">
                            {desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}
