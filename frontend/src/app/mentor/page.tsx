import Footer from "@/components/Footer";
import MentorPage from "@/components/mentorPage";
import Navbar from "@/components/Navbar";

export default function Mentor() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <MentorPage />
      <Footer />
    </div>
  );
}
