import { Suspense } from "react";
import FormEditor from "@/components/admin/form-builder/FormEditor";

// useSearchParams di komponen butuh Suspense supaya build Next tidak error
export default function FormEditorPage() {
  return (
    <Suspense fallback={null}>
      <FormEditor />
    </Suspense>
  );
}