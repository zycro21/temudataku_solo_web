"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";

export default function SendEmailPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<{ email: string }>({ mode: "onChange" });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/forgot-password`,
        data
      );
      toast.success("Link reset password sudah dikirim ke email kamu.");
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Gagal mengirim link reset password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex-1 flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">Lupa Kata Sandi</h1>
          <p className="text-gray-600 leading-relaxed">
            Tenang, kami bantu! Tulis email kamu dan kami kirimkan
            <br />
            link reset-nya.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-800"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-800" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan email"
                className="pl-10 w-full py-3 border border-gray-300 rounded-md focus:ring-[#0CA678] focus:border-[#0CA678]"
                {...register("email", { required: "Email wajib diisi" })}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0CA678] hover:bg-[#08916C] text-white py-3 rounded-md font-medium"
            disabled={!isValid || loading}
          >
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </Button>

          {/* reCAPTCHA Notice */}
          <div>
            <p className="text-xs text-gray-500 leading-relaxed">
              This site is protected by reCAPTCHA and the Google{" "}
              <Link
                href="/privacy-policy"
                className="text-[#0CA678] hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/terms-of-service"
                className="text-[#0CA678] hover:underline"
              >
                Terms of Service
              </Link>{" "}
              apply.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
