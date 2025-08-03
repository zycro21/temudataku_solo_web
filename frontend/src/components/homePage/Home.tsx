import BenefitsSection from "./BenefitSection";
import DiscountSection from "./DiscountSection";
import HeroSection from "./HeroSection";
import LearningPathsSection from "./LearningPathSection";
import MentorSection from "./MentorSection";
import TestimonialSection from "./TestimoniSection";
import ToolsSection from "./ToolSection";
import FAQPage from "./faqSectionn";
import CTAPage from "./ctaSection";
export default function Home() {
  return (
    <>
      <HeroSection />
      <DiscountSection />
      <BenefitsSection />
      <ToolsSection />
      <LearningPathsSection />
      <MentorSection />
      <TestimonialSection />
      <FAQPage />
      <CTAPage />
    </>
  );
}
