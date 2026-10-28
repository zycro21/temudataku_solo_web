"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventStep from "./EventStep";
import TypeStep from "./TypeStep";
import {
  EligibleEvent,
  FORM_API,
  FormType,
  formEditHref,
  formListHref,
  getApiErrorMessage,
} from "./shared";

type Step = "type" | "event";

export default function CreateFormWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab aktif di daftar form dibawa lewat ?type=, jadi pilihan awal mengikuti tab
  const initialType: FormType =
    searchParams.get("type") === "NON_EVENT" ? "NON_EVENT" : "EVENT";

  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<FormType>(initialType);
  const [event, setEvent] = useState<EligibleEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const createForm = async (eventId?: string) => {
    if (submitting) return;
    setSubmitting(true);
    const toastId = toast.loading("Membuat form...");
    try {
      const res = await axios.post(
        `${FORM_API}/forms`,
        { type, ...(type === "EVENT" && { eventId }) },
        { withCredentials: true },
      );
      const created = res.data?.data ?? res.data;
      if (!created?.id) throw new Error("ID form tidak ditemukan");
      toast.success("Form berhasil dibuat", { id: toastId });
      router.push(formEditHref(created.id));
      // submitting sengaja tidak di-reset: tombol tetap nonaktif selama pindah halaman
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Gagal membuat form"), {
        id: toastId,
      });
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === "type") {
      if (type === "EVENT") setStep("event");
      else createForm();
      return;
    }
    if (event) createForm(event.id);
  };

  const handleBack = () => {
    if (step === "event") setStep("type");
    else router.push(formListHref);
  };

  const canNext = !submitting && (step === "type" || !!event);

  const crumbs = step === "type" ? ["Buat Form"] : ["Buat Form", "Pilih Event"];

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-gray-400"
      >
        <Link href={formListHref} className="hover:text-gray-600">
          Form Builder
        </Link>
        {crumbs.map((c, i) => (
          <span key={c} className="flex items-center gap-1.5">
            <span>›</span>
            <span className={i === crumbs.length - 1 ? "text-gray-600" : ""}>
              {c}
            </span>
          </span>
        ))}
      </nav>

      {/* Judul langkah */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {step === "type" ? "Pilih Tipe Form" : "Pilih Event Non-Kelas"}
        </h1>
        <p className="mt-0.5 text-xs text-gray-500">
          {step === "type"
            ? "Pilih jenis form sesuai kebutuhan Anda."
            : "Hanya event non-kelas yang dapat dipilih. Event kelas seperti Bootcamp, AYCL, E-Learning, dan Mentoring tidak ditampilkan di sini."}
        </p>
      </div>

      {step === "type" ? (
        <TypeStep value={type} onChange={setType} />
      ) : (
        <EventStep selectedId={event?.id ?? ""} onSelect={setEvent} />
      )}

      {/* Navigasi */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={handleBack} disabled={submitting}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Kembali
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canNext}
          className="bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {submitting ? "Membuat..." : "Lanjutkan"}
          {!submitting && <ArrowRight className="ml-1 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
