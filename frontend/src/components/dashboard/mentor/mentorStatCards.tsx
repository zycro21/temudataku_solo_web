"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

// Helper: cek apakah date masuk minggu berjalan
function isThisWeek(date: Date) {
  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return localDate >= startOfWeek && localDate <= endOfWeek;
}

export default function MentorStatCards() {
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionChange, setSessionChange] = useState(0);

  const [projectCount, setProjectCount] = useState(0);
  const [projectChange, setProjectChange] = useState(0);

  const [reportCount, setReportCount] = useState(0);
  const [reportChange, setReportChange] = useState(0);

  const [feedbackCount, setFeedbackCount] = useState(0);
  const [feedbackChange, setFeedbackChange] = useState(0);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentoringSession/mentor/own-mentoring-sessions`,
          { withCredentials: true }
        );

        const sessions = res.data;
        setSessionCount(sessions.length);

        // weekly change pakai createdAt
        const newThisWeek = sessions.filter((s: any) =>
          isThisWeek(new Date(s.createdAt))
        );
        setSessionChange(newThisWeek.length);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/project/mentor/projects?page=1&limit=1000`,
          { withCredentials: true }
        );

        const { data, pagination } = res.data;
        setProjectCount(pagination.total);

        const newThisWeek = data.filter((p: any) =>
          isThisWeek(new Date(p.createdAt))
        );
        setProjectChange(newThisWeek.length);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    const fetchReports = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/mentorReports/mentor/reports?page=1&limit=1000`,
          { withCredentials: true }
        );

        const { data, pagination } = res.data;
        setReportCount(pagination.total);

        const newThisWeek = data.filter((r: any) =>
          isThisWeek(new Date(r.createdAt))
        );
        setReportChange(newThisWeek.length);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feedback/mentor/feedbacks?limit=1000`,
          { withCredentials: true }
        );

        const { data } = res.data;
        setFeedbackCount(data.length);

        const newThisWeek = data.filter((f: any) =>
          isThisWeek(new Date(f.submittedDate))
        );
        setFeedbackChange(newThisWeek.length);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchSessions();
    fetchProjects();
    fetchReports();
    fetchFeedbacks();
  }, []);

  const stats = [
    {
      title: "Jumlah Sesi",
      value: sessionCount,
      change: `+${sessionChange} minggu ini`,
      image: "/assets/dashboard/mentor/report.svg",
      link: "/dashboard/mentor/schedule",
    },
    {
      title: "Jumlah Proyek",
      value: projectCount,
      change: `+${projectChange} minggu ini`,
      image: "/assets/dashboard/mentor/tandaseru.svg",
      link: "/dashboard/mentor/services",
    },
    {
      title: "Jumlah Laporan",
      value: reportCount,
      change: `+${reportChange} minggu ini`,
      image: "/assets/dashboard/mentor/laporan.svg",
      link: "/dashboard/mentor/report",
    },
    {
      title: "Jumlah Umpan Balik",
      value: feedbackCount,
      change: `+${feedbackChange} minggu ini`,
      image: "/assets/dashboard/mentor/tandaseru.svg",
      link: "/dashboard/mentor/feedback",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {stats.map((item, idx) => (
        <Link key={idx} href={item.link}>
          <Card
            className="max-w-[360px] w-full flex flex-col justify-between px-0 py-2
                       shadow-sm hover:shadow-md hover:-translate-y-1 transform transition-all duration-200
                       cursor-pointer rounded-md"
          >
            <CardHeader className="flex items-center justify-between px-6 pt-2 pb-0">
              <div className="flex items-center gap-2">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={28}
                  height={28}
                  className="w-5 h-5 object-contain opacity-90"
                />
                <CardTitle className="text-base font-medium text-gray-500">
                  {item.title}
                </CardTitle>
              </div>

              <CardAction className="text-gray-600">
                <ChevronRight className="h-5 w-5" />
              </CardAction>
            </CardHeader>

            <CardContent className="px-6 pt-1 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-3xl font-semibold text-gray-900">
                  {item.value}
                </h3>
                <span className="inline-block text-sm font-medium text-emerald-700 bg-green-200 px-3 py-1 rounded-full">
                  {item.change}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
