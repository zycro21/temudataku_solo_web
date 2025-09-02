// src/components/dashboard/user/scheduleSection.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

// Data dummy jadwal per tanggal
const allSchedules: Record<
  string,
  { title: string; time: string; linkText: string }[]
> = {
  "2025-09-02": [
    {
      title: "Data Science Class",
      time: "Hari Ini, 10.00 - 12.00",
      linkText: "Zoom Meeting",
    },
    {
      title: "Mentoring 1 on 1",
      time: "Hari Ini, 15.00 - 16.00",
      linkText: "Zoom Meeting",
    },
    {
      title: "Extra Session",
      time: "Hari Ini, 19.00 - 20.00",
      linkText: "Zoom Meeting",
    },
  ],
  "2025-09-03": [
    {
      title: "Team Sync",
      time: "Besok, 09.00 - 10.00",
      linkText: "Google Meet",
    },
  ],
};

// SVG Zoom Icon
const ZoomIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 mr-2 fill-current"
    viewBox="0 0 24 24"
  >
    <path d="M23 7.5v9a1 1 0 0 1-1.6.8l-4.4-3.3v2.5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.5l4.4-3.3A1 1 0 0 1 23 7.5z" />
  </svg>
);

export default function ScheduleSection() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);

  // Ambil awal minggu (Senin)
  const getStartOfWeek = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay(); // 0 = Minggu
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    return start;
  };

  const startOfWeek = getStartOfWeek(currentDate);

  // Buat daftar tanggal Senin - Minggu
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  // Navigasi minggu
  const goToPrevWeek = () => {
    const prev = new Date(startOfWeek);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(startOfWeek);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  // Generate bulan -6 sampai +6 dari bulan sekarang
  const monthOptions = Array.from({ length: 13 }, (_, i) => {
    const date = new Date(today);
    date.setMonth(today.getMonth() - 6 + i);
    return {
      label: date.toLocaleString("id-ID", { month: "long", year: "numeric" }),
      value: `${date.getFullYear()}-${date.getMonth()}`,
      date,
    };
  });

  const currentValue = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

  // State untuk hari yang dipilih
  const [selectedDate, setSelectedDate] = useState(today);

  const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

  const scheduleItems = allSchedules[formatDateKey(selectedDate)] || [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      {/* Header section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Jadwal</h2>
        <div className="relative">
          <select
            value={currentValue}
            onChange={(e) => {
              const [year, month] = e.target.value.split("-").map(Number);
              const newDate = new Date(year, month, 1);
              setCurrentDate(newDate);
              setSelectedDate(newDate);
            }}
            className="appearance-none bg-transparent pr-6 text-sm font-medium text-gray-600 cursor-pointer capitalize"
          >
            {monthOptions.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Date navigation section */}
      <div className="flex items-center justify-between mb-4">
        <ChevronLeft
          className="w-5 h-5 text-gray-400 cursor-pointer"
          onClick={goToPrevWeek}
        />
        <div className="flex items-center space-x-2.5">
          {weekDates.map((date, index) => {
            const isSelected =
              date.toDateString() === selectedDate.toDateString();
            return (
              <div
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center justify-center w-12 h-16 rounded-lg cursor-pointer transition-colors
        ${
          isSelected
            ? "bg-emerald-600 text-white font-semibold shadow-lg"
            : "text-gray-600 hover:bg-gray-100"
        }`}
              >
                <span className="text-base font-semibold">
                  {date.getDate()}
                </span>
                <span className="text-sm mt-1">{days[index]}</span>
              </div>
            );
          })}
        </div>
        <ChevronRight
          className="w-5 h-5 text-gray-400 cursor-pointer"
          onClick={goToNextWeek}
        />
      </div>

      {/* Schedule list */}
      <div
        className={`space-y-4 ${
          scheduleItems.length > 1
            ? "max-h-[110px] overflow-y-auto pr-2 scroll-thin"
            : ""
        }`}
      >
        {scheduleItems.length > 0 ? (
          scheduleItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex flex-col">
                <span className="text-base font-medium text-gray-800">
                  {item.title}
                </span>
                <span className="text-sm text-gray-500 mt-1">{item.time}</span>
              </div>
              <a
                href="#"
                className="flex items-center text-sm font-medium text-blue-600 bg-white border border-white rounded-full px-3 py-1 shadow-sm hover:bg-gray-50 transition-colors"
              >
                {item.linkText === "Zoom Meeting" && <ZoomIcon />}
                {item.linkText}
              </a>
            </div>
          ))
        ) : (
          <div className="p-14 text-center text-gray-500 text-sm bg-gray-50 rounded-xl">
            Tidak ada jadwal untuk anda hari ini
          </div>
        )}
      </div>
    </div>
  );
}
