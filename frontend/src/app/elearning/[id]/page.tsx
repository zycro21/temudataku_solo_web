import { Suspense } from "react";
import ElearningDetail from "@/components/elearning/elearningdetail/ElearningDetail";
import ElearningAccessGuard from "@/components/elearning/elearningdetail/ElearningAccessGuard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function ElearningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Suspense fallback={<div />}>
        <Navbar />
      </Suspense>

      <ElearningAccessGuard>
        <ElearningDetail id={id} />
      </ElearningAccessGuard>

      <Footer />
    </>
  );
}
