import { Suspense } from "react";
import NewFormSetup from "@/components/admin/form-builder/NewFormSetup";

// useSearchParams di komponen butuh Suspense supaya build Next tidak error
export default function NewFormPage() {
  return (
    <Suspense fallback={null}>
      <NewFormSetup />
    </Suspense>
  );
}