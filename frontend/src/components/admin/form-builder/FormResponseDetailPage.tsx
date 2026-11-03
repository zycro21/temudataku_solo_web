"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Loader2,
  Paperclip,
  Star,
} from "lucide-react";
import {
  formEditHref,
  formResponseHubHref,
  formResponsesHref,
  getApiErrorMessage,
} from "./shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const RESPONSE_API = `${API_BASE}/api/formresponse`;

// Bentuk GET /api/formresponse/forms/:id/responses/:responseId
interface AnswerFile {
  id: string;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number;
  downloadUrl: string;
}
interface AnswerSelection {
  optionId: string;
  label: string;
  rowOptionId: string | null;
  rowLabel: string | null;
}
interface ResponseAnswer {
  itemId: string;
  itemType: string; // tipe SAAT response dikirim
  title: string | null; // judul SAAT response dikirim
  itemDeleted: boolean;
  valueText: string | null;
  valueNumber: number | null;
  valueDate: string | null;
  selections: AnswerSelection[];
  files: AnswerFile[];
  displayValue: string;
}
interface ResponseDetail {
  id: string;
  status: "DRAFT" | "SUBMITTED";
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  respondentEmail: string | null;
  respondent: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
  } | null;
  form: { id: string; title: string; type: "EVENT" | "NON_EVENT" };
  event: { id: string; name: string | null } | null;
  answers: ResponseAnswer[];
  navigation: {
    prevResponseId: string | null;
    nextResponseId: string | null;
  };
}

const outlineLinkClass =
  "inline-flex h-9 items-center gap-1 rounded-md border bg-white px-4 text-sm font-medium text-gray-900 shadow-xs hover:bg-gray-50";

const responseDetailHref = (formId: string, responseId: string) =>
  `${formResponsesHref(formId)}/${responseId}`;

function formatDateTime(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const date = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
  return `${date} ${time}`;
}

