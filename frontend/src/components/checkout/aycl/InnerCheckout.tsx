"use client";

import { useState, useEffect } from "react";
import CheckoutAyclForm from "./CheckoutAyclForm";
import CheckoutAyclTerms from "./CheckoutAyclTerms";
import CheckoutSummary from "../CheckoutSummary";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

export default function CheckoutAyclPage() {
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [priceSummary, setPriceSummary] = useState<any>(null);
  const [isTermsChecked, setIsTermsChecked] = useState(false);

  const searchParams = useSearchParams();
  const bookingId = searchParams.get("ayclbookingId");
  const paymentId = searchParams.get("paymentId");

  const [ayclBooking, setAyclBooking] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const [userData, setUserData] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;

      try {
        setLoadingSchedules(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ayclbooking/${bookingId}`,
          {
            withCredentials: true,
          },
        );

        const bookingData = res.data.data;

        setAyclBooking(bookingData);
        setSchedules(bookingData.batch.schedules || []);

        // 🔥 Auto-detect referral yang sudah diterapkan sebelumnya
        if (bookingData.referralUsageId && bookingData.payment) {
          const originalPrice = bookingData.batch.price;
          const finalPrice = Number(bookingData.payment.amount);

          if (finalPrice < originalPrice) {
            setPriceSummary({ originalPrice, finalPrice });
          }
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Gagal ambil data kelas");
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoadingUser(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
          {
            withCredentials: true,
          },
        );

        setUserData(res.data.data);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Gagal ambil data user");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="bg-gradient-to-br py-12 px-4 md:px-6 lg:px-8 relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Kolom Kiri (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-1">
          <CheckoutAyclForm
            onFormChange={setCheckoutData}
            schedules={schedules}
            loadingSchedules={loadingSchedules}
            userData={userData}
          />
          <CheckoutAyclTerms
            bookingId={bookingId}
            onReferralApplied={setPriceSummary}
            priceSummary={priceSummary}
            onTermsChange={setIsTermsChecked}
          />
        </div>

        {/* Kolom Kanan (1/3) */}
        <div className="pr-9">
          <CheckoutSummary
            ayclBooking={ayclBooking}
            paymentId={paymentId}
            priceSummary={priceSummary}
            formData={checkoutData}
            isTermsChecked={isTermsChecked}
            type="aycl"
          />
        </div>
      </div>
    </div>
  );
}
