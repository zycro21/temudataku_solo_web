import { Suspense } from "react";
import CheckoutAyclPage from "@/components/checkout/aycl/CheckoutAycl";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AyclCheckoutPage() {
  return (
    <>
      <Navbar />

      <Suspense fallback={<div className="p-10 text-center">Loading checkout...</div>}>
        <CheckoutAyclPage />
      </Suspense>

      <Footer />
    </>
  );
}