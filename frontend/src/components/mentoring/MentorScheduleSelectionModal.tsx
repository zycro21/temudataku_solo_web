"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Clock, Wrench, Video, Search } from "lucide-react";
import { FaLinkedin, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useState, useEffect } from "react";
import MentorCalendar from "./MentorCalendar";
import Image from "next/image";

interface MentorSchedule {
  id: number;
  name: string;
  image: string;
  description: string;
  linkedin: string;
  availability: {
    day: string;
    times: { start: string; end: string }[];
  }[];
}

interface MentorScheduleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MentorScheduleSelectionModal({
  isOpen,
  onClose,
}: MentorScheduleSelectionModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentMentorIndex, setCurrentMentorIndex] = useState(0);

  const [api, setApi] = useState<CarouselApi>();

  // listen perubahan slide
  useEffect(() => {
    if (!api) return;
    const handler = () => setCurrentMentorIndex(api.selectedScrollSnap());
    api.on("select", handler);

    return () => {
      api.off("select", handler);
    };
  }, [api]);

  const mentorSchedule: MentorSchedule[] = [
    {
      id: 1,
      name: "Vania Frederica",
      image: "/assets/mentorPage/mentors/vania.svg",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla maximus quam quis nibh elementum, mattis lobortis nulla cursus. Donec rhoncus erat nibh.",
      linkedin: "www.linkedin.com/in/mochamaddimasputrahermawan",
      availability: [
        {
          day: "Senin",
          times: [
            { start: "18.30", end: "19.15" },
            { start: "19.15", end: "20.00" },
            { start: "20.00", end: "20.45" },
          ],
        },
        {
          day: "Selasa",
          times: [
            { start: "18.30", end: "19.15" },
            { start: "19.15", end: "20.00" },
            { start: "20.00", end: "20.45" },
          ],
        },
        {
          day: "Kamis",
          times: [
            { start: "18.30", end: "19.15" },
            { start: "19.15", end: "20.00" },
            { start: "20.00", end: "20.45" },
          ],
        },
        {
          day: "Jumat",
          times: [
            { start: "18.30", end: "19.15" },
            { start: "19.15", end: "20.00" },
            { start: "20.00", end: "20.45" },
          ],
        },
        {
          day: "Sabtu",
          times: [
            { start: "18.30", end: "19.15" },
            { start: "19.15", end: "20.00" },
            { start: "20.00", end: "20.45" },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Mochamad Dimas Putra Hermawan",
      image: "/assets/mentorPage/mentors/dimas.svg",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla maximus quam quis nibh elementum, mattis lobortis nulla cursus. Donec rhoncus erat nibh.",
      linkedin: "www.linkedin.com/in/mochamaddimasputrahermawan",
      availability: [
        {
          day: "Kamis",
          times: [
            { start: "09.00", end: "09.45" },
            { start: "09.45", end: "10.30" },
            { start: "15.45", end: "16.30" },
            { start: "16.30", end: "17.15" },
            { start: "18.30", end: "19.15" },
          ],
        },
        {
          day: "Jumat",
          times: [
            { start: "09.00", end: "09.45" },
            { start: "09.45", end: "10.30" },
            { start: "15.45", end: "16.30" },
            { start: "16.30", end: "17.15" },
            { start: "18.30", end: "19.15" },
          ],
        },
        {
          day: "Sabtu",
          times: [
            { start: "09.00", end: "09.45" },
            { start: "09.45", end: "10.30" },
            { start: "10.30", end: "11.15" },
            { start: "11.15", end: "12.00" },
            { start: "15.45", end: "16.30" },
            { start: "16.30", end: "17.15" },
            { start: "18.30", end: "19.15" },
            { start: "19.15", end: "20.00" },
          ],
        },
        {
          day: "Minggu",
          times: [
            { start: "09.00", end: "09.45" },
            { start: "09.45", end: "10.30" },
            { start: "10.30", end: "11.15" },
            { start: "11.15", end: "12.00" },
            { start: "15.45", end: "16.30" },
            { start: "16.30", end: "17.15" },
            { start: "18.30", end: "19.15" },
            { start: "19.15", end: "20.00" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Jesselyn Mu",
      image: "/assets/mentorPage/mentors/jesselyn.svg",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla maximus quam quis nibh elementum, mattis lobortis nulla cursus. Donec rhoncus erat nibh.",
      linkedin: "www.linkedin.com/in/mochamaddimasputrahermawan",
      availability: [
        {
          day: "Selasa",
          times: [{ start: "20.00", end: "20.45" }],
        },
        {
          day: "Jumat",
          times: [
            { start: "18.30", end: "19.15" },
            { start: "19.15", end: "20.00" },
            { start: "20.00", end: "20.45" },
          ],
        },
        {
          day: "Sabtu",
          times: [
            { start: "18.30", end: "19.15" },
            { start: "19.15", end: "20.00" },
            { start: "20.00", end: "20.45" },
          ],
        },
        {
          day: "Minggu",
          times: [
            { start: "13.30", end: "14.15" },
            { start: "14.15", end: "15.00" },
            { start: "15.00", end: "15.45" },
            { start: "15.45", end: "16.30" },
            { start: "16.30", end: "17.15" },
            { start: "18.30", end: "19.15" },
            { start: "19.15", end: "20.00" },
            { start: "20.00", end: "20.45" },
          ],
        },
        {
          day: "Sabtu",
          times: [
            { start: "18.30", end: "19.15" },
            { start: "19.15", end: "20.00" },
            { start: "20.00", end: "20.45" },
          ],
        },
      ],
    },
    {
      id: 4,
      name: "M. Iqbal Purba",
      image: "/assets/mentorPage/mentors/iqbal.svg",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla maximus quam quis nibh elementum, mattis lobortis nulla cursus. Donec rhoncus erat nibh.",
      linkedin: "www.linkedin.com/in/mochamaddimasputrahermawan",
      availability: [
        {
          day: "Selasa",
          times: [
            { start: "19.15", end: "20.00" },
            { start: "20.00", end: "20.45" },
          ],
        },
        {
          day: "Rabu",
          times: [
            { start: "19.15", end: "20.00" },
            { start: "20.00", end: "20.45" },
          ],
        },
        {
          day: "Kamis",
          times: [
            { start: "19.15", end: "20.00" },
            { start: "20.00", end: "20.45" },
          ],
        },
      ],
    },
    {
      id: 5,
      name: "Muhamad Ali",
      image: "/assets/mentorPage/mentors/ali.svg",
      description: "Helo",
      linkedin: "www.linkedin.com/in/mochamaddimasputrahermawan",
      availability: [
        {
          day: "Selasa",
          times: [{ start: "20.00", end: "20.45" }],
        },
        {
          day: "Rabu",
          times: [{ start: "20.00", end: "20.45" }],
        },
        {
          day: "Kamis",
          times: [{ start: "20.00", end: "20.45" }],
        },
        {
          day: "Jumat",
          times: [{ start: "20.00", end: "20.45" }],
        },
        {
          day: "Sabtu",
          times: [{ start: "10.30", end: "11.15" }],
        },
        {
          day: "Minggu",
          times: [{ start: "10.30", end: "11.15" }],
        },
      ],
    },
  ];

  const activeMentor = mentorSchedule[currentMentorIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-7xl min-h-[75vh] max-h-[95vh] overflow-hidden p-0">
        <VisuallyHidden>
          <DialogTitle>Pilih Mentor</DialogTitle>
        </VisuallyHidden>
        {/* 3-row division */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-x divide-gray-200">
          {/* Column 1: Choose Mentor */}
          <div className="flex flex-col h-full px-3">
            {/* Header */}
            {/* Header dengan navigasi di kiri & kanan */}
            <div className="relative flex items-center justify-center pt-6 pb-1">
              {/* Chevron kiri */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => api?.scrollPrev()}
                disabled={currentMentorIndex === 0}
                className="absolute left-13"
              >
                <FaChevronLeft className="text-gray-500 hover:text-gray-700 w-8 h-8" />
              </Button>

              {/* Judul Header */}
              <div className="flex flex-col items-center text-center">
                <h2 className="text-xl font-semibold">Pilih Mentor</h2>
                <p className="text-xs text-gray-500 mt-2">
                  Cari mentor favorit-mu
                </p>
              </div>

              {/* Chevron kanan */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => api?.scrollNext()}
                disabled={currentMentorIndex === mentorSchedule.length - 1}
                className="absolute right-13"
              >
                <FaChevronRight className="text-gray-500 hover:text-gray-700 w-8 h-8" />
              </Button>
            </div>

            {/* Carousel Content */}
            <div className="flex-1 flex flex-col justify-between">
              <Carousel
                className="relative w-full"
                opts={{ align: "start" }}
                setApi={setApi}
              >
                <CarouselContent>
                  {mentorSchedule.map((mentor) => (
                    <CarouselItem key={mentor.id}>
                      <Card className="shadow-none border-0">
                        <CardContent className="flex flex-col items-center space-y-4 p-2 pr-1">
                          {/* Image center */}
                          <Image
                            src={mentor.image}
                            alt={mentor.name}
                            width={120}
                            height={120}
                            className="rounded-full object-cover aspect-square"
                          />

                          {/* text & button rata kiri */}
                          <div className="w-full text-left mt-3">
                            <h3 className="text-lg font-semibold">
                              {mentor.name}
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                              {mentor.description}
                            </p>
                            <Button
                              className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-2 px-4 py-2 text-xs"
                              size="sm"
                            >
                              <FaLinkedin className="text-white w-4 h-4" />
                              <span className="leading-none">Lihat Profil</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            {/* Footer Info */}
            <div className="px-3 py-3 space-y-3 text-[10px] text-black mb-4">
              <div className="flex items-center space-x-2">
                <Clock size={12} strokeWidth={2} className="text-gray-400" />
                <span>45 menit</span>
              </div>
              <div className="flex items-center space-x-2">
                <Video size={12} strokeWidth={2} className="text-gray-400" />
                <span>Zoom Meeting</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wrench size={12} strokeWidth={2} className="text-gray-400" />
                <span>WIB (UTC+7)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Choose Day */}
          <div className="flex flex-col h-full px-4">
            {/* Header */}
            <div className="flex flex-col items-start text-left pt-6 pb-1">
              <h2 className="text-lg font-semibold">Atur Jadwalmu</h2>
              <p className="text-[8.5px] text-gray-500 mt-1">
                Tentukan tanggal dan bulan yang paling pas buat-mu
              </p>
            </div>

            {/* Choose Date (Calendar) */}
            <div>
              <MentorCalendar mentor={activeMentor} />
            </div>
          </div>

          {/* Column 3: Choose Time */}
          <div className="flex flex-col h-full px-4">
            {/* Header */}
            <div className="flex flex-col items-start text-left pt-6 pb-1">
              <h2 className="text-lg font-semibold">Pilih Waktu</h2>
              <p className="text-xs text-gray-500 mt-1">
                Tentukan jam yang paling pas buat-mu
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
