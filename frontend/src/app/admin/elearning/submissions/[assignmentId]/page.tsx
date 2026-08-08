"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import SubmissionStatsCards from "@/components/admin/submissions/components/[assignmentId]/components/SubmissionStatsCards";
import SubmissionsTable from "@/components/admin/submissions/components/[assignmentId]/components/SubmissionsTable";
import GradeSubmissionModal from "@/components/admin/submissions/components/[assignmentId]/components/GradeSubmissionModal";

export interface SubmissionListItem {
  id: string;
  assignmentId: string;
  userId: string;
  attemptNumber: number;
  notes: string | null;
  files: string[];
  submittedAt: string | null;
  status:
    | "PENDING"
    | "REVIEWED"
    | "REVISION_REQUIRED"
    | "APPROVED"
    | "REJECTED";
  reviewedById: string | null;
  reviewedAt: string | null;
  feedback: string | null;
  score: number | null;
  gradeBreakdown: Record<string, number> | null;
  isRevisionRequired: boolean | null;
  revisionDeadline: string | null;
  user: { id: string; fullName: string; email: string };
}

export default function AssignmentSubmissionsPage() {
  const params = useParams();
  const assignmentId = params?.assignmentId as string;

  const [assignmentTitle, setAssignmentTitle] = useState("Assignment");
  const [courseTitle, setCourseTitle] = useState<string | null>(null);

  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter & Sort state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"submittedAt" | "score">("submittedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Stats (total & pending)
  const [totalPending, setTotalPending] = useState(0);

  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionListItem | null>(null);

  const fetchAssignmentDetail = useCallback(async () => {
    if (!assignmentId) return;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningAssignment/assignments/${assignmentId}/detail`,
        { withCredentials: true },
      );
      const data = res.data?.data;
      if (data) {
        setAssignmentTitle(data.title ?? "Assignment");
        setCourseTitle(data.course?.title ?? null);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          "Gagal memuat detail assignment, silakan coba lagi",
      );
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchAssignmentDetail();
  }, [fetchAssignmentDetail]);

  const fetchSubmissions = useCallback(async () => {
    if (!assignmentId) return;
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubmission/assignments/${assignmentId}/submissions`,
        {
          withCredentials: true,
          params: {
            page,
            limit,
            search: search || undefined,
            status: statusFilter || undefined,
            sortBy,
            sortOrder,
          },
        },
      );
      setSubmissions(res.data?.data ?? []);
      setTotal(res.data?.total ?? 0);
      setTotalPages(res.data?.totalPages ?? 1);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          "Gagal memuat daftar submission, silakan coba lagi",
      );
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId, page, limit, search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const fetchStats = useCallback(async () => {
    if (!assignmentId) return;
    try {
      const [allRes, pendingRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubmission/assignments/${assignmentId}/submissions`,
          { withCredentials: true, params: { page: 1, limit: 1 } },
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubmission/assignments/${assignmentId}/submissions`,
          {
            withCredentials: true,
            params: { page: 1, limit: 1, status: "PENDING" },
          },
        ),
      ]);
      setTotal(allRes.data?.total ?? 0);
      setTotalPending(pendingRes.data?.total ?? 0);
    } catch {
      // stats gagal dimuat bukan hal fatal — tabel utama tetap jalan
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleReviewSuccess = () => {
    setSelectedSubmission(null);
    fetchSubmissions();
    fetchStats();
  };

  return (
    <div className="space-y-6 p-2 pb-15">
      <div>
        <Link
          href="/admin/elearning/submissions"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-emerald-600 transition"
        >
          <ArrowLeft size={16} />
          Kembali ke Daftar Projek
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">{assignmentTitle}</h1>
        {courseTitle && (
          <p className="mt-1 text-sm text-gray-500">{courseTitle}</p>
        )}
      </div>

      <SubmissionStatsCards
        total={total}
        pending={totalPending}
        reviewed={Math.max(total - totalPending, 0)}
      />

      <SubmissionsTable
        submissions={submissions}
        isLoading={isLoading}
        page={page}
        limit={limit}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        onLimitChange={(v) => {
          setPage(1);
          setLimit(v);
        }}
        search={search}
        onSearchChange={(v) => {
          setPage(1);
          setSearch(v);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setPage(1);
          setStatusFilter(v);
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(by, order) => {
          setPage(1);
          setSortBy(by);
          setSortOrder(order);
        }}
        onGrade={(submission) => setSelectedSubmission(submission)}
      />

      {selectedSubmission && (
        <GradeSubmissionModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
