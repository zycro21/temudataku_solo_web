import { Suspense } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import TentangKamiPage from "@/components/tentangKamiPage/index";

export default function TentangKami() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>
      <TentangKamiPage />
      <Footer />
    </div>
  );
}
