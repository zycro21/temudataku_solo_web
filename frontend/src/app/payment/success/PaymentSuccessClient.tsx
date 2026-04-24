"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const merchantOrderId = searchParams.get("merchantOrderId");
  const resultCode = searchParams.get("resultCode");
  const reference = searchParams.get("reference");

  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading",
  );

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/status/${merchantOrderId}`,
          { withCredentials: true },
        );

        if (res.data.data.status === "confirmed") {
          setStatus("success");
        } else {
          setStatus("failed");
        }
      } catch (err) {
        setStatus("failed");
      }
    };

    if (resultCode === "00") {
      verifyPayment();
    } else {
      setStatus("failed");
    }
  }, [merchantOrderId, resultCode]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-sm font-semibold">Memverifikasi pembayaran...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white shadow-lg rounded-2xl p-6 text-center max-w-md w-full">
        {status === "success" ? (
          <>
            <h1 className="text-lg font-bold text-green-600 mb-3">
              🎉 Pembayaran Berhasil
            </h1>
            <p className="text-gray-600 text-xs mb-1.5">
              Order ID:
              <br />
              <span className="font-medium text-gray-800 break-all">
                {merchantOrderId}
              </span>
            </p>
            <p className="text-gray-600 text-xs mb-4">
              Reference:
              <br />
              <span className="font-medium text-gray-800 break-all">
                {reference}
              </span>
            </p>

            {/* keterangan cek email */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 text-left">
              <p className="text-emerald-700 text-xs leading-relaxed text-justify">
                Kami telah mengirimkan bukti pembayaran beserta detail program
                ke alamat email yang terdaftar. Silakan cek inbox atau folder{" "}
                <span className="font-medium">Spam/Promosi</span> jika email
                belum masuk.
              </p>

              <p className="text-emerald-700 text-xs leading-relaxed text-justify mt-2">
                Jika kamu tidak menerima email, silakan hubungi kami melalui
                WhatsApp di{" "}
                <span className="font-medium">
                  0822-3452-9895 / 0853-3619-6913
                </span>{" "}
                atau kirim email ke{" "}
                <span className="font-medium">temudataku@gmail.com</span>.
              </p>

              {/* BUTTON ACTION */}
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                {/* Perbaikan di sini: Menambahkan tag <a> yang hilang */}
                <a
                  href="https://wa.me/6282234529895"
                  target="_blank"
                  className="flex-1 text-center bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-md transition"
                >
                  Hubungi WhatsApp
                </a>

                {/* Perbaikan di sini: Menambahkan tag <a> yang hilang */}
                <a
                  href="mailto:temudataku@gmail.com"
                  className="flex-1 text-center border border-emerald-500 text-emerald-600 hover:bg-emerald-100 text-xs font-medium px-3 py-1.5 rounded-md transition"
                >
                  Kirim Email
                </a>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard/user")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-5 py-2 rounded-lg"
            >
              Ke Dashboard
            </button>
          </>
        ) : (
          <>
            <h1 className="text-lg font-bold text-red-600 mb-3">
              ❌ Pembayaran Gagal
            </h1>
            <p className="text-gray-600 text-xs mb-4">
              Silakan coba kembali atau pilih metode pembayaran lain.
            </p>

            <button
              onClick={() => router.push("/")}
              className="bg-gray-800 text-white text-xs font-medium px-5 py-2 rounded-lg"
            >
              Kembali
            </button>
          </>
        )}
      </div>
    </div>
  );
}
