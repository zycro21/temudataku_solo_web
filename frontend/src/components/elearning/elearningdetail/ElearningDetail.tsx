import HeroSection from "./HeroSection";
import SubChapter from "./SubChapter";
import HelpSection from "../../mentoring/NeedHelp";
import { practices } from "@/data/practice";

export default function ElearningDetail({ id }: { id: string }) {
  const practice = practices.find((p) => p.id === Number(id));

  if (!practice) {
    return <div className="p-10 text-center">E-learning tidak ditemukan</div>;
  }

  return (
    <main>
      <HeroSection practice={practice} />
      <SubChapter practice={practice} />
      <HelpSection />
    </main>
  );
}
