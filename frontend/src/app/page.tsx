"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import HomePage from "@/components/homePage/Home";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <HomePage />
      <Footer />
    </div>
  );
}
