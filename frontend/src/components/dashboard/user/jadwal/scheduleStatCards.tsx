// src/components/dashboard/user/scheduleStatCards.tsx
"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useCalendar } from "@/components/dashboard/user/jadwal/calendarContext";

export default function ScheduleStatCards() {
  const { events } = useCalendar();
  const today = new Date();

  // Hitung total program terdaftar
  const allEvents = Object.values(events).flat();
  const totalPrograms = allEvents.length;

  // Hitung total program yang sudah lewat
  const pastPrograms = Object.entries(events).reduce((count, [date, evts]) => {
    const eventDate = new Date(date);
    if (eventDate < today) {
      return count + evts.length;
    }
    return count;
  }, 0);

  const stats = [
    {
      title: "Program Terdaftar",
      value: totalPrograms,
      icon: "/assets/dashboard/user/programterdaftar.svg",
    },
    {
      title: "Program Telah Dilakukan",
      value: pastPrograms,
      icon: "/assets/dashboard/user/programterdaftar.svg",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 justify-items-start">
      {stats.map((item, idx) => (
        <div
          key={idx}
          className="relative p-4 bg-white border border-gray-200 rounded-lg shadow-sm max-w-[240px] w-full"
        >
          {/* Chevron Right */}
          <ChevronRight className="absolute top-3 right-3 w-4 h-4 text-gray-800" />

          {/* Icon + Title */}
          <div className="flex items-center gap-2">
            <Image
              src={item.icon}
              alt={item.title}
              width={16}
              height={16}
              className="text-gray-600"
            />
            <span className="text-md text-gray-600">{item.title}</span>
          </div>

          {/* Value */}
          <div className="mt-5">
            <span className="text-3xl font-bold text-gray-900">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
