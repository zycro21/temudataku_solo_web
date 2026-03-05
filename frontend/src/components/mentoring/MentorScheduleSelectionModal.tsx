"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Clock, Wrench, Video } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { useState, useEffect } from "react";
import MentorCalendar from "./MentorCalendar";
import Image from "next/image";
import DetailMentoringModal from "./DetailMentoringModal";

interface MentorScheduleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: any | null;
  service: any | null;
}

export default function MentorScheduleSelectionModal({
  isOpen,
  onClose,
  mentor,
  service,
}: MentorScheduleSelectionModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(true);

  useEffect(() => {
    if (selectedDate) setShowSummary(true);
  }, [selectedDate]);

  if (!mentor) return null;

  // Mapping backend day
  const dayMap: Record<number, string> = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
  };

  const availability = mentor.availabilitySchedule || {};

  // Hitung durasi slot dalam menit dari format "HH.MM - HH.MM"
  const getSlotDurationInMinutes = (slot: string) => {
    const [startStr, endStr] = slot.split(" - ");
    if (!startStr || !endStr) return 0;

    const [startH, startM] = startStr.split(".").map(Number);
    const [endH, endM] = endStr.split(".").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return endMinutes - startMinutes;
  };

  const selectedSlotDuration = selectedTime
    ? getSlotDurationInMinutes(selectedTime)
    : 0;

  const parseTimeRange = (slot: string) => {
    const [startStr, endStr] = slot.split(" - ");

    const [startHour, startMinute] = startStr.split(".").map(Number);
    const [endHour, endMinute] = endStr.split(".").map(Number);

    return {
      startTime: { hour: startHour, minute: startMinute },
      endTime: { hour: endHour, minute: endMinute },
    };
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-7xl min-h-[75vh] max-h-[95vh] overflow-hidden p-0"
          onInteractOutside={(e) => {
            e.preventDefault(); // prevent close on outside click
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault(); // prevent close on ESC
          }}
        >
          <VisuallyHidden>
            <DialogTitle>Pilih Mentor</DialogTitle>
          </VisuallyHidden>

          <div
            className={`grid grid-cols-1 sm:grid-cols-3 sm:grid-rows-[1fr_auto] divide-x divide-gray-200 h-full`}
          >
            {/* COLUMN 1 — Mentor Info */}
            <div
              className={`flex flex-col px-3 ${
                !selectedDate ? "justify-start h-full" : "h-full"
              }`}
            >
              <div className="flex flex-col items-center text-center pt-6 pb-4">
                <Image
                  src={
                    mentor.user.profilePicture
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${mentor.user.profilePicture}`
                      : "/assets/default-avatar.png"
                  }
                  alt={mentor.user.fullName}
                  width={130}
                  height={130}
                  unoptimized
                  className="rounded-full object-cover aspect-square"
                />

                <div className="w-full text-left mt-3">
                  <h3 className="text-xl font-bold">{mentor.user.fullName}</h3>
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                    {mentor.bio || "-"}
                  </p>
                  {/* LinkedIn Button */}
                  {mentor.linkedin && (
                    <a
                      href={mentor.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-2 px-6 py-2.5 text-sm">
                        <FaLinkedin className="text-white w-5 h-5" />
                        <span className="leading-none">Lihat Profil</span>
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              <div className="px-3 py-3 space-y-3 text-sm text-black mb-4">
                <div className="flex items-center space-x-2">
                  <Clock size={18} className="text-gray-400" />
                  <span className="font-medium">
                    {selectedSlotDuration > 0
                      ? `${selectedSlotDuration} Menit`
                      : "Pilih waktu"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Video size={18} className="text-gray-400" />
                  <span className="font-medium">Zoom Meeting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wrench size={18} className="text-gray-400" />
                  <span className="font-medium">WIB (UTC+7)</span>
                </div>
              </div>
            </div>

            {/* COLUMN 2 — Calendar */}
            <div
              className={`flex flex-col px-4 ${
                !selectedDate ? "justify-start h-full" : "h-full"
              }`}
            >
              <div className="flex flex-col items-start text-left pt-6 pb-1">
                <h2 className="text-lg font-semibold">Atur Jadwalmu</h2>
                <p className="text-[8.5px] text-gray-500 mt-1">
                  Tentukan tanggal dan bulan yang paling pas buat-mu 
                </p>
              </div>

              <MentorCalendar
                mentor={mentor}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>

            {/* COLUMN 3 — Time */}
            <div
              className={`flex flex-col px-4 ${
                !selectedDate ? "justify-start h-full" : "h-full"
              }`}
            >
              <div className="flex flex-col items-start text-left pt-6 pb-3">
                <h2 className="text-lg font-semibold">Pilih Waktu</h2>
                <p className="text-[8.5px] text-gray-500 mt-1">
                  Tentukan jam yang paling pas buat-mu
                </p>
              </div>

              <div className="mt-4">
                {selectedDate ? (
                  (() => {
                    const dayKey = dayMap[selectedDate.getDay()];
                    const times: string[] = availability[dayKey] || [];

                    if (times.length === 0) {
                      return (
                        <p className="text-sm text-gray-500">
                          Mentor tidak ada jadwal
                        </p>
                      );
                    }

                    return (
                      <div className="flex flex-col space-y-2">
                        {times.map((time, idx) => {
                          const isSelected = selectedTime === time;

                          return (
                            <Button
                              key={idx}
                              variant="outline"
                              onClick={() =>
                                setSelectedTime(isSelected ? null : time)
                              }
                              className={`w-full text-sm transition-colors ${
                                isSelected
                                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                  : selectedTime
                                    ? "bg-white text-gray-400 hover:bg-gray-200"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {time}
                            </Button>
                          );
                        })}
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-sm text-gray-400">Pilih tanggal dulu</p>
                )}
              </div>
            </div>

            {/* SUMMARY */}
            {selectedDate &&
              showSummary &&
              (() => {
                const dayKey = dayMap[selectedDate.getDay()];
                const times: string[] = availability[dayKey] || [];
                if (times.length === 0) return null;

                return (
                  <div className="sm:col-start-2 sm:col-span-2 sm:row-start-2 col-span-1 bg-gray-100 p-4 text-sm text-gray-800 relative">
                    <p className="font-medium mb-2">
                      Berikut jadwal mentoring-mu:
                    </p>
                    <p className="text-lg font-bold">
                      {selectedDate.toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      {selectedTime && (
                        <>
                          <span className="ml-1 font-normal text-lg">
                            pukul{" "}
                          </span>
                          <span className="font-bold text-lg">
                            {selectedTime} WIB
                          </span>
                        </>
                      )}
                    </p>

                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-md border border-emerald-600 text-emerald-600 bg-white hover:bg-emerald-50 transition"
                        onClick={() => setShowSummary(false)}
                      >
                        Batal
                      </button>

                      <button
                        type="button"
                        disabled={!selectedTime}
                        className={`px-4 py-2 rounded-md border transition ${
                          selectedTime
                            ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                            : "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                        }`}
                        onClick={() => {
                          setIsModalOpen(true);
                          onClose();
                        }}
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                );
              })()}
          </div>
        </DialogContent>
      </Dialog>

      <DetailMentoringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mentor={mentor}
        service={service}
        date={selectedDate}
        time={selectedTime}
        timeRange={selectedTime ? parseTimeRange(selectedTime) : null}
      />
    </>
  );
}
