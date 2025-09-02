// src/components/dashboard/user/calendarSection.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

type EventType = "class" | "mentoring" | "bootcamp" | "other";

interface CalendarEvent {
  title: string;
  type: EventType;
}

export default function CalendarSection() {
  const [currentDate, setCurrentDate] = useState(new Date()); // ikut hari ini
  const today = new Date();

  const events: Record<string, CalendarEvent[]> = {
    "2025-09-02": [{ title: "Bootcamp React", type: "bootcamp" }],
    "2025-09-05": [
      { title: "AI Class", type: "class" },
      { title: "Mentoring", type: "mentoring" },
      { title: "Mentoring-2", type: "mentoring" },
      { title: "AI Advanced", type: "class" },
    ],
  };

  const daysInWeek = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  const getCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: Date[] = [];

    // Start dari minggu pertama (mundur ke Minggu)
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    // End sampai Sabtu terakhir
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    // Loop semua tanggal dari startDate ke endDate
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = getCalendarDays(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  const goToPrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const getEventStyle = (type: EventType) => {
    switch (type) {
      case "class":
        return "bg-red-400 text-white";
      case "mentoring":
        return "bg-yellow-400 text-white";
      case "bootcamp":
        return "bg-blue-500 text-white";
      default:
        return "bg-emerald-500 text-white";
    }
  };

  const isSameDate = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  return (
    <div className="bg-white pt-1 px-6 pb-6 h-fit">
      {/* Header Kalender */}
      <div className="flex justify-between items-center mb-4">
        {/* Kiri: Bulan + Tahun */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center border border-gray-400 rounded-md px-3 py-1 cursor-pointer">
            <span className="text-lg font-semibold text-gray-800">
              {monthNames[currentDate.getMonth()]}
            </span>
            <ChevronDown className="w-4 h-4 ml-1 text-gray-600" />
          </div>
        </div>

        {/* Kanan: Navigasi bulan */}
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <span className="text-lg font-semibold text-gray-800 whitespace-nowrap">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Grid Kalender */}
      <div className="grid grid-cols-7 border border-gray-300 text-sm">
        {/* Nama Hari */}
        {daysInWeek.map((day, index) => (
          <div
            key={index}
            className="py-2 px-2 font-medium text-gray-500 border-b border-r border-gray-300 text-left"
          >
            {day}
          </div>
        ))}

        {/* Tanggal */}
        {calendarDays.map((date, index) => {
          const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

          const dayEvents = events[formattedDate] || [];
          const isToday = isSameDate(date, today);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();

          return (
            <div
              key={index}
              className={`group relative border-b border-r border-gray-300 p-1.5 min-h-[100px] flex flex-col ${
                !isCurrentMonth ? "bg-gray-100 text-gray-400" : ""
              }`}
            >
              {/* Tooltip Today */}
              {isToday && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition">
                  Today
                </span>
              )}

              {/* Tanggal kiri atas */}
              <div
                className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? "bg-emerald-500 text-white" : ""
                }`}
              >
                {date.getDate()}
              </div>

              {/* Event */}
              <div className="space-y-1 mt-1 text-xs flex-1 overflow-hidden">
                {dayEvents.slice(0, 2).map((event, eventIndex) => (
                  <span
                    key={eventIndex}
                    className={`block w-full rounded-sm py-0.5 px-1 text-left ${getEventStyle(
                      event.type
                    )}`}
                  >
                    {event.title}
                  </span>
                ))}

                {dayEvents.length > 2 && (
                  <span className="block text-xs text-gray-400 text-left">
                    +{dayEvents.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex items-center space-x-4 mt-4 text-sm">
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 bg-red-400 rounded-sm"></span>
          <span>Class</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 bg-yellow-400 rounded-sm"></span>
          <span>Mentoring</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 bg-blue-500 rounded-sm"></span>
          <span>Bootcamp</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
          <span>Other</span>
        </div>
      </div>
    </div>
  );
}
