"use client";

import { Send, Clock, CheckCircle2 } from "lucide-react";

interface Props {
  total: number;
  pending: number;
  reviewed: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
}: {
  icon: any;
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}
      >
        <Icon size={22} className={iconColor} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function SubmissionStatsCards({
  total,
  pending,
  reviewed,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={Send}
        label="Total Terkirim"
        value={total}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
      />
      <StatCard
        icon={Clock}
        label="Belum Dinilai"
        value={pending}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
      />
      <StatCard
        icon={CheckCircle2}
        label="Sudah Dinilai"
        value={reviewed}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
      />
    </div>
  );
}
