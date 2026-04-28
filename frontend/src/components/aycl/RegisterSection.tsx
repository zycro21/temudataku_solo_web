"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/context/AuthContext";

interface Props {
  title: string;
  price: number;
  whatsappGroupLink: string | null;
  schedules: any[];
  batchId: string;
}

export default function RegisterSection({
  title,
  price,
  whatsappGroupLink,
  schedules,
  batchId,
}: Props) {
  const { currentUser } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // 🔥 Simpan nilai original untuk dibandingkan
  const originalName = useRef("");
  const originalPhone = useRef("");

  const [loadingUser, setLoadingUser] = useState(true);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [openLogin, setOpenLogin] = useState(false);

  const router = useRouter();

  // FETCH USER (/me)
  useEffect(() => {
    if (!currentUser) {
      setLoadingUser(false);
      return;
    }

    setLoadingUser(true);

    const fetchedName = currentUser.fullName || "";
    const fetchedPhone = currentUser.phoneNumber || "";

    setName(fetchedName);
    setPhone(fetchedPhone);
    setEmail(currentUser.email || "");

    originalName.current = fetchedName;
    originalPhone.current = fetchedPhone;

    setLoadingUser(false);
  }, [currentUser]); // 🔥 penting

  const handleSubmit = async () => {
    // Validasi per kolom dengan toast spesifik
    if (!name.trim()) {
      toast.error("Nama Lengkap wajib diisi");
      return;
    }

    if (!phone.trim()) {
      toast.error("No. WhatsApp wajib diisi");
      return;
    }

    if (!email) {
      toast.error("Email tidak ditemukan. Coba login ulang.");
      return;
    }

    if (!batchId) {
      toast.error("Data batch tidak ditemukan. Coba refresh halaman.");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Memproses pendaftaran...");

    try {
      // Cek apakah ada perubahan nama atau nomor HP
      const nameChanged = name.trim() !== originalName.current.trim();
      const phoneChanged = phone.trim() !== originalPhone.current.trim();

      if (nameChanged || phoneChanged) {
        toast.loading("Menyimpan perubahan data...", { id: toastId });

        const updatePayload: Record<string, string> = {};
        if (nameChanged) updatePayload.fullName = name.trim();
        if (phoneChanged) updatePayload.phoneNumber = phone.trim();

        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/update`,
          updatePayload,
          { withCredentials: true },
        );

        // Update original setelah berhasil disimpan
        if (nameChanged) originalName.current = name.trim();
        if (phoneChanged) originalPhone.current = phone.trim();
      }

      // Buat AYCL Booking
      toast.loading("Membuat booking...", { id: toastId });

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ayclbooking/create`,
        { batchId },
        { withCredentials: true },
      );

      const booking = res.data?.data;

      toast.success("Pendaftaran berhasil! Melanjutkan ke pembayaran...", {
        id: toastId,
      });

      // DIUBAH: hanya kirim ayclbookingId dan paymentId
      router.push(
        `/checkout/aycl?ayclbookingId=${booking.id}&paymentId=${booking.payment.id}`,
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi.";
      toast.error(message, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="daftar"
      className="py-14 sm:py-20 px-4 bg-gradient-to-br from-emerald-600 to-emerald-700"
    >
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 leading-snug">
          Siap Upgrade Skill Data Kamu?
        </h2>

        <p className="text-emerald-100 font-medium text-sm sm:text-sm md:text-base mb-6 sm:mb-10 leading-relaxed px-2 sm:px-0">
          Kalau kamu ingin mulai belajar data dengan lebih terarah, ini bisa
          jadi langkah awal yang bagus untukmu.
        </p>

        {loadingUser ? (
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl animate-pulse">
            <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-10 bg-gray-100 rounded" />
              <div className="h-10 bg-gray-100 rounded" />
              <div className="h-10 bg-gray-100 rounded" />
            </div>
          </div>
        ) : !currentUser ? (
          <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 text-center shadow-xl">
            <p className="text-gray-800 font-semibold text-sm sm:text-base mb-2">
              Kamu harus login terlebih dahulu
            </p>
            <p className="text-gray-500 text-sm mb-5 sm:mb-6 px-2 sm:px-0">
              Login untuk melanjutkan pendaftaran AYCL dan isi data secara
              otomatis.
            </p>
            <button
              onClick={() => setOpenLogin(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 sm:px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm w-full sm:w-auto"
            >
              Login Sekarang
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 text-left shadow-xl">
            <p className="font-semibold text-gray-800 text-sm sm:text-base mb-4 sm:mb-5 text-center sm:text-left">
              Isi Data Terlebih Dahulu
            </p>

            <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  No. WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={submitting}
                  placeholder="08xxxxxxxxxx"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Email (LOCKED) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 rounded-lg text-sm shadow-sm transition-colors"
            >
              {submitting ? "Memproses..." : "Lanjutkan Pembayaran"}
            </button>
          </div>
        )}
      </div>

      <LoginModal
        isOpen={openLogin}
        setIsOpen={setOpenLogin}
        openRegister={() => {}}
      />
    </section>
  );
}
