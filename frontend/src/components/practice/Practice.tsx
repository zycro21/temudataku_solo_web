import HeroSection from "./HeroSection";
import WhySection from "./WhySection";
import PracticeSelection from "./PracticeSelection";
import ProjectExamples from "./ProjectExamples";
import AlumniSays from "./AlumniSays";
import HelpSection from "../mentoring/NeedHelp";

export default function Practice() {
    return (
        <main>
            <HeroSection />
            <WhySection />
            <PracticeSelection />
            <ProjectExamples />
            <AlumniSays />
            <HelpSection />
        </main>
    );
}