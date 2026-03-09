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
        <p className="text-lg font-semibold">Memverifikasi pembayaran...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl p-10 text-center max-w-md w-full">
        {status === "success" ? (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              🎉 Pembayaran Berhasil
            </h1>
            <p className="text-gray-600 mb-2">
              Order ID:
              <br />
              <span className="font-medium">{merchantOrderId}</span>
            </p>
            <p className="text-gray-600 mb-6">
              Reference:
              <br />
              <span className="font-medium">{reference}</span>
            </p>

            <button
              onClick={() => router.push("/dashboard/user")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg"
            >
              Ke Dashboard
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              ❌ Pembayaran Gagal
            </h1>
            <p className="text-gray-600 mb-6">
              Silakan coba kembali atau pilih metode pembayaran lain.
            </p>

            <button
              onClick={() => router.push("/")}
              className="bg-gray-800 text-white px-6 py-2 rounded-lg"
            >
              Kembali
            </button>
          </>
        )}
      </div>
    </div>
  );
}