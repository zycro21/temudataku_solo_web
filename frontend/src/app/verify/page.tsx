"use client";

import { Suspense } from "react";
import VerifyPageContent from "@/components/verify/VerifyEmail";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-8">Memuat halaman verifikasi...</div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}
