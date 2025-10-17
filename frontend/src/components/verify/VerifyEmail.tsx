"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

export default function VerifyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Token verifikasi tidak ditemukan.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verify?token=${token}`
        );
        toast.success(res.data.message || "Akun berhasil diverifikasi ✅");

        const roles: string[] = res.data.roles || [];
        let redirectPath = "/";
        if (roles.includes("affiliator")) redirectPath = "/affiliator/login";

        setTimeout(() => router.push(redirectPath), 2000);
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          "Token tidak valid atau sudah expired ❌";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams, router]);

  const handleResend = async () => {
    try {
      if (!email) {
        toast.error("Silakan masukkan email Anda.");
        return;
      }
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/resend-verification`,
        { email }
      );
      toast.success("Email verifikasi baru telah dikirim ✅");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal mengirim ulang email verifikasi"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-emerald-700 font-medium">
              Memverifikasi akun...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-600 font-medium">{error}</p>
            <input
              type="email"
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-emerald-400"
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleResend}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded-lg"
            >
              Kirim Ulang Email Verifikasi
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-emerald-700 font-medium">
              Silakan tunggu, sedang diarahkan...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
