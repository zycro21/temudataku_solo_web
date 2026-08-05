"use client";

import { FolderKanban, Send, CheckCircle2 } from "lucide-react";

interface Props {
  totalAssignments: number;
  totalSubmitted: number;
  totalReviewed: number;
  isLoading: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
  isLoading,
}: {
  icon: any;
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}
      >
        <Icon size={22} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        {isLoading ? (
          <div className="mt-1 h-7 w-14 animate-pulse rounded bg-gray-200" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function AssignmentStatsCards({
  totalAssignments,
  totalSubmitted,
  totalReviewed,
  isLoading,
}: Props) {
  const totalPending = Math.max(totalSubmitted - totalReviewed, 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={FolderKanban}
        label="Total Projek"
        value={totalAssignments}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        isLoading={isLoading}
      />
      <StatCard
        icon={Send}
        label="Submission Terkirim"
        value={totalSubmitted}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
        isLoading={isLoading}
      />
      <StatCard
        icon={CheckCircle2}
        label="Sudah Dinilai"
        value={totalReviewed}
        iconBg="bg-teal-100"
        iconColor="text-teal-600"
        isLoading={isLoading}
      />
      <StatCard
        icon={Send}
        label="Belum Dinilai"
        value={totalPending}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        isLoading={isLoading}
      />
    </div>
  );
}
