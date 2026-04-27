"use client";

import { Suspense } from "react";
import InnerCheckout from "./InnerCheckout";

export default function CheckoutAyclPage() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <InnerCheckout />
    </Suspense>
  );
}
