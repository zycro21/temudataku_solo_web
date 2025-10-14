import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function useLogout() {
  const { setCurrentUser, setIgnore401, authAxios } = useAuth();
  const router = useRouter();

  const logout = async (redirectPath = "/") => {
    try {
      // matikan sementara interceptor 401
      setIgnore401(true);

      // pakai authAxios supaya interceptor ikut skip
      await authAxios.post("/api/auth/logout");
    } catch (err) {
      // abaikan error apapun
    } finally {
      // hidupkan kembali interceptor
      setIgnore401(false);

      // set user null dan redirect
      setCurrentUser(null);
      toast.success("Logout berhasil, Sampai Jumpa Kembali");
      router.push(redirectPath);
    }
  };

  return logout;
}
