"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface StatCard {
  title: string;
  value: number | string;
  change?: string;
  image: string;
  link: string;
}

export default function MentorStatCards() {
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: "Jumlah Proyek",
      value: "Loading...",
      change: "",
      image: "/assets/dashboard/mentor/report.svg",
      link: "/dashboard/mentor/schedule",
    },
    {
      title: "Sudah Ditinjau",
      value: "Loading...",
      image: "/assets/dashboard/mentor/tandaseru.svg",
      link: "/dashboard/mentor/services",
    },
    {
      title: "Belum Ditinjau",
      value: "Loading...",
      image: "/assets/dashboard/mentor/laporan.svg",
      link: "/dashboard/mentor/report",
    },
    {
      title: "Perlu Revisi",
      value: "Loading...",
      image: "/assets/dashboard/mentor/tandaseru.svg",
      link: "/dashboard/mentor/feedback",
    },
  ]);

  useEffect(() => {
    const fetchProjectStats = async () => {
      try {
        // ambil total proyek mentor
        const resProjects = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/project/mentor/projects?page=1&limit=1000`,
          { withCredentials: true }
        );
        const projects = resProjects.data.data;
        const totalProjects = resProjects.data.pagination.total;

        // ambil total mentee unik
        const resMentees = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/project/mentor/unique-mentees`,
          { withCredentials: true }
        );
        const totalMentees = resMentees.data.totalUniqueMentees;

        // ambil submissions semua project
        let reviewed = 0,
          pending = 0,
          revisionRequired = 0;

        for (const project of projects) {
          const resSubs = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/project/mentorsProjects/${project.id}/submissions`,
            { withCredentials: true }
          );

          resSubs.data.data.forEach((sub: any) => {
            if (sub.reviewStatus === "REVIEWED") reviewed++;
            if (sub.reviewStatus === "PENDING") pending++;
            if (sub.reviewStatus === "REVISION_REQUIRED") revisionRequired++;
          });
        }

        // update state semua card
        setStats((prev) =>
          prev.map((item) =>
            item.title === "Jumlah Proyek"
              ? {
                  ...item,
                  value: totalProjects,
                  change: `dari ${totalMentees} Peserta`,
                }
              : item.title === "Sudah Ditinjau"
              ? { ...item, value: reviewed }
              : item.title === "Belum Ditinjau"
              ? { ...item, value: pending }
              : item.title === "Perlu Revisi"
              ? { ...item, value: revisionRequired }
              : item
          )
        );
      } catch (err) {
        console.error("Gagal ambil statistik proyek mentor:", err);
        // fallback jika gagal fetch
        setStats((prev) =>
          prev.map((item) =>
            item.title === "Jumlah Proyek"
              ? { ...item, value: "-", change: "Gagal memuat" }
              : { ...item, value: "-" }
          )
        );
      }
    };

    fetchProjectStats();
  }, []);

  const getValueClass = (title: string) => {
    if (title === "Sudah Ditinjau") return "text-green-500";
    if (title === "Belum Ditinjau") return "text-yellow-500";
    if (title === "Perlu Revisi") return "text-red-500";
    return "text-gray-900";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {stats.map((item, idx) => (
        <Card
          key={idx}
          className="max-w-[360px] w-full flex flex-col justify-between px-0 py-2
                     shadow-sm rounded-md"
        >
          <CardHeader className="flex items-center justify-between px-6 pt-2 pb-0">
            <div className="flex items-center gap-2">
              <Image
                src={item.image}
                alt={item.title}
                width={28}
                height={28}
                className="w-5 h-5 object-contain opacity-90 relative top-[-1px]"
              />
              <CardTitle className="text-base font-medium text-gray-500">
                {item.title}
              </CardTitle>
            </div>
            <CardAction className="text-gray-600">
              <ChevronRight className="h-5 w-5" />
            </CardAction>
          </CardHeader>

          <CardContent className="px-6 pt-0 pb-3">
            <div className="flex items-center gap-2">
              <h3
                className={`text-3xl font-semibold ${getValueClass(
                  item.title
                )}`}
              >
                {item.value}
              </h3>

              {item.title === "Jumlah Proyek" && item.change && (
                <span className="inline-block text-sm font-medium text-emerald-700 bg-green-200 px-3 py-1 rounded-full">
                  {item.change}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
