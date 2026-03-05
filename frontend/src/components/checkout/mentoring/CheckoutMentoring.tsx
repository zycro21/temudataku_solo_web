"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

import CheckoutForm from "./CheckoutForm";
import CheckoutSummary from "../CheckoutSummary";
import CheckoutTerms from "./CheckoutTerms";

export default function CheckoutMentoringPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const paymentId = searchParams.get("paymentId");

  const [booking, setBooking] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [priceSummary, setPriceSummary] = useState<any>(null);
  const [isTermsChecked, setIsTermsChecked] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentee/bookings/${bookingId}`,
        { withCredentials: true },
      );

      const bookingData = res.data.data;
      setBooking(bookingData);

      /* ===============================
       AUTO DETECT REFERRAL
    =============================== */
      if (bookingData.referralUsageId && bookingData.payment) {
        const originalPrice = bookingData.mentoringService.price;

        const finalPrice = Number(bookingData.payment.amount);

        setPriceSummary({
          originalPrice,
          finalPrice,
        });
      }
    };

    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
        { withCredentials: true },
      );

      setCurrentUser(res.data.data);
    };

    fetchCurrentUser();
  }, []);

  return (
    <div className="bg-gradient-to-br py-12 px-4 md:px-6 lg:px-8 relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Kolom Kiri (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-1">
          <CheckoutForm
            currentUser={currentUser}
            booking={booking}
            onFormChange={setCheckoutData}
          />
          <CheckoutTerms
            bookingId={bookingId}
            onReferralApplied={setPriceSummary}
            priceSummary={priceSummary}
            onTermsChange={setIsTermsChecked}
          />
        </div>

        {/* Kolom Kanan (1/3) */}
        <div className="pr-9">
          <CheckoutSummary
            booking={booking}
            paymentId={paymentId}
            priceSummary={priceSummary}
            formData={checkoutData}
            isTermsChecked={isTermsChecked}
            type="mentoring"
          />
        </div>
      </div>
    </div>
  );
}
