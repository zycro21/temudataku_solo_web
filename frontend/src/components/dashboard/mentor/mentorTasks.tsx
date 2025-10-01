"use client";

import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function MentorTasks() {
  const router = useRouter();

  const [weekSessions, setWeekSessions] = useState<number | null>(null);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(true);

  const [pendingReports, setPendingReports] = useState<number | null>(null);
  const [loadingReports, setLoadingReports] = useState<boolean>(true);

  const [pendingProjects, setPendingProjects] = useState<number | null>(null);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);

  useEffect(() => {
    // Fetch sesi mentoring minggu ini
    const fetchSessions = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/mentor/own-mentoring-sessions`,
          { withCredentials: true }
        );

        if (res.data) {
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          const sessionsThisWeek = res.data.filter(
            (s: any) =>
              new Date(s.date) >= startOfWeek && new Date(s.date) <= endOfWeek
          );

          setWeekSessions(sessionsThisWeek.length);
        }
      } catch (err) {
        console.error("Gagal fetch sesi mentor:", err);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, []);

  useEffect(() => {
    // Fetch pending reports
    const fetchPendingReports = async () => {
      try {
        const [sessionsRes, reportsRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/mentor/own-mentoring-sessions`,
            { withCredentials: true }
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorReports/mentor/reports?limit=1000`,
            { withCredentials: true }
          ),
        ]);

        const sessions: any[] = sessionsRes.data;
        const reports: any[] = reportsRes.data?.data || [];

        const reportedSessionIds = new Set(reports.map((r) => r.sessionId));
        const pending = sessions.filter(
          (s) => !reportedSessionIds.has(s.id)
        ).length;

        setPendingReports(pending);
      } catch (err) {
        console.error("Gagal fetch sesi atau laporan mentor:", err);
      } finally {
        setLoadingReports(false);
      }
    };

    fetchPendingReports();
  }, []);

  useEffect(() => {
    // Fetch Proyek Mentee yang belum direview
    const fetchPendingProjects = async () => {
      try {
        setLoadingProjects(true);
        const projectsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/project/mentor/projects`,
          { withCredentials: true }
        );

        const projects: any[] = projectsRes.data.data || [];

        // Fetch semua submissions per project
        const submissionsPromises = projects.map((p) =>
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/project/mentorsProjects/${p.id}/submissions`,
            { withCredentials: true }
          )
        );

        const submissionsResults = await Promise.all(submissionsPromises);

        let pendingCount = 0;

        submissionsResults.forEach((res) => {
          const submissions: any[] = res.data.data || [];
          pendingCount += submissions.filter(
            (s) => s.isReviewed === false
          ).length;
        });

        setPendingProjects(pendingCount);
      } catch (err) {
        console.error("Gagal fetch proyek mentee:", err);
        setPendingProjects(0);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchPendingProjects();
  }, []);

  const tasks = [
    {
      id: 1,
      title: "Sesi Mentoring",
      description: loadingSessions
        ? "Memuat sesi..."
        : weekSessions && weekSessions > 0
        ? `Terdapat ${weekSessions} sesi mentoring Anda pada minggu ini`
        : "Tidak Ada sesi mentoring Anda pada minggu ini",
      icon: "/assets/dashboard/mentor/sesi.svg",
      link: "/dashboard/mentor/services",
    },
    {
      id: 2,
      title: "Laporan Mentor",
      description: loadingReports
        ? "Memuat laporan..."
        : pendingReports && pendingReports > 0
        ? `Terdapat ${pendingReports} sesi yang belum Anda isi laporan mentornya`
        : "Semua laporan mentor sudah terisi",
      icon: "/assets/dashboard/mentor/laporanhijau.svg",
      link: "/dashboard/mentor/report",
    },
    {
      id: 3,
      title: "Proyek Mentee",
      description: loadingProjects
        ? "Memuat proyek..."
        : pendingProjects && pendingProjects > 0
        ? `Terdapat ${pendingProjects} proyek mentee yang belum Anda review`
        : "Semua proyek mentee sudah direview",
      icon: "/assets/dashboard/mentor/proyek.svg",
      link: "/dashboard/mentor/services/project",
    },
  ];

  const formatDescription = (text: string) => {
    const regex =
      /(Terdapat \d+ (?:sesi|proyek mentee)|Tidak Ada (?:sesi|proyek mentee)|Semua laporan mentor sudah terisi|Semua proyek mentee sudah direview)/i;

    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-pink-500 font-semibold">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <Card className="w-full h-full px-0 py-2 flex flex-col justify-between hover:shadow-md transition-all duration-200 rounded-md">
      <CardHeader className="flex items-center justify-between px-6 pt-3 pb-0">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/dashboard/mentor/task.svg"
            alt="icon"
            width={12}
            height={12}
            className="relative top-[-1px]"
          />
          <CardTitle className="text-md font-medium text-gray-500 leading-none">
            Tanggungan Mentor
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-6 pt-0 pb-6">
        <div className="flex flex-col gap-5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="w-full border rounded-lg px-5 py-6 flex items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Image
                    src={task.icon}
                    alt={task.title}
                    width={14}
                    height={14}
                  />
                  <h3 className="font-medium text-gray-800">{task.title}</h3>
                </div>

                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                  {formatDescription(task.description)}
                </p>
              </div>

              <div className="flex items-center self-stretch">
                <Button
                  variant="outline"
                  className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 hover:text-emerald-900 text-sm px-3 py-1.5"
                  onClick={() => router.push(task.link)}
                >
                  Lihat Detail
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
