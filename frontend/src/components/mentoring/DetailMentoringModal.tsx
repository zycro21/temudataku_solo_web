"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Clock,
  Video,
  Wrench,
  Timer,
  Calendar,
  BookOpen,
  IdCard,
  AlertTriangle,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Mentor {
  id: number;
  name: string;
  image: string;
  description: string;
  linkedin: string;
}

interface DetailMentoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor | null;
  date: Date | null;
  time: string | null;
}

export default function DetailMentoringModal({
  isOpen,
  onClose,
  mentor,
  date,
  time,
}: DetailMentoringModalProps) {
  const [topic, setTopic] = useState("Power BI untuk analisis data");
  const [notes, setNotes] = useState(
    "Saya ingin penjelasan lebih dalam tentang data cleaning menggunakan Power BI"
  );

  // state untuk modal konfirmasi batal
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const router = useRouter();

  return (
    <>
      {/* Modal utama */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[60rem] min-h-[70vh] max-h-[90vh] p-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Detail Mentoring</DialogTitle>
          </VisuallyHidden>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] h-full">
            {/* Left Column → Mentor Info */}
            <div className="p-6 flex flex-col justify-between border-r border-gray-200">
              <div>
                {/* Header */}
                <h2 className="text-2xl font-semibold mb-2">
                  Detail Mentoring
                </h2>
                <p className="text-sm text-gray-500 mb-8">
                  Lihat lebih detail mentor dan jadwal-mu
                </p>

                {/* Main Content */}
                <div className="flex flex-col items-start gap-2 mb-4 text-left">
                  <div className="w-20 h-20 mb-4 rounded-full overflow-hidden">
                    <Image
                      src={
                        mentor?.image || "/assets/mentorPage/mentors/vania.svg"
                      }
                      alt={mentor?.name || "Mentor"}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold">
                    {mentor?.name || "Nama Mentor"}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {mentor?.description || "Deskripsi mentor tidak tersedia."}
                  </p>
                </div>

                {mentor?.linkedin && (
                  <Button
                    asChild
                    className="mt-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md inline-flex items-center gap-2 px-4 py-2 text-xs w-auto"
                    size="sm"
                  >
                    <a
                      href={mentor.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <FaLinkedin className="text-white w-4 h-4" />
                      <span className="leading-none">Lihat Linkedin</span>
                    </a>
                  </Button>
                )}
              </div>

              {/* Jadwal Info */}
              <div className="text-sm text-gray-900 space-y-2 mt-8">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-500" />
                  <span>
                    {date
                      ? date.toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Tanggal belum dipilih"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-500" />
                  <span>{time || "Waktu belum dipilih"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer size={14} className="text-gray-500" />
                  <span>45 menit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video size={14} className="text-gray-500" />
                  <span>Zoom Meeting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench
                    size={14}
                    className="text-gray-500 transform -scale-x-100"
                  />
                  <span>WIB (UTC+7)</span>
                </div>
              </div>
            </div>

            {/* Right Column → Form Input */}
            <div className="p-6 flex flex-col">
              <h2 className="text-2xl font-semibold mb-2">
                Lengkapi Detail Materi
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Selangkah lagi menuju sesi mentoring yang menyenangkan
              </p>

              <div className="flex flex-col gap-4 flex-1">
                {/* Input Materi */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Materi yang Diinginkan{" "}
                    <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full border rounded-md p-2 text-sm pl-10"
                    />
                    {topic && (
                      <BookOpen
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    )}
                  </div>
                </div>

                {/* Input Catatan */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Catatan atau Permintaan Khusus untuk Mentor{" "}
                    <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full min-h-[120px] border rounded-md p-2 text-sm pl-10 resize-none"
                    />
                    {notes && (
                      <IdCard
                        size={18}
                        className="absolute left-3 top-[0.5rem] text-gray-400"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelConfirm(true)} // buka modal konfirmasi
                  className="rounded-md border border-gray-300"
                >
                  Batal
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                  onClick={() => router.push("/checkout/mentoring")}
                >
                  Konfirmasi
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Batal */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent
          className="sm:max-w-[400px] text-center p-6"
          // cegah close ketika klik di luar
          onInteractOutside={(e) => e.preventDefault()}
          // cegah close ketika tekan ESC (opsional kalau mau)
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <VisuallyHidden>
            <DialogTitle>Konfirmasi Batal</DialogTitle>
          </VisuallyHidden>

          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold">Batal Pemesanan?</h3>
            <p className="text-sm text-gray-500">
              Apakah Anda yakin ingin batal memesan sesi ini?
            </p>

            <div className="flex justify-center gap-3 mt-4 w-full">
              <Button
                variant="outline"
                className="flex-1 border border-emerald-600 text-emerald-600"
                onClick={() => setShowCancelConfirm(false)}
              >
                Tidak, Lanjutkan
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  setShowCancelConfirm(false);
                  onClose();
                  router.push("/mentoring");
                }}
              >
                Ya, Buang Perubahan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
