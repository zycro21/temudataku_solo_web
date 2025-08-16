import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/programs/HeroSection";
import WhySection from "@/components/programs/WhySection";
import PracticeSelection from "@/components/programs/PracticeSelection";
import ProjectExamples from "@/components/programs/ProjectExamples";
import AlumniSays from "@/components/programs/AlumniSays";
import NeedHelp from "@/components/mentoring/NeedHelp";

export default function page() {
    return (
        <>
            <Navbar />
            <HeroSection />
            <WhySection />
            <PracticeSelection />
            <ProjectExamples />
            <AlumniSays />
            <NeedHelp />
            <Footer />
        </>
    );
}
