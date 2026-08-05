"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import AssignmentStatsCards from "@/components/admin/submissions/components/AssignmentStatsCards";
import AssignmentListTable from "@/components/admin/submissions/components/AssignmentListTable";

// 🔥 Bentuk data assignment yang dikembalikan GET /api/elearningAssignment/assignments
// (lihat include di ELearningAssignmentService.getAllAssignments) — dipakai
// bareng-bareng oleh page ini & kedua komponen di bawah.
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

  // 🔥 Assignment biasanya tidak sebanyak submission — jadi di sini kita
  // tarik SEMUA assignment sekaligus (limit besar, bukan sortBy score/
  // submittedAt karena itu bikin backend error, lihat catatan di chat)
  // lalu search & stats dihitung di client. Kalau nanti jumlah assignment
  // sudah ratusan+, ini sebaiknya dipindah ke server-side pagination +
  // endpoint agregat count submission tersendiri.
  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningAssignment/assignments`,
        {
          withCredentials: true,
          params: { limit: 500, sortBy: "createdAt", order: "desc" },
        },
      );
      setAssignments(res.data?.data ?? []);
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
  }, []);

  const filteredAssignments = assignments.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.text.subBab.subChapter.course.title.toLowerCase().includes(q)
    );
  });

  // 🔥 Status "sudah dicek" diturunkan dari `score !== null` — backend
  // selalu mewajibkan `score` diisi saat review (lihat reviewSubmissionSchema:
  // score wajib), jadi score !== null adalah proxy yang aman buat "sudah
  // direview", tanpa perlu field status per submission di endpoint list ini.
  const totalSubmitted = assignments.reduce(
    (sum, a) => sum + a.submissions.length,
    0,
  );
  const totalReviewed = assignments.reduce(
    (sum, a) => sum + a.submissions.filter((s) => s.score !== null).length,
    0,
  );

  return (
    <div className="space-y-6 p-2 pb-15">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Projek E-Learning
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Pilih projek untuk melihat & menilai tugas/submission yang dikumpulkan
          mentee.
        </p>
      </div>

      <AssignmentStatsCards
        totalAssignments={assignments.length}
        totalSubmitted={totalSubmitted}
        totalReviewed={totalReviewed}
        isLoading={isLoading}
      />

      <AssignmentListTable
        assignments={filteredAssignments}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
      />
    </div>
  );
}
