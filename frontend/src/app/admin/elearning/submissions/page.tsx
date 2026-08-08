"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import AssignmentStatsCards from "@/components/admin/submissions/components/AssignmentStatsCards";
import AssignmentListTable from "@/components/admin/submissions/components/AssignmentListTable";

export interface AssignmentListItem {
  id: string;
  title: string;
  description: string | null;
  dueDays: number | null;
  createdAt: string;
  updatedAt: string | null;
  text: {
    id: string;
    title: string;
    subBab: {
      id: string;
      title: string;
      subChapter: {
        id: string;
        title: string;
        course: {
          id: string;
          title: string;
          mentorProfile: { id: string; userId: string } | null;
        };
      };
    };
  };
  submissions: {
    id: string;
    userId: string;
    score: number | null;
    submittedAt: string | null;
  }[];
}

export default function AdminSubmissionsPage() {
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting state
  const [sortBy, setSortBy] = useState<
    "createdAt" | "updatedAt" | "score" | "submittedAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Stats (total assignment count, submitted, reviewed)
  const [totalSubmitted, setTotalSubmitted] = useState(0);
  const [totalReviewed, setTotalReviewed] = useState(0);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningAssignment/assignments`,
        {
          withCredentials: true,
          params: {
            page,
            limit,
            search: search || undefined,
            sortBy,
            order: sortOrder,
          },
        },
      );

      const data = res.data?.data ?? [];
      setAssignments(data);

      // 🔥 Hitung stats dari semua data (backend sudah memberikan semua data sesuai filter)
      const allSubmissions = data.flatMap(
        (a: AssignmentListItem) => a.submissions,
      );
      setTotalSubmitted(allSubmissions.length);
      setTotalReviewed(
        allSubmissions.filter((s: any) => s.score !== null).length,
      );

      setTotal(res.data?.pagination?.total ?? 0);
      setTotalPages(res.data?.pagination?.totalPages ?? 1);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          "Gagal memuat daftar assignment, silakan coba lagi",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [page, limit, search, sortBy, sortOrder]);

  return (
    <div className="space-y-6 p-2 pb-15">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projek E-Learning</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pilih projek untuk melihat & menilai tugas/submission yang dikumpulkan
          mentee.
        </p>
      </div>

      <AssignmentStatsCards
        totalAssignments={total}
        totalSubmitted={totalSubmitted}
        totalReviewed={totalReviewed}
        isLoading={isLoading}
      />

      <AssignmentListTable
        assignments={assignments}
        isLoading={isLoading}
        search={search}
        onSearchChange={(v) => {
          setPage(1);
          setSearch(v);
        }}
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onLimitChange={(v) => {
          setPage(1);
          setLimit(v);
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(by, order) => {
          setPage(1);
          setSortBy(by);
          setSortOrder(order);
        }}
      />
    </div>
  );
}
