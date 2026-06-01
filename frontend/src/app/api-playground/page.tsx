"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Info } from "lucide-react";
import SummaryCards from "@/components/api-playground/SummaryCards";
import FilterPanel from "@/components/api-playground/FilterPanel";
import JobCard from "@/components/api-playground/JobCard";
import Pagination from "@/components/api-playground/Pagination";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Job {
  id: string;
  companyName: string;
  jobTitle: string;
  salaryMin: number | null;
  salaryMax: number | null;
  city: string | null;
  country: string | null;
  workType: string | null;
  level: string | null;
  experienceRequired: string | null;
}

interface Summary {
  totalJobs: number;
  totalCompanies: number;
  totalCountries: number;
  averageSalary: number;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse {
  summary: Summary;
  meta: Meta;
  data: Job[];
}

interface Filters {
  jobTitle: string;
  country: string;
  level: string;
  workType: string;
}

const DEFAULT_FILTERS: Filters = {
  jobTitle: "",
  country: "",
  level: "",
  workType: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApiPlaygroundPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  // activeFilters = yang benar-benar dikirim ke API (saat Apply diklik)
  const [activeFilters, setActiveFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);

  const topRef = useRef<HTMLDivElement>(null);

  // ── Fetch jobs ─────────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async (f: Filters, p: number) => {
    try {
      setLoading(true);

      const params: Record<string, string | number> = { page: p, limit: 10 };

      if (f.jobTitle) params.jobTitle = f.jobTitle;
      if (f.country) params.country = f.country;
      if (f.level) params.level = f.level;
      if (f.workType) params.workType = f.workType;

      const res = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/scrap/jobs`,
        { params },
      );

      setResponse(res.data);

      // Kumpulkan countries unik dari semua hasil untuk dropdown
      // (cukup sekali di awal, tidak tiap filter)
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch semua countries untuk dropdown (sekali saja) ─────────────────────
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/scrap/jobs`,
          { params: { limit: 100 } },
        );
        const unique = Array.from(
          new Set(
            res.data.data.map((j) => j.country).filter(Boolean) as string[],
          ),
        ).sort();
        setCountries(unique);
      } catch {
        // ignore
      }
    };
    fetchCountries();
  }, []);

  // ── Initial + re-fetch saat page atau activeFilters berubah ────────────────
  useEffect(() => {
    fetchJobs(activeFilters, page);
  }, [activeFilters, page, fetchJobs]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    setPage(1);
    setActiveFilters({ ...filters });
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setActiveFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const jobs = response?.data ?? [];
  const meta = response?.meta;
  const summary = response?.summary ?? null;

  return (
    <>
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>

      <div className="min-h-screen bg-gray-50">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50" />
          </div>
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative max-w-6xl mx-auto px-4 py-14" ref={topRef}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-emerald-200 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-white tracking-wide uppercase">
                Educational Environment
              </span>
            </div>

            {/* Title & description */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div className="max-w-2xl">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  TemuDataku
                  <span className="block text-emerald-200">API Playground</span>
                </h1>
                <p className="mt-4 text-base text-emerald-100 leading-relaxed max-w-xl">
                  Latih skill scraping, pagination, filtering, dan analisis data
                  menggunakan dataset job market yang dirancang khusus
                  untuk kebutuhan edukasi tanpa batasan rate limit.
                </p>
              </div>

              {/* Feature pills */}
              {/* <div className="flex flex-col gap-2 lg:items-end shrink-0">
                {[
                  { icon: "⚡", label: "REST API Ready" },
                  { icon: "🔍", label: "Filter & Pagination" },
                  { icon: "📊", label: "Real-ish Data Structure" },
                  { icon: "🎓", label: "100% Safe for Practice" },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5"
                  >
                    <span className="text-sm">{f.icon}</span>
                    <span className="text-xs font-medium text-white">
                      {f.label}
                    </span>
                  </div>
                ))}
              </div> */}
            </div>

            {/* Bottom info bar */}
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2">
                <Info size={13} className="text-emerald-200 shrink-0" />
                <p className="text-xs text-emerald-100">
                  Page ini{" "}
                  <span className="font-semibold text-white">
                    100% dummy data
                  </span>{" "}
                  — aman digunakan untuk membangun scraper, menguji API call,
                  dan berlatih visualisasi data.
                </p>
              </div>
              {/* <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2">
                <span className="text-xs font-mono text-emerald-200">
                  GET /api/scrap/jobs?page=1&amp;limit=10
                </span>
              </div> */}
            </div>
          </div>
        </div>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-8">
          {/* Summary Cards */}
          <SummaryCards data={summary} loading={loading} />

          <div className="mt-6 flex flex-col lg:flex-row gap-6">
            {/* ── Left: Filter Panel ─────────────────────────────────────── */}
            <div className="w-full lg:w-[35%] shrink-0">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onApply={handleApply}
                onReset={handleReset}
                countries={countries}
                loading={loading}
              />
            </div>

            {/* ── Right: Job List ────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Results header */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-500">
                  {loading ? (
                    <span className="inline-block w-32 h-3.5 bg-gray-200 rounded animate-pulse" />
                  ) : meta ? (
                    <>
                      Showing{" "}
                      <span className="font-semibold text-gray-700">
                        {(meta.page - 1) * meta.limit + 1}–
                        {Math.min(meta.page * meta.limit, meta.total)}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-gray-700">
                        {meta.total.toLocaleString("id-ID")}
                      </span>{" "}
                      jobs
                    </>
                  ) : null}
                </p>

                {meta && (
                  <p className="text-xs text-gray-400">
                    Page {meta.page} of {meta.totalPages}
                  </p>
                )}
              </div>

              {/* Job Cards */}
              {loading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse"
                    >
                      <div className="flex gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-gray-100 rounded w-1/2" />
                          <div className="h-3 bg-gray-100 rounded w-1/3" />
                          <div className="flex gap-2 mt-2">
                            <div className="h-4 w-14 bg-gray-100 rounded-full" />
                            <div className="h-4 w-14 bg-gray-100 rounded-full" />
                          </div>
                        </div>
                        <div className="space-y-2 items-end flex flex-col">
                          <div className="h-3 w-28 bg-gray-100 rounded" />
                          <div className="flex gap-1.5">
                            <div className="h-6 w-16 bg-gray-100 rounded-lg" />
                            <div className="h-6 w-20 bg-gray-100 rounded-lg" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
                  <p className="text-gray-400 text-sm">
                    No jobs found. Try adjusting your filters.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {jobs.map((job, i) => (
                    <JobCard key={job.id} job={job} index={i} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
