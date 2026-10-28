"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryStep from "./CategoryStep";
import CreateCategoryModal from "./CreateCategoryModal";
import TypeStep from "./TypeStep";
import { FormCategory, FormType, formListHref, formNewHref } from "./shared";

type Step = "type" | "category";

const CATEGORY_TITLE: Record<FormType, string> = {
  EVENT: "Jenis Form Event",
  NON_EVENT: "Jenis Form Non-Event",
};

export default function CreateFormWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab aktif di daftar form dibawa lewat ?type=, jadi pilihan awal mengikuti tab
  const initialType: FormType =
    searchParams.get("type") === "NON_EVENT" ? "NON_EVENT" : "EVENT";

  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<FormType>(initialType);
  const [category, setCategory] = useState<FormCategory | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const changeType = (t: FormType) => {
    setType(t);
    setCategory(null); // jenis milik satu tipe saja
  };

  const handleBack = () => {
    if (step === "category") setStep("type");
    else router.push(formListHref);
  };

  // Halaman setup form (event, judul, dst) dikerjakan terpisah; bawa tipe + jenis.
  const handleCreateForm = () => {
    if (!category) return;
    router.push(`${formNewHref}?type=${type}&categoryId=${category.id}`);
  };

  const crumbs = step === "type" ? ["Buat Form"] : ["Buat Form", "Pilih Jenis"];

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

      {/* Judul langkah (+ aksi di kanan untuk langkah jenis) */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {step === "type" ? "Pilih Tipe Form" : CATEGORY_TITLE[type]}
          </h1>
          <p className="mt-0.5 max-w-xl text-xs text-gray-500">
            {step === "type"
              ? "Pilih jenis form sesuai kebutuhan Anda."
              : "Pilih jenis form, atau buat jenis baru. Form dikelompokkan berdasarkan jenisnya."}
          </p>
        </div>
        {step === "category" && (
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              onClick={() => setModalOpen(true)}
              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
            >
              <Plus className="mr-1 h-4 w-4" />
              Buat Jenis
            </Button>
            <Button
              onClick={handleCreateForm}
              disabled={!category}
              title={category ? undefined : "Pilih jenis form dulu"}
              className="bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              <Plus className="mr-1 h-4 w-4" />
              Buat Form
            </Button>
          </div>
        )}
      </div>

      {step === "type" ? (
        <TypeStep value={type} onChange={changeType} />
      ) : (
        <CategoryStep
          type={type}
          selectedId={category?.id ?? ""}
          onSelect={setCategory}
          refreshKey={refreshKey}
        />
      )}

      {/* Navigasi */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Kembali
        </Button>
        {step === "type" && (
          <Button
            onClick={() => setStep("category")}
            className="bg-emerald-500 text-white hover:bg-emerald-600"
          >
            Lanjutkan
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      <CreateCategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        type={type}
        onCreated={(c) => {
          setCategory(c); // langsung terpilih
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
}
