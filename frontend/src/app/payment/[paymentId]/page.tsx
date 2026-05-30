import { Suspense } from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import PaymentDetailPage from "@/components/payment/PaymentDetailPage";

export default function PaymentPage() {
  return (
    <>
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>

      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            Loading payment detail...
          </div>
        }
      >
        <PaymentDetailPage />
      </Suspense>

      <Footer />
    </>
  );
}
