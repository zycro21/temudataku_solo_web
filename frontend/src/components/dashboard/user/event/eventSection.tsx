"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Tambahkan ini
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import type { EventItem } from "@/app/dashboard/user/event/page";

interface EventSectionProps {
  events: EventItem[];
}

export default function EventSection({ events }: EventSectionProps) {
  if (events.length === 0) {
    return (
      <p className="text-gray-500 text-sm mt-4">Belum ada event tersedia.</p>
    );
  }

  return (
    <div className="mb-6 mt-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

function renderDescription(text: string) {
  const lines = text.split("/n");

  return lines.map((line, index) => {
    const parts = line.split(/(\*\*.*?\*\*|_.*?_|(\*[^*]+\*))/g);

    return (
      <span key={index}>
        {parts.map((part, i) => {
          if (!part) return null;

          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }

          if (part.startsWith("_") && part.endsWith("_")) {
            return (
              <span key={i} className="underline">
                {part.slice(1, -1)}
              </span>
            );
          }

          if (
            part.startsWith("*") &&
            part.endsWith("*") &&
            !part.startsWith("**")
          ) {
            return (
              <span key={i} className="inline-block skew-x-[-8deg]">
                {part.slice(1, -1)}
              </span>
            );
          }

          return <span key={i}>{part}</span>;
        })}
        <br />
      </span>
    );
  });
}

function EventCard({ event }: { event: EventItem }) {
  const [showFull, setShowFull] = useState(false);
  const router = useRouter(); // untuk navigasi

  //  Fungsi ketika tombol Daftar diklik
  const handleDaftar = () => {
    if (event.type === "practice") {
      router.push("/practice");
    } else if (event.type === "mentoring") {
      router.push("/programs");
    } else {
      console.warn("Tipe event tidak dikenali:", event.type);
    }
  };

  return (
    <Card className="p-0 overflow-hidden flex flex-col justify-between">
      {/* Gambar */}
      <div className="relative w-full h-48">
        <Image
          src={
            event.image &&
            (event.image.startsWith("/") || event.image.startsWith("http"))
              ? event.image
              : "/assets/dashboard/user/kokok.png"
          }
          alt={event.title}
          fill
          className="object-cover"
        />
        <span className="absolute bottom-2 left-2 bg-white/90 text-xs font-semibold px-2 py-1 rounded-md shadow">
          {event.category}
        </span>
      </div>

      {/* Konten */}
      <CardContent className="px-5 pt-0 pb-2 flex-1 space-y-3">
        <h3 className="text-md font-bold text-gray-800 line-clamp-2">
          {event.title}
        </h3>

        {/* Deskripsi dengan toggle */}
        <div className="space-y-1">
          <p
            className={`text-sm text-gray-600 ${
              showFull ? "" : "line-clamp-3"
            }`}
          >
            {renderDescription(event.description)}
          </p>
          {event.description.length > 100 && (
            <button
              onClick={() => setShowFull(!showFull)}
              className="text-xs text-emerald-600 font-medium hover:underline cursor-pointer"
            >
              {showFull ? "Tampilkan lebih sedikit" : "Baca selengkapnya"}
            </button>
          )}
        </div>

        {/* Rentang tanggal */}
        <div className="text-sm text-gray-400 mt-4 space-y-6">
          {/* Event start-end */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-black" />
              <span>Tanggal</span>
            </div>

            <div className="grid grid-cols-2 ml-6">
              <div>
                <span className="text-xs text-gray-400">Mulai</span>
                <p className="text-gray-800 font-semibold">{event.dateStart}</p>
              </div>

              <div>
                <span className="text-xs text-gray-400">Sampai</span>
                <p className="text-gray-800 font-semibold">{event.dateEnd}</p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-black" />
              <span>Diadakan</span>
            </div>
            <div className="flex items-center gap-14 ml-6">
              <span className="text-gray-800 font-semibold">
                {event.schedule}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-black" />
            <span className="text-gray-800 font-semibold">
              {event.location}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex px-5 pb-6 w-full">
        <button
          onClick={handleDaftar}
          className="w-full text-center px-3 py-2 text-sm font-medium rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition cursor-pointer"
        >
          Daftar
        </button>
      </CardFooter>
    </Card>
  );
}
