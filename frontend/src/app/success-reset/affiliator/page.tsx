import { Suspense } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SuccessResetPage from "@/components/successReset/affiliator/index";

export default function SuccesReset() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>
      <SuccessResetPage />
      <Footer />
    </div>
  );
}
