"use client";

import { Suspense } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import HomePage from "@/components/homePage/Home";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>

      <Suspense fallback={<div />}>
        <HomePage />
      </Suspense>
      <Footer />
    </div>
  );
}
