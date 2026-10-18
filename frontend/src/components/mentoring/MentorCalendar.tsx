"use client";

import { useState, useRef } from "react";
import {
  DayPicker,
  useDayPicker,
  type MonthCaptionProps,
} from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Info } from "lucide-react";
import { createPortal } from "react-dom";

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
          className="absolute left-0 p-2 text-black hover:text-gray-700 text-lg"
          onClick={() => goToMonth(previousMonth)}
        >
          &#60;
        </button>
      )}
      <div className="font-semibold text-lg text-center">{label}</div>
      {nextMonth && (
        <button
          type="button"
          aria-label="Bulan selanjutnya"
          className="absolute right-0 p-2 text-black hover:text-gray-700 text-lg"
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

  // Booking minimal H+3 dari hari ini, biar jadwal nggak terlalu mepet.
  // Tanggal sebelum H+3 di-disable di kalender.
  const MIN_BOOKING_DAYS_AHEAD = 3;
  const minBookableDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + MIN_BOOKING_DAYS_AHEAD,
  );
  const disableDays = { before: minBookableDate };

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
    <div className="mt-1 relative text-sm">
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
              y: rect.top - 6,
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

      {/* Keterangan batas minimal booking */}
      <div className="mt-4 mb-4 flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
        <p className="text-[11px] leading-relaxed text-emerald-800">
          Booking minimal{" "}
          <span className="font-semibold">H+{MIN_BOOKING_DAYS_AHEAD}</span> dari
          hari ini. Tanggal sebelum{" "}
          <span className="font-semibold">
            {minBookableDate.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>{" "}
          tidak dapat dipilih.
        </p>
      </div>

      {/* Tooltip — di-portal ke body karena DialogContent punya transform,
          yang bikin "fixed" relatif ke modal (bukan viewport) dan posisinya geser. */}
      {hoveredDate &&
        tooltipPos &&
        createPortal(
          <div
            className="fixed bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow z-[100] pointer-events-none whitespace-nowrap"
            style={{
              top: tooltipPos.y,
              left: tooltipPos.x,
              transform: "translate(-50%, -100%)",
            }}
          >
            {hoveredDate < minBookableDate ? (
              <div>Booking minimal H+{MIN_BOOKING_DAYS_AHEAD}</div>
            ) : getSlotsForDate(hoveredDate).length > 0 ? (
              getSlotsForDate(hoveredDate).map((slot, idx) => (
                <div key={idx}>{slot}</div>
              ))
            ) : (
              <div>Tidak ada jadwal</div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
