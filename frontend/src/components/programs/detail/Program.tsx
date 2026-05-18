"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useState, useEffect } from "react";

import HeroSection from "./HeroSection";
import DetailSection from "./DetailSection";
import ProgramDetailSection from "./ProgramDetailSection";
import ProgramSelection from "./ProgramSelection";
import NeedHelp from "@/components/mentoring/NeedHelp";

export default function ProgramsDetail({
  data,
  openLoginModal,
}: {
  data: any;
  openLoginModal: () => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);

  useEffect(() => {
    if (!data?.id) return;

    const checkExistingBooking = async () => {
      try {
        setCheckingPurchase(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentee/bookings?page=1&limit=100&status=confirmed`,
          { withCredentials: true },
        );

        const bookings = res.data.data.data;

        const hasBooked = bookings.some(
          (b: any) =>
            b.mentoringService?.id === data.id &&
            b.payment?.status === "confirmed",
        );

        setAlreadyPurchased(hasBooked);
      } catch (err) {
        // Kalau 401 → user belum login, anggap belum beli
        setAlreadyPurchased(false);
      } finally {
        setCheckingPurchase(false);
      }
    };

    checkExistingBooking();
  }, [data?.id]);

  const handleCreateBooking = async () => {
    if (!data?.id) return;

    const loadingToast = toast.loading("Memproses pendaftaran...");

    try {
      setIsLoading(true);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/createBooking`,
        {
          mentoringServiceId: data.id,
        },
        { withCredentials: true },
      );

      const bookingData = response.data.data;

      const bookingId = bookingData.id;
      const paymentId = bookingData.payment.id;

      toast.dismiss(loadingToast);

      toast.success("Berhasil mendaftar!", {
        description: "Kamu akan diarahkan ke halaman checkout.",
      });

      setTimeout(() => {
        router.push(
          `/checkout/class?bookingId=${bookingId}&paymentId=${paymentId}`,
        );
      }, 1200);
    } catch (error: any) {
      toast.dismiss(loadingToast);

      if (error.response?.status === 401) {
        openLoginModal();
        return;
      }

      // TAMBAHKAN INI
      if (
        error.response?.status === 400 &&
        error.response?.data?.message === "Kamu sudah membeli bootcamp ini."
      ) {
        setAlreadyPurchased(true); // ⬅️ INI YANG PENTING

        toast.error("Kamu sudah membeli bootcamp ini.");
        return;
      }

      toast.error("Gagal mendaftar", {
        description:
          error.response?.data?.message ||
          "Terjadi kesalahan, silakan coba lagi.",
      });

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <HeroSection
        data={data}
        onRegister={handleCreateBooking}
        isLoading={isLoading}
        alreadyPurchased={alreadyPurchased}
        checkingPurchase={checkingPurchase}
      />

      <DetailSection data={data} />

      <ProgramDetailSection
        data={data}
        onRegister={handleCreateBooking}
        isLoading={isLoading}
        alreadyPurchased={alreadyPurchased}
        checkingPurchase={checkingPurchase}
      />

      <ProgramSelection
        currentServiceId={data.id}
        openLoginModal={openLoginModal}
      />
      <NeedHelp />
    </>
  );
}
