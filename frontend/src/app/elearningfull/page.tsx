import { Suspense } from "react";
import ElearningFull from "@/components/elearningFull/ElearningFul";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function PracticePage() {
  return (
    <div>
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>

      <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
        <ElearningFull />
      </Suspense>

      <Footer />
    </div>
  );
}
