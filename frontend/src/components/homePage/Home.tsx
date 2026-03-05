import BenefitsSection from "./BenefitSection";
import DiscountSection from "./DiscountSection";
import HeroSection from "./HeroSection";
import LearningPathsSection from "./LearningPathSection";
import MentorSection from "./MentorSection";
import TestimonialSection from "./TestimoniSection";
import ToolsSection from "./ToolSection";
import FAQPage from "./faqSectionn";
import CTAPage from "./ctaSection";
import { useRef } from "react";

export default function Home() {
  const learningPathRef = useRef<HTMLDivElement>(null);

  const scrollToLearningPath = () => {
    learningPathRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <HeroSection />
      {/* <DiscountSection /> */}
      <BenefitsSection onClickCTA={scrollToLearningPath} />
      <ToolsSection />
      <LearningPathsSection ref={learningPathRef} />
      <MentorSection />
      <TestimonialSection />
      <FAQPage />
      <CTAPage />
    </>
  );
}
