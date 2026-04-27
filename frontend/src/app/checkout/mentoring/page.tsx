import { Suspense } from "react";
import CheckoutMentoringPage from "@/components/checkout/mentoring/CheckoutMentoring";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MentoringCheckoutPage() {
  return (
    <>
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>

      <Suspense
        fallback={<div className="p-10 text-center">Loading checkout...</div>}
      >
        <CheckoutMentoringPage />
      </Suspense>

      <Footer />
    </>
  );
}
