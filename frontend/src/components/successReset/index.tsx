import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export default function SuccessResetPage() {
  return (
    <section className="flex-1 flex items-center justify-center py-40 px-4">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-[#0CA678] rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-white stroke-[3]" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-[#0CA678]">Kata Sandi Berhasil Diubah</h1>
            <p className="text-gray-600 leading-relaxed">
              Silakan masuk kembali untuk mulai belajar lagi bersama
              <br />
              TemuDataku.
            </p>
          </div>

          {/* Login Button */}
          <Link href="/login">
            <Button className="bg-[#0CA678] hover:bg-[#08916C] text-white px-8 py-3 rounded-md font-medium">Masuk Sekarang</Button>
          </Link>
        </div>
      </main>
    </section>
  );
}
