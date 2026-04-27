import { Suspense } from "react";
import Elearning from "@/components/elearning/Elearning";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function PracticePage() {
  return (
    <div>
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <Elearning />
      </Suspense>

      <Footer />
    </div>
  );
}