// valueDate hanya tanggal (tanpa jam), jadi dibaca UTC supaya tidak bergeser hari
function formatAnswerDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Saat responseType "blob", pesan error dari backend ikut berbentuk Blob
async function getBlobErrorMessage(
  err: unknown,
  fallback: string,
): Promise<string> {
  if (axios.isAxiosError(err) && err.response?.data instanceof Blob) {
    try {
      const parsed = JSON.parse(await err.response.data.text());
      if (typeof parsed?.message === "string") return parsed.message;
    } catch {
      /* bukan JSON, pakai pesan bawaan */
    }
    return fallback;
  }
  return getApiErrorMessage(err, fallback);
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-2 py-1.5 text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd className="min-w-0 break-words text-gray-900">{children}</dd>
    </div>
  );
}

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-gray-200 bg-white ${className}`}
    >
      <h2 className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">
        {title}
      </h2>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

// Isi jawaban sesuai tipe pertanyaan (tipe dari snapshot saat dikirim)
function AnswerValue({
  answer,
  downloadingId,
  onDownload,
}: {
  answer: ResponseAnswer;
  downloadingId: string | null;
  onDownload: (file: AnswerFile) => void;
}) {
  if (answer.files.length > 0) {
    return (
      <ul className="space-y-1.5">
        {answer.files.map((f) => (
          <li
            key={f.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
          >
            <span className="flex min-w-0 items-center gap-2 text-sm text-gray-700">
              <Paperclip className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="truncate">{f.originalName}</span>
              <span className="shrink-0 text-xs text-gray-400">
                {formatBytes(f.sizeBytes)}
              </span>
            </span>
            <button
              type="button"
              onClick={() => onDownload(f)}
              disabled={downloadingId === f.id}
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
            >
              {downloadingId === f.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Unduh
            </button>
          </li>
        ))}
      </ul>
    );
  }

  if (answer.selections.length > 0) {
    const isGrid = answer.selections.some((s) => s.rowOptionId);

    if (isGrid) {
      const rows = new Map<string, string[]>();
      for (const s of answer.selections) {
        const key = s.rowLabel ?? "";
        rows.set(key, [...(rows.get(key) ?? []), s.label]);
      }
      return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-gray-100">
              {[...rows.entries()].map(([row, cols]) => (
                <tr key={row}>
                  <td className="w-1/3 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
                    {row || "-"}
                  </td>
                  <td className="px-3 py-2 text-gray-800">{cols.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (answer.itemType === "CHECKBOXES") {
      return (
        <ul className="list-disc space-y-0.5 pl-5 text-sm text-gray-800">
          {answer.selections.map((s) => (
            <li key={s.optionId}>{s.label}</li>
          ))}
        </ul>
      );
    }

    return (
      <p className="text-sm text-gray-800">
        {answer.selections.map((s) => s.label).join(", ")}
      </p>
    );
  }

  if (answer.valueNumber != null) {
    return (
      <p className="inline-flex items-center gap-1 text-sm text-gray-800">
        {answer.itemType === "RATING" && (
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        )}
        {answer.valueNumber}
      </p>
    );
  }

  if (answer.valueDate) {
    return (
      <p className="text-sm text-gray-800">
        {formatAnswerDate(answer.valueDate)}
      </p>
    );
  }

  if (answer.valueText != null && answer.valueText !== "") {
    return (
      <p className="whitespace-pre-wrap break-words text-sm text-gray-800">
        {answer.valueText}
      </p>
    );
  }

  return <p className="text-sm italic text-gray-400">Tidak dijawab</p>;
}

// Halaman "Detail Respon": informasi responder + seluruh jawaban satu response
export default function FormResponseDetailPage() {
  const params = useParams();
  const formId = String(params?.id ?? "");
  const responseId = String(params?.responseId ?? "");

  const [data, setData] = useState<ResponseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!formId || !responseId) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    axios
      .get(`${RESPONSE_API}/forms/${formId}/responses/${responseId}`, {
        withCredentials: true,
        signal: controller.signal,
      })
      .then((res) => setData(res.data?.data ?? res.data))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setData(null);
        setError(getApiErrorMessage(err, "Gagal memuat detail respons"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [formId, responseId, reloadTick]);

  // File responder disimpan privat: harus diunduh lewat endpoint ber-login
  const handleDownload = async (file: AnswerFile) => {
    if (downloadingId) return;
    setDownloadingId(file.id);
    try {
      const res = await axios.get(`${API_BASE}${file.downloadUrl}`, {
        responseType: "blob",
        withCredentials: true,
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(res.data as Blob);
      a.download = file.originalName;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      toast.error(await getBlobErrorMessage(err, "Gagal mengunduh file"));
    } finally {
      setDownloadingId(null);
    }
  };

  const formTitle = data?.form.title ?? "Form";
  const backHref = formResponsesHref(formId);

  const breadcrumb = (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400"
    >
      <Link href={formResponseHubHref} className="hover:text-gray-600">
        Respon
      </Link>
      <span>›</span>
      <Link
        href={backHref}
        className="max-w-[16rem] truncate hover:text-gray-600"
      >
        {formTitle}
      </Link>
      <span>›</span>
      <span className="text-gray-600">Detail Respon</span>
    </nav>
  );

  if (loading) {
    return (
      <div className="space-y-5">
        {breadcrumb}
        <div className="h-6 w-48 animate-pulse rounded bg-gray-100" />
        <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-5">
        {breadcrumb}
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center">
          <p className="text-sm text-red-600">
            {error ?? "Respons tidak ditemukan"}
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <button
              onClick={() => setReloadTick((n) => n + 1)}
              className="rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
            >
              Coba lagi
            </button>
            <Link
              href={backHref}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Kembali ke Respon
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const submitted = data.status === "SUBMITTED";
  const email = data.respondentEmail ?? data.respondent?.email ?? null;
  const { prevResponseId, nextResponseId } = data.navigation;

  return (
    <div className="space-y-5">
      {breadcrumb}

      {/* Judul + tombol */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Detail Respon</h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Informasi lengkap jawaban yang dikirim oleh responden.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={backHref} className={outlineLinkClass}>
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Respon
          </Link>
          <Link href={formEditHref(formId)} className={outlineLinkClass}>
            <ClipboardList className="h-4 w-4" />
            Lihat Form
          </Link>
        </div>
      </div>

      {/* Informasi responden + event */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title="Informasi Responden"
          className={data.event ? "lg:col-span-2" : "lg:col-span-3"}
        >
          <dl className="divide-y divide-gray-100">
            <Info label="Nama">
              {data.respondent?.fullName ?? (
                <span className="text-gray-400">Anonim</span>
              )}
            </Info>
            <Info label="Email">{email ?? "-"}</Info>
            {data.respondent?.phoneNumber && (
              <Info label="No. HP">{data.respondent.phoneNumber}</Info>
            )}
            <Info label="Tanggal Submit">
              {formatDateTime(data.submittedAt)}
            </Info>
            <Info label="Terakhir Diperbarui">
              {formatDateTime(data.updatedAt)}
            </Info>
            <Info label="Status">
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
                  submitted
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {submitted ? "Terkirim" : "Draft"}
              </span>
            </Info>
            <Info label="ID Respons">
              <span className="font-mono text-xs">{data.id}</span>
            </Info>
          </dl>
        </Card>

        {data.event && (
          <Card title="Informasi Event">
            <dl>
              <Info label="Nama Event">{data.event.name ?? "-"}</Info>
            </dl>
          </Card>
        )}
      </div>

      {/* Jawaban */}
      <Card title="Jawaban Lengkap">
        {data.answers.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            Belum ada jawaban pada respons ini.
          </p>
        ) : (
          <ol className="space-y-5">
            {data.answers.map((a, i) => (
              <li key={a.itemId} className="space-y-1.5">
                <p className="text-sm font-medium text-gray-900">
                  <span className="mr-1.5 text-gray-400">{i + 1}.</span>
                  {a.title?.trim() || "(Pertanyaan tanpa judul)"}
                  {a.itemDeleted && (
                    <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-normal text-gray-500">
                      pertanyaan sudah dihapus
                    </span>
                  )}
                </p>
                <div className="pl-5">
                  <AnswerValue
                    answer={a}
                    downloadingId={downloadingId}
                    onDownload={handleDownload}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}

        {(prevResponseId || nextResponseId) && (
          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3">
            {prevResponseId ? (
              <Link
                href={responseDetailHref(formId, prevResponseId)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Respons sebelumnya
              </Link>
            ) : (
              <span />
            )}
            {nextResponseId ? (
              <Link
                href={responseDetailHref(formId, nextResponseId)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Respons berikutnya
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
