import { Suspense } from "react";
import Footer from "@/components/Footer";
import MentorPage from "@/components/mentorPage";
import Navbar from "@/components/Navbar";

// export const dynamic = "force-dynamic";

export default function Mentor() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>

      <Suspense fallback={<div />}>
        <MentorPage />
      </Suspense>
      <Footer />
    </div>
  );
}
