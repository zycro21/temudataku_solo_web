import HeroSection from "./HeroSection";
import WhySection from "./WhySection";
import ElearningSelection from "./ElearningSelection";
import ChooseSubscriptionElearning from "./SubscriptionElearning";
import ProjectExamples from "./ProjectExamples";
import AlumniSays from "./AlumniSays";
import HelpSection from "../mentoring/NeedHelp";

export default function Elearning() {
  return (
    <main>
      <HeroSection />
      <WhySection />
      <ElearningSelection />
      <ChooseSubscriptionElearning />
      <ProjectExamples />
      <AlumniSays />
      <HelpSection />
    </main>
  );
}
