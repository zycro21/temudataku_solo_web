"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormBreadcrumb from "./FormBreadcrumb";
import {
  FORM_API,
  TYPE_LABEL,
  formCreateHref,
  formEditHref,
  getApiErrorMessage,
  type FormCategory,
  type FormType,
} from "./shared";

// Halaman "Buat Form": isi judul + pilih jenis di sini, lalu form dibuat sebagai
// Draft dan Form Builder dibuka. Satu jenis boleh punya banyak form.
export default function NewFormSetup() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type: FormType =
    searchParams.get("type") === "NON_EVENT" ? "NON_EVENT" : "EVENT";

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("categoryId") ?? "",
  );
  const [categories, setCategories] = useState<FormCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setCategoriesLoading(true);
    axios
      .get(`${FORM_API}/categories`, {
        params: { type },
        withCredentials: true,
        signal: controller.signal,
      })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setCategories(data?.items ?? []);
      })
      .catch(() => {
        if (!controller.signal.aborted) setCategories([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      });
    return () => controller.abort();
  }, [type]);

  const backHref = `${formCreateHref}?type=${type}&step=category`;

  const handleCreate = async () => {
    if (submitting) return;
    setSubmitting(true);
    const toastId = toast.loading("Membuat form...");
    try {
      const res = await axios.post(
        `${FORM_API}/forms`,
        {
          type,
          ...(categoryId && { categoryId }),
          ...(title.trim() && { title: title.trim() }),
        },
        { withCredentials: true },
      );
      const created = res.data?.data ?? res.data;
      toast.success("Form dibuat, silakan susun pertanyaannya", {
        id: toastId,
      });
      router.replace(`${formEditHref(created.id)}?new=1`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Gagal membuat form"), {
        id: toastId,
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <FormBreadcrumb crumbs={["Buat Form", "Pilih Jenis", "Detail Form"]} />

      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Buat {TYPE_LABEL[type]}
        </h1>
        <p className="mt-0.5 max-w-xl text-xs text-gray-500">
          Beri judul dan pilih jenis form, lalu lanjut menyusun pertanyaan.
        </p>
      </div>

      <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="new-form-title"
            className="mb-1.5 block text-xs font-medium text-gray-600"
          >
            Judul form
          </label>
          <input
            id="new-form-title"
            type="text"
            value={title}
            maxLength={200}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Contoh: Form Pendaftaran Hackathon"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label
            htmlFor="new-form-category"
            className="mb-1.5 block text-xs font-medium text-gray-600"
          >
            Jenis form
          </label>
          <select
            id="new-form-category"
            value={categoryId}
            disabled={categoriesLoading}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-50"
          >
            <option value="">
              {categoriesLoading ? "Memuat jenis..." : "Tanpa jenis"}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {!categoriesLoading && categories.length === 0 && (
            <p className="mt-1 text-xs text-gray-400">
              Belum ada jenis. Buat dulu lewat tombol &quot;Buat Jenis&quot; di
              halaman sebelumnya.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={() => router.push(backHref)}
          disabled={submitting}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Kembali
        </Button>
        <Button
          onClick={handleCreate}
          disabled={submitting}
          className="bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              Membuat...
            </>
          ) : (
            <>
              Lanjutkan
              <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
