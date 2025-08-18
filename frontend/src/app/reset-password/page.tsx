import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ResetPasswordPage from "@/components/resetPassword";

export default function ResetPassword() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <ResetPasswordPage />
      <Footer />
    </div>
  );
}
