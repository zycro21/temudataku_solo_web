import { Suspense } from "react";
import PaymentSuccessClient from "./PaymentSuccessClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Memverifikasi pembayaran...</div>}>
      <PaymentSuccessClient />
    </Suspense>
  );
}