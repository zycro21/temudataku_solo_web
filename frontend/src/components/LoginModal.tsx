"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginModal({
  isOpen,
  setIsOpen,
  openRegister,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openRegister: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 🔥 FIX: halaman detail /elearning/[id] (course) dan
  // /elearning/[id]/[subChapterId] (subchapter) sekarang balik ke
  // dirinya sendiri (pathname + query, mis. ?from=elearning) setelah
  // login — sebelumnya semua yang match `/elearning/...` dipaksa balik
  // ke /elearning (list), jadi mentee yang login dari tengah materi
  // malah kelempar ke list dan harus cari lagi. /elearning (list) dan
  // /elearningfull tetap balik ke /elearning seperti semula.
  const isElearningDetailPage = pathname.startsWith("/elearning/");
  const isElearningListPage =
    pathname === "/elearning" || pathname === "/elearningfull";

  const returnUrl = isElearningDetailPage
    ? `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`
    : isElearningListPage
      ? "/elearning"
      : pathname === "/aycl" ||
          pathname === "/mentoring" ||
          pathname === "/redeem" ||
          pathname.startsWith("/programs/") ||
          // 🔥 TAMBAHAN: sebelumnya cuma halaman DETAIL/KATEGORI artikel
          // (`/artikel/...`) yang di-cover — `/artikel` persis (halaman
          // list-nya) tidak match kondisi manapun, jadi returnUrl-nya null
          // dan malah lempar ke "/" alih-alih balik ke /artikel.
          pathname === "/artikel" ||
          pathname.startsWith("/artikel/")
        ? `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`
        : null;

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { setCurrentUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Login → server kasih cookie
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true },
      );

      // 2. Fetch user detail dari /me
      const me = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
        { withCredentials: true },
      );
      const user = me.data?.data;

      if (!user) throw new Error("Gagal mengambil data user");

      // 3. Simpan ke context
      setCurrentUser(user);

      // 4. Redirect sesuai role
      const roles: string[] = (user?.userRoles || []).map((r: any) =>
        r?.role?.roleName?.toLowerCase(),
      );

      const adminRoles = ["admin"];
      const restrictedRoles = ["curdev", "cm", "guest"];
      const hasRestrictedRole = roles.some((r) => restrictedRoles.includes(r));
      const guestRole = roles.includes("guest");

      setCurrentUser(user);
      setIsOpen(false);
      toast.success("Login berhasil, selamat datang kembali!");

      // 🔥 Kasih tahu komponen lain (mis. SubscriptionStatusBanner) untuk
      // fetch ulang, karena kalau redirect-nya ke path yang sama komponen
      // tidak akan remount otomatis.
      window.dispatchEvent(new Event("elearning-subscription:refresh"));

      setTimeout(() => {
        // 🔥 GUEST, CURDEV, CM: redirect ke /admin/elearning
        if (hasRestrictedRole) {
          router.push("/admin/elearning");
        } else if (roles.some((r) => adminRoles.includes(r))) {
          router.push("/admin");
        } else if (roles.includes("mentor")) {
          router.push("/dashboard/mentor");
        } else {
          if (returnUrl) {
            router.push(returnUrl);
          } else {
            router.push("/");
          }
        }
      }, 100);
    } catch (err: any) {
      console.error("Login error:", err);

      let msg =
        err.response?.data?.message ||
        err.message ||
        "Login gagal, periksa kembali email & password";

      if (
        msg.toLowerCase().includes("invalid credentials") ||
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("validation error")
      ) {
        msg = "Email atau password salah";
      }

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:min-w-[360px] md:min-w-[520px] lg:min-w-4xl w-full p-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="grid md:grid-cols-2 min-h-[440px]">
          {/* Left side - Illustration */}
          <div className="hidden md:flex items-center justify-center bg-white pl-5 pr-0">
            <Image
              src="/assets/auth/ilustration.svg"
              alt="3D Robot Illustration"
              width={320}
              height={320}
              className="w-[95%] h-[85%] object-contain"
            />
          </div>

          {/* Right side - Form */}
          <div className="p-5 relative bg-white flex flex-col justify-center">
            <DialogHeader>
              <DialogTitle>
                <p className="text-xl font-bold text-gray-900 mb-1.5 text-center">
                  Masuk
                </p>
                <p className="text-xs text-gray-500 mb-4 text-center">
                  Selamat datang kembali!!
                </p>
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleLogin}>
              {/* Email */}
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-8 text-xs px-2.5 placeholder:text-gray-400 placeholder:text-xs"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-8 text-xs px-2.5 pr-9 placeholder:text-gray-400 placeholder:text-xs border border-gray-300 focus:border-[#0CA678] focus:ring-1 focus:ring-[#0CA678] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Ingat saya + Lupa password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#0CA678]"
                  />
                  <span>Ingat Saya</span>
                </label>
                <Link
                  href="/send-email"
                  className="text-[11px] text-emerald-600 hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>

              {/* Button submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0CA678] hover:bg-[#08916C] text-white py-1.5 text-xs"
              >
                {loading ? "Memproses..." : "Masuk"}
              </Button>

              <div className="text-center text-gray-500 text-xs">atau</div>

              {/* Google login */}
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        await axios.post(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google`,
                          {
                            token: credentialResponse.credential,
                          },
                          { withCredentials: true },
                        );

                        // ambil data user
                        const me = await axios.get(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
                          { withCredentials: true },
                        );

                        const user = me.data?.data;

                        setCurrentUser(user);

                        const roles: string[] = (user?.userRoles || []).map(
                          (r: any) => r?.role?.roleName?.toLowerCase(),
                        );

                        const adminRoles = ["admin"];
                        const restrictedRoles = ["curdev", "cm", "guest"];
                        const hasRestrictedRole = roles.some((r) =>
                          restrictedRoles.includes(r),
                        );

                        setIsOpen(false);
                        toast.success("Login Google berhasil");

                        // 🔥 Sama seperti login manual — kasih tahu
                        // SubscriptionStatusBanner (dan komponen lain yang
                        // relevan) untuk fetch ulang.
                        window.dispatchEvent(
                          new Event("elearning-subscription:refresh"),
                        );

                        if (hasRestrictedRole) {
                          router.push("/admin/elearning");
                        } else if (roles.some((r) => adminRoles.includes(r))) {
                          router.push("/admin");
                        } else if (roles.includes("mentor")) {
                          router.push("/dashboard/mentor");
                        } else {
                          if (returnUrl) {
                            router.push(returnUrl);
                          } else {
                            router.push("/");
                          }
                        }
                      } catch (err) {
                        console.error(err);
                        toast.error("Login Google gagal");
                      }
                    }}
                    onError={() => toast.error("Login Google gagal")}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-1">
                Belum punya akun?{" "}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    openRegister();
                  }}
                  className="text-[#0CA678] hover:underline font-medium"
                >
                  Daftar
                </button>
              </p>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
