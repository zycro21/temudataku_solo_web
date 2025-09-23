import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function SendEmailPage() {
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
        <form className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-800" />
              </div>
              <Input id="email" name="email" type="email" required className="pl-10 w-full py-3 border border-gray-300 rounded-md focus:ring-[#0CA678] focus:border-[#0CA678]" placeholder="Masukkan email" />
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#0CA678] hover:bg-[#08916C] text-white py-3 rounded-md font-medium">
            Kirim Link Reset
          </Button>

          {/* reCAPTCHA Notice */}
          <div>
            <p className="text-xs text-gray-500 leading-relaxed">
              This site is protected by reCAPTCHA and the Google{" "}
              <Link href="/privacy-policy" className="text-[#0CA678] hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms-of-service" className="text-[#0CA678] hover:underline">
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
