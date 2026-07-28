import { Suspense } from "react";
import CheckoutSubscriptionElearningPage from "@/components/checkout/subscriptionelearning/CheckoutSubscriptionElearning";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function SubscriptionElearningCheckoutPage() {
  return (
    <>
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>

      <Suspense
        fallback={<div className="p-10 text-center">Loading checkout...</div>}
      >
        <CheckoutSubscriptionElearningPage />
      </Suspense>

      <Footer />
    </>
  );
}
