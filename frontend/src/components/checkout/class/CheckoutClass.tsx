"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

import CheckoutClassForm from "./CheckoutClassForm";
import CheckoutSummary from "../CheckoutSummary";
import CheckoutClassTerms from "./CheckoutClassTerms";

export default function CheckoutClassPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const paymentId = searchParams.get("paymentId");

  const [booking, setBooking] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [priceSummary, setPriceSummary] = useState<any>(null);
  const [isTermsChecked, setIsTermsChecked] = useState(false);

  /* ===============================
     FETCH BOOKING
  =============================== */
  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/booking/mentee/bookings/${bookingId}`,
        { withCredentials: true },
      );

      const bookingData = res.data.data;
      setBooking(bookingData);

      // Auto detect referral
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

  /* ===============================
     FETCH CURRENT USER
  =============================== */
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
        {/* LEFT */}
        <div className="lg:col-span-2 flex flex-col gap-1">
          <CheckoutClassForm
            currentUser={currentUser}
            booking={booking}
            onFormChange={setCheckoutData}
          />

          <CheckoutClassTerms
            bookingId={bookingId}
            onReferralApplied={setPriceSummary}
            priceSummary={priceSummary}
            onTermsChange={setIsTermsChecked}
          />
        </div>

        {/* RIGHT */}
        <div className="pr-9">
          <CheckoutSummary
            booking={booking}
            paymentId={paymentId}
            priceSummary={priceSummary}
            formData={checkoutData}
            isTermsChecked={isTermsChecked}
            type="class"
          />
        </div>
      </div>
    </div>
  );
}