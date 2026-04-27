import { Suspense } from "react";
import CheckoutAyclPage from "@/components/checkout/aycl/CheckoutAycl";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function AyclCheckoutPage() {
  return (
    <>
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>

      <Suspense
        fallback={<div className="p-10 text-center">Loading checkout...</div>}
      >
        <CheckoutAyclPage />
      </Suspense>

      <Footer />
    </>
  );
}
