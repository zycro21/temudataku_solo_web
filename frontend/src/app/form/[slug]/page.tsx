import { Suspense } from "react";
import FormFillPage from "@/components/form-public/FormFillPage";

// useSearchParams (link edit: ?responseId=...&editToken=...) butuh Suspense
// supaya build Next tidak error
export default function PublicFormPage() {
  return (
    <Suspense fallback={null}>
      <FormFillPage />
    </Suspense>
  );
}