"use client";

import { MapPin } from "lucide-react";

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

interface JobCardProps {
  job: Job;
  index: number;
}

const formatSalary = (min: number | null, max: number | null) => {
  if (!min && !max) return "Salary not disclosed";
  const fmt = (v: number) => `Rp${v.toLocaleString("id-ID")}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
};

const LEVEL_COLOR: Record<string, string> = {
  Junior: "bg-blue-50 text-blue-700 border-blue-200",
  Senior: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Manager: "bg-purple-50 text-purple-700 border-purple-200",
};

const WORKTYPE_COLOR: Record<string, string> = {
  Onsite: "bg-orange-50 text-orange-700 border-orange-200",
  Hybrid: "bg-teal-50 text-teal-700 border-teal-200",
  Remote: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const LEVEL_ACCENT: Record<string, string> = {
  Junior: "border-l-blue-400",
  Senior: "border-l-emerald-500",
  Manager: "border-l-purple-400",
};

export default function JobCard({ job, index }: JobCardProps) {
  const levelClass =
    LEVEL_COLOR[job.level ?? ""] ?? "bg-gray-50 text-gray-700 border-gray-200";
  const workTypeClass =
    WORKTYPE_COLOR[job.workType ?? ""] ??
    "bg-gray-50 text-gray-700 border-gray-200";
  const accentClass = LEVEL_ACCENT[job.level ?? ""] ?? "border-l-gray-200";

  const isSalaryDisclosed = job.salaryMin || job.salaryMax;

  return (
    <div
      className={`bg-white border border-gray-100 border-l-4 ${accentClass} rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-px`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="p-4 sm:p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          {/* Avatar + Title + Company */}
          <div className="flex items-start gap-3 min-w-0">
            {/* Avatar with gradient */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm">
                {job.companyName.charAt(0)}
              </span>
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 leading-snug truncate">
                {job.jobTitle}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-600 font-medium truncate">
                  {job.companyName}
                </span>
                {job.city && job.country && (
                  <>
                    <span className="text-gray-300 text-xs">·</span>
                    <span className="flex items-center gap-0.5 text-xs text-gray-400">
                      <MapPin size={10} className="shrink-0" />
                      {job.city}, {job.country}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="shrink-0 text-right">
            {isSalaryDisclosed ? (
              <span className="text-xs font-bold text-emerald-700 whitespace-nowrap bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg inline-block">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </span>
            ) : (
              <span className="text-xs text-gray-400 italic whitespace-nowrap">
                Not disclosed
              </span>
            )}
          </div>
        </div>

        {/* Dashed divider */}
        <div className="my-3 border-t border-dashed border-gray-100" />

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {job.workType && (
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${workTypeClass}`}
            >
              {job.workType}
            </span>
          )}
          {job.level && (
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${levelClass}`}
            >
              {job.level}
            </span>
          )}
          {job.experienceRequired && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-gray-50 text-gray-500 border-gray-200">
              {job.experienceRequired} Exp
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
