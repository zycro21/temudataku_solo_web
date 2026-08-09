import {
  CheckCircle2,
  Award,
  Download,
  CalendarDays,
  Hash,
} from "lucide-react";

export interface CertificateVerifyData {
  certificateNumber: string;
  displayNumber: string;
  certificateUrl: string;
  issuedAt: string | null;
  status: string | null;
  user: {
    fullName: string;
  };
  subChapter: {
    title: string;
    course: {
      title: string;
    };
  };
}

interface Props {
  data: CertificateVerifyData;
}

function formatDateID(dateStr: string | null) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function StatusBadge({ status }: { status: string | null }) {
  const label =
    status === "generated"
      ? "Terbit"
      : status === "sent"
        ? "Terkirim"
        : status === "viewed"
          ? "Sudah Dilihat"
          : "Aktif";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {label}
    </span>
  );
}

export default function CertificateVerifiedCard({ data }: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl shadow-emerald-900/5">
      {/* Header hijau */}
      <div className="relative bg-gradient-to-br from-emerald-600 to-emerald-500 px-6 py-8 text-center sm:px-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20">
          <CheckCircle2 size={34} className="text-white" strokeWidth={2.2} />
        </div>
        <h1 className="mt-4 text-xl font-bold text-white sm:text-2xl">
          Sertifikat Terverifikasi
        </h1>
        <p className="mt-1.5 text-sm text-emerald-50">
          Sertifikat ini tercatat resmi dalam sistem TemuDataku
        </p>
      </div>

      {/* Body detail */}
      <div className="space-y-6 px-6 py-8 sm:px-10">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
            Diberikan Kepada
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {data.user.fullName}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50/70 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <Award size={17} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Telah Menyelesaikan
              </p>
              <p className="mt-0.5 font-semibold text-gray-900">
                {data.subChapter.title}
              </p>
              <p className="text-sm text-gray-500">
                {data.subChapter.course.title}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
            <Hash size={16} className="mt-0.5 shrink-0 text-emerald-500" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Nomor Sertifikat</p>
              <p className="break-all text-sm font-semibold text-gray-900">
                {data.displayNumber}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
            <CalendarDays
              size={16}
              className="mt-0.5 shrink-0 text-emerald-500"
            />
            <div>
              <p className="text-xs text-gray-500">Tanggal Terbit</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDateID(data.issuedAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
          <span className="text-sm text-gray-500">Status</span>
          <StatusBadge status={data.status} />
        </div>

        <a
          href={data.certificateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.99]"
        >
          <Download size={16} />
          Lihat / Unduh Sertifikat
        </a>
      </div>

      <div className="border-t border-emerald-100 bg-emerald-50/50 px-6 py-4 text-center sm:px-10">
        <p className="text-xs text-gray-500">
          Halaman ini adalah hasil verifikasi otomatis dari QR code pada
          sertifikat fisik/digital TemuDataku.
        </p>
      </div>
    </div>
  );
}
