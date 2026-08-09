import { ShieldAlert, RotateCw } from "lucide-react";

interface Props {
  isError?: boolean;
}

export default function CertificateNotFoundState({ isError = false }: Props) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <ShieldAlert size={30} className="text-gray-400" />
      </div>

      <h1 className="mt-5 text-lg font-bold text-gray-900">
        {isError ? "Gagal Memuat Sertifikat" : "Sertifikat Tidak Ditemukan"}
      </h1>

      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
        {isError
          ? "Terjadi kendala saat mengambil data sertifikat. Coba muat ulang halaman ini beberapa saat lagi."
          : "Nomor sertifikat pada tautan ini tidak terdaftar di sistem kami. Pastikan QR code atau tautan yang kamu buka sudah benar."}
      </p>

      {isError && (
        <button
          onClick={() => window.location.reload()}
          className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          <RotateCw size={15} />
          Muat Ulang
        </button>
      )}
    </div>
  );
}
