import { Suspense } from "react";
import Mentoring from "@/components/mentoring/Mentoring";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function page() {
  return (
    <>
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>
      <Mentoring />
      <Footer />
    </>
  );
}
