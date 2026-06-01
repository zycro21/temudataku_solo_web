"use client";

import { Briefcase, Building2, Globe, TrendingUp } from "lucide-react";

interface SummaryData {
  totalJobs: number;
  totalCompanies: number;
  totalCountries: number;
  averageSalary: number;
}

interface SummaryCardsProps {
  data: SummaryData | null;
  loading?: boolean;
}

const formatSalary = (value: number) => {
  if (value >= 1_000_000) {
    return `Rp${(value / 1_000_000).toFixed(0)}M`;
  }
  return `Rp${value.toLocaleString("id-ID")}`;
};

const formatNumber = (value: number) => {
  return value.toLocaleString("id-ID");
};

export default function SummaryCards({ data, loading }: SummaryCardsProps) {
  const cards = [
    {
      label: "Total Jobs",
      value: data ? formatNumber(data.totalJobs) : "—",
      icon: Briefcase,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Companies",
      value: data ? formatNumber(data.totalCompanies) : "—",
      icon: Building2,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Countries",
      value: data ? formatNumber(data.totalCountries) : "—",
      icon: Globe,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Avg Salary",
      value: data ? formatSalary(data.averageSalary) : "—",
      icon: TrendingUp,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 tracking-wide uppercase">
                {card.label}
              </span>
              <div className={`${card.iconBg} p-1.5 rounded-lg`}>
                <Icon size={14} className={card.iconColor} />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-24 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-gray-800 tracking-tight">
                {card.value}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
