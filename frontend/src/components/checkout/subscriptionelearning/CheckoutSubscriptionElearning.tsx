"use client";

import { Suspense } from "react";
import InnerCheckoutSubscriptionElearning from "./InnerCheckoutSubscriptionElearning";

export default function CheckoutSubscriptionElearningPage() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <InnerCheckoutSubscriptionElearning />
    </Suspense>
  );
}
