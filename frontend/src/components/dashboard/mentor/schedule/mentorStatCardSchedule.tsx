"use client";

import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface Event {
  type: string;
  time: string;
  title: string;
  description: string;
  mentees?: any[];
  material?: string;
  notes?: string;
  zoomLink?: string;
  meetingId?: string;
  passcode?: string;
}

interface MentorStatCardsProps {
  events: Record<string, Event[]>;
}

export default function MentorStatCards({ events }: MentorStatCardsProps) {
  // flatten semua event
  const allEvents = Object.entries(events).flatMap(([date, evts]) =>
    evts.map((evt) => ({ ...evt, date }))
  );

  // total sesi
  const totalSessions = allEvents.length;

  // waktu sekarang
  const now = new Date();

  // hitung sesi selesai
  const completedSessions = allEvents.filter((evt) => {
    const [start, end] = evt.time.split("-");
    const endTime = new Date(`${evt.date}T${end.replace(".", ":")}:00`);
    return endTime < now;
  }).length;

  // cari range minggu ini (Senin - Minggu)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Senin
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // sesi minggu ini
  const sessionsThisWeek = allEvents.filter((evt) => {
    const [start] = evt.time.split("-");
    const eventTime = new Date(`${evt.date}T${start.replace(".", ":")}:00`);
    return eventTime >= startOfWeek && eventTime <= endOfWeek;
  });

  const completedThisWeek = sessionsThisWeek.filter((evt) => {
    const [_, end] = evt.time.split("-");
    const endTime = new Date(`${evt.date}T${end.replace(".", ":")}:00`);
    return endTime < now;
  });

  const stats = [
    {
      title: "Jumlah Sesi",
      value: totalSessions,
      change: `+${sessionsThisWeek.length} minggu ini`,
      image: "/assets/dashboard/mentor/report.svg",
      color: "text-gray-900",
      showChange: true,
    },
    {
      title: "Sesi Selesai",
      value: completedSessions,
      change: `+${completedThisWeek.length} minggu ini`,
      image: "/assets/dashboard/mentor/selesai.svg",
      color: "text-green-500",
      showChange: false,
    },
    {
      title: "Sesi Belum Lengkap",
      value: 5, // manual
      change: "+3 minggu ini",
      image: "/assets/dashboard/mentor/belum.svg",
      color: "text-yellow-500",
      showChange: false,
    },
    {
      title: "Sesi Dibatalkan",
      value: 2, // manual
      change: "+10 minggu ini",
      image: "/assets/dashboard/mentor/batal.svg",
      color: "text-red-500",
      showChange: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {stats.map((item, idx) => (
        <Card
          key={idx}
          className="max-w-[360px] w-full flex flex-col justify-between px-0 py-2
                     shadow-sm rounded-md"
        >
          {/* Header */}
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

          {/* Value */}
          <CardContent className="px-6 pt-0 pb-3">
            <div className="flex items-center gap-2">
              <h3 className={`text-3xl font-semibold ${item.color}`}>
                {item.value}
              </h3>
              {item.showChange && (
                <span className="inline-block text-sm font-medium text-emerald-700 bg-green-200 ml-1 px-3 py-1 rounded-full">
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
