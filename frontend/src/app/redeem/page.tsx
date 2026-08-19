import { Suspense } from "react";
import RedeemCodeClaim from "@/components/redeem/RedeemCodeClaim";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function RedeemCodePage() {
  return (
    <div>
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <RedeemCodeClaim />
      </Suspense>

      <Footer />
    </div>
  );
}