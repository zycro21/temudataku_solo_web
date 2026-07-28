"use client";

import { useState, useEffect } from "react";
import CheckoutSubscriptionElearningForm from "./CheckoutSubscriptionElearningForm";
import CheckoutSubscriptionElearningTerms from "./CheckoutSubscriptionElearningTerms";
import CheckoutSummary from "../CheckoutSummary";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

export default function InnerCheckoutSubscriptionElearning() {
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [priceSummary, setPriceSummary] = useState<any>(null);
  const [isTermsChecked, setIsTermsChecked] = useState(false);

  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscriptionId");
  const paymentId = searchParams.get("paymentId");

  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  const [userData, setUserData] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!subscriptionId) return;

      try {
        setLoadingSubscription(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/elearningSubscription/subscriptions/${subscriptionId}`,
          { withCredentials: true },
        );

        const subscriptionData = res.data.data;
        setSubscription(subscriptionData);

        // 🔥 Auto-detect referral/voucher yang sudah diterapkan sebelumnya
        if (subscriptionData?.referralUsageId && subscriptionData?.payment) {
          const originalPrice = Number(subscriptionData.plan?.price ?? 0);
          const finalPrice = Number(subscriptionData.payment.amount);

          if (finalPrice < originalPrice) {
            setPriceSummary({ originalPrice, finalPrice });
          }
        }
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || "Gagal ambil data langganan",
        );
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [subscriptionId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoadingUser(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
          { withCredentials: true },
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
    <div className="bg-gradient-to-br py-8 md:py-12 px-4 md:px-6 lg:px-8 relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Kolom Kiri (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
          <CheckoutSubscriptionElearningForm
            onFormChange={setCheckoutData}
            userData={userData}
          />
          <CheckoutSubscriptionElearningTerms
            subscriptionId={subscriptionId}
            onReferralApplied={setPriceSummary}
            priceSummary={priceSummary}
            onTermsChange={setIsTermsChecked}
          />
        </div>

        {/* Kolom Kanan (1/3) */}
        <div className="mt-6 lg:mt-0 pr-0 lg:pr-9 flex justify-center lg:block">
          <div className="w-full max-w-md lg:max-w-none">
            <CheckoutSummary
              subscription={subscription}
              paymentId={paymentId}
              priceSummary={priceSummary}
              formData={checkoutData}
              isTermsChecked={isTermsChecked}
              type="subscription"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
