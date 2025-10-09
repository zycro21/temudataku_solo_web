"use client";

import { Suspense } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ResetPasswordPage from "@/components/resetPassword";

export default function ResetPassword() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <ResetPasswordPage />
      </Suspense>
      <Footer />
    </div>
  );
}