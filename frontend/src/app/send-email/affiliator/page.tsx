import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SendEmailPage from "@/components/sendEmail/affiliator/index";

export default function SendEmail() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <SendEmailPage />
      <Footer />
    </div>
  );
}
