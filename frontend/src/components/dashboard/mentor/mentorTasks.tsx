"use client";

import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function MentorTasks() {
  const router = useRouter();

  const tasks = [
    {
      id: 1,
      title: "Sesi Mentoring",
      description: "Terdapat 2 sesi mentoring Anda pada minggu ini",
      icon: "/assets/dashboard/mentor/sesi.svg",
      link: "/dashboard/mentor/services",
    },
    {
      id: 2,
      title: "Laporan Mentor",
      description: "Terdapat 3 sesi yang belum Anda isi laporan mentornya",
      icon: "/assets/dashboard/mentor/laporanhijau.svg",
      link: "/dashboard/mentor/report",
    },
    {
      id: 3,
      title: "Proyek Mentee",
      description: "Terdapat 12 proyek mentee yang belum Anda review",
      icon: "/assets/dashboard/mentor/proyek.svg",
      link: "/dashboard/mentor/services/project",
    },
  ];

  const formatDescription = (text: string) => {
    // Regex: tangkap "Terdapat (angka) sesi" atau "Terdapat (angka) proyek mentee"
    const regex = /(Terdapat \d+ (?:sesi|proyek mentee))/i;

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
      {/* Header */}
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

      {/* Content */}
      <CardContent className="px-6 pt-0 pb-6">
        <div className="flex flex-col gap-5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="w-full border rounded-lg px-5 py-6 flex items-center justify-between gap-4"
            >
              {/* Left: icon + title + description */}
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

              {/* Right: action button */}
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
