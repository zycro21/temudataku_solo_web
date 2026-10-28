import { Suspense } from "react";
import CreateFormWizard from "@/components/admin/form-builder/CreateFormWizard";

// useSearchParams di wizard butuh Suspense supaya build Next tidak error
export default function CreateFormPage() {
  return (
    <Suspense fallback={null}>
      <CreateFormWizard />
    </Suspense>
  );
}
