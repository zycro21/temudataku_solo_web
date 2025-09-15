"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type EventType = "mentoring" | "shortclass" | "bootcamp";

interface Event {
  type: EventType;
  time: string; // format "09.15-11.00"
}

interface CalendarSectionMentorProps {
  events: Record<string, Event[]>;
}

export default function CalendarSectionMentor({
  events,
}: CalendarSectionMentorProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const eventIcons: Record<EventType, string> = {
    mentoring: "/assets/dashboard/mentor/sesimentoring.svg",
    shortclass: "/assets/dashboard/mentor/sesishortclass.svg",
    bootcamp: "/assets/dashboard/mentor/sesibootcamp.svg",
  };

  const getCalendarDays = (year: number, month: number) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDay = new Date(firstDayOfMonth);
    startDay.setDate(startDay.getDate() - startDay.getDay()); // mulai dari Minggu

    const endDay = new Date(lastDayOfMonth);
    endDay.setDate(endDay.getDate() + (6 - endDay.getDay())); // akhiri di Sabtu

    const days: Date[] = [];
    let d = new Date(startDay);
    while (d <= endDay) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
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

  const isSameDate = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const isWithinBorderRange = (date: Date) => {
    const diffDays = Math.floor(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= -5 && diffDays <= 3;
  };

  // Hitung jumlah sesi otomatis dari props
  const totalSessions = Object.values(events).reduce(
    (sum, dayEvents) => sum + dayEvents.length,
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Navigasi bulan/tahun */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 font-bold" />
          </button>
          <span className="text-lg font-semibold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 font-bold" />
          </button>
        </div>
        <span className="text-md font-semibold text-gray-600">
          Jumlah Sesi: {totalSessions}
        </span>
      </div>

      {/* Hari */}
      <div className="grid grid-cols-7 text-center mb-4">
        {daysOfWeek.map((day, idx) => (
          <div
            key={day}
            className={`text-sm font-semibold py-2 ${
              idx === 0 ? "text-emerald-400" : "text-emerald-600"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Tanggal */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, idx) => {
          const formattedDate = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

          const dayEvents = events[formattedDate] || [];
          const uniqueEvents = Array.from(
            new Set(dayEvents.map((e) => e.type))
          );

          return (
            <div
              key={idx}
              className={`h-16 flex flex-col items-center justify-center text-sm rounded-md py-1 relative
    ${
      date.getMonth() === currentDate.getMonth()
        ? "text-gray-800"
        : "bg-gray-50 text-gray-400"
    }
    ${isSameDate(date, today) ? "font-bold text-emerald-600" : ""}
    ${
      isWithinBorderRange(date)
        ? dayEvents.length > 0
          ? "border border-emerald-400 bg-gray-100"
          : "border border-emerald-400 bg-white"
        : "bg-white"
    }
  `}
              title={isSameDate(date, today) ? "Today" : undefined}
            >
              {/* Icons di atas tanggal */}
              <div className="flex gap-1 mb-0.5">
                {uniqueEvents.map((type, i) => (
                  <img
                    key={i}
                    src={eventIcons[type]}
                    alt={type}
                    className="w-2.5 h-2.5"
                  />
                ))}
              </div>

              {/* Tanggal */}
              <span>{date.getDate()}</span>

              {/* Titik hijau kecil di bawah angka kalau ada event */}
              {dayEvents.length > 0 && (
                <span className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5"></span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 text-sm">
        <p className="text-xl text-gray-700 font-bold mb-2">Keterangan:</p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/assets/dashboard/mentor/sesimentoring.svg"
              className="w-5 h-5"
              alt="mentoring"
            />
            <span className="text-gray-600">Sesi Mentoring</span>
          </div>
          <div className="flex items-center gap-2">
            <img
              src="/assets/dashboard/mentor/sesishortclass.svg"
              className="w-5 h-5"
              alt="shortclass"
            />
            <span className="text-gray-600">Sesi Shortclass</span>
          </div>
          <div className="flex items-center gap-2">
            <img
              src="/assets/dashboard/mentor/sesibootcamp.svg"
              className="w-5 h-5"
              alt="bootcamp"
            />
            <span className="text-gray-600">Sesi Bootcamp</span>
          </div>
        </div>
      </div>
    </div>
  );
}
