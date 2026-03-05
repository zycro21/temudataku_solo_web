"use client";

import { useState, useRef } from "react";
import {
  DayPicker,
  useDayPicker,
  type MonthCaptionProps,
} from "react-day-picker";
import "react-day-picker/dist/style.css";

interface TimeSlot {
  start: string;
  end: string;
}

interface Availability {
  day: string;
  times: TimeSlot[];
}

interface MentorSchedule {
  id: number;
  name: string;
  image: string;
  description: string;
  linkedin: string;
  availabilitySchedule: Record<string, string[]>;
}

interface CalendarProps {
  mentor: MentorSchedule;
  selectedDate: Date | null; // dikontrol parent
  onSelectDate: (date: Date | null) => void; // event handler ke parent
}

/** Custom caption untuk v9: judul di tengah, chevron di kiri/kanan */
function CenteredMonthCaption({ calendarMonth }: MonthCaptionProps) {
  const { previousMonth, nextMonth, goToMonth } = useDayPicker();
  const label = calendarMonth.date.toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });
  return (
    <div className="relative flex items-center justify-center px-2 py-3 mb-4">
      {previousMonth && (
        <button
          type="button"
          aria-label="Bulan sebelumnya"
          className="absolute left-0 p-2 text-black hover:text-gray-700 text-2xl"
          onClick={() => goToMonth(previousMonth)}
        >
          &#60;
        </button>
      )}
      <div className="font-semibold text-2xl text-center">{label}</div>
      {nextMonth && (
        <button
          type="button"
          aria-label="Bulan selanjutnya"
          className="absolute right-0 p-2 text-black hover:text-gray-700 text-2xl"
          onClick={() => goToMonth(nextMonth)}
        >
          &#62;
        </button>
      )}
    </div>
  );
}

export default function MentorCalendar({
  mentor,
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const today = new Date();
  const disableDays = { before: today };

  const [month, setMonth] = useState(new Date());

  const dayMap: Record<number, string> = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
  };

  const getSlotsForDate = (date: Date) => {
    const key = dayMap[date.getDay()];
    return mentor.availabilitySchedule?.[key] || [];
  };

  return (
    <div className="mt-2 relative">
      <DayPicker
        mode="single"
        selected={selectedDate || undefined} // controlled dari parent
        onSelect={(date) => onSelectDate(date ?? null)} // kirim balik ke parent
        disabled={disableDays}
        onDayMouseEnter={(date, modifiers, e) => {
          setHoveredDate(date || null);
          if (e) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setTooltipPos({
              x: rect.left + rect.width / 2,
              y: rect.top - 10,
            });
          }
        }}
        onDayMouseLeave={() => {
          setHoveredDate(null);
          setTooltipPos(null);
        }}
        month={month}
        onMonthChange={setMonth}
        components={{
          MonthCaption: CenteredMonthCaption,
          Nav: () => <></>,
        }}
        modifiersClassNames={{
          selected: "bg-emerald-600 text-white rounded-md", // kotak hijau, teks putih
          today: "!text-black",
        }}
        formatters={{
          formatWeekdayName: (day) => {
            const hari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
            return hari[day.getDay()];
          },
        }}
        className="w-full"
      />

      {/* Tooltip */}
      {hoveredDate && tooltipPos && (
        <div
          className="fixed bg-gray-800 text-white text-xs px-2 py-1 rounded shadow z-50 pointer-events-none"
          style={{
            top: tooltipPos.y,
            left: tooltipPos.x,
            transform: "translateX(-50%)",
          }}
        >
          {getSlotsForDate(hoveredDate).length > 0 ? (
            getSlotsForDate(hoveredDate).map((slot, idx) => (
              <div key={idx}>
                {slot}
              </div>
            ))
          ) : (
            <div>Tidak ada jadwal</div>
          )}
        </div>
      )}
    </div>
  );
}
