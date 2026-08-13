"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/context/AuthContext";

interface SubscriptionPlanApi {
  id: string;
  name: string;
  durationDay: number;
  price: number | string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

// Metadata tampilan per durasi — mengikuti Tabel II & III Logic Afiliator
// (diskon pembeli sama rata di semua tier, jadi aman ditampilkan generik di sini)
const DURATION_META: Record<
  number,
  { discountAmount: number; features: string[] }
> = {
  180: {
    discountAmount: 100000,
    features: [
      "100+ materi video Data Science & AI",
      "Materi video interaktif",
      "Sertifikat Tiap Materi",
      "Akses grup komunitas",
      "Akses challenge kompetisi data berhadiah",
      "FREE akses Live Class",
      "Diskon untuk Short class, Bootcamp, dan 1 on 1 Mentoring",
    ],
  },
  90: {
    discountAmount: 50000,
    features: [
      "100+ materi video Data Science & AI",
      "Materi video interaktif",
      "Sertifikat Tiap Materi",
      "Akses grup komunitas",
      "Akses challenge kompetisi data berhadiah",
      "FREE akses Live Class",
      "Diskon untuk Short class, Bootcamp, dan 1 on 1 Mentoring",
    ],
  },
  30: {
    discountAmount: 50000,
    features: [
      "100+ materi video Data Science & AI",
      "Materi video interaktif",
      "Sertifikat Tiap Materi",
      "Akses grup komunitas",
      "FREE akses Live Class",
    ],
  },
};

// Urutan tampil kartu: 6 bulan, 3 bulan (populer), 1 bulan
const DURATION_ORDER = [180, 90, 30];

const formatRupiah = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

function PlanSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[320px] rounded-xl overflow-hidden shadow-lg animate-pulse">
      <div className="h-48 bg-gray-300" />
      <div className="bg-white p-8 space-y-4">
        <div className="h-3 bg-gray-100 rounded" />
        <div className="h-3 bg-gray-100 rounded" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-10 bg-gray-200 rounded mt-6" />
      </div>
    </div>
  );
}

