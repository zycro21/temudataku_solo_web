"use client";

import { Suspense } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import EventListPage from "@/components/eventList/EventListPage";

export default function EventPage() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>

      <EventListPage />
      <Footer />
    </div>
  );
}