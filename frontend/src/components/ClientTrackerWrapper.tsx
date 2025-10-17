"use client";

import dynamic from "next/dynamic";

// Load ClientTracker hanya di client-side
const ClientTracker = dynamic(() => import("@/components/ClientTracker"), {
  ssr: false,
});

export default function ClientTrackerWrapper() {
  return <ClientTracker />;
}