export default function ChooseSubscriptionElearning() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [plans, setPlans] = useState<SubscriptionPlanApi[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submittingPlanId, setSubmittingPlanId] = useState<string | null>(null);
  const [openLogin, setOpenLogin] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // 🔥 FIX: browser cuma scroll ke #pilihan-elearning SEKALI, pas awal
  // navigasi. Tapi WhySection/ElearningSelection di atas section ini masih
  // fetch data & nambah tinggi halaman belakangan, jadi posisi section ini
  // ikut turun setelah scroll itu terjadi — hasilnya user "kurang ke bawah"
  // kayak di screenshot. Di sini kita terus koreksi posisi scroll (rAF
  // loop) selama layout di atas masih berubah, baru berhenti begitu posisi
  // section-nya stabil (atau sudah 2.5 detik, buat jaga-jaga).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#pilihan-elearning") return;

    let rafId: number;
    let stableCount = 0;
    let lastTop = Number.POSITIVE_INFINITY;
    const start = performance.now();
    const maxDurationMs = 2500;

    const trackAndScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const top = el.getBoundingClientRect().top;

      // Kalau posisinya belum pas di atas viewport, snap ke sana lagi.
      if (Math.abs(top) > 4) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
      }

      stableCount = Math.abs(top - lastTop) < 1 ? stableCount + 1 : 0;
      lastTop = top;

      const elapsed = performance.now() - start;
      if (stableCount < 6 && elapsed < maxDurationMs) {
        rafId = requestAnimationFrame(trackAndScroll);
      } else {
        // Posisi udah stabil (atau waktu abis) — rapiin dengan smooth scroll.
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    rafId = requestAnimationFrame(trackAndScroll);

    return () => cancelAnimationFrame(rafId);
    // re-run juga saat plan selesai loading, karena section ini sendiri
    // ganti tinggi (skeleton -> kartu asli) dan bisa geser posisi dirinya.
  }, [loadingPlans]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubscriptionPlan/elearning/subscription-plans`,
          {
            params: { isActive: true, limit: 50 },
            withCredentials: true,
          },
        );
        // Response backend: { success, message, data: { meta, data: [...] } }
        // Array plan-nya ada di res.data.data.data, bukan res.data.data
        setPlans(res.data.data?.data ?? []);
      } catch (err) {
        console.error("Gagal mengambil subscription plans:", err);
        toast.error("Gagal memuat paket langganan");
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!currentUser) {
      setOpenLogin(true);
      return;
    }

    setSubmittingPlanId(planId);
    const toastId = toast.loading("Memproses langganan...");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubscription/elearning/subscriptions`,
        { planId },
        { withCredentials: true },
      );

      const { subscription, payment } = res.data.data;

      toast.success("Berhasil! Mengarahkan ke halaman checkout...", {
        id: toastId,
      });

      setTimeout(() => {
        router.push(
          `/checkout/subscriptionelearning?subscriptionId=${subscription.id}&paymentId=${payment.id}`,
        );
      }, 1000);
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Silakan login terlebih dahulu", { id: toastId });
        setOpenLogin(true);
        return;
      }

      const message =
        err?.response?.data?.message ||
        "Gagal memproses langganan. Silakan coba lagi.";
      toast.error(message, { id: toastId });
    } finally {
      setSubmittingPlanId(null);
    }
  };

  const sortedPlans = [...plans].sort(
    (a, b) =>
      DURATION_ORDER.indexOf(a.durationDay) -
      DURATION_ORDER.indexOf(b.durationDay),
  );

  return (
    <section id="pilihan-elearning" ref={sectionRef} className="py-20 px-0">
      <div className="max-w-[1200px] mx-auto">
        {/* HEADER (PUTIH) */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Langganan Sekarang dan Jadi Lebih Hebat
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Langganan bulanan untuk akses semua materi, tanpa batas. Makin lama,
            makin hemat dan untung banyak.
          </p>
        </div>
      </div>

      {/* BG ABU-ABU FULL */}
      <div className="relative bg-gray-100 py-12 w-full overflow-hidden">
        {/* ===== DECORATIVE ORNAMENTS ===== */}
        <Image
          src="/assets/elearning/Union.svg"
          alt="Ornament Top Left"
          width={260}
          height={260}
          className="absolute top-0 left-0 opacity-30 pointer-events-none z-0"
        />
        <Image
          src="/assets/elearning/Union.svg"
          alt="Ornament Top Right"
          width={300}
          height={300}
          className="absolute top-0 right-0 opacity-30 rotate-180 scale-90 pointer-events-none z-0"
        />
        <Image
          src="/assets/elearning/Union.svg"
          alt="Ornament Bottom Left"
          width={300}
          height={300}
          className="absolute bottom-0 left-0 opacity-40 pointer-events-none z-0"
        />
        <Image
          src="/assets/elearning/Union.svg"
          alt="Ornament Bottom Right"
          width={350}
          height={350}
          className="absolute bottom-0 right-0 opacity-40 pointer-events-none z-0"
        />

        <div className="relative z-10 max-w-[1200px] mx-auto grid md:grid-cols-3 gap-3 items-start px-4">
          {loadingPlans ? (
            <>
              <PlanSkeleton />
              <PlanSkeleton />
              <PlanSkeleton />
            </>
          ) : (
            sortedPlans.map((plan) => {
              const meta = DURATION_META[plan.durationDay] ?? {
                discountAmount: 0,
                features: [],
              };
              const isPopuler = plan.durationDay === 90;
              const isWeekly = plan.durationDay === 30;
              const months = Math.round(plan.durationDay / 30);

              const originalPrice = Number(plan.price); // harga asli dari DB — ini yang DIBAYAR (ditampilkan besar)
              const strikePrice = Math.round(originalPrice * 1.2); // harga coret: 20% di atas harga asli (efek diskon visual)

              const perUnitPrice = isWeekly
                ? Math.round(originalPrice / 4) // per minggu
                : Math.round(originalPrice / months); // per bulan

              const isSubmitting = submittingPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`mx-auto w-full max-w-[320px] rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                    isPopuler
                      ? "mt-8 scale-105 border border-[#F49D07]"
                      : "mt-0"
                  }`}
                >
                  {/* ===== TOP (BERWARNA) ===== */}
                  <div
                    className={`relative py-4 pl-5 text-white ${
                      isPopuler ? "bg-emerald-500" : "bg-[#1f3b73]"
                    }`}
                  >
                    {isPopuler && (
                      <div className="absolute top-0 left-0 right-0 bg-[#F49D07] text-gray-900 text-sm font-bold py-2.5 text-center tracking-wide">
                        TERPOPULER!
                      </div>
                    )}

                    <h3
                      className={`text-xl md:text-2xl font-bold ${
                        isPopuler ? "mt-10" : "mt-2"
                      }`}
                    >
                      {months} Bulan
                    </h3>
                    <p className="text-xs opacity-90 mt-2 mb-6">
                      PAKET PEMBELAJARAN E-LEARNING
                    </p>

                    {meta.discountAmount > 0 && (
                      <p className="text-sm line-through opacity-80 mb-2">
                        {formatRupiah(strikePrice)}
                      </p>
                    )}

                    <p className="text-3xl md:text-3xl font-extrabold mb-2">
                      {formatRupiah(originalPrice)}
                    </p>
                    <p className="text-xs opacity-90 leading-relaxed">
                      Untuk akses semua, setara {formatRupiah(perUnitPrice)}{" "}
                      {isWeekly ? "/ minggu" : "/ bulan"}
                    </p>
                  </div>

                  {/* ===== BOTTOM (PUTIH) ===== */}
                  <div className="bg-white p-8 flex flex-col h-full">
                    <div className="space-y-5 mb-6">
                      {meta.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <Image
                            src="/assets/elearning/ceklis.svg"
                            alt="Check"
                            width={16}
                            height={16}
                            className="mt-0 mr-2 flex-shrink-0"
                          />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isSubmitting || submittingPlanId !== null}
                      className={`mt-auto w-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-[2px] disabled:opacity-60 disabled:hover:translate-y-0 ${
                        isPopuler
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "bg-white text-[#1f3b73] border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {isSubmitting ? "Memproses..." : "Mulai Berlangganan"}
                    </Button>

                    {/* ===== STOCK / URGENCY BAR — cuma di card TERPOPULER ===== */}
                    {isPopuler && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-red-500 mb-2">
                          Segera Habis 🔥
                        </p>

                        <div className="w-full h-2 rounded-full bg-sky-100 overflow-hidden">
                          <div className="h-full w-[70%] rounded-full bg-teal-500"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <LoginModal
        isOpen={openLogin}
        setIsOpen={setOpenLogin}
        openRegister={() => {}}
      />
    </section>
  );
}
