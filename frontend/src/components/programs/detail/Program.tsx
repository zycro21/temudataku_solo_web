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
import { useAuth } from "@/context/AuthContext";

export default function ProgramsDetail({
  data,
  openLoginModal,
}: {
  data: any;
  openLoginModal: () => void;
}) {
  const router = useRouter();

  const { currentUser, loading: authLoading } = useAuth();

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

        const hasBooked = bookings.some((b: any) => {
          // harus service yang sama
          if (b.mentoringService?.id !== data.id) return false;

          const invoice = b.invoice;

          if (!invoice) return false;

          // ======================================================
          // FULL PAYMENT
          // ======================================================
          if (invoice.paymentType === "FULL") {
            return invoice.payments?.some((p: any) =>
              ["confirmed", "completed"].includes(
                (p.status || "").toLowerCase(),
              ),
            );
          }

          // ======================================================
          // INSTALLMENT
          // ======================================================
          if (invoice.paymentType === "INSTALLMENT") {
            return invoice.payments?.some(
              (p: any) =>
                p.installmentNumber === 1 &&
                ["confirmed", "completed"].includes(
                  (p.status || "").toLowerCase(),
                ),
            );
          }

          return false;
        });

        setAlreadyPurchased(hasBooked);
      } catch (err) {
        setAlreadyPurchased(false);
      } finally {
        setCheckingPurchase(false);
      }
    };

    checkExistingBooking();
  }, [data?.id]);

  const handleGoToCheckout = () => {
    if (authLoading) return;

    if (!currentUser) {
      openLoginModal();
      return;
    }

    // CEGAH MASUK CHECKOUT JIKA SUDAH BELI
    if (alreadyPurchased) {
      toast.error("Anda Sudah Membeli Bootcamp Ini");
      return;
    }

    router.push(`/checkout/class?slug=${data.slug}`);
  };

  return (
    <>
      <HeroSection
        data={data}
        onRegister={handleGoToCheckout}
        isLoading={isLoading}
        alreadyPurchased={alreadyPurchased}
        checkingPurchase={checkingPurchase}
      />

      <DetailSection data={data} />

      <ProgramDetailSection
        data={data}
        onRegister={handleGoToCheckout}
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
