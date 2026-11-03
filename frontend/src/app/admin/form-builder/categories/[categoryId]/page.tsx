import { Suspense } from "react";
import CategoryFormsPage from "@/components/admin/form-builder/CategoryFormsPage";

// useSearchParams di komponen butuh Suspense supaya build Next tidak error
export default function CategoryFormsRoute() {
  return (
    <Suspense fallback={null}>
      <CategoryFormsPage />
    </Suspense>
  );
}
