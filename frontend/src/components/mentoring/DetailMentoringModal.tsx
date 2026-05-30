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
import axios from "axios";
import { toast } from "sonner";

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
  mentor: any | null;
  service: any | null;
  date: Date | null;
  time: string | null;
  timeRange: {
    startTime: { hour: number; minute: number };
    endTime: { hour: number; minute: number };
  } | null;
}

export default function DetailMentoringModal({
  isOpen,
  onClose,
  mentor,
  service,
  date,
  time,
  timeRange,
}: DetailMentoringModalProps) {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");

  // state untuk modal konfirmasi batal
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const router = useRouter();

  const handleConfirm = async () => {
    if (!mentor || !service || !date || !timeRange) {
      toast.error("Data belum lengkap", {
        description: "Silakan lengkapi semua informasi sebelum melanjutkan.",
      });
      return;
    }

    if (!topic.trim() || !notes.trim()) {
      toast.error("Form belum lengkap", {
        description: "Materi dan catatan wajib diisi.",
      });
      return;
    }

    const loadingToast = toast.loading("Memproses pemesanan...");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/createBooking`,
        {
          mentoringServiceId: service.id,
          mentorProfileId: mentor.id,
          paymentType: "FULL",
          bookingDate: `${date.getFullYear()}-${String(
            date.getMonth() + 1,
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
          startTime: timeRange.startTime,
          endTime: timeRange.endTime,
          material: topic,
          specialRequests: notes,
        },
        {
          withCredentials: true,
        },
      );

      const bookingData = response.data.data;

      const bookingId = bookingData.id;

      // FIX: backend sekarang menyimpan payment di dalam invoice.payments,
      // bukan langsung di bookingData.payments.
      // Coba ambil dari invoice.payments dulu, fallback ke payments langsung.
      const paymentId =
        bookingData.invoice?.payments?.[0]?.id ??
        bookingData.payments?.[0]?.id ??
        null;

      toast.dismiss(loadingToast);

      toast.success("Pemesanan berhasil", {
        description: "Kamu akan diarahkan ke halaman pembayaran/checkout.",
      });

      setTimeout(() => {
        router.push(
          `/checkout/mentoring?bookingId=${bookingId}&paymentId=${paymentId}`,
        );
      }, 1200);
    } catch (error: any) {
      toast.dismiss(loadingToast);

      if (error.response?.status === 401) {
        toast.error("Silakan login terlebih dahulu", {
          description: "Kamu harus login untuk melakukan pemesanan.",
        });
        return;
      }

      toast.error("Gagal membuat pemesanan", {
        description:
          error.response?.data?.message ||
          "Terjadi kesalahan, silakan coba lagi.",
      });

      console.error("Failed create booking:", error);
    }
  };

  const getDurationInMinutes = () => {
    if (!timeRange) return 0;

    const startMinutes =
      timeRange.startTime.hour * 60 + timeRange.startTime.minute;

    const endMinutes = timeRange.endTime.hour * 60 + timeRange.endTime.minute;

    return endMinutes - startMinutes;
  };

  const duration = getDurationInMinutes();

  return (
    <>
      {/* Modal utama */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-[56rem] max-h-[90vh] p-0 overflow-hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <VisuallyHidden>
            <DialogTitle>Detail Mentoring</DialogTitle>
          </VisuallyHidden>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] overflow-y-auto max-h-[90vh]">
            {/* Left Column → Mentor Info */}
            <div className="p-5 flex flex-col justify-between border-r border-gray-200">
              <div>
                {/* Header */}
                <h2 className="text-lg font-semibold mb-1">Detail Mentoring</h2>
                <p className="text-xs text-gray-500 mb-4">
                  Lihat lebih detail mentor dan jadwal-mu
                </p>

                {/* Main Content */}
                <div className="flex flex-col items-start gap-2 mb-4 text-left">
                  <div className="w-20 h-20 rounded-full overflow-hidden">
                    <Image
                      src={
                        mentor?.user?.profilePicture
                          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${mentor.user.profilePicture}`
                          : "/assets/default-avatar.png"
                      }
                      alt={mentor?.user?.fullName || "Mentor"}
                      unoptimized
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-base font-bold">
                    {mentor?.user?.fullName}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {mentor?.bio || "-"}
                  </p>
                </div>

                {mentor?.linkedin && (
                  <a
                    href={mentor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-2 px-6 py-2.5 text-sm">
                      <FaLinkedin className="text-white w-5 h-5" />
                      <span className="leading-none mt-1">Lihat Profil</span>
                    </Button>
                  </a>
                )}
              </div>

              {/* Jadwal Info */}
              <div className="text-xs text-gray-900 space-y-1.5 mt-5">
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
                  <span>
                    {duration > 0
                      ? `${duration} menit`
                      : "Durasi belum tersedia"}
                  </span>
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
            <div className="p-5 flex flex-col">
              <h2 className="text-lg font-semibold mb-1">
                Lengkapi Detail Materi
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                Selangkah lagi menuju sesi mentoring yang menyenangkan
              </p>

              <div className="flex flex-col gap-4 flex-1">
                {/* Input Materi */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Materi yang Diinginkan (Min - 5 Karakter)
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
                    Catatan atau Permintaan Khusus untuk Mentor (Min - 5
                    Karakter)
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
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelConfirm(true)}
                  className="rounded-md border border-gray-300"
                >
                  Batal
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                  onClick={handleConfirm}
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
          onInteractOutside={(e) => e.preventDefault()}
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
