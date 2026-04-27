import { Suspense } from "react";
import Practice from "@/components/practice/Practice";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PracticePage() {
  return (
    <div>
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>
      <Practice />
      <Footer />
    </div>
  );
}
