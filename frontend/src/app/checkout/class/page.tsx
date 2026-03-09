import { Suspense } from "react";
import CheckoutClassPage from "@/components/checkout/class/CheckoutClass";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClassCheckoutPage() {
  return (
    <>
      <Navbar />

      <Suspense fallback={<div className="p-10 text-center">Loading checkout...</div>}>
        <CheckoutClassPage />
      </Suspense>

      <Footer />
    </>
  );
}